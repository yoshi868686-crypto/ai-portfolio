# AI Workflow Design — Portfolio

AI に作業を任せる仕組みの設計と、その工程の記録を載せた静的サイト。

ビルドツールもフレームワークも使っていない。HTML / CSS / JS をそのまま置いてある。

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
└── assets/
    ├── style.css           デザインシステム
    ├── app.js              絞り込み・スクロール表示・先頭へ戻る
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
| 書体 | Outfit（欧文）+ Noto Sans JP（和文） |
| 本文サイズ | 960px で 14px、1600px で 18px に線形補間 |
| イージング | `cubic-bezier(0.25, 1, 0.5, 1)` / 0.4s・0.8s |

影を足したくなったら、線を太くするか塗りを変える。

## ローカルで見る

```bash
python -m http.server 8000
```

`index.html` を直接ダブルクリックしても動くが、`404.html` のリンクだけはサーバー経由でないと解決しない。

## 差し替えが要るところ

公開前に埋めること。

- `about/index.html` の連絡先 — `mailto:hello@example.com` と GitHub の URL が仮置き
- 各ページの `YOSHI`（ヘッダーのロゴとフッターの大文字）— 表示名
- `index.html` の `og:` メタ — 公開URLが決まったら `og:url` と `og:image` を足す

## 画像について

`assets/img/` には、個人情報・第三者に関する内容が写っていないスクリーンショットだけを置いてある。
元の PNG 10.1MB を WebP へ変換して 508KB。変換は次のとおり。

```bash
ffmpeg -i in.png -vf "scale='min(1400,iw)':-2:flags=lanczos" -quality 78 out.webp
```

画像を追加するときは、**実名・ローカルパス・非公開リポジトリの中身・第三者に関する記述**が
写っていないことを1枚ずつ確認する。切り抜きで外すのが一番確実。

## デプロイ（GitHub Pages）

まだ設定していない。公開するときは公開リポジトリを作り、Settings → Pages で
`main` ブランチのルートを配信元にする。`.nojekyll` を置いてあるので Jekyll の処理は走らない。
