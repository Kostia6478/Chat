function MessageList({ messages, username, typingUser }) {
  return (
    <div className="card-body" style={{ height: 400, overflowY: "auto" }}>
      {messages.map((m, i) => {
        const isMine = m.username === username;

        return (
          <div key={i} className={`d-flex mb-2 ${isMine ? "justify-content-end" : ""}`}>
            <div
              className={`p-2 rounded ${isMine ? "bg-primary text-white" : "bg-light"}`}
              style={{ maxWidth: "70%" }}
            >
              {m.type === "system" ? (
                <i className="text-muted">{m.msg}</i>
              ) : (
                <>
                  {!isMine && <b>{m.username}<br /></b>}
                  {m.msg}
                </>
              )}
            </div>
          </div>
        );
      })}

      {typingUser && (
        <div className="text-muted small ms-2">
          ✍️ {typingUser} is typing...
        </div>
      )}
    </div>
  );
}

export default MessageList;