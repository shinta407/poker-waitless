import { useEffect, useState } from 'react'
import { type WaitlistEntry } from '@/lib/supabase'

interface WaitlistPanelProps {
  waitlist: WaitlistEntry[]
  onCallPlayer: (playerId: string) => void
  onSeatPlayer: (playerId: string) => void
  selectedRate: string
}

export default function WaitlistPanel({
  waitlist,
  onCallPlayer,
  onSeatPlayer,
  selectedRate
}: WaitlistPanelProps) {
  return (
    <div className="p-6 space-y-4">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">
        待機リスト ({selectedRate})
      </h2>

      {waitlist.length === 0 ? (
        <div className="text-center py-12 text-gray-400 text-2xl">
          待機中のプレイヤーはいません
        </div>
      ) : (
        <div className="space-y-3">
          {waitlist.map((player, index) => (
            <PlayerCard
              key={player.id}
              player={player}
              position={index + 1}
              onCallPlayer={onCallPlayer}
              onSeatPlayer={onSeatPlayer}
            />
          ))}
        </div>
      )}

      {/* Bottom Action Buttons */}
      <div className="fixed bottom-8 left-6 flex gap-4">
        <button
          className="bg-green-500 hover:bg-green-600 text-white font-bold
                     text-xl px-8 py-5 rounded-xl shadow-lg
                     transition-all active:scale-95"
        >
          + プレイヤー追加
        </button>
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold
                     text-xl px-8 py-5 rounded-xl shadow-lg
                     transition-all active:scale-95"
        >
          📱 QRスキャン
        </button>
      </div>
    </div>
  )
}

interface PlayerCardProps {
  player: WaitlistEntry
  position: number
  onCallPlayer: (playerId: string) => void
  onSeatPlayer: (playerId: string) => void
}

function PlayerCard({ player, position, onCallPlayer, onSeatPlayer }: PlayerCardProps) {
  const [timeSinceCalled, setTimeSinceCalled] = useState<number>(0)
  const [isBlinking, setIsBlinking] = useState(false)

  useEffect(() => {
    if (player.status === 'called' && player.called_at) {
      const interval = setInterval(() => {
        const calledTime = new Date(player.called_at!).getTime()
        const now = Date.now()
        const minutesElapsed = Math.floor((now - calledTime) / (1000 * 60))
        setTimeSinceCalled(minutesElapsed)

        // Start blinking after 10 minutes
        if (minutesElapsed >= 10) {
          setIsBlinking(true)
        }
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [player.status, player.called_at])

  const getEstimatedArrival = () => {
    if (player.arrival_estimation_minutes) {
      const arrivalTime = new Date(new Date(player.created_at).getTime() + player.arrival_estimation_minutes * 60000)
      return arrivalTime.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
    }
    return '--:--'
  }

  const bgColor = () => {
    if (isBlinking) return 'bg-red-500 animate-pulse'
    if (player.status === 'called') return 'bg-yellow-100'
    return 'bg-white'
  }

  return (
    <div className={`
      ${bgColor()}
      rounded-xl p-6 shadow-md border-2 border-gray-200
      transition-all
    `}>
      {/* Player Info */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <span className="text-4xl font-bold text-blue-600">
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
        <div className="flex flex-col items-end">
          {player.status === 'called' && (
            <span className={`
              text-lg font-semibold px-4 py-2 rounded-lg
              ${isBlinking ? 'bg-red-600 text-white' : 'bg-yellow-500 text-white'}
            `}>
              {isBlinking ? `⚠️ ${timeSinceCalled}分経過` : `呼び出し済 ${timeSinceCalled}分前`}
            </span>
          )}
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
            ${
              player.status === 'called'
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }
          `}
        >
          📞 呼び出し
        </button>

        <button
          onClick={() => onSeatPlayer(player.id)}
          className="flex-1 bg-green-500 hover:bg-green-600 text-white
                     py-4 rounded-xl font-bold text-2xl
                     transition-all active:scale-95 shadow-md"
        >
          ✓ 着席
        </button>
      </div>
    </div>
  )
}
