interface SentimentData {
  positiveCount: number;
  negativeCount: number;
  neutralCount: number;
  totalMentions: number;
  timestamp: number;
}

interface SocialMetrics {
  mentionVolume: number; // Total mentions in the period
  volumeChange: number; // Percentage change in volume
  sentimentScore: number; // -1 to 1, where 1 is most positive
  trendingScore: number; // 0 to 100, indicating how "hot" the token is
  historicalData: SentimentData[]; // Last 7 days of data
}

// Simulated social data - in a real implementation, this would fetch from Twitter API
const generateSocialData = (symbol: string): SocialMetrics => {
  const now = Date.now();
  const historicalData: SentimentData[] = [];
  
  // Generate 7 days of data
  for (let i = 0; i < 7; i++) {
    const baseVolume = Math.random() * 1000 + 500; // Base volume between 500-1500
    const multiplier = Math.random() * 0.5 + 0.75; // Random multiplier 0.75-1.25
    
    // More recent days have higher probability of increased volume
    const recencyBoost = (7 - i) / 7;
    const dayVolume = Math.floor(baseVolume * multiplier * (1 + recencyBoost));
    
    // Generate sentiment distribution
    const positive = Math.floor(dayVolume * (0.3 + Math.random() * 0.2)); // 30-50% positive
    const negative = Math.floor(dayVolume * (0.2 + Math.random() * 0.15)); // 20-35% negative
    const neutral = dayVolume - positive - negative;

    historicalData.push({
      positiveCount: positive,
      negativeCount: negative,
      neutralCount: neutral,
      totalMentions: dayVolume,
      timestamp: now - (i * 24 * 60 * 60 * 1000) // Subtract days
    });
  }

  // Calculate metrics
  const recentVolume = historicalData[0].totalMentions;
  const oldVolume = historicalData[6].totalMentions;
  const volumeChange = ((recentVolume - oldVolume) / oldVolume) * 100;

  // Calculate weighted sentiment score
  const totalMentions = historicalData.reduce((sum, day) => sum + day.totalMentions, 0);
  const weightedSentiment = historicalData.reduce((score, day) => {
    const dayWeight = day.totalMentions / totalMentions;
    const daySentiment = (day.positiveCount - day.negativeCount) / day.totalMentions;
    return score + (daySentiment * dayWeight);
  }, 0);

  // Calculate trending score based on volume increase and sentiment
  const trendingScore = Math.min(
    100,
    Math.max(
      0,
      (volumeChange * 0.7) + // Volume change contribution
      (weightedSentiment * 50) + // Sentiment contribution
      (recentVolume / 1000 * 30) // Absolute volume contribution
    )
  );

  return {
    mentionVolume: recentVolume,
    volumeChange,
    sentimentScore: weightedSentiment,
    trendingScore,
    historicalData
  };
};

export const analyzeSocialSentiment = async (symbol: string): Promise<SocialMetrics> => {
  // In a real implementation, this would:
  // 1. Query Twitter API for mentions and hashtags
  // 2. Use NLP to analyze sentiment
  // 3. Calculate metrics based on real data
  // 4. Cache results to avoid API rate limits
  
  return generateSocialData(symbol);
};

export const getSocialBreakoutScore = (metrics: SocialMetrics): number => {
  // Convert social metrics into a breakout probability score (0-100)
  const volumeScore = Math.min(100, Math.max(0, metrics.volumeChange)) * 0.4;
  const sentimentScore = (metrics.sentimentScore + 1) * 50 * 0.3; // Convert -1 to 1 into 0-100
  const trendingScore = metrics.trendingScore * 0.3;

  return volumeScore + sentimentScore + trendingScore;
};
