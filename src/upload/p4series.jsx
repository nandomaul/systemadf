import React, { useMemo, useState } from "react";
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
} from "lucide-react";

/**
 * P4Series.jsx
 * ADF System - P4 Series Asset Hub
 *
 * Fix:
 * - Icon folder sidebar tidak kecil sendiri lagi
 * - Icon bintang di header atas dihapus
 * - Sidebar kiri standby
 * - Content kanan scroll
 * - Hero bisa pakai cover PNG
 */

const BACK_TO_FRONTPAGE_URL = "/popup";
const DEFAULT_HERO_COVER = "";

const P4_SECTIONS = [
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

function getAllAssets() {
  return P4_SECTIONS.flatMap((section) =>
    section.items.map((item) => ({
      ...item,
      sectionId: section.id,
      sectionTitle: section.title,
      sectionSubtitle: section.subtitle,
      sectionCover: section.cover || "",
    }))
  );
}

export default function P4Series() {
  const [activeSection, setActiveSection] = useState("all");
  const [search, setSearch] = useState("");
  const [confirmAsset, setConfirmAsset] = useState(null);

  const allAssets = useMemo(() => getAllAssets(), []);
  const totalAssets = allAssets.length;

  const selectedSection =
    activeSection === "all"
      ? null
      : P4_SECTIONS.find((section) => section.id === activeSection);

  const activeHeroCover = selectedSection?.cover || DEFAULT_HERO_COVER || "";

  const filteredSections = useMemo(() => {
    const keyword = normalizeText(search);

    return P4_SECTIONS.map((section) => {
      if (activeSection !== "all" && section.id !== activeSection) return null;

      const sectionMatch =
        normalizeText(section.title).includes(keyword) ||
        normalizeText(section.subtitle).includes(keyword);

      const filteredItems = keyword
        ? section.items.filter((item) => {
            return (
              normalizeText(item.name).includes(keyword) ||
              normalizeText(item.type).includes(keyword) ||
              normalizeText(section.title).includes(keyword)
            );
          })
        : section.items;

      const finalItems = sectionMatch && keyword ? section.items : filteredItems;

      if (finalItems.length === 0) return null;

      return {
        ...section,
        items: finalItems,
      };
    }).filter(Boolean);
  }, [activeSection, search]);

  const filteredCount = filteredSections.reduce(
    (total, section) => total + section.items.length,
    0
  );

  const priorityAssets = P4_SECTIONS[0].items.slice(0, 7);

  const handleBack = () => {
    if (window.ADFNavigate) {
      window.ADFNavigate("/popup");
    } else {
      window.location.href = "/popup";
    }
  };

  const handleOpenAsset = (asset) => {
    setConfirmAsset(asset);
  };

  const handleContinueOpen = () => {
    if (!confirmAsset?.url) return;
    window.open(confirmAsset.url, "_blank", "noopener,noreferrer");
    setConfirmAsset(null);
  };

  return (
    <div className="h-screen overflow-hidden bg-[#f5f5f3] text-neutral-950">
      <style>{`
        @keyframes p4Float {
          0%, 100% { transform: translate3d(0,0,0) scale(1); }
          50% { transform: translate3d(18px,-18px,0) scale(1.03); }
        }

        @keyframes p4FloatReverse {
          0%, 100% { transform: translate3d(0,0,0) scale(1); }
          50% { transform: translate3d(-18px,18px,0) scale(1.035); }
        }

        @keyframes p4FadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .p4-fade {
          animation: p4FadeUp .56s cubic-bezier(.16,1,.3,1) both;
        }

        .p4-scroll::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        .p4-scroll::-webkit-scrollbar-track {
          background: transparent;
        }

        .p4-scroll::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,.12);
          border-radius: 999px;
        }

        .p4-scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        .p4-scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -left-28 top-8 h-[320px] w-[320px] animate-[p4Float_10s_ease-in-out_infinite] rounded-full bg-white blur-3xl" />
        <div className="absolute right-[-160px] top-[-110px] h-[460px] w-[460px] animate-[p4FloatReverse_13s_ease-in-out_infinite] rounded-full bg-white/90 blur-3xl" />
        <div className="absolute bottom-[-210px] left-[18%] h-[500px] w-[500px] animate-[p4Float_12s_ease-in-out_infinite] rounded-full bg-white blur-3xl" />
      </div>

      <div className="relative z-10 flex h-screen overflow-hidden">
        <aside className="hidden h-screen w-[280px] shrink-0 p-5 lg:block">
          <P4Sidebar
            activeSection={activeSection}
            setActiveSection={setActiveSection}
            totalAssets={totalAssets}
            onBack={handleBack}
          />
        </aside>

        <main className="flex h-screen min-w-0 flex-1 flex-col overflow-hidden px-4 py-5 md:px-8 lg:px-6">
          <P4TopHero
            search={search}
            setSearch={setSearch}
            activeSection={activeSection}
            setActiveSection={setActiveSection}
            onBack={handleBack}
            filteredCount={filteredCount}
            heroCover={activeHeroCover}
          />

          <div className="p4-scroll min-h-0 flex-1 overflow-y-auto pr-0 lg:pr-2">
            <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_390px]">
              <div>
                <div className="mb-4 flex items-end justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-400">
                      Assets
                    </p>
                    <h2 className="mt-1 text-2xl font-semibold tracking-[-0.05em]">
                      {activeSection === "all"
                        ? "All P4 Assets"
                        : selectedSection?.title}
                    </h2>
                  </div>

                  <p className="text-sm text-neutral-400">
                    {filteredCount} assets
                  </p>
                </div>

                {filteredSections.length === 0 ? (
                  <EmptyState search={search} />
                ) : (
                  <div className="space-y-5">
                    {filteredSections.map((section, index) => (
                      <AssetSection
                        key={section.id}
                        section={section}
                        index={index}
                        onOpenAsset={handleOpenAsset}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="lg:sticky lg:top-0 lg:h-fit">
                <QualityPanel />
                <QuickAccessPanel
                  assets={priorityAssets}
                  onOpenAsset={handleOpenAsset}
                />
              </div>
            </section>
          </div>
        </main>
      </div>

      {confirmAsset && (
        <ConfirmOpenModal
          asset={confirmAsset}
          onClose={() => setConfirmAsset(null)}
          onContinue={handleContinueOpen}
        />
      )}
    </div>
  );
}

function P4Sidebar({
  activeSection,
  setActiveSection,
  totalAssets,
  onBack,
}) {
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
        <div>
          <p className="text-[28px] font-semibold leading-tight tracking-[-0.05em]">
            P4 Series
          </p>
          <p className="mt-1 text-sm text-neutral-500">{totalAssets} assets</p>
        </div>
      </div>

      <div className="p4-scroll mt-5 min-h-0 flex-1 space-y-1 overflow-y-auto pr-1">
        <button
          onClick={() => setActiveSection("all")}
          className={`flex w-full items-center justify-between rounded-2xl px-3 py-3 text-left transition ${
            activeSection === "all"
              ? "bg-white text-neutral-950 shadow-sm"
              : "text-neutral-500 hover:bg-white/70 hover:text-neutral-950"
          }`}
        >
          <span className="flex min-w-0 items-center gap-3">
            <Folder className="h-[18px] w-[18px] shrink-0" strokeWidth={1.8} />
            <span className="truncate text-sm font-medium">All Assets</span>
          </span>
          <span className="shrink-0 text-xs text-neutral-400">{totalAssets}</span>
        </button>

        {P4_SECTIONS.map((section) => {
          const isActive = activeSection === section.id;

          return (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex w-full items-center justify-between rounded-2xl px-3 py-3 text-left transition ${
                isActive
                  ? "bg-white text-neutral-950 shadow-sm"
                  : "text-neutral-500 hover:bg-white/70 hover:text-neutral-950"
              }`}
            >
              <span className="flex min-w-0 items-center gap-3">
                <Folder className="h-[18px] w-[18px] shrink-0" strokeWidth={1.8} />
                <span className="truncate text-sm font-medium">
                  {section.title}
                </span>
              </span>

              <span className="shrink-0 text-xs text-neutral-400">
                {section.items.length}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 rounded-[26px] border border-white/70 bg-white/70 p-4 shadow-sm">
        <div className="mb-3 grid h-10 w-10 place-items-center rounded-2xl bg-neutral-100">
          <ShieldCheck size={20} strokeWidth={1.8} />
        </div>

        <p className="text-sm font-medium tracking-[-0.02em]">
          Before download
        </p>

        <p className="mt-2 text-xs leading-5 text-neutral-500">
          Check latest brief, price, platform, and placement before using any
          material.
        </p>
      </div>
    </div>
  );
}

function P4TopHero({
  search,
  setSearch,
  activeSection,
  setActiveSection,
  onBack,
  filteredCount,
  heroCover,
}) {
  return (
    <div className="shrink-0 pb-3">
      <div className="mb-3 flex items-center justify-between lg:hidden">
        <button
          onClick={onBack}
          className="flex items-center gap-2 rounded-full border border-black/5 bg-white/80 px-4 py-2 text-xs font-medium text-neutral-600 shadow-sm transition active:scale-[0.98]"
        >
          <ArrowLeft size={16} strokeWidth={1.8} />
          Homepage
        </button>

        <div className="rounded-full bg-white/80 px-4 py-2 text-xs font-medium text-neutral-500 shadow-sm">
          {filteredCount} assets
        </div>
      </div>

      <div className="p4-fade rounded-[30px] border border-white/70 bg-white/65 p-4 shadow-[0_16px_45px_rgba(0,0,0,0.06)] backdrop-blur-xl">
        <div className="grid gap-4 lg:grid-cols-[1.05fr_1.55fr] lg:items-center">
          <div className="min-w-0">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-black/5 bg-white/70 px-3.5 py-1.5 text-xs font-medium text-neutral-600 shadow-sm">
              <FolderOpen size={14} strokeWidth={1.8} />
              P4 SERIES UPDATE
            </div>

            <h1 className="max-w-4xl text-[34px] font-light leading-[0.92] tracking-[-0.075em] md:text-[58px] xl:text-[64px]">
              Download assets{" "}
              <span className="font-semibold tracking-[-0.08em]">faster.</span>
            </h1>

            <p className="mt-2 max-w-2xl text-[13px] leading-5 text-neutral-500 md:text-[15px] md:leading-6">
              Find P4 Series folders by section, asset type, platform, or
              campaign name.
            </p>
          </div>

          <div className="relative">
            <div className="relative h-[118px] overflow-hidden rounded-[28px] border border-black/5 bg-white/55 md:h-[132px]">
              {heroCover ? (
                <img
                  src={heroCover}
                  alt="P4 cover"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full bg-[linear-gradient(135deg,rgba(255,255,255,0.72),rgba(255,255,255,0.44))]" />
              )}

              <div className="absolute inset-0 bg-gradient-to-r from-white/15 via-transparent to-white/10" />
            </div>

            <div className="mt-3 lg:absolute lg:bottom-4 lg:right-4 lg:mt-0 lg:w-[78%] xl:w-[73%]">
              <div className="flex items-center gap-3 rounded-2xl border border-black/5 bg-white/88 px-4 py-2.5 shadow-sm backdrop-blur-xl">
                <Search
                  size={20}
                  strokeWidth={1.8}
                  className="text-neutral-400"
                />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search LP, SKU, exposure, banner..."
                  className="w-full bg-transparent text-sm outline-none placeholder:text-neutral-400 md:text-[15px]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p4-scrollbar-hide mt-3 flex gap-2 overflow-x-auto pb-1">
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

        {P4_SECTIONS.map((section) => {
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

function AssetSection({ section, index, onOpenAsset }) {
  return (
    <div
      className="p4-fade rounded-[30px] border border-white/70 bg-white/62 p-4 shadow-[0_18px_55px_rgba(0,0,0,0.055)] backdrop-blur-xl md:p-5"
      style={{ animationDelay: `${100 + index * 80}ms` }}
    >
      <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-[18px] bg-white shadow-sm">
            <FolderOpen className="h-[22px] w-[22px] shrink-0" strokeWidth={1.8} />
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-400">
              Section
            </p>
            <h3 className="text-2xl font-semibold tracking-[-0.055em]">
              {section.title}
            </h3>
            <p className="mt-1 text-sm text-neutral-500">{section.subtitle}</p>
          </div>
        </div>

        <div className="rounded-full bg-white px-4 py-2 text-xs font-medium text-neutral-500 shadow-sm">
          {section.items.length} folders
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {section.items.map((asset) => (
          <AssetCard
            key={`${section.id}-${asset.name}`}
            asset={{
              ...asset,
              sectionTitle: section.title,
              sectionSubtitle: section.subtitle,
            }}
            onOpenAsset={onOpenAsset}
          />
        ))}
      </div>
    </div>
  );
}

function AssetCard({ asset, onOpenAsset }) {
  return (
    <button
      onClick={() => onOpenAsset(asset)}
      className="group flex min-h-[138px] flex-col justify-between rounded-[24px] border border-black/5 bg-white/72 p-4 text-left shadow-sm transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_18px_45px_rgba(0,0,0,0.08)] active:scale-[0.985]"
    >
      <div>
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-[16px] bg-neutral-100 text-neutral-800 transition group-hover:bg-neutral-950 group-hover:text-white">
            <FolderOpen className="h-[19px] w-[19px] shrink-0" strokeWidth={1.8} />
          </div>

          <span className="rounded-full bg-neutral-100 px-3 py-1 text-[11px] font-medium text-neutral-500">
            {asset.type}
          </span>
        </div>

        <h4 className="line-clamp-2 text-lg font-semibold leading-tight tracking-[-0.045em]">
          {asset.name}
        </h4>

        <p className="mt-2 truncate text-xs text-neutral-400">
          {asset.sectionTitle}
        </p>
      </div>

      <div className="mt-5 flex items-center justify-between">
        <span className="text-xs font-medium text-neutral-500">
          Open Drive
        </span>

        <ArrowRight
          size={18}
          strokeWidth={1.8}
          className="text-neutral-400 transition group-hover:translate-x-1 group-hover:text-neutral-950"
        />
      </div>
    </button>
  );
}

function QualityPanel() {
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
          "Correct marketplace folder",
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

function QuickAccessPanel({ assets, onOpenAsset }) {
  return (
    <div className="mt-5 rounded-[30px] border border-white/70 bg-white/62 p-5 shadow-[0_18px_55px_rgba(0,0,0,0.055)] backdrop-blur-xl">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-400">
            Quick Access
          </p>
          <h3 className="mt-1 text-xl font-semibold tracking-[-0.045em]">
            New Update
          </h3>
        </div>

        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white shadow-sm">
          <FolderOpen className="h-[20px] w-[20px] shrink-0" strokeWidth={1.8} />
        </div>
      </div>

      <div className="space-y-2">
        {assets.map((asset) => (
          <button
            key={`quick-${asset.name}`}
            onClick={() =>
              onOpenAsset({
                ...asset,
                sectionTitle: "NEW UPDATE",
              })
            }
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

function EmptyState({ search }) {
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
          Make sure you are opening the correct P4 Series asset folder before
          downloading or sharing the material.
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
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-black px-5 py-3.5 text-sm font-medium text-white transition hover:bg-neutral-800 active:scale-95"
          >
            <ExternalLink size={17} strokeWidth={1.8} />
            Open
          </button>
        </div>
      </div>
    </div>
  );
}