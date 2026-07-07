import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  CheckCircle2,
  ClipboardList,
  FileText,
  Folder,
  GripVertical,
  Link2,
  Loader2,
  Pin,
  Plus,
  Save,
  StickyNote,
  Trash2,
  X,
} from "lucide-react";
import { supabase } from "./supabaseClient";

const SHARED_NOTE_TABLE = "team_notes";
const PERSONAL_NOTE_KEY = "adf_personal_notes_v3";

const NOTE_SCOPE_OPTIONS = [
  { id: "adf", label: "ADF" },
  { id: "realme", label: "realme" },
  { id: "akaso", label: "AKASO" },
  { id: "personal", label: "Personal" },
];

const NOTE_TYPE_OPTIONS = [
  { id: "note", label: "Memo", icon: StickyNote },
  { id: "link", label: "Link", icon: Link2 },
  { id: "todo", label: "Checklist", icon: CheckCircle2 },
  { id: "price", label: "Price", icon: FileText },
  { id: "compare", label: "Compare", icon: ClipboardList },
  { id: "board", label: "Board", icon: Folder },
];

const NOTE_FONT_OPTIONS = [
  { id: "clean", label: "Clean", titleClass: "font-semibold tracking-[-0.045em]" },
  { id: "bold", label: "Bold", titleClass: "font-extrabold tracking-[-0.055em]" },
  { id: "soft", label: "Soft", titleClass: "font-medium tracking-[-0.025em]" },
  { id: "mono", label: "Mono", titleClass: "font-mono font-semibold tracking-[-0.02em]" },
];

const TRACK_COLORS = [
  { id: "black", label: "Black", dot: "#111111", soft: "rgba(17,17,17,0.08)", border: "rgba(17,17,17,0.18)", text: "#111111" },
  { id: "blue", label: "Blue", dot: "#2563eb", soft: "rgba(37,99,235,0.10)", border: "rgba(37,99,235,0.22)", text: "#1d4ed8" },
  { id: "green", label: "Green", dot: "#059669", soft: "rgba(5,150,105,0.10)", border: "rgba(5,150,105,0.22)", text: "#047857" },
  { id: "orange", label: "Orange", dot: "#f97316", soft: "rgba(249,115,22,0.12)", border: "rgba(249,115,22,0.24)", text: "#c2410c" },
  { id: "purple", label: "Purple", dot: "#7c3aed", soft: "rgba(124,58,237,0.11)", border: "rgba(124,58,237,0.23)", text: "#6d28d9" },
  { id: "red", label: "Red", dot: "#dc2626", soft: "rgba(220,38,38,0.10)", border: "rgba(220,38,38,0.22)", text: "#b91c1c" },
];

function makeId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function makeChecklistItem(text = "", checked = false) {
  return { id: makeId(), text, checked };
}

function makePriceItem(label = "", old_price = "", new_price = "", note = "") {
  return { id: makeId(), label, old_price, new_price, note };
}

function makeCompareItem(before = "", after = "") {
  return { id: makeId(), before, after };
}

function makeBoardItem(status = "todo", text = "") {
  return { id: makeId(), status, text };
}

function getEmptyRows() {
  return {
    checklist_items: [makeChecklistItem(""), makeChecklistItem(""), makeChecklistItem("")],
    price_items: [makePriceItem("", "", "", ""), makePriceItem("", "", "", "")],
    compare_items: [makeCompareItem("", ""), makeCompareItem("", "")],
    board_items: [
      makeBoardItem("todo", ""),
      makeBoardItem("doing", ""),
      makeBoardItem("done", ""),
    ],
  };
}

function getTrackColor(value) {
  return TRACK_COLORS.find((color) => color.id === value) || TRACK_COLORS[1];
}

function getNoteType(value) {
  return NOTE_TYPE_OPTIONS.find((item) => item.id === value) || NOTE_TYPE_OPTIONS[0];
}

function getNoteFont(value) {
  return NOTE_FONT_OPTIONS.find((item) => item.id === value) || NOTE_FONT_OPTIONS[0];
}

function normalizeJsonArray(value) {
  if (Array.isArray(value)) return value;

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  return [];
}

function formatDateTime(value) {
  if (!value) return "-";

  try {
    return new Date(value).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "-";
  }
}

function defaultNotesFromProps(notes = []) {
  if (!Array.isArray(notes) || notes.length === 0) return [];

  return notes.map((note, index) => ({
    id: note.id || makeId(),
    scope: "personal",
    title: note.title || `Note ${index + 1}`,
    note: note.note || note.content || "",
    color: ["blue", "orange", "green"][index % 3],
    type: "note",
    font_style: "clean",
    position_x: 80 + (index % 3) * 390,
    position_y: 90 + Math.floor(index / 3) * 260,
  }));
}

export default function StructuredCanvasNotesPanel({ notes = [] }) {
  const [activeScope, setActiveScope] = useState("personal");
  const [noteList, setNoteList] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [dragState, setDragState] = useState(null);

  const [composerOpen, setComposerOpen] = useState(false);
  const [composerMode, setComposerMode] = useState("create");
  const [noteLoading, setNoteLoading] = useState(false);
  const [noteError, setNoteError] = useState("");

  const [draft, setDraft] = useState(() => ({
    id: null,
    title: "",
    note: "",
    link_label: "",
    link_url: "",
    color: "blue",
    type: "note",
    font_style: "clean",
    ...getEmptyRows(),
  }));

  const isPersonal = activeScope === "personal";

  const activeScopeInfo = useMemo(() => {
    return NOTE_SCOPE_OPTIONS.find((item) => item.id === activeScope) || NOTE_SCOPE_OPTIONS[0];
  }, [activeScope]);

  function normalizeNote(note, index = 0) {
    const empty = getEmptyRows();

    return {
      id: note.id || makeId(),
      scope: note.scope || activeScope,
      title: note.title || "New Note",
      note: note.note || "",
      link_label: note.link_label || "Open Link",
      link_url: note.link_url || "",
      color: note.color || ["blue", "orange", "green", "purple"][index % 4],
      type: note.type || note.note_type || "note",
      font_style: note.font_style || "clean",
      sort_order: Number.isFinite(Number(note.sort_order)) ? Number(note.sort_order) : index + 1,
      position_x: Number.isFinite(Number(note.position_x)) ? Number(note.position_x) : 80 + (index % 3) * 390,
      position_y: Number.isFinite(Number(note.position_y)) ? Number(note.position_y) : 90 + Math.floor(index / 3) * 260,
      card_width: Number.isFinite(Number(note.card_width)) ? Number(note.card_width) : 340,
      card_height: Number.isFinite(Number(note.card_height)) ? Number(note.card_height) : 220,
      is_pinned: Boolean(note.is_pinned),
      checklist_items: normalizeJsonArray(note.checklist_items).length ? normalizeJsonArray(note.checklist_items) : empty.checklist_items,
      price_items: normalizeJsonArray(note.price_items).length ? normalizeJsonArray(note.price_items) : empty.price_items,
      compare_items: normalizeJsonArray(note.compare_items).length ? normalizeJsonArray(note.compare_items) : empty.compare_items,
      board_items: normalizeJsonArray(note.board_items).length ? normalizeJsonArray(note.board_items) : empty.board_items,
      created_at: note.created_at || new Date().toISOString(),
      updated_at: note.updated_at || new Date().toISOString(),
    };
  }

  function sortNotes(items) {
    return [...(items || [])].sort((a, b) => {
      if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;

      return (
        new Date(b.updated_at || b.created_at || 0).getTime() -
        new Date(a.updated_at || a.created_at || 0).getTime()
      );
    });
  }

  function savePersonalNotes(items) {
    const normalized = sortNotes(items.map((item, index) => normalizeNote(item, index)));
    setNoteList(normalized);
    window.localStorage.setItem(PERSONAL_NOTE_KEY, JSON.stringify(normalized));
  }

  function loadPersonalNotes() {
    try {
      const saved = window.localStorage.getItem(PERSONAL_NOTE_KEY);

      if (saved) {
        const parsed = JSON.parse(saved);

        if (Array.isArray(parsed)) {
          const normalized = sortNotes(parsed.map((item, index) => normalizeNote(item, index)));
          setNoteList(normalized);
          setActiveId(normalized[0]?.id || null);
          return;
        }
      }
    } catch (error) {
      console.error("Load personal notes error:", error);
    }

    const defaults = defaultNotesFromProps(notes).map((item, index) => normalizeNote(item, index));
    setNoteList(defaults);
    setActiveId(defaults[0]?.id || null);
  }

  async function loadSharedNotes(scope = activeScope) {
    setNoteLoading(true);
    setNoteError("");

    const { data, error } = await supabase
      .from(SHARED_NOTE_TABLE)
      .select("*")
      .eq("scope", scope)
      .order("updated_at", { ascending: false });

    setNoteLoading(false);

    if (error) {
      setNoteList([]);
      setActiveId(null);
      setNoteError(`Load notes gagal: ${error.message}`);
      return;
    }

    const normalized = sortNotes((data || []).map((item, index) => normalizeNote(item, index)));
    setNoteList(normalized);
    setActiveId(normalized[0]?.id || null);
  }

  useEffect(() => {
    if (isPersonal) {
      loadPersonalNotes();
      return undefined;
    }

    loadSharedNotes(activeScope);

    const channel = supabase
      .channel(`adf-structured-canvas-notes-${activeScope}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: SHARED_NOTE_TABLE,
          filter: `scope=eq.${activeScope}`,
        },
        () => loadSharedNotes(activeScope)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeScope]);

  const activeNote = noteList.find((note) => note.id === activeId) || noteList[0] || null;

  async function persistPosition(noteId, x, y) {
    if (!noteId) return;

    if (isPersonal) {
      savePersonalNotes(
        noteList.map((note) =>
          note.id === noteId
            ? { ...note, position_x: x, position_y: y, updated_at: new Date().toISOString() }
            : note
        )
      );
      return;
    }

    const { error } = await supabase
      .from(SHARED_NOTE_TABLE)
      .update({
        position_x: x,
        position_y: y,
        updated_at: new Date().toISOString(),
      })
      .eq("id", noteId);

    if (error) setNoteError(`Update position gagal: ${error.message}`);
  }

  useEffect(() => {
    if (!dragState) return undefined;

    let latest = {
      x: dragState.originX,
      y: dragState.originY,
    };

    function handleMove(event) {
      const x = Math.max(0, Math.round(dragState.originX + event.clientX - dragState.startX));
      const y = Math.max(0, Math.round(dragState.originY + event.clientY - dragState.startY));

      latest = { x, y };

      setNoteList((prev) =>
        prev.map((note) =>
          note.id === dragState.id ? { ...note, position_x: x, position_y: y } : note
        )
      );
    }

    function handleUp() {
      persistPosition(dragState.id, latest.x, latest.y);
      setDragState(null);
    }

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);

    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };
  }, [dragState, noteList, isPersonal]);

  function openCreateComposer() {
    const color = TRACK_COLORS[noteList.length % TRACK_COLORS.length]?.id || "blue";

    setComposerMode("create");
    setDraft({
      id: null,
      title: "",
      note: "",
      link_label: "",
      link_url: "",
      color,
      type: "note",
      font_style: "clean",
      ...getEmptyRows(),
    });
    setComposerOpen(true);
  }

  function openEditComposer(note) {
    if (!note) return;

    const normalized = normalizeNote(note);

    setComposerMode("edit");
    setDraft({
      id: normalized.id,
      title: normalized.title || "",
      note: normalized.note || "",
      link_label: normalized.link_label || "",
      link_url: normalized.link_url || "",
      color: normalized.color || "blue",
      type: normalized.type || "note",
      font_style: normalized.font_style || "clean",
      checklist_items: normalized.checklist_items,
      price_items: normalized.price_items,
      compare_items: normalized.compare_items,
      board_items: normalized.board_items,
    });
    setComposerOpen(true);
  }

  function switchDraftType(type) {
    const empty = getEmptyRows();

    const titleByType = {
      note: "Memo Note",
      link: "Reference Link",
      todo: "Checklist",
      price: "Price Update",
      compare: "Compare Revision",
      board: "Mini Board",
    };

    const defaultTitles = Object.values(titleByType);

    setDraft((prev) => {
      const shouldAutoReplaceTitle =
        !prev.title || defaultTitles.includes(String(prev.title || "").trim());

      return {
        ...prev,
        type,
        title: shouldAutoReplaceTitle ? titleByType[type] || "Memo Note" : prev.title,
        checklist_items: prev.checklist_items?.length ? prev.checklist_items : empty.checklist_items,
        price_items: prev.price_items?.length ? prev.price_items : empty.price_items,
        compare_items: prev.compare_items?.length ? prev.compare_items : empty.compare_items,
        board_items: prev.board_items?.length ? prev.board_items : empty.board_items,
      };
    });
  }

  function updateDraftArray(key, id, patch) {
    setDraft((prev) => ({
      ...prev,
      [key]: (prev[key] || []).map((item) =>
        item.id === id ? { ...item, ...patch } : item
      ),
    }));
  }

  function addDraftRow(type) {
    setDraft((prev) => {
      if (type === "todo") return { ...prev, checklist_items: [...(prev.checklist_items || []), makeChecklistItem("")] };
      if (type === "price") return { ...prev, price_items: [...(prev.price_items || []), makePriceItem("", "", "", "")] };
      if (type === "compare") return { ...prev, compare_items: [...(prev.compare_items || []), makeCompareItem("", "")] };
      return { ...prev, board_items: [...(prev.board_items || []), makeBoardItem("todo", "")] };
    });
  }

  function removeDraftRow(key, id, fallbackItem) {
    setDraft((prev) => {
      const filtered = (prev[key] || []).filter((item) => item.id !== id);
      return { ...prev, [key]: filtered.length ? filtered : [fallbackItem] };
    });
  }

  function buildNoteTextFromDraft() {
    if (draft.type === "todo") {
      return (draft.checklist_items || []).map((item) => item.text).filter(Boolean).join("\n");
    }

    if (draft.type === "price") {
      return (draft.price_items || [])
        .map((item) => [item.label, item.old_price, item.new_price, item.note].filter(Boolean).join(" — "))
        .filter(Boolean)
        .join("\n");
    }

    if (draft.type === "compare") {
      return (draft.compare_items || [])
        .map((item) => [item.before, item.after].filter(Boolean).join(" → "))
        .filter(Boolean)
        .join("\n");
    }

    if (draft.type === "board") {
      return (draft.board_items || [])
        .map((item) => [item.status, item.text].filter(Boolean).join(": "))
        .filter(Boolean)
        .join("\n");
    }

    return String(draft.note || "").trim();
  }

  function getCleanStructuredRows() {
    return {
      checklist_items: (draft.checklist_items || [])
        .map((item) => ({
          id: item.id || makeId(),
          text: String(item.text || "").trim(),
          checked: Boolean(item.checked),
        }))
        .filter((item) => item.text),
      price_items: (draft.price_items || [])
        .map((item) => ({
          id: item.id || makeId(),
          label: String(item.label || "").trim(),
          old_price: String(item.old_price || "").trim(),
          new_price: String(item.new_price || "").trim(),
          note: String(item.note || "").trim(),
        }))
        .filter((item) => item.label || item.old_price || item.new_price || item.note),
      compare_items: (draft.compare_items || [])
        .map((item) => ({
          id: item.id || makeId(),
          before: String(item.before || "").trim(),
          after: String(item.after || "").trim(),
        }))
        .filter((item) => item.before || item.after),
      board_items: (draft.board_items || [])
        .map((item) => ({
          id: item.id || makeId(),
          status: item.status || "todo",
          text: String(item.text || "").trim(),
        }))
        .filter((item) => item.text),
    };
  }

  async function saveDraft() {
    const cleanTitle = String(draft.title || "").trim();
    const cleanNote = buildNoteTextFromDraft();
    const structuredRows = getCleanStructuredRows();

    if (!cleanTitle && !cleanNote) {
      setNoteError("Isi title atau salah satu field dulu.");
      return;
    }

    setNoteError("");

    const basePatch = {
      title: cleanTitle || "Untitled Note",
      note: cleanNote,
      link_label: String(draft.link_label || "").trim(),
      link_url: String(draft.link_url || "").trim(),
      color: draft.color || "blue",
      type: draft.type || "note",
      font_style: draft.font_style || "clean",
      checklist_items: structuredRows.checklist_items,
      price_items: structuredRows.price_items,
      compare_items: structuredRows.compare_items,
      board_items: structuredRows.board_items,
      updated_at: new Date().toISOString(),
    };

    if (composerMode === "edit" && draft.id) {
      if (isPersonal) {
        savePersonalNotes(noteList.map((note) => (note.id === draft.id ? { ...note, ...basePatch } : note)));
        setComposerOpen(false);
        return;
      }

      setNoteLoading(true);

      const { data, error } = await supabase
        .from(SHARED_NOTE_TABLE)
        .update(basePatch)
        .eq("id", draft.id)
        .select("*")
        .single();

      setNoteLoading(false);

      if (error) {
        setNoteError(`Update note gagal: ${error.message}`);
        return;
      }

      setNoteList((prev) => sortNotes(prev.map((note) => (note.id === data.id ? normalizeNote(data) : note))));
      setComposerOpen(false);
      return;
    }

    const nextNote = normalizeNote(
      {
        id: makeId(),
        scope: activeScope,
        ...basePatch,
        position_x: 90 + (noteList.length % 3) * 380,
        position_y: 100 + Math.floor(noteList.length / 3) * 250,
        sort_order: noteList.length + 1,
      },
      noteList.length
    );

    if (isPersonal) {
      savePersonalNotes([nextNote, ...noteList]);
      setActiveId(nextNote.id);
      setComposerOpen(false);
      return;
    }

    setNoteLoading(true);

    const { data, error } = await supabase
      .from(SHARED_NOTE_TABLE)
      .insert({
        scope: activeScope,
        title: nextNote.title,
        note: nextNote.note,
        link_label: nextNote.link_label,
        link_url: nextNote.link_url,
        color: nextNote.color,
        type: nextNote.type,
        font_style: nextNote.font_style,
        sort_order: nextNote.sort_order,
        position_x: nextNote.position_x,
        position_y: nextNote.position_y,
        card_width: nextNote.card_width,
        card_height: nextNote.card_height,
        is_pinned: false,
        checklist_items: nextNote.checklist_items || [],
        price_items: nextNote.price_items || [],
        compare_items: nextNote.compare_items || [],
        board_items: nextNote.board_items || [],
      })
      .select("*")
      .single();

    setNoteLoading(false);

    if (error) {
      setNoteError(`Create note gagal: ${error.message}`);
      return;
    }

    const normalized = normalizeNote(data);
    setNoteList((prev) => sortNotes([normalized, ...prev]));
    setActiveId(normalized.id);
    setComposerOpen(false);
  }

  async function deleteNote(note) {
    if (!note) return;

    if (isPersonal) {
      const next = noteList.filter((item) => item.id !== note.id);
      savePersonalNotes(next);
      setActiveId(next[0]?.id || null);
      return;
    }

    setNoteLoading(true);

    const { error } = await supabase.from(SHARED_NOTE_TABLE).delete().eq("id", note.id);

    setNoteLoading(false);

    if (error) {
      setNoteError(`Delete note gagal: ${error.message}`);
      return;
    }

    setNoteList((prev) => prev.filter((item) => item.id !== note.id));
  }

  async function togglePinned(note) {
    if (!note) return;

    const patch = {
      is_pinned: !note.is_pinned,
      updated_at: new Date().toISOString(),
    };

    if (isPersonal) {
      savePersonalNotes(noteList.map((item) => (item.id === note.id ? { ...item, ...patch } : item)));
      return;
    }

    const { error } = await supabase.from(SHARED_NOTE_TABLE).update(patch).eq("id", note.id);

    if (error) {
      setNoteError(`Pin note gagal: ${error.message}`);
      return;
    }

    setNoteList((prev) => sortNotes(prev.map((item) => (item.id === note.id ? { ...item, ...patch } : item))));
  }

  function renderNoteBody(note) {
    const type = note.type || "note";

    if (type === "todo") {
      const items = normalizeJsonArray(note.checklist_items).filter((item) => item.text);

      return (
        <div className="mt-4 space-y-2">
          {(items.length ? items : [{ text: "Checklist item", checked: false }]).slice(0, 6).map((item, index) => (
            <div key={`${note.id}-todo-${index}`} className="flex items-center gap-2 text-sm text-neutral-600">
              <span className={`grid h-4 w-4 shrink-0 place-items-center rounded border ${item.checked ? "border-neutral-950 bg-neutral-950" : "border-black/15 bg-white"}`}>
                {item.checked ? <CheckCircle2 size={11} className="text-white" /> : null}
              </span>
              <span className="line-clamp-1">{item.text}</span>
            </div>
          ))}
        </div>
      );
    }

    if (type === "price") {
      const items = normalizeJsonArray(note.price_items).filter((item) => item.label || item.old_price || item.new_price || item.note);

      return (
        <div className="mt-4 grid gap-2">
          {(items.length ? items : [{ label: "Price item", old_price: "", new_price: "", note: "" }]).slice(0, 4).map((item, index) => (
            <div key={`${note.id}-price-${index}`} className="rounded-[15px] bg-neutral-50 px-3 py-2">
              <p className="text-xs font-semibold text-neutral-500">{item.label || "Item"}</p>
              <div className="mt-1 flex items-center gap-2">
                {item.old_price ? <span className="text-sm font-semibold text-neutral-400 line-through">{item.old_price}</span> : null}
                {item.new_price ? <span className="text-base font-bold text-neutral-950">{item.new_price}</span> : null}
              </div>
              {item.note ? <p className="mt-1 text-xs text-neutral-500">{item.note}</p> : null}
            </div>
          ))}
        </div>
      );
    }

    if (type === "compare") {
      const items = normalizeJsonArray(note.compare_items).filter((item) => item.before || item.after);

      return (
        <div className="mt-4 grid gap-2">
          {(items.length ? items : [{ before: "Before", after: "After" }]).slice(0, 3).map((item, index) => (
            <div key={`${note.id}-compare-${index}`} className="grid grid-cols-2 gap-2">
              <div className="rounded-[14px] border border-black/5 bg-neutral-50 px-3 py-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-neutral-400">Before</p>
                <p className="mt-1 line-clamp-2 text-xs font-semibold text-neutral-600">{item.before || "-"}</p>
              </div>
              <div className="rounded-[14px] border border-emerald-100 bg-emerald-50 px-3 py-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-500">After</p>
                <p className="mt-1 line-clamp-2 text-xs font-semibold text-emerald-700">{item.after || "-"}</p>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (type === "board") {
      const items = normalizeJsonArray(note.board_items).filter((item) => item.text);
      const columns = [
        { id: "todo", label: "To Do" },
        { id: "doing", label: "Doing" },
        { id: "done", label: "Done" },
      ];

      return (
        <div className="mt-4 grid grid-cols-3 gap-2">
          {columns.map((column) => (
            <div key={column.id} className="rounded-[15px] bg-neutral-50 p-2">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.12em] text-neutral-400">{column.label}</p>
              <div className="space-y-1.5">
                {items.filter((item) => item.status === column.id).slice(0, 3).map((item, index) => (
                  <div key={`${column.id}-${index}`} className="rounded-[10px] bg-white px-2 py-1.5 text-[11px] font-semibold text-neutral-600 shadow-sm">
                    {item.text}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <p className="mt-4 line-clamp-5 whitespace-pre-line text-sm leading-6 text-neutral-600">
        {note.note || "Write something useful here."}
      </p>
    );
  }

  function renderStructuredEditor() {
    if (draft.type === "todo") {
      return (
        <div className="rounded-[24px] bg-white p-3">
          <EditorHeader title="Checklist Items" onAdd={() => addDraftRow("todo")} label="Add Item" />
          <div className="space-y-2">
            {(draft.checklist_items || []).map((item) => (
              <div key={item.id} className="grid grid-cols-[34px_1fr_34px] gap-2">
                <button type="button" onClick={() => updateDraftArray("checklist_items", item.id, { checked: !item.checked })} className={`grid h-11 place-items-center rounded-[14px] ${item.checked ? "bg-neutral-950 text-white" : "bg-neutral-100 text-neutral-400"}`}>
                  <CheckCircle2 size={16} />
                </button>
                <input value={item.text || ""} onChange={(event) => updateDraftArray("checklist_items", item.id, { text: event.target.value })} placeholder="Checklist item" className="rounded-[14px] border border-black/5 bg-neutral-50 px-3 text-sm font-semibold outline-none" />
                <DeleteRowButton onClick={() => removeDraftRow("checklist_items", item.id, makeChecklistItem(""))} />
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (draft.type === "price") {
      return (
        <div className="rounded-[24px] bg-white p-3">
          <EditorHeader title="Price Rows" onAdd={() => addDraftRow("price")} label="Add Price" />

          <div className="mb-2 grid grid-cols-[minmax(120px,1.05fr)_minmax(92px,.82fr)_minmax(92px,.82fr)_minmax(110px,1fr)_34px] gap-2 px-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-neutral-400">Item / SKU</p>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-neutral-400">Old Price</p>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-neutral-400">New Price</p>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-neutral-400">Note</p>
            <span />
          </div>

          <div className="space-y-2">
            {(draft.price_items || []).map((item) => (
              <div key={item.id} className="grid grid-cols-[minmax(120px,1.05fr)_minmax(92px,.82fr)_minmax(92px,.82fr)_minmax(110px,1fr)_34px] gap-2">
                <input value={item.label || ""} onChange={(event) => updateDraftArray("price_items", item.id, { label: event.target.value })} placeholder="Item / SKU" className="rounded-[14px] border border-black/5 bg-neutral-50 px-3 text-xs font-semibold outline-none" />
                <input value={item.old_price || ""} onChange={(event) => updateDraftArray("price_items", item.id, { old_price: event.target.value })} placeholder="Old price" className="rounded-[14px] border border-black/5 bg-neutral-50 px-3 text-xs font-semibold outline-none" />
                <input value={item.new_price || ""} onChange={(event) => updateDraftArray("price_items", item.id, { new_price: event.target.value })} placeholder="New price" className="rounded-[14px] border border-black/5 bg-neutral-50 px-3 text-xs font-semibold outline-none" />
                <input value={item.note || ""} onChange={(event) => updateDraftArray("price_items", item.id, { note: event.target.value })} placeholder="Note" className="rounded-[14px] border border-black/5 bg-neutral-50 px-3 text-xs font-semibold outline-none" />
                <DeleteRowButton onClick={() => removeDraftRow("price_items", item.id, makePriceItem("", "", "", ""))} />
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (draft.type === "compare") {
      return (
        <div className="rounded-[24px] bg-white p-3">
          <EditorHeader title="Compare Columns" onAdd={() => addDraftRow("compare")} label="Add Row" />
          <div className="mb-2 grid grid-cols-[1fr_1fr_34px] gap-2 px-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-neutral-400">Before</p>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-500">After</p>
            <span />
          </div>
          <div className="space-y-2">
            {(draft.compare_items || []).map((item) => (
              <div key={item.id} className="grid grid-cols-[1fr_1fr_34px] gap-2">
                <input value={item.before || ""} onChange={(event) => updateDraftArray("compare_items", item.id, { before: event.target.value })} placeholder="Before" className="rounded-[14px] border border-black/5 bg-neutral-50 px-3 text-sm font-semibold outline-none" />
                <input value={item.after || ""} onChange={(event) => updateDraftArray("compare_items", item.id, { after: event.target.value })} placeholder="After" className="rounded-[14px] border border-emerald-100 bg-emerald-50 px-3 text-sm font-semibold text-emerald-700 outline-none" />
                <DeleteRowButton onClick={() => removeDraftRow("compare_items", item.id, makeCompareItem("", ""))} />
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (draft.type === "board") {
      return (
        <div className="rounded-[24px] bg-white p-3">
          <EditorHeader title="Board Cards" onAdd={() => addDraftRow("board")} label="Add Card" />
          <div className="space-y-2">
            {(draft.board_items || []).map((item) => (
              <div key={item.id} className="grid grid-cols-[120px_1fr_34px] gap-2">
                <select value={item.status || "todo"} onChange={(event) => updateDraftArray("board_items", item.id, { status: event.target.value })} className="rounded-[14px] border border-black/5 bg-neutral-50 px-3 text-xs font-semibold outline-none">
                  <option value="todo">To Do</option>
                  <option value="doing">Doing</option>
                  <option value="done">Done</option>
                </select>
                <input value={item.text || ""} onChange={(event) => updateDraftArray("board_items", item.id, { text: event.target.value })} placeholder="Board card" className="rounded-[14px] border border-black/5 bg-neutral-50 px-3 text-sm font-semibold outline-none" />
                <DeleteRowButton onClick={() => removeDraftRow("board_items", item.id, makeBoardItem("todo", ""))} />
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <textarea value={draft.note} onChange={(event) => setDraft((prev) => ({ ...prev, note: event.target.value }))} placeholder={draft.type === "link" ? "Short description for this link..." : "Write memo..."} className="h-[210px] w-full resize-none rounded-[22px] border border-black/5 bg-white px-4 py-4 text-sm leading-6 outline-none" />
    );
  }

  const sortedNotes = sortNotes(noteList);

  return (
    <section className="pb-8">
      <style>{`
        html[data-adf-theme="dark"] .adf-note-modal-card {
          background: #18181b !important;
          color: #fafafa !important;
          border-color: rgba(255,255,255,0.12) !important;
        }

        html[data-adf-theme="dark"] .adf-note-modal-card h1,
        html[data-adf-theme="dark"] .adf-note-modal-card h2,
        html[data-adf-theme="dark"] .adf-note-modal-card h3,
        html[data-adf-theme="dark"] .adf-note-modal-card [class*="text-neutral-950"],
        html[data-adf-theme="dark"] .adf-note-modal-card [class*="text-neutral-900"],
        html[data-adf-theme="dark"] .adf-note-modal-card [class*="text-neutral-800"],
        html[data-adf-theme="dark"] .adf-note-modal-card [class*="text-neutral-700"],
        html[data-adf-theme="dark"] .adf-note-modal-card [class*="text-neutral-600"] {
          color: #fafafa !important;
        }

        html[data-adf-theme="dark"] .adf-note-modal-card [class*="text-neutral-500"],
        html[data-adf-theme="dark"] .adf-note-modal-card [class*="text-neutral-400"] {
          color: rgba(250,250,250,0.58) !important;
        }

        html[data-adf-theme="dark"] .adf-note-modal-card input,
        html[data-adf-theme="dark"] .adf-note-modal-card textarea,
        html[data-adf-theme="dark"] .adf-note-modal-card select {
          background: rgba(39,39,42,0.94) !important;
          color: #fafafa !important;
          border-color: rgba(255,255,255,0.10) !important;
        }

        html[data-adf-theme="dark"] .adf-note-modal-card input::placeholder,
        html[data-adf-theme="dark"] .adf-note-modal-card textarea::placeholder {
          color: rgba(250,250,250,0.38) !important;
        }

        html[data-adf-theme="dark"] .adf-note-modal-card [class*="bg-white"],
        html[data-adf-theme="dark"] .adf-note-modal-card [class*="bg-neutral-50"],
        html[data-adf-theme="dark"] .adf-note-modal-card [class*="bg-neutral-100"] {
          background-color: rgba(39,39,42,0.88) !important;
          border-color: rgba(255,255,255,0.10) !important;
        }

        html[data-adf-theme="dark"] .adf-note-modal-card [class*="border-black/5"],
        html[data-adf-theme="dark"] .adf-note-modal-card [class*="border-white"] {
          border-color: rgba(255,255,255,0.10) !important;
        }

        html[data-adf-theme="dark"] .adf-note-modal-card button[class*="bg-white"] {
          background-color: rgba(63,63,70,0.88) !important;
          color: #fafafa !important;
        }

        html[data-adf-theme="dark"] .adf-note-modal-card button[class*="bg-neutral-950"],
        html[data-adf-theme="dark"] .adf-note-modal-card .bg-neutral-950 {
          background-color: #fafafa !important;
          color: #09090b !important;
        }
      `}</style>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-neutral-400">Notes</p>
          <h2 className="mt-1 text-[34px] font-semibold leading-none tracking-[-0.06em]">Canvas Board</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-500">
            Drag notes freely like a lightweight Milanote board. Shared scopes sync online, Personal stays private in this browser.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {NOTE_SCOPE_OPTIONS.map((scope) => (
            <button key={scope.id} onClick={() => setActiveScope(scope.id)} className={`rounded-full px-4 py-2 text-xs font-semibold shadow-sm transition ${activeScope === scope.id ? "bg-neutral-950 text-white" : "bg-white/80 text-neutral-500 hover:text-neutral-950"}`}>
              {scope.label}
            </button>
          ))}

          <button onClick={openCreateComposer} className="inline-flex items-center gap-2 rounded-full bg-neutral-950 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-neutral-800 active:scale-[0.985]">
            <Plus size={15} />
            New Note
          </button>
        </div>
      </div>

      {noteError ? <div className="mb-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">{noteError}</div> : null}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="request-scroll h-[680px] overflow-auto rounded-[34px] border border-white/70 bg-white/54 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.07)] backdrop-blur-xl">
          <div className="relative min-h-[1180px] min-w-[1550px] rounded-[28px] border border-dashed border-black/10 bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.05)_1px,transparent_0)] [background-size:28px_28px]">
            <div className="sticky left-5 top-5 z-30 inline-flex items-center gap-2 rounded-full border border-black/5 bg-white/90 px-4 py-2 text-xs font-semibold text-neutral-500 shadow-sm backdrop-blur-xl">
              {noteLoading ? <Loader2 size={14} className="animate-spin" /> : <StickyNote size={14} />}
              {activeScopeInfo.label} · {sortedNotes.length} notes
            </div>

            {sortedNotes.length === 0 ? (
              <div className="absolute left-1/2 top-[280px] w-[360px] -translate-x-1/2 rounded-[28px] border border-dashed border-black/10 bg-white/80 p-8 text-center shadow-sm">
                <StickyNote className="mx-auto text-neutral-300" size={36} />
                <p className="mt-4 text-sm font-semibold text-neutral-600">No notes yet</p>
                <p className="mt-1 text-xs text-neutral-400">Click New Note to create your first canvas card.</p>
              </div>
            ) : null}

            {sortedNotes.map((note) => {
              const color = getTrackColor(note.color || "blue");
              const type = getNoteType(note.type || "note");
              const font = getNoteFont(note.font_style || "clean");
              const TypeIcon = type.icon;
              const isActive = activeId === note.id;

              return (
                <div key={note.id} onClick={() => setActiveId(note.id)} className={`absolute overflow-hidden rounded-[26px] border bg-white shadow-[0_20px_55px_rgba(0,0,0,0.10)] transition ${isActive ? "ring-2 ring-neutral-950/15" : "hover:-translate-y-0.5"}`} style={{ left: note.position_x, top: note.position_y, width: note.card_width || 340, minHeight: note.card_height || 220, borderColor: color.border }}>
                  <div className="h-3 w-full" style={{ background: `linear-gradient(90deg, ${color.dot}, rgba(255,255,255,0.65))` }} />

                  <div className="p-4">
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <button type="button" className="flex cursor-grab items-center gap-2 rounded-[14px] bg-neutral-50 px-2.5 py-2 text-neutral-400 active:cursor-grabbing" onPointerDown={(event) => { event.preventDefault(); setActiveId(note.id); setDragState({ id: note.id, startX: event.clientX, startY: event.clientY, originX: note.position_x || 0, originY: note.position_y || 0 }); }} title="Drag note">
                        <GripVertical size={16} />
                        <TypeIcon size={16} />
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button type="button" onClick={(event) => { event.stopPropagation(); togglePinned(note); }} className={`grid h-8 w-8 place-items-center rounded-full transition ${note.is_pinned ? "bg-neutral-950 text-white" : "bg-neutral-50 text-neutral-400 hover:text-neutral-950"}`} title="Pin note">
                          <Pin size={14} />
                        </button>

                        <button type="button" onClick={(event) => { event.stopPropagation(); openEditComposer(note); }} className="rounded-full bg-neutral-50 px-3 py-2 text-xs font-semibold text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-950">
                          Edit
                        </button>

                        <button type="button" onClick={(event) => { event.stopPropagation(); deleteNote(note); }} className="grid h-8 w-8 place-items-center rounded-full bg-red-50 text-red-500 transition hover:bg-red-100" title="Delete note">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <span className="rounded-full px-3 py-1 text-[11px] font-semibold" style={{ background: color.soft, color: color.text }}>
                        {type.label}
                      </span>
                      {note.is_pinned ? <span className="rounded-full bg-neutral-100 px-3 py-1 text-[11px] font-semibold text-neutral-500">pinned</span> : null}
                    </div>

                    <h3 className={`text-[22px] leading-[1.02] text-neutral-950 ${font.titleClass}`}>{note.title || "Untitled Note"}</h3>

                    {renderNoteBody(note)}

                    {note.link_url ? (
                      <a href={note.link_url} target="_blank" rel="noreferrer" onClick={(event) => event.stopPropagation()} className="mt-4 inline-flex items-center gap-2 rounded-full bg-neutral-950 px-4 py-2 text-xs font-semibold text-white transition hover:bg-neutral-800">
                        <Link2 size={14} />
                        {note.link_label || "Open Link"}
                      </a>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <aside className="self-start rounded-[34px] border border-white/70 bg-white/76 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.07)] backdrop-blur-xl">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-neutral-400">Inspector</p>

          {activeNote ? (
            <>
              <h3 className="mt-2 text-[28px] font-semibold leading-[0.96] tracking-[-0.06em]">{activeNote.title || "Untitled Note"}</h3>
              <p className="mt-3 text-sm leading-6 text-neutral-500">{activeNote.note || "No content yet."}</p>

              <div className="mt-5 grid gap-2 text-xs text-neutral-500">
                <div className="flex items-center justify-between rounded-[16px] bg-neutral-50 px-3 py-2">
                  <span>Type</span>
                  <span className="font-semibold text-neutral-800">{getNoteType(activeNote.type).label}</span>
                </div>
                <div className="flex items-center justify-between rounded-[16px] bg-neutral-50 px-3 py-2">
                  <span>Scope</span>
                  <span className="font-semibold text-neutral-800">{activeScopeInfo.label}</span>
                </div>
                <div className="flex items-center justify-between rounded-[16px] bg-neutral-50 px-3 py-2">
                  <span>Updated</span>
                  <span className="font-semibold text-neutral-800">{formatDateTime(activeNote.updated_at)}</span>
                </div>
              </div>

              <button type="button" onClick={() => openEditComposer(activeNote)} className="mt-5 flex w-full items-center justify-center gap-2 rounded-[20px] bg-neutral-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800">
                <Save size={17} />
                Edit Selected
              </button>
            </>
          ) : (
            <div className="mt-5 rounded-[24px] border border-dashed border-black/10 bg-neutral-50 p-8 text-center">
              <StickyNote className="mx-auto text-neutral-300" size={32} />
              <p className="mt-3 text-sm font-semibold text-neutral-600">Select note</p>
              <p className="mt-1 text-xs text-neutral-400">Click a card on canvas to inspect.</p>
            </div>
          )}

          <button type="button" onClick={openCreateComposer} className="mt-4 flex w-full items-center justify-center gap-2 rounded-[20px] bg-white px-4 py-3 text-sm font-semibold text-neutral-700 shadow-sm transition hover:bg-neutral-100">
            <Plus size={17} />
            Create Note
          </button>
        </aside>
      </div>

      {composerOpen &&
        createPortal(
          <div className="adf-note-modal fixed inset-0 z-[999999] grid place-items-center bg-black/35 px-5 py-8 backdrop-blur-sm">
            <div className="adf-note-modal-card w-full max-w-6xl overflow-hidden rounded-[34px] border border-white/70 bg-[#f5f5f3] p-5 shadow-[0_35px_120px_rgba(0,0,0,0.28)]">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-neutral-400">{composerMode === "edit" ? "Edit Note" : "New Note"}</p>
                  <h3 className="mt-2 text-3xl font-semibold tracking-[-0.07em] text-neutral-950">{composerMode === "edit" ? "Update canvas card." : "Create canvas card."}</h3>
                </div>

                <button type="button" onClick={() => setComposerOpen(false)} className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white text-neutral-500 shadow-sm transition hover:bg-neutral-100 hover:text-neutral-950">
                  <X size={20} />
                </button>
              </div>

              <div className="grid min-w-0 gap-4 md:grid-cols-[minmax(0,1fr)_300px] md:items-start">
                <div className="min-w-0 space-y-3">
                  <input value={draft.title} onChange={(event) => setDraft((prev) => ({ ...prev, title: event.target.value }))} placeholder="Note title" className="w-full rounded-[22px] border border-black/5 bg-white px-4 py-4 text-sm font-semibold outline-none" />

                  {renderStructuredEditor()}

                  <div className={draft.type === "link" ? "grid grid-cols-2 gap-3 rounded-[22px] bg-white p-3" : "grid grid-cols-2 gap-3"}>
                    <input value={draft.link_label} onChange={(event) => setDraft((prev) => ({ ...prev, link_label: event.target.value }))} placeholder={draft.type === "link" ? "Button label" : "Link label optional"} className="w-full rounded-[20px] border border-black/5 bg-white px-4 py-3 text-sm font-semibold outline-none" />
                    <input value={draft.link_url} onChange={(event) => setDraft((prev) => ({ ...prev, link_url: event.target.value }))} placeholder={draft.type === "link" ? "https://..." : "Link URL optional"} className="w-full rounded-[20px] border border-black/5 bg-white px-4 py-3 text-sm font-semibold outline-none" />
                  </div>
                </div>

                <div className="min-w-0 space-y-4 rounded-[26px] bg-white/70 p-4">
                  <div>
                    <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-neutral-400">Type</p>
                    <div className="grid grid-cols-2 gap-2">
                      {NOTE_TYPE_OPTIONS.map((item) => {
                        const Icon = item.icon;
                        const isActive = draft.type === item.id;

                        return (
                          <button key={item.id} type="button" onClick={() => switchDraftType(item.id)} className={`flex items-center justify-center gap-2 rounded-[17px] px-3 py-3 text-xs font-semibold transition ${isActive ? "bg-neutral-950 text-white" : "bg-white text-neutral-500 hover:text-neutral-950"}`}>
                            <Icon size={15} />
                            {item.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-neutral-400">Style</p>
                    <div className="grid grid-cols-2 gap-2">
                      {NOTE_FONT_OPTIONS.map((item) => (
                        <button key={item.id} type="button" onClick={() => setDraft((prev) => ({ ...prev, font_style: item.id }))} className={`rounded-[17px] px-3 py-3 text-xs font-semibold transition ${draft.font_style === item.id ? "bg-neutral-950 text-white" : "bg-white text-neutral-500 hover:text-neutral-950"}`}>
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-neutral-400">Color</p>
                    <div className="grid grid-cols-6 gap-2">
                      {TRACK_COLORS.map((color) => (
                        <button key={color.id} type="button" onClick={() => setDraft((prev) => ({ ...prev, color: color.id }))} className={`grid h-10 place-items-center rounded-[14px] border bg-white transition ${draft.color === color.id ? "border-neutral-950" : "border-black/5"}`} title={color.label}>
                          <span className="h-4 w-4 rounded-full" style={{ background: color.dot }} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <button type="button" onClick={saveDraft} disabled={noteLoading} className="flex w-full items-center justify-center gap-2 rounded-[20px] bg-neutral-950 px-4 py-4 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:opacity-60">
                    {noteLoading ? <Loader2 size={17} className="animate-spin" /> : <Save size={17} />}
                    Save Note
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </section>
  );
}

function EditorHeader({ title, onAdd, label }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-neutral-400">{title}</p>
      <button type="button" onClick={onAdd} className="rounded-full bg-neutral-950 px-3 py-1.5 text-[11px] font-semibold text-white">
        {label}
      </button>
    </div>
  );
}

function DeleteRowButton({ onClick }) {
  return (
    <button type="button" onClick={onClick} className="grid h-11 place-items-center rounded-[14px] bg-red-50 text-red-500">
      <X size={15} />
    </button>
  );
}
