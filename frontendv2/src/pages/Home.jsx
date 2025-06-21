import { useState } from 'react';
import { api } from '../api';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCreate = async () => {
    setLoading(true);
    try {
      const data = await api.createRoom();
      localStorage.setItem('roomKey', `admin-${data.code}`);
      navigate(`/room/${data.code}`);
    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = () => {
    if (!code.trim()) return alert('참가코드를 입력하세요');
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
