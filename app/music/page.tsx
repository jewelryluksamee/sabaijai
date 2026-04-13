import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";

const feedItems = [
  {
    sharedBy: "Emily",
    byColor: "text-[#22648e]",
    title: "Rainy Night in Paris",
    caption:
      "This always helps me ground myself when things feel a bit too loud. Close your eyes and listen to the raindrops.",
    time: "2m ago",
    likes: 24,
    comments: 8,
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDzB1aJMhHYUevGMMh5QRdkX3dLuWQnWA_vbQF9wx_WEww9PrqD0TzBMlXBqWxqcQQKGK22EqZQ-80o2PTDXVxKB7FOyc5oOkGRZMsIOXqb0MxwPEMUfNWf04yrvBX7y3McMYGiaAcf79m1sGyE6kXA3KeLvF9rtzgesgcZUFIiKFHc-DVFutl3TjYL2DdRasx-vC6FtoP7fZGD_h32YsFVCZWgPf_y7HW2QF9fFQm4Nq7Op9rGtiDIcmCItHRtoMUC4-mLzhmAqho4",
    liked: false,
  },
  {
    sharedBy: "Marcus",
    byColor: "text-[#3c6942]",
    title: "Deep Ocean Whispers",
    caption:
      "Found this gem today. It's like a warm hug for your ears. Highly recommend for evening meditation.",
    time: "15m ago",
    likes: 102,
    comments: 15,
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBZYYC6VSA4SQ2o06lRelr5LntGQb81uQexmRfXZCSC3LW0A22PfBsfqMsXEd1WhQ8yGOKNLmpPPNjPLlKWe45iwEA6JfrgprGgJmj57aSwdO2bI6fU_mh8IhPmGUMi8MtcZ48Ew0oBu6ETpg4QBgrjB3Vo4-HRmrKtUAO2iOgPIjnC5mCZCJ2cb3EnQO8CWs4cPbsHBn1D-5DLGrfTiF5VbO3diMIu0NPZ_9zmlFZY013Q5qGCEaHUWkfgHybf9Yjx3DGdTkKhajJq",
    liked: true,
  },
  {
    sharedBy: "Sarah",
    byColor: "text-[#5c4981]",
    title: "Acoustic Dreams Vol. 2",
    caption: "Gentle strings for a gentle heart.",
    time: "1h ago",
    likes: 45,
    comments: 3,
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDCOtZ5-NxVv4o0c_1lSBFgPbJaKUJLxSzVSVzIaM_-QfJDGjp5C2NLheqnN8Ey9W3nfkkueH5-_LpREZvwq6Zt9YePvEIig3yNc0w3Q1YN7dxzia-zd4hU-NX-9u9rxaEfIckKNyEEHSItUrij1bYiq3i1IyyNDK7zR-pYi-QeVF454H-mnbz6gg81DnAQ2bb7Ls0yPs94tLmQjeebpP603M-jsVeQ9utyWnDocEkFJeWjaOHyicOI1H1ShN5wpNoaSLd5gFalmnt0",
    liked: false,
  },
];

export default function MusicPage() {
  return (
    <>
      <Header />
      <main className="pt-24 px-6 max-w-5xl mx-auto pb-32">
        {/* Hero */}
        <section className="mb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <span className="inline-block px-4 py-1 rounded-full bg-[#bdefbe] text-[#2f5b36] text-xs font-semibold mb-4 tracking-wider uppercase">
                Active Session
              </span>
              <h2 className="text-4xl md:text-5xl font-[var(--font-headline)] font-extrabold text-[#353136] leading-tight">
                Listening to music together for comfort
              </h2>
            </div>
            <div className="flex -space-x-4">
              {[
                "https://lh3.googleusercontent.com/aida-public/AB6AXuDHg_GJuw7hrNiW5f-SZleiJ155CvlVf33rtmnVV07DLjAExgrJ8xedrRBV-aKhvh9VWu9xWB8p_68lw8OtpEmwo2qxAZPSXdAiPjbM_L9OQPr7qZgTKEJSQz4Q_J2Vs3CSESoBpJv2PjZrI8v_5T7e_FINjqi61z0sFwqWfJIFYarBWt7iYNvHmNNq7uR3ITquuKo5EhCGIQhwfwitr5hxoeyw3K4nl7PAls8Qg79BzeNJTtL4fu4zPByEhcBAqFWyEW334erQWmkq",
                "https://lh3.googleusercontent.com/aida-public/AB6AXuCQPaHMz5ZUuZrsvyb52enf1kof3KfxI5fyshOL-LS5KuIqKC8EsWPmSaVa9oWf0JUdFzq_dpznaKVCg4KBrqA3EG5jqO_sf_q7G80LNJPWaY8b9EQswdzT7zQe9cB4ih6rI9cRey3gCDkNQNPwiCAR0hMpev4pI92eBFdiNkKKcicrBsEpKlsVn2vg8hAOAaCpUXT0CZzBus0RS0Bw682qSjTsAFEI5pcbKCOnmGM-qU1RKROI6Wcr0-WvGMmUQ-Cd2VlNtg_ODbTD",
                "https://lh3.googleusercontent.com/aida-public/AB6AXuBMZP6F3HCaxECFQZMoMAFvlrUb_ww2rCGtYrVINslN7iJzfU2M_rat9-QYdOr22-feB6JHszgZOgce8yflWCBurWlJOCkztuoivWWrwJGltnJuB6jVj8M3TFU_ic8QDgCQkfG6aT8TJgnm_VWMIs1xbXZH8fVJI94WqdGm79oyQlBmLzcJ-Fu74xF7vwYW3LlqLvtX6en7orTkl6rDkXSF-ONlWtyaEdz41njP5SaO7ZlriWBOEBiEhXyF8KeTm8CIIQ109MLg1QMR",
              ].map((src, i) => (
                <img
                  key={i}
                  className="w-12 h-12 rounded-full border-4 border-[#fef8fb] object-cover"
                  src={src}
                  alt="Listener"
                />
              ))}
              <div className="w-12 h-12 rounded-full border-4 border-[#fef8fb] bg-[#d6beff] flex items-center justify-center text-[#4b386e] text-xs font-bold font-[var(--font-headline)]">
                +12
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Share Input */}
          <div className="lg:col-span-5 flex flex-col gap-8">
            <div className="bg-[#f8f2f6] rounded-xl p-8 relative overflow-hidden grainy-texture">
              <div className="relative z-10">
                <label className="block text-[#69558e] font-[var(--font-headline)] font-semibold mb-4">
                  Share a Healing Note
                </label>

                {/* URL Input */}
                <div className="relative group mb-6">
                  <input
                    type="text"
                    placeholder="Paste YouTube link here..."
                    className="w-full bg-[#ede6eb] rounded-lg px-5 py-4 text-[#353136] placeholder-[#625e63]/50 border-none outline-none focus:ring-2 focus:ring-[#69558e]/20 transition-all"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <span className="material-symbols-outlined text-[#69558e]/40">
                      link
                    </span>
                  </div>
                </div>

                {/* Preview Card */}
                <div className="bg-white rounded-lg overflow-hidden mb-6 shadow-sm">
                  <div className="relative aspect-video">
                    <img
                      className="w-full h-full object-cover"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuBAg_wYwDdd9mOJGR-DfP-QsQWLfHiS-UYpWUUVIQAiUbJLIUTZAMapGnXgt2RiSSkwrbhLZi6mBW0YQNVP-_9te1LoH0S6r1IrRstDkcdIzAkzYqUj0XC3c2EI36vTnTregrrs-JluviCvlVQyxUQzsspIkdY34Hc04t6sNLpGam0_LvtP6kVFby5KGgyWVVX_RDl5PPVYPCxHBEfJG568YEQwGU-jTCjf3QN4HDc-ArsBPdaXY1SuNsgDZIKSdGR8HLaMva6z-WAf"
                      alt="Music preview"
                    />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <div className="w-14 h-14 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center border border-white/40">
                        <span className="material-symbols-outlined text-white text-3xl">
                          play_arrow
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="p-5">
                    <h4 className="font-[var(--font-headline)] font-bold text-lg text-[#353136] mb-1">
                      Morning Serenity - Lo-fi Chill
                    </h4>
                    <p className="text-[#625e63] text-sm">YouTube • 3:45</p>
                  </div>
                </div>

                <textarea
                  className="w-full bg-[#ede6eb] rounded-lg px-5 py-4 text-[#353136] placeholder-[#625e63]/50 border-none outline-none focus:ring-2 focus:ring-[#69558e]/20 transition-all resize-none mb-6"
                  placeholder="Write a Healing Caption... How does this song make you feel?"
                  rows={4}
                />

                <button className="w-full h-14 bg-gradient-to-r from-[#69558e] to-[#5c4981] text-[#fef7ff] rounded-xl font-[var(--font-headline)] font-bold text-lg shadow-lg hover:opacity-90 transition-all flex items-center justify-center gap-2">
                  <span>Share with the group</span>
                  <span className="material-symbols-outlined">send</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right: Feed */}
          <div className="lg:col-span-7">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-[var(--font-headline)] font-bold text-[#353136]">
                Shared for Comfort
              </h3>
              <div className="flex gap-2">
                <span className="px-3 py-1 rounded-full bg-[#f3ecf1] text-[#625e63] text-xs font-medium">
                  Newest
                </span>
                <span className="px-3 py-1 rounded-full bg-[#69558e]/10 text-[#69558e] text-xs font-medium">
                  Most Liked
                </span>
              </div>
            </div>

            <div className="space-y-6">
              {feedItems.map((item) => (
                <div
                  key={item.title}
                  className="group bg-[#f8f2f6] hover:bg-[#ede6eb] transition-all rounded-xl p-6 flex flex-col md:flex-row gap-6"
                >
                  <div className="w-full md:w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden relative">
                    <img
                      className="w-full h-full object-cover"
                      src={item.img}
                      alt={item.title}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="material-symbols-outlined text-white/80">
                        music_note
                      </span>
                    </div>
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p
                          className={`text-xs font-bold ${item.byColor} mb-1 uppercase tracking-tighter`}
                        >
                          Shared by {item.sharedBy}
                        </p>
                        <h4 className="font-[var(--font-headline)] font-bold text-lg leading-tight text-[#353136]">
                          {item.title}
                        </h4>
                      </div>
                      <span className="text-[10px] text-[#625e63] font-medium">
                        {item.time}
                      </span>
                    </div>
                    <p className="text-[#625e63] text-sm leading-relaxed mb-4 italic">
                      "{item.caption}"
                    </p>
                    <div className="flex items-center gap-4">
                      <button className="flex items-center gap-1.5 text-xs font-medium text-[#625e63] hover:text-[#a8364b] transition-colors">
                        <span
                          className="material-symbols-outlined text-lg"
                          style={
                            item.liked
                              ? { fontVariationSettings: "'FILL' 1" }
                              : undefined
                          }
                        >
                          favorite
                        </span>
                        <span className={item.liked ? "text-[#a8364b]" : ""}>
                          {item.likes}
                        </span>
                      </button>
                      <button className="flex items-center gap-1.5 text-xs font-medium text-[#625e63] hover:text-[#69558e] transition-colors">
                        <span className="material-symbols-outlined text-lg">
                          chat_bubble
                        </span>
                        <span>{item.comments}</span>
                      </button>
                    </div>
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
