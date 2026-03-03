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
    dateDisplay: '23-24 Octubre 2026',
    description: 'BTS World Tour 2026.',
    employeeCount: 450,
    flyerUrl: '/eventos/bts-flyer.png',
    name: 'BTS WORLD TOUR 2026',
    providerIds: providerIds(25),
    statusAdmin: 'ARMADO',
    timeRange: '20:00 - 00:00',
    venueId: 'river',
  },
  {
    id: 'e1',
    date: '2024-12-29',
    dateDisplay: '29 Diciembre 2024',
    description: 'Lollapalooza Argentina.',
    employeeCount: 247,
    flyerUrl: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&q=80',
    name: 'Lollapalooza Argentina',
    providerIds: providerIds(15),
    statusAdmin: 'LIVE',
    timeRange: '14:00 - 00:00',
    venueId: 'sanisidro',
  },
  {
    id: 'e2',
    date: '2025-01-05',
    dateDisplay: '05 Enero 2025',
    description: 'Cosquín Rock.',
    employeeCount: 198,
    flyerUrl: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80',
    name: 'Cosquín Rock',
    providerIds: providerIds(12),
    statusAdmin: 'VALIDACIÓN',
    timeRange: '20:00 - 00:00',
    venueId: 'cosquin',
  },
]
