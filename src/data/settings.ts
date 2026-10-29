// 目的・体のこと・日常の消費（ようこそで決めて、マイページで変えられる）

export type Goal = 'keep' | 'lose' | 'gain'
export type Sex = 'male' | 'female'

export type Settings = {
  goal: Goal
  age: number
  sex: Sex
  height: number
  weight: number
  // 普段の動き：0 少ない／1 ふつう／2 多い
  activity: number
  // 記録と体重から見直した分（日常の消費に足す）
  burnAdjust: number
  // 日常の消費の見直しをもう見たか
  reviewed: boolean
  // ようこそを最後まで見たか
  onboarded: boolean
  // 腹囲（任意）
  waist: number | null
}

export const DEFAULT_SETTINGS: Settings = {
  goal: 'lose',
  age: 22,
  sex: 'male',
  height: 172,
  weight: 66,
  activity: 1,
  burnAdjust: 0,
  reviewed: false,
  onboarded: false,
  waist: 78,
}

// 目安の幅＝今日の消費からの差
export const GOALS: Record<Goal, { label: string; sub: string; range: [number, number] }> = {
  keep: { label: '体重を保つ', sub: 'いまの体を続ける', range: [-150, 150] },
  lose: { label: 'ゆるやかに減らす', sub: '目安＝日常の消費 −400〜−100 kcal', range: [-400, -100] },
  gain: { label: 'ゆるやかに増やす', sub: '目安＝日常の消費 ＋100〜＋300 kcal', range: [100, 300] },
}

export const ACTIVITIES = [
  { label: '少ない', rate: 1.3 },
  { label: 'ふつう', rate: 1.45 },
  { label: '多い', rate: 1.6 },
]

export const SEX_LABEL: Record<Sex, string> = { male: '男性', female: '女性' }

// 基礎代謝基準値（kcal/kg/日）日本人の食事摂取基準（2025年版）
function bmrPerKg(sex: Sex, age: number) {
  const table = sex === 'male' ? [23.7, 22.5, 21.8, 21.6] : [22.1, 21.9, 20.7, 20.7]
  if (age < 30) return table[0]
  if (age < 50) return table[1]
  if (age < 65) return table[2]
  return table[3]
}

const round50 = (n: number) => Math.round(n / 50) * 50

export function bmrOf(s: Settings) {
  return round50(bmrPerKg(s.sex, s.age) * s.weight)
}

// 日常の消費（基礎代謝 × 普段の動き ＋ 見直し）
export function dailyBurnOf(s: Settings) {
  return round50(bmrOf(s) * ACTIVITIES[s.activity].rate) + s.burnAdjust
}

// 目安の幅（kcal）。burned はその日の消費
export function rangeOf(s: Settings, burned: number): [number, number] {
  const [lo, hi] = GOALS[s.goal].range
  return [burned + lo, burned + hi]
}

export function bmiOf(s: Settings) {
  return s.weight / (s.height / 100) ** 2
}

export function formatRange([lo, hi]: [number, number]) {
  return `${lo.toLocaleString()}〜${hi.toLocaleString()}`
}
