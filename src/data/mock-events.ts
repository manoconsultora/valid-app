import type { Event } from '@/types'

import { MOCK_PROVIDERS } from './mock-providers'

/** Genera un array de N provider ids para demo (repite p1/p2). */
const providerIds = (n: number): string[] => Array.from({ length: n }, (_, i) => MOCK_PROVIDERS[i % MOCK_PROVIDERS.length].id);

/**
 * Eventos demo – coinciden con el diseño del dashboard (3 cards).
 */
export const MOCK_EVENTS: Event[] = [
  {
    id: 'e0',
    date: '2026-10-23',
    dateDisplay: '23-24 Oct 2026',
    description: 'BTS World Tour 2026.',
    employeeCount: 450,
    flyerUrl: '/eventos/bts-flyer.png',
    name: 'BTS WORLD TOUR 2026',
    providerIds: providerIds(25),
    statusAdmin: 'ARMADO',
    statusProvider: 'Cargar Documentación',
    timeRange: '20:00 - 00:00',
    venueId: 'river',
    isNew: true,
  },
  {
    id: 'e1',
    date: '2024-10-29',
    dateDisplay: '20 Oct 2024',
    description: 'La Vela Puerca en concierto.',
    employeeCount: 17,
    flyerUrl: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&q=80',
    name: 'La Vela Puerca',
    providerIds: providerIds(15),
    statusAdmin: 'LIVE',
    statusProvider: 'Cargar Documentación',
    timeRange: '20:00 - 00:00',
    venueId: 'niceto',
    isNew: true,
  },
  {
    id: 'e2',
    date: '2024-11-15',
    dateDisplay: '15 Nov 2024',
    description: 'Divididos en vivo.',
    employeeCount: 20,
    flyerUrl: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80',
    name: 'Divididos',
    providerIds: providerIds(12),
    statusAdmin: 'VALIDACIÓN',
    statusProvider: 'Cargar Documentación',
    timeRange: '20:00 - 00:00',
    venueId: 'velez',
    isNew: true,
  },
  {
    id: 'e3',
    date: '2024-10-05',
    dateDisplay: '05 Oct 2024',
    description: 'Miranda! en Luna Park.',
    employeeCount: 12,
    flyerUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80',
    name: 'Miranda!',
    providerIds: providerIds(10),
    statusAdmin: 'VALIDACIÓN',
    statusProvider: 'Documentación Aprobada',
    timeRange: '20:00 - 00:00',
    venueId: 'luna',
  },
]
