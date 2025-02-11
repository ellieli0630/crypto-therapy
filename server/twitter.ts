import OpenAI from "openai";
import { z } from "zod";

const CRYPTO_FIGURES = [
  {
    handle: "elonmusk",
    name: "Elon Musk",
    title: "Technoking of Crypto Volatility",
    avatar: "https://unavatar.io/twitter/elonmusk",
    twitterUrl: "https://x.com/elonmusk",
    newsUrl: "https://cointelegraph.com/tags/elon-musk"
  },
  {
    handle: "VitalikButerin",
    name: "Vitalik Buterin",
    title: "Ethereum's Philosophy King",
    avatar: "https://unavatar.io/twitter/VitalikButerin",
    twitterUrl: "https://x.com/VitalikButerin",
    newsUrl: "https://cointelegraph.com/tags/vitalik-buterin"
  },
  {
    handle: "realDonaldTrump",
    name: "Donald Trump",
    title: "Former POTUS & CBDC Critic",
    avatar: "https://unavatar.io/twitter/realDonaldTrump",
    twitterUrl: "https://x.com/realDonaldTrump",
    newsUrl: "https://cointelegraph.com/tags/donald-trump"
  },
  {
    handle: "cz_binance",
    name: "CZ Binance",
    title: "Ex-CEO of You-Know-Where",
    avatar: "https://unavatar.io/twitter/cz_binance",
    twitterUrl: "https://x.com/cz_binance",
    newsUrl: "https://cointelegraph.com/tags/changpeng-zhao"
  },
  {
    handle: "justinsuntron",
    name: "Justin Sun",
    title: "Tron's Master of Controversy",
    avatar: "https://unavatar.io/twitter/justinsuntron",
    twitterUrl: "https://x.com/justinsuntron",
    newsUrl: "https://cointelegraph.com/tags/justin-sun"
  }
];

// Crypto Chaos Index metrics with original scoring weights
const CHAOS_METRICS = {
  memeDensity: {
    name: "Meme Density",
    description: "% of tweets containing memes, ALL CAPS, or absurd analogies",
    maxScore: 10,
    weight: 0.154  // 10/65
  },
  cryptoHypeScore: {
    name: "Crypto Hype Score",
    description: "Frequency of crypto buzzwords and hype phrases",
    maxScore: 20,
    weight: 0.308,  // 20/65
    buzzwords: [
      "MOON", "HODL", "APE IN", "RUGPULL", "FUD", 
      "DIAMOND HANDS", "SATOSHI", "WAGMI", "NGMI", "BASED"
    ]
  },
  chaosCoefficient: {
    name: "Chaos Coefficient",
    description: "Erratic behavior: late-night tweets, deleted posts, price-moving claims",
    maxScore: 10,
    weight: 0.154  // 10/65
  },
  controversyLevel: {
    name: "Controversy Level",
    description: "Ratio of angry replies/quote tweets to total engagement",
    maxScore: 15,
    weight: 0.231  // 15/65
  },
  prophetFactor: {
    name: "Prophet Factor",
    description: "Accuracy of crypto predictions and market influence",
    maxScore: 10,
    weight: 0.154  // 10/65
  }
};

// Response schema with normalized scores
const tweetAnalysisSchema = z.object({
  metrics: z.object({
    memeDensity: z.number().min(0).max(10),
    cryptoHypeScore: z.number().min(0).max(20),
    chaosCoefficient: z.number().min(0).max(10),
    controversyLevel: z.number().min(0).max(15),
    prophetFactor: z.number().min(0).max(10)
  }),
  normalizedScore: z.number().min(0).max(10), // Normalized to 0-10 scale
  rawScore: z.number().min(0).max(65),        // Original 65-point scale
  breakdown: z.record(z.string()),
  emoji: z.string(),
  recentActivity: z.string(),
  topTweet: z.string()
});

type TweetAnalysis = z.infer<typeof tweetAnalysisSchema>;

interface CryptoFigureAnalysis {
  handle: string;
  name: string;
  title: string;
  avatar: string;
  twitterUrl: string;
  newsUrl: string;
  analysis: TweetAnalysis;
}

function getMockTweets(handle: string): string[] {
  const mockTweetsByHandle: Record<string, string[]> = {
    elonmusk: [
      "Dogecoin to Mars! 🚀",
      "Who let the Doge out? 🐕",
      "Just bought $10B in BTC because I was bored"
    ],
    VitalikButerin: [
      "New proof-of-stake optimization reduces energy by 99.99999%",
      "Interesting paper on zk-SNARKs implementation in layer 2",
      "Working on Ethereum scalability, might delete later"
    ],
    realDonaldTrump: [
      "BITCOIN is HUGE! Nobody knows crypto better than me, maybe ever!",
      "The RADICAL LEFT wants to ban crypto. SAD!",
      "Make Crypto Great Again! #MCGA"
    ],
    cz_binance: [
      "4",
      "Funds are SAFU",
      "In blockchain we trust 🙏"
    ],
    justinsuntron: [
      "Just acquired another blockchain company! Details soon... 👀",
      "TRON ecosystem growing 1000x! More partnerships coming!",
      "Having lunch with @WarrenBuffett was just the beginning 🚀"
    ]
  };

  return mockTweetsByHandle[handle] || [
    "Error loading tweets",
    "Please try again later"
  ];
}

async function analyzeTweets(handle: string, tweets: string[]): Promise<TweetAnalysis> {
  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await openai.chat.completions.create({
      model: "gpt-4o", 
      messages: [
        {
          role: "system",
          content: `You are an expert crypto analyst specializing in the "Crypto Chaos Index" (CCI), a framework for measuring crypto influencers' behavior.

          Analyze the tweets based on these metrics and their max scores:

          1. Meme Density (MD, max 10):
          - % of tweets with memes, ALL CAPS, emojis
          - Example: "Doge to the moon 🚀" = high score

          2. Crypto Hype Score (CHS, max 20):
          - Frequency of terms like MOON, HODL, APE IN, WAGMI
          - Weight buzzwords by their hype factor

          3. Chaos Coefficient (CC, max 10):
          - Erratic behavior indicators
          - Late-night tweets, deleted posts, market-moving claims

          4. Controversy Level (CL, max 15):
          - Engagement in debates/arguments
          - Bold claims and statements

          5. Prophet Factor (PF, max 10):
          - Track record of predictions
          - Market influence

          The total raw score will be normalized to a 0-10 scale for easier comprehension.

          Return a JSON object with:
          {
            "metrics": {
              "memeDensity": number (0-10),
              "cryptoHypeScore": number (0-20),
              "chaosCoefficient": number (0-10),
              "controversyLevel": number (0-15),
              "prophetFactor": number (0-10)
            },
            "normalizedScore": number (0-10),
            "rawScore": number (0-65),
            "breakdown": {
              [metric: string]: "Explanation of score"
            },
            "emoji": "Single most representative emoji",
            "recentActivity": "One-line summary of behavior",
            "topTweet": "Most notable tweet"
          }

          Be humorous and satirical while maintaining analytical accuracy.`
        },
        {
          role: "user",
          content: `Analyze these recent tweets from @${handle}:\n${tweets.join("\n")}`
        }
      ],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content || JSON.stringify({
      metrics: {
        memeDensity: 5,
        cryptoHypeScore: 10,
        chaosCoefficient: 5,
        controversyLevel: 7,
        prophetFactor: 5
      },
      normalizedScore: 4.9,
      rawScore: 32,
      breakdown: {
        error: "Failed to analyze tweets"
      },
      emoji: "🤖",
      recentActivity: "Error analyzing activity",
      topTweet: "Error loading tweet"
    });

    const parsed = JSON.parse(content);

    const rawScore = Object.entries(parsed.metrics)
      .reduce((sum, [key, value]) => sum + (value as number), 0);

    parsed.rawScore = rawScore;
    parsed.normalizedScore = (rawScore / 65) * 10;

    return tweetAnalysisSchema.parse(parsed);

  } catch (error) {
    console.error("Tweet analysis error:", error);
    return {
      metrics: {
        memeDensity: 5,
        cryptoHypeScore: 10,
        chaosCoefficient: 5,
        controversyLevel: 7,
        prophetFactor: 5
      },
      normalizedScore: 4.9,
      rawScore: 32,
      breakdown: {
        error: "Failed to analyze tweets"
      },
      emoji: "🤖",
      recentActivity: "Our AI is taking a break from crypto twitter",
      topTweet: "Failed to load tweet"
    };
  }
}

export async function getCryptoFiguresAnalysis(): Promise<CryptoFigureAnalysis[]> {
  try {
    const analyses = await Promise.all(
      CRYPTO_FIGURES.map(async (figure) => {
        const tweets = getMockTweets(figure.handle);
        const analysis = await analyzeTweets(figure.handle, tweets);
        return {
          ...figure,
          analysis
        };
      })
    );

    return analyses;
  } catch (error) {
    console.error("Error analyzing crypto figures:", error);
    return CRYPTO_FIGURES.map(figure => ({
      ...figure,
      analysis: {
        metrics: {
          memeDensity: 5,
          cryptoHypeScore: 10,
          chaosCoefficient: 5,
          controversyLevel: 7,
          prophetFactor: 5
        },
        normalizedScore: 4.9,
        rawScore: 32,
        breakdown: {
          error: "Analysis temporarily unavailable"
        },
        emoji: "🤖",
        recentActivity: "Check back later for updates",
        topTweet: "Failed to load top tweet"
      }
    }));
  }
}

export async function analyzeCustomHandle(handle: string): Promise<CryptoFigureAnalysis> {
  try {
    const tweets = [
      "Analyzing custom Twitter handle...",
      "Note: This is a demo with mock data",
      `Custom analysis for @${handle}`
    ];

    const analysis = await analyzeTweets(handle, tweets);

    return {
      handle,
      name: handle,
      title: "Custom Analysis",
      avatar: `https://unavatar.io/twitter/${handle}`,
      twitterUrl: `https://x.com/${handle}`,
      newsUrl: `https://cointelegraph.com/search?query=${handle}`,
      analysis
    };
  } catch (error: any) {
    throw new Error(`Failed to analyze handle @${handle}: ${error.message}`);
  }
}