import usePlay from "../hooks/usePlay";

const Room = () => {
  const {
    isAdmin,
    questions,
    handleNewQuestion,
    handleVote,
    handleCurrentQuestion,
    currentQuestion,
  } = usePlay();

  return (
    <div className="w-full max-w-120 mx-auto h-full flex flex-col items-center justify-center text-white gap-16">
      <h1 className="text-5xl font-jua">말해 YES or NO</h1>
      {isAdmin && (
        <>
          <input
            type="text"
            onChange={handleCurrentQuestion}
            value={currentQuestion}
            className="px-4 py-2 bg-[#626262] outline-none text-xl rounded-lg font-jua"
            placeholder="질문을 입력하세요."
          />
          <button
            onClick={handleNewQuestion}
            className="bg-blue-500 px-4 py-2 rounded">
            게시
          </button>
        </>
      )}
      <div>
        {questions.map((question, index) => (
          <div key={index} className="text-xl">
            {question.text}
          </div>
        ))}
      </div>
      <div className="flex gap-4">
        <button
          onClick={() => handleVote("yes")}
          className="bg-green-500 px-4 py-2 rounded">
          Yes
        </button>
        <button
          onClick={() => handleVote("no")}
          className="bg-red-500 px-4 py-2 rounded">
          No
        </button>
      </div>
    </div>
  );
};

export default Room;
