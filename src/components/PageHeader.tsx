import { ChevronIcon, CloseIcon } from './icons'
import './PageHeader.css'

// 見出しだけのヘッダー（記録する・マイページ・内訳など）。左に戻る（‹）か閉じる（×）
export function PageHeader({ title, onBack, onClose }: { title: string; onBack?: () => void; onClose?: () => void }) {
  return (
    <header className="page-header">
      {onBack && (
        <button className="round-button" onClick={onBack} aria-label="戻る"><ChevronIcon direction="left" /></button>
      )}
      {onClose && (
        <button className="round-button" onClick={onClose} aria-label="閉じる"><CloseIcon /></button>
      )}
      <h1>{title}</h1>
    </header>
  )
}
