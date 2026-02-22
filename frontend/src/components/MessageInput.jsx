function MessageInput({
  text,
  setText,
  sendMessage,
  handleTyping,
  activeChat
}) {
  return (
    <div className="card-footer">
      <div className="input-group">
        <input
          className="form-control"
          placeholder={
            activeChat !== "global"
              ? `Message to ${activeChat}`
              : "Message to everyone"
          }
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            handleTyping();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              sendMessage();
            }
          }}
        />
        <button className="btn btn-primary" onClick={sendMessage}>
          Send
        </button>
      </div>
    </div>
  );
}

export default MessageInput;