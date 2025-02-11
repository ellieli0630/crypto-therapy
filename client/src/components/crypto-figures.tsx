import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { RefreshCw, ExternalLink, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Metrics {
  memeDensity: number;
  cryptoHypeScore: number;
  chaosCoefficient: number;
  controversyLevel: number;
  prophetFactor: number;
}

interface CryptoFigure {
  handle: string;
  name: string;
  title: string;
  avatar: string;
  twitterUrl: string;
  newsUrl: string;
  analysis: {
    metrics: Metrics;
    normalizedScore: number;
    rawScore: number;
    breakdown: Record<string, string>;
    emoji: string;
    recentActivity: string;
    topTweet: string;
  };
}

const metricLabels: Record<keyof Metrics, { name: string; maxScore: number; emoji: string }> = {
  memeDensity: { name: "Meme Power", maxScore: 10, emoji: "🎭" },
  cryptoHypeScore: { name: "Hype Level", maxScore: 20, emoji: "📢" },
  chaosCoefficient: { name: "Chaos Energy", maxScore: 10, emoji: "🌪" },
  controversyLevel: { name: "Drama Factor", maxScore: 15, emoji: "🎯" },
  prophetFactor: { name: "Crystal Ball", maxScore: 10, emoji: "🔮" }
};

export default function CryptoFigures() {
  const [customHandle, setCustomHandle] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: figures = [], isLoading, refetch, isRefetching } = useQuery<CryptoFigure[]>({
    queryKey: ["/api/crypto-figures"],
    refetchInterval: 300000,
  });

  const analyzeHandleMutation = useMutation({
    mutationFn: async (handle: string) => {
      const res = await fetch("/api/analyze-handle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handle: handle.replace('@', '') }),
      });
      if (!res.ok) throw new Error("Failed to analyze handle");
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData<CryptoFigure[]>(["/api/crypto-figures"], (old) => {
        const filtered = old?.filter(fig => fig.handle !== data.handle) ?? [];
        return [data, ...filtered];
      });
      setCustomHandle("");
      toast({
        title: "Analysis Complete! 🎭",
        description: `Added analysis for @${data.handle}`,
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error analyzing handle",
        description: "Please try again with a valid Twitter handle",
      });
    },
  });

  const handleRefresh = async () => {
    try {
      await refetch();
      toast({
        title: "Updated! 🎭",
        description: "Fresh crypto chaos scores incoming...",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error refreshing analysis",
        description: "Our AI needs a break from crypto twitter",
      });
    }
  };

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customHandle) return;
    analyzeHandleMutation.mutate(customHandle);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold pixel-font">🎪 Crypto Chaos Index</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="h-32 animate-pulse bg-muted rounded-lg" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-press-start-2p">🎪 CRYPTO CHAOS INDEX</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefetching}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
            Check Pulse
          </Button>
        </div>

        <form onSubmit={handleAnalyze} className="flex gap-2">
          <Input
            placeholder="Enter Twitter handle (e.g. @example)"
            value={customHandle}
            onChange={(e) => setCustomHandle(e.target.value)}
            className="max-w-md"
          />
          <Button 
            type="submit" 
            disabled={analyzeHandleMutation.isPending}
            className="shadow-pixel"
          >
            Analyze
          </Button>
        </form>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {figures.map((figure) => (
            <Card key={figure.handle} className="overflow-hidden shadow-pixel hover:shadow-lg transition-shadow">
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center gap-3">
                  <img
                    src={figure.avatar}
                    alt={figure.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{figure.name}</h3>
                      <span className="text-xl">{figure.analysis.emoji}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{figure.title}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center justify-between cursor-help">
                        <span className="text-sm font-medium">Chaos Level</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-lg">
                            {figure.analysis.normalizedScore.toFixed(1)}
                          </span>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="w-80 p-4">
                      <div className="space-y-2">
                        <p className="text-sm font-semibold">Crypto Chaos Analysis</p>
                        <div className="space-y-3">
                          {(Object.entries(figure.analysis.metrics) as [keyof Metrics, number][]).map(([key, value]) => (
                            <div key={key}>
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-xs">
                                  {metricLabels[key].emoji} {metricLabels[key].name}
                                </span>
                                <span className="text-xs font-mono">
                                  {((value / metricLabels[key].maxScore) * 10).toFixed(1)}/10
                                </span>
                              </div>
                              <Progress 
                                value={(value / metricLabels[key].maxScore) * 100} 
                                className="h-1"
                              />
                              <p className="text-xs text-muted-foreground mt-1">
                                {figure.analysis.breakdown[key]}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>

                  <Progress
                    value={figure.analysis.normalizedScore * 10}
                    className="h-2"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  {Object.entries(metricLabels).map(([key, { emoji }]) => (
                    <Tooltip key={key}>
                      <TooltipTrigger className="text-lg">
                        {emoji}
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="text-xs">
                          {((figure.analysis.metrics[key as keyof Metrics] / metricLabels[key as keyof Metrics].maxScore) * 10).toFixed(1)}/10
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>

                <div className="flex gap-2">
                  <a
                    href={figure.twitterUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    Twitter <ExternalLink className="h-3 w-3" />
                  </a>
                  <a
                    href={figure.newsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    News <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
}