import { useEffect, useState, type ReactNode } from 'react'
import { BackspaceIcon, PencilIcon } from './icons'
import './form.css'

// 記録する画面で使う部品（Figma R1〜R4 のパーツ）

// 切り替え（食事/運動、少なめ/ふつう/大盛り など）
export function Segmented({ options, value, onChange, className = '' }: {
  options: string[]
  value: number
  onChange: (i: number) => void
  className?: string
}) {
  return (
    <div className={`segmented ${className}`} role="tablist">
      {options.map((label, i) => (
        <button key={label} role="tab" aria-selected={i === value}
          className={i === value ? 'is-selected' : undefined} onClick={() => onChange(i)}>
          {label}
        </button>
      ))}
    </div>
  )
}

export function Chip({ selected, onClick, children }: { selected?: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button className={`chip${selected ? ' is-selected' : ''}`} aria-pressed={selected} onClick={onClick}>
      {children}
    </button>
  )
}

export function InputButton({ onClick, label = '入力' }: { onClick: () => void; label?: string }) {
  return (
    <button className="input-button" onClick={onClick}>
      <PencilIcon />
      {label}
    </button>
  )
}

// カロリーのカード（推定の数字と「入力」ボタン）
export function KcalCard({ caption, kcal, note, onEdit, icon, exercise }: {
  caption: ReactNode
  kcal: number | null
  note: string
  onEdit: () => void
  icon?: ReactNode
  exercise?: boolean
}) {
  return (
    <section className={`kcal-card${icon ? ' has-icon' : ''}`}>
      <p className="kcal-card-caption">{caption}</p>
      <div className="kcal-card-main">
        {icon && <span className="kcal-card-icon">{icon}</span>}
        <p className={`kcal-card-number${exercise ? ' is-exercise' : ''}`}>
          {kcal === null ? '—' : `${exercise ? '+' : ''}${kcal.toLocaleString()}`}
          <span>kcal</span>
        </p>
        <InputButton onClick={onEdit} />
      </div>
      <p className="kcal-card-note">{note}</p>
    </section>
  )
}

// 「時刻」「区分」などの行（右に ›）
export function FormRow({ label, value, dot, onClick, children, arrow = true }: {
  label: string
  value: string
  dot?: string
  onClick?: () => void
  children?: ReactNode
  arrow?: boolean
}) {
  return (
    <div className="form-row">
      <button className="form-row-button" onClick={onClick}>
        {dot && <span className="form-row-dot" style={{ background: dot }} />}
        <span className="form-row-label">{label}</span>
        <span className="form-row-value">{value}</span>
        {arrow && <span className="form-row-arrow" aria-hidden="true">›</span>}
      </button>
      {children}
    </div>
  )
}

// 時刻の行：見えない時刻の入力欄を行の上にかぶせ、タップするとスマホの時刻の選び方が出る
export function TimeRow({ time, note, onChange }: { time: string; note?: string; onChange: (t: string) => void }) {
  const [h, m] = time.split(':')
  return (
    <FormRow label="時刻" value={note ? `${time}（${note}）` : time}>
      <input className="form-row-time" type="time" aria-label="時刻"
        value={`${h.padStart(2, '0')}:${m}`}
        onClick={(e) => {
          // PC のブラウザは欄をクリックしただけでは選び方が出ないので出す
          try { e.currentTarget.showPicker() } catch { /* iPhone はタップで出る */ }
        }}
        onChange={(e) => {
          if (!e.target.value) return
          const [hh, mm] = e.target.value.split(':')
          onChange(`${Number(hh)}:${mm}`)
        }} />
    </FormRow>
  )
}

// 下から出るシート。外をタップすると閉じる
export function Sheet({ title, sub, onClose, children, large, keyboard }: {
  title: string
  sub?: string
  onClose: () => void
  children: ReactNode
  large?: boolean
  // 文字を打つシート：スマホのキーボードの上に出す
  keyboard?: boolean
}) {
  const visible = useVisibleArea(keyboard)
  return (
    <div className={`sheet-layer${visible ? ' is-keyboard' : ''}`}
      style={visible ? { top: visible.top, height: visible.height } : undefined}>
      <button className="sheet-backdrop" aria-label="閉じる" onClick={onClose} />
      <section className="sheet" role="dialog" aria-label={title}>
        <span className="sheet-handle" />
        <h2 className={`sheet-title${large ? ' is-large' : ''}`}>{title}</h2>
        {sub && <p className="sheet-sub">{sub}</p>}
        {children}
      </section>
    </div>
  )
}

// iPhone の Safari ではキーボードが出ると見えている範囲が狭くなり、画面も上へずれる。
// キーボードが出ているあいだは、シートを「いま見えている範囲」の下にぴったり置く
function useVisibleArea(enabled?: boolean) {
  const [area, setArea] = useState<{ top: number; height: number } | null>(null)
  useEffect(() => {
    const vv = window.visualViewport
    if (!enabled || !vv) return
    const update = () => {
      const keyboardOpen = window.innerHeight - vv.height > 80
      setArea(keyboardOpen ? { top: vv.offsetTop, height: vv.height } : null)
    }
    vv.addEventListener('resize', update)
    vv.addEventListener('scroll', update)
    update()
    return () => {
      vv.removeEventListener('resize', update)
      vv.removeEventListener('scroll', update)
    }
  }, [enabled])
  return area
}

// 数字キーで打つシート（カロリー R2b・R3b、年齢・身長 など）
export function NumberSheet({ title, sub, initial, confirmLabel, unit, steps = [-100, -50, 50, 100], maxDigits = 4, exercise, onClose, onConfirm }: {
  title: string
  sub?: string
  initial: number
  confirmLabel: string
  unit: string
  steps?: number[]
  maxDigits?: number
  exercise?: boolean
  onClose: () => void
  onConfirm: (value: number) => void
}) {
  const [text, setText] = useState(String(initial))
  const value = Number(text) || 0
  const max = 10 ** maxDigits - 1
  const set = (n: number) => setText(String(Math.max(0, Math.min(max, n))))
  const press = (key: string) => {
    if (key === 'back') setText((t) => t.slice(0, -1))
    else setText((t) => (t === '0' ? key : (t + key).slice(0, maxDigits)))
  }

  return (
    <Sheet title={title} sub={sub} onClose={onClose} large>
      <div className="kcal-input" aria-live="polite">
        <span className={`kcal-input-number${exercise ? ' is-exercise' : ''}`}>{text}</span>
        <span className="kcal-input-caret" />
        <span className="kcal-input-unit">{unit}</span>
      </div>
      <div className="kcal-steps">
        {steps.map((d) => (
          <button key={d} onClick={() => set(value + d)}>{d > 0 ? `+${d}` : `−${-d}`}</button>
        ))}
      </div>
      <button className="primary-button sheet-confirm" disabled={value === 0} onClick={() => onConfirm(value)}>
        {confirmLabel}
      </button>
      <div className="keypad">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'back'].map((k, i) =>
          k === '' ? <span key={i} /> : (
            <button key={i} onClick={() => press(k)} aria-label={k === 'back' ? '1文字消す' : k}>
              {k === 'back' ? <BackspaceIcon /> : k}
            </button>
          ))}
      </div>
    </Sheet>
  )
}

export function KcalSheet(props: Omit<Parameters<typeof NumberSheet>[0], 'unit'>) {
  return <NumberSheet {...props} unit="kcal" />
}
