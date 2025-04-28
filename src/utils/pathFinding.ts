
import { BuildingData, Location } from '../types/navigation';

class PathFinding {
  private buildingData: BuildingData;
  
  constructor(buildingData: BuildingData) {
    this.buildingData = buildingData;
  }
  
  // Find the closest path node to a location
  private getClosestPathNode(location: Location): string | null {
    const floor = this.buildingData.floors.find(f => f.floor === location.floor);
    if (!floor) return null;
    
    let closestNode = null;
    let minDistance = Infinity;
    
    for (const node of floor.pathNodes) {
      const distance = this.calculateDistance(
        node.position.x, node.position.y,
        location.position.x, location.position.y
      );
      
      if (distance < minDistance) {
        minDistance = distance;
        closestNode = node.id;
      }
    }
    
    return closestNode;
  }
  
  // Calculate Euclidean distance between two points
  private calculateDistance(x1: number, y1: number, x2: number, y2: number): number {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  }
  
  // Find the shortest path between two locations using Dijkstra's algorithm
  findPath(startLocation: Location, endLocation: Location): string[] {
    // Get closest path nodes to start and end locations
    const startNodeId = this.getClosestPathNode(startLocation);
    const endNodeId = this.getClosestPathNode(endLocation);
    
    if (!startNodeId || !endNodeId) return [];
    
    // Get all path nodes from all floors
    const nodes = this.buildingData.floors.flatMap(floor => floor.pathNodes);
    
    // Create graph for Dijkstra algorithm
    const graph: Record<string, Record<string, number>> = {};
    
    // Initialize the graph
    nodes.forEach(node => {
      graph[node.id] = {};
      
      // Add connections to graph
      node.connections.forEach(connectedNodeId => {
        const connectedNode = nodes.find(n => n.id === connectedNodeId);
        if (connectedNode) {
          const distance = this.calculateDistance(
            node.position.x, node.position.y,
            connectedNode.position.x, connectedNode.position.y
          );
          graph[node.id][connectedNodeId] = distance;
        }
      });
      
      // Add transitions between floors (elevators, stairs)
      if (node.isTransition && node.transitionTo) {
        const transitionNode = nodes.find(n => n.id === node.transitionTo);
        if (transitionNode) {
          // Add a weight for changing floors (making it slightly less desirable)
          graph[node.id][node.transitionTo] = 20;
          
          // Also add the reverse connection
          if (!graph[node.transitionTo]) {
            graph[node.transitionTo] = {};
          }
          graph[node.transitionTo][node.id] = 20;
        }
      }
    });
    
    // Implementation of Dijkstra's algorithm
    const distances: Record<string, number> = {};
    const previous: Record<string, string | null> = {};
    const unvisited = new Set<string>();
    
    // Initialize distances and previous
    nodes.forEach(node => {
      distances[node.id] = node.id === startNodeId ? 0 : Infinity;
      previous[node.id] = null;
      unvisited.add(node.id);
    });
    
    // Main Dijkstra algorithm loop
    while (unvisited.size > 0) {
      // Find node with minimum distance
      let current: string | null = null;
      let minDistance = Infinity;
      
      for (const nodeId of unvisited) {
        if (distances[nodeId] < minDistance) {
          minDistance = distances[nodeId];
          current = nodeId;
        }
      }
      
      // If we can't find a path or reached the end, break
      if (current === null || current === endNodeId || minDistance === Infinity) {
        break;
      }
      
      // Remove current from unvisited
      unvisited.delete(current);
      
      // Check neighbors
      for (const neighbor in graph[current]) {
        const distance = distances[current] + graph[current][neighbor];
        
        if (distance < distances[neighbor]) {
          distances[neighbor] = distance;
          previous[neighbor] = current;
        }
      }
    }
    
    // Build the path by backtracking from end to start
    const path: string[] = [];
    let current = endNodeId;
    
    while (current) {
      path.unshift(current);
      current = previous[current] || null;
    }
    
    return path;
  }
}

export default PathFinding;
