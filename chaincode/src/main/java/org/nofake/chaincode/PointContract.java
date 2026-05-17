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
 * NoFake 포인트 정산 체인코드
 * Nike <-> NoFake <-> Musinsa 포인트 교환 및 수수료 로직
 */
@Contract(name = "NoFakePoint")
@Default
public class PointContract implements ContractInterface {

    private final Genson genson = new Genson();

    // 브랜드별 정책 정의 (나이키, 무신사만 유효)
    private static final Map<String, Integer> FEES = new HashMap<>();
    private static final Map<String, Long> MIN_AMOUNTS = new HashMap<>();

    static {
        // 나이키: 수수료 3%, 최소 5,000P
        FEES.put("NIKE", 3);
        MIN_AMOUNTS.put("NIKE", 5000L);
        
        // 무신사: 수수료 2%, 최소 3,000P
        FEES.put("MUSINSA", 2);
        MIN_AMOUNTS.put("MUSINSA", 3000L);
    }

    /**
     * 포인트 교환 실행 (Bridge 모델)
     * @param userId 사용자 식별자 (Web3Auth 지갑 주소 매핑)
     * @param fromBrand 원천 브랜드 (예: NIKE, NOFAKE)
     * @param toBrand 대상 브랜드 (예: NOFAKE, MUSINSA)
     * @param amount 교환 신청 수량
     */
    /**
     * 포인트 충전 (발행)
     * - 테스트/운영에서 사용자에게 NoFake 플랫폼 포인트를 적립
     * - chargePoint는 brand="NOFAKE"만 허용한다.
     */
    @Transaction
    public void chargePoint(Context ctx, String userId, long amount) {
        if (amount <= 0) {
            throw new ChaincodeException("INVALID_AMOUNT: amount must be > 0");
        }

        // brand 고정: NOFAKE
        String brand = "NOFAKE";

        long current = getBalance(ctx, userId, brand);
        updateBalance(ctx, userId, brand, current + amount);

        ctx.getStub().setEvent("PointCharged", genson.serialize(userId).getBytes());
    }

    /**
     * 포인트 교환 실행 (Bridge 모델)
     * @param userId 사용자 식별자 (Web3Auth 지갑 주소 매핑)
     * @param fromBrand 원천 브랜드 (예: NIKE, NOFAKE)
     * @param toBrand 대상 브랜드 (예: NOFAKE, MUSINSA)
     * @param amount 교환 신청 수량
     */
    @Transaction
    public void exchangePoint(Context ctx, String userId, String fromBrand, String toBrand, long amount) {
        fromBrand = fromBrand.toUpperCase();
        toBrand = toBrand.toUpperCase();

        // 1. 폐쇄형 생태계 검증 (나이키 <-> 무신사 직접 교환 금지)
        if (!fromBrand.equals("NOFAKE") && !toBrand.equals("NOFAKE")) {
            throw new ChaincodeException("DIRECT_EXCHANGE_NOT_ALLOWED: 반드시 NoFake 포인트를 거쳐야 합니다.");
        }

        // 2. 최소 금액 및 파트너 유효성 검증
        String partnerBrand = fromBrand.equals("NOFAKE") ? toBrand : fromBrand;
        if (!FEES.containsKey(partnerBrand)) {
            throw new ChaincodeException("INVALID_PARTNER: 지원하지 않는 브랜드입니다.");
        }
        if (amount < MIN_AMOUNTS.get(partnerBrand)) {
            throw new ChaincodeException("BELOW_MINIMUM_AMOUNT: 최소 교환 금액 미달입니다.");
        }

        // 3. 원천 브랜드 잔액 조회 및 차감 (Source of Truth)
        long fromBalance = getBalance(ctx, userId, fromBrand);
        if (fromBalance < amount) {
            throw new ChaincodeException("INSUFFICIENT_BALANCE: 잔액이 부족합니다.");
        }

        // 4. 수수료 계산 (NoFake 포인트로 교환될 때 또는 나갈 때 발생)
        // 비즈니스 로직: 타 브랜드 -> NoFake 또는 NoFake -> 타 브랜드 시 수수료 징수
        int feeRate = FEES.get(partnerBrand);
        long fee = (amount * feeRate) / 100;
        long finalAmount = amount - fee;

        // 5. 자산 이동 (Atomic Update)
        updateBalance(ctx, userId, fromBrand, fromBalance - amount); // 원천 차감
        
        long toBalance = getBalance(ctx, userId, toBrand);
        updateBalance(ctx, userId, toBrand, toBalance + finalAmount); // 대상 증액 (수수료 제외)

        // 6. NoFake 플랫폼 수수료 수익 계정 적립
        if (fee > 0) {
            long adminRevenue = getBalance(ctx, "NOFAKE_ADMIN", "REVENUE_FEE");
            updateBalance(ctx, "NOFAKE_ADMIN", "REVENUE_FEE", adminRevenue + fee);
        }
        
        // 정산 증빙용 로그 (Event 발행)
        ctx.getStub().setEvent("PointExchanged", genson.serialize(userId).getBytes());
    }

    // 원장 조회 헬퍼 함수
    private long getBalance(Context ctx, String userId, String brand) {
        String compositeKey = ctx.getStub().createCompositeKey("Point", userId, brand).toString();
        byte[] data = ctx.getStub().getState(compositeKey);
        return (data == null || data.length == 0) ? 0 : Long.parseLong(new String(data));
    }

    // 원장 업데이트 헬퍼 함수
    private void updateBalance(Context ctx, String userId, String brand, long balance) {
        String compositeKey = ctx.getStub().createCompositeKey("Point", userId, brand).toString();
        ctx.getStub().putState(compositeKey, String.valueOf(balance).getBytes());
    }
}
