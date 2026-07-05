import React, { useEffect, useMemo, useState } from "react";

import Popup from "./popup";
import Frontpage from "./frontpage";
import RequestPage from "./requestpage";
import P4Series from "./upload/p4series";
import Catalog from "./catalog";

/**
 * App.jsx
 * ADF System Router
 *
 * Start:
 * /              -> Popup
 * /popup         -> Popup
 *
 * Pages:
 * /frontpage     -> Frontpage
 * /requestpage   -> RequestPage
 * /p4series      -> P4Series
 *
 * Support:
 * - Internal navigation without react-router-dom
 * - window.ADFNavigate("/path") for all pages
 * - Browser back / forward support from browser controls
 */

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
  return Boolean(ROUTES[normalizePath(path)]);
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

export default function App() {
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
    const startPath = !isValidRoute(initialPath) || initialPath === "/" ? DEFAULT_ROUTE : initialPath;

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

  const activeRoute = useMemo(() => {
    return ROUTES[currentPath] || ROUTES[DEFAULT_ROUTE];
  }, [currentPath]);

  const PageComponent = activeRoute.component;

  if (isMobile) {
    return <MobileDevelopmentNotice />;
  }

  return (
    <div className="min-h-screen bg-[#f5f5f3]">
      <PageComponent />
    </div>
  );
}
