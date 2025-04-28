
export interface Position {
  x: number;
  y: number;
  z?: number;
}

export type LocationType = 'room' | 'office' | 'meeting' | 'restroom' | 'elevator' | 'stairs' | 'exit' | 'kiosk' | 'accessible';

export interface Location {
  id: string;
  name: string;
  type: LocationType;
  floor: number;
  position: Position;
  description?: string;
}

export interface PathNode {
  id: string;
  position: Position;
  connections: string[];
  floor: number;
  isTransition?: boolean;
  transitionTo?: string;
}

export interface FloorPlan {
  floor: number;
  name: string;
  width: number;
  height: number;
  backgroundImage?: string;
  locations: Location[];
  pathNodes: PathNode[];
}

export interface BuildingData {
  name: string;
  floors: FloorPlan[];
}
