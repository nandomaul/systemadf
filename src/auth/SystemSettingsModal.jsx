import React, { useMemo, useState } from "react";
import {
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  LogOut,
  Mail,
  Moon,
  Save,
  ShieldCheck,
  Sun,
  User,
  Users,
  X,
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

function maskEmail(email = "") {
  const value = String(email || "").trim();

  if (!value.includes("@")) return value || "No email";

  const [name, domain] = value.split("@");
  const visibleName = name.slice(0, 2);
  const hiddenName = name.length > 2 ? "•••" : "";
  return `${visibleName}${hiddenName}@${domain}`;
}

function MiniModal({ title, subtitle, children, onClose }) {
  return (
    <div className="fixed inset-0 z-[1000000] grid place-items-center bg-black/35 px-5 py-8 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-[34px] border border-white/70 bg-[#f5f5f3] p-5 shadow-[0_35px_120px_rgba(0,0,0,0.28)]">
        <div className="mb-5 flex items-start justify-between gap-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-neutral-400">
              System ADF
            </p>
            <h3 className="mt-2 text-3xl font-semibold tracking-[-0.07em] text-neutral-950">
              {title}
            </h3>
            {subtitle ? (
              <p className="mt-2 text-sm leading-6 text-neutral-500">
                {subtitle}
              </p>
            ) : null}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white text-neutral-500 shadow-sm transition hover:bg-neutral-100 hover:text-neutral-950"
          >
            <X size={20} strokeWidth={1.8} />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}

function ActionButton({ icon, title, desc, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-center gap-4 rounded-[24px] border border-black/5 bg-white px-5 py-4 text-left shadow-sm transition hover:bg-neutral-950 hover:text-white active:scale-[0.985]"
    >
      <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-neutral-100 text-neutral-700 transition group-hover:bg-white/12 group-hover:text-white">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{title}</p>
        <p className="mt-1 text-xs leading-5 text-neutral-500 transition group-hover:text-white/55">
          {desc}
        </p>
      </div>
      <span className="text-xl text-neutral-300 transition group-hover:text-white/70">›</span>
    </button>
  );
}

function ChangeEmailModal({ auth, currentEmail, onClose, onSuccess }) {
  const [newEmail, setNewEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  async function handleSave() {
    setNotice("");
    setError("");

    const cleanEmail = cleanText(newEmail).toLowerCase();

    if (!cleanEmail || !cleanEmail.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    if (cleanEmail === String(currentEmail || "").toLowerCase()) {
      setError("New email must be different from your current email.");
      return;
    }

    setSaving(true);
    const result = await auth.changeEmail(cleanEmail);
    setSaving(false);

    if (result?.error) {
      setError(result.error.message || "Failed to update email.");
      return;
    }

    const message = auth?.isDeveloperMode
      ? "Developer Mode email updated for demo."
      : "Verification email has been sent. Please verify it from your inbox.";

    setNotice(message);
    onSuccess?.(message);
  }

  return (
    <MiniModal
      title="Change Email"
      subtitle="Enter the new email. The account email will only change after verification."
      onClose={onClose}
    >
      {notice ? (
        <div className="mb-4 rounded-[22px] border border-emerald-100 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
          {notice}
        </div>
      ) : null}

      {error ? (
        <div className="mb-4 rounded-[22px] bg-red-50 p-4 text-sm font-semibold text-red-600">
          {error}
        </div>
      ) : null}

      <div className="rounded-[26px] bg-white/72 p-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-neutral-400">
          Current Email
        </p>
        <p className="mt-2 text-sm font-semibold text-neutral-700">
          {currentEmail || "No email"}
        </p>
      </div>

      <label className="mt-4 block">
        <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.18em] text-neutral-400">
          New Email
        </span>
        <input
          type="email"
          value={newEmail}
          onChange={(event) => setNewEmail(event.target.value)}
          placeholder="new-email@company.com"
          className="w-full rounded-[22px] border border-black/5 bg-white px-4 py-4 text-sm font-semibold outline-none transition focus:border-neutral-300"
        />
      </label>

      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-[22px] bg-neutral-950 px-5 py-4 text-sm font-semibold text-white transition hover:bg-neutral-800 active:scale-[0.985] disabled:opacity-60"
      >
        {saving ? <Loader2 size={18} className="animate-spin" /> : <Mail size={18} />}
        Send Verification
      </button>
    </MiniModal>
  );
}

function ChangePasswordModal({ auth, email, onClose, onSuccess }) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  async function handleSave() {
    setNotice("");
    setError("");

    if (!auth?.isDeveloperMode && !oldPassword) {
      setError("Please enter your old password.");
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New password and confirmation password do not match.");
      return;
    }

    setSaving(true);

    if (!auth?.isDeveloperMode) {
      const verifyResult = await auth.signIn({ email, password: oldPassword });

      if (verifyResult?.error) {
        setSaving(false);
        setError("Old password is incorrect.");
        return;
      }
    }

    const result = await auth.changePassword(newPassword);
    setSaving(false);

    if (result?.error) {
      setError(result.error.message || "Failed to update password.");
      return;
    }

    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");

    const message = auth?.isDeveloperMode
      ? "Developer Mode password updated for demo."
      : "Password updated. A security notification may be sent to your email.";

    setNotice(message);
    onSuccess?.(message);
  }

  function PasswordInput({ label, value, onChange, visible, setVisible, placeholder }) {
    return (
      <label className="block">
        <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.18em] text-neutral-400">
          {label}
        </span>
        <div className="flex items-center gap-3 rounded-[22px] border border-black/5 bg-white px-4 py-4 transition focus-within:border-neutral-300">
          <input
            type={visible ? "text" : "password"}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={placeholder}
            className="w-full bg-transparent text-sm font-semibold outline-none placeholder:text-neutral-400"
          />
          <button
            type="button"
            onClick={() => setVisible((prev) => !prev)}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-950"
          >
            {visible ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </div>
      </label>
    );
  }

  return (
    <MiniModal
      title="Change Password"
      subtitle={auth?.isDeveloperMode ? "Developer Mode will simulate password update." : "Confirm your old password, then create a new one."}
      onClose={onClose}
    >
      {notice ? (
        <div className="mb-4 rounded-[22px] border border-emerald-100 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
          {notice}
        </div>
      ) : null}

      {error ? (
        <div className="mb-4 rounded-[22px] bg-red-50 p-4 text-sm font-semibold text-red-600">
          {error}
        </div>
      ) : null}

      <div className="space-y-4">
        {!auth?.isDeveloperMode ? (
          <PasswordInput
            label="Old Password"
            value={oldPassword}
            onChange={setOldPassword}
            visible={showOld}
            setVisible={setShowOld}
            placeholder="Enter old password"
          />
        ) : null}

        <PasswordInput
          label="New Password"
          value={newPassword}
          onChange={setNewPassword}
          visible={showNew}
          setVisible={setShowNew}
          placeholder="Enter new password"
        />

        <PasswordInput
          label="Confirm Password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          visible={showConfirm}
          setVisible={setShowConfirm}
          placeholder="Confirm new password"
        />
      </div>

      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-[22px] bg-neutral-950 px-5 py-4 text-sm font-semibold text-white transition hover:bg-neutral-800 active:scale-[0.985] disabled:opacity-60"
      >
        {saving ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
        Save Password
      </button>
    </MiniModal>
  );
}

export default function SystemSettingsModal({ auth, onClose }) {
  const profile = auth?.profile || {};
  const user = auth?.user || {};

  const [displayName, setDisplayName] = useState(profile.display_name || "");
  const [team, setTeam] = useState(profile.team || "ADF");
  const [avatarKey, setAvatarKey] = useState(profile.avatar_key || DEFAULT_AVATAR_KEY);
  const [themeMode, setThemeMode] = useState(profile.theme_mode || "white");
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [notice, setNotice] = useState("");
  const [localError, setLocalError] = useState("");
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);

  const selectedAvatar = useMemo(() => getAvatarByKey(avatarKey), [avatarKey]);
  const currentEmail = user.email || profile.email || "";
  const errorMessage = localError || auth?.profileError || auth?.authError || "";

  async function handleSaveProfile() {
    setNotice("");
    setLocalError("");

    if (!cleanText(displayName)) {
      setLocalError("Display name is required.");
      return;
    }

    if (!team) {
      setLocalError("Please choose your team.");
      return;
    }

    setSaving(true);

    const result = await auth.updateProfile({
      display_name: displayName,
      team,
      avatar_key: avatarKey,
      theme_mode: themeMode,
      onboarding_completed: true,
    });

    setSaving(false);

    if (result?.error) {
      setLocalError(result.error.message || "Failed to save profile.");
      return;
    }

    setNotice("Profile settings have been saved.");
  }

  async function handleThemeChange(nextTheme) {
    setThemeMode(nextTheme);
    await auth.updateThemeMode(nextTheme);
  }

  async function handleLogout() {
    setNotice("");
    setLocalError("");
    setLoggingOut(true);

    const result = await auth.signOut();
    setLoggingOut(false);

    if (result?.error) {
      setLocalError(result.error.message || "Failed to log out.");
      return;
    }

    onClose?.();
  }

  return (
    <div className="fixed inset-0 z-[999999] grid place-items-center overflow-y-auto bg-black/25 px-5 py-8 backdrop-blur-sm">
      <style>{`
        @keyframes settingsFadeUp {
          from { opacity: 0; transform: translateY(16px) scale(.985); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .settings-fade { animation: settingsFadeUp .42s cubic-bezier(.16,1,.3,1) both; }
        .settings-scroll::-webkit-scrollbar { width: 8px; height: 8px; }
        .settings-scroll::-webkit-scrollbar-track { background: transparent; }
        .settings-scroll::-webkit-scrollbar-thumb { background: rgba(0,0,0,.14); border-radius: 999px; }
      `}</style>

      <div className="settings-fade w-full max-w-5xl overflow-hidden rounded-[36px] border border-white/70 bg-[#f5f5f3] shadow-[0_35px_120px_rgba(0,0,0,0.24)]">
        <div className="flex items-center justify-between border-b border-black/5 bg-white/72 px-6 py-5 backdrop-blur-xl">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-neutral-400">System ADF</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-[-0.06em]">Account Settings</h2>
          </div>

          <button type="button" onClick={onClose} className="grid h-11 w-11 place-items-center rounded-full bg-neutral-100 text-neutral-500 transition hover:bg-neutral-200 hover:text-neutral-950">
            <X size={21} strokeWidth={1.8} />
          </button>
        </div>

        <div className="settings-scroll max-h-[78vh] overflow-y-auto p-5 md:p-6">
          {notice ? (
            <div className="mb-5 rounded-[24px] border border-emerald-100 bg-emerald-50 p-4 text-emerald-800">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white text-emerald-700 shadow-sm">
                  <CheckCircle2 size={20} strokeWidth={1.8} />
                </div>
                <p className="text-sm font-semibold">{notice}</p>
              </div>
            </div>
          ) : null}

          {errorMessage ? (
            <div className="mb-5 rounded-[22px] bg-red-50 px-5 py-4 text-sm font-semibold text-red-600">
              {errorMessage}
            </div>
          ) : null}

          <div className="grid gap-5 lg:grid-cols-[1.05fr_.95fr]">
            <section className="rounded-[30px] border border-white/70 bg-white/70 p-5 shadow-[0_18px_55px_rgba(0,0,0,0.06)] backdrop-blur-xl">
              <div className="flex items-center gap-4 rounded-[26px] bg-neutral-100 p-4">
                <div className={`grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-[26px] bg-gradient-to-br ${selectedAvatar.bg} shadow-sm`}>
                  <img src={selectedAvatar.src} alt={selectedAvatar.label} className="h-full w-full object-cover" onError={(event) => { event.currentTarget.style.display = "none"; }} />
                  <span className="text-3xl">{selectedAvatar.fallback}</span>
                </div>

                <div className="min-w-0">
                  <p className="truncate text-3xl font-semibold tracking-[-0.065em]">{cleanText(displayName) || "Display Name"}</p>
                  <p className="mt-1 text-sm text-neutral-500">{team || "Team"} · {maskEmail(currentEmail)}</p>
                  {auth?.isDeveloperMode ? (
                    <p className="mt-2 inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">Developer Mode</p>
                  ) : null}
                </div>
              </div>

              <div className="mt-5 space-y-4">
                <label className="block">
                  <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.18em] text-neutral-400">Display Name</span>
                  <div className="flex items-center gap-3 rounded-[20px] border border-black/5 bg-neutral-100 px-4 py-3.5 transition focus-within:bg-white focus-within:shadow-sm">
                    <User size={19} strokeWidth={1.8} className="text-neutral-400" />
                    <input value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="Example: Defrin" className="w-full bg-transparent text-sm font-semibold outline-none placeholder:text-neutral-400" />
                  </div>
                </label>

                <div>
                  <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.18em] text-neutral-400">Team</span>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {TEAM_OPTIONS.map((item) => {
                      const isActive = team === item.value;
                      return (
                        <button type="button" key={item.value} onClick={() => setTeam(item.value)} className={`rounded-[20px] border px-4 py-4 text-left transition ${isActive ? "border-neutral-950 bg-neutral-950 text-white shadow-sm" : "border-black/5 bg-neutral-100 text-neutral-500 hover:bg-white hover:text-neutral-950"}`}>
                          <div className="flex items-center gap-3">
                            <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-2xl ${isActive ? "bg-white text-neutral-950" : "bg-white text-neutral-500"}`}>
                              <Users size={17} strokeWidth={1.8} />
                            </div>
                            <div>
                              <p className="text-sm font-semibold">{item.label}</p>
                              <p className={`mt-0.5 text-xs ${isActive ? "text-white/60" : "text-neutral-400"}`}>{item.description}</p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.18em] text-neutral-400">Avatar</span>
                  <div className="grid grid-cols-5 gap-3">
                    {AVATAR_LIST.map((avatar) => {
                      const isActive = avatarKey === avatar.key;
                      return (
                        <button type="button" key={avatar.key} onClick={() => setAvatarKey(avatar.key)} title={avatar.label} className={`group relative aspect-square overflow-hidden rounded-[22px] border transition ${isActive ? "border-neutral-950 bg-white shadow-[0_14px_35px_rgba(0,0,0,0.12)]" : "border-black/5 bg-neutral-100 hover:bg-white"}`}>
                          <div className={`absolute inset-0 bg-gradient-to-br ${avatar.bg}`} />
                          <img src={avatar.src} alt={avatar.label} className="relative z-10 h-full w-full object-cover transition duration-300 group-hover:scale-105" onError={(event) => { event.currentTarget.style.display = "none"; }} />
                          <span className="relative z-10 text-2xl">{avatar.fallback}</span>
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

                <div>
                  <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.18em] text-neutral-400">Interface Mode</span>
                  <div className="grid grid-cols-2 gap-2 rounded-[22px] bg-neutral-100 p-1">
                    <button type="button" onClick={() => handleThemeChange("white")} className={`flex items-center justify-center gap-2 rounded-[18px] px-4 py-3 text-sm font-semibold transition ${themeMode === "white" ? "bg-white text-neutral-950 shadow-sm" : "text-neutral-400 hover:text-neutral-700"}`}>
                      <Sun size={17} strokeWidth={1.8} /> White
                    </button>
                    <button type="button" onClick={() => handleThemeChange("dark")} className={`flex items-center justify-center gap-2 rounded-[18px] px-4 py-3 text-sm font-semibold transition ${themeMode === "dark" ? "bg-neutral-950 text-white shadow-sm" : "text-neutral-400 hover:text-neutral-700"}`}>
                      <Moon size={17} strokeWidth={1.8} /> Dark
                    </button>
                  </div>
                </div>

                <button type="button" onClick={handleSaveProfile} disabled={saving || auth?.savingProfile} className="flex w-full items-center justify-center gap-2 rounded-[20px] bg-neutral-950 px-5 py-4 text-sm font-semibold text-white shadow-sm transition hover:bg-neutral-800 active:scale-[0.985] disabled:opacity-60">
                  {saving || auth?.savingProfile ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} strokeWidth={1.8} />}
                  Save Profile
                </button>
              </div>
            </section>

            <section className="flex flex-col gap-5">
              <div className="rounded-[30px] border border-white/70 bg-white/70 p-5 shadow-[0_18px_55px_rgba(0,0,0,0.06)] backdrop-blur-xl">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-neutral-400">Security</p>
                <h3 className="mt-1 text-2xl font-semibold tracking-[-0.06em]">Account Access</h3>
                <p className="mt-2 text-sm leading-6 text-neutral-500">Keep account email and password hidden until needed. Cleaner for selling as a template.</p>

                <div className="mt-5 space-y-3">
                  <ActionButton icon={<Mail size={20} strokeWidth={1.8} />} title="Change Email" desc="Send verification to a new account email." onClick={() => setEmailModalOpen(true)} />
                  <ActionButton icon={<ShieldCheck size={20} strokeWidth={1.8} />} title="Change Password" desc="Update password from a secure popup." onClick={() => setPasswordModalOpen(true)} />
                </div>
              </div>

              <div className="rounded-[30px] border border-white/70 bg-white/70 p-5 shadow-[0_18px_55px_rgba(0,0,0,0.06)] backdrop-blur-xl">
                <div className="mb-4 flex items-center gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-2xl bg-neutral-100 text-neutral-700">
                    <ShieldCheck size={19} strokeWidth={1.8} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-neutral-950">Authorized Session</p>
                    <p className="text-xs text-neutral-400">{auth?.isDeveloperMode ? "Local preview session for template/demo." : "Connected to Supabase Auth."}</p>
                  </div>
                </div>

                <button type="button" onClick={handleLogout} disabled={loggingOut} className="flex w-full items-center justify-center gap-2 rounded-[20px] bg-red-50 px-5 py-4 text-sm font-semibold text-red-600 transition hover:bg-red-100 active:scale-[0.985] disabled:opacity-60">
                  {loggingOut ? <Loader2 size={18} className="animate-spin" /> : <LogOut size={18} strokeWidth={1.8} />}
                  Log Out Session
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>

      {emailModalOpen ? (
        <ChangeEmailModal auth={auth} currentEmail={currentEmail} onClose={() => setEmailModalOpen(false)} onSuccess={(message) => setNotice(message)} />
      ) : null}

      {passwordModalOpen ? (
        <ChangePasswordModal auth={auth} email={currentEmail} onClose={() => setPasswordModalOpen(false)} onSuccess={(message) => setNotice(message)} />
      ) : null}
    </div>
  );
}
