import usePlay from "../hooks/usePlay";

const Room = () => {
  const {
    isAdmin,
    questions,
    handleNewQuestion,
    handleVote,
    handleCurrentQuestion,
    currentQuestion,
    voteCounts,
  } = usePlay();

  const noVotesPercentage = voteCounts?.noVotes && voteCounts?.totalVotes ? (voteCounts.noVotes / voteCounts.totalVotes) * 100 : 0;
  const yesVotesPercentage = voteCounts?.yesVotes && voteCounts?.totalVotes ? (voteCounts.yesVotes / voteCounts.totalVotes) * 100 : 0;

  return (
    <div className="w-full max-w-200 mx-auto h-full flex flex-col items-center justify-center text-white gap-8">
      <ol>
        {questions.map((item, idx, arr) => (
          <li
            key={idx}
            className={`font-jua text-center list-decimal ${
              item.text !== "문제를 생각중 입니다..." ? arr.length - 1 === idx ? "text-green-400 text-4xl" : "text-lg" : "text-lg text-[#626262]"
            }`}>
            {item.text}
          </li>
        ))}
      </ol>
      {isAdmin ? (
        <div className="w-full max-w-120 flex gap-2">
          {
            questions[questions.length - 1].text === "문제를 생각중 입니다..." ? (
              <>
                <input
                  type="text"
                  onChange={handleCurrentQuestion}
                  value={currentQuestion}
                  className="flex-1 px-4 py-2 bg-[#626262] outline-none text-xl rounded-lg font-jua"
                  placeholder="질문을 입력하세요."
                />
                <button
                  onClick={handleNewQuestion}
                  className="bg-blue-500 px-4 py-2 rounded-lg font-jua">
                  게시
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => handleVote("yes")}
                  className="bg-red-400 flex-1 px-4 py-2 rounded cursor-pointer">
                  종료
                </button>
                <button
                  onClick={() => handleVote("no")}
                  className="bg-blue-500 flex-1 px-4 py-2 rounded cursor-pointer">
                  다음 질문
                </button>
              </>
            )
          }
          
        </div>
      ) : (
        <div className="flex gap-4">
          <button
            onClick={() => handleVote("yes")}
            className="bg-blue-500 px-4 py-2 rounded">
            Yes
          </button>
          <button
            onClick={() => handleVote("no")}
            className="bg-red-500 px-4 py-2 rounded">
            No
          </button>
        </div>
      )}
      <div className="w-full h-30 border-x border-[#8B8B8B] mt-8 py-auto flex items-center justify-between text-xl font-jua">
        <div
          className="h-20 bg-red-400 transition-all rounded-r-lg flex items-center justify-end overflow-hidden pr-4"
          style={{ width: `${noVotesPercentage || 0}%` }}>
          <p>{voteCounts?.noVotes || 0} ({Math.round(noVotesPercentage || 0)}%)</p>
        </div>
        <div
          className="h-20 bg-blue-400 transition-all rounded-l-lg flex items-center overflow-hidden pl-4"
          style={{ width: `${yesVotesPercentage || 0}%` }}>
          <p>{voteCounts?.yesVotes || 0} ({Math.round(yesVotesPercentage || 0)}%)</p>
        </div>
      </div>
      <div className="w-full flex items-center gap-16 justify-center">
        <div className="flex flex-col items-center gap-2 font-jua">
          <p>총 투표수</p>
          <p className="text-2xl">{voteCounts?.noVotes || 0 + voteCounts?.yesVotes || 0}</p>
        </div>
        <div className="flex flex-col items-center gap-2 font-jua text-">
          <p>YES 득표수</p>
          <p className="text-2xl">{voteCounts?.yesVotes || 0}</p>
        </div>
        <div className="flex flex-col items-center gap-2 font-jua">
          <p>NO 득표수</p>
          <p className="text-2xl">{voteCounts?.noVotes || 0}</p>
        </div>
      </div>
    </div>
  );
};

export default Room;
