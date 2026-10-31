import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1c1917",
          borderRadius: 8,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", width: 20, height: 12 }}>
          <div style={{ width: 9, height: 12, background: "#f4efe6", borderRadius: "2px 0 0 2px" }} />
          <div style={{ width: 2, height: 14, background: "#c2412a" }} />
          <div style={{ width: 9, height: 12, background: "#f7f4ee", borderRadius: "0 2px 2px 0" }} />
        </div>
      </div>
    ),
    size,
  );
}
