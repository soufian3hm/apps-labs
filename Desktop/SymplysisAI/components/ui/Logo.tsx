import Image from "next/image";
import { BRAND_NAME, BRAND_LOGO_URL } from "@/lib/brand";

type LogoProps = {
  size?: number;
  textColor?: string;
  accentColor?: string;
};

export function Logo({
  size = 28,
  textColor,
  accentColor = "var(--brand)",
}: LogoProps) {
  const isCustomTextColor = Boolean(textColor);

  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
      <Image
        src={BRAND_LOGO_URL}
        alt=""
        aria-hidden="true"
        width={size}
        height={size}
        unoptimized
        style={{ width: size, height: size, objectFit: "contain", flexShrink: 0 }}
      />
      <span style={{ fontWeight: 700, letterSpacing: "-0.018em", fontSize: "1.0625rem" }}>
        <span style={textColor ? { color: textColor } : undefined}>
          {isCustomTextColor ? BRAND_NAME : "Symplysis"}
        </span>
        {!isCustomTextColor && <span style={{ color: accentColor }}>AI</span>}
      </span>
    </span>
  );
}
