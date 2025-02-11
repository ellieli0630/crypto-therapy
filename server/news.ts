import { z } from "zod";

const NEWS_SOURCES = [
  {
    name: "CoinDesk",
    url: "https://www.coindesk.com/arc/outboundfeeds/rss/",
  },
  {
    name: "CoinTelegraph",
    url: "https://cointelegraph.com/rss",
  },
  {
    name: "The Defiant",
    url: "https://thedefiant.io/rss",
  },
  {
    name: "CryptoSlate",
    url: "https://cryptoslate.com/feed/",
  },
];

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  url: string;
  imageUrl: string;
  publishedAt: string;
}

async function fetchRSSFeed(url: string): Promise<any> {
  try {
    const response = await fetch(url, {
      cache: 'no-store', // Prevent browser caching
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    const text = await response.text();
    const items = text.match(/<item>[\s\S]*?<\/item>/g) || [];

    return items.map(item => {
      const title = item.match(/<title>(.*?)<\/title>/)?.[1] || '';
      const link = item.match(/<link>(.*?)<\/link>/)?.[1] || '';
      const description = item.match(/<description>(.*?)<\/description>/)?.[1] || '';
      const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || '';

      // Extract image URL using multiple methods since RSS feeds vary
      let imageUrl = '';
      const mediaContent = item.match(/<media:content[^>]*url="([^"]+)"/);
      if (mediaContent) imageUrl = mediaContent[1];

      if (!imageUrl) {
        const enclosure = item.match(/<enclosure[^>]*url="([^"]+)"/);
        if (enclosure) imageUrl = enclosure[1];
      }

      if (!imageUrl) {
        const imageMatch = description.match(/src="(https:\/\/[^"]+\.(jpg|jpeg|png|gif))"/i);
        if (imageMatch) imageUrl = imageMatch[1];
      }

      const sourceName = NEWS_SOURCES.find(s => url.includes(s.name.toLowerCase()))?.name || "CoinDesk";
      if (!imageUrl) {
        const fallbacks: Record<string, string> = {
          "CoinDesk": "https://images.unsplash.com/photo-1621761191319-c6fb62004040",
          "CoinTelegraph": "https://images.unsplash.com/photo-1518546305927-5a555bb7020d",
          "The Defiant": "https://images.unsplash.com/photo-1605792657660-596af9009e82",
          "CryptoSlate": "https://images.unsplash.com/photo-1516245834210-c4c142787335",
        };
        imageUrl = fallbacks[sourceName];
      }

      return {
        title: title.replace(/<!\[CDATA\[|\]\]>/g, ''),
        url: link,
        summary: description
          .replace(/<!\[CDATA\[|\]\]>/g, '')
          .replace(/<[^>]+>/g, '')
          .slice(0, 200) + '...',
        imageUrl,
        source: sourceName,
        publishedAt: new Date(pubDate).toISOString(),
      };
    });
  } catch (error) {
    console.error(`Error fetching from ${url}:`, error);
    return [];
  }
}

let cachedNews: NewsItem[] | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function getLatestNews(forceFresh = false): Promise<NewsItem[]> {
  const now = Date.now();

  // Always fetch fresh content if forceFresh is true
  if (forceFresh) {
    cachedNews = null;
    lastFetchTime = 0;
  } else if (cachedNews && now - lastFetchTime < CACHE_DURATION) {
    return cachedNews;
  }

  try {
    // Shuffle news sources to get different content each time
    const shuffledSources = [...NEWS_SOURCES].sort(() => Math.random() - 0.5);

    const allNews = await Promise.all(
      shuffledSources.map(async (source) => {
        const items = await fetchRSSFeed(source.url);
        return items.map((item: any) => ({
          ...item,
          id: `${source.name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        }));
      })
    );

    // Randomize the selection of news items
    const flatNews = allNews.flat();
    const randomizedNews = flatNews
      .sort(() => Math.random() - 0.5)
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, 4);

    if (!forceFresh) {
      cachedNews = randomizedNews;
      lastFetchTime = now;
    }

    return randomizedNews;
  } catch (error) {
    console.error("Error fetching news:", error);
    return forceFresh ? [] : (cachedNews || []);
  }
}