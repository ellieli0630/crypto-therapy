import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import MarketSentiment from "@/components/market-sentiment";
import CryptoSatire from "@/components/crypto-satire";
import { Menu, Trophy, MessageCircle } from "lucide-react";
import CryptoFigures from "@/components/crypto-figures";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-red-500/10 via-transparent to-blue-500/10" />
      </div>

      <div className="max-w-6xl mx-auto p-6 relative">
        <header className="flex items-center justify-between mb-12">
          <h1 className="text-6xl font-press-start-2p tracking-tighter text-white">
            CRYPTO<span className="text-red-500">.THERAPY</span>
          </h1>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="border-red-500/20">
                <Menu className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-black/90 border-red-500/20">
              <DropdownMenuItem asChild>
                <Link href="/therapy">
                  <div className="flex items-center">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Start Therapy
                  </div>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/achievements">
                  <div className="flex items-center">
                    <Trophy className="mr-2 h-4 w-4" />
                    Achievements
                  </div>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <div className="text-center mb-12">
          <p className="text-lg font-press-start-2p text-gray-400">
            VERSION [R.2] // SYSTEM ACTIVE_
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-12">
          <Link href="/therapy">
            <Button 
              className="w-full h-16 font-press-start-2p shadow-pixel bg-red-500/10 border-red-500/20 hover:bg-red-500/20" 
              size="lg"
            >
              <MessageCircle className="mr-2 h-5 w-5" />
              START_SESSION
            </Button>
          </Link>
          <Link href="/achievements">
            <Button 
              className="w-full h-16 font-press-start-2p shadow-pixel bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/20" 
              variant="outline" 
              size="lg"
            >
              <Trophy className="mr-2 h-5 w-5" />
              VIEW_ACHIEVEMENTS
            </Button>
          </Link>
        </div>

        <div className="space-y-8">
          <MarketSentiment />
          <CryptoFigures />
          <CryptoSatire />
        </div>
      </div>
    </div>
  );
}