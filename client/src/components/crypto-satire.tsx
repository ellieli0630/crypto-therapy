import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SatireNews {
  id: string;
  title: string;
  satiricalTitle: string;
  satire: string;
  analysis: string;
  imageUrl: string;
  source: string;
  url: string;
  publishedAt: string;
}

const CryptoSatire = () => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [refreshTimestamp, setRefreshTimestamp] = useState<number>(Date.now());
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: news, isLoading, isRefetching, isError } = useQuery<SatireNews[]>({
    queryKey: ["/api/news/satire", refreshTimestamp],
    refetchInterval: 300000, // Refresh every 5 minutes
  });

  const handleRefresh = async () => {
    setRefreshTimestamp(Date.now());
    try {
      await queryClient.fetchQuery({ 
        queryKey: ["/api/news/satire"],
        queryFn: async () => {
          const res = await fetch("/api/news/satire?fresh=true");
          if (!res.ok) throw new Error("Failed to fetch news");
          return res.json();
        }
      });
      toast({
        title: "Refreshed! 🎭",
        description: "Fresh batch of crypto comedy incoming...",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error refreshing news",
        description: "Please try again in a moment.",
      });
    }
  };

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (expandedItems.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold pixel-font">🎭 The Daily HODL Comedy Hour</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-40 w-full mb-4" />
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold pixel-font">🎭 The Daily HODL Comedy Hour</h2>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            Try Again
          </Button>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Failed to load crypto jokes. Our comedians are experiencing stage fright.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-press-start-2p">🎭 THE DAILY HODL COMEDY HOUR</h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          disabled={isRefetching}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
          Fresh Jokes
        </Button>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {news?.map((item) => (
          <Card key={item.id} className="overflow-hidden shadow-pixel">
            <img
              src={item.imageUrl}
              alt={item.title}
              className="w-full h-48 object-cover"
            />
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-primary">
                  {item.source}
                </span>
                <span className="text-xs text-muted-foreground">
                  {new Date(item.publishedAt).toLocaleDateString()}
                </span>
              </div>

              <a 
                href={item.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="group"
              >
                <h3 className="font-semibold group-hover:text-primary transition-colors">
                  {item.title}
                  <ExternalLink className="inline-block ml-1 h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </h3>
              </a>

              <div className="space-y-2">
                <p className="font-semibold text-sm text-primary">{item.satiricalTitle}</p>
                <p className="text-sm">{item.satire}</p>
              </div>

              <div className="pt-2 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleExpand(item.id)}
                  className="w-full justify-between shadow-pixel"
                >
                  {expandedItems.has(item.id) ? "Hide" : "View"} Analysis
                  {expandedItems.has(item.id) ? (
                    <ChevronUp className="h-4 w-4 ml-2" />
                  ) : (
                    <ChevronDown className="h-4 w-4 ml-2" />
                  )}
                </Button>

                {expandedItems.has(item.id) && (
                  <div className="mt-4 p-4 bg-muted rounded-lg">
                    <div className="prose prose-sm max-w-none">
                      {item.analysis.split('\n\n').map((paragraph, idx) => (
                        <p key={idx} className="mb-2 last:mb-0 text-sm">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CryptoSatire;