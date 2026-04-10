let mintAttemptCount = 0;

export async function mintMysteryBox({ eventSlug, walletAddress }) {
  if (!walletAddress) {
    throw new Error("WALLET_NOT_CONNECTED");
  }

  await new Promise((resolve) => setTimeout(resolve, 1000));

  mintAttemptCount += 1;

  const isSuccess = mintAttemptCount % 2 === 1;

  if (!isSuccess) {
    throw new Error("MINT_FAILED");
  }

  return {
    success: true,
    eventSlug,
    walletAddress,
    txHash: `0xmocktx${mintAttemptCount}`,
  };
}