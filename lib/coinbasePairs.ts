interface Product {
  id: string;
  base_currency: string;
  quote_currency: string;
  status: string;
}

export const fetchTradingPairs = async (): Promise<string[]> => {
  try {
    const response = await fetch('https://api.exchange.coinbase.com/products');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const products: Product[] = await response.json();
    
    // Filter for active USD pairs
    const usdPairs = products
      .filter(product => 
        product.quote_currency === 'USD' && 
        product.status === 'online'
      )
      .map(product => `${product.base_currency}-${product.quote_currency}`);

    return usdPairs;
  } catch (error) {
    console.error('Error fetching trading pairs:', error);
    return [];
  }
};
