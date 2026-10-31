import { ImageResponse } from "next/og";

export const alt = "Sitasi — Generator daftar pustaka gratis untuk mahasiswa Indonesia";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "linear-gradient(135deg, #064e3b 0%, #047857 55%, #10b981 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 32, fontWeight: 700, letterSpacing: 4, opacity: 0.85 }}>SITASI</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 76, fontWeight: 800, lineHeight: 1.05 }}>Daftar pustaka rapi</div>
          <div style={{ display: "flex", fontSize: 76, fontWeight: 800, lineHeight: 1.05 }}>dalam hitungan detik.</div>
          <div style={{ display: "flex", fontSize: 34, marginTop: 28, opacity: 0.9 }}>
            Tempel DOI, ISBN, atau link jurnal SINTA → APA 7 · IEEE · Harvard
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 28 }}>
          <div style={{ display: "flex", gap: 16 }}>
            {["Gratis", "Tanpa akun", "Siap tempel ke Word"].map((t) => (
              <div key={t} style={{ display: "flex", padding: "10px 22px", borderRadius: 999, background: "rgba(255,255,255,0.18)" }}>
                {t}
              </div>
            ))}
          </div>
          <div style={{ display: "flex", opacity: 0.85 }}>sitasi-one.vercel.app</div>
        </div>
      </div>
    ),
    size,
  );
}
