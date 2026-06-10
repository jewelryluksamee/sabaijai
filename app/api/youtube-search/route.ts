import { NextRequest, NextResponse } from "next/server";

const INNERTUBE_KEY = "AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8";

interface VideoRenderer {
  videoId: string;
  title: { runs: { text: string }[] };
  ownerText: { runs: { text: string }[] };
  thumbnail: { thumbnails: { url: string; width: number; height: number }[] };
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q) return NextResponse.json([]);

  try {
    const res = await fetch(
      `https://www.youtube.com/youtubei/v1/search?key=${INNERTUBE_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          context: {
            client: {
              clientName: "WEB",
              clientVersion: "2.20231121.09.00",
              hl: "th",
              gl: "TH",
            },
          },
          query: q,
        }),
        signal: AbortSignal.timeout(8000),
      }
    );

    if (!res.ok) return NextResponse.json({ error: "Search failed" }, { status: res.status });

    const data = await res.json();

    const items: VideoRenderer[] = [];
    const contents =
      data?.contents?.twoColumnSearchResultsRenderer?.primaryContents
        ?.sectionListRenderer?.contents ?? [];

    for (const section of contents) {
      const sectionItems = section?.itemSectionRenderer?.contents ?? [];
      for (const item of sectionItems) {
        if (item?.videoRenderer?.videoId) {
          items.push(item.videoRenderer as VideoRenderer);
        }
      }
    }

    const results = items.slice(0, 8).map((v) => ({
      videoId: v.videoId,
      title: v.title?.runs?.map((r) => r.text).join("") ?? "",
      thumbnail:
        v.thumbnail?.thumbnails?.slice(-1)[0]?.url ??
        `https://img.youtube.com/vi/${v.videoId}/mqdefault.jpg`,
      channel: v.ownerText?.runs?.[0]?.text ?? "",
    }));

    return NextResponse.json(results);
  } catch {
    return NextResponse.json({ error: "Search unavailable" }, { status: 503 });
  }
}
