package org.nofake.chaincode;

import org.hyperledger.fabric.contract.Context;
import org.hyperledger.fabric.contract.ContractInterface;
import org.hyperledger.fabric.contract.annotation.Contract;
import org.hyperledger.fabric.contract.annotation.Default;
import org.hyperledger.fabric.contract.annotation.Transaction;
import org.hyperledger.fabric.shim.ChaincodeException;
import com.owlike.genson.Genson;

import java.util.HashMap;
import java.util.Map;

/**
 * Consortium 환경에서 동작하는 포인트 체인코드
 * 단일 키(walletAddress) 당 하나의 JSON 문서(docType: "point")를 유지합니다.
 * 문서 구조 예시: { "docType":"point", "walletAddress":"0x...", "nofake":1000, "musinsa":5000, "nike":0 }
 */
@Contract(name = "NoFakePoint")
@Default
public class PointContract implements ContractInterface {

    private final Genson genson = new Genson();

    // 플랫폼 수수료: 모든 스왑에 10% 적용
    private static final int FEE_PERCENT = 10;
    private static final String PLATFORM_TREASURY_KEY = "NOFAKE_PLATFORM_TREASURY";
    private static final String TOTAL_DISTRIBUTED_KEY  = "NOFAKE_TOTAL_DISTRIBUTED";

    // 지원 브랜드 목록 (대소문자 무시)
    private static final Map<String, String> VALID_BRANDS = new HashMap<>();
    static {
        VALID_BRANDS.put("NOFAKE", "nofake");
        VALID_BRANDS.put("MUSINSA", "musinsa");
        VALID_BRANDS.put("NIKE", "nike");
    }

    @Transaction
    public String SwapPoint(Context ctx, String walletAddress, String fromBrand, String toBrand, long amount) {
        if (walletAddress == null || walletAddress.trim().isEmpty()) {
            throw new ChaincodeException("INVALID_WALLET: walletAddress is required");
        }
        fromBrand = (fromBrand == null) ? "" : fromBrand.toUpperCase();
        toBrand = (toBrand == null) ? "" : toBrand.toUpperCase();

        if (!VALID_BRANDS.containsKey(fromBrand) || !VALID_BRANDS.containsKey(toBrand)) {
            throw new ChaincodeException("INVALID_BRAND: supported brands are NOFAKE, MUSINSA, NIKE");
        }
        if (fromBrand.equals(toBrand)) {
            throw new ChaincodeException("SAME_BRAND: from and to must differ");
        }
        if (amount <= 0) {
            throw new ChaincodeException("INVALID_AMOUNT: amount must be > 0");
        }

        // Enforce minimum swap amount (5,000 points)
        final long MIN_SWAP_AMOUNT = 5000L;
        if (amount < MIN_SWAP_AMOUNT) {
            throw new ChaincodeException("MINIMUM_AMOUNT: amount must be >= " + MIN_SWAP_AMOUNT);
        }

        // Load document (walletAddress as state key)
        String key = walletAddress;
        byte[] data = ctx.getStub().getState(key);
        Map<String, Object> doc;
        if (data == null || data.length == 0) {
            // create default doc
            doc = new HashMap<>();
            doc.put("docType", "point");
            doc.put("walletAddress", walletAddress);
            doc.put("nofake", 0L);
            doc.put("musinsa", 0L);
            doc.put("nike", 0L);
        } else {
            doc = genson.deserialize(new String(data), Map.class);
        }

        // Normalize brand keys in doc
        String fromKey = VALID_BRANDS.get(fromBrand);
        String toKey = VALID_BRANDS.get(toBrand);

        long fromBalance = ((Number) (doc.getOrDefault(fromKey, 0L))).longValue();
        if (fromBalance < amount) {
            throw new ChaincodeException("INSUFFICIENT_BALANCE: not enough balance");
        }

        // 10% fee on every swap; deducted from fromBrand, credited to NOFAKE_PLATFORM_TREASURY
        long fee = (amount * FEE_PERCENT) / 100;
        long finalAmount = amount - fee;

        // Atomic balance update
        long newFrom = fromBalance - amount;
        long toBalance = ((Number) (doc.getOrDefault(toKey, 0L))).longValue();
        long newTo = toBalance + finalAmount;

        doc.put(fromKey, newFrom);
        doc.put(toKey, newTo);

        // Accumulate fee into NOFAKE_PLATFORM_TREASURY (same currency as fromBrand)
        Map<String, Object> treasuryDoc = loadPointDocument(ctx, PLATFORM_TREASURY_KEY);
        long curTreasury = ((Number) (treasuryDoc.getOrDefault(fromKey, 0L))).longValue();
        treasuryDoc.put(fromKey, curTreasury + fee);
        ctx.getStub().putState(PLATFORM_TREASURY_KEY, genson.serialize(treasuryDoc).getBytes());

        // Persist user doc
        ctx.getStub().putState(key, genson.serialize(doc).getBytes());

        // Emit event with details
        Map<String, Object> evt = new HashMap<>();
        evt.put("walletAddress", walletAddress);
        evt.put("from", fromBrand);
        evt.put("to", toBrand);
        evt.put("amount", amount);
        evt.put("fee", fee);
        evt.put("finalAmount", finalAmount);

        ctx.getStub().setEvent("PointSwap", genson.serialize(evt).getBytes());

        return genson.serialize(evt);
    }

    private Map<String, Object> loadPointDocument(Context ctx, String walletAddress) {
        byte[] data = ctx.getStub().getState(walletAddress);
        if (data == null || data.length == 0) {
            Map<String, Object> doc = new HashMap<>();
            doc.put("docType", "point");
            doc.put("walletAddress", walletAddress);
            doc.put("nofake", 0L);
            doc.put("musinsa", 0L);
            doc.put("nike", 0L);
            return doc;
        }
        return genson.deserialize(new String(data), Map.class);
    }

    private String resolveBrandKey(String brand) {
        if (brand == null || brand.trim().isEmpty()) {
            throw new ChaincodeException("INVALID_BRAND: supported brands are NOFAKE, MUSINSA, NIKE");
        }
        String normalized = brand.toUpperCase();
        if (!VALID_BRANDS.containsKey(normalized)) {
            throw new ChaincodeException("INVALID_BRAND: supported brands are NOFAKE, MUSINSA, NIKE");
        }
        return VALID_BRANDS.get(normalized);
    }

    @Transaction
    public String MintPoints(Context ctx, String walletAddress, String brand, long amount) {
        if (walletAddress == null || walletAddress.trim().isEmpty()) {
            throw new ChaincodeException("INVALID_WALLET: walletAddress is required");
        }
        if (amount <= 0) {
            throw new ChaincodeException("INVALID_AMOUNT: amount must be > 0");
        }

        String key = walletAddress;
        Map<String, Object> doc = loadPointDocument(ctx, key);
        String brandKey = resolveBrandKey(brand);
        long currentBalance = ((Number) (doc.getOrDefault(brandKey, 0L))).longValue();
        doc.put(brandKey, currentBalance + amount);
        ctx.getStub().putState(key, genson.serialize(doc).getBytes());

        // Increment global NOFAKE_TOTAL_DISTRIBUTED counter for admin stats
        Map<String, Object> counter = loadPointDocument(ctx, TOTAL_DISTRIBUTED_KEY);
        long currentTotal = ((Number) (counter.getOrDefault(brandKey, 0L))).longValue();
        counter.put(brandKey, currentTotal + amount);
        ctx.getStub().putState(TOTAL_DISTRIBUTED_KEY, genson.serialize(counter).getBytes());

        return genson.serialize(doc);
    }

    @Transaction
    public String GetBalances(Context ctx, String walletAddress) {
        if (walletAddress == null || walletAddress.trim().isEmpty()) {
            throw new ChaincodeException("INVALID_WALLET: walletAddress is required");
        }
        String key = walletAddress;
        byte[] data = ctx.getStub().getState(key);
        if (data == null || data.length == 0) {
            Map<String, Object> doc = new HashMap<>();
            doc.put("docType", "point");
            doc.put("walletAddress", walletAddress);
            doc.put("nofake", 0L);
            doc.put("musinsa", 0L);
            doc.put("nike", 0L);
            return genson.serialize(doc);
        }
        return new String(data);
    }
}
