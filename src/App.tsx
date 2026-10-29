import { useState } from 'react'
import { Header } from './components/Header'
import { TabBar, type Tab } from './components/TabBar'
import { Home } from './screens/Home'
import './App.css'

function SimpleScreen({ title }: { title: string }) {
  return (
    <>
      <Header title={title} />
      <section className="placeholder">
        <p className="t-sub" style={{ margin: 0 }}>この画面はこれから作ります。</p>
      </section>
    </>
  )
}

export default function App() {
  const [tab, setTab] = useState<Tab>('home')

  return (
    <div className="app">
      <main className={`screen${tab === 'home' ? ' is-fixed' : ''}`}>
        {tab === 'home' && <Home />}
        {tab === 'log' && <SimpleScreen title="流れ" />}
        {tab === 'change' && <SimpleScreen title="体の変化" />}
        {tab === 'mypage' && <SimpleScreen title="マイページ" />}
      </main>
      <TabBar current={tab} onChange={setTab} onAdd={() => {}} />
    </div>
  )
}
