"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  NodeChange,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import "@/styles/claymorphism.css";

import { Person, Marriage, MarriageStatus } from "@/types/family";
import { generateTreeLayout } from "@/utils/treeLayout";
import { getKinshipTitle } from "@/utils/kinship";
import { FamilyMemberNode } from "./FamilyMemberNode";
import { MarriageEdge } from "./MarriageEdge";
import { MemberDetailModal } from "./MemberDetailModal";
import { AddRootMemberModal } from "./AddRootMemberModal";
import {
  Search,
  UserPlus,
  Crown,
  Network,
  Info,
  Loader2,
} from "lucide-react";

const nodeTypes = {
  familyMember: FamilyMemberNode,
};

const edgeTypes = {
  marriage: MarriageEdge,
};

type RelationLink = { id: string; key: "father_id" | "mother_id"; value: string };
type NodePosition = { x: number; y: number };

async function saveNodePositions(positions: { personId: string; position: NodePosition }[]) {
  if (positions.length === 0) return;
  try {
    await fetch("/api/person-positions", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        positions: positions.map(({ personId, position }) => ({
          person_id: personId,
          x: position.x,
          y: position.y,
        })),
      }),
    });
  } catch {
    return;
  }
}

async function syncRelations(persons: Person[], marriages: Marriage[]) {
  const headers = { "Content-Type": "application/json" };
  const spousesOf = (id: string) =>
    marriages
      .filter((m) => m.husband_id === id || m.wife_id === id)
      .map((m) => (m.husband_id === id ? m.wife_id : m.husband_id));

  const candidates = persons.flatMap<RelationLink>((p) => {
    if (Boolean(p.father_id) === Boolean(p.mother_id)) return [];
    const spouses = spousesOf((p.father_id || p.mother_id) as string);
    return spouses.length === 1 ? [{ id: p.id, key: p.father_id ? "mother_id" : "father_id", value: spouses[0] }] : [];
  });

  const pairs = new Map<string, [string, string]>();
  for (const p of persons) {
    if (p.father_id && p.mother_id && !marriages.some((m) => m.husband_id === p.father_id && m.wife_id === p.mother_id)) {
      pairs.set(`${p.father_id}|${p.mother_id}`, [p.father_id, p.mother_id]);
    }
  }

  const [linked, created] = await Promise.all([
    Promise.all(
      candidates.map((l) =>
        fetch(`/api/persons/${l.id}`, { method: "PATCH", headers, body: JSON.stringify({ [l.key]: l.value }) }).then((r) => r.ok)
      )
    ),
    Promise.all(
      [...pairs.values()].map(([husbandId, wifeId]) =>
        fetch("/api/marriages", {
          method: "POST",
          headers,
          body: JSON.stringify({ husband_id: husbandId, wife_id: wifeId, marriage_order: 1, status: "married" }),
        }).then((r) => (r.ok ? r.json() : null))
      )
    ),
  ]);

  return {
    links: candidates.filter((_, i) => linked[i]),
    newMarriages: created.filter(Boolean).map((m): Marriage => ({
      id: m.id,
      husband_id: m.husband_id,
      wife_id: m.wife_id,
      marriage_order: m.marriage_order,
      status: m.status,
    })),
  };
}

export function FamilyTreeCanvas() {
  const [persons, setPersons] = useState<Person[]>([]);
  const [marriages, setMarriages] = useState<Marriage[]>([]);
  const [referenceUserId, setReferenceUserId] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [nodePositions, setNodePositions] = useState<Record<string, { x: number; y: number }>>({});

  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [isAddRootOpen, setIsAddRootOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSelectPerson = useCallback((person: Person) => {
    setSelectedPerson(person);
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      setIsLoading(true);
      try {
        const [pRes, mRes, positionRes] = await Promise.all([
          fetch("/api/persons"),
          fetch("/api/marriages"),
          fetch("/api/person-positions"),
        ]);

        const personsData = await pRes.json();
        const marriagesData = await mRes.json();
        const positionsData = await positionRes.json();

        if (!pRes.ok || personsData.error) {
          console.error("fetchData (persons):", personsData.error || pRes.statusText);
        }
        if (!mRes.ok || marriagesData.error) {
          console.error("fetchData (marriages):", marriagesData.error || mRes.statusText);
        }
        if (!positionRes.ok || positionsData.error) {
          console.error("fetchData (positions):", positionsData.error || positionRes.statusText);
        }

        if (!isMounted) return;

        const loadedPositions: Record<string, NodePosition> = Array.isArray(positionsData)
          ? Object.fromEntries(
              positionsData.map((p) => [p.person_id, { x: p.x, y: p.y }])
            )
          : {};
        setNodePositions(loadedPositions);

        const loadedPersons: Person[] = Array.isArray(personsData)
          ? personsData.map((p) => ({
              id: p.id,
              full_name: p.full_name,
              gender: p.gender,
              birth_date: p.birth_date,
              birth_order: p.birth_order,
              life_status: p.life_status,
              father_id: p.father_id,
              mother_id: p.mother_id,
              child_status: p.child_status,
            }))
          : [];
        const loadedMarriages: Marriage[] = Array.isArray(marriagesData)
          ? marriagesData.map((m) => ({
              id: m.id,
              husband_id: m.husband_id,
              wife_id: m.wife_id,
              marriage_order: m.marriage_order,
              status: m.status,
            }))
          : [];

        if (loadedPersons.length > 0) {
          setPersons(loadedPersons);

          setReferenceUserId((prev) => {
            if (prev && loadedPersons.some((p) => p.id === prev)) return prev;
            return loadedPersons[0].id;
          });
        }

        if (loadedMarriages.length > 0) {
          setMarriages(loadedMarriages);
        }

        if (Array.isArray(personsData) && Array.isArray(marriagesData)) {
          const { links, newMarriages } = await syncRelations(personsData, marriagesData);
          if (!isMounted) return;
          const syncedPersons = loadedPersons.map((p) => {
            const link = links.find((l) => l.id === p.id);
            return link ? { ...p, [link.key]: link.value } : p;
          });
          const syncedMarriages = [...loadedMarriages, ...newMarriages];
          if (links.length > 0) {
            setPersons(syncedPersons);
          }
          if (newMarriages.length > 0) {
            setMarriages(syncedMarriages);
          }

          const initialLayout = generateTreeLayout(
            syncedPersons,
            syncedMarriages,
            syncedPersons[0]?.id || "",
            handleSelectPerson,
            loadedPositions
          );
          const completePositions = Object.fromEntries(
            initialLayout.nodes.map((node) => [node.id, node.position])
          );
          setNodePositions(completePositions);
          await saveNodePositions(
            initialLayout.nodes
              .filter((node) => !loadedPositions[node.id])
              .map((node) => ({ personId: node.id, position: node.position }))
          );
        }
      } catch (err) {
        console.error("fetchData:", err instanceof Error ? err.message : err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [handleSelectPerson]);

  const { nodes: layoutNodes, edges: layoutEdges } = useMemo(() => {
    return generateTreeLayout(persons, marriages, referenceUserId, handleSelectPerson, nodePositions);
  }, [persons, marriages, referenceUserId, handleSelectPerson, nodePositions]);

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutEdges);

  const handleNodesChange = useCallback((changes: NodeChange[]) => {
    const positionChanges = changes.filter(
      (change): change is Extract<NodeChange, { type: "position" }> =>
        change.type === "position" && Boolean(change.position) && change.dragging !== true
    );
    if (positionChanges.length > 0) {
      setNodePositions((prev) => {
        const next = { ...prev };
        for (const node of nodes) {
          next[node.id] = node.position;
        }
        for (const change of positionChanges) {
          next[change.id] = change.position!;
        }
        return next;
      });
      void saveNodePositions(
        positionChanges.map((change) => ({
          personId: change.id,
          position: change.position!,
        }))
      );
    }
    onNodesChange(changes);
  }, [nodes, onNodesChange]);

  const rememberCurrentPositions = useCallback(() => {
    setNodePositions((prev) => {
      let next = prev;
      for (const node of nodes) {
        if (!next[node.id]) {
          if (next === prev) next = { ...prev };
          next[node.id] = node.position;
        }
      }
      return next;
    });
  }, [nodes]);

  React.useEffect(() => {
    setNodes(layoutNodes);
    setEdges(layoutEdges);
  }, [layoutNodes, layoutEdges, setNodes, setEdges]);

  useEffect(() => {
    if (isLoading) return;
    const unsavedNodes = layoutNodes.filter((node) => !nodePositions[node.id]);
    if (unsavedNodes.length === 0) return;
    void saveNodePositions(
      unsavedNodes.map((node) => ({ personId: node.id, position: node.position }))
    );
  }, [isLoading, layoutNodes, nodePositions]);

  const handleSetReferenceUser = (id: string) => {
    setReferenceUserId(id);
  };

  const ensureMarriage = async (husbandId: string | null, wifeId: string | null) => {
    if (!husbandId || !wifeId) return;
    if (marriages.some((m) => m.husband_id === husbandId && m.wife_id === wifeId)) return;
    try {
      const res = await fetch("/api/marriages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ husband_id: husbandId, wife_id: wifeId, marriage_order: 1, status: "married" }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        console.error("ensureMarriage:", data.error || res.statusText);
        return;
      }
      setMarriages((prev) => [...prev, { id: data.id, husband_id: husbandId, wife_id: wifeId, marriage_order: 1, status: "married" }]);
    } catch (err) {
      console.error("ensureMarriage:", err instanceof Error ? err.message : err);
    }
  };

  const handleUpdatePerson = async (updated: Person) => {
    rememberCurrentPositions();
    const previousPerson = persons.find((p) => p.id === updated.id) || selectedPerson;
    setPersons((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    setSelectedPerson(updated);
    try {
      const res = await fetch(`/api/persons/${updated.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: updated.full_name,
          gender: updated.gender,
          birth_order: updated.birth_order,
          life_status: updated.life_status,
          child_status: updated.child_status,
          father_id: updated.father_id,
          mother_id: updated.mother_id,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        console.error("handleUpdatePerson:", data.error || res.statusText);
        if (previousPerson) {
          setPersons((prev) => prev.map((p) => (p.id === updated.id ? previousPerson : p)));
          setSelectedPerson(previousPerson);
        }
        return;
      }
      await ensureMarriage(updated.father_id, updated.mother_id);
    } catch (err) {
      console.error("handleUpdatePerson:", err instanceof Error ? err.message : err);
      if (previousPerson) {
        setPersons((prev) => prev.map((p) => (p.id === updated.id ? previousPerson : p)));
        setSelectedPerson(previousPerson);
      }
    }
  };

  const handleDeletePerson = async (id: string) => {
    setPersons((prev) =>
      prev
        .filter((p) => p.id !== id)
        .map((p) => ({
          ...p,
          father_id: p.father_id === id ? null : p.father_id,
          mother_id: p.mother_id === id ? null : p.mother_id,
        }))
    );
    setMarriages((prev) =>
      prev.filter((m) => m.husband_id !== id && m.wife_id !== id)
    );
    setNodePositions((prev) => {
      if (!prev[id]) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
    if (referenceUserId === id) {
      const remaining = persons.filter((p) => p.id !== id);
      if (remaining.length > 0) {
        setReferenceUserId(remaining[0].id);
      }
    }
    try {
      const res = await fetch(`/api/persons/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        console.error("handleDeletePerson:", data.error || res.statusText);
      }
    } catch (err) {
      console.error("handleDeletePerson:", err instanceof Error ? err.message : err);
    }
  };

  const handleAddChild = async (parent: Person, childData: Omit<Person, "id">) => {
    rememberCurrentPositions();
    try {
      const res = await fetch("/api/persons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: childData.full_name,
          gender: childData.gender,
          birth_order: childData.birth_order,
          life_status: childData.life_status,
          child_status: childData.child_status,
          father_id: childData.father_id,
          mother_id: childData.mother_id,
        }),
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        console.error("handleAddChild:", data.error || res.statusText);
        return;
      }

      const newPerson: Person = {
        ...childData,
        id: data.id,
      };
      setPersons((prev) => [...prev, newPerson]);
    } catch (err) {
      console.error("handleAddChild:", err instanceof Error ? err.message : err);
    }
  };

  const handleAddPartner = async (
    person: Person,
    partnerData: Omit<Person, "id">,
    status: MarriageStatus
  ) => {
    rememberCurrentPositions();
    try {
      const pRes = await fetch("/api/persons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: partnerData.full_name,
          gender: partnerData.gender,
          birth_order: partnerData.birth_order,
          life_status: partnerData.life_status,
          child_status: partnerData.child_status,
          father_id: null,
          mother_id: null,
        }),
      });
      const pData = await pRes.json();

      if (!pRes.ok || pData.error) {
        console.error("handleAddPartner (person):", pData.error || pRes.statusText);
        return;
      }

      const partnerId = pData.id;
      const newPartner: Person = {
        ...partnerData,
        id: partnerId,
      };

      const husbandId = person.gender === "male" ? person.id : partnerId;
      const wifeId = person.gender === "female" ? person.id : partnerId;

      const mRes = await fetch("/api/marriages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          husband_id: husbandId,
          wife_id: wifeId,
          marriage_order: 1,
          status,
        }),
      });
      const mData = await mRes.json();

      if (!mRes.ok || mData.error) {
        console.error("handleAddPartner (marriage):", mData.error || mRes.statusText);
        return;
      }

      const newMarriage: Marriage = {
        id: mData.id,
        husband_id: husbandId,
        wife_id: wifeId,
        marriage_order: 1,
        status,
      };

      setPersons((prev) => [...prev, newPartner]);
      setMarriages((prev) => [...prev, newMarriage]);

      const parentKey = person.gender === "male" ? "father_id" : "mother_id";
      const partnerKey = person.gender === "male" ? "mother_id" : "father_id";
      const orphans = persons.filter((p) => p[parentKey] === person.id && !p[partnerKey]);
      const linked = await Promise.all(
        orphans.map((c) =>
          fetch(`/api/persons/${c.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ [partnerKey]: partnerId }),
          }).then((r) => r.ok)
        )
      );
      const linkedIds = orphans.filter((_, i) => linked[i]).map((c) => c.id);
      if (linkedIds.length > 0) {
        setPersons((prev) => prev.map((p) => (linkedIds.includes(p.id) ? { ...p, [partnerKey]: partnerId } : p)));
      }
    } catch (err) {
      console.error("handleAddPartner:", err instanceof Error ? err.message : err);
    }
  };

  const handleAddParent = async (
    child: Person,
    parentData: Omit<Person, "id">,
    relationType: "father" | "mother"
  ) => {
    rememberCurrentPositions();
    try {
      const res = await fetch("/api/persons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: parentData.full_name,
          gender: parentData.gender,
          birth_order: parentData.birth_order,
          life_status: parentData.life_status,
          child_status: parentData.child_status,
          father_id: null,
          mother_id: null,
        }),
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        console.error("handleAddParent (create parent):", data.error || res.statusText);
        return;
      }

      const newParentId = data.id;
      const newParent: Person = {
        ...parentData,
        id: newParentId,
      };

      const patchRes = await fetch(`/api/persons/${child.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          [relationType === "father" ? "father_id" : "mother_id"]: newParentId,
        }),
      });
      const patchData = await patchRes.json();

      if (!patchRes.ok || patchData.error) {
        console.error("handleAddParent (update child):", patchData.error || patchRes.statusText);
        return;
      }

      const updatedChild = {
        ...child,
        [relationType === "father" ? "father_id" : "mother_id"]: newParentId,
      };
      setPersons((prev) => [...prev.map((p) => (p.id === child.id ? updatedChild : p)), newParent]);
      setSelectedPerson(updatedChild);
      await ensureMarriage(updatedChild.father_id, updatedChild.mother_id);
    } catch (err) {
      console.error("handleAddParent:", err instanceof Error ? err.message : err);
    }
  };

  const handleAddRootMember = async (memberData: Omit<Person, "id">) => {
    rememberCurrentPositions();
    try {
      const res = await fetch("/api/persons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: memberData.full_name,
          gender: memberData.gender,
          birth_order: memberData.birth_order,
          life_status: memberData.life_status,
          child_status: memberData.child_status,
          father_id: null,
          mother_id: null,
        }),
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        console.error("handleAddRootMember:", data.error || res.statusText);
        return;
      }

      const newPerson: Person = {
        ...memberData,
        id: data.id,
      };
      setPersons((prev) => [...prev, newPerson]);
      if (!referenceUserId) {
        setReferenceUserId(newPerson.id);
      }
    } catch (err) {
      console.error("handleAddRootMember:", err instanceof Error ? err.message : err);
    }
  };

  const filteredPersons = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return [];
    return persons.filter((p) => p.full_name.toLowerCase().includes(query));
  }, [persons, searchQuery]);

  const selectedKinshipTitle = useMemo(() => {
    if (!selectedPerson) return "";
    return getKinshipTitle(selectedPerson.id, referenceUserId, persons, marriages);
  }, [selectedPerson, referenceUserId, persons, marriages]);

  return (
    <div className="relative w-full h-screen overflow-hidden flex flex-col clay-bg text-slate-800">
      <header className="z-20 px-4 py-3 m-3 clay-card flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl clay-badge bg-indigo-50 flex items-center justify-center text-indigo-600">
            <Network className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-extrabold text-base tracking-tight text-slate-800 flex items-center gap-1.5">
              FamMap <span className="text-xs font-medium text-slate-500">Genealogy Graph</span>
            </h1>
            <p className="text-[11px] text-slate-500">
              Interactive Family Tree Management & Kinship Calculator
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {persons.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl clay-badge text-xs">
              <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
              <span className="text-slate-500 font-medium">Acuan (&quot;Saya&quot;):</span>
              <select
                value={referenceUserId}
                onChange={(e) => setReferenceUserId(e.target.value)}
                className="bg-transparent font-bold text-indigo-700 outline-none cursor-pointer"
              >
                {persons.map((p) => (
                  <option key={p.id} value={p.id} className="text-slate-800">
                    {p.full_name} ({p.gender === "male" ? "L" : "P"})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="relative">
            <div className="flex items-center gap-1.5 px-3 py-1.5 clay-input text-xs w-48 sm:w-60">
              <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Pencarian semantik kerabat..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent w-full outline-none text-slate-700 placeholder:text-slate-400 text-xs"
              />
            </div>
            {filteredPersons.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 clay-modal p-2 z-30 max-h-48 overflow-y-auto space-y-1">
                {filteredPersons.map((p) => {
                  const title = getKinshipTitle(p.id, referenceUserId, persons, marriages);
                  return (
                    <button
                      key={p.id}
                      onClick={() => {
                        setSelectedPerson(p);
                        setSearchQuery("");
                      }}
                      className="w-full text-left p-2 rounded-lg clay-button text-xs flex items-center justify-between text-slate-700"
                    >
                      <span className="font-semibold">{p.full_name}</span>
                      <span className="text-[10px] text-indigo-600 font-medium">{title}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <button
            onClick={() => setIsAddRootOpen(true)}
            className="py-2 px-3.5 clay-button-primary text-xs font-semibold flex items-center gap-1.5"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Tambah Leluhur</span>
          </button>

        </div>
      </header>

      <main className="relative flex-1 w-full h-full overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-100/50 backdrop-blur-[2px]">
            <div className="clay-card p-4 flex items-center gap-3 text-xs font-semibold text-slate-600">
              <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
              <span>Memuat data silsilah...</span>
            </div>
          </div>
        )}

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.2}
          maxZoom={1.5}
          attributionPosition="bottom-right"
        >
          <Background color="#cbd5e1" gap={24} size={1.5} variant={BackgroundVariant.Dots} />
          <Controls
            className="!m-4 !border-none !rounded-2xl !bg-[#e0e5ec] !shadow-[8px_8px_16px_rgba(0,0,0,0.1),inset_-6px_-6px_12px_rgba(0,0,0,0.1),inset_6px_6px_12px_rgba(255,255,255,0.8)] !p-1.5"
          />
        </ReactFlow>

        <div className="absolute bottom-4 left-4 z-10 hidden sm:flex items-center gap-2 p-2.5 clay-card text-[11px] text-slate-600">
          <span className="font-semibold text-slate-700 mr-1 flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-indigo-500" /> Petunjuk:
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" /> Laki-laki
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" /> Perempuan
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Hidup
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400 inline-block" /> Wafat
          </span>
          <span>•</span>
          <span className="flex items-center gap-1 text-indigo-700 font-medium">
            <Crown className="w-3 h-3 text-amber-500 fill-amber-400" /> Titik Acuan Silsilah
          </span>
        </div>
      </main>

      <MemberDetailModal
        isOpen={Boolean(selectedPerson)}
        onClose={() => setSelectedPerson(null)}
        person={selectedPerson}
        referenceUserId={referenceUserId}
        onSetReferenceUser={handleSetReferenceUser}
        persons={persons}
        marriages={marriages}
        kinshipTitle={selectedKinshipTitle}
        onUpdatePerson={handleUpdatePerson}
        onDeletePerson={handleDeletePerson}
        onAddChild={handleAddChild}
        onAddPartner={handleAddPartner}
        onAddParent={handleAddParent}
      />

      <AddRootMemberModal
        isOpen={isAddRootOpen}
        onClose={() => setIsAddRootOpen(false)}
        onAddMember={handleAddRootMember}
      />
    </div>
  );
}
