import { useState } from 'react'
import { TabBar, type Tab } from './components/TabBar'
import { recordsFor, totals } from './data/history'
import { TODAY, type DayRecord } from './data/today'
import { sampleWeights, sameDay, type WeightEntry } from './data/weight'
import { Body } from './screens/Body'
import { Home } from './screens/Home'
import { Month } from './screens/Month'
import { MyPage } from './screens/MyPage'
import { Onboarding, type OnboardingStart } from './screens/Onboarding'
import { BurnDetail, BurnReview } from './screens/Pages'
import { Record } from './screens/Record'
import { SettingsProvider, useSettings } from './settings'
import './App.css'

const minutesOf = (time: string) => {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

// タブの上にかぶせる画面
type Overlay =
  | { kind: 'record' }
  | { kind: 'review' }
  | { kind: 'burnDetail' }
  | { kind: 'onboarding'; start: OnboardingStart }
  | null

export default function App() {
  return (
    <SettingsProvider>
      <AppScreens />
    </SettingsProvider>
  )
}

function AppScreens() {
  const { settings, dailyBurn } = useSettings()
  const [tab, setTab] = useState<Tab>('home')
  // 今日の記録と体重。いまはページを開いているあいだだけ覚える（読み込み直すと元に戻る）
  const [today, setToday] = useState<DayRecord[]>(TODAY)
  const [weights, setWeights] = useState<WeightEntry[]>(() => sampleWeights())
  // はじめて開いたときは、ようこそから
  const [overlay, setOverlay] = useState<Overlay>(() => (settings.onboarded ? null : { kind: 'onboarding', start: 'all' }))
  // ホームを開き直すとき（記録したあと・グラフで日をタップしたとき）
  const [home, setHome] = useState({ key: 0, daysAgo: 0 })

  const { burned } = totals(recordsFor(0, today), dailyBurn)
  const openHome = (daysAgo: number) => {
    setTab('home')
    setHome((h) => ({ key: h.key + 1, daysAgo }))
  }

  const save = (record: DayRecord) => {
    setToday((list) => [...list, record].sort((a, b) => minutesOf(a.time) - minutesOf(b.time)))
    setOverlay(null)
    openHome(0)
  }

  const recordWeight = (entry: WeightEntry) => {
    setWeights((list) => [...list.filter((w) => !sameDay(w.date, entry.date)), entry]
      .sort((a, b) => a.date.getTime() - b.date.getTime()))
  }

  return (
    <div className="app">
      <main className={`screen${tab === 'home' ? ' is-fixed' : ''}`}>
        {tab === 'home' && <Home key={home.key} today={today} startDaysAgo={home.daysAgo} />}
        {tab === 'log' && <Month today={today} onOpenDay={openHome} />}
        {tab === 'change' && (
          <Body today={today} weights={weights} onRecordWeight={recordWeight}
            onReview={() => setOverlay({ kind: 'review' })} />
        )}
        {tab === 'mypage' && (
          <MyPage weight={weights[weights.length - 1].kg}
            onBurnDetail={() => setOverlay({ kind: 'burnDetail' })}
            onEdit={(start) => setOverlay({ kind: 'onboarding', start })} />
        )}
      </main>
      <TabBar current={tab} onChange={(t) => (t === 'home' ? openHome(0) : setTab(t))}
        onAdd={() => setOverlay({ kind: 'record' })} />
      {overlay?.kind === 'record' && <Record burned={burned} onClose={() => setOverlay(null)} onSave={save} />}
      {overlay?.kind === 'review' && <BurnReview onClose={() => setOverlay(null)} />}
      {overlay?.kind === 'burnDetail' && <BurnDetail onClose={() => setOverlay(null)} />}
      {overlay?.kind === 'onboarding' && <Onboarding start={overlay.start} onDone={() => setOverlay(null)} />}
    </div>
  )
}
