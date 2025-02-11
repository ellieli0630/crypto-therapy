import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Home } from "lucide-react";
import { ConnectButton } from '@rainbow-me/rainbowkit';
import ChatInterface from "@/components/chat-interface";
import { WalletMoodAnalyzer } from "@/components/WalletMoodAnalyzer";

export default function Therapy() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/">
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2 text-foreground bg-background hover:bg-accent"
              >
                <ChevronLeft className="h-4 w-4" />
                Go back
              </Button>
            </Link>
            <Link href="/">
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2 shadow-pixel text-foreground bg-background hover:bg-accent"
              >
                <Home className="h-4 w-4" />
                Homepage
              </Button>
            </Link>
          </div>
          <h1 className="text-2xl font-press-start-2p">THERAPY_SESSION</h1>
          <ConnectButton />
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-[1fr_300px] gap-6">
          <div className="space-y-6">
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-4 mb-4">
                <img
                  src="https://images.unsplash.com/photo-1425421669292-0c3da3b8f529"
                  alt="AI Therapist"
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h2 className="font-semibold font-press-start-2p">Dr. Satoshi</h2>
                  <p className="text-sm text-muted-foreground">AI Crypto Therapist</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Welcome to your safe space. Here, we can discuss your crypto journey,
                process market volatility, and work through your trading-related emotions.
                How are you feeling today?
              </p>
            </div>

            <ChatInterface userId={1} /> {/* TODO: Replace with actual user ID */}
          </div>

          <div className="space-y-6">
            <WalletMoodAnalyzer />
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-semibold font-press-start-2p mb-2">SESSION_GUIDELINES</h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Be honest about your feelings</li>
                <li>• Share your crypto experiences</li>
                <li>• Celebrate achievements</li>
                <li>• Remember, this is a parody service</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}