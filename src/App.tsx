import React, { useState } from 'react';
import { Users, Clock, AlertCircle, FileText, Globe, Printer, Copy, Check, Loader2, ClipboardPaste } from 'lucide-react';

type Lang = 'ja' | 'en';
type Priority = 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';

interface RawRow {
  room: string;
  roomCode: string;
  platform: string;
  guestName: string;
  bookingSystem: string;
  status: string;
  arrivalTime: string;
  guestCount: number;
  aaValue: string;
  tValue: string;
  gValue: string;
  contact: string;
  notes: string;
  bbq: boolean;
  bonfire: boolean;
  pet: boolean;
}

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

// ビジネスロジック：コードで判断
const processRawData = (rows: RawRow[]): Task[] => {
  return rows
    .filter(row => {
      const aa = (row.aaValue || '').trim();
      // AA must have a number
      if (!aa || aa.toLowerCase() === 'x' || !/\d/.test(aa)) return false;
      // T must NOT be K or E
      const t = (row.tValue || '').trim().toUpperCase();
      if (t === 'K' || t === 'E') return false;
      return true;
    })
    .map(row => {
      const hasGuestName = (row.guestName || '').trim().length > 0;
      return {
        room: row.room,
        roomCode: row.roomCode,
        platform: row.platform,
        guestName: row.guestName,
        bookingSystem: row.bookingSystem,
        status: row.status,
        arrivalTime: row.arrivalTime,
        guestCount: row.guestCount || 0,
        needIdCheck: row.gValue !== '0' && (row.gValue || '').trim() !== '',
        needPR: hasGuestName,
        contact: row.contact,
        cleaningPriority: hasGuestName ? 'HIGH' : 'MEDIUM',
        notes: row.notes,
        bbq: row.bbq || false,
        bonfire: row.bonfire || false,
        pet: row.pet || false,
      };
    });
};

const SYSTEM_PROMPT = `You are an expert at reading Japanese hotel Excel data.
The user will paste tab-separated Excel data. Extract ALL rows and return ONLY a valid JSON array.
No markdown, no explanation, only JSON.

The Excel columns are in this order (tab-separated):
Column A: IN
Column B: (empty or flag)
Column C: SM
Column D: 情
Column E: (empty)
Column F: (empty)
Column G: (G value - certificate check number)
Column H: ROOM (room name - THIS IS IMPORTANT)
Column I: PW (room code, 4-digit number)
Column J: abdr (platform: Agoda, A, B-DR, etc.)
Column K: 予約者名 (guest name)
Column L: booking system (Stan, Edrian, etc.)
Column M: DR / ステータス
Column N: 到着予定 (arrival time like 15:00)
Column O: 室
Column P: 人 (guest count - a number)
Column Q: 大
Column R: 子
Column S: 齢
Column T: 連泊 (VERY IMPORTANT: S, K, E, or empty)
Column U: 備考 (contact info and notes)
... (more columns) ...
Column AA: 当日 (LAST/RIGHTMOST column - cleaning date number like 28, 29, or "x", or empty)

For EVERY data row that has a room name in column H, extract:
{
  "room": string (column H - room name),
  "roomCode": string (column I - 4-digit code),
  "platform": string (column J or empty string),
  "guestName": string (column K or empty string),
  "bookingSystem": string (column L or empty string),
  "status": string (column M or empty string),
  "arrivalTime": string (column N - time value or empty string),
  "guestCount": number (column P - integer),
  "aaValue": string (LAST column AA - "29" or "28" or "x" or ""),
  "tValue": string (column T - "S" or "K" or "E" or ""),
  "gValue": string (column G - number as string or "0"),
  "contact": string (column U - contact text or empty),
  "notes": string (any special notes like bed config, special requests),
  "bbq": boolean (true if BBQ mentioned),
  "bonfire": boolean (true if 篝火 mentioned),
  "pet": boolean (true if ペット mentioned)
}

CRITICAL: Return ALL rows with room names. Do not skip any row. Do not filter.`;

const t = (lang: Lang) => ({
  title:       lang === 'ja' ? '🏠 清掃タスク自動生成システム' : '🏠 Cleaning Task Generator',
  subtitle:    lang === 'ja' ? 'Excelデータから自動生成' : 'Auto-generated from Excel data',
  pasteTitle:  lang === 'ja' ? '📋 Excelデータを貼り付け' : '📋 Paste Excel Data',
  pasteHint:   lang === 'ja' ? 'Excelで全行を選択してコピー（Command+C）してここに貼り付け' : 'Select all rows in Excel, copy (Cmd+C), and paste here',
  pastePlaceholder: lang === 'ja' ? 'ここにExcelデータを貼り付けてください...' : 'Paste Excel data here...',
  generateBtn: lang === 'ja' ? '🤖 清掃リストを生成' : '🤖 Generate Cleaning List',
  generating:  lang === 'ja' ? 'AIが解析中...' : 'AI is analyzing...',
  totalRooms:  lang === 'ja' ? '総清掃室数' : 'Total Rooms',
  prCount:     lang === 'ja' ? '優先対応(PR)' : 'Priority (PR)',
  totalGuests: lang === 'ja' ? '総宿泊人数' : 'Total Guests',
  taskList:    lang === 'ja' ? '📝 清掃タスクリスト' : '📝 Cleaning Task List',
  simple:      lang === 'ja' ? '📝 簡易' : '📝 Simple',
  detail:      lang === 'ja' ? '📋 詳細' : '📋 Detail',
  print:       lang === 'ja' ? '🖨️ 印刷' : '🖨️ Print',
  copy:        lang === 'ja' ? '📋 コピー' : '📋 Copy',
  copied:      lang === 'ja' ? '✓ コピー済み' : '✓ Copied',
  guestInfo:   lang === 'ja' ? '宿泊者情報' : 'Guest Info',
  persons:     lang === 'ja' ? '名' : ' pax',
  booking:     lang === 'ja' ? '予約システム' : 'Booking',
  arrival:     lang === 'ja' ? '到着予定' : 'Arrival',
  status:      lang === 'ja' ? 'ステータス' : 'Status',
  contact:     lang === 'ja' ? '連絡先' : 'Contact',
  notes:       lang === 'ja' ? '備考' : 'Notes',
  idCheck:     lang === 'ja' ? '🆔 証明書確認必要' : '🆔 ID Check Required',
  pr:          lang === 'ja' ? 'PR 優先' : 'PR Priority',
  high:        lang === 'ja' ? '🟠 高' : '🟠 High',
  medium:      lang === 'ja' ? '🟡 中' : '🟡 Medium',
  low:         lang === 'ja' ? '🟢 低' : '🟢 Low',
  urgent:      lang === 'ja' ? '🔴 緊急' : '🔴 Urgent',
  simpleTitle: lang === 'ja' ? '簡易版タスクリスト' : 'Simple Task List',
  legendPR:    lang === 'ja' ? 'PR = 優先清掃（予約者名あり）' : 'PR = Priority (guest name present)',
  legendID:    lang === 'ja' ? '🆔 = 証明書確認必要' : '🆔 = ID check required',
  legendTime:  lang === 'ja' ? '[時間] = 到着予定時間' : '[time] = Expected arrival',
  noGuest:     lang === 'ja' ? '退房後清掃（新規客なし）' : 'Checkout cleaning (no new guest)',
  errorMsg:    lang === 'ja' ? 'エラーが発生しました。もう一度試してください。' : 'An error occurred. Please try again.',
  clearBtn:    lang === 'ja' ? 'クリア' : 'Clear',
});

const getPriorityColor = (p: Priority) => ({
  URGENT: 'border-l-red-500 bg-red-50',
  HIGH:   'border-l-orange-500 bg-orange-50',
  MEDIUM: 'border-l-yellow-400 bg-yellow-50',
  LOW:    'border-l-green-400 bg-green-50',
}[p] || 'border-l-gray-400 bg-gray-50');

const CleaningScheduleGenerator = () => {
  const [lang, setLang] = useState<Lang>('ja');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [date, setDate] = useState('');
  const [showSimpleView, setShowSimpleView] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pasteText, setPasteText] = useState('');
  const tx = t(lang);

  const generateTasks = async () => {
    if (!pasteText.trim()) return;
    setLoading(true);
    setError('');
    try {
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          max_tokens: 4000,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            {
              role: 'user',
              content: `Here is the Excel data (tab-separated):\n\n${pasteText}`,
            },
          ],
        }),
      });

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '';
      const clean = content.replace(/```json|```/g, '').trim();
      const rawRows: RawRow[] = JSON.parse(clean);
      const filtered = processRawData(rawRows);
      setTasks(filtered);

      const today = new Date();
      setDate(`${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`);
    } catch (err) {
      console.error(err);
      setError(tx.errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityLabel = (p: Priority) => ({
    URGENT: tx.urgent, HIGH: tx.high, MEDIUM: tx.medium, LOW: tx.low,
  }[p] || p);

  const generateSimpleText = () =>
    tasks.map(task => {
      let line = `${task.room} ${task.guestCount}${tx.persons}`;
      if (task.needIdCheck) line += ' 🆔';
      if (task.needPR)      line += ' PR';
      if (task.arrivalTime) line += ` [${task.arrivalTime}]`;
      if (task.bbq)         line += ' 🍖BBQ';
      if (task.bonfire)     line += ' 🔥';
      if (task.pet)         line += ' 🐾';
      return line;
    }).join('\n');

  const copySimpleText = () => {
    navigator.clipboard.writeText(generateSimpleText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-blue-50 p-3 sm:p-5" style={{fontFamily:"'Noto Sans JP', sans-serif"}}>
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-md p-5 mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{tx.title}</h1>
            <p className="text-slate-500 text-sm mt-1">{tx.subtitle}</p>
          </div>
          <button
            onClick={() => setLang(lang === 'ja' ? 'en' : 'ja')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition font-semibold text-slate-600 text-sm"
          >
            <Globe size={16} />
            {lang === 'ja' ? 'English' : '日本語'}
          </button>
        </div>

        {/* Paste Input */}
        <div className="bg-white rounded-2xl shadow-md p-5 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-slate-700 flex items-center gap-2">
              <ClipboardPaste size={20} className="text-blue-500"/>
              {tx.pasteTitle}
            </h2>
            {pasteText && (
              <button onClick={() => { setPasteText(''); setTasks([]); }}
                className="text-sm text-slate-400 hover:text-red-500 transition">
                {tx.clearBtn}
              </button>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-3 text-sm text-blue-700">
            💡 {tx.pasteHint}
          </div>

          <textarea
            value={pasteText}
            onChange={e => setPasteText(e.target.value)}
            placeholder={tx.pastePlaceholder}
            className="w-full h-40 p-3 border-2 border-slate-200 rounded-xl text-sm font-mono resize-none focus:outline-none focus:border-blue-400 transition"
          />

          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

          <button
            onClick={generateTasks}
            disabled={!pasteText.trim() || loading}
            className="w-full mt-3 py-3 rounded-xl font-bold text-white text-base transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            style={{background: !pasteText.trim() || loading ? '#94a3b8' : 'linear-gradient(135deg,#3b82f6,#6366f1)'}}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 size={18} className="animate-spin"/>
                {tx.generating}
              </span>
            ) : tx.generateBtn}
          </button>
        </div>

        {/* Stats */}
        {tasks.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { val: tasks.length, label: tx.totalRooms, color: '#3b82f6' },
              { val: tasks.filter(t => t.needPR).length, label: tx.prCount, color: '#ef4444' },
              { val: tasks.reduce((s, t) => s + t.guestCount, 0), label: tx.totalGuests, color: '#10b981' },
            ].map((s, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm p-4 text-center">
                <div className="text-3xl font-bold" style={{color: s.color}}>{s.val}</div>
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
                <button onClick={() => setShowSimpleView(!showSimpleView)}
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition">
                  {showSimpleView ? tx.detail : tx.simple}
                </button>
                <button onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-slate-600 text-white text-sm font-semibold hover:bg-slate-700 transition flex items-center gap-1">
                  <Printer size={14}/>{tx.print}
                </button>
              </div>
            </div>

            {showSimpleView ? (
              <div>
                <div className="bg-slate-50 border-2 border-slate-200 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-semibold text-slate-700">{tx.simpleTitle}</span>
                    <button onClick={copySimpleText}
                      className="no-print flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition"
                      style={{background: copied ? '#10b981' : '#4f46e5'}}>
                      {copied ? <Check size={14}/> : <Copy size={14}/>}
                      {copied ? tx.copied : tx.copy}
                    </button>
                  </div>
                  <pre className="font-mono text-base leading-8 whitespace-pre-wrap bg-white p-4 rounded-lg border border-slate-200">
                    {generateSimpleText()}
                  </pre>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-3 text-sm text-blue-700 space-y-1">
                  <p>• {tx.legendPR}</p>
                  <p>• {tx.legendID}</p>
                  <p>• {tx.legendTime}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {tasks.map((task, i) => (
                  <div key={i} className={`border-l-4 rounded-xl p-4 shadow-sm ${getPriorityColor(task.cleaningPriority)}`}>
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className="text-xl font-bold text-slate-800">{task.room}</span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-white shadow-sm">{getPriorityLabel(task.cleaningPriority)}</span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-700 text-white">#{task.roomCode}</span>
                      {task.platform && <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-600 text-white">{task.platform}</span>}
                      {task.needIdCheck && <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-600 text-white">{tx.idCheck}</span>}
                      {task.needPR && <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-600 text-white">{tx.pr}</span>}
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3 mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Users size={15} className="text-purple-600"/>
                          <span className="font-semibold text-sm text-slate-700">{tx.guestInfo}</span>
                        </div>
                        <div className="pl-5 space-y-0.5 text-sm">
                          {task.guestName
                            ? <p className="font-medium text-slate-800">{task.guestName}</p>
                            : <p className="text-slate-400 italic">{tx.noGuest}</p>
                          }
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
                        {task.status && (
                          <div className="flex items-center gap-2">
                            <FileText size={15} className="text-blue-600"/>
                            <span className="text-sm text-slate-600">{tx.status}: {task.status}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {task.contact && (
                      <div className="bg-white bg-opacity-70 rounded-lg p-3 mb-2 text-sm text-slate-700 whitespace-pre-line">
                        <strong>{tx.contact}:</strong><br/>{task.contact}
                      </div>
                    )}

                    {task.notes && (
                      <div className="flex gap-2 bg-yellow-50 border border-yellow-300 rounded-lg p-3 mb-2 text-sm">
                        <AlertCircle size={15} className="text-orange-500 mt-0.5 flex-shrink-0"/>
                        <div><strong>{tx.notes}:</strong> {task.notes}</div>
                      </div>
                    )}

                    {(task.bbq || task.bonfire || task.pet) && (
                      <div className="flex flex-wrap gap-2">
                        {task.bbq    && <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 border border-orange-400 text-orange-800">🍖 BBQ</span>}
                        {task.bonfire && <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 border border-red-400 text-red-800">🔥 篝火</span>}
                        {task.pet    && <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 border border-green-400 text-green-800">🐾 ペット</span>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      <style>{`
        @media print { .no-print { display: none !important; } body { background: white; } }
      `}</style>
    </div>
  );
};

export default CleaningScheduleGenerator;
