import React, { useState, useRef } from 'react';
import { Users, Clock, AlertCircle, FileText, Upload, Globe, Printer, Copy, Check, Loader2 } from 'lucide-react';

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
  aaValue: string;   // raw AA column value: "29", "x", ""
  tValue: string;    // raw T column value: "S", "K", "E", ""
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
  needConfirm: boolean;
  contact: string;
  cleaningPriority: Priority;
  notes: string;
  bbq: boolean;
  bonfire: boolean;
  pet: boolean;
}

// Convert raw rows to tasks using business logic
const processRawData = (rows: RawRow[]): Task[] => {
  return rows
    .filter(row => {
      // Step 1: AA must have a number
      const aa = row.aaValue.trim();
      if (!aa || aa.toLowerCase() === 'x') return false;
      if (!/\d/.test(aa)) return false;

      // Step 2: T must NOT be K or E
      const t = row.tValue.trim().toUpperCase();
      if (t === 'K' || t === 'E') return false;

      return true;
    })
    .map(row => {
      const hasGuestName = row.guestName.trim().length > 0;
      const needPR = hasGuestName;
      const cleaningPriority: Priority = hasGuestName ? 'HIGH' : 'MEDIUM';
      const needIdCheck = row.gValue !== '0' && row.gValue.trim() !== '';

      return {
        room: row.room,
        roomCode: row.roomCode,
        platform: row.platform,
        guestName: row.guestName,
        bookingSystem: row.bookingSystem,
        status: row.status,
        arrivalTime: row.arrivalTime,
        guestCount: row.guestCount,
        needIdCheck,
        needPR,
        needConfirm: false,
        contact: row.contact,
        cleaningPriority,
        notes: row.notes,
        bbq: row.bbq,
        bonfire: row.bonfire,
        pet: row.pet,
      };
    });
};

const SYSTEM_PROMPT = `You are an expert at reading Japanese hotel Excel spreadsheets.
Your ONLY job is to extract raw data from every room row. Do NOT filter anything. Return ALL rows.
Output ONLY a valid JSON array, no markdown, no explanation.

The spreadsheet columns (read carefully):
- H column: Room name (ROOM) - MOKA, KOKO, MARU, RUNA, MEI, NOA, RIN, LEO, MOMO, 月江苑, Grand V, panorama, Villa A, Villa B, Villa C, cube, Villa D, Villa E, Villa F, Villa G
- I column: Room code (4-digit number)
- J column: Platform (Agoda, A, B-DR, etc.) or empty
- K column: Guest name (予約者名) - may be empty
- L column: Booking system (Stan, Edrian) or empty
- M column: DR status text or empty
- N column: Arrival time (like 15:00) and special notes
- P column: Guest count (人) - a number
- T column: 連泊 - THIS IS CRITICAL - read every row carefully - value is S, K, E, or empty
- U column: Contact info (備考)
- AA column: 当日 - THE LAST/RIGHTMOST COLUMN - a number like 28 or 29, or the letter x, or empty

Extract these fields for EVERY room row:
{
  "room": string (H column),
  "roomCode": string (I column),
  "platform": string (J column, empty if blank),
  "guestName": string (K column, empty string if blank),
  "bookingSystem": string (L column),
  "status": string (M column),
  "arrivalTime": string (time from N column, empty if none),
  "guestCount": number (P column),
  "aaValue": string (AA column exact value: "29" or "x" or ""),
  "tValue": string (T column exact value: "S" or "K" or "E" or ""),
  "gValue": string (G column value or "0"),
  "contact": string (U column text),
  "notes": string (special notes from N or U),
  "bbq": boolean,
  "bonfire": boolean,
  "pet": boolean
}

IMPORTANT: Return ALL rows. Every room. Do not skip any row. Do not filter.`;

const t = (lang: Lang) => ({
  title:        lang === 'ja' ? '🏠 清掃タスク自動生成システム' : '🏠 Cleaning Task Generator',
  subtitle:     lang === 'ja' ? 'Excelスクショから自動生成' : 'Auto-generated from Excel screenshot',
  uploadTitle:  lang === 'ja' ? '📸 スクショをアップロード' : '📸 Upload Screenshot',
  uploadBtn:    lang === 'ja' ? '画像を選択' : 'Select Image',
  uploadHint:   lang === 'ja' ? 'またはここにドラッグ＆ドロップ' : 'Or drag & drop here',
  generateBtn:  lang === 'ja' ? '🤖 清掃リストを生成' : '🤖 Generate Cleaning List',
  generating:   lang === 'ja' ? 'AIが読み取り中...' : 'AI is reading...',
  totalRooms:   lang === 'ja' ? '総清掃室数' : 'Total Rooms',
  prCount:      lang === 'ja' ? '優先対応(PR)' : 'Priority (PR)',
  totalGuests:  lang === 'ja' ? '総宿泊人数' : 'Total Guests',
  taskList:     lang === 'ja' ? '📝 清掃タスクリスト' : '📝 Cleaning Task List',
  simple:       lang === 'ja' ? '📝 簡易' : '📝 Simple',
  detail:       lang === 'ja' ? '📋 詳細' : '📋 Detail',
  print:        lang === 'ja' ? '🖨️ 印刷' : '🖨️ Print',
  copy:         lang === 'ja' ? '📋 コピー' : '📋 Copy',
  copied:       lang === 'ja' ? '✓ コピー済み' : '✓ Copied',
  guestInfo:    lang === 'ja' ? '宿泊者情報' : 'Guest Info',
  persons:      lang === 'ja' ? '名' : ' pax',
  booking:      lang === 'ja' ? '予約システム' : 'Booking',
  arrival:      lang === 'ja' ? '到着予定' : 'Arrival',
  status:       lang === 'ja' ? 'ステータス' : 'Status',
  contact:      lang === 'ja' ? '連絡先' : 'Contact',
  notes:        lang === 'ja' ? '備考' : 'Notes',
  idCheck:      lang === 'ja' ? '🆔 証明書確認必要' : '🆔 ID Check Required',
  pr:           lang === 'ja' ? 'PR 優先' : 'PR Priority',
  urgent:       lang === 'ja' ? '🔴 緊急' : '🔴 Urgent',
  high:         lang === 'ja' ? '🟠 高' : '🟠 High',
  medium:       lang === 'ja' ? '🟡 中' : '🟡 Medium',
  low:          lang === 'ja' ? '🟢 低' : '🟢 Low',
  simpleTitle:  lang === 'ja' ? '簡易版タスクリスト' : 'Simple Task List',
  legendPR:     lang === 'ja' ? 'PR = 優先清掃（予約者名あり）' : 'PR = Priority cleaning (guest booked)',
  legendID:     lang === 'ja' ? '🆔 = 証明書確認必要' : '🆔 = ID check required',
  legendTime:   lang === 'ja' ? '[時間] = 到着予定時間' : '[time] = Expected arrival',
  noGuest:      lang === 'ja' ? '客人情報なし（退房後清掃）' : 'No new guest (checkout cleaning)',
  errorMsg:     lang === 'ja' ? 'エラーが発生しました。もう一度試してください。' : 'An error occurred. Please try again.',
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
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const tx = t(lang);

  const handleImageFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setImagePreview(result);
      setImageBase64(result.split(',')[1]);
      setError('');
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) handleImageFile(file);
  };

  const generateTasks = async () => {
    if (!imageBase64) return;
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
              content: [
                {
                  type: 'image_url',
                  image_url: { url: `data:image/jpeg;base64,${imageBase64}`, detail: 'high' },
                },
                {
                  type: 'text',
                  text: 'Extract ALL room rows from this Excel screenshot. Return every row as raw data JSON array. Do not filter anything.',
                },
              ],
            },
          ],
        }),
      });

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '';
      const clean = content.replace(/```json|```/g, '').trim();
      const rawRows: RawRow[] = JSON.parse(clean);

      // Apply business logic in code, not AI
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

        {/* Upload */}
        <div className="bg-white rounded-2xl shadow-md p-5 mb-4">
          <h2 className="text-lg font-semibold text-slate-700 mb-4">{tx.uploadTitle}</h2>
          <div
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition ${dragOver ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'}`}
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
          >
            {imagePreview ? (
              <img src={imagePreview} alt="preview" className="max-h-48 mx-auto rounded-lg object-contain" />
            ) : (
              <div className="text-slate-400">
                <Upload size={36} className="mx-auto mb-2" />
                <p className="font-semibold text-slate-600">{tx.uploadBtn}</p>
                <p className="text-sm mt-1">{tx.uploadHint}</p>
              </div>
            )}
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

          {error && <p className="text-red-500 text-sm mt-3">{error}</p>}

          <button
            onClick={generateTasks}
            disabled={!imageBase64 || loading}
            className="w-full mt-4 py-3 rounded-xl font-bold text-white text-base transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            style={{background: !imageBase64 || loading ? '#94a3b8' : 'linear-gradient(135deg,#3b82f6,#6366f1)'}}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 size={18} className="animate-spin" />
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
