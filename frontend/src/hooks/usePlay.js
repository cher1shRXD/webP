import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";

const usePlay = () => {
  const socketRef = useRef(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [roomId, setRoomId] = useState(null);
  const [questions, setQuestions] = useState([{ text: "문제를 생각중 입니다..." }]);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const { pathname } = useParams();
  const [voteCounts, setVoteCounts] = useState({
    totalVotes: 0,
    yesVotes: 0,
    noVotes: 0,
  });

  const handleVoteCounts = (data) => {
    console.log(data);
    setVoteCounts(data);
  };


  const handleCurrentQuestion = (e) => {
    const { value } = e.target;
    setCurrentQuestion(value);
  };

  useEffect(() => {
    const roomKey = localStorage.getItem("roomKey");
    if (roomKey && roomKey.startsWith("admin-")) {
      setIsAdmin(true);
      setRoomId(roomKey.split("-")[1]);
    } else {
      setRoomId(pathname);
    }
  }, [pathname]);

  useEffect(() => {
    if (!roomId) return;

    if (!socketRef.current) {
      socketRef.current = io(import.meta.env.VITE_API_URL);
    }

    const socket = socketRef.current;

    socket.emit("joinRoom", roomId);

    const handleNewQuestion = (data) => {
      setQuestions((prev) => {
        const newData = [...prev];
        newData[newData.length - 1].text = data.text;
        return newData;
      });
    };

    const handleVoteUpdate = (data) => {
      console.log("Vote updated:", data);
    };

    socket.on("question:new", handleNewQuestion);
    socket.on("vote:update", handleVoteUpdate);
    socket.on("vote:counts", handleVoteCounts);

    return () => {
      socket.off("question:new", handleNewQuestion);
      socket.off("vote:update", handleVoteUpdate);
      socket.off("vote:counts", handleVoteCounts);
    };
  }, [roomId]);

  const handleNewQuestion = () => {
    if (isAdmin && currentQuestion.trim()) {
      socketRef.current?.emit("question:new", { roomId, text: currentQuestion });
      setCurrentQuestion("");
    }
  };

  const handleVote = (vote) => {
    socketRef.current?.emit("vote", { roomId, vote });
  };

  return {
    isAdmin,
    questions,
    handleNewQuestion,
    handleVote,
    handleCurrentQuestion,
    currentQuestion,
    voteCounts
  };
};

export default usePlay;
