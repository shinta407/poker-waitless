# Poker Waitless アプリアイコン使用ガイド

## 📱 アイコンのデザインコンセプト

poker-waitlessアプリのアイコンは、以下の要素を組み合わせています：

- **ポーカーチップ**: 赤のグラデーションでポーカーの雰囲気を表現
- **スペードマーク**: 中央にポーカーの象徴的なスペードを配置
- **稲妻と矢印**: 左上に「待ち時間なし（Waitless）」のスピード感を表現
- **"W"の透かし**: Waitlessの頭文字を控えめに配置

### カラーパレット
- **背景**: ダークネイビー (#1a1a2e, #16213e)
- **メインカラー**: レッド (#e94560, #c72c48) - ポーカーチップ
- **アクセント**: シアン (#00d9ff) - スピード表現
- **テキスト**: ホワイト (#ffffff)

---

## 🎨 ファイル構成

### メインファイル
- `app-icon.svg` - ソースとなるSVGアイコン（512x512）

### 生成スクリプト
- `generate-icons.js` - PNGアイコン自動生成スクリプト
- `manifest.json` - PWA用マニフェストファイル（自動生成）

### 生成されるアイコン（icons/ディレクトリ）
```
icons/
├── favicon-16x16.png          # Webファビコン（小）
├── favicon-32x32.png          # Webファビコン（大）
├── icon-72x72.png             # PWA用
├── icon-96x96.png             # PWA用
├── icon-128x128.png           # PWA用
├── icon-144x144.png           # PWA用
├── icon-152x152.png           # PWA用
├── icon-192x192.png           # PWA用
├── icon-384x384.png           # PWA用
├── icon-512x512.png           # PWA用（最大）
├── apple-touch-icon.png       # iOS用（180x180）
├── apple-touch-icon-120x120.png
├── apple-touch-icon-152x152.png
├── apple-touch-icon-180x180.png
├── android-chrome-192x192.png # Android用
├── android-chrome-512x512.png
├── icon.png                   # 汎用アイコン（512x512）
└── icon-small.png             # 汎用小サイズ（64x64）
```

---

## 🚀 使用方法

### 1. 依存関係のインストール

```bash
npm install sharp
```

### 2. アイコンの生成

```bash
node generate-icons.js
```

実行すると、`icons/` ディレクトリに全サイズのPNGアイコンが生成されます。

### 3. Webアプリでの使用

#### HTMLのheadタグに追加

```html
<!-- Favicon -->
<link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16.png">

<!-- Apple Touch Icons -->
<link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png">

<!-- Android Chrome -->
<link rel="icon" type="image/png" sizes="192x192" href="/icons/android-chrome-192x192.png">
<link rel="icon" type="image/png" sizes="512x512" href="/icons/android-chrome-512x512.png">

<!-- PWA Manifest -->
<link rel="manifest" href="/manifest.json">

<!-- Theme Color -->
<meta name="theme-color" content="#e94560">
```

---

## 📱 各プラットフォームでの表示

### PWA（Progressive Web App）
- `manifest.json` が自動生成されます
- ホーム画面に追加したときのアイコンとして使用

### iOS（Safari）
- `apple-touch-icon.png` が使用されます
- ホーム画面に追加時に角丸が自動適用

### Android（Chrome）
- `android-chrome-*.png` が使用されます
- アダプティブアイコンとして表示

### LINE LIFF
- LINEミニアプリの設定画面で `icons/icon-512x512.png` をアップロード

---

## ✏️ カスタマイズ

### 色の変更
`app-icon.svg` の以下の部分を編集：

```xml
<!-- 背景色 -->
<linearGradient id="bgGradient">
  <stop offset="0%" style="stop-color:#1a1a2e;"/>
  <stop offset="100%" style="stop-color:#16213e;"/>
</linearGradient>

<!-- チップの色 -->
<linearGradient id="chipGradient">
  <stop offset="0%" style="stop-color:#e94560;"/>
  <stop offset="100%" style="stop-color:#c72c48;"/>
</linearGradient>
```

### デザインの変更
- SVGファイルを直接編集
- Figma、Illustrator、Inkscapeなどで開いて編集可能
- 編集後、再度 `node generate-icons.js` を実行

---

## 🔧 トラブルシューティング

### sharpのインストールエラー
```bash
# Node.jsのバージョンを確認
node --version

# npmのキャッシュをクリア
npm cache clean --force

# 再インストール
npm install sharp
```

### 生成されたアイコンが表示されない
- ブラウザのキャッシュをクリア
- ファイルパスが正しいか確認
- サーバーを再起動

---

## 📝 ライセンスと使用制限

このアイコンはpoker-waitless（TPDS）プロジェクト専用です。
プロジェクト内での自由な使用・改変が可能です。

---

## 🎯 次のステップ

1. ✅ アイコンを生成
2. ✅ Webアプリに組み込み
3. ✅ PWA対応の確認
4. ✅ LINEミニアプリに設定
5. ✅ 各デバイスでの表示確認

---

**作成日**: 2026-02-13
**バージョン**: 1.0
