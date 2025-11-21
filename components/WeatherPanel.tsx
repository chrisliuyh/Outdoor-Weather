import React from 'react';
import { 
  Cloud, 
  CloudRain, 
  Sun, 
  Wind, 
  Eye, 
  Star, 
  Thermometer,
  ExternalLink,
  Navigation,
  Loader2,
  Mountain,
  ArrowUp,
  ArrowDown,
  Calendar
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { WeatherState, WeatherMetrics } from '../types';

interface WeatherPanelProps {
  data: WeatherState;
}

const MetricCard: React.FC<{ 
  icon: React.ReactNode; 
  label: string; 
  value: string | number; 
  unit?: string;
  color?: string;
  subValue?: string;
}> = ({ icon, label, value, unit, color = "text-blue-400", subValue }) => (
  <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 flex flex-col items-center justify-center border border-white/10 shadow-lg relative overflow-hidden group">
    <div className={`mb-2 ${color} relative z-10`}>{icon}</div>
    <div className="text-[10px] text-gray-400 uppercase tracking-wider relative z-10">{label}</div>
    <div className="text-lg font-bold text-white relative z-10">
      {value}<span className="text-sm font-normal text-gray-400 ml-1">{unit}</span>
    </div>
    {subValue && <div className="text-xs text-gray-500 relative z-10 mt-1">{subValue}</div>}
    <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
  </div>
);

const WeatherPanel: React.FC<WeatherPanelProps> = ({ data }) => {
  const { metrics, summary, groundingLinks, isLoading, error } = data;

  if (isLoading) {
    return (
      <div className="bg-black/60 backdrop-blur-xl rounded-3xl p-8 border border-white/10 flex flex-col items-center justify-center h-full min-h-[400px] animate-pulse">
        <Loader2 className="w-12 h-12 text-blue-400 animate-spin mb-4" />
        <p className="text-blue-200">Analyzing Atmosphere...</p>
        <p className="text-xs text-gray-500 mt-2">Retrieving Elevation & Cloud Data</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/40 backdrop-blur-xl rounded-3xl p-8 border border-red-500/30 flex flex-col items-center text-center">
        <div className="text-red-400 mb-2 text-xl">Signal Interrupted</div>
        <p className="text-gray-300">{error}</p>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="bg-black/40 backdrop-blur-md rounded-3xl p-8 border border-white/5 text-center">
        <Navigation className="w-12 h-12 text-gray-500 mx-auto mb-4" />
        <p className="text-gray-300">Enter coordinates or select a location to view outdoor weather metrics.</p>
      </div>
    );
  }

  // Prepare chart data for a visual "Feel"
  const chartData = [
    { name: 'Cloud', value: metrics.cloudCover, color: '#93C5FD' },
    { name: 'Rain', value: metrics.rainfall * 10, color: '#60A5FA' }, 
    { name: 'Wind', value: metrics.windSpeed, color: '#34D399' },
    { name: 'Stars', value: metrics.starVisibilityScore * 10, color: '#FCD34D' },
  ];

  return (
    <div className="flex flex-col gap-4 h-full overflow-y-auto pr-2 pb-20 md:pb-4">
      
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900/90 to-black/90 backdrop-blur-xl rounded-3xl p-6 border border-white/10 shadow-2xl">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-1 truncate max-w-[200px] md:max-w-none">{metrics.locationName}</h2>
            <div className="text-blue-300 flex flex-col gap-1">
              <CoordinatesBadge lat={metrics.latitude} lng={metrics.longitude} />
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <Mountain size={12} />
                <span>{metrics.elevation}m Elevation</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-5xl font-light text-white">{metrics.temperature}°</div>
            <div className="text-sm text-gray-400 font-medium">{metrics.description}</div>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-3 gap-2 md:gap-3">
        <MetricCard 
          icon={<Cloud size={18} />} 
          label="Cloud Cover" 
          value={metrics.cloudCover} 
          unit="%" 
        />
        <MetricCard 
          icon={<Thermometer size={18} />} 
          label="Cloud Base" 
          value={metrics.cloudCeiling || "N/A"} 
          unit="" 
          color="text-gray-300"
        />
        <MetricCard 
          icon={<Star size={18} />} 
          label="Star Vis." 
          value={metrics.starVisibilityScore} 
          unit="/10" 
          color="text-yellow-400"
        />
        <MetricCard 
          icon={<Wind size={18} />} 
          label="Wind" 
          value={metrics.windSpeed} 
          unit="kph" 
        />
        <MetricCard 
          icon={<Eye size={18} />} 
          label="Visibility" 
          value={metrics.visibility} 
          unit="km" 
        />
        <MetricCard 
          icon={<CloudRain size={18} />} 
          label="Rainfall" 
          value={metrics.rainfall} 
          unit="mm" 
          color="text-blue-400"
        />
      </div>

      {/* Forecast Section */}
      {metrics.forecast && metrics.forecast.length > 0 && (
        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/5">
           <div className="flex items-center gap-2 mb-3">
             <Calendar size={14} className="text-blue-400"/>
             <p className="text-xs text-gray-300 uppercase tracking-widest font-semibold">3-Day Forecast</p>
           </div>
           <div className="grid gap-2">
             {metrics.forecast.map((day, idx) => (
               <div key={idx} className="flex items-center justify-between bg-black/20 rounded-lg p-3 hover:bg-white/5 transition-colors">
                 <div className="w-16">
                   <div className="text-sm font-bold text-white">{day.day}</div>
                   <div className="text-[10px] text-gray-500">{day.date}</div>
                 </div>
                 <div className="flex-1 px-4">
                   <div className="text-sm text-gray-300 flex items-center gap-2">
                      {day.condition}
                      {day.rainChance > 30 && <div className="flex items-center text-blue-400 text-xs gap-0.5"><CloudRain size={10}/> {day.rainChance}%</div>}
                   </div>
                 </div>
                 <div className="flex items-center gap-3 text-sm">
                   <span className="text-red-300 flex items-center"><ArrowUp size={10} className="mr-0.5"/>{day.maxTemp}°</span>
                   <span className="text-blue-300 flex items-center"><ArrowDown size={10} className="mr-0.5"/>{day.minTemp}°</span>
                 </div>
               </div>
             ))}
           </div>
        </div>
      )}

      {/* AI Summary */}
      <div className="bg-blue-950/30 backdrop-blur-md rounded-2xl p-5 border border-blue-500/10">
        <h3 className="text-sm font-semibold text-blue-200 mb-2 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
          Outdoor Analysis
        </h3>
        <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
          {summary}
        </p>
      </div>

      {/* Grounding Sources */}
      {groundingLinks.length > 0 && (
        <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-white/5 mb-4">
          <h4 className="text-xs text-gray-500 uppercase mb-2">Verified Sources</h4>
          <div className="flex flex-wrap gap-2">
            {groundingLinks.map((link, i) => (
              <a 
                key={i} 
                href={link.uri} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 bg-blue-900/30 px-2 py-1 rounded-full transition-colors truncate max-w-full"
              >
                {link.title} <ExternalLink size={10} />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const CoordinatesBadge: React.FC<{lat: number, lng: number}> = ({ lat, lng }) => (
  <span className="font-mono text-xs bg-black/30 px-2 py-1 rounded text-gray-400 border border-white/5">
    {lat.toFixed(3)}° N, {lng.toFixed(3)}° E
  </span>
);

export default WeatherPanel;