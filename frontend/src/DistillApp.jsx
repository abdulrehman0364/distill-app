// distill. — Complete Frontend App
// Production-ready React component
// Design: Dark editorial / knowledge-tool aesthetic

import { useState, useEffect, useCallback, useRef } from "react";

// ─── DESIGN TOKENS ───────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@300;400;500&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --ink:       #0d0d0d;
    --ink-2:     #1a1a1a;
    --ink-3:     #2a2a2a;
    --muted:     #6b6b6b;
    --muted-2:   #8a8a8a;
    --border:    #222222;
    --border-2:  #333333;
    --cream:     #f5f3ee;
    --cream-2:   #eceae3;
    --amber:     #d4a853;
    --amber-d:   #b8912e;
    --green:     #2d6a4f;
    --green-l:   #52b788;
    --red:       #c0392b;
    --white:     #ffffff;
    --font-serif: 'DM Serif Display', Georgia, serif;
    --font-sans:  'DM Sans', system-ui, sans-serif;
    --font-mono:  'DM Mono', 'Fira Code', monospace;
    --radius:     6px;
    --shadow:     0 2px 12px rgba(0,0,0,0.4);
    --shadow-lg:  0 8px 32px rgba(0,0,0,0.6);
  }

  html { font-size: 16px; -webkit-font-smoothing: antialiased; }

  body {
    font-family: var(--font-sans);
    background: var(--ink);
    color: var(--cream);
    min-height: 100vh;
    line-height: 1.6;
  }

  /* ── LAYOUT ── */
  .app { display: flex; min-height: 100vh; }

  .sidebar {
    width: 220px;
    flex-shrink: 0;
    background: var(--ink-2);
    border-right: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    padding: 0;
    position: fixed;
    top: 0; left: 0; bottom: 0;
    z-index: 100;
    transition: transform 0.25s ease;
  }

  .sidebar-logo {
    padding: 28px 24px 20px;
    border-bottom: 1px solid var(--border);
  }

  .logo-word {
    font-family: var(--font-serif);
    font-size: 24px;
    color: var(--cream);
    letter-spacing: -0.5px;
  }

  .logo-dot { color: var(--amber); }
  .logo-tag {
    font-size: 10px;
    font-family: var(--font-mono);
    color: var(--muted);
    letter-spacing: 0.08em;
    display: block;
    margin-top: 2px;
    text-transform: uppercase;
  }

  .sidebar-nav {
    flex: 1;
    padding: 16px 0;
    overflow-y: auto;
  }

  .nav-section {
    padding: 8px 16px 4px;
    font-size: 10px;
    font-family: var(--font-mono);
    color: var(--muted);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-top: 8px;
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 9px 20px;
    color: var(--muted-2);
    font-size: 13.5px;
    font-weight: 400;
    cursor: pointer;
    border: none;
    background: none;
    width: 100%;
    text-align: left;
    transition: all 0.15s;
    border-left: 2px solid transparent;
    font-family: var(--font-sans);
  }

  .nav-item:hover { color: var(--cream); background: rgba(255,255,255,0.04); }
  .nav-item.active {
    color: var(--amber);
    border-left-color: var(--amber);
    background: rgba(212,168,83,0.06);
  }

  .nav-icon { font-size: 15px; width: 20px; text-align: center; flex-shrink: 0; }

  .sidebar-footer {
    padding: 16px 20px;
    border-top: 1px solid var(--border);
    font-size: 12px;
    color: var(--muted);
  }

  .main { margin-left: 220px; flex: 1; min-width: 0; }
  .main-header {
    padding: 24px 40px 20px;
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: rgba(13,13,13,0.8);
    backdrop-filter: blur(10px);
    position: sticky;
    top: 0;
    z-index: 50;
  }

  .main-title {
    font-family: var(--font-serif);
    font-size: 22px;
    color: var(--cream);
    letter-spacing: -0.3px;
  }

  .main-body { padding: 36px 40px; }

  /* ── BUTTONS ── */
  .btn {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 9px 18px;
    border-radius: var(--radius);
    font-size: 13.5px;
    font-weight: 500;
    font-family: var(--font-sans);
    cursor: pointer;
    border: none;
    transition: all 0.15s;
    white-space: nowrap;
  }

  .btn-primary {
    background: var(--amber);
    color: var(--ink);
  }
  .btn-primary:hover { background: var(--amber-d); }
  .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

  .btn-ghost {
    background: transparent;
    color: var(--muted-2);
    border: 1px solid var(--border-2);
  }
  .btn-ghost:hover { color: var(--cream); border-color: var(--muted); }

  .btn-danger {
    background: transparent;
    color: var(--red);
    border: 1px solid var(--red);
  }
  .btn-danger:hover { background: rgba(192,57,43,0.1); }

  .btn-sm { padding: 6px 12px; font-size: 12px; }

  /* ── INPUTS ── */
  input, textarea {
    font-family: var(--font-sans);
    font-size: 14px;
    color: var(--cream);
    background: var(--ink-3);
    border: 1px solid var(--border-2);
    border-radius: var(--radius);
    padding: 10px 14px;
    width: 100%;
    transition: all 0.15s;
    outline: none;
  }

  input:focus, textarea:focus {
    border-color: var(--amber);
    box-shadow: 0 0 0 3px rgba(212,168,83,0.12);
  }

  input::placeholder, textarea::placeholder { color: var(--muted); }

  /* ── CARDS ── */
  .card {
    background: var(--ink-2);
    border: 1px solid var(--border);
    border-radius: 8px;
    transition: all 0.2s;
  }

  .card:hover { border-color: var(--border-2); box-shadow: var(--shadow); }

  .card-clickable { cursor: pointer; }
  .card-clickable:hover { transform: translateY(-1px); border-color: var(--border-2); }

  /* ── BADGES ── */
  .badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 3px 9px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 500;
    font-family: var(--font-mono);
    letter-spacing: 0.03em;
    text-transform: uppercase;
  }

  .badge-amber  { background: rgba(212,168,83,0.12);  color: var(--amber);   border: 1px solid rgba(212,168,83,0.2); }
  .badge-green  { background: rgba(82,183,136,0.12);  color: var(--green-l); border: 1px solid rgba(82,183,136,0.2); }
  .badge-muted  { background: rgba(255,255,255,0.05); color: var(--muted-2); border: 1px solid var(--border); }
  .badge-red    { background: rgba(192,57,43,0.12);   color: #e74c3c;        border: 1px solid rgba(192,57,43,0.2); }

  /* ── REEL CARDS ── */
  .reel-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; }

  .reel-card {
    background: var(--ink-2);
    border: 1px solid var(--border);
    border-radius: 8px;
    overflow: hidden;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    flex-direction: column;
  }

  .reel-card:hover {
    border-color: var(--amber);
    box-shadow: 0 4px 24px rgba(212,168,83,0.1);
    transform: translateY(-2px);
  }

  .reel-thumbnail {
    height: 160px;
    background: var(--ink-3);
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 40px;
    opacity: 0.4;
  }

  .reel-thumbnail img { width: 100%; height: 100%; object-fit: cover; opacity: 1; }

  .reel-thumb-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.8));
  }

  .reel-thumb-top {
    position: absolute;
    top: 10px;
    left: 10px;
    right: 10px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }

  .reel-thumb-bottom {
    position: absolute;
    bottom: 10px;
    left: 10px;
    right: 10px;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
  }

  .reel-creator {
    font-size: 11px;
    color: rgba(255,255,255,0.7);
    font-family: var(--font-mono);
  }

  .reel-body { padding: 16px; flex: 1; display: flex; flex-direction: column; gap: 10px; }

  .reel-summary {
    font-size: 13.5px;
    color: var(--cream-2);
    line-height: 1.55;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .reel-points {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .reel-point {
    font-size: 12px;
    color: var(--muted-2);
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .reel-point::before { content: "·  "; color: var(--amber); }

  .reel-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: auto;
    padding-top: 8px;
    border-top: 1px solid var(--border);
  }

  .reel-date { font-size: 11px; color: var(--muted); font-family: var(--font-mono); }

  /* ── REEL DETAIL ── */
  .detail-wrap { max-width: 760px; }

  .detail-header { margin-bottom: 32px; }

  .detail-meta {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 16px;
    flex-wrap: wrap;
  }

  .detail-creator {
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--muted-2);
  }

  .detail-summary {
    font-family: var(--font-serif);
    font-size: 22px;
    line-height: 1.45;
    color: var(--cream);
    margin-bottom: 8px;
    letter-spacing: -0.3px;
  }

  .detail-date {
    font-size: 12px;
    color: var(--muted);
    font-family: var(--font-mono);
  }

  .detail-section { margin-bottom: 36px; }

  .detail-section-title {
    font-family: var(--font-mono);
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: var(--muted);
    margin-bottom: 16px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--border);
  }

  .key-points { display: flex; flex-direction: column; gap: 12px; }

  .key-point {
    display: flex;
    gap: 12px;
    font-size: 14px;
    color: var(--cream-2);
    line-height: 1.6;
  }

  .key-point-num {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--amber);
    margin-top: 3px;
    flex-shrink: 0;
    width: 20px;
  }

  .steps-list { display: flex; flex-direction: column; gap: 10px; }

  .step-item {
    display: flex;
    gap: 14px;
    padding: 12px 14px;
    background: var(--ink-3);
    border-radius: var(--radius);
    border-left: 3px solid var(--amber);
    font-size: 14px;
    color: var(--cream-2);
    line-height: 1.5;
  }

  .step-num {
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--amber);
    font-weight: 500;
    flex-shrink: 0;
    margin-top: 1px;
  }

  .creator-tip {
    padding: 16px 18px;
    background: rgba(212,168,83,0.06);
    border: 1px solid rgba(212,168,83,0.2);
    border-radius: 8px;
    font-size: 14px;
    color: var(--cream-2);
    line-height: 1.65;
    font-style: italic;
  }

  .creator-tip::before {
    content: '"';
    font-family: var(--font-serif);
    font-size: 36px;
    color: var(--amber);
    line-height: 0;
    vertical-align: -14px;
    margin-right: 4px;
  }

  .refs-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px; }

  .ref-card {
    padding: 12px 14px;
    background: var(--ink-3);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    transition: all 0.15s;
  }

  .ref-card:hover { border-color: var(--amber); }

  .ref-type {
    font-family: var(--font-mono);
    font-size: 9px;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--muted);
    margin-bottom: 4px;
  }

  .ref-name { font-size: 13px; font-weight: 500; color: var(--cream); margin-bottom: 4px; }
  .ref-context { font-size: 11px; color: var(--muted); font-style: italic; }

  /* ── MODAL ── */
  .modal-backdrop {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.75);
    backdrop-filter: blur(4px);
    z-index: 200;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    animation: fadeBackdrop 0.2s ease;
  }

  @keyframes fadeBackdrop {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  .modal {
    background: var(--ink-2);
    border: 1px solid var(--border-2);
    border-radius: 12px;
    padding: 32px;
    width: 100%;
    max-width: 520px;
    box-shadow: var(--shadow-lg);
    animation: slideModal 0.25s ease;
  }

  @keyframes slideModal {
    from { opacity: 0; transform: translateY(16px) scale(0.98); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }

  .modal-title {
    font-family: var(--font-serif);
    font-size: 22px;
    color: var(--cream);
    margin-bottom: 6px;
  }

  .modal-sub { font-size: 13px; color: var(--muted); margin-bottom: 24px; }

  /* ── SEARCH ── */
  .search-wrap { position: relative; max-width: 560px; }
  .search-wrap input { padding-left: 40px; }
  .search-icon {
    position: absolute;
    left: 13px; top: 50%;
    transform: translateY(-50%);
    color: var(--muted);
    font-size: 16px;
    pointer-events: none;
  }

  /* ── COLLECTIONS ── */
  .collections-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 14px; }

  .coll-card {
    padding: 20px;
    background: var(--ink-2);
    border: 1px solid var(--border);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .coll-card:hover {
    border-color: var(--amber);
    box-shadow: 0 4px 20px rgba(212,168,83,0.08);
    transform: translateY(-1px);
  }

  .coll-emoji { font-size: 28px; margin-bottom: 12px; display: block; }
  .coll-name { font-weight: 500; font-size: 15px; color: var(--cream); margin-bottom: 4px; }
  .coll-count { font-size: 12px; color: var(--muted); font-family: var(--font-mono); }

  /* ── INSIGHTS ── */
  .stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 36px; }

  .stat-card {
    padding: 20px;
    background: var(--ink-2);
    border: 1px solid var(--border);
    border-radius: 8px;
    text-align: center;
  }

  .stat-value {
    font-family: var(--font-serif);
    font-size: 36px;
    color: var(--amber);
    line-height: 1;
    margin-bottom: 6px;
  }

  .stat-label { font-size: 12px; color: var(--muted); font-family: var(--font-mono); text-transform: uppercase; letter-spacing: 0.08em; }

  /* ── CATEGORY PILLS ── */
  .cat-pills { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 28px; }

  .cat-pill {
    padding: 6px 14px;
    border-radius: 20px;
    font-size: 12.5px;
    font-weight: 500;
    cursor: pointer;
    border: 1px solid var(--border-2);
    background: transparent;
    color: var(--muted-2);
    font-family: var(--font-sans);
    transition: all 0.15s;
  }

  .cat-pill:hover { color: var(--cream); border-color: var(--muted); }
  .cat-pill.active { background: var(--amber); color: var(--ink); border-color: var(--amber); font-weight: 600; }

  /* ── PROCESSING STATUS ── */
  .processing-banner {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 16px;
    background: rgba(212,168,83,0.08);
    border: 1px solid rgba(212,168,83,0.2);
    border-radius: var(--radius);
    font-size: 13px;
    color: var(--amber);
    margin-bottom: 24px;
  }

  .spinner {
    width: 14px; height: 14px;
    border: 2px solid rgba(212,168,83,0.3);
    border-top-color: var(--amber);
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }

  @keyframes spin { to { transform: rotate(360deg); } }

  /* ── EMPTY STATES ── */
  .empty {
    text-align: center;
    padding: 80px 20px;
    color: var(--muted);
  }

  .empty-icon { font-size: 48px; margin-bottom: 16px; opacity: 0.5; }
  .empty-title { font-family: var(--font-serif); font-size: 22px; color: var(--cream-2); margin-bottom: 8px; }
  .empty-sub { font-size: 14px; color: var(--muted); margin-bottom: 24px; max-width: 320px; margin-left: auto; margin-right: auto; }

  /* ── ERROR/SUCCESS ── */
  .alert {
    padding: 12px 16px;
    border-radius: var(--radius);
    font-size: 13.5px;
    margin-bottom: 16px;
    display: flex;
    align-items: flex-start;
    gap: 10px;
  }

  .alert-error  { background: rgba(192,57,43,0.12); border: 1px solid rgba(192,57,43,0.3); color: #e74c3c; }
  .alert-success { background: rgba(82,183,136,0.12); border: 1px solid rgba(82,183,136,0.3); color: var(--green-l); }

  /* ── HIGHLIGHT PANEL ── */
  .highlight {
    background: rgba(212,168,83,0.08);
    border-left: 3px solid var(--amber);
    padding: 10px 14px;
    border-radius: 0 var(--radius) var(--radius) 0;
    font-size: 13.5px;
    color: var(--cream-2);
    position: relative;
    margin-bottom: 8px;
  }

  .highlight-note { font-size: 12px; color: var(--muted); margin-top: 6px; font-style: italic; }

  .highlight-del {
    position: absolute;
    top: 8px; right: 10px;
    background: none; border: none;
    cursor: pointer;
    color: var(--muted);
    font-size: 14px;
    transition: color 0.15s;
  }
  .highlight-del:hover { color: var(--red); }

  /* ── FAB ── */
  .fab {
    position: fixed;
    bottom: 32px; right: 32px;
    width: 52px; height: 52px;
    border-radius: 50%;
    background: var(--amber);
    color: var(--ink);
    font-size: 22px;
    border: none;
    cursor: pointer;
    box-shadow: 0 4px 20px rgba(212,168,83,0.3);
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-sans);
    z-index: 80;
  }

  .fab:hover { transform: scale(1.08); box-shadow: 0 6px 28px rgba(212,168,83,0.4); }

  /* ── DIVIDER ── */
  .divider { height: 1px; background: var(--border); margin: 28px 0; }

  /* ── LOADING ── */
  .skeleton {
    background: linear-gradient(90deg, var(--ink-2) 25%, var(--ink-3) 50%, var(--ink-2) 75%);
    background-size: 200% 100%;
    animation: shimmer 1.4s infinite;
    border-radius: var(--radius);
  }

  @keyframes shimmer { from { background-position: 200% 0; } to { background-position: -200% 0; } }

  /* ── CATEGORY COLOURS ── */
  .cat-fitness  { color: #f97316; }
  .cat-finance  { color: #22c55e; }
  .cat-food     { color: #eab308; }
  .cat-travel   { color: #3b82f6; }
  .cat-fashion  { color: #ec4899; }
  .cat-mindset  { color: #a855f7; }
  .cat-tech     { color: #06b6d4; }
  .cat-music    { color: #f43f5e; }
  .cat-film     { color: #6366f1; }
  .cat-general  { color: var(--muted-2); }

  /* ── REFERENCES PAGE ── */
  .ref-type-section { margin-bottom: 36px; }

  /* ── SEARCH RESULTS ── */
  .search-result-item {
    padding: 16px 0;
    border-bottom: 1px solid var(--border);
    cursor: pointer;
    transition: all 0.15s;
  }

  .search-result-item:hover .search-result-title { color: var(--amber); }
  .search-result-title { font-weight: 500; color: var(--cream); margin-bottom: 4px; font-size: 15px; transition: color 0.15s; }
  .search-result-excerpt { font-size: 13px; color: var(--muted); line-height: 1.5; }

  /* ── TEXTAREA ── */
  textarea { resize: vertical; min-height: 80px; }

  /* ── SCROLLBAR ── */
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: var(--ink); }
  ::-webkit-scrollbar-thumb { background: var(--border-2); border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: var(--muted); }

  /* ── RESPONSIVE ── */
  @media (max-width: 768px) {
    .sidebar { transform: translateX(-100%); }
    .sidebar.open { transform: translateX(0); }
    .main { margin-left: 0; }
    .main-header { padding: 16px 20px; }
    .main-body { padding: 24px 20px; }
    .stats-row { grid-template-columns: repeat(2, 1fr); }
    .reel-grid { grid-template-columns: 1fr; }
  }
`;

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const CATEGORY_META = {
  fitness:  { icon: "💪", label: "Fitness",  cls: "cat-fitness"  },
  finance:  { icon: "💰", label: "Finance",  cls: "cat-finance"  },
  food:     { icon: "🍽️", label: "Food",     cls: "cat-food"     },
  travel:   { icon: "✈️",  label: "Travel",   cls: "cat-travel"   },
  fashion:  { icon: "👗", label: "Fashion",  cls: "cat-fashion"  },
  mindset:  { icon: "🧠", label: "Mindset",  cls: "cat-mindset"  },
  tech:     { icon: "💻", label: "Tech",     cls: "cat-tech"     },
  music:    { icon: "🎵", label: "Music",    cls: "cat-music"    },
  film:     { icon: "🎬", label: "Film",     cls: "cat-film"     },
  general:  { icon: "📚", label: "General",  cls: "cat-general"  },
};

const REF_ICONS = { book: "📖", film: "🎬", product: "🛍️", app: "📱", person: "👤", concept: "💡", brand: "🏷️" };

function catMeta(cat) { return CATEGORY_META[cat] || CATEGORY_META.general; }
function formatDate(d) {
  if (!d) return "";
  const diff = Date.now() - new Date(d);
  if (diff < 60000) return "just now";
  if (diff < 3600000) return `${Math.floor(diff/60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff/3600000)}h ago`;
  if (diff < 604800000) return `${Math.floor(diff/86400000)}d ago`;
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
function isInstagramUrl(u) { return typeof u === "string" && u.includes("instagram.com"); }

// ─── MOCK DATA ────────────────────────────────────────────────────────────────

const MOCK_REELS = [
  {
    id: "1", instagram_url: "https://instagram.com/reel/abc123", creator_username: "hubermanlab",
    thumbnail_url: null, saved_at: new Date(Date.now() - 3600000*2).toISOString(),
    extraction: {
      category: "mindset", tone: "educational", estimated_read_time_minutes: 3,
      summary: "Andrew Huberman breaks down the science of morning routines and how natural light exposure in the first 30 minutes of waking dramatically regulates cortisol and circadian rhythm.",
      key_points: [
        "Get 2–10 minutes of natural outdoor light within 30 minutes of waking — this sets your circadian clock",
        "Delaying caffeine by 90 minutes reduces afternoon energy crashes by avoiding adenosine rebound",
        "Cold exposure (1–5 min) spikes norepinephrine and dopamine, lasting 3+ hours",
      ],
      steps: [],
      creator_tip: "You don't have to do all of this. Even one of these habits will compound significantly over months.",
      references: [
        { id:"r1", ref_type:"person", ref_name:"Andrew Huberman", mention_context:"Host and neuroscientist" },
        { id:"r2", ref_type:"concept", ref_name:"Adenosine Rebound", mention_context:"Cause of afternoon energy crashes when caffeine is taken immediately after waking" },
        { id:"r3", ref_type:"concept", ref_name:"Circadian Rhythm", mention_context:"Regulated by morning light exposure" },
      ]
    }
  },
  {
    id: "2", instagram_url: "https://instagram.com/reel/def456", creator_username: "aliabdaal",
    thumbnail_url: null, saved_at: new Date(Date.now() - 86400000).toISOString(),
    extraction: {
      category: "finance", tone: "educational", estimated_read_time_minutes: 2,
      summary: "Ali Abdaal explains the three-account money system — spending, saving, and investing — that eliminates decision fatigue around personal finance.",
      key_points: [
        "Automate 20% of income into investing on payday — remove the decision entirely",
        "Use separate accounts for different money jobs: spending, emergency fund, investing",
        "Index funds beat active fund managers 90% of the time over 10-year periods",
      ],
      steps: [
        { step: 1, action: "Open 3 bank accounts: checking (spending), savings (6-month emergency fund), investment" },
        { step: 2, action: "Set up automatic transfer on payday: 20% → investment account" },
        { step: 3, action: "Invest consistently in low-cost index funds (S&P 500 ETF)" },
        { step: 4, action: "Ignore market fluctuations — don't check more than once per quarter" },
      ],
      creator_tip: "The goal isn't to get rich quick. It's to build a system where wealth is automatic.",
      references: [
        { id:"r4", ref_type:"book", ref_name:"The Psychology of Money", mention_context:"Recommended for mindset shift around investing" },
        { id:"r5", ref_type:"app",  ref_name:"Vanguard",              mention_context:"Platform for buying index funds" },
        { id:"r6", ref_type:"person", ref_name:"Morgan Housel",       mention_context:"Author of The Psychology of Money" },
      ]
    }
  },
  {
    id: "3", instagram_url: "https://instagram.com/reel/ghi789", creator_username: "jeffnippard",
    thumbnail_url: null, saved_at: new Date(Date.now() - 86400000*3).toISOString(),
    extraction: {
      category: "fitness", tone: "instructional", estimated_read_time_minutes: 4,
      summary: "Jeff Nippard shares the scientifically optimal push day routine focusing on mechanical tension, progressive overload, and muscle fibre recruitment for hypertrophy.",
      key_points: [
        "Mechanical tension (not the pump) is the primary driver of muscle growth",
        "Train each muscle 2x per week with 10–20 working sets total per week",
        "Full range of motion consistently outperforms partial reps for hypertrophy",
      ],
      steps: [
        { step: 1, action: "Incline Barbell Press 4×6–8 (compound, upper chest priority)" },
        { step: 2, action: "Flat Dumbbell Press 3×10–12 (mid-chest, full ROM)" },
        { step: 3, action: "Cable Flyes 3×15–20 (isolation, pump, high reps)" },
        { step: 4, action: "Overhead Press 3×8–10 (anterior delt emphasis)" },
        { step: 5, action: "Lateral raises 4×15–25 (medial delts, 90° angle critical)" },
        { step: 6, action: "Tricep pushdowns 3×12–15 (superset with overhead extension)" },
      ],
      creator_tip: "Progressive overload must be tracked. If you're not writing it down, you're guessing.",
      references: [
        { id:"r7", ref_type:"concept", ref_name:"Mechanical Tension",      mention_context:"Primary hypertrophy mechanism" },
        { id:"r8", ref_type:"concept", ref_name:"Progressive Overload",    mention_context:"Key principle for continued muscle growth" },
        { id:"r9", ref_type:"app",     ref_name:"Strong App",              mention_context:"Recommended for tracking workouts" },
      ]
    }
  },
  {
    id: "4", instagram_url: "https://instagram.com/reel/jkl012", creator_username: "mkbhd",
    thumbnail_url: null, saved_at: new Date(Date.now() - 86400000*5).toISOString(),
    extraction: {
      category: "tech", tone: "educational", estimated_read_time_minutes: 2,
      summary: "MKBHD explains why most people misunderstand megapixels — camera quality is about sensor size, aperture, and computational photography, not pixel count.",
      key_points: [
        "Megapixels only matter for large prints — past 12MP, extra pixels rarely help phone photos",
        "Sensor size matters most: larger sensors capture more light, reducing noise in low-light",
        "Computational photography (AI processing) now drives most of the quality gap between phones",
      ],
      steps: [],
      creator_tip: "The best camera is the one you have with you. Don't buy specs — buy the output.",
      references: [
        { id:"r10", ref_type:"product", ref_name:"Google Pixel Camera",  mention_context:"Example of computational photography leading the field" },
        { id:"r11", ref_type:"concept", ref_name:"Sensor Size Physics",  mention_context:"Why sensor area determines low-light performance" },
      ]
    }
  },
];

const MOCK_COLLECTIONS = [
  { id:"c1", title:"Morning Stack",    icon_emoji:"🌅", reel_count: 8  },
  { id:"c2", title:"Finance 101",      icon_emoji:"💰", reel_count: 12 },
  { id:"c3", title:"Workout Protocols",icon_emoji:"🏋️", reel_count: 21 },
  { id:"c4", title:"Deep Work",        icon_emoji:"🎯", reel_count: 5  },
];

// ─── COMPONENTS ───────────────────────────────────────────────────────────────

function CategoryBadge({ category }) {
  const m = catMeta(category);
  return (
    <span className="badge badge-muted" style={{ color: "inherit" }}>
      <span>{m.icon}</span>
      <span className={m.cls}>{m.label}</span>
    </span>
  );
}

function ReelCard({ reel, onClick }) {
  const ext = reel.extraction;
  const m = catMeta(ext?.category);
  return (
    <div className="reel-card" onClick={() => onClick(reel)}>
      <div className="reel-thumbnail">
        {reel.thumbnail_url
          ? <img src={reel.thumbnail_url} alt="" />
          : <span>🎬</span>
        }
        <div className="reel-thumb-overlay" />
        <div className="reel-thumb-top">
          <span className="badge badge-muted">
            <span>{m.icon}</span>
            <span className={m.cls}>{m.label}</span>
          </span>
        </div>
        <div className="reel-thumb-bottom">
          <span className="reel-creator">@{reel.creator_username}</span>
          {ext?.estimated_read_time_minutes && (
            <span className="reel-date">{ext.estimated_read_time_minutes} min read</span>
          )}
        </div>
      </div>
      <div className="reel-body">
        <p className="reel-summary">{ext?.summary || "Processing..."}</p>
        {ext?.key_points?.length > 0 && (
          <div className="reel-points">
            {ext.key_points.slice(0, 3).map((pt, i) => (
              <span key={i} className="reel-point">{pt.slice(0, 60)}{pt.length > 60 ? "…" : ""}</span>
            ))}
          </div>
        )}
        <div className="reel-meta">
          <span className="reel-date">{formatDate(reel.saved_at)}</span>
          {ext?.references?.length > 0 && (
            <span className="badge badge-muted" style={{fontSize:11}}>{ext.references.length} refs</span>
          )}
        </div>
      </div>
    </div>
  );
}

function ImportModal({ onClose, onAdd }) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handle = async () => {
    setError("");
    if (!url.trim()) { setError("Please paste a URL."); return; }
    if (!isInstagramUrl(url)) { setError("That doesn't look like an Instagram URL. Make sure it includes instagram.com/reel/…"); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1600)); // simulate network
    const newReel = {
      id: Date.now().toString(),
      instagram_url: url,
      creator_username: "newcreator",
      thumbnail_url: null,
      saved_at: new Date().toISOString(),
      extraction: {
        category: "general", tone: "educational", estimated_read_time_minutes: 2,
        summary: "Extraction complete — your reel has been distilled. Open it to view your key insights.",
        key_points: ["Insight extracted from your reel", "Knowledge saved to your vault"],
        steps: [], creator_tip: null, references: []
      }
    };
    onAdd(newReel);
    setDone(true);
    setLoading(false);
    setTimeout(onClose, 1800);
  };

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <h2 className="modal-title">Add a reel</h2>
        <p className="modal-sub">Paste any public Instagram reel URL. We'll extract the knowledge automatically.</p>

        {done ? (
          <div className="alert alert-success">✓ Reel added — extracting knowledge in background</div>
        ) : (
          <>
            <input
              type="url"
              value={url}
              onChange={e => { setUrl(e.target.value); setError(""); }}
              placeholder="https://www.instagram.com/reel/…"
              onKeyDown={e => e.key === "Enter" && handle()}
              autoFocus
            />
            {error && <div className="alert alert-error" style={{marginTop:12}}>{error}</div>}
            <div style={{display:"flex", gap:10, marginTop:20}}>
              <button className="btn btn-primary" onClick={handle} disabled={loading} style={{flex:1}}>
                {loading ? <><div className="spinner" />Distilling…</> : "Distill this reel"}
              </button>
              <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function NewCollectionModal({ onClose, onCreate }) {
  const [title, setTitle] = useState("");
  const [emoji, setEmoji] = useState("📚");
  const EMOJIS = ["📚","🎯","💰","🏋️","🌅","✈️","🎵","💻","🧠","👗","🎬","⚡","🌿","🔥"];

  const handle = () => {
    if (!title.trim()) return;
    onCreate({ id: Date.now().toString(), title: title.trim(), icon_emoji: emoji, reel_count: 0 });
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <h2 className="modal-title">New collection</h2>
        <p className="modal-sub">Group your reels by theme, topic, or mood.</p>

        <div style={{marginBottom:16}}>
          <div style={{fontSize:12,color:"var(--muted)",fontFamily:"var(--font-mono)",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8}}>Icon</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
            {EMOJIS.map(e => (
              <button key={e} onClick={() => setEmoji(e)}
                style={{
                  width:36, height:36, border: emoji===e ? "2px solid var(--amber)" : "1px solid var(--border-2)",
                  borderRadius:6, background: emoji===e ? "rgba(212,168,83,0.1)" : "var(--ink-3)",
                  cursor:"pointer", fontSize:18, transition:"all 0.15s"
                }}>
                {e}
              </button>
            ))}
          </div>
        </div>

        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Collection name"
          onKeyDown={e => e.key === "Enter" && handle()}
          autoFocus
          style={{marginBottom:20}}
        />

        <div style={{display:"flex",gap:10}}>
          <button className="btn btn-primary" onClick={handle} style={{flex:1}}>Create collection</button>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

function AddHighlightModal({ reel, onClose, onAdd }) {
  const [text, setText] = useState("");
  const [note, setNote] = useState("");

  const handle = () => {
    if (!text.trim()) return;
    onAdd({ id: Date.now().toString(), text: text.trim(), user_note: note.trim(), created_at: new Date().toISOString() });
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <h2 className="modal-title">Add highlight</h2>
        <p className="modal-sub">Save a line or quote from this reel's extraction.</p>
        <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Quote or key line to highlight…" style={{marginBottom:12}} />
        <input value={note} onChange={e => setNote(e.target.value)} placeholder="Your personal note (optional)" style={{marginBottom:20}} />
        <div style={{display:"flex",gap:10}}>
          <button className="btn btn-primary" onClick={handle} style={{flex:1}}>Save highlight</button>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ─── PAGES ────────────────────────────────────────────────────────────────────

function VaultPage({ reels, setReels, onOpenReel }) {
  const [category, setCategory] = useState(null);
  const [showImport, setShowImport] = useState(false);
  const [processing, setProcessing] = useState([]);

  const filtered = category ? reels.filter(r => r.extraction?.category === category) : reels;

  const handleAdd = (reel) => {
    setReels(prev => [reel, ...prev]);
    setProcessing(prev => [...prev, reel.id]);
    setTimeout(() => setProcessing(prev => prev.filter(id => id !== reel.id)), 5000);
  };

  const cats = [...new Set(reels.map(r => r.extraction?.category).filter(Boolean))];

  return (
    <>
      {processing.length > 0 && (
        <div className="processing-banner">
          <div className="spinner" />
          Distilling {processing.length} reel{processing.length > 1 ? "s" : ""} — AI extraction in progress…
        </div>
      )}

      <div className="cat-pills">
        <button className={`cat-pill ${!category ? "active" : ""}`} onClick={() => setCategory(null)}>All ({reels.length})</button>
        {cats.map(c => (
          <button key={c} className={`cat-pill ${category === c ? "active" : ""}`} onClick={() => setCategory(c)}>
            {catMeta(c).icon} {catMeta(c).label}
          </button>
        ))}
      </div>

      {filtered.length > 0 ? (
        <div className="reel-grid">
          {filtered.map(r => <ReelCard key={r.id} reel={r} onClick={onOpenReel} />)}
        </div>
      ) : (
        <div className="empty">
          <div className="empty-icon">🎬</div>
          <h2 className="empty-title">Your vault is empty</h2>
          <p className="empty-sub">Start by pasting an Instagram reel URL. distill. will extract the knowledge for you.</p>
          <button className="btn btn-primary" onClick={() => setShowImport(true)}>Add your first reel</button>
        </div>
      )}

      <button className="fab" onClick={() => setShowImport(true)} title="Add reel">+</button>
      {showImport && <ImportModal onClose={() => setShowImport(false)} onAdd={handleAdd} />}
    </>
  );
}

function ReelDetailPage({ reel, onBack }) {
  const [highlights, setHighlights] = useState([]);
  const [showHighlight, setShowHighlight] = useState(false);
  const ext = reel.extraction;

  if (!ext) return (
    <div className="empty">
      <div className="empty-icon">⏳</div>
      <h2 className="empty-title">Still processing</h2>
      <p className="empty-sub">AI is extracting insights from this reel. Check back in a moment.</p>
      <button className="btn btn-ghost" onClick={onBack}>← Back to vault</button>
    </div>
  );

  const m = catMeta(ext.category);

  return (
    <div className="detail-wrap">
      <button className="btn btn-ghost btn-sm" onClick={onBack} style={{marginBottom:28}}>← Back</button>

      <div className="detail-header">
        <div className="detail-meta">
          <CategoryBadge category={ext.category} />
          {ext.tone && <span className="badge badge-muted">{ext.tone}</span>}
          <span className="detail-creator">@{reel.creator_username}</span>
        </div>
        <p className="detail-summary">{ext.summary}</p>
        <span className="detail-date">Saved {formatDate(reel.saved_at)}</span>
      </div>

      {ext.key_points?.length > 0 && (
        <div className="detail-section">
          <div className="detail-section-title">Key Insights</div>
          <div className="key-points">
            {ext.key_points.map((pt, i) => (
              <div key={i} className="key-point">
                <span className="key-point-num">0{i+1}</span>
                <span>{pt}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {ext.steps?.length > 0 && (
        <div className="detail-section">
          <div className="detail-section-title">Steps</div>
          <div className="steps-list">
            {ext.steps.map((s, i) => (
              <div key={i} className="step-item">
                <span className="step-num">{s.step}</span>
                <span>{s.action}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {ext.creator_tip && (
        <div className="detail-section">
          <div className="detail-section-title">Creator's Insight</div>
          <div className="creator-tip">{ext.creator_tip}</div>
        </div>
      )}

      {ext.references?.length > 0 && (
        <div className="detail-section">
          <div className="detail-section-title">References ({ext.references.length})</div>
          <div className="refs-grid">
            {ext.references.map(ref => (
              <div key={ref.id} className="ref-card">
                <div className="ref-type">{REF_ICONS[ref.ref_type] || "📌"} {ref.ref_type}</div>
                <div className="ref-name">{ref.ref_name}</div>
                {ref.mention_context && <div className="ref-context">{ref.mention_context}</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="detail-section">
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
          <div className="detail-section-title" style={{margin:0}}>Your Highlights</div>
          <button className="btn btn-ghost btn-sm" onClick={() => setShowHighlight(true)}>+ Add highlight</button>
        </div>
        {highlights.length > 0 ? (
          highlights.map(h => (
            <div key={h.id} className="highlight">
              <button className="highlight-del" onClick={() => setHighlights(prev => prev.filter(x => x.id !== h.id))}>✕</button>
              {h.text}
              {h.user_note && <div className="highlight-note">Note: {h.user_note}</div>}
            </div>
          ))
        ) : (
          <p style={{fontSize:13,color:"var(--muted)"}}>No highlights yet. Select a key line to save it for quick reference.</p>
        )}
      </div>

      <div style={{display:"flex",gap:10,paddingTop:16,borderTop:"1px solid var(--border)"}}>
        <button className="btn btn-ghost btn-sm" onClick={() => {
          const text = [ext.summary, ...(ext.key_points||[])].join("\n\n");
          navigator.clipboard.writeText(text);
        }}>📋 Copy notes</button>
        <button className="btn btn-ghost btn-sm" onClick={() => window.open(reel.instagram_url,"_blank")}>↗ Open in Instagram</button>
      </div>

      {showHighlight && <AddHighlightModal reel={reel} onClose={() => setShowHighlight(false)} onAdd={h => setHighlights(prev => [...prev, h])} />}
    </div>
  );
}

function CollectionsPage({ collections, setCollections }) {
  const [showNew, setShowNew] = useState(false);
  return (
    <>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:28}}>
        <p style={{color:"var(--muted)",fontSize:14}}>{collections.length} collections</p>
        <button className="btn btn-primary btn-sm" onClick={() => setShowNew(true)}>+ New collection</button>
      </div>

      {collections.length > 0 ? (
        <div className="collections-grid">
          {collections.map(c => (
            <div key={c.id} className="coll-card">
              <span className="coll-emoji">{c.icon_emoji}</span>
              <div className="coll-name">{c.title}</div>
              <div className="coll-count">{c.reel_count} reel{c.reel_count !== 1 ? "s" : ""}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty">
          <div className="empty-icon">🗂️</div>
          <h2 className="empty-title">No collections yet</h2>
          <p className="empty-sub">Group related reels into collections — by topic, creator, or project.</p>
          <button className="btn btn-primary" onClick={() => setShowNew(true)}>Create your first collection</button>
        </div>
      )}

      {showNew && (
        <NewCollectionModal
          onClose={() => setShowNew(false)}
          onCreate={c => setCollections(prev => [...prev, c])}
        />
      )}
    </>
  );
}

function SearchPage({ reels, onOpenReel }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const results = query.length > 1
    ? reels.filter(r => {
        const q = query.toLowerCase();
        const ext = r.extraction;
        return (
          r.creator_username?.toLowerCase().includes(q) ||
          ext?.summary?.toLowerCase().includes(q) ||
          ext?.key_points?.some(p => p.toLowerCase().includes(q)) ||
          ext?.references?.some(r => r.ref_name.toLowerCase().includes(q))
        );
      })
    : [];

  return (
    <>
      <div className="search-wrap" style={{maxWidth:600,marginBottom:36}}>
        <span className="search-icon">🔍</span>
        <input
          ref={inputRef}
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search reels, creators, books, concepts…"
        />
      </div>

      {query.length > 1 ? (
        results.length > 0 ? (
          <>
            <p style={{color:"var(--muted)",fontSize:13,marginBottom:20,fontFamily:"var(--font-mono)"}}>
              {results.length} result{results.length !== 1 ? "s" : ""} for "{query}"
            </p>
            {results.map(r => {
              const ext = r.extraction;
              const m = catMeta(ext?.category);
              return (
                <div key={r.id} className="search-result-item" onClick={() => onOpenReel(r)}>
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
                    <CategoryBadge category={ext?.category} />
                    <span style={{fontSize:12,color:"var(--muted)",fontFamily:"var(--font-mono)"}}>@{r.creator_username}</span>
                  </div>
                  <div className="search-result-title">{ext?.summary}</div>
                  <div className="search-result-excerpt">
                    {ext?.key_points?.[0]}
                  </div>
                </div>
              );
            })}
          </>
        ) : (
          <div className="empty">
            <div className="empty-icon">🔍</div>
            <h2 className="empty-title">No results</h2>
            <p className="empty-sub">Nothing matched "{query}". Try a different keyword.</p>
          </div>
        )
      ) : (
        <div style={{color:"var(--muted)",fontSize:14}}>
          <p style={{marginBottom:16}}>Search across:</p>
          {["Reel summaries and key points","Creator names","Referenced books, films, products","Concepts and ideas"].map(t => (
            <div key={t} style={{padding:"10px 0",borderBottom:"1px solid var(--border)",color:"var(--cream-2)",fontSize:13}}>· {t}</div>
          ))}
        </div>
      )}
    </>
  );
}

function ReferencesPage({ reels }) {
  const allRefs = reels.flatMap(r => (r.extraction?.references || []).map(ref => ({ ...ref, reel: r })));
  const byType = {};
  allRefs.forEach(r => { byType[r.ref_type] = byType[r.ref_type] || []; byType[r.ref_type].push(r); });

  const types = Object.keys(byType).sort();

  if (allRefs.length === 0) return (
    <div className="empty">
      <div className="empty-icon">📖</div>
      <h2 className="empty-title">No references yet</h2>
      <p className="empty-sub">When you save reels, distill. automatically extracts every book, film, product, and concept mentioned.</p>
    </div>
  );

  return (
    <>
      <p style={{color:"var(--muted)",fontSize:14,marginBottom:32}}>{allRefs.length} total references extracted across {reels.length} reels</p>
      {types.map(type => (
        <div key={type} className="ref-type-section">
          <div className="detail-section-title">{REF_ICONS[type] || "📌"} {type}s ({byType[type].length})</div>
          <div className="refs-grid">
            {byType[type].map((ref, i) => (
              <div key={i} className="ref-card">
                <div className="ref-name">{ref.ref_name}</div>
                {ref.ref_details?.author && <div className="ref-context">by {ref.ref_details.author}</div>}
                <div className="ref-context" style={{marginTop:6}}>from @{ref.reel.creator_username}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}

function InsightsPage({ reels }) {
  const total = reels.length;
  const totalRefs = reels.flatMap(r => r.extraction?.references || []).length;
  const readTime = reels.reduce((acc, r) => acc + (r.extraction?.estimated_read_time_minutes || 0), 0);
  const cats = {};
  reels.forEach(r => { const c = r.extraction?.category || "general"; cats[c] = (cats[c] || 0) + 1; });
  const topCats = Object.entries(cats).sort((a,b) => b[1]-a[1]).slice(0,5);
  const creators = {};
  reels.forEach(r => { const c = r.creator_username; if (c) creators[c] = (creators[c] || 0) + 1; });
  const topCreators = Object.entries(creators).sort((a,b) => b[1]-a[1]).slice(0,5);

  return (
    <>
      <div className="stats-row">
        {[
          { val: total,    lab: "Reels saved"       },
          { val: totalRefs,lab: "References found"  },
          { val: readTime, lab: "Min of insights"   },
          { val: Object.keys(cats).length, lab: "Categories"  },
        ].map(s => (
          <div key={s.lab} className="stat-card">
            <div className="stat-value">{s.val}</div>
            <div className="stat-label">{s.lab}</div>
          </div>
        ))}
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:24}}>
        <div>
          <div className="detail-section-title">Top Categories</div>
          {topCats.map(([cat, count]) => {
            const m = catMeta(cat);
            const pct = Math.round((count / total) * 100);
            return (
              <div key={cat} style={{marginBottom:14}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:6,fontSize:13}}>
                  <span>{m.icon} {m.label}</span>
                  <span style={{color:"var(--muted)",fontFamily:"var(--font-mono)"}}>{count} ({pct}%)</span>
                </div>
                <div style={{height:4,background:"var(--ink-3)",borderRadius:2,overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${pct}%`,background:"var(--amber)",borderRadius:2,transition:"width 0.6s ease"}} />
                </div>
              </div>
            );
          })}
        </div>

        <div>
          <div className="detail-section-title">Top Creators</div>
          {topCreators.map(([creator, count], i) => (
            <div key={creator} style={{display:"flex",alignItems:"center",gap:12,marginBottom:14,padding:"8px 0",borderBottom:"1px solid var(--border)"}}>
              <span style={{fontFamily:"var(--font-mono)",fontSize:11,color:"var(--muted)",width:16}}>#{i+1}</span>
              <div style={{flex:1}}>
                <div style={{fontSize:13,color:"var(--cream)"}}>@{creator}</div>
                <div style={{fontSize:11,color:"var(--muted)",fontFamily:"var(--font-mono)"}}>{count} reel{count!==1?"s":""} saved</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────

const NAV = [
  { id:"vault",       icon:"🗄️",  label:"Vault"        },
  { id:"collections", icon:"🗂️",  label:"Collections"  },
  { id:"references",  icon:"📖",  label:"References"   },
  { id:"search",      icon:"🔍",  label:"Search"       },
  { id:"insights",    icon:"📊",  label:"Insights"     },
];

const PAGE_TITLES = {
  vault: "Vault", collections: "Collections", references: "References",
  search: "Search", insights: "Insights", detail: "Reel Detail"
};

export default function DistillApp() {
  const [page, setPage] = useState("vault");
  const [reels, setReels] = useState(MOCK_REELS);
  const [collections, setCollections] = useState(MOCK_COLLECTIONS);
  const [selectedReel, setSelectedReel] = useState(null);

  const openReel = useCallback(reel => {
    setSelectedReel(reel);
    setPage("detail");
  }, []);

  const currentPage = selectedReel && page === "detail" ? "detail" : page;
  const title = PAGE_TITLES[currentPage];

  return (
    <>
      <style>{CSS}</style>
      <div className="app">
        {/* Sidebar */}
        <nav className="sidebar">
          <div className="sidebar-logo">
            <div className="logo-word">distill<span className="logo-dot">.</span></div>
            <span className="logo-tag">your reels, turned into knowledge</span>
          </div>
          <div className="sidebar-nav">
            <div className="nav-section">Navigation</div>
            {NAV.map(n => (
              <button
                key={n.id}
                className={`nav-item ${page === n.id && currentPage !== "detail" ? "active" : ""}`}
                onClick={() => { setPage(n.id); setSelectedReel(null); }}
              >
                <span className="nav-icon">{n.icon}</span>
                {n.label}
              </button>
            ))}

            <div className="nav-section" style={{marginTop:20}}>Vault</div>
            <div style={{padding:"6px 20px"}}>
              {["fitness","finance","mindset","tech"].map(cat => {
                const m = catMeta(cat);
                const count = reels.filter(r => r.extraction?.category === cat).length;
                return (
                  <div key={cat} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 0"}}>
                    <span style={{fontSize:12.5,color:"var(--muted-2)"}}>{m.icon} {m.label}</span>
                    <span style={{fontSize:10,color:"var(--muted)",fontFamily:"var(--font-mono)"}}>{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="sidebar-footer">
            <div style={{fontSize:11,fontFamily:"var(--font-mono)",color:"var(--muted)"}}>{reels.length} reels · Free forever</div>
          </div>
        </nav>

        {/* Main */}
        <div className="main">
          <header className="main-header">
            <h1 className="main-title">{title}</h1>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <div className="search-wrap" style={{maxWidth:220}}>
                <span className="search-icon" style={{fontSize:14}}>🔍</span>
                <input
                  placeholder="Quick search…"
                  style={{fontSize:13,padding:"7px 12px 7px 36px"}}
                  onFocus={() => { setPage("search"); setSelectedReel(null); }}
                  readOnly
                />
              </div>
            </div>
          </header>

          <div className="main-body">
            {currentPage === "vault" && (
              <VaultPage reels={reels} setReels={setReels} onOpenReel={openReel} />
            )}
            {currentPage === "detail" && selectedReel && (
              <ReelDetailPage reel={selectedReel} onBack={() => { setSelectedReel(null); setPage("vault"); }} />
            )}
            {currentPage === "collections" && (
              <CollectionsPage collections={collections} setCollections={setCollections} />
            )}
            {currentPage === "references" && (
              <ReferencesPage reels={reels} />
            )}
            {currentPage === "search" && (
              <SearchPage reels={reels} onOpenReel={openReel} />
            )}
            {currentPage === "insights" && (
              <InsightsPage reels={reels} />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
