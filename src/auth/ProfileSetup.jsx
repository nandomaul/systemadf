import React, { useState } from "react";
import { AVATAR_LIST, DEFAULT_AVATAR_KEY, TEAM_OPTIONS, getAvatarByKey } from "./avatarLibrary";

export default function ProfileSetup({ auth }) {
  const [displayName, setDisplayName] = useState(auth.profile?.display_name || "");
  const [team, setTeam] = useState(auth.profile?.team || "ADF");
  const [avatarKey, setAvatarKey] = useState(auth.profile?.avatar_key || DEFAULT_AVATAR_KEY);
  const [error, setError] = useState("");

  const avatar = getAvatarByKey(avatarKey);

  async function handleSave(e) {
    e.preventDefault();
    setError("");

    if (!displayName.trim()) {
      setError("Please enter your display name.");
      return;
    }

    const result = await auth.completeProfileSetup({ displayName, team, avatarKey });
    if (result?.error) setError(result.error.message);
  }

  return (
    <div className="min-h-screen bg-[#f5f5f3] grid place-items-center px-6 text-neutral-950">
      <form onSubmit={handleSave} className="w-full max-w-4xl rounded-[38px] bg-white p-8 shadow-[0_30px_100px_rgba(0,0,0,.08)]">
        <p className="text-xs font-bold uppercase tracking-[.24em] text-neutral-400">Profile Setup</p>
        <h1 className="mt-3 text-5xl font-semibold tracking-[-.07em]">Your account is ready.</h1>
        <p className="mt-3 text-neutral-500">Set your name, team, and avatar before entering System ADF.</p>

        {error && <div className="mt-5 rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-600">{error}</div>}
        {auth.profileError && <div className="mt-5 rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-600">{auth.profileError}</div>}

        <div className="mt-7 flex items-center gap-4 rounded-3xl bg-neutral-100 p-4">
          <div className={`h-20 w-20 overflow-hidden rounded-3xl bg-gradient-to-br ${avatar.bg}`}>
            <img src={avatar.src} alt={avatar.label} className="h-full w-full object-cover" />
          </div>
          <div>
            <p className="text-2xl font-semibold tracking-[-.05em]">{displayName || "Display Name"}</p>
            <p className="text-sm text-neutral-500">{team} · {avatar.label}</p>
          </div>
        </div>

        <input className="mt-6 w-full rounded-2xl bg-neutral-100 px-4 py-4 text-sm font-semibold outline-none" placeholder="Display Name, example: Defrin" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />

        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          {TEAM_OPTIONS.map((item) => (
            <button type="button" key={item.value} onClick={() => setTeam(item.value)} className={`rounded-2xl px-4 py-4 text-sm font-semibold ${team === item.value ? "bg-black text-white" : "bg-neutral-100 text-neutral-500"}`}>
              {item.label}
            </button>
          ))}
        </div>

        <div className="mt-5 grid grid-cols-5 gap-3">
          {AVATAR_LIST.map((item) => (
            <button type="button" key={item.key} onClick={() => setAvatarKey(item.key)} className={`aspect-square overflow-hidden rounded-2xl border ${avatarKey === item.key ? "border-black" : "border-transparent"}`}>
              <img src={item.src} alt={item.label} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>

        <button disabled={auth.savingProfile} className="mt-7 w-full rounded-2xl bg-black py-4 text-sm font-semibold text-white disabled:opacity-50">
          {auth.savingProfile ? "Saving..." : "Save Profile"}
        </button>
      </form>
    </div>
  );
}
