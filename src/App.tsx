import React, { useState } from 'react';
import { Users, Clock, AlertCircle, FileText, Globe, Printer, Copy, Check, ClipboardPaste } from 'lucide-react';

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

// Column indices (0-based): A=0,B=1,...,G=6,H=7,I=8,J=9,K=10,L=11,M=12,N=13,O=14,P=15,Q=16,R=17,S=18,T=19,U=20,...,AA=26
const C = { G:6, H:7, I:8, J:9, K:10, L:11, M:12, N:13, P:15, T:19, U:20, AA:26 };

const ROOMS = new Set([
  'MOKA','KOKO','MARU','RUNA','MEI','NOA','RIN','LEO','MOMO',
  '月江苑','Grand V','panorama','Villa A','Villa B','Villa C',
  'cube','Villa D','Villa E','Villa F','Villa G'
]);

const parseExcelData = (text: string): Task[] => {
  const tasks: Task[] = [];
  for (const line of text.split('\n')) {
    const cols = line.split('\t');
    const room = (cols[C.H] || '').trim();
    if (!ROOMS.has(room)) continue;

    const aa = (cols[C.AA] || '').trim();
    const tv = (cols[C.T]  || '').trim().toUpperCase();

    // Rule 1: AA must contain a digit
    if (!aa || aa.toLowerCase() === 'x' || !/\d/.test(aa)) continue;
    // Rule 2: T must not be K or E
    if (tv === 'K' || tv === 'E') continue;

    const guestName  = (cols[C.K] || '').trim();
    const contact    = (cols[C.U] || '').trim();
    const arrRaw     = (cols[C.N] || '').trim();
    const gVal       = (cols[C.G] || '0').trim();
    const timeMatch  = arrRaw.match(/\d{1,2}:\d{2}(?:\s*[-~]\s*\d{1,2}:\d{2})?/);
    const arrivalTime = timeMatch ? timeMatch[0] : '';
    const combined   = contact + ' ' + arrRaw;

    tasks.push({
      room,
      roomCode:      (cols[C.I] || '').trim(),
      platform:      (cols[C.J] || '').trim(),
      guestName,
      bookingSystem: (cols[C.L] || '').trim(),
      status:        (cols[C.M] || '').trim(),
      arrivalTime,
      guestCount:    parseInt(cols[C.P] || '0', 10) || 0,
      needIdCheck:   gVal !== '0' && gVal !== '' && !['0',''].includes(gVal),
      needPR:        guestName.length > 0,
      contact,
      cleaningPriority: guestName.length > 0 ? 'HIGH' : 'MEDIUM',
      notes:         arrRaw.replace(/\d{1,2}:\d{2}(?:\s*[-~]\s*\d{1,2}:\d{2})?/g,'').trim(),
      bbq:     /BBQ/i.test(combined),
      bonfire: /篝火/.test(combined),
      pet:     /ペット|1PET|PET/i.test(combined),
    });
  }
  return tasks;
};

const T = (lang: Lang) => ({
  title:       lang==='ja' ? '🏠 清掃タスク自動生成システム' : '🏠 Cleaning Task Generator',
  subtitle:    lang==='ja' ? 'Excelデータから自動生成（AI不要）' : 'Auto-generated from Excel data',
  pasteTitle:  lang==='ja' ? '📋 Excelデータを貼り付け' : '📋 Paste Excel Data',
  pasteHint:   lang==='ja' ? 'Excelで全行を選択→Command+C→ここに貼り付け' : 'Select all rows in Excel → Cmd+C → Paste here',
  placeholder: lang==='ja' ? 'ここにExcelデータを貼り付け...' : 'Paste Excel data here...',
  btn:         lang==='ja' ? '✅ 清掃リストを生成' : '✅ Generate List',
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
  idCheck:     lang==='ja' ? '🆔 証明書確認必要' : '🆔 ID Check',
  pr:          lang==='ja' ? 'PR 優先' : 'PR Priority',
  high:        lang==='ja' ? '🟠 高' : '🟠 High',
  medium:      lang==='ja' ? '🟡 中' : '🟡 Medium',
  low:         lang==='ja' ? '🟢 低' : '🟢 Low',
  simpleTitle: lang==='ja' ? '簡易版タスクリスト' : 'Simple Task List',
  legendPR:    lang==='ja' ? 'PR = 優先清掃（予約者名あり）' : 'PR = Priority (guest booked)',
  legendID:    lang==='ja' ? '🆔 = 証明書確認必要' : '🆔 = ID check required',
  legendTime:  lang==='ja' ? '[時間] = 到着予定時間' : '[time] = Expected arrival',
  noGuest:     lang==='ja' ? '退房後清掃（新規客なし）' : 'Checkout cleaning',
  clear:       lang==='ja' ? 'クリア' : 'Clear',
});

const priorityColor = (p: Priority) => ({
  HIGH:   'border-l-orange-500 bg-orange-50',
  MEDIUM: 'border-l-yellow-400 bg-yellow-50',
  LOW:    'border-l-green-400 bg-green-50',
}[p]);

export default function App() {
  const [lang, setLang]               = useState<Lang>('ja');
  const [tasks, setTasks]             = useState<Task[]>([]);
  const [date, setDate]               = useState('');
  const [showSimple, setShowSimple]   = useState(false);
  const [copied, setCopied]           = useState(false);
  const [pasteText, setPasteText]     = useState('');
  const [generated, setGenerated]     = useState(false);
  const tx = T(lang);

  const generate = () => {
    if (!pasteText.trim()) return;
    setTasks(parseExcelData(pasteText));
    setGenerated(true);
    const d = new Date();
    setDate(`${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日`);
  };

  const simpleText = () => tasks.map(t => {
    let l = `${t.room} ${t.guestCount}${tx.persons}`;
    if (t.needIdCheck) l += ' 🆔';
    if (t.needPR)      l += ' PR';
    if (t.arrivalTime) l += ` [${t.arrivalTime}]`;
    if (t.bbq)         l += ' 🍖BBQ';
    if (t.bonfire)     l += ' 🔥';
    if (t.pet)         l += ' 🐾';
    return l;
  }).join('\n');

  const doCopy = () => { navigator.clipboard.writeText(simpleText()); setCopied(true); setTimeout(()=>setCopied(false),2000); };
  const plabel = (p: Priority) => ({HIGH:tx.high,MEDIUM:tx.medium,LOW:tx.low}[p]);

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

        {/* Paste */}
        <div className="bg-white rounded-2xl shadow-md p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-slate-700 flex items-center gap-2">
              <ClipboardPaste size={20} className="text-blue-500"/>{tx.pasteTitle}
            </h2>
            {pasteText && <button onClick={()=>{setPasteText('');setTasks([]);setGenerated(false);}} className="text-sm text-slate-400 hover:text-red-500">{tx.clear}</button>}
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-3 text-sm text-blue-700">💡 {tx.pasteHint}</div>
          <textarea value={pasteText} onChange={e=>setPasteText(e.target.value)} placeholder={tx.placeholder}
            className="w-full h-36 p-3 border-2 border-slate-200 rounded-xl text-xs font-mono resize-none focus:outline-none focus:border-blue-400"/>
          <button onClick={generate} disabled={!pasteText.trim()}
            className="w-full mt-3 py-3 rounded-xl font-bold text-white text-base shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition"
            style={{background:!pasteText.trim()?'#94a3b8':'linear-gradient(135deg,#3b82f6,#6366f1)'}}>
            {tx.btn}
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
                {date && <p className="text-slate-500 text-sm mt-1">{date}</p>}
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
                  <p>• {tx.legendPR}</p><p>• {tx.legendID}</p><p>• {tx.legendTime}</p>
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
                      {task.needIdCheck && <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-600 text-white">{tx.idCheck}</span>}
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
                    {task.notes && (
                      <div className="flex gap-2 bg-yellow-50 border border-yellow-300 rounded-lg p-3 mb-2 text-sm">
                        <AlertCircle size={15} className="text-orange-500 mt-0.5 flex-shrink-0"/>
                        <div><strong>{tx.notes}:</strong> {task.notes}</div>
                      </div>
                    )}
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
