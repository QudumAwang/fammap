"use client";

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export interface SearchableSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SearchableSelectProps {
  value: string;
  options: SearchableSelectOption[];
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
}

export function SearchableSelect({
  value,
  options,
  onChange,
  className = "",
  placeholder = "Pilih...",
}: SearchableSelectProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
    maxHeight: 240,
  });
  const selectedOption = options.find((option) => option.value === value);
  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!containerRef.current?.contains(target) && !dropdownRef.current?.contains(target)) {
        setIsOpen(false);
        setQuery("");
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  const updateDropdownPosition = useCallback(() => {
    const input = containerRef.current?.querySelector("input");
    if (!input) return;

    const rect = input.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom - 8;
    const spaceAbove = rect.top - 8;
    const openAbove = spaceBelow < 180 && spaceAbove > spaceBelow;
    const maxHeight = Math.max(120, Math.min(240, openAbove ? spaceAbove : spaceBelow));

    setDropdownPosition({
      top: openAbove ? rect.top - maxHeight - 4 : rect.bottom + 4,
      left: rect.left,
      width: rect.width,
      maxHeight,
    });
  }, []);

  useLayoutEffect(() => {
    if (!isOpen) return;

    updateDropdownPosition();
    window.addEventListener("resize", updateDropdownPosition);
    window.addEventListener("scroll", updateDropdownPosition, true);
    return () => {
      window.removeEventListener("resize", updateDropdownPosition);
      window.removeEventListener("scroll", updateDropdownPosition, true);
    };
  }, [isOpen, updateDropdownPosition]);

  const selectOption = (option: SearchableSelectOption) => {
    if (option.disabled) return;
    onChange(option.value);
    setIsOpen(false);
    setQuery("");
  };

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        value={isOpen ? query : selectedOption?.label || ""}
        placeholder={placeholder}
        onFocus={() => {
          setQuery("");
          setIsOpen(true);
        }}
        onChange={(event) => {
          setQuery(event.target.value);
          setIsOpen(true);
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            setIsOpen(false);
            setQuery("");
          }
          if (event.key === "Enter") {
            const option = filteredOptions.find((item) => !item.disabled);
            if (option) {
              event.preventDefault();
              selectOption(option);
            }
          }
        }}
        className={className}
      />
      {isOpen && typeof document !== "undefined" &&
        createPortal(
          <div
            ref={dropdownRef}
            className="fixed z-[100] overflow-y-auto clay-modal p-1.5 space-y-1"
            style={{
              top: dropdownPosition.top,
              left: dropdownPosition.left,
              width: dropdownPosition.width,
              maxHeight: dropdownPosition.maxHeight,
              scrollbarWidth: "thin",
              scrollbarColor: "#94a3b8 transparent",
            }}
          >
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <button
                  key={option.value || "empty"}
                  type="button"
                  disabled={option.disabled}
                  onClick={() => selectOption(option)}
                  className="w-full rounded-lg px-2.5 py-2 text-left text-xs text-slate-700 hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {option.label}
                </button>
              ))
            ) : (
              <p className="px-2.5 py-2 text-xs text-slate-400">Tidak ada pilihan</p>
            )}
          </div>,
          document.body
        )}
    </div>
  );
}
