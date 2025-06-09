const Home = () => {
  return (
    <div className="w-full max-w-120 mx-auto h-full flex flex-col items-center justify-center text-white gap-16">
      <h1 className="text-5xl font-jua">말해 YES or NO</h1>
      <div className="w-full flex flex-col gap-8">
        <div className="w-full flex flex-col gap-1">
          <p className="text-lg font-jua">참가코드</p>
          <div className="w-full flex gap-2">
            <input type="text" className="flex-1 px-4 py-2 bg-[#626262] outline-none text-xl rounded-lg font-jua" placeholder="참가코드 입력" />
            <button className="px-6 py-2 bg-green-500 rounded-lg font-jua cursor-pointer active:bg-green-600 transition-colors">참가</button>
          </div>
        </div>
        <button className="w-full py-2 bg-blue-500 rounded-lg text-xl font-jua cursor-pointer active:bg-blue-600 transition-colors">방 생성</button>
      </div>
    </div>
  )
}

export default Home