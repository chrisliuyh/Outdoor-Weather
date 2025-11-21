export interface Coordinates {
  lat: number;
  lng: number;
}

export interface DailyForecast {
  day: string; // e.g., "Mon", "Tue"
  date: string; // e.g., "Oct 24"
  maxTemp: number;
  minTemp: number;
  condition: string;
  rainChance: number; // %
}

export interface WeatherMetrics {
  locationName: string;
  latitude: number;
  longitude: number;
  elevation: number; // meters
  temperature: number;
  cloudCover: number; // 0-100
  cloudCeiling?: string; // e.g. "2000m" or "High"
  windSpeed: number; // km/h
  visibility: number; // km
  rainfall: number; // mm
  isSunny: boolean;
  starVisibilityScore: number; // 1-10
  description: string;
  forecast: DailyForecast[];
}

export interface GroundingSource {
  title?: string;
  uri?: string;
}

export interface WeatherState {
  metrics: WeatherMetrics | null;
  summary: string;
  groundingLinks: GroundingSource[];
  isLoading: boolean;
  error: string | null;
}