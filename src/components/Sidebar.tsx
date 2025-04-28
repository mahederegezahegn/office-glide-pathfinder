
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { BuildingData } from '../types/navigation';
import { MapPin, Navigation, Search, Map } from 'lucide-react';

interface SidebarProps {
  onSearch: () => void;
  onToggleView: () => void;
  is3DMode: boolean;
  selectedFloor: number;
  onFloorChange: (floor: number) => void;
  buildingData: BuildingData;
}

const Sidebar = ({ 
  onSearch, 
  onToggleView, 
  is3DMode, 
  selectedFloor, 
  onFloorChange,
  buildingData 
}: SidebarProps) => {
  return (
    <div className="w-64 bg-sidebar border-r border-sidebar-border h-full flex flex-col">
      <div className="p-4 border-b border-sidebar-border">
        <h1 className="text-2xl font-bold text-sidebar-foreground">{buildingData.name}</h1>
        <p className="text-sidebar-foreground text-sm mt-1">Indoor Navigation</p>
      </div>
      
      <div className="p-4">
        <Button 
          onClick={onSearch}
          className="w-full justify-start mb-4"
          variant="default"
        >
          <Search className="mr-2 h-4 w-4" />
          Find a Location
        </Button>

        <div className="mb-6">
          <h2 className="text-sm font-medium mb-2 text-sidebar-foreground">View Mode</h2>
          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant={!is3DMode ? "default" : "outline"} 
              onClick={() => !is3DMode ? null : onToggleView()}
              className="justify-center"
            >
              <Map className="mr-2 h-4 w-4" />
              2D
            </Button>
            <Button 
              variant={is3DMode ? "default" : "outline"} 
              onClick={() => is3DMode ? null : onToggleView()}
              className="justify-center"
            >
              <Navigation className="mr-2 h-4 w-4" />
              3D
            </Button>
          </div>
        </div>
        
        <div>
          <h2 className="text-sm font-medium mb-2 text-sidebar-foreground">Floor Selection</h2>
          <div className="space-y-2">
            {buildingData.floors.map((floor) => (
              <Button
                key={floor.floor}
                variant={selectedFloor === floor.floor ? "default" : "outline"}
                onClick={() => onFloorChange(floor.floor)}
                className="w-full justify-start"
              >
                <MapPin className="mr-2 h-4 w-4" />
                {floor.name}
              </Button>
            ))}
          </div>
        </div>
      </div>
      
      <div className="mt-auto p-4 border-t border-sidebar-border">
        <p className="text-xs text-sidebar-foreground opacity-70">
          Touch or drag to navigate the map. 
          Use pinch gestures to zoom in and out.
        </p>
      </div>
    </div>
  );
};

export default Sidebar;
