# コーディングエージェント LT 準備 (with Claude Code)

Claude Code を使ってコーディングエージェント (特に Claude Code 自身) について 30 分の LT を準備しているリポジトリです。
**このスライド自体を Claude Code との対話で作っている** のが特徴で、LT のメタ回収素材として使います。

## このリポジトリの読みどころ

スライドの中身そのものよりも、「Claude Code を使ってスライド準備をどう進めたか」を見るリポジトリです。

| 見るべきファイル | 何が分かるか |
| --- | --- |
| `process-log.md` | 対話の全経緯 (ユーザー × Claude の Q&A、Claude の試行錯誤、軌道修正の記録) |
| `slide-draft-history.md` | 素案を 3 サイクルかけてクオリティアップした履歴 (4 視点のサブエージェントで評価 → 改善適用) |
| `slide-draft.md` | LT で見せるスライド文言の素案 |
| `.claude/agents/` | 4 つのサブエージェント (役割特化の Claude) |
| `.claude/skills/` | 上位 / 下位の 2 段スキル (3 サイクル反復で素案のクオリティを上げる) |
| `.claude/rules/process-log.md` | このプロジェクト固有のルール |

## ファイル構成

```
.
├── README.md                    (このファイル)
├── CLAUDE.md                    (Claude Code 向けのプロジェクト指示)
├── outline.md                   (LT 全体方針)
├── slide-outline.md             (目次と章ブロック構成)
├── slide-draft.md               (スライド文言の素案 — 主成果物)
├── slide-draft-history.md       (素案クオリティアップ履歴)
├── process-log.md               (対話の作業ログ)
├── docs/
│   └── claude-code-rules.md     (Claude Code のルール / メモリの公式仕様メモ)
└── .claude/
    ├── settings.json            (プロジェクト共有設定)
    ├── rules/
    │   └── process-log.md       (process-log.md の運用ルール)
    ├── agents/
    │   ├── fact-checker.md      (公式情報源で事実確認)
    │   ├── validity-checker.md  (内容の妥当性チェック)
    │   ├── writing-style-checker.md (表現・口調の磨き)
    │   └── audience-checker.md  (聴衆視点でのチェック)
    └── skills/
        ├── quality-up-slide-draft/        (上位: 3 サイクル反復)
        └── quality-up-slide-draft-cycle/  (下位: 1 サイクル = 4 視点並行評価)
```

## 進行状況

- [x] 全体方針の決定 (`outline.md`)
- [x] 章構成 / ブロック構成の決定 (`slide-outline.md`)
- [x] 各ブロックの素案作成 (`slide-draft.md`)
- [x] 4 視点サブエージェントの作成
- [x] 3 サイクル反復スキルの作成
- [x] 3 サイクルのクオリティアップ実行 (`slide-draft-history.md` で履歴管理)
- [x] スキル群の自己最適化 (運用知見の反映)
- [ ] **清書** (別スキル作成 → `slide-final.md` 生成)
- [ ] **図案の実作** (`[図案: ...]` メモを実際の図に)
- [ ] **スライド化** (md → Marp / Google Slides 等)
- [ ] リポジトリ URL を `slide-draft.md` 章 6 ブロック 4 に反映

## 続きの作業をはじめるとき

このリポジトリをクローンして Claude Code で作業を再開する手順:

```bash
git clone <このリポジトリの URL>
cd <リポジトリ名>
claude  # Claude Code 起動
```

最初に確認してほしいこと:

1. `slide-draft.md` を読む (主成果物の現状)
2. `slide-draft-history.md` で 3 サイクルでの判断経緯を把握
3. `outline.md` と `slide-outline.md` で全体方針と章構成を確認
4. `CLAUDE.md` でプロジェクト固有のルールを把握
5. 残作業を進める (上記「進行状況」の未チェック項目)

### 既存スキルの活用

このプロジェクトには `quality-up-slide-draft` スキルが入っているので、清書前にもう一周クオリティを上げたければ呼べます。

```
クオリティアップスキルを 1 サイクル回して
```

または明示的に:

```
/quality-up-slide-draft
```

### 次に作るべきスキル

清書スキル (例: `polish-slide-draft`) — `slide-draft.md` を読んで `slide-final.md` を生成。
詳細は `slide-draft.md` および `slide-draft-history.md` の方針に従う。

## このプロジェクト固有の方針 (`CLAUDE.md` にもあります)

- **1 スライド = 1 メッセージ** を軸
- スライド文言はコードブロック ` ``` ` で囲んで明示、補足・進行メモはプレーンテキスト
- **ですます調を基本** (例外: 疑問文 / 定義式 / コマンド・年号・体言止めのみのリスト)
- 機械的な一括置換は避け、1 件ずつ文脈を見て判断する
- 最適化スキルでは Claude の判断ハードルを下げる (細部の 1 件ずつ確認はスキルの価値を下げる)

## メモリ非依存で動くか

このリポジトリ内のスキル / サブエージェント / ルール / ドキュメントはすべてリポジトリ内で完結しています。
グローバルメモリ (`~/.claude/projects/<proj>/memory/`) への依存はありません。別 PC でクローンして使えます。
