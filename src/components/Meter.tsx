import { DAILY_BURN, MEAL_COLOR, exerciseColor, type DayRecord } from '../data/today'

// Figma「H ホーム」275:3 のメーター。角度は右(3時)が0で時計回り。
// 1kcal あたりの角度：日常の消費でちょうど半円になる
const K = Math.PI / DAILY_BURN
const START = Math.PI // 左（9時）から始める
const LAP = Math.PI * 2
const GAP = 0.007 // 食事どうしのすき間

const CX = 194.5
const CY = 164.5
const OUTER = { r1: 89.3, r2: 131.35 } // 消費の輪
const INNER = { r1: 98.1, r2: 122.55 } // 摂取の輪
const RANGE = { r1: 139.4, r2: 145.5 } // 目安

function point(r: number, a: number) {
  return `${(CX + r * Math.cos(a)).toFixed(2)} ${(CY + r * Math.sin(a)).toFixed(2)}`
}

// 輪の一部（ドーナツ形の扇）
function sector(r1: number, r2: number, a0: number, a1: number) {
  const large = a1 - a0 > Math.PI ? 1 : 0
  return [
    `M ${point(r2, a0)}`,
    `A ${r2} ${r2} 0 ${large} 1 ${point(r2, a1)}`,
    `L ${point(r1, a1)}`,
    `A ${r1} ${r1} 0 ${large} 0 ${point(r1, a0)}`,
    'Z',
  ].join(' ')
}

function line(r1: number, r2: number, a: number) {
  return `M ${point(r1, a)} L ${point(r2, a)}`
}

type Props = {
  records: DayRecord[]
}

export function Meter({ records }: Props) {
  const meals = records.filter((r) => r.kind === 'meal')
  const exercises = records.filter((r) => r.kind === 'exercise')
  const eaten = meals.reduce((s, r) => s + r.kcal, 0)
  const burned = DAILY_BURN + exercises.reduce((s, r) => s + r.kcal, 0)

  // 摂取：区分の色で、記録した順に並べる。1周をこえた分は次の段（2つ目の円）で
  let a = START
  const mealArcs = meals.map((r) => {
    const a0 = a
    const a1 = Math.min(a + r.kcal * K, START + LAP)
    a = a + r.kcal * K
    return { id: r.id, color: MEAL_COLOR[r.category], a0, a1: Math.max(a0, a1 - GAP) }
  }).filter((arc) => arc.a1 > arc.a0)

  // 消費：日常の消費（灰色の半円）のあとに運動を続ける
  let b = START + DAILY_BURN * K
  const exerciseArcs = exercises.map((r, i) => {
    const a0 = b
    b += r.kcal * K
    return { id: r.id, color: exerciseColor(i), a0, a1: b }
  })

  const burnEnd = START + burned * K
  const rangeStart = START + (burned - 400) * K
  const rangeEnd = START + (burned - 100) * K
  const rangeMid = (rangeStart + rangeEnd) / 2

  return (
    <svg className="meter" viewBox="0 0 393 310" width="393" height="310" role="img"
      aria-label={`摂取 ${eaten.toLocaleString()} kcal、今日の消費 ${burned.toLocaleString()} kcal`}>
      <path d={sector(OUTER.r1, OUTER.r2, START, START + DAILY_BURN * K)} fill="#eceeec" />
      {exerciseArcs.map((arc) => (
        <path key={arc.id} d={sector(OUTER.r1, OUTER.r2, arc.a0, arc.a1)} fill={arc.color} />
      ))}
      {mealArcs.map((arc) => (
        <path key={arc.id} d={sector(INNER.r1, INNER.r2, arc.a0, arc.a1)} fill={arc.color} />
      ))}

      <path d={sector(RANGE.r1, RANGE.r2, rangeStart, rangeEnd)} fill="var(--range-mark)" />
      <text className="meter-range" x={CX + 160 * Math.cos(rangeMid)} y={CY + 160 * Math.sin(rangeMid)}
        textAnchor="middle" dominantBaseline="central">目安</text>

      {/* 日常の消費の終わり（点線）と、今日の消費の終わり（実線） */}
      <path d={line(86.7, 139.4, START + DAILY_BURN * K)} stroke="var(--ink)" strokeWidth="1.17" strokeDasharray="2.34 2.34" />
      <path d={line(86.7, 139.4, burnEnd)} stroke="var(--ink)" strokeWidth="1.56" />

      <text className="meter-zero" x={CX - 135.4} y={CY + 19}>0</text>
      <text className="meter-number" x={CX} y={CY - 37} textAnchor="middle">{eaten.toLocaleString()}</text>
      <text className="meter-sub" x={CX} y={CY - 6} textAnchor="middle">{`/  ${burned.toLocaleString()} kcal`}</text>
    </svg>
  )
}
