import React, { useState, useEffect, useRef } from 'react';

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

const TradingViewChart: React.FC<TradingViewChartProps> = ({ symbol, containerId, interval }) => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.type = 'text/javascript';
    script.async = true;

    const config = {
      "autosize": true,
      "symbol": `COINBASE:${symbol}`,
      "interval": interval,
      "timezone": "Etc/UTC",
      "theme": "light",
      "style": "1",
      "locale": "en",
      "toolbar_bg": "#f1f3f6",
      "enable_publishing": false,
      "withdateranges": true,
      "hide_side_toolbar": true,
      "allow_symbol_change": false,
      "details": true,
      "hotlist": false,
      "calendar": false,
      "show_popup_button": true,
      "popup_width": "1000",
      "popup_height": "650",
      "width": "100%",
      "height": "100%",
      "studies": [
        "Volume@tv-basicstudies",
        "MASimple@tv-basicstudies",
        "RSI@tv-basicstudies"
      ],
      "container_id": containerId,
      "hide_top_toolbar": false,
      "hide_legend": false,
      "save_image": true,
      "hide_volume": false,
      "support_host": "https://www.tradingview.com",
      "enabled_features": [
        "study_templates",
        "use_localstorage_for_settings",
        "timeframes_toolbar",
        "volume_force_overlay"
      ],
      "disabled_features": [
        "header_symbol_search",
        "header_compare",
        "header_settings",
        "left_toolbar",
        "widget_logo"
      ],
      "overrides": {
        "mainSeriesProperties.candleStyle.upColor": "#26a69a",
        "mainSeriesProperties.candleStyle.downColor": "#ef5350",
        "mainSeriesProperties.candleStyle.wickUpColor": "#26a69a",
        "mainSeriesProperties.candleStyle.wickDownColor": "#ef5350"
      }
    };

    script.innerHTML = JSON.stringify(config);
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = '';
      container.appendChild(script);
    }

    return () => {
      if (container) {
        container.innerHTML = '';
      }
    };
  }, [symbol, containerId, interval]);

  return (
    <div id={containerId} className="h-[600px] w-full" />
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
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('60'); // Default to 1h

  const filteredPairs = TOP_CRYPTOS.filter(pair => 
    pair.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-[1800px] mx-auto p-4 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4 text-gray-800">Live Crypto Charts</h1>
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <input
            type="text"
            placeholder="Search trading pairs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-sm p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          />
          <div className="flex items-center gap-2">
            <span className="text-gray-700 font-medium">Timeframe:</span>
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
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
      
      <div className="grid gap-8 xl:grid-cols-2">
        {filteredPairs.map(pair => (
          <div key={pair} className="border rounded-xl p-6 bg-white shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{pair}</h2>
                <p className="text-sm text-gray-500 mt-1">TradingView Advanced Chart</p>
              </div>
              <a
                href={`https://www.coinbase.com/price/${pair.split('-')[0].toLowerCase()}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium"
              >
                View on Coinbase
              </a>
            </div>
            <div className="rounded-lg overflow-hidden border border-gray-100">
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
