import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const Room = ({ roomId }) => {
  const [question, setQuestion] = useState('');
  const [votes, setVotes] = useState({ yes: 0, no: 0 });
  const socket = io('http://localhost:4000');

  useEffect(() => {
    socket.emit('joinRoom', roomId);

    socket.on('question:new', (data) => {
      setQuestion(data.text);
    });

    socket.on('vote:update', (data) => {
      setVotes((prevVotes) => ({
        ...prevVotes,
        [data.vote]: prevVotes[data.vote] + 1,
      }));
    });

    return () => {
      socket.disconnect();
    };
  }, [roomId]);

  const handleVote = (vote) => {
    socket.emit('vote', { roomId, vote });
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <h2 className="text-2xl font-semibold mb-4">{question}</h2>
      <div className="flex space-x-4 mb-4">
        <div className="bg-green-500 text-white px-4 py-2 rounded">Yes: {votes.yes}</div>
        <div className="bg-red-500 text-white px-4 py-2 rounded">No: {votes.no}</div>
      </div>
      <div className="flex space-x-4">
        <button
          onClick={() => handleVote('yes')}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Yes
        </button>
        <button
          onClick={() => handleVote('no')}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          No
        </button>
      </div>
    </div>
  );
};

export default Room;
