import { useState } from 'react'
import { Header } from '../components/Header'
import { Meter } from '../components/Meter'
import { RecordSheet } from '../components/RecordSheet'
import { TODAY, YESTERDAY } from '../data/today'
import './Home.css'

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土']

function formatDate(d: Date) {
  return `${d.getMonth() + 1}月${d.getDate()}日（${WEEKDAYS[d.getDay()]}）`
}

export function Home() {
  // メーターをタップすると記録シートが下がる（どの日も同じ）
  const [lowered, setLowered] = useState(false)
  // 0 = 今日、-1 = 前の日（いまは仮の2日分だけ）
  const [offset, setOffset] = useState(0)
  const records = offset === 0 ? TODAY : YESTERDAY
  const date = new Date()
  date.setDate(date.getDate() + offset)

  return (
    <div className="home">
      <Header
        sub={formatDate(date)}
        title={offset === 0 ? '今日' : '昨日'}
        onPrev={offset === 0 ? () => setOffset(-1) : undefined}
        onNext={offset === -1 ? () => setOffset(0) : undefined}
      />
      <button
        className="home-meter"
        onClick={() => setLowered((v) => !v)}
        aria-pressed={lowered}
        aria-label="メーターを全部見る"
      >
        <Meter records={records} />
      </button>
      <RecordSheet records={records} lowered={lowered} title={offset === 0 ? '今日の記録' : '昨日の記録'} />
    </div>
  )
}
