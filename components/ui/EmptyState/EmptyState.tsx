import type { ReactNode } from 'react'
import { cx } from '@/lib/cx'
import { Icon, type IconName } from '../Icon'
import styles from './EmptyState.module.css'

export interface EmptyStateProps {
  icon: IconName
  title: string
  description?: ReactNode
  action?: ReactNode
  tone?: 'primary' | 'danger'
  className?: string
}

/** Centred icon, title, description and optional action, for empty, no-result and error states. */
export function EmptyState({
  icon,
  title,
  description,
  action,
  tone = 'primary',
  className,
}: EmptyStateProps) {
  return (
    <div className={cx(styles.state, className)}>
      <span className={cx(styles.icon, styles[tone])} aria-hidden="true">
        <Icon name={icon} size={24} />
      </span>
      <div className={styles.text}>
        <p className={styles.title}>{title}</p>
        {description && <p className={styles.description}>{description}</p>}
      </div>
      {action}
    </div>
  )
}
