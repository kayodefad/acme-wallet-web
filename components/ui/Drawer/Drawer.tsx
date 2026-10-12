'use client'
import { useEffect, useEffectEvent, useId, useRef, type KeyboardEvent, type ReactNode } from 'react'
import { Icon } from '../Icon'
import styles from './Drawer.module.css'

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])'

export interface DrawerProps {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
}

/**
 * Modal side panel (a bottom sheet on small screens). Moves focus into the panel, keeps Tab inside it,
 * closes on Escape, the close button or a click on the overlay, and returns focus on close.
 */
export function Drawer({ open, title, onClose, children, footer }: DrawerProps) {
  const titleId = useId()
  const panelRef = useRef<HTMLDivElement>(null)
  const handleEscape = useEffectEvent(onClose)

  useEffect(() => {
    if (!open) return
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null
    panelRef.current?.focus()

    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'

    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') handleEscape()
    }
    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = overflow
      previouslyFocused?.focus()
    }
  }, [open])

  const trapFocus = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Tab' || !panelRef.current) return
    const focusable = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE))
    if (focusable.length === 0) return event.preventDefault()

    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    const active = document.activeElement
    if (event.shiftKey && (active === first || active === panelRef.current)) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && active === last) {
      event.preventDefault()
      first.focus()
    }
  }

  if (!open) return null

  return (
    <>
      <div className={styles.overlay} onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onKeyDown={trapFocus}
      >
        <div className={styles.grabber} aria-hidden="true" />
        <div className={styles.header}>
          <h2 id={titleId} className={styles.title}>
            {title}
          </h2>
          <button type="button" className={styles.close} onClick={onClose} aria-label="Close">
            <Icon name="close" size={20} />
          </button>
        </div>
        <div className={styles.body}>{children}</div>
        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
    </>
  )
}
