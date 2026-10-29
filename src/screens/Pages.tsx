import { PageHeader } from '../components/PageHeader'
import { FormRow } from '../components/form'
import { ACTIVITIES, GOALS, bmrOf, formatRange, rangeOf } from '../data/settings'
import { useSettings } from '../settings'
import './Pages.css'

// タブバーのない、上にかぶせる画面（6-3 日常の消費の見直し、7-2 日常の消費の内訳）

// 見直しでふやす量（仮。本当は4週間の記録と体重の変化から出す）
const REVIEW_STEP = 50

export function BurnReview({ onClose }: { onClose: () => void }) {
  const { settings, dailyBurn, update } = useSettings()
  const proposed = dailyBurn + REVIEW_STEP
  const done = (accept: boolean) => {
    update({ reviewed: true, ...(accept ? { burnAdjust: settings.burnAdjust + REVIEW_STEP } : {}) })
    onClose()
  }
  return (
    <div className="page">
      <PageHeader title="日常の消費の見直し" onBack={onClose} />
      <div className="page-body">
        <h2 className="page-title">日常の消費を見直しませんか？</h2>
        <p className="page-lead">この4週間の記録と体重の変化から、あなたの日常の消費は、いまの設定より少し多そうです。</p>
        <section className="review-card">
          <div className="review-compare">
            <div>
              <span>いまの設定</span>
              <strong className="is-old">{dailyBurn.toLocaleString()}</strong>
            </div>
            <span className="review-arrow">→</span>
            <div>
              <span className="is-new">記録からの推定</span>
              <strong>{proposed.toLocaleString()}</strong>
            </div>
          </div>
          <p className="review-unit">kcal / 日（日常の消費）</p>
          <p className="review-range">
            目安の幅も {formatRange(rangeOf(settings, dailyBurn))} → {formatRange(rangeOf(settings, proposed))} kcal に
          </p>
        </section>
        <h3 className="page-heading">どうやって推定したか</h3>
        <p className="page-text">4週間の摂取の合計と消費の合計の差から、体重は −0.9kg と予想していました。実際は −1.1kg だったので、日常の消費が1日あたり約{REVIEW_STEP}kcal多いと考えられます。</p>
      </div>
      <footer className="page-footer">
        <button className="primary-button" onClick={() => done(true)}>{proposed.toLocaleString()} にする</button>
        <button className="text-button" onClick={() => done(false)}>このままにする</button>
      </footer>
    </div>
  )
}

export function BurnDetail({ onClose }: { onClose: () => void }) {
  const { settings, dailyBurn } = useSettings()
  const activity = ACTIVITIES[settings.activity]
  const [lo, hi] = rangeOf(settings, dailyBurn)
  const [goalLo, goalHi] = GOALS[settings.goal].range
  const sign = (n: number) => (n > 0 ? `＋${n}` : `−${-n}`)
  // 目安の図：0 から日常の消費（か目安の上の端）まで
  const max = Math.max(dailyBurn, hi)
  const pos = (kcal: number) => `${(kcal / max) * 100}%`

  return (
    <div className="page">
      <PageHeader title="日常の消費の内訳" onBack={onClose} />
      <div className="page-body">
        <section className="detail-calc">
          <div><span>基礎代謝</span><strong>{bmrOf(settings).toLocaleString()}</strong><small>体のことから</small></div>
          <b>×</b>
          <div><span>普段の動き</span><strong>{activity.rate}</strong><small>{activity.label}</small></div>
          <b>=</b>
          <div><span>日常の消費</span><strong>{dailyBurn.toLocaleString()}</strong><small>kcal</small></div>
        </section>
        <section className="detail-exercise">
          <strong>＋ 運動の消費</strong>
          <p>運動した日は、運動の消費の分だけ今日の消費がふえます（例：ウォーキング30分で +150）</p>
        </section>
        <h3 className="page-heading is-tight">目安の幅</h3>
        <section className="detail-range">
          <div className="detail-range-bar">
            <span className="detail-range-zero">0</span>
            <span className="detail-range-max" style={{ left: pos(dailyBurn) }}>{dailyBurn.toLocaleString()}</span>
            <span className="detail-range-track" />
            <span className="detail-range-band" style={{ left: pos(lo), width: `calc(${pos(hi - lo)})` }} />
            <span className="detail-range-lo" style={{ left: pos(lo) }}>{lo.toLocaleString()}</span>
            <span className="detail-range-hi" style={{ left: pos(hi) }}>{hi.toLocaleString()}</span>
          </div>
        </section>
        <p className="page-text">目安 ＝ 今日の消費 {sign(goalLo)}〜{sign(goalHi)} kcal（目的：{GOALS[settings.goal].label}）。ホームのメーターの緑の線がこの幅です。</p>
        <div className="detail-rows">
          <FormRow label="記録からの補正" arrow={false}
            value={`${settings.burnAdjust ? sign(settings.burnAdjust) : '± 0'}（4週間ごとに見直し）`} />
        </div>
        <p className="page-small">計算には誤差があるので、記録と体重から少しずつ合わせていきます。<br />出典：日本人の食事摂取基準（2025年版）</p>
      </div>
    </div>
  )
}
