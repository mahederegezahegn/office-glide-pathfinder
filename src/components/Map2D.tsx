
import { useState, useRef, useEffect } from 'react';
import { BuildingData, Location, PathNode } from '../types/navigation';
import { cn } from '@/lib/utils';

interface Map2DProps {
  selectedFloor: number;
  buildingData: BuildingData;
  path: string[];
  isPathAnimating: boolean;
  startLocation: Location;
  endLocation: Location | null;
}

const Map2D = ({
  selectedFloor,
  buildingData,
  path,
  isPathAnimating,
  startLocation,
  endLocation
}: Map2DProps) => {
  // State for pan and zoom
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const svgRef = useRef<SVGSVGElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  
  // Get current floor data
  const floorData = buildingData.floors.find(floor => floor.floor === selectedFloor);
  
  // Get path nodes for the current floor
  const floorPathNodes = floorData ? floorData.pathNodes : [];
  
  // Filter path nodes to only include those on the current floor and in our path
  const pathNodesOnFloor = path.filter(nodeId => {
    const node = floorPathNodes.find(n => n.id === nodeId);
    return node && node.floor === selectedFloor;
  });
  
  // Get connections between nodes for drawing paths
  const getConnections = () => {
    const connections: { start: PathNode; end: PathNode }[] = [];
    
    // Only process if we have at least 2 nodes in the path on this floor
    if (pathNodesOnFloor.length > 1) {
      for (let i = 0; i < pathNodesOnFloor.length - 1; i++) {
        const startNodeId = pathNodesOnFloor[i];
        const endNodeId = pathNodesOnFloor[i + 1];
        
        const startNode = floorPathNodes.find(node => node.id === startNodeId);
        const endNode = floorPathNodes.find(node => node.id === endNodeId);
        
        if (startNode && endNode) {
          connections.push({ start: startNode, end: endNode });
        }
      }
    }
    
    return connections;
  };
  
  const connections = getConnections();
  
  // Handle mouse/touch events for panning
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };
  
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };
  
  const handlePointerUp = () => {
    setIsDragging(false);
  };
  
  // Handle wheel events for zooming
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const delta = -e.deltaY || 0;
    const newScale = Math.max(0.5, Math.min(3, scale + delta / 500));
    setScale(newScale);
  };
  
  // Reset view when floor changes
  useEffect(() => {
    setPosition({ x: 0, y: 0 });
    setScale(1);
  }, [selectedFloor]);
  
  return (
    <div className="w-full h-full overflow-hidden bg-gray-100" ref={mapContainerRef}>
      <div
        className={cn(
          "w-full h-full relative",
          isDragging ? "cursor-grabbing" : "cursor-grab"
        )}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onWheel={handleWheel}
        style={{ touchAction: 'none' }}
      >
        <svg
          ref={svgRef}
          width={floorData?.width || 800}
          height={floorData?.height || 600}
          viewBox={`0 0 ${floorData?.width || 800} ${floorData?.height || 600}`}
          className="absolute left-1/2 top-1/2"
          style={{
            transform: `translate(-50%, -50%) translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transition: isDragging ? 'none' : 'transform 0.3s ease',
          }}
        >
          {/* Background */}
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="#f8fafc"
            stroke="#e2e8f0"
            strokeWidth="2"
          />
          
          {/* Path lines */}
          {connections.map((connection, index) => (
            <line
              key={`path-${index}`}
              x1={connection.start.position.x}
              y1={connection.start.position.y}
              x2={connection.end.position.x}
              y2={connection.end.position.y}
              stroke="#8b5cf6"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray="10"
              strokeDashoffset={isPathAnimating ? "100" : "0"}
              className={isPathAnimating ? "animate-dash" : ""}
              style={{
                animation: isPathAnimating
                  ? 'dash 1.5s linear infinite'
                  : 'none',
              }}
            />
          ))}
          
          {/* Transition points (elevators, stairs) */}
          {floorPathNodes
            .filter(node => node.isTransition && path.includes(node.id))
            .map(node => (
              <g key={`transition-${node.id}`}>
                <circle
                  cx={node.position.x}
                  cy={node.position.y}
                  r="15"
                  fill="#fef3c7"
                  stroke="#f59e0b"
                  strokeWidth="2"
                />
                <text
                  x={node.position.x}
                  y={node.position.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="12"
                  fontWeight="bold"
                  fill="#92400e"
                >
                  {node.id.includes('elevator') ? 'E' : 'S'}
                </text>
              </g>
            ))}
          
          {/* Locations on this floor */}
          {floorData?.locations.map((location) => {
            const isStart = startLocation.id === location.id;
            const isEnd = endLocation?.id === location.id;
            const isHighlighted = isStart || isEnd;
            
            return (
              <g key={location.id} className={isHighlighted ? "animate-pulse" : ""}>
                <circle
                  cx={location.position.x}
                  cy={location.position.y}
                  r={isHighlighted ? "15" : "10"}
                  fill={isStart ? "#22c55e" : isEnd ? "#ef4444" : getLocationColor(location.type)}
                  stroke={isHighlighted ? "#000000" : getLocationBorderColor(location.type)}
                  strokeWidth={isHighlighted ? "3" : "2"}
                />
                {isHighlighted && (
                  <circle
                    cx={location.position.x}
                    cy={location.position.y}
                    r="20"
                    fill="none"
                    stroke={isStart ? "#22c55e" : "#ef4444"}
                    strokeWidth="2"
                    opacity="0.6"
                    className="animate-ping"
                    style={{ animationDuration: '2s' }}
                  />
                )}
                <text
                  x={location.position.x}
                  y={location.position.y + 25}
                  textAnchor="middle"
                  fontSize="12"
                  fontWeight="bold"
                  fill="#4b5563"
                >
                  {location.name}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

// Helper function to get color for location type
const getLocationColor = (type: string): string => {
  switch (type) {
    case 'room': return '#dbeafe';
    case 'office': return '#dcfce7';
    case 'meeting': return '#f3e8ff';
    case 'restroom': return '#dbeafe';
    case 'elevator': return '#fef3c7';
    case 'stairs': return '#ffedd5';
    case 'exit': return '#fee2e2';
    case 'kiosk': return '#22c55e';
    case 'accessible': return '#e0f2fe';
    default: return '#f1f5f9';
  }
};

const getLocationBorderColor = (type: string): string => {
  switch (type) {
    case 'room': return '#3b82f6';
    case 'office': return '#16a34a';
    case 'meeting': return '#a855f7';
    case 'restroom': return '#2563eb';
    case 'elevator': return '#f59e0b';
    case 'stairs': return '#ea580c';
    case 'exit': return '#dc2626';
    case 'kiosk': return '#15803d';
    case 'accessible': return '#0ea5e9';
    default: return '#94a3b8';
  }
};

export default Map2D;
