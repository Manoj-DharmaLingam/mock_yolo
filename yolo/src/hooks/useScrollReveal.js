// ============================================
// YOLO — Singleton IntersectionObserver
// One shared observer for ALL reveal elements.
// Eliminates N separate observers that cause lag.
// ============================================

import { useEffect } from 'react'

// Module-level singletons
const _callbacks = new WeakMap()
let _observer = null

function getObserver() {
  if (_observer) return _observer
  if (typeof IntersectionObserver === 'undefined') return null
  _observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        const cb = _callbacks.get(entry.target)
        if (cb) {
          cb()
          _callbacks.delete(entry.target)
          _observer.unobserve(entry.target)
        }
      }
    },
    { threshold: 0.08, rootMargin: '0px 0px -30px 0px' }
  )
  return _observer
}

// HMR-safe cleanup
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    _observer?.disconnect()
    _observer = null
  })
}

/** Register a single element for reveal animation */
export function revealElement(el, delay = 0) {
  if (!el) return
  const obs = getObserver()
  if (!obs) {
    // Fallback for environments without IntersectionObserver
    el.classList.add('visible')
    return
  }
  _callbacks.set(el, () => {
    if (delay > 0) setTimeout(() => el.classList.add('visible'), delay)
    else el.classList.add('visible')
  })
  obs.observe(el)
}

/** Unregister a single element */
export function unrevealElement(el) {
  if (!el) return
  _callbacks.delete(el)
  _observer?.unobserve(el)
}

/**
 * Hook: reveal a single ref element once visible.
 * @param {React.RefObject} ref
 * @param {number} delay - ms before adding 'visible' class
 */
export function useScrollReveal(ref, delay = 0) {
  useEffect(() => {
    const el = ref?.current
    if (!el) return
    revealElement(el, delay)
    return () => unrevealElement(el)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // intentional: run once on mount

  return ref
}

/**
 * Hook: reveal a list of elements with stagger.
 * Returns a setter: setRef(i) → (el) => { ... }
 * @param {number} stagger - ms between each item (default 80ms)
 */
export function useListReveal(deps = [], stagger = 80) {
  const refs = { current: [] }

  useEffect(() => {
    const els = refs.current
    els.forEach((el, i) => {
      if (el) revealElement(el, i * stagger)
    })
    return () => els.forEach(el => { if (el) unrevealElement(el) })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  const setRef = (i) => (el) => { refs.current[i] = el }
  return setRef
}

