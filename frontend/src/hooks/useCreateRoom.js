import { useEffect, useState } from "react"
import { customFetch } from "../utils/customFetch"
import { notification } from 'antd';
import { useNavigate } from "react-router-dom";

export const useJoinRoom = () => {
  const [loading, setLoading] = useState(false);
  const [roomCode, setRoomCode] = useState("");
  const navigate = useNavigate();

  const createRoom = async () => {
    try {
      setLoading(true);
      const data = await customFetch.post('/rooms');
      if(data) {
        setRoomCode(data.code);
      }
    } catch (error) {
      notification.error({ message: "방 생성에 실패했습니다.", description: `${error}` });
    } finally {
      setLoading(false);
    }
  }

  const joinRoom = (code) => {
    navigate(`/room/${code}`);
  }

  useEffect(() => {
    if(roomCode.length > 0) {
      localStorage.setItem("roomKey", `admin-${roomCode}`);
      navigate(`/room/${roomCode}`);
    }
  }, [roomCode]);

  return {
    createRoom,
    loading,
    joinRoom
  }
}