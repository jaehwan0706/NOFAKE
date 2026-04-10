import express from "express";
import { ethers } from "ethers";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import { Sequelize, DataTypes } from "sequelize";
import crypto from "crypto";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

const PORT = Number(process.env.PORT || 3001);
const RPC_URL = process.env.RPC_URL || "";
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || "";
const OWNER_PRIVATE_KEY = process.env.OWNER_PRIVATE_KEY || process.env.PRIVATE_KEY || "";

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: path.join(__dirname, "database.sqlite"),
  logging: false,
});

const Raffle = sequelize.define("Raffle", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  category: { type: DataTypes.STRING },
  imageUrl: { type: DataTypes.STRING },
  startAt: { type: DataTypes.DATE },
  endAt: { type: DataTypes.DATE },
  firstPrizeCount: { type: DataTypes.INTEGER },
  secondPrizeCount: { type: DataTypes.INTEGER },
  status: {
    type: DataTypes.ENUM("READY", "MINTING", "CLOSED", "REVEALED"),
    defaultValue: "MINTING",
  },
  contractAddress: { type: DataTypes.STRING },
  provenanceHash: { type: DataTypes.STRING },
});

const normalizeRafflePayload = (body = {}) => ({
  title: String(body.title ?? body.name ?? "").trim(),
  category: String(body.category ?? "").trim() || null,
  imageUrl: String(body.imageUrl ?? "").trim() || null,
  startAt: body.startAt || null,
  endAt: body.endAt || null,
  firstPrizeCount: Number(body.firstPrizeCount ?? body.firstPrize ?? 0) || 0,
  secondPrizeCount: Number(body.secondPrizeCount ?? body.secondPrize ?? 0) || 0,
  status: body.status || "MINTING",
});

const abiPath = path.join(__dirname, "abi.json");
const rawAbi = JSON.parse(fs.readFileSync(abiPath, "utf8"));
const contractABI = Array.isArray(rawAbi) ? rawAbi : rawAbi.abi;

const provider = RPC_URL ? new ethers.JsonRpcProvider(RPC_URL) : null;
const readContract =
  provider && CONTRACT_ADDRESS ? new ethers.Contract(CONTRACT_ADDRESS, contractABI, provider) : null;
const signer =
  provider && OWNER_PRIVATE_KEY ? new ethers.Wallet(OWNER_PRIVATE_KEY, provider) : null;
const writeContract =
  signer && CONTRACT_ADDRESS ? new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer) : null;

const buildProvenanceHash = () => {
  const metadataDir = path.join(__dirname, "metadata", "post-reveal");

  if (!fs.existsSync(metadataDir)) {
    throw new Error("post-reveal metadata directory not found.");
  }

  const files = fs
    .readdirSync(metadataDir)
    .filter((file) => file.endsWith(".json"))
    .sort();

  if (files.length === 0) {
    throw new Error("No post-reveal metadata files found.");
  }

  const combinedHashes = files
    .map((file) => {
      const fileData = fs.readFileSync(path.join(metadataDir, file));
      return crypto.createHash("sha256").update(fileData).digest("hex");
    })
    .join("");

  return crypto.createHash("sha256").update(combinedHashes).digest("hex");
};

const ensureReadContract = () => {
  if (!readContract) {
    throw new Error("Blockchain read contract is not configured. Check RPC_URL and CONTRACT_ADDRESS.");
  }

  return readContract;
};

const ensureWriteContract = () => {
  if (!writeContract) {
    throw new Error("Blockchain write wallet is not configured. Set OWNER_PRIVATE_KEY in back/api/.env.");
  }

  return writeContract;
};

const getContractParticipantStats = async () => {
  const contract = ensureReadContract();
  const totalSupply = Number(await contract.totalSupply());
  const byRaffleId = {};

  if (totalSupply === 0) {
    return { totalParticipants: 0, byRaffleId };
  }

  const raffleIds = await Promise.all(
    Array.from({ length: totalSupply }, (_, index) => contract.tokenToRaffleId(index + 1))
  );

  raffleIds.forEach((raffleIdValue) => {
    const raffleId = Number(raffleIdValue);
    byRaffleId[raffleId] = (byRaffleId[raffleId] || 0) + 1;
  });

  return {
    totalParticipants: totalSupply,
    byRaffleId,
  };
};

const serializeRaffle = (raffle, participantStats = {}) => {
  const plain = raffle.toJSON ? raffle.toJSON() : raffle;
  return {
    ...plain,
    participants: participantStats[plain.id] || 0,
  };
};

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "NOFAKE API server is running.",
    endpoints: [
      "/health",
      "/api/raffles",
      "/api/mint",
      "/api/admin/raffles",
      "/api/admin/contract-stats",
      "/api/metadata/:tokenId",
    ],
  });
});

app.get("/health", (req, res) => {
  res.json({
    success: true,
    status: "ok",
    port: PORT,
    contractConfigured: Boolean(readContract),
    writeWalletConfigured: Boolean(writeContract),
  });
});

app.get("/api/admin/contract-stats", async (req, res) => {
  try {
    const stats = await getContractParticipantStats();
    res.json({ success: true, totalParticipants: stats.totalParticipants });
  } catch (error) {
    console.error("Failed to load contract stats:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to load contract stats." });
  }
});

app.get("/api/raffles", async (req, res) => {
  try {
    const raffles = await Raffle.findAll({ order: [["createdAt", "DESC"]] });
    const stats = await getContractParticipantStats().catch(() => ({ totalParticipants: 0, byRaffleId: {} }));
    res.json(raffles.map((raffle) => serializeRaffle(raffle, stats.byRaffleId)));
  } catch (error) {
    console.error("Failed to fetch raffles:", error);
    res.status(500).json({ error: "Failed to load raffles." });
  }
});

app.get("/api/admin/raffles", async (req, res) => {
  try {
    const raffles = await Raffle.findAll({ order: [["createdAt", "DESC"]] });
    const stats = await getContractParticipantStats().catch(() => ({ totalParticipants: 0, byRaffleId: {} }));
    res.json({
      success: true,
      data: raffles.map((raffle) => serializeRaffle(raffle, stats.byRaffleId)),
    });
  } catch (error) {
    console.error("Failed to load admin raffles:", error);
    res.status(500).json({ success: false, error: "Failed to load raffles." });
  }
});

app.get("/api/admin/raffles/:id", async (req, res) => {
  try {
    const raffle = await Raffle.findByPk(req.params.id);

    if (!raffle) {
      return res.status(404).json({ success: false, error: "Raffle not found." });
    }

    const stats = await getContractParticipantStats().catch(() => ({ totalParticipants: 0, byRaffleId: {} }));
    res.json({ success: true, data: serializeRaffle(raffle, stats.byRaffleId) });
  } catch (error) {
    console.error("Failed to load raffle detail:", error);
    res.status(500).json({ success: false, error: "Failed to load raffle detail." });
  }
});

app.post("/api/admin/raffles", async (req, res) => {
  try {
    const payload = normalizeRafflePayload(req.body);

    if (!payload.title) {
      return res.status(400).json({ success: false, error: "title is required." });
    }

    if (!payload.startAt || !payload.endAt) {
      return res.status(400).json({ success: false, error: "startAt and endAt are required." });
    }

    if (new Date(payload.startAt) >= new Date(payload.endAt)) {
      return res.status(400).json({ success: false, error: "endAt must be later than startAt." });
    }

    const newRaffle = await Raffle.create({
      ...payload,
      contractAddress: CONTRACT_ADDRESS,
      provenanceHash: buildProvenanceHash(),
    });

    res.status(201).json({
      success: true,
      message: "Raffle created successfully.",
      data: serializeRaffle(newRaffle, {}),
    });
  } catch (error) {
    console.error("Failed to create raffle:", error);
    res.status(400).json({ success: false, error: "Failed to create raffle.", details: error.message });
  }
});

app.patch("/api/admin/raffles/:id/config", async (req, res) => {
  try {
    const raffle = await Raffle.findByPk(req.params.id);

    if (!raffle) {
      return res.status(404).json({ success: false, error: "Raffle not found." });
    }

    const startAt = req.body.startAt || raffle.startAt;
    const endAt = req.body.endAt || raffle.endAt;
    const firstPrizeCount =
      Number(req.body.firstPrizeCount ?? req.body.firstPrize ?? raffle.firstPrizeCount ?? 0) || 0;
    const secondPrizeCount =
      Number(req.body.secondPrizeCount ?? req.body.secondPrize ?? raffle.secondPrizeCount ?? 0) || 0;

    if (!startAt || !endAt) {
      return res.status(400).json({ success: false, error: "startAt and endAt are required." });
    }

    if (new Date(startAt) >= new Date(endAt)) {
      return res.status(400).json({ success: false, error: "endAt must be later than startAt." });
    }

    await raffle.update({
      startAt,
      endAt,
      firstPrizeCount,
      secondPrizeCount,
      status: "MINTING",
    });

    res.json({ success: true, message: "Raffle configuration updated.", data: raffle });
  } catch (error) {
    console.error("Failed to update raffle config:", error);
    res.status(400).json({ success: false, error: "Failed to update raffle config.", details: error.message });
  }
});

app.post("/api/admin/raffles/:id/close", async (req, res) => {
  try {
    const raffle = await Raffle.findByPk(req.params.id);

    if (!raffle) {
      return res.status(404).json({ success: false, error: "Raffle not found." });
    }

    await raffle.update({ status: "CLOSED" });
    res.json({ success: true, message: "Raffle closed.", data: raffle });
  } catch (error) {
    console.error("Failed to close raffle:", error);
    res.status(400).json({ success: false, error: "Failed to close raffle.", details: error.message });
  }
});

app.post("/api/admin/raffles/:id/reveal", async (req, res) => {
  try {
    const raffle = await Raffle.findByPk(req.params.id);

    if (!raffle) {
      return res.status(404).json({ success: false, error: "Raffle not found." });
    }

    await raffle.update({ status: "REVEALED" });
    res.json({ success: true, message: "Raffle result revealed.", data: raffle });
  } catch (error) {
    console.error("Failed to reveal raffle:", error);
    res.status(400).json({ success: false, error: "Failed to reveal raffle.", details: error.message });
  }
});

app.delete("/api/admin/raffles/:id", async (req, res) => {
  try {
    const raffle = await Raffle.findByPk(req.params.id);

    if (!raffle) {
      return res.status(404).json({ success: false, error: "Raffle not found." });
    }

    await raffle.destroy();
    res.json({ success: true, message: "Raffle deleted." });
  } catch (error) {
    console.error("Failed to delete raffle:", error);
    res.status(400).json({ success: false, error: "Failed to delete raffle.", details: error.message });
  }
});

app.post("/api/mint", async (req, res) => {
  try {
    const { userAddress, raffleId } = req.body || {};

    if (!userAddress || !ethers.isAddress(userAddress)) {
      return res.status(400).json({ success: false, error: "Valid userAddress is required." });
    }

    const raffle = await Raffle.findByPk(raffleId);

    if (!raffle) {
      return res.status(404).json({ success: false, error: "Raffle not found." });
    }

    if (raffle.status !== "MINTING") {
      return res.status(400).json({ success: false, error: "This raffle is not open for minting." });
    }

    if (raffle.startAt && new Date() < new Date(raffle.startAt)) {
      return res.status(400).json({ success: false, error: "This raffle has not started yet." });
    }

    if (raffle.endAt && new Date() > new Date(raffle.endAt)) {
      return res.status(400).json({ success: false, error: "This raffle is already closed." });
    }

    const contract = ensureWriteContract();
    const tx = await contract.mintRaffleTicket(userAddress, raffle.id);
    const receipt = await tx.wait();

    const stats = await getContractParticipantStats();
    const participantCount = stats.byRaffleId[raffle.id] || 0;

    res.json({
      success: true,
      txHash: receipt?.hash || tx.hash,
      raffleId: raffle.id,
      participants: participantCount,
      totalParticipants: stats.totalParticipants,
    });
  } catch (error) {
    console.error("Mint request failed:", error);
    res.status(400).json({
      success: false,
      error: error.shortMessage || error.message || "Mint failed.",
    });
  }
});

app.get("/api/metadata/:tokenId", async (req, res) => {
  try {
    const contract = ensureReadContract();
    const tokenId = req.params.tokenId;
    const raffleId = await contract.tokenToRaffleId(tokenId);
    const isRevealed = await contract.isRevealed(raffleId);

    if (!isRevealed) {
      return res.json({
        name: "Nike X No-Fake Mystery Box",
        description: "Reveal will make the final raffle result visible.",
        image: "https://nofake.s3.ap-northeast-2.amazonaws.com/hidden.png",
        attributes: [{ trait_type: "Status", value: "Unrevealed" }],
      });
    }

    const filePath = path.join(__dirname, "metadata", "post-reveal", `${tokenId}.json`);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "Metadata file not found." });
    }

    const metadata = JSON.parse(fs.readFileSync(filePath, "utf8"));
    metadata.contract_address = CONTRACT_ADDRESS;
    metadata.external_url = `http://15.164.104.0:${PORT}/api/metadata/${tokenId}`;

    return res.json(metadata);
  } catch (error) {
    return res.status(500).json({ error: "Server error", details: error.message });
  }
});

sequelize.sync().then(() => {
  console.log(`DB synced (Contract: ${CONTRACT_ADDRESS || "not configured"})`);
  app.listen(PORT, () => {
    console.log(`NOFAKE Server running on http://localhost:${PORT}`);
  });
});
