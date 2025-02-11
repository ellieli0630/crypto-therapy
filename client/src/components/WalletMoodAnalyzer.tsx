import { useState } from 'react';
import { useAccount, usePublicClient } from 'wagmi';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

export function WalletMoodAnalyzer() {
  const { address, isConnected } = useAccount();
  const { toast } = useToast();
  const [isRolling, setIsRolling] = useState(false);
  const client = usePublicClient();

  const analyzeMood = async () => {
    if (!address || !client) return;

    try {
      // Get recent transactions using viem
      const count = await client.getTransactionCount({ address });

      // Simulated mood analysis (in a real app, this would use Based AI)
      const moods = ['HYPER BULLISH 🚀', 'DEGEN MODE 🎰', 'COPE MASTER 🎭', 'DIAMOND HANDS 💎', 'PAPER HANDS 📄'];
      const randomMood = moods[Math.floor(Math.random() * moods.length)];

      toast({
        title: "Mood Analysis Complete! 🎭",
        description: `Based on ${count} transactions, you're in ${randomMood} MODE!`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error analyzing mood",
        description: "Could not analyze your on-chain activity.",
      });
    }
  };

  const rollDice = async () => {
    setIsRolling(true);
    try {
      // Simulate dice roll with random number
      const roll = Math.floor(Math.random() * 6) + 1;

      setTimeout(() => {
        if (roll === 1) {
          toast({
            variant: "destructive",
            title: "You rolled a 1! 💀",
            description: "You get nothing, enjoy your financial ruin.",
          });
        } else if (roll === 6) {
          toast({
            title: "HUGE W! 🏆",
            description: "You've unlocked the 'Coping Max' achievement!",
          });
        } else {
          toast({
            title: `Rolled a ${roll}! 🎲`,
            description: "Welcome to the chill zone. Zero risk, maximum cope.",
          });
        }
        setIsRolling(false);
      }, 1000);
    } catch (error) {
      setIsRolling(false);
      toast({
        variant: "destructive",
        title: "Error rolling dice",
        description: "The cope machine is temporarily out of order.",
      });
    }
  };

  if (!isConnected) {
    return null;
  }

  return (
    <Card className="bg-black border border-gray-800 p-6 space-y-4">
      <h2 className="text-2xl font-press-start-2p">WALLET_MOOD</h2>

      <div className="space-y-4">
        <Button 
          onClick={analyzeMood}
          className="w-full font-press-start-2p bg-red-500/20 hover:bg-red-500/30"
        >
          ANALYZE_MOOD
        </Button>

        <div className="relative">
          <Button
            onClick={rollDice}
            disabled={isRolling}
            className="w-full font-press-start-2p bg-blue-500/20 hover:bg-blue-500/30"
          >
            {isRolling ? "ROLLING..." : "ROLL_FOR_THERAPY"}
          </Button>
          {isRolling && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="absolute right-4 top-1/2 -translate-y-1/2"
            >
              🎲
            </motion.div>
          )}
        </div>
      </div>
    </Card>
  );
}