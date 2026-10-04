"use client";

import React, { useState } from "react";
import { Person, Marriage, Gender, LifeStatus, ChildStatus, MarriageStatus } from "@/types/family";
import {
  X,
  User,
  Heart,
  UserPlus,
  Edit2,
  Trash2,
  Crown,
  Users,
  Check,
  ShieldAlert,
} from "lucide-react";
import { SearchableSelect, SearchableSelectOption } from "./SearchableSelect";
import { getBirthOrderLabel } from "@/utils/kinship";

interface MemberDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  person: Person | null;
  referenceUserId: string;
  onSetReferenceUser: (id: string) => void;
  persons: Person[];
  marriages: Marriage[];
  kinshipTitle: string;
  onUpdatePerson: (updated: Person) => void;
  onDeletePerson: (id: string) => void;
  onAddChild: (parent: Person, childData: Omit<Person, "id">) => void;
  onAddPartner: (person: Person, partnerData: Omit<Person, "id">, marriageStatus: MarriageStatus) => void;
  onAddExistingPartner: (person: Person, partnerId: string, marriageStatus: MarriageStatus) => void;
  onAddParent: (child: Person, parentData: Omit<Person, "id">, relationType: "father" | "mother") => void;
}

type ModalView = "view" | "edit" | "add_child" | "add_partner" | "add_parent" | "confirm_delete";

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

export function MemberDetailModal({
  isOpen,
  onClose,
  person,
  referenceUserId,
  onSetReferenceUser,
  persons,
  marriages,
  kinshipTitle,
  onUpdatePerson,
  onDeletePerson,
  onAddChild,
  onAddPartner,
  onAddExistingPartner,
  onAddParent,
}: MemberDetailModalProps) {
  const [view, setView] = useState<ModalView>("view");

  if (!isOpen || !person) return null;

  const isReference = person.id === referenceUserId;
  const father = persons.find((p) => p.id === person.father_id);
  const mother = persons.find((p) => p.id === person.mother_id);

  const spouseIds = marriages
    .filter((m) => m.husband_id === person.id || m.wife_id === person.id)
    .map((m) => (m.husband_id === person.id ? m.wife_id : m.husband_id));
  const spouses = persons.filter((p) => spouseIds.includes(p.id));

  const children = persons.filter(
    (p) => p.father_id === person.id || p.mother_id === person.id
  );
  const orderParentId = person.gender === "male" ? person.id : spouses[0]?.id || person.id;
  const suggestedBirthOrder =
    persons
      .filter((p) => p.father_id === orderParentId || p.mother_id === orderParentId)
      .reduce((max, p) => Math.max(max, p.birth_order), 0) + 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg clay-modal p-6 text-slate-800 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between pb-4 border-b border-slate-300/40">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 text-xs font-bold clay-badge text-indigo-700 bg-indigo-50/80 rounded-lg">
              {kinshipTitle}
            </span>
            {isReference && (
              <span className="flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg clay-badge">
                <Crown className="w-3.5 h-3.5 fill-amber-400" /> Pusat Silsilah
              </span>
            )}
          </div>
          <button
            onClick={() => {
              setView("view");
              onClose();
            }}
            className="w-8 h-8 rounded-full clay-button flex items-center justify-center text-slate-500 hover:text-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div
          className="flex-1 overflow-y-auto overscroll-contain py-4 pr-1 space-y-5"
          style={{ scrollbarWidth: "thin", scrollbarColor: "#94a3b8 transparent" }}
        >
          {view === "view" && (
            <>
              <div className="flex items-center gap-4">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center clay-badge ${
                    person.gender === "male"
                      ? "text-blue-600 bg-blue-50/80"
                      : "text-rose-600 bg-rose-50/80"
                  }`}
                >
                  <User className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">{person.full_name}</h2>
                  <p className="text-xs text-slate-500 flex items-center gap-2 mt-1">
                    <span>{person.gender === "male" ? "Laki-laki" : "Perempuan"}</span>
                    <span>•</span>
                    <span>{getBirthOrderLabel(person, persons)}</span>
                    <span>•</span>
                    <span
                      className={`font-medium ${
                        person.life_status === "alive" ? "text-emerald-600" : "text-slate-400"
                      }`}
                    >
                      {person.life_status === "alive" ? "Masih Hidup" : "Sudah Wafat"}
                    </span>
                  </p>
                </div>
              </div>

              {!isReference && (
                <button
                  onClick={() => onSetReferenceUser(person.id)}
                  className="w-full py-2.5 px-4 clay-button text-xs font-semibold text-indigo-700 flex items-center justify-center gap-2 hover:text-indigo-800"
                >
                  <Crown className="w-4 h-4 text-amber-500" />
                  Jadikan Titik Acuan Silsilah (&quot;Saya&quot;)
                </button>
              )}

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 clay-card">
                  <span className="text-slate-400 block text-[11px] mb-1">Ayah</span>
                  <p className="font-semibold text-slate-700">
                    {father ? father.full_name : "- Belum Ada -"}
                  </p>
                </div>
                <div className="p-3 clay-card">
                  <span className="text-slate-400 block text-[11px] mb-1">Ibu</span>
                  <p className="font-semibold text-slate-700">
                    {mother ? mother.full_name : "- Belum Ada -"}
                  </p>
                </div>
                <div className="p-3 clay-card">
                  <span className="text-slate-400 block text-[11px] mb-1">Status Anak</span>
                  <p className="font-semibold text-slate-700 capitalize">
                    {person.child_status === "biological" ? "Kandung" : person.child_status}
                  </p>
                </div>
                <div className="p-3 clay-card">
                  <span className="text-slate-400 block text-[11px] mb-1">Pasangan</span>
                  <p className="font-semibold text-slate-700">
                    {spouses.length > 0
                      ? spouses.map((s) => s.full_name).join(", ")
                      : "- Belum Ada -"}
                  </p>
                </div>
              </div>

              {children.length > 0 && (
                <div className="p-3 clay-card text-xs">
                  <span className="text-slate-400 block text-[11px] mb-2 font-medium">
                    Daftar Anak ({children.length})
                  </span>
                  <div className="space-y-1.5">
                    {children.map((c) => (
                      <div
                        key={c.id}
                        className="flex items-center justify-between p-2 rounded-lg clay-badge text-slate-700"
                      >
                        <span className="font-medium">{c.full_name}</span>
                        <span className="text-[10px] text-slate-400">{getBirthOrderLabel(c, persons)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2 pt-2">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Kelola Hubungan & Data
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setView("add_child")}
                    className="p-2.5 clay-button text-[11px] font-semibold text-slate-700 flex flex-col items-center justify-center gap-1.5"
                  >
                    <UserPlus className="w-4 h-4 text-emerald-600" />
                    Tambah Anak
                  </button>
                  <button
                    onClick={() => setView("add_partner")}
                    className="p-2.5 clay-button text-[11px] font-semibold text-slate-700 flex flex-col items-center justify-center gap-1.5"
                  >
                    <Heart className="w-4 h-4 text-rose-500" />
                    Tambah Pasangan
                  </button>
                  <button
                    onClick={() => setView("add_parent")}
                    className="p-2.5 clay-button text-[11px] font-semibold text-slate-700 flex flex-col items-center justify-center gap-1.5"
                  >
                    <Users className="w-4 h-4 text-blue-600" />
                    Tambah Orang Tua
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-slate-300/40">
                <button
                  onClick={() => setView("edit")}
                  className="flex-1 py-2.5 px-3 clay-button text-xs font-semibold text-slate-700 flex items-center justify-center gap-2"
                >
                  <Edit2 className="w-3.5 h-3.5 text-slate-600" /> Edit Biodata
                </button>
                <button
                  onClick={() => setView("confirm_delete")}
                  className="py-2.5 px-3.5 clay-button-danger text-xs font-semibold flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Hapus
                </button>
              </div>
            </>
          )}

          {view === "edit" && (
            <EditMemberForm
              person={person}
              persons={persons}
              onSave={(updated) => {
                onUpdatePerson(updated);
                setView("view");
              }}
              onCancel={() => setView("view")}
            />
          )}

          {view === "add_child" && (
            <AddChildForm
              parent={person}
              spouses={spouses}
              suggestedBirthOrder={suggestedBirthOrder}
              onSave={(childData) => {
                onAddChild(person, childData);
                setView("view");
              }}
              onCancel={() => setView("view")}
            />
          )}

          {view === "add_partner" && (
            <AddPartnerForm
              person={person}
              persons={persons}
              marriages={marriages}
              onSave={(partnerData, status) => {
                onAddPartner(person, partnerData, status);
                setView("view");
              }}
              onExistingSave={(partnerId, status) => {
                onAddExistingPartner(person, partnerId, status);
                setView("view");
              }}
              onCancel={() => setView("view")}
            />
          )}

          {view === "add_parent" && (
            <AddParentForm
              child={person}
              onSave={(parentData, relationType) => {
                onAddParent(person, parentData, relationType);
                setView("view");
              }}
              onCancel={() => setView("view")}
            />
          )}

          {view === "confirm_delete" && (
            <div className="space-y-4 py-2">
              <div className="w-12 h-12 rounded-2xl mx-auto clay-badge bg-rose-50 flex items-center justify-center text-rose-600">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div className="text-center">
                <h4 className="font-bold text-sm text-slate-800">Hapus Anggota Keluarga?</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Apakah Anda yakin ingin menghapus data <b>{person.full_name}</b>? Tindakan ini
                  akan melepaskan relasi keluarga terkait.
                </p>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => {
                    onDeletePerson(person.id);
                    setView("view");
                    onClose();
                  }}
                  className="flex-1 py-2.5 clay-button-danger text-xs font-semibold flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Ya, Hapus Sekarang
                </button>
                <button
                  onClick={() => setView("view")}
                  className="py-2.5 px-4 clay-button text-xs font-semibold text-slate-600"
                >
                  Batal
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EditMemberForm({
  person,
  persons,
  onSave,
  onCancel,
}: {
  person: Person;
  persons: Person[];
  onSave: (updated: Person) => void;
  onCancel: () => void;
}) {
  const [fullName, setFullName] = useState(person.full_name);
  const [gender, setGender] = useState<Gender>(person.gender);
  const [birthOrder, setBirthOrder] = useState(String(person.birth_order));
  const [lifeStatus, setLifeStatus] = useState<LifeStatus>(person.life_status);
  const [childStatus, setChildStatus] = useState<ChildStatus>(person.child_status);
  const [fatherId, setFatherId] = useState<string>(person.father_id || "");
  const [motherId, setMotherId] = useState<string>(person.mother_id || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    onSave({
      ...person,
      full_name: fullName.trim(),
      gender,
      birth_order: Number(birthOrder) || 1,
      life_status: lifeStatus,
      child_status: childStatus,
      father_id: fatherId || null,
      mother_id: motherId || null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="font-bold text-sm text-slate-800">Ubah Biodata Anggota</h3>
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">
          Nama Lengkap
        </label>
        <input
          type="text"
          required
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
            Urutan Lahir (Anak ke-)
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

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Ayah</label>
          <SearchableSelect
            value={fatherId}
            onChange={setFatherId}
            options={[
              { value: "", label: "- Tidak Ada -" },
              ...persons
                .filter((p) => p.gender === "male" && p.id !== person.id)
                .map((p) => ({ value: p.id, label: p.full_name })),
            ]}
            className="w-full px-3 py-2 text-xs clay-input text-slate-800"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Ibu</label>
          <SearchableSelect
            value={motherId}
            onChange={setMotherId}
            options={[
              { value: "", label: "- Tidak Ada -" },
              ...persons
                .filter((p) => p.gender === "female" && p.id !== person.id)
                .map((p) => ({ value: p.id, label: p.full_name })),
            ]}
            className="w-full px-3 py-2 text-xs clay-input text-slate-800"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 pt-2">
        <button
          type="submit"
          className="flex-1 py-2.5 clay-button-primary text-xs font-semibold flex items-center justify-center gap-1.5"
        >
          <Check className="w-3.5 h-3.5" /> Simpan
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="py-2.5 px-4 clay-button text-xs font-semibold text-slate-600"
        >
          Batal
        </button>
      </div>
    </form>
  );
}

function AddChildForm({
  parent,
  spouses,
  suggestedBirthOrder,
  onSave,
  onCancel,
}: {
  parent: Person;
  spouses: Person[];
  suggestedBirthOrder: number;
  onSave: (data: Omit<Person, "id">) => void;
  onCancel: () => void;
}) {
  const [fullName, setFullName] = useState("");
  const [gender, setGender] = useState<Gender>("male");
  const [birthOrder, setBirthOrder] = useState(String(suggestedBirthOrder));
  const [lifeStatus, setLifeStatus] = useState<LifeStatus>("alive");
  const [childStatus, setChildStatus] = useState<ChildStatus>("biological");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    const otherParent = spouses[0]?.id || null;
    const fatherId = parent.gender === "male" ? parent.id : otherParent;
    const motherId = parent.gender === "female" ? parent.id : otherParent;

    onSave({
      full_name: fullName.trim(),
      gender,
      birth_order: Number(birthOrder) || 1,
      life_status: lifeStatus,
      child_status: childStatus,
      father_id: fatherId,
      mother_id: motherId,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="font-bold text-sm text-slate-800">
        Tambah Anak dari {parent.full_name}
      </h3>
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">
          Nama Lengkap Anak
        </label>
        <input
          type="text"
          required
          placeholder="Contoh: Budi Soediro"
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
            Urutan Lahir (Anak ke-)
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

      <div className="flex items-center gap-2 pt-2">
        <button
          type="submit"
          className="flex-1 py-2.5 clay-button-primary text-xs font-semibold flex items-center justify-center gap-1.5"
        >
          <UserPlus className="w-3.5 h-3.5" /> Tambahkan Anak
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="py-2.5 px-4 clay-button text-xs font-semibold text-slate-600"
        >
          Batal
        </button>
      </div>
    </form>
  );
}

function AddPartnerForm({
  person,
  persons,
  marriages,
  onSave,
  onExistingSave,
  onCancel,
}: {
  person: Person;
  persons: Person[];
  marriages: Marriage[];
  onSave: (data: Omit<Person, "id">, status: MarriageStatus) => void;
  onExistingSave: (partnerId: string, status: MarriageStatus) => void;
  onCancel: () => void;
}) {
  const [fullName, setFullName] = useState("");
  const [birthOrder, setBirthOrder] = useState("1");
  const [lifeStatus, setLifeStatus] = useState<LifeStatus>("alive");
  const [existingPartnerId, setExistingPartnerId] = useState("");

  const spouseIds = new Set(
    marriages
      .filter((m) => m.husband_id === person.id || m.wife_id === person.id)
      .map((m) => (m.husband_id === person.id ? m.wife_id : m.husband_id))
  );
  const existingPartnerOptions: SearchableSelectOption[] = [
    { value: "", label: "Tambah pasangan baru" },
    ...persons
      .filter(
        (p) =>
          p.id !== person.id &&
          p.gender !== person.gender &&
          !spouseIds.has(p.id)
      )
      .map((p) => ({
        value: p.id,
        label: `${p.full_name} · ${p.gender === "male" ? "Laki-laki" : "Perempuan"}`,
      })),
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (existingPartnerId) {
      onExistingSave(existingPartnerId, "married");
      return;
    }
    if (!fullName.trim()) return;

    onSave(
      {
        full_name: fullName.trim(),
        gender: person.gender === "male" ? "female" : "male",
        birth_order: Number(birthOrder) || 1,
        life_status: lifeStatus,
        child_status: "biological",
        father_id: null,
        mother_id: null,
      },
      "married"
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="font-bold text-sm text-slate-800">
        Tambah Pasangan untuk {person.full_name}
      </h3>
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">
          Pasangan yang Sudah Ada
        </label>
        <SearchableSelect
          value={existingPartnerId}
          onChange={setExistingPartnerId}
          options={existingPartnerOptions}
          placeholder="Cari profil pasangan..."
          className="w-full px-3 py-2 text-xs clay-input text-slate-800"
        />
      </div>

      {!existingPartnerId && (
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Nama Lengkap Pasangan
          </label>
          <input
            type="text"
            required
            placeholder="Contoh: Siti Rahma"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full px-3 py-2 text-xs clay-input text-slate-800"
          />
        </div>
      )}

      {!existingPartnerId && <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Jenis Kelamin
          </label>
          <input
            type="text"
            disabled
            value={person.gender === "male" ? "Perempuan (Istri)" : "Laki-laki (Suami)"}
            className="w-full px-3 py-2 text-xs clay-input text-slate-500 bg-slate-200/50"
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
      </div>}

      {!existingPartnerId && <div className="grid grid-cols-2 gap-3">
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
      </div>}

      <div className="flex items-center gap-2 pt-2">
        <button
          type="submit"
          className="flex-1 py-2.5 clay-button-primary text-xs font-semibold flex items-center justify-center gap-1.5"
        >
          <Heart className="w-3.5 h-3.5" /> Tambahkan Pasangan
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="py-2.5 px-4 clay-button text-xs font-semibold text-slate-600"
        >
          Batal
        </button>
      </div>
    </form>
  );
}

function AddParentForm({
  child,
  onSave,
  onCancel,
}: {
  child: Person;
  onSave: (data: Omit<Person, "id">, relationType: "father" | "mother") => void;
  onCancel: () => void;
}) {
  const [parentType, setParentType] = useState<"father" | "mother">(
    child.father_id ? "mother" : "father"
  );
  const [fullName, setFullName] = useState("");
  const [birthOrder, setBirthOrder] = useState("1");
  const [lifeStatus, setLifeStatus] = useState<LifeStatus>("alive");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    onSave(
      {
        full_name: fullName.trim(),
        gender: parentType === "father" ? "male" : "female",
        birth_order: Number(birthOrder) || 1,
        life_status: lifeStatus,
        child_status: "biological",
        father_id: null,
        mother_id: null,
      },
      parentType
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="font-bold text-sm text-slate-800">
        Tambah Orang Tua untuk {child.full_name}
      </h3>
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">
          Sebagai
        </label>
        <SearchableSelect
          value={parentType}
          onChange={(value) => setParentType(value as "father" | "mother")}
          options={[
            {
              value: "father",
              label: `Ayah ${child.father_id ? "(Sudah Ada)" : ""}`,
              disabled: Boolean(child.father_id),
            },
            {
              value: "mother",
              label: `Ibu ${child.mother_id ? "(Sudah Ada)" : ""}`,
              disabled: Boolean(child.mother_id),
            },
          ]}
          className="w-full px-3 py-2 text-xs clay-input text-slate-800"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">
          Nama Lengkap Orang Tua
        </label>
        <input
          type="text"
          required
          placeholder="Contoh: Raden Soediro"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full px-3 py-2 text-xs clay-input text-slate-800"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
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
      </div>

      <div className="flex items-center gap-2 pt-2">
        <button
          type="submit"
          className="flex-1 py-2.5 clay-button-primary text-xs font-semibold flex items-center justify-center gap-1.5"
        >
          <Users className="w-3.5 h-3.5" /> Tambahkan Orang Tua
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="py-2.5 px-4 clay-button text-xs font-semibold text-slate-600"
        >
          Batal
        </button>
      </div>
    </form>
  );
}
