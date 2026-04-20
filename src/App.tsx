import { useState } from "react"

const GAS_URL = "https://script.google.com/macros/s/AKfycby5A9_XZi-sfT9aQc8IhCt86ToJqy3yBoyY399DhkHuaetu4iKZ7-v-_tCO-v78Zu8OTA/exec"
const SECRET = "anno2024admin"

const VILLA_ORDER = [
  'Grand V','Panorama V','Villa A','Villa B','Villa C',
  'CUBE','Gekkouen','Stello','Morlla','Nevia','Vista',
  'MOKA','KOKO','MARU','RUNA','MEI','NOA','RIN','LEO','MOMO'
]

// Each villa: array of floor sections, each section has label + fields
// field: { label, key, default }
const VILLA_BED_CONFIG: Record<string, { floor: string, fields: { label: string, key: string, def: number }[] }[]> = {
  'Grand V': [
    { floor: '1F', fields: [{ label:'S', key:'1f_s1', def:2 }, { label:'S', key:'1f_s2', def:1 }] },
    { floor: '2F', fields: [{ label:'J', key:'2f_j', def:0 }, { label:'Sofa', key:'2f_sofa', def:0 }] },
  ],
  'Panorama V': [
    { floor: '1F', fields: [{ label:'J', key:'1f_j', def:0 }] },
    { floor: '2F', fields: [{ label:'J', key:'2f_j', def:2 }, { label:'D', key:'2f_d', def:1 }, { label:'S', key:'2f_s', def:0 }] },
  ],
  'Villa A': [
    { floor: '1F', fields: [{ label:'J', key:'1f_j', def:0 }] },
    { floor: '2F', fields: [{ label:'QD', key:'2f_qd', def:1 }, { label:'SD', key:'2f_sd', def:2 }, { label:'J', key:'2f_j', def:0 }] },
  ],
  'Villa B': [
    { floor: '1F', fields: [{ label:'J', key:'1f_j', def:0 }] },
    { floor: '2F', fields: [{ label:'QD', key:'2f_qd', def:1 }, { label:'SD', key:'2f_sd', def:2 }, { label:'J', key:'2f_j', def:0 }] },
  ],
  'Villa C': [
    { floor: '1F', fields: [{ label:'J', key:'1f_j', def:0 }] },
    { floor: '2F', fields: [{ label:'J', key:'2f_j', def:2 }, { label:'D', key:'2f_d', def:1 }, { label:'S', key:'2f_s', def:0 }] },
  ],
  'CUBE': [
    { floor: '2F', fields: [{ label:'D', key:'2f_d', def:2 }, { label:'S', key:'2f_s', def:0 }] },
  ],
  'Gekkouen': [
    { floor: '1F', fields: [{ label:'BigJ', key:'1f_bj', def:0 }, { label:'SmallJ', key:'1f_sj', def:0 }] },
    { floor: '2F South', fields: [{ label:'S', key:'2fs_s', def:2 }, { label:'J', key:'2fs_j', def:2 }] },
    { floor: '2F North', fields: [{ label:'D', key:'2fn_d', def:0 }, { label:'S', key:'2fn_s', def:0 }] },
  ],
  'Stello': [
    { floor: '1F', fields: [{ label:'J', key:'1f_j', def:3 }] },
    { floor: '2F', fields: [{ label:'QD', key:'2f_qd', def:1 }, { label:'BigJ', key:'2f_bj', def:0 }, { label:'SmallJ', key:'2f_sj', def:0 }, { label:'Study', key:'2f_st', def:0 }, { label:'Add', key:'2f_add', def:0 }] },
  ],
  'Morlla': [
    { floor: '1F', fields: [{ label:'J', key:'1f_j', def:3 }] },
    { floor: '2F', fields: [{ label:'QD', key:'2f_qd', def:1 }, { label:'BigJ', key:'2f_bj', def:0 }, { label:'SmallJ', key:'2f_sj', def:0 }, { label:'Study', key:'2f_st', def:0 }, { label:'Add', key:'2f_add', def:0 }] },
  ],
  'Nevia': [
    { floor: '1F', fields: [{ label:'J', key:'1f_j', def:3 }] },
    { floor: '2F', fields: [{ label:'QD', key:'2f_qd', def:1 }, { label:'BigJ', key:'2f_bj', def:0 }, { label:'SmallJ', key:'2f_sj', def:0 }, { label:'Study', key:'2f_st', def:0 }, { label:'Add', key:'2f_add', def:0 }] },
  ],
  'Vista': [
    { floor: '1F', fields: [{ label:'J', key:'1f_j', def:3 }] },
    { floor: '2F', fields: [{ label:'QD', key:'2f_qd', def:1 }, { label:'BigJ', key:'2f_bj', def:0 }, { label:'SmallJ', key:'2f_sj', def:0 }, { label:'Study', key:'2f_st', def:0 }, { label:'Add', key:'2f_add', def:0 }] },
  ],
  'MOKA':  [{ floor: '', fields: [{ label:'SD', key:'sd', def:2 }, { label:'Add', key:'add', def:0 }] }],
  'KOKO':  [{ floor: '', fields: [{ label:'SD', key:'sd', def:2 }, { label:'Add', key:'add', def:0 }] }],
  'MARU':  [{ floor: '', fields: [{ label:'S', key:'s', def:0 }, { label:'Add', key:'add', def:0 }] }],
  'RUNA':  [{ floor: '', fields: [{ label:'S', key:'s', def:2 }, { label:'Add', key:'add', def:0 }] }],
  'MEI':   [{ floor: '', fields: [{ label:'S', key:'s', def:2 }, { label:'Add', key:'add', def:0 }] }],
  'NOA':   [{ floor: '', fields: [{ label:'S', key:'s', def:2 }, { label:'Add', key:'add', def:0 }] }],
  'RIN':   [{ floor: '', fields: [{ label:'S', key:'s', def:0 }, { label:'Loft', key:'loft', def:0 }] }],
  'LEO':   [{ floor: '', fields: [{ label:'S', key:'s', def:2 }, { label:'Loft', key:'loft', def:0 }] }],
  'MOMO':  [{ floor: '', fields: [{ label:'S', key:'s', def:0 }, { label:'Loft', key:'loft', def:0 }] }],
}

// Init beds state: { villaName: { fieldKey: number } }
const initBeds = () => {
  const state: Record<string, Record<string, number>> = {}
  Object.entries(VILLA_BED_CONFIG).forEach(([villa, floors]) => {
    state[villa] = {}
    floors.forEach(floor => {
      floor.fields.forEach(f => { state[villa][f.key] = f.def })
    })
  })
  return state
}

const buildBedString = (villa: string, vals: Record<string, number>) => {
  const cfg = VILLA_BED_CONFIG[villa]
  if (!cfg) return ''
  const parts: string[] = []
  cfg.forEach(floor => {
    const fParts: string[] = []
    floor.fields.forEach(f => {
      const v = vals[f.key] ?? f.def
      if (v > 0) fParts.push(`${f.label}${v}`)
    })
    if (fParts.length > 0) {
      parts.push(floor.floor ? `${floor.floor} ${fParts.join('+')}` : fParts.join('+'))
    }
  })
  return parts.join(' / ')
}

const DEFAULT_ATTENTION = `‼️Attention Each villa‼️
*Spider & Beehives クモの巣 & ハチの巣
*Visible cigarette butts & Weeds 目立つ吸い殻 & 雑草`

const LANGS: any = {
  en: { title:"DCL Daily Report", load:"Load", loading:"Loading...", step1:"Select Date", step2:"Confirm & Edit", step3:"Copy Report", next:"Next →", back:"← Back", copy:"Copy", copied:"Copied!", firstCheck:"First Check", lastCheck:"Last Check", totalPax:"Total PAX", bedNote:"Bedmaking Memo", attention:"Attention Note", noData:"No tasks.", pr:"PR = Priority = Checkout cleaning required" },
  zh: { title:"DCL 每日報告", load:"讀取", loading:"讀取中...", step1:"選擇日期", step2:"確認編輯", step3:"複製報告", next:"下一步 →", back:"← 返回", copy:"複製", copied:"已複製！", firstCheck:"First Check", lastCheck:"Last Check", totalPax:"總人數", bedNote:"床型備註", attention:"注意事項", noData:"當天沒有任務。", pr:"PR = 優先 = 需要退房清潔" },
  ja: { title:"DCL 日次レポート", load:"読込", loading:"読込中...", step1:"日付選択", step2:"確認・編集", step3:"コピー", next:"次へ →", back:"← 戻る", copy:"コピー", copied:"コピー完了", firstCheck:"First Check", lastCheck:"Last Check", totalPax:"総人数", bedNote:"ベッドメモ", attention:"注意事項", noData:"タスクなし", pr:"PR = 優先 = チェックアウト清掃要" },
}

type Step = 'select'|'confirm'|'result'

export default function App() {
  const today = new Date().toISOString().split('T')[0]
  const [lang, setLang] = useState<'en'|'zh'|'ja'>('en')
  const [date, setDate] = useState(today)
  const [step, setStep] = useState<Step>('select')
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [beds, setBeds] = useState<Record<string, Record<string, number>>>(initBeds())
  const [attention, setAttention] = useState(DEFAULT_ATTENTION)
  const [copied, setCopied] = useState(false)
  const t = LANGS[lang]

  const loadData = async () => {
    setLoading(true); setError('')
    try {
      const res = await fetch(`${GAS_URL}?secret=${SECRET}&date=${date}`)
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      setData(json); setStep('confirm')
    } catch(e: any) { setError(e.message) }
    setLoading(false)
  }

  const sorted = (type: string) => !data ? [] : data.villas
    .filter((v: any) => v.cleanType === type)
    .sort((a: any, b: any) => (VILLA_ORDER.indexOf(a.villa)||99)-(VILLA_ORDER.indexOf(b.villa)||99))

  const cleanVillas = !data ? [] : data.villas
    .filter((v: any) => v.pax > 0)
    .sort((a: any, b: any) => (VILLA_ORDER.indexOf(a.villa)||99)-(VILLA_ORDER.indexOf(b.villa)||99))

  const totalPax = !data ? 0 : data.villas
    .filter((v: any) => v.cleanType === 'NEXT_DAY')
    .reduce((s: number, v: any) => s + (v.pax||0), 0)

  const setField = (villa: string, key: string, val: number) => {
    setBeds(prev => ({ ...prev, [villa]: { ...prev[villa], [key]: val } }))
  }

  const generateText = () => {
    const d = date.replace(/-/g,'')
    const lines = [d, 'DCL = Daily Cleaning List', '（PR＝Priority＝優先）', '']
    cleanVillas.forEach((v: any) => {
      const bedStr = buildBedString(v.villa, beds[v.villa] || {})
      let line = `${v.villa} ${v.pax}`
      if (bedStr) line += ` (${bedStr})`
      if (v.lastCheck === 'NEED') line += ' PR'
      lines.push(line)
    })
    lines.push('', attention)
    return lines.join('\n')
  }

  const copy = async () => {
    await navigator.clipboard.writeText(generateText())
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  const s = { background:'#0f1117', minHeight:'100vh', fontFamily:"'DM Sans',sans-serif", color:'#e8e0d0' }
  const card = { background:'#141420', border:'1px solid #2a2a3a', borderRadius:10, padding:'14px 16px', marginBottom:10 }
  const inp = { background:'#0f1117', border:'1px solid #2a2a3a', borderRadius:6, color:'#e8e0d0', padding:'4px 6px', fontSize:13, fontFamily:"'DM Mono',monospace", width:44, textAlign:'center' as const }
  const btn = (bg='#c9a96e', col='#0f1117') => ({ padding:'10px 20px', borderRadius:8, border:'none', background:bg, color:col, fontWeight:600, fontSize:14, cursor:'pointer' })

  return (
    <div style={s}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet"/>

      {/* Header */}
      <div style={{ borderBottom:'1px solid #2a2a3a', padding:'12px 16px', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, background:'#0f1117', zIndex:10 }}>
        <div style={{ fontSize:15, fontWeight:600, color:'#c9a96e' }}>{t.title}</div>
        <div style={{ display:'flex', gap:5 }}>
          {(['en','zh','ja'] as const).map(l => (
            <button key={l} onClick={() => setLang(l)} style={{ ...btn(lang===l?'#c9a96e':'#1e1e2e', lang===l?'#0f1117':'#888'), padding:'3px 9px', fontSize:11 }}>{l.toUpperCase()}</button>
          ))}
        </div>
      </div>

      {/* Steps */}
      <div style={{ display:'flex', padding:'8px 16px', gap:4, borderBottom:'1px solid #1e1e2e' }}>
        {([['select',t.step1],['confirm',t.step2],['result',t.step3]] as const).map(([s_,label]) => (
          <div key={s_} style={{ flex:1, textAlign:'center', fontSize:10, padding:'4px', borderRadius:5, color:step===s_?'#c9a96e':'#444', borderBottom:step===s_?'2px solid #c9a96e':'2px solid transparent' }}>{label}</div>
        ))}
      </div>

      <div style={{ padding:'12px 16px' }}>

        {/* STEP 1 */}
        {step==='select' && (
          <div style={card}>
            <div style={{ fontSize:12, color:'#666', marginBottom:8 }}>{t.step1}</div>
            <input type="date" value={date} onChange={e=>setDate(e.target.value)}
              style={{ width:'100%', background:'#1a1a2e', border:'1px solid #2a2a3a', borderRadius:8, color:'#e8e0d0', padding:'12px', fontSize:16, marginBottom:12, boxSizing:'border-box' as const }}/>
            {error && <div style={{ color:'#f87171', fontSize:12, marginBottom:8 }}>{error}</div>}
            <button onClick={loadData} disabled={loading} style={{ ...btn(), width:'100%', fontSize:15 }}>
              {loading ? t.loading : t.load}
            </button>
          </div>
        )}

        {/* STEP 2 */}
        {step==='confirm' && data && (
          <div>
            {/* Stats */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, marginBottom:12 }}>
              {[{label:t.firstCheck, val:sorted('FIRST_CHECK').length, col:'#f57f17'},
                {label:t.lastCheck,  val:sorted('LAST_CHECK').length,  col:'#4ecb7a'},
                {label:t.totalPax,   val:totalPax,                      col:'#c9a96e'}].map(s => (
                <div key={s.label} style={{ ...card, textAlign:'center', marginBottom:0, padding:'10px 8px' }}>
                  <div style={{ fontSize:22, fontWeight:700, color:s.col }}>{s.val}</div>
                  <div style={{ fontSize:9, color:'#555', marginTop:2 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Bed config */}
            <div style={card}>
              <div style={{ fontSize:11, color:'#888', marginBottom:12, fontWeight:600, letterSpacing:'0.06em' }}>{t.bedNote}</div>
              {cleanVillas.map((v: any) => {
                const cfg = VILLA_BED_CONFIG[v.villa]
                return (
                  <div key={v.villa} style={{ marginBottom:12, paddingBottom:12, borderBottom:'1px solid #1e1e2e' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:6 }}>
                      <span style={{ fontSize:13, fontWeight:600, color: v.lastCheck==='NEED'?'#4ecb7a':'#c9a96e' }}>{v.villa}</span>
                      {v.lastCheck==='NEED' && <span style={{ fontSize:9, background:'#0a1f12', color:'#4ecb7a', padding:'1px 6px', borderRadius:4, border:'1px solid #2e7d32' }}>PR</span>}
                      <span style={{ fontSize:16, fontWeight:700, color:'#e8e0d0', marginLeft:'auto' }}>{v.pax} <span style={{fontSize:11, color:'#888'}}>pax</span></span>
                    </div>
                    {cfg ? cfg.map(floor => (
                      <div key={floor.floor} style={{ display:'flex', alignItems:'center', flexWrap:'wrap', gap:6, marginBottom:4 }}>
                        {floor.floor && <span style={{ fontSize:10, color:'#555', width:60, flexShrink:0, fontFamily:"'DM Mono',monospace" }}>{floor.floor}</span>}
                        {floor.fields.map(f => (
                          <div key={f.key} style={{ display:'flex', alignItems:'center', gap:3 }}>
                            <span style={{ fontSize:10, color:'#888' }}>{f.label}</span>
                            <input type="number" min={0} max={99} value={beds[v.villa]?.[f.key] ?? f.def}
                              onChange={e => setField(v.villa, f.key, parseInt(e.target.value)||0)}
                              style={inp}/>
                          </div>
                        ))}
                      </div>
                    )) : null}
                    {(() => {
                      const total = cfg ? cfg.reduce((s, fl) => s + fl.fields.reduce((ss, f) => ss + (beds[v.villa]?.[f.key] ?? f.def), 0), 0) : 0
                      const match = total === v.pax
                      return (
                        <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:6, padding:'4px 10px', borderRadius:6, background: match ? '#0a1f12' : '#1f0a0a', border: `1px solid ${match?'#2e7d32':'#7f1d1d'}` }}>
                          <span style={{ fontSize:12, fontFamily:"'DM Mono',monospace", color:'#888' }}>Σ {total}</span>
                          <span style={{ fontSize:12, color: match?'#4ecb7a':'#f87171', fontWeight:600 }}>
                            {match ? '✅ Ready' : `⚠️ ${total} / ${v.pax}`}
                          </span>
                        </div>
                      )
                    })()}
                  </div>
                )
              })}
            </div>

            {/* Attention */}
            <div style={card}>
              <div style={{ fontSize:11, color:'#888', marginBottom:8, fontWeight:600 }}>{t.attention}</div>
              <textarea value={attention} onChange={e=>setAttention(e.target.value)} rows={4}
                style={{ width:'100%', background:'#0f1117', border:'1px solid #2a2a3a', borderRadius:8, color:'#e8e0d0', padding:'10px', fontSize:12, fontFamily:'inherit', resize:'vertical' as const, boxSizing:'border-box' as const, lineHeight:1.7 }}/>
            </div>

            <div style={{ display:'flex', gap:8 }}>
              <button onClick={()=>setStep('select')} style={{ ...btn('#1e1e2e','#888'), flex:1 }}>{t.back}</button>
              <button onClick={()=>setStep('result')} style={{ ...btn(), flex:2 }}>{t.next}</button>
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step==='result' && (
          <div>
            <div style={{ ...card, background:'#0a0a14' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                <span style={{ fontSize:11, color:'#444', fontFamily:"'DM Mono',monospace" }}>DCL · {date}</span>
                <button onClick={copy} style={{ ...btn(copied?'#2e7d32':'#c9a96e'), padding:'6px 18px', fontSize:12 }}>
                  {copied ? t.copied : t.copy}
                </button>
              </div>
              <pre style={{ fontFamily:"'DM Mono',monospace", fontSize:13, lineHeight:1.9, color:'#c8d4e8', whiteSpace:'pre-wrap', margin:0, background:'#0f1117', padding:14, borderRadius:8, border:'1px solid #1e1e2e' }}>
                {generateText()}
              </pre>
            </div>
            <div style={{ ...card, background:'#0a1f12', border:'1px solid #1b5e20', padding:'8px 14px' }}>
              <div style={{ fontSize:11, color:'#4ecb7a' }}>{t.pr}</div>
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={()=>setStep('confirm')} style={{ ...btn('#1e1e2e','#888'), flex:1 }}>{t.back}</button>
              <button onClick={()=>{ setStep('select'); setData(null) }} style={{ ...btn('#1a1a2e','#666'), flex:1 }}>New Date</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
