import { useEffect, useMemo, useState } from "react";
import { supabase } from "../supabaseClient";
import { DEFAULT_AVATAR_KEY, TEAM_OPTIONS } from "../auth/avatarLibrary";

const PROFILE_TABLE = "user_profiles";

const DEV_SESSION_KEY = "adf_dev_session_v1";
const DEV_PROFILE_KEY = "adf_dev_profile_v1";

const DEV_USERNAME = "adminadf";
const DEV_PASSWORD = "adf";

const THEME_OPTIONS = ["white", "dark"];
const TEAM_VALUES = TEAM_OPTIONS.map((team) => team.value);

function clean(value) {
  return String(value || "").trim();
}

function cleanEmail(value) {
  return clean(value).toLowerCase();
}

function cleanPhone(value) {
  return clean(value).replace(/[^\d+]/g, "");
}

function safeTeam(value) {
  return TEAM_VALUES.includes(value) ? value : "ADF";
}

function safeTheme(value) {
  return THEME_OPTIONS.includes(value) ? value : "white";
}

function isLocalhost() {
  if (typeof window === "undefined") return false;
  return ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);
}

function isDevAllowed() {
  try {
    return Boolean(import.meta.env.DEV) && isLocalhost();
  } catch {
    return isLocalhost();
  }
}

function redirectUrl() {
  if (typeof window === "undefined") return undefined;
  return window.location.origin;
}

function defaultDevProfile(extra = {}) {
  return {
    id: extra.id || "dev-admin-adf",
    email: extra.email || "developer@system-adf.local",
    phone: extra.phone || "",
    display_name:
      "display_name" in extra ? extra.display_name : "Admin ADF",
    team: safeTeam(extra.team || "ADF"),
    avatar_key: extra.avatar_key || DEFAULT_AVATAR_KEY,
    onboarding_completed:
      "onboarding_completed" in extra
        ? Boolean(extra.onboarding_completed)
        : true,
    tour_completed:
      "tour_completed" in extra ? Boolean(extra.tour_completed) : true,
    theme_mode: safeTheme(extra.theme_mode || "white"),
    is_developer_mode: true,
    is_simulated_new_user: Boolean(extra.is_simulated_new_user),
    created_at: extra.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

function devUserFromProfile(profile) {
  return {
    id: profile.id,
    email: profile.email,
    user_metadata: {
      display_name: profile.display_name,
      team: profile.team,
      avatar_key: profile.avatar_key,
    },
    app_metadata: {
      provider: profile.is_simulated_new_user
        ? "developer-simulation"
        : "developer-mode",
    },
  };
}

function readDevProfile() {
  try {
    return (
      JSON.parse(localStorage.getItem(DEV_PROFILE_KEY) || "null") ||
      defaultDevProfile()
    );
  } catch {
    return defaultDevProfile();
  }
}

function saveDevProfile(profile) {
  localStorage.setItem(DEV_PROFILE_KEY, JSON.stringify(profile));
}

function cacheProfile(profile) {
  try {
    if (!profile) {
      localStorage.removeItem("adf_user_profile_cache");
      window.ADFUserProfile = null;
      window.dispatchEvent(new Event("adf-profile-updated"));
      return;
    }

    localStorage.setItem("adf_user_profile_cache", JSON.stringify(profile));
    window.ADFUserProfile = profile;
    window.dispatchEvent(new Event("adf-profile-updated"));
  } catch {
    // ignore
  }
}

function readCachedProfile() {
  try {
    return JSON.parse(localStorage.getItem("adf_user_profile_cache") || "null");
  } catch {
    return null;
  }
}

function profileComplete(profile) {
  return Boolean(
    clean(profile?.display_name) &&
      clean(profile?.avatar_key) &&
      safeTeam(profile?.team)
  );
}

function defaultSupabaseProfile(user) {
  const meta = user?.user_metadata || {};

  return {
    id: user?.id,
    email: user?.email || null,
    phone: meta.phone || user?.phone || null,
    display_name: meta.display_name || "",
    team: safeTeam(meta.team),
    avatar_key: meta.avatar_key || DEFAULT_AVATAR_KEY,
    onboarding_completed: false,
    tour_completed: false,
    theme_mode: "white",
  };
}

export function getCachedAuthProfile() {
  return readCachedProfile();
}

export default function useAuthProfile() {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(() => readCachedProfile());

  const [isDevSession, setIsDevSession] = useState(false);

  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  const [authError, setAuthError] = useState("");
  const [profileError, setProfileError] = useState("");

  function setDevSession(nextProfile) {
    const nextUser = devUserFromProfile(nextProfile);

    localStorage.setItem(DEV_SESSION_KEY, "true");
    saveDevProfile(nextProfile);

    setIsDevSession(true);
    setSession({
      access_token: "developer-mode",
      user: nextUser,
    });
    setUser(nextUser);
    setProfile(nextProfile);
    cacheProfile(nextProfile);

    return nextUser;
  }

  async function loadProfile(nextUser) {
    if (!nextUser?.id) {
      setProfile(null);
      cacheProfile(null);
      return null;
    }

    setProfileLoading(true);
    setProfileError("");

    const { data, error } = await supabase
      .from(PROFILE_TABLE)
      .select("*")
      .eq("id", nextUser.id)
      .maybeSingle();

    if (error) {
      setProfileError(error.message);
      setProfileLoading(false);
      return null;
    }

    if (data) {
      setProfile(data);
      cacheProfile(data);
      setProfileLoading(false);
      return data;
    }

    const fallback = defaultSupabaseProfile(nextUser);

    const { data: inserted, error: insertError } = await supabase
      .from(PROFILE_TABLE)
      .upsert(fallback, { onConflict: "id" })
      .select("*")
      .single();

    if (insertError) {
      setProfileError(insertError.message);
      setProfileLoading(false);
      return null;
    }

    setProfile(inserted);
    cacheProfile(inserted);
    setProfileLoading(false);
    return inserted;
  }

  useEffect(() => {
    let alive = true;

    async function init() {
      setLoading(true);
      setAuthError("");
      setProfileError("");

      if (
        isDevAllowed() &&
        localStorage.getItem(DEV_SESSION_KEY) === "true"
      ) {
        const devProfile = readDevProfile();
        const devUser = setDevSession(devProfile);

        if (!alive) return;

        setSession({
          access_token: "developer-mode",
          user: devUser,
        });
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.getSession();

      if (!alive) return;

      if (error) {
        setAuthError(error.message);
        setSession(null);
        setUser(null);
        setProfile(null);
        cacheProfile(null);
        setLoading(false);
        return;
      }

      const nextSession = data?.session || null;
      const nextUser = nextSession?.user || null;

      setIsDevSession(false);
      setSession(nextSession);
      setUser(nextUser);

      if (nextUser) {
        await loadProfile(nextUser);
      } else {
        setProfile(null);
        cacheProfile(null);
      }

      if (alive) setLoading(false);
    }

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      if (localStorage.getItem(DEV_SESSION_KEY) === "true") return;

      const nextUser = nextSession?.user || null;

      setIsDevSession(false);
      setSession(nextSession || null);
      setUser(nextUser);

      if (nextUser) {
        await loadProfile(nextUser);
      } else {
        setProfile(null);
        cacheProfile(null);
      }

      setLoading(false);
    });

    return () => {
      alive = false;
      subscription?.unsubscribe?.();
    };
  }, []);

  async function signIn({ email, password }) {
    setAuthError("");

    const login = cleanEmail(email);

    if (isDevAllowed() && login === DEV_USERNAME && password === DEV_PASSWORD) {
      const devProfile = defaultDevProfile();
      const devUser = setDevSession(devProfile);

      return {
        data: {
          session: {
            access_token: "developer-mode",
            user: devUser,
          },
          user: devUser,
        },
        error: null,
        isDeveloperMode: true,
      };
    }

    if (!login || !password) {
      const message = "Please enter your email and password.";
      setAuthError(message);
      return { error: { message } };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: login,
      password,
    });

    if (error) {
      setAuthError(error.message);
      return { data, error };
    }

    return { data, error: null };
  }

  async function signUp({ email, password, phone }) {
    setAuthError("");

    const nextEmail = cleanEmail(email);
    const nextPhone = cleanPhone(phone);

    if (!nextEmail || !password) {
      const message = "Please enter your email and password.";
      setAuthError(message);
      return { error: { message } };
    }

    if (password.length < 6) {
      const message = "Password must be at least 6 characters.";
      setAuthError(message);
      return { error: { message } };
    }

    const { data, error } = await supabase.auth.signUp({
      email: nextEmail,
      password,
      options: {
        emailRedirectTo: redirectUrl(),
        data: {
          phone: nextPhone,
          avatar_key: DEFAULT_AVATAR_KEY,
        },
      },
    });

    if (error) {
      setAuthError(error.message);
      return { data, error };
    }

    return {
      data,
      error: null,
      needsEmailConfirmation: !data?.session,
    };
  }

  async function signInWithGoogle() {
    setAuthError("");

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectUrl(),
      },
    });

    if (error) {
      setAuthError(error.message);
      return { data, error };
    }

    return { data, error: null };
  }

  function simulateNewAccount() {
    setAuthError("");
    setProfileError("");

    if (!isDevAllowed()) {
      const message = "New account simulation is only available on localhost.";
      setAuthError(message);
      return { error: { message } };
    }

    const simulatedProfile = defaultDevProfile({
      id: `dev-new-user-${Date.now()}`,
      email: "new-user@system-adf.local",
      display_name: "",
      team: "ADF",
      avatar_key: DEFAULT_AVATAR_KEY,
      onboarding_completed: false,
      tour_completed: false,
      is_simulated_new_user: true,
    });

    const simulatedUser = setDevSession(simulatedProfile);

    return {
      data: {
        session: {
          access_token: "developer-simulation",
          user: simulatedUser,
        },
        user: simulatedUser,
        profile: simulatedProfile,
      },
      error: null,
      isDeveloperMode: true,
      isSimulatedNewUser: true,
    };
  }

  async function signOut() {
    setAuthError("");
    setProfileError("");

    if (isDevSession || localStorage.getItem(DEV_SESSION_KEY) === "true") {
      localStorage.removeItem(DEV_SESSION_KEY);

      setIsDevSession(false);
      setSession(null);
      setUser(null);
      setProfile(null);
      cacheProfile(null);

      return { error: null };
    }

    const { error } = await supabase.auth.signOut();

    if (error) {
      setAuthError(error.message);
      return { error };
    }

    setSession(null);
    setUser(null);
    setProfile(null);
    cacheProfile(null);

    return { error: null };
  }

  async function resetPassword(email) {
    setAuthError("");

    if (isDevSession) {
      const message = "Password reset is disabled in Developer Mode.";
      setAuthError(message);
      return { error: { message } };
    }

    const nextEmail = cleanEmail(email);

    if (!nextEmail) {
      const message = "Please enter your email first.";
      setAuthError(message);
      return { error: { message } };
    }

    const { data, error } = await supabase.auth.resetPasswordForEmail(
      nextEmail,
      {
        redirectTo: redirectUrl(),
      }
    );

    if (error) {
      setAuthError(error.message);
      return { data, error };
    }

    return { data, error: null };
  }

  async function changeEmail(email) {
    setAuthError("");

    const nextEmail = cleanEmail(email);

    if (!nextEmail) {
      const message = "Please enter a valid email.";
      setAuthError(message);
      return { error: { message } };
    }

    if (isDevSession) {
      const nextProfile = {
        ...(profile || defaultDevProfile()),
        email: nextEmail,
        updated_at: new Date().toISOString(),
      };

      const nextUser = devUserFromProfile(nextProfile);

      saveDevProfile(nextProfile);

      setProfile(nextProfile);
      setUser(nextUser);
      setSession({
        access_token: "developer-mode",
        user: nextUser,
      });
      cacheProfile(nextProfile);

      return {
        data: {
          user: nextUser,
          profile: nextProfile,
        },
        error: null,
      };
    }

    const { data, error } = await supabase.auth.updateUser({
      email: nextEmail,
    });

    if (error) {
      setAuthError(error.message);
      return { data, error };
    }

    return { data, error: null };
  }

  async function changePassword(password) {
    setAuthError("");

    if (!password || password.length < 6) {
      const message = "Password must be at least 6 characters.";
      setAuthError(message);
      return { error: { message } };
    }

    if (isDevSession) {
      return {
        data: {
          message: "Developer Mode password updated for demo only.",
        },
        error: null,
      };
    }

    const { data, error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      setAuthError(error.message);
      return { data, error };
    }

    return { data, error: null };
  }

  async function updateProfile(updates = {}) {
    if (!user?.id) {
      const message = "User session not found.";
      setProfileError(message);
      return { error: { message } };
    }

    setSavingProfile(true);
    setProfileError("");

    if (isDevSession) {
      const nextProfile = {
        ...(profile || defaultDevProfile()),
        id: user.id,
        email: user.email || profile?.email || "developer@system-adf.local",
        updated_at: new Date().toISOString(),
      };

      if ("phone" in updates) nextProfile.phone = cleanPhone(updates.phone);
      if ("display_name" in updates) {
        nextProfile.display_name = clean(updates.display_name);
      }
      if ("team" in updates) nextProfile.team = safeTeam(updates.team);
      if ("avatar_key" in updates) {
        nextProfile.avatar_key = clean(updates.avatar_key) || DEFAULT_AVATAR_KEY;
      }
      if ("onboarding_completed" in updates) {
        nextProfile.onboarding_completed = Boolean(
          updates.onboarding_completed
        );
      }
      if ("tour_completed" in updates) {
        nextProfile.tour_completed = Boolean(updates.tour_completed);
      }
      if ("theme_mode" in updates) {
        nextProfile.theme_mode = safeTheme(updates.theme_mode);
      }

      const nextUser = devUserFromProfile(nextProfile);

      saveDevProfile(nextProfile);

      setUser(nextUser);
      setSession({
        access_token: "developer-mode",
        user: nextUser,
      });
      setProfile(nextProfile);
      cacheProfile(nextProfile);
      setSavingProfile(false);

      return { data: nextProfile, error: null };
    }

    const payload = {
      id: user.id,
      email: user.email || profile?.email || null,
    };

    if ("phone" in updates) payload.phone = cleanPhone(updates.phone);
    if ("display_name" in updates) payload.display_name = clean(updates.display_name);
    if ("team" in updates) payload.team = safeTeam(updates.team);
    if ("avatar_key" in updates) {
      payload.avatar_key = clean(updates.avatar_key) || DEFAULT_AVATAR_KEY;
    }
    if ("onboarding_completed" in updates) {
      payload.onboarding_completed = Boolean(updates.onboarding_completed);
    }
    if ("tour_completed" in updates) {
      payload.tour_completed = Boolean(updates.tour_completed);
    }
    if ("theme_mode" in updates) payload.theme_mode = safeTheme(updates.theme_mode);

    const { data, error } = await supabase
      .from(PROFILE_TABLE)
      .upsert(payload, { onConflict: "id" })
      .select("*")
      .single();

    if (error) {
      setProfileError(error.message);
      setSavingProfile(false);
      return { data: null, error };
    }

    setProfile(data);
    cacheProfile(data);
    setSavingProfile(false);

    return { data, error: null };
  }

  function completeProfileSetup({ displayName, team, avatarKey }) {
    return updateProfile({
      display_name: displayName,
      team,
      avatar_key: avatarKey || DEFAULT_AVATAR_KEY,
      onboarding_completed: true,
    });
  }

  function completeTour() {
    return updateProfile({
      tour_completed: true,
    });
  }

  function updateThemeMode(themeMode) {
    return updateProfile({
      theme_mode: safeTheme(themeMode),
    });
  }

  async function refreshProfile() {
    if (!user) return null;

    if (isDevSession) {
      const devProfile = readDevProfile();
      setProfile(devProfile);
      cacheProfile(devProfile);
      return devProfile;
    }

    return loadProfile(user);
  }

  const derived = useMemo(() => {
    const completed = profileComplete(profile);
    const onboardingCompleted = Boolean(profile?.onboarding_completed);
    const tourCompleted = Boolean(profile?.tour_completed);

    return {
      isAuthenticated: Boolean(session?.user),
      profileComplete: completed,
      needsProfileSetup:
        Boolean(session?.user) && (!completed || !onboardingCompleted),
      needsTour:
        Boolean(session?.user) &&
        completed &&
        onboardingCompleted &&
        !tourCompleted,
      displayName: profile?.display_name || "",
      team: profile?.team || "",
      avatarKey: profile?.avatar_key || DEFAULT_AVATAR_KEY,
      themeMode: safeTheme(profile?.theme_mode),
      isDeveloperMode: isDevSession,
      developerModeAllowed: isDevAllowed(),
    };
  }, [isDevSession, profile, session]);

  return {
    session,
    user,
    profile,

    loading,
    profileLoading,
    savingProfile,

    authError,
    profileError,

    ...derived,

    signIn,
    signUp,
    signInWithGoogle,
    simulateNewAccount,
    signOut,
    resetPassword,
    changeEmail,
    changePassword,

    updateProfile,
    completeProfileSetup,
    completeTour,
    updateThemeMode,
    refreshProfile,

    clearAuthError: () => setAuthError(""),
    clearProfileError: () => setProfileError(""),
  };
}
