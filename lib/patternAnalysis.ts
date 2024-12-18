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
  timeframe: '1h' | '6h' | '1d';
}

interface TimeframeInfo {
  startTime: number;
  endTime: number;
}

interface PatternAnalysisResult {
  hourly: PatternResult[];
  sixHour: PatternResult[];
  daily: PatternResult[];
  timeframes: {
    hourly: TimeframeInfo;
    sixHour: TimeframeInfo;
    daily: TimeframeInfo;
  };
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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
      details: `Found ${resistanceTouches} resistance touches with higher lows`,
      timeframe: '1d' // Will be overwritten by the calling function
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
      details: `Found U-shape formation with handle`,
      timeframe: '1d' // Will be overwritten by the calling function
    };
  }

  return null;
};

const fetchCandles = async (symbol: string, granularity: number): Promise<CandleData[]> => {
  const response = await fetch(
    `https://api.exchange.coinbase.com/products/${symbol}/candles?granularity=${granularity}&limit=300`
  );
  
  if (!response.ok) {
    if (response.status === 429) {
      await sleep(1000);
      return fetchCandles(symbol, granularity);
    }
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const rawData = await response.json();
  
  return rawData.map((d: number[]) => ({
    time: d[0],
    open: d[1],
    high: d[2],
    low: d[3],
    close: d[4],
    volume: d[5]
  }));
};

export const analyzePatterns = async (symbol: string): Promise<PatternAnalysisResult> => {
  try {
    // Fetch data for different timeframes
    const hourlyCandles = await fetchCandles(symbol, 3600); // 1 hour
    await sleep(300);
    const sixHourCandles = await fetchCandles(symbol, 21600); // 6 hours
    await sleep(300);
    const dailyCandles = await fetchCandles(symbol, 86400); // 1 day

    const getTimeframeInfo = (candles: CandleData[]): TimeframeInfo => ({
      startTime: Math.min(...candles.map(c => c.time)),
      endTime: Math.max(...candles.map(c => c.time))
    });

    const results = {
      hourly: [] as PatternResult[],
      sixHour: [] as PatternResult[],
      daily: [] as PatternResult[],
      timeframes: {
        hourly: getTimeframeInfo(hourlyCandles),
        sixHour: getTimeframeInfo(sixHourCandles),
        daily: getTimeframeInfo(dailyCandles)
      }
    };

    // Analyze hourly patterns
    const hourlyTriangle = analyzeAscendingTriangle(hourlyCandles);
    const hourlyCup = analyzeCupAndHandle(hourlyCandles);
    if (hourlyTriangle) results.hourly.push({ ...hourlyTriangle, timeframe: '1h' });
    if (hourlyCup) results.hourly.push({ ...hourlyCup, timeframe: '1h' });

    // Analyze 6-hour patterns
    const sixHourTriangle = analyzeAscendingTriangle(sixHourCandles);
    const sixHourCup = analyzeCupAndHandle(sixHourCandles);
    if (sixHourTriangle) results.sixHour.push({ ...sixHourTriangle, timeframe: '6h' });
    if (sixHourCup) results.sixHour.push({ ...sixHourCup, timeframe: '6h' });

    // Analyze daily patterns
    const dailyTriangle = analyzeAscendingTriangle(dailyCandles);
    const dailyCup = analyzeCupAndHandle(dailyCandles);
    if (dailyTriangle) results.daily.push({ ...dailyTriangle, timeframe: '1d' });
    if (dailyCup) results.daily.push({ ...dailyCup, timeframe: '1d' });

    return results;
  } catch (error) {
    console.error(`Error analyzing patterns for ${symbol}:`, error);
    return {
      hourly: [],
      sixHour: [],
      daily: [],
      timeframes: {
        hourly: { startTime: 0, endTime: 0 },
        sixHour: { startTime: 0, endTime: 0 },
        daily: { startTime: 0, endTime: 0 }
      }
    };
  }
};
