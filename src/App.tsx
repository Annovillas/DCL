import React, { useState } from 'react';
import { Upload, Calendar, Users, Clock, AlertCircle, CheckCircle, FileText } from 'lucide-react';

const CleaningScheduleGenerator = () => {
  const [tasks, setTasks] = useState([]);
  const [date, setDate] = useState('');
  const [uploadStatus, setUploadStatus] = useState('');
  const [showSimpleView, setShowSimpleView] = useState(false);

  // 根据实际Excel格式的演示数据
  // 只有AA列=23的房间才需要清扫
  const demoData = [
    {
      date: '2026/03/23',
      room: 'MOKA',
      roomCode: '9910',
      aaColumn: '23',  // AA列=23，需要清扫
      platform: '',
      guestName: '',
      bookingSystem: '',
      status: '',
      arrivalTime: '',
      guestCount: 2,
      needIdCheck: false,
      needPR: false,
      contact: '',
      cleaningPriority: 'MEDIUM',
      notes: '23日清掃'
    },
    {
      date: '2026/03/23',
      room: 'KOKO',
      roomCode: '9920',
      aaColumn: '23',  // AA列=23，需要清扫
      platform: 'Agoda',
      guestName: 'riku yokoyama',
      bookingSystem: 'Edrian',
      status: 'END NO DR',
      arrivalTime: '15:00',
      guestCount: 2,
      needIdCheck: false,
      needPR: true,
      contact: 'Tel +08070620806\nyokoyama.riku@icloud.com',
      cleaningPriority: 'HIGH',
      notes: '当日チェックアウト→チェックイン'
    },
    {
      date: '2026/03/23',
      room: 'MARU',
      roomCode: '9930',
      aaColumn: '24',  // AA列=24，明日準備，今天也要清扫
      platform: '',
      guestName: 'mio morizumi',
      bookingSystem: 'Edrian',
      status: 'DR ASKING',
      arrivalTime: '17:00',
      guestCount: 4,
      needIdCheck: false,
      needPR: true,
      contact: 'Tel +81 80 3138 2423',
      cleaningPriority: 'MEDIUM',
      notes: '24日チェックイン準備'
    },
    {
      date: '2026/03/23',
      room: 'RUNA',
      roomCode: '9940',
      aaColumn: '24',  // AA列=24
      platform: '',
      guestName: 'Matthias Bruun Kobbernagel',
      bookingSystem: 'Stan',
      status: '',
      arrivalTime: '',
      guestCount: 2,
      needIdCheck: true,
      needPR: true,
      contact: 'Tel +45 51 24 07 95',
      cleaningPriority: 'MEDIUM',
      notes: '証明書確認必要！ 24日チェックイン'
    },
    {
      date: '2026/03/23',
      room: 'MEI',
      roomCode: '9950',
      aaColumn: '23',  // AA列=23，需要清扫
      platform: '',
      guestName: 'Maud Broen',
      bookingSystem: 'Stan',
      status: 'END NO DR',
      arrivalTime: '16:00',
      guestCount: 2,
      needIdCheck: false,
      needPR: true,
      contact: 'Tel +31 6 40976956',
      cleaningPriority: 'HIGH',
      notes: '当日チェックアウト→チェックイン'
    },
    {
      date: '2026/03/23',
      room: 'NOA',
      roomCode: '9909',
      aaColumn: 'x',  // AA列=x，不需要清扫（已准备好）
      platform: '',
      guestName: '',
      bookingSystem: '',
      status: '',
      arrivalTime: '',
      guestCount: 2,
      needIdCheck: false,
      needPR: false,
      contact: '',
      cleaningPriority: 'LOW',
      notes: '清掃済み',
      shouldClean: false  // 不需要清扫
    },
    {
      date: '2026/03/23',
      room: 'RIN',
      roomCode: '9960',
      aaColumn: 'x',  // AA列=x，不需要清扫
      platform: '',
      guestName: '',
      bookingSystem: 'Stan',
      status: '',
      arrivalTime: '',
      guestCount: 2,
      needIdCheck: false,
      needPR: false,
      contact: '',
      cleaningPriority: 'LOW',
      notes: '清掃済み',
      shouldClean: false
    },
    {
      date: '2026/03/23',
      room: 'LEO',
      roomCode: '9970',
      aaColumn: 'x',  // AA列=x，不需要清扫
      platform: 'Agoda',
      guestName: 'Zheng Liang',
      bookingSystem: 'Edrian',
      status: 'END NO DR',
      arrivalTime: '18:00',
      guestCount: 3,
      needIdCheck: false,
      needPR: true,
      contact: 'Tel +86 18511096150',
      cleaningPriority: 'MEDIUM',
      notes: '清掃済み、24日チェックイン',
      shouldClean: false
    },
    {
      date: '2026/03/23',
      room: '月江苑',
      roomCode: '9926',
      aaColumn: 'x',  // AA列=x，不需要清扫
      platform: '',
      guestName: '',
      bookingSystem: '',
      status: '',
      arrivalTime: '',
      guestCount: 0,
      needIdCheck: false,
      needPR: false,
      contact: '',
      cleaningPriority: 'LOW',
      notes: '清掃済み',
      shouldClean: false
    },
    {
      date: '2026/03/23',
      room: 'Grand V',
      roomCode: '9956',
      aaColumn: '23',  // AA列=23，需要清扫
      platform: 'Agoda',
      guestName: 'okada',
      bookingSystem: 'Edrian',
      status: '',
      arrivalTime: '',
      guestCount: 4,
      needIdCheck: false,
      needPR: true,
      contact: 'Tel +81 09071323936',
      cleaningPriority: 'MEDIUM',
      notes: '24日チェックイン準備'
    },
    {
      date: '2026/03/23',
      room: 'panorama',
      roomCode: '9946',
      aaColumn: '23',  // AA列=23，需要清扫
      platform: '',
      guestName: '',
      bookingSystem: '',
      status: '',
      arrivalTime: '',
      guestCount: 3,
      needIdCheck: false,
      needPR: false,
      contact: '',
      cleaningPriority: 'MEDIUM',
      notes: '清掃準備'
    },
    {
      date: '2026/03/23',
      room: 'Villa A',
      roomCode: '9916',
      aaColumn: 'x',  // AA列=x，不需要清扫！
      platform: '',
      guestName: 'AKIKO ITAGAKI',
      bookingSystem: 'Edrian',
      status: '',
      arrivalTime: '',
      guestCount: 8,
      needIdCheck: false,
      needPR: true,
      contact: '',
      cleaningPriority: 'LOW',
      notes: '清掃済み',
      shouldClean: false  // 不需要清扫
    },
    {
      date: '2026/03/23',
      room: 'Villa B',
      roomCode: '9926',
      aaColumn: 'x',  // AA列=x，不需要清扫！
      platform: '',
      guestName: '',
      bookingSystem: '',
      status: '',
      arrivalTime: '',
      guestCount: 3,
      needIdCheck: false,
      needPR: false,
      contact: '',
      cleaningPriority: 'MEDIUM',
      notes: '清掃済み',
      shouldClean: false  // 不需要清扫
    },
    {
      date: '2026/03/23',
      room: 'Villa C',
      roomCode: '9936',
      aaColumn: '23',  // AA列=23，需要清扫
      platform: '',
      guestName: '',
      bookingSystem: '',
      status: '',
      arrivalTime: '',
      guestCount: 3,
      needIdCheck: false,
      needPR: false,
      contact: '',
      cleaningPriority: 'MEDIUM',
      notes: '清掃準備'
    },
    {
      date: '2026/03/23',
      room: 'cube',
      roomCode: '9862',
      aaColumn: '23',  // AA列=23，需要清扫
      platform: 'A',
      guestName: 'Srila B',
      bookingSystem: 'Stan',
      status: 'DR ASKING',
      arrivalTime: '18:00',
      guestCount: 3,
      needIdCheck: false,
      needPR: true,
      contact: 'Tel +91 63665 21898',
      cleaningPriority: 'HIGH',
      notes: '当日準備必要'
    },
    {
      date: '2026/03/23',
      room: 'Villa D',
      roomCode: '9966',
      aaColumn: 'x',  // AA列=x，不需要清扫
      platform: 'Agoda',
      guestName: 'Thanh Thanh',
      bookingSystem: 'Edrian',
      status: '',
      arrivalTime: '15:00',
      guestCount: 9,
      needIdCheck: false,
      needPR: true,
      contact: 'Tel +81 09022308386',
      cleaningPriority: 'LOW',
      notes: '清掃済み',
      shouldClean: false  // 不需要清扫
    },
    {
      date: '2026/03/23',
      room: 'Villa E',
      roomCode: '9976',
      aaColumn: 'x',  // AA列=x，不需要清扫
      platform: 'Agoda',
      guestName: 'NYAT',
      bookingSystem: 'Edrian',
      status: '',
      arrivalTime: '',
      guestCount: 6,
      needIdCheck: false,
      needPR: true,
      contact: '',
      cleaningPriority: 'LOW',
      notes: '清掃済み',
      shouldClean: false
    },
    {
      date: '2026/03/23',
      room: 'Villa F',
      roomCode: '9986',
      aaColumn: '23',  // AA列=23，需要清扫
      platform: '',
      guestName: '',
      bookingSystem: '',
      status: '',
      arrivalTime: '',
      guestCount: 4,
      needIdCheck: false,
      needPR: false,
      contact: '',
      cleaningPriority: 'MEDIUM',
      notes: '清掃準備'
    },
    {
      date: '2026/03/23',
      room: 'Villa G',
      roomCode: '9695',
      aaColumn: '24',  // AA列=24，明日準備，今天不需要清扫
      platform: 'Agoda',
      guestName: 'Yin Yin Tan',
      bookingSystem: 'Edrian',
      status: '',
      arrivalTime: '',
      guestCount: 10,
      needIdCheck: false,
      needPR: true,
      contact: '',
      cleaningPriority: 'MEDIUM',
      notes: '24日チェックイン準備',
      shouldClean: false  // 今天不需要清扫
    }
  ].filter(task => task.shouldClean !== false);  // 过滤掉不需要清扫的房间

  const loadDemoData = () => {
    setTasks(demoData);
    setDate('2026年3月23日');
    setUploadStatus('✓ デモデータを読み込みました');
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'URGENT': return 'bg-red-100 border-red-600';
      case 'HIGH': return 'bg-orange-100 border-orange-600';
      case 'MEDIUM': return 'bg-yellow-100 border-yellow-600';
      case 'LOW': return 'bg-green-100 border-green-600';
      default: return 'bg-gray-100 border-gray-600';
    }
  };

  const getPriorityLabel = (priority) => {
    switch(priority) {
      case 'URGENT': return '🔴 緊急';
      case 'HIGH': return '🟠 高';
      case 'MEDIUM': return '🟡 中';
      case 'LOW': return '🟢 低';
      default: return priority;
    }
  };

  const generateSimpleText = () => {
    return displayTasks.map(task => {
      let line = `${task.room} ${task.guestCount}`;
      if (task.bedConfig) line += ` (${task.bedConfig})`;  // 床位配置
      if (task.needIdCheck) line += ' 🆔';
      if (task.needPR) line += ' PR';
      if (task.arrivalTime) line += ` [${task.arrivalTime}]`;  // 用方括号区分
      if (task.bbq) line += ' 🍖BBQ';
      if (task.bonfire) line += ' 🔥';
      if (task.pet) line += ' 🐾';
      if (task.needConfirm) line += ' ⚠️要確認';
      return line;
    }).join('\n');
  };

  const copySimpleText = () => {
    const text = generateSimpleText();
    navigator.clipboard.writeText(text);
    alert('コピーしました！');
  };

  // 不排序，保持Excel原始顺序
  const displayTasks = tasks;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-2 sm:p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
            🏠 清掃タスク自動生成システム
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Excelデータから優先度順の清掃タスクを自動生成
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
              📤 予約データ読み込み
            </h2>
            <button
              onClick={loadDemoData}
              className="w-full sm:w-auto px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold shadow-md text-sm sm:text-base"
            >
              デモデータを表示
            </button>
          </div>

          {uploadStatus && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-700 font-medium">{uploadStatus}</p>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-3">📋 読み取り対象:</h3>
            <div className="grid grid-cols-2 gap-2 text-sm text-blue-700">
              <div>• <strong>AA列</strong>: 清掃日 (23=清掃、x=不要、空白=要確認)</div>
              <div>• <strong>K列</strong>: 予約者名 (あれば→PR優先清掃)</div>
              <div>• <strong>G列</strong>: 証明書確認フラグ (≠0なら要確認)</div>
              <div>• <strong>N列</strong>: 到着時間・BBQ・篝火・ペット情報</div>
              <div>• <strong>H列</strong>: 客室名</div>
              <div>• <strong>Z列</strong>: 清掃準備人数</div>
            </div>
          </div>
        </div>

        {tasks.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-2xl font-bold text-indigo-600">{tasks.length}</div>
              <div className="text-sm text-gray-600">総清掃室数</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-2xl font-bold text-red-600">
                {tasks.filter(t => t.needPR).length}
              </div>
              <div className="text-sm text-gray-600">優先対応 (PR)</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-2xl font-bold text-orange-600">
                {tasks.filter(t => t.needIdCheck).length}
              </div>
              <div className="text-sm text-gray-600">証明書確認必要</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-2xl font-bold text-green-600">
                {tasks.reduce((sum, t) => sum + t.guestCount, 0)}
              </div>
              <div className="text-sm text-gray-600">総宿泊人数</div>
            </div>
          </div>
        )}

        {displayTasks.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
                  📝 清掃タスクリスト
                </h2>
                {date && <p className="text-sm sm:text-base text-gray-600 mt-1">{date}</p>}
              </div>
              <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
                <button
                  onClick={() => setShowSimpleView(!showSimpleView)}
                  className="flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold shadow-md text-sm sm:text-base"
                >
                  {showSimpleView ? '📋 詳細' : '📝 簡易'}
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold shadow-md text-sm sm:text-base"
                >
                  🖨️ 印刷
                </button>
              </div>
            </div>

            {showSimpleView ? (
              <div className="space-y-4">
                <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800">簡易版タスクリスト</h3>
                    <button
                      onClick={copySimpleText}
                      className="w-full sm:w-auto px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold text-sm"
                    >
                      📋 コピー
                    </button>
                  </div>
                  <pre className="font-mono text-sm sm:text-lg whitespace-pre-wrap bg-white p-3 sm:p-4 rounded border border-gray-300 leading-relaxed overflow-x-auto">
{generateSimpleText()}
                  </pre>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">記号説明:</h4>
                  <div className="text-sm text-blue-700 space-y-1">
                    <p>• <strong>PR</strong> = 優先清掃（K列に予約者名あり）</p>
                    <p>• <strong>🆔</strong> = 証明書確認必要（G列≠0）</p>
                    <p>• <strong>(床位配置)</strong> = ベッド配置情報</p>
                    <p>• <strong>[時間]</strong> = 到着予定時間（N列）</p>
                    <p>• <strong>🍖 BBQ</strong> / <strong>🔥 篝火</strong> / <strong>🐾 ペット</strong> = 特殊計画</p>
                    <p>• <strong>⚠️</strong> = AA列空白、清掃要否確認必要</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {displayTasks.map((task, index) => (
                  <div
                    key={index}
                    className={`border-l-4 rounded-lg p-5 shadow-md ${getPriorityColor(task.cleaningPriority)} transition hover:shadow-lg`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="text-2xl font-bold text-gray-800">
                          {task.room}
                        </h3>
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-white shadow">
                          {getPriorityLabel(task.cleaningPriority)}
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-700 text-white">
                          #{task.roomCode}
                        </span>
                        {task.platform && (
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-600 text-white">
                            {task.platform}
                          </span>
                        )}
                        {task.needIdCheck && (
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-600 text-white">
                            🆔 証明書確認必要
                          </span>
                        )}
                        {task.needPR && (
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-600 text-white">
                            PR 準備
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Users size={18} className="text-purple-600" />
                          <span className="font-semibold">宿泊者情報:</span>
                        </div>
                        <div className="pl-7 space-y-1">
                          {task.guestName ? (
                            <p className="font-medium text-gray-800">{task.guestName}</p>
                          ) : (
                            <p className="text-gray-500 italic">客人情報なし</p>
                          )}
                          <p className="text-sm text-gray-600">
                            <strong>人数:</strong> {task.guestCount}名
                          </p>
                          {task.bookingSystem && (
                            <p className="text-sm text-gray-600">
                              <strong>予約システム:</strong> {task.bookingSystem}
                            </p>
                          )}
                        </div>
                      </div>

                      <div>
                        {task.arrivalTime && (
                          <div className="flex items-start gap-2 mb-2">
                            <Clock size={18} className="text-green-600 mt-0.5" />
                            <div>
                              <span className="font-semibold">到着予定:</span>
                              <p className="text-lg font-bold text-green-700">{task.arrivalTime}</p>
                            </div>
                          </div>
                        )}
                        {task.bedConfig && (
                          <div className="flex items-start gap-2 mb-2">
                            <span className="text-blue-600 text-lg">🛏️</span>
                            <div>
                              <span className="font-semibold">ベッド配置:</span>
                              <p className="text-md font-medium text-blue-700">{task.bedConfig}</p>
                            </div>
                          </div>
                        )}
                        {task.status && (
                          <div className="flex items-center gap-2 mt-2">
                            <FileText size={18} className="text-blue-600" />
                            <span className="text-sm">
                              <strong>ステータス:</strong> {task.status}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {task.contact && (
                      <div className="bg-white bg-opacity-60 p-3 rounded mb-3">
                        <div className="text-sm whitespace-pre-line text-gray-700">
                          <strong>連絡先:</strong><br />
                          {task.contact}
                        </div>
                      </div>
                    )}

                    {task.notes && (
                      <div className="flex items-start gap-2 bg-yellow-50 border border-yellow-300 p-3 rounded mb-3">
                        <AlertCircle size={18} className="text-orange-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <strong className="text-gray-800">備考:</strong>
                          <p className="text-gray-700 mt-1">{task.notes}</p>
                        </div>
                      </div>
                    )}

                    {/* 特殊计划标记 */}
                    {(task.bbq || task.bonfire || task.pet) && (
                      <div className="flex flex-wrap gap-2">
                        {task.bbq && (
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 border border-orange-400 text-orange-800">
                            🍖 BBQ使用予定
                          </span>
                        )}
                        {task.bonfire && (
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 border border-red-400 text-red-800">
                            🔥 篝火使用予定
                          </span>
                        )}
                        {task.pet && (
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 border border-green-400 text-green-800">
                            🐾 ペット同伴
                          </span>
                        )}
                      </div>
                    )}

                    {task.needConfirm && (
                      <div className="flex items-start gap-2 bg-red-50 border-2 border-red-400 p-3 rounded">
                        <AlertCircle size={18} className="text-red-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <strong className="text-red-800">⚠️ 確認必要:</strong>
                          <p className="text-red-700 mt-1">AA列が空白です。清掃要否を確認してください。</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CleaningScheduleGenerator;
