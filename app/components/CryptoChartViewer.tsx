import React, { useState, useEffect, useRef, ReactElement } from 'react';
import { analyzePatterns } from '../../lib/patternAnalysis';

declare global {
  interface Window {
    TradingView: any;
  }
}

interface TradingViewChartProps {
  symbol: string;
  containerId: string;
  interval: string;
}

interface TimeframeInfo {
  startTime: number;
  endTime: number;
}

interface PatternResult {
  pattern: 'ascending_triangle' | 'cup_and_handle';
  confidence: number;
  details: string;
  timeframe: '1h' | '6h' | '1d';
}

interface PatternAlert {
  symbol: string;
  hourly: PatternResult[];
  sixHour: PatternResult[];
  daily: PatternResult[];
  timeframes: {
    hourly: TimeframeInfo;
    sixHour: TimeframeInfo;
    daily: TimeframeInfo;
  };
}

const TradingViewChart: React.FC<TradingViewChartProps> = ({ symbol, containerId, interval }) => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.type = 'text/javascript';
    script.async = true;
    script.onload = () => {
      if (window.TradingView) {
        new window.TradingView.widget({
          "autosize": false,
          "symbol": `COINBASE:${symbol}`,
          "interval": interval,
          "timezone": "Etc/UTC",
          "theme": "dark",
          "style": "1",
          "locale": "en",
          "toolbar_bg": "#1e1e1e",
          "enable_publishing": false,
          "withdateranges": true,
          "allow_symbol_change": false,
          "details": true,
          "hotlist": false,
          "calendar": false,
          "container_id": containerId,
          "hide_volume": true,
          "width": "100%",
          "height": 600,
          "save_image": true,
          "hide_side_toolbar": true,
          "range": "3M",
          "time_frames": [
            { text: "1D", resolution: "D" },
            { text: "5D", resolution: "D" },
            { text: "1M", resolution: "D" },
            { text: "3M", resolution: "D" },
            { text: "6M", resolution: "W" },
            { text: "1Y", resolution: "W" }
          ],
          "disabled_features": [
            "header_symbol_search",
            "header_compare",
            "header_settings",
            "left_toolbar",
            "widget_logo",
            "volume_force_overlay",
            "show_chart_property_page",
            "create_volume_indicator_by_default"
          ],
          "enabled_features": [
            "use_localstorage_for_settings"
          ],
          "studies": [],
          "loading_screen": {
            "backgroundColor": "#1e1e1e",
            "foregroundColor": "#2962FF"
          },
          "preset": "dark"
        });
      }
    };
    document.head.appendChild(script);

    return () => {
      const container = document.getElementById(containerId);
      if (container) {
        container.innerHTML = '';
      }
    };
  }, [symbol, containerId, interval]);

  return (
    <div id={containerId} style={{ height: '600px', width: '100%' }} />
  );
};

const TOP_CRYPTOS = [
  'BTC-USD',
  'ETH-USD',
  'SOL-USD',
  'XRP-USD',
  'DOGE-USD',
  'ADA-USD',
  'AVAX-USD',
  'MATIC-USD',
  'DOT-USD',
  'LINK-USD'
];

const TIMEFRAMES = [
  { label: '1m', value: '1' },
  { label: '5m', value: '5' },
  { label: '15m', value: '15' },
  { label: '1h', value: '60' },
  { label: '4h', value: '240' },
  { label: '1D', value: 'D' },
  { label: '1W', value: 'W' }
];

const CryptoChartViewer: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('60');
  const [patternAlerts, setPatternAlerts] = useState<PatternAlert[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [lastScanTime, setLastScanTime] = useState<Date | null>(null);
  const [scanProgress, setScanProgress] = useState({
    hourly: false,
    sixHour: false,
    daily: false
  });

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp * 1000).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const scanPatterns = async () => {
    setIsScanning(true);
    setScanProgress({ hourly: false, sixHour: false, daily: false });
    const alerts: PatternAlert[] = [];

    for (const symbol of TOP_CRYPTOS) {
      const patterns = await analyzePatterns(symbol);
      alerts.push({ symbol, ...patterns });
      
      setScanProgress(prev => ({
        hourly: true,
        sixHour: true,
        daily: true
      }));
    }

    setPatternAlerts(alerts);
    setLastScanTime(new Date());
    setIsScanning(false);
  };

  useEffect(() => {
    scanPatterns();
  }, []);

  const getPatternName = (pattern: string): string => {
    switch (pattern) {
      case 'ascending_triangle':
        return 'Ascending Triangle';
      case 'cup_and_handle':
        return 'Cup and Handle';
      default:
        return pattern;
    }
  };

  const renderPatternDetails = (pattern: PatternResult): ReactElement => (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-green-400">•</span>
      <span className="text-gray-300">{getPatternName(pattern.pattern)}</span>
      <span className="text-gray-500">|</span>
      <span className="text-blue-400">{pattern.confidence}% confidence</span>
      <span className="text-gray-500">|</span>
      <span className="text-gray-400">{pattern.details}</span>
    </div>
  );

  const renderTimeframeSection = (title: string, isScanned: boolean, timeframeKey: keyof Omit<PatternAlert, 'symbol' | 'timeframes'>): ReactElement => {
    const matchingCoins = patternAlerts.filter(alert => alert[timeframeKey].length > 0);
    const timeframeInfo = patternAlerts[0]?.timeframes?.[timeframeKey];

    return (
      <div className="flex-1 p-6 bg-[#1A1A1A] rounded-xl border border-gray-800/50 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-blue-500"></div>
            <h3 className="text-lg font-medium text-gray-200">{title}</h3>
          </div>
          {timeframeInfo && isScanned && (
            <div className="text-xs text-gray-500">
              {formatDate(timeframeInfo.startTime)} - {formatDate(timeframeInfo.endTime)}
            </div>
          )}
        </div>
        {isScanned ? (
          matchingCoins.length > 0 ? (
            <div className="space-y-3">
              {matchingCoins.map(alert => (
                <div key={alert.symbol} className="p-3 bg-[#252525] rounded-lg border border-gray-800/50">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-blue-500/10 text-blue-400 rounded text-sm font-medium">
                      {alert.symbol}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {alert[timeframeKey].map((pattern: PatternResult, idx: number) => (
                      <div key={idx} className="text-sm">
                        {renderPatternDetails(pattern)}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-gray-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>No patterns detected</span>
            </div>
          )
        ) : (
          <div className="flex items-center gap-2 text-gray-500">
            <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Scanning...</span>
          </div>
        )}
      </div>
    );
  };

  const filteredPairs = TOP_CRYPTOS.filter(pair => 
    pair.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-[2400px] mx-auto p-4 bg-[#121212] min-h-screen">
      {/* Pattern Alerts Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-100">Pattern Alerts</h2>
            {lastScanTime && (
              <p className="text-sm text-gray-500 mt-1">
                Last scan: {lastScanTime.toLocaleString()}
              </p>
            )}
          </div>
          <button
            onClick={scanPatterns}
            disabled={isScanning}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:hover:bg-blue-500 flex items-center gap-2"
          >
            {isScanning ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Scanning...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span>Scan Now</span>
              </>
            )}
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {renderTimeframeSection('Daily Timeframe', scanProgress.daily, 'daily')}
          {renderTimeframeSection('6 Hour Timeframe', scanProgress.sixHour, 'sixHour')}
          {renderTimeframeSection('1 Hour Timeframe', scanProgress.hourly, 'hourly')}
        </div>
      </div>

      {/* Charts Controls */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4 text-gray-100">Live Crypto Charts</h1>
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="relative flex-1 max-w-sm">
            <input
              type="text"
              placeholder="Search trading pairs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-700 rounded-lg bg-[#1e1e1e] text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
            />
            <svg className="w-5 h-5 absolute left-3 top-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-300 font-medium">Timeframe:</span>
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="p-3 border border-gray-700 rounded-lg bg-[#1e1e1e] text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {TIMEFRAMES.map(tf => (
                <option key={tf.value} value={tf.value}>
                  {tf.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {/* Charts Grid */}
      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {filteredPairs.map(pair => (
          <div key={pair} className="border border-gray-800 rounded-lg p-4 bg-[#1e1e1e]">
            <div className="flex justify-between items-center mb-3">
              <div>
                <h2 className="text-xl font-bold text-gray-100">{pair}</h2>
              </div>
              <a
                href={`https://www.coinbase.com/price/${pair.split('-')[0].toLowerCase()}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors text-sm font-medium"
              >
                View on Coinbase
              </a>
            </div>
            <div className="rounded-lg overflow-hidden border border-gray-800">
              <TradingViewChart 
                symbol={pair.replace('-', '')} 
                containerId={`tv_chart_${pair}`}
                interval={selectedTimeframe}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CryptoChartViewer;
