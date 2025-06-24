import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { socket } from '../socket';
import VoteBar from '../components/VoteBar';
import { notification } from 'antd'
import RoomResult from './RoomResult';

export default function Room() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false); 
  const [step, setStep] = useState('question'); 
  const [selected, setSelected] = useState(null); 
  const [ended, setEnded] = useState(false); 
  const isAdmin = useRef(false); 

  // 최초 마운트 시 실행: socket 연결, 방 참여, 이벤트 리스너 등록
  useEffect(() => {
    const key = localStorage.getItem('roomKey');
    isAdmin.current = key && key === `admin-${code}`; // 관리자인지 판별

    fetchRoom(); // 방 데이터 불러오기

    socket.connect();
    socket.emit('joinRoom', code); // 해당 방에 참가

    // 실시간 이벤트 리스너 등록
    socket.on('room:update', handleRoomUpdate);
    socket.on('question:new', handleQuestionNew);
    socket.on('question:update', handleQuestionUpdate);
    socket.on('room:end', handleRoomEnd);

    return () => {
      // 컴포넌트 언마운트 시 리스너 해제 및 socket 연결 종료
      socket.off('room:update', handleRoomUpdate);
      socket.off('question:new', handleQuestionNew);
      socket.off('question:update', handleQuestionUpdate);
      socket.off('room:end', handleRoomEnd);
      socket.disconnect();
    };
  }, [code]);

  // 방 데이터 초기 로딩
  const fetchRoom = async () => {
    try {
      const data = await api.getRoom(code); // API로 방 정보 가져오기
      setRoom(data);
      if (data.isWritingQuestion) setStep('question');
      else setStep('vote');
      if (data.questions?.length) {
        // 마지막 질문을 기본 선택
        setSelected(data.questions[data.questions.length - 1]);
      }
    } catch (e) {
      alert('방을 찾을 수 없습니다.');
      navigate('/');
    }
  };

  // 방 상태가 갱신될 때 실행되는 콜백
  const handleRoomUpdate = (payload) => {
    setRoom(prev => ({ ...prev, ...payload }));
    if (payload.isWritingQuestion !== undefined) {
      setStep(payload.isWritingQuestion ? 'question' : 'vote');
    }
  };

  // 새로운 질문이 도착했을 때
  const handleQuestionNew = ({ question }) => {
    setRoom(prev => prev ? {
      ...prev,
      questions: [...(prev.questions || []), question]
    } : prev);
    setSelected(question); // 새 질문 선택
    setStep('vote'); // 단계 전환
  };

  // 기존 질문이 업데이트됐을 때 (ex: 투표 수 반영)
  const handleQuestionUpdate = ({ question }) => {
    setRoom(prev => {
      if (!prev) return prev;
      const questions = (prev.questions || []).map(q =>
        q.id === question.id ? question : q
      );
      return { ...prev, questions };
    });

    setSelected(prev => (prev && prev.id === question.id ? question : prev));
  };

  // 질문 추가 (관리자만 가능)
  const handleAdd = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      await api.addQuestion(code, input);
      setInput('');
    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  // 투표하기
  const handleVote = async (vote) => {
    if (!selected) return;
    setLoading(true);
    try {
      await api.vote(selected.id, vote);
    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  // 다음 질문으로 전환 요청 (관리자만)
  const handleNext = async () => {
    setLoading(true);
    try {
      await api.next(code);
    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  // 방 종료 이벤트 수신
  const handleRoomEnd = () => {
    if (isAdmin.current) {
      setEnded(true); // 관리자에게는 결과 화면 표시
    } else {
      notification.info({
        message: '세션이 종료되었습니다',
        description: '방장이 방을 종료했습니다.',
        duration: 3
      });
      navigate('/');
    }
  };

  // 방 종료 버튼 클릭 (관리자만)
  const handleEndRoom = () => {
    if (!window.confirm('정말로 방을 종료하시겠습니까?')) return;
    setLoading(true);
    socket.emit('room:end', { code }); // 서버에 종료 알림
    setEnded(true);
    setLoading(false);
  };

  // 현재 질문의 투표 수
  const total = selected?.totalCount || 0;
  const yes = selected?.yesCount || 0;
  const no = selected?.noCount || 0;

  // 방 상태 또는 선택된 질문이 바뀔 때 동기화
  useEffect(() => {
    if (!room || !selected) return;
    const updated = room.questions?.find(q => q.id === selected.id);
    if (updated && updated !== selected) {
      setSelected(updated);
    }
  }, [room, selected]);

  // 방 종료 후 결과 화면
  if (ended && isAdmin.current) {
    return <RoomResult room={room} onExit={() => navigate('/')} />;
  }

  // 일반 참여자용 종료 화면
  if (ended && !isAdmin.current) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-gray-900 text-white px-4">
        <div className="w-full max-w-lg bg-gray-800 rounded-2xl shadow-xl p-8 flex flex-col items-center gap-6 border border-purple-700 mt-8">
          <h1 className="text-3xl font-extrabold text-purple-300 mb-2">세션이 종료되었습니다</h1>
          <div className="text-lg text-gray-200 mb-4">방장이 방을 종료했습니다.</div>
          <button
            className="w-full max-w-xs bg-gradient-to-r from-pink-500 to-yellow-500 text-white font-bold py-3 rounded-xl text-lg shadow-lg hover:scale-105 transition"
            onClick={() => navigate('/')}
          >
            나가기
          </button>
        </div>
      </div>
    );
  }

  // 메인 화면 UI
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-gray-900 text-white gap-8 px-4 py-8 relative">
      
      {/* 방 코드 표시 */}
      <div className="fixed top-4 right-4 z-50 bg-purple-800 bg-opacity-90 px-6 py-2 rounded-full shadow-lg border-2 border-purple-400 flex items-center gap-2">
        <span className="text-sm font-bold tracking-widest text-purple-100">방 코드</span>
        <span className="text-lg font-extrabold text-yellow-300">{code}</span>
      </div>

      {/* 나가기 버튼 (참여자만) */}
      <div className="fixed top-4 left-4 z-50">
        {!isAdmin.current && !ended && (
          <button
            className="bg-gray-700 bg-opacity-80 border border-purple-400 text-white font-bold px-5 py-2 rounded-full shadow hover:bg-purple-700 transition"
            onClick={() => navigate('/')}
          >
            나가기
          </button>
        )}
      </div>

      {/* 본문 */}
      <div className="w-full max-w-md bg-gray-800 rounded-2xl shadow-xl p-6 flex flex-col items-center gap-4 border border-purple-700">
        
        {/* 질문 목록 */}
        <ol className="w-full mb-4 flex flex-col gap-1">
          {room?.questions?.slice().reverse().map((q) => (
            <li
              key={q.id}
              className={`p-2 rounded-lg cursor-pointer transition-all duration-200 border border-transparent ${
                selected?.id === q.id
                  ? 'bg-purple-700 border-purple-400 scale-105'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
              onClick={() => setSelected(q)}
            >
              {q.text}
            </li>
          ))}
        </ol>

        {/* 질문 작성중 표시 */}
        {room?.isWritingQuestion && (
          <div className="text-yellow-400 font-bold mb-2 animate-pulse">질문 작성중...</div>
        )}

        {/* 질문 추가 폼 (관리자 + 작성 단계일 때만) */}
        {isAdmin.current && step === 'question' && (
          <div className="flex gap-2 w-full mb-4">
            <input
              className="flex-1 p-2 rounded bg-gray-700 text-lg outline-none border-2 border-purple-400 focus:border-yellow-400 transition"
              placeholder="질문을 입력하세요"
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={loading}
            />
            <button onClick={handleAdd} className="bg-gradient-to-r from-blue-500 to-purple-500 px-4 rounded font-bold shadow" disabled={loading}>
              {loading ? '추가중...' : '질문 추가'}
            </button>
          </div>
        )}

        {/* 투표 UI (투표 단계일 때) */}
        {step === 'vote' && selected && (
          <div className="flex flex-col items-center gap-4 w-full">
            <h3 className="text-xl font-bold mb-2 text-purple-200">
              투표: <span className="text-white">{selected.text}</span>
            </h3>
            <div className="flex gap-4 w-full">
              <button
                onClick={() => handleVote('yes')}
                className="bg-gradient-to-r from-green-400 to-green-600 flex-1 py-2 rounded text-lg font-bold shadow-lg hover:scale-105 transition"
                disabled={loading}
              >
                Yes
              </button>
              <button
                onClick={() => handleVote('no')}
                className="bg-gradient-to-r from-purple-400 to-purple-600 flex-1 py-2 rounded text-lg font-bold shadow-lg hover:scale-105 transition"
                disabled={loading}
              >
                No
              </button>
            </div>
          </div>
        )}

        {/* 관리자: 다음 질문 버튼 */}
        {isAdmin.current && step === 'vote' && (
          <button
            onClick={handleNext}
            className="bg-gradient-to-r from-pink-500 to-yellow-500 px-6 py-2 rounded text-lg font-bold mt-4 shadow-lg hover:scale-105 transition"
            disabled={loading}
          >
            다음 질문
          </button>
        )}

        {/* 관리자: 방 종료 버튼 */}
        {isAdmin.current && !ended && (
          <button
            onClick={handleEndRoom}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg shadow-lg transition mb-2"
            disabled={loading}
          >
            종료하기
          </button>
        )}

        {/* 투표 결과 시각화 */}
        <VoteBar yes={yes} no={no} total={total} />
      </div>
    </div>
  );
}
