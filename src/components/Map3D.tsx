import { useEffect, useRef } from 'react';
import { BuildingData, Location } from '../types/navigation';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

interface Map3DProps {
  selectedFloor: number;
  buildingData: BuildingData;
  path: string[];
  isPathAnimating: boolean;
  startLocation: Location;
  endLocation: Location | null;
}

const Map3D = ({
  selectedFloor,
  buildingData,
  path,
  isPathAnimating,
  startLocation,
  endLocation
}: Map3DProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  
  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Create scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8fafc);
    sceneRef.current = scene;
    
    // Create camera
    const camera = new THREE.PerspectiveCamera(
      45, 
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 150, 200);
    cameraRef.current = camera;
    
    // Create renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    
    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(50, 200, 100);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
    
    // Add grid helper for reference
    const gridHelper = new THREE.GridHelper(500, 50, 0xaaaaaa, 0xeeeeee);
    scene.add(gridHelper);
    
    // Add orbit controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    controls.rotateSpeed = 0.5;
    controls.maxPolarAngle = Math.PI / 2 - 0.1; // Prevent camera from going below ground
    controlsRef.current = controls;
    
    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      if (controlsRef.current) controlsRef.current.update();
      if (rendererRef.current && cameraRef.current && sceneRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    
    animate();
    
    // Handle window resize
    const handleResize = () => {
      if (containerRef.current && cameraRef.current && rendererRef.current) {
        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;
        
        cameraRef.current.aspect = width / height;
        cameraRef.current.updateProjectionMatrix();
        
        rendererRef.current.setSize(width, height);
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      if (containerRef.current && rendererRef.current) {
        window.removeEventListener('resize', handleResize);
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
    };
  }, []);
  
  // Update 3D map when selected floor or path changes
  useEffect(() => {
    if (!sceneRef.current) return;
    
    // Clear previous floor objects
    // Keep only lights and grid helper
    const scene = sceneRef.current;
    
    while (scene.children.length > 3) {
      scene.remove(scene.children[3]);
    }
    
    // Get current floor data
    const floorData = buildingData.floors.find(floor => floor.floor === selectedFloor);
    if (!floorData) return;
    
    // Create floor base
    const floorWidth = floorData.width * 0.5;
    const floorHeight = floorData.height * 0.5;
    const floorGeometry = new THREE.BoxGeometry(floorWidth, 2, floorHeight);
    const floorMaterial = new THREE.MeshLambertMaterial({ color: 0xeeeeee });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.position.y = (selectedFloor - 1) * 30;
    floor.receiveShadow = true;
    scene.add(floor);
    
    // Add locations as objects
    floorData.locations.forEach(location => {
      const isStart = startLocation.id === location.id;
      const isEnd = endLocation?.id === location.id;
      
      // Scale and offset coordinates to fit 3D space
      const x = (location.position.x - floorData.width / 2) * 0.5;
      const z = (location.position.y - floorData.height / 2) * 0.5;
      const y = (selectedFloor - 1) * 30 + 5; // Position above floor
      
      const locationGeometry = new THREE.CylinderGeometry(
        isStart || isEnd ? 5 : 3,
        isStart || isEnd ? 5 : 3,
        10,
        16
      );
      
      const color = isStart ? 0x22c55e : isEnd ? 0xef4444 : getLocationColor3D(location.type);
      const locationMaterial = new THREE.MeshPhongMaterial({ color });
      const locationMesh = new THREE.Mesh(locationGeometry, locationMaterial);
      
      locationMesh.position.set(x, y, z);
      locationMesh.castShadow = true;
      scene.add(locationMesh);
      
      // Add label for location
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 64;
      const context = canvas.getContext('2d');
      if (context) {
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.font = 'Bold 24px Arial';
        context.fillStyle = '#000000';
        context.textAlign = 'center';
        context.fillText(location.name, canvas.width / 2, canvas.height / 2 + 8);
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        
        const labelMaterial = new THREE.SpriteMaterial({
          map: texture,
          transparent: true
        });
        
        const label = new THREE.Sprite(labelMaterial);
        label.position.set(x, y + 10, z);
        label.scale.set(20, 5, 1);
        scene.add(label);
      }
    });
    
    // Add path if available
    if (path.length > 0) {
      const pathPoints: THREE.Vector3[] = [];
      
      // Get all path nodes for this floor
      const floorPathNodes = floorData.pathNodes;
      const floorPathNodeIds = path.filter(nodeId => {
        const node = buildingData.floors.flatMap(f => f.pathNodes).find(n => n.id === nodeId);
        return node && node.floor === selectedFloor;
      });
      
      // Create path points
      floorPathNodeIds.forEach(nodeId => {
        const node = floorPathNodes.find(n => n.id === nodeId);
        if (node) {
          // Scale and offset coordinates to fit 3D space
          const x = (node.position.x - floorData.width / 2) * 0.5;
          const z = (node.position.y - floorData.height / 2) * 0.5;
          const y = (selectedFloor - 1) * 30 + 5; // Position above floor
          
          pathPoints.push(new THREE.Vector3(x, y, z));
        }
      });
      
      if (pathPoints.length > 1) {
        const pathGeometry = new THREE.BufferGeometry().setFromPoints(pathPoints);
        const pathMaterial = new THREE.LineBasicMaterial({ color: 0x8b5cf6, linewidth: 5 });
        const pathLine = new THREE.Line(pathGeometry, pathMaterial);
        scene.add(pathLine);
        
        // Add spheres at each point for emphasis
        pathPoints.forEach((point) => {
          const sphereGeometry = new THREE.SphereGeometry(1, 16, 16);
          const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0x8b5cf6 });
          const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
          sphere.position.copy(point);
          scene.add(sphere);
        });
      }
    }
    
    // Adjust camera position to focus on current floor
    if (cameraRef.current && controlsRef.current) {
      const y = (selectedFloor - 1) * 30;
      cameraRef.current.position.set(0, y + 150, 200);
      controlsRef.current.target.set(0, y, 0);
      controlsRef.current.update();
    }
  }, [selectedFloor, path, startLocation, endLocation, buildingData, isPathAnimating]);
  
  return (
    <div ref={containerRef} className="w-full h-full relative">
      {/* Floor indicator overlay */}
      <div className="absolute top-4 left-4 bg-white/80 p-2 rounded-md shadow-md">
        <p className="text-sm font-bold">
          {buildingData.floors.find(f => f.floor === selectedFloor)?.name || `Floor ${selectedFloor}`}
        </p>
      </div>
    </div>
  );
};

// Helper function to get color for location type in 3D view
const getLocationColor3D = (type: string): number => {
  switch (type) {
    case 'room': return 0x3b82f6;
    case 'office': return 0x16a34a;
    case 'meeting': return 0xa855f7;
    case 'restroom': return 0x2563eb;
    case 'elevator': return 0xf59e0b;
    case 'stairs': return 0xea580c;
    case 'exit': return 0xdc2626;
    case 'kiosk': return 0x22c55e;
    case 'accessible': return 0x0ea5e9;
    default: return 0x94a3b8;
  }
};

export default Map3D;
