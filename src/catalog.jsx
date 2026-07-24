import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Folder,
  FolderOpen,
  Search,
  ShieldCheck,
  X,
  Plus,
  Trash2,
  Lock,
  Unlock,
  Pencil,
  Pin,
  UploadCloud,
  Image as ImageIcon,
  Save,
  Layers,
  Home,
  Loader2,
} from "lucide-react";
import { supabase } from "./supabaseClient";

/**
 * catalog.jsx
 * ADF System - Supabase Realtime Catalog Hub
 *
 * Update:
 * - Online/shared for all users through Supabase.
 * - Realtime listener for catalog, section, asset, and trash changes.
 * - Trash + Restore + Delete Permanent.
 * - Edit mode is still locked by ADF code and resets on refresh.
 */

const BACK_TO_POPUP_URL = "/popup";
const ADMIN_CODE = "adf";
const BUCKET_NAME = "request-attachments";
const MAX_COVER_SIZE_MB = 1;
const MAX_COVER_SIZE_BYTES = MAX_COVER_SIZE_MB * 1024 * 1024;
const DEFAULT_P4_COVER = "/brand/popup1.png";

const P4_TEMPLATE_SECTIONS = [
  {
    id: "new-update",
    title: "NEW UPDATE",
    subtitle: "Latest priority asset update",
    cover: "",
    items: [
      {
        name: "LP Price Reveal",
        type: "Landing Page",
        url: "https://drive.google.com/drive/folders/1UCJEHkezJLBRThOV7SXvGkC3PqUB2al4?usp=drive_link",
      },
      {
        name: "SKU PDP NAD",
        type: "SKU PDP",
        url: "https://drive.google.com/drive/folders/1I4nB9lZeQ-TgKepP8WLNGBYtz13Wwykn?usp=drive_link",
      },
      {
        name: "Discovery",
        type: "Discovery",
        url: "https://drive.google.com/drive/folders/1zSyZnj5RhsBjheZBmvaiuZUGq-WCfVUb?usp=drive_link",
      },
      {
        name: "Exposure Tiktok",
        type: "Exposure",
        url: "https://drive.google.com/drive/folders/1VHL3bqFadJB-nzCdOb7OWoQLydSN-ODQ?usp=drive_link",
      },
      {
        name: "Exposure Tokopedia",
        type: "Exposure",
        url: "https://drive.google.com/drive/folders/1ViGWTF4RaRZKRj-59r42qzAsyF1LNufK?usp=drive_link",
      },
      {
        name: "Exposure Akulaku",
        type: "Exposure",
        url: "https://drive.google.com/drive/folders/1E-wGlUGGv_ddu4VIBDjZnmkwDGGqWDvP?usp=drive_link",
      },
      {
        name: "Banner Akulaku",
        type: "Banner",
        url: "https://drive.google.com/drive/folders/19kleQF4-oDHdxMDozjDdE_MNbpjogiB8?usp=drive_link",
      },
    ],
  },
  {
    id: "sku-loriket",
    title: "SKU Loriket",
    subtitle: "Description and slide assets",
    cover: "",
    items: [
      {
        name: "SKU Description",
        type: "SKU Description",
        url: "https://drive.google.com/drive/folders/1rQVDv_y3pmYnkq2UXfKg7vra-r9Zb_o6?usp=drive_link",
      },
      {
        name: "SKU Slide",
        type: "SKU Slide",
        url: "https://drive.google.com/drive/folders/1Uol-zXQoafEbE79UJ_ekElJ3XqoexghJ?usp=drive_link",
      },
    ],
  },
  {
    id: "sku",
    title: "SKU",
    subtitle: "Main SKU asset folders",
    cover: "",
    items: [
      {
        name: "SKU Angle - Outsource",
        type: "SKU Angle",
        url: "https://drive.google.com/drive/folders/1t2MloFb-mGXnk0ZeK1Oigak8pJdrJqk8?usp=drive_link",
      },
      {
        name: "SKU Regular",
        type: "SKU Product",
        url: "https://drive.google.com/drive/folders/1m05LMb_heQq32a5SB8Cjbjw7LihgkxLy?usp=drive_link",
      },
      {
        name: "SKU Gift Box",
        type: "SKU Gift Box",
        url: "https://drive.google.com/drive/folders/1YapeeGGCcWCCwzcTHnIYgzGJ5VPw4Q2D?usp=drive_link",
      },
      {
        name: "SKU KOL OP",
        type: "SKU KOL",
        url: "https://drive.google.com/drive/folders/15RMdBrD70gu_WqZ3Ictavsh96JJAxn6x?usp=drive_link",
      },
      {
        name: "SKU KOL OS",
        type: "SKU KOL",
        url: "https://drive.google.com/drive/folders/1YjME72OE1rRUvNW-yLWxBD_fKmKDEFFI?usp=drive_link",
      },
      {
        name: "SKU NAD OS",
        type: "SKU NAD",
        url: "https://drive.google.com/drive/folders/11JYhz1apeNBdg_h7eiItuVT9DHZVazvT?usp=drive_link",
      },
      {
        name: "SKU NAD OP",
        type: "SKU NAD",
        url: "https://drive.google.com/drive/folders/1ejdRz83ijrh0eUKCLm_yR7Jm-7-qWPQT?usp=drive_link",
      },
      {
        name: "SKU IDREAMTECH",
        type: "SKU Product",
        url: "https://drive.google.com/drive/folders/1sVikAIW8kFrY6ohVl1e2kyATUw6cTZ3j?usp=drive_link",
      },
      {
        name: "Flash Sale Cover",
        type: "Flash Sale",
        url: "https://drive.google.com/drive/folders/1DvA5ONtq_C9gISAF5QsBZ4hkI5QA12CO?usp=drive_link",
      },
      {
        name: "SKU Blind Teasing",
        type: "SKU Product",
        url: "https://drive.google.com/drive/folders/1-IpYZdpk_sKGPT_kO6hkDEJYd6zt2XDS?usp=drive_link",
      },
    ],
  },
  {
    id: "payday-banner",
    title: "Payday Banner",
    subtitle: "Payday campaign banners",
    cover: "",
    items: [
      {
        name: "Payday Banner OP - AU - ETC",
        type: "Banner",
        url: "https://drive.google.com/drive/folders/1FVsN-N8RgZrOiHRmbfpGEHv_3ICri68d?usp=drive_link",
      },
      {
        name: "Payday Banner OS - Akulaku",
        type: "Banner",
        url: "https://drive.google.com/drive/folders/14pF099eF2ND4nNlfsx_WDMIVsmAA-pJM?usp=drive_link",
      },
      {
        name: "Payday Banner Shopee Pay",
        type: "Banner",
        url: "https://drive.google.com/drive/folders/1Iu8WGINnPbeyVx9vbXH9glp185xpcTY5?usp=share_link",
      },
    ],
  },
  {
    id: "landing-page-payday",
    title: "Landing Page Payday & Warm Up P4 Series",
    subtitle: "LP marketplace and blind teasing assets",
    cover: "",
    items: [
      {
        name: "Akulaku",
        type: "Landing Page",
        url: "https://drive.google.com/drive/folders/14qhNdB60vW4otN6eEZVJSE--Y_h_pYAU?usp=drive_link",
      },
      {
        name: "Tiktok",
        type: "Landing Page",
        url: "https://drive.google.com/drive/folders/1dij8z4UvTBxUXnVWYX2PRyCIc4CcHi0c?usp=drive_link",
      },
      {
        name: "Tokopedia",
        type: "Landing Page",
        url: "https://drive.google.com/drive/folders/1e2kh-fF_dP7HJshEqwZs0A0HqDwJPawP?usp=drive_link",
      },
      {
        name: "Blind Teasing",
        type: "Landing Page",
        url: "https://drive.google.com/drive/folders/1FQLrbkoExLkbt4-j3bwvccQFYFQIsXDq?usp=drive_link",
      },
    ],
  },
  {
    id: "exposure",
    title: "Exposure",
    subtitle: "Exposure and discovery page assets",
    cover: "",
    items: [
      {
        name: "Akulaku",
        type: "Exposure",
        url: "https://drive.google.com/drive/folders/1E-wGlUGGv_ddu4VIBDjZnmkwDGGqWDvP?usp=drive_link",
      },
      {
        name: "RAW",
        type: "Exposure",
        url: "https://drive.google.com/drive/folders/1xDYAd9L3YEPclleyavbRvOA41iSFocLv?usp=drive_link",
      },
      {
        name: "Tokopedia",
        type: "Exposure",
        url: "https://drive.google.com/drive/folders/10KfY3Lnrz3hgy9gISALO4rVp6-1YYBw6?usp=drive_link",
      },
      {
        name: "Discovery Page",
        type: "Discovery",
        url: "https://drive.google.com/drive/folders/1GOEdaWy6mrKKpU8ji4ZHxD-TmZd1yce7?usp=drive_link",
      },
    ],
  },
  {
    id: "super-brand-day",
    title: "Super Brand Day",
    subtitle: "SBD marketplace materials",
    cover: "",
    items: [
      {
        name: "Tiktok",
        type: "SBD",
        url: "https://drive.google.com/drive/folders/1NuHpSXzbjRvT6eDfuQyQIEN5hYEU7t__?usp=drive_link",
      },
      {
        name: "Tokopedia",
        type: "SBD",
        url: "https://drive.google.com/drive/folders/1-izVNH1FyXRXq_S146BxNr89qfZw4EE4?usp=drive_link",
      },
      {
        name: "PDP",
        type: "PDP",
        url: "https://drive.google.com/drive/folders/1BTA5gJu9BHd0ZC05js374Lv5K6AyJKsf?usp=drive_link",
      },
      {
        name: "Joint Logo",
        type: "Joint Logo",
        url: "https://drive.google.com/drive/folders/1sjdquHuYzNrsUWCH-sHnREWAB0Vi45OZ?usp=drive_link",
      },
    ],
  },
];

function normalizeText(value) {
  return String(value || "").toLowerCase().trim();
}

function makeId(prefix = "id") {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function moveItem(list, fromIndex, toIndex) {
  const safeList = [...(list || [])];

  if (
    fromIndex < 0 ||
    fromIndex >= safeList.length ||
    toIndex < 0 ||
    toIndex >= safeList.length ||
    fromIndex === toIndex
  ) {
    return safeList;
  }

  const [movedItem] = safeList.splice(fromIndex, 1);
  safeList.splice(toIndex, 0, movedItem);

  return safeList;
}


function sortCatalogAssetList(items = []) {
  return [...(items || [])].sort((a, b) => {
    const orderA = Number.isFinite(Number(a.sort_order)) ? Number(a.sort_order) : 999999;
    const orderB = Number.isFinite(Number(b.sort_order)) ? Number(b.sort_order) : 999999;
    if (orderA !== orderB) return orderA - orderB;

    const timeA = new Date(a.updated_at || a.created_at || 0).getTime();
    const timeB = new Date(b.updated_at || b.created_at || 0).getTime();
    return timeB - timeA;
  });
}

function sortCatalogList(items = []) {
  return [...(items || [])].sort((a, b) => {
    const pinnedDiff = Number(Boolean(b.is_pinned)) - Number(Boolean(a.is_pinned));
    if (pinnedDiff !== 0) return pinnedDiff;

    if (a.is_pinned && b.is_pinned) {
      const pinnedA = new Date(a.pinned_at || a.updated_at || a.created_at || 0).getTime();
      const pinnedB = new Date(b.pinned_at || b.updated_at || b.created_at || 0).getTime();
      if (pinnedA !== pinnedB) return pinnedB - pinnedA;
    }

    const timeA = new Date(a.updated_at || a.created_at || 0).getTime();
    const timeB = new Date(b.updated_at || b.created_at || 0).getTime();
    if (timeA !== timeB) return timeB - timeA;

    return Number(a.sort_order || 0) - Number(b.sort_order || 0);
  });
}


const CATALOG_ROUTE_BASE = "/catalog";

function makeCatalogRouteSlug(value) {
  return String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "untitled";
}

function makeShortRouteId(value) {
  return String(value || "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, 8)
    .toLowerCase() || "item";
}

function makeUniqueRouteSlug(item, siblings, getLabel) {
  const base = makeCatalogRouteSlug(getLabel(item));
  const sameBase = (siblings || []).filter(
    (candidate) => makeCatalogRouteSlug(getLabel(candidate)) === base
  );

  if (sameBase.length <= 1) return base;
  return `${base}--${makeShortRouteId(item?.id)}`;
}

function getCatalogRouteSlug(catalog, catalogs) {
  return makeUniqueRouteSlug(
    catalog,
    catalogs,
    (item) => item?.slug || item?.title || item?.id
  );
}

function getSectionRouteSlug(section, catalog) {
  return makeUniqueRouteSlug(
    section,
    catalog?.sections || [],
    (item) => item?.title || item?.id
  );
}

function getAssetRouteSlug(asset, section) {
  return makeUniqueRouteSlug(
    asset,
    section?.items || [],
    (item) => item?.name || item?.id
  );
}

function buildCatalogRoutePath(catalog, catalogs) {
  if (!catalog) return CATALOG_ROUTE_BASE;
  return `${CATALOG_ROUTE_BASE}/${getCatalogRouteSlug(catalog, catalogs)}`;
}

function buildSectionRoutePath(catalog, section, catalogs) {
  if (!catalog || !section) return buildCatalogRoutePath(catalog, catalogs);
  return `${buildCatalogRoutePath(catalog, catalogs)}/${getSectionRouteSlug(section, catalog)}`;
}

function buildAssetRoutePath(catalog, section, asset, catalogs) {
  if (!catalog || !section || !asset) {
    return buildSectionRoutePath(catalog, section, catalogs);
  }

  return `${buildSectionRoutePath(catalog, section, catalogs)}/${getAssetRouteSlug(asset, section)}`;
}

function readCatalogRouteParts() {
  if (typeof window === "undefined") return [];

  const cleanPath = String(window.location.pathname || "")
    .split("?")[0]
    .split("#")[0]
    .replace(/\/+$/, "")
    .toLowerCase();

  if (cleanPath === CATALOG_ROUTE_BASE) return [];
  if (!cleanPath.startsWith(`${CATALOG_ROUTE_BASE}/`)) return [];

  return cleanPath
    .slice(CATALOG_ROUTE_BASE.length + 1)
    .split("/")
    .filter(Boolean)
    .map((part) => decodeURIComponent(part));
}

function writeCatalogRoutePath(nextPath, replace = false) {
  if (typeof window === "undefined" || !nextPath) return;

  const currentPath = String(window.location.pathname || "").replace(/\/+$/, "") || "/";
  if (currentPath === nextPath) return;

  const method = replace ? "replaceState" : "pushState";
  window.history[method]({ adf: true, path: nextPath }, "", nextPath);
  window.dispatchEvent(new Event("adf-route-change"));
}

function findCatalogByRouteSlug(catalogs, slug) {
  return (catalogs || []).find(
    (catalog) => getCatalogRouteSlug(catalog, catalogs) === slug
  ) || null;
}

function findSectionByRouteSlug(catalog, slug) {
  return (catalog?.sections || []).find(
    (section) => getSectionRouteSlug(section, catalog) === slug
  ) || null;
}

function findAssetByRouteSlug(section, slug) {
  return (section?.items || []).find(
    (asset) => getAssetRouteSlug(asset, section) === slug
  ) || null;
}

function countCatalogAssets(catalog) {
  return (catalog?.sections || []).reduce(
    (total, section) => total + (section.items || []).length,
    0
  );
}

function getCatalogCover(catalog) {
  if (catalog?.cover_url) return catalog.cover_url;
  if (catalog?.slug === "p4-series") return DEFAULT_P4_COVER;
  return "";
}

function cleanFileName(name) {
  return String(name || "file")
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9._-]/g, "")
    .toLowerCase();
}

function formatTrashDate(value) {
  if (!value) return "Recently";
  try {
    return new Date(value).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "Recently";
  }
}

function navigateTo(path) {
  if (!path) return;

  if (window.ADFNavigate) {
    window.ADFNavigate(path);
    return;
  }

  window.location.href = path;
}

async function getSignedUrl(path) {
  if (!path) return "";

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .createSignedUrl(path, 60 * 60);

  if (error) return "";
  return data?.signedUrl || "";
}

async function persistSortOrder(table, rows) {
  for (const [index, row] of rows.entries()) {
    await supabase
      .from(table)
      .update({ sort_order: index + 1, updated_at: new Date().toISOString() })
      .eq("id", row.id);
  }
}

async function seedDefaultCatalogIfNeeded() {
  const { data: existing, error: checkError } = await supabase
    .from("catalogs")
    .select("id")
    .eq("slug", "p4-series")
    .maybeSingle();

  if (checkError) throw checkError;
  if (existing?.id) return;

  const { data: catalog, error: catalogError } = await supabase
    .from("catalogs")
    .insert({
      slug: "p4-series",
      title: "P4 Series",
      subtitle:
        "Main launch materials for P4 Series. LP, SKU, discovery, exposure, and campaign assets.",
      badge: "Material Update",
      note: "Editable catalog template based on P4 Series asset hub.",
      cover_path: null,
      sort_order: 1,
    })
    .select("*")
    .single();

  if (catalogError) {
    if (String(catalogError.message || "").toLowerCase().includes("duplicate")) return;
    throw catalogError;
  }

  for (const [sectionIndex, section] of P4_TEMPLATE_SECTIONS.entries()) {
    const { data: insertedSection, error: sectionError } = await supabase
      .from("catalog_sections")
      .insert({
        catalog_id: catalog.id,
        title: section.title,
        subtitle: section.subtitle || "",
        cover_path: section.cover || null,
        sort_order: sectionIndex + 1,
      })
      .select("*")
      .single();

    if (sectionError) throw sectionError;

    const assets = (section.items || []).map((asset, assetIndex) => ({
      catalog_id: catalog.id,
      section_id: insertedSection.id,
      name: asset.name || "Untitled Asset",
      type: asset.type || "Asset",
      url: asset.url || "",
      sort_order: assetIndex + 1,
    }));

    if (assets.length > 0) {
      const { error: assetError } = await supabase.from("catalog_assets").insert(assets);
      if (assetError) throw assetError;
    }
  }
}

export default function Catalog() {
  const [catalogs, setCatalogs] = useState([]);
  const [trashItems, setTrashItems] = useState([]);
  const [activeCatalogId, setActiveCatalogId] = useState(null);
  const [activeSection, setActiveSection] = useState("all");
  const [search, setSearch] = useState("");
  const [confirmAsset, setConfirmAsset] = useState(null);

  const [editMode, setEditMode] = useState(false);
  const [unlockOpen, setUnlockOpen] = useState(false);
  const [adminCode, setAdminCode] = useState("");
  const [pageError, setPageError] = useState("");

  const [catalogModalOpen, setCatalogModalOpen] = useState(false);
  const [catalogDraft, setCatalogDraft] = useState({
    title: "",
    subtitle: "",
    badge: "NEW CATALOG",
  });

  const [sectionModalOpen, setSectionModalOpen] = useState(false);
  const [sectionDraft, setSectionDraft] = useState({
    title: "New Section",
    subtitle: "Add asset folders here.",
  });

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [trashOpen, setTrashOpen] = useState(false);
  const [lastTrashAction, setLastTrashAction] = useState(null);
  const [redoTrashAction, setRedoTrashAction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const editModeRef = useRef(false);
  const hasUnsavedChangesRef = useRef(false);
  const lastResolvedCatalogPathRef = useRef("");
  const [catalogRouteVersion, setCatalogRouteVersion] = useState(0);

  useEffect(() => {
    editModeRef.current = editMode;
  }, [editMode]);

  useEffect(() => {
    hasUnsavedChangesRef.current = hasUnsavedChanges;
  }, [hasUnsavedChanges]);

  useEffect(() => {
    const handleCatalogRouteChange = () => {
      setCatalogRouteVersion((version) => version + 1);
    };

    window.addEventListener("popstate", handleCatalogRouteChange);
    window.addEventListener("adf-route-change", handleCatalogRouteChange);

    return () => {
      window.removeEventListener("popstate", handleCatalogRouteChange);
      window.removeEventListener("adf-route-change", handleCatalogRouteChange);
    };
  }, []);

  const shouldSkipRealtimeReload = () => {
    return editModeRef.current && hasUnsavedChangesRef.current;
  };

  const markCatalogDirty = () => {
    // Keep the ref in sync immediately. React state updates are async,
    // so this prevents realtime reloads / button actions from wiping fresh typing.
    hasUnsavedChangesRef.current = true;
    setHasUnsavedChanges(true);
  };

  const loadCatalogData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setPageError("");

    const [catalogRes, sectionRes, assetRes, trashRes] = await Promise.all([
      supabase.from("catalogs").select("*").order("is_pinned", { ascending: false }).order("pinned_at", { ascending: false }).order("updated_at", { ascending: false }).order("created_at", { ascending: false }),
      supabase.from("catalog_sections").select("*").order("sort_order", { ascending: true }).order("updated_at", { ascending: false }).order("created_at", { ascending: false }),
      supabase.from("catalog_assets").select("*").order("sort_order", { ascending: true }).order("updated_at", { ascending: false }).order("created_at", { ascending: false }),
      supabase.from("catalog_trash").select("*").order("created_at", { ascending: false }),
    ]);

    if (catalogRes.error || sectionRes.error || assetRes.error || trashRes.error) {
      const error =
        catalogRes.error || sectionRes.error || assetRes.error || trashRes.error;
      setPageError(`Load catalog gagal: ${error.message}`);
      setCatalogs([]);
      setTrashItems([]);
      setLoading(false);
      return;
    }

    const coverMap = new Map();
    await Promise.all(
      (catalogRes.data || []).map(async (catalog) => {
        if (!catalog.cover_path) return;
        coverMap.set(catalog.id, await getSignedUrl(catalog.cover_path));
      })
    );

    const assetsBySection = new Map();
    (assetRes.data || []).forEach((asset) => {
      const list = assetsBySection.get(asset.section_id) || [];
      list.push({
        ...asset,
        name: asset.name || "Untitled Asset",
        type: asset.type || "Asset",
        url: asset.url || "",
      });
      assetsBySection.set(asset.section_id, list);
    });

    const sectionsByCatalog = new Map();
    (sectionRes.data || []).forEach((section) => {
      const list = sectionsByCatalog.get(section.catalog_id) || [];
      list.push({
        ...section,
        id: section.id,
        title: section.title || "Untitled Section",
        subtitle: section.subtitle || "",
        cover: section.cover_path || "",
        items: sortCatalogAssetList(assetsBySection.get(section.id) || []),
      });
      sectionsByCatalog.set(section.catalog_id, list);
    });

    const mappedCatalogs = (catalogRes.data || []).map((catalog) => ({
      ...catalog,
      title: catalog.title || "Untitled Catalog",
      subtitle: catalog.subtitle || "",
      badge: catalog.badge || "CATALOG",
      note: catalog.note || "",
      cover_url: coverMap.get(catalog.id) || "",
      is_pinned: Boolean(catalog.is_pinned),
      pinned_at: catalog.pinned_at || null,
      sections: sectionsByCatalog.get(catalog.id) || [],
    }));

    const sortedCatalogs = sortCatalogList(mappedCatalogs);

    setCatalogs(sortedCatalogs);
    setTrashItems(trashRes.data || []);

    if (
      activeCatalogId &&
      !sortedCatalogs.some((catalog) => catalog.id === activeCatalogId)
    ) {
      setActiveCatalogId(null);
      setActiveSection("all");
    }

    setLoading(false);
  }, [activeCatalogId]);

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      try {
        setLoading(true);
        await seedDefaultCatalogIfNeeded();
        if (isMounted) await loadCatalogData(true);
      } catch (error) {
        if (isMounted) {
          setPageError(`Setup catalog gagal: ${error.message}`);
          setLoading(false);
        }
      }
    };

    init();

    const channel = supabase
      .channel("adf-catalog-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "catalogs" }, () => {
        if (!shouldSkipRealtimeReload()) loadCatalogData(true);
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "catalog_sections" }, () => {
        if (!shouldSkipRealtimeReload()) loadCatalogData(true);
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "catalog_assets" }, () => {
        if (!shouldSkipRealtimeReload()) loadCatalogData(true);
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "catalog_trash" }, () => {
        if (!shouldSkipRealtimeReload()) loadCatalogData(true);
      })
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [loadCatalogData]);

  useEffect(() => {
    if (!editMode) {
      setTrashOpen(false);
    }
  }, [editMode]);

  const activeCatalog = useMemo(() => {
    return catalogs.find((catalog) => catalog.id === activeCatalogId) || null;
  }, [catalogs, activeCatalogId]);


  useEffect(() => {
    if (loading) return;

    const currentPath = String(window.location.pathname || "").replace(/\/+$/, "") || "/";
    if (lastResolvedCatalogPathRef.current === currentPath) return;

    const routeParts = readCatalogRouteParts();

    if (routeParts.length === 0) {
      lastResolvedCatalogPathRef.current = currentPath;
      setActiveCatalogId(null);
      setActiveSection("all");
      setConfirmAsset(null);
      return;
    }

    const routeCatalog = findCatalogByRouteSlug(catalogs, routeParts[0]);
    if (!routeCatalog) return;

    const routeSection = routeParts[1]
      ? findSectionByRouteSlug(routeCatalog, routeParts[1])
      : null;

    const routeAsset = routeParts[2] && routeSection
      ? findAssetByRouteSlug(routeSection, routeParts[2])
      : null;

    setActiveCatalogId(routeCatalog.id);
    setActiveSection(routeSection?.id || "all");
    setSearch("");

    if (routeAsset && routeSection) {
      setConfirmAsset({
        ...routeAsset,
        sectionId: routeSection.id,
        sectionTitle: routeSection.title,
      });
    } else {
      setConfirmAsset(null);
    }

    lastResolvedCatalogPathRef.current = currentPath;
  }, [catalogs, loading, catalogRouteVersion]);

  const selectCatalogSection = useCallback(
    (sectionId, options = {}) => {
      setActiveSection(sectionId);

      if (!activeCatalog) return;

      if (!sectionId || sectionId === "all") {
        writeCatalogRoutePath(
          buildCatalogRoutePath(activeCatalog, catalogs),
          Boolean(options.replace)
        );
        return;
      }

      const section = (activeCatalog.sections || []).find(
        (item) => item.id === sectionId
      );

      writeCatalogRoutePath(
        buildSectionRoutePath(activeCatalog, section, catalogs),
        Boolean(options.replace)
      );
    },
    [activeCatalog, catalogs]
  );

  const filteredCatalogs = useMemo(() => {
    const keyword = normalizeText(search);
    if (!keyword) return catalogs;

    return catalogs.filter((catalog) => {
      const matchCatalog =
        normalizeText(catalog.title).includes(keyword) ||
        normalizeText(catalog.subtitle).includes(keyword) ||
        normalizeText(catalog.badge).includes(keyword);

      const matchItems = (catalog.sections || []).some((section) => {
        const matchSection =
          normalizeText(section.title).includes(keyword) ||
          normalizeText(section.subtitle).includes(keyword);

        const matchAsset = (section.items || []).some((item) => {
          return (
            normalizeText(item.name).includes(keyword) ||
            normalizeText(item.type).includes(keyword) ||
            normalizeText(item.url).includes(keyword)
          );
        });

        return matchSection || matchAsset;
      });

      return matchCatalog || matchItems;
    });
  }, [catalogs, search]);

  const filteredSections = useMemo(() => {
    if (!activeCatalog) return [];

    const keyword = normalizeText(search);

    return (activeCatalog.sections || [])
      .map((section) => {
        if (activeSection !== "all" && section.id !== activeSection) return null;

        const sectionMatch =
          normalizeText(section.title).includes(keyword) ||
          normalizeText(section.subtitle).includes(keyword);

        const items = keyword
          ? (section.items || []).filter((item) => {
              return (
                normalizeText(item.name).includes(keyword) ||
                normalizeText(item.type).includes(keyword) ||
                normalizeText(item.url).includes(keyword) ||
                normalizeText(section.title).includes(keyword)
              );
            })
          : section.items || [];

        const finalItems = sectionMatch && keyword ? section.items || [] : items;

        if (!editMode && finalItems.length === 0) return null;

        return {
          ...section,
          items: finalItems,
        };
      })
      .filter(Boolean);
  }, [activeCatalog, activeSection, search, editMode]);

  const quickAssets = useMemo(() => {
    if (!activeCatalog) return [];

    return (activeCatalog.sections || [])
      .flatMap((section) =>
        (section.items || []).map((item) => ({
          ...item,
          sectionId: section.id,
          sectionTitle: section.title,
        }))
      )
      .slice(0, 7);
  }, [activeCatalog]);

  const selectedSection =
    activeCatalog && activeSection !== "all"
      ? (activeCatalog.sections || []).find((section) => section.id === activeSection)
      : null;

  const openTrash = () => {
    if (!editMode) return;
    setTrashOpen(true);
  };

  const openUnlock = () => {
    if (editMode) {
      setEditMode(false);
      return;
    }

    setAdminCode("");
    setPageError("");
    setUnlockOpen(true);
  };

  const unlockEditMode = () => {
    if (adminCode.trim().toLowerCase() !== ADMIN_CODE) {
      setPageError("Kode salah. Pakai kode internal ADF.");
      return;
    }

    setEditMode(true);
    setUnlockOpen(false);
    setAdminCode("");
    setPageError("");
  };

  const updateCatalog = async (catalogId, patch) => {
    const isInstantDatabasePatch =
      Object.prototype.hasOwnProperty.call(patch, "cover_path") ||
      Object.prototype.hasOwnProperty.call(patch, "sort_order");

    setCatalogs((prev) =>
      prev.map((catalog) =>
        catalog.id === catalogId
          ? { ...catalog, ...patch, updated_at: new Date().toISOString() }
          : catalog
      )
    );

    if (!isInstantDatabasePatch) {
      markCatalogDirty();
      return;
    }

    const allowed = ["cover_path", "sort_order"];
    const payload = Object.fromEntries(
      Object.entries(patch).filter(([key]) => allowed.includes(key))
    );

    if (Object.keys(payload).length === 0) return;

    const { error } = await supabase
      .from("catalogs")
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq("id", catalogId);

    if (error) setPageError(`Update catalog gagal: ${error.message}`);
  };

  const updateActiveCatalog = (patch) => {
    if (!activeCatalog) return;
    updateCatalog(activeCatalog.id, patch);
  };

  const saveCatalogSnapshot = async (catalogToSave, options = { reload: true }) => {
    if (!catalogToSave) {
      setPageError("Tidak ada catalog aktif untuk disimpan.");
      return false;
    }

    setSyncing(true);
    setPageError("");

    const now = new Date().toISOString();

    const { error: catalogError } = await supabase
      .from("catalogs")
      .update({
        title: catalogToSave.title || "Untitled Catalog",
        subtitle: catalogToSave.subtitle || "",
        badge: catalogToSave.badge || "CATALOG",
        note: catalogToSave.note || "",
        updated_at: now,
      })
      .eq("id", catalogToSave.id);

    if (catalogError) {
      setPageError(`Save catalog gagal: ${catalogError.message}`);
      setSyncing(false);
      return false;
    }

    for (const [sectionIndex, section] of (catalogToSave.sections || []).entries()) {
      const { error: sectionError } = await supabase
        .from("catalog_sections")
        .update({
          title: section.title || "Untitled Section",
          subtitle: section.subtitle || "",
          sort_order: section.sort_order || sectionIndex + 1,
          updated_at: now,
        })
        .eq("id", section.id);

      if (sectionError) {
        setPageError(`Save section gagal: ${sectionError.message}`);
        setSyncing(false);
        return false;
      }

      for (const [assetIndex, asset] of (section.items || []).entries()) {
        const { error: assetError } = await supabase
          .from("catalog_assets")
          .update({
            name: asset.name || "Untitled Asset",
            type: asset.type || "Asset",
            url: asset.url || "",
            sort_order: asset.sort_order ?? assetIndex + 1,
            is_pinned: Boolean(asset.is_pinned),
            pinned_at: asset.is_pinned ? (asset.pinned_at || now) : null,
            updated_at: now,
          })
          .eq("id", asset.id);

        if (assetError) {
          setPageError(`Save asset gagal: ${assetError.message}`);
          setSyncing(false);
          return false;
        }
      }
    }

    hasUnsavedChangesRef.current = false;
    setHasUnsavedChanges(false);

    if (options.reload) {
      await loadCatalogData(true);
    }

    setSyncing(false);
    return true;
  };

  const saveActiveCatalogChanges = async () => {
    const catalogToSave = catalogs.find((catalog) => catalog.id === activeCatalogId);
    await saveCatalogSnapshot(catalogToSave, { reload: true });
  };

  const saveDraftBeforeReload = async () => {
    if (!hasUnsavedChangesRef.current) return true;

    const catalogToSave = catalogs.find((catalog) => catalog.id === activeCatalogId);

    if (!catalogToSave) return true;

    return saveCatalogSnapshot(catalogToSave, { reload: false });
  };

  const createCatalog = async () => {
    const title = catalogDraft.title.trim();

    if (!title) {
      setPageError("Catalog title wajib diisi.");
      return;
    }

    const saved = await saveDraftBeforeReload();

    if (!saved) return;

    setSyncing(true);

    const nextOrder = 0;

    const { data: catalog, error: catalogError } = await supabase
      .from("catalogs")
      .insert({
        slug: null,
        title,
        subtitle: catalogDraft.subtitle.trim() || "New editable asset catalog.",
        badge: catalogDraft.badge.trim() || "NEW CATALOG",
        note: "Editable catalog.",
        sort_order: nextOrder,
        is_pinned: false,
        pinned_at: null,
      })
      .select("*")
      .single();

    if (catalogError) {
      setSyncing(false);
      setPageError(`Create catalog gagal: ${catalogError.message}`);
      return;
    }

    const { data: section, error: sectionError } = await supabase
      .from("catalog_sections")
      .insert({
        catalog_id: catalog.id,
        title: "New Section",
        subtitle: "Add asset folders here.",
        sort_order: 1,
      })
      .select("*")
      .single();

    if (sectionError) {
      setSyncing(false);
      setPageError(`Create section gagal: ${sectionError.message}`);
      return;
    }

    await supabase.from("catalog_assets").insert({
      catalog_id: catalog.id,
      section_id: section.id,
      name: "New Asset Folder",
      type: "Asset",
      url: "",
      sort_order: 1,
    });

    setCatalogDraft({ title: "", subtitle: "", badge: "NEW CATALOG" });
    setCatalogModalOpen(false);
    setActiveCatalogId(catalog.id);
    setActiveSection("all");
    await loadCatalogData(true);
    setSyncing(false);
  };

  const moveCatalog = async (catalogId, placement) => {
    const saved = await saveDraftBeforeReload();

    if (!saved) return;

    const currentIndex = catalogs.findIndex((catalog) => catalog.id === catalogId);
    if (currentIndex < 0) return;

    const targetIndex = placement === "top" ? 0 : catalogs.length - 1;
    const nextCatalogs = moveItem(catalogs, currentIndex, targetIndex);
    setCatalogs(nextCatalogs);
    await persistSortOrder("catalogs", nextCatalogs);
  };

  const openAddSectionModal = () => {
    setSectionDraft({
      title: "New Section",
      subtitle: "Add asset folders here.",
    });
    setSectionModalOpen(true);
  };

  const createSection = async () => {
    if (!activeCatalog) return;

    const title = sectionDraft.title.trim();

    if (!title) {
      setPageError("Section title wajib diisi.");
      return;
    }

    const saved = await saveDraftBeforeReload();

    if (!saved) return;

    setSyncing(true);
    setPageError("");

    const latestCatalog = catalogs.find((catalog) => catalog.id === activeCatalog.id) || activeCatalog;
    const nextOrder = 0;

    const { data, error } = await supabase
      .from("catalog_sections")
      .insert({
        catalog_id: activeCatalog.id,
        title,
        subtitle: sectionDraft.subtitle.trim() || "",
        sort_order: nextOrder,
      })
      .select("*")
      .single();

    if (error) {
      setPageError(`Add section gagal: ${error.message}`);
      setSyncing(false);
      return;
    }

    setSectionModalOpen(false);
    setSectionDraft({
      title: "New Section",
      subtitle: "Add asset folders here.",
    });

    setActiveSection(data.id);
    await loadCatalogData(true);
    setSyncing(false);
  };

  const updateSection = (sectionId, patch) => {
    if (!activeCatalog) return;

    setCatalogs((prev) =>
      prev.map((catalog) =>
        catalog.id === activeCatalog.id
          ? {
              ...catalog,
              sections: (catalog.sections || []).map((section) =>
                section.id === sectionId ? { ...section, ...patch } : section
              ),
            }
          : catalog
      )
    );

    markCatalogDirty();
  };

  const moveSection = async (sectionId, placement) => {
    if (!activeCatalog) return;

    const saved = await saveDraftBeforeReload();

    if (!saved) return;

    const sections = activeCatalog.sections || [];
    const currentIndex = sections.findIndex((section) => section.id === sectionId);
    if (currentIndex < 0) return;

    const targetIndex = placement === "top" ? 0 : sections.length - 1;
    const nextSections = moveItem(sections, currentIndex, targetIndex);

    setCatalogs((prev) =>
      prev.map((catalog) =>
        catalog.id === activeCatalog.id ? { ...catalog, sections: nextSections } : catalog
      )
    );

    await persistSortOrder("catalog_sections", nextSections);
  };

  const addAsset = async (sectionId) => {
    if (!activeCatalog) return;

    const saved = await saveDraftBeforeReload();

    if (!saved) return;

    setSyncing(true);
    setPageError("");

    const latestCatalog = catalogs.find((catalog) => catalog.id === activeCatalog.id) || activeCatalog;
    const section = (latestCatalog.sections || []).find((item) => item.id === sectionId);
    const nextOrder = 0;

    const { error } = await supabase.from("catalog_assets").insert({
      catalog_id: activeCatalog.id,
      section_id: sectionId,
      name: "New Asset Folder",
      type: "Asset",
      url: "",
      sort_order: nextOrder,
      is_pinned: false,
      pinned_at: null,
    });

    if (error) {
      setPageError(`Add asset gagal: ${error.message}`);
      setSyncing(false);
      return;
    }

    await loadCatalogData(true);
    setSyncing(false);
  };

  const updateAsset = (sectionId, assetId, patch) => {
    if (!activeCatalog) return;

    setCatalogs((prev) =>
      prev.map((catalog) =>
        catalog.id === activeCatalog.id
          ? {
              ...catalog,
              sections: (catalog.sections || []).map((section) =>
                section.id === sectionId
                  ? {
                      ...section,
                      items: (section.items || []).map((asset) =>
                        asset.id === assetId ? { ...asset, ...patch, sort_order: asset.is_pinned ? -9999 : 0, updated_at: new Date().toISOString() } : asset
                      ),
                    }
                  : section
              ),
            }
          : catalog
      )
    );

    markCatalogDirty();
  };

  const moveAsset = async (sectionId, assetId, placement) => {
    if (!activeCatalog) return;

    const saved = await saveDraftBeforeReload();

    if (!saved) return;

    const section = (activeCatalog.sections || []).find((item) => item.id === sectionId);
    if (!section) return;

    const currentIndex = (section.items || []).findIndex((asset) => asset.id === assetId);
    if (currentIndex < 0) return;

    const targetIndex = placement === "top" ? 0 : (section.items || []).length - 1;
    const nextAssets = moveItem(section.items || [], currentIndex, targetIndex);

    setCatalogs((prev) =>
      prev.map((catalog) =>
        catalog.id === activeCatalog.id
          ? {
              ...catalog,
              sections: (catalog.sections || []).map((item) =>
                item.id === sectionId ? { ...item, items: nextAssets } : item
              ),
            }
          : catalog
      )
    );

    await persistSortOrder("catalog_assets", nextAssets);
  };

  const makeCatalogTrashPayload = (catalog) => {
    return {
      ...catalog,
      cover_url: undefined,
      sections: (catalog.sections || []).map((section) => ({
        ...section,
        items: section.items || [],
      })),
    };
  };

  const askDeleteCatalog = async (catalog) => {
    const saved = await saveDraftBeforeReload();

    if (!saved) return;

    setDeleteTarget({
      type: "catalog",
      title: catalog.title,
      message: `Pindahin catalog "${catalog.title}" ke Trash? Data masih bisa di-restore dari tombol Trash.`,
      payload: catalog,
    });
  };

  const askDeleteSection = async (section) => {
    const saved = await saveDraftBeforeReload();

    if (!saved) return;

    setDeleteTarget({
      type: "section",
      title: section.title,
      message: `Pindahin section "${section.title}" ke Trash? Asset di dalamnya masih bisa di-restore.`,
      payload: section,
    });
  };

  const askDeleteAsset = async (section, asset) => {
    const saved = await saveDraftBeforeReload();

    if (!saved) return;

    setDeleteTarget({
      type: "asset",
      title: asset.name,
      message: `Pindahin asset "${asset.name}" dari section "${section.title}" ke Trash?`,
      payload: { section, asset },
    });
  };

  const moveCatalogPayloadToTrash = async (catalog) => {
    const payload = makeCatalogTrashPayload(catalog);

    const { data: trash, error: trashError } = await supabase
      .from("catalog_trash")
      .insert({
        type: "catalog",
        title: catalog.title,
        payload,
        meta: {},
      })
      .select("*")
      .single();

    if (trashError) {
      setPageError(`Move trash gagal: ${trashError.message}`);
      return;
    }

    const { error: deleteError } = await supabase
      .from("catalogs")
      .delete()
      .eq("id", catalog.id);

    if (deleteError) {
      setPageError(`Delete catalog gagal: ${deleteError.message}`);
      return;
    }

    setLastTrashAction(trash);
    setRedoTrashAction(null);

    if (activeCatalogId === catalog.id) {
      setActiveCatalogId(null);
      setActiveSection("all");
    }
  };

  const moveSectionPayloadToTrash = async (section) => {
    if (!activeCatalog) return;

    const payload = {
      ...section,
      items: section.items || [],
    };

    const { data: trash, error: trashError } = await supabase
      .from("catalog_trash")
      .insert({
        type: "section",
        title: section.title,
        payload,
        meta: {
          catalogId: activeCatalog.id,
          catalogTitle: activeCatalog.title,
        },
      })
      .select("*")
      .single();

    if (trashError) {
      setPageError(`Move trash gagal: ${trashError.message}`);
      return;
    }

    const { error: deleteError } = await supabase
      .from("catalog_sections")
      .delete()
      .eq("id", section.id);

    if (deleteError) {
      setPageError(`Delete section gagal: ${deleteError.message}`);
      return;
    }

    setLastTrashAction(trash);
    setRedoTrashAction(null);

    if (activeSection === section.id) setActiveSection("all");
  };

  const moveAssetPayloadToTrash = async (section, asset) => {
    if (!activeCatalog) return;

    const { data: trash, error: trashError } = await supabase
      .from("catalog_trash")
      .insert({
        type: "asset",
        title: asset.name,
        payload: asset,
        meta: {
          catalogId: activeCatalog.id,
          catalogTitle: activeCatalog.title,
          sectionId: section.id,
          sectionTitle: section.title,
        },
      })
      .select("*")
      .single();

    if (trashError) {
      setPageError(`Move trash gagal: ${trashError.message}`);
      return;
    }

    const { error: deleteError } = await supabase
      .from("catalog_assets")
      .delete()
      .eq("id", asset.id);

    if (deleteError) {
      setPageError(`Delete asset gagal: ${deleteError.message}`);
      return;
    }

    setLastTrashAction(trash);
    setRedoTrashAction(null);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    if (deleteTarget.type === "catalog") {
      await moveCatalogPayloadToTrash(deleteTarget.payload);
    }

    if (deleteTarget.type === "section") {
      await moveSectionPayloadToTrash(deleteTarget.payload);
    }

    if (deleteTarget.type === "asset") {
      const { section, asset } = deleteTarget.payload;
      await moveAssetPayloadToTrash(section, asset);
    }

    setDeleteTarget(null);
    await loadCatalogData(true);
  };

  const restoreTrashItem = async (trashItem, options = {}) => {
    if (!trashItem) return false;

    setSyncing(true);
    setPageError("");

    const payload = trashItem.payload || {};
    const meta = trashItem.meta || {};

    if (trashItem.type === "catalog") {
      const { error: catalogError } = await supabase.from("catalogs").insert({
        id: payload.id,
        slug: payload.slug || null,
        title: payload.title || "Restored Catalog",
        subtitle: payload.subtitle || "",
        badge: payload.badge || "CATALOG",
        note: payload.note || "",
        cover_path: payload.cover_path || null,
        sort_order: catalogs.length + 1,
        created_at: payload.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (catalogError) {
        setPageError(`Restore catalog gagal: ${catalogError.message}`);
        setSyncing(false);
        return false;
      }

      for (const [sectionIndex, section] of (payload.sections || []).entries()) {
        const { error: sectionError } = await supabase.from("catalog_sections").insert({
          id: section.id,
          catalog_id: payload.id,
          title: section.title || "Restored Section",
          subtitle: section.subtitle || "",
          cover_path: section.cover_path || null,
          sort_order: sectionIndex + 1,
          created_at: section.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        if (sectionError) {
          setPageError(`Restore section gagal: ${sectionError.message}`);
          setSyncing(false);
          return false;
        }

        const assets = (section.items || []).map((asset, assetIndex) => ({
          id: asset.id,
          catalog_id: payload.id,
          section_id: section.id,
          name: asset.name || "Restored Asset",
          type: asset.type || "Asset",
          url: asset.url || "",
          sort_order: assetIndex + 1,
          created_at: asset.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }));

        if (assets.length > 0) {
          const { error: assetError } = await supabase.from("catalog_assets").insert(assets);
          if (assetError) {
            setPageError(`Restore asset gagal: ${assetError.message}`);
            setSyncing(false);
            return false;
          }
        }
      }
    }

    if (trashItem.type === "section") {
      const parent = catalogs.find((catalog) => catalog.id === meta.catalogId);

      if (!parent) {
        setPageError("Parent catalog sudah tidak ada. Restore catalog parent dulu.");
        setSyncing(false);
        return false;
      }

      const { error: sectionError } = await supabase.from("catalog_sections").insert({
        id: payload.id,
        catalog_id: meta.catalogId,
        title: payload.title || "Restored Section",
        subtitle: payload.subtitle || "",
        cover_path: payload.cover_path || null,
        sort_order: (parent.sections || []).length + 1,
        created_at: payload.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (sectionError) {
        setPageError(`Restore section gagal: ${sectionError.message}`);
        setSyncing(false);
        return false;
      }

      const assets = (payload.items || []).map((asset, assetIndex) => ({
        id: asset.id,
        catalog_id: meta.catalogId,
        section_id: payload.id,
        name: asset.name || "Restored Asset",
        type: asset.type || "Asset",
        url: asset.url || "",
        sort_order: assetIndex + 1,
        created_at: asset.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

      if (assets.length > 0) {
        const { error: assetError } = await supabase.from("catalog_assets").insert(assets);
        if (assetError) {
          setPageError(`Restore asset gagal: ${assetError.message}`);
          setSyncing(false);
          return false;
        }
      }
    }

    if (trashItem.type === "asset") {
      const parentCatalog = catalogs.find((catalog) => catalog.id === meta.catalogId);
      const parentSection = parentCatalog?.sections?.find((section) => section.id === meta.sectionId);

      if (!parentCatalog || !parentSection) {
        setPageError("Parent catalog/section sudah tidak ada. Restore parent dulu.");
        setSyncing(false);
        return false;
      }

      const { error: assetError } = await supabase.from("catalog_assets").insert({
        id: payload.id,
        catalog_id: meta.catalogId,
        section_id: meta.sectionId,
        name: payload.name || "Restored Asset",
        type: payload.type || "Asset",
        url: payload.url || "",
        sort_order: (parentSection.items || []).length + 1,
        created_at: payload.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (assetError) {
        setPageError(`Restore asset gagal: ${assetError.message}`);
        setSyncing(false);
        return false;
      }
    }

    await supabase.from("catalog_trash").delete().eq("id", trashItem.id);

    if (!options.fromRedo) {
      setRedoTrashAction(trashItem);
    }

    await loadCatalogData(true);
    setSyncing(false);
    return true;
  };

  const trashAgain = async (trashItem) => {
    if (!trashItem) return;

    const payload = trashItem.payload || {};

    if (trashItem.type === "catalog") {
      const found = catalogs.find((catalog) => catalog.id === payload.id);
      if (found) await moveCatalogPayloadToTrash(found);
    }

    if (trashItem.type === "section") {
      const parent = catalogs.find((catalog) => catalog.id === trashItem.meta?.catalogId);
      const found = parent?.sections?.find((section) => section.id === payload.id);
      if (found) {
        setActiveCatalogId(parent.id);
        await moveSectionPayloadToTrash(found);
      }
    }

    if (trashItem.type === "asset") {
      const parent = catalogs.find((catalog) => catalog.id === trashItem.meta?.catalogId);
      const section = parent?.sections?.find((item) => item.id === trashItem.meta?.sectionId);
      const found = section?.items?.find((asset) => asset.id === payload.id);
      if (parent && section && found) {
        setActiveCatalogId(parent.id);
        await moveAssetPayloadToTrash(section, found);
      }
    }

    setRedoTrashAction(null);
    await loadCatalogData(true);
  };

  const undoLastTrash = async () => {
    const target = lastTrashAction || trashItems[0];
    if (!target) return;

    const restored = await restoreTrashItem(target);

    if (restored) {
      setLastTrashAction(null);
    }
  };

  const redoLastTrash = async () => {
    if (!redoTrashAction) return;
    await trashAgain(redoTrashAction);
  };

  const restoreFromTrash = async (trashItem) => {
    await restoreTrashItem(trashItem, { forceRemoveFromTrash: true });
  };

  const permanentDeleteTrashItem = async (trashItemId) => {
    const { error } = await supabase.from("catalog_trash").delete().eq("id", trashItemId);

    if (error) {
      setPageError(`Permanent delete gagal: ${error.message}`);
      return;
    }

    if (lastTrashAction?.id === trashItemId) setLastTrashAction(null);
    if (redoTrashAction?.id === trashItemId) setRedoTrashAction(null);
    await loadCatalogData(true);
  };


  const togglePinCatalog = async (catalogId) => {
    const target = catalogs.find((catalog) => catalog.id === catalogId);
    if (!target) return;

    const now = new Date().toISOString();
    const nextPinned = !Boolean(target.is_pinned);

    setCatalogs((prev) =>
      sortCatalogList(
        prev.map((catalog) =>
          catalog.id === catalogId
            ? {
                ...catalog,
                is_pinned: nextPinned,
                pinned_at: nextPinned ? now : null,
                updated_at: now,
              }
            : catalog
        )
      )
    );

    const { error } = await supabase
      .from("catalogs")
      .update({
        is_pinned: nextPinned,
        pinned_at: nextPinned ? now : null,
        updated_at: now,
      })
      .eq("id", catalogId);

    if (error) {
      setPageError(`Pin catalog gagal: ${error.message}`);
      await loadCatalogData(true);
      return;
    }

    await loadCatalogData(true);
  };

  const handleCoverUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file || !activeCatalog) return;

    setPageError("");

    if (file.type !== "image/png") {
      setPageError("Header image hanya menerima PNG.");
      return;
    }

    if (file.size > MAX_COVER_SIZE_BYTES) {
      setPageError(`PNG maksimal ${MAX_COVER_SIZE_MB}MB.`);
      return;
    }

    const saved = await saveDraftBeforeReload();

    if (!saved) return;

    setSyncing(true);

    const path = `catalog-covers/${activeCatalog.id}/${Date.now()}-${cleanFileName(file.name)}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(path, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

    if (uploadError) {
      setPageError(`Upload cover gagal: ${uploadError.message}`);
      setSyncing(false);
      return;
    }

    if (activeCatalog.cover_path) {
      await supabase.storage.from(BUCKET_NAME).remove([activeCatalog.cover_path]);
    }

    await updateCatalog(activeCatalog.id, { cover_path: path });
    await loadCatalogData(true);
    setSyncing(false);
  };

  const openCatalog = async (catalogId) => {
    const saved = await saveDraftBeforeReload();

    if (!saved) return;

    const catalog = catalogs.find((item) => item.id === catalogId);

    setActiveCatalogId(catalogId);
    setActiveSection("all");
    setSearch("");
    setConfirmAsset(null);

    if (catalog) {
      writeCatalogRoutePath(buildCatalogRoutePath(catalog, catalogs));
    }
  };

  const backToLibrary = async () => {
    const saved = await saveDraftBeforeReload();

    if (!saved) return;

    setActiveCatalogId(null);
    setActiveSection("all");
    setSearch("");
    setConfirmAsset(null);
    writeCatalogRoutePath(CATALOG_ROUTE_BASE);
  };

  const handleBack = async () => {
    if (activeCatalog) {
      await backToLibrary();
      return;
    }

    const saved = await saveDraftBeforeReload();

    if (!saved) return;

    navigateTo(BACK_TO_POPUP_URL);
  };

  const handleOpenAsset = (asset, sectionReference = null) => {
    if (editMode || !activeCatalog || !asset) return;

    const section =
      sectionReference && typeof sectionReference === "object"
        ? (activeCatalog.sections || []).find(
            (item) => item.id === sectionReference.id
          ) || sectionReference
        : (activeCatalog.sections || []).find(
            (item) =>
              item.id === asset.sectionId ||
              item.id === asset.section_id ||
              item.title === sectionReference ||
              item.title === asset.sectionTitle
          );

    setConfirmAsset({
      ...asset,
      sectionId: section?.id || asset.sectionId || asset.section_id || null,
      sectionTitle: section?.title || asset.sectionTitle || "",
    });

    if (section) {
      writeCatalogRoutePath(
        buildAssetRoutePath(activeCatalog, section, asset, catalogs)
      );
    }
  };

  const closeConfirmAsset = () => {
    if (!activeCatalog) {
      setConfirmAsset(null);
      return;
    }

    const section = (activeCatalog.sections || []).find(
      (item) => item.id === confirmAsset?.sectionId
    );

    setConfirmAsset(null);
    writeCatalogRoutePath(
      section
        ? buildSectionRoutePath(activeCatalog, section, catalogs)
        : buildCatalogRoutePath(activeCatalog, catalogs),
      true
    );
  };

  const handleContinueOpen = () => {
    if (!confirmAsset?.url) return;
    window.open(confirmAsset.url, "_blank", "noopener,noreferrer");
    closeConfirmAsset();
  };

  return (
    <div className="h-screen overflow-hidden bg-[#f5f5f3] text-neutral-950">
      <style>{`
        @keyframes catalogFloat {
          0%, 100% { transform: translate3d(0,0,0) scale(1); }
          50% { transform: translate3d(18px,-18px,0) scale(1.03); }
        }

        @keyframes catalogFloatReverse {
          0%, 100% { transform: translate3d(0,0,0) scale(1); }
          50% { transform: translate3d(-18px,18px,0) scale(1.035); }
        }

        @keyframes catalogFadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .catalog-fade {
          animation: catalogFadeUp .56s cubic-bezier(.16,1,.3,1) both;
        }

        .catalog-scroll::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        .catalog-scroll::-webkit-scrollbar-track {
          background: transparent;
        }

        .catalog-scroll::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,.12);
          border-radius: 999px;
        }

        .catalog-scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        .catalog-scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .catalog-input {
          width: 100%;
          border-radius: 16px;
          border: 1px solid rgba(0,0,0,.06);
          background: rgba(255,255,255,.82);
          padding: 11px 13px;
          font-size: 13px;
          color: #111;
          outline: none;
          box-shadow: 0 1px 0 rgba(255,255,255,.7) inset;
        }

        .catalog-input:focus {
          background: #fff;
          border-color: rgba(0,0,0,.16);
        }
      `}</style>

      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -left-28 top-8 h-[320px] w-[320px] animate-[catalogFloat_10s_ease-in-out_infinite] rounded-full bg-white blur-3xl" />
        <div className="absolute right-[-160px] top-[-110px] h-[460px] w-[460px] animate-[catalogFloatReverse_13s_ease-in-out_infinite] rounded-full bg-white/90 blur-3xl" />
        <div className="absolute bottom-[-210px] left-[18%] h-[500px] w-[500px] animate-[catalogFloat_12s_ease-in-out_infinite] rounded-full bg-white blur-3xl" />
      </div>

      <div className="relative z-10 flex h-screen overflow-hidden">
        <aside className="hidden h-screen w-[280px] shrink-0 p-5 lg:block">
          <CatalogSidebar
            catalogs={catalogs}
            activeCatalog={activeCatalog}
            activeSection={activeSection}
            setActiveSection={selectCatalogSection}
            onBack={handleBack}
            onOpenLibrary={backToLibrary}
            onOpenCatalog={openCatalog}
            editMode={editMode}
            onUnlock={openUnlock}
            onAddCatalog={() => setCatalogModalOpen(true)}
            trashCount={trashItems.length}
            onOpenTrash={openTrash}
            syncing={syncing}
          />
        </aside>

        <main className="flex h-screen min-w-0 flex-1 flex-col overflow-hidden px-4 py-5 md:px-8 lg:px-6">
          {pageError && (
            <div className="mb-3 shrink-0 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
              {pageError}
            </div>
          )}

          {loading ? (
            <CatalogLoadingState />
          ) : activeCatalog ? (
            <>
              <CatalogTopHero
                catalog={activeCatalog}
                search={search}
                setSearch={setSearch}
                activeSection={activeSection}
                setActiveSection={selectCatalogSection}
                filteredCount={filteredSections.reduce((total, section) => total + (section.items || []).length, 0)}
                editMode={editMode}
                onBack={handleBack}
                onUnlock={openUnlock}
                onUpdateCatalog={updateActiveCatalog}
                onCoverUpload={handleCoverUpload}
                onSaveChanges={saveActiveCatalogChanges}
                hasUnsavedChanges={hasUnsavedChanges}
                syncing={syncing}
              />

              <div className="catalog-scroll min-h-0 flex-1 overflow-y-auto pr-0 lg:pr-2">
                <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_390px]">
                  <div>
                    <div className="mb-4 flex items-end justify-between">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-400">
                          Assets
                        </p>
                        <h2 className="mt-1 text-2xl font-semibold tracking-[-0.05em]">
                          {activeSection === "all" ? `All ${activeCatalog.title} Assets` : selectedSection?.title}
                        </h2>
                      </div>

                      {editMode && (
                        <div className="flex flex-wrap justify-end gap-2">
                          {hasUnsavedChanges && (
                            <button
                              onClick={saveActiveCatalogChanges}
                              disabled={syncing}
                              className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                            >
                              {syncing ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                              Save Changes
                            </button>
                          )}

                          <button
                            onClick={openAddSectionModal}
                            className="inline-flex items-center gap-2 rounded-full bg-neutral-950 px-4 py-2 text-xs font-semibold text-white transition hover:bg-neutral-800"
                          >
                            <Plus size={15} />
                            Add Section
                          </button>
                        </div>
                      )}
                    </div>

                    {filteredSections.length === 0 ? (
                      <CatalogEmptyState search={search} />
                    ) : (
                      <div className="space-y-5">
                        {filteredSections.map((section, index) => (
                          <CatalogAssetSection
                            key={section.id}
                            section={section}
                            index={index}
                            editMode={editMode}
                            onOpenAsset={handleOpenAsset}
                            onUpdateSection={updateSection}
                            onDeleteSection={askDeleteSection}
                            onAddAsset={addAsset}
                            onUpdateAsset={updateAsset}
                            onDeleteAsset={askDeleteAsset}
                            onMoveSection={moveSection}
                            onMoveAsset={moveAsset}
                            onSoftSaveDraft={saveDraftBeforeReload}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="lg:sticky lg:top-0 lg:h-fit">
                    <CatalogQualityPanel />
                    <CatalogQuickAccessPanel
                      assets={quickAssets}
                      onOpenAsset={handleOpenAsset}
                    />
                  </div>
                </section>
              </div>
            </>
          ) : (
            <CatalogLibrary
              catalogs={filteredCatalogs}
              search={search}
              setSearch={setSearch}
              editMode={editMode}
              onBack={handleBack}
              onUnlock={openUnlock}
              onOpenCatalog={openCatalog}
              onAddCatalog={() => setCatalogModalOpen(true)}
              onDeleteCatalog={askDeleteCatalog}
              onMoveCatalog={moveCatalog}
              onTogglePinCatalog={togglePinCatalog}
              trashCount={trashItems.length}
              onOpenTrash={openTrash}
              onUndoTrash={undoLastTrash}
              onRedoTrash={redoLastTrash}
              canUndo={Boolean(lastTrashAction || trashItems.length)}
              canRedo={Boolean(redoTrashAction)}
              syncing={syncing}
            />
          )}
        </main>
      </div>

      {unlockOpen && (
        <UnlockModal
          code={adminCode}
          setCode={setAdminCode}
          error={pageError}
          onUnlock={unlockEditMode}
          onClose={() => {
            setUnlockOpen(false);
            setAdminCode("");
            setPageError("");
          }}
        />
      )}

      {catalogModalOpen && (
        <CatalogCreateModal
          draft={catalogDraft}
          setDraft={setCatalogDraft}
          onClose={() => setCatalogModalOpen(false)}
          onCreate={createCatalog}
          syncing={syncing}
        />
      )}

      {sectionModalOpen && (
        <SectionCreateModal
          draft={sectionDraft}
          setDraft={setSectionDraft}
          onClose={() => setSectionModalOpen(false)}
          onCreate={createSection}
          syncing={syncing}
        />
      )}

      {deleteTarget && (
        <DeleteConfirmModal
          title={deleteTarget.title}
          message={deleteTarget.message}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={confirmDelete}
        />
      )}

      {trashOpen && (
        <TrashModal
          items={trashItems}
          onClose={() => setTrashOpen(false)}
          onRestore={restoreFromTrash}
          onPermanentDelete={permanentDeleteTrashItem}
        />
      )}

      {confirmAsset && (
        <ConfirmOpenModal
          asset={confirmAsset}
          onClose={closeConfirmAsset}
          onContinue={handleContinueOpen}
        />
      )}
    </div>
  );
}

function CatalogLoadingState() {
  return (
    <div className="grid min-h-0 flex-1 place-items-center">
      <div className="rounded-[30px] border border-white/70 bg-white/70 p-8 text-center shadow-[0_18px_55px_rgba(0,0,0,0.06)] backdrop-blur-xl">
        <Loader2 className="mx-auto animate-spin text-neutral-400" size={28} />
        <p className="mt-4 text-sm font-semibold text-neutral-700">Loading live catalog...</p>
        <p className="mt-1 text-xs text-neutral-400">Syncing with Supabase realtime database.</p>
      </div>
    </div>
  );
}

function CatalogSidebar({
  catalogs,
  activeCatalog,
  activeSection,
  setActiveSection,
  onBack,
  onOpenLibrary,
  onOpenCatalog,
  editMode,
  onUnlock,
  onAddCatalog,
  trashCount = 0,
  onOpenTrash,
  syncing,
}) {
  const totalAssets = catalogs.reduce((total, catalog) => total + countCatalogAssets(catalog), 0);
  const [expandedCatalogId, setExpandedCatalogId] = useState(activeCatalog?.id || null);

  useEffect(() => {
    if (!activeCatalog?.id) {
      setExpandedCatalogId(null);
      return;
    }

    setExpandedCatalogId(activeCatalog.id);
  }, [activeCatalog?.id]);

  const handleCatalogToggle = (catalog) => {
    const isActiveCatalog = activeCatalog?.id === catalog.id;

    if (isActiveCatalog) {
      setExpandedCatalogId((currentId) => {
        const nextId = currentId === catalog.id ? null : catalog.id;

        if (!nextId) {
          setActiveSection("all");
        }

        return nextId;
      });
      return;
    }

    setExpandedCatalogId(catalog.id);
    onOpenCatalog(catalog.id);
  };

  const handleOpenLibrary = () => {
    setExpandedCatalogId(null);
    onOpenLibrary();
  };

  return (
    <div className="flex h-full flex-col rounded-[32px] border border-white/70 bg-white/62 p-4 shadow-[0_22px_70px_rgba(0,0,0,0.07)] backdrop-blur-xl">
      <button
        onClick={onBack}
        className="mb-4 flex items-center gap-2 rounded-2xl border border-black/5 bg-white/70 px-3 py-3 text-sm font-medium text-neutral-600 shadow-sm transition hover:bg-white hover:text-neutral-950 active:scale-[0.985]"
      >
        <ArrowLeft size={18} strokeWidth={1.8} />
        {activeCatalog ? "Catalog Home" : "Homepage"}
      </button>

      <div className="px-3 py-3">
        <p className="text-[28px] font-semibold leading-tight tracking-[-0.05em]">
          Catalog
        </p>
        <p className="mt-1 text-sm text-neutral-500">
          {catalogs.length} catalogs · {totalAssets} assets
        </p>
      </div>

      <div className="mt-4 flex gap-2 px-1">
        <button
          onClick={onUnlock}
          className={`flex flex-1 items-center justify-center gap-2 rounded-2xl px-3 py-2.5 text-xs font-semibold shadow-sm transition ${
            editMode
              ? "bg-neutral-950 text-white hover:bg-neutral-800"
              : "bg-white text-neutral-600 hover:text-neutral-950"
          }`}
        >
          {editMode ? <Unlock size={15} /> : <Lock size={15} />}
          {editMode ? "Edit On" : "Unlock"}
        </button>

        {editMode && (
          <button
            onClick={onAddCatalog}
            className="grid h-10 w-10 place-items-center rounded-2xl bg-white text-neutral-700 shadow-sm hover:text-neutral-950"
            title="Add Catalog"
          >
            <Plus size={17} />
          </button>
        )}
      </div>

      {editMode && (
        <button
          onClick={onOpenTrash}
          className="mt-3 flex w-full items-center justify-between rounded-2xl bg-white/76 px-3 py-3 text-left text-neutral-600 shadow-sm transition hover:bg-white hover:text-neutral-950"
        >
          <span className="flex items-center gap-3">
            <Trash2 size={17} strokeWidth={1.8} />
            <span className="text-sm font-semibold">Trash</span>
          </span>
          <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-neutral-400">
            {trashCount}
          </span>
        </button>
      )}

      {syncing && (
        <div className="mt-3 flex items-center gap-2 rounded-2xl bg-white/70 px-3 py-2 text-xs font-semibold text-neutral-400">
          <Loader2 size={14} className="animate-spin" />
          Syncing
        </div>
      )}

      <div className="catalog-scroll mt-5 min-h-0 flex-1 space-y-1 overflow-y-auto pr-1">
        <button
          onClick={handleOpenLibrary}
          className={`flex w-full items-center justify-between rounded-2xl px-3 py-3 text-left transition ${
            !activeCatalog
              ? "bg-white text-neutral-950 shadow-sm"
              : "text-neutral-500 hover:bg-white/70 hover:text-neutral-950"
          }`}
        >
          <span className="flex min-w-0 items-center gap-3">
            <Home className="h-[18px] w-[18px] shrink-0" strokeWidth={1.8} />
            <span className="truncate text-sm font-medium">Catalog Home</span>
          </span>
        </button>

        {catalogs.map((catalog) => {
          const isActiveCatalog = activeCatalog?.id === catalog.id;
          const isExpandedCatalog = isActiveCatalog && expandedCatalogId === catalog.id;
          const FolderIcon = isExpandedCatalog ? FolderOpen : Folder;

          return (
            <div key={catalog.id}>
              <button
                onClick={() => handleCatalogToggle(catalog)}
                className={`flex w-full items-center justify-between rounded-2xl px-3 py-3 text-left transition ${
                  isActiveCatalog
                    ? "bg-white text-neutral-950 shadow-sm"
                    : "text-neutral-500 hover:bg-white/70 hover:text-neutral-950"
                }`}
                title={
                  isActiveCatalog
                    ? isExpandedCatalog
                      ? "Collapse folder"
                      : "Expand folder"
                    : "Open catalog"
                }
              >
                <span className="flex min-w-0 items-center gap-3">
                  <FolderIcon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.8} />
                  <span className="truncate text-sm font-medium">{catalog.title}</span>
                </span>
                <span className="shrink-0 text-xs text-neutral-400">
                  {countCatalogAssets(catalog)}
                </span>
              </button>

              {isExpandedCatalog && (
                <div className="mt-1 space-y-1 pl-5">
                  <button
                    onClick={() => setActiveSection("all")}
                    className={`flex w-full items-center justify-between rounded-2xl px-3 py-2.5 text-left transition ${
                      activeSection === "all"
                        ? "bg-neutral-950 text-white"
                        : "text-neutral-500 hover:bg-white/70 hover:text-neutral-950"
                    }`}
                  >
                    <span className="truncate text-xs font-semibold">All Assets</span>
                  </button>

                  {(catalog.sections || []).map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`flex w-full items-center justify-between rounded-2xl px-3 py-2.5 text-left transition ${
                        activeSection === section.id
                          ? "bg-neutral-950 text-white"
                          : "text-neutral-500 hover:bg-white/70 hover:text-neutral-950"
                      }`}
                    >
                      <span className="truncate text-xs font-semibold">{section.title}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 rounded-[26px] border border-white/70 bg-white/70 p-4 shadow-sm">
        <div className="mb-3 grid h-10 w-10 place-items-center rounded-2xl bg-neutral-100">
          <ShieldCheck size={20} strokeWidth={1.8} />
        </div>
        <p className="text-sm font-medium tracking-[-0.02em]">Before sharing</p>
        <p className="mt-2 text-xs leading-5 text-neutral-500">
          Double check the price & asset details before using any catalog material.
        </p>
      </div>
    </div>
  );
}


function CatalogLibrary({
  catalogs,
  search,
  setSearch,
  editMode,
  onBack,
  onUnlock,
  onOpenCatalog,
  onAddCatalog,
  onDeleteCatalog,
  onMoveCatalog,
  onTogglePinCatalog,
  trashCount = 0,
  onOpenTrash,
  onUndoTrash,
  onRedoTrash,
  canUndo,
  canRedo,
  syncing,
}) {
  return (
    <>
      <div className="shrink-0 pb-3">
        <div className="mb-3 flex items-center justify-between lg:hidden">
          <button
            onClick={onBack}
            className="flex items-center gap-2 rounded-full border border-black/5 bg-white/80 px-4 py-2 text-xs font-medium text-neutral-600 shadow-sm transition active:scale-[0.98]"
          >
            <ArrowLeft size={16} strokeWidth={1.8} />
            Homepage
          </button>
        </div>

        <div className="catalog-fade rounded-[30px] border border-white/70 bg-white/65 p-5 shadow-[0_16px_45px_rgba(0,0,0,0.06)] backdrop-blur-xl md:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-black/5 bg-white/70 px-3.5 py-1.5 text-xs font-medium text-neutral-600 shadow-sm">
                <Layers size={14} strokeWidth={1.8} />
                Catalog Library
              </div>

              <h1 className="max-w-4xl text-[42px] font-light leading-[0.92] tracking-[-0.075em] md:text-[76px]">
                Choose catalog 
                <span className="font-semibold tracking-[-0.08em]">faster.</span>
              </h1>

              <p className="mt-3 max-w-3xl text-[14px] leading-6 text-neutral-500 md:text-base">
                One editable hub for launch assets, finished references, and reusable design folders.
              </p>
            </div>

            <div className="w-full lg:max-w-xl">
              <div className="flex items-center gap-3 rounded-2xl border border-black/5 bg-white/82 px-4 py-3 shadow-sm">
                <Search size={20} strokeWidth={1.8} className="text-neutral-400" />
                <input
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search catalog, SKU, LP, exposure..."
                  className="w-full bg-transparent text-sm outline-none placeholder:text-neutral-400 md:text-[15px]"
                />
              </div>

              <div className="mt-3 flex flex-wrap justify-end gap-2">
                {editMode && (
                  <>
                    <button
                      onClick={onOpenTrash}
                      className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold text-neutral-600 shadow-sm hover:text-neutral-950"
                    >
                      <Trash2 size={15} />
                      Trash {trashCount}
                    </button>

                    <button
                      onClick={onUndoTrash}
                      disabled={!canUndo}
                      className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-neutral-600 shadow-sm hover:text-neutral-950 disabled:cursor-not-allowed disabled:opacity-35"
                    >
                      Undo
                    </button>

                    <button
                      onClick={onRedoTrash}
                      disabled={!canRedo}
                      className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-neutral-600 shadow-sm hover:text-neutral-950 disabled:cursor-not-allowed disabled:opacity-35"
                    >
                      Redo
                    </button>
                  </>
                )}

                <button
                  onClick={onUnlock}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold shadow-sm ${
                    editMode
                      ? "bg-neutral-950 text-white"
                      : "bg-white text-neutral-600 hover:text-neutral-950"
                  }`}
                >
                  {editMode ? <Unlock size={15} /> : <Lock size={15} />}
                  {editMode ? "Edit Mode On" : "Unlock Edit"}
                </button>

                {editMode && (
                  <button
                    onClick={onAddCatalog}
                    className="inline-flex items-center gap-2 rounded-full bg-neutral-950 px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-800"
                  >
                    <Plus size={15} />
                    Add Catalog
                  </button>
                )}

                {syncing && (
                  <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold text-neutral-400 shadow-sm">
                    <Loader2 size={14} className="animate-spin" />
                    Sync
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="catalog-scroll min-h-0 flex-1 overflow-y-auto pr-0 lg:pr-2">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-400">
              Main Catalog
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-[-0.05em]">
              {catalogs.length} catalogs
            </h2>
          </div>
        </div>

        {catalogs.length === 0 ? (
          <div className="rounded-[30px] border border-white/70 bg-white/62 p-10 text-center shadow-[0_18px_55px_rgba(0,0,0,0.055)] backdrop-blur-xl">
            <Layers className="mx-auto text-neutral-300" size={42} />
            <h3 className="mt-4 text-2xl font-semibold tracking-[-0.05em]">
              No catalog found
            </h3>
            <p className="mt-2 text-sm text-neutral-500">Unlock edit mode and create your first catalog.</p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {catalogs.map((catalog, index) => (
              <CatalogCard
                key={catalog.id}
                catalog={catalog}
                index={index}
                editMode={editMode}
                onOpen={() => onOpenCatalog(catalog.id)}
                onDelete={() => onDeleteCatalog(catalog)}
                onMove={(placement) => onMoveCatalog(catalog.id, placement)}
                onTogglePin={() => onTogglePinCatalog?.(catalog.id)}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function CatalogCard({ catalog, index, editMode, onOpen, onDelete, onMove, onTogglePin }) {
  const cover = getCatalogCover(catalog);

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen();
        }
      }}
      className="catalog-fade group relative min-h-[290px] cursor-pointer overflow-hidden rounded-[32px] border border-white/70 bg-white/70 p-5 text-left shadow-[0_18px_55px_rgba(0,0,0,0.06)] backdrop-blur-xl transition duration-500 hover:-translate-y-1 hover:bg-white active:scale-[0.985]"
      style={{ animationDelay: `${index * 70}ms` }}
    >
      {cover ? (
        <img
          src={cover}
          alt={catalog.title}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(0,0,0,0.07),transparent_36%),linear-gradient(135deg,rgba(255,255,255,.98),rgba(255,255,255,.72))]" />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-white/30" />

      <div className="relative z-10 flex h-full min-h-[250px] flex-col justify-between">
        <div className="flex items-start justify-between gap-4">
          <div className="grid h-12 w-12 place-items-center rounded-[18px] bg-white shadow-sm">
            <FolderOpen size={23} strokeWidth={1.8} />
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onTogglePin?.();
              }}
              className={`grid h-9 w-9 place-items-center rounded-full shadow-sm transition ${
                catalog.is_pinned
                  ? "bg-neutral-950 text-white"
                  : "bg-white/90 text-neutral-500 hover:bg-white hover:text-neutral-950"
              }`}
              title={catalog.is_pinned ? "Unpin catalog" : "Pin catalog to top"}
              aria-label={catalog.is_pinned ? "Unpin catalog" : "Pin catalog to top"}
            >
              <Pin size={15} fill={catalog.is_pinned ? "currentColor" : "none"} />
            </button>

            <span className="rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold text-neutral-500 shadow-sm">
              {catalog.badge || "CATALOG"}
            </span>

            {editMode && (
              <>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onMove("top");
                  }}
                  className="rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold text-neutral-500 shadow-sm hover:text-neutral-950"
                >
                  Top
                </button>

                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onMove("bottom");
                  }}
                  className="rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold text-neutral-500 shadow-sm hover:text-neutral-950"
                >
                  Bottom
                </button>

                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onDelete();
                  }}
                  className="grid h-8 w-8 place-items-center rounded-full bg-red-50 text-red-500 shadow-sm hover:bg-red-100"
                >
                  <Trash2 size={15} />
                </button>
              </>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-[32px] font-semibold leading-[0.98] tracking-[-0.06em]">
            {catalog.title}
          </h3>
          <p className="mt-3 line-clamp-2 text-sm leading-6 text-neutral-500">
            {catalog.subtitle}
          </p>

          <div className="mt-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-neutral-950 px-4 py-2 text-xs font-semibold text-white">
                {catalog.sections?.length || 0} sections · {countCatalogAssets(catalog)} assets
              </span>
              {catalog.is_pinned && (
                <span className="rounded-full bg-white/95 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-700 shadow-sm">
                  Pinned
                </span>
              )}
            </div>

            <span className="grid h-10 w-10 place-items-center rounded-full bg-white text-neutral-500 shadow-sm transition group-hover:translate-x-1 group-hover:text-neutral-950">
              <ArrowRight size={20} strokeWidth={1.8} />
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

function CatalogTopHero({
  catalog,
  search,
  setSearch,
  activeSection,
  setActiveSection,
  filteredCount,
  editMode,
  onBack,
  onUnlock,
  onUpdateCatalog,
  onCoverUpload,
  onSaveChanges,
  hasUnsavedChanges,
  syncing,
}) {
  const cover = getCatalogCover(catalog);

  return (
    <div className="shrink-0 pb-3">
      <div className="mb-3 flex items-center justify-between lg:hidden">
        <button
          onClick={onBack}
          className="flex items-center gap-2 rounded-full border border-black/5 bg-white/80 px-4 py-2 text-xs font-medium text-neutral-600 shadow-sm transition active:scale-[0.98]"
        >
          <ArrowLeft size={16} strokeWidth={1.8} />
          Catalog Home
        </button>

        <div className="rounded-full bg-white/80 px-4 py-2 text-xs font-medium text-neutral-500 shadow-sm">
          {filteredCount} assets
        </div>
      </div>

      <div className="catalog-fade rounded-[30px] border border-white/70 bg-white/65 p-4 shadow-[0_16px_45px_rgba(0,0,0,0.06)] backdrop-blur-xl">
        <div className="grid gap-4 lg:grid-cols-[1.05fr_1.55fr] lg:items-center">
          <div className="min-w-0">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-black/5 bg-white/70 px-3.5 py-1.5 text-xs font-medium text-neutral-600 shadow-sm">
              <FolderOpen size={14} strokeWidth={1.8} />
              {editMode ? "EDITABLE CATALOG" : catalog.badge || "CATALOG"}
            </div>

            {editMode ? (
              <div className="space-y-3">
                <input
                  value={catalog.title}
                  onChange={(event) => onUpdateCatalog({ title: event.target.value })}
                  className="catalog-input !rounded-[22px] !px-4 !py-3 text-[34px] font-semibold tracking-[-0.07em] md:text-[42px]"
                />
                <input
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                  value={catalog.subtitle}
                  onChange={(event) => onUpdateCatalog({ subtitle: event.target.value })}
                  className="catalog-input"
                  placeholder="Catalog subtitle"
                />
                <input
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                  value={catalog.badge || ""}
                  onChange={(event) => onUpdateCatalog({ badge: event.target.value })}
                  className="catalog-input"
                  placeholder="Badge"
                />
              </div>
            ) : (
              <>
                <h1 className="max-w-4xl text-[34px] font-light leading-[0.92] tracking-[-0.075em] md:text-[58px] xl:text-[64px]">
                  {catalog.title} 
                  <span className="font-semibold tracking-[-0.08em]">assets.</span>
                </h1>

                <p className="mt-2 max-w-2xl text-[13px] leading-5 text-neutral-500 md:text-[15px] md:leading-6">
                  {catalog.subtitle}
                </p>
              </>
            )}
          </div>

          <div className="relative">
            <div className="relative h-[150px] overflow-hidden rounded-[28px] border border-black/5 bg-white md:h-[178px]">
              {cover ? (
                <img
                  src={cover}
                  alt={catalog.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,rgba(255,255,255,0.95),rgba(255,255,255,0.58))] text-neutral-300">
                  <ImageIcon size={34} />
                </div>
              )}

              <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/10" />

              {editMode && (
                <label className="absolute right-4 top-4 grid h-10 w-10 cursor-pointer place-items-center rounded-full bg-white/92 text-neutral-600 shadow-sm transition hover:bg-neutral-950 hover:text-white">
                  {syncing ? <Loader2 size={17} className="animate-spin" /> : <UploadCloud size={17} />}
                  <input
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                    type="file"
                    accept="image/png"
                    className="hidden"
                    onChange={onCoverUpload}
                  />
                </label>
              )}
            </div>

            <div className="mt-3 lg:absolute lg:bottom-4 lg:right-4 lg:mt-0 lg:w-[78%] xl:w-[73%]">
              <div className="flex items-center gap-3 rounded-2xl border border-black/5 bg-white/90 px-4 py-2.5 shadow-sm backdrop-blur-xl">
                <Search size={20} strokeWidth={1.8} className="text-neutral-400" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search catalog, SKU, LP, exposure, banner..."
                  className="w-full bg-transparent text-sm outline-none placeholder:text-neutral-400 md:text-[15px]"
                />
              </div>
            </div>

            {editMode && hasUnsavedChanges && (
              <button
                onClick={onSaveChanges}
                disabled={syncing}
                className="absolute right-11 -top-2 inline-flex h-10 items-center gap-2 rounded-full bg-emerald-600 px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-50"
                title="Save catalog changes"
              >
                {syncing ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                Save
              </button>
            )}

            <button
              onClick={onUnlock}
              className={`absolute -right-2 -top-2 grid h-10 w-10 place-items-center rounded-full shadow-sm transition ${
                editMode
                  ? "bg-neutral-950 text-white"
                  : "bg-white/92 text-neutral-600 hover:bg-neutral-950 hover:text-white"
              }`}
              title={editMode ? "Lock edit mode" : "Unlock edit mode"}
            >
              {editMode ? <Unlock size={17} /> : <Pencil size={17} />}
            </button>
          </div>
        </div>
      </div>

      <div className="catalog-scrollbar-hide mt-3 flex gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveSection("all")}
          className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium transition ${
            activeSection === "all"
              ? "border-black bg-black text-white"
              : "border-black/5 bg-white/80 text-neutral-500"
          }`}
        >
          <Folder className="h-[14px] w-[14px] shrink-0" strokeWidth={1.8} />
          All Assets
        </button>

        {(catalog.sections || []).map((section) => {
          const isActive = activeSection === section.id;

          return (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium transition ${
                isActive
                  ? "border-black bg-black text-white"
                  : "border-black/5 bg-white/80 text-neutral-500 hover:bg-white"
              }`}
            >
              <Folder className="h-[14px] w-[14px] shrink-0" strokeWidth={1.8} />
              {section.title}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CatalogAssetSection({
  section,
  index,
  editMode,
  onOpenAsset,
  onUpdateSection,
  onDeleteSection,
  onAddAsset,
  onUpdateAsset,
  onDeleteAsset,
  onMoveSection,
  onMoveAsset,
  onSoftSaveDraft,
}) {
  return (
    <div
      className="catalog-fade rounded-[30px] border border-white/70 bg-white/62 p-4 shadow-[0_18px_55px_rgba(0,0,0,0.055)] backdrop-blur-xl md:p-5"
      style={{ animationDelay: `${100 + index * 80}ms` }}
    >
      <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-[18px] bg-white shadow-sm">
            <FolderOpen className="h-[22px] w-[22px] shrink-0" strokeWidth={1.8} />
          </div>

          <div className="min-w-0 flex-1">
            {editMode ? (
              <div className="space-y-2">
                <input
                  value={section.title}
                  onChange={(event) => onUpdateSection(section.id, { title: event.target.value })}
                  onBlur={onSoftSaveDraft}
                  className="catalog-input"
                  placeholder="Section title"
                />
                <input
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                  value={section.subtitle || ""}
                  onChange={(event) => onUpdateSection(section.id, { subtitle: event.target.value })}
                  onBlur={onSoftSaveDraft}
                  className="catalog-input"
                  placeholder="Section subtitle"
                />
              </div>
            ) : (
              <>
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-400">
                  Section
                </p>
                <h3 className="text-2xl font-semibold tracking-[-0.055em]">
                  {section.title}
                </h3>
                <p className="mt-1 text-sm text-neutral-500">{section.subtitle}</p>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-wrap justify-end gap-2">
          <div className="rounded-full bg-white px-4 py-2 text-xs font-medium text-neutral-500 shadow-sm">
            {section.items?.length || 0} folders
          </div>

          {editMode && (
            <>
              <button
                onClick={() => onMoveSection(section.id, "top")}
                className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-neutral-600 shadow-sm hover:text-neutral-950"
              >
                Move Top
              </button>

              <button
                onClick={() => onMoveSection(section.id, "bottom")}
                className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-neutral-600 shadow-sm hover:text-neutral-950"
              >
                Move Bottom
              </button>

              <button
                onClick={() => onAddAsset(section.id)}
                className="inline-flex items-center gap-2 rounded-full bg-neutral-950 px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-800"
              >
                <Plus size={15} />
                Add Asset
              </button>

              <button
                onClick={() => onDeleteSection(section)}
                className="grid h-9 w-9 place-items-center rounded-full bg-red-50 text-red-600 hover:bg-red-100"
                title="Delete section"
              >
                <Trash2 size={16} />
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {(section.items || []).map((asset) => (
          <CatalogAssetCard
            key={asset.id}
            section={section}
            asset={asset}
            editMode={editMode}
            onOpenAsset={onOpenAsset}
            onUpdateAsset={onUpdateAsset}
            onDeleteAsset={onDeleteAsset}
            onMoveAsset={onMoveAsset}
            onSoftSaveDraft={onSoftSaveDraft}
          />
        ))}
      </div>
    </div>
  );
}

function CatalogAssetCard({
  section,
  asset,
  editMode,
  onOpenAsset,
  onUpdateAsset,
  onDeleteAsset,
  onMoveAsset,
  onSoftSaveDraft,
}) {
  if (editMode) {
    return (
      <div className="rounded-[24px] border border-black/5 bg-white/72 p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-[16px] bg-neutral-100 text-neutral-800">
            <FolderOpen className="h-[19px] w-[19px] shrink-0" strokeWidth={1.8} />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onMoveAsset(section.id, asset.id, "top")}
              className="rounded-full bg-neutral-100 px-3 py-2 text-[11px] font-semibold text-neutral-600 hover:bg-neutral-200"
            >
              Top
            </button>

            <button
              onClick={() => onMoveAsset(section.id, asset.id, "bottom")}
              className="rounded-full bg-neutral-100 px-3 py-2 text-[11px] font-semibold text-neutral-600 hover:bg-neutral-200"
            >
              Bottom
            </button>

            <button
              onClick={() => onDeleteAsset(section, asset)}
              className="grid h-9 w-9 place-items-center rounded-full bg-red-50 text-red-600 hover:bg-red-100"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <input
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
            value={asset.name || ""}
            onChange={(event) => onUpdateAsset(section.id, asset.id, { name: event.target.value })}
            onBlur={onSoftSaveDraft}
            className="catalog-input"
            placeholder="Asset name"
          />
          <input
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
            value={asset.type || ""}
            onChange={(event) => onUpdateAsset(section.id, asset.id, { type: event.target.value })}
            onBlur={onSoftSaveDraft}
            className="catalog-input"
            placeholder="Type"
          />
          <input
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
            value={asset.url || ""}
            onChange={(event) => onUpdateAsset(section.id, asset.id, { url: event.target.value })}
            onBlur={onSoftSaveDraft}
            className="catalog-input"
            placeholder="Drive / link URL"
          />
        </div>
      </div>
    );
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpenAsset(asset, section)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") onOpenAsset(asset, section);
      }}
      className="group flex min-h-[138px] cursor-pointer flex-col justify-between rounded-[24px] border border-black/5 bg-white/72 p-4 text-left shadow-sm transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_18px_45px_rgba(0,0,0,0.08)] active:scale-[0.985]"
    >
      <div>
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-[16px] bg-neutral-100 text-neutral-800 transition group-hover:bg-neutral-950 group-hover:text-white">
            <FolderOpen className="h-[19px] w-[19px] shrink-0" strokeWidth={1.8} />
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-full bg-neutral-100 px-3 py-1 text-[11px] font-medium text-neutral-500">
              {asset.type || "Asset"}
            </span>
          </div>
        </div>

        <h4 className="line-clamp-2 text-lg font-semibold leading-tight tracking-[-0.045em]">
          {asset.name || "Untitled Asset"}
        </h4>

        <p className="mt-2 truncate text-xs text-neutral-400">
          {section.title}
        </p>
      </div>

      <div className="mt-5 flex items-center justify-between">
        <span className="text-xs font-medium text-neutral-500">
          Open Link
        </span>

        <ArrowRight
          size={18}
          strokeWidth={1.8}
          className="text-neutral-400 transition group-hover:translate-x-1 group-hover:text-neutral-950"
        />
      </div>
    </div>
  );
}

function CatalogQualityPanel() {
  return (
    <div className="rounded-[30px] border border-white/70 bg-white/62 p-5 shadow-[0_18px_55px_rgba(0,0,0,0.06)] backdrop-blur-xl">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-400">
            Reminder
          </p>
          <h3 className="mt-1 text-2xl font-semibold tracking-[-0.055em]">
            Check before use.
          </h3>
        </div>

        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white shadow-sm">
          <ShieldCheck size={22} strokeWidth={1.8} />
        </div>
      </div>

      <div className="space-y-2">
        {[
          "Latest price and period",
          "Platform placement",
          "Correct SKU / product name",
          "Correct folder or catalog",
        ].map((item) => (
          <div
            key={item}
            className="flex items-center gap-3 rounded-2xl bg-white/72 px-4 py-3"
          >
            <CheckCircle2
              size={17}
              strokeWidth={1.8}
              className="text-neutral-500"
            />
            <p className="text-sm text-neutral-600">{item}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function CatalogQuickAccessPanel({ assets, onOpenAsset }) {
  return (
    <div className="mt-5 rounded-[30px] border border-white/70 bg-white/62 p-5 shadow-[0_18px_55px_rgba(0,0,0,0.055)] backdrop-blur-xl">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-400">
            Quick Access
          </p>
          <h3 className="mt-1 text-xl font-semibold tracking-[-0.045em]">
            Priority
          </h3>
        </div>

        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white shadow-sm">
          <FolderOpen className="h-[20px] w-[20px] shrink-0" strokeWidth={1.8} />
        </div>
      </div>

      <div className="space-y-2">
        {assets.map((asset) => (
          <button
            key={`quick-${asset.sectionTitle}-${asset.id}`}
            onClick={() => onOpenAsset(asset, { id: asset.sectionId, title: asset.sectionTitle, items: [] })}
            className="group flex w-full items-center justify-between gap-3 rounded-2xl px-3 py-3 text-left transition hover:bg-white"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{asset.name}</p>
              <p className="mt-0.5 truncate text-xs text-neutral-400">
                {asset.type}
              </p>
            </div>

            <ExternalLink
              size={17}
              strokeWidth={1.8}
              className="shrink-0 text-neutral-400 transition group-hover:text-neutral-950"
            />
          </button>
        ))}
      </div>
    </div>
  );
}

function CatalogEmptyState({ search }) {
  return (
    <div className="rounded-[30px] border border-white/70 bg-white/62 p-8 text-center shadow-[0_18px_55px_rgba(0,0,0,0.06)] backdrop-blur-xl">
      <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-white shadow-sm">
        <Search size={24} strokeWidth={1.8} />
      </div>

      <h3 className="text-xl font-semibold tracking-[-0.04em]">
        No asset found
      </h3>

      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-neutral-500">
        No result for “{search}”. Try keyword like SKU, LP, Exposure, Akulaku,
        Tokopedia, or SBD.
      </p>
    </div>
  );
}

function UnlockModal({ code, setCode, error, onUnlock, onClose }) {
  return (
    <div className="fixed inset-0 z-[1000] grid place-items-center bg-black/25 px-5 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-[30px] border border-black/5 bg-white p-6 shadow-[0_35px_100px_rgba(0,0,0,0.22)]">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-neutral-100">
            <Lock size={23} strokeWidth={1.8} />
          </div>

          <button
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-full bg-neutral-100 text-neutral-500 transition hover:bg-neutral-200 hover:text-neutral-950"
          >
            <X size={20} strokeWidth={1.8} />
          </button>
        </div>

        <h3 className="text-2xl font-semibold tracking-[-0.05em]">
          Unlock edit mode
        </h3>

        <p className="mt-2 text-sm leading-6 text-neutral-500">
          Masukkan kode internal untuk edit catalog.
        </p>

        <input
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
          type="password"
          value={code}
          onChange={(event) => setCode(event.target.value)}
          onKeyDown={(event) => event.key === "Enter" && onUnlock()}
          placeholder="•••"
          className="catalog-input mt-5 text-center"
        />

        {error && (
          <p className="mt-3 rounded-2xl bg-red-50 px-4 py-3 text-center text-xs font-semibold text-red-600">
            {error}
          </p>
        )}

        <button
          onClick={onUnlock}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-neutral-950 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-neutral-800 active:scale-95"
        >
          <Unlock size={17} />
          Unlock
        </button>
      </div>
    </div>
  );
}

function CatalogCreateModal({ draft, setDraft, onClose, onCreate, syncing }) {
  return (
    <div className="fixed inset-0 z-[1000] grid place-items-center bg-black/25 px-5 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-[30px] border border-black/5 bg-white p-6 shadow-[0_35px_100px_rgba(0,0,0,0.22)]">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-neutral-100">
            <Plus size={23} strokeWidth={1.8} />
          </div>

          <button
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-full bg-neutral-100 text-neutral-500 transition hover:bg-neutral-200 hover:text-neutral-950"
          >
            <X size={20} strokeWidth={1.8} />
          </button>
        </div>

        <h3 className="text-2xl font-semibold tracking-[-0.05em]">
          Add new catalog
        </h3>

        <div className="mt-5 space-y-3">
          <input
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
            value={draft.title}
            onChange={(event) => setDraft((prev) => ({ ...prev, title: event.target.value }))}
            placeholder="Catalog title"
            className="catalog-input"
          />

          <input
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
            value={draft.subtitle}
            onChange={(event) => setDraft((prev) => ({ ...prev, subtitle: event.target.value }))}
            placeholder="Catalog subtitle"
            className="catalog-input"
          />

          <input
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
            value={draft.badge}
            onChange={(event) => setDraft((prev) => ({ ...prev, badge: event.target.value }))}
            placeholder="Badge"
            className="catalog-input"
          />
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-2xl border border-black/10 bg-white px-5 py-3.5 text-sm font-medium transition hover:bg-neutral-100 active:scale-95"
          >
            Cancel
          </button>

          <button
            onClick={onCreate}
            disabled={syncing}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-black px-5 py-3.5 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:opacity-50 active:scale-95"
          >
            {syncing ? <Loader2 size={17} className="animate-spin" /> : <Save size={17} />}
            Create
          </button>
        </div>
      </div>
    </div>
  );
}

function SectionCreateModal({ draft, setDraft, onClose, onCreate, syncing }) {
  return (
    <div className="fixed inset-0 z-[1000] grid place-items-center bg-black/25 px-5 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-[30px] border border-black/5 bg-white p-6 shadow-[0_35px_100px_rgba(0,0,0,0.22)]">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-neutral-100">
            <Plus size={23} strokeWidth={1.8} />
          </div>

          <button
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-full bg-neutral-100 text-neutral-500 transition hover:bg-neutral-200 hover:text-neutral-950"
          >
            <X size={20} strokeWidth={1.8} />
          </button>
        </div>

        <h3 className="text-2xl font-semibold tracking-[-0.05em]">
          Add new section
        </h3>

        <p className="mt-2 text-sm leading-6 text-neutral-500">
          Create a section first, then add asset folders inside it.
        </p>

        <div className="mt-5 space-y-3">
          <input
            value={draft.title}
            onChange={(event) =>
              setDraft((prev) => ({ ...prev, title: event.target.value }))
            }
            className="catalog-input"
            placeholder="Section title"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
          />

          <input
            value={draft.subtitle}
            onChange={(event) =>
              setDraft((prev) => ({ ...prev, subtitle: event.target.value }))
            }
            className="catalog-input"
            placeholder="Section subtitle"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
          />
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            onClick={onClose}
            disabled={syncing}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-neutral-100 px-5 py-3.5 text-sm font-semibold text-neutral-600 transition hover:bg-neutral-200 hover:text-neutral-950 active:scale-95 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            onClick={onCreate}
            disabled={syncing}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-neutral-950 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-neutral-800 active:scale-95 disabled:opacity-50"
          >
            {syncing ? <Loader2 size={17} className="animate-spin" /> : <Plus size={17} />}
            Create Section
          </button>
        </div>
      </div>
    </div>
  );
}


function DeleteConfirmModal({ title, message, onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 z-[1000] grid place-items-center bg-black/25 px-5 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[30px] border border-black/5 bg-white p-6 text-center shadow-[0_35px_100px_rgba(0,0,0,0.22)]">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-red-50 text-red-600">
          <Trash2 size={22} />
        </div>

        <h3 className="mt-4 text-2xl font-semibold tracking-[-0.05em]">
          Move {title} to Trash?
        </h3>

        <p className="mt-3 text-sm leading-6 text-neutral-500">
          {message}
        </p>

        <div className="mt-6 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 rounded-2xl border border-black/10 bg-white px-5 py-3.5 text-sm font-medium transition hover:bg-neutral-100 active:scale-95"
          >
            No
          </button>

          <button
            onClick={onConfirm}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 py-3.5 text-sm font-medium text-white transition hover:bg-red-700 active:scale-95"
          >
            Yes, Move
          </button>
        </div>
      </div>
    </div>
  );
}

function TrashModal({ items, onClose, onRestore, onPermanentDelete }) {
  const [permanentTarget, setPermanentTarget] = useState(null);

  return (
    <div className="fixed inset-0 z-[1000] grid place-items-center bg-black/25 px-5 backdrop-blur-sm">
      <div className="flex max-h-[82vh] w-full max-w-3xl flex-col overflow-hidden rounded-[30px] border border-black/5 bg-[#f5f5f3]/96 p-6 shadow-[0_35px_100px_rgba(0,0,0,0.22)]">
        <div className="mb-5 flex items-start justify-between gap-4 border-b border-black/5 pb-4">
          <div>
            <div className="mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-white shadow-sm">
              <Trash2 size={22} strokeWidth={1.8} />
            </div>
            <h3 className="text-2xl font-semibold tracking-[-0.05em]">Catalog Trash</h3>
            <p className="mt-2 text-sm leading-6 text-neutral-500">
              Item yang kehapus masuk sini dulu. Restore kapan aja, jadi catalog aman gak ilang permanen.
            </p>
          </div>

          <button
            onClick={onClose}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-neutral-500 shadow-sm transition hover:bg-neutral-100 hover:text-neutral-950"
          >
            <X size={20} strokeWidth={1.8} />
          </button>
        </div>

        <div className="catalog-scroll min-h-0 flex-1 overflow-y-auto pr-1">
          {items.length === 0 ? (
            <div className="rounded-[26px] border border-dashed border-black/10 bg-white/70 p-8 text-center">
              <Trash2 className="mx-auto text-neutral-300" size={34} />
              <h4 className="mt-4 text-xl font-semibold tracking-[-0.04em]">Trash masih kosong</h4>
              <p className="mt-2 text-sm text-neutral-500">Item yang dihapus akan muncul di sini dulu.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-3 rounded-[24px] border border-white/70 bg-white/78 p-4 shadow-sm md:flex-row md:items-center md:justify-between"
                >
                  <div className="min-w-0">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-neutral-950 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-white">
                        {item.type}
                      </span>
                      <span className="text-xs font-medium text-neutral-400">
                        {formatTrashDate(item.created_at)}
                      </span>
                    </div>

                    <h4 className="truncate text-lg font-semibold tracking-[-0.04em]">{item.title}</h4>

                    <p className="mt-1 text-xs leading-5 text-neutral-500">
                      {item.type === "catalog" && "Full catalog with all sections/assets."}
                      {item.type === "section" && `From ${item.meta?.catalogTitle || "catalog"}.`}
                      {item.type === "asset" && `From ${item.meta?.catalogTitle || "catalog"} · ${item.meta?.sectionTitle || "section"}.`}
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
              ))}
            </div>
          )}
        </div>

        <div className="mt-5 rounded-2xl bg-white/70 px-4 py-3 text-xs leading-5 text-neutral-500">
          Trash ini sudah online di Supabase. Restore/Delete Permanent akan ikut berubah untuk semua user.
        </div>
      </div>

      {permanentTarget && (
        <div className="fixed inset-0 z-[1001] grid place-items-center bg-black/30 px-5 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[30px] border border-black/5 bg-white p-6 text-center shadow-[0_35px_100px_rgba(0,0,0,0.22)]">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-red-50 text-red-600">
              <Trash2 size={22} />
            </div>

            <h3 className="mt-4 text-2xl font-semibold tracking-[-0.05em]">
              Delete permanent?
            </h3>

            <p className="mt-3 text-sm leading-6 text-neutral-500">
              "{permanentTarget.title}" bakal dihapus permanen dari Trash dan tidak bisa di-restore lagi.
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
                  onPermanentDelete(permanentTarget.id);
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
    </div>
  );
}

function ConfirmOpenModal({ asset, onClose, onContinue }) {
  return (
    <div className="fixed inset-0 z-[1000] grid place-items-center bg-black/25 px-5 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[30px] border border-black/5 bg-white p-6 shadow-[0_35px_100px_rgba(0,0,0,0.22)]">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-neutral-100">
            <ShieldCheck size={24} strokeWidth={1.8} />
          </div>

          <button
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-full bg-neutral-100 text-neutral-500 transition hover:bg-neutral-200 hover:text-neutral-950"
          >
            <X size={20} strokeWidth={1.8} />
          </button>
        </div>

        <h3 className="text-2xl font-semibold tracking-[-0.05em]">
          Open this folder?
        </h3>

        <p className="mt-3 text-sm leading-6 text-neutral-500">
          Make sure you are opening the correct catalog asset folder before downloading or sharing the material.
        </p>

        <div className="mt-5 rounded-2xl border border-black/5 bg-neutral-50 p-4">
          <p className="text-sm font-medium">{asset.name}</p>
          <p className="mt-1 text-xs text-neutral-500">
            {asset.sectionTitle} · {asset.type}
          </p>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-2xl border border-black/10 bg-white px-5 py-3.5 text-sm font-medium transition hover:bg-neutral-100 active:scale-95"
          >
            Cancel
          </button>

          <button
            onClick={onContinue}
            disabled={!asset.url}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-black px-5 py-3.5 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-40 active:scale-95"
          >
            <ExternalLink size={17} strokeWidth={1.8} />
            Open
          </button>
        </div>
      </div>
    </div>
  );
}
