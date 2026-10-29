import { useState } from 'react'
import { TabBar, type Tab } from './components/TabBar'
import { dateAgo, recordsFor, totals, type DayBook } from './data/history'
import { TODAY, type DayRecord, type MealRecord } from './data/today'
import { sampleWeights, sameDay, type WeightEntry } from './data/weight'
import { Body } from './screens/Body'
import { Home } from './screens/Home'
import { Month } from './screens/Month'
import { MyPage } from './screens/MyPage'
import { Onboarding, type OnboardingStart } from './screens/Onboarding'
import { BurnDetail, BurnReview } from './screens/Pages'
import { Calendar } from './screens/Calendar'
import { MealDetail } from './screens/MealDetail'
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
  | { kind: 'meal'; daysAgo: number; id: string }
  | { kind: 'calendar'; daysAgo: number }
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
  // 記録した・直した日の記録と体重。いまはページを開いているあいだだけ覚える（読み込み直すと元に戻る）
  const [book, setBook] = useState<DayBook>({ 0: TODAY })
  const [weights, setWeights] = useState<WeightEntry[]>(() => sampleWeights())
  // はじめて開いたときは、ようこそから
  const [overlay, setOverlay] = useState<Overlay>(() => (settings.onboarded ? null : { kind: 'onboarding', start: 'all' }))
  // ホームを開き直すとき（記録したあと・グラフで日をタップしたとき）
  const [home, setHome] = useState({ key: 0, daysAgo: 0 })

  const { burned } = totals(recordsFor(0, book), dailyBurn)
  const openHome = (daysAgo: number) => {
    setTab('home')
    setHome((h) => ({ key: h.key + 1, daysAgo }))
  }

  // daysAgo 日前の記録を変える（時刻順にならべ直す）
  const editDay = (daysAgo: number, change: (list: DayRecord[]) => DayRecord[]) => {
    setBook((b) => ({
      ...b,
      [daysAgo]: change(recordsFor(daysAgo, b)).sort((x, y) => minutesOf(x.time) - minutesOf(y.time)),
    }))
  }

  const save = (record: DayRecord) => {
    editDay(0, (list) => [...list, record])
    setOverlay(null)
    openHome(0)
  }

  const mealOverlay = overlay?.kind === 'meal' ? overlay : null
  const meal = mealOverlay
    ? recordsFor(mealOverlay.daysAgo, book).find((r): r is MealRecord => r.id === mealOverlay.id && r.kind === 'meal')
    : undefined

  const recordWeight = (entry: WeightEntry) => {
    setWeights((list) => [...list.filter((w) => !sameDay(w.date, entry.date)), entry]
      .sort((a, b) => a.date.getTime() - b.date.getTime()))
  }

  return (
    <div className="app">
      <main className={`screen${tab === 'home' ? ' is-fixed' : ''}`}>
        {tab === 'home' && <Home key={home.key} book={book} startDaysAgo={home.daysAgo}
            onOpenMeal={(daysAgo, id) => setOverlay({ kind: 'meal', daysAgo, id })}
            onOpenCalendar={(daysAgo) => setOverlay({ kind: 'calendar', daysAgo })} />}
        {tab === 'log' && <Month book={book} onOpenDay={openHome} />}
        {tab === 'change' && (
          <Body book={book} weights={weights} onRecordWeight={recordWeight}
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
      {mealOverlay && meal && (
        <MealDetail record={meal} records={recordsFor(mealOverlay.daysAgo, book)}
          date={dateAgo(mealOverlay.daysAgo)} isToday={mealOverlay.daysAgo === 0}
          burned={totals(recordsFor(mealOverlay.daysAgo, book), dailyBurn).burned}
          onBack={() => setOverlay(null)}
          onChange={(next) => editDay(mealOverlay.daysAgo, (list) => list.map((r) => (r.id === next.id ? next : r)))}
          onDelete={() => {
            editDay(mealOverlay.daysAgo, (list) => list.filter((r) => r.id !== mealOverlay.id))
            setOverlay(null)
          }} />
      )}
      {overlay?.kind === 'calendar' && (
        <Calendar book={book} selected={overlay.daysAgo} onClose={() => setOverlay(null)}
          onPick={(daysAgo) => { setOverlay(null); openHome(daysAgo) }} />
      )}
      {overlay?.kind === 'onboarding' && <Onboarding start={overlay.start} onDone={() => setOverlay(null)} />}
    </div>
  )
}
