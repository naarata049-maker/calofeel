import { PageHeader } from '../components/PageHeader'
import { FormRow } from '../components/form'
import { ACTIVITIES, GOALS, formatRange, rangeOf } from '../data/settings'
import { useSettings } from '../settings'
import './MyPage.css'

// 「マイページ」タブ（Figma 7-1）
type Props = {
  weight: number
  onBurnDetail: () => void
  // ようこそ画面の一部を開いて変える（goal＝目的、body＝体のこと、all＝はじめから）
  onEdit: (step: 'goal' | 'body' | 'all') => void
}

export function MyPage({ weight, onBurnDetail, onEdit }: Props) {
  const { settings, dailyBurn } = useSettings()
  return (
    <div className="mypage">
      <PageHeader title="マイページ" />
      <button className="mypage-profile" onClick={() => onEdit('body')}>
        <span className="mypage-avatar" />
        <span className="mypage-name">
          <strong>あなた</strong>
          <small>{settings.age}歳・{settings.height}cm・{weight.toFixed(1)}kg</small>
        </span>
        <span className="mypage-arrow" aria-hidden="true">›</span>
      </button>
      <button className="mypage-burn" onClick={onBurnDetail}>
        <span className="mypage-burn-caption">日常の消費（普段の生活で消費する分）</span>
        <span className="mypage-burn-number"><strong>{dailyBurn.toLocaleString()}</strong>kcal</span>
        <span className="mypage-burn-range">
          <span className="mypage-chip">目安 {formatRange(rangeOf(settings, dailyBurn))} kcal</span>
          <span className="mypage-burn-note">運動した日はふえます</span>
        </span>
        <span className="mypage-burn-arrow" aria-hidden="true">›</span>
      </button>
      <div className="mypage-rows">
        <FormRow label="目的" value={GOALS[settings.goal].label} onClick={() => onEdit('goal')} />
        <FormRow label="普段の動き" value={ACTIVITIES[settings.activity].label} onClick={() => onEdit('body')} />
        <FormRow label="よくする運動" value="ウォーキング" />
        <FormRow label="食べ物の例に出さないもの" value="なし" />
        <FormRow label="通知" value="体重は週1回" />
        <FormRow label="このアプリについて" value="" onClick={() => onEdit('all')} />
      </div>
    </div>
  )
}
