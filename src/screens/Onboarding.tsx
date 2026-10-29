import { useState } from 'react'
import { Chip, NumberSheet, Segmented, Sheet } from '../components/form'
import { AppIcon, ChevronIcon } from '../components/icons'
import {
  ACTIVITIES, GOALS, SEX_LABEL, bmiOf, bmrOf, dailyBurnOf, formatRange, rangeOf,
  type Goal, type Settings, type Sex,
} from '../data/settings'
import { useSettings } from '../settings'
import './Onboarding.css'

// ようこそ（Figma 1-1〜1-5）。マイページから「目的」「体のこと」だけを開いて変えることもできる
export type OnboardingStart = 'all' | 'goal' | 'body'

const STEPS = ['welcome', 'goal', 'body', 'burn', 'records'] as const
type Step = typeof STEPS[number]

export function Onboarding({ start, onDone }: { start: OnboardingStart; onDone: () => void }) {
  const { settings, update } = useSettings()
  // 決めている途中の値（最後に「はじめる」か「これにする」でまとめて残す）
  const [draft, setDraft] = useState<Settings>(settings)
  const [step, setStep] = useState<Step>(start === 'all' ? 'welcome' : start)
  const editOnly = start !== 'all'
  const index = STEPS.indexOf(step)
  const set = (patch: Partial<Settings>) => setDraft((d) => ({ ...d, ...patch }))

  const finish = () => {
    update({ ...draft, onboarded: true })
    onDone()
  }
  const next = () => (editOnly || step === 'records' ? finish() : setStep(STEPS[index + 1]))
  const back = () => (editOnly ? onDone() : setStep(STEPS[index - 1]))

  if (step === 'welcome') {
    return (
      <div className="onboarding is-welcome">
        <div className="welcome-logo">
          <AppIcon size={49} />
          <span className="logo">calofeel</span>
        </div>
        <h1 className="welcome-title">カロリーを、数字から感覚へ。</h1>
        <p className="welcome-lead">1日の中の割合で、食べ物や運動と比べながら、<br />カロリーを感じるアプリです。</p>
        <footer className="onboarding-footer">
          <button className="primary-button" onClick={() => setStep('goal')}>はじめる</button>
        </footer>
      </div>
    )
  }

  const burn = dailyBurnOf(draft)
  return (
    <div className="onboarding">
      <header className="onboarding-header">
        <button className="onboarding-back" onClick={back} aria-label="戻る"><ChevronIcon direction="left" /></button>
        {!editOnly && (
          <>
            <div className="onboarding-progress">
              {[1, 2, 3, 4].map((i) => <span key={i} className={i <= index ? 'is-done' : undefined} />)}
            </div>
            <span className="onboarding-count">{index} / 4</span>
          </>
        )}
      </header>
      <div className="onboarding-body">
        {step === 'goal' && <GoalStep draft={draft} set={set} />}
        {step === 'body' && <BodyStep draft={draft} set={set} />}
        {step === 'burn' && (
          <>
            <h1 className="onboarding-title">あなたの日常の消費</h1>
            <p className="onboarding-lead">普段の生活で、何もしなくても消費する分です。</p>
            <section className="burn-card">
              <p className="burn-card-caption">1日あたり</p>
              <p className="burn-card-number"><strong>約 {burn.toLocaleString()}</strong><span>kcal</span></p>
              <p className="burn-card-formula">
                基礎代謝 約{bmrOf(draft).toLocaleString()} × 普段の動き {ACTIVITIES[draft.activity].rate}（{ACTIVITIES[draft.activity].label}）
              </p>
              <p className="burn-card-range">
                <span className="burn-chip">目安 {formatRange(rangeOf(draft, burn))} kcal</span>
                <span>{GOALS[draft.goal].label}</span>
              </p>
            </section>
            <p className="onboarding-note is-burn">計算には数百kcalの誤差があります。2〜4週間の記録と体重の変化から、少しずつあなたに合わせていきます。</p>
          </>
        )}
        {step === 'records' && (
          <>
            <h1 className="onboarding-title">記録するのは、<br />食べたものと運動だけ</h1>
            <div className="sum">
              <SumCard title="日常の消費" sub="自動で入る" value={burn.toLocaleString()} />
              <span className="sum-sign">＋</span>
              <SumCard title="運動の消費" sub="したときだけ記録" value="+150" exercise />
              <span className="sum-sign is-equal">＝</span>
              <SumCard title="今日の消費" sub="メーターの長さ" value={(burn + 150).toLocaleString()} />
            </div>
            <p className="onboarding-note is-records">基礎代謝と普段の動きは、最初から入っています。運動したときだけ記録すると、メーターの枠がその分のびます。</p>
          </>
        )}
      </div>
      <footer className="onboarding-footer">
        <button className="primary-button" onClick={next}>
          {editOnly ? 'これにする' : step === 'records' ? 'はじめる' : '次へ'}
        </button>
      </footer>
    </div>
  )
}

function SumCard({ title, sub, value, exercise }: { title: string; sub: string; value: string; exercise?: boolean }) {
  return (
    <section className="sum-card">
      <span className="sum-card-text"><strong>{title}</strong><small>{sub}</small></span>
      <span className={`sum-card-value${exercise ? ' is-exercise' : ''}`}><strong>{value}</strong>kcal</span>
    </section>
  )
}

function GoalStep({ draft, set }: { draft: Settings; set: (p: Partial<Settings>) => void }) {
  // BMI が目安（18.5）を下回るときは「減らす」を出さない
  const goals = (Object.keys(GOALS) as Goal[]).filter((g) => g !== 'lose' || bmiOf(draft) >= 18.5)
  return (
    <>
      <h1 className="onboarding-title">どうなりたいですか？</h1>
      <p className="onboarding-lead">目的にあわせて、1日の目安の幅を決めます。</p>
      <div className="goal-list" role="radiogroup">
        {goals.map((g) => (
          <button key={g} role="radio" aria-checked={draft.goal === g}
            className={`goal${draft.goal === g ? ' is-selected' : ''}`} onClick={() => set({ goal: g })}>
            <span className="goal-text"><strong>{GOALS[g].label}</strong><small>{GOALS[g].sub}</small></span>
            <span className="goal-radio" aria-hidden="true">
              {draft.goal === g && (
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.8 6.8L9 1" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              )}
            </span>
          </button>
        ))}
      </div>
      <p className="onboarding-note">BMIが目安を下回る場合は「減らす」は出しません。あとからマイページで変えられます。</p>
    </>
  )
}

type BodySheet = 'age' | 'sex' | 'height' | 'weight' | null

function BodyStep({ draft, set }: { draft: Settings; set: (p: Partial<Settings>) => void }) {
  const [sheet, setSheet] = useState<BodySheet>(null)
  const [sex, setSex] = useState<Sex>(draft.sex)
  const rows: { key: Exclude<BodySheet, null>; label: string; value: string }[] = [
    { key: 'age', label: '年齢', value: `${draft.age} 歳` },
    { key: 'sex', label: '性別', value: SEX_LABEL[draft.sex] },
    { key: 'height', label: '身長', value: `${draft.height} cm` },
    { key: 'weight', label: '体重', value: `${draft.weight} kg` },
  ]
  const numberSheet = (key: 'age' | 'height' | 'weight', title: string, unit: string) => (
    <NumberSheet title={title} unit={unit} initial={draft[key]} steps={[-5, -1, 1, 5]} maxDigits={3}
      confirmLabel="これにする" onClose={() => setSheet(null)}
      onConfirm={(v) => { set({ [key]: v }); setSheet(null) }} />
  )
  return (
    <>
      <h1 className="onboarding-title">体のことを教えてください</h1>
      <p className="onboarding-lead">日常の消費の計算にだけ使います。</p>
      <div className="body-list">
        {rows.map((r) => (
          <button key={r.key} className="body-row" onClick={() => { setSex(draft.sex); setSheet(r.key) }}>
            <span>{r.label}</span>
            <span className="body-row-value">{r.value}<span aria-hidden="true">›</span></span>
          </button>
        ))}
      </div>
      <h2 className="onboarding-heading">普段の動き</h2>
      <Segmented className="onboarding-segment" options={ACTIVITIES.map((a) => a.label)} value={draft.activity}
        onChange={(i) => set({ activity: i })} />
      <p className="onboarding-note is-body">通学・通勤・家事などの普段の動きは、ここで決めた分が毎日自動で入ります。運動はしたときだけ記録します。</p>

      {sheet === 'age' && numberSheet('age', '年齢', '歳')}
      {sheet === 'height' && numberSheet('height', '身長', 'cm')}
      {sheet === 'weight' && numberSheet('weight', '体重', 'kg')}
      {sheet === 'sex' && (
        <Sheet title="性別" onClose={() => setSheet(null)}>
          <div className="chips sheet-chips is-sex">
            {(Object.keys(SEX_LABEL) as Sex[]).map((s) => (
              <Chip key={s} selected={s === sex} onClick={() => setSex(s)}>{SEX_LABEL[s]}</Chip>
            ))}
          </div>
          <p className="sheet-note">基礎代謝の計算にだけ使います。</p>
          <button className="primary-button sheet-button" onClick={() => { set({ sex }); setSheet(null) }}>これにする</button>
        </Sheet>
      )}
    </>
  )
}
