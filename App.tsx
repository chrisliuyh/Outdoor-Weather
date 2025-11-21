import React, { useState, useCallback } from 'react';
import GlobeViewer from './components/GlobeViewer';
import WeatherPanel from './components/WeatherPanel';
import SearchBar from './components/SearchBar';
import { fetchWeatherForLocation } from './services/gemini';
import { Coordinates, WeatherState } from './types';

const App: React.FC = () => {
  const [selectedLocation, setSelectedLocation] = useState<Coordinates | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherState>({
    metrics: null,
    summary: '',
    groundingLinks: [],
    isLoading: false,
    error: null
  });

  const handleFetchWeather = useCallback(async (query: string, coords?: Coordinates) => {
    setWeatherData(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const { metrics, summary, groundingLinks } = await fetchWeatherForLocation(
        query, 
        coords?.lat, 
        coords?.lng
      );
      
      setWeatherData({
        metrics,
        summary,
        groundingLinks,
        isLoading: false,
        error: null
      });

      if (metrics) {
        setSelectedLocation({ lat: metrics.latitude, lng: metrics.longitude });
      }
    } catch (err) {
      console.error(err);
      setWeatherData(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: "Could not retrieve weather data. Please check your connection or try a different location." 
      }));
    }
  }, []);

  const handleGlobeClick = (coords: Coordinates) => {
    // Format coords for display in search but send as separate args
    const query = `Lat: ${coords.lat.toFixed(4)}, Lng: ${coords.lng.toFixed(4)}`;
    handleFetchWeather(query, coords);
    setSelectedLocation(coords);
  };

  const handleSearch = (query: string) => {
    handleFetchWeather(query);
  };

  const handleLocateMe = () => {
    if (navigator.geolocation) {
      setWeatherData(prev => ({ ...prev, isLoading: true }));
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          handleFetchWeather("My Location", coords);
        },
        (error) => {
           setWeatherData(prev => ({ ...prev, isLoading: false, error: "Geolocation permission denied or unavailable." }));
        }
      );
    }
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden font-sans">
      
      {/* Background Globe */}
      <div className="absolute inset-0 z-0">
        <GlobeViewer 
          selectedLocation={selectedLocation} 
          onLocationClick={handleGlobeClick}
        />
      </div>

      {/* UI Overlay Layer */}
      <div className="absolute inset-0 z-10 pointer-events-none flex flex-col md:flex-row">
        
        {/* Top / Search Area */}
        <div className="w-full md:w-auto md:absolute md:top-6 md:left-6 md:right-auto p-4 pointer-events-auto">
          <div className="mb-6 text-center md:text-left">
            <h1 className="text-2xl font-bold text-white tracking-tight drop-shadow-lg flex items-center justify-center md:justify-start gap-2">
              <span className="text-blue-500">Astro</span>Earth
            </h1>
            <p className="text-xs text-blue-200/70 uppercase tracking-widest mt-1">Outdoor Weather Intelligence</p>
          </div>
          <SearchBar 
            onSearch={handleSearch} 
            onLocateMe={handleLocateMe}
            isLoading={weatherData.isLoading}
          />
        </div>

        {/* Side Panel for Data (Desktop: Right, Mobile: Bottom Sheet) */}
        <div className={`
          pointer-events-auto
          w-full md:w-[400px] 
          h-[60vh] md:h-[90vh] 
          fixed bottom-0 md:right-6 md:top-1/2 md:-translate-y-1/2 
          transition-transform duration-500 ease-in-out
          ${weatherData.metrics || weatherData.isLoading || weatherData.error ? 'translate-y-0 md:translate-x-0' : 'translate-y-full md:translate-y-0 md:translate-x-[120%]'}
        `}>
          <WeatherPanel data={weatherData} />
        </div>

      </div>
      
      {/* Credits / Footer */}
      <div className="absolute bottom-4 left-6 z-0 pointer-events-none opacity-50">
         <p className="text-[10px] text-gray-500">
           Powered by Gemini 2.5 Flash & Google Maps Grounding
         </p>
      </div>

    </div>
  );
};

export default App;
