import React, { useMemo, useState } from "react";
import {
  Search,
  Rocket,
  FileText,
  CalendarDays,
  StickyNote,
  Layers,
  ArrowRight,
  ArrowLeft,
  ExternalLink,
  ShieldCheck,
  Plus,
  ChevronRight,
  X,
  LayoutDashboard,
  MonitorSmartphone,
  ShoppingBag,
  Boxes,
  Grid2X2,
} from "lucide-react";

/**
 * Frontpage.jsx
 * Clean ADF System Front Page
 *
 * Update:
 * - Left sidebar standby / fixed.
 * - Top hero standby / fixed.
 * - Hero height reduced around 30%.
 * - Scroll only inside folder content area.
 * - Stats cards removed.
 * - SBD group removed from P4 content.
 */

const BACK_TO_POPUP_URL = "/popup";

const fiturfrontTheme = {
  white: {
    card: "border-white/70 bg-white/70 shadow-[0_18px_55px_rgba(0,0,0,0.06)]",
    icon: "bg-white text-neutral-900 border-black/5",
    chip: "bg-white/80 text-neutral-600 border-black/5",
  },
  gray: {
    card: "border-white/70 bg-neutral-100/70 shadow-[0_18px_55px_rgba(0,0,0,0.055)]",
    icon: "bg-white text-neutral-900 border-black/5",
    chip: "bg-neutral-100 text-neutral-600 border-black/5",
  },
  black: {
    card: "border-black/10 bg-neutral-950 text-white shadow-[0_18px_55px_rgba(0,0,0,0.18)]",
    icon: "bg-white text-neutral-900 border-white/10",
    chip: "bg-white/10 text-white/75 border-white/10",
  },
  green: {
    card: "border-emerald-100 bg-white/70 shadow-[0_18px_55px_rgba(16,185,129,0.08)]",
    icon: "bg-emerald-50 text-emerald-700 border-emerald-100",
    chip: "bg-emerald-50 text-emerald-700 border-emerald-100",
  },
  red: {
    card: "border-red-100 bg-white/70 shadow-[0_18px_55px_rgba(239,68,68,0.08)]",
    icon: "bg-red-50 text-red-600 border-red-100",
    chip: "bg-red-50 text-red-600 border-red-100",
  },
};

const fiturfrontMenu = [
  {
    id: "overview",
    label: "Overview",
    icon: LayoutDashboard,
  },
  {
    id: "launch",
    label: "New Launch",
    icon: Rocket,
  },
  {
    id: "request",
    label: "Request Design",
    icon: FileText,
  },
  {
    id: "calendar",
    label: "Project Calendar",
    icon: CalendarDays,
  },
  {
    id: "notes",
    label: "Notes",
    icon: StickyNote,
  },
  {
    id: "catalog",
    label: "Catalog",
    icon: Layers,
  },
];

const fiturfrontFolders = [
  {
    id: "p4-series",
    type: "launch",
    headline: "NEW UPDATE",
    title: "P4 Series Assets",
    desc: "Main launch materials for P4 Series. LP, SKU, discovery, exposure, and campaign assets.",
    date: "Jul 2026",
    count: 7,
    theme: "red",
    icon: ShoppingBag,
    groups: [
      {
        title: "New Update",
        desc: "Priority assets for launch and price reveal.",
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
        title: "SKU Loriket",
        desc: "Product description and slide materials.",
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
        title: "SKU",
        desc: "Regular SKU, KOL, NAD, gift box, and angle materials.",
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
        title: "Payday Banner",
        desc: "Payday campaign banner materials.",
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
        title: "Landing Page Payday & Warm Up",
        desc: "LP materials for marketplace and blind teasing.",
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
        title: "Exposure",
        desc: "Exposure materials for marketplace pages.",
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
    ],
  },
  {
    id: "request-design",
    type: "request",
    headline: "WORKFLOW",
    title: "Request Design",
    desc: "Create request, review list, attach notes, files, and design brief.",
    date: "Today",
    count: 4,
    theme: "white",
    icon: FileText,
    groups: [
      {
        title: "Request Tools",
        desc: "Tools for daily request management.",
        items: [
          {
            name: "Create New Request",
            type: "Request Design",
            url: "#request-design",
          },
          {
            name: "Edit Request List",
            type: "Edit Request",
            url: "#edit-request",
          },
          {
            name: "Upload Brief File",
            type: "PDF / JPG / PNG",
            url: "#upload-brief",
          },
          {
            name: "Request Archive",
            type: "Archive",
            url: "#request-archive",
          },
        ],
      },
    ],
  },
  {
    id: "calendar-project",
    type: "calendar",
    headline: "PROJECT",
    title: "Project Calendar",
    desc: "Check timeline, highlight important dates, and keep project notes aligned.",
    date: "This Month",
    count: 12,
    theme: "green",
    icon: CalendarDays,
    groups: [
      {
        title: "Calendar Access",
        desc: "Project timeline and daily task notes.",
        items: [
          {
            name: "Open Project Calendar",
            type: "Calendar",
            url: "#project-calendar",
          },
          {
            name: "Highlight Important Date",
            type: "Highlight",
            url: "#calendar-highlight",
          },
          {
            name: "Project Recap",
            type: "Recap",
            url: "#calendar-recap",
          },
        ],
      },
    ],
  },
  {
    id: "note-page",
    type: "notes",
    headline: "DAILY",
    title: "Project Notes",
    desc: "Quick notes based on uploaded materials, campaign updates, and daily reminders.",
    date: "Live",
    count: 6,
    theme: "white",
    icon: StickyNote,
    groups: [
      {
        title: "Notes Access",
        desc: "Shortcut to daily notes and material update log.",
        items: [
          {
            name: "Open Notes",
            type: "Notes",
            url: "#notes",
          },
          {
            name: "Material Update Log",
            type: "Update Log",
            url: "#update-log",
          },
          {
            name: "Daily Reminder",
            type: "Reminder",
            url: "#daily-reminder",
          },
        ],
      },
    ],
  },
  {
    id: "catalog-page",
    type: "catalog",
    headline: "REFERENCE",
    title: "Design Catalog",
    desc: "Browse finished design references and reusable visual direction.",
    date: "Library",
    count: 4,
    theme: "gray",
    icon: Layers,
    image: "/brand/catalog1.png",
    groups: [
      {
        title: "Catalog Preview",
        desc: "Image reference from public/brand.",
        items: [
          {
            name: "Catalog 1",
            type: "Preview",
            url: "/brand/catalog1.png",
          },
          {
            name: "Catalog 2",
            type: "Preview",
            url: "/brand/catalog2.png",
          },
          {
            name: "Catalog 3",
            type: "Preview",
            url: "/brand/catalog3.png",
          },
          {
            name: "Catalog 4",
            type: "Preview",
            url: "/brand/catalog4.png",
          },
        ],
      },
    ],
  },
];

function getAllItems(folders) {
  return folders.flatMap((folder) =>
    folder.groups.flatMap((group) =>
      group.items.map((item) => ({
        ...item,
        folderTitle: folder.title,
        groupTitle: group.title,
        folderTheme: folder.theme,
      }))
    )
  );
}

function navigateApp(path) {
  if (!path) return;

  if (window.ADFNavigate) {
    window.ADFNavigate(path);
    return;
  }

  window.location.href = path;
}

function openRequestPage(menu = "request") {
  try {
    sessionStorage.setItem("adf_request_default_menu", menu);
  } catch {
    // ignore storage error
  }

  navigateApp("/requestpage");
}

const FRONTPAGE_APP_LINKS = {
  "#request-design": {
    label: "Open Request Design",
    action: () => openRequestPage("request"),
  },
  "#edit-request": {
    label: "Open Edit Request",
    action: () => openRequestPage("edit"),
  },
  "#upload-brief": {
    label: "Open Upload Brief",
    action: () => openRequestPage("request"),
  },
  "#request-archive": {
    label: "Open Request Archive",
    action: () => openRequestPage("edit"),
  },
  "#project-calendar": {
    label: "Open Project Calendar",
    action: () => openRequestPage("calendar"),
  },
  "#calendar-highlight": {
    label: "Open Calendar Highlight",
    action: () => openRequestPage("calendar"),
  },
  "#calendar-recap": {
    label: "Open Calendar Recap",
    action: () => openRequestPage("calendar"),
  },
  "#notes": {
    label: "Open ADF Note",
    action: () => openRequestPage("notes"),
  },
  "#update-log": {
    label: "Open Material Update Log",
    action: () => openRequestPage("notes"),
  },
  "#daily-reminder": {
    label: "Open Daily Reminder",
    action: () => openRequestPage("notes"),
  },
};

export default function Frontpage() {
  const [activeMenu, setActiveMenu] = useState("overview");
  const [search, setSearch] = useState("");
  const [selectedFolder, setSelectedFolder] = useState(fiturfrontFolders[0]);
  const [confirmData, setConfirmData] = useState(null);

  const allItems = useMemo(() => getAllItems(fiturfrontFolders), []);

  const filteredFolders = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return fiturfrontFolders.filter((folder) => {
      const matchFolder =
        folder.title.toLowerCase().includes(keyword) ||
        folder.desc.toLowerCase().includes(keyword) ||
        folder.headline.toLowerCase().includes(keyword);

      const matchItems = folder.groups.some((group) =>
        group.items.some(
          (item) =>
            item.name.toLowerCase().includes(keyword) ||
            item.type.toLowerCase().includes(keyword)
        )
      );

      const matchMenu =
        activeMenu === "overview" ||
        folder.type === activeMenu ||
        (activeMenu === "launch" && folder.type === "launch");

      if (!keyword) return matchMenu;
      return matchMenu && (matchFolder || matchItems);
    });
  }, [search, activeMenu]);

  const recentItems = allItems.slice(0, 6);

  const handleBackToPopup = () => {
    navigateApp(BACK_TO_POPUP_URL);
  };

  const handleMenuClick = (menuId) => {
    if (menuId === "overview") {
      setActiveMenu("overview");
      setSelectedFolder(fiturfrontFolders[0]);
      return;
    }

    if (menuId === "launch") {
      navigateApp("/p4series");
      return;
    }

    if (menuId === "request") {
      openRequestPage("request");
      return;
    }

    if (menuId === "calendar") {
      openRequestPage("calendar");
      return;
    }

    if (menuId === "notes") {
      openRequestPage("notes");
      return;
    }

    if (menuId === "catalog") {
      navigateApp("/catalog");
      return;
    }

    setActiveMenu(menuId);
  };

  const openConfirm = (item) => {
    setConfirmData(item);
  };

  const handleContinue = () => {
    if (!confirmData?.url) return;

    const appLink = FRONTPAGE_APP_LINKS[confirmData.url];

    if (appLink) {
      appLink.action();
      setConfirmData(null);
      return;
    }

    if (confirmData.url.startsWith("/")) {
      window.open(confirmData.url, "_blank", "noopener,noreferrer");
      setConfirmData(null);
      return;
    }

    if (confirmData.url.startsWith("http")) {
      window.open(confirmData.url, "_blank", "noopener,noreferrer");
      setConfirmData(null);
      return;
    }

    setConfirmData(null);
  };

  return (
    <div className="h-screen overflow-hidden bg-[#f5f5f3] text-neutral-950">
      <style>{`
        @keyframes fiturfrontFloat {
          0%, 100% { transform: translate3d(0,0,0) scale(1); }
          50% { transform: translate3d(18px,-20px,0) scale(1.035); }
        }

        @keyframes fiturfrontFloatReverse {
          0%, 100% { transform: translate3d(0,0,0) scale(1); }
          50% { transform: translate3d(-22px,18px,0) scale(1.04); }
        }

        @keyframes fiturfrontFadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .fiturfront-fade {
          animation: fiturfrontFadeUp .58s cubic-bezier(.16,1,.3,1) both;
        }

        .fiturfront-scroll::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        .fiturfront-scroll::-webkit-scrollbar-track {
          background: transparent;
        }

        .fiturfront-scroll::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,.12);
          border-radius: 999px;
        }

        .fiturfront-scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        .fiturfront-scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -left-32 top-10 h-[360px] w-[360px] animate-[fiturfrontFloat_10s_ease-in-out_infinite] rounded-full bg-white blur-3xl" />
        <div className="absolute right-[-180px] top-[-130px] h-[520px] w-[520px] animate-[fiturfrontFloatReverse_13s_ease-in-out_infinite] rounded-full bg-white/90 blur-3xl" />
        <div className="absolute bottom-[-220px] left-[18%] h-[520px] w-[520px] animate-[fiturfrontFloat_12s_ease-in-out_infinite] rounded-full bg-white blur-3xl" />
      </div>

      <div className="relative z-10 flex h-screen overflow-hidden">
        <aside className="hidden h-screen w-[280px] shrink-0 p-5 lg:block">
          <Sidebar
            activeMenu={activeMenu}
            setActiveMenu={handleMenuClick}
            onBack={handleBackToPopup}
          />
        </aside>

        <main className="flex h-screen min-w-0 flex-1 flex-col overflow-hidden px-4 py-5 md:px-8 lg:px-6">
          <TopHeroBar
            search={search}
            setSearch={setSearch}
            activeMenu={activeMenu}
            setActiveMenu={handleMenuClick}
            onBack={handleBackToPopup}
          />

          <div className="fiturfront-scroll min-h-0 flex-1 overflow-y-auto pr-0 lg:pr-2">
            <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_390px]">
              <div>
                <div className="mb-4 flex items-end justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-400">
                      Main Access
                    </p>
                    <h2 className="mt-1 text-2xl font-semibold tracking-[-0.05em]">
                      Folders
                    </h2>
                  </div>

                  <p className="text-sm text-neutral-400">
                    {filteredFolders.length} shown
                  </p>
                </div>

                {filteredFolders.length === 0 ? (
                  <EmptyState search={search} />
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {filteredFolders.map((folder, index) => (
                      <FolderCard
                        key={folder.id}
                        folder={folder}
                        index={index}
                        isSelected={selectedFolder?.id === folder.id}
                        onClick={() => setSelectedFolder(folder)}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="lg:sticky lg:top-0 lg:h-fit">
                <FolderDetail
                  folder={selectedFolder}
                  onOpenItem={openConfirm}
                />

                <RecentPanel items={recentItems} onOpenItem={openConfirm} />
              </div>
            </section>
          </div>
        </main>
      </div>

      {confirmData && (
        <ConfirmModal
          item={confirmData}
          onClose={() => setConfirmData(null)}
          onContinue={handleContinue}
        />
      )}
    </div>
  );
}

function TopHeroBar({
  search,
  setSearch,
  activeMenu,
  setActiveMenu,
  onBack,
}) {
  return (
    <div className="shrink-0 pb-3 md:pb-4">
      <div className="mb-3 flex items-center justify-between lg:hidden">
        <button
          onClick={onBack}
          className="flex items-center gap-2 rounded-full border border-black/5 bg-white/80 px-4 py-2 text-xs font-medium text-neutral-600 shadow-sm transition active:scale-[0.98]"
        >
          <ArrowLeft size={16} strokeWidth={1.8} />
          Main Menu
        </button>

        <button
          onClick={() => navigateApp("/p4series")}
          className="grid h-10 w-10 place-items-center rounded-full bg-white/80 shadow-sm transition active:scale-[0.98]"
          title="Open P4 Series"
        >
          <Plus size={20} strokeWidth={1.8} />
        </button>
      </div>

      <div className="fiturfront-fade rounded-[26px] border border-white/70 bg-white/65 p-4 shadow-[0_16px_45px_rgba(0,0,0,0.06)] backdrop-blur-xl md:rounded-[30px] md:p-5 xl:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-black/5 bg-white/70 px-3.5 py-1.5 text-xs font-medium text-neutral-600 shadow-sm">
              <Grid2X2 size={14} strokeWidth={1.8} />
              Frontpage
            </div>

            <h1 className="max-w-4xl text-[34px] font-light leading-[0.95] tracking-[-0.075em] md:text-[56px] xl:text-[64px]">
              Manage design{" "}
              <span className="font-semibold tracking-[-0.08em]">
                faster.
              </span>
            </h1>

            <p className="mt-2 max-w-3xl text-[13px] leading-5 text-neutral-500 md:text-[15px] md:leading-6 xl:text-base">
              Access launch assets, request design, project calendar, notes,
              and catalog from one clean workspace.
            </p>
          </div>

          <div className="w-full lg:max-w-md xl:max-w-xl">
            <div className="flex items-center gap-3 rounded-2xl border border-black/5 bg-white/78 px-4 py-2.5 shadow-sm md:py-3">
              <Search
                size={20}
                strokeWidth={1.8}
                className="text-neutral-400"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search assets, SKU, LP..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-neutral-400 md:text-[15px]"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="fiturfront-scrollbar-hide mt-3 flex gap-2 overflow-x-auto pb-1 lg:hidden">
        {fiturfrontMenu.map((menu) => {
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

function Sidebar({ activeMenu, setActiveMenu, onBack }) {
  return (
    <div className="flex h-full flex-col rounded-[32px] border border-white/70 bg-white/62 p-4 shadow-[0_22px_70px_rgba(0,0,0,0.07)] backdrop-blur-xl">
      <button
        onClick={onBack}
        className="mb-4 flex items-center gap-2 rounded-2xl border border-black/5 bg-white/70 px-3 py-3 text-sm font-medium text-neutral-600 shadow-sm transition hover:bg-white hover:text-neutral-950 active:scale-[0.985]"
      >
        <ArrowLeft size={18} strokeWidth={1.8} />
        Main Menu
      </button>

      <div className="px-3 py-3">
        <div>
          <p className="text-[22px] font-semibold leading-tight tracking-[-0.05em]">
            ADF System
          </p>
          <p className="mt-1 text-sm text-neutral-500">Design Workflow Hub</p>
        </div>
      </div>

      <div className="mt-5 space-y-1">
        {fiturfrontMenu.map((menu) => {
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

              {isActive && (
                <ChevronRight size={18} className="text-neutral-400" />
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-auto rounded-[26px] border border-white/70 bg-white/70 p-4 shadow-sm">
        <div className="mb-3 grid h-10 w-10 place-items-center rounded-2xl bg-neutral-100">
          <ShieldCheck size={20} strokeWidth={1.8} />
        </div>

        <p className="text-sm font-medium tracking-[-0.02em]">
          Quality reminder
        </p>

        <p className="mt-2 text-xs leading-5 text-neutral-500">
          Always check price & material latest campaign details
          before sharing materials.
        </p>
      </div>
    </div>
  );
}

function FolderCard({ folder, index, isSelected, onClick }) {
  const Icon = folder.icon;
  const theme = fiturfrontTheme[folder.theme] || fiturfrontTheme.white;

  return (
    <button
      onClick={onClick}
      className={`fiturfront-fade group relative overflow-hidden rounded-[28px] border p-5 text-left backdrop-blur-xl transition duration-500 hover:-translate-y-1 hover:bg-white active:scale-[0.985] md:p-6 ${
        theme.card
      } ${isSelected ? "ring-2 ring-black/10" : ""}`}
      style={{ animationDelay: `${120 + index * 70}ms` }}
    >
      <div className="absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,1),transparent_55%)]" />

      <div className="relative z-10">
        <div className="mb-7 flex items-start justify-between">
          <div
            className={`grid h-12 w-12 place-items-center rounded-[18px] border shadow-sm ${theme.icon}`}
          >
            <Icon size={23} strokeWidth={1.8} />
          </div>

          <div
            className={`rounded-full border px-3 py-1 text-[11px] font-medium ${theme.chip}`}
          >
            {folder.date}
          </div>
        </div>

        <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-400">
          {folder.headline}
        </p>

        <h3 className="mt-2 text-[26px] font-semibold leading-[1.02] tracking-[-0.055em]">
          {folder.title}
        </h3>

        <p className="mt-3 overflow-hidden text-ellipsis text-sm leading-6 text-neutral-500 [display:-webkit-box] [-webkit-line-clamp:2] [-webkit-box-orient:vertical]">
          {folder.desc}
        </p>

        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-neutral-500">
            <Boxes size={17} strokeWidth={1.8} />
            {folder.count} sections
          </div>

          <div className="grid h-10 w-10 place-items-center rounded-full bg-white/80 text-neutral-500 shadow-sm transition group-hover:translate-x-1 group-hover:text-black">
            <ArrowRight size={20} strokeWidth={1.8} />
          </div>
        </div>
      </div>
    </button>
  );
}

function FolderDetail({ folder, onOpenItem }) {
  if (!folder) return null;

  const Icon = folder.icon;
  const theme = fiturfrontTheme[folder.theme] || fiturfrontTheme.white;

  const handleOpenFolderPage = () => {
    if (folder.id === "p4-series") {
      navigateApp("/p4series");
      return;
    }

    if (folder.id === "request-design") {
      openRequestPage("request");
      return;
    }

    if (folder.id === "calendar-project") {
      openRequestPage("calendar");
      return;
    }

    if (folder.id === "note-page") {
      openRequestPage("notes");
      return;
    }

    if (folder.id === "catalog-page") {
      navigateApp("/catalog");
    }
  };

  const hasAppPage = ["p4-series", "request-design", "calendar-project", "note-page", "catalog-page"].includes(folder.id);

  return (
    <div className="rounded-[32px] border border-white/70 bg-white/62 p-5 shadow-[0_22px_70px_rgba(0,0,0,0.07)] backdrop-blur-xl md:p-6">
      <div className="mb-6 flex items-start gap-4">
        <div
          className={`grid h-12 w-12 shrink-0 place-items-center rounded-[18px] border shadow-sm ${theme.icon}`}
        >
          <Icon size={23} strokeWidth={1.8} />
        </div>

        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-400">
            Selected Folder
          </p>
          <h2 className="mt-1 text-2xl font-semibold tracking-[-0.055em]">
            {folder.title}
          </h2>
          <p className="mt-2 text-sm leading-6 text-neutral-500">
            {folder.desc}
          </p>

          {hasAppPage && (
            <button
              onClick={handleOpenFolderPage}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-neutral-950 px-4 py-2 text-xs font-semibold text-white transition hover:bg-neutral-800"
            >
              Open Page
              <ArrowRight size={15} strokeWidth={1.8} />
            </button>
          )}
        </div>
      </div>

      {folder.image && (
        <div className="mb-5 overflow-hidden rounded-[24px] border border-black/5 bg-neutral-100">
          <img
            src={folder.image}
            alt={folder.title}
            className="h-40 w-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        </div>
      )}

      <div className="fiturfront-scroll max-h-[520px] space-y-4 overflow-y-auto pr-1">
        {folder.groups.map((group) => (
          <div
            key={group.title}
            className="rounded-[24px] border border-white/70 bg-white/68 p-4 shadow-sm"
          >
            <div className="mb-4">
              <h3 className="text-[17px] font-semibold tracking-[-0.035em]">
                {group.title}
              </h3>
              <p className="mt-1 text-xs leading-5 text-neutral-500">
                {group.desc}
              </p>
            </div>

            <div className="space-y-2">
              {group.items.map((item) => (
                <button
                  key={`${group.title}-${item.name}`}
                  onClick={() => onOpenItem(item)}
                  className="group/item flex w-full items-center justify-between gap-3 rounded-2xl border border-black/5 bg-white/75 px-3 py-3 text-left transition hover:bg-neutral-950 hover:text-white"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{item.name}</p>
                    <p className="mt-0.5 text-xs text-neutral-400 group-hover/item:text-white/55">
                      {item.type}
                    </p>
                  </div>

                  <ExternalLink
                    size={17}
                    strokeWidth={1.8}
                    className="shrink-0 text-neutral-400 group-hover/item:text-white/70"
                  />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RecentPanel({ items, onOpenItem }) {
  return (
    <div className="mt-5 rounded-[32px] border border-white/70 bg-white/62 p-5 shadow-[0_22px_70px_rgba(0,0,0,0.055)] backdrop-blur-xl md:p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-400">
            Quick Access
          </p>
          <h3 className="mt-1 text-xl font-semibold tracking-[-0.045em]">
            Recent Materials
          </h3>
        </div>

        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white shadow-sm">
          <MonitorSmartphone size={20} strokeWidth={1.8} />
        </div>
      </div>

      <div className="space-y-2">
        {items.map((item) => (
          <button
            key={`${item.folderTitle}-${item.name}`}
            onClick={() => onOpenItem(item)}
            className="flex w-full items-center justify-between gap-3 rounded-2xl px-3 py-3 text-left transition hover:bg-white"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{item.name}</p>
              <p className="mt-0.5 truncate text-xs text-neutral-400">
                {item.folderTitle} · {item.type}
              </p>
            </div>

            <ArrowRight
              size={18}
              strokeWidth={1.8}
              className="shrink-0 text-neutral-400"
            />
          </button>
        ))}
      </div>
    </div>
  );
}

function EmptyState({ search }) {
  return (
    <div className="rounded-[32px] border border-white/70 bg-white/62 p-8 text-center shadow-[0_22px_70px_rgba(0,0,0,0.06)] backdrop-blur-xl">
      <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-white shadow-sm">
        <Search size={24} strokeWidth={1.8} />
      </div>

      <h3 className="text-xl font-semibold tracking-[-0.04em]">
        No folder found
      </h3>

      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-neutral-500">
        No result for “{search}”. Try another keyword like SKU, LP, banner,
        exposure, or catalog.
      </p>
    </div>
  );
}

function ConfirmModal({ item, onClose, onContinue }) {
  const appLink = FRONTPAGE_APP_LINKS[item.url];
  const actionLabel = appLink?.label || "Open";

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
          Before opening material
        </h3>

        <p className="mt-3 text-sm leading-6 text-neutral-500">
          Make sure the material, price, product information, design, and
          platform placement are correct before using it.
        </p>

        <div className="mt-5 rounded-2xl border border-black/5 bg-neutral-50 p-4">
          <p className="text-sm font-medium">{item.name}</p>
          <p className="mt-1 text-xs text-neutral-500">{item.type}</p>
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
            className="flex-1 rounded-2xl bg-black px-5 py-3.5 text-sm font-medium text-white transition hover:bg-neutral-800 active:scale-95"
          >
            {actionLabel}
          </button>
        </div>
      </div>
    </div>
  );
}