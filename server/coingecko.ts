const API_BASE = "https://api.coingecko.com/api/v3";

export async function getMarketSentiment(): Promise<{
  sentiment: number;
  btcPrice: number;
  btcChange24h: number;
}> {
  try {
    const response = await fetch(
      `${API_BASE}/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true`,
    );
    const data = await response.json();

    const btcPrice = data.bitcoin.usd;
    const btcChange24h = data.bitcoin.usd_24h_change;

    // Calculate sentiment (1-5) based on 24h change
    const sentiment = Math.max(
      1,
      Math.min(5, Math.round(3 + btcChange24h / 10)),
    );

    return {
      sentiment,
      btcPrice,
      btcChange24h,
    };
  } catch (error) {
    console.error("CoinGecko API error:", error);
    return {
      sentiment: 3,
      btcPrice: 0,
      btcChange24h: 0,
    };
  }
}
