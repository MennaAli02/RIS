import { useMemo, useState } from 'react'
import SearchInput from './SearchInput'

// Generic stand-in for an Odoo <tree> view: search box + sortable-ish table +
// row click to open the form. `columns` is [{ key, label, render?(row) }].
export default function DataTable({ title, columns, rows, onRowClick, onCreate, searchKeys = [], getRowClassName }) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    if (!query.trim()) return rows
    const q = query.toLowerCase()
    return rows.filter((row) =>
      searchKeys.some((key) => String(row[key] ?? '').toLowerCase().includes(q))
    )
  }, [rows, query, searchKeys])

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-gray-100">
        <h2 className="text-lg font-bold text-brand-700">{title}</h2>
        <div className="flex items-center gap-2">
          {searchKeys.length > 0 && <SearchInput value={query} onChange={setQuery} />}
          {onCreate && (
            <button
              type="button"
              onClick={onCreate}
              className="bg-brand-500 hover:bg-brand-700 text-white text-sm font-semibold px-4 py-2 rounded-md"
            >
              + New
            </button>
          )}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-gray-600 text-left">
              {columns.map((c) => (
                <th key={c.key} className="px-4 py-2 font-semibold whitespace-nowrap">
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-4 py-6 text-center text-gray-400">
                  No records found
                </td>
              </tr>
            )}
            {filtered.map((row) => {
              const customBg = getRowClassName ? getRowClassName(row) : 'hover:bg-brand-50'
              return (
                <tr
                  key={row.id}
                  onClick={() => onRowClick?.(row)}
                  className={`border-t border-gray-100 cursor-pointer transition-colors ${customBg}`}
                >
                  {columns.map((c) => (
                    <td key={c.key} className="px-4 py-2 whitespace-nowrap">
                      {c.render ? c.render(row) : row[c.key]}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
