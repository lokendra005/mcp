// Weather Types
export interface WeatherData {
    city: string;
    country: string;
    temperature: number;
    feels_like: number;
    description: string;
    humidity: number;
    wind_speed: number;
    timestamp: string;
  }
  
  export interface WeatherForecast {
    city: string;
    country: string;
    forecasts: DailyForecast[];
    timestamp: string;
  }
  
  export interface DailyForecast {
    date: string;
    min_temp: number;
    max_temp: number;
    avg_temp: number;
    description: string;
  }
  
  // Finance Types
  export interface StockQuote {
    symbol: string;
    price: number;
    change: number;
    change_percent: string;
    volume: number;
    latest_trading_day: string;
    previous_close: number;
    timestamp: string;
  }
  
  export interface CurrencyExchange {
    from_currency: string;
    from_currency_name: string;
    to_currency: string;
    to_currency_name: string;
    exchange_rate: number;
    last_refreshed: string;
    timezone: string;
    timestamp: string;
  }
  
  export interface CryptoPrice {
    symbol: string;
    name: string;
    price_usd: number;
    last_refreshed: string;
    timestamp: string;
  }
  
  // News Types
  export interface NewsHeadlines {
    country: string;
    category: string;
    total_results: number;
    articles: NewsArticle[];
    timestamp: string;
  }
  
  export interface NewsArticle {
    title: string;
    description: string;
    source: string;
    author: string | null;
    url: string;
    published_at: string;
    image_url: string | null;
  }
  
  export interface NewsSource {
    id: string;
    name: string;
    description: string;
    url: string;
    category: string;
    language: string;
    country: string;
  }
  
  // API Response Types
  export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    timestamp: string;
  }
  
  // Tool Types
  export interface ToolError {
    content: Array<{
      type: string;
      text: string;
    }>;
    isError: boolean;
  }