import { useState } from 'react'
import { Header } from '../components/Header'
import { Meter } from '../components/Meter'
import { RecordSheet } from '../components/RecordSheet'
import { TODAY } from '../data/today'
import './Home.css'

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土']

function formatDate(d: Date) {
  return `${d.getMonth() + 1}月${d.getDate()}日（${WEEKDAYS[d.getDay()]}）`
}

export function Home() {
  // メーターをタップすると記録シートが下がる（どの日も同じ）
  const [lowered, setLowered] = useState(false)

  return (
    <div className="home">
      <Header sub={formatDate(new Date())} title="今日" onPrev={() => {}} onNext={() => {}} />
      <button
        className="home-meter"
        onClick={() => setLowered((v) => !v)}
        aria-pressed={lowered}
        aria-label="メーターを全部見る"
      >
        <Meter records={TODAY} />
      </button>
      <RecordSheet records={TODAY} lowered={lowered} />
    </div>
  )
}
