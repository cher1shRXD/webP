import { Button } from 'antd';

export default function RoomResult({ room, onExit }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-gray-900 text-white px-4">
      <div className="w-full max-w-lg bg-gray-800 rounded-2xl shadow-xl p-8 flex flex-col items-center gap-6 border border-purple-700 mt-8">
        <h1 className="text-3xl font-extrabold text-purple-300 mb-2">투표 결과</h1>
        <div className="text-lg text-gray-200 mb-4">총 질문 수: <span className="text-yellow-300 font-bold">{room?.questions?.length || 0}</span></div>
        <ol className="w-full mb-4 flex flex-col gap-2">
          {room?.questions?.map((q, i) => (
            <li key={q.id} className="bg-gray-700 rounded-lg p-4 flex flex-col gap-1 border border-purple-500">
              <div className="font-bold text-lg text-purple-200">{i + 1}. {q.text}</div>
              <div className="flex gap-4 text-base mt-1">
                <span className="text-green-400 font-bold">YES: {q.yesCount}</span>
                <span className="text-purple-400 font-bold">NO: {q.noCount}</span>
                <span className="text-gray-300">총: {q.totalCount}</span>
              </div>
            </li>
          ))}
        </ol>
        <Button type="primary" size="large" onClick={onExit} className="w-full max-w-xs">나가기</Button>
      </div>
    </div>
  );
}
