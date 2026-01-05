import { useEffect, useRef, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [username, setUsername] = useState("");
  const ws = useRef(null);
  const messagesEndRef = useRef(null);


  useEffect(() => {
    if (!username) return;

    ws.current = new WebSocket(`ws://localhost:8080/ws?username=${username}`);

    ws.current.onmessage = (event) => {
      const msg = JSON.parse(event.data);

      if (msg.type === "userslist") {
        setUsers(msg.users || []);
      }

      setMessages((prev) => [...prev, msg]);
    };

    return () => ws.current.close();
  }, [username]);


  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const sendMessage = () => {
    if (!text.trim()) return;
    ws.current.send(text);
    setText("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  };


  if (!username) {
    return (
      <div className="container mt-5">
        <div className="card shadow-sm p-3">
          <h4>Enter your username</h4>
          <input
            type="text"
            className="form-control mt-2"
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.target.value.trim()) {
                setUsername(e.target.value.trim());
              }
            }}
            placeholder="Your username"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <div className="row">

        <div className="col-8">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white">
              <h4 className="mb-0">Chat ({username})</h4>
            </div>
            <div
              className="card-body"
              style={{ height: "400px", overflowY: "auto" }}
            >
              <ul className="list-unstyled mb-0">
                {messages.map((msg, index) => (
                  <li
                    key={index}
                    className={
                              msg.type === "system"
                        ? "text-muted fst-italic mb-2"
                        : "mb-2"
                    }
                  >
                    {msg.type !== "system" && (
                      <b className="text-primary me-1">{msg.username}:</b>
                    )}
                    {msg.msg}
                  </li>
                ))}
                <div ref={messagesEndRef} />
              </ul>
            </div>
            <div className="card-footer">
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter your message..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <button className="btn btn-primary" onClick={sendMessage}>
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="col-4">
          <div className="card">
            <div className="card-header">Online</div>
            <ul className="list-group list-group-flush">
              {users.map((user) => (
                <li key={user} className="list-group-item">
                  🟢 {user}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
