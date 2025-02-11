import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingDown, TrendingUp } from "lucide-react";

interface MarketSentiment {
  sentiment: number;
  btcPrice: number;
  btcChange24h: number;
}

export default function MarketSentiment() {
  const { data, isLoading } = useQuery<MarketSentiment>({
    queryKey: ["/api/market-sentiment"],
    refetchInterval: 60000, // Refresh every minute
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="h-24 animate-pulse bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  const sentimentEmoji = ["😱", "😰", "😐", "😊", "🚀"][data?.sentiment! - 1];
  const isPositive = data?.btcChange24h! >= 0;

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Market Sentiment</h2>
          <span className="text-2xl">{sentimentEmoji}</span>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Bearish</span>
            <span className="text-muted-foreground">Bullish</span>
          </div>
          <Progress value={data?.sentiment! * 20} className="h-2" />
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          <div>
            <div className="text-sm text-muted-foreground">Bitcoin Price</div>
            <div className="font-mono font-semibold">
              ${data?.btcPrice.toLocaleString()}
            </div>
          </div>
          <div className="flex items-center gap-1">
            {isPositive ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
            <span
              className={`font-mono ${
                isPositive ? "text-green-500" : "text-red-500"
              }`}
            >
              {data?.btcChange24h.toFixed(2)}%
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
