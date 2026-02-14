'use client'

import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from './ConfirmDialog'
import { AddBuyInDialog } from './AddBuyInDialog'
import { useToast } from '@/hooks/useToast'

interface BuyInSettingsProps {
  storeId: string
  buyIns: string[]
  onBuyInsUpdate: (newBuyIns: string[]) => void
}

interface BuyInStats {
  buyIn: string
  tableCount: number
  waitlistCount: number
}

export function BuyInSettings({ storeId, buyIns, onBuyInsUpdate }: BuyInSettingsProps) {
  const [stats, setStats] = useState<BuyInStats[]>([])
  const [loading, setLoading] = useState(true)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [selectedBuyIn, setSelectedBuyIn] = useState<string>('')
  const toast = useToast()
  const t = useTranslations()

  // Load statistics for each buy-in
  useEffect(() => {
    if (!storeId || buyIns.length === 0) {
      setStats([])
      setLoading(false)
      return
    }

    const loadStats = async () => {
      try {
        setLoading(true)
        const statsPromises = buyIns.map(async (buyIn) => {
          // Count tables
          const { data: tables } = await supabase
            .from('tables')
            .select('id')
            .eq('store_id', storeId)
            .eq('rate', buyIn)

          // Count waitlist
          const { data: waitlist } = await supabase
            .from('waitlist')
            .select('id')
            .eq('store_id', storeId)
            .eq('rate_preference', buyIn)
            .in('status', ['waiting', 'called'])

          return {
            buyIn,
            tableCount: tables?.length || 0,
            waitlistCount: waitlist?.length || 0,
          }
        })

        const results = await Promise.all(statsPromises)
        setStats(results)
      } catch (error) {
        console.error('Error loading buy-in stats:', error)
        toast.error(t('toast.statsLoadFailed'))
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [storeId, buyIns])

  const handleAddBuyIn = async (buyIn: string) => {
    try {
      const newBuyIns = [...buyIns, buyIn]

      const { error } = await supabase
        .from('stores')
        .update({ rates: newBuyIns })
        .eq('id', storeId)

      if (error) throw error

      onBuyInsUpdate(newBuyIns)
      toast.success('買入金額を追加しました')
      setAddDialogOpen(false)
    } catch (error) {
      console.error('Error adding buy-in:', error)
      toast.error('買入金額の追加に失敗しました')
      throw error
    }
  }

  const handleEditBuyIn = async (newBuyIn: string) => {
    try {
      const updatedBuyIns = buyIns.map((b) => (b === selectedBuyIn ? newBuyIn : b))

      // Update store rates
      const { error: storeError } = await supabase
        .from('stores')
        .update({ rates: updatedBuyIns })
        .eq('id', storeId)

      if (storeError) throw storeError

      // Update existing tables
      const { error: tablesError } = await supabase
        .from('tables')
        .update({ rate: newBuyIn })
        .eq('store_id', storeId)
        .eq('rate', selectedBuyIn)

      if (tablesError) throw tablesError

      // Update existing waitlist entries
      const { error: waitlistError } = await supabase
        .from('waitlist')
        .update({ rate_preference: newBuyIn })
        .eq('store_id', storeId)
        .eq('rate_preference', selectedBuyIn)

      if (waitlistError) throw waitlistError

      onBuyInsUpdate(updatedBuyIns)
      toast.success('買入金額を更新しました')
      setEditDialogOpen(false)
      setSelectedBuyIn('')
    } catch (error) {
      console.error('Error editing buy-in:', error)
      toast.error('買入金額の更新に失敗しました')
      throw error
    }
  }

  const handleDeleteBuyIn = async () => {
    try {
      // Check if buy-in is in use
      const stat = stats.find((s) => s.buyIn === selectedBuyIn)
      if (stat && (stat.tableCount > 0 || stat.waitlistCount > 0)) {
        toast.error(
          `この買入金額には${stat.tableCount}個の卓と${stat.waitlistCount}人の待機者がいます。削除できません。`
        )
        setDeleteConfirmOpen(false)
        setSelectedBuyIn('')
        return
      }

      const updatedBuyIns = buyIns.filter((b) => b !== selectedBuyIn)

      const { error } = await supabase
        .from('stores')
        .update({ rates: updatedBuyIns })
        .eq('id', storeId)

      if (error) throw error

      onBuyInsUpdate(updatedBuyIns)
      toast.success('買入金額を削除しました')
      setDeleteConfirmOpen(false)
      setSelectedBuyIn('')
    } catch (error) {
      console.error('Error deleting buy-in:', error)
      toast.error('買入金額の削除に失敗しました')
    }
  }

  const openEditDialog = (buyIn: string) => {
    setSelectedBuyIn(buyIn)
    setEditDialogOpen(true)
  }

  const openDeleteDialog = (buyIn: string) => {
    setSelectedBuyIn(buyIn)
    setDeleteConfirmOpen(true)
  }

  const getStat = (buyIn: string) => stats.find((s) => s.buyIn === buyIn)

  return (
    <div className="space-y-4">
      {/* Add Button */}
      <div className="flex justify-end">
        <Button
          variant="primary"
          size="medium"
          icon={<Plus className="w-5 h-5" />}
          onClick={() => setAddDialogOpen(true)}
        >
          買入金額を追加
        </Button>
      </div>

      {/* Buy-in List */}
      {loading ? (
        <div className="text-center py-8 text-gray-500">読み込み中...</div>
      ) : buyIns.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          買入金額が設定されていません。追加してください。
        </div>
      ) : (
        <div className="space-y-3">
          {buyIns.map((buyIn) => {
            const stat = getStat(buyIn)
            const isInUse = stat && (stat.tableCount > 0 || stat.waitlistCount > 0)

            return (
              <div
                key={buyIn}
                className="bg-white border-2 border-gray-200 rounded-lg p-4 flex items-center justify-between hover:border-blue-300 transition-colors"
              >
                <div className="flex-1">
                  <div className="text-2xl font-bold text-gray-900">{buyIn}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    {stat ? (
                      <>
                        {stat.tableCount}卓 • {stat.waitlistCount}人待ち
                      </>
                    ) : (
                      '読み込み中...'
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditDialog(buyIn)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    aria-label={`${buyIn}を編集`}
                  >
                    <Pencil className="w-5 h-5" aria-hidden="true" />
                  </button>
                  <button
                    onClick={() => openDeleteDialog(buyIn)}
                    disabled={isInUse}
                    className={`
                      p-2 rounded-lg transition-colors
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500
                      ${
                        isInUse
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-red-600 hover:bg-red-50'
                      }
                    `}
                    aria-label={`${buyIn}を削除`}
                    title={isInUse ? '使用中のため削除できません' : ''}
                  >
                    <Trash2 className="w-5 h-5" aria-hidden="true" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add Dialog */}
      <AddBuyInDialog
        isOpen={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onSubmit={handleAddBuyIn}
        mode="add"
        existingBuyIns={buyIns}
      />

      {/* Edit Dialog */}
      <AddBuyInDialog
        isOpen={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false)
          setSelectedBuyIn('')
        }}
        onSubmit={handleEditBuyIn}
        mode="edit"
        initialBuyIn={selectedBuyIn}
        existingBuyIns={buyIns.filter((b) => b !== selectedBuyIn)}
      />

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false)
          setSelectedBuyIn('')
        }}
        onConfirm={handleDeleteBuyIn}
        title="買入金額を削除"
        message={`買入金額「${selectedBuyIn}」を削除してもよろしいですか？`}
        confirmLabel="削除"
        cancelLabel="キャンセル"
        variant="danger"
      />
    </div>
  )
}
