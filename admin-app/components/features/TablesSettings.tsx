'use client'

import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, ChevronDown, ChevronRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { supabase, type Table } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from './ConfirmDialog'
import { AddTableDialog } from './AddTableDialog'
import { useToast } from '@/hooks/useToast'

interface TablesSettingsProps {
  storeId: string
  buyIns: string[]
}

export function TablesSettings({ storeId, buyIns }: TablesSettingsProps) {
  const [tables, setTables] = useState<Table[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedBuyIns, setExpandedBuyIns] = useState<Set<string>>(new Set(buyIns))
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [selectedTable, setSelectedTable] = useState<Table | null>(null)
  const [selectedBuyInForAdd, setSelectedBuyInForAdd] = useState<string>('')
  const toast = useToast()
  const t = useTranslations()

  // Load tables
  useEffect(() => {
    if (!storeId) {
      setLoading(false)
      return
    }

    const loadTables = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('tables')
          .select('*')
          .eq('store_id', storeId)
          .order('rate', { ascending: true })

        if (error) throw error

        setTables(data || [])
      } catch (error) {
        console.error('Error loading tables:', error)
        toast.error(t('toast.tablesLoadFailed'))
      } finally {
        setLoading(false)
      }
    }

    loadTables()

    // Subscribe to real-time changes
    const subscription = supabase
      .channel(`tables-settings-${storeId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tables',
          filter: `store_id=eq.${storeId}`,
        },
        (payload) => {
          console.log('Table change:', payload)
          if (payload.eventType === 'DELETE') {
            setTables((prev) => prev.filter((t) => t.id !== payload.old?.id))
          } else if (payload.eventType === 'INSERT') {
            setTables((prev) => [...prev, payload.new as Table])
          } else if (payload.eventType === 'UPDATE') {
            setTables((prev) =>
              prev.map((t) => (t.id === payload.new?.id ? (payload.new as Table) : t))
            )
          }
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [storeId])

  const toggleBuyIn = (buyIn: string) => {
    setExpandedBuyIns((prev) => {
      const next = new Set(prev)
      if (next.has(buyIn)) {
        next.delete(buyIn)
      } else {
        next.add(buyIn)
      }
      return next
    })
  }

  const getTablesForBuyIn = (buyIn: string) => {
    return tables.filter((t) => t.rate === buyIn)
  }

  const handleAddTable = async (tableData: Omit<Table, 'id' | 'store_id' | 'created_at' | 'updated_at'>) => {
    try {
      const { error } = await supabase.from('tables').insert({
        store_id: storeId,
        rate: tableData.rate,
        max_seats: tableData.max_seats,
        current_players: 0,
        status: tableData.status,
      })

      if (error) throw error

      toast.success(t('toast.tableAdded'))
      setAddDialogOpen(false)
      setSelectedBuyInForAdd('')
    } catch (error) {
      console.error('Error adding table:', error)
      toast.error(t('toast.tableAddFailed'))
      throw error
    }
  }

  const handleEditTable = async (tableData: Omit<Table, 'id' | 'store_id' | 'created_at' | 'updated_at'>) => {
    if (!selectedTable) return

    try {
      // Validate max_seats
      if (tableData.max_seats < selectedTable.current_players) {
        toast.error(
          `現在${selectedTable.current_players}人のプレイヤーがいます。${tableData.max_seats}席には変更できません。`
        )
        return
      }

      const { error } = await supabase
        .from('tables')
        .update({
          max_seats: tableData.max_seats,
          status: tableData.status,
        })
        .eq('id', selectedTable.id)

      if (error) throw error

      toast.success(t('toast.tableUpdated'))
      setEditDialogOpen(false)
      setSelectedTable(null)
    } catch (error) {
      console.error('Error editing table:', error)
      toast.error(t('toast.tableUpdateFailed'))
      throw error
    }
  }

  const handleDeleteTable = async () => {
    if (!selectedTable) return

    try {
      // Validate no players
      if (selectedTable.current_players > 0) {
        toast.error('この卓にはプレイヤーがいます。削除できません。')
        setDeleteConfirmOpen(false)
        setSelectedTable(null)
        return
      }

      const { error } = await supabase.from('tables').delete().eq('id', selectedTable.id)

      if (error) throw error

      toast.success(t('toast.tableDeleted'))
      setDeleteConfirmOpen(false)
      setSelectedTable(null)
    } catch (error) {
      console.error('Error deleting table:', error)
      toast.error(t('toast.tableDeleteFailed'))
    }
  }

  const openAddDialog = (buyIn: string) => {
    setSelectedBuyInForAdd(buyIn)
    setAddDialogOpen(true)
  }

  const openEditDialog = (table: Table) => {
    setSelectedTable(table)
    setEditDialogOpen(true)
  }

  const openDeleteDialog = (table: Table) => {
    setSelectedTable(table)
    setDeleteConfirmOpen(true)
  }

  return (
    <div className="space-y-4">
      {loading ? (
        <div className="text-center py-8 text-gray-500">{t('common.loading')}</div>
      ) : buyIns.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {t('table.noBuyInsYet')}
        </div>
      ) : (
        <div className="space-y-3">
          {buyIns.map((buyIn) => {
            const buyInTables = getTablesForBuyIn(buyIn)
            const isExpanded = expandedBuyIns.has(buyIn)

            return (
              <div
                key={buyIn}
                className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden"
              >
                {/* Buy-in Header */}
                <div className="bg-gray-50 border-b-2 border-gray-200">
                  <div className="flex items-center justify-between p-4">
                    <button
                      onClick={() => toggleBuyIn(buyIn)}
                      className="flex items-center gap-2 flex-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 rounded"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5 text-gray-500" aria-hidden="true" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-500" aria-hidden="true" />
                      )}
                      <span className="text-xl font-bold text-gray-900">{buyIn}</span>
                      <span className="text-sm text-gray-600">({buyInTables.length}卓)</span>
                    </button>

                    <Button
                      variant="primary"
                      size="small"
                      icon={<Plus className="w-4 h-4" />}
                      onClick={() => openAddDialog(buyIn)}
                    >
                      {t('table.add')}
                    </Button>
                  </div>
                </div>

                {/* Tables List */}
                {isExpanded && (
                  <div className="p-4">
                    {buyInTables.length === 0 ? (
                      <div className="text-center py-6 text-gray-500">
                        卓がありません。追加してください。
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {buyInTables.map((table) => (
                          <div
                            key={table.id}
                            className="border-2 border-gray-200 rounded-lg p-3 flex items-center justify-between hover:border-blue-300 transition-colors"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-3">
                                <span className="text-lg font-semibold text-gray-900">
                                  卓 {table.id.slice(0, 8)}
                                </span>
                                <span className="text-sm text-gray-600">
                                  {table.current_players}/{table.max_seats}席
                                </span>
                                <span
                                  className={`
                                    text-xs font-semibold px-2 py-1 rounded
                                    ${
                                      table.status === 'open'
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-gray-100 text-gray-700'
                                    }
                                  `}
                                >
                                  {table.status === 'open' ? 'Open' : 'Closed'}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => openEditDialog(table)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                                aria-label="編集"
                              >
                                <Pencil className="w-4 h-4" aria-hidden="true" />
                              </button>
                              <button
                                onClick={() => openDeleteDialog(table)}
                                disabled={table.current_players > 0}
                                className={`
                                  p-2 rounded-lg transition-colors
                                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500
                                  ${
                                    table.current_players > 0
                                      ? 'text-gray-300 cursor-not-allowed'
                                      : 'text-red-600 hover:bg-red-50'
                                  }
                                `}
                                aria-label="削除"
                                title={table.current_players > 0 ? 'プレイヤーがいるため削除できません' : ''}
                              >
                                <Trash2 className="w-4 h-4" aria-hidden="true" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Add Dialog */}
      <AddTableDialog
        isOpen={addDialogOpen}
        onClose={() => {
          setAddDialogOpen(false)
          setSelectedBuyInForAdd('')
        }}
        onSubmit={handleAddTable}
        mode="add"
        buyIns={buyIns}
        initialBuyIn={selectedBuyInForAdd}
      />

      {/* Edit Dialog */}
      {selectedTable && (
        <AddTableDialog
          isOpen={editDialogOpen}
          onClose={() => {
            setEditDialogOpen(false)
            setSelectedTable(null)
          }}
          onSubmit={handleEditTable}
          mode="edit"
          buyIns={buyIns}
          initialTable={selectedTable}
        />
      )}

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false)
          setSelectedTable(null)
        }}
        onConfirm={handleDeleteTable}
        title="卓を削除"
        message={`レート ${selectedTable?.rate} の卓を削除してもよろしいですか？`}
        confirmLabel="削除"
        cancelLabel="キャンセル"
        variant="danger"
      />
    </div>
  )
}
