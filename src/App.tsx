import React, { useState } from 'react';
import { Users, Clock, AlertCircle, FileText } from 'lucide-react';

const CleaningScheduleGenerator = () => {
  const [tasks, setTasks] = useState([]);
  const [date, setDate] = useState('');
  const [uploadStatus, setUploadStatus] = useState('');
  const [showSimpleView, setShowSimpleView] = useState(false);

  const demoData = [
    // AA列=28 需要清掃
    {
      room: 'KOKO', roomCode: '9920', aaColumn: '28',
      platform: 'Agoda', guestName: 'Kokoro Haga', bookingSystem: 'Edrian',
      status: '', arrivalTime: '16:30', guestCount: 2,
      needIdCheck: false, needPR: true,
      contact: 'Tel +090-2626-5563\ncocorotomato@gmail.com',
      cleaningPriority: 'HIGH', notes: '当日チェックアウト→チェックイン'
    },
    {
      room: 'MARU', roomCode: '9930', aaColumn: '28',
      platform: '', guestName: 'YUMI SHIBANO', bookingSystem: 'Stan',
      status: '', arrivalTime: '', guestCount: 4,
      needIdCheck: false, needPR: true,
      contact: 'Tel +81 70 1004 7530',
      cleaningPriority: 'MEDIUM', notes: '28日チェックイン準備'
    },
    {
      room: 'RUNA', roomCode: '9940', aaColumn: '28',
      platform: 'Agoda', guestName: 'ASAKO HAYASHI', bookingSystem: 'Edrian',
      status: 'DR ASKING', arrivalTime: '20:00', guestCount: 3,
      needIdCheck: false, needPR: true,
      contact: 'asako27iii@gmail.com\n090-4932-7833',
      cleaningPriority: 'HIGH', notes: '当日チェックアウト→チェックイン'
    },
    {
      room: 'MEI', roomCode: '9950', aaColumn: '28',
      platform: '', guestName: 'Eric Tang', bookingSystem: 'Stan',
      status: 'DR ASKING', arrivalTime: '16:00', guestCount: 4,
      needIdCheck: false, needPR: true,
      contact: 'Tel +81 80 9181 6820\nerictang5566@gmail.com',
      cleaningPriority: 'HIGH', notes: '当日チェックアウト→チェックイン'
    },
    {
      room: 'RIN', roomCode: '9960', aaColumn: '28',
      platform: 'Agoda', guestName: 'Yong Jia En', bookingSystem: 'Edrian',
      status: '', arrivalTime: '15:00-16:00', guestCount: 2,
      needIdCheck: false, needPR: true,
      contact: 'jiaenyje@hotmail.com',
      cleaningPriority: 'HIGH', notes: '当日チェックアウト→チェックイン'
    },
    {
      room: 'MOMO', roomCode: '9980', aaColumn: '28',
      platform: '', guestName: 'Misaki Tatsuta', bookingSystem: 'Stan',
      status: '', arrivalTime: '18:00-19:00', guestCount: 2,
      needIdCheck: false, needPR: true,
      contact: 'Tel +81 80 6550 0090\nnagitarou1007@gmail.com',
      cleaningPriority: 'MEDIUM', notes: '28日チェックイン準備'
    },
    {
      room: '月江苑', roomCode: '9926', aaColumn: '28',
      platform: 'Agoda', guestName: 'Pailin Jakpa', bookingSystem: 'Edrian',
      status: 'DR ASKING', arrivalTime: '', guestCount: 8,
      needIdCheck: false, needPR: true,
      contact: 'Tel +66 955922440\npailin2001@icloud.com',
      cleaningPriority: 'MEDIUM', notes: '28日チェックイン準備'
    },
    {
      room: 'Villa A', roomCode: '9916', aaColumn: '28',
      platform: '', guestName: 'SYAHDIMIN RASHIDI', bookingSystem: 'Stan',
      status: 'DR ASKING', arrivalTime: '15:00', guestCount: 5,
      needIdCheck: false, needPR: true,
      contact: 'Tel +60 19 815 6642\nsyahdimin@yahoo.com',
      cleaningPriority: 'HIGH', notes: '当日チェックアウト→チェックイン'
    },
    {
      room: 'Villa B', roomCode: '9926', aaColumn: '28',
      platform: '', guestName: 'Koji Nakamura', bookingSystem: 'Stan',
      status: 'DR ASKING', arrivalTime: '', guestCount: 10,
      needIdCheck: false, needPR: true,
      contact: 'Tel +81 90 6585 4251\nkoji.kiyono.nowa@icloud.com',
      cleaningPriority: 'MEDIUM', notes: '28日チェックイン準備'
    },
    {
      room: 'Villa C', roomCode: '9936', aaColumn: '28',
      platform: '', guestName: 'NITIN AGSTWAL', bookingSystem: 'Edrian',
      status: 'DR ASKING', arrivalTime: '21:00-23:00', guestCount: 4,
      needIdCheck: false, needPR: true,
      contact: 'Tel +91 97850 03111\nindia.appletours@gmail.com',
      cleaningPriority: 'HIGH', notes: '当日チェックアウト→チェックイン'
    },
    {
      room: 'cube', roomCode: '9862', aaColumn: '28',
      platform: 'A', guestName: 'Andre Wilis', bookingSystem: 'Stan',
      status: 'Waiting to accept', arrivalTime: '16:00-17:00', guestCount: 4,
      needIdCheck: false, needPR: true,
      contact: 'Tel +62 812 9636 0102\nwilisandre12345@gmail.com',
      cleaningPriority: 'HIGH', notes: '当日チェックアウト→チェックイン'
    },
    {
      room: 'Villa E', roomCode: '9976', aaColumn: '28',
      platform: 'A', guestName: '宮島 Kentaro Miyajima', bookingSystem: 'Edrian',
      status: '', arrivalTime: '13:00', guestCount: 4,
      needIdCheck: false, needPR: true,
      contact: 'Tel 080-2530-6659\nmiyajimakentaro1012@gmail.com\n※early check-in 1PM guest will pay 5,000 JPY and late check out',
      cleaningPriority: 'MEDIUM', notes: '28日チェックイン準備'
    },
    // AA列=x 清掃済み（表示しない）
    // MOKA, NOA, LEO, Villa D, Villa F → shouldClean: false
    // Grand V, panorama → T列あり（連泊）→ 清掃不要
    // NOA: AA=x だが DR DONE あり、到着17:00
    {
      room: 'NOA', roomCode: '9909', aaColumn: 'x',
      platform: 'B-DR', guestName: 'RIKA ISAYAMA', bookingSystem: 'Stan blocked',
      status: 'DR DONE', arrivalTime: '17:00', guestCount: 5,
      needIdCheck: false, needPR: true,
      contact: 'Tel l+81 18411946\nriku.07020530@gmail.com',
      cleaningPriority: 'LOW', notes: '清掃済み', shouldClean: false
    },
    // Villa G: AA=28
    {
      room: 'Villa G', roomCode: '9695', aaColumn: '28',
      platform: 'Agoda', guestName: 'tosa takamichi', bookingSystem: 'Edrian',
      status: 'DR ASKING', arrivalTime: '', guestCount: 2,
      needIdCheck: false, needPR: true,
      contact: 'Tel 07022987321\ntakamichidaze@icloud.com',
      cleaningPriority: 'MEDIUM', notes: '28日チェックイン準備'
    },
  ].filter(task => task.shouldClean !== false);

  const loadDemoData = () => {
    setTasks(demoData);
    setDate('2026年3月28日');
    setUploadStatus('✓ 2026年3月28日のデータを読み込みました');
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
    return tasks.map(task => {
      let line = `${task.room} ${task.guestCount}名`;
      if (task.needIdCheck) line += ' 🆔';
      if (task.needPR) line += ' PR';
      if (task.arrivalTime) line += ` [${task.arrivalTime}]`;
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

  const displayTasks = tasks;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-2 sm:p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
            🏠 清掃タスク自動生成システム
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            2026年3月28日（土）清掃リスト
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
              📅 2026年3月28日 データ
            </h2>
            <button
              onClick={loadDemoData}
              className="w-full sm:w-auto px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold shadow-md text-sm sm:text-base"
            >
              28日の清掃リストを表示
            </button>
          </div>

          {uploadStatus && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-700 font-medium">{uploadStatus}</p>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-2 text-sm text-blue-700">
              <div>• <strong>AA列=28</strong>: 本日清掃必要</div>
              <div>• <strong>AA列=x</strong>: 清掃済み（除外）</div>
              <div>• <strong>AA列=空白</strong>: ⚠️ 要確認</div>
              <div>• <strong>PR</strong>: 予約者名あり→優先清掃</div>
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
                {tasks.filter(t => t.needConfirm).length}
              </div>
              <div className="text-sm text-gray-600">⚠️ 要確認</div>
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
                    <p>• <strong>PR</strong> = 優先清掃</p>
                    <p>• <strong>🆔</strong> = 証明書確認必要</p>
                    <p>• <strong>[時間]</strong> = 到着予定時間</p>
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
                        <h3 className="text-2xl font-bold text-gray-800">{task.room}</h3>
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
                            PR 優先
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
