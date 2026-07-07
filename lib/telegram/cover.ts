import path from "node:path";
import { createRequire } from "node:module";
import sharp from "sharp";

type FontPaths = {
  regular: string;
  extraBold: string;
};

type TextLayerOptions = {
  text: string;
  fontfile: string;
  font: string;
  width: number;
  height?: number;
  color?: string;
  align?: "left" | "center" | "centre" | "right";
  spacing?: number;
  rtl?: boolean;
  wrap?: "word" | "char" | "word-char" | "none";
};

type LayerBox = {
  left: number;
  top: number;
  width: number;
  height: number;
};

function hashValue(value: string) {
  let hash = 2166136261;

  for (const character of value) {
    hash ^= character.codePointAt(0) || 0;
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

const palettes = [
  ["#0F172A", "#2563EB", "#06B6D4", "#93C5FD"],
  ["#18181B", "#7C3AED", "#EC4899", "#C4B5FD"],
  ["#052E16", "#16A34A", "#14B8A6", "#86EFAC"],
  ["#431407", "#EA580C", "#F59E0B", "#FCD34D"],
  ["#172554", "#4F46E5", "#0891B2", "#A5B4FC"],
];

const require = createRequire(import.meta.url);

let cachedFontPaths: FontPaths | undefined;

function loadVazirmatnFontPaths(): FontPaths {
  if (cachedFontPaths) {
    return cachedFontPaths;
  }

  const packageJson = require.resolve(
    "vazirmatn/package.json"
  );

  const packageDirectory = path.dirname(packageJson);

  cachedFontPaths = {
    regular: path.join(
      packageDirectory,
      "fonts",
      "ttf",
      "Vazirmatn-Regular.ttf"
    ),

    extraBold: path.join(
      packageDirectory,
      "fonts",
      "ttf",
      "Vazirmatn-ExtraBold.ttf"
    ),
  };

  return cachedFontPaths;
}

function escapePango(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function hasRtlCharacters(value: string) {
  return /[\u0590-\u08FF\uFB1D-\uFDFD\uFE70-\uFEFC]/u.test(
    value
  );
}

/**
 * جهت پایه پاراگراف را RTL می‌کند.
 * بخش‌های انگلیسی داخل متن همچنان به‌صورت LTR نمایش داده می‌شوند.
 */
function forceRtl(value: string) {
  const rightToLeftEmbedding = "\u202B";
  const popDirectionalFormatting = "\u202C";

  return (
    rightToLeftEmbedding +
    value +
    popDirectionalFormatting
  );
}

async function renderTextLayer(
  options: TextLayerOptions
) {
  const displayText = options.rtl
    ? forceRtl(options.text)
    : options.text;

  const markup =
    `<span foreground="${options.color || "#FFFFFF"}">` +
    `${escapePango(displayText)}` +
    `</span>`;

  return sharp({
    text: {
      text: markup,

      font: options.font,
      fontfile: options.fontfile,

      width: options.width,
      height: options.height,

      align: options.align || "center",

      rgba: true,

      spacing: options.spacing || 0,

      wrap: options.wrap || "word-char",
    },
  })
    .png()
    .toBuffer();
}

async function placeLayerInsideBox(
  input: Buffer,
  box: LayerBox
) {
  const metadata = await sharp(input).metadata();

  const layerWidth = metadata.width || box.width;
  const layerHeight = metadata.height || box.height;

  return {
    input,

    left: Math.round(
      box.left +
      Math.max(0, (box.width - layerWidth) / 2)
    ),

    top: Math.round(
      box.top +
      Math.max(0, (box.height - layerHeight) / 2)
    ),
  };
}

function createBackgroundSvg(input: {
  background: string;
  primary: string;
  secondary: string;
  accent: string;
}) {
  return Buffer.from(`
    <svg
      width="1200"
      height="630"
      viewBox="0 0 1200 630"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient
          id="cover-gradient"
          x1="0"
          y1="0"
          x2="1"
          y2="1"
        >
          <stop
            offset="0%"
            stop-color="${input.background}"
          />

          <stop
            offset="55%"
            stop-color="${input.primary}"
          />

          <stop
            offset="100%"
            stop-color="${input.secondary}"
          />
        </linearGradient>

        <filter
          id="cover-shadow"
          x="-20%"
          y="-20%"
          width="140%"
          height="140%"
        >
          <feDropShadow
            dx="0"
            dy="22"
            stdDeviation="28"
            flood-color="#020617"
            flood-opacity="0.28"
          />
        </filter>
      </defs>

      <rect
        width="1200"
        height="630"
        rx="38"
        fill="url(#cover-gradient)"
      />

      <circle
        cx="130"
        cy="50"
        r="260"
        fill="${input.accent}"
        fill-opacity="0.33"
      />

      <circle
        cx="1115"
        cy="620"
        r="255"
        fill="#FFFFFF"
        fill-opacity="0.14"
      />

      <rect
        x="78"
        y="72"
        width="1044"
        height="486"
        rx="34"
        fill="#FFFFFF"
        fill-opacity="0.09"
        stroke="#FFFFFF"
        stroke-opacity="0.22"
        stroke-width="2"
        filter="url(#cover-shadow)"
      />

      <rect
        x="111"
        y="103"
        width="192"
        height="42"
        rx="21"
        fill="#FFFFFF"
        fill-opacity="0.14"
      />

      <rect
        x="930"
        y="94"
        width="148"
        height="66"
        rx="18"
        fill="#0B1120"
        fill-opacity="0.48"
      />
    </svg>
  `);
}

export async function generateCoverSvg(input: {
  title: string;
  tags: string[];
  slug: string;
}) {
  const fonts = loadVazirmatnFontPaths();

  const palette =
    palettes[
    hashValue(input.slug) % palettes.length
    ];

  const [
    background,
    primary,
    secondary,
    accent,
  ] = palette;

  const title =
    input.title.trim() || "نوشته جدید";

  const tags =
    input.tags
      .slice(0, 4)
      .map((tag) => {
        const normalized = tag
          .trim()
          .replace(/^#/, "");

        return normalized
          ? `#${normalized}`
          : "";
      })
      .filter(Boolean)
      .join("     ") ||
    "Markdown  •  Next.js";

  const backgroundSvg = createBackgroundSvg({
    background,
    primary,
    secondary,
    accent,
  });

  const [
    titleLayer,
    brandLayer,
    codeLayer,
    tagsLayer,
    slugLayer,
    metaLayer
  ] = await Promise.all([
    renderTextLayer({
      text: title,

      fontfile: fonts.extraBold,
      font: "Vazirmatn ExtraBold 64",

      width: 920,
      height: 250,

      align: "center",
      spacing: 8,

      rtl: true,
      wrap: "word-char",
    }),

    renderTextLayer({
      text: "FRONT DOCS",

      fontfile: fonts.extraBold,
      font: "Vazirmatn ExtraBold 19",

      width: 192,

      align: "center",
    }),

    renderTextLayer({
      text: "</>",

      fontfile: fonts.extraBold,
      font: "Vazirmatn ExtraBold 30",

      width: 148,

      align: "center",
    }),

    renderTextLayer({
      text: tags,

      fontfile: fonts.regular,
      font: "Vazirmatn Regular 24",

      width: 930,

      align: "center",

      rtl: hasRtlCharacters(tags),
    }),

    renderTextLayer({
      text: input.slug,

      fontfile: fonts.regular,
      font: "Vazirmatn Regular 18",

      width: 260,

      align: "right",
    }),
    renderTextLayer({
      text: "frontdocs.ir   •   @front_docs",

      fontfile: fonts.regular,
      font: "Vazirmatn Regular 20",

      width: 360,

      align: "left",
      color: "#fff",
    }),
  ]);

  const overlays = await Promise.all([
    placeLayerInsideBox(brandLayer, {
      left: 111,
      top: 103,
      width: 192,
      height: 42,
    }),

    placeLayerInsideBox(codeLayer, {
      left: 930,
      top: 94,
      width: 148,
      height: 66,
    }),

    placeLayerInsideBox(titleLayer, {
      left: 140,
      top: 174,
      width: 920,
      height: 260,
    }),

    placeLayerInsideBox(tagsLayer, {
      left: 135,
      top: 450,
      width: 930,
      height: 56,
    }),

    placeLayerInsideBox(slugLayer, {
      left: 802,
      top: 504,
      width: 260,
      height: 40,
    }),

    placeLayerInsideBox(metaLayer, {
      left: 116,
      top: 504,
      width: 360,
      height: 40,
    }),
  ]);

  const png = await sharp(backgroundSvg)
    .composite(overlays)
    .png()
    .toBuffer();

  /*
   * برای اینکه composer.ts و مسیرهای فعلی تغییر نکنند،
   * تصویر PNG داخل فایل SVG قرار داده می‌شود.
   */
  const encodedImage = png.toString("base64");

  return `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1200"
      height="630"
      viewBox="0 0 1200 630"
    >
      <image
        width="1200"
        height="630"
        href="data:image/png;base64,${encodedImage}"
      />
    </svg>
  `.trim();
}