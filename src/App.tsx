import { useState } from "react"

const GAS_URL = "https://script.google.com/macros/s/AKfycby5A9_XZi-sfT9aQc8IhCt86ToJqy3yBoyY399DhkHuaetu4iKZ7-v-_tCO-v78Zu8OTA/exec"
const SECRET = "anno2024admin"

const VILLA_ORDER = [
  'Grand V', 'Panorama V', 'Villa A', 'Villa B', 'Villa C',
  'CUBE', 'Gekkouen', 'Stello', 'Morlla', 'Nevia', 'Vista',
  'MOKA', 'KOKO', 'MARU', 'RUNA', 'MEI', 'NOA', 'RIN', 'LEO', 'MOMO'
]

const DEFAULT_BEDS: Record<string, string> = {
  'Grand V':    '',
  'Panorama V': '1F J / 2F J+D+S',
  'Villa A':    '1F J / 2F QD+SD+J',
  'Villa B':    '1F J / 2F QD+SD+J',
  'Villa C':    '1F J / 2F J+D+S',
  'CUBE':       '2F D+S',
  'Gekkouen':   '1F BigJ+SmallJ / 2F South S+J / North D+S',
  'Stello':     '1F J / 2F QD+BigJ+SmallJ+Study',
  'Morlla':     '1F J / 2F QD+BigJ+SmallJ+Study',
  'Nevia':      '1F J / 2F QD+BigJ+SmallJ+Study',
  'Vista':      '1F J / 2F QD+BigJ+SmallJ+Study',
  'MOKA':       'SD+additional',
  'KOKO':       'SD+additional',
  'MARU':       'S+additional',
  'RUNA':       'S+additional',
  'MEI':        'S+additional',
  'NOA':        'S+additional',
  'RIN':        'S+loft',
  'LEO':        'S+loft',
  'MOMO':       'S+loft',
}

const DEFAULT_ATTENTION = `‼️Attention Each villa‼️
*Spider & Beehives クモの巣 & ハチの巣
*Visible cigarette butts & Weeds 目立つ吸い殻 & 雑草`

const LANGS: any = {
  en: { title: "DCL Daily Report", load: "Load", loading: "Loading...", step1: "Select Date", step2: "Confirm & Edit", step3: "Copy Report", next: "Next →", back: "← Back", copy: "Copy", copied: "Copied!", firstCheck: "First Check", lastCheck: "Last Check", totalPax: "Total PAX", bedNote: "Bedmaking Memo", attention: "Attention Note", noData: "No tasks for this date.", pr: "PR = Priority = Checkout cleaning required" },
  zh: { title: "DCL 每日報告", load: "讀取", loading: "讀取中...", step1: "選擇日期", step2: "確認編輯", step3: "複製報告", next: "下一步 →", back: "← 返回", copy: "複製", copied: "已複製！", firstCheck: "First Check", lastCheck: "Last Check", totalPax: "總人數", bedNote: "床型備註", attention: "注意事項", noData: "當天沒有任務。", pr: "PR = 優先 = 需要退房清潔" },
  ja: { title: "DCL 日次レポート", load: "読込", loading: "読込中...", step1: "日付選択", step2: "確認・編集", step3: "レポートコピー", next: "次へ →", back: "← 戻る", copy: "コピー", copied: "コピー完了", firstCheck: "First Check", lastCheck: "Last Check", totalPax: "総人数", bedNote: "ベッドメモ", attention: "注意事項", noData: "タスクなし", pr: "PR = 優先 = チェックアウト清掃要" },
}

type Step = 'select' | 'confirm' | 'result'

export default function App() {
  const today = new Date().toISOString().split('T')[0]
  const [lang, setLang] = useState<'en'|'zh'|'ja'>('en')
  const [date, setDate] = useState(today)
  const [step, setStep] = useState<Step>('select')
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [beds, setBeds] = useState<Record<string,string>>({...DEFAULT_BEDS})
  const [attention, setAttention] = useState(DEFAULT_ATTENTION)
  const [copied, setCopied] = useState(false)

  const t = LANGS[lang]

  const loadData = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${GAS_URL}?secret=${SECRET}&date=${date}`)
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      setData(json)
      setStep('confirm')
    } catch(e: any) {
      setError(e.message)
    }
    setLoading(false)
  }

  // Sort villas by VILLA_ORDER
  const getSortedVillas = (type: string) => {
    if (!data) return []
    const villas = data.villas.filter((v: any) => v.cleanType === type)
    return villas.sort((a: any, b: any) => {
      const ai = VILLA_ORDER.indexOf(a.villa)
      const bi = VILLA_ORDER.indexOf(b.villa)
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi)
    })
  }

  const firstCheckVillas = getSortedVillas('FIRST_CHECK')
  const lastCheckVillas = getSortedVillas('LAST_CHECK')
  const totalPax = data?.villas.filter((v:any) => v.cleanType === 'NEXT_DAY').reduce((s:number, v:any) => s + (v.pax||0), 0) || 0

  const generateText = () => {
    const d = date.replace(/-/g, '')
    const lines: string[] = [
      d,
      'DCL = Daily Cleaning List',
      '（PR＝Priority＝優先）',
      '',
    ]

    // All villas that need cleaning (LAST_CHECK or NEXT_DAY with pax > 0), sorted by VILLA_ORDER
    const cleanVillas = data?.villas
      .filter((v: any) => v.pax > 0)
      .sort((a: any, b: any) => {
        const ai = VILLA_ORDER.indexOf(a.villa)
        const bi = VILLA_ORDER.indexOf(b.villa)
        return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi)
      }) || []

    cleanVillas.forEach((v: any) => {
      const bed = beds[v.villa]
      let line = `${v.villa} ${v.pax}`
      if (bed) line += ` (${bed})`
      if (v.lastCheck === 'NEED') line += ' PR'
      lines.push(line)
    })

    lines.push('')
    lines.push(attention)
    return lines.join('\n')
  }

  const copy = async () => {
    await navigator.clipboard.writeText(generateText())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const s = { background: '#0f1117', minHeight: '100vh', fontFamily: "'DM Sans', sans-serif", color: '#e8e0d0' }
  const card = { background: '#141420', border: '1px solid #2a2a3a', borderRadius: 10, padding: '14px 16px', marginBottom: 10 }
  const input = { width: '100%', background: '#1a1a2e', border: '1px solid #2a2a3a', borderRadius: 8, color: '#e8e0d0', padding: '8px 12px', fontSize: 13, fontFamily: 'inherit', boxSizing: 'border-box' as const }
  const btn = (color = '#c9a96e', textColor = '#0f1117') => ({ padding: '10px 20px', borderRadius: 8, border: 'none', background: color, color: textColor, fontWeight: 600, fontSize: 14, cursor: 'pointer' })

  return (
    <div style={s}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet"/>

      {/* Header */}
      <div style={{ borderBottom: '1px solid #2a2a3a', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: '#0f1117', zIndex: 10 }}>
        <div style={{ fontSize: 16, fontWeight: 600, color: '#c9a96e' }}>{t.title}</div>
        <div style={{ display: 'flex', gap: 5 }}>
          {(['en','zh','ja'] as const).map(l => (
            <button key={l} onClick={() => setLang(l)} style={{ ...btn(lang===l ? '#c9a96e' : '#1e1e2e', lang===l ? '#0f1117' : '#888'), padding: '4px 10px', fontSize: 11 }}>{l.toUpperCase()}</button>
          ))}
        </div>
      </div>

      {/* Steps indicator */}
      <div style={{ display: 'flex', padding: '10px 16px', gap: 8, borderBottom: '1px solid #1e1e2e' }}>
        {[['select', t.step1], ['confirm', t.step2], ['result', t.step3]].map(([s_, label]) => (
          <div key={s_} style={{ flex: 1, textAlign: 'center', fontSize: 11, padding: '4px 8px', borderRadius: 6, background: step === s_ ? '#c9a96e22' : 'transparent', color: step === s_ ? '#c9a96e' : '#444', borderBottom: step === s_ ? '2px solid #c9a96e' : '2px solid transparent' }}>{label as string}</div>
        ))}
      </div>

      <div style={{ padding: '14px 16px' }}>

        {/* STEP 1: Select Date */}
        {step === 'select' && (
          <div>
            <div style={card}>
              <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>{t.step1}</div>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ ...input, fontSize: 16, padding: '12px', marginBottom: 12 }}/>
              {error && <div style={{ color: '#f87171', fontSize: 12, marginBottom: 8 }}>{error}</div>}
              <button onClick={loadData} disabled={loading} style={{ ...btn(), width: '100%', fontSize: 15 }}>
                {loading ? t.loading : t.load}
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Confirm */}
        {step === 'confirm' && data && (
          <div>
            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 14 }}>
              {[
                { label: t.firstCheck, value: firstCheckVillas.length, color: '#f57f17' },
                { label: t.lastCheck, value: lastCheckVillas.length, color: '#2e7d32' },
                { label: t.totalPax, value: totalPax, color: '#c9a96e' },
              ].map(stat => (
                <div key={stat.label} style={{ ...card, textAlign: 'center', marginBottom: 0 }}>
                  <div style={{ fontSize: 24, fontWeight: 700, color: stat.color }}>{stat.value}</div>
                  <div style={{ fontSize: 10, color: '#666', marginTop: 2 }}>{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Bedmaking memos */}
            <div style={card}>
              <div style={{ fontSize: 12, color: '#888', marginBottom: 10, fontWeight: 600 }}>{t.bedNote}</div>
              {data.villas
                .filter((v: any) => v.pax > 0)
                .sort((a: any, b: any) => (VILLA_ORDER.indexOf(a.villa)||99) - (VILLA_ORDER.indexOf(b.villa)||99))
                .map((v: any) => (
                  <div key={v.villa} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <div style={{ width: 80, fontSize: 12, color: v.lastCheck === 'NEED' ? '#4ecb7a' : '#c9a96e', fontWeight: 600, flexShrink: 0 }}>
                      {v.villa}
                      {v.lastCheck === 'NEED' && <span style={{ fontSize: 9, color: '#4ecb7a', marginLeft: 3 }}>PR</span>}
                    </div>
                    <div style={{ fontSize: 11, color: '#666', width: 24, textAlign: 'center' }}>{v.pax}</div>
                    <input
                      value={beds[v.villa] || ''}
                      onChange={e => setBeds(prev => ({ ...prev, [v.villa]: e.target.value }))}
                      placeholder="e.g. J2+D1+S2"
                      style={{ ...input, flex: 1, fontSize: 12, padding: '6px 10px' }}
                    />
                  </div>
                ))}
            </div>

            {/* Attention */}
            <div style={card}>
              <div style={{ fontSize: 12, color: '#888', marginBottom: 8, fontWeight: 600 }}>{t.attention}</div>
              <textarea
                value={attention}
                onChange={e => setAttention(e.target.value)}
                rows={4}
                style={{ ...input, resize: 'vertical' as const, lineHeight: 1.6 }}
              />
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setStep('select')} style={{ ...btn('#1e1e2e', '#888'), flex: 1 }}>{t.back}</button>
              <button onClick={() => setStep('result')} style={{ ...btn(), flex: 2 }}>{t.next}</button>
            </div>
          </div>
        )}

        {/* STEP 3: Result */}
        {step === 'result' && (
          <div>
            <div style={{ ...card, background: '#0a0a14' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div style={{ fontSize: 11, color: '#555', fontFamily: "'DM Mono', monospace" }}>DCL · {date}</div>
                <button onClick={copy} style={{ ...btn(copied ? '#2e7d32' : '#c9a96e'), padding: '6px 16px', fontSize: 12 }}>
                  {copied ? t.copied : t.copy}
                </button>
              </div>
              <pre style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, lineHeight: 1.8, color: '#c8d4e8', whiteSpace: 'pre-wrap', margin: 0, background: '#0f1117', padding: 14, borderRadius: 8, border: '1px solid #1e1e2e' }}>
                {generateText()}
              </pre>
            </div>

            {/* PR legend */}
            <div style={{ ...card, background: '#0a1f12', border: '1px solid #1b5e20' }}>
              <div style={{ fontSize: 11, color: '#4ecb7a' }}>{t.pr}</div>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setStep('confirm')} style={{ ...btn('#1e1e2e', '#888'), flex: 1 }}>{t.back}</button>
              <button onClick={() => setStep('select')} style={{ ...btn('#1a1a2e', '#666'), flex: 1 }}>New Date</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
