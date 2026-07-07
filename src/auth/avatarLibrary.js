export const DEFAULT_AVATAR_KEY = "profile-1";

export const TEAM_OPTIONS = [
  { value: "ADF", label: "ADF" },
  { value: "realme", label: "realme" },
  { value: "AKASO", label: "AKASO" },
  { value: "iDreamtech", label: "iDreamtech" },
];

export const AVATAR_LIST = [
  {
    key: "profile-1",
    label: "Avatar 1",
    src: "/avatar/fotoprofile1.png",
  },
  {
    key: "profile-2",
    label: "Avatar 2",
    src: "/avatar/fotoprofile2.png",
  },
  {
    key: "profile-3",
    label: "Avatar 3",
    src: "/avatar/fotoprofile3.png",
  },
  {
    key: "profile-4",
    label: "Avatar 4",
    src: "/avatar/fotoprofile4.png",
  },
  {
    key: "profile-5",
    label: "Avatar 5",
    src: "/avatar/fotoprofile5.png",
  },
  {
    key: "profile-6",
    label: "Avatar 6",
    src: "/avatar/fotoprofile6.png",
  },
  {
    key: "profile-7",
    label: "Avatar 7",
    src: "/avatar/fotoprofile7.png",
  },
  {
    key: "profile-8",
    label: "Avatar 8",
    src: "/avatar/fotoprofile8.png",
  },
  {
    key: "profile-9",
    label: "Avatar 9",
    src: "/avatar/fotoprofile9.png",
  },
  {
    key: "profile-10",
    label: "Avatar 10",
    src: "/avatar/fotoprofile10.png",
  },
  {
    key: "profile-11",
    label: "Avatar 11",
    src: "/avatar/fotoprofile11.png",
  },
  {
    key: "profile-12",
    label: "Avatar 12",
    src: "/avatar/fotoprofile12.png",
  },
  {
    key: "profile-13",
    label: "Avatar 13",
    src: "/avatar/fotoprofile13.png",
  },
  {
    key: "profile-14",
    label: "Avatar 14",
    src: "/avatar/fotoprofile14.png",
  },
  {
    key: "profile-15",
    label: "Avatar 15",
    src: "/avatar/fotoprofile15.png",
  },
];

export function getAvatarByKey(key) {
  return AVATAR_LIST.find((avatar) => avatar.key === key) || AVATAR_LIST[0];
}

export function getProfileInitial(value = "") {
  const cleanValue = String(value || "").trim();

  if (!cleanValue) return "A";

  return cleanValue.charAt(0).toUpperCase();
}
