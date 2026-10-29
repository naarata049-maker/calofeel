import { useState } from 'react'
import { ChevronIcon } from '../components/icons'
import { HISTORY_DAYS, daysBetween, recordsFor, totals, type DayBook } from '../data/history'
import { rangeOf } from '../data/settings'
import { useSettings } from '../settings'
import './Calendar.css'
import { appToday } from '../data/day'

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土']

type Status = 'inside' | 'over' | 'under'

// ホームの日付をタップすると出るカレンダー（Figma 2-7）。日をタップするとその日のホーム
type Props = {
  book: DayBook
  // いまホームで見ている日（何日前か）
  selected: number
  onClose: () => void
  onPick: (daysAgo: number) => void
}

export function Calendar({ book, selected, onClose, onPick }: Props) {
  const { settings, dailyBurn } = useSettings()
  const today = appToday()
  const selectedDate = new Date(today)
  selectedDate.setDate(today.getDate() - selected)
  // 0 = 今月、-1 = 先月
  const [shift, setShift] = useState(
    (selectedDate.getFullYear() - today.getFullYear()) * 12 + selectedDate.getMonth() - today.getMonth(),
  )

  const first = new Date(today.getFullYear(), today.getMonth() + shift, 1)
  const length = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate()
  const oldest = new Date(today)
  oldest.setDate(today.getDate() - HISTORY_DAYS)
  const canPrev = first > oldest

  const statusOf = (daysAgo: number): Status | null => {
    const records = recordsFor(daysAgo, book)
    if (!records.some((r) => r.kind === 'meal')) return null
    const { eaten, burned } = totals(records, dailyBurn)
    const [lo, hi] = rangeOf(settings, burned)
    return eaten > hi ? 'over' : eaten < lo ? 'under' : 'inside'
  }

  // 月の最初の日の曜日まであける（日曜から）
  const cells: (number | null)[] = [...Array(first.getDay()).fill(null), ...Array.from({ length }, (_, i) => i + 1)]

  return (
    <div className="sheet-layer">
      <button className="sheet-backdrop" aria-label="閉じる" onClick={onClose} />
      <section className="sheet calendar" role="dialog" aria-label="日付を選ぶ">
        <span className="sheet-handle" />
        <div className="calendar-head">
          <button className="calendar-nav" onClick={() => setShift((s) => s - 1)} disabled={!canPrev} aria-label="前の月">
            <ChevronIcon direction="left" />
          </button>
          <h2>{first.getFullYear()}年{first.getMonth() + 1}月</h2>
          <button className="calendar-nav" onClick={() => setShift((s) => s + 1)} disabled={shift >= 0} aria-label="次の月">
            <ChevronIcon />
          </button>
        </div>
        <div className="calendar-grid">
          {WEEKDAYS.map((w) => <span key={w} className="calendar-weekday">{w}</span>)}
          {cells.map((day, i) => {
            if (day === null) return <span key={`e${i}`} />
            const daysAgo = daysBetween(new Date(first.getFullYear(), first.getMonth(), day), today)
            const open = daysAgo >= 0 && daysAgo <= HISTORY_DAYS
            const status = open ? statusOf(daysAgo) : null
            const classes = ['calendar-day']
            if (!open) classes.push('is-off')
            if (daysAgo === 0) classes.push('is-today')
            if (daysAgo === selected) classes.push('is-selected')
            return (
              <button key={day} className={classes.join(' ')} disabled={!open} onClick={() => onPick(daysAgo)}
                aria-label={`${first.getMonth() + 1}月${day}日`} aria-current={daysAgo === selected ? 'date' : undefined}>
                <span className="calendar-number">{day}</span>
                {status && <span className={`calendar-dot is-${status}`} />}
              </button>
            )
          })}
        </div>
        <div className="calendar-legend">
          <span><i className="calendar-dot is-inside" />目安の中</span>
          <span><i className="calendar-dot is-over" />目安より上</span>
          <span><i className="calendar-dot is-under" />目安より下</span>
          <span><i className="calendar-ring" />今日</span>
        </div>
        <p className="calendar-note">日付をタップすると、その日のホームを開きます</p>
      </section>
    </div>
  )
}
