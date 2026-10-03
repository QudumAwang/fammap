"use client";

import React, { memo } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { Person } from "@/types/family";
import { User, Crown } from "lucide-react";

export interface FamilyNodeData {
  person: Person;
  kinshipTitle: string;
  isReference: boolean;
  onSelect: (person: Person) => void;
}

function FamilyMemberNodeComponent({ data, selected }: NodeProps) {
  const nodeData = data as unknown as FamilyNodeData;
  const { person, kinshipTitle, isReference, onSelect } = nodeData;

  const isMale = person.gender === "male";
  const isDeceased = person.life_status === "deceased";

  return (
    <div
      onClick={() => onSelect(person)}
      className={`relative w-64 p-4 clay-card transition-all duration-200 cursor-pointer select-none text-slate-800 ${
        isReference
          ? "ring-2 ring-indigo-400/80 shadow-[0_0_20px_rgba(99,102,241,0.25)]"
          : ""
      } ${selected ? "scale-105" : "hover:scale-[1.02]"}`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-slate-400 !border-2 !border-white !-top-1.5 shadow-sm"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-slate-400 !border-2 !border-white !-bottom-1.5 shadow-sm"
      />
      <Handle
        type="source"
        id="right"
        position={Position.Right}
        className="!w-2.5 !h-2.5 !bg-rose-300 !border !border-white !-right-1 shadow-sm"
      />
      <Handle
        type="target"
        id="left"
        position={Position.Left}
        className="!w-2.5 !h-2.5 !bg-rose-300 !border !border-white !-left-1 shadow-sm"
      />

      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-1.5">
          <span
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg clay-badge ${
              isReference
                ? "bg-indigo-100 text-indigo-700 font-bold"
                : "text-slate-700"
            }`}
          >
            {isReference ? "Saya (Acuan)" : kinshipTitle}
          </span>
          {isReference && (
            <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <span
            className={`w-2 h-2 rounded-full ${
              isDeceased ? "bg-slate-400" : "bg-emerald-500"
            }`}
            title={isDeceased ? "Wafat" : "Hidup"}
          />
          <span className="text-[10px] font-medium text-slate-500">
            {isDeceased ? "Wafat" : "Hidup"}
          </span>
        </div>
      </div>

      <div className="flex items-start gap-3">
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 clay-badge ${
            isMale ? "text-blue-600 bg-blue-50/70" : "text-rose-600 bg-pink-50/70"
          }`}
        >
          <User className="w-6 h-6" />
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-sm leading-tight text-slate-800 truncate" title={person.full_name}>
            {person.full_name}
          </h3>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
            <span>Anak ke-{person.birth_order}</span>
            <span>•</span>
            <span className="capitalize">{person.gender === "male" ? "Laki-laki" : "Perempuan"}</span>
          </p>
        </div>
      </div>

      <div className="mt-3 pt-2.5 border-t border-slate-300/40 flex items-center justify-between text-[11px] text-slate-500">
        <span className="truncate">
          {person.child_status === "biological" ? "Anak Kandung" : "Anak Adopsi"}
        </span>
        <span className="text-[10px] text-indigo-600 font-medium hover:underline">
          Detail ↗
        </span>
      </div>
    </div>
  );
}

export const FamilyMemberNode = memo(FamilyMemberNodeComponent);
