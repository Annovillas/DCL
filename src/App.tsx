import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Users, Clock, AlertCircle, FileText, Globe, Printer, Copy, Check, Upload } from 'lucide-react';

type Lang = 'ja' | 'en';
type Priority = 'HIGH' | 'MEDIUM' | 'LOW';

interface Task {
  room: string;
  roomCode: string;
  platform: string;
  guestName: string;
  bookingSystem: string;
  status: string;
  arrivalTime: string;
  guestCount: number;
  needIdCheck: boolean;
  needPR: boolean;
  contact: string;
  cleaningPriority: Priority;
  notes: string;
  bbq: boolean;
  bonfire: boolean;
  pet: boolean;
}

// Verified column indices (0-based) from actual Excel file:
// B=1(date), H=7(ROOM), I=8(code), J=9(platform), K=10(guest),
// L=11(status), M=12(DR), N=13(arrival), P=15(pax), T=19(連泊),
// U=20(contact), AA=26(当日), AF=31(当日firstcheck)
const C = { B:1, H:7, I:8, J:9, K:10, L:11, M:12, N:13, P:15, T:19, U:20, AA:26, AF:31 };

const ROOMS = new Set([
  'MOKA','KOKO','MARU','RUNA','MEI','NOA','RIN','LEO','MOMO',
  '月江苑','Grand V','panorama','Villa A','Villa B','Villa C',
  'cube','Villa D','Villa E','Villa F','Villa G'
]);

const formatTime = (val: unknown): string => {
  if (!val) return '';
  if (typeof val === 'string') {
    const m = val.match(/\d{1,2}:\d{2}(?:\s*[-~]\s*\d{1,2}:\d{2})?/);
    return m ? m[0] : '';
  }
  // Excel time is a fraction of a day
  if (typeof val === 'number' && val < 1) {
    const totalMin = Math.round(val * 24 * 60);
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    return `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}`;
  }
  return String(val);
};

const parseExcelFile = (file: File): Promise<Task[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: 'array', cellDates: true });

        // Use sheet '03Mar26' or first sheet
        const sheetName = wb.SheetNames.includes('03Mar26') ? '03Mar26' : wb.SheetNames[0];
        const ws = wb.Sheets[sheetName];
        const rows: unknown[][] = XLSX.utils.sheet_to_json(ws, { header: 1, raw: true, defval: null });

        const tasks: Task[] = [];
        // Data is always in rows 4-23 (index 3-22)
        for (let i = 3; i <= 22; i++) {
          const row = rows[i] as unknown[];
          if (!row) continue;

          const room = String(row[C.H] || '').trim();
          if (!ROOMS.has(room)) continue;

          // Rule 1: T must NOT be K or E
          const tVal = String(row[C.T] ?? '').trim().toUpperCase();
          if (tVal === 'K' || tVal === 'E') continue;

          // Rule 2: AA has a number OR AF(firstcheck)='need'
          const aa    = row[C.AA];
          const aaStr = String(aa ?? '').trim().toLowerCase();
          const af    = String(row[C.AF] ?? '').trim().toLowerCase();
          const aaHasNumber = aa && aaStr !== 'x' && aaStr !== '' && !isNaN(Number(aa));
          const afNeed = af === 'need';
          if (!aaHasNumber && !afNeed) continue;

          const guestName  = String(row[C.K] || '').trim();
          const contact    = String(row[C.U] || '').trim();
          const arrivalRaw = row[C.N];
          const arrivalTime = formatTime(arrivalRaw);
          const combined   = contact + ' ' + String(arrivalRaw || '');

          tasks.push({
            room,
            roomCode:      String(row[C.I] || '').trim(),
            platform:      String(row[C.J] || '').trim(),
            guestName,
            bookingSystem: String(row[C.L] || '').trim(),
            status:        String(row[C.M] || '').trim(),
            arrivalTime,
            guestCount:    Number(row[C.P]) || 0,
            needIdCheck:   false,
            needPR:        guestName.length > 0,
            contact,
            cleaningPriority: guestName.length > 0 ? 'HIGH' : 'MEDIUM',
            notes:         '',
            bbq:     /BBQ/i.test(combined),
            bonfire: /篝火|BONFIRE/i.test(combined),
            pet:     /ペット|PET/i.test(combined),
          });
        }
        resolve(tasks);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
};

const T = (lang: Lang) => ({
  title:       lang==='ja' ? '🏠 清掃タスク自動生成システム' : '🏠 Cleaning Task Generator',
  subtitle:    lang==='ja' ? 'Excelファイルから自動生成' : 'Auto-generated from Excel file',
  uploadTitle: lang==='ja' ? '📂 Excelファイルをアップロード' : '📂 Upload Excel File',
  uploadHint:  lang==='ja' ? '.xlsxファイルを選択またはドラッグ＆ドロップ' : 'Select or drag & drop .xlsx file',
  dateLabel:   lang==='ja' ? '清掃日を選択:' : 'Select cleaning date:',
  generateBtn: lang==='ja' ? '✅ 清掃リストを生成' : '✅ Generate List',
  totalRooms:  lang==='ja' ? '総清掃室数' : 'Total Rooms',
  prCount:     lang==='ja' ? '優先対応(PR)' : 'Priority (PR)',
  totalGuests: lang==='ja' ? '総宿泊人数' : 'Total Guests',
  taskList:    lang==='ja' ? '📝 清掃タスクリスト' : '📝 Cleaning Task List',
  simple:      lang==='ja' ? '📝 簡易' : '📝 Simple',
  detail:      lang==='ja' ? '📋 詳細' : '📋 Detail',
  print:       lang==='ja' ? '🖨️ 印刷' : '🖨️ Print',
  copy:        lang==='ja' ? '📋 コピー' : '📋 Copy',
  copied:      lang==='ja' ? '✓ コピー済み' : '✓ Copied',
  guestInfo:   lang==='ja' ? '宿泊者情報' : 'Guest Info',
  persons:     lang==='ja' ? '名' : ' pax',
  booking:     lang==='ja' ? '予約システム' : 'Booking',
  arrival:     lang==='ja' ? '到着予定' : 'Arrival',
  status:      lang==='ja' ? 'ステータス' : 'Status',
  contact:     lang==='ja' ? '連絡先' : 'Contact',
  notes:       lang==='ja' ? '備考' : 'Notes',
  pr:          lang==='ja' ? 'PR 優先' : 'PR Priority',
  high:        lang==='ja' ? '🟠 高' : '🟠 High',
  medium:      lang==='ja' ? '🟡 中' : '🟡 Medium',
  simpleTitle: lang==='ja' ? '簡易版タスクリスト' : 'Simple Task List',
  legendPR:    lang==='ja' ? 'PR = 優先清掃（予約者名あり）' : 'PR = Priority (guest booked)',
  legendTime:  lang==='ja' ? '[時間] = 到着予定時間' : '[time] = Expected arrival',
  noGuest:     lang==='ja' ? '退房後清掃（新規客なし）' : 'Checkout cleaning',
  clear:       lang==='ja' ? 'クリア' : 'Clear',
  error:       lang==='ja' ? 'エラーが発生しました。' : 'An error occurred.',
  noFile:      lang==='ja' ? 'ファイルを選択してください' : 'Please select a file',
});

const priorityColor = (p: Priority) => ({
  HIGH:   'border-l-orange-500 bg-orange-50',
  MEDIUM: 'border-l-yellow-400 bg-yellow-50',
  LOW:    'border-l-green-400 bg-green-50',
}[p]);

export default function App() {
  const [lang, setLang]           = useState<Lang>('ja');
  const [tasks, setTasks]         = useState<Task[]>([]);
  const [dateStr, setDateStr] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  });
  const [displayDate, setDisplayDate] = useState('');
  const [showSimple, setShowSimple]   = useState(false);
  const [copied, setCopied]           = useState(false);
  const [file, setFile]               = useState<File | null>(null);
  const [error, setError]             = useState('');
  const [generated, setGenerated]     = useState(false);
  const [dragOver, setDragOver]       = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const tx = T(lang);

  const handleFile = (f: File) => { setFile(f); setError(''); };

  const generate = async () => {
    if (!file) { setError(tx.noFile); return; }
    setError('');
    try {
      const result = await parseExcelFile(file);
      setTasks(result);
      setGenerated(true);
      const d = new Date(dateStr + 'T00:00:00');
      setDisplayDate(`${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日`);
    } catch (e) {
      console.error(e);
      setError(tx.error);
    }
  };

  const simpleText = () => tasks.map(t => {
    let l = `${t.room} ${t.guestCount}${tx.persons}`;
    if (t.needPR)      l += ' PR';
    if (t.arrivalTime) l += ` [${t.arrivalTime}]`;
    if (t.bbq)         l += ' 🍖BBQ';
    if (t.bonfire)     l += ' 🔥';
    if (t.pet)         l += ' 🐾';
    return l;
  }).join('\n');

  const doCopy = () => { navigator.clipboard.writeText(simpleText()); setCopied(true); setTimeout(()=>setCopied(false),2000); };
  const plabel = (p: Priority) => ({HIGH:tx.high,MEDIUM:tx.medium,LOW:'🟢 Low'}[p]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-blue-50 p-3 sm:p-5" style={{fontFamily:"'Noto Sans JP',sans-serif"}}>
      <div className="max-w-4xl mx-auto space-y-4">

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-md p-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{tx.title}</h1>
            <p className="text-slate-500 text-sm mt-1">{tx.subtitle}</p>
          </div>
          <button onClick={()=>setLang(lang==='ja'?'en':'ja')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition font-semibold text-slate-600 text-sm">
            <Globe size={16}/>{lang==='ja'?'English':'日本語'}
          </button>
        </div>

        {/* Upload */}
        <div className="bg-white rounded-2xl shadow-md p-5">
          <h2 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <Upload size={20} className="text-blue-500"/>{tx.uploadTitle}
          </h2>

          {/* Date picker */}
          <div className="mb-4 flex items-center gap-3">
            <label className="text-sm font-semibold text-slate-600">{tx.dateLabel}</label>
            <input type="date" value={dateStr} onChange={e=>setDateStr(e.target.value)}
              className="border-2 border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"/>
          </div>

          {/* Drop zone */}
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition mb-4 ${dragOver ? 'border-blue-500 bg-blue-50' : file ? 'border-green-400 bg-green-50' : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'}`}
            onClick={()=>fileRef.current?.click()}
            onDrop={e=>{e.preventDefault();setDragOver(false);const f=e.dataTransfer.files?.[0];if(f)handleFile(f);}}
            onDragOver={e=>{e.preventDefault();setDragOver(true);}}
            onDragLeave={()=>setDragOver(false)}
          >
            {file ? (
              <div className="text-green-700">
                <div className="text-2xl mb-1">✅</div>
                <p className="font-semibold">{file.name}</p>
                <p className="text-sm text-green-600 mt-1">クリックして別のファイルを選択</p>
              </div>
            ) : (
              <div className="text-slate-400">
                <Upload size={36} className="mx-auto mb-2"/>
                <p className="font-semibold text-slate-600">{tx.uploadHint}</p>
              </div>
            )}
          </div>
          <input ref={fileRef} type="file" accept=".xlsx,.xls" className="hidden"
            onChange={e=>{const f=e.target.files?.[0];if(f)handleFile(f);}}/>

          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

          <button onClick={generate} disabled={!file}
            className="w-full py-3 rounded-xl font-bold text-white text-base shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition"
            style={{background:!file?'#94a3b8':'linear-gradient(135deg,#3b82f6,#6366f1)'}}>
            {tx.generateBtn}
          </button>
        </div>

        {/* Stats */}
        {generated && (
          <div className="grid grid-cols-3 gap-3">
            {[
              {val:tasks.length, label:tx.totalRooms, color:'#3b82f6'},
              {val:tasks.filter(t=>t.needPR).length, label:tx.prCount, color:'#ef4444'},
              {val:tasks.reduce((s,t)=>s+t.guestCount,0), label:tx.totalGuests, color:'#10b981'},
            ].map((s,i)=>(
              <div key={i} className="bg-white rounded-xl shadow-sm p-4 text-center">
                <div className="text-3xl font-bold" style={{color:s.color}}>{s.val}</div>
                <div className="text-xs text-slate-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Task List */}
        {tasks.length > 0 && (
          <div className="bg-white rounded-2xl shadow-md p-5">
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
              <div>
                <h2 className="text-xl font-bold text-slate-800">{tx.taskList}</h2>
                {displayDate && <p className="text-slate-500 text-sm mt-1">{displayDate}</p>}
              </div>
              <div className="flex gap-2 no-print">
                <button onClick={()=>setShowSimple(!showSimple)}
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700">
                  {showSimple ? tx.detail : tx.simple}
                </button>
                <button onClick={()=>window.print()}
                  className="px-4 py-2 rounded-xl bg-slate-600 text-white text-sm font-semibold hover:bg-slate-700 flex items-center gap-1">
                  <Printer size={14}/>{tx.print}
                </button>
              </div>
            </div>

            {showSimple ? (
              <div>
                <div className="bg-slate-50 border-2 border-slate-200 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-semibold text-slate-700">{tx.simpleTitle}</span>
                    <button onClick={doCopy} className="no-print flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white"
                      style={{background:copied?'#10b981':'#4f46e5'}}>
                      {copied?<Check size={14}/>:<Copy size={14}/>}{copied?tx.copied:tx.copy}
                    </button>
                  </div>
                  <pre className="font-mono text-base leading-8 whitespace-pre-wrap bg-white p-4 rounded-lg border border-slate-200">{simpleText()}</pre>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-3 text-sm text-blue-700 space-y-1">
                  <p>• {tx.legendPR}</p><p>• {tx.legendTime}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {tasks.map((task,i)=>(
                  <div key={i} className={`border-l-4 rounded-xl p-4 shadow-sm ${priorityColor(task.cleaningPriority)}`}>
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className="text-xl font-bold text-slate-800">{task.room}</span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-white shadow-sm">{plabel(task.cleaningPriority)}</span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-700 text-white">#{task.roomCode}</span>
                      {task.platform && <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-600 text-white">{task.platform}</span>}
                      {task.needPR && <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-600 text-white">{tx.pr}</span>}
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3 mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1"><Users size={15} className="text-purple-600"/><span className="font-semibold text-sm text-slate-700">{tx.guestInfo}</span></div>
                        <div className="pl-5 space-y-0.5 text-sm">
                          {task.guestName ? <p className="font-medium text-slate-800">{task.guestName}</p> : <p className="text-slate-400 italic">{tx.noGuest}</p>}
                          <p className="text-slate-500">{task.guestCount}{tx.persons}</p>
                          {task.bookingSystem && <p className="text-slate-500">{tx.booking}: {task.bookingSystem}</p>}
                        </div>
                      </div>
                      <div>
                        {task.arrivalTime && (
                          <div className="flex items-center gap-2 mb-1">
                            <Clock size={15} className="text-green-600"/>
                            <span className="font-semibold text-sm text-slate-700">{tx.arrival}</span>
                            <span className="text-lg font-bold text-green-700">{task.arrivalTime}</span>
                          </div>
                        )}
                        {task.status && <div className="flex items-center gap-2"><FileText size={15} className="text-blue-600"/><span className="text-sm text-slate-600">{tx.status}: {task.status}</span></div>}
                      </div>
                    </div>
                    {task.contact && <div className="bg-white bg-opacity-70 rounded-lg p-3 mb-2 text-sm text-slate-700 whitespace-pre-line"><strong>{tx.contact}:</strong><br/>{task.contact}</div>}
                    {(task.bbq||task.bonfire||task.pet) && (
                      <div className="flex flex-wrap gap-2">
                        {task.bbq     && <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 border border-orange-400 text-orange-800">🍖 BBQ</span>}
                        {task.bonfire && <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 border border-red-400 text-red-800">🔥 篝火</span>}
                        {task.pet     && <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 border border-green-400 text-green-800">🐾 ペット</span>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      <style>{`@media print{.no-print{display:none!important}body{background:white}}`}</style>
    </div>
  );
}
