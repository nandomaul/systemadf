import React, { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";

import Popup from "./popup";
import Frontpage from "./frontpage";
import RequestPage from "./requestpage";
import P4Series from "./upload/p4series";
import Catalog from "./catalog";

import useAuthProfile from "./hooks/useAuthProfile";
import AuthPage from "./auth/AuthPage";
import ProfileSetup from "./auth/ProfileSetup";
import OnboardingTour from "./auth/OnboardingTour";

const ROUTES = {
  "/": {
    label: "Popup",
    component: Popup,
  },
  "/popup": {
    label: "Popup",
    component: Popup,
  },
  "/frontpage": {
    label: "Frontpage",
    component: Frontpage,
  },
  "/requestpage": {
    label: "Request Page",
    component: RequestPage,
  },
  "/p4series": {
    label: "P4 Series",
    component: P4Series,
  },
  "/catalog": {
    label: "Catalog",
    component: Catalog,
  },
};

const STORAGE_KEY = "adf_internal_history_v1";
const DEFAULT_ROUTE = "/popup";

function normalizePath(pathname) {
  const cleanPath = String(pathname || "/")
    .split("?")[0]
    .split("#")[0]
    .replace(/\/+$/, "")
    .toLowerCase();

  if (!cleanPath) return "/";
  return cleanPath;
}

function getCurrentPath() {
  return normalizePath(window.location.pathname);
}

function isValidRoute(path) {
  const cleanPath = normalizePath(path);

  if (
    cleanPath === "/requestpage" ||
    cleanPath.startsWith("/requestpage/") ||
    cleanPath === "/catalog" ||
    cleanPath.startsWith("/catalog/")
  ) {
    return true;
  }

  return Boolean(ROUTES[cleanPath]);
}

function readInternalHistory() {
  try {
    const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "null");

    if (
      saved &&
      Array.isArray(saved.stack) &&
      typeof saved.index === "number" &&
      saved.stack.length > 0
    ) {
      const cleanStack = saved.stack
        .map((item) => normalizePath(item))
        .filter((item) => isValidRoute(item));

      if (cleanStack.length > 0) {
        return {
          stack: cleanStack,
          index: Math.min(Math.max(saved.index, 0), cleanStack.length - 1),
        };
      }
    }
  } catch {
    // ignore broken session storage
  }

  return {
    stack: [DEFAULT_ROUTE],
    index: 0,
  };
}

function saveInternalHistory(historyData) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(historyData));
}

function replaceBrowserUrl(path) {
  const nextPath = normalizePath(path);
  window.history.replaceState({ adf: true, path: nextPath }, "", nextPath);
}

function pushBrowserUrl(path) {
  const nextPath = normalizePath(path);
  window.history.pushState({ adf: true, path: nextPath }, "", nextPath);
}

function dispatchRouteChange() {
  window.dispatchEvent(new Event("adf-route-change"));
}

function createNavigate(setCurrentPath) {
  return function navigateTo(path, options = {}) {
    const nextPath = normalizePath(path);

    if (!isValidRoute(nextPath)) {
      console.warn(`ADF route not found: ${nextPath}`);
      return;
    }

    const currentPath = getCurrentPath();
    const historyData = readInternalHistory();

    if (options.replace) {
      const nextStack = [...historyData.stack];
      nextStack[historyData.index] = nextPath;

      const nextHistory = {
        stack: nextStack,
        index: historyData.index,
      };

      saveInternalHistory(nextHistory);
      replaceBrowserUrl(nextPath);
      setCurrentPath(nextPath);
      dispatchRouteChange();
      return;
    }

    if (currentPath === nextPath) {
      return;
    }

    const trimmedStack = historyData.stack.slice(0, historyData.index + 1);
    const nextStack = [...trimmedStack, nextPath];

    const nextHistory = {
      stack: nextStack,
      index: nextStack.length - 1,
    };

    saveInternalHistory(nextHistory);
    pushBrowserUrl(nextPath);
    setCurrentPath(nextPath);
    dispatchRouteChange();
  };
}

function isMobileViewport() {
  if (typeof window === "undefined") return false;

  const userAgent = navigator.userAgent || "";
  const isMobileUserAgent =
    /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);

  const isSmallScreen = window.innerWidth <= 900;
  const isCoarsePointer = window.matchMedia?.("(pointer: coarse)")?.matches;

  return isMobileUserAgent || (isSmallScreen && isCoarsePointer);
}

function MobileDevelopmentNotice() {
  return (
    <div className="fixed inset-0 z-[999999] grid place-items-center overflow-hidden bg-[#f5f5f3] px-6 text-[#111]">
      <style>{`
        @keyframes mobileNoticeFloat {
          0%, 100% { transform: translate3d(0,0,0) scale(1); }
          50% { transform: translate3d(18px,-18px,0) scale(1.035); }
        }

        @keyframes mobileNoticeFade {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .mobile-notice-fade {
          animation: mobileNoticeFade .58s cubic-bezier(.16,1,.3,1) both;
        }
      `}</style>

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-14 h-[280px] w-[280px] animate-[mobileNoticeFloat_9s_ease-in-out_infinite] rounded-full bg-white blur-3xl" />
        <div className="absolute right-[-140px] top-[-90px] h-[360px] w-[360px] animate-[mobileNoticeFloat_12s_ease-in-out_infinite] rounded-full bg-white/90 blur-3xl" />
        <div className="absolute bottom-[-180px] left-[18%] h-[360px] w-[360px] animate-[mobileNoticeFloat_11s_ease-in-out_infinite] rounded-full bg-white blur-3xl" />
      </div>

      <div className="mobile-notice-fade relative w-full max-w-sm rounded-[32px] border border-white/70 bg-white/72 p-7 text-center shadow-[0_24px_80px_rgba(0,0,0,0.08)] backdrop-blur-xl">
        <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-[20px] border border-black/5 bg-white shadow-sm">
          <span className="text-2xl">💻</span>
        </div>

        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-neutral-400">
          System ADF
        </p>

        <h1 className="mt-3 text-[32px] font-semibold leading-[0.95] tracking-[-0.07em] text-neutral-950">
          Mobile version is currently under development.
        </h1>

        <p className="mx-auto mt-4 max-w-xs text-[14px] leading-6 text-neutral-500">
          For now, System ADF is only available on Windows or MacBook.
        </p>
      </div>
    </div>
  );
}

function LoadingGate() {
  return (
    <div className="fixed inset-0 z-[999999] grid place-items-center overflow-hidden bg-[#f5f5f3] text-neutral-950">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-14 h-[280px] w-[280px] rounded-full bg-white blur-3xl" />
        <div className="absolute right-[-140px] top-[-90px] h-[360px] w-[360px] rounded-full bg-white/90 blur-3xl" />
        <div className="absolute bottom-[-180px] left-[18%] h-[360px] w-[360px] rounded-full bg-white blur-3xl" />
      </div>

      <div className="relative rounded-[30px] border border-white/70 bg-white/72 p-7 text-center shadow-[0_24px_80px_rgba(0,0,0,0.08)] backdrop-blur-xl">
        <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-[20px] border border-black/5 bg-white shadow-sm">
          <Loader2 className="animate-spin text-neutral-500" size={24} />
        </div>

        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-neutral-400">
          System ADF
        </p>

        <h1 className="mt-3 text-[28px] font-semibold tracking-[-0.065em] text-neutral-950">
          Checking session.
        </h1>

        <p className="mx-auto mt-3 max-w-xs text-[14px] leading-6 text-neutral-500">
          Preparing your authorized workspace.
        </p>
      </div>
    </div>
  );
}

function DarkModeGlobalStyles() {
  return (
    <style>{`
      html[data-adf-theme="dark"] body {
        background: #09090b !important;
        color: #fafafa !important;
      }

      html[data-adf-theme="dark"] .adf-app-shell,
      html[data-adf-theme="dark"] .adf-app-shell > div,
      html[data-adf-theme="dark"] .adf-app-shell [class*="bg-[#f5f5f3]"] {
        background-color: #09090b !important;
      }

      html[data-adf-theme="dark"] .adf-app-shell [class*="bg-white"],
      html[data-adf-theme="dark"] .adf-app-shell [class*="bg-neutral-50"],
      html[data-adf-theme="dark"] .adf-app-shell [class*="bg-neutral-100"] {
        background-color: rgba(24,24,27,0.88) !important;
      }

      html[data-adf-theme="dark"] .adf-app-shell [class*="text-neutral-950"],
      html[data-adf-theme="dark"] .adf-app-shell [class*="text-neutral-900"],
      html[data-adf-theme="dark"] .adf-app-shell [class*="text-neutral-800"],
      html[data-adf-theme="dark"] .adf-app-shell [class*="text-neutral-700"],
      html[data-adf-theme="dark"] .adf-app-shell [class*="text-neutral-600"] {
        color: #fafafa !important;
      }

      html[data-adf-theme="dark"] .adf-app-shell [class*="text-neutral-500"],
      html[data-adf-theme="dark"] .adf-app-shell [class*="text-neutral-400"] {
        color: rgba(245,245,245,0.58) !important;
      }

      html[data-adf-theme="dark"] .adf-app-shell [class*="border-white"],
      html[data-adf-theme="dark"] .adf-app-shell [class*="border-black/5"],
      html[data-adf-theme="dark"] .adf-app-shell [class*="border-black/10"] {
        border-color: rgba(255,255,255,0.10) !important;
      }

      html[data-adf-theme="dark"] .adf-app-shell input,
      html[data-adf-theme="dark"] .adf-app-shell textarea,
      html[data-adf-theme="dark"] .adf-app-shell select {
        background-color: rgba(39,39,42,0.9) !important;
        color: #fafafa !important;
      }

      html[data-adf-theme="dark"] .adf-app-shell input::placeholder,
      html[data-adf-theme="dark"] .adf-app-shell textarea::placeholder {
        color: rgba(245,245,245,0.35) !important;
      }

      html[data-adf-theme="dark"] .adf-popup-profile {
        background-color: rgba(24,24,27,0.92) !important;
        color: #fafafa !important;
        border-color: rgba(255,255,255,0.10) !important;
      }
    `}</style>
  );
}

export default function App() {
  const auth = useAuthProfile();

  const [currentPath, setCurrentPath] = useState(() => {
    const initialPath = getCurrentPath();

    if (!isValidRoute(initialPath) || initialPath === "/") {
      return DEFAULT_ROUTE;
    }

    return initialPath;
  });

  const [isMobile, setIsMobile] = useState(() => isMobileViewport());

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(isMobileViewport());
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, []);

  useEffect(() => {
    const initialPath = getCurrentPath();
    const startPath =
      !isValidRoute(initialPath) || initialPath === "/"
        ? DEFAULT_ROUTE
        : initialPath;

    const existingHistory = readInternalHistory();

    if (!existingHistory.stack.includes(startPath)) {
      saveInternalHistory({
        stack: [startPath],
        index: 0,
      });
    } else {
      saveInternalHistory({
        stack: existingHistory.stack,
        index: existingHistory.stack.indexOf(startPath),
      });
    }

    replaceBrowserUrl(startPath);
    setCurrentPath(startPath);
  }, []);

  useEffect(() => {
    const navigateTo = createNavigate(setCurrentPath);

    const handleRouteChange = () => {
      const nextPath = getCurrentPath();

      if (!isValidRoute(nextPath) || nextPath === "/") {
        navigateTo(DEFAULT_ROUTE, { replace: true });
        return;
      }

      setCurrentPath(nextPath);
    };

    const handleBrowserPopState = () => {
      const nextPath = getCurrentPath();

      if (!isValidRoute(nextPath) || nextPath === "/") {
        navigateTo(DEFAULT_ROUTE, { replace: true });
        return;
      }

      const historyData = readInternalHistory();
      const foundIndex = historyData.stack.lastIndexOf(nextPath);

      if (foundIndex >= 0) {
        saveInternalHistory({
          stack: historyData.stack,
          index: foundIndex,
        });
      } else {
        const nextStack = historyData.stack.slice(0, historyData.index + 1);
        nextStack.push(nextPath);

        saveInternalHistory({
          stack: nextStack,
          index: nextStack.length - 1,
        });
      }

      setCurrentPath(nextPath);
    };

    const handleCustomNavigate = (event) => {
      const path = event?.detail?.path;

      if (!path) return;

      navigateTo(path);
    };

    window.ADFNavigate = navigateTo;

    window.addEventListener("popstate", handleBrowserPopState);
    window.addEventListener("adf-route-change", handleRouteChange);
    window.addEventListener("adf:navigate", handleCustomNavigate);

    return () => {
      window.removeEventListener("popstate", handleBrowserPopState);
      window.removeEventListener("adf-route-change", handleRouteChange);
      window.removeEventListener("adf:navigate", handleCustomNavigate);

      delete window.ADFNavigate;
    };
  }, []);

  useEffect(() => {
    const themeMode = auth?.themeMode || "white";

    document.documentElement.dataset.adfTheme = themeMode;
    document.body.dataset.adfTheme = themeMode;

    if (themeMode === "dark") {
      document.body.style.backgroundColor = "#09090b";
    } else {
      document.body.style.backgroundColor = "#f5f5f3";
    }

    return () => {
      document.documentElement.removeAttribute("data-adf-theme");
      document.body.removeAttribute("data-adf-theme");
      document.body.style.backgroundColor = "";
    };
  }, [auth?.themeMode]);

  const activeRoute = useMemo(() => {
    const routePath =
      currentPath === "/requestpage" || currentPath.startsWith("/requestpage/")
        ? "/requestpage"
        : currentPath === "/catalog" || currentPath.startsWith("/catalog/")
          ? "/catalog"
          : currentPath;

    return ROUTES[routePath] || ROUTES[DEFAULT_ROUTE];
  }, [currentPath]);

  const PageComponent = activeRoute.component;

  if (isMobile) {
    return <MobileDevelopmentNotice />;
  }

  if (auth.loading || auth.profileLoading) {
    return <LoadingGate />;
  }

  if (!auth.isAuthenticated) {
    return <AuthPage auth={auth} />;
  }

  if (auth.needsProfileSetup) {
    return <ProfileSetup auth={auth} />;
  }

  if (auth.needsTour) {
    return <OnboardingTour auth={auth} />;
  }

  const isDark = auth.themeMode === "dark";

  return (
    <div
      className={`adf-app-shell min-h-screen ${
        isDark ? "bg-neutral-950 text-white" : "bg-[#f5f5f3] text-neutral-950"
      }`}
    >
      <DarkModeGlobalStyles />

      <PageComponent auth={auth} />
    </div>
  );
}
