'use client'

import { useEffect, useState } from 'react'
import { Phone, Check, UserPlus, QrCode, Trash2, AlertTriangle } from 'lucide-react'
import { type WaitlistEntry, type Table } from '@/lib/supabase'
import { useSound } from '@/hooks/useSound'
import { Button } from '@/components/ui/Button'
import { TableSelectionDialog } from '@/components/features/TableSelectionDialog'
import { useTranslations } from 'next-intl'

interface WaitlistPanelProps {
  waitlist: WaitlistEntry[]
  tables: Table[]
  onCallPlayer: (playerId: string) => void
  onSeatPlayer: (playerId: string, tableId: string) => void
  onDeletePlayer: (playerId: string) => void
  onAddPlayer: () => void
  onQRScan: () => void
  selectedRate: string
}

export default function WaitlistPanel({
  waitlist,
  tables,
  onCallPlayer,
  onSeatPlayer,
  onDeletePlayer,
  onAddPlayer,
  onQRScan,
  selectedRate
}: WaitlistPanelProps) {
  const t = useTranslations('waitlist')
  const [tableSelectionDialogOpen, setTableSelectionDialogOpen] = useState(false)
  const [playerToSeat, setPlayerToSeat] = useState<WaitlistEntry | null>(null)

  const handleSeatClick = (player: WaitlistEntry) => {
    setPlayerToSeat(player)
    setTableSelectionDialogOpen(true)
  }

  const handleSelectTable = async (tableId: string) => {
    if (!playerToSeat) return
    await onSeatPlayer(playerToSeat.id, tableId)
    setTableSelectionDialogOpen(false)
    setPlayerToSeat(null)
  }

  return (
    <div className="relative h-full flex flex-col bg-gray-50">
      {/* Scrollable content */}
      <div className="flex-1 overflow-auto p-6 pb-32">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">
          {t('title', { rate: selectedRate })}
        </h2>

        {waitlist.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-2xl">
            {t('empty')}
          </div>
        ) : (
          <div role="list" aria-label={t('title', { rate: selectedRate })} className="space-y-3">
            {waitlist.map((player, index) => (
              <div key={player.id} role="listitem">
                <PlayerCard
                  player={player}
                  position={index + 1}
                  onCallPlayer={onCallPlayer}
                  onSeatPlayer={() => handleSeatClick(player)}
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
          aria-label={t('addPlayer')}
        >
          {t('addPlayer')}
        </Button>
        <Button
          variant="secondary"
          size="large"
          icon={<QrCode className="w-6 h-6" />}
          onClick={onQRScan}
          className="flex-1"
          aria-label={t('qrScan')}
        >
          {t('qrScan')}
        </Button>
      </div>

      {/* Table Selection Dialog */}
      <TableSelectionDialog
        isOpen={tableSelectionDialogOpen}
        onClose={() => {
          setTableSelectionDialogOpen(false)
          setPlayerToSeat(null)
        }}
        player={playerToSeat}
        tables={tables}
        onSelectTable={handleSelectTable}
      />
    </div>
  )
}

interface PlayerCardProps {
  player: WaitlistEntry
  position: number
  onCallPlayer: (playerId: string) => void
  onSeatPlayer: () => void
  onDeletePlayer: (playerId: string) => void
}

function PlayerCard({ player, position, onCallPlayer, onSeatPlayer, onDeletePlayer }: PlayerCardProps) {
  const t = useTranslations('waitlist')
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
    if (player.status === 'arrived') return 'bg-green-50 border-l-4 border-green-500'
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
      aria-label={`${t('position', { position })}: ${player.user_name}, ${
        player.status === 'called' ? t('called', { minutes: timeSinceCalled }) : t('playerInfo')
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
              {player.status === 'arrived'
                ? t('arrived')
                : t('arrivalTime', { time: getEstimatedArrival() })}
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2">
          {player.status === 'arrived' && (
            <span
              className="text-lg font-semibold px-4 py-2 rounded-lg bg-green-600 text-white"
              role="status"
            >
              {t('arrived')}
            </span>
          )}
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
              {isBlinking ? t('calledOvertime', { minutes: timeSinceCalled }) : t('called', { minutes: timeSinceCalled })}
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
            aria-label={t('deletePlayer')}
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
          aria-label={t('call')}
          aria-disabled={player.status === 'called'}
        >
          <Phone className="w-6 h-6" aria-hidden="true" />
          {t('call')}
        </button>

        <button
          onClick={onSeatPlayer}
          className="
            flex-1 bg-green-500 hover:bg-green-600 text-white
            py-4 rounded-xl font-bold text-2xl
            transition-all active:scale-95 shadow-md
            flex items-center justify-center gap-2
            focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-green-500 focus-visible:ring-offset-2
          "
          aria-label={t('seat')}
        >
          <Check className="w-6 h-6" aria-hidden="true" />
          {t('seat')}
        </button>
      </div>
    </div>
  )
}
