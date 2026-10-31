import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1c1917",
          borderRadius: 40,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", width: 108, height: 64 }}>
          <div style={{ width: 50, height: 64, background: "#f4efe6", borderRadius: "8px 0 0 8px" }} />
          <div style={{ width: 8, height: 76, background: "#c2412a" }} />
          <div style={{ width: 50, height: 64, background: "#f7f4ee", borderRadius: "0 8px 8px 0" }} />
        </div>
      </div>
    ),
    size,
  );
}
