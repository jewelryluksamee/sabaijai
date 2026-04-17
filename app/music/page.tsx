"use client";

import { useState, useEffect, useCallback } from "react";
import {
  collection,
  addDoc,
  onSnapshot,
  doc,
  updateDoc,
  increment,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase-client";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";

interface FeedItem {
  id: string;
  title: string;
  img: string;
  caption: string;
  createdAt: Timestamp | null;
  likes: number;
  liked: boolean;
  youtubeId: string | null;
}

function extractYouTubeId(url: string): string | null {
  const match = url.match(
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
  const [url, setUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [preview, setPreview] = useState<VideoPreview | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [sharing, setSharing] = useState(false);
  const [sharingId, setSharingId] = useState<string | null>(null);

  // Real-time listener
  useEffect(() => {
    const q = query(collection(db, COLLECTION), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setFeed(
        snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<FeedItem, "id" | "liked">),
          liked: false,
        }))
      );
    });
    return unsub;
  }, []);

  const fetchPreview = useCallback(async (videoId: string) => {
    setLoadingPreview(true);
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
    } catch {
      setPreview(null);
    } finally {
      setLoadingPreview(false);
    }
  }, []);

  useEffect(() => {
    const videoId = extractYouTubeId(url);
    if (!videoId) {
      setPreview(null);
      return;
    }
    fetchPreview(videoId);
  }, [url, fetchPreview]);

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
        createdAt: serverTimestamp(),
      });
      setUrl("");
      setCaption("");
      setPreview(null);
    } finally {
      setSharing(false);
    }
  }

  async function handleLike(id: string) {
    const alreadyLiked = likedIds.has(id);
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (alreadyLiked) { next.delete(id); } else { next.add(id); }
      return next;
    });
    await updateDoc(doc(db, COLLECTION, id), {
      likes: increment(alreadyLiked ? -1 : 1),
    });
  }

  return (
    <>
      <Header />

      {/* Background blobs matching home page */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute -top-[10%] -left-[5%] w-[50%] h-[50%] bg-[#c2e3c8]/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-[60%] h-[60%] bg-[#d4e8c8]/15 blur-[150px] rounded-full" />
      </div>

      <main className="relative z-10 pt-24 px-6 max-w-5xl mx-auto pb-32 grainy-texture">
        {/* Hero */}
        <section className="mb-12">
          <h2 className="text-3xl md:text-5xl font-extrabold text-[#332b1f] leading-tight">
            ฝากบทเพลงนี้ <br/> ไปปลอบประโลมหัวใจของใครสักคน :D
          </h2>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Share Input */}
          <div className="lg:col-span-5 flex flex-col gap-8">
            <div className="bg-white/100 backdrop-blur-md border border-black/100 rounded-2xl p-8">
              <label className="block text-[#2a4d32] font-semibold mb-4">
                Let's Share a Healing Song
              </label>

              {/* URL Input */}
              <div className="relative mb-6">
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Paste YouTube link..."
                  className="w-full bg-black/12 rounded-xl px-5 py-4 text-[#332b1f] placeholder-[#6b5e4d]/50 border border-black/40 outline-none focus:ring-1 focus:ring-black/30 transition-all"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {loadingPreview ? (
                    <span className="material-symbols-outlined text-black/60 animate-spin">
                      progress_activity
                    </span>
                  ) : (
                    <span className="material-symbols-outlined text-[#4e7c5f]/40">
                      link
                    </span>
                  )}
                </div>
              </div>

              {/* Preview Card */}
              {preview && (
                <div className="bg-white/70 rounded-xl overflow-hidden mb-6 border border-black">
                  <div className="relative aspect-video">
                    <img
                      className="w-full h-full object-cover"
                      src={preview.thumbnail}
                      alt={preview.title}
                    />
                    <a
                      href={`https://www.youtube.com/watch?v=${preview.videoId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute inset-0 bg-black/20 flex items-center justify-center hover:bg-black/30 transition-colors"
                    >
                      <div className="w-14 h-14 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center border border-black">
                        <span className="material-symbols-outlined text-white text-3xl">
                          play_arrow
                        </span>
                      </div>
                    </a>
                  </div>
                  <div className="p-4">
                    <h4 className="font-bold text-[#332b1f] mb-1 line-clamp-2">
                      {preview.title}
                    </h4>
                    <p className="text-[#6b5e4d] text-sm">YouTube</p>
                  </div>
                </div>
              )}

              {!preview && !loadingPreview && url && extractYouTubeId(url) === null && (
                <p className="text-sm text-[#a8364b] mb-4">
                  Please paste a valid YouTube link.
                </p>
              )}

              {/* Optional Caption */}
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="w-full bg-black/12 rounded-xl px-5 py-4 text-[#332b1f] placeholder-[#6b5e4d]/50 border border-black/40 outline-none focus:ring-1 focus:ring-black/30 transition-all resize-none mb-4"
                placeholder="Add a caption... (optional)"
                rows={3}
              />

              <button
                onClick={handleShare}
                disabled={!preview || sharing}
                className="w-full h-14 border border-black/40 bg-[#7c5cbf] hover:bg-[#6b4aad] text-white rounded-xl text-base font-bold shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span>{sharing ? "Sharing..." : "Share to Community"}</span>
                <span className="material-symbols-outlined">send</span>
              </button>
            </div>
          </div>

          {/* Right: Feed */}
          <div className="lg:col-span-7">
            <h3 className="text-xl font-bold text-[#332b1f] mb-6">
              Healing Songs
            </h3>

            {feed.length === 0 && (
              <div className="bg-white/30 border border-black rounded-2xl p-10 text-center text-[#6b5e4d]">
                <span className="material-symbols-outlined text-4xl mb-3 block text-black/10">music_note</span>
                <p className="text-sm">No songs shared yet. Be the first!</p>
              </div>
            )}

            <div className="space-y-4">
              {feed.map((item) => {
                const liked = likedIds.has(item.id);
                return (
                  <div
                    key={item.id}
                    className="bg-white/40 hover:bg-white/60 backdrop-blur-md border border-black transition-all rounded-2xl p-5 flex gap-5"
                  >
                    <div className="w-28 h-28 shrink-0 rounded-xl overflow-hidden relative border border-black">
                      {item.youtubeId ? (
                        <a
                          href={`https://www.youtube.com/watch?v=${item.youtubeId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-full h-full"
                        >
                          <img
                            className="w-full h-full object-cover"
                            src={item.img}
                            alt={item.title}
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors">
                            <span className="material-symbols-outlined text-white/90">
                              play_arrow
                            </span>
                          </div>
                        </a>
                      ) : (
                        <>
                          <img
                            className="w-full h-full object-cover"
                            src={item.img}
                            alt={item.title}
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                            <span className="material-symbols-outlined text-white/80">
                              music_note
                            </span>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="grow min-w-0">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-[#332b1f] leading-snug pr-3 line-clamp-2">
                          {item.title}
                        </h4>
                        <span className="text-[10px] text-[#6b5e4d] shrink-0">
                          {timeAgo(item.createdAt)}
                        </span>
                      </div>
                      {item.caption && (
                        <p className="text-[#6b5e4d] text-sm leading-relaxed mb-3 italic line-clamp-2">
                          &ldquo;{item.caption}&rdquo;
                        </p>
                      )}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleLike(item.id)}
                          className="flex items-center gap-1.5 text-xs font-medium text-[#6b5e4d] hover:text-[#a8364b] transition-colors"
                        >
                          <span
                            className="material-symbols-outlined text-lg"
                            style={
                              liked
                                ? { fontVariationSettings: "'FILL' 1", color: "#a8364b" }
                                : undefined
                            }
                          >
                            favorite
                          </span>
                          <span className={liked ? "text-[#a8364b]" : ""}>
                            {item.likes}
                          </span>
                        </button>
                        {item.youtubeId && (
                          <button
                            disabled={sharingId === item.id}
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
                                  const url = URL.createObjectURL(blob);
                                  const a = document.createElement("a");
                                  a.href = url;
                                  a.download = "sabaijai-song.png";
                                  a.click();
                                  URL.revokeObjectURL(url);
                                }
                              } finally {
                                setSharingId(null);
                              }
                            }}
                            className="flex items-center gap-1.5 text-xs font-medium text-[#6b5e4d] hover:text-[#4e7c5f] transition-colors disabled:opacity-40"
                          >
                            <span className="material-symbols-outlined text-lg">
                              {sharingId === item.id ? "progress_activity" : "share"}
                            </span>
                          </button>
                        )}
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
