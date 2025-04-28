
import { useState, useEffect } from 'react';
import { BuildingData, Location } from '../types/navigation';
import Map2D from './Map2D';
import Map3D from './Map3D';
import PathFinding from '../utils/pathFinding';

interface NavigationViewProps {
  is3DMode: boolean;
  selectedFloor: number;
  kioskLocation: Location;
  selectedLocation: Location | null;
  buildingData: BuildingData;
}

const NavigationView = ({
  is3DMode,
  selectedFloor,
  kioskLocation,
  selectedLocation,
  buildingData
}: NavigationViewProps) => {
  const [path, setPath] = useState<string[]>([]);
  const [isPathAnimating, setIsPathAnimating] = useState<boolean>(false);
  
  // When selected location changes, calculate the path
  useEffect(() => {
    if (!selectedLocation) {
      setPath([]);
      return;
    }
    
    // Create path finder instance
    const pathFinder = new PathFinding(buildingData);
    
    // Calculate path from kiosk to selected location
    const calculatedPath = pathFinder.findPath(kioskLocation, selectedLocation);
    
    // Reset path first
    setPath([]);
    setIsPathAnimating(false);
    
    // Animate path after a short delay
    const timer = setTimeout(() => {
      setPath(calculatedPath);
      setIsPathAnimating(true);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [selectedLocation, kioskLocation, buildingData]);
  
  return (
    <div className="w-full h-full relative">
      {is3DMode ? (
        <Map3D
          selectedFloor={selectedFloor}
          buildingData={buildingData}
          path={path}
          isPathAnimating={isPathAnimating}
          startLocation={kioskLocation}
          endLocation={selectedLocation}
        />
      ) : (
        <Map2D
          selectedFloor={selectedFloor}
          buildingData={buildingData}
          path={path}
          isPathAnimating={isPathAnimating}
          startLocation={kioskLocation}
          endLocation={selectedLocation}
        />
      )}
    </div>
  );
};

export default NavigationView;
