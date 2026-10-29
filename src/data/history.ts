import { TWO_DAYS_AGO, YESTERDAY, type DayRecord, type MealCategory } from './today'
import toast from '../assets/photos/toast.jpg'
import ramen from '../assets/photos/ramen.jpg'
import donut from '../assets/photos/donut.jpg'
import teriyaki from '../assets/photos/teriyaki.jpg'

// 過去の日の仮の記録。昨日と一昨日は today.ts の見本、それより前は日付から決まった数字で作る
// （同じ日はいつ開いても同じ記録になる）

export const HISTORY_DAYS = 120

const MENU: Record<'breakfast' | 'lunch' | 'snack' | 'dinner', { names: string[]; min: number; max: number; photo: string; time: [number, number] }> = {
  breakfast: { names: ['トーストと目玉焼き', 'おにぎり', 'ヨーグルトとバナナ', 'サンドイッチ'], min: 250, max: 500, photo: toast, time: [7, 9] },
  lunch: { names: ['醤油ラーメン', 'カツ丼', 'カレーライス', '親子丼', 'ざるそば'], min: 450, max: 900, photo: ramen, time: [12, 13] },
  snack: { names: ['ドーナツ', 'ショートケーキ', 'カフェラテ', 'ポテトチップス'], min: 100, max: 350, photo: donut, time: [15, 16] },
  dinner: { names: ['鶏の照り焼き', 'ハンバーグ定食', '焼き魚定食', 'ナポリタン'], min: 500, max: 1000, photo: teriyaki, time: [19, 20] },
}

// 日付ごとに決まる乱数
function random(seed: number) {
  let t = seed
  return () => {
    t = (t + 0x6d2b79f5) | 0
    let r = Math.imul(t ^ (t >>> 15), 1 | t)
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

function generated(date: Date): DayRecord[] {
  const rand = random(date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate())
  const pick = <T,>(list: T[]) => list[Math.floor(rand() * list.length)]
  const between = (min: number, max: number) => Math.round((min + rand() * (max - min)) / 10) * 10
  const time = ([h0, h1]: [number, number]) => `${h0 + Math.floor(rand() * (h1 - h0 + 1))}:${pick(['00', '10', '20', '30', '40', '50'])}`
  const key = date.toDateString()
  const list: DayRecord[] = []
  for (const category of ['breakfast', 'lunch', 'snack', 'dinner'] as MealCategory[]) {
    if (category === 'snack' && rand() < 0.4) continue
    const m = MENU[category as keyof typeof MENU]
    list.push({ id: `${key}-${category}`, kind: 'meal', time: time(m.time), category, name: pick(m.names), kcal: between(m.min, m.max), photo: m.photo })
  }
  if (rand() < 0.4) {
    const run = rand() < 0.3
    list.push({ id: `${key}-ex`, kind: 'exercise', time: `${17 + Math.floor(rand() * 2)}:30`, name: run ? 'ランニング 30分' : 'ウォーキング 30分', kcal: run ? 300 : 150 })
  }
  const minutes = (t: string) => Number(t.split(':')[0]) * 60 + Number(t.split(':')[1])
  return list.sort((a, b) => minutes(a.time) - minutes(b.time))
}

export function dateAgo(daysAgo: number, today = new Date()) {
  const d = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  d.setDate(d.getDate() - daysAgo)
  return d
}

export function daysBetween(a: Date, b: Date) {
  const day = (d: Date) => Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())
  return Math.round((day(b) - day(a)) / 86400000)
}

// daysAgo 日前の記録（0 は今日。今日の分は App が持っている）
export function recordsFor(daysAgo: number, today: DayRecord[]): DayRecord[] {
  if (daysAgo === 0) return today
  if (daysAgo === 1) return YESTERDAY
  if (daysAgo === 2) return TWO_DAYS_AGO
  if (daysAgo > HISTORY_DAYS) return []
  return generated(dateAgo(daysAgo))
}

export function totals(records: DayRecord[], dailyBurn: number) {
  let eaten = 0
  let exercise = 0
  for (const r of records) {
    if (r.kind === 'meal') eaten += r.kcal
    else exercise += r.kcal
  }
  return { eaten, burned: dailyBurn + exercise }
}
