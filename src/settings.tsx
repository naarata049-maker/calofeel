import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { DEFAULT_SETTINGS, dailyBurnOf, type Settings } from './data/settings'

// 設定はこのスマホ（ブラウザ）に残す。読み込み直しても消えない
const KEY = 'calofeel-settings'

function load(): Settings {
  try {
    const saved = localStorage.getItem(KEY)
    if (saved) return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) }
  } catch { /* 残せないときは毎回はじめから */ }
  return DEFAULT_SETTINGS
}

type Value = {
  settings: Settings
  dailyBurn: number
  update: (patch: Partial<Settings>) => void
}

const SettingsContext = createContext<Value | null>(null)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState(load)

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(settings)) } catch { /* 同上 */ }
  }, [settings])

  const value: Value = {
    settings,
    dailyBurn: dailyBurnOf(settings),
    update: (patch) => setSettings((s) => ({ ...s, ...patch })),
  }
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSettings() {
  const v = useContext(SettingsContext)
  if (!v) throw new Error('SettingsProvider がありません')
  return v
}
