'use client'
import * as RadixSelect from '@radix-ui/react-select'
import { useId } from 'react'
import { cx } from '@/lib/cx'
import { Field } from '../Field'
import { Icon } from '../Icon'
import styles from './Select.module.css'

export interface SelectOption {
  value: string
  label: string
}

export interface SelectProps {
  label: string
  hideLabel?: boolean
  options: readonly SelectOption[]
  value: string
  onValueChange: (value: string) => void
  id?: string
  /** Submitted with a surrounding form, like a native select. */
  name?: string
  disabled?: boolean
  fieldClassName?: string
  className?: string
}

/**
 * Radix doesn't allow an empty string as an item value (it's reserved for "no selection"), but "All types"
 * style options use '' to mean "no filter". Map it to a sentinel inside the component only.
 */
const EMPTY = '__empty__'
const toRadix = (value: string) => (value === '' ? EMPTY : value)
const fromRadix = (value: string) => (value === EMPTY ? '' : value)

/**
 * Select built on Radix's unstyled primitive: it supplies keyboard support, typeahead, focus management,
 * ARIA (combobox + listbox) and positioning; the look comes from our tokens and the Figma options panel.
 */
export function Select({
  label,
  hideLabel,
  options,
  value,
  onValueChange,
  id,
  name,
  disabled,
  fieldClassName,
  className,
}: SelectProps) {
  const generatedId = useId()
  const triggerId = id ?? generatedId

  return (
    <Field label={label} htmlFor={triggerId} hideLabel={hideLabel} className={fieldClassName}>
      <RadixSelect.Root
        value={toRadix(value)}
        onValueChange={(next) => onValueChange(fromRadix(next))}
        name={name}
        disabled={disabled}
      >
        <RadixSelect.Trigger id={triggerId} className={cx(styles.trigger, className)}>
          <RadixSelect.Value />
          <RadixSelect.Icon className={styles.chevron}>
            <Icon name="chevron-down" size={16} />
          </RadixSelect.Icon>
        </RadixSelect.Trigger>

        <RadixSelect.Portal>
          <RadixSelect.Content className={styles.content} position="popper" sideOffset={4}>
            <RadixSelect.Viewport className={styles.viewport}>
              {options.map((option) => (
                <RadixSelect.Item key={option.value} value={toRadix(option.value)} className={styles.item}>
                  <RadixSelect.ItemText>{option.label}</RadixSelect.ItemText>
                </RadixSelect.Item>
              ))}
            </RadixSelect.Viewport>
          </RadixSelect.Content>
        </RadixSelect.Portal>
      </RadixSelect.Root>
    </Field>
  )
}
