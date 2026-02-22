function ChatList({ users, username, activeChat, setActiveChat, presence }) {
  return (
    <div className="card shadow-sm">
      <div className="card-header">Chats</div>
      <ul className="list-group list-group-flush">
        <li
          className={`list-group-item ${activeChat === "global" ? "active" : ""}`}
          style={{ cursor: "pointer" }}
          onClick={() => setActiveChat("global")}
        >
          🌍 Global chat
        </li>

        {users.filter((u) => u !== username).map((u) => (
          <li
            key={u}
            className={`list-group-item ${activeChat === u ? "active" : ""}`}
            style={{ cursor: "pointer" }}
            onClick={() => setActiveChat(u)}
          >
            👤 {u}
            <span
              className="ms-2"
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                display: "inline-block",
                backgroundColor: presence[u] ? "green" : "gray"
              }}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ChatList;