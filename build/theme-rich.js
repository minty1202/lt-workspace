// ネイビー&ブルーのリッチ版デザイン サンプル (ダミー文言)。
// アイコン丸バッジ・カード・章扉モチーフで装飾を強化。
// 実行: node theme-rich.js → ../theme-rich.pptx
const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");
const Fa = require("react-icons/fa6");

// ---- カラー (ネイビー & ブルー) ----
const C = {
  bg: "FFFFFF",
  ink: "1E293B",        // 本文
  navy: "14213D",       // 章扉背景・見出し
  navy2: "1E3157",      // 章扉の濃淡
  blue: "2563EB",       // アクセント
  blueLight: "60A5FA",
  sky: "EFF4FB",        // 薄カード
  skyLine: "DCE6F5",
  muted: "64748B",
  line: "E2E8F0",
  white: "FFFFFF",
};
const FONT = "Hiragino Sans";
const W = 10, H = 5.625, MX = 0.6;
const makeShadow = () => ({ type: "outer", color: "1E293B", blur: 9, offset: 3, angle: 90, opacity: 0.12 });

// ---- アイコン → base64 PNG ----
async function icon(IconComponent, color = "#FFFFFF", size = 256) {
  const svg = ReactDOMServer.renderToStaticMarkup(
    React.createElement(IconComponent, { color, size: String(size) })
  );
  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  return "image/png;base64," + png.toString("base64");
}

// アイコンを丸バッジに収める
function iconBadge(slide, iconData, x, y, d, circle, opts = {}) {
  slide.addShape("ellipse", { x, y, w: d, h: d, fill: { color: circle }, shadow: opts.shadow ? makeShadow() : undefined });
  const pad = d * 0.26;
  slide.addImage({ data: iconData, x: x + pad, y: y + pad, w: d - 2 * pad, h: d - 2 * pad });
}

function eyebrow(slide, label) {
  slide.addShape("ellipse", { x: MX, y: 0.5, w: 0.14, h: 0.14, fill: { color: C.blue } });
  slide.addText(label, {
    x: MX + 0.24, y: 0.38, w: 7, h: 0.4, margin: 0,
    fontFace: FONT, fontSize: 12, bold: true, color: C.muted, charSpacing: 1, valign: "middle",
  });
}

function footer(slide, page) {
  slide.addText("Claude Code LT", {
    x: MX, y: H - 0.42, w: 4, h: 0.3, margin: 0,
    fontFace: FONT, fontSize: 9, color: C.muted, valign: "middle",
  });
  slide.addText(page, {
    x: W - MX - 2, y: H - 0.42, w: 2, h: 0.3, margin: 0,
    fontFace: FONT, fontSize: 9, color: C.muted, align: "right", valign: "middle",
  });
}

(async () => {
  const ic = {
    sliders: await icon(Fa.FaSliders, "#FFFFFF"),
    slidersGhost: await icon(Fa.FaSliders, "#2E4978"),
    userGear: await icon(Fa.FaUserGear, "#FFFFFF"),
    terminal: await icon(Fa.FaTerminal, "#FFFFFF"),
    code: await icon(Fa.FaCode, "#FFFFFF"),
    robot: await icon(Fa.FaRobot, "#FFFFFF"),
    cube: await icon(Fa.FaCube, "#FFFFFF"),
    quote: await icon(Fa.FaQuoteLeft, "#FFFFFF"),
    check: await icon(Fa.FaCircleCheck, "#2563EB"),
  };

  const pres = new pptxgen();
  pres.layout = "LAYOUT_16x9";
  pres.title = "ネイビー リッチ版サンプル";

  // ===== 1. 章扉 (リッチ) =====
  let s = pres.addSlide();
  s.background = { color: C.navy };
  // 右下の特大ゴーストアイコン (装飾モチーフ)
  s.addImage({ data: ic.slidersGhost, x: 6.4, y: 1.7, w: 3.6, h: 3.6 });
  // 左の縦アクセントバー
  s.addShape("rect", { x: 0, y: 0, w: 0.22, h: H, fill: { color: C.blue } });
  // 小さなラベル
  s.addText("SECTION", {
    x: 0.95, y: 1.15, w: 4, h: 0.35, margin: 0,
    fontFace: FONT, fontSize: 13, bold: true, color: C.blueLight, charSpacing: 3, valign: "middle",
  });
  s.addText("05", {
    x: 0.9, y: 1.45, w: 4, h: 1.5, margin: 0,
    fontFace: FONT, fontSize: 88, bold: true, color: C.blueLight, valign: "middle",
  });
  s.addText("チューニング", {
    x: 0.95, y: 3.05, w: W - 2, h: 1.0, margin: 0,
    fontFace: FONT, fontSize: 44, bold: true, color: C.white, valign: "top",
  });
  s.addText("Claude を自分の作業に合わせて育てる", {
    x: 0.97, y: 4.05, w: W - 2, h: 0.5, margin: 0,
    fontFace: FONT, fontSize: 15, color: "9FB2D4", valign: "top",
  });

  // ===== 2. 定義 (アイコンバッジ + 例カード) =====
  s = pres.addSlide();
  s.background = { color: C.bg };
  eyebrow(s, "5. チューニング");
  iconBadge(s, ic.userGear, MX, 1.05, 0.8, C.blue, { shadow: true });
  s.addText("サブエージェント", {
    x: MX + 1.0, y: 1.05, w: W - MX - 1.0, h: 0.8, margin: 0,
    fontFace: FONT, fontSize: 30, bold: true, color: C.navy, valign: "middle",
  });
  s.addText("専門役割を持たせたサブの Claude です", {
    x: MX, y: 2.15, w: W - 2 * MX, h: 0.6, margin: 0,
    fontFace: FONT, fontSize: 18, color: C.ink, valign: "top",
  });
  // 例カード
  s.addShape("roundRect", { x: MX, y: 3.0, w: W - 2 * MX, h: 1.5, rectRadius: 0.08, fill: { color: C.sky }, line: { color: C.skyLine, width: 1 }, shadow: makeShadow() });
  s.addText([
    { text: "例", options: { bold: true, color: C.blue, fontSize: 13, breakLine: true } },
    { text: "コードレビュー専門 / 文章を特定の観点でチェックする専門", options: { color: C.ink, fontSize: 17 } },
  ], { x: MX + 0.35, y: 3.0, w: W - 2 * MX - 0.7, h: 1.5, margin: 0, valign: "middle", fontFace: FONT, lineSpacingMultiple: 1.1, paraSpaceAfter: 6 });
  footer(s, "28 / 39");

  // ===== 3. ツール一覧 (アイコン付きカード行) =====
  s = pres.addSlide();
  s.background = { color: C.bg };
  eyebrow(s, "3. コーディングはどう変わったか");
  s.addText("コーディングエージェント以後の主なツール", {
    x: MX, y: 1.0, w: W - 2 * MX, h: 0.6, margin: 0,
    fontFace: FONT, fontSize: 22, bold: true, color: C.navy, valign: "middle",
  });
  const tools = [
    { ic: ic.code, name: "Cursor", desc: "agent mode, 2024/11〜" },
    { ic: ic.terminal, name: "Claude Code", desc: "Anthropic, 2025/2 preview / 2025/5 GA" },
    { ic: ic.robot, name: "Codex CLI", desc: "OpenAI, 2025/4" },
    { ic: ic.cube, name: "Antigravity CLI", desc: "Google, 2026/5 リリース。Gemini CLI の後継" },
  ];
  let cy = 1.85;
  const ch = 0.78, gap = 0.14;
  for (const t of tools) {
    s.addShape("roundRect", { x: MX, y: cy, w: W - 2 * MX, h: ch, rectRadius: 0.06, fill: { color: C.white }, line: { color: C.line, width: 1 }, shadow: makeShadow() });
    iconBadge(s, t.ic, MX + 0.2, cy + (ch - 0.5) / 2, 0.5, C.blue);
    s.addText([
      { text: t.name + "   ", options: { bold: true, color: C.navy, fontSize: 16 } },
      { text: t.desc, options: { color: C.muted, fontSize: 13 } },
    ], { x: MX + 0.95, y: cy, w: W - 2 * MX - 1.2, h: ch, margin: 0, valign: "middle", fontFace: FONT });
    cy += ch + gap;
  }
  footer(s, "15 / 39");

  // ===== 4. statement (中央 + モチーフ) =====
  s = pres.addSlide();
  s.background = { color: C.navy };
  s.addImage({ data: await icon(Fa.FaQuoteLeft, "#23386180"), x: 0.7, y: 0.6, w: 1.2, h: 1.2 });
  s.addText([
    { text: "今日は「こういう手段がある」とだけ覚えてください", options: { color: C.white, fontSize: 28, bold: true, breakLine: true } },
    { text: " ", options: { fontSize: 14, breakLine: true } },
    { text: "具体は Claude に聞けば十分です", options: { color: C.blueLight, fontSize: 28, bold: true } },
  ], { x: 1.0, y: 1.6, w: W - 2.0, h: 2.4, margin: 0, align: "center", valign: "middle", fontFace: FONT, lineSpacingMultiple: 1.25 });
  footer(s, "30 / 39");

  await pres.writeFile({ fileName: "../theme-rich.pptx" });
  console.log("生成: ../theme-rich.pptx (4 枚)");
})();
