import toast from '../assets/photos/toast.jpg'
import ramen from '../assets/photos/ramen.jpg'
import donut from '../assets/photos/donut.jpg'
import teriyaki from '../assets/photos/teriyaki.jpg'

export type MealCategory = 'breakfast' | 'lunch' | 'snack' | 'dinner' | 'other'

export type MealRecord = {
  id: string
  kind: 'meal'
  time: string
  category: MealCategory
  name: string
  kcal: number
  photo?: string
  // 量（foods.ts の AMOUNTS の番号）。ないときは「ふつう」
  amount?: number
  memo?: string
}

export type ExerciseRecord = {
  id: string
  kind: 'exercise'
  time: string
  name: string
  kcal: number
}

export type DayRecord = MealRecord | ExerciseRecord

// 記録する画面で作る、id をつける前の記録
export type NewRecord = Omit<MealRecord, 'id'> | Omit<ExerciseRecord, 'id'>

export const MEAL_LABEL: Record<MealCategory, string> = {
  breakfast: '朝食',
  lunch: '昼食',
  snack: '間食',
  dinner: '夕食',
  other: 'その他',
}

// 食事の色は区分ごとに固定（index.css の --meal-*）
export const MEAL_COLOR: Record<MealCategory, string> = {
  breakfast: 'var(--meal-breakfast)',
  lunch: 'var(--meal-lunch)',
  snack: 'var(--meal-snack)',
  dinner: 'var(--meal-dinner)',
  other: 'var(--meal-other)',
}

// 運動の色は、その日に記録した順に回す
const EXERCISE_COLORS = [
  'var(--exercise-1)',
  'var(--exercise-2)',
  'var(--exercise-3)',
  'var(--exercise-4)',
  'var(--exercise-5)',
]

export function exerciseColor(index: number) {
  return EXERCISE_COLORS[index % EXERCISE_COLORS.length]
}


// 仮の1日（Figma のホームの記録をもとに、夕食だけ1周に収まる量にした）
export const TODAY: DayRecord[] = [
  { id: 'r1', kind: 'meal', time: '8:10', category: 'breakfast', name: 'トーストと目玉焼き', kcal: 400, photo: toast },
  { id: 'r2', kind: 'meal', time: '12:30', category: 'lunch', name: '醤油ラーメン', kcal: 700, photo: ramen },
  { id: 'r3', kind: 'meal', time: '15:00', category: 'snack', name: 'ドーナツ', kcal: 150, photo: donut },
  { id: 'r4', kind: 'exercise', time: '18:00', name: 'ウォーキング 30分', kcal: 150 },
  { id: 'r5', kind: 'meal', time: '19:30', category: 'dinner', name: '鶏の照り焼き', kcal: 800, photo: teriyaki },
]

// 仮の前の日：摂取 3,000 kcal（1周 4,500 の3分の2）で、円が記録シートの下まで回る日
export const YESTERDAY: DayRecord[] = [
  { id: 'y1', kind: 'meal', time: '8:30', category: 'breakfast', name: 'トーストと目玉焼き', kcal: 500, photo: toast },
  { id: 'y2', kind: 'meal', time: '12:10', category: 'lunch', name: '醤油ラーメン', kcal: 900, photo: ramen },
  { id: 'y3', kind: 'meal', time: '15:30', category: 'snack', name: 'ドーナツ', kcal: 300, photo: donut },
  { id: 'y4', kind: 'exercise', time: '17:40', name: 'ウォーキング 30分', kcal: 150 },
  { id: 'y5', kind: 'meal', time: '19:00', category: 'dinner', name: '鶏の照り焼き', kcal: 1300, photo: teriyaki },
]

// 仮の一昨日：Figma「1周をこえた日」と同じ記録（摂取 5,000 kcal）。1周 4,500 をこえた 500 が2つ目の円に入る
export const TWO_DAYS_AGO: DayRecord[] = [
  { id: 'z1', kind: 'meal', time: '8:10', category: 'breakfast', name: 'トーストと目玉焼き', kcal: 400, photo: toast },
  { id: 'z2', kind: 'meal', time: '12:30', category: 'lunch', name: '醤油ラーメン', kcal: 700, photo: ramen },
  { id: 'z3', kind: 'meal', time: '15:00', category: 'snack', name: 'ドーナツ', kcal: 150, photo: donut },
  { id: 'z4', kind: 'exercise', time: '18:00', name: 'ウォーキング 30分', kcal: 150 },
  { id: 'z5', kind: 'meal', time: '19:30', category: 'dinner', name: '鶏の照り焼き', kcal: 3750, photo: teriyaki },
]
