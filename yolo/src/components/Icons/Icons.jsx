/**
 * Shared SVG icon components — all 24×24, stroke-based, consistent style.
 * Usage: import { PackageIcon, BanknoteIcon } from '../Icons/Icons'
 */

const s = { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }

export const PackageIcon = (p) => (
  <svg {...s} {...p}>
    <path d="M16.5 9.4 7.5 4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
  </svg>
)

export const BanknoteIcon = (p) => (
  <svg {...s} {...p}>
    <rect width="20" height="12" x="2" y="6" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/>
  </svg>
)

export const SmartphoneIcon = (p) => (
  <svg {...s} {...p}>
    <rect width="14" height="20" x="5" y="2" rx="2"/><path d="M12 18h.01"/>
  </svg>
)

export const ShoppingCartIcon = (p) => (
  <svg {...s} {...p}>
    <circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
  </svg>
)

export const LockIcon = (p) => (
  <svg {...s} {...p}>
    <rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
)

export const PencilIcon = (p) => (
  <svg {...s} {...p}>
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/>
  </svg>
)

export const ClockIcon = (p) => (
  <svg {...s} {...p}>
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
)

export const XIcon = (p) => (
  <svg {...s} {...p}>
    <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
  </svg>
)

export const CheckIcon = (p) => (
  <svg {...s} {...p}>
    <path d="M20 6 9 17l-5-5"/>
  </svg>
)

export const CheckCircleIcon = (p) => (
  <svg {...s} {...p}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/>
  </svg>
)

export const StarIcon = (p) => (
  <svg {...s} {...p}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
)

export const TruckIcon = (p) => (
  <svg {...s} {...p}>
    <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3"/><rect width="7" height="7" x="14" y="10" rx="1"/><circle cx="17.5" cy="17.5" r="1.5"/><circle cx="5.5" cy="17.5" r="1.5"/>
  </svg>
)

export const MapPinIcon = (p) => (
  <svg {...s} {...p}>
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
  </svg>
)

export const UserIcon = (p) => (
  <svg {...s} {...p}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
)

export const ArrowLeftIcon = (p) => (
  <svg {...s} {...p}>
    <path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>
  </svg>
)

export const ArrowRightIcon = (p) => (
  <svg {...s} {...p}>
    <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
  </svg>
)

export const ReceiptIcon = (p) => (
  <svg {...s} {...p}>
    <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M16 8H8"/><path d="M16 12H8"/><path d="M12 16H8"/>
  </svg>
)

export const AlertCircleIcon = (p) => (
  <svg {...s} {...p}>
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
)

export const SearchIcon = (p) => (
  <svg {...s} {...p}>
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
)

export const HeartIcon = (p) => (
  <svg {...s} {...p}>
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
  </svg>
)

export const TrashIcon = (p) => (
  <svg {...s} {...p}>
    <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
  </svg>
)

export const PlusIcon = (p) => (
  <svg {...s} {...p}>
    <path d="M5 12h14"/><path d="M12 5v14"/>
  </svg>
)

export const TagIcon = (p) => (
  <svg {...s} {...p}>
    <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42Z"/><circle cx="7.5" cy="7.5" r=".5" fill="currentColor"/>
  </svg>
)
