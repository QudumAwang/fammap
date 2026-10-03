"use client";

import React, { useEffect, useRef, useState } from "react";

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
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const selectedOption = options.find((option) => option.value === value);
  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
        setQuery("");
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

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
      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-48 overflow-y-auto clay-modal p-1.5 space-y-1">
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
        </div>
      )}
    </div>
  );
}
