// 1日の区切りは朝4時。夜中の0時〜4時の記録は前の日の最後に入る
export const DAY_START_HOUR = 4

// アプリでの「今日」の日付（朝4時より前なら前の日）
export function appToday(now = new Date()) {
  const d = new Date(now.getTime() - DAY_START_HOUR * 60 * 60 * 1000)
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

// 並べる順のための時刻（朝4時を0として数える分）。"1:52" は "23:59" より後になる
export function dayMinutes(time: string) {
  const [h, m] = time.split(':').map(Number)
  const minutes = h * 60 + m
  return minutes < DAY_START_HOUR * 60 ? minutes + 24 * 60 : minutes
}
