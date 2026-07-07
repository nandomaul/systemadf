import React, { useMemo, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  Sparkles,
  User,
  Users,
} from "lucide-react";

import {
  AVATAR_LIST,
  DEFAULT_AVATAR_KEY,
  TEAM_OPTIONS,
  getAvatarByKey,
} from "./avatarLibrary";

function cleanText(value) {
  return String(value || "").trim();
}

export default function ProfileSetup({ auth }) {
  const currentProfile = auth?.profile || {};

  const [displayName, setDisplayName] = useState(
    currentProfile.display_name || ""
  );

  const [team, setTeam] = useState(currentProfile.team || "ADF");

  const [avatarKey, setAvatarKey] = useState(
    currentProfile.avatar_key || DEFAULT_AVATAR_KEY
  );

  const [localError, setLocalError] = useState("");
  const [completed, setCompleted] = useState(false);

  const selectedAvatar = useMemo(() => {
    return getAvatarByKey(avatarKey);
  }, [avatarKey]);

  const canSubmit = Boolean(cleanText(displayName) && team && avatarKey);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setLocalError("");

    if (!cleanText(displayName)) {
      setLocalError("Please enter your display name.");
      return;
    }

    if (!team) {
      setLocalError("Please choose your team.");
      return;
    }

    if (!avatarKey) {
      setLocalError("Please choose your avatar.");
      return;
    }

    const result = await auth.completeProfileSetup({
      displayName,
      team,
      avatarKey,
    });

    if (result?.error) {
      setLocalError(result.error.message || "Failed to save profile.");
      return;
    }

    setCompleted(true);

    setTimeout(() => {
      window.dispatchEvent(new Event("adf-profile-setup-completed"));
    }, 700);
  };

  const errorMessage = localError || auth?.profileError || "";

  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-[#f5f5f3] px-5 py-8 text-neutral-950">
      <style>{`
        @keyframes profileFloat {
          0%, 100% { transform: translate3d(0,0,0) scale(1); }
          50% { transform: translate3d(22px,-18px,0) scale(1.035); }
        }

        @keyframes profileFloatReverse {
          0%, 100% { transform: translate3d(0,0,0) scale(1); }
          50% { transform: translate3d(-22px,18px,0) scale(1.04); }
        }

        @keyframes profileFadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .profile-fade {
          animation: profileFadeUp .62s cubic-bezier(.16,1,.3,1) both;
        }
      `}</style>

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-28 top-10 h-[360px] w-[360px] animate-[profileFloat_10s_ease-in-out_infinite] rounded-full bg-white blur-3xl" />
        <div className="absolute right-[-170px] top-[-120px] h-[520px] w-[520px] animate-[profileFloatReverse_13s_ease-in-out_infinite] rounded-full bg-white/90 blur-3xl" />
        <div className="absolute bottom-[-240px] left-[18%] h-[560px] w-[560px] animate-[profileFloat_12s_ease-in-out_infinite] rounded-full bg-white blur-3xl" />
      </div>

      <div className="profile-fade relative z-10 grid w-full max-w-6xl gap-5 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="relative overflow-hidden rounded-[38px] border border-white/70 bg-white/64 p-7 shadow-[0_28px_95px_rgba(0,0,0,0.08)] backdrop-blur-xl md:p-10">
          <div className="absolute right-[-120px] top-[-120px] h-[320px] w-[320px] rounded-full bg-neutral-950/5 blur-3xl" />
          <div className="absolute bottom-[-150px] left-[-120px] h-[340px] w-[340px] rounded-full bg-white blur-3xl" />

          <div className="relative z-10 flex h-full min-h-[560px] flex-col justify-between">
            <div>
              <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-black/5 bg-white/78 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500 shadow-sm">
                <CheckCircle2 size={15} strokeWidth={1.8} />
                Account Completed
              </div>

              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-neutral-400">
                System ADF
              </p>

              <h1 className="mt-5 max-w-2xl text-[54px] font-light leading-[0.9] tracking-[-0.085em] md:text-[78px]">
                Your account
                <span className="block font-semibold tracking-[-0.09em]">
                  is ready.
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-[15px] leading-7 text-neutral-500 md:text-base">
                Complete your profile so requests, notes, and team activity stay
                consistent across System ADF.
              </p>
            </div>

            <div className="rounded-[30px] border border-white/70 bg-white/72 p-5 shadow-sm">
              <div className="flex items-center gap-4">
                <div
                  className={`grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-[26px] bg-gradient-to-br ${selectedAvatar.bg} shadow-sm`}
                >
                  <img
                    src={selectedAvatar.src}
                    alt={selectedAvatar.label}
                    className="h-full w-full object-cover"
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                  />
                  <span className="text-3xl">{selectedAvatar.fallback}</span>
                </div>

                <div className="min-w-0">
                  <p className="truncate text-2xl font-semibold tracking-[-0.055em]">
                    {cleanText(displayName) || "Display Name"}
                  </p>
                  <p className="mt-1 text-sm text-neutral-500">
                    {team || "Team"} · {selectedAvatar.label}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[38px] border border-white/70 bg-white/80 p-5 shadow-[0_28px_95px_rgba(0,0,0,0.08)] backdrop-blur-xl md:p-7">
          <form
            onSubmit={handleSubmit}
            className="rounded-[30px] border border-black/5 bg-white p-5 shadow-sm md:p-7"
          >
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-neutral-400">
                Profile Setup
              </p>

              <h2 className="mt-3 text-[36px] font-semibold leading-[0.95] tracking-[-0.075em]">
                Set your identity.
              </h2>

              <p className="mt-3 text-sm leading-6 text-neutral-500">
                This name will be used for Request Design, requester data, and
                internal activity.
              </p>
            </div>

            {completed ? (
              <div className="mb-5 rounded-[24px] border border-emerald-100 bg-emerald-50 p-5 text-emerald-800">
                <div className="mb-3 grid h-11 w-11 place-items-center rounded-2xl bg-white text-emerald-700 shadow-sm">
                  <CheckCircle2 size={22} strokeWidth={1.8} />
                </div>
                <p className="text-sm font-semibold">
                  Your profile has been successfully completed.
                </p>
                <p className="mt-2 text-xs leading-5 text-emerald-700/80">
                  Preparing your System ADF onboarding tour.
                </p>
              </div>
            ) : null}

            {errorMessage ? (
              <div className="mb-5 rounded-[20px] bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
                {errorMessage}
              </div>
            ) : null}

            <div className="space-y-4">
              <label className="block">
                <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.18em] text-neutral-400">
                  Display Name
                </span>

                <div className="flex items-center gap-3 rounded-[20px] border border-black/5 bg-neutral-100 px-4 py-3.5 transition focus-within:bg-white focus-within:shadow-sm">
                  <User size={19} strokeWidth={1.8} className="text-neutral-400" />

                  <input
                    value={displayName}
                    onChange={(event) => setDisplayName(event.target.value)}
                    placeholder="Example: Defrin"
                    autoComplete="name"
                    className="w-full bg-transparent text-sm font-semibold outline-none placeholder:text-neutral-400"
                  />
                </div>
              </label>

              <div>
                <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.18em] text-neutral-400">
                  Team
                </span>

                <div className="grid gap-2 sm:grid-cols-2">
                  {TEAM_OPTIONS.map((item) => {
                    const isActive = team === item.value;

                    return (
                      <button
                        type="button"
                        key={item.value}
                        onClick={() => setTeam(item.value)}
                        className={`rounded-[20px] border px-4 py-4 text-left transition ${
                          isActive
                            ? "border-neutral-950 bg-neutral-950 text-white shadow-sm"
                            : "border-black/5 bg-neutral-100 text-neutral-500 hover:bg-white hover:text-neutral-950"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`grid h-9 w-9 shrink-0 place-items-center rounded-2xl ${
                              isActive
                                ? "bg-white text-neutral-950"
                                : "bg-white text-neutral-500"
                            }`}
                          >
                            <Users size={17} strokeWidth={1.8} />
                          </div>

                          <div>
                            <p className="text-sm font-semibold">{item.label}</p>
                            <p
                              className={`mt-0.5 text-xs ${
                                isActive ? "text-white/60" : "text-neutral-400"
                              }`}
                            >
                              {item.description}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.18em] text-neutral-400">
                  Avatar
                </span>

                <div className="grid grid-cols-5 gap-3">
                  {AVATAR_LIST.map((avatar) => {
                    const isActive = avatarKey === avatar.key;

                    return (
                      <button
                        type="button"
                        key={avatar.key}
                        onClick={() => setAvatarKey(avatar.key)}
                        title={avatar.label}
                        className={`group relative aspect-square overflow-hidden rounded-[22px] border transition ${
                          isActive
                            ? "border-neutral-950 bg-white shadow-[0_14px_35px_rgba(0,0,0,0.12)]"
                            : "border-black/5 bg-neutral-100 hover:bg-white"
                        }`}
                      >
                        <div
                          className={`absolute inset-0 bg-gradient-to-br ${avatar.bg}`}
                        />

                        <img
                          src={avatar.src}
                          alt={avatar.label}
                          className="relative z-10 h-full w-full object-cover transition duration-300 group-hover:scale-105"
                          onError={(event) => {
                            event.currentTarget.style.display = "none";
                          }}
                        />

                        <span className="relative z-10 text-2xl">
                          {avatar.fallback}
                        </span>

                        {isActive ? (
                          <div className="absolute right-2 top-2 z-20 grid h-6 w-6 place-items-center rounded-full bg-neutral-950 text-white">
                            <CheckCircle2 size={14} strokeWidth={2} />
                          </div>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={!canSubmit || auth?.savingProfile}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-[20px] bg-neutral-950 px-5 py-4 text-sm font-semibold text-white shadow-sm transition hover:bg-neutral-800 active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {auth?.savingProfile ? (
                <Loader2 size={18} className="animate-spin" />
              ) : completed ? (
                <Sparkles size={18} strokeWidth={1.8} />
              ) : (
                <ArrowRight size={18} strokeWidth={1.8} />
              )}

              {completed ? "Profile Completed" : "Save Profile"}
            </button>
          </form>

          <div className="mt-5 rounded-[26px] border border-white/70 bg-white/55 p-5 shadow-sm">
            <div className="flex gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white text-neutral-700 shadow-sm">
                <ShieldCheck size={18} strokeWidth={1.8} />
              </div>

              <div>
                <p className="text-sm font-semibold">Cleaner request data</p>
                <p className="mt-1 text-xs leading-5 text-neutral-500">
                  Later, when you type short names like “def”, System ADF can
                  suggest the saved profile name “Defrin” to avoid duplicate or
                  inconsistent requester names.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}