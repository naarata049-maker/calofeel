import { useRef, useState, type PointerEvent } from 'react'
import { Header } from '../components/Header'
import { Meter, lapCount } from '../components/Meter'
import { RecordSheet } from '../components/RecordSheet'
import { TODAY, TWO_DAYS_AGO, YESTERDAY } from '../data/today'
import './Home.css'

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土']

// いまは仮の3日分だけ（0 = 今日、-1 = 昨日、-2 = おととい）
const DAYS = [
  { records: TODAY, title: '今日' },
  { records: YESTERDAY, title: '昨日' },
  { records: TWO_DAYS_AGO, title: 'おととい' },
]

// 円どうしの間隔（Figma 275:3 と 275:115）
const LAP_GAP = 321
// これより長く横に動かしたら、となりの円へ
const SWIPE_MIN = 50

function formatDate(d: Date) {
  return `${d.getMonth() + 1}月${d.getDate()}日（${WEEKDAYS[d.getDay()]}）`
}

export function Home() {
  // メーターをタップすると記録シートが下がる（どの日も同じ）
  const [lowered, setLowered] = useState(false)
  const [offset, setOffset] = useState(0)
  // 1周をこえた日は、横にスワイプして2つ目の円を見る
  const [lap, setLap] = useState(0)
  const [drag, setDrag] = useState(0)
  const pointer = useRef<{ x: number; y: number; moved: boolean } | null>(null)

  const day = DAYS[-offset]
  const laps = lapCount(day.records)
  const date = new Date()
  date.setDate(date.getDate() + offset)

  function changeDay(next: number) {
    setOffset(next)
    setLap(0)
  }

  function onPointerDown(e: PointerEvent) {
    pointer.current = { x: e.clientX, y: e.clientY, moved: false }
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  function onPointerMove(e: PointerEvent) {
    const p = pointer.current
    if (!p) return
    const dx = e.clientX - p.x
    if (!p.moved && Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(e.clientY - p.y)) p.moved = true
    if (!p.moved || laps === 1) return
    // はしの円より先へは、少しだけ動く
    const atEdge = (dx > 0 && lap === 0) || (dx < 0 && lap === laps - 1)
    setDrag(atEdge ? dx / 4 : dx)
  }

  function onPointerUp(e: PointerEvent) {
    const p = pointer.current
    pointer.current = null
    if (!p) return
    if (!p.moved) {
      setLowered((v) => !v)
      return
    }
    const dx = e.clientX - p.x
    if (dx < -SWIPE_MIN) setLap((l) => Math.min(l + 1, laps - 1))
    if (dx > SWIPE_MIN) setLap((l) => Math.max(l - 1, 0))
    setDrag(0)
  }

  return (
    <div className="home">
      <Header
        sub={formatDate(date)}
        title={day.title}
        onPrev={offset > -(DAYS.length - 1) ? () => changeDay(offset - 1) : undefined}
        onNext={offset < 0 ? () => changeDay(offset + 1) : undefined}
      />
      <div
        className="home-meter"
        role="button"
        tabIndex={0}
        aria-pressed={lowered}
        aria-label="メーターを全部見る"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={() => { pointer.current = null; setDrag(0) }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') setLowered((v) => !v)
          if (e.key === 'ArrowRight') setLap((l) => Math.min(l + 1, laps - 1))
          if (e.key === 'ArrowLeft') setLap((l) => Math.max(l - 1, 0))
        }}
      >
        <div
          className={`home-meter-track${drag === 0 ? ' is-settling' : ''}`}
          style={{ transform: `translateX(${-lap * LAP_GAP + drag}px)` }}
        >
          {Array.from({ length: laps }, (_, i) => (
            <div key={i} className="home-meter-lap" style={{ left: i * LAP_GAP }}>
              <Meter records={day.records} lap={i} />
            </div>
          ))}
        </div>
      </div>
      {laps > 1 && (
        <div className={`home-dots${lowered ? ' is-lowered' : ''}`} aria-label={`${laps}つのうち${lap + 1}つ目の円`}>
          {Array.from({ length: laps }, (_, i) => (
            <span key={i} className={i === lap ? 'is-current' : undefined} />
          ))}
        </div>
      )}
      <RecordSheet records={day.records} lowered={lowered} title={`${day.title}の記録`} />
    </div>
  )
}
