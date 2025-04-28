
import { useEffect, useRef, useState } from 'react';
import { BuildingData, Location } from '../types/navigation';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Html } from '@react-three/drei';
import * as THREE from 'three';

interface Map3DProps {
  selectedFloor: number;
  buildingData: BuildingData;
  path: string[];
  isPathAnimating: boolean;
  startLocation: Location;
  endLocation: Location | null;
}

// Main 3D Map Component
const Map3D = ({
  selectedFloor,
  buildingData,
  path,
  isPathAnimating,
  startLocation,
  endLocation
}: Map3DProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  return (
    <div ref={containerRef} className="w-full h-full relative">
      <Canvas shadows camera={{ position: [0, 200, 200], fov: 50 }}>
        <color attach="background" args={['#f8fafc']} />
        <ambientLight intensity={0.6} />
        <directionalLight 
          position={[50, 200, 100]} 
          intensity={0.8} 
          castShadow 
          shadow-mapSize-width={1024} 
          shadow-mapSize-height={1024}
        />
        
        <BuildingFloor 
          selectedFloor={selectedFloor} 
          buildingData={buildingData} 
          path={path} 
          isPathAnimating={isPathAnimating}
          startLocation={startLocation}
          endLocation={endLocation}
        />
        
        <gridHelper args={[500, 50, '#aaaaaa', '#eeeeee']} />
        <OrbitControls 
          enableDamping 
          dampingFactor={0.1} 
          rotateSpeed={0.5} 
          maxPolarAngle={Math.PI / 2 - 0.1} // Prevent camera from going below floor
        />
      </Canvas>
      
      <div className="absolute top-4 left-4 bg-white/80 p-2 rounded-md shadow-md">
        <p className="text-sm font-bold">
          {buildingData.floors.find(f => f.floor === selectedFloor)?.name || `Floor ${selectedFloor}`}
        </p>
      </div>
    </div>
  );
};

// Floor Component
interface BuildingFloorProps {
  selectedFloor: number;
  buildingData: BuildingData;
  path: string[];
  isPathAnimating: boolean;
  startLocation: Location;
  endLocation: Location | null;
}

const BuildingFloor = ({ 
  selectedFloor, 
  buildingData, 
  path, 
  isPathAnimating,
  startLocation,
  endLocation 
}: BuildingFloorProps) => {
  const { scene } = useThree();
  const pathRef = useRef<THREE.Group>(new THREE.Group());
  const locationRef = useRef<THREE.Group>(new THREE.Group());
  const [pathAnimation, setPathAnimation] = useState(0);
  
  // Get current floor data
  const floorData = buildingData.floors.find(floor => floor.floor === selectedFloor);
  
  // Animation effect for path
  useEffect(() => {
    if (isPathAnimating && path.length > 0) {
      const interval = setInterval(() => {
        setPathAnimation(prev => (prev + 0.02) % 1);
      }, 30);
      
      return () => clearInterval(interval);
    }
  }, [isPathAnimating, path.length]);

  // Path nodes for this floor only
  const floorPathNodeIds = path.filter(nodeId => {
    const node = buildingData.floors.flatMap(f => f.pathNodes).find(n => n.id === nodeId);
    return node && node.floor === selectedFloor;
  });
  
  if (!floorData) return null;
  
  const floorWidth = floorData.width * 0.5;
  const floorHeight = floorData.height * 0.5;
  const floorY = (selectedFloor - 1) * 50; // Space floors 50 units apart
  
  // Helper function to convert building coordinates to scene coordinates
  const mapCoordinates = (x: number, y: number) => {
    return {
      x: (x - floorData.width / 2) * 0.5,
      z: (y - floorData.height / 2) * 0.5,
      y: floorY + 0.1 // Just above floor level
    };
  };
  
  // Convert path nodes to points
  const pathPoints: THREE.Vector3[] = [];
  floorPathNodeIds.forEach(nodeId => {
    const node = floorData.pathNodes.find(n => n.id === nodeId);
    if (node) {
      const { x, y, z } = mapCoordinates(node.position.x, node.position.y);
      pathPoints.push(new THREE.Vector3(x, y + 5, z)); // Position path slightly above floor
    }
  });
  
  return (
    <group>
      {/* Floor base */}
      <mesh
        receiveShadow
        position={[0, floorY, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[floorWidth, floorHeight]} />
        <meshStandardMaterial color="#f5f5f5" />
      </mesh>
      
      {/* Walls to create cross-section effect (150cm height) */}
      <group>
        {/* North Wall */}
        <mesh position={[0, floorY + 75, -floorHeight/2]} castShadow receiveShadow>
          <boxGeometry args={[floorWidth, 150, 5]} />
          <meshStandardMaterial color="#e2e8f0" />
        </mesh>
        
        {/* South Wall */}
        <mesh position={[0, floorY + 75, floorHeight/2]} castShadow receiveShadow>
          <boxGeometry args={[floorWidth, 150, 5]} />
          <meshStandardMaterial color="#e2e8f0" />
        </mesh>
        
        {/* East Wall */}
        <mesh position={[floorWidth/2, floorY + 75, 0]} castShadow receiveShadow>
          <boxGeometry args={[5, 150, floorHeight]} />
          <meshStandardMaterial color="#e2e8f0" />
        </mesh>
        
        {/* West Wall */}
        <mesh position={[-floorWidth/2, floorY + 75, 0]} castShadow receiveShadow>
          <boxGeometry args={[5, 150, floorHeight]} />
          <meshStandardMaterial color="#e2e8f0" />
        </mesh>
      </group>
      
      {/* Room dividers and features - simplified for performance */}
      {floorData.locations.map((location, index) => {
        // Don't create walls for common areas
        if (['elevator', 'stairs', 'exit', 'kiosk'].includes(location.type)) return null;
        
        const { x, y, z } = mapCoordinates(location.position.x, location.position.y);
        const wallSize = location.type === 'room' || location.type === 'office' ? 50 : 30;
        
        return (
          <mesh 
            key={`room-${location.id}`}
            position={[x, y + (150/2), z]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[wallSize, 150, wallSize]} />
            <meshStandardMaterial color="#cbd5e1" opacity={0.7} transparent />
          </mesh>
        );
      })}
      
      {/* Location markers */}
      {floorData.locations.map(location => {
        const isStart = startLocation.id === location.id;
        const isEnd = endLocation?.id === location.id;
        const { x, y, z } = mapCoordinates(location.position.x, location.position.y);
        
        return (
          <group key={location.id} position={[x, y + 5, z]}>
            <mesh castShadow>
              <cylinderGeometry args={[
                isStart || isEnd ? 5 : 3, 
                isStart || isEnd ? 5 : 3, 
                10, 16
              ]} />
              <meshStandardMaterial 
                color={isStart ? '#22c55e' : isEnd ? '#ef4444' : getLocationColor3D(location.type)} 
              />
            </mesh>
            
            <Html position={[0, 20, 0]} center>
              <div className="bg-white p-1 rounded-md text-xs font-bold whitespace-nowrap shadow-md">
                {location.name}
              </div>
            </Html>
          </group>
        );
      })}
      
      {/* Path Visualization */}
      {pathPoints.length > 1 && (
        <group>
          {/* Static path line */}
          <line>
            <bufferGeometry attach="geometry" onUpdate={self => self.computeBoundingSphere()}>
              <bufferAttribute
                attach="attributes-position"
                count={pathPoints.length}
                array={new Float32Array(pathPoints.flatMap(p => [p.x, p.y, p.z]))}
                itemSize={3}
              />
            </bufferGeometry>
            <lineBasicMaterial attach="material" color="#8b5cf6" linewidth={3} />
          </line>
          
          {/* Animated path markers */}
          {pathPoints.map((point, i) => {
            if (i < pathPoints.length - 1) {
              const nextPoint = pathPoints[i + 1];
              const direction = new THREE.Vector3().subVectors(nextPoint, point).normalize();
              
              // Calculate position along the path based on animation progress
              const animationDistance = point.distanceTo(nextPoint);
              const animationPosition = new THREE.Vector3().copy(point).addScaledVector(
                direction,
                (pathAnimation * pathPoints.length) % animationDistance
              );
              
              return (
                <mesh key={`path-marker-${i}`} position={animationPosition} castShadow>
                  <sphereGeometry args={[2, 16, 16]} />
                  <meshStandardMaterial color="#7c3aed" emissive="#7c3aed" emissiveIntensity={0.5} />
                </mesh>
              );
            }
            return null;
          })}
          
          {/* Path nodes */}
          {pathPoints.map((point, i) => (
            <mesh key={`node-${i}`} position={point} castShadow>
              <sphereGeometry args={[1.5, 16, 16]} />
              <meshStandardMaterial color="#8b5cf6" />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
};

// Helper function to get color for location type in 3D view
const getLocationColor3D = (type: string): string => {
  switch (type) {
    case 'room': return '#3b82f6';
    case 'office': return '#16a34a';
    case 'meeting': return '#a855f7';
    case 'restroom': return '#2563eb';
    case 'elevator': return '#f59e0b';
    case 'stairs': return '#ea580c';
    case 'exit': return '#dc2626';
    case 'kiosk': return '#22c55e';
    case 'accessible': return '#0ea5e9';
    default: return '#94a3b8';
  }
};

export default Map3D;
