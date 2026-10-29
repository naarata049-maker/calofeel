// Figma のタブアイコン（24px 線画）。色は currentColor で選択中/非選択を切り替える。
type IconProps = { size?: number }

export function HomeIcon({ size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 10.5L12 4L20 10.5V19.5C20 19.7652 19.8946 20.0196 19.7071 20.2071C19.5196 20.3946 19.2652 20.5 19 20.5H14.5V15H9.5V20.5H5C4.73478 20.5 4.48043 20.3946 4.29289 20.2071C4.10536 20.0196 4 19.7652 4 19.5V10.5Z"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  )
}

export function LogIcon({ size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6.8 12H5.2C4.53726 12 4 12.5373 4 13.2V19.3C4 19.9627 4.53726 20.5 5.2 20.5H6.8C7.46274 20.5 8 19.9627 8 19.3V13.2C8 12.5373 7.46274 12 6.8 12Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12.8 7.5H11.2C10.5373 7.5 10 8.03726 10 8.7V19.3C10 19.9627 10.5373 20.5 11.2 20.5H12.8C13.4627 20.5 14 19.9627 14 19.3V8.7C14 8.03726 13.4627 7.5 12.8 7.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18.8 10H17.2C16.5373 10 16 10.5373 16 11.2V19.3C16 19.9627 16.5373 20.5 17.2 20.5H18.8C19.4627 20.5 20 19.9627 20 19.3V11.2C20 10.5373 19.4627 10 18.8 10Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2.5 5H21.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeDasharray="2 2.4" />
    </svg>
  )
}

export function ChangeIcon({ size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3.5 6.5L8.5 11.5L12.5 8.5L19.5 15.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M19.5 17.5C20.6046 17.5 21.5 16.6046 21.5 15.5C21.5 14.3954 20.6046 13.5 19.5 13.5C18.3954 13.5 17.5 14.3954 17.5 15.5C17.5 16.6046 18.3954 17.5 19.5 17.5Z" fill="currentColor" />
      <path d="M3.5 20.5H20.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function MyPageIcon({ size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 12.2992C14.0987 12.2992 15.8 10.5979 15.8 8.49922C15.8 6.40054 14.0987 4.69922 12 4.69922C9.90133 4.69922 8.20001 6.40054 8.20001 8.49922C8.20001 10.5979 9.90133 12.2992 12 12.2992Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4.5 20.4992C5.5 16.6992 8.5 14.6992 12 14.6992C15.5 14.6992 18.5 16.6992 19.5 20.4992" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function ChevronIcon({ direction = 'right' }: { direction?: 'left' | 'right' }) {
  return (
    <svg
      width="10" height="14" viewBox="0 0 10 14" fill="none" aria-hidden="true"
      style={direction === 'left' ? { transform: 'rotate(180deg)' } : undefined}
    >
      <path d="M2.5 1.80078L7.6 7.00078L2.5 12.2008" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function ExerciseIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none" aria-hidden="true">
      <path d="M5 21.25C4.98037 19.4229 5.46169 17.6254 6.3917 16.0527C7.3217 14.4799 8.66484 13.192 10.2752 12.3288C11.8857 11.4656 13.7018 11.0602 15.5264 11.1565C17.351 11.2528 19.1144 11.8471 20.625 12.875" stroke="#9DB9D8" strokeWidth="3.75" strokeLinecap="round" />
      <path d="M20.625 12.875C21.9881 13.8022 23.1008 15.052 23.8641 16.5132C24.6274 17.9744 25.0176 19.6016 25 21.25" stroke="#3D78B8" strokeWidth="3.75" strokeLinecap="round" />
      <path d="M23.125 4.375V10.625M20 7.5H26.25" stroke="#3D78B8" strokeWidth="2.25" strokeLinecap="round" />
    </svg>
  )
}

// 記録する画面のアイコン（Figma R1〜R4 から）
export function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M2 2L12 12M12 2L2 12" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export function PencilIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M9.5 2.5L11.5 4.5L5 11H3V9L9.5 2.5Z" stroke="#1E2422" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  )
}

export function PlusMinusIcon({ plus }: { plus?: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d={plus ? 'M7 1V13M1 7H13' : 'M1 7H13'} stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export function BackspaceIcon() {
  return (
    <svg width="22" height="16" viewBox="0 0 22 16" fill="none" aria-hidden="true">
      <path d="M8 2H20V14H8L2 8L8 2Z" stroke="#1E2422" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M11 6L15 10M15 6L11 10" stroke="#1E2422" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

export function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 8.5L6.2 11.5L13 4.5" stroke="#3E7A58" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// カメラの枠（四すみのかぎ）
export function FinderFrame() {
  return (
    <svg width="240" height="240" viewBox="0 0 240 240" fill="none" aria-hidden="true">
      <path d="M2 40V14C2 7 7 2 14 2H40M200 2H226C233 2 238 7 238 14V40M238 200V226C238 233 233 238 226 238H200M40 238H14C7 238 2 233 2 226V200" stroke="white" strokeWidth="4" strokeLinecap="round" />
    </svg>
  )
}

// 写真がない食事の記録に出す仮の絵（お椀）
export function BowlIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true">
      <path d="M3 12H23C23 17.5 18.5 21 13 21C7.5 21 3 17.5 3 12Z" stroke="#8a928f" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M9 8.5C9 7 10 6.5 10 5M13 8.5C13 7 14 6.5 14 5M17 8.5C17 7 18 6.5 18 5" stroke="#8a928f" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}
