import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { SEED } from './seed'

const STORAGE_KEY = 'ris_mock_db_v1'

const DataContext = createContext(null)

function loadInitial() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch (e) {
    console.warn('Failed to load mock DB from localStorage, reseeding.', e)
  }
  return structuredClone(SEED)
}

export function DataProvider({ children }) {
  const [db, setDb] = useState(loadInitial)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db))
  }, [db])

  const api = useMemo(() => {
    const nextId = (collection) => {
      const rows = db[collection] || []
      return rows.reduce((max, r) => Math.max(max, r.id), 0) + 1
    }

    const getAll = (collection) => db[collection] || []

    const getById = (collection, id) =>
      (db[collection] || []).find((r) => String(r.id) === String(id)) || null

    const create = (collection, vals) => {
      const id = nextId(collection)
      const row = { id, ...vals }
      setDb((prev) => ({ ...prev, [collection]: [...(prev[collection] || []), row] }))
      return row
    }

    const update = (collection, id, vals) => {
      setDb((prev) => ({
        ...prev,
        [collection]: (prev[collection] || []).map((r) =>
          String(r.id) === String(id) ? { ...r, ...vals } : r
        ),
      }))
    }

    const remove = (collection, id) => {
      setDb((prev) => ({
        ...prev,
        [collection]: (prev[collection] || []).filter((r) => String(r.id) !== String(id)),
      }))
    }

    const resetAll = () => {
      const fresh = structuredClone(SEED)
      setDb(fresh)
    }

    return { getAll, getById, create, update, remove, resetAll }
  }, [db])

  return <DataContext.Provider value={api}>{children}</DataContext.Provider>
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within a DataProvider')
  return ctx
}
