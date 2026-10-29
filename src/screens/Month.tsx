import { useState } from 'react'
import { Header } from '../components/Header'
import { Segmented } from '../components/form'
import { CATEGORIES } from '../data/foods'
import { HISTORY_DAYS, daysBetween, recordsFor, totals, type DayBook } from '../data/history'
import { rangeOf } from '../data/settings'
import { MEAL_COLOR } from '../data/today'
import { useSettings } from '../settings'
import './Month.css'

// 「記録」タブ：週と月の、食べた量の棒グラフ（Figma 5-1）
type Props = {
  book: DayBook
  // 日をタップすると、その日のホームへ
  onOpenDay: (daysAgo: number) => void
}

type Day = {
  date: Date
  daysAgo: number
  // まだ来ていない日・記録がない日は null
  meals: { color: string; kcal: number }[] | null
  eaten: number
  burned: number
  range: [number, number]
}

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土']

// グラフの大きさ（Figma のカード 361×300 の中の位置）
const ZERO_Y = 250
const TOP_Y = 30

export function Month({ book, onOpenDay }: Props) {
  const { settings, dailyBurn } = useSettings()
  const [mode, setMode] = useState(1) // 0 週・1 月
  const [shift, setShift] = useState(0) // 0 = いまの週・月、-1 = ひとつ前
  const now = new Date()
  const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  // 表示する日のならび
  let dates: Date[]
  if (mode === 1) {
    const first = new Date(todayDate.getFullYear(), todayDate.getMonth() + shift, 1)
    const last = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate()
    dates = Array.from({ length: last }, (_, i) => new Date(first.getFullYear(), first.getMonth(), i + 1))
  } else {
    // 週は月曜から
    const monday = new Date(todayDate)
    monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7) + shift * 7)
    dates = Array.from({ length: 7 }, (_, i) => new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i))
  }

  const days: Day[] = dates.map((date) => {
    const daysAgo = daysBetween(date, todayDate)
    const records = daysAgo < 0 || daysAgo > HISTORY_DAYS ? null : recordsFor(daysAgo, book)
    const { eaten, burned } = totals(records ?? [], dailyBurn)
    const meals = records && records.some((r) => r.kind === 'meal')
      ? CATEGORIES.map((c) => ({
        color: MEAL_COLOR[c],
        kcal: records.reduce((s, r) => (r.kind === 'meal' && r.category === c ? s + r.kcal : s), 0),
      })).filter((m) => m.kcal > 0)
      : null
    return { date, daysAgo, meals, eaten, burned, range: rangeOf(settings, burned) }
  })

  const recorded = days.filter((d) => d.meals)
  const count = { inside: 0, over: 0, under: 0 }
  for (const d of recorded) {
    if (d.eaten > d.range[1]) count.over++
    else if (d.eaten < d.range[0]) count.under++
    else count.inside++
  }
  const avg = (f: (d: Day) => number) => recorded.length ? Math.round(recorded.reduce((s, d) => s + f(d), 0) / recorded.length / 10) * 10 : 0

  // 縦の目盛り：3,000 まで（こえる日があれば 1,000 ずつふやす）
  const maxK = Math.max(3000, Math.ceil(Math.max(0, ...days.map((d) => d.eaten)) / 1000) * 1000)
  const scale = (ZERO_Y - TOP_Y) / maxK
  const y = (kcal: number) => ZERO_Y - kcal * scale

  // 棒の横の位置
  const isMonth = mode === 1
  const step = isMonth ? 10.4 : 46
  const barW = isMonth ? 6 : 14
  const left = isMonth ? 29 : 37
  const x = (i: number) => left + i * step

  const first = dates[0]
  const lastDate = dates[dates.length - 1]
  const canNext = shift < 0
  const canPrev = daysBetween(first, todayDate) < HISTORY_DAYS
  const title = isMonth ? `${first.getMonth() + 1}月` : `${first.getMonth() + 1}/${first.getDate()}〜${lastDate.getMonth() + 1}/${lastDate.getDate()}`
  const periodLabel = isMonth ? `${first.getMonth() + 1}月` : 'この週'

  // 日付の文字：月は 1・8・15・22・29 と今日
  const showLabel = (d: Day, i: number) => {
    if (!isMonth) return true
    if (d.daysAgo === 0) return true
    const todayIndex = days.findIndex((v) => v.daysAgo === 0)
    if (todayIndex >= 0 && Math.abs(todayIndex - i) < 4) return false
    return i % 7 === 0
  }

  return (
    <div className="month">
      <Header sub={`${first.getFullYear()}年`} title={title}
        onPrev={canPrev ? () => setShift(shift - 1) : undefined}
        onNext={canNext ? () => setShift(shift + 1) : undefined} />
      <Segmented className="month-mode" options={['週', '月']} value={mode} onChange={(i) => { setMode(i); setShift(0) }} />

      <section className="month-chart">
        <svg viewBox="0 0 361 300" width="361" height="300" role="img" aria-label="1日ごとの摂取の棒グラフ">
          {Array.from({ length: maxK / 1000 + 1 }, (_, k) => (
            <g key={k}>
              <rect x="16" y={y(k * 1000)} width="329" height="1" fill="var(--line-soft)" />
              <text className="month-axis" x="2" y={y(k * 1000) + 3}>{k === 0 ? '0' : `${k}千`}</text>
            </g>
          ))}
          {days.map((d, i) => {
            let top = ZERO_Y
            return (
              <g key={i}>
                {d.meals && (
                  <>
                    {d.meals.map((m, j) => {
                      const h = m.kcal * scale
                      top -= h
                      return <rect key={j} x={x(i)} y={top} width={barW} height={h} fill={m.color} />
                    })}
                    <rect x={x(i) - 2} y={y(d.range[1])} width={barW + 4} height={(d.range[1] - d.range[0]) * scale}
                      rx="2" fill="var(--range-mark)" fillOpacity="0.28" />
                  </>
                )}
                {showLabel(d, i) && (
                  <text className={`month-day${d.daysAgo === 0 ? ' is-today' : ''}`} x={x(i) + barW / 2} y="266" textAnchor="middle">
                    {d.daysAgo === 0 ? '今日' : isMonth ? d.date.getDate() : WEEKDAYS[d.date.getDay()]}
                  </text>
                )}
              </g>
            )
          })}
          <rect x="150" y="279" width="17" height="10" rx="2" fill="var(--range-mark)" fillOpacity="0.35" />
          <text className="month-legend" x="172" y="288">目安の幅</text>
        </svg>
        {/* 日をタップするところ（棒の上に見えないボタン） */}
        {days.map((d, i) => d.meals && (
          <button key={i} className="month-hit" style={{ left: x(i) - step / 2 + barW / 2, width: step }}
            onClick={() => onOpenDay(d.daysAgo)}
            aria-label={`${d.date.getMonth() + 1}月${d.date.getDate()}日のホームを見る`} />
        ))}
      </section>

      <section className="month-summary">
        <p className="month-summary-title">{periodLabel}　{recorded.length}日間のうち</p>
        <div className="month-counts">
          <div className="is-inside"><span>目安の中</span><strong>{count.inside}日</strong></div>
          <div className="is-over"><span>目安より上</span><strong>{count.over}日</strong></div>
          <div className="is-under"><span>目安より下</span><strong>{count.under}日</strong></div>
        </div>
        <p className="month-average">
          1日の平均　摂取 {avg((d) => d.eaten).toLocaleString()} ／ 消費 {avg((d) => d.burned).toLocaleString()} kcal
        </p>
      </section>
      <p className="month-note">日をタップすると、その日のホームが見られます</p>
    </div>
  )
}
