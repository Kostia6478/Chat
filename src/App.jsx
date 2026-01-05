import { useState, useRef, useEffect } from 'react'

function App() {
  
  const [message, setMessage] = useState([]);
  const [text, setText] = useState('');
  const ws = useRef(null);

  useEffect(() => {
    ws.current = new WebSocket('ws://localhost:8080/ws');

    ws.current.onmessage = (event) => {
      setMessage(prev => [...prev, event.data]);
    }
    return () => {
      ws.current.close();
    },[]
  })

   const sendMessage = () =>{
    ws.current.send(text);
    setText('');
   }
  return (
    <div>
      <h1>Go Chat</h1>
      <input type="text" value={text} onChange={(e) => setText(e.target.value)} />
      <button onClick={sendMessage}>Send</button>
      
      <ul>
        {message.map((msg, index) =>(
          <li key={index}>{msg}</li>
        ))}
      </ul>

    </div>
  )
}

export default App
