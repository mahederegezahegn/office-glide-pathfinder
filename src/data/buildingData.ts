
import { BuildingData } from '../types/navigation';

export const buildingData: BuildingData = {
  name: "Tech Innovation Center",
  floors: [
    {
      floor: 1,
      name: "Ground Floor",
      width: 800,
      height: 600,
      locations: [
        { id: "reception", name: "Reception", type: "office", floor: 1, position: { x: 50, y: 80 } },
        { id: "cafe", name: "Café", type: "room", floor: 1, position: { x: 150, y: 100 } },
        { id: "restroom-1f-m", name: "Men's Restroom", type: "restroom", floor: 1, position: { x: 250, y: 80 } },
        { id: "restroom-1f-w", name: "Women's Restroom", type: "restroom", floor: 1, position: { x: 250, y: 130 } },
        { id: "elevator-1", name: "Elevator", type: "elevator", floor: 1, position: { x: 400, y: 80 } },
        { id: "stairs-1", name: "Stairs", type: "stairs", floor: 1, position: { x: 400, y: 200 } },
        { id: "meeting-1a", name: "Meeting Room A", type: "meeting", floor: 1, position: { x: 500, y: 100 } },
        { id: "meeting-1b", name: "Meeting Room B", type: "meeting", floor: 1, position: { x: 500, y: 200 } },
        { id: "exit-main", name: "Main Exit", type: "exit", floor: 1, position: { x: 50, y: 250 } },
        { id: "accessible-1", name: "Accessible Restroom", type: "accessible", floor: 1, position: { x: 250, y: 180 } },
      ],
      pathNodes: [
        { id: "node-1-1", position: { x: 50, y: 80 }, connections: ["node-1-2"], floor: 1 },
        { id: "node-1-2", position: { x: 150, y: 80 }, connections: ["node-1-1", "node-1-3"], floor: 1 },
        { id: "node-1-3", position: { x: 250, y: 80 }, connections: ["node-1-2", "node-1-4"], floor: 1 },
        { id: "node-1-4", position: { x: 400, y: 80 }, connections: ["node-1-3", "node-1-5", "node-1-6"], floor: 1, isTransition: true, transitionTo: "node-2-4" },
        { id: "node-1-5", position: { x: 500, y: 100 }, connections: ["node-1-4"], floor: 1 },
        { id: "node-1-6", position: { x: 400, y: 200 }, connections: ["node-1-4", "node-1-7"], floor: 1, isTransition: true, transitionTo: "node-2-6" },
        { id: "node-1-7", position: { x: 500, y: 200 }, connections: ["node-1-6"], floor: 1 },
      ]
    },
    {
      floor: 2,
      name: "Second Floor",
      width: 800,
      height: 600,
      locations: [
        { id: "office-2a", name: "Office Suite A", type: "office", floor: 2, position: { x: 100, y: 80 } },
        { id: "office-2b", name: "Office Suite B", type: "office", floor: 2, position: { x: 100, y: 200 } },
        { id: "restroom-2f-m", name: "Men's Restroom", type: "restroom", floor: 2, position: { x: 250, y: 80 } },
        { id: "restroom-2f-w", name: "Women's Restroom", type: "restroom", floor: 2, position: { x: 250, y: 130 } },
        { id: "elevator-2", name: "Elevator", type: "elevator", floor: 2, position: { x: 400, y: 80 } },
        { id: "stairs-2", name: "Stairs", type: "stairs", floor: 2, position: { x: 400, y: 200 } },
        { id: "meeting-2", name: "Conference Room", type: "meeting", floor: 2, position: { x: 600, y: 150 } },
      ],
      pathNodes: [
        { id: "node-2-1", position: { x: 100, y: 80 }, connections: ["node-2-2"], floor: 2 },
        { id: "node-2-2", position: { x: 250, y: 80 }, connections: ["node-2-1", "node-2-3"], floor: 2 },
        { id: "node-2-3", position: { x: 350, y: 80 }, connections: ["node-2-2", "node-2-4", "node-2-5"], floor: 2 },
        { id: "node-2-4", position: { x: 400, y: 80 }, connections: ["node-2-3"], floor: 2, isTransition: true, transitionTo: "node-1-4" },
        { id: "node-2-5", position: { x: 500, y: 80 }, connections: ["node-2-3", "node-2-7"], floor: 2 },
        { id: "node-2-6", position: { x: 400, y: 200 }, connections: ["node-2-7"], floor: 2, isTransition: true, transitionTo: "node-1-6" },
        { id: "node-2-7", position: { x: 500, y: 150 }, connections: ["node-2-5", "node-2-6", "node-2-8"], floor: 2 },
        { id: "node-2-8", position: { x: 600, y: 150 }, connections: ["node-2-7"], floor: 2 },
      ]
    },
    {
      floor: 3,
      name: "Third Floor",
      width: 800,
      height: 600,
      locations: [
        { id: "exec-suite", name: "Executive Suite", type: "office", floor: 3, position: { x: 100, y: 100 } },
        { id: "hr-office", name: "HR Department", type: "office", floor: 3, position: { x: 250, y: 100 } },
        { id: "restroom-3f-m", name: "Men's Restroom", type: "restroom", floor: 3, position: { x: 350, y: 80 } },
        { id: "restroom-3f-w", name: "Women's Restroom", type: "restroom", floor: 3, position: { x: 350, y: 130 } },
        { id: "elevator-3", name: "Elevator", type: "elevator", floor: 3, position: { x: 400, y: 80 } },
        { id: "stairs-3", name: "Stairs", type: "stairs", floor: 3, position: { x: 400, y: 200 } },
        { id: "boardroom", name: "Board Room", type: "meeting", floor: 3, position: { x: 550, y: 100 } },
        { id: "tech-lab", name: "Technology Lab", type: "room", floor: 3, position: { x: 600, y: 200 } },
      ],
      pathNodes: [
        { id: "node-3-1", position: { x: 100, y: 100 }, connections: ["node-3-2"], floor: 3 },
        { id: "node-3-2", position: { x: 250, y: 100 }, connections: ["node-3-1", "node-3-3"], floor: 3 },
        { id: "node-3-3", position: { x: 350, y: 100 }, connections: ["node-3-2", "node-3-4"], floor: 3 },
        { id: "node-3-4", position: { x: 400, y: 80 }, connections: ["node-3-3", "node-3-5", "node-3-6"], floor: 3, isTransition: true, transitionTo: "node-2-4" },
        { id: "node-3-5", position: { x: 550, y: 100 }, connections: ["node-3-4"], floor: 3 },
        { id: "node-3-6", position: { x: 400, y: 200 }, connections: ["node-3-4", "node-3-7"], floor: 3, isTransition: true, transitionTo: "node-2-6" },
        { id: "node-3-7", position: { x: 600, y: 200 }, connections: ["node-3-6"], floor: 3 },
      ]
    }
  ]
};
