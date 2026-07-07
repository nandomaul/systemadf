import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Download,
  Eye,
  FileText,
  Folder,
  GripVertical,
  Link2,
  Loader2,
  Lock,
  Paperclip,
  Pin,
  Plus,
  Save,
  Search,
  Send,
  ShieldCheck,
  StickyNote,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import { supabase } from "./supabaseClient";
import StructuredCanvasNotesPanel from "./CanvasNotesPanel";
import { getAvatarByKey, getProfileInitial } from "./auth/avatarLibrary";

/**
 * LIVE_SUPABASE_REQUESTPAGE_V5
 *
 * Update:
 * - Asset editor is grouped by Folder → multiple Sub Folder links.
 * - Request Design row only shows Download Asset, Status, and Edit Request ticket.
 * - Edit Request page is now for admin/manage: checkbox, bulk delete, bulk status, edit asset.
 * - Detail edit is moved to Request Design and consumes edit_tickets.
 * - Delete uses custom Yes/No confirmation modal.
 * - Status flow: Waiting for Accepted → Accepted/Edit/Read/Revise/Done.
 * - Drag reorder available in Edit Request page and persisted to sort_order.
 * - Create form validation highlights missing fields in red.
 * - v21: Drag-and-drop attachment upload for Mac/Windows and stronger nested scrolling.
 */

const BUCKET_NAME = "request-attachments";
const MAX_FILE_SIZE_MB = 1;
const MAX_ATTACHMENTS = 3;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_FILE_TYPES = ["application/pdf", "image/jpeg", "image/png"];
const ASSET_EDIT_CODE = "adf";
const DEFAULT_EDIT_TICKETS = 2;

const CATEGORY_FILTERS = [
  { id: "all", label: "All Requester", desc: "All incoming requests", avatar: "A" },
  { id: "realme", label: "realme", desc: "realme marketplace request", avatar: "R" },
  { id: "akaso", label: "AKASO", desc: "AKASO request", avatar: "A" },
  { id: "adf", label: "ADF", desc: "ADF internal request", avatar: "A" },
  { id: "akg", label: "AKG", desc: "AKG project request", avatar: "A" },
  { id: "gmi", label: "GMI", desc: "GMI project request", avatar: "G" },
];

const REQUEST_TYPE_SUGGESTIONS = [
  "IG Post",
  "IG Story",
  "Banner",
  "Landing Page",
  "SKU Product",
  "SKU KOL",
  "SKU NAD",
  "SKU SBD",
  "SKU Angle",
  "SKU Flash Sale",
  "SKU Description",
  "SKU Slide",
  "Exposure",
  "Discovery",
  "PDP Frame",
  "Joint Logo",
  "Catalog",
  "Poster",
  "Pop Up Banner",
  "Header Discovery",
  "Marketplace Banner",
  "Campaign Material",
  "Motion Design",
  "Live Sticker",
  "Live Podium",
  "Others",
];

const requestMenu = [
  { id: "request", label: "Request Design", icon: ClipboardList },
  { id: "edit", label: "Manage Request", icon: FileText },
  { id: "calendar", label: "Project Calendar", icon: CalendarDays },
  { id: "notes", label: "Notes", icon: StickyNote },
];

const NOTE_SCOPE_OPTIONS = [
  { id: "adf", label: "ADF", desc: "Shared ADF internal notes" },
  { id: "realme", label: "realme", desc: "Shared realme notes" },
  { id: "akaso", label: "AKASO", desc: "Shared AKASO notes" },
  {
    id: "personal",
    label: "Personal",
    desc: "Private notes saved only in this browser. Only you can access and view them from this device.",
  },
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

const SHARED_NOTE_TABLE = "team_notes";
const REQUEST_TRASH_TABLE = "request_trash";
const PERSONAL_NOTE_KEY = "adf_personal_notes_v2";

const REQUEST_MENU_IDS = new Set(requestMenu.map((menu) => menu.id));

function getInitialRequestMenu() {
  try {
    const savedMenu = sessionStorage.getItem("adf_request_default_menu");
    sessionStorage.removeItem("adf_request_default_menu");

    if (REQUEST_MENU_IDS.has(savedMenu)) return savedMenu;
  } catch {
    // ignore storage error
  }

  return "request";
}

const ADMIN_STATUS_ACTIONS = [
  { id: "accepted", label: "Accepted" },
  { id: "Edit", label: "Edit" },
  { id: "Read", label: "Read" },
  { id: "Revise", label: "Revise" },
  { id: "Done", label: "Done" },
];

const TRACK_COLORS = [
  {
    id: "black",
    label: "Black",
    dot: "#111111",
    soft: "rgba(17,17,17,0.08)",
    border: "rgba(17,17,17,0.18)",
    text: "#111111",
  },
  {
    id: "blue",
    label: "Blue",
    dot: "#2563eb",
    soft: "rgba(37,99,235,0.10)",
    border: "rgba(37,99,235,0.22)",
    text: "#1d4ed8",
  },
  {
    id: "green",
    label: "Green",
    dot: "#059669",
    soft: "rgba(5,150,105,0.10)",
    border: "rgba(5,150,105,0.22)",
    text: "#047857",
  },
  {
    id: "orange",
    label: "Orange",
    dot: "#f97316",
    soft: "rgba(249,115,22,0.12)",
    border: "rgba(249,115,22,0.24)",
    text: "#c2410c",
  },
  {
    id: "purple",
    label: "Purple",
    dot: "#7c3aed",
    soft: "rgba(124,58,237,0.11)",
    border: "rgba(124,58,237,0.23)",
    text: "#6d28d9",
  },
  {
    id: "red",
    label: "Red",
    dot: "#dc2626",
    soft: "rgba(220,38,38,0.10)",
    border: "rgba(220,38,38,0.22)",
    text: "#b91c1c",
  },
];

function getTrackColor(value) {
  return TRACK_COLORS.find((color) => color.id === value) || TRACK_COLORS[1];
}

function getNoteType(value) {
  return NOTE_TYPE_OPTIONS.find((item) => item.id === value) || NOTE_TYPE_OPTIONS[0];
}

function getNoteFont(value) {
  return NOTE_FONT_OPTIONS.find((item) => item.id === value) || NOTE_FONT_OPTIONS[0];
}

const notesData = [
  {
    id: "NOTE-001",
    title: "Daily Material Check",
    category: "Reminder",
    date: "Today",
    note: "Before sending any link, make sure design, price, period, and platform placement are correct.",
  },
  {
    id: "NOTE-002",
    title: "Request Status Flow",
    category: "Workflow",
    date: "Live",
    note: "Admin can accept, read, revise, and mark done from Manage mode.",
  },
  {
    id: "NOTE-003",
    title: "Asset Link Rule",
    category: "Asset",
    date: "Live",
    note: "Asset link editor uses code ADF and supports Folder with many Sub Folders.",
  },
];

function getDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getTomorrowKey() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return getDateKey(tomorrow);
}

function getInputClass(error) {
  return `field-input ${error ? "field-input-error" : ""}`;
}

function formatDateTime(value) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDue(value) {
  if (!value) return "-";
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDisplayDate(date) {
  return date.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatMonthYear(date) {
  return date.toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });
}

function createCalendarDays(viewDate) {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const startDay = firstDayOfMonth.getDay();
  const totalDays = lastDayOfMonth.getDate();
  const days = [];

  for (let i = 0; i < startDay; i += 1) days.push(null);
  for (let day = 1; day <= totalDays; day += 1) days.push(new Date(year, month, day));
  while (days.length % 7 !== 0) days.push(null);

  return days;
}

function normalizeText(value) {
  return String(value || "").toLowerCase().trim();
}

function formatCategoryLabel(categoryId) {
  const found = CATEGORY_FILTERS.find((item) => item.id === categoryId);
  return found?.label || categoryId;
}

function getPriorityClass(priority) {
  if (priority === "High") return "bg-red-50 text-red-600";
  if (priority === "Medium") return "bg-amber-50 text-amber-700";
  return "bg-neutral-100 text-neutral-500";
}

function cleanFileName(name) {
  return String(name || "file")
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9._-]/g, "")
    .toLowerCase();
}

function formatFileSize(bytes) {
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function asFilesArray(files) {
  if (Array.isArray(files)) return files;
  return [];
}

function makeId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function makeEmptySubLink() {
  return {
    id: makeId(),
    subfolder: "",
    link: "",
  };
}

function makeEmptyAssetFolder() {
  return {
    id: makeId(),
    folder: "",
    children: [makeEmptySubLink()],
  };
}

function normalizeAssetGroups(value) {
  if (!Array.isArray(value)) return [];

  const normalized = [];

  value.forEach((item) => {
    const hasNested = Array.isArray(item?.children);
    if (hasNested) {
      const children = item.children
        .map((child) => ({
          id: child?.id || makeId(),
          subfolder: String(child?.subfolder || child?.name || "").trim(),
          link: String(child?.link || child?.url || "").trim(),
        }))
        .filter((child) => child.subfolder || child.link);

      normalized.push({
        id: item?.id || makeId(),
        folder: String(item?.folder || "").trim(),
        children: children.length ? children : [makeEmptySubLink()],
      });
      return;
    }

    const folderName = String(item?.folder || "").trim();
    const subfolder = String(item?.subfolder || "").trim();
    const link = String(item?.link || item?.url || "").trim();

    const existing = normalized.find((group) => group.folder === folderName);
    const child = {
      id: makeId(),
      subfolder,
      link,
    };

    if (existing) {
      existing.children.push(child);
    } else {
      normalized.push({
        id: makeId(),
        folder: folderName,
        children: [child],
      });
    }
  });

  return normalized.filter((group) => group.folder || group.children.some((child) => child.subfolder || child.link));
}

function cleanAssetGroups(groups) {
  return (groups || [])
    .map((group) => ({
      id: group.id || makeId(),
      folder: String(group.folder || "").trim(),
      children: (group.children || [])
        .map((child) => ({
          id: child.id || makeId(),
          subfolder: String(child.subfolder || "").trim(),
          link: String(child.link || "").trim(),
        }))
        .filter((child) => child.subfolder || child.link),
    }))
    .filter((group) => group.folder || group.children.length > 0);
}

function flattenAssetLinks(value) {
  return normalizeAssetGroups(value).flatMap((group) =>
    (group.children || [])
      .filter((child) => child.link)
      .map((child) => ({
        folder: group.folder,
        subfolder: child.subfolder,
        link: child.link,
      }))
  );
}

function hasAssetLinks(request) {
  return flattenAssetLinks(request?.asset_links).some((item) => item.link);
}

function getEditTickets(request) {
  const value = Number(request?.edit_tickets);
  if (Number.isFinite(value)) return Math.max(0, value);
  return DEFAULT_EDIT_TICKETS;
}

function isRequestAccepted(request) {
  return Boolean(request?.accepted);
}

function getDisplayStatus(request) {
  if (!isRequestAccepted(request)) return "Waiting for Accepted";
  const status = request?.status || "Edit";
  return status === "Pending" ? "Edit" : status;
}

function getDisplayStatusClass(request) {
  const status = getDisplayStatus(request);
  if (status === "Waiting for Accepted") return "bg-neutral-900 text-white border-neutral-900";
  if (status === "Done") return "bg-emerald-50 text-emerald-700 border-emerald-100";
  if (status === "Read") return "bg-blue-50 text-blue-700 border-blue-100";
  if (status === "Revise") return "bg-amber-50 text-amber-700 border-amber-100";
  return "bg-neutral-100 text-neutral-600 border-neutral-200";
}

function statusPayloadFromAction(action) {
  if (action === "accepted") {
    return {
      accepted: true,
      status: "Edit",
      updated_at: new Date().toISOString(),
    };
  }

  return {
    accepted: true,
    status: action,
    updated_at: new Date().toISOString(),
  };
}


function pickStableAvatarKey(seed = "") {
  const cleanSeed = String(seed || "requester").trim() || "requester";
  let hash = 0;

  for (let index = 0; index < cleanSeed.length; index += 1) {
    hash = (hash * 31 + cleanSeed.charCodeAt(index)) >>> 0;
  }

  const avatarNumber = (hash % 15) + 1;
  return `profile-${avatarNumber}`;
}

function getRequestAvatarKey(request = {}) {
  if (request.requester_avatar_key) return request.requester_avatar_key;

  const profileAvatar = request.requester_profile?.avatar_key;
  if (profileAvatar) return profileAvatar;

  return pickStableAvatarKey(
    request.requester_user_id ||
      request.requester_email ||
      request.requester ||
      request.id ||
      request.title
  );
}

function getRequestDisplayName(request = {}) {
  return (
    request.requester_display_name ||
    request.requester_profile?.display_name ||
    request.requester ||
    "Unknown"
  );
}

function RequesterAvatar({ request, size = "md" }) {
  const displayName = getRequestDisplayName(request);
  const avatar = getAvatarByKey(getRequestAvatarKey(request));
  const isSmall = size === "sm";

  return (
    <div
      className={`shrink-0 overflow-hidden rounded-full border border-black/5 bg-white shadow-sm ${
        isSmall ? "h-9 w-9" : "h-12 w-12"
      }`}
      title={displayName}
    >
      {avatar?.src ? (
        <img
          src={avatar.src}
          alt={displayName}
          className="h-full w-full object-cover"
          draggable={false}
        />
      ) : (
        <div className="grid h-full w-full place-items-center bg-neutral-100 text-xs font-bold text-neutral-600">
          {getProfileInitial(displayName)}
        </div>
      )}
    </div>
  );
}

function requestNotificationTarget(request = {}) {
  const userId = request.requester_user_id || request.requester_profile?.id || null;
  const email = request.requester_email || request.requester_profile?.email || null;

  if (!userId && !email) return null;

  return {
    user_id: userId,
    user_email: email,
  };
}

async function createRequestNotification(request, data = {}) {
  const target = requestNotificationTarget(request);

  if (!target) return { skipped: true };

  const payload = {
    user_id: target.user_id,
    user_email: target.user_email,
    title: data.title || "Request updated",
    message: data.message || `${request.title || "Your request"} has an update.`,
    type: data.type || "request",
    request_id: request.id,
    target_path: "/requestpage",
    payload: {
      request_id: request.id,
      request_title: request.title || "",
      status: request.status || "",
      category: request.category || "",
      ...data.payload,
    },
  };

  const { error } = await supabase.from("notifications").insert(payload);

  if (error) {
    console.error("Notification insert error:", error);
    return { error };
  }

  return { error: null };
}


function getRequestIsDarkMode() {
  if (typeof window === "undefined" || typeof document === "undefined") return false;

  try {
    const root = document.documentElement;
    const body = document.body;
    const savedTheme =
      window.localStorage.getItem("adf_theme_mode") ||
      window.localStorage.getItem("adf-theme-mode") ||
      window.localStorage.getItem("theme") ||
      window.localStorage.getItem("themeMode");

    return (
      savedTheme === "dark" ||
      root.classList.contains("dark") ||
      body.classList.contains("dark") ||
      root.dataset.theme === "dark" ||
      body.dataset.theme === "dark"
    );
  } catch {
    return false;
  }
}

function goHomepage() {
  if (window.ADFNavigate) {
    window.ADFNavigate("/popup");
    return;
  }

  window.location.href = "/popup";
}

export default function RequestPage() {
  const [isDarkMode, setIsDarkMode] = useState(getRequestIsDarkMode);
  const [activeMenu, setActiveMenu] = useState(getInitialRequestMenu);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [requests, setRequests] = useState([]);
  const [search, setSearch] = useState("");
  const [currentRequestProfile, setCurrentRequestProfile] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pageError, setPageError] = useState("");

  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadError, setUploadError] = useState("");
  const [createErrors, setCreateErrors] = useState({});

  const [calendarViewDate, setCalendarViewDate] = useState(new Date());
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(new Date());
  const [calendarNotes, setCalendarNotes] = useState({});
  const [newCalendarNote, setNewCalendarNote] = useState({
    title: "",
    note: "",
    link_label: "",
    link_url: "",
    color: "blue",
  });

  const [assetModalRequest, setAssetModalRequest] = useState(null);
  const [previewRequest, setPreviewRequest] = useState(null);
  const [linkEditorRequest, setLinkEditorRequest] = useState(null);
  const [assetDraft, setAssetDraft] = useState([makeEmptyAssetFolder()]);
  const [assetCode, setAssetCode] = useState("");
  const [assetEditorUnlocked, setAssetEditorUnlocked] = useState(false);
  const [assetSaving, setAssetSaving] = useState(false);

  const [editRequest, setEditRequest] = useState(null);
  const [editDraft, setEditDraft] = useState(null);
  const [editSaving, setEditSaving] = useState(false);
  const [editUploadedFiles, setEditUploadedFiles] = useState([]);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [requestTrashItems, setRequestTrashItems] = useState([]);
  const [requestTrashOpen, setRequestTrashOpen] = useState(false);

  const [manageMode, setManageMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkStatus, setBulkStatus] = useState("accepted");
  const [draggedId, setDraggedId] = useState(null);

  const [newRequest, setNewRequest] = useState({
    category: "realme",
    requester: "",
    title: "",
    type: "",
    platform: "",
    due: "",
    priority: "Medium",
    drive_link: "",
    note: "",
  });

  useEffect(() => {
    const syncDarkMode = () => setIsDarkMode(getRequestIsDarkMode());
    syncDarkMode();

    if (typeof MutationObserver === "undefined" || typeof document === "undefined") {
      return () => {};
    }

    const observer = new MutationObserver(syncDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });

    if (document.body) {
      observer.observe(document.body, {
        attributes: true,
        attributeFilter: ["class", "data-theme"],
      });
    }

    window.addEventListener("storage", syncDarkMode);

    return () => {
      observer.disconnect();
      window.removeEventListener("storage", syncDarkMode);
    };
  }, []);

  useEffect(() => {
    loadRequests();
    loadCalendarNotes();
    loadRequestTrash();
  }, []);

  useEffect(() => {
    let active = true;

    async function loadCurrentRequestProfile() {
      try {
        const { data: userData } = await supabase.auth.getUser();
        const user = userData?.user;

        if (!user?.id) return;

        const { data: profile } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();

        if (!active) return;

        const mergedProfile = {
          id: user.id,
          email: user.email,
          ...(profile || {}),
        };

        setCurrentRequestProfile(mergedProfile);

        const displayName =
          mergedProfile.display_name ||
          user.user_metadata?.display_name ||
          user.email?.split("@")?.[0] ||
          "";

        if (displayName) {
          setNewRequest((prev) =>
            prev.requester
              ? prev
              : {
                  ...prev,
                  requester: displayName,
                  category:
                    String(mergedProfile.team || "").toLowerCase() === "realme"
                      ? "realme"
                      : String(mergedProfile.team || "").toLowerCase() === "akaso"
                        ? "akaso"
                        : prev.category,
                }
          );
        }
      } catch (error) {
        console.error("Load current request profile error:", error);
      }
    }

    loadCurrentRequestProfile();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel("adf-requestpage-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "requests" }, () => {
        loadRequests();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "calendar_notes" }, () => {
        loadCalendarNotes();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: REQUEST_TRASH_TABLE }, () => {
        loadRequestTrash();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    setPageError("");

    const { data, error } = await supabase
      .from("requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setPageError(`Load request gagal: ${error.message}`);
      setRequests([]);
      setLoading(false);
      return;
    }

    setRequests(data || []);
    setLoading(false);
  };

  const loadRequestTrash = async () => {
    const { data, error } = await supabase
      .from(REQUEST_TRASH_TABLE)
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Load request trash error:", error);
      setRequestTrashItems([]);
      return;
    }

    setRequestTrashItems(data || []);
  };

  const loadCalendarNotes = async () => {
    const { data, error } = await supabase
      .from("calendar_notes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Load calendar notes error:", error);
      return;
    }

    const grouped = {};
    (data || []).forEach((note) => {
      grouped[note.date_key] = [...(grouped[note.date_key] || []), note];
    });

    setCalendarNotes(grouped);
  };

  const categoryStats = useMemo(() => {
    return CATEGORY_FILTERS.map((category) => {
      const owned =
        category.id === "all"
          ? requests
          : requests.filter((req) => req.category === category.id);

      const active = owned.filter((req) => getDisplayStatus(req) !== "Done").length;

      return {
        ...category,
        total: owned.length,
        active,
      };
    });
  }, [requests]);

  const filteredRequests = useMemo(() => {
    const keyword = normalizeText(search);

    let result = requests.filter((request) => {
      const matchCategory =
        selectedCategory === "all" || request.category === selectedCategory;

      const matchKeyword =
        !keyword ||
        normalizeText(request.title).includes(keyword) ||
        normalizeText(getRequestDisplayName(request)).includes(keyword) ||
        normalizeText(request.type).includes(keyword) ||
        normalizeText(request.platform).includes(keyword) ||
        normalizeText(getDisplayStatus(request)).includes(keyword) ||
        normalizeText(formatCategoryLabel(request.category)).includes(keyword);

      return matchCategory && matchKeyword;
    });

    result = [...result].sort((a, b) => {
      if (sortBy === "manual") {
        const aOrder = Number.isFinite(Number(a.sort_order)) ? Number(a.sort_order) : 999999;
        const bOrder = Number.isFinite(Number(b.sort_order)) ? Number(b.sort_order) : 999999;
        if (aOrder !== bOrder) return aOrder - bOrder;
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      }

      if (sortBy === "name") return String(a.title).localeCompare(String(b.title));
      if (sortBy === "status") return getDisplayStatus(a).localeCompare(getDisplayStatus(b));
      if (sortBy === "requester") return String(getRequestDisplayName(a)).localeCompare(String(getRequestDisplayName(b)));

      return new Date(b.created_at || b.date || 0).getTime() - new Date(a.created_at || a.date || 0).getTime();
    });

    return result;
  }, [requests, search, selectedCategory, sortBy]);

  const requestDesignList = useMemo(() => {
    const keyword = normalizeText(search);

    return requests
      .filter((request) => {
        const matchCategory =
          selectedCategory === "all" || request.category === selectedCategory;

        const matchKeyword =
          !keyword ||
          normalizeText(request.title).includes(keyword) ||
          normalizeText(getRequestDisplayName(request)).includes(keyword) ||
          normalizeText(request.type).includes(keyword) ||
          normalizeText(request.platform).includes(keyword) ||
          normalizeText(getDisplayStatus(request)).includes(keyword) ||
          normalizeText(formatCategoryLabel(request.category)).includes(keyword);

        return matchCategory && matchKeyword;
      })
      .sort((a, b) => {
        const bTime = new Date(b.updated_at || b.created_at || 0).getTime();
        const aTime = new Date(a.updated_at || a.created_at || 0).getTime();
        return bTime - aTime;
      });
  }, [requests, search, selectedCategory]);

  const selectedRequests = useMemo(
    () => requests.filter((request) => selectedIds.includes(request.id)),
    [requests, selectedIds]
  );

  const clearCreateError = (field) => {
    setCreateErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const addUploadedFiles = (incomingFiles) => {
    const files = Array.from(incomingFiles || []);
    setUploadError("");

    if (files.length === 0) return false;

    if (uploadedFiles.length + files.length > MAX_ATTACHMENTS) {
      setUploadError(`Maximum ${MAX_ATTACHMENTS} attachments only. Remove one file before adding more.`);
      return false;
    }

    const invalidType = files.find((file) => !ALLOWED_FILE_TYPES.includes(file.type));
    if (invalidType) {
      setUploadError("Only PDF, JPG, and PNG files are allowed.");
      return false;
    }

    const oversized = files.find((file) => file.size > MAX_FILE_SIZE_BYTES);
    if (oversized) {
      setUploadError(`Each file must be under ${MAX_FILE_SIZE_MB}MB.`);
      return false;
    }

    const nextFiles = files.map((file) => ({
      id: makeId(),
      file,
      note: "",
    }));

    setUploadedFiles((prev) => [...prev, ...nextFiles]);
    return true;
  };

  const handleFileUpload = (event) => {
    addUploadedFiles(event.target.files);
    event.target.value = "";
  };

  const handleFileDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    addUploadedFiles(event.dataTransfer?.files);
  };

  const handleRemoveUploadedFile = (index) => {
    setUploadedFiles((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
  };

  const handleUploadedFileNoteChange = (index, note) => {
    setUploadedFiles((prev) =>
      prev.map((item, itemIndex) =>
        itemIndex === index ? { ...item, note } : item
      )
    );
  };

  const uploadRequestFiles = async (requestId, files) => {
    const uploaded = [];

    for (const fileItem of files) {
      const file = fileItem?.file || fileItem;
      const safeName = cleanFileName(file.name);
      const path = `${requestId}/${Date.now()}-${Math.random()
        .toString(16)
        .slice(2)}-${safeName}`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(path, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type,
        });

      if (uploadError) {
        if (uploaded.length > 0) {
          await supabase.storage.from(BUCKET_NAME).remove(uploaded.map((item) => item.path));
        }

        throw uploadError;
      }

      uploaded.push({
        name: file.name,
        path,
        size: formatFileSize(file.size),
        type: file.type,
        note: String(fileItem?.note || "").trim(),
      });
    }

    return uploaded;
  };

  const handleCreateRequest = async () => {
    const requesterName = newRequest.requester.trim();
    const typeName = newRequest.type.trim();
    const titleName = newRequest.title.trim();

    setUploadError("");
    setPageError("");

    const errors = {};

    if (!requesterName) errors.requester = "Requester name is required.";
    if (!titleName) errors.title = "Request title is required.";
    if (!typeName) errors.type = "Request type is required.";
    if (!newRequest.due) errors.due = "Due date is required.";

    if (Object.keys(errors).length > 0) {
      setCreateErrors(errors);
      setUploadError("Please complete the highlighted fields.");
      return;
    }

    setCreateErrors({});
    setSaving(true);

    const payload = {
      category: newRequest.category,
      requester: requesterName,
      title: titleName,
      type: typeName,
      platform: newRequest.platform.trim() || "Internal",
      due: newRequest.due,
      accepted: false,
      edit_tickets: DEFAULT_EDIT_TICKETS,
      status: "Edit",
      priority: newRequest.priority,
      note: newRequest.note.trim() || "No notes added.",
      drive_link: newRequest.drive_link.trim() || null,
      requester_user_id: currentRequestProfile?.id || null,
      requester_email: currentRequestProfile?.email || null,
      requester_display_name: currentRequestProfile?.display_name || requesterName,
      requester_team: currentRequestProfile?.team || null,
      requester_avatar_key: currentRequestProfile?.avatar_key || null,
      requester_profile: currentRequestProfile
        ? {
            id: currentRequestProfile.id,
            email: currentRequestProfile.email,
            display_name: currentRequestProfile.display_name || requesterName,
            team: currentRequestProfile.team || null,
            avatar_key: currentRequestProfile.avatar_key || null,
          }
        : {},
      asset_links: [],
      files: [],
    };

    const { data: inserted, error: insertError } = await supabase
      .from("requests")
      .insert(payload)
      .select("*")
      .single();

    if (insertError) {
      setSaving(false);
      setUploadError(`Create gagal: ${insertError.message}`);
      return;
    }

    let finalRequest = inserted;

    try {
      if (uploadedFiles.length > 0) {
        const uploadedMeta = await uploadRequestFiles(inserted.id, uploadedFiles);

        const { data: updated, error: updateError } = await supabase
          .from("requests")
          .update({
            files: uploadedMeta,
            updated_at: new Date().toISOString(),
          })
          .eq("id", inserted.id)
          .select("*")
          .single();

        if (updateError) throw updateError;
        finalRequest = updated;
      }

      setRequests((prev) => [finalRequest, ...prev]);
      setSelectedCategory(newRequest.category);
      setUploadedFiles([]);
      setNewRequest({
        category: newRequest.category,
        requester: currentRequestProfile?.display_name || "",
        title: "",
        type: "",
        platform: "",
        due: "",
        priority: "Medium",
        drive_link: "",
        note: "",
      });
    } catch (error) {
      const filePaths = asFilesArray(finalRequest.files).map((item) => item.path).filter(Boolean);
      if (filePaths.length > 0) await supabase.storage.from(BUCKET_NAME).remove(filePaths);
      await supabase.from("requests").delete().eq("id", inserted.id);
      setUploadError(`Upload gagal: ${error.message}`);
    }

    setSaving(false);
  };

  const handleStatusAction = async (requestId, action) => {
    setPageError("");
    const payload = statusPayloadFromAction(action);
    const previous = requests;

    setRequests((prev) =>
      prev.map((request) =>
        request.id === requestId ? { ...request, ...payload } : request
      )
    );

    const { error } = await supabase
      .from("requests")
      .update(payload)
      .eq("id", requestId);

    if (error) {
      setRequests(previous);
      setPageError(`Update status gagal: ${error.message}`);
      return;
    }

    const updatedRequest = {
      ...(previous.find((request) => request.id === requestId) || {}),
      ...payload,
    };

    await createRequestNotification(updatedRequest, {
      title: `Request ${getDisplayStatus(updatedRequest)}`,
      message: `${updatedRequest.title || "Your request"} is now ${getDisplayStatus(updatedRequest)}.`,
      type: "status",
      payload: {
        action,
      },
    });
  };

  const handleBulkStatus = async () => {
    if (selectedIds.length === 0) {
      setPageError("Pilih request dulu sebelum update status.");
      return;
    }

    setPageError("");
    const payload = statusPayloadFromAction(bulkStatus);
    const previous = requests;

    setRequests((prev) =>
      prev.map((request) =>
        selectedIds.includes(request.id) ? { ...request, ...payload } : request
      )
    );

    const { error } = await supabase
      .from("requests")
      .update(payload)
      .in("id", selectedIds);

    if (error) {
      setRequests(previous);
      setPageError(`Bulk update gagal: ${error.message}`);
      return;
    }

    await Promise.all(
      previous
        .filter((request) => selectedIds.includes(request.id))
        .map((request) => {
          const updatedRequest = {
            ...request,
            ...payload,
          };

          return createRequestNotification(updatedRequest, {
            title: `Request ${getDisplayStatus(updatedRequest)}`,
            message: `${updatedRequest.title || "Your request"} is now ${getDisplayStatus(updatedRequest)}.`,
            type: "status",
            payload: {
              action: bulkStatus,
              bulk: true,
            },
          });
        })
    );

    setSelectedIds([]);
  };

  const handleOpenRequestEdit = (request) => {
    const tickets = getEditTickets(request);
    if (tickets <= 0) {
      setPageError("Ticket edit sudah habis untuk request ini.");
      return;
    }

    setEditRequest(request);
    setEditDraft({
      category: request.category || "realme",
      requester: request.requester || "",
      title: request.title || "",
      type: request.type || "",
      platform: request.platform || "",
      due: request.due || getTomorrowKey(),
      priority: request.priority || "Medium",
      drive_link: request.drive_link || "",
      note: request.note || "",
      files: asFilesArray(request.files).map((file) => ({
        ...file,
        note: file?.note || "",
      })),
    });
    setEditUploadedFiles([]);
    setPageError("");
  };

  const handleEditDraftChange = (field, value) => {
    setEditDraft((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditExistingFileNoteChange = (index, note) => {
    setEditDraft((prev) => ({
      ...prev,
      files: asFilesArray(prev?.files).map((file, itemIndex) =>
        itemIndex === index ? { ...file, note } : file
      ),
    }));
  };

  const handleRemoveEditExistingFile = (index) => {
    setEditDraft((prev) => ({
      ...prev,
      files: asFilesArray(prev?.files).filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const addEditFiles = (incomingFiles) => {
    const files = Array.from(incomingFiles || []);
    setPageError("");

    if (files.length === 0 || !editDraft) return false;

    const currentCount = asFilesArray(editDraft.files).length + editUploadedFiles.length;

    if (currentCount + files.length > MAX_ATTACHMENTS) {
      setPageError(`Maximum ${MAX_ATTACHMENTS} attachments only. Remove one before adding more.`);
      return false;
    }

    const invalidType = files.find((file) => !ALLOWED_FILE_TYPES.includes(file.type));
    if (invalidType) {
      setPageError("Only PDF, JPG, and PNG files are allowed.");
      return false;
    }

    const oversized = files.find((file) => file.size > MAX_FILE_SIZE_BYTES);
    if (oversized) {
      setPageError(`Each file must be under ${MAX_FILE_SIZE_MB}MB.`);
      return false;
    }

    setEditUploadedFiles((prev) => [
      ...prev,
      ...files.map((file) => ({ id: makeId(), file, note: "" })),
    ]);

    return true;
  };

  const handleEditFileUpload = (event) => {
    addEditFiles(event.target.files);
    event.target.value = "";
  };

  const handleEditFileDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    addEditFiles(event.dataTransfer?.files);
  };

  const handleRemoveEditUploadedFile = (index) => {
    setEditUploadedFiles((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
  };

  const handleEditUploadedFileNoteChange = (index, note) => {
    setEditUploadedFiles((prev) =>
      prev.map((item, itemIndex) =>
        itemIndex === index ? { ...item, note } : item
      )
    );
  };

  const handleSaveRequestEdit = async () => {
    if (!editRequest || !editDraft) return;

    const titleName = editDraft.title.trim();
    const requesterName = editDraft.requester.trim();
    const typeName = editDraft.type.trim();

    if (!titleName || !requesterName || !typeName) {
      setPageError("Requester, title, dan request type wajib diisi.");
      return;
    }

    const tickets = getEditTickets(editRequest);

    if (tickets <= 0) {
      setPageError("Ticket edit sudah habis untuk request ini.");
      return;
    }

    const existingFiles = asFilesArray(editDraft.files);
    const totalFiles = existingFiles.length + editUploadedFiles.length;

    if (totalFiles > MAX_ATTACHMENTS) {
      setPageError(`Maximum ${MAX_ATTACHMENTS} attachments only.`);
      return;
    }

    setEditSaving(true);
    setPageError("");

    const originalFiles = asFilesArray(editRequest.files);
    const originalPaths = originalFiles.map((file) => file.path).filter(Boolean);
    const keptPaths = existingFiles.map((file) => file.path).filter(Boolean);
    const removedPaths = originalPaths.filter((path) => !keptPaths.includes(path));

    let uploadedMeta = [];

    try {
      if (editUploadedFiles.length > 0) {
        uploadedMeta = await uploadRequestFiles(editRequest.id, editUploadedFiles);
      }

      const finalFiles = [...existingFiles, ...uploadedMeta].slice(0, MAX_ATTACHMENTS);

      const payload = {
        category: editDraft.category,
        requester: requesterName,
        title: titleName,
        type: typeName,
        platform: editDraft.platform.trim() || "Internal",
        due: editDraft.due || getTomorrowKey(),
        priority: editDraft.priority,
        drive_link: editDraft.drive_link.trim() || null,
        note: editDraft.note.trim() || "No notes added.",
        files: finalFiles,
        edit_tickets: Math.max(tickets - 1, 0),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("requests")
        .update(payload)
        .eq("id", editRequest.id)
        .select("*")
        .single();

      if (error) throw error;

      if (removedPaths.length > 0) {
        await supabase.storage.from(BUCKET_NAME).remove(removedPaths);
      }

      setRequests((prev) => [data, ...prev.filter((item) => item.id !== data.id)]);
      setSelectedCategory(data.category || selectedCategory);
      setEditRequest(null);
      setEditDraft(null);
      setEditUploadedFiles([]);
    } catch (error) {
      if (uploadedMeta.length > 0) {
        await supabase.storage.from(BUCKET_NAME).remove(uploadedMeta.map((item) => item.path));
      }
      setPageError(`Gagal edit request: ${error.message}`);
    }

    setEditSaving(false);
  };

  const moveRequestsToTrash = async (targets) => {
    setPageError("");

    const validTargets = (targets || []).filter(Boolean);
    if (validTargets.length === 0) return true;

    const trashPayload = validTargets.map((request) => ({
      type: "request",
      title: request.title || "Deleted Request",
      payload: request,
      meta: {
        requester: request.requester || "",
        category: request.category || "adf",
      },
    }));

    const { error: trashError } = await supabase.from(REQUEST_TRASH_TABLE).insert(trashPayload);

    if (trashError) {
      setPageError(`Move trash gagal: ${trashError.message}. Run SQL request_trash dulu.`);
      return false;
    }

    const ids = validTargets.map((request) => request.id);
    const { error: dbError } = await supabase.from("requests").delete().in("id", ids);

    if (dbError) {
      setPageError(`Gagal hapus request: ${dbError.message}`);
      return false;
    }

    setRequests((prev) => prev.filter((item) => !ids.includes(item.id)));
    setSelectedIds((prev) => prev.filter((id) => !ids.includes(id)));
    await loadRequestTrash();
    return true;
  };

  const restoreRequestFromTrash = async (trashItem) => {
    if (!trashItem?.payload) return;

    const request = trashItem.payload;
    const payload = {
      id: request.id,
      category: request.category || "adf",
      requester: request.requester || "Unknown",
      title: request.title || "Restored Request",
      type: request.type || "Others",
      platform: request.platform || "Internal",
      due: request.due || getTomorrowKey(),
      status: request.status || "Edit",
      accepted: Boolean(request.accepted),
      edit_tickets: getEditTickets(request),
      priority: request.priority || "Medium",
      note: request.note || "No notes added.",
      drive_link: request.drive_link || null,
      files: asFilesArray(request.files),
      asset_links: Array.isArray(request.asset_links) ? request.asset_links : [],
      sort_order: request.sort_order || null,
      created_at: request.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { error: insertError } = await supabase.from("requests").insert(payload);

    if (insertError) {
      setPageError(`Restore request gagal: ${insertError.message}`);
      return;
    }

    const { error: deleteError } = await supabase
      .from(REQUEST_TRASH_TABLE)
      .delete()
      .eq("id", trashItem.id);

    if (deleteError) {
      setPageError(`Hapus item trash gagal: ${deleteError.message}`);
      return;
    }

    await loadRequests();
    await loadRequestTrash();
  };

  const permanentDeleteRequestTrash = async (trashItem) => {
    if (!trashItem) return;

    const filePaths = asFilesArray(trashItem.payload?.files).map((file) => file.path).filter(Boolean);

    if (filePaths.length > 0) {
      const { error: storageError } = await supabase.storage
        .from(BUCKET_NAME)
        .remove(filePaths);

      if (storageError) {
        setPageError(`Gagal hapus file Storage: ${storageError.message}`);
        return;
      }
    }

    const { error } = await supabase
      .from(REQUEST_TRASH_TABLE)
      .delete()
      .eq("id", trashItem.id);

    if (error) {
      setPageError(`Permanent delete gagal: ${error.message}`);
      return;
    }

    await loadRequestTrash();
  };

  const deleteRequests = moveRequestsToTrash;

  const handleConfirmSingleDelete = async () => {
    if (!deleteTarget) return;
    const success = await deleteRequests([deleteTarget]);
    if (success) setDeleteTarget(null);
  };

  const handleConfirmBulkDelete = async () => {
    const targets = selectedRequests;
    if (targets.length === 0) {
      setBulkDeleteOpen(false);
      return;
    }

    const success = await deleteRequests(targets);
    if (success) setBulkDeleteOpen(false);
  };

  const handleOpenAssetModal = (request) => {
    if (!hasAssetLinks(request)) return;
    setAssetModalRequest(request);
  };

  const handleOpenLinkEditor = (request) => {
    const currentLinks = normalizeAssetGroups(request.asset_links);
    setLinkEditorRequest(request);
    setAssetDraft(currentLinks.length > 0 ? currentLinks : [makeEmptyAssetFolder()]);
    setAssetCode("");
    setAssetEditorUnlocked(false);
    setPageError("");
  };

  const handleUnlockAssetEditor = () => {
    if (assetCode.trim().toLowerCase() !== ASSET_EDIT_CODE) {
      setPageError("Kode edit asset salah. Pakai kode internal ADF.");
      return;
    }

    setPageError("");
    setAssetEditorUnlocked(true);
  };

  const handleAssetFolderChange = (groupIndex, value) => {
    setAssetDraft((prev) =>
      prev.map((group, index) =>
        index === groupIndex ? { ...group, folder: value } : group
      )
    );
  };

  const handleAssetChildChange = (groupIndex, childIndex, field, value) => {
    setAssetDraft((prev) =>
      prev.map((group, index) => {
        if (index !== groupIndex) return group;

        return {
          ...group,
          children: (group.children || []).map((child, itemIndex) =>
            itemIndex === childIndex ? { ...child, [field]: value } : child
          ),
        };
      })
    );
  };

  const handleAddAssetFolder = () => {
    setAssetDraft((prev) => [...prev, makeEmptyAssetFolder()]);
  };

  const handleAddAssetSubfolder = (groupIndex) => {
    setAssetDraft((prev) =>
      prev.map((group, index) =>
        index === groupIndex
          ? { ...group, children: [...(group.children || []), makeEmptySubLink()] }
          : group
      )
    );
  };

  const handleRemoveAssetSubfolder = (groupIndex, childIndex) => {
    setAssetDraft((prev) =>
      prev.map((group, index) => {
        if (index !== groupIndex) return group;

        const children = (group.children || []).filter((_, itemIndex) => itemIndex !== childIndex);

        return {
          ...group,
          children: children.length > 0 ? children : [makeEmptySubLink()],
        };
      })
    );
  };

  const handleRemoveAssetFolder = (groupIndex) => {
    setAssetDraft((prev) => {
      const next = prev.filter((_, index) => index !== groupIndex);
      return next.length > 0 ? next : [makeEmptyAssetFolder()];
    });
  };

  const handleSaveAssetLinks = async () => {
    if (!linkEditorRequest) return;

    const cleaned = cleanAssetGroups(assetDraft);

    setAssetSaving(true);
    setPageError("");

    const { data, error } = await supabase
      .from("requests")
      .update({
        asset_links: cleaned,
        updated_at: new Date().toISOString(),
      })
      .eq("id", linkEditorRequest.id)
      .select("*")
      .single();

    setAssetSaving(false);

    if (error) {
      setPageError(`Gagal simpan asset: ${error.message}`);
      return;
    }

    setRequests((prev) => prev.map((item) => (item.id === data.id ? data : item)));

    await createRequestNotification(data, {
      title: "Asset link updated",
      message: `${data.title || "Your request"} has new asset links.`,
      type: "asset",
      payload: {
        asset_links: cleaned,
      },
    });

    setLinkEditorRequest(null);
    setAssetDraft([makeEmptyAssetFolder()]);
    setAssetCode("");
    setAssetEditorUnlocked(false);
  };

  const toggleSelectedId = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredRequests.length) {
      setSelectedIds([]);
      return;
    }

    setSelectedIds(filteredRequests.map((item) => item.id));
  };

  const handleDragStart = (id) => {
    if (id) setSortBy("manual");
    setDraggedId(id);
  };

  const handleDropOnRequest = async (targetId) => {
    if (!draggedId || draggedId === targetId) return;

    const visibleIds = filteredRequests.map((item) => item.id);
    const draggedIndex = visibleIds.indexOf(draggedId);
    const targetIndex = visibleIds.indexOf(targetId);

    if (draggedIndex < 0 || targetIndex < 0) {
      setDraggedId(null);
      return;
    }

    const nextVisibleIds = [...visibleIds];
    const [draggedItem] = nextVisibleIds.splice(draggedIndex, 1);
    nextVisibleIds.splice(targetIndex, 0, draggedItem);

    const nextRequests = [...requests].sort((a, b) => {
      const aVisibleIndex = nextVisibleIds.indexOf(a.id);
      const bVisibleIndex = nextVisibleIds.indexOf(b.id);

      if (aVisibleIndex >= 0 && bVisibleIndex >= 0) return aVisibleIndex - bVisibleIndex;
      if (aVisibleIndex >= 0) return -1;
      if (bVisibleIndex >= 0) return 1;

      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    });

    const withOrder = nextRequests.map((item, index) => ({
      ...item,
      sort_order: index + 1,
    }));

    setRequests(withOrder);
    setSortBy("manual");
    setDraggedId(null);

    for (const item of withOrder) {
      await supabase
        .from("requests")
        .update({ sort_order: item.sort_order, updated_at: new Date().toISOString() })
        .eq("id", item.id);
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-[#f5f5f3] text-neutral-950">
      <style>{`
        @keyframes requestFloat {
          0%, 100% { transform: translate3d(0,0,0) scale(1); }
          50% { transform: translate3d(18px,-18px,0) scale(1.035); }
        }

        @keyframes requestFloatReverse {
          0%, 100% { transform: translate3d(0,0,0) scale(1); }
          50% { transform: translate3d(-20px,18px,0) scale(1.04); }
        }

        @keyframes requestFadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .request-fade {
          animation: requestFadeUp .58s cubic-bezier(.16,1,.3,1) both;
        }

        .request-scroll::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        .request-scroll::-webkit-scrollbar-track {
          background: transparent;
        }

        .request-scroll::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,.12);
          border-radius: 999px;
        }

        .request-scroll {
          overscroll-behavior: contain;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: thin;
          scrollbar-color: rgba(0,0,0,.18) transparent;
        }

        .request-scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        .request-scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .field-input {
          width: 100%;
          border-radius: 18px;
          border: 1px solid rgba(0,0,0,.055);
          background: rgba(255,255,255,.74);
          padding: 12px 14px;
          font-size: 14px;
          color: #111;
          outline: none;
          box-shadow: 0 1px 0 rgba(255,255,255,.7) inset;
        }

        .field-input::placeholder {
          color: rgba(0,0,0,.35);
        }

        .field-input:focus {
          background: white;
          border-color: rgba(0,0,0,.16);
        }

        .field-input-error {
          border-color: rgba(239,68,68,.62) !important;
          background: rgba(254,242,242,.92) !important;
          box-shadow: 0 0 0 4px rgba(239,68,68,.08) !important;
        }

        .date-input {
          color-scheme: light;
        }

        .date-input::-webkit-calendar-picker-indicator {
          opacity: .8;
          cursor: pointer;
        }


        .dark .request-category-card[data-active="true"],
        html.dark .request-category-card[data-active="true"],
        body.dark .request-category-card[data-active="true"],
        [data-theme="dark"] .request-category-card[data-active="true"] {
          background: #ffffff !important;
          color: #111111 !important;
          border-color: rgba(255,255,255,.35) !important;
        }

        .dark .request-category-card:not([data-active="true"]),
        html.dark .request-category-card:not([data-active="true"]),
        body.dark .request-category-card:not([data-active="true"]),
        [data-theme="dark"] .request-category-card:not([data-active="true"]) {
          background: rgba(255,255,255,.06) !important;
          color: #ffffff !important;
          border-color: rgba(255,255,255,.10) !important;
        }
      `}</style>

      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -left-32 top-10 h-[360px] w-[360px] animate-[requestFloat_10s_ease-in-out_infinite] rounded-full bg-white blur-3xl" />
        <div className="absolute right-[-180px] top-[-130px] h-[520px] w-[520px] animate-[requestFloatReverse_13s_ease-in-out_infinite] rounded-full bg-white/90 blur-3xl" />
        <div className="absolute bottom-[-220px] left-[18%] h-[520px] w-[520px] animate-[requestFloat_12s_ease-in-out_infinite] rounded-full bg-white blur-3xl" />
      </div>

      <div className="relative z-10 flex h-screen overflow-hidden">
        <aside className="hidden h-screen w-[280px] shrink-0 p-5 lg:block">
          <RequestSidebar
            activeMenu={activeMenu}
            setActiveMenu={setActiveMenu}
            onBack={goHomepage}
          />
        </aside>

        <main className="flex h-screen min-w-0 flex-1 flex-col overflow-hidden px-4 py-5 md:px-8 lg:px-6">
          <RequestTopHero
            search={search}
            setSearch={setSearch}
            activeMenu={activeMenu}
            setActiveMenu={setActiveMenu}
            onBack={goHomepage}
          />

          {(pageError || uploadError) && (
            <div className="mb-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
              {pageError || uploadError}
            </div>
          )}

          <div className="request-scroll min-h-0 flex-1 overflow-x-auto overflow-y-auto pr-0 lg:pr-2">
            <div className="min-w-[1180px]">
              {activeMenu === "request" && (
                <RequestDesignPanel
                  isDarkMode={isDarkMode}
                  loading={loading}
                  saving={saving}
                  categoryStats={categoryStats}
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                  filteredRequests={requestDesignList}
                  newRequest={newRequest}
                  setNewRequest={setNewRequest}
                  uploadedFiles={uploadedFiles}
                  handleFileUpload={handleFileUpload}
                  handleFileDrop={handleFileDrop}
                  handleRemoveUploadedFile={handleRemoveUploadedFile}
                  handleUploadedFileNoteChange={handleUploadedFileNoteChange}
                  handleCreateRequest={handleCreateRequest}
                  createErrors={createErrors}
                  clearCreateError={clearCreateError}
                  onRefresh={loadRequests}
                  onOpenAssets={handleOpenAssetModal}
                  onPreviewRequest={setPreviewRequest}
                  onEditRequest={handleOpenRequestEdit}
                />
              )}

              {activeMenu === "edit" && (
                <EditRequestPanel
                  loading={loading}
                  requests={filteredRequests}
                  sortBy={sortBy}
                  setSortBy={setSortBy}
                  manageMode={manageMode}
                  setManageMode={setManageMode}
                  selectedIds={selectedIds}
                  selectedCount={selectedIds.length}
                  bulkStatus={bulkStatus}
                  setBulkStatus={setBulkStatus}
                  toggleSelectedId={toggleSelectedId}
                  toggleSelectAll={toggleSelectAll}
                  onBulkStatus={handleBulkStatus}
                  onBulkDelete={() => setBulkDeleteOpen(true)}
                  onStatusAction={handleStatusAction}
                  onSingleDelete={(request) => setDeleteTarget(request)}
                  onRefresh={loadRequests}
                  onEditLinks={handleOpenLinkEditor}
                  onOpenAssets={handleOpenAssetModal}
                  onPreviewRequest={setPreviewRequest}
                  onDragStart={handleDragStart}
                  onDropOnRequest={handleDropOnRequest}
                  draggedId={draggedId}
                  trashCount={requestTrashItems.length}
                  onOpenTrash={() => setRequestTrashOpen(true)}
                />
              )}

              {activeMenu === "calendar" && (
                <LiveCalendarPanel
                  calendarViewDate={calendarViewDate}
                  setCalendarViewDate={setCalendarViewDate}
                  selectedCalendarDate={selectedCalendarDate}
                  setSelectedCalendarDate={setSelectedCalendarDate}
                  calendarNotes={calendarNotes}
                  newCalendarNote={newCalendarNote}
                  setNewCalendarNote={setNewCalendarNote}
                  handleAddCalendarNote={async () => {
                    const title = newCalendarNote.title.trim();
                    const note = newCalendarNote.note.trim();
                    const linkLabel = (newCalendarNote.link_label || "").trim();
                    const linkUrl = (newCalendarNote.link_url || "").trim();
                    const dateKey = getDateKey(selectedCalendarDate);

                    if (!title && !note && !linkUrl) return;

                    const selectedColor = newCalendarNote.color || "blue";
                    const basePayload = {
                      date_key: dateKey,
                      title: title || "Untitled note",
                      note: note || "No detail added.",
                      link_label: linkLabel || "Open Link",
                      link_url: linkUrl || null,
                    };

                    let { data, error } = await supabase
                      .from("calendar_notes")
                      .insert({
                        ...basePayload,
                        color: selectedColor,
                      })
                      .select("*")
                      .single();

                    if (error && String(error.message || "").includes("'color' column")) {
                      const retry = await supabase
                        .from("calendar_notes")
                        .insert(basePayload)
                        .select("*")
                        .single();

                      data = retry.data;
                      error = retry.error;

                      if (!error) {
                        setPageError(
                          "Calendar note tersimpan, tapi warna belum masuk Supabase. Run SQL color column dulu biar warna kesimpan."
                        );
                      }
                    }

                    if (error) {
                      setPageError(`Gagal tambah calendar note: ${error.message}`);
                      return;
                    }

                    const normalizedData = {
                      ...data,
                      color: data?.color || selectedColor,
                    };

                    setCalendarNotes((prev) => ({
                      ...prev,
                      [dateKey]: [normalizedData, ...(prev[dateKey] || [])],
                    }));
                    setNewCalendarNote((prev) => ({
                      title: "",
                      note: "",
                      link_label: "",
                      link_url: "",
                      color: prev.color || "blue",
                    }));
                  }}
                  handleDeleteCalendarNote={async (noteId) => {
                    const dateKey = getDateKey(selectedCalendarDate);
                    const { error } = await supabase
                      .from("calendar_notes")
                      .delete()
                      .eq("id", noteId);

                    if (error) {
                      setPageError(`Gagal hapus calendar note: ${error.message}`);
                      return;
                    }

                    setCalendarNotes((prev) => ({
                      ...prev,
                      [dateKey]: (prev[dateKey] || []).filter((note) => note.id !== noteId),
                    }));
                  }}
                />
              )}

              {activeMenu === "notes" && <StructuredCanvasNotesPanel notes={notesData} />}
            </div>
          </div>
        </main>
      </div>

      {assetModalRequest && (
        <AssetDownloadModal request={assetModalRequest} onClose={() => setAssetModalRequest(null)} />
      )}

      {previewRequest && (
        <RequestPreviewModal request={previewRequest} onClose={() => setPreviewRequest(null)} />
      )}

      {linkEditorRequest && (
        <AssetLinkEditorModal
          request={linkEditorRequest}
          draft={assetDraft}
          unlocked={assetEditorUnlocked}
          code={assetCode}
          saving={assetSaving}
          setCode={setAssetCode}
          onUnlock={handleUnlockAssetEditor}
          onFolderChange={handleAssetFolderChange}
          onChildChange={handleAssetChildChange}
          onAddFolder={handleAddAssetFolder}
          onAddSubfolder={handleAddAssetSubfolder}
          onRemoveSubfolder={handleRemoveAssetSubfolder}
          onRemoveFolder={handleRemoveAssetFolder}
          onSave={handleSaveAssetLinks}
          onClose={() => setLinkEditorRequest(null)}
        />
      )}

      {editRequest && editDraft && (
        <RequestEditModal
          request={editRequest}
          draft={editDraft}
          saving={editSaving}
          newFiles={editUploadedFiles}
          onChange={handleEditDraftChange}
          onExistingFileNoteChange={handleEditExistingFileNoteChange}
          onRemoveExistingFile={handleRemoveEditExistingFile}
          onUploadFile={handleEditFileUpload}
          onDropFile={handleEditFileDrop}
          onNewFileNoteChange={handleEditUploadedFileNoteChange}
          onRemoveNewFile={handleRemoveEditUploadedFile}
          onCancelRequest={() => {
            setDeleteTarget(editRequest);
            setEditRequest(null);
            setEditDraft(null);
            setEditUploadedFiles([]);
          }}
          onSave={handleSaveRequestEdit}
          onClose={() => {
            setEditRequest(null);
            setEditUploadedFiles([]);
          }}
        />
      )}

      {deleteTarget && (
        <DeleteConfirmModal
          title="Move request to Trash?"
          message={`Pindahin "${deleteTarget.title}" ke Trash? Request masih bisa di-restore dari Manage Request > Trash.`}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleConfirmSingleDelete}
        />
      )}

      {bulkDeleteOpen && (
        <DeleteConfirmModal
          title="Move selected requests to Trash?"
          message={`Pindahin ${selectedIds.length} request terpilih ke Trash? Request masih bisa di-restore dari Manage Request > Trash.`}
          onCancel={() => setBulkDeleteOpen(false)}
          onConfirm={handleConfirmBulkDelete}
        />
      )}

      {requestTrashOpen && (
        <RequestTrashModal
          items={requestTrashItems}
          onClose={() => setRequestTrashOpen(false)}
          onRestore={restoreRequestFromTrash}
          onPermanentDelete={permanentDeleteRequestTrash}
        />
      )}
    </div>
  );
}




function RequestSidebar({ activeMenu, setActiveMenu, onBack }) {
  return (
    <div className="flex h-full flex-col rounded-[32px] border border-white/70 bg-white/62 p-4 shadow-[0_22px_70px_rgba(0,0,0,0.07)] backdrop-blur-xl">
      <button
        onClick={onBack}
        className="mb-4 flex items-center gap-2 rounded-2xl border border-black/5 bg-white/70 px-3 py-3 text-sm font-medium text-neutral-600 shadow-sm transition hover:bg-white hover:text-neutral-950 active:scale-[0.985]"
      >
        <ArrowLeft size={18} strokeWidth={1.8} />
        Homepage
      </button>

      <div className="px-3 py-3">
        <p className="text-[28px] font-semibold leading-tight tracking-[-0.05em]">
          Request Hub
        </p>
        <p className="mt-1 text-sm text-neutral-500">Design Workflow</p>
      </div>

      <div className="mt-5 space-y-1">
        {requestMenu.map((menu) => {
          const Icon = menu.icon;
          const isActive = activeMenu === menu.id;

          return (
            <button
              key={menu.id}
              onClick={() => setActiveMenu(menu.id)}
              className={`flex w-full items-center justify-between rounded-2xl px-3 py-3 text-left transition ${
                isActive
                  ? "bg-white text-neutral-950 shadow-sm"
                  : "text-neutral-500 hover:bg-white/70 hover:text-neutral-950"
              }`}
            >
              <span className="flex items-center gap-3">
                <Icon size={19} strokeWidth={1.8} />
                <span className="text-sm font-medium">{menu.label}</span>
              </span>

              {isActive && <ChevronRight size={18} className="text-neutral-400" />}
            </button>
          );
        })}
      </div>

      <div className="mt-auto rounded-[26px] border border-white/70 bg-white/70 p-4 shadow-sm">
        <div className="mb-3 grid h-10 w-10 place-items-center rounded-2xl bg-neutral-100">
          <ShieldCheck size={20} strokeWidth={1.8} />
        </div>
        <p className="text-sm font-medium tracking-[-0.02em]">Live database</p>
        <p className="mt-2 text-xs leading-5 text-neutral-500">
          Add, edit, calendar, asset links, and delete are connected to Supabase.
        </p>
      </div>
    </div>
  );
}

function RequestTopHero({ search, setSearch, activeMenu, setActiveMenu, onBack }) {
  return (
    <div className="shrink-0 pb-3 md:pb-4">
      <div className="mb-3 flex items-center justify-between lg:hidden">
        <button
          onClick={onBack}
          className="flex items-center gap-2 rounded-full border border-black/5 bg-white/80 px-4 py-2 text-xs font-medium text-neutral-600 shadow-sm transition active:scale-[0.98]"
        >
          <ArrowLeft size={16} strokeWidth={1.8} />
          Homepage
        </button>
      </div>

      <div className="request-fade overflow-visible rounded-[26px] border border-white/70 bg-white/65 p-4 shadow-[0_16px_45px_rgba(0,0,0,0.06)] backdrop-blur-xl md:rounded-[30px] md:p-5 xl:p-6">
        <div className="grid gap-5 xl:grid-cols-[minmax(420px,0.85fr)_minmax(760px,1.25fr)] xl:items-stretch">
          <div className="min-w-0">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-black/5 bg-white/70 px-3.5 py-1.5 text-xs font-medium text-neutral-600 shadow-sm">
              <ClipboardList size={14} strokeWidth={1.8} />
              Request Design
            </div>

            <h1 className="max-w-4xl text-[34px] font-light leading-[0.95] tracking-[-0.075em] md:text-[56px] xl:text-[64px]">
              Handle request{" "}
              <span className="font-semibold tracking-[-0.08em]">cleanly.</span>
            </h1>

            <p className="mt-2 max-w-3xl text-[13px] leading-5 text-neutral-500 md:text-[15px] md:leading-6 xl:text-base">
              Request list for team, admin edit in Manage mode, and asset download from one place.
            </p>
          </div>

          <div className="w-full min-w-0">
            <HeroSlideBoard search={search} setSearch={setSearch} />
          </div>
        </div>
      </div>

      <div className="request-scrollbar-hide mt-3 flex gap-2 overflow-x-auto pb-1 lg:hidden">
        {requestMenu.map((menu) => {
          const Icon = menu.icon;
          const isActive = activeMenu === menu.id;

          return (
            <button
              key={menu.id}
              onClick={() => setActiveMenu(menu.id)}
              className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium transition ${
                isActive
                  ? "border-black bg-black text-white"
                  : "border-black/5 bg-white/80 text-neutral-500"
              }`}
            >
              <Icon size={15} strokeWidth={1.8} />
              {menu.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function HeroSlideBoard({ search, setSearch }) {
  const [slides, setSlides] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [managerOpen, setManagerOpen] = useState(false);
  const [codeOpen, setCodeOpen] = useState(false);
  const [uploadCode, setUploadCode] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [heroError, setHeroError] = useState("");
  const [uploadMode, setUploadMode] = useState({ type: "new", slide: null });
  const inputId = "adf-hero-slide-upload";

  const loadSlides = async (targetId = null) => {
    const { data, error } = await supabase
      .from("hero_slides")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      setSlides([]);
      return;
    }

    const mapped = await Promise.all(
      (data || []).map(async (slide) => {
        const { data: signed } = await supabase.storage
          .from(BUCKET_NAME)
          .createSignedUrl(slide.path, 60 * 60);

        return {
          ...slide,
          link_url: slide.link_url || "",
          url: signed?.signedUrl || "",
        };
      })
    );

    const validSlides = mapped.filter((slide) => slide.url);
    setSlides(validSlides);

    if (targetId) {
      const targetIndex = validSlides.findIndex((slide) => slide.id === targetId);
      setActiveIndex(targetIndex >= 0 ? targetIndex : 0);
    } else {
      setActiveIndex((prev) => Math.min(prev, Math.max(validSlides.length - 1, 0)));
    }
  };

  useEffect(() => {
    loadSlides();

    const channel = supabase
      .channel("adf-hero-slides-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "hero_slides" }, () => {
        loadSlides();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (slides.length <= 1) return undefined;

    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, 20000);

    return () => window.clearInterval(timer);
  }, [slides.length]);

  const activeSlide = slides[activeIndex];

  const openManager = () => {
    setHeroError("");

    if (unlocked) {
      setManagerOpen(true);
      return;
    }

    setUploadCode("");
    setCodeOpen(true);
  };

  const unlockManager = () => {
    if (uploadCode.trim().toLowerCase() !== ASSET_EDIT_CODE) {
      setHeroError("Kode salah. Pakai kode internal ADF.");
      return;
    }

    setUnlocked(true);
    setCodeOpen(false);
    setManagerOpen(true);
    setHeroError("");
  };

  const pickNewSlide = () => {
    setUploadMode({ type: "new", slide: null });
    window.setTimeout(() => document.getElementById(inputId)?.click(), 80);
  };

  const pickReplaceSlide = (slide) => {
    setUploadMode({ type: "replace", slide });
    window.setTimeout(() => document.getElementById(inputId)?.click(), 80);
  };

  const handleLocalSlideLink = (slideId, value) => {
    setSlides((prev) =>
      prev.map((slide) => (slide.id === slideId ? { ...slide, link_url: value } : slide))
    );
  };

  const handleSaveSlideLink = async (slide) => {
    if (!slide?.id) return;

    setHeroError("");
    const { error } = await supabase
      .from("hero_slides")
      .update({
        link_url: slide.link_url?.trim() || null,
      })
      .eq("id", slide.id);

    if (error) {
      setHeroError(`Save link gagal: ${error.message}`);
    }
  };

  const handleOpenSlideLink = () => {
    const link = activeSlide?.link_url?.trim();
    if (!link) return;
    window.open(link, "_blank", "noopener,noreferrer");
  };

  const handleUploadSlide = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setHeroError("");

    if (file.type !== "image/png") {
      setHeroError("Hero slide hanya menerima PNG.");
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setHeroError(`PNG maksimal ${MAX_FILE_SIZE_MB}MB.`);
      return;
    }

    setUploading(true);

    const safeName = cleanFileName(file.name || "slide.png");
    const path = `hero-slides/${Date.now()}-${Math.random().toString(16).slice(2)}-${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(path, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

    if (uploadError) {
      setUploading(false);
      setHeroError(`Upload slide gagal: ${uploadError.message}`);
      return;
    }

    if (uploadMode.type === "replace" && uploadMode.slide?.id) {
      const oldPath = uploadMode.slide.path;

      const { data: updated, error: updateError } = await supabase
        .from("hero_slides")
        .update({
          title: file.name,
          path,
          link_url: uploadMode.slide.link_url?.trim() || null,
        })
        .eq("id", uploadMode.slide.id)
        .select("*")
        .single();

      if (updateError) {
        await supabase.storage.from(BUCKET_NAME).remove([path]);
        setUploading(false);
        setHeroError(`Edit slide gagal: ${updateError.message}`);
        return;
      }

      if (oldPath) await supabase.storage.from(BUCKET_NAME).remove([oldPath]);
      await loadSlides(updated.id);
      setUploading(false);
      return;
    }

    const { data: inserted, error: insertError } = await supabase
      .from("hero_slides")
      .insert({
        title: file.name,
        path,
        link_url: null,
      })
      .select("*")
      .single();

    if (insertError) {
      await supabase.storage.from(BUCKET_NAME).remove([path]);
      setUploading(false);
      setHeroError(`Save slide gagal: ${insertError.message}`);
      return;
    }

    await loadSlides(inserted.id);
    setUploading(false);
  };

  const handleDeleteSlide = async (slide) => {
    if (!slide?.id) return;

    setHeroError("");
    setUploading(true);

    const { error: dbError } = await supabase
      .from("hero_slides")
      .delete()
      .eq("id", slide.id);

    if (dbError) {
      setUploading(false);
      setHeroError(`Delete slide gagal: ${dbError.message}`);
      return;
    }

    if (slide.path) await supabase.storage.from(BUCKET_NAME).remove([slide.path]);

    await loadSlides();
    setUploading(false);
  };

  return (
    <div
      className="relative h-full min-h-[220px] overflow-hidden rounded-[30px] border border-black/5 bg-white shadow-sm"
      onClick={(event) => {
        if (codeOpen || managerOpen) return;
        if (event.target.closest("[data-hero-control='true']")) return;
        handleOpenSlideLink();
      }}
    >
      <input
        id={inputId}
        type="file"
        accept="image/png"
        className="hidden"
        onChange={handleUploadSlide}
      />

      {activeSlide ? (
        <img
          src={activeSlide.url}
          alt="Hero slide"
          className={`absolute inset-0 h-full w-full object-cover ${
            activeSlide.link_url ? "cursor-pointer" : ""
          }`}
          style={{ opacity: 1, filter: "none" }}
        />
      ) : (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_45%,rgba(0,0,0,0.055),transparent_34%),linear-gradient(135deg,rgba(255,255,255,.98),rgba(255,255,255,.72))]" />
      )}

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white/10 via-white/8 to-white/18" />

      <button
        data-hero-control="true"
        onClick={openManager}
        className="absolute right-4 top-4 z-20 grid h-10 w-10 place-items-center rounded-full bg-white/92 text-neutral-600 shadow-sm transition hover:bg-neutral-950 hover:text-white"
        title="Manage PNG slide"
      >
        {uploading ? <Loader2 size={15} className="animate-spin" /> : <span className="text-sm font-semibold">✎</span>}
      </button>

      <div className="relative z-10 flex h-full min-h-[220px] flex-col justify-end p-5">
        <div data-hero-control="true" className="ml-auto w-full max-w-[660px]">
          <div className="flex items-center gap-3 rounded-[20px] border border-black/5 bg-white/90 px-4 py-3 shadow-[0_12px_30px_rgba(0,0,0,0.08)] backdrop-blur">
            <Search size={20} strokeWidth={1.8} className="text-neutral-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search request, name, type, category..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-neutral-400 md:text-[15px]"
            />
          </div>
        </div>

        {slides.length > 0 && (
          <div data-hero-control="true" className="mt-4 flex justify-start gap-1.5">
            {slides.map((slide, index) => (
              <button
                key={slide.id || index}
                onClick={() => setActiveIndex(index)}
                className={`h-2 rounded-full transition ${
                  index === activeIndex ? "w-7 bg-neutral-950" : "w-2 bg-neutral-300"
                }`}
                title={`Slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {heroError && (
        <p className="absolute bottom-4 left-4 z-20 max-w-[360px] rounded-2xl bg-red-50 px-3 py-2 text-xs font-medium text-red-600 shadow-sm">
          {heroError}
        </p>
      )}

      {codeOpen && createPortal((
        <div data-hero-control="true" className="fixed inset-0 z-[999999] grid place-items-center overflow-y-auto bg-black/25 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-[28px] border border-white/70 bg-[#f5f5f3]/95 p-5 shadow-[0_35px_120px_rgba(0,0,0,.22)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-400">Manage Slide</p>
                <h3 className="mt-1 text-2xl font-semibold tracking-[-0.05em]">ADF Code</h3>
              </div>
              <button
                onClick={() => setCodeOpen(false)}
                className="grid h-9 w-9 place-items-center rounded-full bg-white text-neutral-500 shadow-sm hover:text-neutral-950"
              >
                <X size={17} />
              </button>
            </div>

            <input
              type="password"
              value={uploadCode}
              onChange={(e) => {
                setUploadCode(e.target.value);
                setHeroError("");
              }}
              onKeyDown={(e) => e.key === "Enter" && unlockManager()}
              placeholder="•••"
              className="field-input mt-5 text-center"
            />

            {heroError && <p className="mt-3 text-center text-xs font-medium text-red-600">{heroError}</p>}

            <button
              onClick={unlockManager}
              className="mt-4 w-full rounded-2xl bg-neutral-950 px-5 py-3 text-sm font-semibold text-white hover:bg-neutral-800"
            >
              Open Slide Manager
            </button>
          </div>
        </div>
      ), document.body)}

      {managerOpen && createPortal((
        <div data-hero-control="true" className="fixed inset-0 z-[999999] flex items-center justify-center overflow-y-auto bg-black/25 p-4 backdrop-blur-sm">
          <div className="flex max-h-[calc(100vh-2rem)] w-full max-w-5xl flex-col overflow-hidden rounded-[30px] border border-white/70 bg-[#f5f5f3]/95 p-5 shadow-[0_35px_120px_rgba(0,0,0,.22)]">
            <div className="flex flex-col gap-4 border-b border-black/5 pb-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-400">Hero PNG Manager</p>
                <h3 className="mt-1 text-2xl font-semibold tracking-[-0.05em]">Edit search banner slide</h3>
                <p className="mt-1 text-sm text-neutral-500">
                  Slide 1 adalah gambar paling awal. Bisa upload baru, replace, delete, dan kasih link.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={pickNewSlide}
                  disabled={uploading}
                  className="inline-flex items-center gap-2 rounded-2xl bg-neutral-950 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-50"
                >
                  {uploading ? <Loader2 size={16} className="animate-spin" /> : <UploadCloud size={16} />}
                  Upload New
                </button>
                <button
                  onClick={() => setManagerOpen(false)}
                  className="grid h-10 w-10 place-items-center rounded-full bg-white text-neutral-500 shadow-sm hover:text-neutral-950"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {heroError && (
              <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                {heroError}
              </p>
            )}

            <div className="request-scroll mt-4 min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
              {slides.length === 0 ? (
                <div className="rounded-[26px] border border-dashed border-black/10 bg-white/70 p-8 text-center">
                  <UploadCloud className="mx-auto text-neutral-300" size={32} />
                  <p className="mt-3 text-sm font-semibold text-neutral-700">Belum ada PNG slide.</p>
                  <p className="mt-1 text-xs text-neutral-400">Klik Upload New untuk masukin gambar pertama.</p>
                </div>
              ) : (
                slides.map((slide, index) => (
                  <div
                    key={slide.id}
                    className={`grid gap-3 rounded-[24px] border p-3 shadow-sm md:grid-cols-[170px_minmax(0,1fr)_auto] md:items-center ${
                      index === activeIndex ? "border-neutral-950 bg-white" : "border-black/5 bg-white/72"
                    }`}
                  >
                    <button
                      onClick={() => setActiveIndex(index)}
                      className="relative h-24 overflow-hidden rounded-[18px] bg-neutral-100 text-left"
                    >
                      <img src={slide.url} alt={`Slide ${index + 1}`} className="h-full w-full object-cover" />
                      <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-1 text-[11px] font-bold text-neutral-700 shadow-sm">
                        {index + 1}
                      </span>
                    </button>

                    <div className="min-w-0 space-y-2">
                      <div>
                        <p className="text-sm font-semibold text-neutral-950">Slide {index + 1}</p>
                        <p className="mt-1 text-xs text-neutral-400">Optional: isi link kalau gambar hero mau bisa diklik.</p>
                      </div>

                      <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_auto]">
                        <input
                          value={slide.link_url || ""}
                          onChange={(e) => handleLocalSlideLink(slide.id, e.target.value)}
                          onBlur={() => handleSaveSlideLink(slide)}
                          placeholder="Optional link when clicking image"
                          className="field-input !rounded-2xl !px-3 !py-2 text-xs"
                        />
                        <button
                          onClick={() => handleSaveSlideLink(slide)}
                          className="rounded-2xl bg-neutral-100 px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-200"
                        >
                          Save Link
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap justify-end gap-2">
                      <button
                        onClick={() => setActiveIndex(index)}
                        className="rounded-full bg-neutral-100 px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-200"
                      >
                        Button {index + 1}
                      </button>

                      <button
                        onClick={() => pickReplaceSlide(slide)}
                        disabled={uploading}
                        className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-neutral-700 shadow-sm hover:text-neutral-950 disabled:opacity-50"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => handleDeleteSlide(slide)}
                        disabled={uploading}
                        className="rounded-full bg-red-50 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-100 disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setManagerOpen(false)}
                className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-neutral-600 shadow-sm hover:text-neutral-950"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ), document.body)}
    </div>
  );
}

function RequestDesignPanel({
  isDarkMode = false,
  loading,
  saving,
  categoryStats,
  selectedCategory,
  setSelectedCategory,
  filteredRequests,
  newRequest,
  setNewRequest,
  uploadedFiles,
  handleFileUpload,
  handleFileDrop,
  handleRemoveUploadedFile,
  handleUploadedFileNoteChange,
  handleCreateRequest,
  createErrors,
  clearCreateError,
  onRefresh,
  onOpenAssets,
  onPreviewRequest,
  onEditRequest,
}) {
  return (
    <section className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_390px]">
      <div>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-400">
              Category
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-[-0.05em]">
              Request Folder
            </h2>
          </div>

          <button
            onClick={onRefresh}
            className={`rounded-full px-4 py-2 text-xs font-medium shadow-sm transition ${
              isDarkMode
                ? "bg-white/10 text-white/65 hover:bg-white/15 hover:text-white"
                : "bg-white/80 text-neutral-500 hover:text-neutral-950"
            }`}
          >
            Refresh
          </button>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
          {categoryStats.map((category, index) => (
            <CategoryCard
              key={category.id}
              category={category}
              index={index}
              active={selectedCategory === category.id}
              onClick={() => setSelectedCategory(category.id)}
              isDark={isDarkMode}
            />
          ))}
        </div>

        <div
          className={`mt-5 rounded-[28px] border p-4 shadow-[0_18px_60px_rgba(0,0,0,0.06)] backdrop-blur-xl md:p-5 ${
            isDarkMode ? "border-white/10 bg-white/[0.055]" : "border-white/70 bg-white/62"
          }`}
        >
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-400">
                Live List
              </p>
              <h3 className="mt-1 text-xl font-semibold tracking-[-0.04em]">
                {filteredRequests.length} requests
              </h3>
            </div>
            <p
              className={`rounded-full px-4 py-2 text-xs font-medium shadow-sm ${
                isDarkMode ? "bg-white/8 text-white/45" : "bg-white/80 text-neutral-400"
              }`}
            >
              Latest update first
            </p>
          </div>

          {loading ? (
            <LoadingState />
          ) : filteredRequests.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-3">
              {filteredRequests.map((request) => (
                <RequestRow
                  key={request.id}
                  request={request}
                  variant="request"
                  onOpenAssets={onOpenAssets}
                  onPreviewRequest={onPreviewRequest}
                  onEditRequest={onEditRequest}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <CreateRequestPanel
        isDark={isDarkMode}
        saving={saving}
        newRequest={newRequest}
        setNewRequest={setNewRequest}
        uploadedFiles={uploadedFiles}
        handleFileUpload={handleFileUpload}
        handleFileDrop={handleFileDrop}
        handleRemoveUploadedFile={handleRemoveUploadedFile}
        handleUploadedFileNoteChange={handleUploadedFileNoteChange}
        handleCreateRequest={handleCreateRequest}
        createErrors={createErrors}
        clearCreateError={clearCreateError}
      />
    </section>
  );
}

function CategoryCard({ category, active, onClick, index, isDark = false }) {
  return (
    <button
      onClick={onClick}
      data-active={active ? "true" : "false"}
      className={`request-fade request-category-card min-h-[142px] rounded-[28px] border p-5 text-left transition duration-500 active:scale-[0.985] ${
        isDark
          ? active
            ? "border-white/35 bg-white text-neutral-950 shadow-[0_24px_80px_rgba(0,0,0,0.35)]"
            : "border-white/10 bg-white/[0.06] text-white shadow-[0_18px_55px_rgba(0,0,0,0.22)] hover:bg-white/[0.10]"
          : active
            ? "border-black bg-neutral-950 text-white shadow-[0_24px_80px_rgba(0,0,0,0.18)]"
            : "border-white/70 bg-white/70 text-neutral-950 shadow-[0_18px_55px_rgba(0,0,0,0.055)] hover:bg-white"
      }`}
      style={{ animationDelay: `${index * 45}ms` }}
    >
      <div className="flex h-full min-w-0 flex-col justify-between">
        <div className="flex min-w-0 items-start justify-between gap-3">
          <h3 className="min-w-0 flex-1 break-words pr-1 text-[19px] font-semibold leading-[1.08] tracking-[-0.055em]">
            {category.label}
          </h3>

          <span
            className={`shrink-0 whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${
              isDark
                ? active
                  ? "bg-neutral-950 text-white"
                  : "bg-white/10 text-white/70"
                : active
                  ? "bg-white/10 text-white/75"
                  : "bg-neutral-100 text-neutral-500"
            }`}
          >
            {category.active} active
          </span>
        </div>

        <div>
          <p
            className={`mt-4 max-w-[135px] text-sm leading-5 ${
              isDark
                ? active
                  ? "text-neutral-600"
                  : "text-white/62"
                : active
                  ? "text-white/62"
                  : "text-neutral-500"
            }`}
          >
            {category.desc}
          </p>

          <div
            className={`mt-5 h-1.5 w-10 rounded-full ${
              isDark
                ? active
                  ? "bg-neutral-950"
                  : "bg-white/24"
                : active
                  ? "bg-white"
                  : "bg-neutral-950"
            }`}
          />

          <p
            className={`mt-4 text-xs ${
              isDark
                ? active
                  ? "text-neutral-600"
                  : "text-white/45"
                : active
                  ? "text-white/45"
                  : "text-neutral-400"
            }`}
          >
            {category.total} total
          </p>
        </div>
      </div>
    </button>
  );
}

function SortSelect({ sortBy, setSortBy }) {
  return (
    <select
      value={sortBy}
      onChange={(e) => setSortBy(e.target.value)}
      className="rounded-2xl border border-black/5 bg-white/75 px-4 py-2 text-sm font-medium text-neutral-600 outline-none shadow-sm"
    >
      <option value="date">Sort by date</option>
      <option value="manual">Manual order</option>
      <option value="name">Sort by name</option>
      <option value="status">Sort by status</option>
      <option value="requester">Sort by requester</option>
    </select>
  );
}

function StatusPill({ request }) {
  return (
    <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${getDisplayStatusClass(request)}`}>
      {getDisplayStatus(request)}
    </span>
  );
}

function RequestRow({
  request,
  variant,
  manageMode = false,
  selected = false,
  dragged = false,
  onToggleSelected,
  onStatusAction,
  onSingleDelete,
  onEditAsset,
  onOpenAssets,
  onPreviewRequest,
  onEditRequest,
  onDragStart,
  onDropOnRequest,
}) {
  const files = asFilesArray(request.files);
  const hasAssets = hasAssetLinks(request);
  const tickets = getEditTickets(request);
  const accepted = isRequestAccepted(request);

  const isAdmin = variant === "admin";
  const isRequestView = variant === "request";

  return (
    <div
      draggable={isAdmin}
      onDragStart={(event) => {
        if (!isAdmin) return;
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", request.id);
        onDragStart?.(request.id);
      }}
      onDragEnd={() => isAdmin && onDragStart?.(null)}
      onDragOver={(event) => isAdmin && event.preventDefault()}
      onDrop={() => isAdmin && onDropOnRequest?.(request.id)}
      className={`rounded-[24px] border border-black/5 bg-white/80 p-4 shadow-sm transition ${
        dragged ? "opacity-45" : "hover:bg-white"
      }`}
    >
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="flex min-w-0 gap-3">
          {isAdmin && (
            <div className="flex shrink-0 flex-col items-center gap-3 pt-1">
              <div
                draggable
                onDragStart={(event) => {
                  event.stopPropagation();
                  event.dataTransfer.effectAllowed = "move";
                  event.dataTransfer.setData("text/plain", request.id);
                  onDragStart?.(request.id);
                }}
                className="grid h-8 w-8 cursor-grab place-items-center rounded-full bg-neutral-100 text-neutral-400 active:cursor-grabbing"
                title="Drag priority"
              >
                <GripVertical size={16} />
              </div>

              {manageMode && (
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={() => onToggleSelected?.(request.id)}
                  className="h-4 w-4 accent-black"
                />
              )}
            </div>
          )}

          <RequesterAvatar request={request} />

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <StatusPill request={request} />
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${getPriorityClass(request.priority)}`}>
                {request.priority}
              </span>
              <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-500">
                {formatCategoryLabel(request.category)}
              </span>
            </div>

            <h4 className="mt-3 text-lg font-semibold tracking-[-0.04em]">
              {request.title}
            </h4>

            <p className="mt-1 text-sm leading-5 text-neutral-500">
              {getRequestDisplayName(request)} · {request.type} · {request.platform || "Internal"}
            </p>

            <p className="mt-2 line-clamp-1 max-w-4xl text-sm leading-5 text-neutral-500">
              {request.note}
            </p>

            <div className="mt-3 flex flex-wrap gap-2 text-xs text-neutral-400">
              <span>Due: {formatDue(request.due)}</span>
              <span>Created: {formatDateTime(request.created_at)}</span>
              {request.drive_link && (
                <a
                  href={request.drive_link}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-neutral-950 underline underline-offset-4"
                >
                  Drive link
                </a>
              )}
              {files.length > 0 && <span>{files.length} attachment</span>}
            </div>

            {files.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-500">
                  <Paperclip size={13} />
                  {files.length} attachment{files.length > 1 ? "s" : ""}
                </span>
                <span className="rounded-full bg-neutral-50 px-3 py-1 text-xs text-neutral-400">
                  Click View to preview files and full brief
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 xl:max-w-[520px]">
          <button
            onClick={() => onPreviewRequest?.(request)}
            className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold text-neutral-700 shadow-sm transition hover:text-neutral-950"
          >
            <Eye size={15} />
            View
          </button>

          <button
            onClick={() => onOpenAssets?.(request)}
            disabled={!hasAssets}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition ${
              hasAssets
                ? "bg-neutral-950 text-white hover:bg-neutral-800"
                : "cursor-not-allowed bg-neutral-200 text-neutral-400"
            }`}
          >
            <Download size={15} />
            Download Asset
          </button>

          {isRequestView && (
            <button
              onClick={() => onEditRequest?.(request)}
              disabled={tickets <= 0}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition ${
                tickets > 0
                  ? "bg-white text-neutral-700 shadow-sm hover:text-neutral-950"
                  : "cursor-not-allowed bg-neutral-100 text-neutral-300"
              }`}
            >
              <FileText size={15} />
              Edit Request
            </button>
          )}

          {isAdmin && !manageMode && (
            <>
              <button
                onClick={() => onEditAsset?.(request)}
                className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold text-neutral-700 shadow-sm hover:text-neutral-950"
              >
                <Link2 size={15} />
                Edit Asset
              </button>

              <button
                onClick={() => onSingleDelete?.(request)}
                className="grid h-9 w-9 place-items-center rounded-full bg-red-50 text-red-600 transition hover:bg-red-100"
                title="Delete request"
              >
                <Trash2 size={16} />
              </button>
            </>
          )}

          {isAdmin && manageMode && (
            <div className="flex flex-wrap items-center justify-end gap-2">
              {!accepted ? (
                <button
                  onClick={() => onStatusAction?.(request.id, "accepted")}
                  className="rounded-full bg-neutral-950 px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-800"
                >
                  Accepted
                </button>
              ) : (
                ["Edit", "Read", "Revise", "Done"].map((status) => (
                  <button
                    key={status}
                    onClick={() => onStatusAction?.(request.id, status)}
                    className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                      getDisplayStatus(request) === status
                        ? "bg-neutral-950 text-white"
                        : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
                    }`}
                  >
                    {status}
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CreateRequestPanel({
  isDark = false,
  saving,
  newRequest,
  setNewRequest,
  uploadedFiles,
  handleFileUpload,
  handleFileDrop,
  handleRemoveUploadedFile,
  handleUploadedFileNoteChange,
  handleCreateRequest,
  createErrors = {},
  clearCreateError = () => {},
}) {
  const tomorrowKey = getTomorrowKey();
  const [dragActive, setDragActive] = useState(false);
  const createButtonClass = isDark
    ? "bg-white text-neutral-950 hover:bg-white/90"
    : "bg-neutral-950 text-white hover:bg-neutral-800";

  return (
    <div className="self-start lg:sticky lg:top-5 flex max-h-[calc(100vh-150px)] min-h-0 flex-col overflow-hidden">
      <div
        className={`flex h-full min-h-0 flex-col overflow-hidden rounded-[30px] border shadow-[0_18px_60px_rgba(0,0,0,0.06)] backdrop-blur-xl ${
          isDark ? "border-white/10 bg-white/[0.06]" : "border-white/70 bg-white/68"
        }`}
      >
        <div className="shrink-0 p-5 pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-400">
                Create
              </p>
              <h3 className="mt-1 text-2xl font-semibold tracking-[-0.05em]">
                New Request
              </h3>
            </div>

            <button
              type="button"
              onClick={handleCreateRequest}
              disabled={saving}
              className={`inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-2xl px-4 text-sm font-semibold shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60 active:scale-[0.985] ${createButtonClass}`}
              title="Create Request"
            >
              {saving ? <Loader2 size={17} className="animate-spin" /> : <Send size={17} />}
              <span>Create</span>
            </button>
          </div>
        </div>

        <div className="request-scroll min-h-0 flex-1 space-y-3 overflow-y-auto px-5 pb-5">
          <Field label="Category">
            <select
              value={newRequest.category}
              onChange={(e) => setNewRequest((prev) => ({ ...prev, category: e.target.value }))}
              className="field-input"
            >
              {CATEGORY_FILTERS.filter((item) => item.id !== "all").map((category) => (
                <option key={category.id} value={category.id}>
                  {category.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Requester" error={createErrors.requester}>
            <input
              value={newRequest.requester}
              onChange={(e) => {
                setNewRequest((prev) => ({ ...prev, requester: e.target.value }));
                clearCreateError("requester");
              }}
              placeholder="Requester name"
              className={getInputClass(createErrors.requester)}
            />
          </Field>

          <Field label="Request Title" error={createErrors.title}>
            <input
              value={newRequest.title}
              onChange={(e) => {
                setNewRequest((prev) => ({ ...prev, title: e.target.value }));
                clearCreateError("title");
              }}
              placeholder="Example: P4 LP Price Reveal"
              className={getInputClass(createErrors.title)}
            />
          </Field>

          <Field label="Request Type" error={createErrors.type}>
            <input
              value={newRequest.type}
              onChange={(e) => {
                setNewRequest((prev) => ({ ...prev, type: e.target.value }));
                clearCreateError("type");
              }}
              placeholder="Banner, LP, SKU..."
              list="request-type-suggestions"
              className={getInputClass(createErrors.type)}
            />
            <datalist id="request-type-suggestions">
              {REQUEST_TYPE_SUGGESTIONS.map((item) => (
                <option key={item} value={item} />
              ))}
            </datalist>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Platform">
              <input
                value={newRequest.platform}
                onChange={(e) => setNewRequest((prev) => ({ ...prev, platform: e.target.value }))}
                placeholder="TikTok / Internal"
                className="field-input"
              />
            </Field>

            <Field label="Due Date" error={createErrors.due}>
              <input
                type="date"
                min={tomorrowKey}
                value={newRequest.due || ""}
                onChange={(e) => {
                  setNewRequest((prev) => ({ ...prev, due: e.target.value }));
                  clearCreateError("due");
                }}
                className={`${getInputClass(createErrors.due)} date-input`}
              />
              <p className="mt-1 text-[11px] text-neutral-400">
                Today is locked. Choose tomorrow or later.
              </p>
            </Field>
          </div>

          <Field label="Priority">
            <select
              value={newRequest.priority}
              onChange={(e) => setNewRequest((prev) => ({ ...prev, priority: e.target.value }))}
              className="field-input"
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </Field>

          <Field label="Drive Link">
            <input
              value={newRequest.drive_link}
              onChange={(e) => setNewRequest((prev) => ({ ...prev, drive_link: e.target.value }))}
              placeholder="Optional Google Drive link"
              className="field-input"
            />
          </Field>

          <Field label="Notes">
            <textarea
              value={newRequest.note}
              onChange={(e) => setNewRequest((prev) => ({ ...prev, note: e.target.value }))}
              placeholder="Write brief notes..."
              rows={3}
              className="field-input resize-none"
            />
          </Field>

          <label
            onDragEnter={(event) => {
              event.preventDefault();
              event.stopPropagation();
              if (uploadedFiles.length < MAX_ATTACHMENTS) setDragActive(true);
            }}
            onDragOver={(event) => {
              event.preventDefault();
              event.stopPropagation();
              if (uploadedFiles.length < MAX_ATTACHMENTS) setDragActive(true);
            }}
            onDragLeave={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setDragActive(false);
            }}
            onDrop={(event) => {
              setDragActive(false);
              if (uploadedFiles.length >= MAX_ATTACHMENTS) {
                event.preventDefault();
                event.stopPropagation();
                return;
              }
              handleFileDrop(event);
            }}
            className={`block rounded-[24px] border border-dashed p-4 text-center transition ${
              uploadedFiles.length >= MAX_ATTACHMENTS
                ? "cursor-not-allowed border-black/10 bg-white/50 opacity-55"
                : dragActive
                  ? isDark
                    ? "cursor-copy border-white/40 bg-white/10 shadow-[0_18px_45px_rgba(0,0,0,0.22)]"
                    : "cursor-copy border-neutral-950 bg-white shadow-[0_18px_45px_rgba(0,0,0,0.08)]"
                  : isDark
                    ? "cursor-pointer border-white/10 bg-white/[0.05] hover:bg-white/[0.08]"
                    : "cursor-pointer border-black/10 bg-white/70 hover:bg-white"
            }`}
          >
            <UploadCloud className="mx-auto text-neutral-400" size={24} />
            <p className="mt-2 text-sm font-medium">
              {dragActive ? "Drop files here" : "Upload attachment"}
            </p>
            <p className="mt-1 text-xs text-neutral-400">
              Drag from Mac / Windows folder, or click to browse.
            </p>
            <p className="mt-1 text-xs text-neutral-400">
              PDF, JPG, PNG · max {MAX_ATTACHMENTS} attachments · max {MAX_FILE_SIZE_MB}MB each
            </p>
            <p className="mt-1 text-[11px] font-medium text-neutral-400">
              {uploadedFiles.length}/{MAX_ATTACHMENTS} attachments selected
            </p>
            <input
              type="file"
              className="hidden"
              multiple
              disabled={uploadedFiles.length >= MAX_ATTACHMENTS}
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileUpload}
            />
          </label>

          {uploadedFiles.length > 0 && (
            <div className="space-y-2">
              {uploadedFiles.map((fileItem, index) => {
                const file = fileItem.file || fileItem;

                return (
                  <div
                    key={`${fileItem.id || file.name}-${index}`}
                    className={`rounded-2xl p-3 text-sm ${isDark ? "bg-white/[0.06]" : "bg-neutral-100"}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="min-w-0 truncate text-neutral-500">
                        Attachment {index + 1} · {formatFileSize(file.size)}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveUploadedFile(index)}
                        className="shrink-0 text-neutral-400 transition hover:text-red-500"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    <textarea
                      value={fileItem.note || ""}
                      onChange={(event) => handleUploadedFileNoteChange(index, event.target.value)}
                      placeholder="Attachment note, example: Kotak biru FIRST SALE..."
                      rows={2}
                      className="mt-2 w-full resize-none rounded-2xl border border-black/5 bg-white/82 px-3 py-2 text-xs text-neutral-600 outline-none placeholder:text-neutral-400 focus:bg-white"
                    />
                  </div>
                );
              })}
            </div>
          )}

          <button
            type="button"
            onClick={handleCreateRequest}
            disabled={saving}
            className={`mt-1 flex w-full items-center justify-center gap-2 rounded-[22px] px-5 py-4 text-sm font-semibold shadow-[0_18px_45px_rgba(0,0,0,0.18)] transition disabled:cursor-not-allowed disabled:opacity-60 active:scale-[0.985] ${createButtonClass}`}
          >
            {saving ? <Loader2 size={17} className="animate-spin" /> : <Send size={17} />}
            {saving ? "Saving..." : "Create Request"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children, error }) {
  return (
    <label className="block">
      <span className={`mb-1.5 block text-xs font-medium uppercase tracking-[0.14em] ${error ? "text-red-500" : "text-neutral-400"}`}>
        {label}
      </span>
      {children}
      {error && <p className="mt-1 text-[11px] font-medium text-red-500">{error}</p>}
    </label>
  );
}

function EditRequestPanel({
  loading,
  requests,
  sortBy,
  setSortBy,
  manageMode,
  setManageMode,
  selectedIds,
  selectedCount,
  bulkStatus,
  setBulkStatus,
  toggleSelectedId,
  toggleSelectAll,
  onBulkStatus,
  onBulkDelete,
  onStatusAction,
  onSingleDelete,
  onRefresh,
  onEditLinks,
  onOpenAssets,
  onPreviewRequest,
  onDragStart,
  onDropOnRequest,
  draggedId,
  trashCount = 0,
  onOpenTrash,
}) {
  return (
    <section>
      <div className="mb-4 flex items-end justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-400">Manage</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-[-0.05em]">Manage Request</h2>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <SortSelect sortBy={sortBy} setSortBy={setSortBy} />
          <button
            onClick={onRefresh}
            className="rounded-2xl bg-white/80 px-4 py-2 text-sm font-medium text-neutral-500 shadow-sm transition hover:text-neutral-950"
          >
            Refresh
          </button>
          <button
            onClick={onOpenTrash}
            className="inline-flex items-center gap-2 rounded-2xl bg-white/80 px-4 py-2 text-sm font-semibold text-neutral-600 shadow-sm transition hover:text-neutral-950"
          >
            <Trash2 size={15} />
            Trash {trashCount}
          </button>
          <button
            onClick={() => setManageMode(!manageMode)}
            className={`rounded-2xl px-4 py-2 text-sm font-semibold shadow-sm transition ${
              manageMode ? "bg-neutral-100 text-neutral-700 hover:bg-neutral-200" : "bg-neutral-950 text-white hover:bg-neutral-800"
            }`}
          >
            {manageMode ? "Cancel" : "Manage"}
          </button>
        </div>
      </div>

      {manageMode && (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-white/70 bg-white/72 p-3 shadow-sm backdrop-blur-xl">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={toggleSelectAll}
              className="rounded-2xl bg-neutral-100 px-4 py-2 text-sm font-semibold text-neutral-600 hover:bg-neutral-200"
            >
              {selectedIds.length === requests.length ? "Uncheck All" : "Check All"}
            </button>
            <span className="text-sm text-neutral-500">{selectedCount} selected</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={bulkStatus}
              onChange={(e) => setBulkStatus(e.target.value)}
              className="rounded-2xl border border-black/5 bg-white px-4 py-2 text-sm font-medium text-neutral-600 outline-none shadow-sm"
            >
              {ADMIN_STATUS_ACTIONS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
            <button
              onClick={onBulkStatus}
              className="rounded-2xl bg-neutral-950 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800"
            >
              Apply Status
            </button>
            <button
              onClick={onBulkDelete}
              disabled={selectedCount === 0}
              className="rounded-2xl bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Delete
            </button>
          </div>
        </div>
      )}

      <div className="rounded-[28px] border border-white/70 bg-white/62 p-4 shadow-[0_18px_60px_rgba(0,0,0,0.06)] backdrop-blur-xl md:p-5">
        {loading ? (
          <LoadingState />
        ) : requests.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-3">
            {requests.map((request) => (
              <div key={request.id}>
                <RequestRow
                  request={request}
                  variant="admin"
                  manageMode={manageMode}
                  selected={selectedIds.includes(request.id)}
                  dragged={draggedId === request.id}
                  onToggleSelected={toggleSelectedId}
                  onStatusAction={onStatusAction}
                  onSingleDelete={onSingleDelete}
                  onEditAsset={onEditLinks}
                  onOpenAssets={onOpenAssets}
                  onPreviewRequest={onPreviewRequest}
                  onDragStart={onDragStart}
                  onDropOnRequest={onDropOnRequest}
                />

                {!manageMode && (
                  <div className="mt-2 rounded-2xl bg-white/55 px-4 py-3 text-xs text-neutral-500">
                    Asset links: {flattenAssetLinks(request.asset_links).length} item · Drag card to set priority · Drag the handle to set priority · Click <span className="font-semibold text-neutral-800">Edit Asset</span> to update Folder / Sub Folder / Link.
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function RequestEditModal({
  request,
  draft,
  saving,
  newFiles = [],
  onChange,
  onExistingFileNoteChange,
  onRemoveExistingFile,
  onUploadFile,
  onDropFile,
  onNewFileNoteChange,
  onRemoveNewFile,
  onCancelRequest,
  onSave,
  onClose,
}) {
  const tomorrowKey = getTomorrowKey();
  const tickets = getEditTickets(request);
  const existingFiles = asFilesArray(draft.files);
  const totalFiles = existingFiles.length + newFiles.length;
  const [signedFiles, setSignedFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    let active = true;

    const loadSignedFiles = async () => {
      const mapped = await Promise.all(
        existingFiles.map(async (file) => {
          if (!file?.path) return { ...file, url: "" };

          const { data, error } = await supabase.storage
            .from(BUCKET_NAME)
            .createSignedUrl(file.path, 60 * 60);

          return {
            ...file,
            url: error ? "" : data?.signedUrl || "",
          };
        })
      );

      if (active) setSignedFiles(mapped);
    };

    loadSignedFiles();

    return () => {
      active = false;
    };
  }, [JSON.stringify(existingFiles.map((file) => file?.path || ""))]);

  return (
    <div className="fixed inset-0 z-[99999] grid place-items-center bg-black/25 p-4 backdrop-blur-sm">
      <div className="flex max-h-[calc(100vh-2rem)] w-full max-w-4xl flex-col overflow-hidden rounded-[32px] border border-white/70 bg-[#f5f5f3]/95 shadow-[0_35px_120px_rgba(0,0,0,.22)]">
        <div className="shrink-0 border-b border-black/5 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-400">Edit Request</p>
              <h3 className="mt-1 text-2xl font-semibold tracking-[-0.05em]">{request.title}</h3>
              <p className="mt-1 text-sm text-neutral-500">After saving, ticket will be {Math.max(tickets - 1, 0)}.</p>
            </div>
            <button onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full bg-white text-neutral-500 shadow-sm hover:text-neutral-950">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="request-scroll min-h-0 flex-1 overflow-y-auto p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Category">
              <select value={draft.category} onChange={(e) => onChange("category", e.target.value)} className="field-input">
                {CATEGORY_FILTERS.filter((item) => item.id !== "all").map((category) => (
                  <option key={category.id} value={category.id}>{category.label}</option>
                ))}
              </select>
            </Field>
            <Field label="Requester">
              <input value={draft.requester} onChange={(e) => onChange("requester", e.target.value)} className="field-input" />
            </Field>
          </div>

          <div className="mt-4 space-y-4">
            <Field label="Request Title">
              <input value={draft.title} onChange={(e) => onChange("title", e.target.value)} className="field-input" />
            </Field>

            <Field label="Request Type">
              <input list="edit-request-types" value={draft.type} onChange={(e) => onChange("type", e.target.value)} className="field-input" />
              <datalist id="edit-request-types">
                {REQUEST_TYPE_SUGGESTIONS.map((item) => <option key={item} value={item} />)}
              </datalist>
            </Field>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Platform">
                <input value={draft.platform} onChange={(e) => onChange("platform", e.target.value)} className="field-input" />
              </Field>
              <Field label="Due Date">
                <input type="date" min={tomorrowKey} value={draft.due} onChange={(e) => onChange("due", e.target.value)} className="field-input date-input" />
              </Field>
            </div>

            <Field label="Priority">
              <select value={draft.priority} onChange={(e) => onChange("priority", e.target.value)} className="field-input">
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </Field>

            <Field label="Drive Link">
              <input value={draft.drive_link} onChange={(e) => onChange("drive_link", e.target.value)} className="field-input" />
            </Field>

            <Field label="Notes">
              <textarea value={draft.note} onChange={(e) => onChange("note", e.target.value)} rows={5} className="field-input resize-none" />
            </Field>

            <section
              onDragEnter={(event) => {
                event.preventDefault();
                event.stopPropagation();
                if (totalFiles < MAX_ATTACHMENTS) setDragActive(true);
              }}
              onDragOver={(event) => {
                event.preventDefault();
                event.stopPropagation();
                if (totalFiles < MAX_ATTACHMENTS) setDragActive(true);
              }}
              onDragLeave={(event) => {
                event.preventDefault();
                event.stopPropagation();
                setDragActive(false);
              }}
              onDrop={(event) => {
                setDragActive(false);
                if (totalFiles >= MAX_ATTACHMENTS) {
                  event.preventDefault();
                  event.stopPropagation();
                  return;
                }
                onDropFile?.(event);
              }}
              className={`rounded-[26px] border p-4 shadow-sm transition ${
                dragActive
                  ? "border-neutral-950 bg-white shadow-[0_18px_45px_rgba(0,0,0,0.08)]"
                  : "border-white/70 bg-white/70"
              }`}
            >
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-400">Attachments</p>
                  <h4 className="mt-1 text-lg font-semibold tracking-[-0.04em]">{totalFiles}/{MAX_ATTACHMENTS} attachments</h4>
                </div>

                <label className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold shadow-sm ${totalFiles >= MAX_ATTACHMENTS ? "cursor-not-allowed bg-neutral-100 text-neutral-300" : "cursor-pointer bg-neutral-950 text-white hover:bg-neutral-800"}`}>
                  <UploadCloud size={15} />
                  {dragActive ? "Drop Here" : "Upload / Replace"}
                  <input
                    type="file"
                    className="hidden"
                    multiple
                    disabled={totalFiles >= MAX_ATTACHMENTS}
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={onUploadFile}
                  />
                </label>
              </div>

              <p className="mb-4 rounded-2xl bg-neutral-50 px-4 py-3 text-xs leading-5 text-neutral-500">
                Drag files from Mac / Windows folder into this box, or click Upload / Replace. PDF, JPG, PNG · max {MAX_ATTACHMENTS} attachments · max {MAX_FILE_SIZE_MB}MB each. Existing files can be removed, re-noted, or replaced.
              </p>

              {totalFiles === 0 ? (
                <div className="rounded-[22px] border border-dashed border-black/10 bg-neutral-50 p-6 text-center text-sm text-neutral-500">
                  No attachment yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {signedFiles.map((file, index) => (
                    <div key={file.path || index} className="rounded-[22px] border border-black/5 bg-white p-3 shadow-sm">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-neutral-700">Attachment {index + 1}</p>
                          <p className="mt-0.5 text-xs text-neutral-400">{file.size || "-"}</p>
                        </div>
                        <div className="flex gap-2">
                          {file.url && (
                            <a href={file.url} target="_blank" rel="noreferrer" className="rounded-full bg-neutral-100 px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-200">
                              Open
                            </a>
                          )}
                          <button onClick={() => onRemoveExistingFile(index)} className="rounded-full bg-red-50 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-100">
                            Remove
                          </button>
                        </div>
                      </div>
                      <textarea
                        value={existingFiles[index]?.note || ""}
                        onChange={(event) => onExistingFileNoteChange(index, event.target.value)}
                        placeholder="Attachment note..."
                        rows={2}
                        className="mt-3 w-full resize-none rounded-2xl border border-black/5 bg-neutral-50 px-3 py-2 text-xs text-neutral-600 outline-none placeholder:text-neutral-400 focus:bg-white"
                      />
                    </div>
                  ))}

                  {newFiles.map((fileItem, index) => {
                    const file = fileItem.file || fileItem;
                    return (
                      <div key={`${fileItem.id || file.name}-${index}`} className="rounded-[22px] border border-black/5 bg-white p-3 shadow-sm">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-neutral-700">New Attachment {existingFiles.length + index + 1}</p>
                            <p className="mt-0.5 text-xs text-neutral-400">{formatFileSize(file.size)}</p>
                          </div>
                          <button onClick={() => onRemoveNewFile(index)} className="rounded-full bg-red-50 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-100">
                            Remove
                          </button>
                        </div>
                        <textarea
                          value={fileItem.note || ""}
                          onChange={(event) => onNewFileNoteChange(index, event.target.value)}
                          placeholder="Attachment note..."
                          rows={2}
                          className="mt-3 w-full resize-none rounded-2xl border border-black/5 bg-neutral-50 px-3 py-2 text-xs text-neutral-600 outline-none placeholder:text-neutral-400 focus:bg-white"
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        </div>

        <div className="shrink-0 border-t border-black/5 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={onCancelRequest}
              className="inline-flex items-center gap-2 rounded-2xl bg-red-50 px-5 py-3 text-sm font-semibold text-red-600 shadow-sm hover:bg-red-100"
            >
              <Trash2 size={16} />
              Delete Request
            </button>
            <div className="flex justify-end gap-3">
              <button onClick={onClose} className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-neutral-600 shadow-sm hover:text-neutral-950">
                Cancel
              </button>
              <button onClick={onSave} disabled={saving} className="inline-flex items-center gap-2 rounded-2xl bg-neutral-950 px-5 py-3 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-60">
                {saving ? <Loader2 size={17} className="animate-spin" /> : <Save size={17} />}
                Save Request
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RequestPreviewModal({ request, onClose }) {
  const [signedFiles, setSignedFiles] = useState([]);
  const [activeAttachment, setActiveAttachment] = useState(null);
  const files = asFilesArray(request.files);
  const assetLinks = flattenAssetLinks(request.asset_links);

  useEffect(() => {
    let active = true;

    const loadFiles = async () => {
      const mapped = await Promise.all(
        files.map(async (file) => {
          if (!file?.path) return { ...file, url: "" };

          const { data, error } = await supabase.storage
            .from(BUCKET_NAME)
            .createSignedUrl(file.path, 60 * 60);

          return {
            ...file,
            url: error ? "" : data?.signedUrl || "",
          };
        })
      );

      if (active) setSignedFiles(mapped);
    };

    loadFiles();

    return () => {
      active = false;
    };
  }, [request.id]);

  return createPortal(
    <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm">
      <div className="flex max-h-[calc(100vh-2rem)] w-full max-w-6xl flex-col overflow-hidden rounded-[32px] border border-white/70 bg-[#f5f5f3]/96 shadow-[0_35px_120px_rgba(0,0,0,.25)]">
        <div className="shrink-0 border-b border-black/5 p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 gap-3">
              <RequesterAvatar request={request} />
              <div className="min-w-0">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <StatusPill request={request} />
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${getPriorityClass(request.priority)}`}>
                  {request.priority}
                </span>
                <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-500">
                  {formatCategoryLabel(request.category)}
                </span>
              </div>

              <h3 className="text-3xl font-semibold leading-tight tracking-[-0.06em] text-neutral-950">
                {request.title}
              </h3>
              <p className="mt-2 text-sm text-neutral-500">
                {getRequestDisplayName(request)} · {request.type} · {request.platform || "Internal"}
              </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-neutral-500 shadow-sm transition hover:text-neutral-950"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="request-scroll min-h-0 flex-1 overflow-y-auto p-5">
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-5">
              <section className="rounded-[26px] border border-white/70 bg-white/72 p-5 shadow-sm">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-400">
                  Request Brief
                </p>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-neutral-700">
                  {request.note || "No notes added."}
                </p>

                <div className="mt-5 flex flex-wrap gap-2 text-xs text-neutral-400">
                  <span className="rounded-full bg-neutral-100 px-3 py-1">
                    Due: {formatDue(request.due)}
                  </span>
                  <span className="rounded-full bg-neutral-100 px-3 py-1">
                    Created: {formatDateTime(request.created_at)}
                  </span>
                  {request.drive_link && (
                    <a
                      href={request.drive_link}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full bg-neutral-950 px-3 py-1 font-semibold text-white"
                    >
                      Open Drive Link
                    </a>
                  )}
                </div>
              </section>

              <section className="rounded-[26px] border border-white/70 bg-white/72 p-5 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-400">
                      Attachments
                    </p>
                    <h4 className="mt-1 text-xl font-semibold tracking-[-0.04em]">
                      {files.length} file{files.length > 1 ? "s" : ""}
                    </h4>
                  </div>
                  <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-500">
                    Max {MAX_ATTACHMENTS} attachments
                  </span>
                </div>

                {signedFiles.length === 0 ? (
                  <div className="mt-5 rounded-[22px] border border-dashed border-black/10 bg-neutral-50 p-8 text-center">
                    <Paperclip className="mx-auto text-neutral-300" size={28} />
                    <p className="mt-3 text-sm font-semibold text-neutral-600">No attachment</p>
                  </div>
                ) : (
                  <div className="mt-5 space-y-4">
                    {signedFiles.map((file, index) => {
                      const isImage = String(file.type || "").startsWith("image/");
                      const isPdf = String(file.type || "").includes("pdf");
                      const canPreview = Boolean(file.url && (isImage || isPdf));

                      return (
                        <div
                          key={file.path || `${file.name}-${index}`}
                          className="overflow-hidden rounded-[24px] border border-black/5 bg-white shadow-sm"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/5 px-4 py-3">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-neutral-800">
                                Attachment {index + 1}
                              </p>
                              <p className="mt-0.5 text-xs text-neutral-400">
                                {file.size || "-"}
                              </p>
                            </div>

                            {file.url && (
                              <a
                                href={file.url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 rounded-full bg-neutral-950 px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-800"
                              >
                                <Download size={14} />
                                Download / Open
                              </a>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => canPreview && setActiveAttachment({ ...file, index })}
                            className={`block w-full bg-neutral-100/70 p-3 text-left ${canPreview ? "cursor-zoom-in" : "cursor-default"}`}
                          >
                            {file.url && isImage && (
                              <img
                                src={file.url}
                                alt={`Attachment ${index + 1}`}
                                className="mx-auto max-h-[520px] w-full max-w-4xl rounded-[18px] bg-white object-contain"
                              />
                            )}

                            {file.url && isPdf && (
                              <div className="rounded-[18px] bg-white p-4">
                                <iframe
                                  src={file.url}
                                  title={`Attachment ${index + 1}`}
                                  className="pointer-events-none h-[420px] w-full rounded-[14px] bg-white"
                                />
                                <p className="mt-3 text-center text-xs font-medium text-neutral-400">
                                  Click to preview PDF in popup
                                </p>
                              </div>
                            )}

                            {(!file.url || (!isImage && !isPdf)) && (
                              <div className="rounded-[18px] bg-white p-8 text-center">
                                <Paperclip className="mx-auto text-neutral-300" size={28} />
                                <p className="mt-3 text-sm font-semibold text-neutral-600">
                                  Preview not available
                                </p>
                                <p className="mt-1 text-xs text-neutral-400">
                                  Use Download / Open to view this file.
                                </p>
                              </div>
                            )}
                          </button>

                          {file.note && (
                            <div className="border-t border-black/5 bg-white px-4 py-3">
                              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">
                                Attachment Note
                              </p>
                              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-neutral-600">
                                {file.note}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            </div>

            <aside className="space-y-5">
              <section className="rounded-[26px] border border-white/70 bg-white/72 p-5 shadow-sm">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-400">
                  Summary
                </p>

                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between gap-3 rounded-2xl bg-neutral-50 px-4 py-3">
                    <span className="text-neutral-400">Requester</span>
                    <span className="font-semibold text-neutral-700">{request.requester}</span>
                  </div>
                  <div className="flex justify-between gap-3 rounded-2xl bg-neutral-50 px-4 py-3">
                    <span className="text-neutral-400">Type</span>
                    <span className="font-semibold text-neutral-700">{request.type}</span>
                  </div>
                  <div className="flex justify-between gap-3 rounded-2xl bg-neutral-50 px-4 py-3">
                    <span className="text-neutral-400">Platform</span>
                    <span className="font-semibold text-neutral-700">{request.platform || "Internal"}</span>
                  </div>
                </div>
              </section>

              <section className="rounded-[26px] border border-white/70 bg-white/72 p-5 shadow-sm">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-400">
                  Download Asset Links
                </p>

                {assetLinks.length === 0 ? (
                  <p className="mt-3 text-sm leading-6 text-neutral-500">
                    Asset link belum dikirim.
                  </p>
                ) : (
                  <div className="mt-4 space-y-2">
                    {assetLinks.map((asset, index) => (
                      <a
                        key={`${asset.link}-${index}`}
                        href={asset.link}
                        target="_blank"
                        rel="noreferrer"
                        className="block rounded-2xl bg-neutral-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
                      >
                        {asset.folder || "Asset"} · {asset.subfolder || `Link ${index + 1}`}
                      </a>
                    ))}
                  </div>
                )}
              </section>
            </aside>
          </div>
        </div>
      </div>

      {activeAttachment && (
        <AttachmentLightbox
          file={activeAttachment}
          onClose={() => setActiveAttachment(null)}
        />
      )}
    </div>,
    document.body
  );
}

function AttachmentLightbox({ file, onClose }) {
  const isImage = String(file.type || "").startsWith("image/");
  const isPdf = String(file.type || "").includes("pdf");

  return (
    <div
      className="fixed inset-0 z-[1000000] flex items-center justify-center bg-black/55 p-4 backdrop-blur-md"
      onClick={onClose}
    >
      <div className="max-h-[calc(100vh-2rem)] w-full max-w-6xl overflow-hidden rounded-[28px] bg-[#f5f5f3] shadow-[0_35px_140px_rgba(0,0,0,.4)]" onClick={(event) => event.stopPropagation()}>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/5 bg-white px-5 py-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-400">Preview</p>
            <h4 className="text-xl font-semibold tracking-[-0.04em]">Attachment {(file.index ?? 0) + 1}</h4>
          </div>

          {file.url && (
            <a
              href={file.url}
              target="_blank"
              rel="noreferrer"
              onClick={(event) => event.stopPropagation()}
              className="inline-flex items-center gap-2 rounded-full bg-neutral-950 px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-800"
            >
              <Download size={14} />
              Download / Open
            </a>
          )}
        </div>

        <div className="request-scroll max-h-[calc(100vh-9rem)] overflow-y-auto bg-neutral-100/70 p-4">
          {isImage && file.url && (
            <img
              src={file.url}
              alt={`Attachment ${(file.index ?? 0) + 1}`}
              onClick={onClose}
              className="mx-auto w-full max-w-5xl rounded-[18px] bg-white object-contain"
            />
          )}

          {isPdf && file.url && (
            <iframe
              src={file.url}
              title={`Attachment ${(file.index ?? 0) + 1}`}
              onClick={(event) => event.stopPropagation()}
              className="h-[calc(100vh-12rem)] min-h-[620px] w-full rounded-[18px] bg-white"
            />
          )}

          {!isImage && !isPdf && (
            <div className="rounded-[22px] bg-white p-10 text-center">
              <Paperclip className="mx-auto text-neutral-300" size={34} />
              <p className="mt-4 text-sm font-semibold text-neutral-600">Preview not available</p>
            </div>
          )}

          {file.note && (
            <div className="mt-4 rounded-[22px] bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">Attachment Note</p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-neutral-600">{file.note}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


function AssetDownloadModal({ request, onClose }) {
  const [checked, setChecked] = useState(false);
  const [localError, setLocalError] = useState("");

  const groups = normalizeAssetGroups(request.asset_links)
    .map((group) => ({
      ...group,
      children: (group.children || []).filter((child) => child.link),
    }))
    .filter((group) => group.children.length > 0);

  const totalLinks = flattenAssetLinks(request.asset_links).length;

  const handleShowAssets = () => {
    if (!checked) {
      setLocalError("Centang checklist dulu sebelum buka asset.");
      return;
    }

    setLocalError("");
  };

  if (!checked) {
    return (
      <div className="fixed inset-0 z-[99999] grid place-items-center bg-black/25 p-4 backdrop-blur-sm">
        <div className="w-full max-w-xl rounded-[32px] border border-white/70 bg-[#f5f5f3]/95 p-5 shadow-[0_35px_120px_rgba(0,0,0,.22)]">
          <div className="flex items-start justify-between gap-4 border-b border-black/5 pb-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-400">Asset Check</p>
              <h3 className="mt-1 text-2xl font-semibold tracking-[-0.05em]">{request.title}</h3>
              <p className="mt-1 text-sm text-neutral-500">
                Cek dulu detail request sebelum buka link asset.
              </p>
            </div>

            <button
              onClick={onClose}
              className="grid h-10 w-10 place-items-center rounded-full bg-white text-neutral-500 shadow-sm hover:text-neutral-950"
            >
              <X size={18} />
            </button>
          </div>

          <div className="mt-5 space-y-3">
            {[
              "Pastikan requester, type, platform, dan notes sudah sesuai.",
              "Pastikan asset yang dibuka sesuai folder/sub folder.",
              "Cek harga, periode promo, dan placement sebelum dipakai.",
            ].map((item) => (
              <div key={item} className="flex gap-3 rounded-[22px] bg-white/78 p-4 shadow-sm">
                <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-neutral-400" />
                <p className="text-sm leading-5 text-neutral-600">{item}</p>
              </div>
            ))}

            <label className="flex cursor-pointer items-center gap-3 rounded-[22px] border border-black/5 bg-white/90 p-4 shadow-sm">
              <input
                type="checkbox"
                checked={checked}
                onChange={(e) => {
                  setChecked(e.target.checked);
                  setLocalError("");
                }}
                className="h-4 w-4 accent-black"
              />
              <span className="text-sm font-semibold text-neutral-700">
                Sudah dicek, tampilkan {totalLinks} asset link.
              </span>
            </label>

            {localError && (
              <p className="rounded-2xl bg-red-50 px-4 py-3 text-center text-xs font-medium text-red-600">
                {localError}
              </p>
            )}
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              onClick={onClose}
              className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-neutral-600 shadow-sm hover:text-neutral-950"
            >
              Cancel
            </button>

            <button
              onClick={handleShowAssets}
              disabled={!checked}
              className={`rounded-2xl px-5 py-3 text-sm font-semibold text-white shadow-sm transition ${
                checked
                  ? "bg-neutral-950 hover:bg-neutral-800"
                  : "cursor-not-allowed bg-neutral-300"
              }`}
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[99999] grid place-items-center bg-black/25 p-4 backdrop-blur-sm">
      <div className="w-full max-w-3xl rounded-[32px] border border-white/70 bg-[#f5f5f3]/95 p-5 shadow-[0_35px_120px_rgba(0,0,0,.22)]">
        <div className="flex items-start justify-between gap-4 border-b border-black/5 pb-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-400">Download Asset</p>
            <h3 className="mt-1 text-2xl font-semibold tracking-[-0.05em]">{request.title}</h3>
            <p className="mt-1 text-sm text-neutral-500">{totalLinks} link ready</p>
          </div>

          <button
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-full bg-white text-neutral-500 shadow-sm hover:text-neutral-950"
          >
            <X size={18} />
          </button>
        </div>

        <div className="request-scroll mt-4 max-h-[58vh] space-y-4 overflow-y-auto pr-1">
          {groups.map((group) => (
            <div key={group.id} className="rounded-[26px] bg-white/80 p-4 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <Folder size={18} className="text-neutral-400" />
                <p className="text-sm font-semibold text-neutral-950">{group.folder || "Untitled Folder"}</p>
              </div>

              <div className="space-y-2">
                {group.children.map((child) => (
                  <div key={child.id} className="flex items-center justify-between gap-3 rounded-2xl bg-neutral-50 px-3 py-3">
                    <p className="min-w-0 truncate text-sm text-neutral-600">{child.subfolder || "Untitled Sub Folder"}</p>
                    <a
                      href={child.link}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex shrink-0 items-center gap-2 rounded-full bg-neutral-950 px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-800"
                    >
                      <Download size={15} />
                      Open
                    </a>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-neutral-600 shadow-sm hover:text-neutral-950"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function AssetLinkEditorModal({
  request,
  draft,
  unlocked,
  code,
  saving,
  setCode,
  onUnlock,
  onFolderChange,
  onChildChange,
  onAddFolder,
  onAddSubfolder,
  onRemoveSubfolder,
  onRemoveFolder,
  onSave,
  onClose,
}) {
  return (
    <div className="fixed inset-0 z-[99999] grid place-items-center bg-black/25 p-4 backdrop-blur-sm">
      <div className="w-full max-w-6xl rounded-[32px] border border-white/70 bg-[#f5f5f3]/95 p-5 shadow-[0_35px_120px_rgba(0,0,0,.22)]">
        <div className="flex items-start justify-between gap-4 border-b border-black/5 pb-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-400">Edit Asset</p>
            <h3 className="mt-1 text-2xl font-semibold tracking-[-0.05em]">{request.title}</h3>
            <p className="mt-1 text-sm text-neutral-500">Protected by internal code. One Folder can have many Sub Folders.</p>
          </div>
          <button onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full bg-white text-neutral-500 shadow-sm hover:text-neutral-950">
            <X size={18} />
          </button>
        </div>

        {!unlocked ? (
          <div className="mx-auto my-10 max-w-md rounded-[28px] bg-white/80 p-5 text-center shadow-sm">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-neutral-950 text-white">
              <Lock size={20} />
            </div>
            <h4 className="mt-4 text-xl font-semibold tracking-[-0.05em]">Enter ADF Code</h4>
            <p className="mt-1 text-sm text-neutral-500">Code will be hidden while typing.</p>
            <input
              type="password"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onUnlock()}
              placeholder="•••"
              className="field-input mt-4 text-center"
            />
            <button onClick={onUnlock} className="mt-3 w-full rounded-2xl bg-neutral-950 px-5 py-3 text-sm font-semibold text-white hover:bg-neutral-800">
              Unlock Editor
            </button>
          </div>
        ) : (
          <>
            <div className="request-scroll mt-4 max-h-[58vh] space-y-4 overflow-y-auto pr-1">
              {draft.map((group, groupIndex) => (
                <div key={group.id || groupIndex} className="rounded-[28px] bg-white/78 p-4 shadow-sm">
                  <div className="mb-3 grid grid-cols-[minmax(280px,1fr)_auto] gap-3">
                    <Field label="Folder">
                      <input
                        value={group.folder}
                        onChange={(e) => onFolderChange(groupIndex, e.target.value)}
                        placeholder="Example: P4 Series"
                        className="field-input"
                      />
                    </Field>

                    <button
                      onClick={() => onRemoveFolder(groupIndex)}
                      className="mt-6 grid h-11 w-11 place-items-center rounded-2xl bg-red-50 text-red-600 hover:bg-red-100"
                      title="Remove folder"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="space-y-2">
                    {(group.children || []).map((child, childIndex) => (
                      <div key={child.id || childIndex} className="grid grid-cols-[1fr_1.6fr_42px] gap-3 rounded-[22px] bg-neutral-50 p-3">
                        <Field label="Sub Folder">
                          <input
                            value={child.subfolder}
                            onChange={(e) => onChildChange(groupIndex, childIndex, "subfolder", e.target.value)}
                            placeholder="Example: LP Price Reveal"
                            className="field-input"
                          />
                        </Field>

                        <Field label="Link">
                          <input
                            value={child.link}
                            onChange={(e) => onChildChange(groupIndex, childIndex, "link", e.target.value)}
                            placeholder="https://drive.google.com/..."
                            className="field-input"
                          />
                        </Field>

                        <button
                          onClick={() => onRemoveSubfolder(groupIndex, childIndex)}
                          className="mt-6 grid h-11 w-11 place-items-center rounded-2xl bg-red-50 text-red-600 hover:bg-red-100"
                          title="Remove sub folder"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => onAddSubfolder(groupIndex)}
                    className="mt-3 inline-flex items-center gap-2 rounded-2xl bg-neutral-100 px-4 py-2 text-sm font-semibold text-neutral-600 hover:bg-neutral-200"
                  >
                    <Plus size={16} />
                    Add Sub Folder
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-5 flex items-center justify-between gap-3 border-t border-black/5 pt-4">
              <button onClick={onAddFolder} className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-neutral-700 shadow-sm hover:text-neutral-950">
                <Plus size={17} />
                Add Folder
              </button>
              <button onClick={onSave} disabled={saving} className="inline-flex items-center gap-2 rounded-2xl bg-neutral-950 px-5 py-3 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-60">
                {saving ? <Loader2 size={17} className="animate-spin" /> : <Save size={17} />}
                Save Asset Links
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function RequestTrashModal({ items, onClose, onRestore, onPermanentDelete }) {
  const [permanentTarget, setPermanentTarget] = useState(null);

  return createPortal(
    <div className="fixed inset-0 z-[999999] grid place-items-center bg-black/25 p-4 backdrop-blur-sm">
      <div className="flex max-h-[calc(100vh-2rem)] w-full max-w-4xl flex-col overflow-hidden rounded-[32px] border border-white/70 bg-[#f5f5f3]/96 p-5 shadow-[0_35px_120px_rgba(0,0,0,.25)]">
        <div className="mb-4 flex items-start justify-between gap-4 border-b border-black/5 pb-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-400">Manage Request Trash</p>
            <h3 className="mt-1 text-2xl font-semibold tracking-[-0.05em]">Deleted requests</h3>
            <p className="mt-1 text-sm leading-6 text-neutral-500">
              Request yang di-delete masuk sini dulu. Restore untuk balikin, Delete Permanent untuk hapus final termasuk attachment storage.
            </p>
          </div>
          <button
            onClick={onClose}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-neutral-500 shadow-sm transition hover:text-neutral-950"
          >
            <X size={18} />
          </button>
        </div>

        <div className="request-scroll min-h-0 flex-1 overflow-y-auto pr-1">
          {items.length === 0 ? (
            <div className="rounded-[26px] border border-dashed border-black/10 bg-white/70 p-10 text-center">
              <Trash2 className="mx-auto text-neutral-300" size={34} />
              <p className="mt-4 text-sm font-semibold text-neutral-600">Trash masih kosong</p>
              <p className="mt-1 text-xs text-neutral-400">Request yang dihapus akan muncul di sini dulu.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => {
                const request = item.payload || {};
                const files = asFilesArray(request.files);

                return (
                  <div key={item.id} className="rounded-[24px] border border-white/70 bg-white/78 p-4 shadow-sm">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div className="min-w-0">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-neutral-950 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-white">
                            Request
                          </span>
                          <span className="text-xs font-medium text-neutral-400">
                            {formatDateTime(item.created_at)}
                          </span>
                          <span className="rounded-full bg-neutral-100 px-3 py-1 text-[11px] font-semibold text-neutral-500">
                            {files.length} attachment{files.length > 1 ? "s" : ""}
                          </span>
                        </div>
                        <h4 className="truncate text-lg font-semibold tracking-[-0.04em]">{item.title}</h4>
                        <p className="mt-1 text-sm text-neutral-500">
                          {request.requester || "Unknown"} · {request.type || "Request"} · {request.platform || "Internal"}
                        </p>
                      </div>

                      <div className="flex shrink-0 flex-wrap justify-end gap-2">
                        <button
                          onClick={() => onRestore(item)}
                          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-neutral-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800 active:scale-95"
                        >
                          Restore
                          <ArrowRight size={16} strokeWidth={1.8} />
                        </button>

                        <button
                          onClick={() => setPermanentTarget(item)}
                          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-50 px-5 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-100 active:scale-95"
                        >
                          Delete Permanent
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {permanentTarget && (
        <div className="fixed inset-0 z-[1000000] grid place-items-center bg-black/30 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[30px] bg-white p-6 text-center shadow-[0_35px_120px_rgba(0,0,0,.25)]">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-red-50 text-red-600">
              <Trash2 size={22} />
            </div>
            <h3 className="mt-4 text-2xl font-semibold tracking-[-0.05em]">Delete permanent?</h3>
            <p className="mt-3 text-sm leading-6 text-neutral-500">
              "{permanentTarget.title}" akan dihapus permanen dari Trash dan attachment storage juga ikut dihapus.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                onClick={() => setPermanentTarget(null)}
                className="rounded-2xl border border-black/10 bg-white px-5 py-3.5 text-sm font-medium transition hover:bg-neutral-100 active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onPermanentDelete(permanentTarget);
                  setPermanentTarget(null);
                }}
                className="rounded-2xl bg-red-600 px-5 py-3.5 text-sm font-medium text-white transition hover:bg-red-700 active:scale-95"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body
  );
}

function DeleteConfirmModal({ title, message, onCancel, onConfirm }) {
  const [deleteCode, setDeleteCode] = useState("");
  const [localError, setLocalError] = useState("");

  const canDelete = deleteCode.trim().toLowerCase() === ASSET_EDIT_CODE;

  const handleConfirm = () => {
    if (!canDelete) {
      setLocalError("Masukkan kode ADF dulu sebelum delete.");
      return;
    }

    onConfirm();
  };

  return (
    <div className="fixed inset-0 z-[999999] grid place-items-center bg-black/25 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[30px] border border-white/70 bg-[#f5f5f3]/95 p-5 text-center shadow-[0_35px_120px_rgba(0,0,0,.22)]">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-red-50 text-red-600">
          <Trash2 size={20} />
        </div>

        <h3 className="mt-4 text-2xl font-semibold tracking-[-0.05em]">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-neutral-500">{message}</p>

        <div className="mt-5 text-left">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-[0.14em] text-neutral-400">
              ADF Code
            </span>
            <input
              type="password"
              value={deleteCode}
              onChange={(e) => {
                setDeleteCode(e.target.value);
                setLocalError("");
              }}
              onKeyDown={(e) => e.key === "Enter" && handleConfirm()}
              placeholder="•••"
              className="field-input text-center"
            />
          </label>

          {localError && (
            <p className="mt-3 rounded-2xl bg-red-50 px-4 py-3 text-center text-xs font-medium text-red-600">
              {localError}
            </p>
          )}
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            onClick={onCancel}
            className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-neutral-600 shadow-sm hover:text-neutral-950"
          >
            No
          </button>

          <button
            onClick={handleConfirm}
            disabled={!canDelete}
            className={`rounded-2xl px-5 py-3 text-sm font-semibold text-white shadow-sm transition ${
              canDelete
                ? "bg-red-600 hover:bg-red-700"
                : "cursor-not-allowed bg-red-200"
            }`}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function LiveCalendarPanel({
  calendarViewDate,
  setCalendarViewDate,
  selectedCalendarDate,
  setSelectedCalendarDate,
  calendarNotes,
  newCalendarNote,
  setNewCalendarNote,
  handleAddCalendarNote,
  handleDeleteCalendarNote,
}) {
  const days = createCalendarDays(calendarViewDate);
  const selectedDateKey = getDateKey(selectedCalendarDate);
  const notes = calendarNotes[selectedDateKey] || [];
  const todayKey = getDateKey(new Date());
  const [calendarManage, setCalendarManage] = useState(false);

  const upcomingNotes = Object.entries(calendarNotes)
    .flatMap(([dateKey, items]) =>
      (items || []).map((item) => ({ ...item, date_key: item.date_key || dateKey }))
    )
    .filter((item) => item.date_key >= todayKey)
    .sort((a, b) => String(a.date_key).localeCompare(String(b.date_key)))
    .slice(0, 12);

  const selectedColor = getTrackColor(newCalendarNote.color || "blue");

  return (
    <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_390px]">
      <div>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-400">Live Calendar</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-[-0.05em]">{formatMonthYear(calendarViewDate)}</h2>
          </div>

          <div className="flex flex-wrap justify-end gap-2">
            <button
              onClick={() => setCalendarManage((prev) => !prev)}
              className={`rounded-full px-4 py-2 text-sm font-semibold shadow-sm ${
                calendarManage
                  ? "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                  : "bg-neutral-950 text-white hover:bg-neutral-800"
              }`}
            >
              {calendarManage ? "Cancel" : "Manage"}
            </button>
            <button
              onClick={() =>
                setCalendarViewDate(
                  new Date(calendarViewDate.getFullYear(), calendarViewDate.getMonth() - 1, 1)
                )
              }
              className="rounded-full bg-white/80 px-4 py-2 text-sm font-medium text-neutral-500 shadow-sm"
            >
              Prev
            </button>
            <button
              onClick={() =>
                setCalendarViewDate(
                  new Date(calendarViewDate.getFullYear(), calendarViewDate.getMonth() + 1, 1)
                )
              }
              className="rounded-full bg-white/80 px-4 py-2 text-sm font-medium text-neutral-500 shadow-sm"
            >
              Next
            </button>
          </div>
        </div>

        <div className="rounded-[30px] border border-white/70 bg-white/62 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.06)] backdrop-blur-xl">
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-medium uppercase tracking-[0.15em] text-neutral-400">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>

          <div className="mt-3 grid grid-cols-7 gap-2">
            {days.map((date, index) => {
              const isSelected = date && getDateKey(date) === getDateKey(selectedCalendarDate);
              const isToday = date && getDateKey(date) === getDateKey(new Date());
              const dayNotes = date ? calendarNotes[getDateKey(date)] || [] : [];
              const hasNotes = dayNotes.length > 0;
              const primaryColor = getTrackColor(dayNotes[0]?.color || "blue");

              return (
                <button
                  key={index}
                  disabled={!date}
                  onClick={() => date && setSelectedCalendarDate(date)}
                  className={`relative min-h-[76px] rounded-2xl border p-2 text-left text-sm transition ${
                    !date
                      ? "border-transparent bg-transparent"
                      : isSelected && isToday
                      ? "border-neutral-200 bg-white text-neutral-950 shadow-sm"
                      : isSelected
                      ? "border-neutral-700 bg-neutral-800 text-white"
                      : isToday
                      ? "border-neutral-200 bg-white/90 text-neutral-950 shadow-sm hover:bg-white"
                      : "border-black/5 bg-white/75 hover:bg-white"
                  }`}
                  style={
                    date && hasNotes && !isSelected
                      ? {
                          borderColor: primaryColor.border,
                          background: `linear-gradient(135deg, ${primaryColor.soft}, rgba(255,255,255,0.82))`,
                        }
                      : undefined
                  }
                >
                  {date && (
                    <>
                      <span className="font-medium">{date.getDate()}</span>
                      {isToday && (
                        <span className="absolute right-2 top-2 rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold text-neutral-600">
                          Today
                        </span>
                      )}

                      {hasNotes && (
                        <div className="absolute bottom-2 left-2 right-2">
                          <div className="mb-1 flex items-center gap-1">
                            {dayNotes.slice(0, 5).map((note, dotIndex) => {
                              const color = getTrackColor(note.color || "blue");
                              return (
                                <span
                                  key={`${note.id || dotIndex}-dot`}
                                  className="h-2 w-2 rounded-full"
                                  style={{ background: isSelected && !isToday ? "#fff" : color.dot }}
                                />
                              );
                            })}
                          </div>
                          <p className={`truncate text-[10px] ${isSelected && !isToday ? "text-white/70" : "text-neutral-400"}`}>
                            {dayNotes.length} event
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-5 rounded-[30px] border border-white/70 bg-white/62 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.06)] backdrop-blur-xl">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-400">Upcoming Recap</p>
              <h3 className="mt-1 text-xl font-semibold tracking-[-0.04em]">Closest event first</h3>
            </div>
            <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-neutral-400 shadow-sm">
              {upcomingNotes.length} active
            </span>
          </div>

          {upcomingNotes.length === 0 ? (
            <p className="rounded-2xl bg-neutral-100 p-4 text-sm text-neutral-500">No upcoming event yet.</p>
          ) : (
            <div className="request-scroll max-h-[420px] space-y-3 overflow-y-auto pr-1">
              {upcomingNotes.map((note) => {
                const color = getTrackColor(note.color || "blue");

                return (
                  <div
                    key={note.id}
                    className="relative overflow-hidden rounded-[22px] border bg-white/84 p-4 shadow-sm"
                    style={{ borderColor: color.border }}
                  >
                    <span className="absolute left-0 top-0 h-full w-1.5" style={{ background: color.dot }} />
                    <div className="pl-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: color.text }}>
                        {formatDue(note.date_key)}
                      </p>
                      <h4 className="mt-1 font-semibold tracking-[-0.03em]">{note.title}</h4>
                      <p className="mt-1 line-clamp-2 text-sm leading-5 text-neutral-500">{note.note}</p>
                      {note.link_url && (
                        <a
                          href={note.link_url}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-3 inline-flex rounded-full bg-neutral-950 px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-800"
                        >
                          {note.link_label || "Open Link"}
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="lg:sticky lg:top-0 lg:h-fit">
        <div className="rounded-[30px] border border-white/70 bg-white/68 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.06)] backdrop-blur-xl">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-400">Selected Date</p>
          <h3 className="mt-1 text-2xl font-semibold tracking-[-0.05em]">{formatDisplayDate(selectedCalendarDate)}</h3>

          <div className="mt-5 space-y-3">
            <input
              value={newCalendarNote.title}
              onChange={(e) => setNewCalendarNote((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Note title"
              className="field-input"
            />
            <textarea
              value={newCalendarNote.note}
              onChange={(e) => setNewCalendarNote((prev) => ({ ...prev, note: e.target.value }))}
              placeholder="Write calendar note..."
              rows={4}
              className="field-input resize-none"
            />

            <div
              className="rounded-[22px] border p-3"
              style={{ borderColor: selectedColor.border, background: selectedColor.soft }}
            >
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">Event Color</p>
                <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold" style={{ color: selectedColor.text }}>
                  {selectedColor.label}
                </span>
              </div>

              <div className="grid grid-cols-6 gap-2">
                {TRACK_COLORS.map((color) => (
                  <button
                    key={color.id}
                    type="button"
                    onClick={() => setNewCalendarNote((prev) => ({ ...prev, color: color.id }))}
                    className={`grid h-10 place-items-center rounded-2xl border bg-white/80 transition ${
                      newCalendarNote.color === color.id ? "ring-2 ring-black/10" : ""
                    }`}
                    style={{ borderColor: newCalendarNote.color === color.id ? color.dot : "rgba(0,0,0,0.06)" }}
                    title={color.label}
                  >
                    <span className="h-4 w-4 rounded-full" style={{ background: color.dot }} />
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-[0.8fr_1.2fr] gap-3">
              <input
                value={newCalendarNote.link_label || ""}
                onChange={(e) => setNewCalendarNote((prev) => ({ ...prev, link_label: e.target.value }))}
                placeholder="Button label"
                className="field-input"
              />
              <input
                value={newCalendarNote.link_url || ""}
                onChange={(e) => setNewCalendarNote((prev) => ({ ...prev, link_url: e.target.value }))}
                placeholder="https://link-access"
                className="field-input"
              />
            </div>

            <button
              onClick={handleAddCalendarNote}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-neutral-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800 active:scale-[0.985]"
            >
              <Plus size={17} />
              Add Note / Link
            </button>
          </div>

          <div className="mt-5 space-y-3">
            {notes.length === 0 ? (
              <p className="rounded-2xl bg-neutral-100 p-4 text-sm text-neutral-500">
                No notes for this date.
              </p>
            ) : (
              notes.map((note) => {
                const color = getTrackColor(note.color || "blue");

                return (
                  <div
                    key={note.id}
                    className="relative overflow-hidden rounded-2xl border bg-white/85 p-4 shadow-sm"
                    style={{ borderColor: color.border }}
                  >
                    <span className="absolute left-0 top-0 h-full w-1.5" style={{ background: color.dot }} />
                    <div className="flex items-start justify-between gap-3 pl-2">
                      <div className="min-w-0">
                        <div className="mb-2 inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold" style={{ background: color.soft, color: color.text }}>
                          <span className="h-2 w-2 rounded-full" style={{ background: color.dot }} />
                          {color.label}
                        </div>
                        <h4 className="font-semibold tracking-[-0.03em]">{note.title}</h4>
                        <p className="mt-1 text-sm leading-5 text-neutral-500">{note.note}</p>
                        {note.link_url && (
                          <a
                            href={note.link_url}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-3 inline-flex rounded-full bg-neutral-950 px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-800"
                          >
                            {note.link_label || "Open Link"}
                          </a>
                        )}
                      </div>
                      {calendarManage && (
                        <button
                          onClick={() => handleDeleteCalendarNote(note.id)}
                          className="rounded-full bg-red-50 p-2 text-red-500 transition hover:bg-red-100"
                          title="Delete calendar note"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function renderInlineSegments(text) {
  return String(text || "")
    .split(/(\*\*[^*]+\*\*)/g)
    .map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={index}>{part.slice(2, -2)}</strong>;
      }

      return <span key={index}>{part}</span>;
    });
}

function normalizeBoardNotes(notes) {
  return notes.map((note, index) => ({
    id: note.id || makeId(),
    title: note.title || "Untitled Note",
    category: note.category || "Team Note",
    content: note.content || note.note || "",
    linkLabel: note.linkLabel || "Open Link",
    linkUrl: note.linkUrl || "",
    x: Number.isFinite(Number(note.x)) ? Number(note.x) : 30 + (index % 3) * 310,
    y: Number.isFinite(Number(note.y)) ? Number(note.y) : 40 + Math.floor(index / 3) * 240,
    color: note.color || ["blue", "orange", "green"][index % 3],
    pinned: Boolean(note.pinned),
    priceRows: Array.isArray(note.priceRows) ? note.priceRows : [],
  }));
}


function CanvasNotesPanel({ notes }) {
  const [activeScope, setActiveScope] = useState("personal");
  const [noteList, setNoteList] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [dragState, setDragState] = useState(null);

  const [composerOpen, setComposerOpen] = useState(false);
  const [composerMode, setComposerMode] = useState("create");
  const [noteLoading, setNoteLoading] = useState(false);
  const [noteError, setNoteError] = useState("");

  const [draft, setDraft] = useState({
    id: null,
    title: "",
    note: "",
    link_label: "",
    link_url: "",
    color: "blue",
    type: "note",
    font_style: "clean",
  });

  const isPersonal = activeScope === "personal";

  const activeScopeInfo =
    NOTE_SCOPE_OPTIONS.find((item) => item.id === activeScope) ||
    NOTE_SCOPE_OPTIONS[0];

  const normalizeCanvasNote = (note, index = 0) => ({
    id: note.id || makeId(),
    scope: note.scope || activeScope,
    title: note.title || "New Note",
    note: note.note || note.content || "",
    link_label: note.link_label || note.linkLabel || "Open Link",
    link_url: note.link_url || note.linkUrl || "",
    color: note.color || ["blue", "orange", "green", "purple"][index % 4],
    type: note.type || note.note_type || "note",
    font_style: note.font_style || "clean",
    sort_order: Number.isFinite(Number(note.sort_order)) ? Number(note.sort_order) : index + 1,
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
    is_pinned: Boolean(note.is_pinned || note.pinned),
    created_at: note.created_at || new Date().toISOString(),
    updated_at: note.updated_at || new Date().toISOString(),
  });

  const sortNotes = (items) =>
    [...(items || [])].sort((a, b) => {
      if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
      return new Date(b.updated_at || b.created_at || 0).getTime() -
        new Date(a.updated_at || a.created_at || 0).getTime();
    });

  const defaultPersonalNotes = () =>
    normalizeBoardNotes(notes || []).map((note, index) =>
      normalizeCanvasNote(
        {
          ...note,
          scope: "personal",
          title: note.title || "Personal Note",
          note: note.content || note.note || "Write your private note here.",
          color: note.color || ["blue", "orange", "green"][index % 3],
          type: note.type || "note",
          font_style: note.font_style || "clean",
          position_x: note.x,
          position_y: note.y,
        },
        index
      )
    );

  const savePersonalNotes = (items) => {
    const normalized = sortNotes(items.map((item, index) => normalizeCanvasNote(item, index)));
    setNoteList(normalized);
    window.localStorage.setItem(PERSONAL_NOTE_KEY, JSON.stringify(normalized));
  };

  const loadPersonalNotes = () => {
    try {
      const saved = window.localStorage.getItem(PERSONAL_NOTE_KEY);

      if (saved) {
        const parsed = JSON.parse(saved);

        if (Array.isArray(parsed)) {
          const normalized = sortNotes(
            parsed.map((item, index) => normalizeCanvasNote({ ...item, scope: "personal" }, index))
          );

          setNoteList(normalized);
          setActiveId(normalized[0]?.id || null);
          return;
        }
      }
    } catch (error) {
      console.error("Load personal notes error:", error);
    }

    const defaults = defaultPersonalNotes();
    setNoteList(defaults);
    setActiveId(defaults[0]?.id || null);
  };

  const loadSharedNotes = async (scope = activeScope) => {
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

    const normalized = sortNotes((data || []).map((item, index) => normalizeCanvasNote(item, index)));
    setNoteList(normalized);
    setActiveId((current) =>
      normalized.some((item) => item.id === current)
        ? current
        : normalized[0]?.id || null
    );
  };

  useEffect(() => {
    if (isPersonal) {
      loadPersonalNotes();
      return undefined;
    }

    loadSharedNotes(activeScope);

    const channel = supabase
      .channel(`adf-canvas-notes-${activeScope}`)
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

  const activeNote =
    noteList.find((note) => note.id === activeId) || noteList[0] || null;

  const persistPosition = async (noteId, x, y) => {
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
  };

  useEffect(() => {
    if (!dragState) return undefined;

    let latest = {
      x: dragState.originX,
      y: dragState.originY,
    };

    const handleMove = (event) => {
      const x = Math.max(
        0,
        Math.round(dragState.originX + event.clientX - dragState.startX)
      );

      const y = Math.max(
        0,
        Math.round(dragState.originY + event.clientY - dragState.startY)
      );

      latest = { x, y };

      setNoteList((prev) =>
        prev.map((note) =>
          note.id === dragState.id
            ? { ...note, position_x: x, position_y: y }
            : note
        )
      );
    };

    const handleUp = () => {
      persistPosition(dragState.id, latest.x, latest.y);
      setDragState(null);
    };

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);

    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };
  }, [dragState, noteList, isPersonal]);

  const openCreateComposer = () => {
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
      link_label: note.link_label || "",
      link_url: note.link_url || "",
      color: note.color || "blue",
      type: note.type || "note",
      font_style: note.font_style || "clean",
    });
    setComposerOpen(true);
  };


  const getDraftGuide = (type) => {
    const guides = {
      note: {
        label: "Memo",
        helper: "Tulisan bebas untuk catatan singkat. Cocok buat reminder, brief, atau update biasa.",
        placeholder: "Write memo...",
        title: "Memo Note",
        exampleNote: `Before sending any link, make sure design, price, period, and platform placement are correct.`,
      },
      link: {
        label: "Link",
        helper: "Isi note singkat + link label + URL. Setelah save, card akan punya tombol link.",
        placeholder: "Example:\nLP sudah live, cek banner & price placement.",
        title: "Reference Link",
        exampleNote: `LP sudah live, cek banner dan price placement sebelum dikirim.`,
        exampleLinkLabel: "Open Link",
        exampleLinkUrl: "https://example.com",
      },
      todo: {
        label: "Checklist",
        helper: "Satu baris = satu checklist item. Nanti tampil jadi checklist di card.",
        placeholder: "Cek harga\nCek periode promo\nUpload final asset\nKirim update ke group",
        title: "Checklist",
        exampleNote: `Cek harga\nCek periode promo\nUpload final asset\nKirim update ke group`,
      },
      price: {
        label: "Price",
        helper: "Satu baris = satu price row. Isi harga, promo, atau timeline price di textarea kiri.",
        placeholder: "P4X 4+128 — SRP 2.499K\nStart 15 July — SRP 2.599K\nDisc up to 25%",
        title: "Price Update",
        exampleNote: `P4X 4+128 — SRP 2.499K\nP4 Lite 4+64 — SRP 1.999K\nDisc up to 25%\nPeriod 7 - 13 July`,
      },
      compare: {
        label: "Compare",
        helper: "Satu baris = satu poin compare. Nanti tampil compact 2 kolom di card.",
        placeholder: "Before: Banner lama terlalu rame\nAfter: Clean white layout\nBefore: Harga belum coret\nAfter: Harga coret + promo",
        title: "Compare Revision",
        exampleNote: `Before: KV lama terlalu rame\nAfter: Clean white layout\nBefore: Harga belum coret\nAfter: Harga coret + promo`,
      },
      board: {
        label: "Board",
        helper: "Satu baris = satu chip/task. Cocok buat mini board status atau ide cepat.",
        placeholder: "To Do: Update LP\nDoing: Check price\nDone: Send preview",
        title: "Mini Board",
        exampleNote: `To Do: Update LP\nDoing: Check price\nDone: Send preview`,
      },
    };

    return guides[type] || guides.note;
  };

  const draftGuide = getDraftGuide(draft.type);

  const applyDraftType = (type) => {
    const guide = getDraftGuide(type);

    setDraft((prev) => ({
      ...prev,
      type,
      title: prev.title ? prev.title : guide.title,
      note: prev.note ? prev.note : guide.exampleNote,
      link_label:
        type === "link" && !prev.link_label
          ? guide.exampleLinkLabel || "Open Link"
          : prev.link_label,
      link_url:
        type === "link" && !prev.link_url
          ? guide.exampleLinkUrl || ""
          : prev.link_url,
    }));
  };

  const fillDraftExample = () => {
    const guide = getDraftGuide(draft.type);

    setDraft((prev) => ({
      ...prev,
      title: prev.title || guide.title,
      note: guide.exampleNote,
      link_label:
        draft.type === "link"
          ? prev.link_label || guide.exampleLinkLabel || "Open Link"
          : prev.link_label,
      link_url:
        draft.type === "link"
          ? prev.link_url || guide.exampleLinkUrl || ""
          : prev.link_url,
    }));
  };

  const clearDraftContent = () => {
    setDraft((prev) => ({
      ...prev,
      note: "",
      link_label: prev.type === "link" ? "" : prev.link_label,
      link_url: prev.type === "link" ? "" : prev.link_url,
    }));
  };

  const saveDraft = async () => {
    const cleanTitle = String(draft.title || "").trim();
    const cleanNote = String(draft.note || "").trim();

    if (!cleanTitle && !cleanNote) {
      setNoteError("Isi title atau note dulu.");
      return;
    }

    setNoteError("");

    if (composerMode === "edit" && draft.id) {
      const patch = {
        title: cleanTitle || "Untitled Note",
        note: cleanNote,
        link_label: String(draft.link_label || "").trim(),
        link_url: String(draft.link_url || "").trim(),
        color: draft.color || "blue",
        type: draft.type || "note",
        font_style: draft.font_style || "clean",
        updated_at: new Date().toISOString(),
      };

      if (isPersonal) {
        savePersonalNotes(noteList.map((note) => (note.id === draft.id ? { ...note, ...patch } : note)));
        setComposerOpen(false);
        return;
      }

      setNoteLoading(true);

      const { data, error } = await supabase
        .from(SHARED_NOTE_TABLE)
        .update(patch)
        .eq("id", draft.id)
        .select("*")
        .single();

      setNoteLoading(false);

      if (error) {
        setNoteError(`Update note gagal: ${error.message}`);
        return;
      }

      setNoteList((prev) =>
        sortNotes(prev.map((note) => (note.id === data.id ? normalizeCanvasNote(data) : note)))
      );
      setComposerOpen(false);
      return;
    }

    const nextNote = normalizeCanvasNote(
      {
        id: makeId(),
        scope: activeScope,
        title: cleanTitle || "Untitled Note",
        note: cleanNote,
        link_label: String(draft.link_label || "").trim(),
        link_url: String(draft.link_url || "").trim(),
        color: draft.color || "blue",
        type: draft.type || "note",
        font_style: draft.font_style || "clean",
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
      })
      .select("*")
      .single();

    setNoteLoading(false);

    if (error) {
      setNoteError(`Create note gagal: ${error.message}`);
      return;
    }

    const normalized = normalizeCanvasNote(data);
    setNoteList((prev) => sortNotes([normalized, ...prev]));
    setActiveId(normalized.id);
    setComposerOpen(false);
  };

  const deleteNote = async (note) => {
    if (!note) return;

    if (isPersonal) {
      const next = noteList.filter((item) => item.id !== note.id);
      savePersonalNotes(next);
      setActiveId(next[0]?.id || null);
      return;
    }

    setNoteLoading(true);

    const { error } = await supabase
      .from(SHARED_NOTE_TABLE)
      .delete()
      .eq("id", note.id);

    setNoteLoading(false);

    if (error) {
      setNoteError(`Delete note gagal: ${error.message}`);
      return;
    }

    setNoteList((prev) => prev.filter((item) => item.id !== note.id));
  };

  const togglePinned = async (note) => {
    if (!note) return;

    const patch = {
      is_pinned: !note.is_pinned,
      updated_at: new Date().toISOString(),
    };

    if (isPersonal) {
      savePersonalNotes(
        noteList.map((item) => (item.id === note.id ? { ...item, ...patch } : item))
      );
      return;
    }

    const { error } = await supabase
      .from(SHARED_NOTE_TABLE)
      .update(patch)
      .eq("id", note.id);

    if (error) {
      setNoteError(`Pin note gagal: ${error.message}`);
      return;
    }

    setNoteList((prev) =>
      sortNotes(prev.map((item) => (item.id === note.id ? { ...item, ...patch } : item)))
    );
  };

  const renderNoteBody = (note) => {
    const type = note.type || "note";
    const lines = String(note.note || "")
      .split("\\n")
      .map((line) => line.trim())
      .filter(Boolean);

    if (type === "todo") {
      const items = lines.length ? lines : ["Checklist item"];

      return (
        <div className="mt-4 space-y-2">
          {items.slice(0, 6).map((item, index) => (
            <div key={`${note.id}-todo-${index}`} className="flex items-center gap-2 text-sm text-neutral-600">
              <span className="grid h-4 w-4 shrink-0 place-items-center rounded border border-black/15 bg-white" />
              <span className="line-clamp-1">{item}</span>
            </div>
          ))}
        </div>
      );
    }

    if (type === "price") {
      const items = lines.length ? lines : ["Price / promo note"];

      return (
        <div className="mt-4 grid gap-2">
          {items.slice(0, 4).map((item, index) => (
            <div key={`${note.id}-price-${index}`} className="rounded-[14px] bg-neutral-50 px-3 py-2 text-sm font-semibold text-neutral-700">
              {item}
            </div>
          ))}
        </div>
      );
    }

    if (type === "compare") {
      const items = lines.length ? lines : ["Before vs After"];

      return (
        <div className="mt-4 grid grid-cols-2 gap-2">
          {items.slice(0, 4).map((item, index) => (
            <div key={`${note.id}-compare-${index}`} className="rounded-[14px] border border-black/5 bg-white px-3 py-2 text-xs font-semibold text-neutral-600">
              {item}
            </div>
          ))}
        </div>
      );
    }

    if (type === "board") {
      const items = lines.length ? lines : ["Board item"];

      return (
        <div className="mt-4 flex flex-wrap gap-2">
          {items.slice(0, 7).map((item, index) => (
            <span key={`${note.id}-board-${index}`} className="rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-semibold text-neutral-600">
              {item}
            </span>
          ))}
        </div>
      );
    }

    return (
      <p className="mt-4 line-clamp-5 whitespace-pre-line text-sm leading-6 text-neutral-600">
        {renderInlineSegments(note.note || "Write something useful here.")}
      </p>
    );
  };

  const sortedNotes = sortNotes(noteList);

  return (
    <section className="pb-8">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-neutral-400">
            Notes
          </p>
          <h2 className="mt-1 text-[34px] font-semibold leading-none tracking-[-0.06em]">
            Canvas Board
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-500">
            Drag notes freely like a lightweight Milanote board. Shared scopes sync online,
            Personal stays private in this browser.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {NOTE_SCOPE_OPTIONS.map((scope) => (
            <button
              key={scope.id}
              onClick={() => setActiveScope(scope.id)}
              className={`rounded-full px-4 py-2 text-xs font-semibold shadow-sm transition ${
                activeScope === scope.id
                  ? "bg-neutral-950 text-white"
                  : "bg-white/80 text-neutral-500 hover:text-neutral-950"
              }`}
            >
              {scope.label}
            </button>
          ))}

          <button
            onClick={openCreateComposer}
            className="inline-flex items-center gap-2 rounded-full bg-neutral-950 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-neutral-800 active:scale-[0.985]"
          >
            <Plus size={15} />
            New Note
          </button>
        </div>
      </div>

      {noteError ? (
        <div className="mb-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          {noteError}
        </div>
      ) : null}

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
                <div
                  key={note.id}
                  onClick={() => setActiveId(note.id)}
                  className={`absolute overflow-hidden rounded-[26px] border bg-white shadow-[0_20px_55px_rgba(0,0,0,0.10)] transition ${
                    isActive ? "ring-2 ring-neutral-950/15" : "hover:-translate-y-0.5"
                  }`}
                  style={{
                    left: note.position_x,
                    top: note.position_y,
                    width: note.card_width || 340,
                    minHeight: note.card_height || 220,
                    borderColor: color.border,
                  }}
                >
                  <div
                    className="h-3 w-full"
                    style={{
                      background: `linear-gradient(90deg, ${color.dot}, rgba(255,255,255,0.65))`,
                    }}
                  />

                  <div className="p-4">
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <button
                        type="button"
                        className="flex cursor-grab items-center gap-2 rounded-[14px] bg-neutral-50 px-2.5 py-2 text-neutral-400 active:cursor-grabbing"
                        onPointerDown={(event) => {
                          event.preventDefault();
                          setActiveId(note.id);
                          setDragState({
                            id: note.id,
                            startX: event.clientX,
                            startY: event.clientY,
                            originX: note.position_x || 0,
                            originY: note.position_y || 0,
                          });
                        }}
                        title="Drag note"
                      >
                        <GripVertical size={16} />
                        <TypeIcon size={16} />
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            togglePinned(note);
                          }}
                          className={`grid h-8 w-8 place-items-center rounded-full transition ${
                            note.is_pinned
                              ? "bg-neutral-950 text-white"
                              : "bg-neutral-50 text-neutral-400 hover:text-neutral-950"
                          }`}
                          title="Pin note"
                        >
                          <Pin size={14} />
                        </button>

                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            openEditComposer(note);
                          }}
                          className="rounded-full bg-neutral-50 px-3 py-2 text-xs font-semibold text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-950"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            deleteNote(note);
                          }}
                          className="grid h-8 w-8 place-items-center rounded-full bg-red-50 text-red-500 transition hover:bg-red-100"
                          title="Delete note"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <span
                        className="rounded-full px-3 py-1 text-[11px] font-semibold"
                        style={{
                          background: color.soft,
                          color: color.text,
                        }}
                      >
                        {type.label}
                      </span>

                      {note.is_pinned ? (
                        <span className="rounded-full bg-neutral-100 px-3 py-1 text-[11px] font-semibold text-neutral-500">
                          pinned
                        </span>
                      ) : null}
                    </div>

                    <h3 className={`text-[22px] leading-[1.02] text-neutral-950 ${font.titleClass}`}>
                      {note.title || "Untitled Note"}
                    </h3>

                    {renderNoteBody(note)}

                    {note.link_url ? (
                      <a
                        href={note.link_url}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(event) => event.stopPropagation()}
                        className="mt-4 inline-flex items-center gap-2 rounded-full bg-neutral-950 px-4 py-2 text-xs font-semibold text-white transition hover:bg-neutral-800"
                      >
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
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-neutral-400">
            Inspector
          </p>

          {activeNote ? (
            <>
              <h3 className="mt-2 text-[28px] font-semibold leading-[0.96] tracking-[-0.06em]">
                {activeNote.title || "Untitled Note"}
              </h3>

              <p className="mt-3 text-sm leading-6 text-neutral-500">
                {activeNote.note || "No content yet."}
              </p>

              <div className="mt-5 grid gap-2 text-xs text-neutral-500">
                <div className="flex items-center justify-between rounded-[16px] bg-neutral-50 px-3 py-2">
                  <span>Type</span>
                  <span className="font-semibold text-neutral-800">
                    {getNoteType(activeNote.type).label}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-[16px] bg-neutral-50 px-3 py-2">
                  <span>Scope</span>
                  <span className="font-semibold text-neutral-800">
                    {activeScopeInfo.label}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-[16px] bg-neutral-50 px-3 py-2">
                  <span>Updated</span>
                  <span className="font-semibold text-neutral-800">
                    {formatDateTime(activeNote.updated_at)}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => openEditComposer(activeNote)}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-[20px] bg-neutral-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
              >
                <Save size={17} />
                Edit Selected
              </button>
            </>
          ) : (
            <div className="mt-5 rounded-[24px] border border-dashed border-black/10 bg-neutral-50 p-8 text-center">
              <StickyNote className="mx-auto text-neutral-300" size={32} />
              <p className="mt-3 text-sm font-semibold text-neutral-600">
                Select note
              </p>
              <p className="mt-1 text-xs text-neutral-400">
                Click a card on canvas to inspect.
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={openCreateComposer}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-[20px] bg-white px-4 py-3 text-sm font-semibold text-neutral-700 shadow-sm transition hover:bg-neutral-100"
          >
            <Plus size={17} />
            Create Note
          </button>
        </aside>
      </div>

      {composerOpen &&
        createPortal(
          <div className="fixed inset-0 z-[999999] grid place-items-center bg-black/35 px-5 py-8 backdrop-blur-sm">
            <div className="w-full max-w-2xl rounded-[34px] border border-white/70 bg-[#f5f5f3] p-5 shadow-[0_35px_120px_rgba(0,0,0,0.28)]">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-neutral-400">
                    {composerMode === "edit" ? "Edit Note" : "New Note"}
                  </p>

                  <h3 className="mt-2 text-3xl font-semibold tracking-[-0.07em] text-neutral-950">
                    {composerMode === "edit" ? "Update canvas card." : "Create canvas card."}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => setComposerOpen(false)}
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white text-neutral-500 shadow-sm transition hover:bg-neutral-100 hover:text-neutral-950"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-[1fr_.82fr]">
                <div className="space-y-3">
                  <input
                    value={draft.title}
                    onChange={(event) => setDraft((prev) => ({ ...prev, title: event.target.value }))}
                    placeholder="Note title"
                    className="w-full rounded-[22px] border border-black/5 bg-white px-4 py-4 text-sm font-semibold outline-none"
                  />

                  <div className="rounded-[22px] border border-black/5 bg-white/70 px-4 py-3">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-neutral-400">
                          {draftGuide.label} Input
                        </p>
                        <p className="mt-1 text-xs leading-5 text-neutral-500">
                          {draftGuide.helper}
                        </p>
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        <button
                          type="button"
                          onClick={fillDraftExample}
                          className="rounded-full bg-neutral-950 px-3 py-2 text-[11px] font-semibold text-white transition hover:bg-neutral-800"
                        >
                          Use Example
                        </button>

                        <button
                          type="button"
                          onClick={clearDraftContent}
                          className="rounded-full bg-white px-3 py-2 text-[11px] font-semibold text-neutral-500 transition hover:text-neutral-950"
                        >
                          Clear
                        </button>
                      </div>
                    </div>
                  </div>

                  <textarea
                    value={draft.note}
                    onChange={(event) => setDraft((prev) => ({ ...prev, note: event.target.value }))}
                    placeholder={draftGuide.placeholder}
                    className="h-[210px] w-full resize-none rounded-[22px] border border-black/5 bg-white px-4 py-4 text-sm leading-6 outline-none"
                  />

                  <div
                    className={`grid grid-cols-2 gap-3 rounded-[22px] ${
                      draft.type === "link"
                        ? "border border-black/5 bg-white/70 p-2"
                        : ""
                    }`}
                  >
                    <input
                      value={draft.link_label}
                      onChange={(event) => setDraft((prev) => ({ ...prev, link_label: event.target.value }))}
                      placeholder="Link label optional"
                      className="w-full rounded-[20px] border border-black/5 bg-white px-4 py-3 text-sm font-semibold outline-none"
                    />

                    <input
                      value={draft.link_url}
                      onChange={(event) => setDraft((prev) => ({ ...prev, link_url: event.target.value }))}
                      placeholder="Link URL optional"
                      className="w-full rounded-[20px] border border-black/5 bg-white px-4 py-3 text-sm font-semibold outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-4 rounded-[26px] bg-white/70 p-4">
                  <div>
                    <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-neutral-400">
                      Type
                    </p>

                    <div className="grid grid-cols-2 gap-2">
                      {NOTE_TYPE_OPTIONS.map((item) => {
                        const Icon = item.icon;
                        const isActive = draft.type === item.id;

                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => applyDraftType(item.id)}
                            className={`flex items-center justify-center gap-2 rounded-[17px] px-3 py-3 text-xs font-semibold transition ${
                              isActive
                                ? "bg-neutral-950 text-white"
                                : "bg-white text-neutral-500 hover:text-neutral-950"
                            }`}
                          >
                            <Icon size={15} />
                            {item.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-neutral-400">
                      Style
                    </p>

                    <div className="grid grid-cols-2 gap-2">
                      {NOTE_FONT_OPTIONS.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setDraft((prev) => ({ ...prev, font_style: item.id }))}
                          className={`rounded-[17px] px-3 py-3 text-xs font-semibold transition ${
                            draft.font_style === item.id
                              ? "bg-neutral-950 text-white"
                              : "bg-white text-neutral-500 hover:text-neutral-950"
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-neutral-400">
                      Color
                    </p>

                    <div className="grid grid-cols-6 gap-2">
                      {TRACK_COLORS.map((color) => (
                        <button
                          key={color.id}
                          type="button"
                          onClick={() => setDraft((prev) => ({ ...prev, color: color.id }))}
                          className={`grid h-10 place-items-center rounded-[14px] border bg-white transition ${
                            draft.color === color.id
                              ? "border-neutral-950"
                              : "border-black/5"
                          }`}
                          title={color.label}
                        >
                          <span className="h-4 w-4 rounded-full" style={{ background: color.dot }} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={saveDraft}
                    disabled={noteLoading}
                    className="flex w-full items-center justify-center gap-2 rounded-[20px] bg-neutral-950 px-4 py-4 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:opacity-60"
                  >
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


function NotesPanel({ notes }) {
  const [activeScope, setActiveScope] = useState("adf");
  const [noteList, setNoteList] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [draft, setDraft] = useState({
    title: "",
    note: "",
    link_label: "",
    link_url: "",
    color: "blue",
    type: "note",
    font_style: "clean",
  });
  const [noteLoading, setNoteLoading] = useState(false);
  const [noteError, setNoteError] = useState("");
  const [draggedNoteId, setDraggedNoteId] = useState(null);

  const isPersonal = activeScope === "personal";
  const activeScopeInfo = NOTE_SCOPE_OPTIONS.find((item) => item.id === activeScope) || NOTE_SCOPE_OPTIONS[0];

  const normalizeNoteShape = (note, index = 0) => ({
    id: note.id || makeId(),
    scope: note.scope || activeScope,
    title: note.title || "New Note",
    note: note.note || note.content || "",
    link_label: note.link_label || note.linkLabel || "Open Link",
    link_url: note.link_url || note.linkUrl || "",
    color: note.color || "blue",
    type: note.type || "note",
    font_style: note.font_style || "clean",
    sort_order: Number.isFinite(Number(note.sort_order)) ? Number(note.sort_order) : index + 1,
    created_at: note.created_at || new Date().toISOString(),
    updated_at: note.updated_at || new Date().toISOString(),
  });

  const sortNotes = (items) =>
    [...(items || [])].sort((a, b) => {
      const aOrder = Number.isFinite(Number(a.sort_order)) ? Number(a.sort_order) : 999999;
      const bOrder = Number.isFinite(Number(b.sort_order)) ? Number(b.sort_order) : 999999;
      if (aOrder !== bOrder) return aOrder - bOrder;
      return new Date(b.updated_at || b.created_at || 0).getTime() - new Date(a.updated_at || a.created_at || 0).getTime();
    });

  const defaultPersonalNotes = () =>
    normalizeBoardNotes(notes).map((item, index) =>
      normalizeNoteShape(
        {
          ...item,
          scope: "personal",
          title: item.title || "Personal Note",
          note: item.content || item.note || "Write your private note here.",
          color: item.color || "blue",
          type: item.type || "note",
          font_style: item.font_style || "clean",
          sort_order: index + 1,
        },
        index
      )
    );

  const loadPersonalNotes = () => {
    try {
      const saved = window.localStorage.getItem(PERSONAL_NOTE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const normalized = sortNotes(parsed.map((item, index) => normalizeNoteShape({ ...item, scope: "personal" }, index)));
          setNoteList(normalized);
          setActiveId(normalized[0]?.id || null);
          return;
        }
      }
    } catch (error) {
      console.error("Load personal notes error:", error);
    }

    const defaults = defaultPersonalNotes();
    setNoteList(defaults);
    setActiveId(defaults[0]?.id || null);
  };

  const savePersonalNotes = (next) => {
    const normalized = sortNotes(next.map((item, index) => normalizeNoteShape(item, index)));
    setNoteList(normalized);
    window.localStorage.setItem(PERSONAL_NOTE_KEY, JSON.stringify(normalized));
  };

  const loadSharedNotes = async (scope = activeScope) => {
    setNoteLoading(true);
    setNoteError("");

    const { data, error } = await supabase
      .from(SHARED_NOTE_TABLE)
      .select("*")
      .eq("scope", scope)
      .order("sort_order", { ascending: true })
      .order("updated_at", { ascending: false })
      .order("created_at", { ascending: false });

    setNoteLoading(false);

    if (error) {
      setNoteList([]);
      setActiveId(null);
      setNoteError(`Load notes gagal: ${error.message}. Run SQL team_notes terbaru dulu.`);
      return;
    }

    const normalized = sortNotes((data || []).map((item, index) => normalizeNoteShape(item, index)));
    setNoteList(normalized);
    setActiveId((current) => (normalized.some((item) => item.id === current) ? current : normalized[0]?.id || null));
  };

  useEffect(() => {
    if (isPersonal) {
      loadPersonalNotes();
      return undefined;
    }

    loadSharedNotes(activeScope);

    const channel = supabase
      .channel(`adf-notes-${activeScope}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: SHARED_NOTE_TABLE, filter: `scope=eq.${activeScope}` },
        () => loadSharedNotes(activeScope)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeScope]);

  const activeNote = noteList.find((note) => note.id === activeId) || noteList[0] || null;

  const resetDraft = () => {
    setDraft({
      title: "",
      note: "",
      link_label: "",
      link_url: "",
      color: activeNote?.color || "blue",
      type: activeNote?.type || "note",
      font_style: activeNote?.font_style || "clean",
    });
  };

  const addNote = async () => {
    const now = new Date().toISOString();
    const payload = {
      id: isPersonal ? makeId() : undefined,
      scope: activeScope,
      title: draft.title.trim() || "New Note",
      note: draft.note.trim() || "Write note here...",
      link_label: draft.link_label.trim() || "Open Link",
      link_url: draft.link_url.trim() || null,
      color: draft.color || "blue",
      type: draft.type || "note",
      font_style: draft.font_style || "clean",
      sort_order: 1,
      created_at: now,
      updated_at: now,
    };

    const shifted = noteList.map((item, index) => ({ ...item, sort_order: index + 2 }));

    if (isPersonal) {
      const next = [payload, ...shifted];
      savePersonalNotes(next);
      setActiveId(payload.id);
      resetDraft();
      return;
    }

    setNoteError("");
    const { data, error } = await supabase
      .from(SHARED_NOTE_TABLE)
      .insert(payload)
      .select("*")
      .single();

    if (error) {
      setNoteError(`Add note gagal: ${error.message}`);
      return;
    }

    for (const item of shifted) {
      await supabase
        .from(SHARED_NOTE_TABLE)
        .update({ sort_order: item.sort_order, updated_at: new Date().toISOString() })
        .eq("id", item.id);
    }

    setNoteList([normalizeNoteShape(data), ...shifted]);
    setActiveId(data.id);
    resetDraft();
  };

  const updateActiveNote = async (patch) => {
    if (!activeNote) return;

    const nextNote = { ...activeNote, ...patch, updated_at: new Date().toISOString() };
    const nextList = noteList.map((note) => (note.id === activeNote.id ? nextNote : note));
    setNoteList(nextList);

    if (isPersonal) {
      window.localStorage.setItem(PERSONAL_NOTE_KEY, JSON.stringify(nextList));
      return;
    }

    const allowedPatch = Object.fromEntries(
      Object.entries({ ...patch, updated_at: new Date().toISOString() }).filter(([key]) =>
        ["title", "note", "link_label", "link_url", "color", "type", "font_style", "sort_order", "updated_at"].includes(key)
      )
    );

    const { error } = await supabase
      .from(SHARED_NOTE_TABLE)
      .update(allowedPatch)
      .eq("id", activeNote.id);

    if (error) setNoteError(`Update note gagal: ${error.message}`);
  };

  const deleteActiveNote = async () => {
    if (!activeNote) return;

    const nextList = noteList.filter((note) => note.id !== activeNote.id).map((note, index) => ({ ...note, sort_order: index + 1 }));
    setNoteList(nextList);
    setActiveId(nextList[0]?.id || null);

    if (isPersonal) {
      window.localStorage.setItem(PERSONAL_NOTE_KEY, JSON.stringify(nextList));
      return;
    }

    const { error } = await supabase.from(SHARED_NOTE_TABLE).delete().eq("id", activeNote.id);
    if (error) setNoteError(`Delete note gagal: ${error.message}`);

    for (const item of nextList) {
      await supabase
        .from(SHARED_NOTE_TABLE)
        .update({ sort_order: item.sort_order, updated_at: new Date().toISOString() })
        .eq("id", item.id);
    }
  };

  const handleNoteDrop = async (targetId) => {
    if (!draggedNoteId || draggedNoteId === targetId) return;

    const fromIndex = noteList.findIndex((item) => item.id === draggedNoteId);
    const toIndex = noteList.findIndex((item) => item.id === targetId);
    if (fromIndex < 0 || toIndex < 0) return;

    const reordered = moveItem(noteList, fromIndex, toIndex).map((item, index) => ({
      ...item,
      sort_order: index + 1,
      updated_at: new Date().toISOString(),
    }));

    setNoteList(reordered);
    setDraggedNoteId(null);

    if (isPersonal) {
      window.localStorage.setItem(PERSONAL_NOTE_KEY, JSON.stringify(reordered));
      return;
    }

    for (const item of reordered) {
      await supabase
        .from(SHARED_NOTE_TABLE)
        .update({ sort_order: item.sort_order, updated_at: item.updated_at })
        .eq("id", item.id);
    }
  };

  const renderTypePicker = (value, onChange) => (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {NOTE_TYPE_OPTIONS.map((type) => {
        const Icon = type.icon;
        const active = value === type.id;
        return (
          <button
            key={type.id}
            type="button"
            onClick={() => onChange(type.id)}
            className={`flex flex-col items-center gap-1 rounded-2xl border px-2 py-3 text-[11px] font-semibold transition ${
              active ? "border-neutral-950 bg-neutral-950 text-white" : "border-black/5 bg-white text-neutral-500 hover:text-neutral-950"
            }`}
          >
            <Icon size={16} />
            {type.label}
          </button>
        );
      })}
    </div>
  );

  const renderFontPicker = (value, onChange) => (
    <div className="grid grid-cols-4 gap-2">
      {NOTE_FONT_OPTIONS.map((font) => (
        <button
          key={font.id}
          type="button"
          onClick={() => onChange(font.id)}
          className={`rounded-2xl border px-2 py-3 text-[11px] font-semibold transition ${
            value === font.id ? "border-neutral-950 bg-neutral-950 text-white" : "border-black/5 bg-white text-neutral-500 hover:text-neutral-950"
          }`}
        >
          {font.label}
        </button>
      ))}
    </div>
  );

  const renderColorPicker = (value, onChange) => {
    const color = getTrackColor(value || "blue");
    return (
      <div className="rounded-[24px] border border-black/5 bg-white/70 p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">Color Pointer</p>
          <span className="rounded-full px-3 py-1 text-xs font-semibold" style={{ background: color.soft, color: color.text }}>
            {color.label}
          </span>
        </div>
        <div className="grid grid-cols-6 gap-2">
          {TRACK_COLORS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className={`grid h-12 place-items-center rounded-2xl border transition ${
                value === item.id ? "border-neutral-950 bg-white shadow-sm" : "border-black/5 bg-neutral-50 hover:bg-white"
              }`}
              title={item.label}
            >
              <span className="h-5 w-5 rounded-full" style={{ background: item.dot }} />
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_420px]">
      <div>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-400">Notes</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-[-0.05em]">Team Notes Board</h2>
          </div>

          <div className="flex flex-wrap gap-2">
            {NOTE_SCOPE_OPTIONS.map((scope) => (
              <button
                key={scope.id}
                onClick={() => setActiveScope(scope.id)}
                className={`rounded-full px-4 py-2 text-xs font-semibold shadow-sm transition ${
                  activeScope === scope.id
                    ? "bg-neutral-950 text-white"
                    : "bg-white/80 text-neutral-500 hover:text-neutral-950"
                }`}
              >
                {scope.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4 rounded-[24px] border border-white/70 bg-white/70 p-4 text-sm leading-6 text-neutral-500 shadow-sm backdrop-blur-xl">
          {isPersonal
            ? "Personal notes are private to this browser and only visible on this device. They are not shared to ADF, realme, or AKASO pages."
            : `${activeScopeInfo.label} notes are shared online through Supabase, so everyone using System ADF can see updates in this page.`}
        </div>

        {noteError && (
          <div className="mb-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
            {noteError}
          </div>
        )}

        <div className="rounded-[30px] border border-white/70 bg-white/62 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.06)] backdrop-blur-xl">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-400">
                {activeScopeInfo.label}
              </p>
              <h3 className="mt-1 text-xl font-semibold tracking-[-0.04em]">
                {noteList.length} notes · drag cards to reorder
              </h3>
            </div>

            {noteLoading && <Loader2 size={18} className="animate-spin text-neutral-400" />}
          </div>

          {noteList.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-black/10 bg-neutral-50 p-10 text-center">
              <StickyNote className="mx-auto text-neutral-300" size={34} />
              <p className="mt-4 text-sm font-semibold text-neutral-600">No notes yet</p>
              <p className="mt-1 text-xs text-neutral-400">Create a note from the right panel.</p>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {noteList.map((note, index) => {
                const color = getTrackColor(note.color || "blue");
                const type = getNoteType(note.type || "note");
                const font = getNoteFont(note.font_style || "clean");
                const TypeIcon = type.icon;
                const isActive = activeNote?.id === note.id;

                return (
                  <button
                    key={note.id}
                    draggable
                    onDragStart={(event) => {
                      event.dataTransfer.effectAllowed = "move";
                      event.dataTransfer.setData("text/plain", note.id);
                      setDraggedNoteId(note.id);
                    }}
                    onDragEnd={() => setDraggedNoteId(null)}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={() => handleNoteDrop(note.id)}
                    onClick={() => setActiveId(note.id)}
                    className={`request-fade group relative overflow-hidden rounded-[26px] border p-1 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-[0_22px_60px_rgba(0,0,0,0.10)] ${
                      isActive ? "border-neutral-950" : "border-white/70"
                    } ${draggedNoteId === note.id ? "opacity-50" : ""}`}
                    style={{
                      animationDelay: `${index * 35}ms`,
                      borderColor: isActive ? "#111" : color.border,
                      background: `linear-gradient(135deg, ${color.soft}, rgba(255,255,255,0.9))`,
                    }}
                  >
                    <span className="absolute left-0 top-0 h-full w-1.5" style={{ background: color.dot }} />
                    <div className="mb-4 flex items-center justify-between gap-3 pl-2">
                      <span
                        className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold"
                        style={{ background: color.soft, color: color.text, border: `1px solid ${color.border}` }}
                      >
                        <TypeIcon size={12} />
                        {type.label}
                      </span>
                      <span className="cursor-grab rounded-full bg-neutral-100 px-2 py-1 text-[11px] text-neutral-400 group-active:cursor-grabbing">
                        drag
                      </span>
                    </div>
                    <h4 className={`line-clamp-2 text-lg leading-tight ${font.titleClass}`}>{note.title}</h4>
                    <p className="mt-3 line-clamp-4 text-sm leading-6 text-neutral-500">{note.note}</p>
                    {note.link_url && (
                      <p className="mt-3 inline-flex rounded-full bg-neutral-950 px-3 py-1 text-[11px] font-semibold text-white">
                        {note.link_label || "Open Link"}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <aside className="lg:sticky lg:top-0 lg:h-fit">
        <div className="rounded-[30px] border border-white/70 bg-white/68 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.06)] backdrop-blur-xl">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-400">Create Note</p>
          <h3 className="mt-1 text-2xl font-semibold tracking-[-0.05em]">
            {activeScopeInfo.label} Page
          </h3>
          <p className="mt-2 text-sm leading-6 text-neutral-500">
            {isPersonal
              ? "Only you can access and view Personal notes from this browser. They stay private and are not synced online."
              : "Shared notes are online and visible to the team in realtime."}
          </p>

          <div className="mt-5 space-y-3">
            {renderTypePicker(draft.type, (value) => setDraft((prev) => ({ ...prev, type: value })))}
            {renderFontPicker(draft.font_style, (value) => setDraft((prev) => ({ ...prev, font_style: value })))}
            {renderColorPicker(draft.color, (value) => setDraft((prev) => ({ ...prev, color: value })))}
            <input
              value={draft.title}
              onChange={(event) => setDraft((prev) => ({ ...prev, title: event.target.value }))}
              placeholder="Note title"
              className="field-input"
            />
            <textarea
              value={draft.note}
              onChange={(event) => setDraft((prev) => ({ ...prev, note: event.target.value }))}
              placeholder="Write note..."
              rows={5}
              className="field-input resize-none"
            />
            <input
              value={draft.link_label}
              onChange={(event) => setDraft((prev) => ({ ...prev, link_label: event.target.value }))}
              placeholder="Link label optional"
              className="field-input"
            />
            <input
              value={draft.link_url}
              onChange={(event) => setDraft((prev) => ({ ...prev, link_url: event.target.value }))}
              placeholder="Link URL optional"
              className="field-input"
            />
            <button
              onClick={addNote}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-neutral-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800 active:scale-[0.985]"
            >
              <Plus size={17} />
              Add Note
            </button>
          </div>
        </div>

        {activeNote && (
          <div className="mt-5 rounded-[30px] border border-white/70 bg-white/68 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.06)] backdrop-blur-xl">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-400">Edit Selected</p>
                <h3 className="mt-1 text-xl font-semibold tracking-[-0.04em]">Selected Note</h3>
              </div>
              <button
                onClick={deleteActiveNote}
                className="grid h-9 w-9 place-items-center rounded-full bg-red-50 text-red-600 hover:bg-red-100"
              >
                <Trash2 size={16} />
              </button>
            </div>

            <div className="space-y-3">
              {renderTypePicker(activeNote.type || "note", (value) => updateActiveNote({ type: value }))}
              {renderFontPicker(activeNote.font_style || "clean", (value) => updateActiveNote({ font_style: value }))}
              {renderColorPicker(activeNote.color || "blue", (value) => updateActiveNote({ color: value }))}
              <input
                value={activeNote.title || ""}
                onChange={(event) => updateActiveNote({ title: event.target.value })}
                className="field-input"
              />
              <textarea
                value={activeNote.note || ""}
                onChange={(event) => updateActiveNote({ note: event.target.value })}
                rows={6}
                className="field-input resize-none"
              />
              <input
                value={activeNote.link_label || ""}
                onChange={(event) => updateActiveNote({ link_label: event.target.value })}
                placeholder="Link label"
                className="field-input"
              />
              <input
                value={activeNote.link_url || ""}
                onChange={(event) => updateActiveNote({ link_url: event.target.value })}
                placeholder="Link URL"
                className="field-input"
              />

              {activeNote.link_url && (
                <a
                  href={activeNote.link_url}
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-2xl bg-neutral-950 px-5 py-3 text-center text-sm font-semibold text-white hover:bg-neutral-800"
                >
                  {activeNote.link_label || "Open Link"}
                </a>
              )}
            </div>
          </div>
        )}
      </aside>
    </section>
  );
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center gap-3 rounded-[24px] bg-white/75 p-8 text-sm text-neutral-500">
      <Loader2 size={18} className="animate-spin" />
      Loading Supabase data...
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-[24px] bg-white/75 p-8 text-center">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-neutral-100">
        <CheckCircle2 size={22} className="text-neutral-400" />
      </div>
      <h4 className="mt-4 text-lg font-semibold tracking-[-0.04em]">No request found</h4>
      <p className="mt-1 text-sm text-neutral-500">Create a new request and it will appear here permanently.</p>
    </div>
  );
}
