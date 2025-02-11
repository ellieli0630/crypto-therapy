import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import type { Achievement } from "@shared/schema";

interface AchievementCardProps {
  achievement: Achievement;
}

export default function AchievementCard({ achievement }: AchievementCardProps) {
  const handleShare = async () => {
    const text = `I just earned the "${achievement.title}" achievement in my crypto therapy journey! 🏆\n\nCryptoTherapist.ai - Your AI-powered support system for the crypto emotional rollercoaster`;
    
    try {
      await navigator.share({
        title: "CryptoTherapist Achievement",
        text,
        url: window.location.origin,
      });
    } catch (err) {
      // Fallback to clipboard
      navigator.clipboard.writeText(text);
    }
  };

  return (
    <Card className="overflow-hidden">
      <img
        src={achievement.imageUrl}
        alt={achievement.title}
        className="w-full h-40 object-cover"
      />
      <CardContent className="p-4 space-y-4">
        <div>
          <h3 className="font-semibold">{achievement.title}</h3>
          <p className="text-sm text-muted-foreground">{achievement.description}</p>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            Earned {new Date(achievement.earnedAt).toLocaleDateString()}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="gap-2"
          >
            <Share2 className="h-4 w-4" />
            Share
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
