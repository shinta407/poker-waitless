'use client'

import { useEffect, useState } from 'react'
import { Phone, Check, UserPlus, QrCode, Trash2, AlertTriangle } from 'lucide-react'
import { type WaitlistEntry } from '@/lib/supabase'
import { useSound } from '@/hooks/useSound'
import { Button } from '@/components/ui/Button'

interface WaitlistPanelProps {
  waitlist: WaitlistEntry[]
  onCallPlayer: (playerId: string) => void
  onSeatPlayer: (playerId: string) => void
  onDeletePlayer: (playerId: string) => void
  onAddPlayer: () => void
  onQRScan: () => void
  selectedRate: string
}

export default function WaitlistPanel({
  waitlist,
  onCallPlayer,
  onSeatPlayer,
  onDeletePlayer,
  onAddPlayer,
  onQRScan,
  selectedRate
}: WaitlistPanelProps) {
  return (
    <div className="relative h-full flex flex-col bg-gray-50">
      {/* Scrollable content */}
      <div className="flex-1 overflow-auto p-6 pb-32">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">
          待機リスト ({selectedRate})
        </h2>

        {waitlist.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-2xl">
            待機中のプレイヤーはいません
          </div>
        ) : (
          <div role="list" aria-label="待機リスト" className="space-y-3">
            {waitlist.map((player, index) => (
              <div key={player.id} role="listitem">
                <PlayerCard
                  player={player}
                  position={index + 1}
                  onCallPlayer={onCallPlayer}
                  onSeatPlayer={onSeatPlayer}
                  onDeletePlayer={onDeletePlayer}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sticky footer - always visible at bottom */}
      <div className="
        sticky bottom-0 left-0 right-0
        bg-white border-t-2 border-gray-200
        px-6 py-4
        flex gap-4
        shadow-2xl
        z-10
      ">
        <Button
          variant="primary"
          size="large"
          icon={<UserPlus className="w-6 h-6" />}
          onClick={onAddPlayer}
          className="flex-1"
          aria-label="プレイヤーを追加"
        >
          プレイヤー追加
        </Button>
        <Button
          variant="secondary"
          size="large"
          icon={<QrCode className="w-6 h-6" />}
          onClick={onQRScan}
          className="flex-1"
          aria-label="QRコードをスキャン"
        >
          QRスキャン
        </Button>
      </div>
    </div>
  )
}

interface PlayerCardProps {
  player: WaitlistEntry
  position: number
  onCallPlayer: (playerId: string) => void
  onSeatPlayer: (playerId: string) => void
  onDeletePlayer: (playerId: string) => void
}

function PlayerCard({ player, position, onCallPlayer, onSeatPlayer, onDeletePlayer }: PlayerCardProps) {
  const [timeSinceCalled, setTimeSinceCalled] = useState<number>(0)
  const [isBlinking, setIsBlinking] = useState(false)
  const [alertPlayed, setAlertPlayed] = useState(false)
  const { playAlert } = useSound()

  useEffect(() => {
    if (player.status === 'called' && player.called_at) {
      const interval = setInterval(() => {
        const calledTime = new Date(player.called_at!).getTime()
        const now = Date.now()
        const minutesElapsed = Math.floor((now - calledTime) / (1000 * 60))
        setTimeSinceCalled(minutesElapsed)

        // Start blinking and play sound after 10 minutes
        if (minutesElapsed >= 10) {
          setIsBlinking(true)

          // Play alert sound once
          if (!alertPlayed) {
            playAlert()
            setAlertPlayed(true)
          }
        }
      }, 1000)

      return () => clearInterval(interval)
    } else {
      // Reset alert state when player is not called
      setAlertPlayed(false)
      setIsBlinking(false)
    }
  }, [player.status, player.called_at, alertPlayed, playAlert])

  const getEstimatedArrival = () => {
    if (player.arrival_estimation_minutes) {
      const arrivalTime = new Date(new Date(player.created_at).getTime() + player.arrival_estimation_minutes * 60000)
      return arrivalTime.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
    }
    return '--:--'
  }

  const bgColor = () => {
    if (isBlinking) return 'bg-red-500 animate-pulse'
    if (player.status === 'called') return 'bg-amber-50 border-l-4 border-amber-500'
    return 'bg-white'
  }

  return (
    <div
      className={`
        ${bgColor()}
        rounded-xl p-6 shadow-md border-2 border-gray-200
        transition-all
      `}
      aria-label={`${position}番: ${player.user_name}、ステータス: ${
        player.status === 'called' ? '呼び出し済' : '待機中'
      }`}
    >
      {/* Player Info */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <span className="text-4xl font-bold text-blue-600" aria-hidden="true">
            #{position}
          </span>
          <div>
            <h3 className="text-3xl font-bold text-gray-800">
              {player.user_name}
            </h3>
            <p className="text-lg text-gray-600 mt-1">
              到着予定: {getEstimatedArrival()}
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2">
          {player.status === 'called' && (
            <span
              className={`
                text-lg font-semibold px-4 py-2 rounded-lg flex items-center gap-2
                ${isBlinking ? 'bg-red-600 text-white' : 'bg-amber-600 text-white'}
              `}
              role="status"
              aria-live="polite"
            >
              {isBlinking && <AlertTriangle className="w-5 h-5" aria-hidden="true" />}
              {isBlinking ? `${timeSinceCalled}分経過` : `呼び出し済 ${timeSinceCalled}分前`}
            </span>
          )}
          <button
            onClick={() => onDeletePlayer(player.id)}
            className="
              text-red-600 hover:text-red-700
              hover:bg-red-50
              p-2 rounded-lg
              transition-colors
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500
            "
            aria-label={`${player.user_name}を削除`}
          >
            <Trash2 className="w-6 h-6" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={() => onCallPlayer(player.id)}
          disabled={player.status === 'called'}
          className={`
            flex-1 py-4 rounded-xl font-bold text-2xl
            transition-all active:scale-95 shadow-md
            flex items-center justify-center gap-2
            focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-sky-500 focus-visible:ring-offset-2
            ${
              player.status === 'called'
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }
          `}
          aria-label={`${player.user_name}を呼び出す`}
          aria-disabled={player.status === 'called'}
        >
          <Phone className="w-6 h-6" aria-hidden="true" />
          呼び出し
        </button>

        <button
          onClick={() => onSeatPlayer(player.id)}
          className="
            flex-1 bg-green-500 hover:bg-green-600 text-white
            py-4 rounded-xl font-bold text-2xl
            transition-all active:scale-95 shadow-md
            flex items-center justify-center gap-2
            focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-green-500 focus-visible:ring-offset-2
          "
          aria-label={`${player.user_name}を着席させる`}
        >
          <Check className="w-6 h-6" aria-hidden="true" />
          着席
        </button>
      </div>
    </div>
  )
}
