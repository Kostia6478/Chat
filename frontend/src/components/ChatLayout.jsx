import ChatWindow from "./ChatWindow";
import ChatList from "./ChatList";

function ChatLayout(props) {
  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-8">
          <ChatWindow {...props} />
        </div>
        <div className="col-4">
          <ChatList
            users={props.users}
            username={props.username}
            activeChat={props.activeChat}
            setActiveChat={props.setActiveChat}
            presence={props.presence}
          />
        </div>
      </div>
    </div>
  );
}

export default ChatLayout;