import React, { useState } from 'react';
import { Search, MapPin, Compass } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  onLocateMe: () => void;
  isLoading: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, onLocateMe, isLoading }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto relative z-50">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative flex items-center bg-black/80 backdrop-blur-xl rounded-full border border-white/10 shadow-2xl">
            <Search className="w-5 h-5 text-gray-400 ml-4" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter city, landmark, or coords..."
              className="w-full bg-transparent border-none focus:ring-0 text-white px-4 py-3 placeholder-gray-500"
              disabled={isLoading}
            />
            <div className="pr-2 flex gap-1">
              <button
                type="button"
                onClick={onLocateMe}
                className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-blue-400 transition-colors"
                title="Use my location"
                disabled={isLoading}
              >
                <Compass className="w-5 h-5" />
              </button>
              <button
                type="submit"
                className="p-2 bg-blue-600 hover:bg-blue-500 rounded-full text-white transition-colors disabled:opacity-50"
                disabled={isLoading || !query.trim()}
              >
                {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <MapPin className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SearchBar;
