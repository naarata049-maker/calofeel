import type { ComponentType } from 'react'
import { ChangeIcon, HomeIcon, LogIcon, MyPageIcon } from './icons'
import './TabBar.css'

export type Tab = 'home' | 'log' | 'change' | 'mypage'

const TABS: { id: Tab; label: string; Icon: ComponentType }[] = [
  { id: 'home', label: 'ホーム', Icon: HomeIcon },
  { id: 'log', label: '記録', Icon: LogIcon },
  { id: 'change', label: '変化', Icon: ChangeIcon },
  { id: 'mypage', label: 'マイページ', Icon: MyPageIcon },
]

type Props = {
  current: Tab
  onChange: (tab: Tab) => void
  onAdd: () => void
}

export function TabBar({ current, onChange, onAdd }: Props) {
  const renderTab = ({ id, label, Icon }: (typeof TABS)[number]) => (
    <button
      key={id}
      className={`tab${current === id ? ' is-current' : ''}`}
      onClick={() => onChange(id)}
      aria-current={current === id ? 'page' : undefined}
    >
      <Icon />
      <span>{label}</span>
    </button>
  )

  return (
    <nav className="tabbar">
      {TABS.slice(0, 2).map(renderTab)}
      <div className="tab-add-slot">
        <button className="tab-add" onClick={onAdd} aria-label="記録する">
          <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
            <path d="M11 2V20M2 11H20" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      {TABS.slice(2).map(renderTab)}
    </nav>
  )
}
