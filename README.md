# AI Workflow Design — Portfolio

AI に作業を任せる仕組みの設計と、その工程の記録を載せた静的サイト。

**公開先** https://yoshi868686-crypto.github.io/ai-portfolio/

ビルドツールもフレームワークも使っていない。HTML / CSS / JS をそのまま置いてある。
外部ドメインへのリクエストは**ゼロ**（フォントも自前ホスト）。

## 構成

```
.
├── index.html              トップ（代表3件 + Works抜粋 + Log抜粋）
├── works/
│   ├── index.html          成果物の一覧（カテゴリで絞り込み）
│   ├── stopwatch/          Case 01 — 完了条件だけ渡して自走させる
│   ├── pipeline/           Case 02 — 音声メモ1本から記事4種類まで
│   └── news-automation/    Case 03 — ブラウザ操作を任せて表にする
├── log/index.html          作業ログ（日付降順・16件）
├── system/index.html       スキル12 / エージェント7 の設計
├── about/index.html        プロフィールと連絡先
├── 404.html                自己完結（パス深度に依存しない）
├── sitemap.xml
└── assets/
    ├── style.css           デザインシステム
    ├── app.js              絞り込み・スクロール表示・先頭へ戻る
    ├── og-cover.jpg        OGP用 1200x630
    ├── fonts/              Outfit latin サブセット（OFL）
    └── img/                WebP（7枚・合計約 500KB）
```

## デザインシステム

`Bold Outline Pop` — 黒い輪郭線を全要素に等しく引き、影を一切使わない。
トークンは `assets/style.css` の `:root` にまとまっている。

| 種別 | 値 |
|---|---|
| 線 | `--stroke: 2px` / `--stroke-thick: 3px` / 色は常に `#000` |
| 原色 | 赤 `#ed3b3b` 青 `#1473c1` 黄 `#ffc536` 緑 `#22ac38` 橙 `#f57022` |
| 状態変化 | `--highlight: #ffdc55`（hover / active でこの色に置き換わる） |
| 影 | **使わない。** 深さは輪郭線だけで表現する |
| 本文サイズ | 960px で 14px、1600px で 18px に線形補間 |
| イージング | `cubic-bezier(0.25, 1, 0.5, 1)` / 0.4s・0.8s |

影を足したくなったら、線を太くするか塗りを変える。

設計の正本は `design-system_bold-outline-pop.yaml`（このリポジトリ外）。
**CSS だけ直すと次の実装で値が戻る**ので、トークンを変えるときは YAML も一緒に直す。

### フォント

- **欧文** Outfit を `assets/fonts/outfit-latin.woff2` に自前ホスト（32KB / 1リクエスト）。
  可変フォントなので weight 400〜800 が1ファイルで足りる。ライセンスは同ディレクトリの `OFL.txt`
- **和文** Web フォントを配信しない。読み手の system gothic に任せる

以前は Google Fonts から Noto Sans JP を読んでおり、**実測 698KB / 32リクエスト**、
ページ重量の 69% を占めていた。Noto Sans JP は可変フォントで weight 400/500/700 が
同一の woff2 を共有するため、**ウェイトを減らしてもバイト数は減らない**。落とすしかなかった。

### 線幅の注意

`vector-effect` は**継承されないプロパティ**なので、`<svg>` ルートに属性で書いても子要素に効かない。
`assets/style.css` の `.tile svg *` と `.table-wrap > svg *` で図形に直接当てている。
これが無いと、100×100 の viewBox を約2倍に拡大しているタイルの線が
隣のカード枠 2px に対して 4px 前後で描かれ、システムの中核が破れる。

## ローカルで見る

```bash
python -m http.server 8000
```

`index.html` を直接ダブルクリックしても動くが、`404.html` のリンクだけはサーバー経由でないと解決しない。

## 画像について

`assets/img/` には、個人情報・第三者に関する内容が写っていないスクリーンショットだけを置いてある。
元の PNG 10.1MB を WebP へ変換して 508KB。変換は次のとおり。

```bash
ffmpeg -i in.png -vf "scale='min(1400,iw)':-2:flags=lanczos" -quality 78 out.webp
```

画像を追加するときは、**実名・ローカルパス・非公開リポジトリの中身・第三者に関する記述**が
写っていないことを1枚ずつ確認する。切り抜きで外すのが一番確実。

`width` / `height` 属性は**必ず実寸を書く**。ずれているとレイアウトが飛ぶ。

```bash
ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0:s=x FILE
```

## デプロイ

`main` に push すると GitHub Pages が自動で再ビルドする（1〜2分）。

```bash
git add -A && git commit -m "..." && git push
```

状態の確認。

```bash
gh api repos/yoshi868686-crypto/ai-portfolio/pages/builds/latest --jq '.status, .commit'
```

`.nojekyll` を置いてあるので Jekyll の処理は走らない。消さないこと。

## 残っている改善案

独立監査（12エージェント）で挙がったまま未着手のもの。実施前に自分で再確認すること。

- ログにパーマリンクとフィードが無い。`id="2026-08-20-..."` のアンカーと `feed.xml`
- Log にタグ絞り込みが無い（Works の `data-filter` の仕組みをそのまま流用できる）
- `works/` と `log/` で h1 の次が h3 になっている。カード群に h2 を入れる
- 証拠として足したいスクリーンショットが 10〜12枚ある（素材は Desktop\portfolio に57枚）
- `code` 要素だけ 1px の灰色罫と角丸 4px で、系から外れている
