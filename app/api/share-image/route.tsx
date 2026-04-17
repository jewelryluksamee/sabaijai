import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import { join } from "path";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const youtubeId = searchParams.get("youtubeId") ?? "";
  const title = searchParams.get("title") ?? "";
  const caption = searchParams.get("caption") ?? "";

  const thumbnailUrl = `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
  const logoSrc = `${origin}/2.png`;

  const maliFontData = readFileSync(join(process.cwd(), "public", "Mali-Regular.ttf"));

  return new ImageResponse(
    (
      <div
        style={{
          width: "1080px",
          height: "1920px",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#fdf8ef",
          position: "relative",
          overflow: "hidden",
          fontFamily: "Mali",
        }}
      >
        {/* BG blobs */}
        <div style={{ position: "absolute", top: "-180px", left: "-120px", width: "700px", height: "700px", borderRadius: "9999px", backgroundColor: "#c2e3c8", opacity: 0.4, filter: "blur(100px)", display: "flex" }} />
        <div style={{ position: "absolute", bottom: "-150px", right: "-100px", width: "750px", height: "750px", borderRadius: "9999px", backgroundColor: "#d4e8c8", opacity: 0.35, filter: "blur(120px)", display: "flex" }} />
        <div style={{ position: "absolute", top: "800px", right: "-60px", width: "400px", height: "400px", borderRadius: "9999px", backgroundColor: "#e8d8a8", opacity: 0.25, filter: "blur(80px)", display: "flex" }} />

        {/* Dot grid top-right */}
        <div style={{ position: "absolute", top: "72px", right: "80px", display: "flex", flexDirection: "column", gap: "16px" }}>
          {[0,1,2,3].map((row) => (
            <div key={row} style={{ display: "flex", gap: "16px" }}>
              {[0,1,2,3].map((col) => (
                <div key={col} style={{ width: "7px", height: "7px", borderRadius: "9999px", backgroundColor: "#c8b89a", opacity: 0.45, display: "flex" }} />
              ))}
            </div>
          ))}
        </div>

        {/* Dot grid bottom-left */}
        <div style={{ position: "absolute", bottom: "150px", left: "80px", display: "flex", flexDirection: "column", gap: "16px" }}>
          {[0,1,2,3].map((row) => (
            <div key={row} style={{ display: "flex", gap: "16px" }}>
              {[0,1,2,3].map((col) => (
                <div key={col} style={{ width: "7px", height: "7px", borderRadius: "9999px", backgroundColor: "#a0b890", opacity: 0.45, display: "flex" }} />
              ))}
            </div>
          ))}
        </div>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "80px 80px 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
            <div
              style={{
                width: "80px", height: "80px",
                borderRadius: "22px",
                backgroundColor: "#fff9a0",
                border: "2.5px solid #000",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "3px 3px 0 #000",
              }}
            >
              <img src={logoSrc} style={{ width: "56px", height: "56px", objectFit: "contain" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              <span style={{ fontSize: "44px", fontWeight: 800, color: "#332b1f", letterSpacing: "2px" }}>sabaijai</span>
              <span style={{ fontSize: "16px", color: "#9a8c7d", letterSpacing: "5px", textTransform: "uppercase" }}>สบายใจ</span>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              backgroundColor: "#d4e8c8",
              border: "2px solid #000",
              borderRadius: "9999px",
              padding: "14px 30px",
              boxShadow: "3px 3px 0 #000",
            }}
          >
            <span style={{ fontSize: "22px", color: "#2a4d32", fontWeight: 700 }}>เพลงแนะนำ</span>
          </div>
        </div>

        {/* Divider */}
        <div style={{ margin: "44px 80px 0", height: "2px", backgroundColor: "#e0d5c5", display: "flex" }} />

        {/* Headline */}
        <div style={{ display: "flex", flexDirection: "column", padding: "52px 80px 0", gap: "10px" }}>
          <span style={{ fontSize: "26px", color: "#9a8c7d", letterSpacing: "4px", textTransform: "uppercase", fontWeight: 600 }}>
            อยากให้ลองฟัง
          </span>
          <span style={{ fontSize: "56px", fontWeight: 800, color: "#332b1f", lineHeight: 1.2 }}>
            {title}
          </span>
        </div>

        {/* Thumbnail */}
        <div style={{ display: "flex", justifyContent: "center", padding: "44px 80px 0" }}>
          <div
            style={{
              display: "flex",
              position: "relative",
              borderRadius: "28px",
              overflow: "hidden",
              border: "2.5px solid #000",
              boxShadow: "8px 8px 0px #000",
              width: "920px",
              height: "518px",
            }}
          >
            <img src={thumbnailUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        </div>

        {/* Caption card */}
        {caption ? (
          <div
            style={{
              display: "flex",
              margin: "44px 80px 0",
              backgroundColor: "#fff",
              border: "2px solid #000",
              borderRadius: "24px",
              padding: "36px 52px",
              boxShadow: "5px 5px 0px #000",
              position: "relative",
            }}
          >
            <span style={{ fontSize: "34px", color: "#6b5e4d", fontStyle: "italic", lineHeight: 1.55 }}>
              &ldquo;{caption}&rdquo;
            </span>
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              margin: "44px 80px 0",
              backgroundColor: "#f0f8f0",
              border: "2px solid #000",
              borderRadius: "24px",
              padding: "32px 52px",
              boxShadow: "5px 5px 0px #000",
            }}
          >
            <span style={{ fontSize: "32px", color: "#4e7c5f", fontStyle: "italic", lineHeight: 1.5 }}>
              &ldquo;เพลงนี้ช่วยให้ใจสบายขึ้นนะ ลองฟังดูนะ&rdquo;
            </span>
          </div>
        )}

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "auto",
            borderTop: "2px solid #e0d5c5",
            padding: "36px 80px 80px",
          }}
        >
          <span style={{ fontSize: "22px", color: "#b8a898", letterSpacing: "1px" }}>
            พื้นที่ปลอดภัย ให้ใจได้พัก
          </span>
          <div style={{ display: "flex", backgroundColor: "#332b1f", borderRadius: "12px", padding: "14px 28px", boxShadow: "3px 3px 0 #a09080" }}>
            <span style={{ fontSize: "22px", color: "#fff9a0", fontWeight: 700, letterSpacing: "1px" }}>sabaijai.app</span>
          </div>
        </div>
      </div>
    ),
    {
      width: 1080,
      height: 1920,
      fonts: [
        { name: "Mali", data: maliFontData, weight: 400 as const, style: "normal" as const },
      ],
    }
  );
}
