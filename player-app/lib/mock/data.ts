import type { Store, Table, WaitlistEntry } from '../types'

// モックデータ（LIFF統合前の開発用）

export const mockStores: Store[] = [
  {
    id: 'store-1',
    name: 'CTP Taipei',
    location: { lat: 25.0330, lng: 121.5654 },
    rates: ['1/3', '2/5', '5/10+'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'store-2',
    name: 'Guild A',
    location: { lat: 25.0478, lng: 121.5318 },
    rates: ['1/2', '2/5'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'store-3',
    name: 'Poker Arena',
    location: { lat: 25.0408, lng: 121.5680 },
    rates: ['1/3', '2/5', '5/10+', '10/20'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

export const mockTables: Table[] = [
  // CTP Taipei
  { id: 'table-1', store_id: 'store-1', rate: '1/3', max_seats: 9, current_players: 8, status: 'open', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'table-2', store_id: 'store-1', rate: '2/5', max_seats: 9, current_players: 6, status: 'open', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'table-3', store_id: 'store-1', rate: '5/10+', max_seats: 9, current_players: 9, status: 'open', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },

  // Guild A
  { id: 'table-4', store_id: 'store-2', rate: '1/2', max_seats: 9, current_players: 9, status: 'open', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'table-5', store_id: 'store-2', rate: '2/5', max_seats: 9, current_players: 9, status: 'open', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },

  // Poker Arena
  { id: 'table-6', store_id: 'store-3', rate: '1/3', max_seats: 9, current_players: 3, status: 'open', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'table-7', store_id: 'store-3', rate: '2/5', max_seats: 9, current_players: 5, status: 'open', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
]

export const mockWaitlist: WaitlistEntry[] = [
  // CTP Taipei - 1/3: 2人待ち（黄色）
  { id: 'wait-1', store_id: 'store-1', user_id: 'user-001', user_name: '王小明', rate_preference: '1/3', status: 'waiting', called_at: null, arrival_estimation_minutes: 15, created_at: new Date(Date.now() - 10 * 60000).toISOString(), updated_at: new Date().toISOString() },
  { id: 'wait-2', store_id: 'store-1', user_id: 'user-002', user_name: '李美玲', rate_preference: '1/3', status: 'waiting', called_at: null, arrival_estimation_minutes: 30, created_at: new Date(Date.now() - 5 * 60000).toISOString(), updated_at: new Date().toISOString() },

  // Guild A - 1/2: 5人待ち（赤）
  { id: 'wait-3', store_id: 'store-2', user_id: 'user-003', user_name: '陳大文', rate_preference: '1/2', status: 'waiting', called_at: null, arrival_estimation_minutes: 15, created_at: new Date(Date.now() - 20 * 60000).toISOString(), updated_at: new Date().toISOString() },
  { id: 'wait-4', store_id: 'store-2', user_id: 'user-004', user_name: '林小華', rate_preference: '1/2', status: 'waiting', called_at: null, arrival_estimation_minutes: 30, created_at: new Date(Date.now() - 15 * 60000).toISOString(), updated_at: new Date().toISOString() },
  { id: 'wait-5', store_id: 'store-2', user_id: 'user-005', user_name: '張三', rate_preference: '1/2', status: 'waiting', called_at: null, arrival_estimation_minutes: 45, created_at: new Date(Date.now() - 10 * 60000).toISOString(), updated_at: new Date().toISOString() },
  { id: 'wait-6', store_id: 'store-2', user_id: 'user-006', user_name: '李四', rate_preference: '1/2', status: 'waiting', called_at: null, arrival_estimation_minutes: 60, created_at: new Date(Date.now() - 8 * 60000).toISOString(), updated_at: new Date().toISOString() },
  { id: 'wait-7', store_id: 'store-2', user_id: 'user-007', user_name: '王五', rate_preference: '1/2', status: 'waiting', called_at: null, arrival_estimation_minutes: 30, created_at: new Date(Date.now() - 3 * 60000).toISOString(), updated_at: new Date().toISOString() },
]
