import { useState } from 'react'
import './App.css'
import Room from './components/Room'

function App() {
  const [roomId, setRoomId] = useState(null)

  const createRoom = async () => {
    const response = await fetch('http://localhost:4000/rooms', {
      method: 'POST',
    })
    const data = await response.json()
    setRoomId(data.roomId)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-6">Yes/No Voting App</h1>
      {!roomId ? (
        <button
          onClick={createRoom}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Create Room
        </button>
      ) : (
        <Room roomId={roomId} />
      )}
    </div>
  )
}

export default App
