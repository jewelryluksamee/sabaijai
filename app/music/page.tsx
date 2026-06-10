"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  collection,
  addDoc,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  increment,
  orderBy,
  query as fsQuery,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db, auth } from "@/lib/firebase-client";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";

/* ─── Types ─────────────────────────────────────────────── */

interface Reactions { heart: number; cry: number; fire: number; music: number; }
type ReactionKey = keyof Reactions;

interface FeedItem {
  id: string;
  title: string;
  img: string;
  caption: string;
  createdAt: Timestamp | null;
  likes: number;
  youtubeId: string | null;
  reactions?: Partial<Reactions>;
  mood?: string;
  userId?: string;
}

interface SearchResult {
  videoId: string;
  title: string;
  thumbnail: string;
  channel: string;
}

interface VideoPreview {
  title: string;
  thumbnail: string;
  videoId: string;
}

interface ReactionPop {
  uid: string;
  emoji: string;
  itemId: string;
}

/* ─── Constants ──────────────────────────────────────────── */

const COLLECTION = "music_feed";

const REACTION_LIST = [
  { key: "heart" as ReactionKey, emoji: "❤️", label: "Love" },
  { key: "cry"   as ReactionKey, emoji: "😭", label: "Moving" },
  { key: "fire"  as ReactionKey, emoji: "🔥", label: "Fire" },
  { key: "music" as ReactionKey, emoji: "🎵", label: "Vibe" },
];

const MOOD_TAGS = [
  { key: "healing",   label: "ฮีลใจ",    emoji: "🕊️" },
  { key: "sad",       label: "เศร้า",     emoji: "🌧️" },
  { key: "happy",     label: "มีความสุข", emoji: "🌻" },
  { key: "calm",      label: "สงบ",       emoji: "😌" },
  { key: "hype",      label: "มันส์",     emoji: "🔥" },
  { key: "nostalgic", label: "คิดถึง",    emoji: "💭" },
];

/* ─── Helpers ────────────────────────────────────────────── */

function extractYouTubeId(text: string): string | null {
  const m = text.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

function timeAgo(ts: Timestamp | null): string {
  if (!ts) return "just now";
  const diff = (Date.now() - ts.toMillis()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function totalReactions(r?: Partial<Reactions>) {
  if (!r) return 0;
  return (r.heart ?? 0) + (r.cry ?? 0) + (r.fire ?? 0) + (r.music ?? 0);
}

/* ─── Component ──────────────────────────────────────────── */

export default function MusicPage() {
  /* share panel */
  const [query, setQuery]           = useState("");
  const [caption, setCaption]       = useState("");
  const [selectedMood, setSelectedMood] = useState("");
  const [detectingMood, setDetectingMood] = useState(false);
  const [preview, setPreview]       = useState<VideoPreview | null>(null);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching]   = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [sharing, setSharing]       = useState(false);

  /* feed */
  const [feed, setFeed]             = useState<FeedItem[]>([]);
  const [filterMood, setFilterMood] = useState("");
  const [sortBy, setSortBy]         = useState<"latest" | "loved">("latest");

  /* player */
  const [expandedId, setExpandedId] = useState<string | null>(null);

  /* reactions */
  const [myReactions, setMyReactions] = useState<Map<string, Set<ReactionKey>>>(new Map());
  const [reactionPops, setReactionPops] = useState<ReactionPop[]>([]);

  /* sharing */
  const [sharingId, setSharingId]   = useState<string | null>(null);

  /* delete */
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const searchRef    = useRef<HTMLDivElement>(null);
  const debounceRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipSearchRef = useRef(false);

  /* ── Real-time feed ── */
  useEffect(() => {
    const q = fsQuery(collection(db, COLLECTION), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snap) =>
      setFeed(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<FeedItem, "id">) })))
    );
  }, []);

  /* ── Click outside search dropdown ── */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node))
        setShowResults(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ── YouTube search ── */
  const searchYouTube = useCallback(async (q: string) => {
    setSearching(true);
    try {
      const res = await fetch(`/api/youtube-search?q=${encodeURIComponent(q)}`);
      if (!res.ok) throw new Error();
      setSearchResults(await res.json());
      setShowResults(true);
    } catch { setSearchResults([]); }
    finally { setSearching(false); }
  }, []);

  const detectMoodForSong = useCallback(async (title: string, channel?: string) => {
    setDetectingMood(true);
    try {
      const res = await fetch("/api/detect-mood", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, channel }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (data.mood) { setSelectedMood(data.mood); }
    } catch { /* keep current mood */ }
    finally { setDetectingMood(false); }
  }, []);

  const fetchPreviewFromUrl = useCallback(async (videoId: string) => {
    setSearching(true);
    try {
      const res = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setPreview({ title: data.title, thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`, videoId });
      setShowResults(false);
      detectMoodForSong(data.title);
    } catch { setPreview(null); }
    finally { setSearching(false); }
  }, [detectMoodForSong]);

  useEffect(() => {
    if (skipSearchRef.current) { skipSearchRef.current = false; return; }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const trimmed = query.trim();
    if (!trimmed) { setSearchResults([]); setPreview(null); setShowResults(false); return; }
    const vid = extractYouTubeId(trimmed);
    if (vid) { setSearchResults([]); setShowResults(false); fetchPreviewFromUrl(vid); return; }
    setPreview(null);
    debounceRef.current = setTimeout(() => { if (trimmed.length >= 2) searchYouTube(trimmed); }, 500);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, fetchPreviewFromUrl, searchYouTube]);

  /* ── Select a search result ── */
  function selectResult(r: SearchResult) {
    skipSearchRef.current = true;
    setPreview({ title: r.title, thumbnail: r.thumbnail, videoId: r.videoId });
    setQuery(r.title);
    setShowResults(false);
    setSearchResults([]);
    detectMoodForSong(r.title, r.channel);
  }

  /* ── Share ── */
  async function handleShare() {
    if (!preview || sharing) return;
    setSharing(true);
    try {
      await addDoc(collection(db, COLLECTION), {
        title: preview.title,
        img: preview.thumbnail,
        caption: caption.trim(),
        youtubeId: preview.videoId,
        mood: selectedMood || null,
        likes: 0,
        reactions: { heart: 0, cry: 0, fire: 0, music: 0 },
        createdAt: serverTimestamp(),
        ...(auth.currentUser ? { userId: auth.currentUser.uid } : {}),
      });
      setQuery(""); setCaption(""); setPreview(null); setSelectedMood("");
    } finally { setSharing(false); }
  }

  /* ── Reactions ── */
  async function handleReact(itemId: string, key: ReactionKey) {
    const set = myReactions.get(itemId) ?? new Set<ReactionKey>();
    const already = set.has(key);

    setMyReactions((prev) => {
      const next = new Map(prev);
      const s = new Set(next.get(itemId) ?? []);
      already ? s.delete(key) : s.add(key);
      next.set(itemId, s);
      return next;
    });

    if (!already) {
      const uid = `${Date.now()}_${Math.random()}`;
      const emoji = REACTION_LIST.find((r) => r.key === key)?.emoji ?? "";
      setReactionPops((p) => [...p, { uid, emoji, itemId }]);
      setTimeout(() => setReactionPops((p) => p.filter((x) => x.uid !== uid)), 900);
    }

    await updateDoc(doc(db, COLLECTION, itemId), {
      [`reactions.${key}`]: increment(already ? -1 : 1),
    });
  }


  /* ── Delete own song ── */
  async function handleDeleteSong(itemId: string) {
    if (deletingId) return;
    setDeletingId(itemId);
    try {
      await deleteDoc(doc(db, COLLECTION, itemId));
    } finally {
      setDeletingId(null);
    }
  }

  /* ── Auto-backfill moods for songs without one ── */
  const backfillRanRef = useRef(false);

  useEffect(() => {
    if (backfillRanRef.current || feed.length === 0) return;
    const targets = feed.filter((i) => !i.mood);
    if (!targets.length) return;
    backfillRanRef.current = true;
    (async () => {
      for (const item of targets) {
        try {
          const res = await fetch("/api/detect-mood", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: item.title }),
          });
          if (res.ok) {
            const data = await res.json();
            if (data.mood) await updateDoc(doc(db, COLLECTION, item.id), { mood: data.mood });
          }
        } catch { /* skip */ }
      }
    })();
  }, [feed]);

  /* ── Filtered + sorted feed ── */
  const displayFeed = useMemo(() => {
    let result = [...feed];
    if (filterMood) result = result.filter((i) => i.mood === filterMood);
    if (sortBy === "loved") result.sort((a, b) => totalReactions(b.reactions) - totalReactions(a.reactions));
    return result;
  }, [feed, filterMood, sortBy]);

  /* ── Community stats ── */
  const totalSongs = feed.length;
  const totalReactionsAll = feed.reduce((s, i) => s + totalReactions(i.reactions), 0);

  /* ── Now playing item ── */
  const nowPlaying = expandedId ? feed.find((i) => i.id === expandedId) : null;

  /* ─────────────────────────────────────────────────────── */

  return (
    <>
      <Header />

      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute -top-[10%] -left-[5%] w-[50%] h-[50%] bg-[#c2e3c8]/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-[60%] h-[60%] bg-[#d4e8c8]/15 blur-[150px] rounded-full" />
      </div>

      <main className="relative z-10 pt-24 px-4 md:px-6 max-w-5xl mx-auto pb-40 grainy-texture">

        {/* Hero */}
        <section className="mb-8">
          <h2 className="text-3xl md:text-5xl font-extrabold text-[#332b1f] leading-tight">
            ฝากบทเพลงนี้ <br /> ไปปลอบประโลมหัวใจของใครสักคน :D
          </h2>
          {totalSongs > 0 && (
            <p className="mt-3 text-sm text-[#6b5e4d]">
              🎵 {totalSongs} เพลงจาก Community -- {totalReactionsAll} reactions
            </p>
          )}
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* ── Share Panel ── */}
          <div className="lg:col-span-4">
            <div className="bg-white/100 border border-black/100 rounded-2xl p-5 space-y-4">
              <p className="text-[#2a4d32] font-semibold text-sm">Let&apos;s Share a Healing Song</p>

              {/* Search input */}
              <div className="relative" ref={searchRef}>
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#4e7c5f]/60 text-xl pointer-events-none">search</span>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => { if (searchResults.length > 0) setShowResults(true); }}
                  placeholder="ค้นหาเพลง หรือวาง YouTube link..."
                  className="w-full bg-black/5 rounded-xl pl-10 pr-9 py-3.5 text-[#332b1f] placeholder-[#6b5e4d]/40 border border-black/30 outline-none focus:ring-1 focus:ring-[#4e7c5f]/40 text-sm transition-all"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
                  {searching && <span className="material-symbols-outlined text-black/40 text-lg animate-spin">progress_activity</span>}
                  {query && !searching && (
                    <button onClick={() => { setQuery(""); setPreview(null); setSearchResults([]); setShowResults(false); setSelectedMood(""); }} className="text-[#6b5e4d]/50 hover:text-[#332b1f]">
                      <span className="material-symbols-outlined text-lg">close</span>
                    </button>
                  )}
                </div>

                {/* Dropdown */}
                {showResults && searchResults.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-black/15 rounded-xl shadow-xl z-50 max-h-64 overflow-y-auto">
                    {searchResults.map((r) => (
                      <button key={r.videoId} onClick={() => selectResult(r)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[#f5f0eb] transition-colors text-left">
                        <img src={r.thumbnail} alt={r.title} className="w-14 h-9 object-cover rounded-md shrink-0 border border-black/10" />
                        <div className="min-w-0">
                          <p className="text-[#332b1f] text-xs font-semibold line-clamp-2 leading-snug">{r.title}</p>
                          <p className="text-[#6b5e4d] text-[10px] mt-0.5 truncate">{r.channel}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Preview card */}
              {preview && (
                <div className="bg-white/70 rounded-xl overflow-hidden border border-black">
                  <div className="relative aspect-video">
                    <img className="w-full h-full object-cover" src={preview.thumbnail} alt={preview.title} />
                    <a href={`https://www.youtube.com/watch?v=${preview.videoId}`} target="_blank" rel="noopener noreferrer"
                      className="absolute inset-0 bg-black/20 flex items-center justify-center hover:bg-black/30 transition-colors">
                      <div className="w-11 h-11 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center border border-black">
                        <span className="material-symbols-outlined text-white text-xl">play_arrow</span>
                      </div>
                    </a>
                  </div>
                  <div className="p-3 flex items-start justify-between gap-2">
                    <h4 className="font-bold text-[#332b1f] text-xs line-clamp-2">{preview.title}</h4>
                    <button onClick={() => { setPreview(null); setQuery(""); setSelectedMood(""); }} className="shrink-0 text-[#6b5e4d]/50 hover:text-[#a8364b]">
                      <span className="material-symbols-outlined text-base">close</span>
                    </button>
                  </div>
                </div>
              )}

              {/* AI mood display */}
              {(detectingMood || selectedMood) && (
                <div className="flex items-center gap-2">
                  {detectingMood ? (
                    <span className="flex items-center gap-1.5 text-xs text-[#4e7c5f]">
                      <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                      AI กำลังวิเคราะห์...
                    </span>
                  ) : (() => {
                    const m = MOOD_TAGS.find((t) => t.key === selectedMood);
                    return m ? (
                      <span className="inline-flex items-center gap-1.5 bg-[#332b1f] text-white px-3 py-1 rounded-full text-xs font-semibold">
                        <span>{m.emoji}</span>
                        <span>{m.label}</span>
                      </span>
                    ) : null;
                  })()}
                </div>
              )}

              {/* Caption */}
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="w-full bg-black/5 rounded-xl px-4 py-3 text-[#332b1f] placeholder-[#6b5e4d]/40 border border-black/30 outline-none focus:ring-1 focus:ring-[#4e7c5f]/40 resize-none text-sm"
                placeholder="Add a caption... (optional)"
                rows={2}
              />

              <button
                onClick={handleShare}
                disabled={!preview || sharing}
                className="w-full h-11 border border-black/40 bg-[#7c5cbf] hover:bg-[#6b4aad] text-white rounded-xl font-bold shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed text-sm"
              >
                <span>{sharing ? "Sharing..." : "Share to Community"}</span>
                <span className="material-symbols-outlined text-base">send</span>
              </button>
            </div>
          </div>

          {/* ── Feed ── */}
          <div className="lg:col-span-8">

            {/* Feed controls */}
            <div className="mb-4 space-y-3">
              {/* Top row: title + sort */}
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-bold text-[#332b1f] shrink-0">Healing Songs</h3>
                <div className="flex border border-black/20 rounded-lg overflow-hidden bg-white/60">
                  <button onClick={() => setSortBy("latest")}
                    className={`px-3 py-1.5 text-xs font-medium transition-all ${sortBy === "latest" ? "bg-[#332b1f] text-white" : "text-[#6b5e4d] hover:bg-black/5"}`}>
                    Latest
                  </button>
                  <button onClick={() => setSortBy("loved")}
                    className={`px-3 py-1.5 text-xs font-medium transition-all ${sortBy === "loved" ? "bg-[#332b1f] text-white" : "text-[#6b5e4d] hover:bg-black/5"}`}>
                    Most Loved
                  </button>
                </div>
              </div>

              {/* Mood filter pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
                <button onClick={() => setFilterMood("")}
                  className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium border transition-all ${!filterMood ? "bg-[#332b1f] text-white border-[#332b1f]" : "bg-white/60 text-[#6b5e4d] border-black/20 hover:border-black/40"}`}>
                  All
                </button>
                {MOOD_TAGS.map((m) => (
                  <button key={m.key} onClick={() => setFilterMood(filterMood === m.key ? "" : m.key)}
                    className={`shrink-0 flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border transition-all ${filterMood === m.key ? "bg-[#332b1f] text-white border-[#332b1f]" : "bg-white/60 text-[#6b5e4d] border-black/20 hover:border-black/40"}`}>
                    {m.emoji} {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Empty states */}
            {displayFeed.length === 0 && feed.length === 0 && (
              <div className="bg-white/30 border border-black rounded-2xl p-10 text-center text-[#6b5e4d]">
                <span className="material-symbols-outlined text-4xl mb-3 block text-black/10">music_note</span>
                <p className="text-sm">No songs shared yet. Be the first!</p>
              </div>
            )}
            {displayFeed.length === 0 && feed.length > 0 && (
              <div className="bg-white/30 border border-black/20 rounded-2xl p-8 text-center text-[#6b5e4d]">
                <p className="text-sm">ไม่พบเพลงที่ตรงกับที่ค้นหา</p>
              </div>
            )}

            {/* Masonry grid */}
            <div className="columns-2 md:columns-2 lg:columns-3 gap-3">
              {displayFeed.map((item) => {
                const itemReactions = myReactions.get(item.id) ?? new Set<ReactionKey>();
                const isExpanded = expandedId === item.id;
                const moodInfo = MOOD_TAGS.find((m) => m.key === item.mood);
                const pops = reactionPops.filter((p) => p.itemId === item.id);

                return (
                  <div key={item.id}
                    className="break-inside-avoid mb-3 bg-white/60 hover:bg-white/80 border border-black/80 rounded-2xl overflow-hidden transition-all hover:shadow-lg group relative">

                    {/* Delete × button */}
                    {confirmDeleteId === item.id ? (
                      <div className="absolute inset-x-0 top-0 z-20 bg-[#1a150d]/85 backdrop-blur-sm px-3 py-2 flex items-center justify-between">
                        <span className="text-white text-[11px] font-medium">ลบเพลงนี้?</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => { setConfirmDeleteId(null); handleDeleteSong(item.id); }}
                            disabled={deletingId === item.id}
                            className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#a8364b] text-white disabled:opacity-50"
                          >
                            {deletingId === item.id ? "..." : "ลบเลย"}
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/20 text-white"
                          >
                            ยกเลิก
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteId(item.id)}
                        className="absolute top-1.5 right-1.5 z-10 w-5 h-5 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center hover:bg-[#a8364b]/80 transition-colors"
                        title="ลบเพลงนี้"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: "13px" }}>close</span>
                      </button>
                    )}

                    {/* Thumbnail / inline player */}
                    <div className="relative aspect-video bg-black">
                      {isExpanded && item.youtubeId ? (
                        <iframe
                          className="w-full h-full"
                          src={`https://www.youtube.com/embed/${item.youtubeId}?autoplay=1&rel=0`}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          title={item.title}
                        />
                      ) : (
                        <>
                          <img className="w-full h-full object-cover" src={item.img} alt={item.title} />
                          {item.youtubeId && (
                            <button
                              onClick={() => setExpandedId(isExpanded ? null : item.id)}
                              className="absolute inset-0 bg-black/20 group-hover:bg-black/35 transition-colors flex items-center justify-center">
                              <div className="w-10 h-10 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center border border-white/60 opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="material-symbols-outlined text-white text-xl">play_arrow</span>
                              </div>
                            </button>
                          )}
                        </>
                      )}

                      {/* Mood badge */}
                      {moodInfo && (
                        <span className="absolute top-1.5 left-1.5 bg-black/50 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded-full font-medium">
                          {moodInfo.emoji} {moodInfo.label}
                        </span>
                      )}

                      {/* Now playing indicator */}
                      {isExpanded && (
                        <button onClick={() => setExpandedId(null)}
                          className="absolute top-1.5 right-1.5 bg-black/50 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                          Now Playing · close
                        </button>
                      )}
                    </div>

                    {/* Card body */}
                    <div className="p-3 relative">
                      {/* Floating reaction pops */}
                      {pops.map((pop) => (
                        <span key={pop.uid} className="reaction-pop" style={{ bottom: "2.5rem", left: `${20 + Math.random() * 40}%` }}>
                          {pop.emoji}
                        </span>
                      ))}

                      <h4 className="font-bold text-[#332b1f] text-xs leading-snug line-clamp-2 mb-1">{item.title}</h4>

                      {item.caption && (
                        <p className="text-[#6b5e4d] text-[11px] leading-relaxed mb-2 italic line-clamp-2">
                          &ldquo;{item.caption}&rdquo;
                        </p>
                      )}

                      {/* Reactions */}
                      <div className="flex items-center justify-between pt-2 border-t border-black/10">
                        <div className="flex items-center gap-0.5">
                          {REACTION_LIST.map(({ key, emoji, label }) => {
                            const count = item.reactions?.[key] ?? 0;
                            const active = itemReactions.has(key);
                            return (
                              <button key={key} onClick={() => handleReact(item.id, key)} title={label}
                                className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs transition-all duration-150 ${active ? "bg-[#332b1f]/12 scale-115" : "hover:bg-[#332b1f]/8 hover:scale-110"}`}>
                                <span className="text-sm leading-none">{emoji}</span>
                                {count > 0 && <span className="text-[10px] text-[#6b5e4d]">{count}</span>}
                              </button>
                            );
                          })}
                        </div>

                        {/* Right actions */}
                        <div className="flex items-center gap-1">
                          <span className="text-[9px] text-[#6b5e4d]/50">{timeAgo(item.createdAt)}</span>

                          {item.youtubeId && (
                            <button disabled={sharingId === item.id} title="Share"
                              onClick={async () => {
                                setSharingId(item.id);
                                try {
                                  const params = new URLSearchParams({ youtubeId: item.youtubeId!, title: item.title, caption: item.caption ?? "" });
                                  const res = await fetch(`/api/share-image?${params}`);
                                  if (!res.ok) throw new Error();
                                  const blob = await res.blob();
                                  const file = new File([blob], "sabaijai-song.png", { type: "image/png" });
                                  if (navigator.canShare?.({ files: [file] })) {
                                    await navigator.share({ files: [file], title: "Sabaijai" });
                                  } else {
                                    const link = URL.createObjectURL(blob);
                                    const a = document.createElement("a");
                                    a.href = link; a.download = "sabaijai-song.png"; a.click();
                                    URL.revokeObjectURL(link);
                                  }
                                } finally { setSharingId(null); }
                              }}
                              className="text-[#6b5e4d] hover:text-[#4e7c5f] transition-colors disabled:opacity-40">
                              <span className="material-symbols-outlined text-sm">
                                {sharingId === item.id ? "progress_activity" : "share"}
                              </span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      {/* ── Now Playing floating bar ── */}
      {nowPlaying && (
        <div className="now-playing-bar fixed bottom-20 left-1/2 -translate-x-1/2 z-40 bg-[#1a150d]/90 backdrop-blur-md text-white px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-3 max-w-xs w-[90%]">
          <span className="inline-flex items-center gap-1 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs font-medium text-green-400">PLAYING</span>
          </span>
          <p className="text-xs truncate grow">{nowPlaying.title}</p>
          <button onClick={() => setExpandedId(null)} className="shrink-0 text-white/60 hover:text-white transition-colors">
            <span className="material-symbols-outlined text-base">stop_circle</span>
          </button>
        </div>
      )}

      <BottomNav />
    </>
  );
}
