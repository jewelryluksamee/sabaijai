"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  collection,
  addDoc,
  onSnapshot,
  doc,
  updateDoc,
  increment,
  orderBy,
  query as fsQuery,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase-client";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";

interface Reactions {
  heart: number;
  cry: number;
  fire: number;
  music: number;
}

interface FeedItem {
  id: string;
  title: string;
  img: string;
  caption: string;
  createdAt: Timestamp | null;
  likes: number;
  youtubeId: string | null;
  reactions?: Partial<Reactions>;
}

interface SearchResult {
  videoId: string;
  title: string;
  thumbnail: string;
  channel: string;
}

const REACTION_LIST = [
  { key: "heart" as const, emoji: "❤️", label: "Love" },
  { key: "cry"   as const, emoji: "😭", label: "Moving" },
  { key: "fire"  as const, emoji: "🔥", label: "Fire" },
  { key: "music" as const, emoji: "🎵", label: "Vibe" },
];

type ReactionKey = "heart" | "cry" | "fire" | "music";

function extractYouTubeId(text: string): string | null {
  const match = text.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
}

function timeAgo(ts: Timestamp | null): string {
  if (!ts) return "just now";
  const diff = (Date.now() - ts.toMillis()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

interface VideoPreview {
  title: string;
  thumbnail: string;
  videoId: string;
}

const COLLECTION = "music_feed";

export default function MusicPage() {
  const [query, setQuery] = useState("");
  const [caption, setCaption] = useState("");
  const [preview, setPreview] = useState<VideoPreview | null>(null);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [myReactions, setMyReactions] = useState<Map<string, Set<ReactionKey>>>(new Map());
  const [sharing, setSharing] = useState(false);
  const [sharingId, setSharingId] = useState<string | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipSearchRef = useRef(false);

  // Real-time feed listener
  useEffect(() => {
    const q = fsQuery(collection(db, COLLECTION), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setFeed(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<FeedItem, "id">) })));
    });
    return unsub;
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const searchYouTube = useCallback(async (q: string) => {
    setSearching(true);
    try {
      const res = await fetch(`/api/youtube-search?q=${encodeURIComponent(q)}`);
      if (!res.ok) throw new Error("failed");
      const data: SearchResult[] = await res.json();
      setSearchResults(data);
      setShowResults(true);
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }, []);

  const fetchPreviewFromUrl = useCallback(async (videoId: string) => {
    setSearching(true);
    try {
      const res = await fetch(
        `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
      );
      if (!res.ok) throw new Error("Not found");
      const data = await res.json();
      setPreview({
        title: data.title,
        thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        videoId,
      });
      setShowResults(false);
    } catch {
      setPreview(null);
    } finally {
      setSearching(false);
    }
  }, []);

  useEffect(() => {
    if (skipSearchRef.current) {
      skipSearchRef.current = false;
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const trimmed = query.trim();

    if (!trimmed) {
      setSearchResults([]);
      setPreview(null);
      setShowResults(false);
      return;
    }

    const videoId = extractYouTubeId(trimmed);
    if (videoId) {
      // Paste URL path
      setSearchResults([]);
      setShowResults(false);
      fetchPreviewFromUrl(videoId);
      return;
    }

    // Search path — debounce 500 ms
    setPreview(null);
    debounceRef.current = setTimeout(() => {
      if (trimmed.length >= 2) searchYouTube(trimmed);
    }, 500);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, fetchPreviewFromUrl, searchYouTube]);

  function selectResult(result: SearchResult) {
    skipSearchRef.current = true;
    setPreview({
      title: result.title,
      thumbnail: result.thumbnail,
      videoId: result.videoId,
    });
    setQuery(result.title);
    setShowResults(false);
    setSearchResults([]);
  }

  async function handleShare() {
    if (!preview || sharing) return;
    setSharing(true);
    try {
      await addDoc(collection(db, COLLECTION), {
        title: preview.title,
        img: preview.thumbnail,
        caption: caption.trim(),
        youtubeId: preview.videoId,
        likes: 0,
        reactions: { heart: 0, cry: 0, fire: 0, music: 0 },
        createdAt: serverTimestamp(),
      });
      setQuery("");
      setCaption("");
      setPreview(null);
    } finally {
      setSharing(false);
    }
  }

  async function handleReact(itemId: string, key: ReactionKey) {
    const itemReactions = myReactions.get(itemId) ?? new Set<ReactionKey>();
    const already = itemReactions.has(key);

    setMyReactions((prev) => {
      const next = new Map(prev);
      const set = new Set(next.get(itemId) ?? []);
      if (already) { set.delete(key); } else { set.add(key); }
      next.set(itemId, set);
      return next;
    });

    await updateDoc(doc(db, COLLECTION, itemId), {
      [`reactions.${key}`]: increment(already ? -1 : 1),
    });
  }

  return (
    <>
      <Header />

      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute -top-[10%] -left-[5%] w-[50%] h-[50%] bg-[#c2e3c8]/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-[60%] h-[60%] bg-[#d4e8c8]/15 blur-[150px] rounded-full" />
      </div>

      <main className="relative z-10 pt-24 px-6 max-w-5xl mx-auto pb-32 grainy-texture">
        {/* Hero */}
        <section className="mb-10">
          <h2 className="text-3xl md:text-5xl font-extrabold text-[#332b1f] leading-tight">
            ฝากบทเพลงนี้ <br /> ไปปลอบประโลมหัวใจของใครสักคน :D
          </h2>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Share Input */}
          <div className="lg:col-span-4 flex flex-col gap-8">
            <div className="bg-white/100 backdrop-blur-md border border-black/100 rounded-2xl p-6">
              <label className="block text-[#2a4d32] font-semibold mb-4">
                Let&apos;s Share a Healing Song
              </label>

              {/* Search / URL input */}
              <div className="relative mb-4" ref={searchRef}>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#4e7c5f]/60 text-xl pointer-events-none">
                    search
                  </span>
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => { if (searchResults.length > 0) setShowResults(true); }}
                    placeholder="ค้นหาเพลง หรือวาง YouTube link..."
                    className="w-full bg-black/5 rounded-xl pl-11 pr-10 py-4 text-[#332b1f] placeholder-[#6b5e4d]/50 border border-black/40 outline-none focus:ring-1 focus:ring-black/30 transition-all text-sm"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    {searching && (
                      <span className="material-symbols-outlined text-black/50 text-lg animate-spin">progress_activity</span>
                    )}
                    {query && !searching && (
                      <button
                        onClick={() => { setQuery(""); setPreview(null); setSearchResults([]); setShowResults(false); }}
                        className="text-[#6b5e4d]/60 hover:text-[#332b1f] transition-colors"
                      >
                        <span className="material-symbols-outlined text-lg">close</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Search results dropdown */}
                {showResults && searchResults.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-black/20 rounded-xl shadow-lg z-50 overflow-hidden max-h-72 overflow-y-auto">
                    {searchResults.map((result) => (
                      <button
                        key={result.videoId}
                        onClick={() => selectResult(result)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[#f5f0eb] transition-colors text-left"
                      >
                        <img
                          src={result.thumbnail}
                          alt={result.title}
                          className="w-16 h-10 object-cover rounded-md shrink-0 border border-black/10"
                        />
                        <div className="min-w-0">
                          <p className="text-[#332b1f] text-xs font-semibold line-clamp-2 leading-snug">
                            {result.title}
                          </p>
                          <p className="text-[#6b5e4d] text-[10px] mt-0.5 truncate">{result.channel}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Selected video preview */}
              {preview && (
                <div className="bg-white/70 rounded-xl overflow-hidden mb-4 border border-black">
                  <div className="relative aspect-video">
                    <img className="w-full h-full object-cover" src={preview.thumbnail} alt={preview.title} />
                    <a
                      href={`https://www.youtube.com/watch?v=${preview.videoId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute inset-0 bg-black/20 flex items-center justify-center hover:bg-black/30 transition-colors"
                    >
                      <div className="w-12 h-12 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center border border-black">
                        <span className="material-symbols-outlined text-white text-2xl">play_arrow</span>
                      </div>
                    </a>
                  </div>
                  <div className="p-3 flex items-start justify-between gap-2">
                    <h4 className="font-bold text-[#332b1f] text-sm line-clamp-2">{preview.title}</h4>
                    <button
                      onClick={() => { setPreview(null); setQuery(""); }}
                      className="shrink-0 text-[#6b5e4d]/60 hover:text-[#a8364b] transition-colors mt-0.5"
                    >
                      <span className="material-symbols-outlined text-base">close</span>
                    </button>
                  </div>
                </div>
              )}

              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="w-full bg-black/5 rounded-xl px-5 py-4 text-[#332b1f] placeholder-[#6b5e4d]/50 border border-black/40 outline-none focus:ring-1 focus:ring-black/30 transition-all resize-none mb-4 text-sm"
                placeholder="Add a caption... (optional)"
                rows={3}
              />

              <button
                onClick={handleShare}
                disabled={!preview || sharing}
                className="w-full h-12 border border-black/40 bg-[#7c5cbf] hover:bg-[#6b4aad] text-white rounded-xl text-base font-bold shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span>{sharing ? "Sharing..." : "Share to Community"}</span>
                <span className="material-symbols-outlined">send</span>
              </button>
            </div>
          </div>

          {/* Right: Pinterest Masonry Feed */}
          <div className="lg:col-span-8">
            <h3 className="text-xl font-bold text-[#332b1f] mb-5">Healing Songs</h3>

            {feed.length === 0 && (
              <div className="bg-white/30 border border-black rounded-2xl p-10 text-center text-[#6b5e4d]">
                <span className="material-symbols-outlined text-4xl mb-3 block text-black/10">music_note</span>
                <p className="text-sm">No songs shared yet. Be the first!</p>
              </div>
            )}

            {/* Masonry Pinterest-style columns */}
            <div className="columns-2 md:columns-2 lg:columns-3 gap-3">
              {feed.map((item) => {
                const itemReactions = myReactions.get(item.id) ?? new Set<ReactionKey>();
                return (
                  <div
                    key={item.id}
                    className="break-inside-avoid mb-3 bg-white/60 hover:bg-white/80 backdrop-blur-md border border-black/80 rounded-2xl overflow-hidden transition-all hover:shadow-lg hover:-translate-y-0.5 group"
                  >
                    {item.youtubeId ? (
                      <a
                        href={`https://www.youtube.com/watch?v=${item.youtubeId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block relative aspect-video"
                      >
                        <img className="w-full h-full object-cover" src={item.img} alt={item.title} />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                          <div className="w-10 h-10 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center border border-white/60 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="material-symbols-outlined text-white text-xl">play_arrow</span>
                          </div>
                        </div>
                      </a>
                    ) : (
                      <div className="relative aspect-video bg-[#e8ece4]">
                        <img className="w-full h-full object-cover" src={item.img} alt={item.title} />
                        <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                          <span className="material-symbols-outlined text-white/80 text-3xl">music_note</span>
                        </div>
                      </div>
                    )}

                    <div className="p-3">
                      <h4 className="font-bold text-[#332b1f] text-sm leading-snug line-clamp-2 mb-1">
                        {item.title}
                      </h4>
                      {item.caption && (
                        <p className="text-[#6b5e4d] text-xs leading-relaxed mb-2 italic line-clamp-3">
                          &ldquo;{item.caption}&rdquo;
                        </p>
                      )}

                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-black/10">
                        <div className="flex items-center gap-1">
                          {REACTION_LIST.map(({ key, emoji, label }) => {
                            const count = item.reactions?.[key] ?? 0;
                            const active = itemReactions.has(key);
                            return (
                              <button
                                key={key}
                                onClick={() => handleReact(item.id, key)}
                                title={label}
                                className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs font-medium transition-all ${
                                  active ? "bg-[#332b1f]/10 scale-110" : "hover:bg-[#332b1f]/8 hover:scale-105"
                                }`}
                              >
                                <span className="text-sm leading-none">{emoji}</span>
                                {count > 0 && (
                                  <span className="text-[10px] text-[#6b5e4d] leading-none">{count}</span>
                                )}
                              </button>
                            );
                          })}
                        </div>

                        <div className="flex items-center gap-1">
                          <span className="text-[9px] text-[#6b5e4d]/60">{timeAgo(item.createdAt)}</span>
                          {item.youtubeId && (
                            <button
                              disabled={sharingId === item.id}
                              title="Share"
                              onClick={async () => {
                                setSharingId(item.id);
                                try {
                                  const params = new URLSearchParams({
                                    youtubeId: item.youtubeId!,
                                    title: item.title,
                                    caption: item.caption ?? "",
                                  });
                                  const res = await fetch(`/api/share-image?${params}`);
                                  if (!res.ok) throw new Error("failed");
                                  const blob = await res.blob();
                                  const file = new File([blob], "sabaijai-song.png", { type: "image/png" });
                                  if (navigator.canShare?.({ files: [file] })) {
                                    await navigator.share({ files: [file], title: "Sabaijai" });
                                  } else {
                                    const link = URL.createObjectURL(blob);
                                    const a = document.createElement("a");
                                    a.href = link;
                                    a.download = "sabaijai-song.png";
                                    a.click();
                                    URL.revokeObjectURL(link);
                                  }
                                } finally {
                                  setSharingId(null);
                                }
                              }}
                              className="flex items-center text-[#6b5e4d] hover:text-[#4e7c5f] transition-colors disabled:opacity-40 ml-1"
                            >
                              <span className="material-symbols-outlined text-base">
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

      <BottomNav />
    </>
  );
}
