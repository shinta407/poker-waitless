import { type Table } from '@/lib/supabase'

interface TableStatusPanelProps {
  tables: Table[]
  onUpdateSeats: (tableId: string, increment: number) => void
}

export default function TableStatusPanel({ tables, onUpdateSeats }: TableStatusPanelProps) {
  const totalOccupied = tables.reduce((sum, table) => sum + table.current_players, 0)
  const totalSeats = tables.reduce((sum, table) => sum + table.max_seats, 0)
  const availableSeats = totalSeats - totalOccupied

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">
        卓状況
      </h2>

      {/* Summary Stats */}
      <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-200">
        <div className="grid grid-cols-1 gap-4">
          <div className="flex justify-between items-center">
            <span className="text-xl text-gray-700">合計使用席:</span>
            <span className="text-3xl font-bold text-blue-600">
              {totalOccupied} / {totalSeats}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xl text-gray-700">空き席:</span>
            <span className={`text-3xl font-bold ${
              availableSeats > 5 ? 'text-green-600' :
              availableSeats > 0 ? 'text-yellow-600' :
              'text-red-600'
            }`}>
              {availableSeats}席
            </span>
          </div>
        </div>
      </div>

      {/* Table List */}
      <div className="space-y-4">
        {tables.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-2xl">
            卓情報がありません
          </div>
        ) : (
          tables.map((table, index) => (
            <TableRow
              key={table.id}
              table={table}
              tableNumber={index + 1}
              onUpdateSeats={onUpdateSeats}
            />
          ))
        )}
      </div>
    </div>
  )
}

interface TableRowProps {
  table: Table
  tableNumber: number
  onUpdateSeats: (tableId: string, increment: number) => void
}

function TableRow({ table, tableNumber, onUpdateSeats }: TableRowProps) {
  const isFull = table.current_players >= table.max_seats
  const isEmpty = table.current_players === 0

  return (
    <div className={`
      rounded-xl p-5 shadow-md border-2
      ${isFull ? 'bg-red-50 border-red-300' : 'bg-white border-gray-200'}
    `}>
      {/* Table Name */}
      <div className="mb-3">
        <h3 className="text-2xl font-bold text-gray-800">
          卓 {tableNumber} ({table.rate})
        </h3>
      </div>

      {/* Seat Counter with Buttons */}
      <div className="flex items-center justify-between gap-4">
        {/* Minus Button */}
        <button
          onClick={() => onUpdateSeats(table.id, -1)}
          disabled={isEmpty}
          className={`
            w-20 h-20 rounded-xl font-bold text-4xl
            transition-all active:scale-90 shadow-md
            ${
              isEmpty
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-red-500 hover:bg-red-600 text-white'
            }
          `}
        >
          −
        </button>

        {/* Seat Count Display */}
        <div className="flex-1 text-center">
          <span className={`text-5xl font-bold ${
            isFull ? 'text-red-600' :
            table.current_players > table.max_seats * 0.7 ? 'text-yellow-600' :
            'text-green-600'
          }`}>
            {table.current_players}
          </span>
          <span className="text-3xl text-gray-400 font-semibold">
            {' '}/{' '}{table.max_seats}
          </span>
        </div>

        {/* Plus Button */}
        <button
          onClick={() => onUpdateSeats(table.id, 1)}
          disabled={isFull}
          className={`
            w-20 h-20 rounded-xl font-bold text-4xl
            transition-all active:scale-90 shadow-md
            ${
              isFull
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-green-500 hover:bg-green-600 text-white'
            }
          `}
        >
          +
        </button>
      </div>
    </div>
  )
}
