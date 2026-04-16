"use client";

import { useState, useEffect, useCallback } from "react";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";

interface FeedItem {
  id: number;
  title: string;
  img: string;
  caption: string;
  time: string;
  likes: number;
  liked: boolean;
  youtubeId: string | null;
}

const initialFeed: FeedItem[] = [];

function extractYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
}

interface VideoPreview {
  title: string;
  thumbnail: string;
  videoId: string;
}

export default function MusicPage() {
  const [url, setUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [preview, setPreview] = useState<VideoPreview | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [feed, setFeed] = useState<FeedItem[]>(initialFeed);

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

  function handleShare() {
    if (!preview) return;
    const newItem: FeedItem = {
      id: Date.now(),
      title: preview.title,
      img: preview.thumbnail,
      caption: caption.trim(),
      time: "just now",
      likes: 0,
      liked: false,
      youtubeId: preview.videoId,
    };
    setFeed((prev) => [newItem, ...prev]);
    setUrl("");
    setCaption("");
    setPreview(null);
  }

  function handleLike(id: number) {
    setFeed((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              liked: !item.liked,
              likes: item.liked ? item.likes - 1 : item.likes + 1,
            }
          : item
      )
    );
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
                  placeholder="Paste YouTube link here..."
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
                disabled={!preview}
                className="w-full h-14 border border-black/40 bg-[#7c5cbf] hover:bg-[#6b4aad] text-white rounded-xl text-base font-bold shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span>Share to Community</span>
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
              {feed.map((item) => (
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
                        {item.time}
                      </span>
                    </div>
                    {item.caption && (
                      <p className="text-[#6b5e4d] text-sm leading-relaxed mb-3 italic line-clamp-2">
                        "{item.caption}"
                      </p>
                    )}
                    <button
                      onClick={() => handleLike(item.id)}
                      className="flex items-center gap-1.5 text-xs font-medium text-[#6b5e4d] hover:text-[#a8364b] transition-colors"
                    >
                      <span
                        className="material-symbols-outlined text-lg"
                        style={
                          item.liked
                            ? { fontVariationSettings: "'FILL' 1", color: "#a8364b" }
                            : undefined
                        }
                      >
                        favorite
                      </span>
                      <span className={item.liked ? "text-[#a8364b]" : ""}>
                        {item.likes}
                      </span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <BottomNav />
    </>
  );
}
