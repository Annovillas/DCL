import React, { useState, useRef } from 'react';
import { Users, Clock, AlertCircle, FileText, Upload, Globe, Printer, Copy, Check, Loader2 } from 'lucide-react';

// ============================================================
// 型定義
// ============================================================
type Lang = 'ja' | 'en';
type Priority = 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';

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
  bbq?: boolean;
  bonfire?: boolean;
  pet?: boolean;
}

// ============================================================
// 翻訳
// ============================================================
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
  confirmCount: lang === 'ja' ? '⚠️ 要確認' : '⚠️ To Confirm',
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
  confirmMsg:   lang === 'ja' ? 'AA列が空白です。清掃要否を確認してください。' : 'AA column is blank. Please confirm if cleaning is needed.',
  idCheck:      lang === 'ja' ? '🆔 証明書確認必要' : '🆔 ID Check Required',
  pr:           lang === 'ja' ? 'PR 優先' : 'PR Priority',
  urgent:       lang === 'ja' ? '🔴 緊急' : '🔴 Urgent',
  high:         lang === 'ja' ? '🟠 高' : '🟠 High',
  medium:       lang === 'ja' ? '🟡 中' : '🟡 Medium',
  low:          lang === 'ja' ? '🟢 低' : '🟢 Low',
  simpleTitle:  lang === 'ja' ? '簡易版タスクリスト' : 'Simple Task List',
  legendPR:     lang === 'ja' ? 'PR = 優先清掃' : 'PR = Priority cleaning',
  legendID:     lang === 'ja' ? '🆔 = 証明書確認必要' : '🆔 = ID check required',
  legendTime:   lang === 'ja' ? '[時間] = 到着予定時間' : '[time] = Expected arrival',
  legendWarn:   lang === 'ja' ? '⚠️ = 清掃要否確認必要' : '⚠️ = Confirm if cleaning needed',
  noGuest:      lang === 'ja' ? '客人情報なし' : 'No guest info',
  errorMsg:     lang === 'ja' ? 'エラーが発生しました。もう一度試してください。' : 'An error occurred. Please try again.',
});

// ============================================================
// GPT-4o プロンプト
// ============================================================
const SYSTEM_PROMPT = `You are an expert at reading Japanese hotel Excel spreadsheets.
Extract cleaning tasks and return ONLY a valid JSON array. No markdown, no explanation.

Rules:
- AA column (当日): "28" or today's date = needs cleaning, "x" = already clean (exclude), blank = check T column
- T column: if S, K, or E = guest is staying (連泊), exclude from cleaning even if AA is blank
- K column (予約者名): if has guest name → needPR: true, cleaningPriority: "HIGH" if also has arrival time else "MEDIUM"
- G column (証明書): if value ≠ 0 → needIdCheck: true
- N column: arrival time, BBQ, bonfire, pet info
- Only include rooms that need cleaning today

Return JSON array with objects:
{
  "room": string,
  "roomCode": string,
  "platform": string,
  "guestName": string,
  "bookingSystem": string,
  "status": string,
  "arrivalTime": string,
  "guestCount": number,
  "needIdCheck": boolean,
  "needPR": boolean,
  "needConfirm": boolean,
  "contact": string,
  "cleaningPriority": "URGENT"|"HIGH"|"MEDIUM"|"LOW",
  "notes": string,
  "bbq": boolean,
  "bonfire": boolean,
  "pet": boolean
}`;

// ============================================================
// メインコンポーネント
// ============================================================
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

  // 画像選択
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

  // GPT-4o 呼び出し
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
                  image_url: { url: `data:image/jpeg;base64,${imageBase64}` },
                },
                {
                  type: 'text',
                  text: 'Please extract all cleaning tasks from this Excel screenshot and return as JSON array.',
                },
              ],
            },
          ],
        }),
      });

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '';
      const clean = content.replace(/```json|```/g, '').trim();
      const parsed: Task[] = JSON.parse(clean);
      setTasks(parsed);

      const today = new Date();
      setDate(`${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`);
    } catch (err) {
      console.error(err);
      setError(tx.errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // ユーティリティ
  const getPriorityColor = (p: Priority) => ({
    URGENT: 'border-l-red-500 bg-red-50',
    HIGH:   'border-l-orange-500 bg-orange-50',
    MEDIUM: 'border-l-yellow-400 bg-yellow-50',
    LOW:    'border-l-green-400 bg-green-50',
  }[p] || 'border-l-gray-400 bg-gray-50');

  const getPriorityLabel = (p: Priority) => ({
    URGENT: tx.urgent,
    HIGH:   tx.high,
    MEDIUM: tx.medium,
    LOW:    tx.low,
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
      if (task.needConfirm) line += ' ⚠️';
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

        {/* ヘッダー */}
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

        {/* アップロードエリア */}
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

        {/* 統計 */}
        {tasks.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {[
              { val: tasks.length, label: tx.totalRooms, color: '#3b82f6' },
              { val: tasks.filter(t => t.needPR).length, label: tx.prCount, color: '#ef4444' },
              { val: tasks.filter(t => t.needConfirm).length, label: tx.confirmCount, color: '#f59e0b' },
              { val: tasks.reduce((s, t) => s + t.guestCount, 0), label: tx.totalGuests, color: '#10b981' },
            ].map((s, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm p-4 text-center">
                <div className="text-3xl font-bold" style={{color: s.color}}>{s.val}</div>
                <div className="text-xs text-slate-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* タスクリスト */}
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
                  <p>• {tx.legendWarn}</p>
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
                      <div className="flex flex-wrap gap-2 mb-2">
                        {task.bbq    && <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 border border-orange-400 text-orange-800">🍖 BBQ</span>}
                        {task.bonfire && <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 border border-red-400 text-red-800">🔥 篝火</span>}
                        {task.pet    && <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 border border-green-400 text-green-800">🐾 ペット</span>}
                      </div>
                    )}

                    {task.needConfirm && (
                      <div className="flex gap-2 bg-red-50 border-2 border-red-400 rounded-lg p-3 text-sm">
                        <AlertCircle size={15} className="text-red-600 mt-0.5 flex-shrink-0"/>
                        <div><strong className="text-red-700">⚠️</strong> {tx.confirmMsg}</div>
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
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&display=swap');
      `}</style>
    </div>
  );
};

export default CleaningScheduleGenerator;
