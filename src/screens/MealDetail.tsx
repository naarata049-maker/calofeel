import { useState } from 'react'
import { AMOUNTS, round10 } from '../data/foods'
import { MEAL_COLOR, MEAL_LABEL, type DayRecord, type MealRecord } from '../data/today'
import { FormRow, KcalSheet, Segmented, Sheet, TimeRow } from '../components/form'
import { BowlIcon, ChevronIcon } from '../components/icons'
import { CategorySheet } from './Record'
import './MealDetail.css'

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土']

// ホームの記録で食事をタップすると開く（Figma 2-5）。行やボタンで直すと、その場で記録が変わる
type Props = {
  record: MealRecord
  // その日の記録（割合のバーに使う）
  records: DayRecord[]
  date: Date
  isToday: boolean
  // その日の消費（日常の消費＋その日の運動）
  burned: number
  onBack: () => void
  onChange: (record: MealRecord) => void
  onDelete: () => void
}

type DetailSheet = 'kcal' | 'category' | 'amount' | 'memo' | null

export function MealDetail({ record, records, date, isToday, burned, onBack, onChange, onDelete }: Props) {
  const [sheet, setSheet] = useState<DetailSheet>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const amount = record.amount ?? 1
  const update = (patch: Partial<MealRecord>) => onChange({ ...record, ...patch })

  const meals = records.filter((r): r is MealRecord => r.kind === 'meal')
  // バーの長さはその日の消費。食べた量が多い日は、食べた量に合わせる
  const total = Math.max(burned, meals.reduce((s, m) => s + m.kcal, 0))
  let left = 0
  const segments = meals.map((m) => {
    const s = { id: m.id, color: MEAL_COLOR[m.category], left, width: m.kcal / total }
    left += s.width
    return s
  })
  const mine = segments.find((s) => s.id === record.id)
  const tenths = Math.round((record.kcal / burned) * 10)
  const ratio = tenths === 0 ? '1割より少し' : `約${tenths}割`
  const dateText = `${date.getMonth() + 1}月${date.getDate()}日（${WEEKDAYS[date.getDay()]}）`

  return (
    <div className="page meal-detail">
      <header className="meal-head">
        <button className="round-button" onClick={onBack} aria-label="戻る"><ChevronIcon direction="left" /></button>
        <p className="t-date">{dateText} {record.time}</p>
        <h1>{record.name}</h1>
      </header>
      <div className="meal-body">
        {record.photo
          ? <img className="meal-photo" src={record.photo} alt="" />
          : <div className="meal-photo is-empty"><BowlIcon /></div>}

        <section className="meal-card">
          <div className="meal-card-top">
            <p className="meal-kcal"><strong>{record.kcal.toLocaleString()}</strong><span>kcal</span></p>
            <p className="meal-ratio">{isToday ? '今日' : 'この日'}の消費 {burned.toLocaleString()} kcal の {ratio}</p>
          </div>
          <div className="meal-bar" aria-hidden="true">
            {segments.map((s) => (
              <span key={s.id} className={s.id === record.id ? 'is-mine' : undefined}
                style={{ left: `${s.left * 100}%`, width: `${s.width * 100}%`, background: s.color }} />
            ))}
          </div>
          {mine && <p className="meal-bar-label" style={{ left: `${mine.left * 100}%` }}>この食事</p>}
        </section>

        <div className="meal-rows">
          <FormRow label="区分" value={MEAL_LABEL[record.category]} dot={MEAL_COLOR[record.category]}
            onClick={() => setSheet('category')} />
          <FormRow label="量" value={AMOUNTS[amount].label} onClick={() => setSheet('amount')} />
          <TimeRow time={record.time} onChange={(time) => update({ time })} />
          <FormRow label="メモ" value={record.memo || 'なし'} onClick={() => setSheet('memo')} />
        </div>

        <div className="meal-actions">
          <button className="outline-button" onClick={() => setSheet('kcal')}>直す</button>
          <button className={`text-button${confirmDelete ? ' is-danger' : ''}`}
            onClick={() => (confirmDelete ? onDelete() : setConfirmDelete(true))}>
            {confirmDelete ? 'もう一度押すと消します' : 'この記録を消す'}
          </button>
        </div>
      </div>

      {sheet === 'kcal' && (
        <KcalSheet title="カロリーを入力" sub={`${record.name}・${AMOUNTS[amount].label}`}
          initial={record.kcal} confirmLabel="決定" onClose={() => setSheet(null)}
          onConfirm={(kcal) => { update({ kcal }); setSheet(null) }} />
      )}
      {sheet === 'category' && (
        <CategorySheet initial={record.category} onClose={() => setSheet(null)}
          onConfirm={(category) => { update({ category }); setSheet(null) }} />
      )}
      {sheet === 'amount' && (
        <AmountSheet initial={amount} onClose={() => setSheet(null)}
          onConfirm={(next) => {
            // 量を変えたら、カロリーも同じ割合で変える
            update({ amount: next, kcal: round10(record.kcal * AMOUNTS[next].rate / AMOUNTS[amount].rate) })
            setSheet(null)
          }} />
      )}
      {sheet === 'memo' && (
        <MemoSheet initial={record.memo ?? ''} onClose={() => setSheet(null)}
          onConfirm={(memo) => { update({ memo }); setSheet(null) }} />
      )}
    </div>
  )
}

function AmountSheet({ initial, onClose, onConfirm }: {
  initial: number
  onClose: () => void
  onConfirm: (amount: number) => void
}) {
  const [value, setValue] = useState(initial)
  return (
    <Sheet title="量" onClose={onClose}>
      <Segmented className="sheet-segment" options={AMOUNTS.map((a) => a.label)} value={value} onChange={setValue} />
      <p className="sheet-note">量を変えると、カロリーも同じ割合で変わります。</p>
      <button className="primary-button sheet-button" onClick={() => onConfirm(value)}>これにする</button>
    </Sheet>
  )
}

function MemoSheet({ initial, onClose, onConfirm }: {
  initial: string
  onClose: () => void
  onConfirm: (memo: string) => void
}) {
  const [text, setText] = useState(initial)
  return (
    <Sheet title="メモ" onClose={onClose} keyboard>
      <div className="name-input is-sheet">
        <input value={text} autoFocus aria-label="メモ" placeholder="例：半分残した" enterKeyHint="done"
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') onConfirm(text.trim()) }} />
        {text && <button className="clear-button" onClick={() => setText('')} aria-label="消す">×</button>}
      </div>
      <button className="primary-button sheet-button" onClick={() => onConfirm(text.trim())}>これにする</button>
    </Sheet>
  )
}
