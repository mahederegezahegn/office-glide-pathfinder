
import { useState } from 'react';
import NavigationView from '../components/NavigationView';
import Sidebar from '../components/Sidebar';
import SearchOverlay from '../components/SearchOverlay';
import { BuildingData, Location } from '../types/navigation';
import { buildingData } from '../data/buildingData';

const Index = () => {
  const [is3DMode, setIs3DMode] = useState<boolean>(false);
  const [selectedFloor, setSelectedFloor] = useState<number>(1);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [showSearch, setShowSearch] = useState<boolean>(false);
  
  // Assuming kiosk is located at the main entrance on floor 1
  const kioskLocation: Location = {
    id: 'kiosk',
    name: 'You Are Here',
    type: 'kiosk',
    floor: 1,
    position: { x: 50, y: 80 },
  };
  
  const handleSearch = () => {
    setShowSearch(true);
  };
  
  const handleCloseSearch = () => {
    setShowSearch(false);
  };
  
  const handleSelectLocation = (location: Location) => {
    setSelectedLocation(location);
    setSelectedFloor(location.floor);
    setShowSearch(false);
  };
  
  const handleToggleView = () => {
    setIs3DMode(!is3DMode);
  };
  
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white">
      <Sidebar 
        onSearch={handleSearch}
        onToggleView={handleToggleView} 
        is3DMode={is3DMode}
        selectedFloor={selectedFloor}
        onFloorChange={setSelectedFloor}
        buildingData={buildingData} 
      />
      
      <main className="flex-1 relative">
        <NavigationView
          is3DMode={is3DMode}
          selectedFloor={selectedFloor}
          kioskLocation={kioskLocation}
          selectedLocation={selectedLocation}
          buildingData={buildingData}
        />
      </main>
      
      {showSearch && (
        <SearchOverlay
          buildingData={buildingData}
          onClose={handleCloseSearch}
          onSelectLocation={handleSelectLocation}
        />
      )}
    </div>
  );
};

export default Index;
