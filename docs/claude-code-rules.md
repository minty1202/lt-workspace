# Claude Code ルール / メモリの公式仕様メモ

このプロジェクトで `.claude/rules/` や `CLAUDE.md` を書く際の参照用。公式ドキュメントを確認した内容を体系化したもの。

- 出典: https://code.claude.com/docs/en/memory.md
- 確認日: 2026-05-28

## 全体像

Claude Code が context として読み込む「指示の置き場」は次の 3 系統:

| 種類 | 配置 | 誰が書くか | 何を書くか |
| --- | --- | --- | --- |
| CLAUDE.md ファイル | プロジェクトルート / `.claude/CLAUDE.md` / `~/.claude/CLAUDE.md` 等 | 人間 | 指示・規則 (coding standards, workflows, architecture) |
| `.claude/rules/<topic>.md` | プロジェクト or `~/.claude/rules/` (再帰探索) | 人間 | トピック別の詳細指示 |
| Auto memory | `~/.claude/projects/<proj>/memory/` | Claude (自動) | 学習・パターン (build commands, debugging insights) |

別レイヤー: **スキル (`/skills`)** — 繰り返し可能な複数ステップの手順をパッケージ化。指示ではなく「ワークフロー」を保存

**重要**: ルール / CLAUDE.md は「context」として渡されるだけで、強制ではない。**確実に動作させたい操作は PreToolUse hook** を使う。

## ファイル配置の選び方

### CLAUDE.md の場所 (load order: 広い → 狭い)

| Scope | Location | 用途 |
| --- | --- | --- |
| Managed policy | OS ごとのシステムパス | 組織全体の必須ルール |
| User | `~/.claude/CLAUDE.md` | 個人の全プロジェクト共通 |
| Project | `./CLAUDE.md` or `./.claude/CLAUDE.md` | チーム共有 (VCS にコミット) |
| Local | `./CLAUDE.local.md` | 個人のプロジェクト固有 (gitignore) |

ディレクトリツリーを上に向かって walk して全部読まれ、concat される (override ではない)。サブディレクトリの CLAUDE.md は、Claude がそのディレクトリのファイルを読むときに on demand でロード。

### `.claude/rules/` の場所

- `.claude/rules/<topic>.md` (プロジェクト用)
- `~/.claude/rules/<topic>.md` (ユーザー全体用)
- 再帰探索される。サブディレクトリ (`frontend/`, `backend/`) も可
- 1 ファイル 1 トピック、descriptive な filename (`testing.md`, `api-design.md`)

## フロントマター仕様

### 正式フィールド

```yaml
---
paths:
  - "src/api/**/*.ts"
---
```

- `paths`: グロブパターンの配列。マッチするファイルを Claude が読むときに動的ロード
- `paths` **なし** のルール: launch 時に常時ロード (`.claude/CLAUDE.md` と同じ priority)

### 非公式 / 慣習

- `description`: 公式定義なし
- `applyTo` / `globs`: 公式にない (誤用)

### グロブパターン例

| Pattern | マッチ |
| --- | --- |
| `**/*.ts` | 全 TypeScript ファイル |
| `src/**/*` | `src/` 配下の全ファイル |
| `*.md` | プロジェクトルートの md |
| `src/**/*.{ts,tsx}` | brace expansion で複数拡張子 |

## 書き方のベストプラクティス (公式)

### 1. サイズ

- 1 ファイル **200 行未満** を目標
- 長いと context を消費し、adherence (遵守率) が下がる
- 大きくなったら **path-scoped rule** に分けて条件ロードする
- `@path/to/file` 構文で他ファイルを import 可能だが、launch 時に全部ロードされるので **context は減らない** (整理目的のみ)

### 2. 具体性 (Specificity)

検証可能な具体性で書く。

| ✗ | ✓ |
| --- | --- |
| Format code properly | Use 2-space indentation |
| Test your changes | Run `npm test` before committing |
| Keep files organized | API handlers live in `src/api/handlers/` |

> "The more specific and concise your instructions, the more consistently Claude follows them"

### 3. 構造

- markdown の見出しと箇条書きを使う
- 密な段落より、organized なセクションが効く
- Claude は構造化された文章をスキャンする

### 4. 一貫性

- 矛盾する規則があると Claude が任意に選ぶ
- 定期的に CLAUDE.md / nested CLAUDE.md / `.claude/rules/` を見直して矛盾や古い指示を削除

### 5. CLAUDE.md に追加するタイミング (公式が示すサイン)

- Claude が同じミスを 2 回目にした
- コードレビューが Claude が知っておくべきだったことを catch した
- セッション間で同じ訂正・明確化を毎回入力している
- 新メンバーが productive になるために必要な context

### 6. CLAUDE.md に書くべきでないもの

- 複数ステップの手順 → スキル (`/skills`) に移す
- コードの一部だけに関係するルール → path-scoped rule (`.claude/rules/<topic>.md` with `paths`) に移す

## 公式が示す path-scoped rule の例

```markdown
---
paths:
  - "src/api/**/*.ts"
---

# API Development Rules

- All API endpoints must include input validation
- Use the standard error response format
- Include OpenAPI documentation comments
```

特徴:
- 見出しがトピックを明示
- 箇条書きで簡潔
- 各項目が具体的かつ検証可能
- 全体が短い (10 行未満)

## その他の事実

- ルールは「context として」渡される、system prompt ではない。強制力はない
- ブロックレベル HTML コメント (`<!-- ... -->`) は context から strip される → maintainer 用メモを context tokens 消費なしで残せる
- `/init` でプロジェクト分析して CLAUDE.md を自動生成可能
- `/memory` で現在ロードされている CLAUDE.md / rules / auto memory を確認できる
- `InstructionsLoaded` hook でどのルールがいつ読み込まれたかをデバッグ可能

## このプロジェクトでの適用方針

- `CLAUDE.md`: ファイル構成の紹介のみに留める (短く)
- `.claude/rules/process-log.md`: `paths: ["process-log.md"]` で動的ロード。公式の path-scoped rule 例に近い形 (見出し + 箇条書き)
- 自己最適化のメタ条項は個別ルールに内包 (ユーザーの設計嗜好)
- ユーザーが思想表現として残してほしい行 (「議論で洗練」「今この瞬間の正解ではない」等) は、公式の「specificity」原則と緊張関係にあるが、ユーザー意向を優先して残す
