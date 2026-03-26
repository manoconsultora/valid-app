import { DB_EVENTS, DB_EVENT_PROVIDERS } from '@/data/mock-db'
import { dbEventToApp, getProviderIdsByEventId } from '@/lib/adapters/db-to-app'
import type { Event } from '@/types'

const KEY = 'valid_events'
const MOCK_IDS = new Set(DB_EVENTS.map(e => e.id))
const providerIdsByEvent = getProviderIdsByEventId(DB_EVENT_PROVIDERS)
const IS_NEW_IDS = new Set(['e0', 'e1', 'e2'])

const buildSeedEvents = (): Event[] =>
  DB_EVENTS.map(db =>
    dbEventToApp(db, providerIdsByEvent.get(db.id) ?? [], {
      isNew: IS_NEW_IDS.has(db.id),
    })
  )

const SEED_EVENTS = buildSeedEvents()

/**
 * Eventos demo desde mock-db (forma API); eventos de usuario desde localStorage.
 */
function read(): Event[] {
  if (typeof window === 'undefined') {
    return SEED_EVENTS
  }
  try {
    const raw = window.localStorage.getItem(KEY)
    const stored: Event[] = raw ? (JSON.parse(raw) as Event[]) : []
    const userEvents = stored.filter(e => !MOCK_IDS.has(e.id))
    const merged = [...SEED_EVENTS, ...userEvents]
    if (userEvents.length > 0) {
      window.localStorage.setItem(KEY, JSON.stringify(merged))
    }
    return merged
  } catch {
    return SEED_EVENTS
  }
}

export const getEvents = (): Event[] => read()

export function addEvent(event: Omit<Event, 'id'>): Event {
  const events = read()
  const id = `e${Date.now()}`
  const newEvent: Event = {
    ...event,
    id,
    statusAdmin: event.statusAdmin ?? 'ARMADO',
  }
  events.push(newEvent)
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(KEY, JSON.stringify(events))
  }
  return newEvent
}

export function updateEvent(id: string, patch: Partial<Event>): void {
  const events = read()
  const i = events.findIndex(e => e.id === id)
  if (i === -1) {
    return
  }
  events[i] = { ...events[i], ...patch }
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(KEY, JSON.stringify(events))
  }
}
