import type { FamilyTreeData } from "@/types/family";
import { DEMO_FAMILY_TREE } from "@/utils/demoData";

export interface DemoState extends FamilyTreeData {
  nodePositions: Record<string, { x: number; y: number }>;
}

const STORAGE_KEY = "fammap-demo-data";

export function loadDemoData(): DemoState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored) as Partial<DemoState>;
      if (Array.isArray(data.persons) && Array.isArray(data.marriages)) {
        return {
          persons: data.persons,
          marriages: data.marriages,
          nodePositions: data.nodePositions || {},
        };
      }
    }
  } catch {
    return createInitialDemoData();
  }

  return createInitialDemoData();
}

export function saveDemoData(data: DemoState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    return;
  }
}

export function resetDemoData(): DemoState {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    return createInitialDemoData();
  }
  return createInitialDemoData();
}

export function createDemoId() {
  return `demo-${crypto.randomUUID()}`;
}

function createInitialDemoData(): DemoState {
  return {
    persons: DEMO_FAMILY_TREE.persons,
    marriages: DEMO_FAMILY_TREE.marriages,
    nodePositions: {},
  };
}
