import { useState } from 'react'
import { Header } from './components/Header'
import { TabBar, type Tab } from './components/TabBar'
import { DAILY_BURN, TODAY, type DayRecord } from './data/today'
import { Home } from './screens/Home'
import { Record } from './screens/Record'
import './App.css'

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

const minutesOf = (time: string) => {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

export default function App() {
  const [tab, setTab] = useState<Tab>('home')
  // 今日の記録。いまはページを開いているあいだだけ覚える（読み込み直すと元に戻る）
  const [today, setToday] = useState<DayRecord[]>(TODAY)
  const [recording, setRecording] = useState(false)
  // 記録したらホームを今日の1つ目の円に戻す
  const [homeKey, setHomeKey] = useState(0)

  const burned = DAILY_BURN + today.reduce((s, r) => (r.kind === 'exercise' ? s + r.kcal : s), 0)

  const save = (record: DayRecord) => {
    setToday((list) => [...list, record].sort((a, b) => minutesOf(a.time) - minutesOf(b.time)))
    setRecording(false)
    setTab('home')
    setHomeKey((k) => k + 1)
  }

  return (
    <div className="app">
      <main className={`screen${tab === 'home' ? ' is-fixed' : ''}`}>
        {tab === 'home' && <Home key={homeKey} today={today} />}
        {tab === 'log' && <SimpleScreen title="流れ" />}
        {tab === 'change' && <SimpleScreen title="体の変化" />}
        {tab === 'mypage' && <SimpleScreen title="マイページ" />}
      </main>
      <TabBar current={tab} onChange={setTab} onAdd={() => setRecording(true)} />
      {recording && <Record burned={burned} onClose={() => setRecording(false)} onSave={save} />}
    </div>
  )
}
