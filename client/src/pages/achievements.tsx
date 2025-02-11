import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import AchievementCard from "@/components/achievement-card";
import { Achievement } from "@shared/schema";

export default function Achievements() {
  const { data: achievements, isLoading } = useQuery<Achievement[]>({
    queryKey: ["/api/achievements/1"], // TODO: Replace with actual user ID
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <h1 className="text-2xl font-semibold">Recovery Achievements</h1>
          <div className="w-20" /> {/* Spacer for centering */}
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Your Healing Journey</h2>
          <p className="text-muted-foreground">
            Track your progress through the crypto emotional rollercoaster with these
            unique achievements.
          </p>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-48 bg-muted rounded-lg animate-pulse"
              />
            ))}
          </div>
        ) : achievements?.length === 0 ? (
          <div className="text-center py-12">
            <img
              src="https://images.unsplash.com/photo-1571008840902-28bf8f9cd71a"
              alt="No achievements"
              className="w-32 h-32 mx-auto mb-4 rounded-full object-cover"
            />
            <h3 className="font-semibold mb-2">No Achievements Yet</h3>
            <p className="text-muted-foreground mb-4">
              Start your therapy session to earn your first achievement!
            </p>
            <Link href="/therapy">
              <Button>Start Therapy</Button>
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {achievements?.map((achievement) => (
              <AchievementCard
                key={achievement.id}
                achievement={achievement}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
