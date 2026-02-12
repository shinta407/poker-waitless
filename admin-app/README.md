# TPDS Admin - 店舗管理アプリ 🎴

ポーカールーム店舗用のウェイティング管理システム（iPad最適化）

## 🎯 機能

- **ウェイティング管理**: プレイヤーの待機リスト表示・管理
- **リアルタイム同期**: Supabase Realtimeで即座にデータ更新
- **卓状況管理**: 席数の増減をワンタップで操作
- **レート別フィルター**: 1/3, 2/5, 5/10+, Tournamentで切り替え
- **10分アラート**: 呼び出し後10分経過でビジュアル警告

## 🚀 セットアップ

### 1. 環境変数の設定

`.env.local`ファイルを作成:

```bash
cp .env.local.example .env.local
```

Supabaseの設定値を入力:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 2. 依存関係のインストール

```bash
npm install
```

### 3. Supabaseデータベースのセットアップ

プロジェクトルートの`supabase-schema.sql`をSupabase SQL Editorで実行してください。

### 4. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで http://localhost:3000 を開く

## 📱 iPad設定

### 推奨設定
- **向き**: 横向き（Landscape）固定
- **画面サイズ**: iPad Pro 12.9" または iPad Air 以上
- **ブラウザ**: Safari または Chrome
- **フルスクリーンモード**: ホーム画面に追加して使用

### ホーム画面追加手順
1. Safariで管理画面を開く
2. 共有ボタン → 「ホーム画面に追加」
3. アイコンから起動すると全画面表示

## 🏗️ 技術スタック

- **Frontend**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL + Realtime)
- **Hosting**: Vercel

## 📂 プロジェクト構造

```
admin-app/
├── app/
│   ├── page.tsx          # メインページ（管理画面）
│   ├── layout.tsx        # レイアウト設定
│   └── globals.css       # グローバルスタイル
├── components/
│   ├── RateTabs.tsx      # レート切り替えタブ
│   ├── WaitlistPanel.tsx # ウェイティングリストパネル
│   └── TableStatusPanel.tsx # 卓状況パネル
├── lib/
│   └── supabase.ts       # Supabaseクライアント設定
└── .env.local           # 環境変数（要作成）
```

## 🎨 UI仕様

### レイアウト
- **上部（10%）**: レートタブ + 店舗名
- **左側（60%）**: ウェイティングリスト
- **右側（40%）**: 卓状況カウンター

### ボタンサイズ
- レートタブ: 140px × 64px
- 呼び出し/着席: 120px × 60px
- +/- ボタン: 80px × 80px

## 🚀 Vercelデプロイ

### 1. GitHubリポジトリにプッシュ

```bash
git add .
git commit -m "Add admin app"
git push origin main
```

### 2. Vercelプロジェクト作成

1. [Vercel](https://vercel.com) にログイン
2. 「New Project」→ GitHubリポジトリを選択
3. Root Directory: `admin-app` を指定
4. 環境変数を追加:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. 「Deploy」をクリック

## 📝 TODO（次フェーズ）

- [ ] QRスキャン機能の実装
- [ ] LINE通知のEdge Function連携
- [ ] プレイヤー手動追加モーダル
- [ ] 認証機能（店舗ログイン）
- [ ] 多店舗対応

## 🐛 トラブルシューティング

### Supabaseに接続できない
- `.env.local`の設定値を確認
- Supabaseプロジェクトが起動しているか確認
- RLSポリシーが正しく設定されているか確認
