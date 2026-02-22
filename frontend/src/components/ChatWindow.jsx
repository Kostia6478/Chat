import MessageList from "./MessageList";
import MessageInput from "./MessageInput";

function ChatWindow({
  username,
  activeChat,
  messages,
  text,
  setText,
  sendMessage,
  typingUser,
  handleTyping
}) {

  const filteredMessages = messages.filter((m) => {
    if (activeChat === "global") return m.type !== "private";
    if (m.type !== "private") return false;

    return (
      (m.username === username && m.to === activeChat) ||
      (m.username === activeChat && m.to === username)
    );
  });

  return (
    <div className="card shadow-sm">
      <div className="card-header bg-primary text-white">
        <h5 className="mb-0">
          Chat ({username})
          {activeChat !== "global" && (
            <span className="ms-2 badge bg-warning text-dark">
              {activeChat}
            </span>
          )}
        </h5>
      </div>

      <MessageList
        messages={filteredMessages}
        username={username}
        typingUser={typingUser}
      />

      <MessageInput
        text={text}
        setText={setText}
        sendMessage={sendMessage}
        handleTyping={handleTyping}
        activeChat={activeChat}
      />
    </div>
  );
}

export default ChatWindow;