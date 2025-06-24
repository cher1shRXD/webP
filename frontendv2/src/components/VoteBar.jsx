export default function VoteBar({ yes, no, total }) {
  const yesP = total ? (yes / total) * 100 : 0; // 백분율 구하기
  const noP = total ? (no / total) * 100 : 0;
  return (
    <div className="w-full max-w-md my-6">
      <div className="relative h-10 rounded-full overflow-hidden flex border-2 border-gray-700 bg-gray-800">
        {/* YES(왼쪽 바) */}
        <div
          className="absolute left-0 top-0 h-full bg-green-400 transition-all duration-500"
          style={{ width: `${yesP}%`, borderTopLeftRadius: 9999, borderBottomLeftRadius: 9999, zIndex: 1 }}
        />
        {/* NO(오른쪽 바) */}
        <div
          className="absolute right-0 top-0 h-full bg-purple-400 transition-all duration-500"
          style={{ width: `${noP}%`, borderTopRightRadius: 9999, borderBottomRightRadius: 9999, zIndex: 1 }}
        />
        {/* YES 텍스트 */}
        <span
          className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-lg text-white drop-shadow"
          style={{ zIndex: 2 }}
        >
          YES {yes} ({Math.round(yesP)}%)
        </span>
        {/* NO 텍스트 */}
        <span
          className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-lg text-white drop-shadow"
          style={{ zIndex: 2 }}
        >
          NO {no} ({Math.round(noP)}%)
        </span>
      </div>
      <div className="flex justify-between mt-2 text-base text-gray-300">
        <span>YES: {yes}</span>
        <span>NO: {no}</span>
        <span>총 투표: {total}</span>
      </div>
    </div>
  );
}
