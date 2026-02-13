#!/usr/bin/env node

/**
 * アプリアイコン生成スクリプト
 * SVGからさまざまなサイズのPNGアイコンを生成
 *
 * 使用方法:
 * 1. 依存関係をインストール: npm install sharp
 * 2. 実行: node generate-icons.js
 */

const fs = require('fs');
const path = require('path');

// シャープライブラリの動的インポート
let sharp;
try {
  sharp = require('sharp');
} catch (error) {
  console.error('❌ エラー: sharpライブラリがインストールされていません');
  console.log('📦 以下のコマンドでインストールしてください:');
  console.log('   npm install sharp');
  process.exit(1);
}

// アイコンサイズの定義
const ICON_SIZES = {
  // Web/PWA用
  'icons/favicon-16x16.png': 16,
  'icons/favicon-32x32.png': 32,
  'icons/icon-72x72.png': 72,
  'icons/icon-96x96.png': 96,
  'icons/icon-128x128.png': 128,
  'icons/icon-144x144.png': 144,
  'icons/icon-152x152.png': 152,
  'icons/icon-192x192.png': 192,
  'icons/icon-384x384.png': 384,
  'icons/icon-512x512.png': 512,

  // iOS用
  'icons/apple-touch-icon.png': 180,
  'icons/apple-touch-icon-120x120.png': 120,
  'icons/apple-touch-icon-152x152.png': 152,
  'icons/apple-touch-icon-180x180.png': 180,

  // Android用
  'icons/android-chrome-192x192.png': 192,
  'icons/android-chrome-512x512.png': 512,

  // 一般用途
  'icons/icon.png': 512,
  'icons/icon-small.png': 64,
};

async function generateIcons() {
  const svgPath = path.join(__dirname, 'app-icon.svg');
  const iconsDir = path.join(__dirname, 'icons');

  // アイコンディレクトリを作成
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
    console.log('📁 iconsディレクトリを作成しました');
  }

  // SVGファイルの存在確認
  if (!fs.existsSync(svgPath)) {
    console.error(`❌ エラー: ${svgPath} が見つかりません`);
    process.exit(1);
  }

  console.log('🎨 アイコン生成を開始します...\n');

  // SVGを読み込み
  const svgBuffer = fs.readFileSync(svgPath);

  // 各サイズのアイコンを生成
  for (const [outputPath, size] of Object.entries(ICON_SIZES)) {
    const fullOutputPath = path.join(__dirname, outputPath);

    try {
      await sharp(svgBuffer)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .png()
        .toFile(fullOutputPath);

      console.log(`✅ ${outputPath} (${size}x${size}) を生成しました`);
    } catch (error) {
      console.error(`❌ ${outputPath} の生成に失敗しました:`, error.message);
    }
  }

  console.log('\n🎉 すべてのアイコンを生成しました！');
  console.log(`📂 生成先: ${iconsDir}`);
}

// マニフェストファイルの生成
function generateManifest() {
  const manifest = {
    name: "Poker Waitless - TPDS",
    short_name: "PokerWaitless",
    description: "台北のポーカープレイヤー向けリアルタイム空席確認・ウェイティングリストアプリ",
    start_url: "/",
    display: "standalone",
    background_color: "#1a1a2e",
    theme_color: "#e94560",
    orientation: "portrait",
    icons: [
      {
        src: "/icons/icon-72x72.png",
        sizes: "72x72",
        type: "image/png"
      },
      {
        src: "/icons/icon-96x96.png",
        sizes: "96x96",
        type: "image/png"
      },
      {
        src: "/icons/icon-128x128.png",
        sizes: "128x128",
        type: "image/png"
      },
      {
        src: "/icons/icon-144x144.png",
        sizes: "144x144",
        type: "image/png"
      },
      {
        src: "/icons/icon-152x152.png",
        sizes: "152x152",
        type: "image/png"
      },
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any maskable"
      },
      {
        src: "/icons/icon-384x384.png",
        sizes: "384x384",
        type: "image/png"
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable"
      }
    ]
  };

  const manifestPath = path.join(__dirname, 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log('\n📄 manifest.json を生成しました');
}

// 実行
(async () => {
  try {
    await generateIcons();
    generateManifest();
  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
    process.exit(1);
  }
})();
