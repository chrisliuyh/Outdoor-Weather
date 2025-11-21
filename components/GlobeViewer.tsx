import React, { useEffect, useRef, useState } from 'react';
import Globe, { GlobeMethods } from 'react-globe.gl';
import { Coordinates } from '../types';

interface GlobeViewerProps {
  selectedLocation: Coordinates | null;
  onLocationClick: (coords: Coordinates) => void;
}

const GlobeViewer: React.FC<GlobeViewerProps> = ({ selectedLocation, onLocationClick }) => {
  const globeEl = useRef<GlobeMethods | undefined>(undefined);
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [points, setPoints] = useState<Array<{lat: number, lng: number, size: number, color: string}>>([]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Update globe position when location changes
  useEffect(() => {
    if (selectedLocation && globeEl.current) {
      globeEl.current.pointOfView({
        lat: selectedLocation.lat,
        lng: selectedLocation.lng,
        altitude: 1.5 // Zoom level
      }, 1000); // Animation duration

      setPoints([{
        lat: selectedLocation.lat,
        lng: selectedLocation.lng,
        size: 0.5,
        color: '#FCD34D' // Amber-300
      }]);
    }
  }, [selectedLocation]);

  return (
    <div className="cursor-move">
      <Globe
        ref={globeEl}
        width={dimensions.width}
        height={dimensions.height}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        
        atmosphereColor="#3a228a"
        atmosphereAltitude={0.15}
        
        pointsData={points}
        pointAltitude={0.1}
        pointColor="color"
        pointRadius="size"
        pulsePoints={true}
        
        onGlobeClick={(d) => {
          if (d) {
            onLocationClick({ lat: d.lat, lng: d.lng });
          }
        }}
        
        // Initial POV
        onGlobeReady={() => {
            if (globeEl.current) {
                globeEl.current.controls().autoRotate = true;
                globeEl.current.controls().autoRotateSpeed = 0.5;
            }
        }}
      />
    </div>
  );
};

export default GlobeViewer;
