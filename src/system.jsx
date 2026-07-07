import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, PlusCircle, Calendar as CalendarIcon, FolderOpen, CheckSquare, 
  TrendingUp, Bell, Search, Sparkles, MoreVertical, Clock, CheckCircle2, Menu, X, 
  Filter, ArrowUpRight, Zap, Layers, PieChart, FileText, Users, Archive, 
  ChevronLeft, ChevronRight, Folder, UploadCloud, Loader2, CalendarDays, 
  BarChart3, ExternalLink, Lock, ShoppingBag, Instagram, Video, MoreHorizontal, 
  ChevronDown, List, MessageSquare, Send, Minimize2, ArrowRight, MessageCircle, 
  CornerDownLeft, FilePlus, Trash2, Headset, User, LogOut, ShieldCheck, ChevronUp, 
  UserCheck, Eye, MapPin, Home, ArrowLeft, Info, AlertTriangle, Box
} from 'lucide-react';

/**
 * AKG-DF Design Tools v2.1.0 (16 Series Update & Interactive Gimmicks)
 * - UI: Added interactive modals, toggle states, and wired AI Chat actions.
 * - ASSETS: Task Update March with categorized sections (LP, FS, SKU PDP, etc).
 * - NEW: Quality Check Reminder popup (Once per session) on asset folder click.
 * - NEW: Floating animations and glow gimmicks added.
 */

// --- CUSTOM STYLES ---
const customStyles = `
  @keyframes fade-slide-up { 0% { opacity: 0; transform: translateY(20px); } 100% { opacity: 1; transform: translateY(0); } }
  @keyframes scale-in { 0% { transform: scale(0.95); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
  @keyframes slide-vertical { 0% { transform: translateY(100%); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } }
  @keyframes breathing { 0% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.7); transform: scale(1); } 70% { box-shadow: 0 0 0 10px rgba(245, 158, 11, 0); transform: scale(1.1); } 100% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0); transform: scale(1); } }
  @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
  @keyframes pulse-glow { 0%, 100% { box-shadow: 0 0 15px rgba(245, 158, 11, 0.3); } 50% { box-shadow: 0 0 25px rgba(245, 158, 11, 0.7); } }
  
  .animate-breathing { animation: breathing 2s infinite; }
  .animate-fade-slide { animation: fade-slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
  .animate-scale-in { animation: scale-in 0.2s ease-out forwards; }
  .animate-slide-vertical { animation: slide-vertical 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
  .animate-float { animation: float 3.5s ease-in-out infinite; }
  .animate-pulse-glow { animation: pulse-glow 2s infinite; }
  
  .warm-bg { background-color: #FDFBF7; background-image: radial-gradient(at 0% 0%, rgba(251, 191, 36, 0.05) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(251, 191, 36, 0.05) 0px, transparent 50%); }
  .glass-panel { background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px); border: 1px solid rgba(251, 191, 36, 0.2); }
  .modal-scroll::-webkit-scrollbar { width: 5px; }
  .modal-scroll::-webkit-scrollbar-track { background: transparent; }
  .modal-scroll::-webkit-scrollbar-thumb { background-color: #f59e0b; border-radius: 20px; }
  .scrollbar-hide::-webkit-scrollbar { display: none; }
  .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
`;

// --- MOCK DATA ---
const PROFILES = [
  { id: 'admin', name: 'Super Administrator', role: 'System Owner', avatar: <User size={20}/>, type: 'admin', requiresPassword: true },
  { id: 'sales2', name: 'Defrin', role: 'Sales Team', avatar: 'D', type: 'user', requiresPassword: false },
  { id: 'sales3', name: 'Rizka', role: 'Sales Team', avatar: 'R', type: 'user', requiresPassword: false },
  { id: 'sales4', name: 'Cecep', role: 'Sales Team', avatar: 'C', type: 'user', requiresPassword: false },
  { id: 'sales5', name: 'Tasya', role: 'Sales Team', avatar: 'T', type: 'user', requiresPassword: false },
];

const SHORTCUTS = [ 
  { name: 'Realme Partner', url: 'https://vt.tiktok.com/ZS9LuSUMsJkUx-YFeLy/' }, 
  { name: 'Realme Official', url: 'https://www.tiktok.com/@realme.indonesia?_r=1&_t=ZS-95YFy2e0tYy' }, 
  { name: 'Akaso Official', url: 'https://www.tiktok.com/@akasoindonesia?_r=1&_t=ZS-95YG2I0tYGa' }, 
  { name: 'iDreamtech', url: 'https://vt.tiktok.com/ZS9LuSmcg95EX-fDHS3/' } 
];
const SOCIAL_LINKS = [ { name: 'TikTok Akaso', icon: Video, url: '#' }, { name: 'Instagram Akaso', icon: Instagram, url: '#' } ];
const BRANDS_OPTIONS = [ { id: 'b1', name: 'Realme Official Partner', type: 'partner' }, { id: 'b2', name: 'Realme Official Store', type: 'official' }, { id: 'b3', name: 'Realme Authorized Store', type: 'authorized' }, { id: 'b4', name: 'Akaso Official Store', type: 'official' }, { id: 'b5', name: 'iDreamtech', type: 'distributor' } ];
const DESIGN_TYPES = ['SKU', 'KOL', 'Banner', 'LP', 'Loriket'];

const INITIAL_NOTIFICATIONS = [ { id: -6, text: 'NEW LP 5.5 & 5.5 Banner', time: 'Just now', read: false }, { id: -5, text: 'NEW NAD C100 Series', time: '5m ago', read: false }, { id: -4, text: 'NEW realme T500 Assets', time: '10m ago', read: false }, { id: -3, text: 'UPDATE C100 Series', time: '15m ago', read: false }, { id: -2, text: 'NEW C100 Series SKU update', time: '20m ago', read: false }, { id: -1, text: 'realme Official Store AIOT update Showcase', time: '30m ago', read: false }, { id: 0, text: 'New update Landing Page 4.4 & Banner 4.4', time: '1h ago', read: false }, { id: 1, text: 'Defrin uploaded "LP Akulaku"', time: '2h ago', read: false }, { id: 2, text: 'Tasya requested "Banner TikTok"', time: '3h ago', read: false }, { id: 3, text: 'System: High traffic on TikTok', time: '4h ago', read: true }, { id: 4, text: 'Weekly Recap generated', time: '5h ago', read: true } ];

// SALES FOCUSED TASKS - PENDING (Not Checklist)
const SALES_TASKS = [ 
  { id: 1, text: 'Upload LP Akulaku (OS)', due: 'Today', status: 'pending', project: 'Defrin Task' }, 
  { id: 2, text: 'Update Banner Shopee (AU)', due: 'Today', status: 'pending', project: 'Rizka Task' }, 
  { id: 3, text: 'Check Banner TikTok (OP)', due: 'Today', status: 'pending', project: 'Tasya Task' }, 
  { id: 4, text: 'Briefing Banner Lazada (AU)', due: 'Tomorrow', status: 'pending', project: 'Defrin Task' }, 
  { id: 5, text: 'Restock Content TikTok (OS)', due: 'Jan 25', status: 'pending', project: 'Cecep Task' }, 
  { id: 6, text: 'Update Banner Tokopedia (OP)', due: 'Jan 26', status: 'pending', project: 'Rizka Task' } 
];

// CALENDAR EVENTS
const CALENDAR_EVENTS = [
  // --- EXISTING EVENTS ---
  { id: 1, title: 'Warm Up C85 5G', date: 13, month: 0, type: 'campaign', color: 'bg-amber-50 text-amber-900 border-l-4 border-amber-600 font-bold' },
  { id: 2, title: 'Payday Sale', date: 25, month: 0, type: 'sales', color: 'bg-stone-100 text-stone-800 border-l-4 border-stone-600 font-bold' },
  { id: 3, title: 'Akaso Launch', date: 5, month: 0, type: 'launch', color: 'bg-amber-100 text-amber-900 border-l-4 border-amber-800 font-bold' },
  { id: 4, title: 'TikTok Live Marathon', date: 18, month: 0, type: 'live', color: 'bg-white border border-slate-300 text-slate-800 shadow-sm font-bold' },
  
  // Note 80 & 16 Series (Future Events)
  { id: 5, title: 'Warm Up Note 80', date: 28, month: 1, type: 'campaign', color: 'bg-amber-50 text-amber-900 border-l-4 border-amber-600 font-bold' },
  { id: 6, title: 'Warm Up 16 Series', date: 28, month: 1, type: 'campaign', color: 'bg-stone-100 text-stone-800 border-l-4 border-stone-600 font-bold' },
  
  { id: 7, title: 'Launch Note 80', date: 5, month: 2, type: 'launch', color: 'bg-amber-100 text-amber-900 border-l-4 border-amber-800 font-bold' },
  { id: 8, title: 'First Sale Note 80', date: 6, month: 2, type: 'sales', color: 'bg-amber-50 text-amber-900 border-l-4 border-amber-600 font-bold' },
  
  { id: 9, title: 'Launch 16 Series', date: 10, month: 2, type: 'launch', color: 'bg-stone-100 text-stone-800 border-l-4 border-stone-600 font-bold' },
  { id: 10, title: 'First Sale 16 Series', date: 13, month: 2, type: 'sales', color: 'bg-white border border-slate-300 text-slate-800 shadow-sm font-bold' },

  // --- NEW APRIL (Month 3) & MAY (Month 4) C100 SERIES EVENTS GIMMICKS ---
  { id: 11, title: 'Monthly Update Assets', date: 1, month: 3, type: 'update', color: 'bg-stone-100 text-stone-800 border-l-4 border-stone-600 font-bold' },
  { id: 12, title: 'Double Date 4.4 Mega Sale', date: 4, month: 3, type: 'sales', color: 'bg-amber-500 text-white border-l-4 border-amber-700 shadow-md font-bold' },
  { id: 16, title: 'Payday Sale', date: 25, month: 3, type: 'sales', color: 'bg-amber-100 text-amber-900 border-l-4 border-amber-800 font-bold' },
  
  // C100 Events
  { id: 20, title: 'C100 Draft SV & Link Ready', date: 20, month: 3, type: 'campaign', color: 'bg-stone-100 text-stone-800 border-l-4 border-stone-600 font-bold' },
  { id: 21, title: 'Agent Feedback C100', date: 24, month: 3, type: 'campaign', color: 'bg-stone-100 text-stone-800 border-l-4 border-stone-600 font-bold' },
  { id: 17, title: 'WARM UP C100', date: 27, month: 3, type: 'campaign', color: 'bg-amber-50 text-amber-900 border-l-4 border-amber-600 font-bold' },
  { id: 22, title: 'Pelatihan Produk', date: 30, month: 3, type: 'meeting', color: 'bg-indigo-50 text-indigo-900 border-l-4 border-indigo-500 font-bold' },
  { id: 23, title: 'SV Post Batch 1', date: 5, month: 4, type: 'campaign', color: 'bg-stone-100 text-stone-800 border-l-4 border-stone-600 font-bold' },
  { id: 24, title: 'LAUNCH DAY C100', date: 7, month: 4, type: 'launch', color: 'bg-amber-500 text-white border-l-4 border-amber-700 shadow-md font-bold' },
  { id: 25, title: 'SV Post Batch 2', date: 8, month: 4, type: 'campaign', color: 'bg-stone-100 text-stone-800 border-l-4 border-stone-600 font-bold' },
  { id: 26, title: 'FIRST SALE C100 & C100x', date: 12, month: 4, type: 'sales', color: 'bg-amber-100 text-amber-900 border-l-4 border-amber-800 font-bold' },
  { id: 27, title: 'C100i SV Post Batch 1', date: 14, month: 4, type: 'campaign', color: 'bg-stone-100 text-stone-800 border-l-4 border-stone-600 font-bold' },
  { id: 28, title: 'C100i SV Post Batch 2', date: 21, month: 4, type: 'campaign', color: 'bg-stone-100 text-stone-800 border-l-4 border-stone-600 font-bold' },
  { id: 29, title: 'FIRST SALE C100i', date: 25, month: 4, type: 'sales', color: 'bg-amber-100 text-amber-900 border-l-4 border-amber-800 font-bold' },
];

const CALENDAR_REMINDERS = [ 
  { id: 101, date: 14, month: 0, note: "Reminder: Upload materi teaser H-1 sebelum jam 12 siang." }, 
  { id: 102, date: 20, month: 0, note: "Briefing KOL sore jam 3." },
  // APRIL & MAY REMINDERS
  { id: 103, date: 4, month: 3, note: "Pantau traffic 4.4 dan pastikan banner live 00:00." },
  { id: 104, date: 27, month: 3, note: "Live SKU Teasing, Store Banner, LP. WITHOUT PRICE Start 00:00" },
  { id: 105, date: 30, month: 3, note: "Every key agent PIC must attend the product training" },
  { id: 106, date: 7, month: 4, note: "Live SKU Teasing, Banner, LP. WITH PRICE" },
  { id: 107, date: 12, month: 4, note: "Daily sales report 09:00 AM" },
  { id: 108, date: 25, month: 4, note: "Daily sales report 09:00 AM" },
];

const MONITORING_PROJECTS = [
  { id: 'p1', name: 'C100 SERIES LAUNCH', deadline: 'May 25, 2026', totalAssets: 60, completed: 60 },
  { id: 'p2', name: 'AKASO SUMMER SALE', deadline: 'Feb 15, 2026', totalAssets: 20, completed: 5 },
  { id: 'p3', name: 'NOTE 80 SERIES', deadline: 'Mar 06, 2026', totalAssets: 45, completed: 0 },
  { id: 'p4', name: '16 SERIES', deadline: 'Mar 13, 2026', totalAssets: 50, completed: 0 },
];

// UPDATED TO 20 UPLOADED, 0 WAIT FOR ALL IN P1
const MONITORING_STATS = {
  'p1': [ { name: 'Tasya', uploaded: 20, total: 20, pending: 0, status: 'Done' }, { name: 'Cecep', uploaded: 20, total: 20, pending: 0, status: 'Done' }, { name: 'Defrin', uploaded: 20, total: 20, pending: 0, status: 'Done' }, { name: 'Rizka', uploaded: 20, total: 20, pending: 0, status: 'Done' } ],
  'p2': [ { name: 'Tasya', uploaded: 2, total: 10, pending: 8, status: 'Start' }, { name: 'Rizka', uploaded: 3, total: 10, pending: 7, status: 'Start' }, { name: 'Defrin', uploaded: 0, total: 10, pending: 10, status: 'Pending' }, { name: 'Cecep', uploaded: 0, total: 10, pending: 10, status: 'Pending' } ],
  'p3': [ { name: 'Tasya', uploaded: 0, total: 15, pending: 15, status: 'Pending' }, { name: 'Cecep', uploaded: 0, total: 15, pending: 15, status: 'Pending' }, { name: 'Defrin', uploaded: 0, total: 15, pending: 15, status: 'Pending' }, { name: 'Rizka', uploaded: 0, total: 15, pending: 15, status: 'Pending' } ],
  'p4': [ { name: 'Tasya', uploaded: 0, total: 20, pending: 20, status: 'Pending' }, { name: 'Cecep', uploaded: 0, total: 10, pending: 10, status: 'Pending' }, { name: 'Defrin', uploaded: 0, total: 10, pending: 10, status: 'Pending' }, { name: 'Rizka', uploaded: 0, total: 10, pending: 10, status: 'Pending' } ]
};

// DATA TIMELINE REAL-TIME
const PROJECT_TIMELINE = {
  'p1': [ 
    { date: 'Apr 20', title: 'Draft SV', status: 'completed' }, 
    { date: 'Apr 27', title: 'Warm Up', status: 'active' }, 
    { date: 'May 07', title: 'Launch Day', status: 'upcoming' }, 
    { date: 'May 12', title: 'First Sale', status: 'upcoming' }
  ],
  'p2': [ 
    { date: 'Feb 01', title: 'Kickoff', status: 'upcoming' }, 
    { date: 'Feb 05', title: 'Briefing', status: 'upcoming' }, 
    { date: 'Feb 15', title: 'Launch', status: 'upcoming' } 
  ],
  'p3': [ 
    { date: 'Last Feb', title: 'Warm Up', status: 'upcoming' }, 
    { date: '5 March', title: 'Launch Day', status: 'upcoming' }, 
    { date: '6 March', title: 'First Sale', status: 'upcoming' } 
  ],
  'p4': [ 
    { date: 'Last Feb', title: 'Warm Up', status: 'upcoming' }, 
    { date: '10 March', title: 'Launch Day', status: 'upcoming' }, 
    { date: '13 March', title: 'First Sale', status: 'upcoming' } 
  ]
};

// --- UPDATE C100 SERIES GROUPS ---
const C100_GROUPS = [
  {
    name: "PAYDAY LP & BANNER MATERIAL",
    colorTheme: "purple",
    items: [
      { name: 'Banner Akulaku Official', url: 'https://drive.google.com/drive/folders/1AM-qSs6yIAEkBo5lqcDG7IvL_pUWioaf?usp=drive_link' },
      { name: 'LP Akulaku', url: 'https://drive.google.com/drive/folders/1DIoM64T9fr_yAa-FEICN_mlc36sEHu10?usp=drive_link' },
      { name: 'LP Tiktok', url: 'https://drive.google.com/drive/folders/1cktiZw8ZmvqczrRdDuPPrTkG8qVh0Phm?usp=drive_link' },
      { name: 'LP Tokopedia', url: 'https://drive.google.com/drive/folders/1q5Y9F6DCBnAXFFzf2-cLFPUchHVol7S-?usp=drive_link' },
      { name: 'Banner Official Partner & Authorized Store', url: 'https://drive.google.com/drive/folders/1So5r8FrJrfhIj2caLnodXaRof4YEpTrX?usp=drive_link' },
   ]
  },
  {
    name: "NEW UPDATE LORIKET & SLIDE",
    items: [
      { name: 'SKU Loriket', url: 'https://drive.google.com/drive/folders/1xxLk6QjgCFgOEZfQlLJqiiUY8hJX_VTC?usp=drive_link' },
      { name: 'SKU Slide', url: 'https://drive.google.com/drive/folders/1sJuaI1LGPrHv9mGIKQNinwNRFv9qnCWD?usp=drive_link' }
    ]
  },
  {
    name: "LP 5.5",
    items: [
      { name: 'Akulaku', url: 'https://drive.google.com/drive/folders/1_ok8ViGRQA_nf5Rz18nI3871Lh7rhp9o?usp=drive_link' },
      { name: 'RAW', url: 'https://drive.google.com/drive/folders/13GNy82JcCY_XnxzRbXa__2gNC7md9et4?usp=drive_link' },
      { name: 'Authorized', url: 'https://drive.google.com/drive/folders/1hDW3N1e4yT1kbkZKMWqLqjhklgn_ityy?usp=drive_link' },
      { name: 'Official Partner', url: 'https://drive.google.com/drive/folders/1GyTYqDpBqQeHtBvMDdxZLLJeROyugcYL?usp=drive_link' }
    ]
  },
  {
    name: "NEW NAD C100 Series",
    items: [
      { name: 'SKU Flash Sale', url: 'https://drive.google.com/drive/folders/1OSdPzLOq75vDEc5bhgLz9CK1yEty9oU_?usp=drive_link' },
      { name: 'SKU Reg', url: 'https://drive.google.com/drive/folders/13b7T2W0wVAGD9Qp-TFrq2jqmvs6iH8wb?usp=drive_link' },
      { name: 'SKU KOL (Official Store)', url: 'https://drive.google.com/drive/folders/1pLJQuC28VdjEtlfF_RktzRSG7dX56Pco?usp=drive_link' },
      { name: 'SKU KOL (Official Partner)', url: 'https://drive.google.com/drive/folders/1DlcRGzkZJ9SP88_QlRz-wVRvNXOMGCWh?usp=drive_link' }
    ]
  },
  {
    name: "NEW C100 SKU",
    items: [
      { name: 'C100', url: 'https://drive.google.com/drive/folders/1m0yRIPlErBERCRw6VPMRLs98eeBfKoIu?usp=drive_link' },
      { name: 'C100i', url: 'https://drive.google.com/drive/folders/17UBZ9uyt8lF9YwgREPq6IrR8-yQBB0yS?usp=drive_link' },
      { name: 'C100x', url: 'https://drive.google.com/drive/folders/1q9GfX6SOjZmMeb8iiwk-Ke0JbYBLL0JE?usp=drive_link' }
    ]
  },
  {
    name: "SKU REGULAR",
    items: [
      { name: 'Official Store', url: 'https://drive.google.com/drive/folders/1Ko13wIG7LmQ0HZpdFm9d5v4eoc2KUBgg?usp=drive_link' },
      { name: 'Authorized Store', url: 'https://drive.google.com/drive/folders/11aoThg4miqd7B3meuz5i2mdlHf5x63mQ?usp=drive_link' },
      { name: 'Official Partner', url: 'https://drive.google.com/drive/folders/19TUbjMr3DOFsOXErlSx5QUebSQeXdIZ_?usp=drive_link' },
      { name: 'Official Store AIOT', url: 'https://drive.google.com/drive/folders/1RibHdAyYNws8UlKnz4llSfg_tjc07K93?usp=drive_link' },
      { name: 'Tech Store ID', url: 'https://drive.google.com/drive/folders/1WIC01GWsTEbsZg7uyMiCSlICZH4eO_hL?usp=drive_link' },
      { name: 'KOL', url: 'https://drive.google.com/drive/folders/1vfSqKFqEg9vJcSFB6W135COVdTNkct0H?usp=drive_link' },
      { name: 'SKU GIft Box', url: 'https://drive.google.com/drive/folders/1HLRZ9j0QXfEieP2unzZRk_ZtzNxHlUw_?usp=drive_link' },
      { name: 'SKU Angle - For Agency', url: 'https://drive.google.com/drive/folders/1MK30iVGP0DO5-3fCK-4NFJSByL_lZJCY?usp=drive_link' },
    ]
  },
  {
    name: "BANNER C100",
    items: [
      { name: 'Akulaku', url: 'https://drive.google.com/drive/folders/1xLb8Xu8yRGqvWNOrP_lvLM9WQK776rU2?usp=drive_link' },
      { name: 'Tokopedia', url: 'https://drive.google.com/drive/folders/1x7GFzlQMwUYc9MYm1j5OssrI5DAZDbYr?usp=drive_link' },
      { name: 'Shopee', url: 'https://drive.google.com/drive/folders/14zxf-5pK-Of0BA5TJuD3fGSVNcvJJayw?usp=drive_link' },
      { name: 'Blibli', url: 'https://drive.google.com/drive/folders/1ZK39TcV1Rt-T7QRFc5Jv35qfFPocJEzP?usp=drive_link' },
      { name: 'Lazada', url: 'https://drive.google.com/drive/folders/1k_jWmSHkoDdN7qG99_yBabU0_mb0Ttmw?usp=drive_link' },
      { name: 'Tiktok', url: 'https://drive.google.com/drive/folders/1f6EDsE3FHVgGMGPvxxPho2p_8hYfg04j?usp=drive_link' },
    ]
  },
  {
    name: "BANNER PAYDAY",
    items: [
      { name: 'Akulaku', url: 'https://drive.google.com/drive/folders/1AM-qSs6yIAEkBo5lqcDG7IvL_pUWioaf?usp=drive_link' },
      { name: 'BliBli', url: 'https://drive.google.com/drive/folders/172Xm0JUyeN9_5OTsA4g8zuHJOrA_oqPh?usp=drive_link' },
      { name: 'Lazada', url: 'https://drive.google.com/drive/folders/1PddruF-k2ja7LgzO7jcGUB7XyKVEAMqM?usp=drive_link' },
      { name: 'Shopee', url: 'https://drive.google.com/drive/folders/1Dgq8fobw7HPSmMybK0QS2f5lPPJgHLYJ?usp=drive_link' },
      { name: 'Tiktok', url: 'https://drive.google.com/drive/folders/1rI1tAKCqRInxjWJ1_8l8uDD80njy0Y4Z?usp=drive_link' },
      { name: 'Tokopedia', url: 'https://drive.google.com/drive/folders/1Auj79G63FbEM9CujwgCcm3eZq87u-tli?usp=drive_link' },
    ]
  },
  {
    name: "EXPOSURE",
    items: [
      { name: 'Akulaku', url: 'https://drive.google.com/drive/folders/1v_I7ByCoM1kCO0HK-duBwdGnrMAJH7QQ?usp=drive_link' },
      { name: 'Tokopedia', url: 'https://drive.google.com/drive/folders/1do0e2H5Id6qI2SlO1yEEsbSzC0ucPmyf?usp=drive_link' },
      { name: 'Interlink', url: 'https://drive.google.com/drive/folders/1LocRZKY6P_0aJ3e8fGD3f3zENYCuenWD?usp=drive_link' },
      { name: 'Intermediary', url: 'https://drive.google.com/drive/folders/1K0TyTEIf-adANikeDOn9ibvhKCWkOF5I?usp=drive_link' },
      { name: 'OS Slider', url: 'https://drive.google.com/drive/folders/1pNAakgMXNJe_7muVRfm0XQHjaphyu_UT?usp=drive_link' },
      { name: 'Pop up banner', url: 'https://drive.google.com/drive/folders/1_5o-eS-b7D_bTbjF6a-tg2R5MBtp9awr?usp=drive_link' },
    ]
  },
  {
    name: "LANDING PAGE",
    items: [
      { name: 'Payday', url: 'https://drive.google.com/drive/folders/1_gH_kxGJFq904Y6DsCb3OtltKc-1f3PF?usp=drive_link' },
      { name: 'C100 Series', url: 'https://drive.google.com/drive/folders/1ohxZsL4BydPFccf90AhxOsH06X_pmFXZ?usp=drive_link' },
    ]
  },
  {
    name: "DISCOVERY TIKTOK",
    items: [
      { name: 'Mobile', url: 'https://drive.google.com/drive/folders/11ljtreKdbzJ8o-yhnD5oa_2Hz_BzgNNU?usp=drive_link' },
      { name: 'Desktop', url: 'https://drive.google.com/drive/folders/1_5cowiYLvqo218exFRHMX2kgYxJGYGJa?usp=drive_link' },
      { name: 'NAD', url: 'https://drive.google.com/drive/folders/11Oj8IwNq0kN6TNFPXx45PSMLC9qldxgG?usp=drive_link' },
    ]
  }
];

// ASSETS
const ASSET_FOLDERS = [
  // --- NEW P4 Series Update ---
  {
    id: 1008,
    name: 'P4 SERIES ASSETS',
    count: 8,
    icon: ShoppingBag,
    isNew: true,
    colorTheme: 'red-500', // Merah sesuai request
    date: 'Jun 05, 2026',
    groups: [
      {
        name: "NEW UPDATE*",
        colorTheme: "red-500",
        items: [
          { name: 'LP Price Reveal', url: 'https://drive.google.com/drive/folders/1UCJEHkezJLBRThOV7SXvGkC3PqUB2al4?usp=drive_link' },
          { name: 'SKU PDP NAD', url: 'https://drive.google.com/drive/folders/1I4nB9lZeQ-TgKepP8WLNGBYtz13Wwykn?usp=drive_link' },
          { name: 'Discovery', url: 'https://drive.google.com/drive/folders/1zSyZnj5RhsBjheZBmvaiuZUGq-WCfVUb?usp=drive_link' },
          { name: 'Exposure Tiktok', url: 'https://drive.google.com/drive/folders/1VHL3bqFadJB-nzCdOb7OWoQLydSN-ODQ?usp=drive_link' },
          { name: 'Exposure Tokopedia', url: 'https://drive.google.com/drive/folders/1ViGWTF4RaRZKRj-59r42qzAsyF1LNufK?usp=drive_link' },
          { name: 'Exposure Akulaku', url: 'https://drive.google.com/drive/folders/1E-wGlUGGv_ddu4VIBDjZnmkwDGGqWDvP?usp=drive_link' },
          { name: 'Banner Akulaku', url: 'https://drive.google.com/drive/folders/19kleQF4-oDHdxMDozjDdE_MNbpjogiB8?usp=drive_link' },

        ]
      },
      {
        name: "SKU Loriket",
        colorTheme: "red-500",
        items: [
          { name: 'SKU Description', url: 'https://drive.google.com/drive/folders/1rQVDv_y3pmYnkq2UXfKg7vra-r9Zb_o6?usp=drive_link' },
          { name: 'SKU Slide', url: 'https://drive.google.com/drive/folders/1Uol-zXQoafEbE79UJ_ekElJ3XqoexghJ?usp=drive_link' },
        ]
      },
      {
        name: "SKU",
        colorTheme: "red-500",
        items: [
          { name: 'SKU Angle - Outsource', url: 'https://drive.google.com/drive/folders/1t2MloFb-mGXnk0ZeK1Oigak8pJdrJqk8?usp=drive_link' },
          { name: 'SKU Regular', url: 'https://drive.google.com/drive/folders/1m05LMb_heQq32a5SB8Cjbjw7LihgkxLy?usp=drive_link' },
          { name: 'SKU Gift Box', url: 'https://drive.google.com/drive/folders/1YapeeGGCcWCCwzcTHnIYgzGJ5VPw4Q2D?usp=drive_link' },
          { name: 'SKU KOL OP', url: 'https://drive.google.com/drive/folders/15RMdBrD70gu_WqZ3Ictavsh96JJAxn6x?usp=drive_linkhttps://drive.google.com/drive/folders/15RMdBrD70gu_WqZ3Ictavsh96JJAxn6x?usp=drive_link' },
          { name: 'SKU KOL OS', url: 'https://drive.google.com/drive/folders/1YjME72OE1rRUvNW-yLWxBD_fKmKDEFFI?usp=drive_link' },
          { name: 'SKU NAD OS', url: 'https://drive.google.com/drive/folders/11JYhz1apeNBdg_h7eiItuVT9DHZVazvT?usp=drive_link' },
          { name: 'SKU NAD OP', url: 'https://drive.google.com/drive/folders/1ejdRz83ijrh0eUKCLm_yR7Jm-7-qWPQT?usp=drive_link' },
          { name: 'SKU IDREAMTECH', url: 'https://drive.google.com/drive/folders/1sVikAIW8kFrY6ohVl1e2kyATUw6cTZ3j?usp=drive_link' },
          { name: 'Flash Sale Cover', url: 'https://drive.google.com/drive/folders/1DvA5ONtq_C9gISAF5QsBZ4hkI5QA12CO?usp=drive_link' },
          { name: 'SKU Blind Teasing', url: 'https://drive.google.com/drive/folders/1-IpYZdpk_sKGPT_kO6hkDEJYd6zt2XDS?usp=drive_link' },
        ]
      },
      {
        name: "Payday Banner",
        colorTheme: "red-500",
        items: [
          { name: 'Payday Banner OP - AU - ETC', url: 'https://drive.google.com/drive/folders/1FVsN-N8RgZrOiHRmbfpGEHv_3ICri68d?usp=drive_link' },
          { name: 'Payday Banner OS - Akulaku', url: 'https://drive.google.com/drive/folders/14pF099eF2ND4nNlfsx_WDMIVsmAA-pJM?usp=drive_link' },
          { name: 'Payday Banner Shopee Pay', url: 'https://drive.google.com/drive/folders/1Iu8WGINnPbeyVx9vbXH9glp185xpcTY5?usp=share_link' },
        ]
      },
{
        name: "Landing Page Payday & Warm Up P4 Series",
        colorTheme: "red-500",
        items: [
           { name: 'Akulaku', url: 'https://drive.google.com/drive/folders/14qhNdB60vW4otN6eEZVJSE--Y_h_pYAU?usp=drive_link' },
           { name: 'Tiktok', url: 'https://drive.google.com/drive/folders/1dij8z4UvTBxUXnVWYX2PRyCIc4CcHi0c?usp=drive_link' },
           { name: 'Tokopedia', url: 'https://drive.google.com/drive/folders/1e2kh-fF_dP7HJshEqwZs0A0HqDwJPawP?usp=drive_link' },
            { name: 'Blind Teasing', url: 'https://drive.google.com/drive/folders/1FQLrbkoExLkbt4-j3bwvccQFYFQIsXDq?usp=drive_link' },
        ]
      },
      {
        name: "Exposure",
        colorTheme: "red-500",
        items: [
          { name: 'Akulaku', url: 'https://drive.google.com/drive/folders/1E-wGlUGGv_ddu4VIBDjZnmkwDGGqWDvP?usp=drive_linkhttps://drive.google.com/drive/folders/1E-wGlUGGv_ddu4VIBDjZnmkwDGGqWDvP?usp=drive_link' },
          { name: 'RAW', url: 'https://drive.google.com/drive/folders/1xDYAd9L3YEPclleyavbRvOA41iSFocLv?usp=drive_link' },
          { name: 'Tokopedia', url: 'https://drive.google.com/drive/folders/10KfY3Lnrz3hgy9gISALO4rVp6-1YYBw6?usp=drive_link' },
          { name: 'Discovery Page', url: 'https://drive.google.com/drive/folders/1GOEdaWy6mrKKpU8ji4ZHxD-TmZd1yce7?usp=drive_link' },
        ]
      },
      {
        name: "Super Brand Day",
        colorTheme: "red-500",
        items: [
          { name: 'Tiktok', url: 'https://drive.google.com/drive/folders/1NuHpSXzbjRvT6eDfuQyQIEN5hYEU7t__?usp=drive_link' },
          { name: 'Tokopedia', url: 'https://drive.google.com/drive/folders/1-izVNH1FyXRXq_S146BxNr89qfZw4EE4?usp=drive_link' },
          { name: 'PDP', url: 'https://drive.google.com/drive/folders/1BTA5gJu9BHd0ZC05js374Lv5K6AyJKsf?usp=drive_link' },
          { name: 'Joint Logo', url: 'https://drive.google.com/drive/folders/1sjdquHuYzNrsUWCH-sHnREWAB0Vi45OZ?usp=drive_linkhttps://drive.google.com/drive/folders/1sjdquHuYzNrsUWCH-sHnREWAB0Vi45OZ?usp=drive_link' },
        ]
      },
      
    ]
  },
  
  // --- ALL C100 CONSOLIDATED INTO ONE FOLDER ---
  {
    id: 1006,
    name: 'C100 Series',
    count: 54,
    icon: Sparkles,
    isNew: true,
    date: 'May 06, 2026',
    groups: C100_GROUPS
  },
  // --- NEW REALME OFFICIAL STORE AIOT UPDATE ---
  {
    id: 1004,
    name: 'realme Official Store AIOT update Showcase',
    count: 22,
    icon: LayoutDashboard,
    isNew: false,
    date: 'Apr 08, 2026',
    groups: [
      {
        name: "AIOT SERIES",
        items: [
          { name: 'Buds Air7', url: 'https://drive.google.com/drive/folders/1V2fyvwl0XeOnQOj1THN94UeNVNLZ4NyH?usp=drive_link' },
          { name: 'Buds Air 7 Pro', url: 'https://drive.google.com/drive/folders/1096cpYZHqvSS_16oO_3q9A-VmE4dqU5B?usp=drive_link' },
          { name: 'Buds Air 8', url: 'https://drive.google.com/drive/folders/1KFJ51G4X0wePtXcT3GlcyVmA_byDuW_T?usp=drive_link' },
          { name: 'Buds Tech life', url: 'https://drive.google.com/drive/folders/1KFJ51G4X0wePtXcT3GlcyVmA_byDuW_T?usp=drive_link' },
          { name: 'Buds Clip', url: 'https://drive.google.com/drive/folders/19SKoDWlT6aXBQ9BHBLhplwx5t5qSqx5x?usp=drive_link' },
          { name: 'Buds T110', url: 'https://drive.google.com/drive/folders/1TWZ8qUwTGbrIyH77fuigL0CX7DyRrQt0?usp=drive_link' },
          { name: 'Buds 200', url: 'https://drive.google.com/drive/folders/1l0E886VAfZw54ETSvQRKKclARi5VQJK4?usp=drive_link' },
          { name: 'Buds T310', url: 'https://drive.google.com/drive/folders/192Y2g0uImtDhKigG-26s8ziieROxCUMd?usp=drive_link' },
          { name: 'Buds 200 Lite', url: 'https://drive.google.com/drive/folders/1CVZTcHIS1wIL5YgmWHX6s36_leE9Xc9M?usp=drive_link' },
          { name: 'Watch 5', url: 'https://drive.google.com/drive/folders/1hP52oHL9HYp8qLJbl5A9IM7dUyznvT2K?usp=drive_link' }
        ]
      },
      {
        name: "SMARTPHONE SERIES",
        items: [
          { name: '14T', url: 'https://drive.google.com/drive/folders/1AbRgmWBBI84UY5HTD6Lz-aj3DSfQoSAJ?usp=drive_link' },
          { name: '16 5G', url: 'https://drive.google.com/drive/folders/132vq-QQnQcBlA_R2SSyLfcWKtTCYmuDz?usp=drive_link' },
          { name: '16 Pro 5G', url: 'https://drive.google.com/drive/folders/1RGYtLZNpg9ScdrnR3EJRYzDAkrvELNGq?usp=drive_link' },
          { name: '16 Pro + 5G', url: 'https://drive.google.com/drive/folders/1iHZwZJtlxc0yXoRIPnTqxBs7bGnEg1SS?usp=drive_link' },
          { name: 'C71', url: 'https://drive.google.com/drive/folders/1wYp6nfNvX75Sw6XMm60BXYI9ck68-ggy?usp=drive_link' },
          { name: 'C75', url: 'https://drive.google.com/drive/folders/1DwTB4DJJsxd8MQyHQ_anfNj0OiwETkO8?usp=drive_link' },
          { name: 'C85 4G', url: 'https://drive.google.com/drive/folders/1qTigIVxHt7vc3PSFrSsYteqRd4qbUpay?usp=drive_link' },
          { name: 'Note 60', url: 'https://drive.google.com/drive/folders/1Mxt5qhM3CQXOte7uN6TdNYiDf9EZK7sl?usp=drive_link' },
          { name: 'Note 60x', url: 'https://drive.google.com/drive/folders/1xFi6BIT7XthzkprshpxsHIFepa0W3xzG?usp=drive_link' },
          { name: 'Note 70', url: 'https://drive.google.com/drive/folders/1pMRxBJzd19HsYHxFkOd9vN_6VcZf3amW?usp=drive_link' },
          { name: 'Note 80', url: 'https://drive.google.com/drive/folders/13U7QDlguEiXj2t8lrD8r4U1Vb7dUYzh9?usp=drive_link' },
          { name: 'P3 Lite', url: 'https://drive.google.com/drive/folders/1fz4XXZUJqJs7bqM_SIPlfVd7HrudcJF-?usp=drive_link' }
        ]
      }
    ]
  },
  // --- NEW AKASO UPDATE FOLDER ---
  {
    id: 1003,
    name: 'NEW UPDATE - AKASO Assets',
    count: 6,
    icon: FolderOpen,
    isNew: false,
    date: 'Apr 06, 2026',
    groups: [
      {
        name: "Banner",
        items: [
          { name: 'Maret Ramadhan', url: 'https://drive.google.com/drive/folders/1g52o36qTKjj5oEkgwTa73gUlVmn3EiJ_?usp=share_link' },
          { name: 'April 4.4 Double Date', url: 'https://drive.google.com/drive/folders/13eFwtp0PhLYoZSSX5NBT5y0zoZtD1hk-?usp=share_link' }
        ]
      },
      {
        name: "Social Media",
        items: [
          { name: 'Maret Ramadhan', url: 'https://drive.google.com/drive/folders/1gqEpZggxIzPmkl1AgE2rU0K_ziIqICzz?usp=share_link' },
          { name: 'April', url: 'https://drive.google.com/drive/folders/1kJqrDjJ7bj4wnPpb7BImvfoKHQVSE4jQ?usp=share_link' }
        ]
      },
      {
        name: "Live Streaming",
        items: [
          { name: 'Maret', url: 'https://drive.google.com/drive/folders/1JccKzauKTzZ36uakgRQlNzX4NAT6j1nD?usp=share_link' },
          { name: 'April', url: 'https://drive.google.com/drive/folders/1gb9dvoFUIWxg7X9IVJBuO1kw99whJ7wD?usp=share_link' }
        ]
      }
    ]
  },
  // --- NEW APRIL UPDATE FOLDER (LP) ---
  {
    id: 1002,
    name: 'NEW UPDATE - LP April',
    count: 3,
    icon: LayoutDashboard,
    isNew: false,
    date: 'Apr 07, 2026',
    subfolders: [
      { name: 'Akulaku', url: 'https://drive.google.com/drive/folders/1BHf-Vvloe0V0hacqZkeUzezkKoY05FFd?usp=drive_link' },
      { name: 'Tokopedia', url: 'https://drive.google.com/drive/folders/1V650slqSdfG__5R3DltIZzsiloaLOzQW?usp=drive_link' },
      { name: 'Tiktok', url: 'https://drive.google.com/drive/folders/1lbIUxKKBQFCXk4Zxwz5WF4V-yFbEMuNU?usp=drive_link' }
    ]
  },
  // --- NEW 4.4 UPDATE FOLDER (Banner) ---
  {
    id: 1001,
    name: 'NEW UPDATE - 4.4 Banner Official Partner & Authorized Store',
    count: 6,
    icon: Sparkles,
    isNew: false,
    date: 'Mar 31, 2026',
    subfolders: [
      { name: 'Akulaku', url: 'https://drive.google.com/drive/folders/17zZlEb_9vK6dk_pCwBNaWqR7VxJjJLAB?usp=drive_link' },
      { name: 'Blibli', url: 'https://drive.google.com/drive/folders/1ixiZ7fp431ItH2tABLYHrKqs6sWmnDiS?usp=drive_link' },
      { name: 'Lazada', url: 'https://drive.google.com/drive/folders/1IOp6gGWh2tKsIe7alKiuIxO2f40arm50?usp=drive_link' },
      { name: 'Shopee', url: 'https://drive.google.com/drive/folders/1IrVDFf91VKMH2jAUmN2lsZIaCKVkNy2R?usp=drive_link' },
      { name: 'Tiktok', url: 'https://drive.google.com/drive/folders/1xn3rw1risJPuF8vBfMHVd1RK-4c0IUTw?usp=drive_link' },
      { name: 'Tokopedia', url: 'https://drive.google.com/drive/folders/1q2KJnjlbPfnpNL5g_7-sBRSJ-DttLID-?usp=drive_link' }
    ]
  },
  // --- RAMADAN FOLDER ---
  {
    id: 1000,
    name: 'Ramadan banner',
    count: 4,
    icon: Sparkles,
    isNew: false,
    date: 'Mar 17, 2026',
    subfolders: [
      { name: 'Shopee', url: 'https://drive.google.com/drive/folders/1mSttvN1LSZibW4h5PXRe2DkxTXKssgZV?usp=drive_link' },
      { name: 'Tiktok', url: 'https://drive.google.com/drive/folders/1QR_3_rujgrI00c3_-wh4GPjK0IK8q27e?usp=drive_link' },
      { name: 'Blibli', url: 'https://drive.google.com/drive/folders/1KtBCHdiAvClwN47wlHLsB6xQFetWNsVY?usp=drive_link' },
      { name: 'Tokopedia', url: 'https://drive.google.com/drive/folders/1sIeBsWgHJP06hLgt3uagi_-wospTAmBl?usp=drive_link' }
    ]
  },
  // --- UNIFIED & CATEGORIZED FOLDER ---
  {
    id: 999,
    name: 'Task Update - March',
    count: 28,
    icon: FolderOpen,
    isNew: false,
    date: 'Mar 09, 2026',
    groups: [
      {
        name: "Landing Page (LP)",
        items: [
          { name: 'LP Akulaku', url: 'https://drive.google.com/drive/folders/14gCuaBpmq4M20oEfgMyNlnagNllu0LZT?usp=drive_link' },
          { name: 'LP Tiktok', url: 'https://drive.google.com/drive/folders/1EKHmgwKxc3Nvv8FnukErY_IGtwZyHTGt?usp=drive_link' },
          { name: 'LP Tokopedia', url: 'https://drive.google.com/drive/folders/1MYgvtz-YoTrD3e0NXr1qCkIjMJKCrPEt?usp=drive_link' },
        ]
      },
      {
        name: "Flash Sale (FS)",
        items: [
          { name: 'FS 16 Series - OP', url: 'https://drive.google.com/drive/folders/14-zYnE3DfaWVrUCZs3ULgVfsxci-HG3Z?usp=drive_link' },
          { name: 'FS 16 Series - OS', url: 'https://drive.google.com/drive/folders/1DWQOzHnkklwXZELPLiPoAnnfdApLMMky?usp=drive_link' },
          { name: 'FS AIOT - Buds Air 8', url: 'https://drive.google.com/drive/folders/1yX6OTt_I7em3IN1D7j3Tyw83kGs5pOf5?usp=drive_link' },
          { name: 'FS AIOT - Buds Clip', url: 'https://drive.google.com/drive/folders/1TAooI-EAgXY4Ne5LAj26ZMPo-dYb9P93?usp=drive_link' },
        ]
      },
      {
        name: "SKU PDP",
        items: [
          { name: '16 5G', url: 'https://drive.google.com/drive/folders/1UDbVqn0yF1HZZzGXko14AAZ738YHZz9N?usp=drive_link' },
          { name: '16 Pro 5G', url: 'https://drive.google.com/drive/folders/1FhnEyrTZdLeYjZHTvzj2p3WGvNmlCtoq?usp=drive_link' },
          { name: '16 Pro+ 5G', url: 'https://drive.google.com/drive/folders/1UefmDetEpLktShVbFg1OO0N8rUmdaylK?usp=drive_link' },
          { name: 'Buds Air 8', url: 'https://drive.google.com/drive/folders/1tGrqWtFX8PT-ulHJ3iJB4QJjZa4eZquc?usp=drive_link' },
          { name: 'Buds Clip', url: 'https://drive.google.com/drive/folders/1rKqHtC_jOb7cTNKAAjexhYaC28OVo7Vh?usp=drive_link' },
          { name: 'Techlife', url: 'https://drive.google.com/drive/folders/1aeFRiyj1EFdE8XVVyimJZooU7IDmaiv2?usp=drive_link' },
        ]
      },
      {
        name: "SKU General",
        items: [
          { name: 'Gen 16 Series - Auth', url: 'https://drive.google.com/drive/folders/1X0tsN-WFMo9Oijf9xESuzvSmPX4RWCTA?usp=drive_link' },
          { name: 'Gen 16 Series - OP', url: 'https://drive.google.com/drive/folders/1495yuFw5HJHppqLI3WwZ5qRbgTHWGOzR?usp=drive_link' },
          { name: 'Gen 16 Series - OS', url: 'https://drive.google.com/drive/folders/1jPLnpvERGrrudUEazdkl8u3g2suHXY_g?usp=drive_link' },
          { name: 'Gen AIOT - Buds Air 8', url: 'https://drive.google.com/drive/folders/1UEZp6slebwv9MdsFvtAuMc2hqymFCzZi?usp=drive_link' },
          { name: 'Gen AIOT - Buds Clip', url: 'https://drive.google.com/drive/folders/1-yVJ7mUazAuEDhAtABdjwkt96b5odQur?usp=drive_link' },
        ]
      },
      {
        name: "Banner Updates",
        items: [
          { name: 'Auth - Shopee', url: 'https://drive.google.com/drive/folders/1OCmdXahE1pVlBXA1VaAZAdLh3zeRhu-3?usp=drive_link' },
          { name: 'Auth - Lazada', url: 'https://drive.google.com/drive/folders/1L19cKXTK9eaR1G4BawkK4Tc_uOpDDyK4?usp=drive_link' },
          { name: 'Auth - Blibli', url: 'https://drive.google.com/drive/folders/1kECrMJivBED4hJ3weyhhjo1I7KBp1nlp?usp=drive_link' },
          { name: 'OP - TikTok', url: 'https://drive.google.com/drive/folders/102r0ZA1PgZYBvYll-Y7CZG57yKgrWbUH?usp=drive_link' },
          { name: 'OP - Tokopedia', url: 'https://drive.google.com/drive/folders/16WyUlb4gtqCZyUNQAQ_OpOCgkqlLD01w?usp=drive_link' },
          { name: 'OS - Akulaku', url: 'https://drive.google.com/drive/folders/14C5hxBjZYvoBNJy9iOcmjNQ2T3k1JxqF?usp=drive_link' }
        ]
      },
      {
        name: "Discovery & Social",
        items: [
          { name: 'Discovery TK & Tkped', url: 'https://drive.google.com/drive/folders/1VFc8oFgLHEGZH0O0j8qh1HhVDfmpOxiE?usp=drive_link' },
          { name: 'Giveaway 16 Series', url: 'https://drive.google.com/drive/folders/19NlEngT0Pxuaxr0P6tvR0qe5k8wcu8Io' }
        ]
      },
      {
        name: "SKU KOL & Live Stream",
        items: [
          { name: 'SKU KOL', url: 'https://drive.google.com/drive/folders/1OfQEaH_2q3l9_7e9exOc2EX6fH9BzdUL?usp=drive_link' },
          { name: 'Live Stream BAIM', url: 'https://drive.google.com/drive/folders/1linvGlvvi8BwdRzPTj2BBHymIAZBu2fH?usp=drive_link' }
        ]
      }
    ]
  },
  // --- EXISTING FOLDERS ---
  { 
    id: 108, 
    name: 'SKU PDP Update', 
    count: 7, 
    icon: FolderOpen, 
    isNew: false,
    date: 'Mar 02, 2026',
    subfolders: [
      { name: 'Note 80', url: 'https://drive.google.com/drive/folders/1yZJJPRFxTkcCt54UdRYB-IJk99G5P4cC?usp=drive_link' },
      { name: '16 5G', url: 'https://drive.google.com/drive/folders/1UDbVqn0yF1HZZzGXko14AAZ738YHZz9N?usp=drive_link' },
      { name: '16 Pro 5G', url: 'https://drive.google.com/drive/folders/1FhnEyrTZdLeYjZHTvzj2p3WGvNmlCtoq?usp=drive_link' },
      { name: '16 Pro + 5G', url: 'https://drive.google.com/drive/folders/1UefmDetEpLktShVbFg1OO0N8rUmdaylK?usp=drive_link' },
      { name: 'Buds 8', url: 'https://drive.google.com/drive/folders/1tGrqWtFX8PT-ulHJ3iJB4QJjZa4eZquc?usp=drive_link' },
      { name: 'Buds Clip', url: 'https://drive.google.com/drive/folders/1rKqHtC_jOb7cTNKAAjexhYaC28OVo7Vh?usp=drive_link' },
      { name: 'Buds Techlife', url: 'https://drive.google.com/drive/folders/1aeFRiyj1EFdE8XVVyimJZooU7IDmaiv2?usp=drive_link' }
    ] 
  },
  { 
    id: 101, 
    name: 'New SKU General', 
    count: 5, 
    icon: FolderOpen, 
    isNew: false,
    date: 'Feb 24, 2026',
    subfolders: [
      { name: '16 Series', url: 'https://drive.google.com/drive/folders/1x1Z-Z-Dafyx9lr5tDpiRrqS6keKEKeVI?usp=drive_link' },
      { name: 'Note 80', url: 'https://drive.google.com/drive/folders/1LLnELRFQMP4Ben-ertsFSe3eOuy38FPL?usp=drive_link' },
      { name: 'Tech budslife', url: 'https://drive.google.com/drive/folders/1pQ-iqzAFexzV5l46LOWkQl600BjO26Lh?usp=drive_link' },
      { name: 'Buds Air 8', url: 'https://drive.google.com/drive/folders/1UEZp6slebwv9MdsFvtAuMc2hqymFCzZi?usp=drive_link' },
      { name: 'Buds Clip', url: 'https://drive.google.com/drive/folders/1-yVJ7mUazAuEDhAtABdjwkt96b5odQur?usp=drive_link' }
    ] 
  },
  { 
    id: 102, 
    name: 'New SKU Flash Sale', 
    count: 5, 
    icon: Zap, 
    isNew: false,
    date: 'Feb 24, 2026',
    subfolders: [
      { name: '16 Series', url: 'https://drive.google.com/drive/folders/1E4919jAZH6HkrReHM8Q2ZgjwiWdoBLZH?usp=drive_link' },
      { name: 'Note 80', url: 'https://drive.google.com/drive/folders/1bjkbRo3XEbIqTnIwF8Sfy_XAbCTFK2nL?usp=drive_link' },
      { name: 'Tech budslife', url: 'https://drive.google.com/drive/folders/1ZLqJG5dyEa74ErPCJQi2XIN9qaZVbr3k?usp=drive_link' },
      { name: 'Buds Air 8', url: 'https://drive.google.com/drive/folders/1yX6OTt_I7em3IN1D7j3Tyw83kGs5pOf5?usp=drive_link' },
      { name: 'Buds Clip', url: 'https://drive.google.com/drive/folders/1TAooI-EAgXY4Ne5LAj26ZMPo-dYb9P93?usp=drive_link' }
    ] 
  },
  { 
    id: 103, 
    name: 'New Landing Page Warm Up', 
    count: 1, 
    icon: LayoutDashboard, 
    isNew: false,
    date: 'Feb 24, 2026',
    subfolders: [
      { name: 'Landing Page Warm Up', url: 'https://drive.google.com/drive/folders/1fn5C1lNf-7sR4iP-iYrScV7rd1QxCelM?usp=drive_link' }
    ] 
  },
  { 
    id: 104, 
    name: 'New NAD Warm Up', 
    count: 2, 
    icon: Layers, 
    isNew: false,
    date: 'Feb 24, 2026',
    subfolders: [
      { name: '16 Series', url: 'https://drive.google.com/drive/folders/1VFc8oFgLHEGZH0O0j8qh1HhVDfmpOxiE?usp=drive_link' },
      { name: 'Note 80', url: 'https://drive.google.com/drive/folders/1_0s5rdKugdYNrAot39uhhDsQa7L6_JI0?usp=drive_link' }
    ] 
  },
  { 
    id: 105, 
    name: 'New Live Background', 
    count: 1, 
    icon: Video, 
    isNew: false,
    date: 'Feb 24, 2026',
    subfolders: [
      { name: 'Payday Afdal live stream', url: 'https://drive.google.com/drive/folders/18kWJUIHQcdMF-IKJ5lss9HuBZFIT8V5b?usp=drive_link' }
    ] 
  },
  { 
    id: 106, 
    name: 'New Banner', 
    count: 3, 
    icon: Sparkles, 
    isNew: false,
    date: 'Feb 24, 2026',
    subfolders: [
      { name: 'Authorized Store', url: 'https://drive.google.com/drive/folders/1g1GnWFFaYDSVY-m6ow88MDx1YcYxh7ex?usp=drive_link' },
      { name: 'Official Partner', url: 'https://drive.google.com/drive/folders/1hOvf5IbMr2j01783EXD41m-a3aMLz-hj?usp=drive_link' },
      { name: 'Official Store', url: 'https://drive.google.com/drive/folders/1WdO5sQM_KlnKwulZ2SSD80wlkR5qTfcn?usp=drive_link' }
    ] 
  },
  { 
    id: 107, 
    name: 'New Exposure Warm Up', 
    count: 6, 
    icon: TrendingUp, 
    isNew: false,
    date: 'Feb 24, 2026',
    subfolders: [
      { name: '16 Series', url: 'https://drive.google.com/drive/folders/1VFSLdF0C02rN9da8si904OBg8_BnGXjP?usp=drive_link' },
      { name: 'Note 80', url: '#' },
      { name: 'AIOT', url: 'https://drive.google.com/drive/folders/12RhX0lqUnyTJxj_AQCyBs39A0uQ0c5aL?usp=drive_link' },
      { name: 'Tech budslife', url: 'https://drive.google.com/drive/folders/1St6pjt-pLSEEeGWIftHkT2tYQNDVT39a?usp=drive_link' },
      { name: 'Buds Air 8', url: 'https://drive.google.com/drive/folders/1hFFQ7tmqMvdfjdDPw5c4266WeC-KdV-u?usp=drive_link' },
      { name: 'Buds Clip', url: 'https://drive.google.com/drive/folders/1ocrlOcGZY_OnIOS3y3h-WhJPDbszEsmK?usp=drive_link' }
    ] 
  },
  { 
    id: 7, 
    name: '16 Series Launch & Updates', 
    count: 7, 
    icon: Zap, 
    isNew: false, 
    date: 'Feb 11, 2026',
    subfolders: [
      { name: 'Exposure Akulaku (Warmup)', url: 'https://drive.google.com/drive/folders/1KhlwVR_vnIqEzo2-K1y7GyX9z-JLnltG?usp=drive_link' },
      { name: 'SKU Angle', url: 'https://drive.google.com/drive/folders/1EKu6ePkcN0IFwabKR7RGSXts1R1lU07l?usp=drive_link' },
      { name: 'SKU Teasing', url: 'https://drive.google.com/drive/folders/19ywkj63aCi7vZIHE8N3aLugVQKk-nDNb?usp=drive_link' },
      { name: 'SKU Showcase', url: '#' },
      { name: 'Authorized Store', url: 'https://drive.google.com/drive/folders/1X0tsN-WFMo9Oijf9xESuzvSmPX4RWCTA?usp=drive_link' },
      { name: 'Official Store', url: 'https://drive.google.com/drive/folders/1jPLnpvERGrrudUEazdkl8u3g2suHXY_g?usp=drive_link' },
      { name: 'Official Partner Store', url: 'https://drive.google.com/drive/folders/1495yuFw5HJHppqLI3WwZ5qRbgTHWGOzR?usp=drive_link' }
    ] 
  },
  { 
    id: 6, 
    name: 'Note 80 Launch & Updates', 
    count: 6, 
    icon: FolderOpen, 
    isNew: false, 
    date: 'Feb 03, 2026',
    subfolders: [
      { name: 'Exposure Warm UP - Akulaku', url: 'https://drive.google.com/drive/folders/12RhX0lqUnyTJxj_AQCyBs39A0uQ0c5aL?usp=drive_link' },
      { name: 'SKU Angle', url: 'https://drive.google.com/drive/folders/1g_PR1XfiFr-0jxt5RB40OhqioLZFfenB?usp=drive_link' },
      { name: 'Note 80 Authorized Store', url: 'https://drive.google.com/drive/folders/18opl21vRB_nUS8D3AHVLGc1VsNJQPsSt?usp=drive_link' },
      { name: 'Note 80 Official Partner', url: 'https://drive.google.com/drive/folders/1tdfCFsuzXP5ZHmmnYnowiKqdmCwwrVba?usp=drive_link' },
      { name: 'Note 80 Official Store', url: 'https://drive.google.com/drive/folders/1R1qtn8mli7pJl3W7LXXj22fCYGZWRp2M?usp=drive_link' },
      { name: 'Teasing KV', url: 'https://drive.google.com/drive/folders/1oLboucXDR3z4E9EzoNQKHiFvqe45G2PR?usp=drive_link' }
    ] 
  },
  { 
    id: 1, 
    name: 'Landing Page Official', 
    count: 3, 
    icon: LayoutDashboard, 
    isNew: false, 
    date: 'Jan 29, 2026',
    subfolders: [
      { name: 'LP Akulaku Official', url: 'https://drive.google.com/drive/folders/1VcoDZZzl4qEu2P9z-DDOUCoeJouEeFaP?usp=drive_link' },
      { name: 'LP Tiktok Official 1', url: 'https://drive.google.com/drive/folders/1zbVGwweIf2YZwtMzPgZdiQE-59XI63DP?usp=drive_link' },
      { name: 'LP Tiktok Official 2', url: 'https://drive.google.com/drive/folders/14CR0Rf5HSmSPxkzdPxeDWbYK7L6euWu_?usp=drive_link' }
    ] 
  },
  { 
    id: 5, 
    name: 'Seasonal Campaigns', 
    count: 3, 
    icon: Sparkles, 
    isNew: false, 
    date: 'Jan 29, 2026',
    subfolders: [
      { name: 'AKASO 2.2 Banner', url: 'https://drive.google.com/drive/folders/11OWcPbCif8roejbPWNQ_Y4v2bi3qb17N?usp=drive_link' },
      { name: 'AKASO Lunar Year', url: 'https://drive.google.com/drive/folders/1wJ0ZyYC0M49FjxnxO9lop5LhdDgsL6k3?usp=drive_link' },
      { name: 'AKASO Valentine', url: 'https://drive.google.com/drive/folders/1Xt_bfgqWuSWE9ndnP3VbYL73TIekqIwt?usp=drive_link' }
    ] 
  },
  { 
    id: 2, 
    name: 'Banner OS | AU | OP', 
    count: 6, 
    icon: Layers, 
    isNew: false, 
    date: 'Jan 29, 2026',
    subfolders: [
      { name: 'Banner Akulaku (OS)', url: 'https://drive.google.com/drive/folders/1U0GdLMtragvr_2T2SL9yDPk-0fcVRXoI?usp=drive_link' },
      { name: 'Banner Blibli (AU)', url: 'https://drive.google.com/drive/folders/1VBjg80xcTiRLiyY2e4XAh-QYrv47YfyA?usp=drive_link' },
      { name: 'Banner Lazada (AU)', url: 'https://drive.google.com/drive/folders/1pCT8fhJdwiMqbOtYgxV3l8Tp0QwGvp9Y?usp=drive_link' },
      { name: 'Banner Shopee (AU)', url: 'https://drive.google.com/drive/folders/1wNCJtyE-rGm6Fupl3LOnnIlzLbyBGyer?usp=drive_link' },
      { name: 'Banner TikTok (OP)', url: 'https://drive.google.com/drive/folders/1rJv2HoS9psXsFBA-Z-cNPt8Gg8jKWt8L?usp=drive_link' },
      { name: 'Banner Tokopedia (OP)', url: 'https://drive.google.com/drive/folders/1jVnOi18C4sTwFq1cfKNUl9OUM05Tp9_y?usp=drive_link' }
    ] 
  },
  { 
    id: 3, 
    name: 'Social Media', 
    count: 124, 
    icon: Instagram, 
    isNew: false,
    date: 'Jan 23, 2026', 
    subfolders: [
      { name: 'IG Feed', url: '#' }, 
      { name: 'IG Story', url: '#' }, 
      { name: 'TikTok', url: '#' }, 
      { name: 'Reels', url: '#' }
    ] 
  },
  { 
    id: 4, 
    name: 'Marketplace SKU', 
    count: 45, 
    icon: ShoppingBag, 
    isNew: false,
    date: 'Jan 23, 2026', 
    subfolders: [
      { name: 'Shopee SKU', url: '#' }, 
      { name: 'Tokopedia SKU', url: '#' }, 
      { name: 'Lazada SKU', url: '#' }
    ] 
  }
];

const AI_MESSAGES = [ { id: 1, sender: 'ai', text: "Halo Tim Sales! Ada yang bisa dibantu untuk request design atau cek status?" } ];

// --- HELPER COMPONENTS ---
const StatusBadge = ({ status }) => {
  const colorMap = { 'Pending': 'bg-amber-50 text-amber-600 border border-amber-200', 'Approved': 'bg-gradient-to-r from-amber-400 to-amber-500 text-white shadow-md border border-amber-500', 'In Progress': 'bg-white text-amber-600 border border-amber-300 animate-pulse font-bold', 'Review': 'bg-stone-100 text-stone-600 border border-stone-300 border-dashed', 'Done': 'bg-amber-500 text-white font-bold shadow-sm' };
  return <div className="flex items-center gap-2"><span className={`text-[8px] md:text-[10px] px-2 py-1 rounded-md tracking-wide ${colorMap[status] || 'bg-slate-100 text-slate-500'}`}>{status}</span></div>;
};

const PriorityBadge = ({ level }) => {
  const colorMap = { 'Urgent': 'text-amber-600', 'High': 'text-slate-900', 'Medium': 'text-slate-600', 'Low': 'text-slate-400' };
  return <span className={`text-[8px] md:text-[10px] font-bold uppercase tracking-wider ${colorMap[level]}`}>{level}</span>;
};

// --- REUSABLE REQUEST TABLE ---
const RequestTable = ({ requests }) => (
  <div className="overflow-x-auto flex-1">
    <table className="w-full text-left min-w-[600px]">
      <thead>
        <tr className="bg-slate-50 text-slate-500 text-[10px] md:text-[10px] uppercase tracking-wider font-bold border-b border-slate-100">
          <th className="py-3 md:py-4 pl-4 md:pl-6">Project Details</th>
          <th className="py-3 md:py-4">Brand</th>
          <th className="py-3 md:py-4">Requester</th>
          <th className="py-3 md:py-4">Status</th>
          <th className="py-3 md:py-4">Priority</th>
          <th className="py-3 md:py-4 text-right pr-6"></th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-50">
        {requests.map((req) => (
          <tr key={req.id} className="group hover:bg-amber-50/20 transition-colors text-[10px] md:text-xs">
            <td className="py-3 md:py-4 pl-4 md:pl-6">
              <div className="font-bold text-slate-800 text-[11px] md:text-sm">{req.title}</div>
              <div className="text-[10px] md:text-[11px] text-slate-400 mt-1 flex items-center gap-2">
                {req.status === 'Pending' && <span className="bg-amber-400 text-white px-1.5 py-0.5 rounded font-bold animate-pulse">NEW</span>}
                <span className="text-slate-500 font-medium">{req.date}</span>
              </div>
            </td>
            <td className="py-3 md:py-4 text-slate-600 text-[10px] md:text-sm font-medium">{req.brand}</td>
            <td className="py-3 md:py-4 text-slate-600 font-bold">{req.requester}</td>
            <td className="py-3 md:py-4"><StatusBadge status={req.status} /></td>
            <td className="py-3 md:py-4"><PriorityBadge level={req.priority} /></td>
            <td className="py-3 md:py-4 text-right pr-6"><button className="p-1.5 md:p-2 hover:bg-white hover:shadow rounded-lg text-slate-400 hover:text-amber-500 transition-all active:scale-90"><MoreVertical size={14} /></button></td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// --- REUSABLE PAGINATION ---
const PaginationControls = ({ currentPage, totalPages, onPageChange, totalItems, itemsPerPage }) => (
  <div className="p-4 border-t border-slate-100 flex justify-between items-center bg-slate-50/50">
    <p className="text-[10px] md:text-xs text-slate-400 font-medium">Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} results</p>
    <div className="flex items-center gap-2">
      <button onClick={() => onPageChange(Math.max(currentPage - 1, 1))} disabled={currentPage === 1} className="p-1.5 rounded-lg border border-slate-200 text-slate-500 disabled:opacity-50 hover:bg-white active:scale-90 transition-all"><ChevronLeft size={14} /></button>
      <button onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))} disabled={currentPage === totalPages} className="p-1.5 rounded-lg border border-slate-200 text-slate-500 disabled:opacity-50 hover:bg-white active:scale-90 transition-all"><ChevronRight size={14} /></button>
    </div>
  </div>
);

// --- LIVE TICKER ---
const LiveTicker = ({ activities }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  useEffect(() => { const interval = setInterval(() => { setCurrentIndex((prev) => (prev + 1) % activities.length); }, 4000); return () => clearInterval(interval); }, [activities]);
  const currentActivity = activities[currentIndex];
  return (
    <div className="bg-white border-b border-slate-100 overflow-hidden relative h-10 md:h-12 flex items-center z-40 px-3 md:px-6 shadow-sm">
      <div className="flex items-center gap-2 mr-3 md:mr-6 border-r border-slate-100 pr-3 md:pr-6 h-1/2">
        <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-amber-500 rounded-full animate-pulse"></div>
        <span className="text-[10px] md:text-xs font-black text-amber-500 uppercase tracking-widest">Live</span>
      </div>
      <div className="flex-1 relative h-full flex items-center overflow-hidden">
         <div key={currentIndex} className="animate-slide-vertical flex items-center w-full">
            <p className="text-[10px] md:text-xs text-slate-600 font-medium truncate flex items-center gap-2">
               <span className="text-slate-400 font-mono">[{currentActivity.time}]</span>
               {currentActivity.type === 'live' && <span className="bg-rose-500 text-white px-1.5 py-0.5 rounded text-[8px] font-black uppercase animate-pulse shadow-sm">LIVE</span>}
               <span className={`font-bold ${currentActivity.type === 'live' ? 'text-rose-600' : 'text-slate-800'}`}>{currentActivity.text}</span>
            </p>
         </div>
      </div>
      <div className="flex items-center gap-2 ml-4">
         <button onClick={() => setCurrentIndex((prev) => (prev - 1 + activities.length) % activities.length)} className="p-1 bg-gradient-to-r from-amber-400 to-amber-500 text-white rounded-lg shadow-md hover:scale-105 active:scale-90 transition-all"><ChevronLeft size={14} strokeWidth={3}/></button>
         <button onClick={() => setCurrentIndex((prev) => (prev + 1) % activities.length)} className="p-1 bg-gradient-to-r from-amber-400 to-amber-500 text-white rounded-lg shadow-md hover:scale-105 active:scale-90 transition-all"><ChevronRight size={14} strokeWidth={3}/></button>
      </div>
    </div>
  );
};

// --- MOBILE BOTTOM NAV ---
const MobileBottomNav = ({ activeTab, onNavigate, badge }) => (
  <div className="md:hidden fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur-md border-t border-slate-100 z-[80] pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
    <div className="flex justify-around items-center h-16">
      <button onClick={() => onNavigate('dashboard')} className={`flex flex-col items-center gap-1 p-2 active:scale-90 transition-transform ${activeTab === 'dashboard' ? 'text-amber-500' : 'text-slate-400'}`}><Home size={20} strokeWidth={activeTab === 'dashboard' ? 2.5 : 2} /><span className="text-[10px] font-bold tracking-wide">Home</span></button>
      <button onClick={() => onNavigate('requests')} className={`flex flex-col items-center gap-1 p-2 relative active:scale-90 transition-transform ${activeTab === 'requests' ? 'text-amber-500' : 'text-slate-400'}`}><FolderOpen size={20} strokeWidth={activeTab === 'requests' ? 2.5 : 2} /><span className="text-[10px] font-bold tracking-wide">Queue</span>{badge > 0 && <span className="absolute top-1.5 right-3 w-1.5 h-1.5 bg-amber-500 border border-white rounded-full"></span>}</button>
      <button onClick={() => onNavigate('calendar')} className={`flex flex-col items-center gap-1 p-2 active:scale-90 transition-transform ${activeTab === 'calendar' ? 'text-amber-500' : 'text-slate-400'}`}><CalendarIcon size={20} strokeWidth={activeTab === 'calendar' ? 2.5 : 2} /><span className="text-[10px] font-bold tracking-wide">Jadwal</span></button>
      <button onClick={() => onNavigate('tasks')} className={`flex flex-col items-center gap-1 p-2 active:scale-90 transition-transform ${activeTab === 'tasks' ? 'text-amber-500' : 'text-slate-400'}`}><CheckSquare size={20} strokeWidth={activeTab === 'tasks' ? 2.5 : 2} /><span className="text-[10px] font-bold tracking-wide">Tasks</span></button>
      <button onClick={() => onNavigate('brankas')} className={`flex flex-col items-center gap-1 p-2 active:scale-90 transition-transform ${activeTab === 'brankas' ? 'text-amber-500' : 'text-slate-400'}`}><Archive size={20} strokeWidth={activeTab === 'brankas' ? 2.5 : 2} /><span className="text-[10px] font-bold tracking-wide">Brankas</span></button>
    </div>
  </div>
);

// --- GLOBAL AI CHAT ---
const GlobalAIChat = ({ onAddRequest, onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState(AI_MESSAGES);
  const [isProcessing, setIsProcessing] = useState(false);
  const [assistMode, setAssistMode] = useState(false);
  const [showQuickLinks, setShowQuickLinks] = useState(false);

  const handleSend = () => {
    if (!chatInput.trim()) return;
    const userText = chatInput;
    setMessages(prev => [...prev, { id: Date.now(), sender: 'user', text: userText }]);
    setChatInput('');
    setIsProcessing(true);
    setTimeout(() => {
      onAddRequest({ title: userText, date: "TBD", brands: ['General'], types: ['AI'] });
      setMessages(prev => [...prev, { id: Date.now()+1, sender: 'ai', text: `✅ Request "${userText}" added to Queue.` }]);
      setIsProcessing(false);
    }, 1200);
  };

  const QuickAction = ({ label, icon: Icon, onClick }) => (
    <button onClick={onClick} className="flex flex-col items-center justify-center p-3 bg-slate-50 border border-slate-200 rounded-xl hover:bg-amber-50 hover:border-amber-200 transition-all active:scale-95 gap-2 group w-full">
       <div className="p-2 bg-white rounded-lg shadow-sm text-slate-500 group-hover:text-amber-500 transition-colors"><Icon size={18}/></div><span className="text-[10px] font-bold text-slate-600">{label}</span>
    </button>
  );

  return (
    <>
      {!isOpen && ( <button onClick={() => setIsOpen(true)} className="fixed bottom-20 right-4 md:bottom-8 md:right-8 z-[60] bg-slate-900 text-white p-3 md:p-4 rounded-full shadow-2xl hover:scale-110 active:scale-90 transition-transform flex items-center justify-center gap-2 group border-4 border-white animate-pulse-glow"><Headset size={20} className="text-white" /><span className="font-bold text-[10px] md:text-xs pr-1 hidden md:inline">CS Assist</span></button> )}
      {isOpen && (
        <div className="fixed bottom-20 right-4 md:bottom-8 md:right-8 z-[60] w-[calc(100%-2rem)] md:w-96 h-[400px] md:h-[500px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-fade-slide">
           <div className="p-3 md:p-4 bg-slate-900 text-white flex justify-between items-center shadow-md">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-full border border-white/20"><Headset size={16} className="text-white"/></div>
                <div><h3 className="font-bold text-xs md:text-sm">Design Support</h3><p className="text-[10px] text-slate-400">Sales Assistance System</p></div>
              </div>
              <div className="flex items-center gap-2">
                 <button onClick={() => setAssistMode(!assistMode)} className={`p-1.5 rounded-lg transition-colors active:scale-90 ${assistMode ? 'bg-amber-500 text-white' : 'hover:bg-white/20 text-slate-400 hover:text-white'}`} title="Assist Mode"><Zap size={14}/></button>
                 <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors active:scale-90 text-slate-400 hover:text-white"><Minimize2 size={14}/></button>
              </div>
           </div>
           <div className="flex-1 p-3 md:p-4 overflow-y-auto space-y-4 bg-slate-50/50">
              {assistMode ? (
                <div className="animate-fade-slide">
                   <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 text-center">Quick Actions</p>
                   <div className="grid grid-cols-2 gap-3">
                      <QuickAction label="New Request" icon={PlusCircle} onClick={() => { setAssistMode(false); }} />
                      <QuickAction label="Check Queue" icon={List} onClick={() => { setAssistMode(false); setIsOpen(false); onNavigate('requests'); }} />
                      <QuickAction label="My Stats" icon={BarChart3} onClick={() => { setAssistMode(false); setIsOpen(false); onNavigate('monitoring'); }} />
                      <QuickAction label="Vault Assets" icon={Archive} onClick={() => { setAssistMode(false); setIsOpen(false); onNavigate('brankas'); }} />
                   </div>

                   {/* --- QUICK LINKS ACCORDION --- */}
                   <div className="mt-4">
                      <button 
                        onClick={() => setShowQuickLinks(!showQuickLinks)}
                        className="w-full flex items-center justify-between p-3 bg-rose-50 border border-rose-200 rounded-xl hover:bg-rose-100 transition-all active:scale-95 group relative overflow-hidden shadow-sm"
                      >
                         <div className="absolute inset-0 bg-rose-500/10 animate-pulse"></div>
                         <div className="flex items-center gap-2 relative z-10">
                           <span className="bg-rose-500 text-white text-[8px] font-black px-2 py-0.5 rounded shadow-sm animate-pulse">NEW</span>
                           <span className="text-[10px] md:text-xs font-bold text-rose-700">Quick Links</span>
                         </div>
                         <ChevronDown size={14} className={`text-rose-500 transition-transform relative z-10 ${showQuickLinks ? 'rotate-180' : ''}`} />
                      </button>
                      
                      {showQuickLinks && (
                        <div className="mt-2 space-y-2 animate-scale-in">
                           <a href="https://www.tiktok.com/@realme.indonesia?_r=1&_t=ZS-95YFy2e0tYy" target="_blank" rel="noreferrer" className="w-full flex items-center justify-between p-2 bg-white border border-slate-200 rounded-lg hover:border-rose-300 text-[10px] md:text-xs font-bold text-slate-600 transition-all shadow-sm">Realme Official <ExternalLink size={12} className="text-slate-400"/></a>
                           <a href="https://vt.tiktok.com/ZS9LuSUMsJkUx-YFeLy/" target="_blank" rel="noreferrer" className="w-full flex items-center justify-between p-2 bg-white border border-slate-200 rounded-lg hover:border-rose-300 text-[10px] md:text-xs font-bold text-slate-600 transition-all shadow-sm">Realme Partner <ExternalLink size={12} className="text-slate-400"/></a>
                           <a href="https://www.tiktok.com/@akasoindonesia?_r=1&_t=ZS-95YG2I0tYGa" target="_blank" rel="noreferrer" className="w-full flex items-center justify-between p-2 bg-white border border-slate-200 rounded-lg hover:border-rose-300 text-[10px] md:text-xs font-bold text-slate-600 transition-all shadow-sm">Akaso <ExternalLink size={12} className="text-slate-400"/></a>
                           <a href="https://vt.tiktok.com/ZS9LuSmcg95EX-fDHS3/" target="_blank" rel="noreferrer" className="w-full flex items-center justify-between p-2 bg-white border border-slate-200 rounded-lg hover:border-rose-300 text-[10px] md:text-xs font-bold text-slate-600 transition-all shadow-sm">iDreamtech <ExternalLink size={12} className="text-slate-400"/></a>
                        </div>
                      )}
                      
                      <p className="text-[8px] md:text-[9px] text-slate-400 text-center mt-2 font-medium px-2">segera update link toko agar dapat di masukan ke quick links</p>
                   </div>
                </div>
              ) : (
                <>
                  {messages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-slide`}>
                        <div className={`max-w-[85%] p-2 md:p-3 rounded-xl text-[10px] md:text-xs leading-relaxed shadow-sm ${msg.sender === 'user' ? 'bg-slate-800 text-white rounded-tr-none' : 'bg-white border border-slate-200 text-slate-600 rounded-tl-none'}`}>{msg.text}</div>
                    </div>
                  ))}
                  {isProcessing && (
                      <div className="flex justify-start animate-pulse"><div className="bg-white border border-slate-200 p-2 md:p-3 rounded-xl rounded-tl-none shadow-sm flex gap-1"><div className="w-1 md:w-1.5 h-1 md:h-1.5 bg-slate-400 rounded-full animate-bounce"></div><div className="w-1 md:w-1.5 h-1 md:h-1.5 bg-slate-400 rounded-full animate-bounce delay-75"></div><div className="w-1 md:w-1.5 h-1 md:h-1.5 bg-slate-400 rounded-full animate-bounce delay-150"></div></div></div>
                    )}
                </>
              )}
           </div>
           {!assistMode && (
             <div className="p-3 bg-white border-t border-slate-100">
               <div className="relative">
                 <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSend()} placeholder="Ketik request..." className="w-full bg-slate-100 border border-transparent focus:bg-white focus:border-amber-300 rounded-xl pl-4 pr-10 py-2 md:py-3 text-[10px] md:text-xs font-medium outline-none transition-all" />
                 <button onClick={handleSend} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 active:scale-90 transition-all"><Send size={12}/></button>
               </div>
             </div>
           )}
        </div>
      )}
    </>
  );
};

// --- UPLOAD MODAL COMPONENT (GIMMICK) ---
const UploadAssetModal = ({ onClose }) => (
  <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
     <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-6 md:p-8 text-center relative animate-scale-in border border-slate-200">
         <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-slate-50 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-800 transition-colors shadow-sm">
           <X size={16} strokeWidth={3} />
         </button>
         <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-100 shadow-inner">
           <UploadCloud size={28} />
         </div>
         <h3 className="font-black text-slate-800 text-lg mb-1 tracking-tight">Upload Asset Baru</h3>
         <p className="text-[11px] md:text-xs text-slate-500 mb-6 font-medium">Pilih file atau drag & drop asset lu kesini boss.</p>
         
         <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 mb-6 hover:border-amber-400 hover:bg-amber-50/50 cursor-pointer active:scale-95 transition-all group">
            <span className="text-xs font-bold text-slate-400 group-hover:text-amber-600">Klik untuk Pilih File<br/><span className="text-[10px] font-normal mt-1 block">(Max 50MB per file)</span></span>
         </div>
         
         <button onClick={onClose} className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-black transition-all hover:-translate-y-0.5 active:scale-95 text-xs md:text-sm">
           Tutup & Simpan
         </button>
     </div>
  </div>
);

// --- QUALITY CHECK REMINDER MODAL (ONCE PER SESSION) ---
const ExternalLinkWarningModal = ({ onContinue, onClose }) => (
  <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
     <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-6 md:p-8 text-center relative animate-scale-in border border-slate-200">
         <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-5 border border-amber-100 shadow-inner">
           <AlertTriangle size={28} />
         </div>
         <h3 className="font-black text-slate-800 text-lg mb-2 tracking-tight">Peringatan Pengecekan Desain</h3>
         <p className="text-[11px] md:text-xs text-slate-500 mb-6 font-medium leading-relaxed">
           Sebelum melanjutkan ke folder eksternal, mohon pastikan kembali bahwa hasil desain telah dicek secara menyeluruh <b>(HARGA, UKURAN, resolusi, dan copywriting)</b>. Lanjutkan jika sudah yakin.
         </p>

         <div className="flex gap-3">
           <button onClick={onClose} className="flex-1 py-3 rounded-xl font-bold text-slate-500 bg-slate-50 hover:bg-slate-100 active:scale-95 transition-all text-xs md:text-sm border border-slate-200">
             Cek Kembali
           </button>
           <button onClick={onContinue} className="flex-1 bg-amber-500 text-white py-3 rounded-xl font-bold shadow-lg shadow-amber-200 hover:bg-amber-600 transition-all hover:-translate-y-0.5 active:scale-95 text-xs md:text-sm flex items-center justify-center gap-2">
             Continue <ArrowRight size={14} strokeWidth={3} />
           </button>
         </div>
     </div>
  </div>
);

// --- ASSETS VIEW ---
const AssetsView = ({ activeFolder, setActiveFolder }) => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [filterType, setFilterType] = useState('New Update');
  const [pendingUrl, setPendingUrl] = useState(null);

  const handleLinkClick = (e, url) => {
    if (url === '#') {
      e.preventDefault();
      return;
    }
    // Cek apakah warning sudah pernah muncul di sesi ini
    if (!sessionStorage.getItem('hasSeenDesignWarning')) {
      e.preventDefault();
      setPendingUrl(url);
    }
  };

  const handleContinueToLink = () => {
    sessionStorage.setItem('hasSeenDesignWarning', 'true');
    window.open(pendingUrl, '_blank');
    setPendingUrl(null);
  };

  if (activeFolder) {
    const isBlue = activeFolder.colorTheme === 'blue';
    const isPurple = activeFolder.colorTheme === 'purple';
    const isEmerald = activeFolder.colorTheme === 'emerald';
    const accentColorText = isEmerald ? 'text-emerald-500' : isBlue ? 'text-blue-500' : isPurple ? 'text-purple-500' : 'text-amber-500';
    const accentColorHoverText = isEmerald ? 'hover:text-emerald-600 group-hover:text-emerald-600' : isBlue ? 'hover:text-blue-600 group-hover:text-blue-600' : isPurple ? 'hover:text-purple-600 group-hover:text-purple-600' : 'hover:text-amber-600 group-hover:text-amber-600';
    const accentColorBorderHover = isEmerald ? 'hover:border-emerald-400' : isBlue ? 'hover:border-blue-400' : isPurple ? 'hover:border-purple-400' : 'hover:border-amber-400';
    const accentColorBg = isEmerald ? 'bg-emerald-400' : isBlue ? 'bg-blue-400' : isPurple ? 'bg-purple-400' : 'bg-amber-400';

    return (
      <div className="animate-in fade-in slide-in-from-right-4 duration-300 h-full flex flex-col relative">
         {/* RENDER WARNING MODAL */}
         {pendingUrl && <ExternalLinkWarningModal onContinue={handleContinueToLink} onClose={() => setPendingUrl(null)} />}

         <div className="flex items-center gap-3 mb-4 flex-shrink-0">
           <button onClick={() => setActiveFolder(null)} className="p-1.5 hover:bg-slate-100 active:scale-90 rounded-xl transition-all"><ChevronLeft size={20}/></button>
           <div><h2 className="text-sm md:text-xl font-bold text-slate-800 flex items-center gap-2"><FolderOpen className={accentColorText} size={18} /> {activeFolder.name}</h2><p className="text-slate-500 text-[10px] md:text-xs mt-0.5">Showing sub-folders & files</p></div>
         </div>
         <div className="overflow-y-auto flex-1 pb-20">
           {activeFolder.groups ? (
             <div className="flex flex-col gap-6 md:gap-8">
               {activeFolder.groups.map((group, gIdx) => {
                 const groupColorTheme = group.colorTheme || activeFolder.colorTheme || 'amber';
                 const isGrpEmerald = groupColorTheme === 'emerald';
                 const isGrpBlue = groupColorTheme === 'blue';
                 const isGrpPurple = groupColorTheme === 'purple';
                 const indicatorColor = isGrpEmerald ? 'bg-emerald-400' : isGrpBlue ? 'bg-blue-400' : isGrpPurple ? 'bg-purple-400' : 'bg-amber-400';
                 const borderHover = isGrpEmerald ? 'hover:border-emerald-400' : isGrpBlue ? 'hover:border-blue-400' : isGrpPurple ? 'hover:border-purple-400' : 'hover:border-amber-400';
                 const iconColor = isGrpEmerald ? 'text-emerald-500' : isGrpBlue ? 'text-blue-500' : isGrpPurple ? 'text-purple-500' : 'text-amber-500';

                 return (
                 <div key={gIdx} className="animate-fade-slide" style={{ animationDelay: `${gIdx * 100}ms` }}>
                   <div className="flex items-center gap-2 mb-3 md:mb-4 border-b border-slate-200 pb-2">
                     <div className={`w-1.5 h-4 rounded-full ${indicatorColor}`}></div>
                     <h3 className="text-xs md:text-sm font-black text-slate-800 uppercase tracking-wide">{group.name}</h3>
                   </div>
                   <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
                     {group.items.map((sub, idx) => (
                       <a 
                         key={idx} 
                         href={sub.url !== '#' ? sub.url : undefined} 
                         target={sub.url !== '#' ? "_blank" : undefined} 
                         rel={sub.url !== '#' ? "noopener noreferrer" : undefined} 
                         onClick={(e) => {
                             if (sub.url === '#') e.preventDefault(); 
                             else handleLinkClick(e, sub.url);
                         }}
                         className={`p-3 md:p-4 rounded-xl border transition-all flex flex-col items-center text-center gap-2 group ${sub.url === '#' ? 'bg-rose-50 border-rose-200 cursor-not-allowed' : `bg-white border-slate-200 hover:shadow-md active:scale-95 cursor-pointer ${borderHover}`}`}
                       >
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-transform ${sub.url === '#' ? 'bg-rose-100 text-rose-500' : `bg-slate-50 group-hover:scale-110 ${iconColor}`}`}>
                             <Folder size={20} fill="currentColor" className="opacity-80"/>
                          </div>
                          <span className={`text-[10px] md:text-xs font-bold ${sub.url === '#' ? 'text-rose-600' : 'text-slate-700'}`}>{sub.name}</span>
                          {sub.disabledText && <span className="text-[8px] text-rose-500 mt-1 leading-tight">{sub.disabledText}</span>}
                       </a>
                     ))}
                   </div>
                 </div>
               )})}
             </div>
           ) : (
             <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
               {activeFolder.subfolders.map((sub, idx) => (
                 <a 
                   key={idx} 
                   href={sub.url !== '#' ? sub.url : undefined} 
                   target={sub.url !== '#' ? "_blank" : undefined} 
                   rel={sub.url !== '#' ? "noopener noreferrer" : undefined} 
                   onClick={(e) => {
                       if (sub.url === '#') e.preventDefault(); 
                       else handleLinkClick(e, sub.url);
                   }}
                   className={`p-3 md:p-4 rounded-xl border transition-all flex flex-col items-center text-center gap-2 group ${sub.url === '#' ? 'bg-rose-50 border-rose-200 cursor-not-allowed' : `bg-white border-slate-200 hover:shadow-md active:scale-95 cursor-pointer ${accentColorBorderHover}`}`}
                 >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-transform ${sub.url === '#' ? 'bg-rose-100 text-rose-500' : `bg-slate-50 group-hover:scale-110 ${accentColorText}`}`}>
                       <Folder size={20} fill="currentColor" className="opacity-80"/>
                    </div>
                    <span className={`text-[10px] md:text-xs font-bold ${sub.url === '#' ? 'text-rose-600' : 'text-slate-700'}`}>{sub.name}</span>
                    {sub.disabledText && <span className="text-[8px] text-rose-500 mt-1 leading-tight">{sub.disabledText}</span>}
                 </a>
               ))}
             </div>
           )}
         </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-300 relative">
      {/* RENDER UPLOAD MODAL */}
      {showUploadModal && <UploadAssetModal onClose={() => setShowUploadModal(false)} />}
      
      <div className="bg-white p-4 md:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div><h2 className="text-sm md:text-2xl font-bold text-slate-800 flex items-center gap-2"><PieChart className="text-amber-500" size={18} /> Active Assets</h2><p className="text-slate-500 text-[10px] md:text-sm mt-1">Organized by category.</p></div>
        <div className="flex gap-2 w-full md:w-auto">
          <button className="flex-1 md:flex-none bg-slate-100 text-slate-600 px-3 py-2 rounded-xl text-[10px] md:text-xs font-bold hover:bg-slate-200 active:scale-95 transition-all flex items-center justify-center gap-2"><FilePlus size={12}/> New Folder</button>
          <div className="relative group">
             <button className="text-slate-500 hover:text-amber-600 flex items-center gap-2 text-[10px] md:text-xs font-bold transition-colors bg-white border border-slate-200 px-3 py-2 rounded-xl"><Filter size={12}/> {filterType}</button>
             <div className="absolute top-full right-0 mt-2 w-32 bg-white rounded-xl shadow-xl border border-slate-100 p-1 hidden group-hover:block z-50">
               {['New Update', 'Last Update', 'A-Z'].map(t => (<button key={t} onClick={() => setFilterType(t)} className="w-full text-left px-3 py-2 text-[10px] md:text-xs font-bold text-slate-600 hover:bg-amber-50 hover:text-amber-600 rounded-lg">{t}</button>))}
             </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
         <div onClick={() => setShowUploadModal(true)} className="bg-white border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center p-4 md:p-8 text-slate-400 hover:border-amber-400 hover:text-amber-500 hover:bg-amber-50/30 active:scale-95 transition-all cursor-pointer h-36 md:h-48 group">
           <div className="p-3 md:p-4 bg-slate-50 rounded-full mb-3 group-hover:bg-amber-100 transition-colors"><UploadCloud size={24} /></div><span className="text-[10px] md:text-sm font-bold">Upload New</span>
         </div>
         {ASSET_FOLDERS.map((folder) => {
           const isEmerald = folder.colorTheme === 'emerald';
           const isBlue = folder.colorTheme === 'blue';
           const isPurple = folder.colorTheme === 'purple';
           const borderHover = isEmerald ? 'hover:border-emerald-400' : isBlue ? 'hover:border-blue-400' : isPurple ? 'hover:border-purple-400' : 'hover:border-amber-400';
           const textHover = isEmerald ? 'group-hover:text-emerald-600' : isBlue ? 'group-hover:text-blue-600' : isPurple ? 'group-hover:text-purple-600' : 'group-hover:text-amber-600';
           const iconColor = isEmerald ? 'text-emerald-600' : isBlue ? 'text-blue-600' : isPurple ? 'text-purple-600' : 'text-slate-700';
           const gradientVia = isEmerald ? 'group-hover:via-emerald-400' : isBlue ? 'group-hover:via-blue-400' : isPurple ? 'group-hover:via-purple-400' : 'group-hover:via-amber-400';
           const badgeBg = isEmerald ? 'bg-emerald-500' : isBlue ? 'bg-blue-500' : isPurple ? 'bg-purple-500' : 'bg-amber-500';

           return (
             <div key={folder.id} onClick={() => setActiveFolder(folder)} className={`bg-white rounded-2xl p-4 md:p-6 border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer group relative overflow-hidden h-36 md:h-48 flex flex-col justify-between ${borderHover}`}>
               {folder.isNew && (
                   <div className={`absolute top-3 right-3 text-white text-[8px] font-black px-2 py-0.5 rounded shadow-sm animate-pulse z-10 ${badgeBg}`}>NEW UPLOAD</div>
               )}
               <div className="flex justify-between items-start">
                   <div className={`p-2 md:p-3 rounded-xl bg-slate-50 ${iconColor}`}><folder.icon size={20} /></div>
                   <button className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-800 transition-opacity"><MoreHorizontal size={16} /></button>
               </div>
               <div><h3 className={`text-xs md:text-lg font-bold text-slate-800 transition-colors ${textHover}`}>{folder.name}</h3>
               <p className="text-[10px] md:text-xs text-slate-400 font-medium mt-1">{folder.count} items</p>
               <div className="mt-2 text-[8px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded w-fit">{folder.date}</div>
               </div>
               <div className={`absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent transition-all ${gradientVia}`}></div>
             </div>
           );
         })}
      </div>
    </div>
  );
};

// --- BRANKAS VIEW ---
const BrankasView = () => {
  const [filter, setFilter] = useState('All Time'); 
  const [activeFolder, setActiveFolder] = useState(null);
  const [pendingUrl, setPendingUrl] = useState(null);
  
  // Mengelompokkan ASSET_FOLDERS asli berdasarkan bulan dari property 'date'
  const groupedAssets = ASSET_FOLDERS.reduce((acc, folder) => {
    const dateParts = folder.date.split(' ');
    const monthYear = dateParts.length >= 3 ? `${dateParts[0]} ${dateParts[2]}`.toUpperCase() : 'OLDER';
    if (!acc[monthYear]) acc[monthYear] = [];
    acc[monthYear].push(folder);
    return acc;
  }, {});

  const groups = Object.keys(groupedAssets).map(key => ({
    month: key,
    folders: groupedAssets[key]
  }));

  const handleLinkClick = (e, url) => {
    if (url === '#') { e.preventDefault(); return; }
    if (!sessionStorage.getItem('hasSeenDesignWarning')) {
      e.preventDefault();
      setPendingUrl(url);
    }
  };

  const handleContinueToLink = () => {
    sessionStorage.setItem('hasSeenDesignWarning', 'true');
    window.open(pendingUrl, '_blank');
    setPendingUrl(null);
  };

  if (activeFolder) {
      return (
        <div className="animate-in fade-in slide-in-from-right-4 duration-300 h-full flex flex-col p-4 md:p-6 relative">
           {pendingUrl && <ExternalLinkWarningModal onContinue={handleContinueToLink} onClose={() => setPendingUrl(null)} />}
           <div className="flex items-center gap-3 mb-4 flex-shrink-0">
             <button onClick={() => setActiveFolder(null)} className="p-1.5 hover:bg-slate-100 active:scale-90 rounded-xl transition-all"><ChevronLeft size={20}/></button>
             <div><h2 className="text-sm md:text-xl font-bold text-slate-800 flex items-center gap-2"><Archive className="text-amber-500" size={18} /> {activeFolder.name}</h2><p className="text-slate-500 text-[10px] md:text-xs mt-0.5">Archived Assets</p></div>
           </div>
           <div className="overflow-y-auto flex-1 pb-20 pr-2 scrollbar-hide">
             {activeFolder.groups ? (
               <div className="flex flex-col gap-6 md:gap-8">
                 {activeFolder.groups.map((group, gIdx) => {
                   const groupColorTheme = group.colorTheme || activeFolder.colorTheme || 'amber';
                   const isGrpEmerald = groupColorTheme === 'red';
                   const isGrpBlue = groupColorTheme === 'blue';
                   const isGrpPurple = groupColorTheme === 'purple';
                   const indicatorColor = isGrpEmerald ? 'bg-red-400' : isGrpBlue ? 'bg-blue-400' : isGrpPurple ? 'bg-purple-400' : 'bg-amber-400';
                   const borderHover = isGrpEmerald ? 'hover:border-red-400' : isGrpBlue ? 'hover:border-blue-400' : isGrpPurple ? 'hover:border-purple-400' : 'hover:border-amber-400';
                   const iconColor = isGrpEmerald ? 'text-red-500' : isGrpBlue ? 'text-blue-500' : isGrpPurple ? 'text-purple-500' : 'text-amber-500';

                   return (
                   <div key={gIdx} className="animate-fade-slide" style={{ animationDelay: `${gIdx * 100}ms` }}>
                     <div className="flex items-center gap-2 mb-3 md:mb-4 border-b border-slate-200 pb-2">
                       <div className={`w-1.5 h-4 rounded-full ${indicatorColor}`}></div>
                       <h3 className="text-xs md:text-sm font-black text-slate-800 uppercase tracking-wide">{group.name}</h3>
                     </div>
                     <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
                       {group.items.map((sub, idx) => (
                         <a 
                           key={idx} href={sub.url !== '#' ? sub.url : undefined} target={sub.url !== '#' ? "_blank" : undefined} rel={sub.url !== '#' ? "noopener noreferrer" : undefined} onClick={(e) => { if (sub.url === '#') e.preventDefault(); else handleLinkClick(e, sub.url); }}
                           className={`p-3 md:p-4 rounded-xl border transition-all flex flex-col items-center text-center gap-2 group ${sub.url === '#' ? 'bg-rose-50 border-rose-200 cursor-not-allowed' : `bg-white border-slate-200 hover:shadow-md active:scale-95 cursor-pointer ${borderHover}`}`}
                         >
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-transform ${sub.url === '#' ? 'bg-rose-100 text-rose-500' : `bg-slate-50 group-hover:scale-110 ${iconColor}`}`}>
                               <FileText size={20} fill="currentColor" className="opacity-80"/>
                            </div>
                            <span className={`text-[10px] md:text-xs font-bold ${sub.url === '#' ? 'text-rose-600' : 'text-slate-700'}`}>{sub.name}</span>
                            {sub.disabledText && <span className="text-[8px] text-rose-500 mt-1 leading-tight">{sub.disabledText}</span>}
                         </a>
                       ))}
                     </div>
                   </div>
                 )})}
               </div>
             ) : (
               <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
                 {activeFolder.subfolders.map((sub, idx) => (
                   <a 
                     key={idx} href={sub.url !== '#' ? sub.url : undefined} target={sub.url !== '#' ? "_blank" : undefined} rel={sub.url !== '#' ? "noopener noreferrer" : undefined} onClick={(e) => { if (sub.url === '#') e.preventDefault(); else handleLinkClick(e, sub.url); }}
                     className={`p-3 md:p-4 rounded-xl border transition-all flex flex-col items-center text-center gap-2 group ${sub.url === '#' ? 'bg-rose-50 border-rose-200 cursor-not-allowed' : 'bg-white border-slate-200 hover:border-amber-400 hover:shadow-md active:scale-95 cursor-pointer'}`}
                   >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-transform ${sub.url === '#' ? 'bg-rose-100 text-rose-500' : 'bg-slate-50 text-amber-500 group-hover:scale-110'}`}>
                         <FileText size={20} fill="currentColor" className="opacity-80"/>
                      </div>
                      <span className={`text-[10px] md:text-xs font-bold ${sub.url === '#' ? 'text-rose-600' : 'text-slate-700'}`}>{sub.name}</span>
                      {sub.disabledText && <span className="text-[8px] text-rose-500 mt-1 leading-tight">{sub.disabledText}</span>}
                   </a>
                 ))}
               </div>
             )}
           </div>
        </div>
      );
  }

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500 p-4 md:p-6">
      <div className="flex-none flex flex-col md:flex-row justify-between items-center bg-white p-4 md:p-6 rounded-2xl border border-amber-100 shadow-sm gap-4 mb-4 md:mb-6 z-30">
        <div className="w-full md:w-auto"><h2 className="text-sm md:text-2xl font-bold text-slate-800 flex items-center gap-2"><Archive className="text-amber-500" size={18} /> Brankas Aset</h2><p className="text-slate-500 text-[10px] md:text-sm mt-1">Secure Vault & Real Archives.</p></div>
        <div className="flex bg-slate-100 p-1 rounded-xl w-full md:w-auto">
            {['1 Month', '3 Months', 'All Time'].map(f => (<button key={f} onClick={() => setFilter(f)} className={`flex-1 md:flex-none px-2 md:px-4 py-1.5 md:py-2 rounded-lg text-[8px] md:text-xs font-bold transition-all active:scale-95 ${filter === f ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>{f}</button>))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto pr-2 pb-20 scrollbar-hide">
        <div className="space-y-6 md:space-y-8">
            {groups.map((group, gIdx) => (
                <div key={gIdx}>
                <div className="sticky top-0 bg-warm-bg/95 backdrop-blur-sm py-2 md:py-3 z-20 mb-2 border-b border-amber-100/50"><h3 className="text-[11px] md:text-sm font-black text-slate-400 uppercase tracking-widest ml-2">{group.month}</h3></div>
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
                    {group.folders.map((folder, idx) => (
                    <div key={idx} onClick={() => setActiveFolder(folder)} className="group bg-white p-4 md:p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-amber-200 transition-all cursor-pointer relative overflow-hidden active:scale-95">
                        <div className="absolute top-0 right-0 w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-slate-50 to-slate-100 rounded-bl-full -mr-6 -mt-6 md:-mr-8 md:-mt-8 group-hover:from-amber-50 group-hover:to-amber-100 transition-colors"></div>
                        <div className="flex justify-between items-start mb-3 md:mb-4 relative z-10">
                            <div className="w-8 h-8 md:w-10 md:h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform border border-amber-100"><Folder size={16} md:size={20} fill="currentColor" className="opacity-80" /></div>
                            <div className="text-[8px] md:text-[10px] font-bold text-slate-300 group-hover:text-amber-400">Vault</div>
                        </div>
                        <h3 className="font-bold text-slate-800 group-hover:text-amber-600 transition-colors truncate text-[11px] md:text-sm">{folder.name}</h3>
                        <p className="text-[10px] md:text-xs text-slate-400 mt-1 font-medium">{folder.count} items • {folder.date}</p>
                    </div>
                    ))}
                </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

// --- MONITORING VIEW ---
const MonitoringView = ({ user }) => {
  const [activeProject, setActiveProject] = useState('p1');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [openDetailIdx, setOpenDetailIdx] = useState(null); 
  const currentProject = MONITORING_PROJECTS.find(p => p.id === activeProject);
  const currentStats = MONITORING_STATS[activeProject] || [];
  const timeline = PROJECT_TIMELINE[activeProject] || [];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="bg-white p-4 md:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="w-full">
          <div className="flex items-center gap-3"><h2 className="text-sm md:text-2xl font-black text-slate-800 tracking-tight uppercase">PROGRESS REPORT</h2><span className="bg-amber-100 text-amber-700 text-[8px] md:text-[10px] font-bold px-2 py-1 rounded border border-amber-200 uppercase tracking-widest">Live</span></div>
          <div className="mt-2 relative inline-block w-full">
             <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center gap-2 text-[11px] md:text-lg font-bold text-slate-600 hover:text-amber-600 active:scale-95 transition-all">{currentProject.name} <ChevronDown size={14}/></button>
             {isDropdownOpen && (
               <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 p-1 z-50 animate-scale-in origin-top-left">
                 {MONITORING_PROJECTS.map(p => (<button key={p.id} onClick={() => { setActiveProject(p.id); setIsDropdownOpen(false); }} className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-amber-50 hover:text-amber-600 active:scale-95 transition-all ${activeProject === p.id ? 'bg-amber-50 text-amber-600' : 'text-slate-500'}`}>{p.name}</button>))}
               </div>
             )}
          </div>
        </div>
        <div className="text-right w-full md:w-auto"><p className="text-[8px] md:text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Target Deadline</p><div className="flex items-center justify-end gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100"><Clock size={12} className="text-rose-500"/><span className="text-[11px] md:text-sm font-bold text-slate-800">{currentProject.deadline}</span></div></div>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 md:p-6 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between"><h3 className="font-bold text-slate-800 text-[10px] md:text-sm uppercase tracking-wide">Team Output</h3><div className="text-[10px] md:text-xs text-slate-500 font-medium">Total Assets: {currentProject.totalAssets}</div></div>
        <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[600px]">
              <thead><tr className="bg-slate-50 text-slate-500 text-[10px] md:text-[10px] uppercase tracking-wider font-bold border-b border-slate-100"><th className="py-3 pl-4 md:pl-6">Personnel</th><th className="py-3 w-1/3">Event Status</th><th className="py-3 text-center">Done</th><th className="py-3 text-center">Wait</th><th className="py-3 text-center">Status</th></tr></thead>
              <tbody className="divide-y divide-slate-50">
              {currentStats.map((member, idx) => {
                  const progress = member.total > 0 ? (member.uploaded / member.total) * 100 : 0;
                  return (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors text-[10px] md:text-xs">
                      <td className="py-3 pl-4 md:pl-6"><div className="font-bold text-slate-800">{member.name}</div></td>
                      <td className="py-3 pr-4 md:pr-6">
                        <div className="flex items-center gap-2 md:gap-3 relative">
                          {progress === 0 ? (
                              <span className="text-[8px] md:text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded-md font-bold uppercase tracking-wider border border-slate-200 shadow-sm">None</span>
                          ) : progress >= 90 ? (
                              <span className="text-[8px] md:text-[10px] bg-emerald-50 text-emerald-600 px-2 py-1 rounded-md font-bold uppercase tracking-wider border border-emerald-200 shadow-sm">Done Upload</span>
                          ) : (
                              <span className="text-[8px] md:text-[10px] bg-amber-50 text-amber-600 px-2 py-1 rounded-md font-bold uppercase tracking-wider border border-amber-200 shadow-sm">On Process</span>
                          )}
                          
                          <div className="relative">
                              <button onClick={() => setOpenDetailIdx(openDetailIdx === idx ? null : idx)} className="text-[9px] md:text-[10px] text-slate-400 hover:text-amber-500 underline font-medium ml-1 cursor-pointer active:scale-95 transition-transform">View Detail</button>
                              {openDetailIdx === idx && (
                                  <div className="absolute top-full left-0 md:left-auto md:right-0 mt-2 bg-white border border-slate-200 shadow-xl rounded-xl p-3 z-50 w-40 md:w-48 animate-scale-in">
                                      <p className="text-[10px] font-bold text-slate-800 mb-2 border-b border-slate-100 pb-1">Event Status Check</p>
                                      <div className="space-y-2">
                                          <div className="flex justify-between items-center text-[10px]"><span className="text-slate-500 font-medium">Warm Up</span><span className="text-emerald-500 font-bold bg-emerald-50 px-1.5 rounded border border-emerald-100">Done</span></div>
                                          <div className="flex justify-between items-center text-[10px]"><span className="text-slate-500 font-medium">Launch Event</span><span className={`${progress >= 90 ? 'text-emerald-500 bg-emerald-50 border-emerald-100' : progress > 0 ? 'text-amber-500 bg-amber-50 border-amber-100' : 'text-slate-400 bg-slate-50 border-slate-100'} font-bold px-1.5 rounded border`}>{progress >= 90 ? 'Done' : progress > 0 ? 'Process' : 'None'}</span></div>
                                          <div className="flex justify-between items-center text-[10px]"><span className="text-slate-500 font-medium">First Sale</span><span className="text-slate-400 font-bold bg-slate-50 px-1.5 rounded border border-slate-100">None</span></div>
                                      </div>
                                  </div>
                              )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 text-center"><span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[8px] md:text-xs font-bold border border-slate-200">{member.uploaded}</span></td>
                      <td className="py-3 text-center"><span className={`px-1.5 py-0.5 rounded text-[8px] md:text-xs font-bold border ${member.pending > 0 ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>{member.pending}</span></td>
                      <td className="py-3 text-center"><span className={`text-[8px] md:text-[10px] font-bold uppercase tracking-wider ${member.status === 'Done' ? 'text-black' : member.status === 'Delayed' ? 'text-amber-600' : 'text-slate-500'}`}>{member.status}</span></td>
                  </tr>
                  )
              })}
              </tbody>
            </table>
        </div>
        <div className="p-4 md:p-8 border-t border-slate-100 bg-slate-50/30 overflow-x-auto">
            <h3 className="font-bold text-slate-800 text-[11px] md:text-sm uppercase tracking-wide mb-6">Project Timeline Tracker</h3>
            <div className="relative flex items-center justify-between px-2 min-w-[600px]">
                <div className="absolute left-4 right-4 top-[22px] md:top-[26px] h-0.5 bg-slate-300 -z-10"></div>
                {timeline.map((event, idx) => {
                    const isActive = event.status === 'active';
                    const isCompleted = event.status === 'completed';
                    return (
                        <div key={idx} className="flex flex-col items-center relative group cursor-default">
                            <div className={`mb-2 md:mb-3 px-2 py-0.5 rounded-full text-[8px] md:text-[10px] font-bold border transition-all ${isActive ? 'bg-amber-100 text-amber-700 border-amber-200 scale-110 shadow-sm' : 'bg-white text-slate-500 border-slate-200'}`}>{event.date}</div>
                            <div className="relative flex items-center justify-center">
                                {isActive && <div className="absolute w-6 h-6 md:w-8 md:h-8 bg-amber-400 rounded-full animate-breathing opacity-40"></div>}
                                <div className={`w-3 h-3 md:w-4 md:h-4 rounded-full border-2 z-10 relative transition-all duration-500 ${isActive ? 'bg-amber-500 border-white shadow-lg scale-125' : isCompleted ? 'bg-slate-900 border-slate-900' : 'bg-white border-slate-300'}`}></div>
                            </div>
                            <div className={`mt-2 md:mt-3 text-[10px] md:text-xs font-bold transition-all text-center max-w-[50px] md:max-w-none ${isActive ? 'text-amber-600 scale-110' : isCompleted ? 'text-slate-800' : 'text-slate-400'}`}>{event.title}</div>
                        </div>
                    );
                })}
            </div>
        </div>
      </div>
    </div>
  );
};

// --- LOGIN SCREEN ---
const LoginScreen = ({ onLogin }) => {
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showAdminOptions, setShowAdminOptions] = useState(false);

  const handleSubmit = (e) => { e.preventDefault(); if (!selectedProfile) return; if (!selectedProfile.requiresPassword) { onLogin(selectedProfile); return; } if (password === 'admin') { setShowAdminOptions(true); } else { setError('Access Denied: Invalid Key'); } };
  const handleAdminSelect = (roleType) => { onLogin({ ...selectedProfile, role: roleType }); };

  return (
    <div className="min-h-screen warm-bg flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-amber-200/20 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-slate-200/20 rounded-full blur-[120px]"></div>
      <div className="glass-panel p-8 md:p-10 rounded-3xl shadow-2xl w-full max-w-sm md:max-w-md relative z-10 text-center animate-fade-slide border-0">
        <h1 className="text-2xl md:text-3xl tracking-tight mb-1 text-slate-800"><span className="font-black">AKG-DF</span> <span className="font-light">System</span></h1><p className="text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-widest mb-8">Authorized Access Only</p>
        {!showAdminOptions ? (
            <div className="space-y-4 md:space-y-6 text-left">
            <div className="relative">
                <label className="text-[10px] md:text-[10px] font-black text-slate-400 ml-1 mb-2 block uppercase tracking-wider">Select Profile</label>
                <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="w-full bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between hover:border-amber-400 hover:shadow-lg active:scale-95 transition-all shadow-sm group">
                    {selectedProfile ? ( <div className="flex items-center gap-3 text-left w-full"><div className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-white bg-slate-900 text-xs md:text-sm font-bold shadow-md shrink-0">{selectedProfile.avatar}</div><div className="flex flex-col items-start"><span className="font-bold text-slate-800 text-xs md:text-sm block">{selectedProfile.name}</span><span className="text-[8px] md:text-[10px] text-slate-400 font-bold uppercase block">{selectedProfile.role}</span></div></div> ) : ( <span className="text-slate-400 text-xs md:text-sm font-bold pl-1">Choose Account...</span> )}
                    <ChevronDown size={18} className="text-slate-300 group-hover:text-amber-500 transition-colors ml-auto"/>
                </button>
                {isDropdownOpen && ( <div className="absolute top-full left-0 w-full mt-3 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden animate-scale-in origin-top p-1"> {PROFILES.map(p => ( <button key={p.id} onClick={() => { setSelectedProfile(p); setIsDropdownOpen(false); setPassword(''); setError(''); }} className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 active:scale-95 transition-all text-left rounded-xl group"> <div className="w-8 h-8 rounded-full flex items-center justify-center text-white bg-slate-900 text-[10px] md:text-xs font-bold group-hover:scale-110 transition-transform shrink-0"> {p.avatar} </div> <div className="flex flex-col items-start"> <p className="font-bold text-slate-700 text-[10px] md:text-xs">{p.name}</p> <p className="text-[10px] md:text-[10px] text-slate-400">{p.role}</p> </div> </button> ))} </div> )}
            </div>
            {selectedProfile?.requiresPassword && ( <div className="animate-fade-slide"> <label className="text-[10px] md:text-[10px] font-black text-slate-400 ml-1 mb-2 block uppercase tracking-wider">Secure Key</label> <div className="relative"> <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16}/> <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e)} className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 md:py-4 pl-10 md:pl-12 pr-4 text-xs md:text-sm font-bold text-slate-800 focus:outline-none focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-50 transition-all shadow-inner" placeholder="••••••••" /> </div> </div> )}
            {error && <p className="text-rose-500 text-[10px] md:text-xs font-bold text-center bg-rose-50 py-2 rounded-lg animate-pulse">{error}</p>}
            <button onClick={handleSubmit} disabled={!selectedProfile || (selectedProfile.requiresPassword && !password)} className="w-full bg-slate-900 text-white py-3 md:py-4 rounded-2xl font-bold shadow-xl shadow-slate-200 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:shadow-none transition-all mt-6 hover:bg-black text-xs md:text-sm flex items-center justify-center gap-2"> <Lock size={14} className={!selectedProfile?.requiresPassword ? "hidden" : ""}/> {selectedProfile?.requiresPassword ? 'Unlock Dashboard' : 'Enter Dashboard'} </button>
            </div>
        ) : (
            <div className="space-y-3 animate-scale-in">
                <h3 className="text-xs md:text-sm font-bold text-slate-500 mb-4">Select Admin View</h3>
                <button onClick={() => handleAdminSelect('System Owner')} className="w-full p-4 bg-slate-900 text-white rounded-2xl font-bold shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"><ShieldCheck size={16}/> <span className="text-[10px] md:text-xs">Sebagai Admin</span> <span className="opacity-50 font-normal text-[10px] md:text-[10px]">(Full Access)</span></button>
                <button onClick={() => handleAdminSelect('Director View')} className="w-full p-4 bg-white border border-slate-200 text-slate-800 rounded-2xl font-bold shadow-sm hover:border-amber-400 active:scale-95 transition-all flex items-center justify-center gap-2"><Eye size={16}/> <span className="text-[10px] md:text-xs">Sebagai Sub Admin</span> <span className="opacity-50 font-normal text-[10px] md:text-[10px]">(View Only)</span></button>
                <button onClick={() => setShowAdminOptions(false)} className="text-[10px] md:text-xs text-slate-400 hover:text-slate-800 font-bold mt-4">Back</button>
            </div>
        )}
        <p className="mt-8 md:mt-10 text-[10px] md:text-[10px] text-slate-300 font-bold uppercase tracking-widest">Build by Nando</p>
      </div>
    </div>
  );
};

// --- MY TASKS VIEW ---
const MyTasksView = () => {
  const [tasks, setTasks] = useState(SALES_TASKS);
  
  const toggleTask = (id) => { 
    if (navigator.vibrate) navigator.vibrate(50); // Tactile feedback
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: t.status === 'done' ? 'pending' : 'done' } : t)); 
  };

  return (
    <div className="space-y-4 md:space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 md:p-6 rounded-2xl border border-slate-200 shadow-sm gap-3 md:gap-4">
        <div className="w-full md:w-auto"><h2 className="text-sm md:text-2xl font-bold text-slate-800 flex items-center gap-2"><CheckSquare className="text-amber-500" size={18} /> My Tasks</h2><p className="text-slate-500 text-[10px] md:text-sm mt-1">Sales & Design Requests To-Do.</p></div>
        <div className="flex gap-2 text-[10px] md:text-sm font-bold w-full md:w-auto"><span className="text-amber-700 bg-amber-50 px-2 md:px-3 py-1 rounded-lg border border-amber-200 flex-1 md:flex-none text-center">{tasks.filter(t => t.status === 'done').length} Done</span><span className="text-slate-500 bg-white px-2 md:px-3 py-1 rounded-lg border border-slate-200 flex-1 md:flex-none text-center">{tasks.length} Total</span></div>
      </div>
      <div className="grid grid-cols-1 gap-2 md:gap-3">
        {tasks.map(task => (
          <div key={task.id} onClick={() => toggleTask(task.id)} className={`p-3 md:p-4 bg-white rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between cursor-pointer transition-all hover:shadow-md active:scale-[0.98] gap-3 ${task.status === 'done' ? 'border-slate-100 opacity-60' : 'border-slate-200'}`}>
            <div className="flex items-center gap-3 w-full md:w-auto"><div className={`w-5 h-5 md:w-6 md:h-6 rounded-lg border-2 flex-shrink-0 flex items-center justify-center transition-colors ${task.status === 'done' ? 'bg-amber-400 border-amber-400 text-white' : 'border-slate-300'}`}>{task.status === 'done' && <CheckCircle2 size={12} fill="currentColor" className="text-white"/>}</div><div className="overflow-hidden"><p className={`font-bold text-[10px] md:text-sm truncate ${task.status === 'done' ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{task.text}</p><p className="text-[8px] md:text-[10px] text-slate-400 font-medium uppercase tracking-wider mt-0.5 truncate">{task.project}</p></div></div>
            <div className="flex items-center justify-between w-full md:w-auto gap-3 pl-8 md:pl-0"><span className={`text-[8px] md:text-[10px] font-bold px-2 py-0.5 md:px-3 md:py-1 rounded-lg uppercase tracking-wider ${task.status === 'done' ? 'bg-slate-100 text-slate-500' : 'bg-amber-50 text-amber-600'}`}>{task.due}</span><button className="p-1 md:p-2 hover:bg-amber-50 rounded-full text-slate-400 hover:text-amber-600 transition-colors"><ArrowRight size={14}/></button></div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- CALENDAR VIEW ---
const CalendarView = ({ onNewRequest }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [activeNote, setActiveNote] = useState(null);
  const [monthIndex, setMonthIndex] = useState(3); // Default: 3 = April
  
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const currentMonthName = months[monthIndex % 12];
  const currentYear = 2026 + Math.floor(monthIndex / 12);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 h-full">
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 md:p-6 rounded-2xl border border-slate-200 shadow-sm relative z-20 gap-4">
        <div className="w-full md:w-auto">
          <h2 className="text-sm md:text-2xl font-bold text-slate-800 flex items-center gap-2"><CalendarIcon className="text-amber-500" size={18} /> Production Calendar</h2>
          <div className="flex items-center gap-4 mt-2 bg-stone-50 border border-stone-200 px-2 py-1 rounded-lg inline-flex w-full md:w-auto justify-between md:justify-start">
             <button onClick={() => setMonthIndex(prev => Math.max(0, prev - 1))} className="p-1 hover:bg-white hover:shadow-sm active:scale-90 rounded text-slate-400 hover:text-slate-800 transition-all"><ChevronLeft size={16}/></button><p className="text-slate-800 text-[10px] md:text-sm font-bold text-center select-none">{currentMonthName} {currentYear}</p><button onClick={() => setMonthIndex(prev => prev + 1)} className="p-1 hover:bg-white hover:shadow-sm active:scale-90 rounded text-slate-400 hover:text-slate-800 transition-all"><ChevronRight size={16}/></button>
          </div>
        </div>
        <div className="relative w-full md:w-auto">
            <button onClick={() => setShowMenu(!showMenu)} className="bg-amber-400 text-white px-3 md:px-5 py-2 md:py-2.5 rounded-xl font-bold text-[10px] md:text-xs flex items-center justify-center gap-2 hover:bg-amber-500 active:scale-95 transition-all shadow-lg shadow-amber-200 w-full md:w-auto"><PlusCircle size={14}/> Action</button>
            {showMenu && ( <div className="absolute top-full right-0 mt-2 w-full md:w-40 bg-white rounded-xl shadow-xl border border-slate-100 p-1 z-50 animate-scale-in origin-top-right"> {['Add Request', 'Edit Event', 'Reminder'].map((item, i) => (<button key={i} onClick={() => { setShowMenu(false); if(item === 'Add Request' && onNewRequest) onNewRequest(); }} className="w-full text-left px-3 py-2 text-[10px] md:text-xs font-bold text-slate-600 hover:bg-amber-50 hover:text-amber-600 rounded-lg transition-colors flex items-center gap-2">{item === 'Reminder' ? <MessageCircle size={12}/> : <PlusCircle size={12}/>} {item}</button>))} </div> )}
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[500px] overflow-x-auto pb-20">
        <div className="min-w-[350px] md:min-w-[600px]">
            <div className="grid grid-cols-7 border-b border-slate-200 bg-stone-50">{weekDays.map(d => (<div key={d} className="py-2 md:py-4 text-center text-[8px] md:text-xs font-extrabold text-slate-400 uppercase tracking-widest">{d}</div>))}</div>
            <div className="grid grid-cols-7 auto-rows-[80px] md:auto-rows-[120px] divide-x divide-y divide-slate-100">
            {[1,2,3,4].map(pad => <div key={`pad-${pad}`} className="bg-slate-50/30"></div>)}
            {days.map(day => {
                const events = CALENDAR_EVENTS.filter(e => e.date === day && e.month === (monthIndex % 12));
                const reminder = CALENDAR_REMINDERS.find(r => r.date === day && r.month === (monthIndex % 12));
                const isToday = day === 26 && (monthIndex % 12) === 3; // Mocking today to match the prompt's active context if needed, but keeping dynamic style
                return (
                <div key={day} className={`p-1 md:p-2 relative group transition-colors ${isToday ? 'bg-amber-50/30' : 'hover:bg-slate-50'}`}>
                    <div className="flex justify-between items-start">
                        <span className={`text-[10px] md:text-sm font-bold w-5 h-5 md:w-7 md:h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-amber-500 text-white shadow-md shadow-amber-200' : 'text-slate-700'}`}>{day}</span>
                        {reminder && ( <button onClick={() => setActiveNote(activeNote === reminder.id ? null : reminder.id)} className="text-amber-300 hover:text-amber-500 active:scale-90 transition-all"><MessageCircle size={10} md:size={14} fill="currentColor"/></button> )}
                    </div>
                    {activeNote === reminder?.id && ( <div className="absolute top-8 left-1/2 -translate-x-1/2 w-32 md:w-48 bg-slate-800 text-white p-2 md:p-3 rounded-xl text-[6px] md:text-[10px] leading-tight z-50 shadow-xl animate-scale-in border border-slate-700"><div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45 border-t border-l border-slate-700"></div><p className="font-medium text-slate-200 relative z-10">{reminder.note}</p></div> )}
                    <div className="mt-1 md:mt-2 space-y-1">{events.map(ev => (<div key={ev.id} className={`text-[6px] md:text-[10px] px-1 md:px-2 py-0.5 md:py-1.5 rounded-lg border font-bold truncate cursor-pointer hover:scale-105 active:scale-95 transition-transform shadow-sm ${ev.color}`}>{ev.title}</div>))}</div>
                </div>
                )
            })}
            </div>
        </div>
      </div>
    </div>
  );
};

// --- NEW REQUEST MODAL ---
const NewRequestModal = ({ onClose, onSubmit }) => {
    const [title, setTitle] = useState('');
    const [selectedBrand, setSelectedBrand] = useState(BRANDS_OPTIONS[0].name);
    const [selectedType, setSelectedType] = useState(DESIGN_TYPES[0]);
    const [date, setDate] = useState('');
    const [loading, setLoading] = useState(false);
    
    const handleSubmit = () => { if (!title || !date) return; setLoading(true); setTimeout(() => { onSubmit({ title, brands: [selectedBrand], date, type: selectedType }); setLoading(false); }, 800); };
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-scale-in relative m-4">
              <div className="p-4 md:p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50"><div><h3 className="text-sm md:text-lg font-black text-slate-800">New Request</h3><p className="text-[10px] md:text-xs text-slate-500 font-bold">Create a new design task.</p></div><button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors"><X size={18}/></button></div>
              <div className="p-4 md:p-6 space-y-4 md:space-y-5">
                  <div><label className="text-[10px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 md:mb-2 block">Project Title</label><input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 md:py-3 text-[11px] md:text-sm font-bold text-slate-700 outline-none focus:border-amber-400 focus:bg-white transition-all" placeholder="e.g. Realme C85 Launch Banner..." autoFocus /></div>
                  <div><label className="text-[10px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 md:mb-2 block">Brand Target</label><div className="flex flex-wrap gap-2">{BRANDS_OPTIONS.slice(0, 4).map(b => (<button key={b.id} onClick={() => setSelectedBrand(b.name)} className={`px-2 md:px-3 py-1.5 md:py-2 rounded-lg text-[10px] md:text-xs font-bold border active:scale-95 transition-all ${selectedBrand === b.name ? 'bg-amber-50 border-amber-500 text-amber-700' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}>{b.name}</button>))}</div></div>
                  <div className="grid grid-cols-2 gap-3 md:gap-4">
                      <div><label className="text-[10px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 md:mb-2 block">Deadline</label><div className="relative"><CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14}/><input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 md:py-3 text-[11px] md:text-xs font-bold text-slate-700 outline-none focus:border-amber-400 transition-all" /></div></div>
                      <div><label className="text-[10px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 md:mb-2 block">Format</label><select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 md:py-3 text-[11px] md:text-xs font-bold text-slate-700 outline-none focus:border-amber-400 transition-all appearance-none">{DESIGN_TYPES.map(t => <option key={t}>{t}</option>)}</select></div>
                  </div>
              </div>
              <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex gap-3"><button onClick={onClose} className="flex-1 py-2 md:py-3 rounded-xl text-[10px] md:text-xs font-bold text-slate-500 hover:bg-slate-200 active:scale-95 transition-all">Cancel</button><button onClick={handleSubmit} disabled={!title || !date || loading} className="flex-[2] bg-slate-900 text-white py-2 md:py-3 rounded-xl text-[10px] md:text-xs font-bold hover:bg-black active:scale-[0.98] transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2">{loading ? <Loader2 size={14} className="animate-spin"/> : <Send size={14}/>} Submit Request</button></div>
          </div>
      </div>
    );
};

// --- MAIN APP COMPONENT ---
export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Bypass login per request
  const [currentUser, setCurrentUser] = useState(PROFILES[0]); // Default to Super Admin
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showNewRequestModal, setShowNewRequestModal] = useState(false);
  const [showWelcomeNotif, setShowWelcomeNotif] = useState(true); 
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLogOutOpen, setIsLogOutOpen] = useState(false); 
  const [activeAssetFolder, setActiveAssetFolder] = useState(null); // LIFTED STATE FOR ASSETS FOLDER
  const [sortOrder, setSortOrder] = useState('Recent');
  const logOutTimeoutRef = useRef(null);
  
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab) setActiveTab(tab);
    const handlePopState = (event) => { setActiveTab(event.state?.tab || 'dashboard'); };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleNavigate = (newTab) => { 
    if (newTab === activeTab) return; 
    window.history.pushState({ tab: newTab }, '', `?tab=${newTab}`); 
    setActiveTab(newTab); 
    setIsSidebarOpen(false); 
    if (newTab !== 'assets-brand') setActiveAssetFolder(null); 
  };
  
  const handleGoToTask = (folderId) => {
    setShowWelcomeNotif(false);
    handleNavigate('assets-brand');
    const targetFolder = ASSET_FOLDERS.find(f => f.id === folderId);
    if (targetFolder) setActiveAssetFolder(targetFolder);
  };
  
  // QUEUE LIST - ALL DONE & HIGH PRIORITY
  const [requests, setRequests] = useState([
    { id: 34, title: 'NEW NAD C100 Series', brand: 'Realme', requester: 'System', status: 'Done', priority: 'High', date: 'Apr 28 2026' },
    { id: 33, title: 'NEW realme T500 Assets', brand: 'Realme/AIOT', requester: 'System', status: 'Done', priority: 'High', date: 'Apr 27 2026' },
    { id: 32, title: 'UPDATE C100 Series', brand: 'Realme', requester: 'System', status: 'Done', priority: 'High', date: 'Apr 24 2026' },
    { id: 31, title: 'NEW C100 Series SKU update', brand: 'Realme', requester: 'System', status: 'Done', priority: 'High', date: 'Apr 20 2026' },
    { id: 30, title: 'Upload New Exposure Warm Up', brand: 'Realme/AIOT', requester: 'System', status: 'Done', priority: 'High', date: 'Feb 24 2026' },
    { id: 29, title: 'Upload New Banner Stores', brand: 'Realme', requester: 'System', status: 'Done', priority: 'High', date: 'Feb 24 2026' },
    { id: 28, title: 'Upload New Live Background Payday', brand: 'Realme', requester: 'System', status: 'Done', priority: 'High', date: 'Feb 24 2026' },
    { id: 27, title: 'Upload New NAD Warm Up', brand: 'Realme', requester: 'System', status: 'Done', priority: 'High', date: 'Feb 24 2026' },
    { id: 26, title: 'Upload New LP Warm Up', brand: 'Realme', requester: 'System', status: 'Done', priority: 'High', date: 'Feb 24 2026' },
    { id: 25, title: 'Upload New SKU Flash Sale', brand: 'Realme/AIOT', requester: 'System', status: 'Done', priority: 'High', date: 'Feb 24 2026' },
    { id: 24, title: 'Upload New SKU General', brand: 'Realme/AIOT', requester: 'System', status: 'Done', priority: 'High', date: 'Feb 24 2026' },
    { id: 22, title: 'Upload 16 Series Official Store Assets', brand: 'Realme', requester: 'System', status: 'Done', priority: 'High', date: 'Feb 11 2026' },
    { id: 21, title: 'Upload 16 Series SKU Angle', brand: 'Realme', requester: 'System', status: 'Done', priority: 'High', date: 'Feb 11 2026' },
    { id: 20, title: 'Update 16 Series Exposure Akulaku', brand: 'Akulaku', requester: 'System', status: 'Done', priority: 'High', date: 'Feb 11 2026' },
    { id: 19, title: 'Upload Note 80 Assets (Official Store)', brand: 'Realme', requester: 'System', status: 'Done', priority: 'High', date: 'Feb 03 2026' },
    { id: 18, title: 'Upload SKU Angle & Teasing KV', brand: 'Realme', requester: 'System', status: 'Done', priority: 'High', date: 'Feb 03 2026' },
    { id: 17, title: 'Update Note 80 Auth Store', brand: 'Realme', requester: 'System', status: 'Done', priority: 'High', date: 'Feb 03 2026' },
    { id: 16, title: 'Exposure Warm UP - Akulaku', brand: 'Akulaku', requester: 'Defrin', status: 'Done', priority: 'High', date: 'Feb 03 2026' },
    { id: 15, title: 'AKASO Valentine Banner', brand: 'Akaso', requester: 'Tasya', status: 'Done', priority: 'High', date: 'Jan 29 2026' },
    { id: 14, title: 'AKASO Lunar Year Banner', brand: 'Akaso', requester: 'Defrin', status: 'Done', priority: 'High', date: 'Jan 29 2026' },
    { id: 13, title: 'AKASO 2.2 Banner', brand: 'Akaso', requester: 'Rizka', status: 'Done', priority: 'High', date: 'Jan 29 2026' },
    { id: 12, title: 'Upload LP Akulaku (OS)', brand: 'Akulaku', requester: 'Defrin', status: 'Done', priority: 'High', date: 'Jan 23 2026' },
    { id: 11, title: 'Update Banner Shopee (AU)', brand: 'Shopee', requester: 'Rizka', status: 'Done', priority: 'High', date: 'Jan 23 2026' },
    { id: 10, title: 'Check Banner TikTok (OP)', brand: 'TikTok', requester: 'Tasya', status: 'Done', priority: 'High', date: 'Jan 24 2026' },
    { id: 9, title: 'Restock Content TikTok (OS)', brand: 'TikTok', requester: 'Cecep', status: 'Done', priority: 'High', date: 'Jan 25 2026' },
    { id: 8, title: 'Briefing Banner Lazada (AU)', brand: 'Lazada', requester: 'Defrin', status: 'Done', priority: 'High', date: 'Jan 25 2026' },
    { id: 7, title: 'Update Banner Tokopedia (OP)', brand: 'Tokopedia', requester: 'Rizka', status: 'Done', priority: 'High', date: 'Jan 26 2026' },
    { id: 6, title: 'Banner Blibli Gadget Fair', brand: 'Blibli', requester: 'Defrin', status: 'Done', priority: 'High', date: 'Jan 23 2026' },
    { id: 5, title: 'Flash Sale Instagram Story', brand: 'Akulaku', requester: 'Defrin', status: 'Done', priority: 'High', date: 'Jan 23 2026' },
    { id: 4, title: 'Weekly Recap Video', brand: 'Akaso', requester: 'Defrin', status: 'Done', priority: 'High', date: 'Jan 23 2026' },
    { id: 3, title: 'KOL Outreach Kit', brand: 'KOL', requester: 'Cecep', status: 'Done', priority: 'High', date: 'Jan 23 2026' },
    { id: 2, title: 'Live Stream Banner - Big Sale', brand: 'TikTok', requester: 'Tasya', status: 'Done', priority: 'High', date: 'Jan 23 2026' },
    { id: 1, title: 'Akaso Brave 7 - Summer Promo', brand: 'Akaso', requester: 'Tasya', status: 'Done', priority: 'High', date: 'Jan 23 2026' },
  ]);
  
  const [liveActivities, setLiveActivities] = useState([
    { text: "System: NEW 6.6 MID YEAR BIG SALE Uploaded", time: "Just now", type: 'upload' },
    { text: "System: NEW NAD C100 Series Assets Uploaded", time: "1m ago", type: 'upload' },
    { text: "LIVE: UPDATE C100 Series & All SKU Link Ready", time: "2m ago", type: 'live' },
    { text: "System: NEW realme T500 Assets Uploaded", time: "3m ago", type: 'upload' },
    { text: "System: New Update for March Assets added", time: "1h ago", type: 'upload' }
  ]);

  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  
  const filteredRequests = (currentUser?.role === 'admin' || currentUser?.role === 'manager' ? requests : requests.filter(r => currentUser?.brands?.includes(r.brand) || true))
    .sort((a, b) => sortOrder === 'Recent' ? b.id - a.id : a.id - b.id);
    
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const paginatedRequests = filteredRequests.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const stats = { pending: filteredRequests.filter(r => r.status === 'Pending').length, total: filteredRequests.length };

  const handleLogin = (user) => { setCurrentUser(user); setIsAuthenticated(true); };
  const handleLogout = () => { setIsAuthenticated(false); setCurrentUser(null); };
  
  const handleNewRequestSubmit = (data) => {
    const newReq = { id: requests.length + 1, title: data.title, brand: data.brands[0], requester: currentUser.name, status: 'Pending', priority: 'High', date: data.date || 'TBD', format: 'General' };
    setRequests(prev => [newReq, ...prev]);
    setLiveActivities(prev => [{ text: `${currentUser.name} requested '${data.title}'`, time: 'Just now', type: 'request' }, ...prev]);
    setNotifications(prev => [{ id: Date.now(), text: `New request: ${data.title}`, time: 'Just now', read: false }, ...prev]);
    setShowNewRequestModal(false);
  };
  
  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleQuickFind = (item) => {
    setSearchQuery(item);
    setSearchFocused(false);
  };

  const handleLogOutEnter = () => { clearTimeout(logOutTimeoutRef.current); setIsLogOutOpen(true); };
  const handleLogOutLeave = () => { logOutTimeoutRef.current = setTimeout(() => { setIsLogOutOpen(false); }, 300); };
  const SidebarItem = ({ icon: Icon, label, id, active, badge }) => ( <button onClick={() => handleNavigate(id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 active:scale-[0.98] group relative ${active ? 'bg-amber-400 text-white font-bold shadow-md shadow-amber-200' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 font-medium'}`}> <Icon size={18} className={`relative z-10 ${active ? 'text-white' : 'text-slate-400 group-hover:text-slate-600 transition-colors'}`} /> <span className="relative z-10">{label}</span> {badge > 0 && ( <span className={`ml-auto text-[9px] font-bold px-1.5 rounded-full min-w-[16px] h-4 flex items-center justify-center shadow-sm ${active ? 'bg-white text-amber-500' : 'bg-slate-900 text-white'}`}> {badge} </span> )} </button> );

  const renderContent = () => {
    switch(activeTab) {
      case 'monitoring': return <MonitoringView user={currentUser} />;
      case 'calendar': return <CalendarView onNewRequest={() => setShowNewRequestModal(true)} />;
      case 'tasks': return <MyTasksView />;
      case 'brankas': return <BrankasView />;
      case 'assets-brand': return <AssetsView activeFolder={activeAssetFolder} setActiveFolder={setActiveAssetFolder} />;
      case 'requests': return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full animate-in fade-in duration-500">
          <div className="p-4 md:p-6 border-b border-slate-100 flex justify-between items-center"><div><h3 className="font-bold text-slate-800 text-sm md:text-lg flex items-center gap-2"><FolderOpen className="text-amber-500" size={18}/> Full Queue List</h3><p className="text-[10px] md:text-xs text-slate-500 mt-1">Sorted by newest requests.</p></div><button className="bg-white border border-slate-200 text-slate-600 px-3 py-1.5 md:px-4 md:py-2 rounded-xl text-[10px] md:text-xs font-bold flex items-center gap-2 hover:bg-slate-50 active:scale-95 transition-all"><Filter size={12}/> Filters</button></div>
          <RequestTable requests={paginatedRequests} />
          <PaginationControls currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} totalItems={filteredRequests.length} itemsPerPage={itemsPerPage} />
        </div>
      );
      case 'dashboard':
      default: return (
        <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-20 md:pb-0">
          <div className="bg-white rounded-2xl p-4 md:p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left"><h2 className="text-sm md:text-xl font-bold text-slate-800">Welcome back, {currentUser.name}! 🌙</h2><p className="text-slate-500 text-[10px] md:text-sm mt-1">Ready to create something amazing today?</p></div>
            <button onClick={() => setShowNewRequestModal(true)} className="bg-slate-900 hover:bg-black text-white px-4 md:px-5 py-2 md:py-2.5 rounded-xl font-bold text-[10px] md:text-xs shadow-lg shadow-slate-200 transition-all flex items-center gap-2 active:scale-95 hover:-translate-y-1 w-full md:w-auto justify-center"><PlusCircle size={14}/> New Request</button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
            {[ { label: 'Total Queue', val: stats.total, icon: Layers, color: 'text-slate-800', bg: 'bg-white' }, { label: 'Pending', val: stats.pending, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' }, { label: 'In Production', val: filteredRequests.filter(r => r.status === 'In Progress').length, icon: Zap, color: 'text-amber-500', bg: 'bg-stone-50' }, { label: 'Completed', val: filteredRequests.filter(r => r.status === 'Done').length, icon: CheckCircle2, color: 'text-slate-800', bg: 'bg-stone-100' }, ].map((stat, idx) => ( <div key={idx} className="bg-white p-4 md:p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300"> <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2"> <div> <p className="text-slate-400 text-[10px] md:text-[11px] font-bold uppercase tracking-wider mb-1 md:mb-2">{stat.label}</p> <h3 className="text-xl md:text-3xl font-black text-slate-800">{stat.val}</h3> </div> <div className={`p-2 md:p-3 rounded-xl ${stat.bg} ${stat.color} self-end md:self-start`}><stat.icon size={18} md:size={22} /></div> </div> </div> ))}
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 md:p-6 border-b border-slate-100 flex justify-between items-center">
               <h3 className="font-bold text-slate-800 text-[10px] md:text-base flex items-center gap-2"><LayoutDashboard size={14} className="text-amber-500"/> Active Workflow</h3>
               <button onClick={() => setSortOrder(prev => prev === 'Recent' ? 'Oldest' : 'Recent')} className="text-slate-400 hover:text-amber-600 text-[10px] md:text-xs font-bold transition-colors select-none">Sort by {sortOrder}</button>
            </div>
            <RequestTable requests={paginatedRequests} />
            <PaginationControls currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} totalItems={filteredRequests.length} itemsPerPage={itemsPerPage} />
          </div>
        </div>
      );
    }
  }

  return (
    <div className="min-h-screen warm-bg text-slate-600 font-sans selection:bg-amber-100 selection:text-amber-900 overflow-hidden flex flex-col">
      <style>{customStyles}</style>

      {/* --- PROTOTYPE WELCOME NOTIFICATION POPUP --- */}
      {showWelcomeNotif && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white max-w-xl w-full max-h-[85vh] rounded-3xl shadow-2xl flex flex-col animate-scale-in relative border border-slate-200 overflow-hidden">
             
             {/* Close Button X */}
             <button onClick={() => setShowWelcomeNotif(false)} className="absolute top-4 right-4 p-2 bg-white/50 backdrop-blur-sm hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-800 transition-colors shadow-sm active:scale-90 z-20">
               <X size={16} strokeWidth={3} />
             </button>

             <div className="flex-1 overflow-y-auto modal-scroll bg-slate-50/50">
               <div className="p-6 md:p-8 flex flex-col relative">
                  {/* Visual Header */}
                  <div className="relative w-32 h-32 md:w-40 md:h-40 mx-auto mb-6 animate-float z-10 mt-4">
                    <div className="absolute inset-0 bg-blue-200/30 rounded-2xl blur-xl animate-pulse"></div>
                    <img src="/brand/previewtask.png" alt="Update Assets" className="w-full h-full object-cover rounded-2xl shadow-lg border border-slate-100 relative z-10 bg-white" onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/150/fde68a/f59e0b?text=ASSETS'; }} />
                  </div>
                  
                  {/* TITLE SECTION */}
                  <div className="relative z-10 flex flex-col items-center justify-center mb-6 text-center border-b border-slate-200 pb-4">
                    <h3 className="font-black text-slate-800 text-xl md:text-2xl mb-2 tracking-tight uppercase">P4 SERIES UPDATE</h3>
                    <p className="text-[11px] md:text-xs text-slate-600 font-medium">Progress Update Asset P4 Series.</p>
                  </div>

                  {/* P4 Series Warm Up SECTION (RED) */}
                  <div className="mb-6 bg-emerald-50/50 p-4 md:p-5 rounded-2xl border border-red-100 relative overflow-hidden shadow-sm">
                    <div className="absolute -right-4 -top-4 text-red-300 opacity-50"><Sparkles size={64} /></div>
                    <h4 className="font-black text-emerald-700 text-sm md:text-base border-b border-red- pb-2 mb-3 tracking-wide flex items-center gap-2 relative z-10">
                       <ShoppingBag size={16} /> P4 SERIES
                    </h4>
                    
                    <div className="space-y-4 text-left w-full relative z-10">
                      {ASSET_FOLDERS.find(f => f.id === 1008)?.groups.map((group, gIdx) => (
                        <div key={gIdx}>
                          <h5 className="font-bold text-[10px] md:text-xs mb-2 tracking-wide opacity-90 uppercase text-emerald-700">{group.name}</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                            {group.items.map((item, iIdx) => (
                               <button key={iIdx} onClick={() => window.open(item.url, '_blank')} className="bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] md:text-[11px] py-2.5 px-3 rounded-lg font-bold flex justify-between items-center transition-all shadow-sm active:scale-95 group">
                                 <span className="truncate mr-2 text-left">{item.name}</span> <ArrowUpRight size={12} className="flex-shrink-0 group-hover:scale-110 transition-transform opacity-70"/>
                               </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>


                  
                  {/* Footer Button */}
                  <div className="mt-2 pt-2 border-t border-slate-200/60 relative z-10">
                      <button 
                        onClick={() => { handleNavigate('assets-brand'); setShowWelcomeNotif(false); }}
                        className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold shadow-lg hover:bg-black transition-all hover:-translate-y-0.5 active:scale-95 text-xs flex items-center justify-center gap-2"
                      >
                        Buka di Assets Database <FolderOpen size={14} className="text-amber-400"/>
                      </button>
                  </div>

               </div>
             </div>
          </div>
        </div>
      )}

      {/* --- HEADER & SIDEBAR STRUCTURE --- */}
      <div className="flex-shrink-0 z-50 bg-white shadow-sm">
        <header className="h-14 md:h-16 flex items-center justify-between px-4 md:px-6 border-b border-slate-100 relative">
           <div className="flex items-center gap-3 md:gap-4">
             <button onClick={() => window.history.back()} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 md:hidden active:scale-90 transition-transform"><ArrowLeft size={18} /></button>
             <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-slate-400 hover:text-slate-800 hidden lg:block active:scale-90 transition-transform"><Menu size={20} /></button>
             <h1 className="text-sm md:text-lg font-black text-slate-800 tracking-tight block">AKG-DF <span className="text-slate-300 mx-1 md:mx-2 font-thin">|</span> <span className="font-light text-slate-500 text-[10px] md:text-base">Design Tools</span></h1>
           </div>
           <div className="flex items-center gap-3 md:gap-4">
             <div className="relative hidden md:block group">
               <Search className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${searchFocused ? 'text-amber-500' : 'text-slate-400'}`} size={16} />
               <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search assets (e.g. C100)..." onFocus={() => setSearchFocused(true)} onBlur={() => setTimeout(() => setSearchFocused(false), 200)} className="bg-slate-50 border border-slate-200 rounded-full pl-10 pr-4 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-100 focus:border-amber-300 w-64 transition-all" />
               
               {/* DYNAMIC SEARCH GIMMICK */}
               {searchFocused && (
                 <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 p-2 animate-scale-in origin-top-left z-50">
                   {!searchQuery ? (
                     <>
                       <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest px-2 mb-1">Quick Find</p>
                       {['C100', 'Design Banner', 'Design SKU'].map(item => (
                         <button key={item} onMouseDown={() => handleQuickFind(item)} className="w-full text-left px-3 py-2 text-xs font-bold text-slate-600 hover:bg-amber-50 hover:text-amber-600 rounded-lg transition-colors flex items-center gap-2 active:scale-95">
                           <Search size={12} /> {item}
                         </button>
                       ))}
                     </>
                   ) : (
                     <>
                       <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest px-2 mb-1">Search Results</p>
                       {ASSET_FOLDERS.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase())).map(f => (
                         <button key={f.id} onMouseDown={() => { handleGoToTask(f.id); setSearchFocused(false); }} className="w-full text-left px-3 py-2 text-xs font-bold text-slate-600 hover:bg-amber-50 hover:text-amber-600 rounded-lg transition-colors flex items-center gap-2 active:scale-95 mb-1">
                           <FolderOpen size={12} className="text-amber-500" /> <span className="truncate">{f.name}</span>
                         </button>
                       ))}
                       {ASSET_FOLDERS.flatMap(f => f.groups ? f.groups.flatMap(g => g.items) : f.subfolders || [])
                         .filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
                         .slice(0, 3)
                         .map((item, idx) => (
                           <a key={`item-${idx}`} href={item.url !== '#' ? item.url : undefined} target="_blank" rel="noopener noreferrer" className="w-full text-left px-3 py-2 text-xs font-bold text-slate-500 hover:bg-amber-50 hover:text-amber-600 rounded-lg transition-colors flex items-center gap-2 active:scale-95 mb-1">
                             <ExternalLink size={12} className="text-amber-400"/> <span className="truncate">{item.name}</span>
                           </a>
                       ))}
                       {/* Fallback Search All */}
                       <button onMouseDown={() => handleQuickFind(searchQuery)} className="w-full text-left px-3 py-2 text-xs font-bold text-slate-600 hover:bg-amber-50 hover:text-amber-600 rounded-lg transition-colors flex flex-col gap-1 active:scale-95 mt-1 border-t border-slate-50 pt-2">
                         <span className="flex items-center gap-2"><Search size={12} /> Search all for "{searchQuery}"</span>
                       </button>
                     </>
                   )}
                 </div>
               )}
             </div>
             
             <div className="h-8 w-[1px] bg-slate-200 mx-2 hidden md:block"></div>
             <div className="relative">
               <button onClick={() => setShowNotifications(!showNotifications)} className={`p-1.5 md:p-2 rounded-full relative group transition-all active:scale-90 ${showNotifications ? 'bg-amber-50 text-amber-600' : 'hover:bg-slate-50 text-slate-400 hover:text-amber-500'}`}> <Bell size={18} md:size={20} /> {notifications.some(n => !n.read) && <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 md:w-2 md:h-2 bg-amber-500 rounded-full border border-white animate-pulse"></span>} </button>
               {showNotifications && ( <div className="absolute top-full right-0 mt-3 w-64 md:w-80 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 animate-scale-in origin-top-right z-50"> <div className="px-4 py-3 border-b border-slate-50 flex justify-between items-center"> <span className="font-bold text-[10px] md:text-xs text-slate-800">Notifications</span> <button onClick={markAllRead} className="text-[10px] md:text-[10px] text-amber-600 font-bold hover:underline active:scale-95 transition-all">Read All</button> </div> <div className="max-h-60 overflow-y-auto modal-scroll"> {notifications.map(notif => ( <div key={notif.id} className={`px-4 py-3 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors cursor-pointer active:bg-slate-100 ${!notif.read ? 'bg-amber-50/30' : ''}`}> <p className={`text-[10px] md:text-xs ${!notif.read ? 'font-bold text-slate-800' : 'font-medium text-slate-600'}`}>{notif.text}</p> <p className="text-[8px] md:text-[8px] text-slate-400 mt-1">{notif.time}</p> </div> ))} </div> </div> )}
             </div>
             <div className="group relative" onMouseEnter={handleLogOutEnter} onMouseLeave={handleLogOutLeave}>
               <button className="flex items-center gap-2 md:gap-3 hover:bg-slate-50 p-1 md:p-1.5 pr-2 md:pr-3 rounded-full transition-all border border-transparent hover:border-slate-100 active:scale-95"> <div className="relative"> <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-[10px] md:text-xs shadow-md">{currentUser.avatar}</div> <div className="absolute bottom-0 right-0 w-2 h-2 md:w-2.5 md:h-2.5 bg-amber-500 border-2 border-white rounded-full"></div> </div> <div className="hidden md:block text-left"> <p className="text-xs font-bold text-slate-800">{currentUser.name}</p> <p className="text-[10px] text-slate-500 font-medium">{currentUser.role}</p> </div> </button>
               {isLogOutOpen && ( <div className="absolute top-full right-0 mt-2 w-40 md:w-48 bg-white rounded-xl shadow-xl border border-slate-100 p-1 z-50 animate-scale-in"> <button onClick={handleLogout} className="w-full text-left px-3 py-2 text-[10px] md:text-xs font-bold text-slate-600 hover:bg-slate-50 rounded-lg flex items-center gap-2 transition-colors active:scale-95"> <LogOut size={12} md:size={14}/> Log Out </button> </div> )}
             </div>
           </div>
        </header>
        <LiveTicker activities={liveActivities} />
      </div>
      
      <div className="flex flex-1 overflow-hidden relative">
        {isSidebarOpen && ( <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 md:hidden animate-in fade-in"></div> )}
        <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex-col transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 md:flex`}>
          <div className="flex-1 px-4 py-6 space-y-1 overflow-y-auto scrollbar-hide">
            <div className="flex items-center justify-between md:hidden mb-6 px-2"><h2 className="font-black text-slate-800">Menu</h2><button onClick={() => setIsSidebarOpen(false)} className="p-1 hover:bg-slate-100 rounded-lg active:scale-90 transition-transform"><X size={18}/></button></div>
            <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-4 mb-2 mt-2">Main Menu</div>
            <SidebarItem id="dashboard" label="Overview" icon={LayoutDashboard} active={activeTab === 'dashboard'} />
            <SidebarItem id="requests" label="Queue List" icon={FolderOpen} active={activeTab === 'requests'} badge={stats.pending} />
            <SidebarItem id="calendar" label="Calendar" icon={CalendarIcon} active={activeTab === 'calendar'} />
            <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-4 mb-2 mt-6">Personal</div>
            <SidebarItem id="tasks" label="My Tasks" icon={CheckSquare} active={activeTab === 'tasks'} />
            <SidebarItem id="monitoring" label="Monitoring" icon={BarChart3} active={activeTab === 'monitoring'} />
            <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-4 mb-2 mt-6">Library</div>
            <SidebarItem id="assets-brand" label="Assets" icon={PieChart} active={activeTab === 'assets-brand'} />
            <SidebarItem id="brankas" label="Brankas (Vault)" icon={Archive} active={activeTab === 'brankas'} />
            <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-4 mb-2 mt-6">Quick Links</div>
            <div className="space-y-1 pl-2 pr-4"> 
              {SHORTCUTS.map((shop, i) => ( 
                <a key={i} href={shop.url} target="_blank" rel="noopener noreferrer" className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-slate-500 hover:text-amber-600 hover:bg-amber-50 active:scale-95 rounded-xl transition-all text-left group"> 
                  <ShoppingBag size={18} className="text-slate-400 group-hover:text-amber-500 transition-colors"/> 
                  {shop.name} 
                  <ExternalLink size={16} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity"/> 
                </a> 
              ))} 
            </div>
            <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-4 mb-2 mt-6">Socials</div>
            <div className="space-y-1 pl-2"> {SOCIAL_LINKS.map((soc, i) => ( <button key={i} className="w-full flex items-center gap-3 px-4 py-2 text-xs font-medium text-slate-500 hover:text-amber-600 hover:bg-amber-50/50 active:scale-95 rounded-lg transition-all text-left group"> <soc.icon size={14} className="text-slate-300 group-hover:text-amber-500"/> {soc.name} </button> ))} </div>
          </div>
          <div className="p-4 border-t border-slate-100 bg-slate-50/50 text-center"><p className="text-[10px] text-slate-400 font-bold">System Build By Nando</p></div>
        </aside>
        <main className={`flex-1 ${activeTab === 'brankas' ? 'overflow-hidden p-0' : 'overflow-y-auto p-4 md:p-8'} scrollbar-hide warm-bg`}>
          {renderContent()}
        </main>
      </div>
      {showNewRequestModal && <NewRequestModal onClose={() => setShowNewRequestModal(false)} onSubmit={handleNewRequestSubmit} />}
      <GlobalAIChat onAddRequest={handleNewRequestSubmit} onNavigate={handleNavigate} />
      <MobileBottomNav activeTab={activeTab} onNavigate={handleNavigate} badge={stats.pending} />
    </div>
  );
}