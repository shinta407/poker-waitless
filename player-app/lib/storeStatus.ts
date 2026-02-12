import type { Table, WaitlistEntry, StoreStatus } from './types'

/**
 * 信号機ロジック: 店舗の混雑状況を3色で判定
 * 🟢 緑 = 空席あり（即座れる）
 * 🟡 黄 = 満席だが待ち3人以内
 * 🔴 赤 = 満席＋待ち4人以上
 */
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

/**
 * 信号機の色に対応するマーカーアイコンURLを取得
 */
export function getMarkerIcon(status: StoreStatus): string {
  const icons = {
    green: '/markers/green.svg',
    yellow: '/markers/yellow.svg',
    red: '/markers/red.svg'
  }
  return icons[status]
}

/**
 * 信号機の色に対応する表示テキストを取得
 */
export function getStatusText(status: StoreStatus): string {
  const texts = {
    green: '🟢 空席あり',
    yellow: '🟡 少し待ち',
    red: '🔴 混雑中'
  }
  return texts[status]
}
