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
          "overrides": {
            "mainSeriesProperties.candleStyle.upColor": "#26a69a",
            "mainSeriesProperties.candleStyle.downColor": "#ef5350",
            "mainSeriesProperties.candleStyle.wickUpColor": "#26a69a",
            "mainSeriesProperties.candleStyle.wickDownColor": "#ef5350",
            "paneProperties.background": "#1e1e1e",
            "paneProperties.vertGridProperties.color": "#2a2a2a",
            "paneProperties.horzGridProperties.color": "#2a2a2a",
            "scalesProperties.textColor": "#999999"
          }
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

  const filteredPairs = TOP_CRYPTOS.filter(pair => 
    pair.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-[2400px] mx-auto p-4 bg-[#121212] min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-4 text-gray-100">Live Crypto Charts</h1>
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <input
            type="text"
            placeholder="Search trading pairs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-sm p-3 border border-gray-700 rounded-lg bg-[#1e1e1e] text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
          />
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
                className="px-3 py-1.5 bg-blue-900/30 text-blue-400 rounded-lg hover:bg-blue-900/50 transition-colors text-sm font-medium"
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
