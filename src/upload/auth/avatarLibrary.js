export const AVATAR_LIST = [
  {
    key: "profile-1",
    label: "Avatar 1",
    src: "/avatar/fotoprofile 1.png",
    fallback: "🐱",
    bg: "from-sky-100 to-amber-100",
  },
  {
    key: "profile-2",
    label: "Avatar 2",
    src: "/avatar/fotoprofile 2.png",
    fallback: "🐱",
    bg: "from-sky-100 to-emerald-100",
  },
  {
    key: "profile-3",
    label: "Avatar 3",
    src: "/avatar/fotoprofile 3.png",
    fallback: "💻",
    bg: "from-blue-100 to-white",
  },
  {
    key: "profile-4",
    label: "Avatar 4",
    src: "/avatar/fotoprofile 4.png",
    fallback: "😾",
    bg: "from-sky-100 to-white",
  },
  {
    key: "profile-5",
    label: "Avatar 5",
    src: "/avatar/fotoprofile 5.png",
    fallback: "😼",
    bg: "from-violet-100 to-pink-100",
  },
  {
    key: "profile-6",
    label: "Avatar 6",
    src: "/avatar/fotoprofile 6.png",
    fallback: "🧢",
    bg: "from-rose-100 to-red-100",
  },
  {
    key: "profile-7",
    label: "Avatar 7",
    src: "/avatar/fotoprofile 7.png",
    fallback: "😴",
    bg: "from-orange-100 to-red-100",
  },
  {
    key: "profile-8",
    label: "Avatar 8",
    src: "/avatar/fotoprofile 8.png",
    fallback: "🐻",
    bg: "from-lime-100 to-emerald-100",
  },
  {
    key: "profile-9",
    label: "Avatar 9",
    src: "/avatar/fotoprofile 9.png",
    fallback: "🤔",
    bg: "from-stone-100 to-orange-100",
  },
  {
    key: "profile-10",
    label: "Avatar 10",
    src: "/avatar/fotoprofile 10.png",
    fallback: "😤",
    bg: "from-orange-100 to-yellow-100",
  },
  {
    key: "profile-11",
    label: "Avatar 11",
    src: "/avatar/fotoprofile11.png",
    fallback: "🐱",
    bg: "from-yellow-100 to-white",
  },
  {
    key: "profile-12",
    label: "Avatar 12",
    src: "/avatar/fotoprofile12.png",
    fallback: "🐱",
    bg: "from-yellow-100 to-amber-100",
  },
  {
    key: "profile-13",
    label: "Avatar 13",
    src: "/avatar/fotoprofile13.png",
    fallback: "💻",
    bg: "from-yellow-100 to-sky-100",
  },
  {
    key: "profile-14",
    label: "Avatar 14",
    src: "/avatar/fotoprofile14.png",
    fallback: "🌿",
    bg: "from-emerald-100 to-lime-100",
  },
  {
    key: "profile-15",
    label: "Avatar 15",
    src: "/avatar/fotoprofile 15.png",
    fallback: "🐻",
    bg: "from-lime-100 to-yellow-100",
  },
];

export const TEAM_OPTIONS = [
  {
    value: "ADF",
    label: "ADF",
  },
  {
    value: "realme",
    label: "realme",
  },
  {
    value: "AKASO",
    label: "AKASO",
  },
  {
    value: "iDreamtech",
    label: "iDreamtech",
  },
];

export const DEFAULT_AVATAR_KEY = "profile-1";

export function getAvatarByKey(key) {
  return (
    AVATAR_LIST.find((avatar) => avatar.key === key) ||
    AVATAR_LIST.find((avatar) => avatar.key === DEFAULT_AVATAR_KEY) ||
    AVATAR_LIST[0]
  );
}

export function getTeamByValue(value) {
  return TEAM_OPTIONS.find((team) => team.value === value) || null;
}

export function getProfileInitial(displayName = "") {
  const cleanName = String(displayName || "").trim();

  if (!cleanName) return "U";

  const parts = cleanName.split(/\s+/).filter(Boolean);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0]?.[0] || ""}${parts[1]?.[0] || ""}`.toUpperCase();
}