import { useEffect, useRef, useState } from "react";
import Login from "./components/Login";
import ChatLayout from "./components/ChatLayout";
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  const [username, setUsername] = useState("");
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [activeChat, setActiveChat] = useState("global");
  const [typingUser, setTypingUser] = useState(null);
  const [presence, setPresence] = useState({});

  const ws = useRef(null);
  const messagesEndRef = useRef(null);
  const lastTypingSent = useRef(0);

  const handleTyping = () => {
    const now = Date.now();
    if (!ws.current) return;

    if (now - lastTypingSent.current > 1000) {
      ws.current.send(JSON.stringify({ type: "typing", to: activeChat }));
      lastTypingSent.current = now;
    }
  };

  useEffect(() => {
    if (!username) return;

    ws.current = new WebSocket(`ws://localhost:8080/ws?username=${username}`);

    ws.current.onmessage = (event) => {
      const msg = JSON.parse(event.data);

      if (msg.type === "presence") {
        setPresence(prev => ({
          ...prev,
          [msg.username]: msg.online
        }));
        return;
      }

      if (msg.type === "userslist") {
        setUsers(msg.users || []);
        return;
      }

      if (msg.type === "typing") {
        if (msg.username !== username) {
          setTypingUser(msg.username);
          setTimeout(() => setTypingUser(null), 3000);
        }
        return;
      }

      setMessages(prev => [...prev, msg]);
    };

    return () => ws.current?.close();
  }, [username]);

  const sendMessage = () => {
    if (!text.trim()) return;

    if (activeChat === "global") {
      ws.current.send(text);
    } else {
      ws.current.send(JSON.stringify({
        type: "private",
        to: activeChat,
        msg: text
      }));
    }

    setText("");
  };

  if (!username) {
    return <Login setUsername={setUsername} />;
  }

  return (
    <ChatLayout
      username={username}
      users={users}
      messages={messages}
      activeChat={activeChat}
      setActiveChat={setActiveChat}
      text={text}
      setText={setText}
      sendMessage={sendMessage}
      typingUser={typingUser}
      presence={presence}
      handleTyping={handleTyping}
    />
  );
}

export default App;