import React, { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { supabase } from "./supabaseClient";

function formatNotifDate(value) {
  if (!value) return "-";

  try {
    return new Date(value).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "-";
  }
}

export default function RequestNotificationBell({
  className = "relative",
  buttonClassName = "relative grid h-12 w-12 place-items-center rounded-full border border-white/70 bg-white/90 text-neutral-700 shadow-[0_18px_55px_rgba(0,0,0,0.12)] backdrop-blur-xl transition hover:text-neutral-950 active:scale-95",
  panelClassName = "adf-notif-card absolute right-0 top-full mt-3 w-[360px] overflow-hidden rounded-[28px] border border-white/70 bg-white/95 p-3 shadow-[0_35px_120px_rgba(0,0,0,0.22)] backdrop-blur-xl",
}) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [identity, setIdentity] = useState(null);

  const unreadCount = items.filter((item) => !item.is_read).length;

  async function loadNotifications() {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;

    if (!user?.id) {
      setIdentity(null);
      setItems([]);
      return null;
    }

    const nextIdentity = {
      id: user.id,
      email: user.email || null,
    };

    setIdentity(nextIdentity);

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(30);

    if (error) {
      console.error("Load notifications error:", error);
      setItems([]);
      return nextIdentity;
    }

    setItems(data || []);
    return nextIdentity;
  }

  useEffect(() => {
    let active = true;
    let channel = null;

    async function boot() {
      const nextIdentity = await loadNotifications();

      if (!active || !nextIdentity?.id) return;

      channel = supabase
        .channel(`adf-notifications-${nextIdentity.id}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "notifications",
          },
          () => {
            loadNotifications();
          }
        )
        .subscribe();
    }

    boot();

    return () => {
      active = false;
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  async function markAllRead() {
    if (!identity?.id) return;

    const { error } = await supabase
      .from("notifications")
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq("user_id", identity.id)
      .eq("is_read", false);

    if (!error) loadNotifications();
  }

  async function clearNotifications() {
    if (!identity?.id) return;

    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("user_id", identity.id);

    if (!error) {
      setItems([]);
      setOpen(false);
    }
  }

  async function openNotification(item) {
    if (item?.id && !item.is_read) {
      await supabase
        .from("notifications")
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
        })
        .eq("id", item.id);

      loadNotifications();
    }

    if (item?.target_path && window.ADFNavigate) {
      window.ADFNavigate(item.target_path);
    }
  }

  return (
    <>
      <style>{`
        html[data-adf-theme="dark"] .adf-notif-card {
          background: rgba(24,24,27,.96) !important;
          border-color: rgba(255,255,255,.12) !important;
          color: #fafafa !important;
        }

        html[data-adf-theme="dark"] .adf-notif-card [class*="text-neutral-950"],
        html[data-adf-theme="dark"] .adf-notif-card [class*="text-neutral-800"],
        html[data-adf-theme="dark"] .adf-notif-card [class*="text-neutral-700"],
        html[data-adf-theme="dark"] .adf-notif-card [class*="text-neutral-600"] {
          color: #fafafa !important;
        }

        html[data-adf-theme="dark"] .adf-notif-card [class*="bg-neutral-50"],
        html[data-adf-theme="dark"] .adf-notif-card [class*="bg-neutral-100"],
        html[data-adf-theme="dark"] .adf-notif-card [class*="bg-white"] {
          background: rgba(39,39,42,.88) !important;
          border-color: rgba(255,255,255,.10) !important;
        }
      `}</style>

      <div className={className}>
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className={buttonClassName}
          title="Notifications"
        >
          <Bell size={20} strokeWidth={1.8} />

          {unreadCount > 0 ? (
            <span className="absolute -right-1 -top-1 grid min-h-5 min-w-5 place-items-center rounded-full bg-red-600 px-1.5 text-[10px] font-bold text-white shadow-sm">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          ) : null}
        </button>

        {open ? (
          <div className={panelClassName}>
            <div className="mb-3 flex items-start justify-between gap-3 px-2 pt-2">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-neutral-400">
                  Notifications
                </p>
                <h3 className="mt-1 text-xl font-semibold tracking-[-0.05em] text-neutral-950">
                  {unreadCount} unread
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={markAllRead}
                  className="rounded-full bg-neutral-100 px-3 py-2 text-[11px] font-semibold text-neutral-500 hover:text-neutral-950"
                >
                  Read
                </button>

                <button
                  type="button"
                  onClick={clearNotifications}
                  className="rounded-full bg-red-50 px-3 py-2 text-[11px] font-semibold text-red-500 hover:bg-red-100"
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="max-h-[430px] space-y-2 overflow-y-auto p-1">
              {items.length === 0 ? (
                <div className="rounded-[22px] border border-dashed border-black/10 bg-neutral-50 p-6 text-center">
                  <Bell className="mx-auto text-neutral-300" size={28} />
                  <p className="mt-3 text-sm font-semibold text-neutral-600">
                    No notifications
                  </p>
                  <p className="mt-1 text-xs text-neutral-400">
                    Request updates will appear here.
                  </p>
                </div>
              ) : (
                items.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => openNotification(item)}
                    className={`w-full rounded-[20px] p-4 text-left transition ${
                      item.is_read
                        ? "bg-neutral-50 text-neutral-500"
                        : "bg-neutral-950 text-white shadow-sm"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="line-clamp-1 text-sm font-semibold">
                        {item.title}
                      </p>

                      {!item.is_read ? (
                        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-red-500" />
                      ) : null}
                    </div>

                    <p
                      className={`mt-1 line-clamp-2 text-xs leading-5 ${
                        item.is_read ? "text-neutral-400" : "text-white/65"
                      }`}
                    >
                      {item.message}
                    </p>

                    <p
                      className={`mt-2 text-[11px] ${
                        item.is_read ? "text-neutral-300" : "text-white/40"
                      }`}
                    >
                      {formatNotifDate(item.created_at)}
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}
