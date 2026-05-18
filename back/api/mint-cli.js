import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Gateway, Wallets } from "fabric-network";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

const FABRIC_CONFIG_PATH = process.env.FABRIC_CONFIG_PATH || path.resolve(__dirname, "..", "..", "fabric-samples", "test-network", "organizations", "peerOrganizations", "org1.example.com");
const FABRIC_USER_ID = process.env.FABRIC_USER_ID || "User1@org1.example.com";
const FABRIC_IDENTITY_LABEL = process.env.FABRIC_IDENTITY_LABEL || "appUser";
const FABRIC_CHANNEL = process.env.FABRIC_CHANNEL || "nofake-channel";
const FABRIC_CHAINCODE = process.env.FABRIC_CHAINCODE || "point-cc";

function normalizeConnectionProfile(profile) {
  if (!profile || typeof profile !== "object") return profile;
  const patched = JSON.parse(JSON.stringify(profile));
  const fixPath = (value) => {
    if (typeof value !== "string") return value;
    if (value.startsWith("..") || value.startsWith("./")) {
      return path.resolve(FABRIC_CONFIG_PATH, value);
    }
    return value;
  };

  if (patched.peers) {
    for (const peer of Object.values(patched.peers)) {
      if (peer.tlsCACerts?.path) peer.tlsCACerts.path = fixPath(peer.tlsCACerts.path);
    }
  }
  if (patched.certificateAuthorities) {
    for (const ca of Object.values(patched.certificateAuthorities)) {
      if (ca.tlsCACerts?.path) ca.tlsCACerts.path = fixPath(ca.tlsCACerts.path);
    }
  }
  return patched;
}

async function buildFabricWallet() {
  const wallet = await Wallets.newInMemoryWallet();
  const identity = await wallet.get(FABRIC_IDENTITY_LABEL);
  if (identity) return wallet;

  const certDir = path.join(FABRIC_CONFIG_PATH, "users", FABRIC_USER_ID, "msp", "signcerts");
  const keyDir = path.join(FABRIC_CONFIG_PATH, "users", FABRIC_USER_ID, "msp", "keystore");
  const certFiles = fs.existsSync(certDir)
    ? fs.readdirSync(certDir).filter((name) => name.endsWith(".pem") || name.endsWith(".crt"))
    : [];
  const keyFiles = fs.existsSync(keyDir)
    ? fs.readdirSync(keyDir).filter((name) => name.endsWith(".pem") || name.endsWith(".key") || name.endsWith("_sk"))
    : [];

  if (certFiles.length === 0 || keyFiles.length === 0) {
    throw new Error(`Fabric identity not found in ${certDir} or ${keyDir}`);
  }

  const certificate = fs.readFileSync(path.join(certDir, certFiles[0]), "utf8");
  const privateKey = fs.readFileSync(path.join(keyDir, keyFiles[0]), "utf8");

  await wallet.put(FABRIC_IDENTITY_LABEL, {
    credentials: {
      certificate,
      privateKey,
    },
    mspId: "Org1MSP",
    type: "X.509",
  });

  return wallet;
}

async function connectFabricContract() {
  const ccpPath = path.join(FABRIC_CONFIG_PATH, "connection-org1.json");
  if (!fs.existsSync(ccpPath)) {
    throw new Error(`Fabric connection profile not found: ${ccpPath}`);
  }
  const ccp = normalizeConnectionProfile(JSON.parse(fs.readFileSync(ccpPath, "utf8")));
  const wallet = await buildFabricWallet();
  const gateway = new Gateway();
  await gateway.connect(ccp, {
    wallet,
    identity: FABRIC_IDENTITY_LABEL,
    discovery: { enabled: true, asLocalhost: true },
  });
  const network = await gateway.getNetwork(FABRIC_CHANNEL);
  const contract = network.getContract(FABRIC_CHAINCODE);
  return { gateway, contract };
}

function parseArgs() {
  const raw = process.argv.slice(2);
  const result = {};
  for (let i = 0; i < raw.length; i += 2) {
    const key = raw[i];
    const value = raw[i + 1];
    if (!key || !value) continue;
    result[key.replace(/^--/, "")] = value;
  }
  return result;
}

async function main() {
  const args = parseArgs();
  const walletAddress = String(args.wallet || args.walletAddress || args.address || args.w || "").trim();
  const brand = String(args.brand || args.b || "").trim().toUpperCase();
  const amount = Number(args.amount || args.a || "0");

  if (!walletAddress) {
    throw new Error("--wallet <walletAddress> is required");
  }
  if (!brand || !["NOFAKE", "NIKE", "MUSINSA"].includes(brand)) {
    throw new Error("--brand must be one of NOFAKE, NIKE, MUSINSA");
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("--amount must be a positive number");
  }

  const { gateway, contract } = await connectFabricContract();
  try {
    const tx = contract.createTransaction("MintPoints");
    const resultBytes = await tx.submit(walletAddress, brand, String(amount));
    const result = JSON.parse(resultBytes.toString());
    console.log("Mint completed:", { walletAddress, brand, amount, result, txId: tx.getTransactionId() });
  } finally {
    gateway.disconnect();
  }
}

main().catch((err) => {
  console.error("mint-cli failed:", err.message || err);
  process.exit(1);
});
