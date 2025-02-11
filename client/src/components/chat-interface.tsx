import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Chat, CHAT_PERSONALITIES } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useAccount, usePublicClient } from 'wagmi';

// Funny responses for different wallet states
const MOOD_RESPONSES = {
  BULLISH: [
    "Whoa there, crypto chad! Your wallet's radiating more green than a Shiba Inu meetup! 🚀",
    "Your transaction history looks like a bull on a Red Bull rampage! Time to cope with success? 📈",
    "Found some serious diamond hands energy in your wallet! Have you considered a career in HODLing? 💎"
  ],
  BEARISH: [
    "I sense major cope potential here. Your wallet's seen better days than a Bitcoin maximalist in 2018! 🐻",
    "Your transaction history is giving me 'buying high, selling low' vibes. Classic! 📉",
    "Looks like you've been practicing the ancient art of catching falling knives. Let's work through this together! 🔪"
  ],
  DEGEN: [
    "Your wallet's got more flips than a gymnastics competition! Time for some financial therapy? 🎪",
    "Found traces of severe ape syndrome in your transaction history. Don't worry, we've all been there! 🦍",
    "Your gas fees alone could fund a small DAO! Living life on the edge, I see... ⛽"
  ],
  INACTIVE: [
    "Your wallet's so quiet, I can hear the NFTs collecting digital dust! 🎭",
    "Taking the 'ultra long-term HODLer' approach, I see. Very zen! 🧘‍♂️",
    "Is this what they call 'true diamond hands' or did you lose your private keys? 🔑"
  ]
};

// Funny responses for dice rolling therapy
const DICE_RESPONSES = {
  CRITICAL_FAIL: [
    "Rolled a 1! Congratulations, you've achieved peak loss aversion therapy! 💀",
    "Snake eyes! But hey, at least it's not your actual portfolio this time! 🎲",
    "A perfect 1! This is the universe telling you to stick to staking... 🌟"
  ],
  MEDIOCRE: [
    "Mid roll! Just like your last 10 trades! At least you're consistent! 🎯",
    "Not great, not terrible. Kinda like that meme coin you bought last week! 🐕",
    "Could be worse! Like that time you tried to catch the falling knife! 📉"
  ],
  CRITICAL_SUCCESS: [
    "Perfect roll! Quick, go buy some lottery tokens! (Not financial advice) 🎰",
    "Rolled a 6! Time to mint this moment as an NFT! 🎨",
    "Maximum score! If only your portfolio performed this well! 🏆"
  ]
};

interface ChatMessage extends Chat {
  memeUrl?: string | null;
}

interface ChatInterfaceProps {
  userId: number;
}

export default function ChatInterface({ userId }: ChatInterfaceProps) {
  const [message, setMessage] = useState("");
  const [selectedPersonality, setSelectedPersonality] = useState<string>(Object.keys(CHAT_PERSONALITIES)[0]);
  const [isRolling, setIsRolling] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { address, isConnected } = useAccount();
  const client = usePublicClient();

  const { data: chats = [], isLoading } = useQuery<ChatMessage[]>({
    queryKey: [`/api/chats/${userId}`],
  });

  const handlePersonalitySelect = (personality: string) => {
    setSelectedPersonality(personality);
  };

  const analyzeMood = async () => {
    if (!address || !client) return null;

    try {
      const count = await client.getTransactionCount({ address });

      // Simulate more detailed analysis (in production, this would use Based AI)
      const randomMood = ['BULLISH', 'BEARISH', 'DEGEN', 'INACTIVE'][Math.floor(Math.random() * 4)];
      const responses = MOOD_RESPONSES[randomMood as keyof typeof MOOD_RESPONSES];
      const response = responses[Math.floor(Math.random() * responses.length)];

      return {
        mood: randomMood,
        response,
        transactionCount: count
      };
    } catch (error) {
      console.error("Failed to analyze wallet:", error);
      return null;
    }
  };

  const rollDiceTherapy = () => {
    setIsRolling(true);
    const roll = Math.floor(Math.random() * 6) + 1;

    setTimeout(() => {
      let response;
      if (roll === 1) {
        response = DICE_RESPONSES.CRITICAL_FAIL[Math.floor(Math.random() * DICE_RESPONSES.CRITICAL_FAIL.length)];
      } else if (roll === 6) {
        response = DICE_RESPONSES.CRITICAL_SUCCESS[Math.floor(Math.random() * DICE_RESPONSES.CRITICAL_SUCCESS.length)];
      } else {
        response = DICE_RESPONSES.MEDIOCRE[Math.floor(Math.random() * DICE_RESPONSES.MEDIOCRE.length)];
      }

      mutation.mutate(`🎲 Rolled a ${roll}! ${response}`);
      setIsRolling(false);
    }, 1000);
  };

  const mutation = useMutation({
    mutationFn: async (message: string) => {
      let moodAnalysis = null;
      if (isConnected) {
        moodAnalysis = await analyzeMood();
      }

      console.log("Sending chat message:", {
        userId,
        message,
        personality: selectedPersonality,
        walletMood: moodAnalysis
      });

      const res = await apiRequest("POST", "/api/chat", {
        userId,
        message,
        personality: selectedPersonality,
        walletMood: moodAnalysis ? {
          mood: moodAnalysis.mood,
          transactionCount: moodAnalysis.transactionCount
        } : undefined
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to send message');
      }

      const data = await res.json();
      console.log("Received chat response:", data);
      return data;
    },
    onSuccess: (data) => {
      if (data.achievement) {
        toast({
          title: "Achievement Unlocked! 🏆",
          description: data.achievement.title,
        });
        queryClient.invalidateQueries({ queryKey: [`/api/achievements/${userId}`] });
      }
      queryClient.invalidateQueries({ queryKey: [`/api/chats/${userId}`] });
      setMessage("");
    },
    onError: (error) => {
      console.error("Chat error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to send message. Please try again.",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedMessage = message.trim();
    if (trimmedMessage) {
      console.log("Submitting message:", trimmedMessage);
      mutation.mutate(trimmedMessage);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen bg-black/50 animate-pulse" />;
  }

  return (
    <div className="min-h-screen bg-black text-white font-poppins p-6 space-y-8">
      {/* Personality Selection */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {Object.entries(CHAT_PERSONALITIES).map(([key, description]) => (
          <button
            key={key}
            onClick={() => handlePersonalitySelect(key)}
            className={cn(
              "p-4 rounded-lg border transition-all duration-200",
              selectedPersonality === key
                ? "bg-red-500/20 border-red-500 shadow-[0_0_20px_rgba(255,0,0,0.2)]"
                : "bg-black border-gray-800 hover:bg-red-500/10"
            )}
          >
            <div className="flex flex-col items-center text-center gap-2">
              <span className="text-2xl">{key.split(' ')[0]}</span>
              <span className="font-press-start-2p text-sm">
                {key.split(' ').slice(1).join(' ')}
              </span>
              <span className="text-xs text-gray-400">{description}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Chat Interface */}
      <Card className="bg-black border border-gray-800 min-h-[600px] flex flex-col">
        <div className="p-6 flex-1 flex flex-col">
          <h2 className="text-2xl font-press-start-2p mb-6">THERAPY_SESSION</h2>
          <div className="flex-1 overflow-y-auto mb-6 space-y-4 min-h-[400px]">
            <AnimatePresence>
              {chats.map((chat, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className={cn("max-w-[80%]", chat.isBot ? "mr-auto" : "ml-auto")}
                >
                  <div className={cn(
                    "p-3 rounded font-poppins space-y-3",
                    chat.isBot
                      ? "bg-red-500/10 border border-red-500/20"
                      : "bg-blue-500/10 border border-blue-500/20"
                  )}>
                    <span className="font-mono">{chat.message}</span>

                    {chat.memeUrl && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="mt-3"
                      >
                        <img
                          src={chat.memeUrl}
                          alt="Generated meme"
                          className="rounded-lg w-full max-w-[300px] h-auto shadow-lg"
                          onError={(e) => {
                            console.error("Failed to load meme image:", chat.memeUrl);
                            e.currentTarget.style.display = 'none';
                          }}
                          loading="lazy"
                          crossOrigin="anonymous"
                          referrerPolicy="no-referrer"
                        />
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="space-y-4">
            {isConnected && (
              <div className="flex gap-2">
                <Button
                  onClick={rollDiceTherapy}
                  disabled={isRolling || mutation.isPending}
                  className="bg-red-500/20 hover:bg-red-500/30 font-press-start-2p"
                >
                  {isRolling ? "ROLLING..." : "ROLL_FOR_THERAPY 🎲"}
                </Button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="ENTER_COMMAND//"
                className="bg-black border-gray-800 font-mono"
              />
              <Button
                type="submit"
                disabled={mutation.isPending}
                className="bg-red-500 hover:bg-red-600 font-press-start-2p px-8"
              >
                SEND
              </Button>
            </form>
          </div>
        </div>
      </Card>
    </div>
  );
}