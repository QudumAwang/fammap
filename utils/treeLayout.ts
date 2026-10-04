import { Marriage, Person } from "@/types/family";
import { Edge, Node } from "@xyflow/react";
import { getBirthOrderLabel, getKinshipTitle } from "./kinship";

interface LayoutResult {
  nodes: Node[];
  edges: Edge[];
}

export function generateTreeLayout(
  persons: Person[],
  marriages: Marriage[],
  referenceUserId: string,
  onSelectPerson: (person: Person) => void,
  nodePositions: Record<string, { x: number; y: number }> = {}
): LayoutResult {
  const personMap = new Map<string, Person>(persons.map((p) => [p.id, p]));
  const depthMap = new Map<string, number>();

  const getParentIds = (p: Person): string[] => {
    return [p.father_id, p.mother_id].filter(Boolean) as string[];
  };

  const getSpouseId = (pId: string): string | null => {
    const m = marriages.find((m) => m.husband_id === pId || m.wife_id === pId);
    if (!m) return null;
    return m.husband_id === pId ? m.wife_id : m.husband_id;
  };

  const computeDepth = (id: string, visited = new Set<string>()): number => {
    if (visited.has(id)) return depthMap.get(id) ?? 0;
    visited.add(id);

    const person = personMap.get(id);
    if (!person) return 0;

    const parents = getParentIds(person);
    if (parents.length > 0) {
      const maxParentDepth = Math.max(
        ...parents.map((pId) => computeDepth(pId, visited))
      );
      const depth = maxParentDepth + 1;
      depthMap.set(id, depth);
      return depth;
    }

    const spouseId = getSpouseId(id);
    if (spouseId && !visited.has(spouseId)) {
      const spouse = personMap.get(spouseId);
      if (spouse && getParentIds(spouse).length > 0) {
        const spouseDepth = computeDepth(spouseId, visited);
        depthMap.set(id, spouseDepth);
        return spouseDepth;
      }
    }

    depthMap.set(id, 0);
    return 0;
  };

  for (const person of persons) {
    if (!depthMap.has(person.id)) {
      computeDepth(person.id);
    }
  }

  for (const marriage of marriages) {
    const dH = depthMap.get(marriage.husband_id) ?? 0;
    const dW = depthMap.get(marriage.wife_id) ?? 0;
    const maxD = Math.max(dH, dW);
    depthMap.set(marriage.husband_id, maxD);
    depthMap.set(marriage.wife_id, maxD);
  }

  const levels: Map<number, Person[]> = new Map();
  for (const person of persons) {
    const d = depthMap.get(person.id) ?? 0;
    if (!levels.has(d)) levels.set(d, []);
    levels.get(d)!.push(person);
  }

  const sortedDepths = Array.from(levels.keys()).sort((a, b) => a - b);
  const nodes: Node[] = [];
  const HORIZONTAL_GAP = 300;
  const VERTICAL_GAP = 230;
  const missingPositionCount = persons.filter((p) => !nodePositions[p.id]).length;
  const centerNewPosition = missingPositionCount === 1 && Object.keys(nodePositions).length > 0;

  for (const depth of sortedDepths) {
    const list = levels.get(depth)!;

    const processed = new Set<string>();
    const orderedList: Person[] = [];

    for (const p of list) {
      if (processed.has(p.id)) continue;
      orderedList.push(p);
      processed.add(p.id);

      const spouseId = getSpouseId(p.id);
      if (spouseId) {
        const spouse = list.find((s) => s.id === spouseId);
        if (spouse && !processed.has(spouse.id)) {
          orderedList.push(spouse);
          processed.add(spouse.id);
        }
      }
    }

    const totalWidth = orderedList.length * HORIZONTAL_GAP;
    const startX = Math.max(80, 700 - totalWidth / 2);

    orderedList.forEach((person, index) => {
      const position = nodePositions[person.id] || (centerNewPosition
        ? { x: 700 - HORIZONTAL_GAP / 2, y: 80 + depth * VERTICAL_GAP }
        : { x: startX + index * HORIZONTAL_GAP, y: 80 + depth * VERTICAL_GAP });
      const kinshipTitle = getKinshipTitle(person.id, referenceUserId, persons, marriages);

      nodes.push({
        id: person.id,
        type: "familyMember",
        position,
        data: {
          person,
          birthOrderLabel: getBirthOrderLabel(person, persons),
          kinshipTitle,
          isReference: person.id === referenceUserId,
          onSelect: onSelectPerson,
        },
      });
    });
  }

  const edges: Edge[] = [];

  for (const marriage of marriages) {
    edges.push({
      id: `edge-marriage-${marriage.id}`,
      source: marriage.husband_id,
      target: marriage.wife_id,
      sourceHandle: "right",
      targetHandle: "left",
      type: "marriage",
    });
  }

  for (const person of persons) {
    const primaryParent = person.father_id || person.mother_id;
    if (primaryParent && personMap.has(primaryParent)) {
      edges.push({
        id: `edge-parent-${primaryParent}-${person.id}`,
        source: primaryParent,
        target: person.id,
        type: "smoothstep",
        style: {
          stroke: "#94a3b8",
          strokeWidth: 2,
        },
      });
    }

    if (person.father_id && person.mother_id && personMap.has(person.mother_id)) {
      edges.push({
        id: `edge-mother-${person.mother_id}-${person.id}`,
        source: person.mother_id,
        target: person.id,
        type: "smoothstep",
        style: {
          stroke: "#cbd5e1",
          strokeWidth: 1.5,
          strokeDasharray: "3 3",
        },
      });
    }
  }

  return { nodes, edges };
}
