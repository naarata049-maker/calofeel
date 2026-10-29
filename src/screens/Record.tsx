import { useEffect, useRef, useState, type ReactNode } from 'react'
import {
  AMOUNTS, BODY_WEIGHT, CATEGORIES, EXERCISES, FOODS, PHOTO_EXTRAS, PHOTO_GUESSES, STRENGTHS,
  categoryAt, round10, timeOf,
} from '../data/foods'
import { MEAL_COLOR, MEAL_LABEL, type DayRecord, type MealCategory, type NewRecord } from '../data/today'
import { Chip, FormRow, KcalCard, KcalSheet, Segmented, Sheet, TimeRow } from '../components/form'
import { PageHeader } from '../components/PageHeader'
import { CheckIcon, ExerciseIcon, FinderFrame, PencilIcon, PlusMinusIcon } from '../components/icons'
import samplePhoto from '../assets/photos/ramen.jpg'
import './Record.css'

// ＋ から開く「記録する」（Figma R1〜R4）
type Props = {
  // 今日の消費（日常の消費＋今日の運動）。カロリーの「約○割」に使う
  burned: number
  onClose: () => void
  onSave: (record: DayRecord) => void
}

type Screen = 'camera' | 'photo' | 'name' | 'exercise'

type Photo = { src: string; time: string; note: string }

export function Record({ burned, onClose, onSave }: Props) {
  const [screen, setScreen] = useState<Screen>('camera')
  const [photo, setPhoto] = useState<Photo | null>(null)

  const save = (record: NewRecord) => onSave({ ...record, id: `n${Date.now()}` })
  const toMode = (i: number) => setScreen(i === 0 ? 'camera' : 'exercise')

  return (
    <div className="record">
      {screen === 'camera' && (
        <CameraScreen onClose={onClose} onMode={toMode} onManual={() => setScreen('name')}
          onPhoto={(p) => { setPhoto(p); setScreen('photo') }} />
      )}
      {screen === 'photo' && photo && (
        <MealForm key="photo" photo={photo} burned={burned} onBack={() => setScreen('camera')} onSave={save} />
      )}
      {screen === 'name' && (
        <MealForm key="name" burned={burned} onBack={onClose} onMode={toMode} onSave={save} />
      )}
      {screen === 'exercise' && (
        <ExerciseForm burned={burned} onClose={onClose} onMode={toMode} onSave={save} />
      )}
    </div>
  )
}

function ModeSwitch({ value, onChange }: { value: number; onChange: (i: number) => void }) {
  return <Segmented className="record-mode" options={['食事', '運動']} value={value} onChange={onChange} />
}

function Heading({ children, side }: { children: ReactNode; side?: ReactNode }) {
  return (
    <div className="record-heading">
      <h2>{children}</h2>
      {side}
    </div>
  )
}

function ratioNote(kcal: number | null, burned: number) {
  if (kcal === null) return `今日の消費 ${burned.toLocaleString()} kcal`
  const tenths = Math.round((kcal / burned) * 10)
  const ratio = tenths === 0 ? '1割より少し' : `約${tenths}割`
  return `今日の消費 ${burned.toLocaleString()} kcal の ${ratio}`
}

/* ---------- R1 撮る ---------- */

function CameraScreen({ onClose, onMode, onManual, onPhoto }: {
  onClose: () => void
  onMode: (i: number) => void
  onManual: () => void
  onPhoto: (p: Photo) => void
}) {
  const video = useRef<HTMLVideoElement>(null)
  const file = useRef<HTMLInputElement>(null)
  // カメラが使えないとき（許可しなかった・PC など）は見本の写真を使う
  const [live, setLive] = useState(false)

  useEffect(() => {
    let stream: MediaStream | null = null
    let stopped = false
    navigator.mediaDevices?.getUserMedia({ video: { facingMode: 'environment' }, audio: false })
      .then((s) => {
        if (stopped) { s.getTracks().forEach((t) => t.stop()); return }
        stream = s
        if (video.current) {
          video.current.srcObject = s
          video.current.play().catch(() => {})
        }
        setLive(true)
      })
      .catch(() => setLive(false))
    return () => {
      stopped = true
      stream?.getTracks().forEach((t) => t.stop())
    }
  }, [])

  const shoot = () => {
    const v = video.current
    if (!live || !v || !v.videoWidth) {
      onPhoto({ src: samplePhoto, time: timeOf(new Date()), note: 'いま' })
      return
    }
    const canvas = document.createElement('canvas')
    canvas.width = v.videoWidth
    canvas.height = v.videoHeight
    canvas.getContext('2d')?.drawImage(v, 0, 0)
    canvas.toBlob((blob) => {
      if (blob) onPhoto({ src: URL.createObjectURL(blob), time: timeOf(new Date()), note: 'いま' })
    }, 'image/jpeg', 0.85)
  }

  return (
    <>
      <PageHeader title="記録する" onClose={onClose} />
      <ModeSwitch value={0} onChange={onMode} />
      <div className="camera">
        <video ref={video} className="camera-view" playsInline muted hidden={!live} />
        {!live && <img className="camera-view" src={samplePhoto} alt="" />}
        <div className="camera-shade" />
        <div className="camera-frame"><FinderFrame /></div>
        <p className="camera-guide">料理が枠に入るように撮ってください</p>
      </div>
      <div className="camera-actions">
        <button className="camera-library" onClick={() => file.current?.click()}>
          <img src={samplePhoto} alt="" />
          <span>写真から</span>
        </button>
        <input ref={file} type="file" accept="image/*" hidden
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) onPhoto({ src: URL.createObjectURL(f), time: timeOf(new Date(f.lastModified)), note: '写真の時刻' })
          }} />
        <button className="shutter" onClick={shoot} aria-label="撮る"><span /></button>
        <button className="chip camera-manual" onClick={onManual}>手動で入力</button>
      </div>
    </>
  )
}

/* ---------- R2 推定結果／R4 手で入力 ---------- */

type MealSheet = 'kcal' | 'name' | 'category' | null

// いま書いた名前（このページを開いているあいだだけ覚える）
const recentNames: string[] = []

function MealForm({ photo, burned, onBack, onMode, onSave }: {
  photo?: Photo
  burned: number
  onBack: () => void
  onMode?: (i: number) => void
  onSave: (r: NewRecord) => void
}) {
  const [now] = useState(() => timeOf(new Date()))
  // 写真から
  const [guess, setGuess] = useState(0)
  const [extras, setExtras] = useState<number[]>([])
  const [customName, setCustomName] = useState<string | null>(null)
  // 料理名から
  const [query, setQuery] = useState('')
  const [picked, setPicked] = useState<string | null>(null)
  // どちらも
  const [amount, setAmount] = useState(1)
  const [manualKcal, setManualKcal] = useState<number | null>(null)
  const [time, setTime] = useState(photo?.time ?? now)
  const [timeNote, setTimeNote] = useState<string | undefined>(photo?.note ?? 'いま')
  const [category, setCategory] = useState<MealCategory>(() => categoryAt(photo?.time ?? now))
  const [sheet, setSheet] = useState<MealSheet>(null)

  const candidates = query.trim() ? FOODS.filter((f) => f.name.includes(query.trim())).slice(0, 3) : []
  const food = photo ? null : (candidates.find((f) => f.name === picked) ?? candidates[0] ?? null)

  let name: string
  let base: number | null
  if (photo) {
    const g = PHOTO_GUESSES[guess]
    name = customName ?? [g.name, ...extras.map((i) => PHOTO_EXTRAS[i].name)].join('＋')
    base = g.kcal + extras.reduce((s, i) => s + PHOTO_EXTRAS[i].kcal, 0)
  } else {
    name = food?.name ?? query.trim()
    base = food?.kcal ?? null
  }
  const estimate = base === null ? null : round10(base * AMOUNTS[amount].rate)
  const kcal = manualKcal ?? estimate
  const source = photo ? '写真から推定' : '料理名から推定'

  const caption = manualKcal !== null ? (
    <>
      <span className="badge">自分で直しました</span>
      {estimate !== null && <span>推定 {estimate.toLocaleString()}</span>}
    </>
  ) : (estimate === null ? '料理名を書くと推定します' : source)

  const save = () => {
    if (!kcal || !name) return
    onSave({ kind: 'meal', time, category, name, kcal, photo: photo?.src, amount })
  }

  return (
    <>
      {photo
        ? <PageHeader title="これでしたか？" onBack={onBack} />
        : <PageHeader title="記録する" onClose={onBack} />}
      <div className="record-body">
        {photo ? (
          <>
            <img className="record-photo" src={photo.src} alt="撮った写真" />
            <Heading side={
              <>
                <span className="record-heading-note">写真から推定</span>
                <button className="name-button" onClick={() => setSheet('name')}><PencilIcon />名前を入力</button>
              </>
            }>料理</Heading>
            <div className="chips record-chips">
              {PHOTO_GUESSES.map((g, i) => (
                <Chip key={g.name} selected={i === guess} onClick={() => { setGuess(i); setCustomName(null) }}>{g.name}</Chip>
              ))}
              {PHOTO_EXTRAS.map((x, i) => (
                <Chip key={x.name} selected={extras.includes(i)}
                  onClick={() => setExtras((e) => (e.includes(i) ? e.filter((v) => v !== i) : [...e, i]))}>
                  ＋ {x.name}
                </Chip>
              ))}
            </div>
            {customName && <p className="record-custom-name">記録する名前：{customName}</p>}
          </>
        ) : (
          <>
            <ModeSwitch value={0} onChange={(i) => onMode?.(i)} />
            <Heading side={<span className="record-heading-note is-right">写真なしで入力</span>}>料理名</Heading>
            <div className="name-input">
              <input value={query} placeholder="例：カツ丼、サラダ" aria-label="料理名"
                onChange={(e) => { setQuery(e.target.value); setPicked(null); setManualKcal(null) }} />
              {query && <button className="clear-button" onClick={() => setQuery('')} aria-label="消す">×</button>}
            </div>
            {candidates.length > 0 && (
              <ul className="candidates">
                {candidates.map((f) => (
                  <li key={f.name}>
                    <button className={f === food ? 'is-selected' : undefined}
                      onClick={() => { setPicked(f.name); setManualKcal(null) }}>
                      <span className="candidate-check">{f === food && <CheckIcon />}</span>
                      <span className="candidate-name">{f.name}</span>
                      <span className="candidate-kcal">約 {f.kcal.toLocaleString()} kcal</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {query.trim() && candidates.length === 0 && (
              <p className="candidates-empty">候補がありません。カロリーは「入力」から入れられます。</p>
            )}
          </>
        )}

        <Heading>量</Heading>
        <Segmented className="record-segment" options={AMOUNTS.map((a) => a.label)} value={amount}
          onChange={(i) => { setAmount(i); setManualKcal(null) }} />
        <div className="record-card">
          <KcalCard caption={caption} kcal={kcal} note={ratioNote(kcal, burned)} onEdit={() => setSheet('kcal')} />
        </div>
        <div className="record-rows">
          <TimeRow time={time} note={timeNote} onChange={(t) => { setTime(t); setTimeNote(undefined) }} />
          <FormRow label="区分" value={MEAL_LABEL[category]} dot={MEAL_COLOR[category]} onClick={() => setSheet('category')} />
        </div>
      </div>
      <footer className="record-footer">
        <button className="primary-button" disabled={!kcal || !name} onClick={save}>記録する</button>
      </footer>

      {sheet === 'kcal' && (
        <KcalSheet title="カロリーを入力"
          sub={estimate === null ? name : `推定 ${estimate.toLocaleString()} kcal（${name}・${AMOUNTS[amount].label}）`}
          initial={kcal ?? 0} confirmLabel="決定" onClose={() => setSheet(null)}
          onConfirm={(v) => { setManualKcal(v === estimate ? null : v); setSheet(null) }} />
      )}
      {sheet === 'name' && (
        <NameSheet initial={name} guessName={PHOTO_GUESSES[guess].name} onClose={() => setSheet(null)}
          onConfirm={(v) => { setCustomName(v); setSheet(null) }} />
      )}
      {sheet === 'category' && (
        <CategorySheet initial={category} onClose={() => setSheet(null)}
          onConfirm={(c) => { setCategory(c); setSheet(null) }} />
      )}
    </>
  )
}

// R2e 料理の名前を書く
function NameSheet({ initial, guessName, onClose, onConfirm }: {
  initial: string
  guessName: string
  onClose: () => void
  onConfirm: (name: string) => void
}) {
  const [text, setText] = useState(initial)
  const recent = recentNames.length ? recentNames.slice(0, 4) : ['家の醤油ラーメン', '味玉ラーメン']
  const confirm = () => {
    const v = text.trim()
    if (!v) return
    if (!recentNames.includes(v)) recentNames.unshift(v)
    onConfirm(v)
  }
  return (
    <Sheet title="料理の名前" sub={`写真から推定：${guessName}`} onClose={onClose} keyboard>
      <div className="name-input is-sheet">
        <input value={text} autoFocus aria-label="料理の名前" enterKeyHint="done"
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') confirm() }} />
        {text && <button className="clear-button" onClick={() => setText('')} aria-label="消す">×</button>}
      </div>
      <p className="sheet-note">名前だけが変わります。カロリーを変えたいときは「入力」から。</p>
      <p className="sheet-label">最近書いた名前</p>
      <div className="chips sheet-chips">
        {recent.map((n) => <Chip key={n} onClick={() => setText(n)}>{n}</Chip>)}
      </div>
      <button className="primary-button sheet-button" disabled={!text.trim()} onClick={confirm}>これにする</button>
    </Sheet>
  )
}

// R2f 区分を選ぶ
export function CategorySheet({ initial, onClose, onConfirm }: {
  initial: MealCategory
  onClose: () => void
  onConfirm: (c: MealCategory) => void
}) {
  const [value, setValue] = useState(initial)
  return (
    <Sheet title="区分" onClose={onClose}>
      <h3 className="sheet-heading">区分</h3>
      <div className="chips sheet-chips is-category">
        {CATEGORIES.map((c) => <Chip key={c} selected={c === value} onClick={() => setValue(c)}>{MEAL_LABEL[c]}</Chip>)}
      </div>
      <p className="sheet-note is-category">メーターやグラフ、記録の点は区分の色になります。</p>
      <button className="primary-button sheet-button is-category" onClick={() => onConfirm(value)}>これにする</button>
    </Sheet>
  )
}

/* ---------- R3 運動 ---------- */

function ExerciseForm({ burned, onClose, onMode, onSave }: {
  burned: number
  onClose: () => void
  onMode: (i: number) => void
  onSave: (r: NewRecord) => void
}) {
  const [activity, setActivity] = useState(0)
  const [minutes, setMinutes] = useState(30)
  const [strength, setStrength] = useState(1)
  const [manualKcal, setManualKcal] = useState<number | null>(null)
  const [time, setTime] = useState(() => timeOf(new Date()))
  const [editing, setEditing] = useState(false)

  const ex = EXERCISES[activity]
  const estimate = round10(ex.perMin * minutes * STRENGTHS[strength].rate * (BODY_WEIGHT / 66))
  const kcal = manualKcal ?? estimate
  const label = `${ex.name} ${minutes}分`
  const reset = <T,>(set: (v: T) => void) => (v: T) => { set(v); setManualKcal(null) }

  const caption = manualKcal !== null ? (
    <>
      <span className="badge">自分で直しました</span>
      <span>推定 {estimate.toLocaleString()}</span>
    </>
  ) : `強さ × 時間 × 体重 ${BODY_WEIGHT}kg から推定`

  return (
    <>
      <PageHeader title="記録する" onClose={onClose} />
      <div className="record-body">
        <ModeSwitch value={1} onChange={onMode} />
        <Heading>何をしましたか？</Heading>
        <div className="chips record-chips">
          {EXERCISES.map((e, i) => (
            <Chip key={e.name} selected={i === activity} onClick={() => reset(setActivity)(i)}>{e.name}</Chip>
          ))}
        </div>
        <Heading>時間</Heading>
        <div className="minutes">
          <button className="round-button" aria-label="5分へらす" disabled={minutes <= 5}
            onClick={() => reset(setMinutes)(Math.max(5, minutes - 5))}><PlusMinusIcon /></button>
          <p><strong>{minutes}</strong><span>分</span></p>
          <button className="round-button" aria-label="5分ふやす"
            onClick={() => reset(setMinutes)(Math.min(300, minutes + 5))}><PlusMinusIcon plus /></button>
        </div>
        <Heading>強さ</Heading>
        <Segmented className="record-segment" options={STRENGTHS.map((s) => s.label)} value={strength}
          onChange={reset(setStrength)} />
        <div className="record-card is-exercise">
          <KcalCard caption={caption} kcal={kcal} exercise icon={<ExerciseIcon />}
            note={`運動の消費 +${kcal.toLocaleString()}。今日の消費は ${burned.toLocaleString()} → ${(burned + kcal).toLocaleString()} kcal`}
            onEdit={() => setEditing(true)} />
        </div>
        <div className="record-rows">
          <TimeRow time={time} onChange={setTime} />
        </div>
        <p className="record-note">通学や買い物などの普段の動きは、日常の消費に最初から入っています。ここには運動したときだけ入れます。</p>
      </div>
      <footer className="record-footer">
        <button className="primary-button" disabled={!kcal}
          onClick={() => onSave({ kind: 'exercise', time, name: label, kcal })}>記録する</button>
      </footer>

      {editing && (
        <KcalSheet title="運動のカロリーを直す" exercise
          sub={`推定 ${estimate.toLocaleString()} kcal（${label}・${STRENGTHS[strength].label}）`}
          initial={kcal} confirmLabel="これにする" onClose={() => setEditing(false)}
          onConfirm={(v) => { setManualKcal(v === estimate ? null : v); setEditing(false) }} />
      )}
    </>
  )
}
