import { cx } from '@/lib/cx'
import styles from './Skeleton.module.css'

export interface SkeletonProps {
  width?: number | string
  height?: number
  shape?: 'line' | 'circle' | 'pill'
  className?: string
}

/** Placeholder block for loading states. Decorative: mark the loading region with aria-busy instead. */
export function Skeleton({ width = '100%', height = 12, shape = 'line', className }: SkeletonProps) {
  return (
    <span
      className={cx(styles.skeleton, styles[shape], className)}
      style={{ width: shape === 'circle' ? height : width, height }}
      aria-hidden="true"
    />
  )
}
