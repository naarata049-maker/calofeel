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
}

export type ExerciseRecord = {
  id: string
  kind: 'exercise'
  time: string
  name: string
  kcal: number
}

export type DayRecord = MealRecord | ExerciseRecord

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

// 日常の消費（基礎代謝×普段の動き）。半円＝この量
export const DAILY_BURN = 2250

// 仮の1日（Figma のホームの記録をもとに、夕食だけ1周に収まる量にした）
export const TODAY: DayRecord[] = [
  { id: 'r1', kind: 'meal', time: '8:10', category: 'breakfast', name: 'トーストと目玉焼き', kcal: 400, photo: toast },
  { id: 'r2', kind: 'meal', time: '12:30', category: 'lunch', name: '醤油ラーメン', kcal: 700, photo: ramen },
  { id: 'r3', kind: 'meal', time: '15:00', category: 'snack', name: 'ドーナツ', kcal: 150, photo: donut },
  { id: 'r4', kind: 'exercise', time: '18:00', name: 'ウォーキング 30分', kcal: 150 },
  { id: 'r5', kind: 'meal', time: '19:30', category: 'dinner', name: '鶏の照り焼き', kcal: 800, photo: teriyaki },
]
