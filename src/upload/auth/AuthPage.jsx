import React, { useState } from "react";
import {
  Loader2,
  Lock,
  Mail,
  MonitorCog,
  Phone,
  ShieldCheck,
  Sparkles,
  UserPlus,
} from "lucide-react";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M21.805 10.023h-9.59v3.955h5.52c-.238 1.273-.96 2.352-2.044 3.073v2.55h3.307c1.936-1.782 3.055-4.405 3.055-7.507 0-.713-.064-1.4-.248-2.071z"
      />
      <path
        fill="#34A853"
        d="M12.215 22c2.765 0 5.087-.916 6.783-2.399l-3.307-2.55c-.917.615-2.09.978-3.476.978-2.67 0-4.932-1.802-5.74-4.224H3.06v2.63C4.746 19.785 8.214 22 12.215 22z"
      />
      <path
        fill="#FBBC05"
        d="M6.475 13.805a5.98 5.98 0 0 1 0-3.61v-2.63H3.06a10.004 10.004 0 0 0 0 8.87l3.415-2.63z"
      />
      <path
        fill="#EA4335"
        d="M12.215 5.971c1.504 0 2.854.517 3.916 1.53l2.932-2.932C17.292 2.917 14.97 2 12.215 2 8.214 2 4.746 4.215 3.06 7.565l3.415 2.63c.808-2.422 3.07-4.224 5.74-4.224z"
      />
    </svg>
  );
}

function cleanAuthError(message = "") {
  const text = String(message || "").trim();

  if (!text) return "";

  if (text.toLowerCase().includes("invalid login credentials")) {
    return "Email or password is incorrect.";
  }

  if (text.toLowerCase().includes("email not confirmed")) {
    return "Please verify your email before logging in.";
  }

  return text;
}

export default function AuthPage({ auth }) {
  const [mode, setMode] = useState("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [phone, setPhone] = useState("");

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [simulateLoading, setSimulateLoading] = useState(false);

  const [notice, setNotice] = useState("");

  const isLogin = mode === "login";
  const errorMessage = cleanAuthError(auth?.authError);

  function resetLocalMessage() {
    setNotice("");
    auth?.clearAuthError?.();
  }

  function changeMode(nextMode) {
    setMode(nextMode);
    resetLocalMessage();
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setLoading(true);
    resetLocalMessage();

    if (isLogin) {
      await auth.signIn?.({
        email,
        password,
      });

      setLoading(false);
      return;
    }

    const result = await auth.signUp?.({
      email,
      password,
      phone,
    });

    if (!result?.error) {
      setNotice(
        result?.needsEmailConfirmation
          ? "Verification email has been sent. Please check your inbox."
          : "Your account has been successfully created."
      );
    }

    setLoading(false);
  }

  async function handleGoogleLogin() {
    setGoogleLoading(true);
    resetLocalMessage();

    const result = await auth.signInWithGoogle?.();

    if (result?.error) {
      setNotice("");
    }

    setGoogleLoading(false);
  }

  async function handleDemoLogin() {
    setDemoLoading(true);
    resetLocalMessage();

    await auth.signIn?.({
      email: "adminadf",
      password: "adf",
    });

    setDemoLoading(false);
  }

  async function handleSimulateNewAccount() {
    setSimulateLoading(true);
    resetLocalMessage();

    await auth.simulateNewAccount?.();

    setSimulateLoading(false);
  }

  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-[#f5f5f3] px-6 py-8 text-neutral-950">
      <style>{`
        @keyframes authFadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .auth-fade {
          animation: authFadeUp .58s cubic-bezier(.16,1,.3,1) both;
        }
      `}</style>

      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -left-28 top-10 h-[360px] w-[360px] rounded-full bg-white blur-3xl" />
        <div className="absolute right-[-170px] top-[-120px] h-[520px] w-[520px] rounded-full bg-white/90 blur-3xl" />
        <div className="absolute bottom-[-240px] left-[18%] h-[560px] w-[560px] rounded-full bg-white blur-3xl" />
      </div>

      <div className="auth-fade relative z-10 grid w-full max-w-6xl gap-5 lg:grid-cols-[1.05fr_.95fr]">
        <section className="flex min-h-[620px] flex-col justify-center rounded-[38px] border border-white/70 bg-white/70 p-8 shadow-[0_28px_95px_rgba(0,0,0,0.08)] backdrop-blur-xl md:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-neutral-400">
            System ADF
          </p>

          <h1 className="mt-6 max-w-2xl text-[58px] font-light leading-[0.88] tracking-[-0.085em] md:text-[88px]">
            Asset system
            <span className="block font-semibold tracking-[-0.09em]">
              secured.
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-[15px] leading-7 text-neutral-500 md:text-base">
            Log in to manage launch assets, request designs, project notes,
            catalog references, and internal team workflows.
          </p>
        </section>

        <section className="rounded-[38px] border border-white/70 bg-white/85 p-6 shadow-[0_28px_95px_rgba(0,0,0,0.08)] backdrop-blur-xl">
          <div className="rounded-[30px] border border-black/5 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-neutral-400">
              Account
            </p>

            <h2 className="mt-3 text-[38px] font-semibold leading-[0.95] tracking-[-0.075em]">
              {isLogin ? "Welcome back." : "Create account."}
            </h2>

            <p className="mt-3 text-sm leading-6 text-neutral-500">
              {isLogin
                ? "Log in to continue to System ADF."
                : "Create your account and complete your profile."}
            </p>

            <div className="mt-6 grid grid-cols-2 rounded-[18px] bg-neutral-100 p-1">
              <button
                type="button"
                onClick={() => changeMode("login")}
                className={
                  isLogin
                    ? "rounded-[15px] bg-white px-4 py-3 text-sm font-semibold shadow-sm"
                    : "rounded-[15px] px-4 py-3 text-sm font-semibold text-neutral-400 transition hover:text-neutral-700"
                }
              >
                Log In
              </button>

              <button
                type="button"
                onClick={() => changeMode("signup")}
                className={
                  !isLogin
                    ? "rounded-[15px] bg-white px-4 py-3 text-sm font-semibold shadow-sm"
                    : "rounded-[15px] px-4 py-3 text-sm font-semibold text-neutral-400 transition hover:text-neutral-700"
                }
              >
                Sign Up
              </button>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={googleLoading || loading}
              className="mt-5 flex w-full items-center justify-center gap-3 rounded-[20px] border border-black/5 bg-white px-5 py-4 text-sm font-semibold text-neutral-800 shadow-sm transition hover:bg-neutral-100 active:scale-[0.985] disabled:opacity-50"
            >
              {googleLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <GoogleIcon />
              )}
              Continue with Google
            </button>

            {notice ? (
              <div className="mt-5 rounded-[20px] bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                {notice}
              </div>
            ) : null}

            {errorMessage ? (
              <div className="mt-5 rounded-[20px] bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
                {errorMessage}
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="mt-5 space-y-3">
              <div className="flex items-center gap-3 rounded-[20px] bg-neutral-100 px-4 py-4">
                <Mail size={18} strokeWidth={1.8} className="text-neutral-400" />

                <input
                  type={isLogin ? "text" : "email"}
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder={isLogin ? "Email / adminadf" : "Email"}
                  className="w-full bg-transparent text-sm font-semibold outline-none placeholder:text-neutral-400"
                />
              </div>

              {!isLogin ? (
                <div className="flex items-center gap-3 rounded-[20px] bg-neutral-100 px-4 py-4">
                  <Phone
                    size={18}
                    strokeWidth={1.8}
                    className="text-neutral-400"
                  />

                  <input
                    type="tel"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder="Phone number"
                    className="w-full bg-transparent text-sm font-semibold outline-none placeholder:text-neutral-400"
                  />
                </div>
              ) : null}

              <div className="flex items-center gap-3 rounded-[20px] bg-neutral-100 px-4 py-4">
                <Lock size={18} strokeWidth={1.8} className="text-neutral-400" />

                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Password"
                  className="w-full bg-transparent text-sm font-semibold outline-none placeholder:text-neutral-400"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-[20px] bg-neutral-950 px-5 py-4 text-sm font-semibold text-white transition hover:bg-neutral-800 active:scale-[0.985] disabled:opacity-50"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : null}
                {isLogin ? "Log In" : "Create Account"}
              </button>
            </form>
          </div>

          {auth?.developerModeAllowed ? (
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <button
                type="button"
                onClick={handleDemoLogin}
                disabled={demoLoading}
                className="rounded-[24px] border border-amber-100 bg-amber-50 p-4 text-left shadow-sm transition hover:bg-amber-100/70 active:scale-[0.985] disabled:opacity-60"
              >
                <div className="mb-3 grid h-10 w-10 place-items-center rounded-2xl bg-white text-amber-700 shadow-sm">
                  {demoLoading ? (
                    <Loader2 size={19} className="animate-spin" />
                  ) : (
                    <MonitorCog size={19} strokeWidth={1.8} />
                  )}
                </div>

                <p className="text-sm font-semibold text-amber-900">
                  Demo Login
                </p>

                <p className="mt-1 text-xs leading-5 text-amber-800/75">
                  Enter System ADF instantly.
                </p>
              </button>

              <button
                type="button"
                onClick={handleSimulateNewAccount}
                disabled={simulateLoading}
                className="rounded-[24px] border border-sky-100 bg-sky-50 p-4 text-left shadow-sm transition hover:bg-sky-100/70 active:scale-[0.985] disabled:opacity-60"
              >
                <div className="mb-3 grid h-10 w-10 place-items-center rounded-2xl bg-white text-sky-700 shadow-sm">
                  {simulateLoading ? (
                    <Loader2 size={19} className="animate-spin" />
                  ) : (
                    <UserPlus size={19} strokeWidth={1.8} />
                  )}
                </div>

                <p className="text-sm font-semibold text-sky-900">
                  New Account Preview
                </p>

                <p className="mt-1 text-xs leading-5 text-sky-800/75">
                  Test profile setup and tour.
                </p>
              </button>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}