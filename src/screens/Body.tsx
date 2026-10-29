import { useState } from 'react'
import { Header } from '../components/Header'
import { FormRow, NumberSheet, Segmented, Sheet } from '../components/form'
import { PlusMinusIcon } from '../components/icons'
import { HISTORY_DAYS, recordsFor, totals } from '../data/history'
import type { DayRecord } from '../data/today'
import { mondayOf, sameDay, type WeightEntry } from '../data/weight'
import { useSettings } from '../settings'
import './Body.css'

// 「変化」タブ：体重の週の平均（Figma 6-1）と、体重を記録（6-2）
type Props = {
  today: DayRecord[]
  weights: WeightEntry[]
  onRecordWeight: (entry: WeightEntry) => void
  onReview: () => void
}

const md = (d: Date) => `${d.getMonth() + 1}/${d.getDate()}`
const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土']

// グラフの位置（カード 361×230 の中）
const PLOT = { left: 60, right: 320, top: 30, bottom: 150 }

export function Body({ today, weights, onRecordWeight, onReview }: Props) {
  const { settings, dailyBurn, update } = useSettings()
  const [range, setRange] = useState(0) // 0 1か月・1 3か月
  const [sheet, setSheet] = useState<'weight' | 'waist' | null>(null)

  const shown = weights.slice(range === 0 ? -5 : -13)
  const last = weights[weights.length - 1]
  const prev = weights[weights.length - 2]
  const diff = prev ? Math.round((last.kg - prev.kg) * 10) / 10 : 0
  const next = new Date(mondayOf(new Date()))
  if (weights.some((w) => sameDay(mondayOf(w.date), next))) next.setDate(next.getDate() + 7)

  // 記録から予想した体重：最初の週から、摂取と消費の差（7,200kcal ≒ 1kg）を積み上げる
  const predicted = shown.map((w, i) => {
    if (i === 0) return w.kg
    const from = Math.round((Date.now() - shown[0].date.getTime()) / 86400000)
    const to = Math.round((Date.now() - w.date.getTime()) / 86400000)
    let balance = 0
    for (let d = Math.min(from, HISTORY_DAYS); d > Math.max(to, 0); d--) {
      const t = totals(recordsFor(d, today), dailyBurn)
      balance += t.eaten - t.burned
    }
    return shown[0].kg + balance / 7200
  })

  // 縦の目盛り：0.5kg きざみで4本
  const values = [...shown.map((w) => w.kg), ...predicted]
  const hi = Math.ceil(Math.max(...values) * 2) / 2
  const lo = Math.min(hi - 1.5, Math.floor(Math.min(...values) * 2) / 2)
  const ticks = Array.from({ length: Math.round((hi - lo) * 2) + 1 }, (_, i) => hi - i * 0.5)
  const y = (kg: number) => PLOT.top + ((hi - kg) / (hi - lo)) * (PLOT.bottom - PLOT.top)
  const x = (i: number) => PLOT.left + (shown.length === 1 ? 0 : (i * (PLOT.right - PLOT.left)) / (shown.length - 1))
  const line = (list: number[]) => list.map((v, i) => `${i ? 'L' : 'M'} ${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ')
  const labelEvery = shown.length > 7 ? 3 : 1

  const now = new Date()

  return (
    <div className="body">
      <Header sub={`最後の記録 ${md(last.date)}`} title="体の変化" />
      <Segmented className="body-mode" options={['1か月', '3か月']} value={range} onChange={setRange} />

      <div className="body-now">
        <p><strong>{last.kg.toFixed(1)}</strong><span>kg　週の平均</span></p>
        {prev && (
          <span className="body-diff">先週より {diff > 0 ? '+' : diff < 0 ? '−' : '±'}{Math.abs(diff).toFixed(1)} kg</span>
        )}
      </div>

      <section className="body-chart">
        <svg viewBox="0 0 361 230" width="361" height="230" role="img" aria-label="体重の週の平均のグラフ">
          {ticks.map((t) => (
            <g key={t}>
              <rect x="40" y={y(t)} width="305" height="1" fill="var(--line-soft)" />
              <text className="body-axis" x="8" y={y(t) + 3}>{t % 1 === 0 ? t.toFixed(0) : t.toFixed(1)}</text>
            </g>
          ))}
          <path d={line(predicted)} fill="none" stroke="#9aa19e" strokeWidth="2" strokeDasharray="5 5" />
          <path d={line(shown.map((w) => w.kg))} fill="none" stroke="var(--ink)" strokeWidth="2.5" strokeLinejoin="round" />
          {shown.map((w, i) => (
            <g key={i}>
              <circle cx={x(i)} cy={y(w.kg)} r="5" stroke="var(--ink)" strokeWidth="2.5"
                fill={i === shown.length - 1 ? 'var(--ink)' : '#fff'} />
              {(i % labelEvery === (shown.length - 1) % labelEvery) && (
                <text className={`body-date${i === shown.length - 1 ? ' is-last' : ''}`} x={x(i)} y="175" textAnchor="middle">{md(w.date)}</text>
              )}
            </g>
          ))}
          <circle cx="20.5" cy="200.5" r="4.5" fill="var(--ink)" />
          <text className="body-legend" x="30" y="205">体重（週の平均）</text>
          <rect x="126" y="204" width="16" height="2" fill="#9aa19e" />
          <text className="body-legend" x="148" y="205">記録から予想した体重</text>
        </svg>
      </section>

      <p className="body-note">毎日の数字ではなく週の平均で見ます。水分で1kgくらいは揺れます。</p>
      <div className="body-rows">
        <FormRow label="体重を記録（週1回）" value={`次は ${md(next)}`} onClick={() => setSheet('weight')} />
        <FormRow label="腹囲（任意）" value={settings.waist ? `${settings.waist} cm` : '入れない'} onClick={() => setSheet('waist')} />
      </div>

      {!settings.reviewed && (
        <button className="body-review" onClick={onReview}>
          <span>
            <strong>日常の消費を見直しませんか？</strong>
            <small>4週間の記録と体重から、日常の消費が少し多そうです</small>
          </span>
          <span className="body-review-arrow" aria-hidden="true">›</span>
        </button>
      )}

      {sheet === 'weight' && (
        <WeightSheet initial={last.kg} date={now} waist={settings.waist}
          onClose={() => setSheet(null)}
          onSave={(kg, waist) => {
            onRecordWeight({ date: mondayOf(now), kg })
            update({ waist, weight: Math.round(kg) })
            setSheet(null)
          }} />
      )}
      {sheet === 'waist' && (
        <NumberSheet title="腹囲（任意）" unit="cm" initial={settings.waist ?? 80} steps={[-5, -1, 1, 5]} maxDigits={3}
          confirmLabel="これにする" onClose={() => setSheet(null)}
          onConfirm={(v) => { update({ waist: v }); setSheet(null) }} />
      )}
    </div>
  )
}

// 6-2 体重を記録
function WeightSheet({ initial, date, waist, onClose, onSave }: {
  initial: number
  date: Date
  waist: number | null
  onClose: () => void
  onSave: (kg: number, waist: number | null) => void
}) {
  const [kg, setKg] = useState(Math.round(initial * 10) / 10)
  const [w, setW] = useState(waist)
  const [editWaist, setEditWaist] = useState(false)
  const step = (d: number) => setKg((v) => Math.round((v + d) * 10) / 10)

  if (editWaist) {
    return (
      <NumberSheet title="腹囲（任意）" unit="cm" initial={w ?? 80} steps={[-5, -1, 1, 5]} maxDigits={3}
        confirmLabel="これにする" onClose={() => setEditWaist(false)}
        onConfirm={(v) => { setW(v); setEditWaist(false) }} />
    )
  }
  return (
    <Sheet title="体重を記録" sub={`${date.getMonth() + 1}月${date.getDate()}日（${WEEKDAYS[date.getDay()]}）`} onClose={onClose} large>
      <div className="weight-input">
        <button className="round-button" aria-label="0.1kg へらす" onClick={() => step(-0.1)}><PlusMinusIcon /></button>
        <p><strong>{kg.toFixed(1)}</strong><span>kg</span></p>
        <button className="round-button" aria-label="0.1kg ふやす" onClick={() => step(0.1)}><PlusMinusIcon plus /></button>
      </div>
      <p className="weight-note">朝、トイレのあとに測ると揺れが小さくなります</p>
      <div className="weight-rows">
        <FormRow label="腹囲（任意）" value={w ? `${w} cm` : '入れない'} onClick={() => setEditWaist(true)} />
      </div>
      <button className="primary-button weight-save" onClick={() => onSave(kg, w)}>記録する</button>
    </Sheet>
  )
}
