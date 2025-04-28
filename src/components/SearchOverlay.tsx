
import { useState } from 'react';
import { BuildingData, Location } from '../types/navigation';
import { Input } from '@/components/ui/input';
import { X, Search, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SearchOverlayProps {
  buildingData: BuildingData;
  onClose: () => void;
  onSelectLocation: (location: Location) => void;
}

const SearchOverlay = ({ buildingData, onClose, onSelectLocation }: SearchOverlayProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Get all locations from all floors
  const allLocations = buildingData.floors.flatMap(floor => floor.locations);
  
  const filteredLocations = searchTerm === '' 
    ? allLocations
    : allLocations.filter(location => 
        location.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        location.type.toLowerCase().includes(searchTerm.toLowerCase())
      );
  
  // Group locations by floor
  const locationsByFloor = filteredLocations.reduce((acc, location) => {
    const floorIndex = location.floor;
    if (!acc[floorIndex]) {
      acc[floorIndex] = [];
    }
    acc[floorIndex].push(location);
    return acc;
  }, {} as Record<number, Location[]>);
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md flex flex-col max-h-[80vh]">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-xl font-bold">Find a Location</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search for a room, office, or facility"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        
        <div className="overflow-y-auto flex-grow p-2">
          {Object.keys(locationsByFloor).length > 0 ? (
            Object.entries(locationsByFloor)
              .sort(([floorA], [floorB]) => parseInt(floorA) - parseInt(floorB))
              .map(([floor, locations]) => (
                <div key={floor} className="mb-4">
                  <h3 className="text-sm font-medium px-2 py-1 bg-muted/50 rounded mb-1">
                    {buildingData.floors.find(f => f.floor === parseInt(floor))?.name || `Floor ${floor}`}
                  </h3>
                  <div className="space-y-1">
                    {locations.map((location) => (
                      <button
                        key={location.id}
                        onClick={() => onSelectLocation(location)}
                        className="w-full text-left p-2 rounded hover:bg-accent flex items-center"
                      >
                        <LocationIcon type={location.type} />
                        <div className="ml-2">
                          <p className="font-medium">{location.name}</p>
                          <p className="text-xs text-muted-foreground capitalize">{location.type}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))
          ) : (
            <div className="p-4 text-center text-muted-foreground">
              No locations found matching "{searchTerm}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper component for location icons
const LocationIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'restroom':
      return <div className="h-6 w-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">R</div>;
    case 'office':
      return <div className="h-6 w-6 bg-green-100 rounded-full flex items-center justify-center text-green-600">O</div>;
    case 'meeting':
      return <div className="h-6 w-6 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">M</div>;
    case 'elevator':
      return <div className="h-6 w-6 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600">E</div>;
    case 'stairs':
      return <div className="h-6 w-6 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">S</div>;
    case 'exit':
      return <div className="h-6 w-6 bg-red-100 rounded-full flex items-center justify-center text-red-600">X</div>;
    case 'accessible':
      return <div className="h-6 w-6 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">A</div>;
    default:
      return <MapPin className="h-5 w-5 text-gray-500" />;
  }
};

export default SearchOverlay;
