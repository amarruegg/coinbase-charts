import React from 'react';

interface StaticChartProps {
  symbol: string;
  onViewLive: () => void;
}

const StaticChart: React.FC<StaticChartProps> = ({ symbol, onViewLive }) => {
  // Use TradingView's mini chart widget
  const widgetHtml = `
    <div class="tradingview-widget-container">
      <div class="tradingview-widget-container__widget"></div>
      <script type="text/javascript" src="https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js" async>
      {
        "symbol": "COINBASE:${symbol}",
        "width": "100%",
        "height": "400",
        "locale": "en",
        "dateRange": "12M",
        "colorTheme": "dark",
        "trendLineColor": "rgba(41, 98, 255, 1)",
        "underLineColor": "rgba(41, 98, 255, 0.3)",
        "underLineBottomColor": "rgba(41, 98, 255, 0)",
        "isTransparent": true,
        "autosize": true,
        "largeChartUrl": ""
      }
      </script>
    </div>
  `;

  return (
    <div className="relative group">
      <div 
        className="w-full h-[400px] bg-[#1e1e1e] rounded-lg overflow-hidden"
        dangerouslySetInnerHTML={{ __html: widgetHtml }}
      />
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <button
          onClick={onViewLive}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <span>View Live Chart</span>
        </button>
      </div>
    </div>
  );
};

export default StaticChart;
