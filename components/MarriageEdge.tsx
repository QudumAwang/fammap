"use client";

import React from "react";
import { BaseEdge, EdgeProps, getStraightPath, EdgeLabelRenderer } from "@xyflow/react";
import { Heart } from "lucide-react";

export function MarriageEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  style = {},
  markerEnd,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          stroke: "#f43f5e",
          strokeWidth: 2,
          strokeDasharray: "4 3",
          ...style,
        }}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: "all",
          }}
          className="w-5 h-5 rounded-full clay-badge bg-rose-50 flex items-center justify-center shadow-sm"
        >
          <Heart className="w-2.5 h-2.5 text-rose-500 fill-rose-500" />
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
