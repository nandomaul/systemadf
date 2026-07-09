import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  FileText,
  GripVertical,
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
const PERSONAL_NOTE_KEY = "systemadf_canvas_personal_notes_v3";

const NOTE_SCOPE_OPTIONS = [
  { id: "personal", label: "Personal" },
  { id: "adf", label: "ADF" },
  { id: "realme", label: "realme" },
  { id: "akaso", label: "AKASO" },
  { id: "business", label: "Business" },
];

const NOTE_TYPE_OPTIONS = [
  { id: "note", label: "Memo" },
  { id: "todo", label: "Todo" },
  { id: "price", label: "Price" },
  { id: "compare", label: "Compare" },
  { id: "board", label: "Board" },
];

const TRACK_COLORS = [
  { id: "blue", label: "Blue", dot: "#2563eb", border: "rgba(37, 99, 235, .28)", pill: "bg-blue-50 text-blue-600" },
  { id: "orange", label: "Orange", dot: "#f97316", border: "rgba(249, 115, 22, .28)", pill: "bg-orange-50 text-orange-600" },
  { id: "green", label: "Green", dot: "#059669", border: "rgba(5, 150, 105, .24)", pill: "bg-emerald-50 text-emerald-600" },
  { id: "purple", label: "Purple", dot: "#7c3aed", border: "rgba(124, 58, 237, .24)", pill: "bg-violet-50 text-violet-600" },
  { id: "black", label: "Black", dot: "#111827", border: "rgba(17, 24, 39, .20)", pill: "bg-neutral-100 text-neutral-700" },
];

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const makeId = () => `note-${Date.now()}-${Math.random().toString(16).slice(2)}`;
const getColor = (id) => TRACK_COLORS.find((item) => item.id === id) || TRACK_COLORS[0];
const getType = (id) => NOTE_TYPE_OPTIONS.find((item) => item.id === id) || NOTE_TYPE_OPTIONS[0];

function normalizeBoardNotes(notes = []) {
  return (Array.isArray(notes) ? notes : []).map((item, index) => ({
    id: item.id || makeId(),
    title: item.title || item.name || `Canvas Note ${index + 1}`,
    note: item.note || item.content || item.description || "Write note here.",
    color: item.color || ["blue", "orange", "green"][index % 3],
    type: item.type || "note",
    position_x: Number.isFinite(Number(item.position_x))
      ? Number(item.position_x)
      : Number.isFinite(Number(item.x))
        ? Number(item.x)
        : 70 + (index % 3) * 390,
    position_y: Number.isFinite(Number(item.position_y))
      ? Number(item.position_y)
      : Number.isFinite(Number(item.y))
        ? Number(item.y)
        : 80 + Math.floor(index / 3) * 260,
    card_width: Number.isFinite(Number(item.card_width)) ? Number(item.card_width) : 340,
    card_height: Number.isFinite(Number(item.card_height)) ? Number(item.card_height) : 220,
    sort_order: Number.isFinite(Number(item.sort_order)) ? Number(item.sort_order) : index + 1,
    is_pinned: Boolean(item.is_pinned || item.pinned),
    created_at: item.created_at || new Date().toISOString(),
    updated_at: item.updated_at || new Date().toISOString(),
  }));
}

export default function StructuredCanvasNotesPanel({ notes = [] }) {
  const [activeScope, setActiveScope] = useState("personal");
  const [noteList, setNoteList] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [noteLoading, setNoteLoading] = useState(false);
  const [noteError, setNoteError] = useState("");
  const [composerOpen, setComposerOpen] = useState(false);
  const [composerMode, setComposerMode] = useState("create");
  const [draggingId, setDraggingId] = useState(null);
  const [draft, setDraft] = useState({
    id: null,
    title: "",
    note: "",
    color: "blue",
    type: "note",
  });

  const noteListRef = useRef([]);
  const dragRef = useRef(null);
  const isPersonal = activeScope === "personal";
  const activeScopeInfo = NOTE_SCOPE_OPTIONS.find((item) => item.id === activeScope) || NOTE_SCOPE_OPTIONS[0];

  useEffect(() => {
    noteListRef.current = noteList;
  }, [noteList]);

  const sortNotes = (items) =>
    [...(items || [])].sort((a, b) => {
      if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
      const aOrder = Number.isFinite(Number(a.sort_order)) ? Number(a.sort_order) : 999999;
      const bOrder = Number.isFinite(Number(b.sort_order)) ? Number(b.sort_order) : 999999;
      if (aOrder !== bOrder) return aOrder - bOrder;
      return String(a.created_at || "").localeCompare(String(b.created_at || ""));
    });

  const normalizeNote = (note, index = 0) => ({
    id: note.id || makeId(),
    scope: note.scope || activeScope,
    title: note.title || "New Note",
    note: note.note || note.content || "",
    color: note.color || ["blue", "orange", "green", "purple"][index % 4],
    type: note.type || note.note_type || "note",
    position_x: Number.isFinite(Number(note.position_x))
      ? Number(note.position_x)
      : Number.isFinite(Number(note.x))
        ? Number(note.x)
        : 70 + (index % 3) * 390,
    position_y: Number.isFinite(Number(note.position_y))
      ? Number(note.position_y)
      : Number.isFinite(Number(note.y))
        ? Number(note.y)
        : 80 + Math.floor(index / 3) * 260,
    card_width: Number.isFinite(Number(note.card_width)) ? Number(note.card_width) : 340,
    card_height: Number.isFinite(Number(note.card_height)) ? Number(note.card_height) : 220,
    sort_order: Number.isFinite(Number(note.sort_order)) ? Number(note.sort_order) : index + 1,
    is_pinned: Boolean(note.is_pinned || note.pinned),
    created_at: note.created_at || new Date().toISOString(),
    updated_at: note.updated_at || new Date().toISOString(),
  });

  const savePersonalNotes = (items) => {
    const normalized = sortNotes(items.map((item, index) => normalizeNote(item, index)));
    noteListRef.current = normalized;
    setNoteList(normalized);
    window.localStorage.setItem(PERSONAL_NOTE_KEY, JSON.stringify(normalized));
  };

  const loadPersonalNotes = () => {
    try {
      const saved = window.localStorage.getItem(PERSONAL_NOTE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const normalized = sortNotes(parsed.map((item, index) => normalizeNote({ ...item, scope: "personal" }, index)));
          setNoteList(normalized);
          setActiveId((current) => normalized.some((item) => item.id === current) ? current : normalized[0]?.id || null);
          return;
        }
      }
    } catch (error) {
      console.error("Load personal notes error:", error);
    }

    const defaults = sortNotes(normalizeBoardNotes(notes).map((item, index) => normalizeNote({ ...item, scope: "personal" }, index)));
    setNoteList(defaults);
    setActiveId(defaults[0]?.id || null);
    window.localStorage.setItem(PERSONAL_NOTE_KEY, JSON.stringify(defaults));
  };

  const loadSharedNotes = async (scope = activeScope) => {
    setNoteLoading(true);
    setNoteError("");

    const { data, error } = await supabase
      .from(SHARED_NOTE_TABLE)
      .select("*")
      .eq("scope", scope)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    setNoteLoading(false);

    if (error) {
      setNoteList([]);
      setActiveId(null);
      setNoteError(`Load notes gagal: ${error.message}. Kalau ini scope online, cek table team_notes.`);
      return;
    }

    const normalized = sortNotes((data || []).map((item, index) => normalizeNote(item, index)));
    setNoteList(normalized);
    setActiveId((current) => normalized.some((item) => item.id === current) ? current : normalized[0]?.id || null);
  };

  useEffect(() => {
    if (isPersonal) {
      loadPersonalNotes();
      return undefined;
    }

    loadSharedNotes(activeScope);

    const channel = supabase
      .channel(`systemadf-canvas-notes-${activeScope}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: SHARED_NOTE_TABLE, filter: `scope=eq.${activeScope}` },
        () => loadSharedNotes(activeScope)
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [activeScope]);

  const activeNote = noteList.find((note) => note.id === activeId) || noteList[0] || null;

  const persistNotePosition = async (noteId, x, y) => {
    const next = noteListRef.current.map((note) =>
      note.id === noteId
        ? { ...note, position_x: x, position_y: y, updated_at: new Date().toISOString() }
        : note
    );

    if (isPersonal) {
      savePersonalNotes(next);
      return;
    }

    const { error } = await supabase
      .from(SHARED_NOTE_TABLE)
      .update({ position_x: x, position_y: y, updated_at: new Date().toISOString() })
      .eq("id", noteId);

    if (error) {
      setNoteError(`Drag save gagal: ${error.message}. Posisi tetap terlihat di browser, tapi belum tersimpan online.`);
    }
  };

  const startDrag = (event, note) => {
    event.preventDefault();
    event.stopPropagation();
    setActiveId(note.id);
    setDraggingId(note.id);

    dragRef.current = {
      id: note.id,
      startX: event.clientX,
      startY: event.clientY,
      originX: Number(note.position_x) || 0,
      originY: Number(note.position_y) || 0,
      latestX: Number(note.position_x) || 0,
      latestY: Number(note.position_y) || 0,
    };

    const handleMove = (moveEvent) => {
      const drag = dragRef.current;
      if (!drag) return;

      const nextX = clamp(Math.round(drag.originX + moveEvent.clientX - drag.startX), 0, 1420);
      const nextY = clamp(Math.round(drag.originY + moveEvent.clientY - drag.startY), 0, 1040);

      drag.latestX = nextX;
      drag.latestY = nextY;

      setNoteList((prev) => {
        const next = prev.map((item) =>
          item.id === drag.id ? { ...item, position_x: nextX, position_y: nextY } : item
        );
        noteListRef.current = next;
        if (isPersonal) window.localStorage.setItem(PERSONAL_NOTE_KEY, JSON.stringify(next));
        return next;
      });
    };

    const handleUp = () => {
      const drag = dragRef.current;
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
      window.removeEventListener("pointercancel", handleUp);

      if (drag) persistNotePosition(drag.id, drag.latestX, drag.latestY);
      dragRef.current = null;
      setDraggingId(null);
    };

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    window.addEventListener("pointercancel", handleUp);
  };

  const openCreateComposer = () => {
    setComposerMode("create");
    setDraft({
      id: null,
      title: "",
      note: "",
      color: TRACK_COLORS[noteList.length % TRACK_COLORS.length]?.id || "blue",
      type: "note",
    });
    setComposerOpen(true);
  };

  const openEditComposer = (note) => {
    if (!note) return;
    setComposerMode("edit");
    setDraft({
      id: note.id,
      title: note.title || "",
      note: note.note || "",
      color: note.color || "blue",
      type: note.type || "note",
    });
    setComposerOpen(true);
  };

  const saveNote = async () => {
    const now = new Date().toISOString();

    if (composerMode === "edit" && draft.id) {
      const patch = {
        title: draft.title.trim() || "Untitled Note",
        note: draft.note.trim() || "No content.",
        color: draft.color || "blue",
        type: draft.type || "note",
        updated_at: now,
      };

      const next = noteListRef.current.map((item) => (item.id === draft.id ? { ...item, ...patch } : item));
      if (isPersonal) {
        savePersonalNotes(next);
      } else {
        setNoteList(next);
        const { error } = await supabase.from(SHARED_NOTE_TABLE).update(patch).eq("id", draft.id);
        if (error) {
          setNoteError(`Update note gagal: ${error.message}`);
          return;
        }
      }

      setComposerOpen(false);
      return;
    }

    const nextNote = normalizeNote({
      id: isPersonal ? makeId() : undefined,
      scope: activeScope,
      title: draft.title.trim() || "New Note",
      note: draft.note.trim() || "Write note here.",
      color: draft.color || "blue",
      type: draft.type || "note",
      position_x: 80 + (noteList.length % 3) * 390,
      position_y: 90 + Math.floor(noteList.length / 3) * 260,
      sort_order: noteList.length + 1,
      created_at: now,
      updated_at: now,
    }, noteList.length);

    if (isPersonal) {
      const next = [...noteListRef.current, nextNote];
      savePersonalNotes(next);
      setActiveId(nextNote.id);
      setComposerOpen(false);
      return;
    }

    const { data, error } = await supabase
      .from(SHARED_NOTE_TABLE)
      .insert({
        scope: activeScope,
        title: nextNote.title,
        note: nextNote.note,
        color: nextNote.color,
        type: nextNote.type,
        position_x: nextNote.position_x,
        position_y: nextNote.position_y,
        card_width: nextNote.card_width,
        card_height: nextNote.card_height,
        sort_order: nextNote.sort_order,
        is_pinned: false,
        created_at: now,
        updated_at: now,
      })
      .select("*")
      .single();

    if (error) {
      setNoteError(`Add note gagal: ${error.message}`);
      return;
    }

    const normalized = normalizeNote(data, noteList.length);
    setNoteList((prev) => [...prev, normalized]);
    setActiveId(normalized.id);
    setComposerOpen(false);
  };

  const togglePinned = async (note) => {
    if (!note) return;
    const patch = { is_pinned: !note.is_pinned, updated_at: new Date().toISOString() };
    const next = noteListRef.current.map((item) => (item.id === note.id ? { ...item, ...patch } : item));

    if (isPersonal) {
      savePersonalNotes(next);
      return;
    }

    setNoteList(next);
    const { error } = await supabase.from(SHARED_NOTE_TABLE).update(patch).eq("id", note.id);
    if (error) setNoteError(`Pin note gagal: ${error.message}`);
  };

  const deleteNote = async (note) => {
    if (!note) return;
    const next = noteListRef.current.filter((item) => item.id !== note.id).map((item, index) => ({ ...item, sort_order: index + 1 }));
    setActiveId(next[0]?.id || null);

    if (isPersonal) {
      savePersonalNotes(next);
      return;
    }

    setNoteList(next);
    const { error } = await supabase.from(SHARED_NOTE_TABLE).delete().eq("id", note.id);
    if (error) setNoteError(`Delete note gagal: ${error.message}`);
  };

  const renderNoteBody = (note) => {
    const lines = String(note.note || "")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    if (note.type === "todo") {
      const items = lines.length ? lines : ["Checklist item"];
      return (
        <div className="mt-4 space-y-2">
          {items.slice(0, 6).map((item, index) => (
            <div key={index} className="flex items-center gap-2 text-sm text-neutral-600">
              <span className="grid h-4 w-4 shrink-0 place-items-center rounded border border-black/15 bg-white" />
              <span className="line-clamp-1">{item}</span>
            </div>
          ))}
        </div>
      );
    }

    if (["price", "compare", "board"].includes(note.type)) {
      const items = lines.length ? lines : ["Board item"];
      return (
        <div className={note.type === "compare" ? "mt-4 grid grid-cols-2 gap-2" : "mt-4 flex flex-wrap gap-2"}>
          {items.slice(0, 7).map((item, index) => (
            <span key={index} className="rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-semibold text-neutral-600">
              {item}
            </span>
          ))}
        </div>
      );
    }

    return <p className="mt-4 line-clamp-5 whitespace-pre-line text-sm leading-6 text-neutral-600">{note.note || "Write something useful here."}</p>;
  };

  const sortedNotes = useMemo(() => sortNotes(noteList), [noteList]);

  return (
    <section className="pb-8">
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
            <button
              key={scope.id}
              type="button"
              onClick={() => setActiveScope(scope.id)}
              className={`rounded-full px-4 py-2 text-xs font-semibold shadow-sm transition ${activeScope === scope.id ? "bg-neutral-950 text-white" : "bg-white/80 text-neutral-500 hover:text-neutral-950"}`}
            >
              {scope.label}
            </button>
          ))}

          <button
            type="button"
            onClick={openCreateComposer}
            className="inline-flex items-center gap-2 rounded-full bg-neutral-950 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-neutral-800 active:scale-[0.985]"
          >
            <Plus size={15} />
            New Note
          </button>
        </div>
      </div>

      {noteError ? <div className="mb-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">{noteError}</div> : null}

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
            const color = getColor(note.color || "blue");
            const type = getType(note.type || "note");
            const isActive = activeId === note.id;
            const isDragging = draggingId === note.id;

            return (
              <div
                key={note.id}
                onClick={() => setActiveId(note.id)}
                className={`absolute overflow-hidden rounded-[26px] border bg-white shadow-[0_20px_55px_rgba(0,0,0,0.10)] transition ${isActive ? "ring-2 ring-neutral-950/15" : "hover:-translate-y-0.5"} ${isDragging ? "z-40 scale-[1.01] cursor-grabbing" : "z-10"}`}
                style={{
                  left: note.position_x,
                  top: note.position_y,
                  width: note.card_width || 340,
                  minHeight: note.card_height || 220,
                  borderColor: color.border,
                }}
              >
                <div className="h-3 w-full" style={{ background: `linear-gradient(90deg, ${color.dot}, rgba(255,255,255,0.65))` }} />

                <div className="p-4">
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <button
                      type="button"
                      className="flex cursor-grab touch-none select-none items-center gap-2 rounded-[14px] bg-neutral-50 px-2.5 py-2 text-neutral-400 active:cursor-grabbing"
                      onPointerDown={(event) => startDrag(event, note)}
                      title="Drag note"
                    >
                      <GripVertical size={16} />
                      <FileText size={16} />
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          togglePinned(note);
                        }}
                        className={`grid h-9 w-9 place-items-center rounded-full transition ${note.is_pinned ? "bg-neutral-950 text-white" : "bg-neutral-50 text-neutral-400 hover:text-neutral-950"}`}
                        title="Pin note"
                      >
                        <Pin size={15} />
                      </button>

                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          openEditComposer(note);
                        }}
                        className="rounded-full bg-neutral-50 px-4 py-2 text-xs font-semibold text-neutral-500 transition hover:text-neutral-950"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          deleteNote(note);
                        }}
                        className="grid h-9 w-9 place-items-center rounded-full bg-red-50 text-red-500 transition hover:bg-red-100"
                        title="Delete note"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  <span className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${color.pill}`}>{type.label}</span>
                  <h3 className="mt-4 text-[24px] font-semibold leading-[1.02] tracking-[-0.06em] text-neutral-950">{note.title}</h3>
                  {renderNoteBody(note)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {composerOpen ? (
        <div className="fixed inset-0 z-[999999] grid place-items-center bg-black/35 px-5 py-8 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-[34px] border border-white/70 bg-[#f5f5f3] p-5 shadow-[0_35px_120px_rgba(0,0,0,0.28)]">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-neutral-400">{composerMode === "edit" ? "Edit Note" : "New Note"}</p>
                <h3 className="mt-2 text-3xl font-semibold tracking-[-0.07em] text-neutral-950">{composerMode === "edit" ? "Update canvas card." : "Create canvas card."}</h3>
              </div>

              <button
                type="button"
                onClick={() => setComposerOpen(false)}
                className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white text-neutral-500 shadow-sm transition hover:bg-neutral-100 hover:text-neutral-950"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-[1fr_.75fr]">
              <div className="space-y-3">
                <input
                  value={draft.title}
                  onChange={(event) => setDraft((prev) => ({ ...prev, title: event.target.value }))}
                  placeholder="Note title"
                  className="w-full rounded-[22px] border border-black/5 bg-white px-4 py-4 text-sm font-semibold outline-none"
                />

                <textarea
                  value={draft.note}
                  onChange={(event) => setDraft((prev) => ({ ...prev, note: event.target.value }))}
                  placeholder="Write note, checklist, price, or reminder..."
                  className="h-[230px] w-full resize-none rounded-[22px] border border-black/5 bg-white px-4 py-4 text-sm leading-6 outline-none"
                />
              </div>

              <div className="space-y-4 rounded-[26px] bg-white/70 p-4">
                <div>
                  <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-neutral-400">Type</p>
                  <div className="grid grid-cols-2 gap-2">
                    {NOTE_TYPE_OPTIONS.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setDraft((prev) => ({ ...prev, type: item.id }))}
                        className={`rounded-[17px] px-3 py-3 text-xs font-semibold transition ${draft.type === item.id ? "bg-neutral-950 text-white" : "bg-white text-neutral-500 hover:text-neutral-950"}`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-neutral-400">Color</p>
                  <div className="flex flex-wrap gap-2">
                    {TRACK_COLORS.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setDraft((prev) => ({ ...prev, color: item.id }))}
                        className={`h-10 w-10 rounded-full border-4 transition ${draft.color === item.id ? "border-neutral-950" : "border-white"}`}
                        style={{ backgroundColor: item.dot }}
                        title={item.label}
                      />
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={saveNote}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-[20px] bg-neutral-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
                >
                  <Save size={17} />
                  Save Note
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
