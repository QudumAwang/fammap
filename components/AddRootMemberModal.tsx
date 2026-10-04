"use client";

import React, { useState } from "react";
import { Person, Gender, LifeStatus, ChildStatus } from "@/types/family";
import { X, UserPlus } from "lucide-react";
import { SearchableSelect, SearchableSelectOption } from "./SearchableSelect";

const genderOptions: SearchableSelectOption[] = [
  { value: "male", label: "Laki-laki" },
  { value: "female", label: "Perempuan" },
];
const lifeStatusOptions: SearchableSelectOption[] = [
  { value: "alive", label: "Masih Hidup" },
  { value: "deceased", label: "Wafat" },
];
const childStatusOptions: SearchableSelectOption[] = [
  { value: "biological", label: "Kandung" },
  { value: "adopted", label: "Adopsi" },
  { value: "step", label: "Tiri" },
];

interface AddRootMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMember: (memberData: Omit<Person, "id">) => void;
}

export function AddRootMemberModal({
  isOpen,
  onClose,
  onAddMember,
}: AddRootMemberModalProps) {
  const [fullName, setFullName] = useState("");
  const [gender, setGender] = useState<Gender>("male");
  const [birthOrder, setBirthOrder] = useState("1");
  const [lifeStatus, setLifeStatus] = useState<LifeStatus>("alive");
  const [childStatus, setChildStatus] = useState<ChildStatus>("biological");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    onAddMember({
      full_name: fullName.trim(),
      gender,
      birth_order: Number(birthOrder) || 1,
      life_status: lifeStatus,
      child_status: childStatus,
      father_id: null,
      mother_id: null,
    });

    setFullName("");
    setBirthOrder("1");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md clay-modal p-6 text-slate-800 flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-slate-300/40">
          <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-indigo-600" /> Tambah Anggota Pokok / Leluhur
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full clay-button flex items-center justify-center text-slate-500 hover:text-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Nama Lengkap
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Raden Mas Soediro"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-2 text-xs clay-input text-slate-800"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Jenis Kelamin
              </label>
              <SearchableSelect
                value={gender}
                onChange={(value) => setGender(value as Gender)}
                options={genderOptions}
                className="w-full px-3 py-2 text-xs clay-input text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Urutan Lahir
              </label>
              <input
                type="number"
                min={1}
                value={birthOrder}
                onChange={(e) => setBirthOrder(e.target.value)}
                className="w-full px-3 py-2 text-xs clay-input text-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Status Hidup
              </label>
              <SearchableSelect
                value={lifeStatus}
                onChange={(value) => setLifeStatus(value as LifeStatus)}
                options={lifeStatusOptions}
                className="w-full px-3 py-2 text-xs clay-input text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Status Anak
              </label>
              <SearchableSelect
                value={childStatus}
                onChange={(value) => setChildStatus(value as ChildStatus)}
                options={childStatusOptions}
                className="w-full px-3 py-2 text-xs clay-input text-slate-800"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-3">
            <button
              type="submit"
              className="flex-1 py-2.5 clay-button-primary text-xs font-semibold flex items-center justify-center gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" /> Tambahkan
            </button>
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 clay-button text-xs font-semibold text-slate-600"
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
