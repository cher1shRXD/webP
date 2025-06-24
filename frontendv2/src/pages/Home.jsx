import { useState } from 'react';
import { api } from '../api';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 찬반투표 방 생성을 요청하는 API 통신 함수
  const handleCreate = async () => {
    setLoading(true);
    try {
      const data = await api.createRoom();
      // 요청이 완료되었을때, 어드민용 키를 발급, 저장
      localStorage.setItem('roomKey', `admin-${data.code}`);
      // 생성된 방으로 이동
      navigate(`/room/${data.code}`);
    } catch (e) {
      // 실패시 알림
      alert(e.message);
    } finally {
      // 로딩 상태 초기화
      setLoading(false);
    }
  };

  // 방에 참가하는 함수
  const handleJoin = async () => {
    // 코드 입력란이 비어있을 경우 
    if (!code.trim()) return alert('참가코드를 입력하세요');
    // 입력한 코드와 일치하는 방이 있는지 API 요청으로 확인
    const data = await api.isExistRoom(code);
    // 방이 없는 경우
    if(!data) return alert("존재하지 않는 방입니다.");
    // 방이 있는 경우 이동
    navigate(`/room/${code.trim()}`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white gap-8 px-4">
      <h1 className="text-4xl font-bold mb-8">말해 YES or NO</h1>
      <div className="flex flex-col gap-4 w-full max-w-xs">
        <input
          className="p-3 rounded bg-gray-700 text-lg outline-none"
          placeholder="참가코드 입력"
          value={code}
          onChange={e => setCode(e.target.value)}
        />
        <button onClick={handleJoin} className="bg-green-500 py-2 rounded text-lg font-bold" disabled={loading}>
          참가
        </button>
        <button onClick={handleCreate} className="bg-blue-500 py-2 rounded text-lg font-bold" disabled={loading}>
          {loading ? '방 생성중...' : '방 생성'}
        </button>
      </div>
    </div>
  );
}
