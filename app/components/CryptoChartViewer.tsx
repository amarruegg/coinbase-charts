import React, { useState, useEffect, useRef } from 'react';

declare global {
  interface Window {
    TradingView: any;
  }
}

interface TradingViewChartProps {
  symbol: string;
  containerId: string;
}

const TradingViewChart: React.FC<TradingViewChartProps> = ({ symbol, containerId }) => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => {
      if (window.TradingView) {
        new window.TradingView.widget({
          autosize: true,
          symbol: `COINBASE:${symbol}`,
          interval: '1',
          timezone: 'Etc/UTC',
          theme: 'light',
          style: '1',
          locale: 'en',
          toolbar_bg: '#f1f3f6',
          enable_publishing: false,
          hide_side_toolbar: false,
          allow_symbol_change: false,
          container_id: containerId,
          studies: [
            'MASimple@tv-basicstudies',
            'RSI@tv-basicstudies'
          ],
          save_image: true,
          show_popup_button: true,
          popup_width: '1000',
          popup_height: '650'
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
  }, [symbol, containerId]);

  return (
    <div id={containerId} className="h-[600px]" />
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

const CryptoChartViewer: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredPairs = TOP_CRYPTOS.filter(pair => 
    pair.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-[1800px] mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-4">Live Crypto Charts</h1>
        <input
          type="text"
          placeholder="Search trading pairs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-sm p-2 border border-gray-300 rounded shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      
      <div className="grid gap-6 lg:grid-cols-2">
        {filteredPairs.map(pair => (
          <div key={pair} className="border rounded-lg p-4 bg-white shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">{pair}</h2>
              <a
                href={`https://www.coinbase.com/price/${pair.split('-')[0].toLowerCase()}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-700 font-medium"
              >
                View on Coinbase
              </a>
            </div>
            <TradingViewChart 
              symbol={pair.replace('-', '')} 
              containerId={`tv_chart_${pair}`}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default CryptoChartViewer;
