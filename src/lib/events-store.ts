import { MOCK_EVENTS } from '@/data/mock-events'
import type { Event } from '@/types'


const KEY = 'valid_events'
const MOCK_IDS = new Set(MOCK_EVENTS.map((e) => e.id))

/**
 * Siempre usa MOCK_EVENTS como fuente de verdad para eventos demo (incl. flyerUrl).
 * Los eventos creados por el usuario (id no en mocks) se leen de localStorage y se agregan al final.
 */
function read(): Event[] {
  if (typeof window === 'undefined') {
    return MOCK_EVENTS
  }
  try {
    const raw = window.localStorage.getItem(KEY)
    const stored: Event[] = raw ? (JSON.parse(raw) as Event[]) : []
    const userEvents = stored.filter((e) => !MOCK_IDS.has(e.id))
    const merged = [...MOCK_EVENTS, ...userEvents]
    if (userEvents.length > 0) {
      window.localStorage.setItem(KEY, JSON.stringify(merged))
    }
    return merged
  } catch {
    return MOCK_EVENTS
  }
}

export const getEvents = (): Event[] => read();

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
  const i = events.findIndex((e) => e.id === id)
  if (i === -1) {
    return
  }
  events[i] = { ...events[i], ...patch }
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(KEY, JSON.stringify(events))
  }
}
