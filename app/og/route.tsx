import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(_req: NextRequest) {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0b0b0b",
          color: "#e8e8e8",
        }}
      >
        <div style={{ fontSize: 56, fontWeight: 700 }}>₿ TrustMeBro — ZK ready Bitcoin Explorer</div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}

