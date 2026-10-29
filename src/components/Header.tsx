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
}

export function Header({ title, sub, onPrev, onNext, right }: Props) {
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
        {sub && <p className="t-date">{sub}</p>}
        <h1 className="t-title">{title}</h1>
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
