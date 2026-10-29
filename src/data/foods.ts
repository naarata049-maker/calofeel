import type { MealCategory } from './today'

// 記録する画面で使う仮のデータ。写真の推定や料理の検索はまだ本物ではない

export type Food = { name: string; kcal: number }

// 写真から推定したことにする候補（どの写真でも同じ）
export const PHOTO_GUESSES: Food[] = [
  { name: '醤油ラーメン', kcal: 700 },
  { name: '味噌ラーメン', kcal: 800 },
  { name: 'とんこつラーメン', kcal: 850 },
]

// 写真の候補に足せるもの
export const PHOTO_EXTRAS: Food[] = [
  { name: '餃子', kcal: 250 },
  { name: 'ライス', kcal: 250 },
]

// 料理名から探す候補
export const FOODS: Food[] = [
  { name: 'カツ丼', kcal: 900 },
  { name: 'ミニカツ丼', kcal: 600 },
  { name: 'ソースカツ丼', kcal: 850 },
  { name: '親子丼', kcal: 700 },
  { name: '牛丼', kcal: 750 },
  { name: '天丼', kcal: 800 },
  { name: 'カレーライス', kcal: 800 },
  { name: 'オムライス', kcal: 750 },
  { name: 'チャーハン', kcal: 700 },
  { name: '醤油ラーメン', kcal: 700 },
  { name: '味噌ラーメン', kcal: 800 },
  { name: 'とんこつラーメン', kcal: 850 },
  { name: 'ざるそば', kcal: 350 },
  { name: 'きつねうどん', kcal: 450 },
  { name: 'ナポリタン', kcal: 650 },
  { name: 'ミートソーススパゲッティ', kcal: 700 },
  { name: 'ハンバーグ定食', kcal: 850 },
  { name: '鶏の照り焼き', kcal: 600 },
  { name: '焼き魚定食', kcal: 600 },
  { name: '餃子', kcal: 250 },
  { name: 'おにぎり', kcal: 180 },
  { name: 'サンドイッチ', kcal: 350 },
  { name: 'トーストと目玉焼き', kcal: 400 },
  { name: 'サラダ', kcal: 100 },
  { name: 'ヨーグルト', kcal: 90 },
  { name: 'バナナ', kcal: 90 },
  { name: 'ドーナツ', kcal: 250 },
  { name: 'ショートケーキ', kcal: 350 },
  { name: 'ポテトチップス', kcal: 330 },
  { name: 'カフェラテ', kcal: 120 },
]

export const AMOUNTS = [
  { label: '少なめ', rate: 0.8 },
  { label: 'ふつう', rate: 1 },
  { label: '大盛り', rate: 1.3 },
]

// 運動：体重 66kg・ふつうの強さで 1分あたりの消費
export const BODY_WEIGHT = 66
export const EXERCISES = [
  { name: 'ウォーキング', perMin: 5 },
  { name: 'ランニング', perMin: 10 },
  { name: '筋トレ', perMin: 5 },
  { name: '自転車', perMin: 7 },
  { name: '水泳', perMin: 10 },
  { name: 'ダンス', perMin: 6 },
  { name: 'その他', perMin: 5 },
]

export const STRENGTHS = [
  { label: 'ゆっくり', rate: 0.7 },
  { label: 'ふつう', rate: 1 },
  { label: 'きつい', rate: 1.3 },
]

export const CATEGORIES: MealCategory[] = ['breakfast', 'lunch', 'snack', 'dinner', 'other']

// 時刻から区分を決める（あとで変えられる）
export function categoryAt(time: string): MealCategory {
  const h = Number(time.split(':')[0])
  if (h >= 4 && h < 10) return 'breakfast'
  if (h >= 10 && h < 14) return 'lunch'
  if (h >= 14 && h < 17) return 'snack'
  if (h >= 17 && h < 23) return 'dinner'
  return 'other'
}

export function round10(n: number) {
  return Math.round(n / 10) * 10
}

export function timeOf(d: Date) {
  return `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
}
