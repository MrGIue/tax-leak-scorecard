import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

interface SectionData {
  title: string;
  earned: number;
  max: number;
}

function hexToRgb(hex: string): string {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return `${r}, ${g}, ${b}`;
}

function getBarColor(percentage: number): string {
  if (percentage >= 0.75) return "#16a34a";
  if (percentage >= 0.5) return "#ca8a04";
  return "#dc2626";
}

function getLabel(percentage: number): string {
  if (percentage >= 0.75) return "Strong";
  if (percentage >= 0.5) return "Moderate";
  return "Needs Attention";
}

function buildRingSvg(
  score: number,
  maxScore: number,
  color: string,
  size: number
): string {
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = maxScore > 0 ? score / maxScore : 0;
  const dashOffset = circumference * (1 - progress);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <circle cx="${size / 2}" cy="${size / 2}" r="${radius}" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="${strokeWidth}"/>
  <circle cx="${size / 2}" cy="${size / 2}" r="${radius}" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-dasharray="${circumference}" stroke-dashoffset="${dashOffset}" transform="rotate(-90 ${size / 2} ${size / 2})"/>
</svg>`;
}

function svgToDataUrl(svg: string): string {
  const base64 = Buffer.from(svg).toString("base64");
  return `data:image/svg+xml;base64,${base64}`;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const score = Number(searchParams.get("score") ?? 0);
    const maxScore = Number(searchParams.get("max") ?? 0);
    const tier = searchParams.get("tier") ?? "";
    const tierColor = searchParams.get("tierColor") ?? "#ca8a04";
    const primary = searchParams.get("primary") ?? "#01305C";
    const clientName = searchParams.get("client") ?? "";
    const sectionsParam = searchParams.get("sections") ?? "";

    let sections: SectionData[] = [];
    if (sectionsParam) {
      try {
        const decoded = Buffer.from(sectionsParam, "base64url").toString("utf-8");
        sections = JSON.parse(decoded);
      } catch {
        sections = [];
      }
    }

    const firstName = searchParams.get("first") ?? "";
    const lastName = searchParams.get("last") ?? "";

    const ringSize = 260;
    const ringSvg = buildRingSvg(score, maxScore, tierColor, ringSize);
    const ringSrc = svgToDataUrl(ringSvg);

    const width = 1200;
    const heroHeight = 380;
    const sectionBaseHeight = 180;
    const rowHeight = 105;
    const sectionCount = Math.max(sections.length, 1);
    const height = heroHeight + sectionBaseHeight + sectionCount * rowHeight;

    const safeName = [firstName, lastName]
      .map((s) => s.replace(/[^a-zA-Z0-9]/g, "_").replace(/_+/g, "_"))
      .filter(Boolean)
      .join("_");
    const filename = safeName
      ? `${safeName}_Tax_Leak_Results.png`
      : "Tax_Leak_Results.png";

    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            backgroundColor: "#FFFFFF",
            fontFamily: "sans-serif",
          }}
        >
          {/* Navy hero */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "56px 72px",
              background: `linear-gradient(145deg, ${primary} 0%, ${primary}E0 100%)`,
              gap: 56,
            }}
          >
            {/* Score ring */}
            <div
              style={{
                position: "relative",
                width: ringSize,
                height: ringSize,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={ringSrc}
                width={ringSize}
                height={ringSize}
                alt=""
                style={{ position: "absolute", top: 0, left: 0 }}
              />
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    fontSize: 88,
                    fontWeight: 800,
                    color: "#FFFFFF",
                    lineHeight: 1,
                  }}
                >
                  {score}
                </div>
                <div
                  style={{
                    display: "flex",
                    fontSize: 20,
                    color: "rgba(255,255,255,0.75)",
                    fontWeight: 500,
                    marginTop: 8,
                    letterSpacing: "0.04em",
                  }}
                >
                  out of {maxScore}
                </div>
              </div>
            </div>

            {/* Tier info */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                flex: 1,
                minWidth: 0,
              }}
            >
              <div
                style={{
                  display: "flex",
                  fontSize: 16,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.18em",
                  color: "rgba(255,255,255,0.55)",
                  marginBottom: 16,
                }}
              >
                {clientName ? `${clientName} · ` : ""}Your Tax Leak Score
              </div>
              <div
                style={{
                  display: "flex",
                  alignSelf: "flex-start",
                  padding: "10px 28px",
                  borderRadius: 999,
                  backgroundColor: `rgba(${hexToRgb(tierColor)}, 0.2)`,
                  border: `2px solid rgba(${hexToRgb(tierColor)}, 0.5)`,
                  marginBottom: 18,
                }}
              >
                <span
                  style={{
                    fontSize: 28,
                    fontWeight: 800,
                    color: tierColor,
                    letterSpacing: "0.02em",
                  }}
                >
                  {tier}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  fontSize: 22,
                  color: "rgba(255,255,255,0.9)",
                  lineHeight: 1.5,
                  maxWidth: 560,
                }}
              >
                Score breakdown by category below
              </div>
            </div>
          </div>

          {/* Section breakdown */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              padding: "40px 72px 48px",
              flex: 1,
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 16,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.14em",
                color: "#8B95A5",
                marginBottom: 24,
              }}
            >
              Breakdown By Category
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 18,
              }}
            >
              {sections.map((s, i) => {
                const pct = s.max > 0 ? s.earned / s.max : 0;
                const barColor = getBarColor(pct);
                const label = getLabel(pct);
                const isWeak = pct < 0.5;
                return (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      padding: "14px 18px",
                      borderRadius: 10,
                      backgroundColor: isWeak ? "#FEF2F2" : "transparent",
                      borderLeft: `5px solid ${barColor}`,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 10,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          fontSize: 22,
                          fontWeight: 600,
                          color: "#1B2B3A",
                          flex: 1,
                          paddingRight: 20,
                        }}
                      >
                        {s.title}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          fontSize: 18,
                          fontWeight: 700,
                          color: barColor,
                          padding: "4px 14px",
                          borderRadius: 6,
                          backgroundColor: `rgba(${hexToRgb(barColor)}, 0.1)`,
                        }}
                      >
                        {label} ({s.earned}/{s.max})
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        width: "100%",
                        height: 10,
                        backgroundColor: "#ECEEF2",
                        borderRadius: 5,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          width: `${Math.max(pct * 100, 3)}%`,
                          height: "100%",
                          backgroundColor: barColor,
                          borderRadius: 5,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ),
      {
        width,
        height,
        headers: {
          "Cache-Control": "public, max-age=31536000, immutable",
          "Content-Disposition": `inline; filename="${filename}"`,
        },
      }
    );
  } catch (err) {
    console.error("result-image error:", err);
    return new Response("Failed to generate image", { status: 500 });
  }
}
