import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CheckCircle2,
  ClipboardList,
  Copy,
  ExternalLink,
  FileText,
  Folder,
  GripVertical,
  Link2,
  Pin,
  Plus,
  Save,
  StickyNote,
  Trash2,
  X,
} from "lucide-react";
import { supabase } from "./supabaseClient";

const CANVAS_TABLE = "canvas_notes";
const STORAGE_KEY = "systemadf_canvas_notes_full_v3"; // keep key so existing notes stay
const SCOPE_KEY = "systemadf_canvas_scope_full_v3";

const SCOPES = ["ADF", "realme", "AKASO", "Personal"];
const NOTE_TYPES = [
  { key: "memo", label: "Memo", icon: StickyNote },
  { key: "link", label: "Link", icon: Link2 },
  { key: "checklist", label: "Checklist", icon: CheckCircle2 },
  { key: "price", label: "Price", icon: FileText },
  { key: "compare", label: "Compare", icon: ClipboardList },
  { key: "board", label: "Board", icon: Folder },
];

const COLORS = {
  blue: {
    name: "Blue",
    dot: "bg-blue-600",
    border: "border-blue-200",
    strip: "bg-blue-500",
    chip: "bg-blue-50 text-blue-700",
    shadow: "shadow-[0_24px_80px_rgba(37,99,235,.12)]",
  },
  orange: {
    name: "Orange",
    dot: "bg-orange-500",
    border: "border-orange-200",
    strip: "bg-orange-500",
    chip: "bg-orange-50 text-orange-700",
    shadow: "shadow-[0_24px_80px_rgba(249,115,22,.12)]",
  },
  green: {
    name: "Green",
    dot: "bg-emerald-600",
    border: "border-emerald-200",
    strip: "bg-emerald-500",
    chip: "bg-emerald-50 text-emerald-700",
    shadow: "shadow-[0_24px_80px_rgba(16,185,129,.12)]",
  },
  purple: {
    name: "Purple",
    dot: "bg-violet-600",
    border: "border-violet-200",
    strip: "bg-violet-500",
    chip: "bg-violet-50 text-violet-700",
    shadow: "shadow-[0_24px_80px_rgba(124,58,237,.12)]",
  },
  black: {
    name: "Black",
    dot: "bg-neutral-950",
    border: "border-neutral-200",
    strip: "bg-neutral-950",
    chip: "bg-neutral-100 text-neutral-900",
    shadow: "shadow-[0_24px_80px_rgba(0,0,0,.10)]",
  },
  red: {
    name: "Red",
    dot: "bg-red-600",
    border: "border-red-200",
    strip: "bg-red-500",
    chip: "bg-red-50 text-red-700",
    shadow: "shadow-[0_24px_80px_rgba(239,68,68,.12)]",
  },
};

const STYLE_OPTIONS = ["Clean", "Bold", "Soft", "Mono"];

const uid = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const nowLabel = () =>
  new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

function emptyDraft(scope = "Personal") {
  return {
    id: null,
    title: "",
    body: "",
    type: "memo",
    scope,
    color: "blue",
    style: "Clean",
    pinned: false,
    linkLabel: "",
    linkUrl: "",
    checklistRows: [
      { id: uid(), label: "", done: false },
      { id: uid(), label: "", done: false },
    ],
    priceRows: [
      { id: uid(), sku: "", srp: "", promo: "", period: "" },
      { id: uid(), sku: "", srp: "", promo: "", period: "" },
    ],
    compareRows: [
      { id: uid(), item: "", before: "", after: "", note: "" },
      { id: uid(), item: "", before: "", after: "", note: "" },
    ],
    boardRows: [
      { id: uid(), todo: "", doing: "", done: "" },
      { id: uid(), todo: "", doing: "", done: "" },
    ],
  };
}

const seedNotes = () => [
  {
    id: uid(),
    title: "Daily Material Check",
    body: "Before sending any link, make sure design, price, period, and platform placement are correct.",
    type: "memo",
    scope: "Personal",
    color: "blue",
    style: "Clean",
    pinned: false,
    x: 70,
    y: 220,
    updatedAt: nowLabel(),
  },
  {
    id: uid(),
    title: "Request Status Flow",
    body: "Admin can accept, read, revise, and mark done from Manage mode.",
    type: "checklist",
    scope: "ADF",
    color: "orange",
    style: "Clean",
    pinned: false,
    x: 450,
    y: 220,
    updatedAt: nowLabel(),
    checklistRows: [
      { id: uid(), label: "Waiting for Accepted", done: false },
      { id: uid(), label: "Read / Pending", done: true },
      { id: uid(), label: "Revise / Done", done: false },
    ],
  },
  {
    id: uid(),
    title: "Asset Link Rule",
    body: "Asset link editor uses code ADF and supports Folder with many Sub Folders.",
    type: "memo",
    scope: "Personal",
    color: "green",
    style: "Clean",
    pinned: true,
    x: 900,
    y: 130,
    updatedAt: nowLabel(),
  },
  {
    id: uid(),
    title: "P4 Series Price",
    body: "Promo pricing reference for launch alignment.",
    type: "price",
    scope: "realme",
    color: "red",
    style: "Clean",
    pinned: false,
    x: 90,
    y: 520,
    updatedAt: nowLabel(),
    priceRows: [
      { id: uid(), sku: "P4X 4+128", srp: "2.499K", promo: "Disc up to 25%", period: "7–13 July" },
      { id: uid(), sku: "P4 Lite 4+64", srp: "1.999K", promo: "Disc up to 25%", period: "7–13 July" },
    ],
  },
  {
    id: uid(),
    title: "Platform Compare",
    body: "Use this for comparing banner copy / SKU / promo between platforms.",
    type: "compare",
    scope: "realme",
    color: "purple",
    style: "Clean",
    pinned: false,
    x: 610,
    y: 520,
    updatedAt: nowLabel(),
    compareRows: [
      { id: uid(), item: "Tokopedia", before: "Old price copy", after: "New 7.7 promo", note: "Need align with LP" },
      { id: uid(), item: "TikTok", before: "No voucher", after: "Live voucher", note: "Check NAD wording" },
    ],
  },
];

function safeParse(raw) {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function normalizeNote(note, index = 0) {
  return {
    id: note.id || uid(),
    title: note.title || "Untitled note",
    body: note.body || "",
    type: note.type || "memo",
    scope: note.scope || "Personal",
    color: note.color || "blue",
    style: note.style || "Clean",
    pinned: Boolean(note.pinned),
    linkLabel: note.linkLabel || "Open link",
    linkUrl: note.linkUrl || "",
    checklistRows: Array.isArray(note.checklistRows) ? note.checklistRows : [],
    priceRows: Array.isArray(note.priceRows) ? note.priceRows : [],
    compareRows: Array.isArray(note.compareRows) ? note.compareRows : [],
    boardRows: Array.isArray(note.boardRows) ? note.boardRows : [],
    x: Number.isFinite(note.x) ? note.x : 80 + (index % 3) * 420,
    y: Number.isFinite(note.y) ? note.y : 180 + Math.floor(index / 3) * 280,
    updatedAt: note.updatedAt || nowLabel(),
  };
}

function dbRowToNote(row, index = 0) {
  return normalizeNote(
    {
      id: row.id,
      title: row.title,
      body: row.body,
      type: row.type,
      scope: row.scope,
      color: row.color,
      style: row.style,
      pinned: row.pinned,
      linkLabel: row.link_label,
      linkUrl: row.link_url,
      checklistRows: row.checklist_rows,
      priceRows: row.price_rows,
      compareRows: row.compare_rows,
      boardRows: row.board_rows,
      x: Number(row.x),
      y: Number(row.y),
      updatedAt: row.updated_at
        ? new Date(row.updated_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
        : nowLabel(),
    },
    index
  );
}

function noteToDbRow(note) {
  const clean = normalizeNote(note);
  return {
    id: clean.id,
    title: clean.title,
    body: clean.body,
    type: clean.type,
    scope: clean.scope,
    color: clean.color,
    style: clean.style,
    pinned: Boolean(clean.pinned),
    x: Math.round(Number(clean.x) || 0),
    y: Math.round(Number(clean.y) || 0),
    link_label: clean.linkLabel || "Open link",
    link_url: clean.linkUrl || "",
    checklist_rows: clean.checklistRows || [],
    price_rows: clean.priceRows || [],
    compare_rows: clean.compareRows || [],
    board_rows: clean.boardRows || [],
    updated_at: new Date().toISOString(),
  };
}

function countFilledRows(rows, keys) {
  return (rows || []).filter((row) => keys.some((key) => String(row?.[key] || "").trim())).length;
}

function noteWidth(type) {
  if (type === "price" || type === "compare") return 470;
  if (type === "board") return 540;
  if (type === "checklist") return 390;
  return 360;
}

function NoteTypeIcon({ type, size = 15 }) {
  const match = NOTE_TYPES.find((item) => item.key === type) || NOTE_TYPES[0];
  const Icon = match.icon;
  return <Icon size={size} />;
}

function ScopePill({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-5 py-2 text-sm font-medium shadow-sm transition ${
        active ? "bg-neutral-950 text-white" : "border border-black/5 bg-white text-neutral-700 hover:bg-neutral-50"
      }`}
    >
      {children}
    </button>
  );
}

function MiniButton({ active, children, onClick, className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl px-4 py-3 text-sm font-medium transition ${
        active ? "bg-neutral-950 text-white shadow-lg" : "bg-white/70 text-neutral-600 hover:bg-white"
      } ${className}`}
    >
      {children}
    </button>
  );
}

function TextInput({ value, onChange, placeholder, className = "" }) {
  return (
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className={`w-full rounded-[18px] border border-black/5 bg-white px-4 py-3 text-sm font-medium outline-none transition placeholder:text-neutral-400 focus:border-black/20 ${className}`}
    />
  );
}

function TextArea({ value, onChange, placeholder, className = "" }) {
  return (
    <textarea
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className={`min-h-[190px] w-full resize-none rounded-[24px] border border-black/5 bg-white px-4 py-4 text-sm leading-6 outline-none transition placeholder:text-neutral-400 focus:border-black/20 ${className}`}
    />
  );
}

function SmallRowButton({ children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full border border-black/5 bg-white px-3 py-2 text-xs font-medium text-neutral-600 shadow-sm transition hover:bg-neutral-950 hover:text-white"
    >
      {children}
    </button>
  );
}

function HeaderCell({ children }) {
  return <div className="text-[10px] font-medium uppercase tracking-[0.14em] text-neutral-400">{children}</div>;
}

function CellInput({ value, onChange, placeholder }) {
  return (
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="min-w-0 rounded-xl border border-black/5 bg-white px-3 py-2 text-xs font-medium outline-none placeholder:text-neutral-300 focus:border-black/20"
    />
  );
}

function TablePreview({ rows, columns }) {
  const visibleRows = (rows || []).filter((row) => columns.some((col) => String(row[col.key] || "").trim()));

  if (!visibleRows.length) {
    return <p className="mt-3 text-sm text-neutral-400">No table data yet.</p>;
  }

  return (
    <div className="mt-4 overflow-hidden rounded-[20px] border border-black/5 bg-white">
      <div className="grid bg-neutral-50" style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}>
        {columns.map((col) => (
          <div key={col.key} className="border-r border-black/5 px-3 py-2 text-[10px] font-medium uppercase tracking-[0.12em] text-neutral-400 last:border-r-0">
            {col.label}
          </div>
        ))}
      </div>
      {visibleRows.slice(0, 5).map((row) => (
        <div key={row.id} className="grid border-t border-black/5" style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}>
          {columns.map((col) => (
            <div key={col.key} className="min-h-[40px] border-r border-black/5 px-3 py-2 text-xs font-medium text-neutral-700 last:border-r-0">
              {row[col.key] || "—"}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function BoardPreview({ rows }) {
  const columns = [
    { key: "todo", label: "Todo" },
    { key: "doing", label: "Doing" },
    { key: "done", label: "Done" },
  ];

  return (
    <div className="mt-4 grid grid-cols-3 gap-2">
      {columns.map((col) => (
        <div key={col.key} className="rounded-[18px] bg-neutral-50 p-3">
          <div className="mb-2 text-[10px] font-medium uppercase tracking-[0.12em] text-neutral-400">{col.label}</div>
          {(rows || [])
            .filter((row) => String(row[col.key] || "").trim())
            .slice(0, 4)
            .map((row) => (
              <div key={`${row.id}-${col.key}`} className="mb-2 rounded-xl bg-white px-3 py-2 text-xs font-medium text-neutral-700 shadow-sm">
                {row[col.key]}
              </div>
            ))}
        </div>
      ))}
    </div>
  );
}

function CanvasCard({ note, selected, dragging, onSelect, onEdit, onDelete, onTogglePin, onDragStart }) {
  const color = COLORS[note.color] || COLORS.blue;
  const width = noteWidth(note.type);
  const typeLabel = NOTE_TYPES.find((item) => item.key === note.type)?.label || "Memo";

  return (
    <article
      onClick={() => onSelect(note.id)}
      className={`absolute rounded-[28px] border bg-white/95 p-5 backdrop-blur-xl transition ${color.border} ${color.shadow} ${
        selected ? "ring-2 ring-neutral-950/10" : "hover:-translate-y-0.5"
      } ${dragging ? "z-50 cursor-grabbing select-none" : "z-10"}`}
      style={{ left: note.x, top: note.y, width }}
    >
      <div className={`absolute left-0 top-0 h-2 w-full rounded-t-[28px] ${color.strip}`} />
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onPointerDown={(event) => onDragStart(note.id, event)}
            onClick={(event) => event.stopPropagation()}
            className="grid h-9 w-9 cursor-grab place-items-center rounded-2xl bg-neutral-100 text-neutral-400 active:cursor-grabbing"
            title="Drag card"
          >
            <GripVertical size={16} />
          </button>
          <div className="grid h-9 w-9 place-items-center rounded-2xl bg-neutral-100 text-neutral-500">
            <NoteTypeIcon type={note.type} />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onTogglePin(note.id);
            }}
            className={`grid h-9 w-9 place-items-center rounded-2xl transition ${note.pinned ? "bg-neutral-950 text-white" : "bg-neutral-100 text-neutral-400"}`}
            title="Pin note"
          >
            <Pin size={14} />
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onEdit(note);
            }}
            className="rounded-2xl bg-neutral-100 px-4 py-2 text-xs font-medium text-neutral-600 transition hover:bg-neutral-950 hover:text-white"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onDelete(note.id);
            }}
            className="grid h-9 w-9 place-items-center rounded-2xl bg-red-50 text-red-500 transition hover:bg-red-500 hover:text-white"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className={`rounded-full px-3 py-1 text-[11px] font-medium ${color.chip}`}>{typeLabel}</span>
        <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-500">{note.scope}</span>
        {note.pinned && <span className="rounded-full bg-neutral-950 px-3 py-1 text-xs font-medium text-white">pinned</span>}
      </div>

      <h3 className="mt-4 text-[22px] font-semibold leading-tight tracking-[-0.035em] text-neutral-950">{note.title}</h3>
      {note.body && <p className="mt-3 whitespace-pre-line text-[13px] font-normal leading-6 text-neutral-600">{note.body}</p>}

      {note.type === "link" && note.linkUrl && (
        <a
          href={note.linkUrl}
          target="_blank"
          rel="noreferrer"
          onClick={(event) => event.stopPropagation()}
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-neutral-950 px-4 py-2 text-xs font-medium text-white"
        >
          <ExternalLink size={13} /> {note.linkLabel || "Open link"}
        </a>
      )}

      {note.type === "checklist" && (
        <div className="mt-4 space-y-2">
          {(note.checklistRows || []).filter((row) => row.label).slice(0, 6).map((row) => (
            <div key={row.id} className="flex items-center gap-3 rounded-2xl bg-neutral-50 px-3 py-2">
              <span className={`grid h-5 w-5 place-items-center rounded-full border ${row.done ? "border-emerald-500 bg-emerald-500 text-white" : "border-neutral-300 bg-white"}`}>
                {row.done && <CheckCircle2 size={13} />}
              </span>
              <span className={`text-sm font-semibold ${row.done ? "text-neutral-400 line-through" : "text-neutral-700"}`}>{row.label}</span>
            </div>
          ))}
        </div>
      )}

      {note.type === "price" && (
        <TablePreview
          rows={note.priceRows}
          columns={[
            { key: "sku", label: "SKU" },
            { key: "srp", label: "SRP" },
            { key: "promo", label: "Promo" },
            { key: "period", label: "Period" },
          ]}
        />
      )}

      {note.type === "compare" && (
        <TablePreview
          rows={note.compareRows}
          columns={[
            { key: "item", label: "Item" },
            { key: "before", label: "Before" },
            { key: "after", label: "After" },
            { key: "note", label: "Note" },
          ]}
        />
      )}

      {note.type === "board" && <BoardPreview rows={note.boardRows} />}
    </article>
  );
}

function EditableRows({ type, draft, setDraft }) {
  if (type === "checklist") {
    const rows = draft.checklistRows || [];
    return (
      <div className="rounded-[26px] bg-white/50 p-3">
        <div className="mb-3 flex items-center justify-between">
          <HeaderCell>Checklist items</HeaderCell>
          <SmallRowButton onClick={() => setDraft((prev) => ({ ...prev, checklistRows: [...prev.checklistRows, { id: uid(), label: "", done: false }] }))}>+ Item</SmallRowButton>
        </div>
        <div className="space-y-2">
          {rows.map((row, index) => (
            <div key={row.id} className="grid grid-cols-[34px_1fr_32px] items-center gap-2">
              <button
                type="button"
                onClick={() => setDraft((prev) => ({
                  ...prev,
                  checklistRows: prev.checklistRows.map((item) => (item.id === row.id ? { ...item, done: !item.done } : item)),
                }))}
                className={`grid h-8 w-8 place-items-center rounded-xl border ${row.done ? "border-emerald-500 bg-emerald-500 text-white" : "border-black/5 bg-white text-neutral-400"}`}
              >
                {row.done && <CheckCircle2 size={14} />}
              </button>
              <CellInput
                value={row.label}
                onChange={(value) => setDraft((prev) => ({
                  ...prev,
                  checklistRows: prev.checklistRows.map((item) => (item.id === row.id ? { ...item, label: value } : item)),
                }))}
                placeholder={`Checklist item ${index + 1}`}
              />
              <button
                type="button"
                onClick={() => setDraft((prev) => ({ ...prev, checklistRows: prev.checklistRows.filter((item) => item.id !== row.id) }))}
                className="grid h-8 w-8 place-items-center rounded-xl text-red-400 hover:bg-red-50"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === "price") {
    const rows = draft.priceRows || [];
    return (
      <div className="rounded-[26px] bg-white/50 p-3">
        <div className="mb-3 flex items-center justify-between">
          <HeaderCell>Price table</HeaderCell>
          <div className="flex gap-2">
            <SmallRowButton
              onClick={() => setDraft((prev) => ({
                ...prev,
                priceRows: [
                  { id: uid(), sku: "P4X 4+128", srp: "2.499K", promo: "Disc up to 25%", period: "7–13 July" },
                  { id: uid(), sku: "P4 Lite 4+64", srp: "1.999K", promo: "Disc up to 25%", period: "7–13 July" },
                ],
              }))}
            >
              Use Example
            </SmallRowButton>
            <SmallRowButton onClick={() => setDraft((prev) => ({ ...prev, priceRows: [...prev.priceRows, { id: uid(), sku: "", srp: "", promo: "", period: "" }] }))}>+ Row</SmallRowButton>
          </div>
        </div>
        <div className="grid grid-cols-[1.1fr_.8fr_1fr_.8fr_32px] gap-2 px-1 pb-2">
          <HeaderCell>SKU</HeaderCell>
          <HeaderCell>SRP</HeaderCell>
          <HeaderCell>Promo</HeaderCell>
          <HeaderCell>Period</HeaderCell>
          <span />
        </div>
        <div className="space-y-2">
          {rows.map((row) => (
            <div key={row.id} className="grid grid-cols-[1.1fr_.8fr_1fr_.8fr_32px] gap-2">
              {["sku", "srp", "promo", "period"].map((key) => (
                <CellInput
                  key={key}
                  value={row[key] || ""}
                  onChange={(value) => setDraft((prev) => ({
                    ...prev,
                    priceRows: prev.priceRows.map((item) => (item.id === row.id ? { ...item, [key]: value } : item)),
                  }))}
                  placeholder={key.toUpperCase()}
                />
              ))}
              <button
                type="button"
                onClick={() => setDraft((prev) => ({ ...prev, priceRows: prev.priceRows.filter((item) => item.id !== row.id) }))}
                className="grid h-9 w-8 place-items-center rounded-xl text-red-400 hover:bg-red-50"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === "compare") {
    const rows = draft.compareRows || [];
    return (
      <div className="rounded-[26px] bg-white/50 p-3">
        <div className="mb-3 flex items-center justify-between">
          <HeaderCell>Compare table</HeaderCell>
          <div className="flex gap-2">
            <SmallRowButton
              onClick={() => setDraft((prev) => ({
                ...prev,
                compareRows: [
                  { id: uid(), item: "Tokopedia", before: "Old copy", after: "New 7.7 copy", note: "Align with LP" },
                  { id: uid(), item: "TikTok", before: "No voucher", after: "Live voucher", note: "Check NAD wording" },
                ],
              }))}
            >
              Use Example
            </SmallRowButton>
            <SmallRowButton onClick={() => setDraft((prev) => ({ ...prev, compareRows: [...prev.compareRows, { id: uid(), item: "", before: "", after: "", note: "" }] }))}>+ Row</SmallRowButton>
          </div>
        </div>
        <div className="grid grid-cols-[.8fr_1fr_1fr_1fr_32px] gap-2 px-1 pb-2">
          <HeaderCell>Item</HeaderCell>
          <HeaderCell>Before</HeaderCell>
          <HeaderCell>After</HeaderCell>
          <HeaderCell>Note</HeaderCell>
          <span />
        </div>
        <div className="space-y-2">
          {rows.map((row) => (
            <div key={row.id} className="grid grid-cols-[.8fr_1fr_1fr_1fr_32px] gap-2">
              {["item", "before", "after", "note"].map((key) => (
                <CellInput
                  key={key}
                  value={row[key] || ""}
                  onChange={(value) => setDraft((prev) => ({
                    ...prev,
                    compareRows: prev.compareRows.map((item) => (item.id === row.id ? { ...item, [key]: value } : item)),
                  }))}
                  placeholder={key}
                />
              ))}
              <button
                type="button"
                onClick={() => setDraft((prev) => ({ ...prev, compareRows: prev.compareRows.filter((item) => item.id !== row.id) }))}
                className="grid h-9 w-8 place-items-center rounded-xl text-red-400 hover:bg-red-50"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === "board") {
    const rows = draft.boardRows || [];
    return (
      <div className="rounded-[26px] bg-white/50 p-3">
        <div className="mb-3 flex items-center justify-between">
          <HeaderCell>Board columns</HeaderCell>
          <SmallRowButton onClick={() => setDraft((prev) => ({ ...prev, boardRows: [...prev.boardRows, { id: uid(), todo: "", doing: "", done: "" }] }))}>+ Row</SmallRowButton>
        </div>
        <div className="grid grid-cols-[1fr_1fr_1fr_32px] gap-2 px-1 pb-2">
          <HeaderCell>Todo</HeaderCell>
          <HeaderCell>Doing</HeaderCell>
          <HeaderCell>Done</HeaderCell>
          <span />
        </div>
        <div className="space-y-2">
          {rows.map((row) => (
            <div key={row.id} className="grid grid-cols-[1fr_1fr_1fr_32px] gap-2">
              {["todo", "doing", "done"].map((key) => (
                <CellInput
                  key={key}
                  value={row[key] || ""}
                  onChange={(value) => setDraft((prev) => ({
                    ...prev,
                    boardRows: prev.boardRows.map((item) => (item.id === row.id ? { ...item, [key]: value } : item)),
                  }))}
                  placeholder={key}
                />
              ))}
              <button
                type="button"
                onClick={() => setDraft((prev) => ({ ...prev, boardRows: prev.boardRows.filter((item) => item.id !== row.id) }))}
                className="grid h-9 w-8 place-items-center rounded-xl text-red-400 hover:bg-red-50"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
}

function NoteEditorModal({ draft, setDraft, onClose, onSave }) {
  const isEdit = Boolean(draft.id);
  const activeType = draft.type || "memo";

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[99999] grid place-items-center bg-black/35 p-4 backdrop-blur-md">
      <div className="max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-[34px] border border-white/60 bg-[#f4f4f2]/95 p-6 shadow-[0_40px_120px_rgba(0,0,0,.28)]">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-400">{isEdit ? "Edit Note" : "New Note"}</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-neutral-950">{isEdit ? "Update canvas card." : "Create canvas card."}</h2>
          </div>
          <button type="button" onClick={onClose} className="grid h-12 w-12 place-items-center rounded-full bg-white text-neutral-500 shadow-sm hover:text-neutral-950">
            <X size={20} />
          </button>
        </div>

        <div className="grid max-h-[calc(92vh-130px)] grid-cols-[1fr_320px] gap-5 overflow-y-auto pr-1">
          <div className="space-y-4">
            <TextInput value={draft.title} onChange={(value) => setDraft((prev) => ({ ...prev, title: value }))} placeholder="Note title" />

            {(activeType === "memo" || activeType === "link") && (
              <TextArea
                value={draft.body}
                onChange={(value) => setDraft((prev) => ({ ...prev, body: value }))}
                placeholder="Write note, reminder, context, or instruction..."
              />
            )}

            {activeType === "link" && (
              <div className="grid grid-cols-2 gap-3">
                <TextInput value={draft.linkLabel} onChange={(value) => setDraft((prev) => ({ ...prev, linkLabel: value }))} placeholder="Link label optional" />
                <TextInput value={draft.linkUrl} onChange={(value) => setDraft((prev) => ({ ...prev, linkUrl: value }))} placeholder="Link URL optional" />
              </div>
            )}

            {(activeType === "checklist" || activeType === "price" || activeType === "compare" || activeType === "board") && (
              <TextArea
                value={draft.body}
                onChange={(value) => setDraft((prev) => ({ ...prev, body: value }))}
                placeholder="Short context shown above the table..."
                className="min-h-[100px]"
              />
            )}

            <EditableRows type={activeType} draft={draft} setDraft={setDraft} />
          </div>

          <aside className="rounded-[28px] bg-white/50 p-4">
            <div>
              <HeaderCell>Type</HeaderCell>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {NOTE_TYPES.map((item) => {
                  const Icon = item.icon;
                  return (
                    <MiniButton key={item.key} active={activeType === item.key} onClick={() => setDraft((prev) => ({ ...prev, type: item.key }))}>
                      <span className="inline-flex items-center gap-2"><Icon size={14} /> {item.label}</span>
                    </MiniButton>
                  );
                })}
              </div>
            </div>

            <div className="mt-5">
              <HeaderCell>Scope</HeaderCell>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {SCOPES.map((scope) => (
                  <MiniButton key={scope} active={draft.scope === scope} onClick={() => setDraft((prev) => ({ ...prev, scope }))}>{scope}</MiniButton>
                ))}
              </div>
            </div>

            <div className="mt-5">
              <HeaderCell>Style</HeaderCell>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {STYLE_OPTIONS.map((style) => (
                  <MiniButton key={style} active={draft.style === style} onClick={() => setDraft((prev) => ({ ...prev, style }))}>{style}</MiniButton>
                ))}
              </div>
            </div>

            <div className="mt-5">
              <HeaderCell>Color</HeaderCell>
              <div className="mt-3 flex flex-wrap gap-3">
                {Object.entries(COLORS).map(([key, color]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setDraft((prev) => ({ ...prev, color: key }))}
                    title={color.name}
                    className={`h-9 w-9 rounded-full border-4 ${color.dot} ${draft.color === key ? "border-neutral-950" : "border-white"} shadow-sm`}
                  />
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={onSave}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-[20px] bg-neutral-950 px-5 py-4 text-sm font-medium text-white shadow-xl transition hover:-translate-y-0.5"
            >
              <Save size={15} /> Save Note
            </button>
          </aside>
        </div>
      </div>
    </div>
  );
}

function Inspector({ note, onEdit, onCreate }) {
  if (!note) {
    return (
      <aside className="rounded-[28px] border border-white/70 bg-white/80 p-5 shadow-[0_30px_80px_rgba(0,0,0,.08)] backdrop-blur-xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.20em] text-neutral-400">Inspector</p>
        <h3 className="mt-2 text-xl font-semibold tracking-[-0.035em]">No card selected</h3>
        <p className="mt-2 text-sm font-normal leading-6 text-neutral-500">Click any canvas card to preview details, then edit it from here.</p>
        <button onClick={onCreate} className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-neutral-950 px-4 py-3 text-sm font-medium text-white">
          <Plus size={15} /> Create Note
        </button>
      </aside>
    );
  }

  const typeLabel = NOTE_TYPES.find((item) => item.key === note.type)?.label || "Memo";
  const rowsCount =
    note.type === "price"
      ? countFilledRows(note.priceRows, ["sku", "srp", "promo", "period"])
      : note.type === "compare"
        ? countFilledRows(note.compareRows, ["item", "before", "after", "note"])
        : note.type === "board"
          ? countFilledRows(note.boardRows, ["todo", "doing", "done"])
          : note.type === "checklist"
            ? countFilledRows(note.checklistRows, ["label"])
            : 0;

  return (
    <aside className="sticky top-6 rounded-[28px] border border-white/70 bg-white/80 p-5 shadow-[0_30px_80px_rgba(0,0,0,.08)] backdrop-blur-xl">
      <p className="text-[11px] font-semibold uppercase tracking-[0.20em] text-neutral-400">Inspector</p>
      <h3 className="mt-2 text-xl font-semibold tracking-[-0.035em]">{note.title}</h3>
      {note.body && <p className="mt-3 whitespace-pre-line text-[13px] font-normal leading-6 text-neutral-600">{note.body}</p>}

      <div className="mt-5 divide-y divide-black/5 rounded-[22px] bg-white/70 px-4">
        <div className="flex justify-between py-3 text-sm"><span className="font-semibold text-neutral-400">Type</span><span className="font-medium text-neutral-800">{typeLabel}</span></div>
        <div className="flex justify-between py-3 text-sm"><span className="font-semibold text-neutral-400">Scope</span><span className="font-medium text-neutral-800">{note.scope}</span></div>
        <div className="flex justify-between py-3 text-sm"><span className="font-semibold text-neutral-400">Rows</span><span className="font-medium text-neutral-800">{rowsCount || "—"}</span></div>
        <div className="flex justify-between py-3 text-sm"><span className="font-semibold text-neutral-400">Updated</span><span className="font-medium text-neutral-800">{note.updatedAt}</span></div>
      </div>

      <button onClick={() => onEdit(note)} className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-neutral-950 px-4 py-3 text-sm font-medium text-white">
        <Save size={15} /> Edit Selected
      </button>
      <button onClick={onCreate} className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-black/5 bg-white px-4 py-3 text-sm font-medium text-neutral-700">
        <Plus size={15} /> Create Note
      </button>
    </aside>
  );
}

export default function CanvasNotesPanel() {
  const boardRef = useRef(null);
  const dragRef = useRef(null);
  const [notes, setNotes] = useState(() => seedNotes().map(normalizeNote));
  const [scope, setScope] = useState(() => {
    if (typeof window === "undefined") return "Personal";
    return window.localStorage.getItem(SCOPE_KEY) || "Personal";
  });
  const [selectedId, setSelectedId] = useState(null);
  const [draft, setDraft] = useState(null);
  const [draggingId, setDraggingId] = useState(null);
  const [copied, setCopied] = useState(false);
  const [loadingLive, setLoadingLive] = useState(true);
  const [liveError, setLiveError] = useState("");

  const loadLiveNotes = useCallback(async () => {
    setLiveError("");

    const { data, error } = await supabase
      .from(CANVAS_TABLE)
      .select("*")
      .order("updated_at", { ascending: false });

    if (error) {
      setLiveError(`Canvas notes belum live: ${error.message}`);
      const stored = typeof window !== "undefined" ? safeParse(window.localStorage.getItem(STORAGE_KEY)) : null;
      setNotes((stored && stored.length ? stored : seedNotes()).map(normalizeNote));
      setLoadingLive(false);
      return;
    }

    if (!data || data.length === 0) {
      const seeded = seedNotes().map(normalizeNote);
      setNotes(seeded);
      await supabase.from(CANVAS_TABLE).upsert(seeded.map(noteToDbRow));
      setLoadingLive(false);
      return;
    }

    setNotes(data.map(dbRowToNote));
    setLoadingLive(false);
  }, []);

  useEffect(() => {
    loadLiveNotes();

    const channel = supabase
      .channel("systemadf-canvas-notes-live")
      .on("postgres_changes", { event: "*", schema: "public", table: CANVAS_TABLE }, () => {
        loadLiveNotes();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadLiveNotes]);

  useEffect(() => {
    if (typeof window !== "undefined") window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    if (typeof window !== "undefined") window.localStorage.setItem(SCOPE_KEY, scope);
  }, [scope]);

  const visibleNotes = useMemo(() => {
    const filtered = notes.filter((note) => note.scope === scope);
    return [...filtered].sort((a, b) => Number(b.pinned) - Number(a.pinned));
  }, [notes, scope]);

  const selectedNote = useMemo(() => notes.find((note) => note.id === selectedId) || visibleNotes[0] || null, [notes, selectedId, visibleNotes]);

  useEffect(() => {
    if (!visibleNotes.some((note) => note.id === selectedId)) {
      setSelectedId(visibleNotes[0]?.id || null);
    }
  }, [visibleNotes, selectedId]);

  const openCreate = useCallback(() => setDraft(emptyDraft(scope)), [scope]);

  const openEdit = useCallback((note) => {
    setDraft({ ...emptyDraft(note.scope), ...note });
    setSelectedId(note.id);
  }, []);

  const saveDraft = useCallback(async () => {
    if (!draft) return;

    const isNew = !draft.id;
    const clean = normalizeNote({
      ...draft,
      id: draft.id || uid(),
      title: draft.title?.trim() || "Untitled note",
      updatedAt: nowLabel(),
      x: Number.isFinite(draft.x) ? draft.x : 120 + (notes.length % 4) * 70,
      y: Number.isFinite(draft.y) ? draft.y : 140 + (notes.length % 5) * 55,
    });

    setNotes((prev) => {
      const exists = prev.some((note) => note.id === clean.id);
      if (exists) return prev.map((note) => (note.id === clean.id ? clean : note));
      return [...prev, clean];
    });
    setScope(clean.scope);
    setSelectedId(clean.id);
    setDraft(null);

    const { error } = await supabase.from(CANVAS_TABLE).upsert(noteToDbRow(clean));
    if (error) {
      setLiveError(`Gagal simpan live note: ${error.message}`);
      if (isNew) setDraft(clean);
    }
  }, [draft, notes.length]);

  const deleteNote = useCallback(async (id) => {
    const previous = notes;
    setNotes((prev) => prev.filter((note) => note.id !== id));
    if (selectedId === id) setSelectedId(null);

    const { error } = await supabase.from(CANVAS_TABLE).delete().eq("id", id);
    if (error) {
      setLiveError(`Gagal hapus live note: ${error.message}`);
      setNotes(previous);
    }
  }, [notes, selectedId]);

  const togglePin = useCallback(async (id) => {
    let updated = null;
    setNotes((prev) =>
      prev.map((note) => {
        if (note.id !== id) return note;
        updated = { ...note, pinned: !note.pinned, updatedAt: nowLabel() };
        return updated;
      })
    );

    setTimeout(async () => {
      if (!updated) return;
      const { error } = await supabase.from(CANVAS_TABLE).upsert(noteToDbRow(updated));
      if (error) setLiveError(`Gagal update pin: ${error.message}`);
    }, 0);
  }, []);

  const persistPosition = useCallback(async (id, x, y) => {
    const target = notes.find((note) => note.id === id);
    if (!target) return;

    const updated = { ...target, x, y, updatedAt: nowLabel() };
    const { error } = await supabase
      .from(CANVAS_TABLE)
      .update({ x: Math.round(x), y: Math.round(y), updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      setLiveError(`Gagal simpan posisi note: ${error.message}`);
      await supabase.from(CANVAS_TABLE).upsert(noteToDbRow(updated));
    }
  }, [notes]);

  const handleDragStart = useCallback((id, event) => {
    event.preventDefault();
    event.stopPropagation();
    const note = notes.find((item) => item.id === id);
    if (!note || !boardRef.current) return;

    dragRef.current = {
      id,
      startX: event.clientX,
      startY: event.clientY,
      originX: note.x || 0,
      originY: note.y || 0,
      latestX: note.x || 0,
      latestY: note.y || 0,
    };
    setDraggingId(id);
    setSelectedId(id);

    const move = (moveEvent) => {
      const drag = dragRef.current;
      const board = boardRef.current;
      if (!drag || !board) return;
      const rect = board.getBoundingClientRect();
      const nextX = clamp(drag.originX + (moveEvent.clientX - drag.startX), 20, Math.max(20, rect.width - noteWidth(note.type) - 20));
      const nextY = clamp(drag.originY + (moveEvent.clientY - drag.startY), 20, Math.max(20, rect.height - 220));
      drag.latestX = nextX;
      drag.latestY = nextY;
      setNotes((prev) => prev.map((item) => (item.id === drag.id ? { ...item, x: nextX, y: nextY } : item)));
    };

    const up = () => {
      const drag = dragRef.current;
      dragRef.current = null;
      setDraggingId(null);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      if (drag) persistPosition(drag.id, drag.latestX, drag.latestY);
    };

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  }, [notes, persistPosition]);

  const resetBoard = useCallback(async () => {
    const ok = window.confirm("Reset all canvas notes for everyone? This will replace live notes with starter notes.");
    if (!ok) return;

    const seeded = seedNotes().map(normalizeNote);
    setNotes(seeded);
    setScope("Personal");
    setSelectedId(seeded[0]?.id || null);

    const { error: deleteError } = await supabase.from(CANVAS_TABLE).delete().neq("id", "__never__");
    if (deleteError) {
      setLiveError(`Gagal reset notes: ${deleteError.message}`);
      return;
    }

    const { error } = await supabase.from(CANVAS_TABLE).upsert(seeded.map(noteToDbRow));
    if (error) setLiveError(`Gagal isi ulang notes: ${error.message}`);
  }, []);

  const copyAll = useCallback(async () => {
    const text = visibleNotes.map((note) => `${note.title}\n${note.body || ""}`).join("\n\n---\n\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  }, [visibleNotes]);

  return (
    <section className="relative min-h-[calc(100vh-80px)] px-6 py-8 lg:px-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-400">Notes</p>
          <h1 className="mt-1 text-[34px] font-semibold leading-tight tracking-[-0.045em] text-neutral-950">Canvas Board</h1>
          <p className="mt-2 max-w-2xl text-sm font-normal leading-6 text-neutral-500">
            Live canvas notes sync through Supabase. Drag, edit, and table changes update for everyone.
          </p>
          {liveError && (
            <p className="mt-3 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-xs font-medium leading-5 text-amber-700">
              {liveError}
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {SCOPES.map((item) => (
            <ScopePill key={item} active={scope === item} onClick={() => setScope(item)}>{item}</ScopePill>
          ))}
          <button onClick={copyAll} className="flex items-center gap-2 rounded-full bg-white px-5 py-2 text-sm font-medium text-neutral-700 shadow-sm">
            <Copy size={15} /> {copied ? "Copied" : "Copy"}
          </button>
          <button onClick={resetBoard} className="rounded-full bg-white px-5 py-2 text-sm font-medium text-neutral-700 shadow-sm">Reset</button>
          <button onClick={openCreate} className="flex items-center gap-2 rounded-full bg-neutral-950 px-5 py-2 text-sm font-medium text-white shadow-sm">
            <Plus size={15} /> New Note
          </button>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_330px]">
        <div className="overflow-hidden rounded-[34px] border border-white/70 bg-white/70 p-5 shadow-[0_35px_100px_rgba(0,0,0,.08)] backdrop-blur-xl">
          <div className="relative overflow-auto rounded-[26px] border border-black/5 bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,.07)_1px,transparent_0)] [background-size:24px_24px]">
            <div ref={boardRef} className="relative min-h-[880px] min-w-[1280px]">
              <div className="absolute left-5 top-5 z-20 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-neutral-600 shadow-sm">
                <Folder size={15} /> {scope} · {loadingLive ? "loading" : visibleNotes.length} notes
              </div>

              {visibleNotes.map((note) => (
                <CanvasCard
                  key={note.id}
                  note={note}
                  selected={selectedNote?.id === note.id}
                  dragging={draggingId === note.id}
                  onSelect={setSelectedId}
                  onEdit={openEdit}
                  onDelete={deleteNote}
                  onTogglePin={togglePin}
                  onDragStart={handleDragStart}
                />
              ))}
            </div>
          </div>
        </div>

        <Inspector note={selectedNote} onEdit={openEdit} onCreate={openCreate} />
      </div>

      {draft && <NoteEditorModal draft={draft} setDraft={setDraft} onClose={() => setDraft(null)} onSave={saveDraft} />}
    </section>
  );
}
