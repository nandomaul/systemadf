import React, { useState } from "react";
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
  Sparkles,
} from "lucide-react";

const TOUR_STEPS = [
  {
    eyebrow: "SYSTEM ADF TOUR",
    title: "Welcome to System ADF.",
    desc: "A clean workspace for launch assets, request design, calendar, notes, and catalog references.",
    badge: "Workspace Overview",
    icon: LayoutDashboard,
    type: "overview",
  },
  {
    eyebrow: "REQUEST WORKFLOW",
    title: "Request Design",
    desc: "Use your saved display name to keep requester data clean, consistent, and searchable.",
    badge: "Clean request data",
    icon: FileText,
    type: "request",
  },
  {
    eyebrow: "TIMELINE & NOTES",
    title: "Calendar & Notes",
    desc: "Track deadlines, campaign notes, links, reminders, and daily updates from one visual board.",
    badge: "Daily workflow",
    icon: CalendarDays,
    type: "calendar",
  },
  {
    eyebrow: "ASSET LIBRARY",
    title: "Asset Hub",
    desc: "Open launch assets, catalog folders, reusable links, and references faster.",
    badge: "Catalog ready",
    icon: Layers,
    type: "catalog",
  },
];

function ProgressBar({ step }) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {TOUR_STEPS.map((_, index) => (
        <div
          key={index}
          className={`h-2 overflow-hidden rounded-full ${
            index <= step ? "bg-neutral-950" : "bg-neutral-200"
          }`}
        >
          {index === step ? (
            <div className="h-full w-full origin-left animate-[tourProgress_1.1s_ease_both] rounded-full bg-neutral-950" />
          ) : null}
        </div>
      ))}
    </div>
  );
}

function MiniCard({ title, desc, delay = 0 }) {
  return (
    <div
      className="animate-[tourCardIn_.62s_cubic-bezier(.16,1,.3,1)_both] rounded-[22px] border border-black/5 bg-white/85 p-4 shadow-[0_18px_48px_rgba(0,0,0,0.07)] backdrop-blur-xl"
      style={{ animationDelay: `${delay}ms` }}
    >
      <p className="text-sm font-semibold text-neutral-950">{title}</p>
      <p className="mt-1 text-xs leading-5 text-neutral-500">{desc}</p>
    </div>
  );
}

function OverviewPreview() {
  return (
    <div className="relative h-[370px] overflow-hidden rounded-[34px] border border-black/5 bg-[#f7f7f5] p-5 shadow-inner">
      <div className="absolute left-5 top-5 inline-flex animate-[tourFloat_4s_ease-in-out_infinite] items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold text-neutral-600 shadow-sm">
        <Sparkles size={15} />
        ADF SITE
      </div>

      <div className="absolute right-5 top-5 animate-[tourFloatReverse_5s_ease-in-out_infinite] rounded-full bg-neutral-950 px-4 py-2 text-xs font-semibold text-white shadow-sm">
        Authorized
      </div>

      <div className="absolute left-1/2 top-[92px] w-[80%] -translate-x-1/2 text-center">
        <p className="text-[40px] font-light leading-[0.9] tracking-[-0.085em]">
          What do you{" "}
          <span className="font-semibold tracking-[-0.09em]">need</span>
          <br />
          today?
        </p>
        <p className="mt-4 text-sm text-neutral-500">Choose quickly.</p>
      </div>

      <div className="absolute inset-x-5 bottom-5 grid grid-cols-3 gap-3">
        <MiniCard title="Launch" desc="SKU, LP, Banner" delay={0} />
        <MiniCard title="Request" desc="Design workflow" delay={120} />
        <MiniCard title="Catalog" desc="Asset reference" delay={240} />
      </div>
    </div>
  );
}

function RequestPreview() {
  return (
    <div className="relative h-[370px] overflow-hidden rounded-[34px] border border-black/5 bg-[#f7f7f5] p-5 shadow-inner">
      <div className="mb-5 flex items-center justify-between">
        <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold shadow-sm">
          <FileText size={15} />
          Request Design
        </div>

        <div className="rounded-full bg-neutral-950 px-4 py-2 text-xs font-semibold text-white shadow-sm">
          3 active
        </div>
      </div>

      <div className="grid grid-cols-[1.08fr_.92fr] gap-4">
        <div className="space-y-3">
          <MiniCard title="P4 Series LP Price Reveal" desc="Defrin · Landing Page · High" delay={0} />
          <MiniCard title="Banner Akulaku" desc="Ferdhy · Banner · Medium" delay={130} />
          <MiniCard title="Discovery Material" desc="Admin · Catalog update" delay={260} />
        </div>

        <div className="animate-[tourSlideUp_.7s_cubic-bezier(.16,1,.3,1)_both] rounded-[28px] bg-neutral-950 p-5 text-white shadow-[0_26px_80px_rgba(0,0,0,0.24)]">
          <div className="mb-5 grid h-12 w-12 place-items-center rounded-[18px] bg-white/10">
            <Bell size={21} />
          </div>

          <p className="text-base font-semibold">Update sent</p>
          <p className="mt-2 text-xs leading-5 text-white/55">
            Link, status, and attachment update will be visible to the requester account.
          </p>

          <div className="mt-6 rounded-[18px] bg-white/10 p-3 text-xs">
            New link added
          </div>
        </div>
      </div>
    </div>
  );
}

function CalendarPreview() {
  return (
    <div className="relative h-[370px] overflow-hidden rounded-[34px] border border-black/5 bg-[#f7f7f5] p-5 shadow-inner">
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
                  ? "border-neutral-300 bg-white text-neutral-950 shadow-sm"
                  : "border-black/5 bg-white/70 text-neutral-500"
              }`}
            >
              <span className="absolute left-3 top-2">{index + 1}</span>

              {hasNote ? (
                <span className="absolute bottom-2 right-2 h-2 w-2 rounded-full bg-emerald-500" />
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="absolute bottom-5 left-5 right-5 grid grid-cols-3 gap-3">
        <MiniCard title="Daily Check" desc="Price & links" delay={0} />
        <MiniCard title="Request Flow" desc="Status aligned" delay={120} />
        <MiniCard title="Asset Rule" desc="One source" delay={240} />
      </div>
    </div>
  );
}

function CatalogPreview() {
  return (
    <div className="relative h-[370px] overflow-hidden rounded-[34px] border border-black/5 bg-[#f7f7f5] p-5 shadow-inner">
      <div className="grid h-full grid-cols-[.78fr_1.22fr] gap-4">
        <div className="rounded-[28px] bg-white/85 p-4 shadow-sm">
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
              <span className={index === 0 ? "text-white/55" : "text-neutral-400"}>
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

  function handleBackOrSkip() {
    if (step === 0) {
      finishTour();
      return;
    }

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

        @keyframes tourSlideUp {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
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

            <h1 className="mt-4 max-w-xl text-[50px] font-semibold leading-[0.92] tracking-[-0.085em] md:text-[68px]">
              {activeStep.title}
            </h1>

            <p className="mt-5 max-w-lg text-[15px] leading-7 text-neutral-500 md:text-base">
              {activeStep.desc}
            </p>

            <div className="mt-9">
              <ProgressBar step={step} />
            </div>

            {error ? (
              <div className="mt-5 rounded-[20px] bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
                {error}
              </div>
            ) : null}

            <div className="mt-7 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleBackOrSkip}
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
                <CheckCircle2 size={15} />
                Live Preview
              </div>
            </div>

            <div key={activeStep.type} className="animate-[tourFadeUp_.45s_cubic-bezier(.16,1,.3,1)_both]">
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
