// 配色・フォントのテーマ比較用サンプルを生成する (ダミー文言)。
// 実行: node theme-samples.js → ../theme-samples.pptx
// 各テーマで「章扉 / 本文 / 表」の代表 3 枚を作り、選定用に並べる。

const pptxgen = require("pptxgenjs");

const THEMES = [
  {
    key: "A", name: "ミニマル・ライト", fontNote: "ヒラギノ角ゴシック",
    bg: "FAFAF8", text: "1F2328", muted: "8A9099", accent: "FF5A3C",
    dividerBg: "1F2328", dividerNum: "FF5A3C", dividerTitle: "FAFAF8", bar: "FF5A3C",
    headerBg: "1F2328", headerText: "FAFAF8", rowBg: "FFFFFF", rowAlt: "F4E9E4",
    font: "Hiragino Sans", fontHeading: "Hiragino Sans", headingColor: "FF5A3C",
    cellText: "1F2328", line: "E2E2DD",
  },
  {
    key: "B", name: "ダーク・モダン", fontNote: "ヒラギノ角ゴシック",
    bg: "0E1116", text: "E6EDF3", muted: "8B98A5", accent: "2DD4BF",
    dividerBg: "0E1116", dividerNum: "2DD4BF", dividerTitle: "E6EDF3", bar: "2DD4BF",
    headerBg: "1B2330", headerText: "E6EDF3", rowBg: "161B22", rowAlt: "1B2330",
    font: "Hiragino Sans", fontHeading: "Hiragino Sans", headingColor: "2DD4BF",
    cellText: "E6EDF3", line: "30363D",
  },
  {
    key: "C", name: "ネイビー & ブルー", fontNote: "ヒラギノ角ゴシック",
    bg: "FFFFFF", text: "1E2A3A", muted: "7A8694", accent: "2563EB",
    dividerBg: "14213D", dividerNum: "60A5FA", dividerTitle: "FFFFFF", bar: "2563EB",
    headerBg: "14213D", headerText: "FFFFFF", rowBg: "FFFFFF", rowAlt: "EEF3FB",
    font: "Hiragino Sans", fontHeading: "Hiragino Sans", headingColor: "2563EB",
    cellText: "1E2A3A", line: "DCE3EC",
  },
  {
    key: "D", name: "上品・明朝 (ティール)", fontNote: "ヒラギノ明朝",
    bg: "FBFAF7", text: "24201B", muted: "9C9488", accent: "0E8C7A",
    dividerBg: "24201B", dividerNum: "0E8C7A", dividerTitle: "FBFAF7", bar: "0E8C7A",
    headerBg: "24201B", headerText: "FBFAF7", rowBg: "FFFFFF", rowAlt: "EFEAE2",
    font: "Hiragino Mincho ProN", fontHeading: "Hiragino Mincho ProN", headingColor: "0E8C7A",
    cellText: "24201B", line: "E2DCD1",
  },
];

const W = 10, H = 5.625, MX = 0.6;

// ダミーコンテンツ (実際の素案に近い雰囲気で、英語混在・コマンド・折返しを確認できるもの)
const DUMMY = {
  dividerNum: "03",
  dividerTitle: "コーディングはどう変わったか",
  heading: "サブエージェント",
  body: [
    "専門役割を持たせたサブの Claude です",
    "",
    "例：コードレビュー専門 (code review)",
    "- 観点ごとにチェックして報告します",
    "- brew install gh で GitHub と連携",
  ],
  tableLead: "サンプル：3 つのツールを比較します",
  tableHeaders: ["ツール", "特徴", "利用に必要"],
  tableRows: [
    ["Claude Code", "ターミナルで動くコーディングエージェント", "有料プラン / API キー"],
    ["★ サンプル CLI", "無料ティアあり、まず試すならこれ", "アカウント登録"],
    ["別のツール", "エディタ統合タイプ", "サブスクリプション"],
  ],
};

function footerLabel(slide, t) {
  slide.addText(`案 ${t.key}：${t.name}  /  ${t.fontNote}`, {
    x: MX, y: H - 0.42, w: W - 2 * MX, h: 0.3, margin: 0,
    fontFace: t.font, fontSize: 9, color: t.muted, align: "right", valign: "middle",
  });
}

function eyebrow(slide, t) {
  slide.addShape("ellipse", { x: MX, y: 0.46, w: 0.16, h: 0.16, fill: { color: t.accent } });
  slide.addText("2. LLM とは", {
    x: MX + 0.26, y: 0.34, w: 6, h: 0.4, margin: 0,
    fontFace: t.font, fontSize: 12, bold: true, color: t.muted, valign: "middle",
  });
}

function bodyRuns(lines) {
  return lines.map((ln) => {
    if (ln === "") return { text: " ", options: { breakLine: true, fontSize: 10 } };
    if (ln.startsWith("- ")) return { text: ln.slice(2), options: { bullet: { indent: 16 }, breakLine: true } };
    return { text: ln, options: { breakLine: true } };
  });
}

const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.title = "テーマ比較サンプル";

for (const t of THEMES) {
  // --- 章扉 ---
  let s = pres.addSlide();
  s.background = { color: t.dividerBg };
  s.addShape("rect", { x: 0, y: 0, w: 0.28, h: H, fill: { color: t.bar } });
  s.addText(DUMMY.dividerNum, {
    x: 0.85, y: 1.0, w: 4, h: 1.6, margin: 0,
    fontFace: t.fontHeading, fontSize: 76, bold: true, color: t.dividerNum, valign: "middle",
  });
  s.addText(DUMMY.dividerTitle, {
    x: 0.9, y: 2.75, w: W - 1.6, h: 1.4, margin: 0,
    fontFace: t.fontHeading, fontSize: 40, bold: true, color: t.dividerTitle, valign: "top",
  });
  footerLabel(s, t);

  // --- 本文 (見出し + 箇条書き) ---
  s = pres.addSlide();
  s.background = { color: t.bg };
  eyebrow(s, t);
  s.addText(DUMMY.heading, {
    x: MX, y: 1.05, w: W - 2 * MX, h: 0.7, margin: 0,
    fontFace: t.fontHeading, fontSize: 26, bold: true, color: t.headingColor, valign: "middle",
  });
  s.addText(bodyRuns(DUMMY.body), {
    x: MX, y: 1.95, w: W - 2 * MX, h: 3.0, margin: 0,
    fontFace: t.font, fontSize: 18, color: t.text, valign: "top",
    lineSpacingMultiple: 1.05, paraSpaceAfter: 2,
  });
  footerLabel(s, t);

  // --- 表 ---
  s = pres.addSlide();
  s.background = { color: t.bg };
  eyebrow(s, t);
  s.addText(DUMMY.tableLead, {
    x: MX, y: 1.0, w: W - 2 * MX, h: 0.7, margin: 0,
    fontFace: t.font, fontSize: 16, bold: true, color: t.headingColor, valign: "middle",
  });
  const header = DUMMY.tableHeaders.map((h) => ({
    text: h, options: { fill: { color: t.headerBg }, color: t.headerText, bold: true, fontSize: 12, valign: "middle" },
  }));
  const rows = DUMMY.tableRows.map((r, ri) => r.map((cell) => ({
    text: cell,
    options: { fill: { color: ri === 1 ? t.rowAlt : t.rowBg }, color: t.cellText, bold: ri === 1, fontSize: 11, valign: "middle" },
  })));
  s.addTable([header, ...rows], {
    x: MX, y: 1.9, w: W - 2 * MX, colW: [2.4, 4.4, 2.0],
    border: { pt: 0.5, color: t.line }, fontFace: t.font, rowH: 0.55, valign: "middle",
  });
  footerLabel(s, t);
}

pres.writeFile({ fileName: "../theme-samples.pptx" }).then((fn) => {
  console.log("生成:", fn, "/", THEMES.length, "テーマ ×3 枚 =", THEMES.length * 3, "枚");
});
