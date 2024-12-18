import { analyzeSocialSentiment, getSocialBreakoutScore } from './socialSentiment';

interface VolumeAnalysis {
  anomalies: boolean;
  trend: 'increasing' | 'decreasing' | 'neutral';
  whaleActivity: boolean;
  score: number;
}

interface TechnicalIndicators {
  rsi: number;
  macd: {
    histogram: number;
    signal: number;
    trend: 'bullish' | 'bearish' | 'neutral';
  };
  movingAverages: {
    ema20: number;
    ema50: number;
    ema200: number;
    goldenCross: boolean;
    deathCross: boolean;
  };
}

interface MarketConditions {
  sentiment: 'bullish' | 'bearish' | 'neutral';
  volatility: 'high' | 'medium' | 'low';
  trendStrength: number;
}

interface PriceTargets {
  conservative: number;
  moderate: number;
  aggressive: number;
}

interface BreakoutAnalysis {
  probability: number;
  timeframes: {
    hourly: number;
    sixHour: number;
    daily: number;
  };
  support: number;
  resistance: number;
  stopLoss: number;
  targets: PriceTargets;
  riskRewardRatio: number;
}

interface SocialAnalysis {
  mentionVolume: number;
  volumeChange: number;
  sentimentScore: number;
  trendingScore: number;
  weeklyTrend: Array<{
    date: string;
    mentions: number;
    sentiment: number;
  }>;
}

export interface DetailedPatternAnalysis {
  symbol: string;
  confidence: number;
  patterns: {
    ascending_triangle: boolean;
    cup_and_handle: boolean;
    bull_flag: boolean;
    falling_wedge: boolean;
  };
  volume: VolumeAnalysis;
  indicators: TechnicalIndicators;
  market: MarketConditions;
  breakout: BreakoutAnalysis;
  social: SocialAnalysis;
  reasoning: string[];
}

// Simulated technical analysis functions
const analyzeVolume = (symbol: string): VolumeAnalysis => {
  return {
    anomalies: Math.random() > 0.7,
    trend: Math.random() > 0.6 ? 'increasing' : Math.random() > 0.3 ? 'neutral' : 'decreasing',
    whaleActivity: Math.random() > 0.8,
    score: Math.random() * 100
  };
};

const analyzeTechnicalIndicators = (symbol: string): TechnicalIndicators => {
  const rsi = 30 + Math.random() * 40;
  return {
    rsi,
    macd: {
      histogram: Math.random() * 2 - 1,
      signal: Math.random() * 2 - 1,
      trend: rsi < 40 ? 'bullish' : rsi > 60 ? 'bearish' : 'neutral'
    },
    movingAverages: {
      ema20: 100 + Math.random() * 20,
      ema50: 90 + Math.random() * 30,
      ema200: 80 + Math.random() * 40,
      goldenCross: Math.random() > 0.7,
      deathCross: Math.random() > 0.9
    }
  };
};

const analyzeMarketConditions = (symbol: string): MarketConditions => {
  return {
    sentiment: Math.random() > 0.6 ? 'bullish' : Math.random() > 0.3 ? 'neutral' : 'bearish',
    volatility: Math.random() > 0.6 ? 'high' : Math.random() > 0.3 ? 'medium' : 'low',
    trendStrength: Math.random() * 100
  };
};

const calculateBreakoutProbability = (
  volume: VolumeAnalysis,
  indicators: TechnicalIndicators,
  market: MarketConditions,
  socialScore: number
): BreakoutAnalysis => {
  const baseProb = (
    (volume.score * 0.3) +
    (indicators.rsi < 40 ? 20 : 0) +
    (indicators.macd.trend === 'bullish' ? 15 : 0) +
    (indicators.movingAverages.goldenCross ? 15 : 0) +
    (market.trendStrength * 0.2) +
    (socialScore * 0.2)  // Social sentiment contribution
  );
  
  return {
    probability: baseProb,
    timeframes: {
      daily: baseProb * (0.8 + Math.random() * 0.4),
      sixHour: baseProb * (0.7 + Math.random() * 0.4),
      hourly: baseProb * (0.6 + Math.random() * 0.4)
    },
    support: 90 + Math.random() * 20,
    resistance: 110 + Math.random() * 20,
    stopLoss: 85 + Math.random() * 10,
    targets: {
      conservative: 115 + Math.random() * 10,
      moderate: 130 + Math.random() * 20,
      aggressive: 150 + Math.random() * 50
    },
    riskRewardRatio: 2 + Math.random() * 3
  };
};

const formatSocialData = (metrics: any): SocialAnalysis => {
  return {
    mentionVolume: metrics.mentionVolume,
    volumeChange: metrics.volumeChange,
    sentimentScore: metrics.sentimentScore,
    trendingScore: metrics.trendingScore,
    weeklyTrend: metrics.historicalData.map((data: any) => ({
      date: new Date(data.timestamp).toLocaleDateString(),
      mentions: data.totalMentions,
      sentiment: (data.positiveCount - data.negativeCount) / data.totalMentions
    })).reverse()
  };
};

const generateReasoning = (
  symbol: string,
  volume: VolumeAnalysis,
  indicators: TechnicalIndicators,
  market: MarketConditions,
  breakout: BreakoutAnalysis,
  social: SocialAnalysis
): string[] => {
  const reasons: string[] = [];

  if (volume.anomalies) {
    reasons.push('Significant volume anomalies detected indicating potential institutional interest');
  }
  if (volume.whaleActivity) {
    reasons.push('Whale wallet accumulation observed in recent periods');
  }
  if (indicators.rsi < 40) {
    reasons.push('RSI indicating oversold conditions with potential for reversal');
  }
  if (indicators.macd.trend === 'bullish') {
    reasons.push('MACD showing bullish momentum with positive histogram expansion');
  }
  if (indicators.movingAverages.goldenCross) {
    reasons.push('Recent golden cross formation on moving averages');
  }
  if (market.sentiment === 'bullish' && market.trendStrength > 70) {
    reasons.push('Strong bullish market sentiment with robust trend strength');
  }
  if (breakout.riskRewardRatio > 3) {
    reasons.push('Favorable risk-reward ratio at current levels');
  }
  if (social.volumeChange > 50) {
    reasons.push(`Social mention volume up ${social.volumeChange.toFixed(1)}% over the past week`);
  }
  if (social.sentimentScore > 0.3) {
    reasons.push('Highly positive social sentiment with strong community engagement');
  }
  if (social.trendingScore > 70) {
    reasons.push('Significant social media momentum building');
  }

  return reasons;
};

export const analyzePatterns = async (symbol: string): Promise<DetailedPatternAnalysis> => {
  // Perform comprehensive technical analysis
  const volume = analyzeVolume(symbol);
  const indicators = analyzeTechnicalIndicators(symbol);
  const market = analyzeMarketConditions(symbol);
  
  // Get social sentiment data
  const socialMetrics = await analyzeSocialSentiment(symbol);
  const socialScore = getSocialBreakoutScore(socialMetrics);
  const social = formatSocialData(socialMetrics);
  
  // Calculate breakout probability including social metrics
  const breakout = calculateBreakoutProbability(volume, indicators, market, socialScore);
  
  // Generate pattern detection results
  const patterns = {
    ascending_triangle: Math.random() > 0.7,
    cup_and_handle: Math.random() > 0.8,
    bull_flag: Math.random() > 0.75,
    falling_wedge: Math.random() > 0.85
  };

  // Calculate overall confidence score including social metrics
  const confidence = (
    (volume.score * 0.25) +
    (indicators.rsi < 40 ? 15 : 0) +
    (indicators.macd.trend === 'bullish' ? 15 : 0) +
    (indicators.movingAverages.goldenCross ? 15 : 0) +
    (market.trendStrength * 0.15) +
    (breakout.probability * 0.15) +
    (socialScore * 0.15)  // Social sentiment contribution
  );

  // Generate reasoning for the analysis
  const reasoning = generateReasoning(symbol, volume, indicators, market, breakout, social);

  return {
    symbol,
    confidence,
    patterns,
    volume,
    indicators,
    market,
    breakout,
    social,
    reasoning
  };
};

export const getTopBreakoutCandidates = async (): Promise<DetailedPatternAnalysis[]> => {
  const pairs = ['BTC-USD', 'ETH-USD', 'SOL-USD', 'XRP-USD', 'DOGE-USD', 'ADA-USD', 'AVAX-USD', 'MATIC-USD', 'DOT-USD', 'LINK-USD'];
  const analyses = await Promise.all(pairs.map(pair => analyzePatterns(pair)));
  
  // Sort by confidence score and return top 10
  return analyses
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 10);
};
