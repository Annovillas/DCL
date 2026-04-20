import { useState, useEffect } from "react"

const GAS_URL = "https://script.google.com/macros/s/AKfycby5A9_XZi-sfT9aQc8IhCt86ToJqy3yBoyY399DhkHuaetu4iKZ7-v-_tCO-v78Zu8OTA/exec"
const SECRET = "anno2024admin"

const LANGS = {
  en: {
    title: "DCL Daily Report",
    subtitle: "Cleaning & Check Schedule",
    date: "Date",
    load: "Load",
    loading: "Loading...",
    copy: "Copy Report",
    copied: "Copied!",
    noData: "No tasks found for this date.",
    error: "Error loading data.",
    pax: "PAX",
    ci: "CI",
    co: "CO",
    channel: "Channel",
    phone: "Phone",
    lastCheck: "Last Check",
    firstCheck: "First Check",
    nextDay: "Next Day Plan",
    cts: "CTS",
    need: "NEED",
    tags: { bbq: "BBQ", bonfire: "Bonfire", pet: "Pet", deco: "Deco", meal: "Meal", beding: "Bedding" },
    cleanTypes: { LAST_CHECK: "Last Check", NEXT_DAY: "Prepare for Guest", FIRST_CHECK: "First Check" },
    total: "Total",
    rooms: "Rooms",
    totalPax: "Total PAX",
  },
  zh: {
    title: "DCL 每日報告",
    subtitle: "清潔與入住清單",
    date: "日期",
    load: "讀取",
    loading: "讀取中...",
    copy: "複製報告",
    copied: "已複製！",
    noData: "當天沒有任務。",
    error: "讀取失敗。",
    pax: "人數",
    ci: "入住",
    co: "退房",
    channel: "渠道",
    phone: "電話",
    lastCheck: "最後檢查",
    firstCheck: "First Check",
    nextDay: "明日準備",
    cts: "CTS",
    need: "需要",
    tags: { bbq: "BBQ", bonfire: "篝火", pet: "寵物", deco: "裝飾", meal: "餐飲", beding: "床鋪" },
    cleanTypes: { LAST_CHECK: "Last Check", NEXT_DAY: "明日準備", FIRST_CHECK: "First Check" },
    total: "共",
    rooms: "間",
    totalPax: "總人數",
  },
  ja: {
    title: "DCL 日次レポート",
    subtitle: "清掃・チェックスケジュール",
    date: "日付",
    load: "読込",
    loading: "読込中...",
    copy: "レポートをコピー",
    copied: "コピー完了！",
    noData: "この日のタスクはありません。",
    error: "データの読み込みに失敗しました。",
    pax: "人数",
    ci: "CI",
    co: "CO",
    channel: "チャネル",
    phone: "電話",
    lastCheck: "Last Check",
    firstCheck: "First Check",
    nextDay: "翌日準備",
    cts: "CTS",
    need: "要対応",
    tags: { bbq: "BBQ", bonfire: "焚き火", pet: "ペット", deco: "デコ", meal: "食事", beding: "ベッド" },
    cleanTypes: { LAST_CHECK: "Last Check", NEXT_DAY: "翌日準備", FIRST_CHECK: "First Check" },
    total: "合計",
    rooms: "室",
    totalPax: "総人数",
  }
}

const CLEAN_COLORS = {
  LAST_CHECK: { bg: "#e8f5e9", border: "#2e7d32", badge: "#2e7d32", label: "#1b5e20" },
  NEXT_DAY:   { bg: "#e0f7fa", border: "#00838f", badge: "#00838f", label: "#004d56" },
  FIRST_CHECK:{ bg: "#fffde7", border: "#f9a825", badge: "#f57f17", label: "#e65100" },
}

export default function DCLApp() {
  const today = new Date().toISOString().split("T")[0]
  const [date, setDate] = useState(today)
  const [lang, setLang] = useState<"en"|"zh"|"ja">("en")
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)

  const t = LANGS[lang]

  const loadData = async () => {
    setLoading(true)
    setError("")
    setData(null)
    try {
      const url = `${GAS_URL}?secret=${SECRET}&date=${date}`
      const res = await fetch(url)
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      setData(json)
    } catch (e: any) {
      setError(t.error)
    }
    setLoading(false)
  }

  const generateReport = () => {
    if (!data) return ""
    const lines: string[] = [`📋 DCL ${date}`, ""]
    const groups: Record<string, any[]> = { LAST_CHECK: [], NEXT_DAY: [], FIRST_CHECK: [] }
    data.villas.forEach((v: any) => groups[v.cleanType]?.push(v))

    const ORDER = ["FIRST_CHECK","LAST_CHECK","NEXT_DAY"]
    ORDER.forEach(type => {
      const villas = groups[type] || []
      if (!villas.length) return
      lines.push(`【${t.cleanTypes[type as keyof typeof t.cleanTypes]}】`)
      villas.forEach(v => {
        let line = `${v.villa}`
        if (v.name) line += ` · ${v.name}`
        if (v.pax) line += ` · ${v.pax}${t.pax}`
        if (v.ciTime) line += ` · CI ${v.ciTime}`
        const extras = ["bbq","bonfire","pet","deco","meal","beding"].filter(k => v[k])
        if (extras.length) line += ` · ${extras.map(k => t.tags[k as keyof typeof t.tags]).join(" ")}`
        lines.push(line)
      })
      lines.push("")
    })
    // dummy to close
    return lines.join("\n")
  }

  const copyReport = async () => {
    await navigator.clipboard.writeText(generateReport())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const tags = (v: any) => ["bbq","bonfire","pet","deco","meal","beding"].filter(k => v[k])

  return (
    <div style={{ minHeight:"100vh", background:"#0f1117", fontFamily:"'DM Sans', sans-serif", color:"#e8e0d0" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet"/>

      {/* Header */}
      <div style={{ borderBottom:"1px solid #2a2a3a", padding:"16px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, background:"#0f1117", zIndex:10 }}>
        <div>
          <div style={{ fontSize:18, fontWeight:600, letterSpacing:"0.02em", color:"#c9a96e" }}>{t.title}</div>
          <div style={{ fontSize:11, color:"#666", marginTop:1 }}>{t.subtitle}</div>
        </div>
        <div style={{ display:"flex", gap:6 }}>
          {(["en","zh","ja"] as const).map(l => (
            <button key={l} onClick={() => setLang(l)} style={{
              padding:"4px 10px", borderRadius:6, border:"none", cursor:"pointer", fontSize:12, fontWeight:500,
              background: lang===l ? "#c9a96e" : "#1e1e2e", color: lang===l ? "#0f1117" : "#888"
            }}>{l.toUpperCase()}</button>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div style={{ padding:"16px 20px", display:"flex", gap:10, alignItems:"center", borderBottom:"1px solid #1e1e2e" }}>
        <input type="date" value={date} onChange={e => setDate(e.target.value)}
          style={{ flex:1, padding:"10px 14px", borderRadius:8, border:"1px solid #2a2a3a", background:"#1a1a2e", color:"#e8e0d0", fontSize:14, fontFamily:"'DM Mono', monospace" }}/>
        <button onClick={loadData} disabled={loading} style={{
          padding:"10px 20px", borderRadius:8, border:"none", background:"#c9a96e", color:"#0f1117",
          fontWeight:600, fontSize:14, cursor:"pointer", whiteSpace:"nowrap"
        }}>{loading ? t.loading : t.load}</button>
        {data && (
          <button onClick={copyReport} style={{
            padding:"10px 16px", borderRadius:8, border:"1px solid #c9a96e", background:"transparent",
            color:"#c9a96e", fontWeight:500, fontSize:13, cursor:"pointer", whiteSpace:"nowrap"
          }}>{copied ? t.copied : t.copy}</button>
        )}
      </div>

      {/* Stats */}
      {data && (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:1, background:"#1e1e2e", margin:"0 0 1px 0" }}>
          {(["FIRST_CHECK","LAST_CHECK","NEXT_DAY"] as const).map(type => {
            const count = data.villas.filter((v:any) => v.cleanType === type).length
            const c = CLEAN_COLORS[type]
            return (
              <div key={type} style={{ padding:"12px 16px", background:"#0f1117", textAlign:"center" }}>
                <div style={{ fontSize:22, fontWeight:600, color:c.badge }}>{count}</div>
                <div style={{ fontSize:10, color:"#666", marginTop:2 }}>{t.cleanTypes[type]}</div>
              </div>
            )
          })}
          <div style={{ padding:"12px 16px", background:"#0f1117", textAlign:"center" }}>
            <div style={{ fontSize:22, fontWeight:600, color:"#c9a96e" }}>
              {data.villas.filter((v:any) => v.cleanType === "NEXT_DAY").reduce((s:number,v:any) => s + (v.pax||0), 0)}
            </div>
            <div style={{ fontSize:10, color:"#666", marginTop:2 }}>{t.totalPax}</div>
          </div>
        </div>
      )}

      {/* Content */}
      <div style={{ padding:"12px 16px" }}>
        {error && <div style={{ padding:16, background:"#1a0a0a", border:"1px solid #7f1d1d", borderRadius:8, color:"#f87171", fontSize:13 }}>{error}</div>}

        {data && data.villas.length === 0 && (
          <div style={{ padding:32, textAlign:"center", color:"#555" }}>{t.noData}</div>
        )}

        {data && (["FIRST_CHECK","LAST_CHECK","NEXT_DAY"] as const).map(type => {
          const villas = data.villas.filter((v:any) => v.cleanType === type)
          if (!villas.length) return null
          const c = CLEAN_COLORS[type]
          return (
            <div key={type} style={{ marginBottom:20 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                <div style={{ width:3, height:16, borderRadius:2, background:c.badge }}/>
                <span style={{ fontSize:12, fontWeight:600, color:c.badge, letterSpacing:"0.08em", textTransform:"uppercase" }}>
                  {t.cleanTypes[type]}
                </span>
                <span style={{ fontSize:11, color:"#555", marginLeft:4 }}>{villas.length}</span>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {villas.map((v: any, i: number) => (
                  <div key={i} style={{ background:"#141420", border:`1px solid #2a2a3a`, borderLeft:`3px solid ${c.border}`, borderRadius:8, padding:"12px 14px" }}>
                    <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:6 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                        <span style={{ fontSize:16, fontWeight:600, color:"#c9a96e" }}>{v.villa}</span>
                        {v.cts && <span style={{ fontSize:10, padding:"2px 7px", borderRadius:4, background:c.badge+"22", color:c.badge, fontWeight:600, fontFamily:"'DM Mono', monospace" }}>{v.cts}</span>}
                        {v.channel && <span style={{ fontSize:10, color:"#666", padding:"2px 7px", background:"#1e1e2e", borderRadius:4 }}>{v.channel}</span>}
                      </div>
                      {v.pax > 0 && <span style={{ fontSize:13, color:"#888", fontFamily:"'DM Mono', monospace" }}>{v.pax} {t.pax}</span>}
                    </div>

                    {v.name && <div style={{ fontSize:13, color:"#b0a898", marginBottom:4 }}>{v.name}</div>}

                    <div style={{ display:"flex", gap:12, flexWrap:"wrap", fontSize:12, color:"#666", marginBottom:6 }}>
                      {v.ciTime && <span>↑ {v.ciTime}</span>}
                      {v.coTime && <span>↓ {v.coTime}</span>}
                      {v.phone && <span style={{ color:"#888" }}>📞 {v.phone}</span>}
                    </div>

                    {tags(v).length > 0 && (
                      <div style={{ display:"flex", gap:4, flexWrap:"wrap", marginTop:4 }}>
                        {tags(v).map(k => (
                          <span key={k} style={{ fontSize:10, padding:"2px 8px", borderRadius:12, background:"#1e2535", color:"#7cb9e8", border:"1px solid #2a3a4a" }}>
                            {t.tags[k as keyof typeof t.tags]}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
