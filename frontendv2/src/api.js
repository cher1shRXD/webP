const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export const api = {
  createRoom: async () => {
    const res = await fetch(`${BASE_URL}/rooms`, { method: 'POST' });
    if (!res.ok) throw new Error('방 생성 실패');
    return res.json();
  },
  getRoom: async (id) => {
    const res = await fetch(`${BASE_URL}/rooms/${id}`);
    if (!res.ok) throw new Error('방 정보 조회 실패');
    return res.json();
  },
  isExistRoom: async (id) => {
    const res = await fetch(`${BASE_URL}/rooms/${id}/exist`);
    if (!res.ok) throw new Error('방 존재 유무 조회 실패');
    return res.json();
  },
  addQuestion: async (roomId, topic) => {
    const res = await fetch(`${BASE_URL}/rooms/${roomId}/questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic })
    });
    if (!res.ok) throw new Error('질문 추가 실패');
    return res.json();
  },
  vote: async (questionId, vote) => {
    const res = await fetch(`${BASE_URL}/questions/${questionId}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vote })
    });
    if (!res.ok) throw new Error('투표 실패');
    return res.json();
  },
  next: async (roomId) => {
    const res = await fetch(`${BASE_URL}/room/${roomId}/next`, { method: 'POST' });
    if (!res.ok) throw new Error('다음 질문 준비 실패');
    return res.json();
  }
};
