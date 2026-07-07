import React, { useMemo, useState } from "react";
import {
  ArrowRight,
  Bell,
  CalendarDays,
  CheckCircle2,
  FileText,
  FolderOpen,
  Layers,
  LayoutDashboard,
  Loader2,
  MousePointer2,
  Sparkles,
} from "lucide-react";

const TOUR_STEPS = [
  {
    eyebrow: "System ADF Tour",
    title: "Welcome to System ADF.",
    desc: "A clean workspace for launch assets, request design, calendar, notes, and catalog references.",
    badge: "Workspace Overview",
    icon: LayoutDashboard,
    type: "overview",
  },
  {
    eyebrow: "Request Workflow",
    title: "Request Design",
    desc: "Use your saved display name so request data stays clean, consistent, and searchable.",
    badge: "Clean request data",
    icon: FileText,
    type: "request",
  },
  {
    eyebrow: "Timeline & Notes",
    title: "Calendar & Notes",
    desc: "Track deadlines, campaign notes, links, and internal reminders from one visual board.",
    badge: "Daily workflow",
    icon: CalendarDays,
    type: "calendar",
  },
  {
    eyebrow: "Asset Library",
    title: "Asset Hub",
    desc: "Open launch assets, catalog sections, reusable links, and references faster.",
    badge: "Catalog ready",
    icon: Layers,
    type: "catalog",
  },
];

function ProgressBar({ index }) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {TOUR_STEPS.map((_, itemIndex) => {
        const isActive = itemIndex <= index;

        return (
          <div
            key={itemIndex}
            className={`h-2 overflow-hidden rounded-full ${
              isActive ? "bg-neutral-950" : "bg-neutral-200"
            }`}
          >
            {itemIndex === index ? (
              <div className="h-full w-full origin-left animate-[tourProgress_1.2s_ease_both] rounded-full bg-neutral-950" />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function FloatingBadge({ children, className = "" }) {
  return (
    <div
      className={`absolute rounded-full border border-black/5 bg-white/85 px-4 py-2 text-xs font-semibold text-neutral-600 shadow-[0_14px_35px_rgba(0,0,0,0.08)] backdrop-blur-xl ${className}`}
    >
      {children}
    </div>
  );
}

function OverviewPreview() {
  return (
    <div className="relative h-[360px] overflow-hidden rounded-[34px] border border-black/5 bg-[#f6f6f4] p-5 shadow-inner">
      <FloatingBadge className="left-5 top-5 animate-[tourFloat_4s_ease-in-out_infinite]">
        ADF SITE
      </FloatingBadge>

      <FloatingBadge className="right-5 top-12 animate-[tourFloatReverse_5s_ease-in-out_infinite]">
        Authorized
      </FloatingBadge>

      <div className="absolute left-1/2 top-[92px] w-[76%] -translate-x-1/2 text-center">
        <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-[18px] bg-white shadow-sm">
          <Sparkles size={22} strokeWidth={1.8} />
        </div>

        <p className="text-[38px] font-light leading-[0.9] tracking-[-0.08em] text-neutral-950">
          What do you{" "}
          <span className="font-semibold tracking-[-0.09em]">need</span>
          <br />
          today?
        </p>

        <p className="mt-4 text-sm text-neutral-500">Choose quickly.</p>
      </div>

      <div className="absolute inset-x-5 bottom-5 grid grid-cols-3 gap-3">
        {[
          ["Launch", "SKU, LP, Banner"],
          ["Request", "Design workflow"],
          ["Catalog", "Asset reference"],
        ].map((item, index) => (
          <div
            key={item[0]}
            className="animate-[tourCardIn_.65s_cubic-bezier(.16,1,.3,1)_both] rounded-[22px] border border-white bg-white/80 p-4 shadow-[0_18px_45px_rgba(0,0,0,0.07)]"
            style={{ animationDelay: `${index * 120}ms` }}
          >
            <div className="mb-8 grid h-9 w-9 place-items-center rounded-[13px] bg-neutral-100">
              <ArrowRight size={18} strokeWidth={1.8} />
            </div>

            <p className="text-sm font-semibold text-neutral-950">{item[0]}</p>
            <p className="mt-1 text-xs text-neutral-500">{item[1]}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function RequestPreview() {
  return (
    <div className="relative h-[360px] overflow-hidden rounded-[34px] border border-black/5 bg-[#f6f6f4] p-5 shadow-inner">
      <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold shadow-sm">
        <FileText size={15} />
        Request Design
      </div>

      <div className="absolute right-5 top-5 rounded-full bg-neutral-950 px-4 py-2 text-xs font-semibold text-white shadow-sm">
        3 active
      </div>

      <div className="absolute left-5 top-20 w-[56%] space-y-3">
        {[
          ["New Request", "P4 Series LP price reveal", "ferdhy"],
          ["In Review", "Banner Akulaku", "defrin"],
          ["Done", "Discovery material", "admin"],
        ].map((item, index) => (
          <div
            key={item[0]}
            className="animate-[tourSlideRight_.65s_cubic-bezier(.16,1,.3,1)_both] rounded-[22px] border border-white bg-white p-4 shadow-[0_18px_45px_rgba(0,0,0,0.06)]"
            style={{ animationDelay: `${index * 140}ms` }}
          >
            <div className="mb-3 flex items-center justify-between">
              <span
                className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                  index === 0
                    ? "bg-amber-50 text-amber-700"
                    : index === 1
                      ? "bg-sky-50 text-sky-700"
                      : "bg-emerald-50 text-emerald-700"
                }`}
              >
                {item[0]}
              </span>

              <span className="text-xs text-neutral-400">{item[2]}</span>
            </div>

            <p className="text-sm font-semibold text-neutral-950">{item[1]}</p>
          </div>
        ))}
      </div>

      <div className="absolute bottom-6 right-6 w-[34%] rounded-[28px] bg-neutral-950 p-5 text-white shadow-[0_26px_80px_rgba(0,0,0,0.22)]">
        <div className="mb-4 grid h-11 w-11 place-items-center rounded-[16px] bg-white/10">
          <Bell size={20} />
        </div>

        <p className="text-sm font-semibold">Update sent</p>
        <p className="mt-2 text-xs leading-5 text-white/55">
          Link, status, and attachment update will be visible to the requester.
        </p>
      </div>

      <div className="absolute right-[28%] top-[142px] animate-[tourCursor_3.2s_ease-in-out_infinite]">
        <MousePointer2 size={28} className="fill-white text-neutral-950" />
      </div>
    </div>
  );
}

function CalendarPreview() {
  return (
    <div className="relative h-[360px] overflow-hidden rounded-[34px] border border-black/5 bg-[#f6f6f4] p-5 shadow-inner">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
            Live Calendar
          </p>
          <p className="mt-1 text-2xl font-semibold tracking-[-0.06em]">
            July 2026
          </p>
        </div>

        <div className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-neutral-500 shadow-sm">
          Today
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 28 }).map((_, index) => {
          const isToday = index === 8;
          const hasNote = [3, 8, 11, 17, 24].includes(index);

          return (
            <div
              key={index}
              className={`relative h-[44px] rounded-[14px] border text-xs ${
                isToday
                  ? "border-neutral-950 bg-white text-neutral-950 shadow-sm"
                  : "border-black/5 bg-white/70 text-neutral-500"
              }`}
            >
              <span className="absolute left-3 top-2">{index + 1}</span>

              {hasNote ? (
                <span
                  className={`absolute bottom-2 right-2 h-2 w-2 rounded-full ${
                    isToday ? "bg-emerald-500" : "bg-blue-500"
                  }`}
                />
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="absolute bottom-5 left-5 right-5 grid grid-cols-3 gap-3">
        {[
          ["Daily Material Check", "Check price & links"],
          ["Request Status Flow", "Keep task aligned"],
          ["Asset Link Rule", "One source of truth"],
        ].map((item, index) => (
          <div
            key={item[0]}
            className="animate-[tourCardIn_.65s_cubic-bezier(.16,1,.3,1)_both] rounded-[20px] border border-black/5 bg-white p-4 shadow-[0_18px_45px_rgba(0,0,0,0.06)]"
            style={{ animationDelay: `${index * 120}ms` }}
          >
            <p className="line-clamp-1 text-xs font-semibold text-neutral-950">
              {item[0]}
            </p>
            <p className="mt-1 line-clamp-1 text-[11px] text-neutral-500">
              {item[1]}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function CatalogPreview() {
  return (
    <div className="relative h-[360px] overflow-hidden rounded-[34px] border border-black/5 bg-[#f6f6f4] p-5 shadow-inner">
      <div className="grid h-full grid-cols-[.78fr_1.22fr] gap-4">
        <div className="rounded-[28px] bg-white/80 p-4 shadow-sm">
          <div className="mb-5 flex items-center gap-2 rounded-[16px] bg-neutral-100 px-3 py-2 text-xs font-semibold">
            <FolderOpen size={16} />
            Catalog Home
          </div>

          {["P4 Series", "7.7 Upload", "Testing Server"].map((item, index) => (
            <div
              key={item}
              className={`mb-2 flex items-center justify-between rounded-[18px] px-3 py-3 text-sm font-semibold ${
                index === 0
                  ? "bg-neutral-950 text-white"
                  : "bg-neutral-100 text-neutral-500"
              }`}
            >
              <span>{item}</span>
              <span className={index === 0 ? "text-white/50" : "text-neutral-400"}>
                {index === 0 ? "59" : index === 1 ? "8" : "2"}
              </span>
            </div>
          ))}
        </div>

        <div className="rounded-[28px] bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
                Assets
              </p>
              <p className="mt-1 text-2xl font-semibold tracking-[-0.06em]">
                P4 Series
              </p>
            </div>

            <div className="rounded-full bg-neutral-950 px-4 py-2 text-xs font-semibold text-white">
              Open
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              ["LP Price Reveal", "Landing Page"],
              ["SKU PDP NAD", "SKU PDP"],
              ["Discovery", "Discovery"],
              ["Exposure Tiktok", "Exposure"],
            ].map((item, index) => (
              <div
                key={item[0]}
                className="animate-[tourSlideUp_.65s_cubic-bezier(.16,1,.3,1)_both] rounded-[20px] border border-black/5 bg-[#f7f7f5] p-4"
                style={{ animationDelay: `${index * 120}ms` }}
              >
                <div className="mb-4 grid h-10 w-10 place-items-center rounded-[14px] bg-white shadow-sm">
                  <Layers size={17} />
                </div>

                <p className="line-clamp-1 text-sm font-semibold">{item[0]}</p>
                <p className="mt-1 text-xs text-neutral-500">{item[1]}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute right-7 top-7 animate-[tourPulse_2.2s_ease-in-out_infinite] rounded-full bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700 shadow-sm">
        Library ready
      </div>
    </div>
  );
}

function AnimatedPreview({ type }) {
  if (type === "request") return <RequestPreview />;
  if (type === "calendar") return <CalendarPreview />;
  if (type === "catalog") return <CatalogPreview />;
  return <OverviewPreview />;
}

export default function OnboardingTour({ auth }) {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const activeStep = TOUR_STEPS[step];
  const Icon = activeStep.icon;
  const isLastStep = step === TOUR_STEPS.length - 1;

  const previewKey = useMemo(() => `${activeStep.type}-${step}`, [activeStep.type, step]);

  async function finishTour() {
    setSaving(true);
    setError("");

    const result = await auth?.completeTour?.();

    if (result?.error) {
      setError(result.error.message || "Failed to finish tour.");
      setSaving(false);
      return;
    }

    setSaving(false);
  }

  function handleNext() {
    if (isLastStep) {
      finishTour();
      return;
    }

    setStep((prev) => Math.min(prev + 1, TOUR_STEPS.length - 1));
  }

  function handleBack() {
    setStep((prev) => Math.max(prev - 1, 0));
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f5f5f3] px-6 py-8 text-neutral-950">
      <style>{`
        @keyframes tourFadeUp {
          from { opacity: 0; transform: translateY(18px) scale(.985); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes tourFloat {
          0%, 100% { transform: translate3d(0,0,0); }
          50% { transform: translate3d(10px,-12px,0); }
        }

        @keyframes tourFloatReverse {
          0%, 100% { transform: translate3d(0,0,0); }
          50% { transform: translate3d(-12px,14px,0); }
        }

        @keyframes tourCardIn {
          from { opacity: 0; transform: translateY(16px) scale(.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes tourSlideRight {
          from { opacity: 0; transform: translateX(-18px); }
          to { opacity: 1; transform: translateX(0); }
        }

        @keyframes tourSlideUp {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes tourCursor {
          0%, 100% { transform: translate3d(0,0,0) rotate(-8deg); }
          45% { transform: translate3d(34px,32px,0) rotate(-8deg); }
          65% { transform: translate3d(34px,32px,0) scale(.88) rotate(-8deg); }
        }

        @keyframes tourPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.04); opacity: .82; }
        }

        @keyframes tourProgress {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }

        .tour-fade {
          animation: tourFadeUp .55s cubic-bezier(.16,1,.3,1) both;
        }
      `}</style>

      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -left-28 top-10 h-[360px] w-[360px] rounded-full bg-white blur-3xl" />
        <div className="absolute right-[-170px] top-[-120px] h-[520px] w-[520px] rounded-full bg-white/90 blur-3xl" />
        <div className="absolute bottom-[-240px] left-[18%] h-[560px] w-[560px] rounded-full bg-white blur-3xl" />
      </div>

      <div className="tour-fade relative z-10 mx-auto grid min-h-[calc(100vh-64px)] w-full max-w-7xl place-items-center">
        <div className="grid w-full gap-5 lg:grid-cols-[.88fr_1.12fr]">
          <section className="flex flex-col justify-center rounded-[38px] border border-white/70 bg-white/76 p-7 shadow-[0_28px_95px_rgba(0,0,0,0.08)] backdrop-blur-xl md:p-9">
            <div className="mb-7 inline-flex w-fit items-center gap-2 rounded-full border border-black/5 bg-white px-4 py-2 text-xs font-semibold text-neutral-600 shadow-sm">
              <Icon size={17} strokeWidth={1.8} />
              {activeStep.badge}
            </div>

            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-neutral-400">
              {activeStep.eyebrow}
            </p>

            <h1 className="mt-4 max-w-xl text-[54px] font-semibold leading-[0.92] tracking-[-0.085em] md:text-[72px]">
              {activeStep.title}
            </h1>

            <p className="mt-5 max-w-lg text-[15px] leading-7 text-neutral-500 md:text-base">
              {activeStep.desc}
            </p>

            <div className="mt-9">
              <ProgressBar index={step} />
            </div>

            {error ? (
              <div className="mt-5 rounded-[20px] bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
                {error}
              </div>
            ) : null}

            <div className="mt-7 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={step === 0 ? finishTour : handleBack}
                disabled={saving}
                className="rounded-[20px] bg-neutral-100 px-5 py-4 text-sm font-semibold text-neutral-500 transition hover:bg-neutral-200 hover:text-neutral-950 active:scale-[0.985] disabled:opacity-60"
              >
                {step === 0 ? "Skip" : "Back"}
              </button>

              <button
                type="button"
                onClick={handleNext}
                disabled={saving}
                className="flex items-center justify-center gap-2 rounded-[20px] bg-neutral-950 px-5 py-4 text-sm font-semibold text-white transition hover:bg-neutral-800 active:scale-[0.985] disabled:opacity-60"
              >
                {saving ? <Loader2 size={18} className="animate-spin" /> : null}
                {isLastStep ? "Finish" : "Next"}
                {!saving ? <ArrowRight size={18} strokeWidth={1.8} /> : null}
              </button>
            </div>
          </section>

          <section className="rounded-[38px] border border-white/70 bg-white/60 p-5 shadow-[0_28px_95px_rgba(0,0,0,0.08)] backdrop-blur-xl">
            <div className="mb-4 flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-red-400" />
                <span className="h-3 w-3 rounded-full bg-amber-400" />
                <span className="h-3 w-3 rounded-full bg-emerald-400" />
              </div>

              <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold text-neutral-500 shadow-sm">
                <Sparkles size={15} />
                Live Preview
              </div>
            </div>

            <div key={previewKey} className="animate-[tourFadeUp_.45s_cubic-bezier(.16,1,.3,1)_both]">
              <AnimatedPreview type={activeStep.type} />
            </div>
          </section>
        </div>

        <div className="mt-5 flex items-center justify-center gap-2 text-xs text-neutral-400">
          {TOUR_STEPS.map((item, index) => (
            <button
              key={item.title}
              type="button"
              onClick={() => setStep(index)}
              className={`h-2.5 rounded-full transition ${
                index === step
                  ? "w-8 bg-neutral-950"
                  : "w-2.5 bg-neutral-300 hover:bg-neutral-500"
              }`}
              aria-label={`Go to ${item.title}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}