import { useState } from 'react'
import { Header } from './components/Header'
import { TabBar, type Tab } from './components/TabBar'
import { ExerciseIcon } from './components/icons'
import './App.css'

const MEAL_COLORS = [
  ['朝食', '--meal-breakfast'],
  ['昼食', '--meal-lunch'],
  ['間食', '--meal-snack'],
  ['夕食', '--meal-dinner'],
  ['その他', '--meal-other'],
]
const EXERCISE_COLORS = ['--exercise-1', '--exercise-2', '--exercise-3', '--exercise-4', '--exercise-5']

// 手順1（土台）用の仮の画面。中身は次の段から作る。
function HomeScreen() {
  return (
    <>
      <Header sub="10月22日（木）" title="今日" onPrev={() => {}} onNext={() => {}} />
      <section className="placeholder">
        <h2 className="t-heading">摂取の色（食事の区分）</h2>
        <div className="swatches">
          {MEAL_COLORS.map(([label, token]) => (
            <div key={token}>
              <div className="swatch" style={{ background: `var(${token})` }} />
              <p className="swatch-label">{label}</p>
            </div>
          ))}
        </div>
        <h2 className="t-heading">消費の色（記録した順）</h2>
        <div className="swatches">
          {EXERCISE_COLORS.map((token, i) => (
            <div key={token}>
              <div className="swatch" style={{ background: `var(${token})` }} />
              <p className="swatch-label">{i + 1}つ目</p>
            </div>
          ))}
        </div>
        <h2 className="t-heading">目安</h2>
        <p>
          <span className="chip" style={{ background: 'var(--range-bg)', color: 'var(--range)' }}>目安の中</span>
          <span className="chip" style={{ background: 'var(--over-bg)', color: 'var(--over)' }}>目安より上</span>
        </p>
      </section>
      <section className="placeholder">
        <h2 className="t-heading">文字</h2>
        <p className="t-number" style={{ margin: 0 }}>5,000</p>
        <p className="t-sub" style={{ margin: '0 0 12px' }}>/  2,400 kcal</p>
        <p className="t-caption" style={{ margin: 0 }}>昼食</p>
        <p className="t-body" style={{ margin: 0 }}>醤油ラーメン <span className="t-kcal">700 kcal</span></p>
        <p style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '8px 0 0' }}>
          <ExerciseIcon />
          <span className="t-body">ウォーキング 30分</span>
          <span className="t-kcal" style={{ color: 'var(--exercise-text)' }}>150 kcal</span>
        </p>
        <p className="logo" style={{ fontSize: 28, margin: '16px 0 0' }}>calofeel</p>
      </section>
    </>
  )
}

function SimpleScreen({ title }: { title: string }) {
  return (
    <>
      <Header title={title} />
      <section className="placeholder">
        <p className="t-sub" style={{ margin: 0 }}>この画面はこれから作ります。</p>
      </section>
    </>
  )
}

export default function App() {
  const [tab, setTab] = useState<Tab>('home')

  return (
    <div className="app">
      <main className="screen">
        {tab === 'home' && <HomeScreen />}
        {tab === 'log' && <SimpleScreen title="流れ" />}
        {tab === 'change' && <SimpleScreen title="体の変化" />}
        {tab === 'mypage' && <SimpleScreen title="マイページ" />}
      </main>
      <TabBar current={tab} onChange={setTab} onAdd={() => {}} />
    </div>
  )
}
