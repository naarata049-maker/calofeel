import { MEAL_COLOR, MEAL_LABEL, exerciseColor, type DayRecord } from '../data/today'
import { BowlIcon, ExerciseIcon } from './icons'
import './RecordSheet.css'

type Props = {
  records: DayRecord[]
  lowered: boolean
  title: string
}

// 今日の記録（白30%＋背景ぼかしの下地）。シートの中だけスクロールする
export function RecordSheet({ records, lowered, title }: Props) {
  let exerciseIndex = 0

  return (
    <section className={`record-sheet${lowered ? ' is-lowered' : ''}`}>
      <header className="record-sheet-head">
        <h2 className="t-heading">{title}</h2>
        <span className="t-sub">{records.length}件</span>
      </header>
      <ol className="record-list">
        {records.map((r) => {
          const isExercise = r.kind === 'exercise'
          const color = isExercise ? exerciseColor(exerciseIndex++) : MEAL_COLOR[r.category]
          return (
            <li key={r.id} className="record-row">
              <span className="record-time">{r.time}</span>
              <span className="record-dot" style={{ background: color }} />
              {isExercise ? (
                <span className="record-thumb is-exercise"><ExerciseIcon /></span>
              ) : r.photo ? (
                <img className="record-thumb" src={r.photo} alt="" />
              ) : (
                <span className="record-thumb is-exercise"><BowlIcon /></span>
              )}
              <span className="record-text">
                <span className="t-caption">{isExercise ? '運動' : MEAL_LABEL[r.category]}</span>
                <span className="t-body">{r.name}</span>
              </span>
              <span className={`t-kcal record-kcal${isExercise ? ' is-exercise' : ''}`}>
                {r.kcal.toLocaleString()} kcal
              </span>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
