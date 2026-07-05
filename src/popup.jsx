import React from "react";
import {
  Rocket,
  FileText,
  Layers,
  ArrowRight,
  Sparkles,
} from "lucide-react";

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

export default function Popup() {
  return (
    <div className="fixed inset-0 z-[999] overflow-hidden bg-[#f5f5f3] text-[#111]">
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
        <div className="absolute -left-28 top-10 h-[320px] w-[320px] animate-[fiturpopFloat_9s_ease-in-out_infinite] rounded-full bg-white blur-3xl" />
        <div className="absolute right-[-150px] top-[-110px] h-[420px] w-[420px] animate-[fiturpopFloatReverse_12s_ease-in-out_infinite] rounded-full bg-white/90 blur-3xl" />
        <div className="absolute bottom-[-190px] left-[18%] h-[420px] w-[420px] animate-[fiturpopFloat_11s_ease-in-out_infinite] rounded-full bg-white blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto flex h-screen max-w-7xl flex-col justify-center px-4 py-4 md:px-10">
        <div className="fiturpop-fade mx-auto mb-3 inline-flex items-center gap-2 rounded-full border border-black/5 bg-white/70 px-4 py-2 text-xs font-medium text-neutral-600 shadow-sm backdrop-blur-xl md:mb-7 md:px-5 md:py-3 md:text-sm">
          <Sparkles size={25
          } strokeWidth={1.8} />
          ADF SITE
        </div>

        <div className="fiturpop-fade mx-auto max-w-4xl text-center [animation-delay:80ms]">
          <h1 className="text-[34px] font-light leading-[0.96] tracking-[-0.075em] md:text-[88px]">
            What do you{" "}
            <span className="font-semibold tracking-[-0.08em]">need</span>
            <br />
            today?
          </h1>

          <p className="mx-auto mt-3 max-w-2xl text-[13px] leading-5 text-neutral-500 md:mt-6 md:text-xl md:leading-8">
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
                className="fiturpop-fade group relative overflow-hidden rounded-[22px] border border-white/70 bg-white/70 p-3.5 text-left shadow-[0_16px_45px_rgba(0,0,0,0.06)] backdrop-blur-xl transition duration-500 hover:bg-white hover:shadow-[0_28px_80px_rgba(0,0,0,0.10)] active:scale-[0.985] md:min-h-[220px] md:rounded-[32px] md:p-7 md:hover:-translate-y-1.5"
                style={{ animationDelay: `${160 + index * 80}ms` }}
              >
                <div className="relative z-10 flex items-center gap-3 md:h-full md:flex-col md:items-stretch md:justify-between md:gap-0">
                  <div className="flex items-center justify-between md:mb-9">
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-[16px] border border-black/5 bg-white shadow-sm transition duration-500 group-hover:scale-105 md:h-[52px] md:w-[52px] md:rounded-[18px]">
                      <Icon size={23} strokeWidth={1.8} />
                    </div>

                    <div className="hidden h-11 w-11 place-items-center rounded-full bg-white/80 text-neutral-500 shadow-sm transition duration-500 group-hover:translate-x-1 group-hover:text-black md:grid">
                      <ArrowRight size={21} strokeWidth={1.8} />
                    </div>
                  </div>

                  <div className="min-w-0 flex-1 md:flex-none">
                    <h2 className="hidden text-[28px] font-semibold leading-[1.02] tracking-[-0.055em] text-neutral-950 md:block">
                      {item.title}
                    </h2>

                    <h2 className="text-[23px] font-semibold leading-none tracking-[-0.055em] text-neutral-950 md:hidden">
                      {item.mobileTitle}
                    </h2>

                    <p className="mt-1 line-clamp-1 text-[13px] leading-5 text-neutral-500 md:mt-4 md:line-clamp-none md:max-w-[290px] md:text-[16px] md:leading-6">
                      {item.desc}
                    </p>
                  </div>

                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/80 text-neutral-500 shadow-sm transition duration-500 group-hover:translate-x-1 group-hover:text-black md:hidden">
                    <ArrowRight size={20} strokeWidth={1.8} />
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <p className="fiturpop-fade mx-auto mt-7 max-w-xl text-center text-[11px] leading-5 text-neutral-400 [animation-delay:460ms] md:mt-10 md:text-xs">
          System development by Nando. If you find an issue or have feedback,{" "}
          <a
            href={REPORT_WHATSAPP_URL}
            target="_blank"
            rel="noreferrer"
            className="font-medium text-neutral-500 underline decoration-neutral-300 underline-offset-4 transition hover:text-neutral-950 hover:decoration-neutral-950"
          >
            click here to report.
          </a>
        </p>
      </div>
    </div>
  );
}
