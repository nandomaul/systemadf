import React from "react";
import { getAvatarByKey, getProfileInitial } from "./auth/avatarLibrary";

export function pickStableAvatarKey(seed = "") {
  const cleanSeed = String(seed || "requester").trim() || "requester";
  let hash = 0;

  for (let index = 0; index < cleanSeed.length; index += 1) {
    hash = (hash * 31 + cleanSeed.charCodeAt(index)) >>> 0;
  }

  const avatarNumber = (hash % 15) + 1;
  return `profile-${avatarNumber}`;
}

export function getRequestDisplayName(request = {}) {
  return (
    request.requester_display_name ||
    request.requester_profile?.display_name ||
    request.requester ||
    "Unknown"
  );
}

export function getRequestAvatarKey(request = {}) {
  if (request.requester_avatar_key) return request.requester_avatar_key;

  const profileAvatar = request.requester_profile?.avatar_key;
  if (profileAvatar) return profileAvatar;

  return pickStableAvatarKey(
    request.requester_user_id ||
      request.requester_email ||
      request.requester ||
      request.id ||
      request.title
  );
}

export default function RequesterAvatar({ request, size = "md" }) {
  const displayName = getRequestDisplayName(request);
  const avatar = getAvatarByKey(getRequestAvatarKey(request));

  const sizeClass =
    size === "sm"
      ? "h-9 w-9"
      : size === "lg"
        ? "h-14 w-14"
        : "h-12 w-12";

  return (
    <div
      className={`${sizeClass} shrink-0 overflow-hidden rounded-full border border-black/5 bg-white shadow-sm`}
      title={displayName}
    >
      {avatar?.src ? (
        <img
          src={avatar.src}
          alt={displayName}
          className="h-full w-full object-cover"
          draggable={false}
        />
      ) : (
        <div className="grid h-full w-full place-items-center bg-neutral-100 text-xs font-bold text-neutral-600">
          {getProfileInitial(displayName)}
        </div>
      )}
    </div>
  );
}
