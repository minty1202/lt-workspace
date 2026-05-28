# LT 準備プロジェクト

Claude Code を使ってコーディングエージェントの LT (30 分) を準備するプロジェクト。
このスライド自体を Claude Code との対話で作っているのが特徴 (= LT のメタ回収素材)。

## ファイル構成

### 構成・素案
- `outline.md`: 全体方針 (目的、聴衆、重み付け、作業方針)
- `slide-outline.md`: 目次と各章のブロック構成
- `slide-draft.md`: スライドに載せる文言の素案 (** 主成果物 **)
- `slide-draft-history.md`: 素案クオリティアップの履歴 (4 視点評価サイクル 1〜3 の判断・適用が追跡できる)
- `process-log.md`: 対話の作業ログ

### ドキュメント
- `docs/claude-code-rules.md`: Claude Code のルール / メモリの公式仕様メモ

### Claude Code 設定 (`.claude/`)
- `.claude/settings.json`: プロジェクト共有設定 (process-log.md の Edit/Write 許可)
- `.claude/rules/process-log.md`: process-log.md の運用ルール (作業ログとしての扱い)
- `.claude/agents/`: 4 つのサブエージェント
    - `fact-checker.md`: 公式情報源で事実確認
    - `validity-checker.md`: 内容の妥当性チェック
    - `writing-style-checker.md`: 表現・口調の磨き
    - `audience-checker.md`: 聴衆視点でのチェック
- `.claude/skills/`: 2 つのスキル
    - `quality-up-slide-draft/`: 3 サイクル反復クオリティ向上 (上位)
    - `quality-up-slide-draft-cycle/`: 1 サイクル分のクオリティ向上 (下位、4 視点並行評価)

## 現状

3 サイクルのクオリティアップ完了。残作業:
- 清書 (別スキル作成 → `slide-final.md` 生成)
- 図案の実作
- スライド化 (Marp / Google Slides 等への変換)
- リポジトリ URL を素案 章 6 ブロック 4 に反映

## 続きの作業をはじめるとき

1. `slide-draft.md` を読む (主成果物)
2. `slide-draft-history.md` で 3 サイクルでの判断経緯を把握
3. `outline.md` と `slide-outline.md` で全体方針と章構成を確認
4. `process-log.md` で対話の経緯を遡れる
5. 残作業: 上記「現状」セクション参照

## このプロジェクト内ルール

- 1 スライド = 1 メッセージを軸 (`slide-draft.md` 冒頭参照)
- スライド文言はコードブロック ` ``` ` で囲んで明示
- 補足・進行メモはプレーンテキスト
- ですます調を基本 (例外あり、`slide-draft.md` 冒頭参照)
- 用語: 章 5 のチューニング手段を「カスタマイズ」とも呼ぶことがあるが、章 5 タイトルは「チューニング」で統一
