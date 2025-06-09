import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";

let socketInstance = null; // Singleton socket instance

const usePlay = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [roomId, setRoomId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const { pathname } = useParams();

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

    if (!socketInstance) {
      socketInstance = io(import.meta.env.VITE_API_URL); // Initialize socket instance
    }

    const socket = socketInstance;

    if (roomId) {
      socket.emit("joinRoom", roomId);

      socket.on("question:new", (data) => {
        setQuestions((prevQuestions) => [...prevQuestions, data]);
      });

      socket.on("vote:update", (data) => {
        console.log("Vote updated:", data);
      });
    }

    return () => {
      socket.off("question:new");
      socket.off("vote:update");
    };
  }, [roomId]);

  const handleNewQuestion = () => {
    if (isAdmin && currentQuestion.trim()) {
      socketInstance.emit("question:new", { roomId, text: currentQuestion });
      setCurrentQuestion("");
    }
  };

  const handleVote = (vote) => {
    socketInstance.emit("vote", { roomId, vote });
  };

  return {
    isAdmin,
    questions,
    handleNewQuestion,
    handleVote,
    handleCurrentQuestion,
    currentQuestion,
  };
};

export default usePlay;
