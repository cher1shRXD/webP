import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { socket } from '../socket';
import VoteBar from '../components/VoteBar';

export default function Room() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('question'); // question | vote
  const [selected, setSelected] = useState(null);
  const isAdmin = useRef(false);

  useEffect(() => {
    const key = localStorage.getItem('roomKey');
    isAdmin.current = key && key === `admin-${code}`;
    fetchRoom();
    socket.connect();
    socket.emit('joinRoom', code);
    socket.on('room:update', handleRoomUpdate);
    socket.on('question:new', handleQuestionNew);
    socket.on('question:update', handleQuestionUpdate);
    return () => {
      socket.off('room:update', handleRoomUpdate);
      socket.off('question:new', handleQuestionNew);
      socket.off('question:update', handleQuestionUpdate);
      socket.disconnect();
    };
    // eslint-disable-next-line
  }, [code]);

  const fetchRoom = async () => {
    try {
      const data = await api.getRoom(code);
      setRoom(data);
      if (data.isWritingQuestion) setStep('question');
      else setStep('vote');
      if (data.questions?.length) setSelected(data.questions[data.questions.length - 1]);
    } catch (e) {
      alert('방을 찾을 수 없습니다.');
      navigate('/');
    }
  };

  // 소켓 payload 직접 반영
  const handleRoomUpdate = (payload) => {
    setRoom(prev => ({ ...prev, ...payload }));
    if (payload.isWritingQuestion !== undefined) setStep(payload.isWritingQuestion ? 'question' : 'vote');
  };
  const handleQuestionNew = ({ question }) => {
    setRoom(prev => prev ? { ...prev, questions: [...(prev.questions || []), question] } : prev);
    setSelected(question); // 새 질문이 오면 자동으로 해당 질문으로 이동
    setStep('vote');
  };
  const handleQuestionUpdate = ({ question }) => {
    setRoom(prev => {
      if (!prev) return prev;
      const questions = (prev.questions || []).map(q => q.id === question.id ? question : q);
      return { ...prev, questions };
    });
    // 디버깅용 로그
    if (selected?.id === question.id) {
      console.log('selected 업데이트:', question);
    }
    setSelected(prev => (prev && prev.id === question.id ? question : prev));
  };

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

  const total = selected?.totalCount || 0;
  const yes = selected?.yesCount || 0;
  const no = selected?.noCount || 0;

  useEffect(() => {
    if (!room || !selected) return;
    const updated = room.questions?.find(q => q.id === selected.id);
    if (updated && updated !== selected) {
      setSelected(updated);
    }
  }, [room, selected]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-gray-900 text-white gap-8 px-4 py-8">
      <div className="w-full max-w-md bg-gray-800 rounded-2xl shadow-xl p-6 flex flex-col items-center gap-4 border border-purple-700">
        <h2 className="text-2xl font-extrabold mb-2 tracking-wider text-purple-300">방 코드: <span className="text-white">{code}</span></h2>
        <ol className="w-full mb-4 flex flex-col gap-1">
          {room?.questions?.slice().reverse().map((q, i) => (
            <li
              key={q.id}
              className={`p-2 rounded-lg cursor-pointer transition-all duration-200 border border-transparent ${selected?.id === q.id ? 'bg-purple-700 border-purple-400 scale-105' : 'bg-gray-700 hover:bg-gray-600'}`}
              onClick={() => setSelected(q)}
            >
              {q.text}
            </li>
          ))}
        </ol>
        {room?.isWritingQuestion && (
          <div className="text-yellow-400 font-bold mb-2 animate-pulse">질문 작성중...</div>
        )}
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
        {step === 'vote' && selected && (
          <div className="flex flex-col items-center gap-4 w-full">
            <h3 className="text-xl font-bold mb-2 text-purple-200">투표: <span className="text-white">{selected.text}</span></h3>
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
        {isAdmin.current && step === 'vote' && (
          <button
            onClick={handleNext}
            className="bg-gradient-to-r from-pink-500 to-yellow-500 px-6 py-2 rounded text-lg font-bold mt-4 shadow-lg hover:scale-105 transition"
            disabled={loading}
          >
            다음 질문
          </button>
        )}
        <VoteBar yes={yes} no={no} total={total} />
      </div>
    </div>
  );
}
