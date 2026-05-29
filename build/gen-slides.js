// slide-final.md を入力に、Google スライド用の .pptx を生成する。
// 実行: node gen-slides.js  → ../slides.pptx を出力
//
// デザイン: ネイビー & ブルーのリッチテーマ。
//  - 章扉: 濃ネイビー背景に特大ゴーストアイコン + SECTION/番号/タイトル/サブ
//  - 本文: アイコン丸バッジ + 見出し + 本文。図案は薄ブルーのカードに
//  - statement: ネイビー背景 + 引用符/アイコンモチーフ + 中央大文字
//  - 表(章4)/カテゴリカード(章5)/ツールカード(章3) でリッチに
// 【表示】→ 本文 / 【ノート】【図案】【要確認】→ スピーカーノート。

const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");
const Fa = require("react-icons/fa6");

// ---- カラー ----
const C = {
  bg: "FFFFFF", ink: "1E293B", navy: "14213D", navyGhost: "2E4978",
  blue: "2563EB", blueLight: "60A5FA", sky: "EFF4FB", skyLine: "DCE6F5",
  muted: "64748B", line: "E2E8F0", white: "FFFFFF", subOnNavy: "9FB2D4",
};
const FONT = "Hiragino Sans";
const W = 10, H = 5.625, MX = 0.6;
const makeShadow = () => ({ type: "outer", color: "1E293B", blur: 9, offset: 3, angle: 90, opacity: 0.1 });

const chapterTitles = {
  1: "AI とは", 2: "LLM とは", 3: "コーディングはどう変わったか",
  4: "基本的な使い方", 5: "チューニング", 6: "コード以外の使い道", 7: "まとめ",
};
const chapterSub = {
  1: "そもそも AI とは何か", 2: "AI の中の「言葉を扱う」一種",
  3: "LLM 以前からエージェント以後まで", 4: "最初の一歩を踏み出す",
  5: "Claude を自分の作業に合わせて育てる", 6: "コードだけじゃない使い道",
  7: "持ち帰ってほしいこと",
};
const chapterIcon = { 1: "brain", 2: "comments", 3: "code", 4: "rocket", 5: "sliders", 6: "lightbulb", 7: "flag" };

const ICONS = {
  brain: Fa.FaBrain, comments: Fa.FaComments, code: Fa.FaCode, rocket: Fa.FaRocket,
  sliders: Fa.FaSliders, lightbulb: Fa.FaLightbulb, flag: Fa.FaFlagCheckered,
  terminal: Fa.FaTerminal, robot: Fa.FaRobot, cube: Fa.FaCube, quote: Fa.FaQuoteLeft,
  userGear: Fa.FaUserGear, gears: Fa.FaGears, fileLines: Fa.FaFileLines, bookOpen: Fa.FaBookOpen,
  puzzle: Fa.FaPuzzlePiece, arrow: Fa.FaArrowRightLong, download: Fa.FaDownload, play: Fa.FaPlay,
  shield: Fa.FaShieldHalved, briefcase: Fa.FaBriefcase, wand: Fa.FaWandMagicSparkles, github: Fa.FaGithub,
};

// ---- スライドデータ ----
// type: divider | content | statement | table
// kind (content の特殊): toolcards | categorycards
const slides = [
  { type: "title" },
  { type: "toc" },
  // ===== 章 1 =====
  { type: "divider", ch: 1, no: 1 },
  { type: "statement", ch: 1, no: 2, display: ["そもそも AI って何？"] },
  {
    type: "content", ch: 1, no: 3, icon: "brain", heading: "ひとことで言うと",
    display: ["機械学習ベースの定義では：", "", "大量のデータから学習して、判断や出力を返す技術です"],
    note: "学術的には AI はもっと広い (ルールベース、探索アルゴリズムなども含む) が、現代の主流は機械学習ベースなので、LT ではこの定義を採用する。GPU の話は定義の守備範囲を逸脱するためスライドには載せない。話の流れで触れたければ口頭補足にとどめる。",
  },
  {
    type: "content", ch: 1, no: 4, icon: "lightbulb", heading: "身近にある AI",
    display: [
      "- 画像認識 (顔認証、写真の自動タグ付け)",
      "- レコメンド (YouTube、Amazon、Netflix)",
      "- 翻訳 (Google 翻訳、DeepL)",
      "- 音声認識 (Siri、Alexa)",
      "- 自動運転",
    ],
  },
  {
    type: "content", ch: 1, no: 5, icon: "arrow", heading: "ここまでのまとめ",
    display: ["AI には様々な種類があります", "その中で「言葉を扱うのが得意」な一種が LLM です"],
    note: "次章 (LLM とは) への橋渡し。",
    diagram: "AI を大円として描き、その中に「画像認識 / レコメンド / 音声認識 / 自動運転」を点在させる。さらにその中の一つの島として LLM の小円を描く。翻訳は LLM のタスクとも被るので、この図からは外して章 2 に譲る。",
    diagramSummary: "AI の大円の中に各 AI 例を点在させ、その一島として LLM の小円を描く包含図",
  },

  // ===== 章 2 =====
  { type: "divider", ch: 2, no: 6 },
  { type: "statement", ch: 2, no: 7, display: ["LLM ってなに？"] },
  {
    type: "content", ch: 2, no: 8, icon: "comments", heading: "ひとことで言うと",
    display: [
      "Large Language Model = 大規模言語モデル",
      "",
      "大量のテキストから「次に来る単語」を予測するよう学習したモデルです",
      "(= ものすごく賢い「文章の続き予測マシン」)",
    ],
    diagram: "「私は学校に → ?」の ? の候補が「行く / 行きました / 通っている / …」と確率付きで並ぶイメージ図。",
    diagramSummary: "「私は学校に → ?」の候補語が確率付きで並ぶイメージ図",
  },
  {
    type: "content", ch: 2, no: 9, icon: "comments", heading: "代表的な LLM とできること",
    display: [
      "例：ChatGPT (OpenAI) / Claude (Anthropic) / Gemini (Google)",
      "",
      "できること (1 つのモデルでこなせます)：",
      "- 対話・質問応答",
      "- 文章生成・要約",
      "- 翻訳",
      "- コードの読み書き",
    ],
    note: "章 3 への接続として「LLM はコードも自然言語と同じように扱える → コーディングはどう変わったか？」と振る。",
    diagram: "テキストで十分 (3 サービス名 + 4 タスクで一目で伝わる)。ロゴアイコンを添えても良いが必須ではない。",
  },

  // ===== 章 3 =====
  {
    type: "divider", ch: 3, no: 10,
    diagram: "時系列の変遷図 (4 つの時代を横軸で並べる)。\nLLM 以前 → Copilot (2021〜2022) → ChatGPT (2022/11) → 2023〜2024 → エージェント以後 (2024 末〜)\n「エージェント以後」のセクションだけ枠 / 色 / サイズで強調 (ヤマ場であることを視覚的に示す)。\n各時代で「エディター」「AI」「人間」の関係性を示す。情報過多にならないよう、まず年表として見せ、各ブロックで個別の関係図を出す方式が無難。",
    note: "この LT の肝。各ターニングポイントを順に並べ、なぜエージェントが革命的かを 4 段階で示す。時間感: 6 分。",
  },
  {
    type: "content", ch: 3, no: 11, icon: "code", heading: "LLM 以前",
    display: [
      "コードは人間が一行ずつ書く時代でした",
      "補完は「書いてある文字から候補を出す」だけで、意味は理解していません",
      "(裏側は LSP = エディタに補完などを提供する仕組み)",
    ],
  },
  {
    type: "content", ch: 3, no: 12, icon: "code", heading: "GitHub Copilot 登場",
    display: [
      "2021〜2022 年、GitHub Copilot 登場",
      "",
      "エディターの中に AI が住み、",
      "補完が「次の文字の予測」から「次の数行の生成」へ変わりました",
    ],
    diagram: "エディター画面の中に AI のアイコンが入っている構図。コード補完の候補が AI から出ているイメージ。",
    diagramSummary: "エディター画面の中に AI アイコン。補完候補が AI から出ている構図",
  },
  {
    type: "content", ch: 3, no: 13, icon: "comments", heading: "ChatGPT 登場",
    display: [
      "2022 年 11 月 30 日、ChatGPT 登場",
      "",
      "エディターと AI チャットが分離し、",
      "コピペでの「行ったり来たり」が日常化しました",
    ],
    diagram: "左側にエディター、右側に ChatGPT のチャット画面。両者の間にコピー & ペーストの矢印が双方向に。「行ったり来たり」を視覚化する。",
    diagramSummary: "左にエディター・右に ChatGPT、間にコピペの双方向矢印で「行ったり来たり」",
  },
  {
    type: "content", ch: 3, no: 14, icon: "code", heading: "AI ネイティブエディタへ",
    display: [
      "GPT-4 / Claude / Gemini が登場し、長文やコードの理解精度が大きく向上しました",
      "Cursor などの AI を前提に作られたエディタが登場",
      "→ コピペなしで、エディター内から AI を呼べるようになりました",
    ],
  },
  {
    type: "content", ch: 3, no: 15, kind: "toolcards", icon: "rocket",
    heading: "コーディングエージェント以後",
    lead: "AI が直接コードを読んだり書き換えたりするようになり、エディターと AI の境目が消えました",
    tools: [
      { icon: "code", name: "Cursor", desc: "agent mode, 2024/11〜" },
      { icon: "terminal", name: "Claude Code", desc: "Anthropic, 2025/2 preview / 2025/5 GA" },
      { icon: "robot", name: "Codex CLI", desc: "OpenAI, 2025/4" },
      { icon: "cube", name: "Antigravity CLI", desc: "Google, 2026/5 リリース。Gemini CLI の後継" },
    ],
    note: "時代区分は「2024 末〜」。Antigravity CLI は次章 (章 4) で「無料で試せる」と橋渡しする。",
    diagram: "エディター + AI が一体化し、AI が直接コードファイルを read/edit する構図。AI からファイルへ矢印が直接伸びている。スライド 13 (エディター ↔ AI の往復) との対比で「境目が消えた」を見せる。",
  },

  // ===== 章 4 =====
  { type: "divider", ch: 4, no: 16 },
  {
    type: "table", ch: 4, no: 17,
    lead: "先に結論：無料で試したい人は Antigravity CLI を選んでください。",
    table: {
      headers: ["ツール", "Mac", "WSL", "利用に必要"],
      colW: [1.9, 2.7, 2.4, 1.8],
      rows: [
        ["Claude Code", "brew install --cask claude-code\nまたは\ncurl -fsSL https://claude.ai/install.sh | bash", "curl -fsSL https://claude.ai/install.sh | bash", "Claude Pro / Max などの有料プラン、または API キー"],
        ["★ Antigravity CLI", "公式サイトの手順に従ってインストール\n(https://antigravity.google/)", "公式サイトの手順に従ってインストール", "Google アカウント (無料ティアあり)"],
        ["Codex CLI", "brew install --cask codex\nまたは\ncurl -fsSL https://chatgpt.com/codex/install.sh | sh", "curl -fsSL https://chatgpt.com/codex/install.sh | sh", "ChatGPT Plus / Pro などの有料プラン、または API キー"],
      ],
      highlightRow: 1,
    },
    note: "Antigravity CLI のインストール手順は公式サイトを参照 (具体的な curl URL が公式情報源で再確認できないため、安全側に「公式サイト参照」と記載している)。",
    diagram: "表内の ★ Antigravity CLI 行を色 / 太字 / 背景で強調。結論文と表の Antigravity 行が視線で自然に結ばれるレイアウト。",
  },
  {
    type: "content", ch: 4, no: 18, icon: "play", heading: "起動する",
    display: [
      "Claude Code： ターミナルで claude と打つだけです",
      "初回はログインが必要です (Claude アカウント認証または API キー)",
      "",
      "Antigravity CLI： ターミナルで agy と打って起動します",
    ],
  },
  {
    type: "content", ch: 4, no: 19, icon: "terminal", heading: "最初のプロンプト",
    display: [
      "プロンプトを送ると、Claude が応答し、必要に応じてファイルを編集します",
      "",
      "例：",
      "- 「ユーザー一覧画面の検索機能を実装するので、",
      "   関連する既存実装の調査をお願いします」",
      "- 「https://github.com/owner/repo/issues/123",
      "   こちらを実装するので、関連コードを確認してください。",
      "   その上で実装計画を立てます」",
    ],
    diagram: "実際のスクリーンショット (プロンプト送信 → Claude が応答してファイル編集している画面)。または「プロンプト → Claude → ファイル編集」のシンプルなフロー図。",
    diagramSummary: "プロンプト送信 → Claude 応答 → ファイル編集 のスクショ or フロー図",
  },
  {
    type: "content", ch: 4, no: 20, icon: "github", heading: "gh（GitHub CLI）",
    display: [
      "gh = GitHub の公式 CLI",
      "ターミナルから PR / issue / repo を操作できます",
      "",
      "インストール：Mac は brew install gh / WSL は公式ガイドに従う",
      "",
      "入れておくと Claude Code から PR 作成や issue 確認を任せられます",
    ],
    note: "スライド 19 で「動かせる」を見せたあと、ここから「安心して長く使う」ための準備に話を移す。橋渡しの一文を口頭で添える。",
    diagram: "不要 (テキストで十分)。必要なら「Claude Code ─ gh ─ GitHub」を 3 ボックスで横並びにする構図。",
  },
  {
    type: "content", ch: 4, no: 21, icon: "shield", heading: "本番環境から切り離す",
    display: [
      "コーディングエージェントを本番環境 / 本番データから切り離します",
      "",
      "- 通信を分ける (例: VPN で本番に到達できなくする)",
      "- 認証情報を分ける (例: 開発用アカウントで起動)",
      "- エージェント自身の制限機能を使う (例: sandbox / 厳格モード)",
      "",
      "詳しくは各サービス・ツールのベストプラクティスを確認してください",
    ],
    diagram: "3 つの分け方を同心円 3 層で表現。外側からネットワーク層 / 認証層 / エージェント設定層。中心に prod 環境。本文の 3 つの例 (VPN / 開発用アカウント / sandbox) が各層と 1:1 で対応するラベルにする。",
    diagramSummary: "同心円 3 層 (ネットワーク / 認証 / エージェント設定)、中心に prod。本文 3 例と 1:1 対応",
  },
  {
    type: "content", ch: 4, no: 22, icon: "briefcase", heading: "業務で使う前に",
    display: [
      "仕事で使う場合は：",
      "- 現場 (上司 / IT / セキュリティ) に必ず確認しましょう",
      "- 学習機能をオフにします",
      "  (= 入力内容が AI 提供元の学習に使われないようにするため)",
      "",
      "具体的な設定方法は各エージェントの公式情報を確認してください",
      "(Claude.ai / Antigravity / Codex などで設定場所が異なります)",
    ],
  },

  // ===== 章 5 =====
  { type: "divider", ch: 5, no: 23 },
  {
    type: "content", ch: 5, no: 24, kind: "categorycards",
    lead: "チューニング手段は大きく 3 つのカテゴリに分かれます。今日扱う主役は ★ の 4 つです。",
    categories: [
      { name: "指示系", desc: "Claude が参照する指示・記憶", items: [{ t: "CLAUDE.md", star: true }, { t: "ルール", star: true }, { t: "メモリ", star: false }] },
      { name: "実行系", desc: "定型作業や専門タスクを任せる", items: [{ t: "スキル", star: true }, { t: "サブエージェント", star: true }] },
      { name: "統合系", desc: "外部とつなぐ（触りだけ）", items: [{ t: "hooks", star: false }, { t: "MCP", star: false }], dim: true },
    ],
    diagram: "各カテゴリ行をカード風に余白を取って配置。主役 4 つ (★) は背景色 / 枠で強調。統合系は薄めて「触りだけ」を視覚的に示す。",
  },
  {
    type: "content", ch: 5, no: 25, icon: "fileLines", heading: "CLAUDE.md",
    display: ["プロジェクト全体に共通の指示を書くファイルです", "", "例：ビルドコマンド、コーディング規約、ワークフロー"],
  },
  {
    type: "content", ch: 5, no: 26, icon: "bookOpen", heading: "ルール",
    display: [
      "特定のディレクトリやファイルにだけ適用したいルール",
      "(コーディング規約、レビュー観点、運用上の決まりごと、など)",
      ".claude/rules/<topic>.md に書きます",
      "",
      "例：各言語のコーディングルール、フレームワークの責務",
    ],
  },
  {
    type: "content", ch: 5, no: 27, icon: "wand", heading: "スキル",
    display: [
      "繰り返し使う手順をパッケージ化",
      "必要な場面で Claude が自動で呼び出します",
      "",
      "例：コミット前に変更の要約とリスク確認を自動で挟む",
      "(公式の summarize-changes スキル)",
    ],
  },
  {
    type: "content", ch: 5, no: 28, icon: "userGear", heading: "サブエージェント",
    display: ["専門役割を持たせたサブの Claude です", "", "例：コードレビュー専門 / 文章を特定の観点でチェックする専門"],
    note: "「このスライドの素案作成でも fact-checker / validity-checker / writing-style-checker / audience-checker を作って使った」を、ここでは匂わせない (章 6 で回収するため)。",
  },
  {
    type: "content", ch: 5, no: 29, icon: "puzzle", heading: "その他の手段",
    display: ["メモリ / hooks / MCP もあります (詳細は割愛)"],
    note: "口頭で軽く触れる:\n- メモリ: Claude が会話で書き溜めるメモ (セッションを跨ぐ)\n- hooks: ツール実行の前後にコマンドを差し込む仕組み\n- MCP: 外部ツール / サービスとの接続",
    diagram: "3 つを薄く小さく並べる。主役 4 つとの強弱を視覚的に保つ。",
  },
  {
    type: "statement", ch: 5, no: 30, motif: "quote",
    display: ["今日は「こういう手段がある」とだけ", "覚えてください", "", "具体は Claude に聞けば十分です"],
    note: "章 5 の締めのメッセージ。具体的にどう聞けばよいかは次のスライド (聞き方の例) で見せる。「Claude に聞けばよいのはコードの話だけではない」という点は章 6 への橋渡しになる (口頭で添える)。",
  },
  {
    type: "content", ch: 5, no: 31, icon: "comments", heading: "Claude への聞き方の例",
    display: [
      "こういうのがあった気がするので、こうしたいです。",
      "これを公式の情報で確認してください。",
      "その時にベストプラクティスも確認してください。",
      "その上で、今回の意向に沿ったカスタマイズをしてください。",
    ],
    note: "前のスライドのメッセージ「具体は Claude に聞けば十分」を裏付ける具体例。「こう聞けば大体やってくれる」という流れ。章 5 の最後として、章 6 (コード以外の使い道) へ繋ぐ。",
  },

  // ===== 章 6 =====
  {
    type: "divider", ch: 6, no: 32,
    note: "時間感: 2 分。狙いはメタ的な回収 + チューニングパートの実例の補完。今回のスライド作成プロセスを実例として紹介し、「コード以外にも使える」というメッセージで非エンジニアも掬う。\n目次スライドを作る場合、この章はタイトルのみ表示し中身を隠す (当日まで明かさない)。",
  },
  {
    type: "statement", ch: 6, no: 33,
    display: ["実は、このスライドも", "Claude Code で作っています"],
    diagram: "中央に大きく一文だけ。背景に slide-draft.md のスクリーンショット or 対話ターミナル画面を薄く敷いて、種明かしの瞬間を視覚で支える。",
  },
  {
    type: "content", ch: 6, no: 34, icon: "arrow", heading: "作り方",
    display: ["対話で構成を詰める", "→ 各章のブロックを決める", "→ 素案を Markdown で書く", "→ スライドに変換"],
    note: "実際の対話の一部、または process-log.md の抜粋を見せる。",
    diagram: "横方向のフロー図 (4 ステップ)。各ステップに「対話アイコン」を添える。各ステップに具体的なアウトプット (構成案 / ブロック一覧 / slide-draft.md / 最終スライド) を併記。process-log.md の抜粋を 1 つ実際に貼ると説得力が増す。",
    diagramSummary: "4 ステップの横フロー図。各ステップに対話アイコンとアウトプットを併記",
  },
  {
    type: "content", ch: 6, no: 35, icon: "gears", heading: "使ったチューニング",
    display: [
      "このプロジェクトでは",
      "CLAUDE.md / ルール / スキル / サブエージェントを全部使いました",
      "",
      "例：audience-checker",
      "(聴衆視点でスライドを評価するサブエージェント)",
      "",
      "詳細はリポジトリで",
    ],
    note: "「= 章 5 の主役 4 つを全部使った形」「今このスライドも〜」は口頭で補足。スライドはシンプルに保つ。",
  },
  {
    type: "content", ch: 6, no: 36, icon: "github", heading: "リポジトリで公開",
    display: ["このプロジェクトはリポジトリで公開しています", "対話の経緯まで遡って見られます", "", "github.com/minty1202/lt-workspace"],
    diagram: "GitHub のリポジトリページのスクリーンショット (or QR コード)。聴衆が後で見に行ける形にする。URL: https://github.com/minty1202/lt-workspace",
    diagramSummary: "QR コード (https://github.com/minty1202/lt-workspace)",
  },

  // ===== 章 7 =====
  { type: "divider", ch: 7, no: 37 },
  {
    type: "content", ch: 7, no: 38, icon: "flag", heading: "持ち帰ってほしいこと",
    display: [
      "未経験者の方へ：",
      "公式サイト (https://antigravity.google/) から Antigravity CLI を導入",
      "→ agy で起動して、今やりたい作業を伝えてみましょう",
      "(例：「この CSV を集計したい」「この設定ファイルの意味を教えて」)",
      "無料で試せます",
      "",
      "経験者の方へ：",
      "CLAUDE.md やルールから始めて、自分の作業に合わせて育てていきましょう",
    ],
    note: "未経験者 / 経験者の 2 メッセージ並列は意図的 (聴衆 2 層への対比、まとめスライドの定型として例外扱い)。",
  },
  {
    type: "statement", ch: 7, no: 39, motif: "quote",
    display: ["細かい使い方は", "Claude 自身に聞けば十分です", "", "コード以外にも様々に使えます"],
  },
];

// ---- アイコン rasterize ----
async function iconPng(comp, color, size = 256) {
  const svg = ReactDOMServer.renderToStaticMarkup(React.createElement(comp, { color, size: String(size) }));
  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  return "image/png;base64," + png.toString("base64");
}

// ---- 描画ヘルパ ----
function calcFontSize(lines, availH, availW) {
  let eff = 0, maxCh = 0;
  lines.forEach((l) => { eff += l === "" ? 0.5 : 1; if (l !== "") maxCh = Math.max(maxCh, l.length); });
  const byH = (availH * 72) / (eff * 1.6);          // 高さ制約
  const byW = maxCh ? (availW * 72 * 0.92) / maxCh : 99; // 幅制約 (全角想定、安全側)
  return Math.max(13, Math.min(19, Math.floor(Math.min(byH, byW))));
}

function bodyRuns(lines) {
  return lines.map((ln) => {
    if (ln === "") return { text: " ", options: { breakLine: true, fontSize: 10 } };
    if (ln.startsWith("- ")) return { text: ln.slice(2), options: { bullet: { indent: 16 }, breakLine: true } };
    if (ln.startsWith("  ") || ln.startsWith("   ")) return { text: ln.replace(/^\s+/, ""), options: { indentLevel: 1, breakLine: true } };
    return { text: ln, options: { breakLine: true } };
  });
}

function iconBadge(slide, png, x, y, d, circle, shadow) {
  slide.addShape("ellipse", { x, y, w: d, h: d, fill: { color: circle }, shadow: shadow ? makeShadow() : undefined });
  const pad = d * 0.27;
  slide.addImage({ data: png, x: x + pad, y: y + pad, w: d - 2 * pad, h: d - 2 * pad });
}

function eyebrow(slide, ch, W3) {
  slide.addText(`${ch}. ${chapterTitles[ch]}`, {
    x: MX, y: 0.38, w: 8.5, h: 0.4, margin: 0,
    fontFace: FONT, fontSize: 12, bold: true, color: C.muted, charSpacing: 1, valign: "middle",
  });
}

function footer(slide, no) {
  slide.addText("Claude Code LT", {
    x: MX, y: H - 0.42, w: 4, h: 0.3, margin: 0, fontFace: FONT, fontSize: 9, color: C.muted, valign: "middle",
  });
  slide.addText(`${no} / 39`, {
    x: W - MX - 2, y: H - 0.42, w: 2, h: 0.3, margin: 0, fontFace: FONT, fontSize: 9, color: C.muted, align: "right", valign: "middle",
  });
}

function diagramBox(slide, summary, y) {
  slide.addShape("roundRect", {
    x: MX, y, w: W - 2 * MX, h: 0.82, rectRadius: 0.07,
    fill: { color: C.sky }, line: { color: C.skyLine, width: 1 }, shadow: makeShadow(),
  });
  slide.addText(
    [
      { text: "図案   ", options: { bold: true, color: C.blue } },
      { text: summary, options: { color: C.muted } },
    ],
    { x: MX + 0.3, y, w: W - 2 * MX - 0.6, h: 0.82, margin: 0, fontFace: FONT, fontSize: 11, valign: "middle" }
  );
}

// ---- 図案の実描画 (スライド no → 図の種類) ----
const DIAG_DRAW = { 5: "incl", 8: "predict", 12: "editorAI", 13: "pingpong", 19: "flow", 21: "rings", 34: "steps" };

function dlabel(slide, t, x, y, w, h, color, size, o = {}) {
  slide.addText(t, { x, y, w, h, margin: 0, fontFace: FONT, fontSize: size, color, bold: o.bold, align: o.align || "center", valign: o.valign || "middle", lineSpacingMultiple: 1.0 });
}
function arrowDown(slide, cx, y, h) {
  slide.addShape("line", { x: cx, y, w: 0, h, line: { color: C.blue, width: 2, endArrowType: "triangle" } });
}

function drawDiagram(slide, kind, x, y, w, h, white) {
  const cx = x + w / 2, cy = y + h / 2;
  if (kind === "incl") {
    slide.addShape("ellipse", { x: x + 0.1, y: y + 0.1, w: w - 0.2, h: h - 0.2, fill: { color: C.sky }, line: { color: C.blue, width: 1.5 } });
    dlabel(slide, "AI", x + 0.35, y + 0.22, 1.2, 0.4, C.navy, 15, { align: "left", bold: true });
    const exs = [["画像認識", x + 0.45, y + 0.7], ["レコメンド", x + w - 1.55, y + 0.7], ["音声認識", x + 0.45, y + h - 1.0], ["自動運転", x + w - 1.5, y + h - 1.0]];
    for (const [t, ex, ey] of exs) {
      slide.addShape("ellipse", { x: ex, y: ey, w: 0.12, h: 0.12, fill: { color: C.blueLight } });
      dlabel(slide, t, ex + 0.18, ey - 0.06, 1.2, 0.25, C.muted, 10, { align: "left" });
    }
    const lw = w * 0.46, lh = h * 0.32;
    slide.addShape("ellipse", { x: cx - lw / 2, y: cy - lh / 2 + 0.1, w: lw, h: lh, fill: { color: C.blue }, shadow: makeShadow() });
    dlabel(slide, "LLM", cx - lw / 2, cy - lh / 2 + 0.1, lw, lh, C.white, 17, { bold: true });
  } else if (kind === "predict") {
    dlabel(slide, "「私は学校に  →  ？」", x, y, w, 0.5, C.navy, 16, { align: "left", bold: true });
    const cands = [["行く", 0.45], ["行きました", 0.27], ["通っている", 0.16], ["…", 0.12]];
    let ry = y + 0.7; const rh = 0.42, gap = 0.16, labelW = 1.5, barMax = w - labelW - 0.7;
    for (const [t, p] of cands) {
      dlabel(slide, t, x, ry, labelW, rh, C.ink, 13, { align: "left" });
      slide.addShape("roundRect", { x: x + labelW, y: ry + 0.06, w: barMax, h: rh - 0.12, rectRadius: 0.03, fill: { color: C.sky } });
      slide.addShape("roundRect", { x: x + labelW, y: ry + 0.06, w: barMax * p, h: rh - 0.12, rectRadius: 0.03, fill: { color: C.blue } });
      dlabel(slide, Math.round(p * 100) + "%", x + labelW + barMax + 0.05, ry, 0.6, rh, C.muted, 11, { align: "left" });
      ry += rh + gap;
    }
  } else if (kind === "editorAI") {
    slide.addShape("roundRect", { x, y, w, h, rectRadius: 0.06, fill: { color: C.navy }, shadow: makeShadow() });
    slide.addShape("rect", { x, y, w, h: 0.32, fill: { color: "0E1830" } });
    for (const d of [["FF5F56", 0.2], ["FFBD2E", 0.4], ["27C93F", 0.6]]) slide.addShape("ellipse", { x: x + d[1], y: y + 0.11, w: 0.1, h: 0.1, fill: { color: d[0] } });
    for (let i = 0; i < 3; i++) slide.addShape("rect", { x: x + 0.3, y: y + 0.6 + i * 0.32, w: w * (0.5 - i * 0.08), h: 0.12, fill: { color: "2E4978" } });
    slide.addShape("ellipse", { x: x + w - 1.1, y: y + h - 1.15, w: 0.7, h: 0.7, fill: { color: C.blue }, shadow: makeShadow() });
    slide.addImage({ data: white.code, x: x + w - 1.1 + 0.2, y: y + h - 1.15 + 0.2, w: 0.3, h: 0.3 });
    slide.addShape("roundRect", { x: x + 0.3, y: y + h - 0.78, w: w * 0.62, h: 0.42, rectRadius: 0.04, fill: { color: C.blueLight } });
    dlabel(slide, "AI が次の数行を生成", x + 0.4, y + h - 0.78, w * 0.6, 0.42, C.navy, 11, { align: "left", bold: true });
  } else if (kind === "pingpong") {
    const bw = w * 0.42, bh = 1.3, by = cy - bh / 2;
    slide.addShape("roundRect", { x, y: by, w: bw, h: bh, rectRadius: 0.06, fill: { color: C.white }, line: { color: C.navy, width: 1.5 }, shadow: makeShadow() });
    dlabel(slide, "エディター", x, by, bw, bh, C.navy, 14, { bold: true });
    slide.addShape("roundRect", { x: x + w - bw, y: by, w: bw, h: bh, rectRadius: 0.06, fill: { color: C.white }, line: { color: C.navy, width: 1.5 }, shadow: makeShadow() });
    dlabel(slide, "ChatGPT", x + w - bw, by, bw, bh, C.navy, 14, { bold: true });
    slide.addShape("line", { x: x + bw + 0.05, y: cy - 0.18, w: w - 2 * bw - 0.1, h: 0, line: { color: C.blue, width: 2, endArrowType: "triangle" } });
    slide.addShape("line", { x: x + w - bw - 0.05, y: cy + 0.18, w: -(w - 2 * bw - 0.1), h: 0, line: { color: C.blue, width: 2, endArrowType: "triangle" } });
    dlabel(slide, "コピペ", x + bw, cy - 0.62, w - 2 * bw, 0.3, C.muted, 11, {});
  } else if (kind === "flow") {
    const steps = ["プロンプトを送る", "Claude が応答", "ファイルを編集"], bh = 0.62, bw = w - 0.4;
    let sy = y + 0.15;
    steps.forEach((t, i) => {
      slide.addShape("roundRect", { x: x + 0.2, y: sy, w: bw, h: bh, rectRadius: 0.06, fill: { color: i === 1 ? C.blue : C.white }, line: { color: i === 1 ? C.blue : C.navy, width: 1.5 }, shadow: makeShadow() });
      dlabel(slide, t, x + 0.2, sy, bw, bh, i === 1 ? C.white : C.navy, 14, { bold: true });
      if (i < steps.length - 1) arrowDown(slide, cx, sy + bh + 0.04, 0.34);
      sy += bh + 0.42;
    });
  } else if (kind === "rings") {
    const layers = [["ネットワーク", 1.0, C.sky], ["認証", 0.7, "DCE6F5"], ["エージェント設定", 0.42, "C3D6F0"]];
    for (const [t, scale, col] of layers) {
      const rw = w * scale, rh = h * scale;
      slide.addShape("ellipse", { x: cx - rw / 2, y: cy - rh / 2, w: rw, h: rh, fill: { color: col }, line: { color: C.blue, width: 1 } });
    }
    slide.addShape("ellipse", { x: cx - 0.45, y: cy - 0.28, w: 0.9, h: 0.56, fill: { color: C.navy } });
    dlabel(slide, "本番", cx - 0.45, cy - 0.28, 0.9, 0.56, C.white, 12, { bold: true });
    dlabel(slide, "通信を分ける", x, y - 0.05, w, 0.28, C.muted, 10, {});
    dlabel(slide, "認証を分ける", cx - 1.0, cy - h * 0.33, 2.0, 0.25, C.navy, 10, {});
  } else if (kind === "steps") {
    const steps = ["対話で構成を詰める", "各章のブロックを決める", "素案を Markdown で書く", "スライドに変換"], bh = 0.5;
    let sy = y + 0.05;
    steps.forEach((t, i) => {
      slide.addShape("ellipse", { x: x + 0.1, y: sy, w: 0.42, h: 0.42, fill: { color: C.blue } });
      dlabel(slide, String(i + 1), x + 0.1, sy, 0.42, 0.42, C.white, 14, { bold: true });
      dlabel(slide, t, x + 0.7, sy, w - 0.7, 0.42, C.navy, 13, { align: "left", bold: true });
      if (i < steps.length - 1) arrowDown(slide, x + 0.31, sy + 0.42 + 0.02, 0.28);
      sy += bh + 0.22;
    });
  }
}

function buildNotes(s) {
  const parts = [];
  if (s.note) parts.push("【ノート】\n" + s.note);
  if (s.diagram) parts.push("【図案】\n" + s.diagram);
  if (s.todo) parts.push("【要確認】\n" + s.todo);
  return parts.join("\n\n");
}

(async () => {
  // 必要なアイコンを白/ゴーストで事前生成
  const white = {}, ghost = {};
  for (const key of Object.keys(ICONS)) {
    white[key] = await iconPng(ICONS[key], "#FFFFFF");
    ghost[key] = await iconPng(ICONS[key], "#2E4978");
  }

  const pres = new pptxgen();
  pres.layout = "LAYOUT_16x9";
  pres.author = "LT (with Claude Code)";
  pres.title = "コーディングエージェント LT";

  for (const s of slides) {
    const slide = pres.addSlide();

    if (s.type === "title") {
      slide.background = { color: C.navy };
      slide.addImage({ data: ghost.sliders, x: 7.0, y: 1.7, w: 3.1, h: 3.1 });
      slide.addShape("rect", { x: 0, y: 0, w: 0.22, h: H, fill: { color: C.blue } });
      slide.addText("CODING AGENT", { x: 0.95, y: 1.45, w: 7, h: 0.4, margin: 0, fontFace: FONT, fontSize: 13, bold: true, color: C.blueLight, charSpacing: 3, valign: "middle" });
      slide.addText("コーディングエージェント\nのはなし", { x: 0.95, y: 1.95, w: 5.9, h: 1.6, margin: 0, fontFace: FONT, fontSize: 32, bold: true, color: C.white, valign: "top", lineSpacingMultiple: 1.15 });
      slide.addText("Claude Code を中心に", { x: 0.97, y: 3.8, w: 6, h: 0.5, margin: 0, fontFace: FONT, fontSize: 17, color: C.subOnNavy, valign: "top" });
    } else if (s.type === "toc") {
      slide.background = { color: C.bg };
      slide.addText("CONTENTS", { x: MX, y: 0.7, w: 6, h: 0.4, margin: 0, fontFace: FONT, fontSize: 13, bold: true, color: C.blue, charSpacing: 3, valign: "middle" });
      slide.addText("目次", { x: MX, y: 1.05, w: 6, h: 0.7, margin: 0, fontFace: FONT, fontSize: 30, bold: true, color: C.navy, valign: "middle" });
      const toc = [[1, "AI とは"], [2, "LLM とは"], [3, "コーディングはどう変わったか"], [4, "基本的な使い方"], [5, "チューニング"], [6, "コード以外の使い道"], [7, "まとめ"]];
      let ty = 2.05; const rh = 0.42;
      for (const [n, t] of toc) {
        slide.addText(String(n).padStart(2, "0"), { x: MX, y: ty, w: 0.7, h: rh, margin: 0, fontFace: FONT, fontSize: 18, bold: true, color: C.blueLight, valign: "middle" });
        slide.addText(t, { x: MX + 0.85, y: ty, w: 8, h: rh, margin: 0, fontFace: FONT, fontSize: 17, bold: true, color: C.ink, valign: "middle" });
        ty += rh + 0.05;
      }
    } else if (s.type === "divider") {
      slide.background = { color: C.navy };
      slide.addImage({ data: ghost[chapterIcon[s.ch]], x: 6.9, y: 1.75, w: 3.0, h: 3.0 });
      slide.addShape("rect", { x: 0, y: 0, w: 0.22, h: H, fill: { color: C.blue } });
      slide.addText("SECTION", {
        x: 0.95, y: 1.0, w: 4, h: 0.35, margin: 0,
        fontFace: FONT, fontSize: 13, bold: true, color: C.blueLight, charSpacing: 3, valign: "middle",
      });
      slide.addText(String(s.ch).padStart(2, "0"), {
        x: 0.9, y: 1.2, w: 4, h: 1.4, margin: 0,
        fontFace: FONT, fontSize: 84, bold: true, color: C.blueLight, valign: "top",
      });
      const tlen = chapterTitles[s.ch].length;
      const tfs = tlen <= 7 ? 42 : tlen <= 10 ? 36 : 32;
      const dTitle = { 3: "コーディングは\nどう変わったか" }[s.ch] || chapterTitles[s.ch];
      slide.addText(dTitle, {
        x: 0.95, y: 2.85, w: 5.7, h: 1.4, margin: 0,
        fontFace: FONT, fontSize: tfs, bold: true, color: C.white, valign: "top", lineSpacingMultiple: 1.05,
      });
      slide.addText(chapterSub[s.ch], {
        x: 0.97, y: 4.35, w: 5.7, h: 0.5, margin: 0,
        fontFace: FONT, fontSize: 15, color: C.subOnNavy, valign: "top",
      });
    } else if (s.type === "statement") {
      slide.background = { color: C.navy };
      if (s.motif === "quote") {
        slide.addImage({ data: ghost.quote, x: 0.7, y: 0.55, w: 1.15, h: 1.15 });
      } else {
        iconBadge(slide, white[chapterIcon[s.ch]], (W - 0.8) / 2, 0.85, 0.8, C.blue, true);
      }
      // 段落 (空行区切り) ごとに色分け: 最終段落を blueLight 強調
      const paras = [];
      let cur = [];
      s.display.forEach((l) => { if (l === "") { paras.push(cur); cur = []; } else cur.push(l); });
      if (cur.length) paras.push(cur);
      const runs = [];
      paras.forEach((p, pi) => {
        const emph = pi === paras.length - 1 && paras.length > 1;
        p.forEach((line, li) => {
          runs.push({ text: line, options: { color: emph ? C.blueLight : C.white, bold: true, breakLine: true } });
        });
        if (pi < paras.length - 1) runs.push({ text: " ", options: { fontSize: 14, breakLine: true } });
      });
      slide.addText(runs, {
        x: 1.0, y: 1.9, w: W - 2.0, h: 2.5, margin: 0, align: "center", valign: "middle",
        fontFace: FONT, fontSize: 28, lineSpacingMultiple: 1.2,
      });
    } else if (s.type === "table") {
      slide.background = { color: C.bg };
      eyebrow(slide, s.ch);
      slide.addText(s.lead, {
        x: MX, y: 1.0, w: W - 2 * MX, h: 0.7, margin: 0,
        fontFace: FONT, fontSize: 16, bold: true, color: C.blue, valign: "middle",
      });
      const t = s.table;
      const header = t.headers.map((h) => ({ text: h, options: { fill: { color: C.navy }, color: C.white, bold: true, fontSize: 12, valign: "middle" } }));
      const rows = t.rows.map((r, ri) => r.map((cell) => ({
        text: cell,
        options: { fill: { color: t.highlightRow === ri ? C.sky : C.white }, color: C.ink, bold: t.highlightRow === ri, fontSize: 9.5, valign: "middle" },
      })));
      slide.addTable([header, ...rows], {
        x: MX, y: 2.0, w: W - 2 * MX, colW: t.colW,
        border: { pt: 0.5, color: C.line }, fontFace: FONT, rowH: 0.4, valign: "middle", autoPage: false,
      });
      footer(slide, s.no);
    } else if (s.type === "content" && s.kind === "toolcards") {
      slide.background = { color: C.bg };
      eyebrow(slide, s.ch);
      iconBadge(slide, white[s.icon], MX, 1.0, 0.7, C.blue, true);
      slide.addText(s.heading, {
        x: MX + 0.95, y: 1.0, w: W - MX - 0.95, h: 0.7, margin: 0,
        fontFace: FONT, fontSize: 26, bold: true, color: C.navy, valign: "middle",
      });
      slide.addText(s.lead, {
        x: MX, y: 1.85, w: W - 2 * MX, h: 0.6, margin: 0,
        fontFace: FONT, fontSize: 14, color: C.ink, valign: "top", lineSpacingMultiple: 1.05,
      });
      let cy = 2.4, ch = 0.56, gap = 0.08;
      for (const tool of s.tools) {
        slide.addShape("roundRect", { x: MX, y: cy, w: W - 2 * MX, h: ch, rectRadius: 0.06, fill: { color: C.white }, line: { color: C.line, width: 1 }, shadow: makeShadow() });
        iconBadge(slide, white[tool.icon], MX + 0.16, cy + (ch - 0.42) / 2, 0.42, C.blue);
        slide.addText([
          { text: tool.name + "    ", options: { bold: true, color: C.navy, fontSize: 15 } },
          { text: tool.desc, options: { color: C.muted, fontSize: 12 } },
        ], { x: MX + 0.8, y: cy, w: W - 2 * MX - 1.0, h: ch, margin: 0, valign: "middle", fontFace: FONT });
        cy += ch + gap;
      }
      footer(slide, s.no);
    } else if (s.type === "content" && s.kind === "categorycards") {
      slide.background = { color: C.bg };
      eyebrow(slide, s.ch);
      slide.addText(s.lead, {
        x: MX, y: 1.0, w: W - 2 * MX, h: 0.8, margin: 0,
        fontFace: FONT, fontSize: 16, bold: true, color: C.blue, valign: "middle", lineSpacingMultiple: 1.1,
      });
      const n = s.categories.length, gap = 0.3;
      const cw = (W - 2 * MX - gap * (n - 1)) / n;
      const cy = 2.05, chh = 2.7;
      s.categories.forEach((cat, i) => {
        const cx = MX + i * (cw + gap);
        slide.addShape("roundRect", { x: cx, y: cy, w: cw, h: chh, rectRadius: 0.08, fill: { color: cat.dim ? C.sky : C.white }, line: { color: cat.dim ? C.skyLine : C.line, width: 1 }, shadow: makeShadow() });
        slide.addShape("rect", { x: cx, y: cy, w: cw, h: 0.7, rectRadius: 0, fill: { color: cat.dim ? C.muted : C.navy } });
        slide.addText(cat.name, { x: cx, y: cy, w: cw, h: 0.7, margin: 0, fontFace: FONT, fontSize: 16, bold: true, color: C.white, align: "center", valign: "middle" });
        slide.addText(cat.desc, { x: cx + 0.2, y: cy + 0.8, w: cw - 0.4, h: 0.7, margin: 0, fontFace: FONT, fontSize: 11, color: C.muted, align: "center", valign: "top", lineSpacingMultiple: 1.05 });
        const items = cat.items.map((it) => ({
          text: (it.star ? "★ " : "") + it.t,
          options: { color: it.star ? C.blue : C.ink, bold: it.star, fontSize: 13, align: "center", breakLine: true, paraSpaceAfter: 4 },
        }));
        slide.addText(items, { x: cx + 0.15, y: cy + 1.55, w: cw - 0.3, h: chh - 1.65, margin: 0, fontFace: FONT, valign: "top" });
      });
      footer(slide, s.no);
    } else if (s.type === "content") {
      slide.background = { color: C.bg };
      eyebrow(slide, s.ch);
      iconBadge(slide, white[s.icon], MX, 1.0, 0.7, C.blue, true);
      slide.addText(s.heading, {
        x: MX + 0.95, y: 1.0, w: W - MX - 0.95, h: 0.7, margin: 0,
        fontFace: FONT, fontSize: 26, bold: true, color: C.navy, valign: "middle",
      });
      const topY = 2.0;
      const isDiag = !!s.diagramSummary;
      const drawKind = DIAG_DRAW[s.no];
      if (isDiag && drawKind) {
        // 2 カラム: 本文(左) + 実描画の図(右)
        const bodyW = 4.4;
        const fs = calcFontSize(s.display, 2.9, bodyW);
        slide.addText(bodyRuns(s.display), {
          x: MX, y: topY, w: bodyW, h: 2.95, margin: 0,
          fontFace: FONT, fontSize: fs, color: C.ink, valign: "top", lineSpacingMultiple: 1.05, paraSpaceAfter: 2,
        });
        drawDiagram(slide, drawKind, 5.3, 1.95, 4.1, 2.95, white);
      } else {
        const availBottom = isDiag ? 4.0 : 4.9;
        const availH = availBottom - topY;
        const fs = calcFontSize(s.display, availH, W - 2 * MX);
        slide.addText(bodyRuns(s.display), {
          x: MX, y: topY, w: W - 2 * MX, h: availH, margin: 0,
          fontFace: FONT, fontSize: fs, color: C.ink, valign: "top", lineSpacingMultiple: 1.05, paraSpaceAfter: 2,
        });
        if (isDiag) diagramBox(slide, s.diagramSummary, 4.1);
      }
      footer(slide, s.no);
    }

    const notes = buildNotes(s);
    if (notes) slide.addNotes(notes);
  }

  await pres.writeFile({ fileName: "../slides.pptx" });
  console.log("生成しました: ../slides.pptx / スライド数:", slides.length);
})();
