interface CandleData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface PatternResult {
  pattern: 'ascending_triangle' | 'cup_and_handle';
  confidence: number;
  details: string;
}

export const analyzeAscendingTriangle = (candles: CandleData[]): PatternResult | null => {
  if (candles.length < 20) return null;

  // Look at last 20 candles
  const recentCandles = candles.slice(-20);
  
  // Find potential resistance level
  const highs = recentCandles.map(c => c.high);
  const potentialResistance = Math.max(...highs);
  
  // Count number of touches near resistance
  const touchThreshold = potentialResistance * 0.005; // 0.5% threshold
  const resistanceTouches = recentCandles.filter(
    c => Math.abs(c.high - potentialResistance) <= touchThreshold
  ).length;

  // Check for higher lows
  let hasHigherLows = true;
  let previousLow = recentCandles[0].low;
  for (let i = 1; i < recentCandles.length; i++) {
    if (recentCandles[i].low < previousLow) {
      hasHigherLows = false;
      break;
    }
    previousLow = recentCandles[i].low;
  }

  // Calculate confidence based on pattern criteria
  let confidence = 0;
  if (resistanceTouches >= 3) confidence += 40;
  if (hasHigherLows) confidence += 40;
  if (recentCandles[recentCandles.length - 1].close > potentialResistance) confidence += 10;

  if (confidence >= 90) {
    return {
      pattern: 'ascending_triangle',
      confidence,
      details: `Found ${resistanceTouches} resistance touches with higher lows`
    };
  }

  return null;
};

export const analyzeCupAndHandle = (candles: CandleData[]): PatternResult | null => {
  if (candles.length < 30) return null;

  // Look at last 30 candles
  const recentCandles = candles.slice(-30);
  
  // Find potential cup formation
  const prices = recentCandles.map(c => c.close);
  const highestPrice = Math.max(...prices);
  const lowestPrice = Math.min(...prices);
  const priceRange = highestPrice - lowestPrice;
  
  // Check for U shape
  const midPoint = Math.floor(recentCandles.length / 2);
  const leftSide = recentCandles.slice(0, midPoint);
  const rightSide = recentCandles.slice(midPoint);
  
  let isUShape = true;
  // Price should generally decrease in left side
  for (let i = 1; i < leftSide.length; i++) {
    if (leftSide[i].close > leftSide[i-1].close) {
      isUShape = false;
      break;
    }
  }
  // Price should generally increase in right side
  for (let i = 1; i < rightSide.length; i++) {
    if (rightSide[i].close < rightSide[i-1].close) {
      isUShape = false;
      break;
    }
  }

  // Check for handle formation
  const lastFiveCandles = recentCandles.slice(-5);
  const handleRange = Math.max(...lastFiveCandles.map(c => c.high)) - 
                     Math.min(...lastFiveCandles.map(c => c.low));
  const hasHandle = handleRange <= priceRange * 0.3; // Handle should be smaller than cup

  // Calculate confidence
  let confidence = 0;
  if (isUShape) confidence += 50;
  if (hasHandle) confidence += 30;
  if (lastFiveCandles[lastFiveCandles.length - 1].close > lastFiveCandles[0].open) confidence += 10;

  if (confidence >= 90) {
    return {
      pattern: 'cup_and_handle',
      confidence,
      details: `Found U-shape formation with handle`
    };
  }

  return null;
};

export const analyzePatterns = async (symbol: string): Promise<PatternResult[]> => {
  try {
    // Fetch historical data from Coinbase API
    const response = await fetch(`https://api.pro.coinbase.com/products/${symbol}/candles?granularity=86400`);
    const data: [number, number, number, number, number, number][] = await response.json();
    
    // Convert to CandleData format
    const candles: CandleData[] = data.map(([time, open, high, low, close, volume]) => ({
      time,
      open,
      high,
      low,
      close,
      volume
    }));

    const patterns: PatternResult[] = [];

    // Check for ascending triangle
    const triangleResult = analyzeAscendingTriangle(candles);
    if (triangleResult) patterns.push(triangleResult);

    // Check for cup and handle
    const cupResult = analyzeCupAndHandle(candles);
    if (cupResult) patterns.push(cupResult);

    return patterns;
  } catch (error) {
    console.error(`Error analyzing patterns for ${symbol}:`, error);
    return [];
  }
};
