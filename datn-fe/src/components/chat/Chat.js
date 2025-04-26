import React, { useEffect } from "react";
import { ChatEngine } from 'react-chat-engine';
import ChatFeed from './ChatFeed';
import './chat.css';

const projectID = 'b75e5bd5-cd84-404c-b820-06feff8c98c0';

const Chat = (props) => {
  useEffect(() =>{
    props.changeHeaderHandler(6);
  }, []);

  return (
    <ChatEngine
      height="100vh"
      projectID={projectID}
      userName={localStorage.getItem('username')}
      userSecret={localStorage.getItem('password')}
      renderChatFeed={(chatAppProps) => <ChatFeed {...chatAppProps} />}
      renderNewChatForm={(creds) => {}}
      onNewMessage={() => new Audio('https://chat-engine-assets.s3.amazonaws.com/click.mp3').play()}
    />
  );
};

export default Chat;
