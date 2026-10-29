import type { ReactNode } from 'react'
import { ChevronIcon } from './icons'
import './Header.css'

// 画面上の共通ヘッダー：中央に見出し、左右に 42px の丸ボタン
type Props = {
  title: string
  sub?: string
  onPrev?: () => void
  onNext?: () => void
  right?: ReactNode
  // 日付をタップするとカレンダー（Figma 2-7）
  onDateClick?: () => void
}

export function Header({ title, sub, onPrev, onNext, right, onDateClick }: Props) {
  return (
    <header className="header">
      <div className="header-side">
        {onPrev && (
          <button className="round-button" onClick={onPrev} aria-label="前へ">
            <ChevronIcon direction="left" />
          </button>
        )}
      </div>
      <div className="header-title">
        {onDateClick ? (
          <button className="header-date" onClick={onDateClick} aria-label={`${sub ?? ''} 日付を選ぶ`}>
            <span className="t-date header-date-line">{sub}
              <svg width="11" height="7" viewBox="0 0 11 7" fill="none" aria-hidden="true">
                <path d="M1 1.2 5.5 5.5 10 1.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="t-title">{title}</span>
          </button>
        ) : (
          <>
            {sub && <p className="t-date">{sub}</p>}
            <h1 className="t-title">{title}</h1>
          </>
        )}
      </div>
      <div className="header-side">
        {onNext && (
          <button className="round-button" onClick={onNext} aria-label="次へ">
            <ChevronIcon />
          </button>
        )}
        {right}
      </div>
    </header>
  )
}
