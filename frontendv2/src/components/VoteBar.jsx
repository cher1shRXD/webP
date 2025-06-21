export default function VoteBar({ yes, no, total }) {
  const yesP = total ? (yes / total) * 100 : 0;
  const noP = total ? (no / total) * 100 : 0;
  return (
    <div className="w-full max-w-md my-6">
      <div className="relative h-10 rounded-full overflow-hidden flex border-2 border-gray-700 bg-gray-800">
        {/* YES(왼쪽) */}
        <div
          className="absolute left-0 top-0 h-full bg-green-400 flex items-center justify-start pl-4 text-black font-bold text-lg transition-all duration-500 whitespace-nowrap"
          style={{ width: `${yesP}%`, borderTopLeftRadius: 9999, borderBottomLeftRadius: 9999, zIndex: 1 }}
        >
          {yesP > 10 && <span style={{ whiteSpace: 'nowrap', overflow: 'visible' }}>YES {yes} ({Math.round(yesP)}%)</span>}
        </div>
        {/* NO(오른쪽) */}
        <div
          className="absolute right-0 top-0 h-full bg-purple-400 flex items-center justify-end pr-4 text-black font-bold text-lg transition-all duration-500 whitespace-nowrap"
          style={{ width: `${noP}%`, borderTopRightRadius: 9999, borderBottomRightRadius: 9999, zIndex: 1 }}
        >
          {noP > 10 && <span style={{ whiteSpace: 'nowrap', overflow: 'visible' }}>NO {no} ({Math.round(noP)}%)</span>}
        </div>
      </div>
      <div className="flex justify-between mt-2 text-base text-gray-300">
        <span>YES: {yes}</span>
        <span>NO: {no}</span>
        <span>총 투표: {total}</span>
      </div>
    </div>
  );
}
