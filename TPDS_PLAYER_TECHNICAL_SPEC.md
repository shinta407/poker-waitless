# TPDS Player App（LINEミニアプリ）技術仕様書

**Version:** 1.0
**作成日:** 2026-02-11
**対象:** Player側 LINEミニアプリ（エンドユーザー向け）
**関連ドキュメント:** アプリ仕様書 (1).md, supabase-schema.sql

---

## 目次

1. [プロジェクト概要](#1-プロジェクト概要)
2. [技術スタック](#2-技術スタック)
3. [プロジェクト構成](#3-プロジェクト構成)
4. [画面設計](#4-画面設計)
5. [LIFF統合設計](#5-liff統合設計)
6. [リアルタイム機能設計](#6-リアルタイム機能設計)
7. [データフロー＆API設計](#7-データフローapi設計)
8. [ディレクトリ構成](#8-ディレクトリ構成)
9. [実装パターン](#9-実装パターン)
10. [環境変数設定](#10-環境変数設定)
11. [MVP範囲](#11-mvp範囲)
12. [実装スケジュール](#12-実装スケジュール)
13. [デプロイ設定](#13-デプロイ設定)
14. [LINE開発者登録手順](#14-line開発者登録手順)

---

## 1. プロジェクト概要

### 1.1 背景

台湾ポーカー・ドミナント・システム（TPDS）は、ポーカー店舗のウェイティングリスト管理システムです。現在、Admin側（iPad用）が実装済みで、次のステップとしてPlayer側（LINEミニアプリ）を開発します。

### 1.2 目的

エンドユーザーが以下の機能を利用できるLINEミニアプリを提供：
- **リアルタイム空席MAP**：台北市内の全ポーカー店舗の混雑状況を信号機（🟢🟡🔴）で可視化
- **リモートチェックイン**：店舗到着前にウェイティングリスト登録
- **マイステータス確認**：リアルタイムで待ち順と呼び出し予測時刻を表示
- **LINE通知**：順番が来たらLINEトークに通知

### 1.3 主要機能

| 機能 | 説明 |
|------|------|
| リアルタイムMAP | Google Maps上に店舗ピン表示、信号機で混雑状況を可視化 |
| 店舗詳細 | レート別の待ち人数、営業時間、住所を表示 |
| チェックイン | レート選択、到着時間入力後、ウェイティングリスト登録 |
| マイステータス | 現在の待ち順、呼び出し予測時刻をリアルタイム表示 |
| LINE通知 | 店舗スタッフが呼び出しボタンを押したら即座にLINE通知 |
| 多言語対応 | 日本語、中国語（繁体字）、英語 |

---

## 2. 技術スタック

### 2.1 フロントエンド

| 技術 | バージョン | 用途 |
|------|-----------|------|
| **Next.js** | 16.x | Reactフレームワーク（App Router使用） |
| **React** | 19.x | UIライブラリ |
| **TypeScript** | 5.x | 型安全性 |
| **LIFF SDK** | @line/liff 2.x | LINE認証、プロフィール取得 |
| **Google Maps API** | @vis.gl/react-google-maps | MAP表示、店舗ピン表示 |
| **Tailwind CSS** | 4.x | スタイリング |
| **next-intl** | 3.x | 多言語対応 |

**選定理由：**
- Admin側と技術スタックを統一し、コード共有を最大化
- LIFF SDKはLINEミニアプリの標準SDK
- @vis.gl/react-google-mapsはReact 19対応済み

### 2.2 バックエンド

| 技術 | 用途 |
|------|------|
| **Supabase** | PostgreSQLデータベース（Admin側と共有） |
| **Supabase Realtime** | WebSocketベースのリアルタイム同期 |
| **Supabase Edge Functions** | LINE Messaging API呼び出し（通知トリガー） |

**データベーステーブル（既存）：**
- `stores`：店舗マスタ
- `tables`：卓状況（レート、空席数）
- `waitlist`：ウェイティングリスト

### 2.3 インフラ

| 技術 | 用途 |
|------|------|
| **Vercel** | Next.jsホスティング（HTTPS自動化） |
| **LINE Developers** | LIFF App + Messaging API |
| **Supabase Cloud** | データベース、Realtime、Edge Functions |

---

## 3. プロジェクト構成

### 3.1 Monorepo構成

型定義とSupabase接続を共有するため、Monorepo構成を採用：

```
poker-waitless/
├── admin-app/          # 既存（iPad用Admin）
│   ├── app/
│   ├── components/
│   ├── lib/
│   │   └── supabase.ts  # 型定義、Supabase接続
│   └── package.json
├── player-app/         # 新規（Player側LINEミニアプリ）
│   ├── app/
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   └── package.json
├── shared/             # 共有コード（型定義、ユーティリティ）
│   ├── types/
│   │   └── database.ts  # Store, Table, WaitlistEntry型
│   └── utils/
├── supabase/
│   ├── migrations/
│   │   └── 20250101_schema.sql
│   └── functions/
│       └── send-line-notification/
│           └── index.ts
├── supabase-schema.sql
└── package.json
```

### 3.2 共有コードの方針

**共有する：**
- 型定義（Store, Table, WaitlistEntry）
- Supabase接続設定
- 信号機ロジック（空席状況の計算）

**共有しない：**
- UIコンポーネント（Admin=iPad、Player=スマホで最適化が異なる）
- 認証ロジック（Admin=匿名、Player=LINE認証）

---

## 4. 画面設計

### 4.1 LINEリッチメニュー（エントリーポイント）

LINEトーク画面下部の常設メニューから各機能にアクセス。

**レイアウト（4分割）：**

```
┌─────────────┬─────────────┐
│  🟢空席MAP  │  ⏳マイ     │
│             │  ステータス │
├─────────────┼─────────────┤
│  ❓使い方  │  💎VIPパス  │
│             │ （Phase 2） │
└─────────────┴─────────────┘
```

**LIFF URL設定：**
- 🟢空席MAP → `https://player.tpds.app/map`
- ⏳マイステータス → `https://player.tpds.app/status`
- ❓使い方 → `https://player.tpds.app/guide`
- 💎VIPパス → `https://player.tpds.app/vip`（Phase 2）

---

### 4.2 リアルタイムMAP画面（/app/map/page.tsx）

**目的：** 台北市内の全ポーカー店舗の混雑状況を一目で把握。

#### 4.2.1 画面レイアウト

```
┌─────────────────────────────┐
│ 🔍 [店舗名検索]             │ ← SearchBar
├─────────────────────────────┤
│ 🎯 1/3  2/5  5/10+  すべて │ ← FilterBar（レートフィルター）
├─────────────────────────────┤
│                             │
│     Google Maps             │
│   ┌──┐  ┌──┐  ┌──┐        │
│   │🟢│  │🟡│  │🔴│        │ ← 店舗ピン（信号機）
│   └──┘  └──┘  └──┘        │
│                             │
└─────────────────────────────┘
```

#### 4.2.2 コンポーネント構成

```typescript
// app/map/page.tsx
<MapContainer>
  <SearchBar onSearch={handleSearch} />
  <FilterBar selectedRate={rate} onRateChange={setRate} />
  <MapView
    stores={filteredStores}
    center={defaultCenter}
  >
    <StoreMarkers stores={filteredStores} />
  </MapView>
</MapContainer>
```

**主要コンポーネント：**

| コンポーネント | 責務 |
|----------------|------|
| `<SearchBar />` | 店舗名検索入力 |
| `<FilterBar />` | レート選択フィルター（1/3, 2/5, 5/10+, すべて） |
| `<MapView />` | Google Maps表示 |
| `<StoreMarkers />` | 店舗ピン表示（信号機ロジック適用） |

#### 4.2.3 信号機ロジック

店舗の混雑状況を3色で可視化：

```typescript
// lib/storeStatus.ts
export function getStoreStatus(
  tables: Table[],
  waitlist: WaitlistEntry[]
): 'green' | 'yellow' | 'red' {
  // 1. 利用可能な席数を計算
  const availableSeats = tables.reduce((sum, table) => {
    if (table.status === 'open') {
      return sum + (table.max_seats - table.current_players)
    }
    return sum
  }, 0)

  // 2. 待機中の人数
  const waitingCount = waitlist.filter(w => w.status === 'waiting').length

  // 3. 信号機ロジック
  if (availableSeats > 0) {
    return 'green'  // 🟢 即座れる
  } else if (waitingCount <= 3) {
    return 'yellow' // 🟡 待ち3人以内
  } else {
    return 'red'    // 🔴 混雑
  }
}
```

**信号機の意味：**
- 🟢 **緑**：空席あり、すぐ座れる
- 🟡 **黄**：満席だが待ち3人以内
- 🔴 **赤**：満席＋待ち4人以上

#### 4.2.4 リアルタイム更新

Admin側（iPad）で卓状況や待機リストが更新されたら、MAP画面の信号機も即座に更新：

```typescript
// hooks/useRealtimeStores.ts
export function useRealtimeStores() {
  const [stores, setStores] = useState<Store[]>([])

  useEffect(() => {
    // 初期データ取得
    loadStores()

    // リアルタイム購読（全店舗）
    const tablesChannel = supabase
      .channel('all-tables')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tables',
      }, () => {
        loadStores() // テーブル状況変更時に再取得
      })
      .subscribe()

    const waitlistChannel = supabase
      .channel('all-waitlist')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'waitlist',
      }, () => {
        loadStores() // 待機リスト変更時に再取得
      })
      .subscribe()

    return () => {
      tablesChannel.unsubscribe()
      waitlistChannel.unsubscribe()
    }
  }, [])

  return stores
}
```

#### 4.2.5 パフォーマンス最適化

**課題：** 全店舗のデータを常時購読するとパフォーマンス低下の恐れ。

**対策：**
1. **デバウンス処理**（300ms）で再レンダリング頻度を削減
2. **メモ化**（useMemo）で信号機ロジックの計算を最適化
3. **仮想化**（react-window）で多数の店舗ピンを効率表示（台北市内10店舗程度なら不要）

```typescript
// hooks/useDebouncedRealtime.ts
export function useDebouncedRealtime(delay = 300) {
  const [data, setData] = useState([])
  const debouncedSet = useMemo(
    () => debounce(setData, delay),
    [delay]
  )
  return [data, debouncedSet]
}
```

---

### 4.3 店舗詳細＆チェックイン画面（/app/store/[storeId]/page.tsx）

**目的：** 特定店舗の詳細情報を表示し、ウェイティングリストにチェックイン。

#### 4.3.1 画面レイアウト

```
┌─────────────────────────────┐
│ ← CTP Taipei              × │ ← Header（戻るボタン）
├─────────────────────────────┤
│ 📍台北市大安区復興南路...  │
│ 🕐 12:00-24:00              │
├─────────────────────────────┤
│ レート選択                  │
│ ┌─────┐ ┌─────┐ ┌─────┐   │
│ │ 1/3 │ │ 2/5 │ │5/10+│   │ ← RateSelector
│ └─────┘ └─────┘ └─────┘   │
├─────────────────────────────┤
│ 待ち状況（1/3）            │
│ 待ち人数: 2人              │ ← WaitlistStatus（リアルタイム）
│ 予測待ち時間: 15-30分      │
├─────────────────────────────┤
│ 到着時間                   │
│ ┌──────┐ ┌──────┐         │
│ │15分後│ │30分後│ ...     │ ← ArrivalTimeInput
│ └──────┘ └──────┘         │
├─────────────────────────────┤
│      [チェックイン]         │ ← CheckInButton
└─────────────────────────────┘
```

#### 4.3.2 コンポーネント構成

```typescript
// app/store/[storeId]/page.tsx
<StoreDetailContainer>
  <StoreHeader store={store} />
  <RateSelector
    rates={store.rates}
    selected={selectedRate}
    onSelect={setSelectedRate}
  />
  <WaitlistStatus
    rate={selectedRate}
    waitlist={waitlist}
    tables={tables}
  />
  <ArrivalTimeInput
    value={arrivalTime}
    onChange={setArrivalTime}
  />
  <CheckInButton
    disabled={!selectedRate || !arrivalTime}
    onClick={handleCheckIn}
  />
</StoreDetailContainer>
```

**主要コンポーネント：**

| コンポーネント | 責務 |
|----------------|------|
| `<StoreHeader />` | 店名、住所、営業時間表示 |
| `<RateSelector />` | レート選択ボタン（1/3, 2/5, 5/10+） |
| `<WaitlistStatus />` | 選択レートの待ち人数、予測時間（リアルタイム） |
| `<ArrivalTimeInput />` | 到着時間選択（15分後、30分後、45分後、1時間後） |
| `<CheckInButton />` | チェックイン実行ボタン |

#### 4.3.3 リアルタイム待ち状況表示

選択したレートの待ち人数をリアルタイム表示：

```typescript
// hooks/useRealtimeWaitlist.ts
export function useRealtimeWaitlist(storeId: string, rate: string) {
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([])

  useEffect(() => {
    // 初期データ取得
    loadWaitlist()

    // リアルタイム購読（特定店舗・レート）
    const channel = supabase
      .channel(`waitlist-${storeId}-${rate}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'waitlist',
        filter: `store_id=eq.${storeId}`,
      }, (payload) => {
        if (payload.new?.rate_preference === rate) {
          // INSERT/UPDATE/DELETE に応じて waitlist を更新
          handleRealtimeUpdate(payload)
        }
      })
      .subscribe()

    return () => channel.unsubscribe()
  }, [storeId, rate])

  return { waitlist, waitingCount: waitlist.filter(w => w.status === 'waiting').length }
}
```

#### 4.3.4 チェックインフロー

```typescript
// app/store/[storeId]/page.tsx
async function handleCheckIn() {
  // 1. LINE認証チェック
  if (!liff.isLoggedIn()) {
    liff.login()
    return
  }

  // 2. LINEプロフィール取得
  const profile = await liff.getProfile()

  // 3. waitlist テーブルに INSERT
  const { data, error } = await supabase
    .from('waitlist')
    .insert({
      store_id: storeId,
      user_id: profile.userId,
      user_name: profile.displayName,
      rate_preference: selectedRate,
      arrival_estimation_minutes: arrivalTime,
      status: 'waiting',
    })
    .select()

  if (error) {
    alert('チェックインエラー')
    return
  }

  // 4. マイステータス画面へ遷移
  router.push(`/status/${data[0].id}`)
}
```

---

### 4.4 マイステータス画面（/app/status/[waitlistId]/page.tsx）

**目的：** 現在の待ち順と呼び出し予測時刻をリアルタイム表示。

#### 4.4.1 画面レイアウト

```
┌─────────────────────────────┐
│        CTP Taipei           │
│        1/3 レート           │
├─────────────────────────────┤
│                             │
│      現在の待ち順位         │
│                             │
│         #3                  │ ← PositionCard（大きく表示）
│                             │
├─────────────────────────────┤
│ 🕐 呼び出し予測: 18:30      │ ← EstimatedTime
├─────────────────────────────┤
│ 🔔 LINE通知: 有効           │ ← NotificationStatus
├─────────────────────────────┤
│      [キャンセル]           │ ← CancelButton
└─────────────────────────────┘
```

#### 4.4.2 コンポーネント構成

```typescript
// app/status/[waitlistId]/page.tsx
<StatusContainer>
  <StoreInfo store={store} rate={entry.rate_preference} />
  <PositionCard position={currentPosition} />
  <EstimatedTime
    position={currentPosition}
    avgWaitTime={15} // 分
  />
  <NotificationStatus enabled={true} />
  <CancelButton onClick={handleCancel} />
</StatusContainer>
```

**主要コンポーネント：**

| コンポーネント | 責務 |
|----------------|------|
| `<PositionCard />` | 現在の待ち順を大きく表示 |
| `<EstimatedTime />` | 呼び出し予測時刻を計算・表示 |
| `<NotificationStatus />` | LINE通知の設定状況表示 |
| `<CancelButton />` | チェックインをキャンセル |

#### 4.4.3 リアルタイム順位更新

自分のwaitlistエントリを購読し、順位変動を即座に反映：

```typescript
// hooks/useRealtimePosition.ts
export function useRealtimePosition(waitlistId: string) {
  const [entry, setEntry] = useState<WaitlistEntry | null>(null)
  const [position, setPosition] = useState(0)

  useEffect(() => {
    // 自分のエントリ取得
    loadEntry()

    // リアルタイム購読
    const channel = supabase
      .channel(`my-waitlist-${waitlistId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'waitlist',
        filter: `id=eq.${waitlistId}`,
      }, (payload) => {
        if (payload.eventType === 'UPDATE') {
          setEntry(payload.new as WaitlistEntry)

          // status が 'called' になったら全画面モーダル表示
          if (payload.new.status === 'called') {
            showCalledModal()
          }
        }
      })
      .subscribe()

    return () => channel.unsubscribe()
  }, [waitlistId])

  // 現在の順位を計算
  useEffect(() => {
    if (entry) {
      calculatePosition(entry).then(setPosition)
    }
  }, [entry])

  return { entry, position }
}

async function calculatePosition(entry: WaitlistEntry): Promise<number> {
  const { data } = await supabase
    .from('waitlist')
    .select('id')
    .eq('store_id', entry.store_id)
    .eq('rate_preference', entry.rate_preference)
    .eq('status', 'waiting')
    .lt('created_at', entry.created_at)

  return (data?.length || 0) + 1
}
```

#### 4.4.4 呼び出し通知モーダル

Admin側で「呼び出し」ボタンが押されたら、全画面モーダルで通知：

```typescript
// components/CalledModal.tsx
export function CalledModal({ show, onClose }: { show: boolean, onClose: () => void }) {
  if (!show) return null

  return (
    <div className="fixed inset-0 bg-green-500 z-50 flex items-center justify-center">
      <div className="text-center">
        <div className="text-9xl mb-8 animate-bounce">🔔</div>
        <h1 className="text-5xl font-bold text-white mb-4">
          順番が来ました！
        </h1>
        <p className="text-2xl text-white mb-8">
          店舗にお越しください
        </p>
        <button
          onClick={onClose}
          className="bg-white text-green-500 px-12 py-6 rounded-xl text-2xl font-bold"
        >
          確認
        </button>
      </div>
    </div>
  )
}
```

---

### 4.5 使い方ガイド画面（/app/guide/page.tsx）

**目的：** 初回ユーザー向けに使い方を説明。

**内容：**
1. MAP画面で店舗を探す
2. レートと到着時間を選択してチェックイン
3. マイステータスで順番を確認
4. LINE通知が来たら店舗へ

**実装：** 静的ページ（Markdown + Tailwindでスタイリング）

---

## 5. LIFF統合設計

### 5.1 LIFFとは

LIFF（LINE Front-end Framework）は、LINE内でWebアプリを動かすための公式SDK。

**主要機能：**
- LINE認証（OAuth 2.0）
- ユーザープロフィール取得（userId, displayName, pictureUrl）
- LINEトークへのメッセージ送信
- 位置情報取得（GPS）

### 5.2 LIFF初期化

```typescript
// app/layout.tsx
'use client'

import { useEffect, useState } from 'react'
import liff from '@line/liff'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [liffReady, setLiffReady] = useState(false)

  useEffect(() => {
    initializeLiff()
  }, [])

  async function initializeLiff() {
    try {
      await liff.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID || '' })
      console.log('✅ LIFF initialized')
      setLiffReady(true)

      // 未ログインならログイン画面へ
      if (!liff.isLoggedIn()) {
        liff.login()
      }
    } catch (err) {
      console.error('❌ LIFF initialization failed:', err)
    }
  }

  if (!liffReady) {
    return <div>Loading...</div>
  }

  return (
    <html lang="zh-TW">
      <body>{children}</body>
    </html>
  )
}
```

### 5.3 LINE認証フロー

```typescript
// hooks/useLineProfile.ts
import { useEffect, useState } from 'react'
import liff from '@line/liff'

export function useLineProfile() {
  const [profile, setProfile] = useState<{
    userId: string
    displayName: string
    pictureUrl?: string
  } | null>(null)

  useEffect(() => {
    if (liff.isLoggedIn()) {
      liff.getProfile().then(setProfile)
    }
  }, [])

  return profile
}
```

**認証フロー：**
1. ユーザーがLIFFアプリを開く
2. `liff.init()` 実行
3. 未ログインなら `liff.login()` でLINEログイン画面表示
4. ログイン後、`liff.getProfile()` でuserIdとdisplayNameを取得
5. userIdをSupabaseのwaitlist.user_idに保存

### 5.4 LINE通知の実装

Admin側で「呼び出し」ボタンが押されたら、LINE Messaging APIでユーザーにPush Messageを送信。

#### 5.4.1 アーキテクチャ

```
Admin iPad（呼び出しボタン）
  ↓
waitlist.status = 'called'（Supabase UPDATE）
  ↓
Database Trigger
  ↓
Supabase Edge Function（send-line-notification）
  ↓
LINE Messaging API（Push Message）
  ↓
ユーザーのLINEトーク画面
```

#### 5.4.2 Database Trigger

```sql
-- supabase/migrations/create_line_notification_trigger.sql
CREATE OR REPLACE FUNCTION notify_player_called()
RETURNS TRIGGER AS $$
BEGIN
  -- status が 'called' になったら Edge Function を呼び出し
  IF NEW.status = 'called' AND OLD.status != 'called' THEN
    PERFORM pg_notify(
      'player_called',
      json_build_object(
        'waitlist_id', NEW.id,
        'user_id', NEW.user_id,
        'store_id', NEW.store_id
      )::text
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_player_called
  AFTER UPDATE ON waitlist
  FOR EACH ROW
  EXECUTE FUNCTION notify_player_called();
```

#### 5.4.3 Supabase Edge Function

```typescript
// supabase/functions/send-line-notification/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const LINE_CHANNEL_ACCESS_TOKEN = Deno.env.get('LINE_CHANNEL_ACCESS_TOKEN')

serve(async (req) => {
  try {
    const { waitlist_id, user_id, store_id } = await req.json()

    // 1. 店舗名取得
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )
    const { data: store } = await supabase
      .from('stores')
      .select('name')
      .eq('id', store_id)
      .single()

    // 2. LINE Messaging APIでPush Message送信
    await fetch('https://api.line.me/v2/bot/message/push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        to: user_id,
        messages: [
          {
            type: 'text',
            text: `🔔 順番が来ました！\n\n店舗: ${store.name}\n店舗にお越しください。`,
          },
          {
            type: 'template',
            altText: 'ステータス確認',
            template: {
              type: 'buttons',
              text: 'マイステータスを確認',
              actions: [
                {
                  type: 'uri',
                  label: 'ステータス確認',
                  uri: `https://player.tpds.app/status/${waitlist_id}`,
                },
              ],
            },
          },
        ],
      }),
    })

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('Error:', err)
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
```

---

## 6. リアルタイム機能設計

### 6.1 Supabase Realtime購読パターン

Admin側の実装パターンを参考に、Player側でも同様のリアルタイム購読を実装。

#### 6.1.1 Admin側の参考実装

```typescript
// admin-app/app/page.tsx（行113-157）
const waitlistSubscription = supabase
  .channel(`waitlist-${store}-${rate}`)
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'waitlist',
    filter: `store_id=eq.${store}`,
  }, (payload) => {
    console.log('Waitlist change:', payload)
    if (isMounted && (payload.new?.rate_preference === rate || payload.old?.rate_preference === rate)) {
      setWaitlist(prev => {
        if (payload.eventType === 'DELETE') {
          return prev.filter(w => w.id !== payload.old?.id)
        } else if (payload.eventType === 'INSERT') {
          return [...prev, payload.new as WaitlistEntry]
        } else {
          return prev.map(w => w.id === payload.new?.id ? payload.new as WaitlistEntry : w)
        }
      })
    }
  })
  .subscribe()
```

#### 6.1.2 Player側での応用

**MAP画面（全店舗購読）：**

```typescript
// hooks/useRealtimeStores.ts
export function useRealtimeStores() {
  const [stores, setStores] = useState<StoreWithStatus[]>([])

  useEffect(() => {
    loadStores()

    // テーブル状況の変更を購読
    const tablesChannel = supabase
      .channel('all-tables')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tables',
      }, () => {
        loadStores() // 再取得して信号機を再計算
      })
      .subscribe()

    // 待機リストの変更を購読
    const waitlistChannel = supabase
      .channel('all-waitlist')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'waitlist',
      }, () => {
        loadStores()
      })
      .subscribe()

    return () => {
      tablesChannel.unsubscribe()
      waitlistChannel.unsubscribe()
    }
  }, [])

  return stores
}
```

**店舗詳細画面（特定店舗のみ購読）：**

```typescript
// hooks/useRealtimeStore.ts
export function useRealtimeStore(storeId: string, rate: string) {
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([])
  const [tables, setTables] = useState<Table[]>([])

  useEffect(() => {
    loadData()

    const channel = supabase
      .channel(`store-${storeId}-${rate}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'waitlist',
        filter: `store_id=eq.${storeId}`,
      }, (payload) => {
        if (payload.new?.rate_preference === rate) {
          handleWaitlistUpdate(payload)
        }
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tables',
        filter: `store_id=eq.${storeId}`,
      }, (payload) => {
        if (payload.new?.rate === rate) {
          handleTableUpdate(payload)
        }
      })
      .subscribe()

    return () => channel.unsubscribe()
  }, [storeId, rate])

  return { waitlist, tables }
}
```

**マイステータス画面（自分のエントリのみ購読）：**

```typescript
// hooks/useMyWaitlistEntry.ts
export function useMyWaitlistEntry(waitlistId: string) {
  const [entry, setEntry] = useState<WaitlistEntry | null>(null)

  useEffect(() => {
    loadEntry()

    const channel = supabase
      .channel(`my-entry-${waitlistId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'waitlist',
        filter: `id=eq.${waitlistId}`,
      }, (payload) => {
        setEntry(payload.new as WaitlistEntry)

        // 呼び出されたら通知
        if (payload.new.status === 'called') {
          showNotification()
        }
      })
      .subscribe()

    return () => channel.unsubscribe()
  }, [waitlistId])

  return entry
}
```

### 6.2 パフォーマンス最適化

#### 6.2.1 チャネル分離

- **MAP画面**：全店舗購読（`all-tables`, `all-waitlist`）
- **店舗詳細**：特定店舗のみ購読（`store-${storeId}`）
- **マイステータス**：自分のエントリのみ購読（`my-entry-${waitlistId}`）

#### 6.2.2 デバウンス処理

```typescript
// hooks/useDebouncedRealtime.ts
import { useEffect, useState, useRef } from 'react'

export function useDebouncedRealtime<T>(
  initialValue: T,
  delay: number = 300
): [T, (value: T) => void] {
  const [value, setValue] = useState<T>(initialValue)
  const timeoutRef = useRef<NodeJS.Timeout>()

  const debouncedSetValue = (newValue: T) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    timeoutRef.current = setTimeout(() => {
      setValue(newValue)
    }, delay)
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return [value, debouncedSetValue]
}
```

#### 6.2.3 メモ化

```typescript
// components/map/StoreMarkers.tsx
import { useMemo } from 'react'

export function StoreMarkers({ stores, tables, waitlist }) {
  const storesWithStatus = useMemo(() => {
    return stores.map(store => ({
      ...store,
      status: getStoreStatus(
        tables.filter(t => t.store_id === store.id),
        waitlist.filter(w => w.store_id === store.id)
      )
    }))
  }, [stores, tables, waitlist]) // 依存配列を最小限に

  return (
    <>
      {storesWithStatus.map(store => (
        <Marker
          key={store.id}
          position={store.location}
          icon={getMarkerIcon(store.status)}
        />
      ))}
    </>
  )
}
```

---

## 7. データフロー＆API設計

### 7.1 主要クエリ

#### 7.1.1 MAP画面（全店舗取得）

```typescript
// lib/api/stores.ts
export async function fetchAllStores() {
  const { data, error } = await supabase
    .from('stores')
    .select(`
      id,
      name,
      location,
      rates,
      tables (
        id,
        rate,
        max_seats,
        current_players,
        status
      ),
      waitlist (
        id,
        rate_preference,
        status
      )
    `)

  if (error) throw error

  return data.map(store => ({
    ...store,
    status: getStoreStatus(store.tables, store.waitlist)
  }))
}
```

#### 7.1.2 店舗詳細

```typescript
// lib/api/stores.ts
export async function fetchStoreDetail(storeId: string) {
  const { data, error } = await supabase
    .from('stores')
    .select(`
      *,
      tables (*),
      waitlist (*)
    `)
    .eq('id', storeId)
    .single()

  if (error) throw error
  return data
}
```

#### 7.1.3 マイステータス

```typescript
// lib/api/waitlist.ts
export async function fetchMyWaitlistEntry(waitlistId: string) {
  const { data, error } = await supabase
    .from('waitlist')
    .select(`
      *,
      stores (
        name,
        location
      )
    `)
    .eq('id', waitlistId)
    .single()

  if (error) throw error
  return data
}
```

#### 7.1.4 チェックイン

```typescript
// lib/api/waitlist.ts
export async function checkIn(params: {
  storeId: string
  userId: string
  userName: string
  ratePreference: string
  arrivalEstimationMinutes: number
}) {
  const { data, error } = await supabase
    .from('waitlist')
    .insert({
      store_id: params.storeId,
      user_id: params.userId,
      user_name: params.userName,
      rate_preference: params.ratePreference,
      arrival_estimation_minutes: params.arrivalEstimationMinutes,
      status: 'waiting',
    })
    .select()

  if (error) throw error
  return data[0]
}
```

#### 7.1.5 キャンセル

```typescript
// lib/api/waitlist.ts
export async function cancelWaitlist(waitlistId: string, userId: string) {
  const { data, error } = await supabase
    .from('waitlist')
    .update({ status: 'cancelled' })
    .eq('id', waitlistId)
    .eq('user_id', userId) // 本人確認
    .select()

  if (error) throw error
  return data[0]
}
```

### 7.2 RLSポリシー更新（Player側用）

既存のRLSポリシーはAdmin側（認証ユーザー）向けなので、Player側（匿名ユーザー）用に更新。

```sql
-- Player側用RLSポリシー
-- waitlist テーブル：ユーザーは自分のエントリのみ作成・更新可能

-- 既存ポリシーを削除（Admin側用）
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON waitlist;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON waitlist;

-- 新しいポリシー（Player側用）
-- 誰でもwaitlistを作成可能（チェックイン）
CREATE POLICY "Allow insert for all users" ON waitlist
  FOR INSERT
  WITH CHECK (true);

-- 自分のエントリのみ更新可能（キャンセルのみ）
CREATE POLICY "Users can update their own entries" ON waitlist
  FOR UPDATE
  USING (user_id = current_setting('request.headers')::json->>'x-line-user-id')
  WITH CHECK (status = 'cancelled');

-- Admin側は全て更新可能（既存）
CREATE POLICY "Admins can update all entries" ON waitlist
  FOR UPDATE
  USING (auth.role() = 'authenticated');
```

**注意：** LINE userIdをRLSポリシーで使うため、Supabaseリクエストヘッダーに `x-line-user-id` を追加する必要あり。

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'
import liff from '@line/liff'

export async function getSupabaseClient() {
  const profile = liff.isLoggedIn() ? await liff.getProfile() : null

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    {
      global: {
        headers: profile ? {
          'x-line-user-id': profile.userId
        } : {}
      }
    }
  )
}
```

---

## 8. ディレクトリ構成

### 8.1 player-app構成

```
player-app/
├── app/
│   ├── layout.tsx              # LIFF初期化、多言語設定
│   ├── page.tsx                # ルートページ（/map へリダイレクト）
│   ├── map/
│   │   └── page.tsx            # リアルタイムMAP画面
│   ├── store/
│   │   └── [storeId]/
│   │       └── page.tsx        # 店舗詳細＆チェックイン画面
│   ├── status/
│   │   └── [waitlistId]/
│   │       └── page.tsx        # マイステータス画面
│   └── guide/
│       └── page.tsx            # 使い方ガイド
├── components/
│   ├── map/
│   │   ├── MapView.tsx         # Google Maps表示
│   │   ├── StoreMarkers.tsx    # 店舗ピン（信号機）
│   │   ├── SearchBar.tsx       # 検索バー
│   │   └── FilterBar.tsx       # レートフィルター
│   ├── store/
│   │   ├── StoreHeader.tsx     # 店名・住所
│   │   ├── RateSelector.tsx    # レート選択
│   │   ├── WaitlistStatus.tsx  # 待ち状況
│   │   ├── ArrivalTimeInput.tsx # 到着時間選択
│   │   └── CheckInButton.tsx   # チェックインボタン
│   ├── status/
│   │   ├── PositionCard.tsx    # 待ち順表示
│   │   ├── EstimatedTime.tsx   # 予測時刻
│   │   ├── NotificationStatus.tsx # 通知設定
│   │   ├── CancelButton.tsx    # キャンセルボタン
│   │   └── CalledModal.tsx     # 呼び出しモーダル
│   └── common/
│       ├── Header.tsx          # ヘッダー（戻るボタン）
│       ├── Loading.tsx         # ローディング画面
│       └── ErrorBoundary.tsx   # エラーバウンダリ
├── hooks/
│   ├── useLineProfile.ts       # LINEプロフィール取得
│   ├── useRealtimeStores.ts    # 全店舗リアルタイム購読
│   ├── useRealtimeStore.ts     # 特定店舗リアルタイム購読
│   ├── useMyWaitlistEntry.ts   # 自分のエントリ購読
│   └── useDebouncedRealtime.ts # デバウンス処理
├── lib/
│   ├── liff.ts                 # LIFF初期化
│   ├── supabase.ts             # Supabase接続（LINE userId対応）
│   ├── storeStatus.ts          # 信号機ロジック
│   ├── maps.ts                 # Google Maps設定
│   └── api/
│       ├── stores.ts           # 店舗関連API
│       └── waitlist.ts         # ウェイティングリスト関連API
├── messages/                   # 多言語ファイル
│   ├── ja.json
│   ├── zh-TW.json
│   └── en.json
├── public/
│   ├── markers/
│   │   ├── green.svg           # 緑ピン
│   │   ├── yellow.svg          # 黄ピン
│   │   └── red.svg             # 赤ピン
│   └── favicon.ico
├── .env.local
├── next.config.ts
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## 9. 実装パターン

### 9.1 型定義の共有（Admin側から再利用）

```typescript
// shared/types/database.ts
export interface Store {
  id: string
  name: string
  location: { lat: number; lng: number }
  rates: string[]
  created_at: string
  updated_at: string
}

export interface Table {
  id: string
  store_id: string
  rate: string
  max_seats: number
  current_players: number
  status: 'open' | 'closed'
  created_at: string
  updated_at: string
}

export interface WaitlistEntry {
  id: string
  store_id: string
  user_id: string
  user_name: string
  rate_preference: string | null
  status: 'waiting' | 'called' | 'seated' | 'cancelled'
  called_at: string | null
  arrival_estimation_minutes: number | null
  created_at: string
  updated_at: string
}
```

### 9.2 信号機ロジック（Admin側パターンを応用）

```typescript
// lib/storeStatus.ts（Admin側の calculatePosition を参考）
import { Table, WaitlistEntry } from '@/shared/types/database'

export type StoreStatus = 'green' | 'yellow' | 'red'

export function getStoreStatus(
  tables: Table[],
  waitlist: WaitlistEntry[]
): StoreStatus {
  // 1. 空席数を計算
  const availableSeats = tables.reduce((sum, table) => {
    if (table.status === 'open') {
      return sum + (table.max_seats - table.current_players)
    }
    return sum
  }, 0)

  // 2. 待機中の人数
  const waitingCount = waitlist.filter(w => w.status === 'waiting').length

  // 3. 信号機判定
  if (availableSeats > 0) {
    return 'green'
  } else if (waitingCount <= 3) {
    return 'yellow'
  } else {
    return 'red'
  }
}

export function getMarkerIcon(status: StoreStatus): string {
  const icons = {
    green: '/markers/green.svg',
    yellow: '/markers/yellow.svg',
    red: '/markers/red.svg'
  }
  return icons[status]
}
```

### 9.3 リアルタイム購読（Admin側の実装パターン）

Admin側（admin-app/app/page.tsx:113-157）の購読パターンを踏襲：

```typescript
// hooks/useRealtimeWaitlist.ts
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { WaitlistEntry } from '@/shared/types/database'

export function useRealtimeWaitlist(storeId: string, rate: string) {
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([])

  useEffect(() => {
    let isMounted = true

    async function loadData() {
      const { data } = await supabase
        .from('waitlist')
        .select('*')
        .eq('store_id', storeId)
        .eq('rate_preference', rate)
        .eq('status', 'waiting')

      if (isMounted) setWaitlist(data || [])
    }

    loadData()

    // リアルタイム購読（Admin側のパターンと同じ）
    const channel = supabase
      .channel(`waitlist-${storeId}-${rate}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'waitlist',
        filter: `store_id=eq.${storeId}`,
      }, (payload) => {
        if (isMounted && payload.new?.rate_preference === rate) {
          setWaitlist(prev => {
            if (payload.eventType === 'DELETE') {
              return prev.filter(w => w.id !== payload.old?.id)
            } else if (payload.eventType === 'INSERT') {
              return [...prev, payload.new as WaitlistEntry]
            } else {
              return prev.map(w => w.id === payload.new?.id ? payload.new as WaitlistEntry : w)
            }
          })
        }
      })
      .subscribe()

    return () => {
      isMounted = false
      channel.unsubscribe()
    }
  }, [storeId, rate])

  return waitlist
}
```

### 9.4 呼び出し点滅ロジック（Admin側を参考）

Admin側（WaitlistPanel.tsx:73-89）の10分点滅ロジックをPlayer側でも実装：

```typescript
// components/status/PositionCard.tsx
import { useEffect, useState } from 'react'

export function PositionCard({ entry }: { entry: WaitlistEntry }) {
  const [timeSinceCalled, setTimeSinceCalled] = useState<number>(0)
  const [isBlinking, setIsBlinking] = useState(false)

  useEffect(() => {
    if (entry.status === 'called' && entry.called_at) {
      const interval = setInterval(() => {
        const calledTime = new Date(entry.called_at!).getTime()
        const now = Date.now()
        const minutesElapsed = Math.floor((now - calledTime) / (1000 * 60))
        setTimeSinceCalled(minutesElapsed)

        // Admin側と同じ: 10分経過で点滅開始
        if (minutesElapsed >= 10) {
          setIsBlinking(true)
        }
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [entry.status, entry.called_at])

  if (entry.status === 'called') {
    return (
      <div className={`
        text-center p-8 rounded-xl
        ${isBlinking ? 'bg-red-500 animate-pulse' : 'bg-yellow-100'}
      `}>
        <div className="text-9xl mb-4">🔔</div>
        <h2 className="text-4xl font-bold">
          {isBlinking ? `⚠️ ${timeSinceCalled}分経過` : '順番が来ました！'}
        </h2>
      </div>
    )
  }

  return null
}
```

---

## 10. 環境変数設定

### 10.1 player-app/.env.local

```bash
# Supabase（Admin側と同じ）
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# LIFF
NEXT_PUBLIC_LIFF_ID=1234567890-abcdefgh

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSy...

# i18n
NEXT_PUBLIC_DEFAULT_LOCALE=zh-TW

# App URL
NEXT_PUBLIC_APP_URL=https://player.tpds.app
```

### 10.2 Supabase Secrets（Edge Function用）

Supabase Dashboardで設定：

```bash
LINE_CHANNEL_ACCESS_TOKEN=xxxx
LINE_CHANNEL_SECRET=xxxx
```

---

## 11. MVP範囲

### 11.1 Phase 1（MVP - 4週間で実装）

**実装する機能：**

✅ **基盤**
- LIFF初期化＆LINE認証
- Supabase接続（既存DBと連携）
- 多言語対応（日本語・中国語・英語）

✅ **MAP画面**
- リアルタイムMAP（🟢🟡🔴信号機ピン）
- 店舗検索
- レートフィルター

✅ **店舗詳細**
- 店舗情報表示
- レート選択
- 到着時間入力
- チェックイン機能

✅ **マイステータス**
- 待ち順表示（リアルタイム）
- 呼び出し予測時刻
- キャンセル機能

✅ **LINE通知**
- 呼び出し時にLINE Push Message送信
- Database Trigger + Edge Function

### 11.2 Phase 2に延期する機能

❌ **GPS圏内チェック制限**
- 店舗から半径500m以内のみチェックイン可能
- 理由：MVP検証にGPS必須ではない

❌ **デポジット機能**
- LINE Payでデポジット支払い
- 理由：決済統合は複雑、MVP後に検証

❌ **ブラックリスト機能**
- 無断キャンセル3回でペナルティ
- 理由：ユーザー数が少ない段階では不要

❌ **プライオリティ・パス（優先権購入）**
- 有料で待ち順を優先
- 理由：ビジネスモデル検証後に追加

❌ **AIコンシェルジュ**
- ChatGPTで店舗推薦
- 理由：付加価値機能、MVP後に追加

❌ **ユーザー履歴・統計**
- 過去のチェックイン履歴
- 理由：データ蓄積後に価値が出る

---

## 12. 実装スケジュール

### Week 1: 基盤構築

**タスク：**
1. player-appプロジェクトセットアップ（Next.js 16 + TypeScript + Tailwind）
2. LIFF統合（認証テスト、プロフィール取得確認）
3. Supabase接続（既存DBと連携、型定義共有）
4. 多言語対応セットアップ（next-intl）

**成果物：**
- `app/layout.tsx`（LIFF初期化）
- `lib/supabase.ts`（Supabase接続）
- `hooks/useLineProfile.ts`（LINE認証フック）
- `messages/ja.json`, `zh-TW.json`, `en.json`

### Week 2: MAP画面

**タスク：**
5. Google Maps統合（@vis.gl/react-google-maps）
6. 店舗データ取得＆表示
7. 信号機ロジック実装
8. リアルタイム更新（tables, waitlist購読）

**成果物：**
- `app/map/page.tsx`
- `components/map/MapView.tsx`
- `components/map/StoreMarkers.tsx`
- `lib/storeStatus.ts`
- `hooks/useRealtimeStores.ts`

### Week 3: チェックイン機能

**タスク：**
9. 店舗詳細画面（レート別待ち人数表示）
10. レート選択UI
11. 到着時間入力UI
12. チェックイン処理（waitlist INSERT）
13. マイステータス画面（待ち順表示）

**成果物：**
- `app/store/[storeId]/page.tsx`
- `components/store/RateSelector.tsx`
- `components/store/ArrivalTimeInput.tsx`
- `app/status/[waitlistId]/page.tsx`
- `components/status/PositionCard.tsx`

### Week 4: 通知＆最適化

**タスク：**
14. LINE通知（Database Trigger + Edge Function）
15. 呼び出しモーダル実装
16. リアルタイム更新デバッグ
17. パフォーマンス最適化（デバウンス、メモ化）
18. UIポリッシュ（ローディング、エラーハンドリング）

**成果物：**
- `supabase/migrations/create_line_notification_trigger.sql`
- `supabase/functions/send-line-notification/index.ts`
- `components/status/CalledModal.tsx`
- `hooks/useDebouncedRealtime.ts`

---

## 13. デプロイ設定

### 13.1 Vercel設定

**vercel.json:**

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase-url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase-anon-key",
    "NEXT_PUBLIC_LIFF_ID": "@liff-id",
    "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY": "@google-maps-api-key"
  }
}
```

**デプロイ手順：**
1. Vercelプロジェクト作成
2. GitHubリポジトリ連携
3. 環境変数設定（Vercel Dashboard）
4. カスタムドメイン設定（`player.tpds.app`）
5. LIFF Endpoint URLに `https://player.tpds.app` を登録

### 13.2 Supabase Edge Functions デプロイ

```bash
# Supabase CLIインストール
npm install -g supabase

# プロジェクトリンク
supabase link --project-ref xxxxx

# Edge Functionデプロイ
supabase functions deploy send-line-notification

# Secretsの設定
supabase secrets set LINE_CHANNEL_ACCESS_TOKEN=xxxx
supabase secrets set LINE_CHANNEL_SECRET=xxxx
```

---

## 14. LINE開発者登録手順

### 14.1 LINE Business ID作成

1. [LINE Developers](https://developers.line.biz/) にアクセス
2. 「LINE Business IDでログイン」
3. プロバイダー作成（例：TPDS）

### 14.2 LIFF App登録

1. **新規チャネル作成**
   - チャネルタイプ：LINE Login
   - チャネル名：TPDS Player App
   - チャネル説明：台湾ポーカー待機リストアプリ

2. **LIFF App追加**
   - LIFF App名：TPDS Player
   - サイズ：Full
   - Endpoint URL：`https://player.tpds.app`
   - Scope：`profile`, `openid`

3. **LIFF IDを取得**
   - 例：`1234567890-abcdefgh`
   - `.env.local` に `NEXT_PUBLIC_LIFF_ID` として設定

### 14.3 Messaging API チャネル作成

1. **新規チャネル作成**
   - チャネルタイプ：Messaging API
   - チャネル名：TPDS Notification Bot
   - チャネル説明：待機リスト呼び出し通知

2. **Channel Access Token発行**
   - Messaging API設定 → Channel Access Token → 発行
   - Supabase Secretsに `LINE_CHANNEL_ACCESS_TOKEN` として設定

3. **Webhook設定**
   - Webhook URL：（不要 - Push Messageのみ使用）
   - Webhookの利用：オフ

### 14.4 リッチメニュー作成

1. **LINE Official Account Manager** にログイン
2. リッチメニュー作成
   - テンプレート：4分割
   - 画像：1200x810px（各セクション 600x405px）
   - アクションタイプ：リンク
     - 🟢空席MAP → `https://liff.line.me/{LIFF_ID}/map`
     - ⏳マイステータス → `https://liff.line.me/{LIFF_ID}/status`
     - ❓使い方 → `https://liff.line.me/{LIFF_ID}/guide`
     - 💎VIPパス → `https://liff.line.me/{LIFF_ID}/vip`

---

## 付録A：参考リンク

- [LIFF Documentation](https://developers.line.biz/en/docs/liff/)
- [Supabase Realtime](https://supabase.com/docs/guides/realtime)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript)
- [LINE Messaging API](https://developers.line.biz/en/docs/messaging-api/)

---

## 付録B：トラブルシューティング

### B.1 LIFF初期化エラー

**症状：** `liff.init()` が失敗する

**原因：**
- LIFF IDが間違っている
- Endpoint URLがデプロイURLと一致していない

**解決策：**
1. LINE Developers で LIFF ID を再確認
2. Endpoint URL が `https://player.tpds.app` になっているか確認
3. ブラウザコンソールでエラーメッセージ確認

### B.2 Realtime購読が動作しない

**症状：** Admin側で更新してもPlayer側に反映されない

**原因：**
- Supabase Realtimeが有効化されていない
- チャネル名が重複している

**解決策：**
1. Supabase Dashboard → Database → Replication → `tables`, `waitlist` を有効化
2. チャネル名にユニークなIDを含める（例：`waitlist-${storeId}-${rate}`）

### B.3 LINE通知が届かない

**症状：** 呼び出しボタンを押してもLINE通知が来ない

**原因：**
- Edge Functionが動作していない
- Channel Access Tokenが間違っている

**解決策：**
1. Supabase Dashboard → Edge Functions → Logs を確認
2. LINE Developers で Channel Access Token を再発行
3. `supabase secrets set` で再設定

---

## 改訂履歴

| バージョン | 日付 | 変更内容 |
|-----------|------|----------|
| 1.0 | 2026-02-11 | 初版作成 |

---

**End of Document**
