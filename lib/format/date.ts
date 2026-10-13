const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

const timeFormatter = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit' })

const dateTimeFormatter = new Intl.DateTimeFormat('en-GB', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

/** "Wed, 30 Sep 2026" */
export const formatDate = (iso: string) => dateFormatter.format(new Date(iso))

/** "14:22" */
export const formatTime = (iso: string) => timeFormatter.format(new Date(iso))

/** "Wed, 30 Sep 2026, 14:22" */
export const formatDateTime = (iso: string) => dateTimeFormatter.format(new Date(iso))

/** Calendar day in the user's time zone, e.g. "2026-09-30". Used to group a list by day. */
export function localDayKey(date: Date | string): string {
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** "Today", "Yesterday" or "Wed, 30 Sep 2026", relative to `now` in the user's time zone. */
export function formatDayLabel(iso: string, now: Date = new Date()): string {
  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)

  const day = localDayKey(iso)
  if (day === localDayKey(now)) return 'Today'
  if (day === localDayKey(yesterday)) return 'Yesterday'
  return formatDate(iso)
}
