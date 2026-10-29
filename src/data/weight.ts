// 体重の記録（週に1回、週の平均として持つ）。最初は仮の13週分
export type WeightEntry = { date: Date; kg: number }

function mondayOf(d: Date) {
  const m = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  m.setDate(m.getDate() - ((m.getDay() + 6) % 7))
  return m
}

// 先週の月曜までの13週。最後が 66.2kg（その前が 66.5kg）になるように
const SAMPLE = [67.9, 67.8, 67.8, 67.6, 67.7, 67.5, 67.4, 67.4, 67.3, 67.0, 66.9, 66.5, 66.2]

export function sampleWeights(today = new Date()): WeightEntry[] {
  const lastMonday = mondayOf(today)
  lastMonday.setDate(lastMonday.getDate() - 7)
  return SAMPLE.map((kg, i) => {
    const d = new Date(lastMonday)
    d.setDate(d.getDate() - (SAMPLE.length - 1 - i) * 7)
    return { date: d, kg }
  })
}

// その週の月曜（同じ週の記録は上書きする）
export { mondayOf }

export function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}
