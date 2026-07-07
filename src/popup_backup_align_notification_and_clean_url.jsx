import React, { useMemo, useState } from "react";
import {
  Rocket,
  FileText,
  Layers,
  ArrowRight,
  Sparkles,
  Settings,
} from "lucide-react";

import SystemSettingsModal from "./auth/SystemSettingsModal";
import RequestNotificationBell from "./RequestNotificationBell";
import { getAvatarByKey } from "./auth/avatarLibrary";

/**
 * popup.jsx
 * ADF System Main Menu
 *
 * Route:
 * - New Launch Design -> /frontpage
 * - Request Design    -> /requestpage, default tab Request Design
 * - See Catalog       -> /catalog
 */

const REPORT_WHATSAPP_URL =
  "https://wa.me/628122229281?text=Hi%20Nando%2C%20I%20want%20to%20report%20an%20issue%20or%20share%20feedback%20about%20System%20ADF.";

const fiturpop = [
  {
    title: "New Launch Design",
    mobileTitle: "Launch",
    desc: "Launch materials, SKU, LP, Banner.",
    icon: Rocket,
    path: "/frontpage",
    type: "frontpage",
  },
  {
    title: "Request Design",
    mobileTitle: "Request",
    desc: "Create and manage design requests.",
    icon: FileText,
    path: "/requestpage",
    type: "request",
  },
  {
    title: "See Catalog",
    mobileTitle: "Catalog",
    desc: "Browse design references and assets.",
    icon: Layers,
    path: "/catalog",
    type: "catalog",
  },
];

function navigateTo(path) {
  if (!path) return;

  if (window.ADFNavigate) {
    window.ADFNavigate(path);
    return;
  }

  window.location.href = path;
}

function handleOpenItem(item) {
  if (!item) return;

  if (item.type === "request") {
    try {
      sessionStorage.setItem("adf_request_default_menu", "request");
    } catch {
      // ignore storage error
    }
  }

  navigateTo(item.path);
}

function PopupProfileMenu({ auth, isDark }) {
  const [settingsOpen, setSettingsOpen] = useState(false);

  const profile = auth?.profile || {};
  const avatar = useMemo(() => {
    return getAvatarByKey(profile.avatar_key);
  }, [profile.avatar_key]);

  if (!auth?.isAuthenticated) return null;

  return (
    <>
      <RequestNotificationBell
        className="fixed left-8 top-[96px] z-[1006]"
        buttonClassName="relative grid h-12 w-12 place-items-center rounded-full border border-white/70 bg-white/90 text-neutral-700 shadow-[0_18px_55px_rgba(0,0,0,0.12)] backdrop-blur-xl transition hover:text-neutral-950 active:scale-95"
        panelClassName="adf-notif-card absolute left-0 top-full mt-3 w-[360px] overflow-hidden rounded-[28px] border border-white/70 bg-white/95 p-3 shadow-[0_35px_120px_rgba(0,0,0,0.22)] backdrop-blur-xl"
      />





            <button
        type="button"
        onClick={() => setSettingsOpen(true)}
        className={`adf-popup-profile fixed right-8 top-8 z-[1005] flex h-[64px] w-[230px] items-center gap-3 rounded-[26px] border px-3 py-2 text-left shadow-[0_18px_55px_rgba(0,0,0,0.1)] backdrop-blur-xl transition active:scale-[0.985] ${
          isDark
            ? "border-white/10 bg-white/[0.08] text-white hover:bg-white/[0.12]"
            : "border-white/70 bg-white/86 text-neutral-700 hover:bg-white hover:text-neutral-950"
        }`}
        title="Account Settings"
      >
        <div
          className={`grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-[18px] bg-gradient-to-br ${avatar.bg}`}
        >
          <img
            src={avatar.src}
            alt={avatar.label}
            className="h-full w-full object-cover"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
          <span className="text-sm">{avatar.fallback}</span>
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] font-semibold leading-none">
            {profile.display_name || "User"}
          </p>
          <p
            className={`mt-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] ${
              isDark ? "text-white/45" : "text-neutral-400"
            }`}
          >
            {profile.team || "Team"}
          </p>
        </div>

        <div
          className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${
            isDark ? "bg-white/10 text-white" : "bg-neutral-100 text-neutral-700"
          }`}
        >
          <Settings size={16} strokeWidth={1.8} />
        </div>
      </button>

      {settingsOpen ? (
        <SystemSettingsModal
          auth={auth}
          onClose={() => setSettingsOpen(false)}
        />
      ) : null}
    </>
  );
}

export default function Popup({ auth }) {
  const isDark = auth?.themeMode === "dark";

  return (
    <div
      className={`fixed inset-0 z-[999] overflow-hidden ${
        isDark ? "bg-[#070708] text-white" : "bg-[#f5f5f3] text-[#111]"
      }`}
    >
      <style>{`
        @keyframes fiturpopFloat {
          0%, 100% { transform: translate3d(0,0,0) scale(1); }
          50% { transform: translate3d(18px,-18px,0) scale(1.035); }
        }

        @keyframes fiturpopFloatReverse {
          0%, 100% { transform: translate3d(0,0,0) scale(1); }
          50% { transform: translate3d(-18px,20px,0) scale(1.04); }
        }

        @keyframes fiturpopFadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .fiturpop-fade {
          animation: fiturpopFadeUp .58s cubic-bezier(.16,1,.3,1) both;
        }
      `}</style>

      <div className="pointer-events-none absolute inset-0">
        {isDark ? (
          <>
            <div className="absolute -left-28 top-10 h-[320px] w-[320px] animate-[fiturpopFloat_9s_ease-in-out_infinite] rounded-full bg-white/[0.04] blur-3xl" />
            <div className="absolute right-[-150px] top-[-110px] h-[420px] w-[420px] animate-[fiturpopFloatReverse_12s_ease-in-out_infinite] rounded-full bg-white/[0.05] blur-3xl" />
            <div className="absolute bottom-[-190px] left-[18%] h-[420px] w-[420px] animate-[fiturpopFloat_11s_ease-in-out_infinite] rounded-full bg-white/[0.035] blur-3xl" />
          </>
        ) : (
          <>
            <div className="absolute -left-28 top-10 h-[320px] w-[320px] animate-[fiturpopFloat_9s_ease-in-out_infinite] rounded-full bg-white blur-3xl" />
            <div className="absolute right-[-150px] top-[-110px] h-[420px] w-[420px] animate-[fiturpopFloatReverse_12s_ease-in-out_infinite] rounded-full bg-white/90 blur-3xl" />
            <div className="absolute bottom-[-190px] left-[18%] h-[420px] w-[420px] animate-[fiturpopFloat_11s_ease-in-out_infinite] rounded-full bg-white blur-3xl" />
          </>
        )}
      </div>

      <PopupProfileMenu auth={auth} isDark={isDark} />

      <div className="relative z-10 mx-auto flex h-screen max-w-7xl flex-col justify-center px-4 py-4 md:px-10">
        <div
          className={`fiturpop-fade mx-auto mb-3 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold shadow-sm backdrop-blur-xl md:mb-7 md:px-5 md:py-3 md:text-sm ${
            isDark
              ? "border-white/10 bg-white/[0.08] text-white"
              : "border-black/5 bg-white/70 text-neutral-600"
          }`}
        >
          <Sparkles size={25} strokeWidth={1.8} />
          ADF SITE
        </div>

        <div className="fiturpop-fade mx-auto max-w-4xl text-center [animation-delay:80ms]">
          <h1
            className={`text-[34px] font-light leading-[0.96] tracking-[-0.075em] md:text-[88px] ${
              isDark ? "text-white" : "text-neutral-950"
            }`}
          >
            What do you{" "}
            <span className="font-semibold tracking-[-0.08em]">need</span>
            <br />
            today?
          </h1>

          <p
            className={`mx-auto mt-3 max-w-2xl text-[13px] leading-5 md:mt-6 md:text-xl md:leading-8 ${
              isDark ? "text-white/58" : "text-neutral-500"
            }`}
          >
            Choose quickly.
          </p>
        </div>

        <div className="mx-auto mt-5 grid w-full max-w-6xl grid-cols-1 gap-2.5 md:mt-12 md:grid-cols-3 md:gap-5">
          {fiturpop.map((item, index) => {
            const Icon = item.icon;

            return (
              <button
                key={item.title}
                type="button"
                onClick={() => handleOpenItem(item)}
                className={`fiturpop-fade group relative overflow-hidden rounded-[22px] border p-3.5 text-left shadow-[0_16px_45px_rgba(0,0,0,0.06)] backdrop-blur-xl transition duration-500 active:scale-[0.985] md:min-h-[220px] md:rounded-[32px] md:p-7 md:hover:-translate-y-1.5 ${
                  isDark
                    ? "border-white/10 bg-white/[0.07] hover:bg-white/[0.10] hover:shadow-[0_28px_80px_rgba(0,0,0,0.35)]"
                    : "border-white/70 bg-white/70 hover:bg-white hover:shadow-[0_28px_80px_rgba(0,0,0,0.10)]"
                }`}
                style={{ animationDelay: `${160 + index * 80}ms` }}
              >
                <div className="relative z-10 flex items-center gap-3 md:h-full md:flex-col md:items-stretch md:justify-between md:gap-0">
                  <div className="flex items-center justify-between md:mb-9">
                    <div
                      className={`grid h-11 w-11 shrink-0 place-items-center rounded-[16px] border shadow-sm transition duration-500 group-hover:scale-105 md:h-[52px] md:w-[52px] md:rounded-[18px] ${
                        isDark
                          ? "border-white/10 bg-white/[0.06] text-white"
                          : "border-black/5 bg-white text-neutral-950"
                      }`}
                    >
                      <Icon size={23} strokeWidth={1.8} />
                    </div>

                    <div
                      className={`hidden h-11 w-11 place-items-center rounded-full shadow-sm transition duration-500 group-hover:translate-x-1 md:grid ${
                        isDark
                          ? "bg-white/[0.08] text-white/70 group-hover:text-white"
                          : "bg-white/80 text-neutral-500 group-hover:text-black"
                      }`}
                    >
                      <ArrowRight size={21} strokeWidth={1.8} />
                    </div>
                  </div>

                  <div className="min-w-0 flex-1 md:flex-none">
                    <h2
                      className={`hidden text-[28px] font-semibold leading-[1.02] tracking-[-0.055em] md:block ${
                        isDark ? "text-white" : "text-neutral-950"
                      }`}
                    >
                      {item.title}
                    </h2>

                    <h2
                      className={`text-[23px] font-semibold leading-none tracking-[-0.055em] md:hidden ${
                        isDark ? "text-white" : "text-neutral-950"
                      }`}
                    >
                      {item.mobileTitle}
                    </h2>

                    <p
                      className={`mt-1 line-clamp-1 text-[13px] leading-5 md:mt-4 md:line-clamp-none md:max-w-[290px] md:text-[16px] md:leading-6 ${
                        isDark ? "text-white/55" : "text-neutral-500"
                      }`}
                    >
                      {item.desc}
                    </p>
                  </div>

                  <div
                    className={`grid h-9 w-9 shrink-0 place-items-center rounded-full shadow-sm transition duration-500 group-hover:translate-x-1 md:hidden ${
                      isDark
                        ? "bg-white/[0.08] text-white/70 group-hover:text-white"
                        : "bg-white/80 text-neutral-500 group-hover:text-black"
                    }`}
                  >
                    <ArrowRight size={20} strokeWidth={1.8} />
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <p
          className={`fiturpop-fade mx-auto mt-7 max-w-xl text-center text-[11px] leading-5 [animation-delay:460ms] md:mt-10 md:text-xs ${
            isDark ? "text-white/40" : "text-neutral-400"
          }`}
        >
          System development by Nando. If you find an issue or have feedback,{" "}
          <a
            href={REPORT_WHATSAPP_URL}
            target="_blank"
            rel="noreferrer"
            className={`font-medium underline underline-offset-4 transition ${
              isDark
                ? "text-white/55 decoration-white/25 hover:text-white hover:decoration-white"
                : "text-neutral-500 decoration-neutral-300 hover:text-neutral-950 hover:decoration-neutral-950"
            }`}
          >
            click here to report.
          </a>
        </p>
      </div>
    </div>
  );
}
