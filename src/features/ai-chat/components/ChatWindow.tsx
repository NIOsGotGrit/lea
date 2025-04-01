import React from 'react';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';

export const ChatWindow: React.FC = () => {
  return (
    <div className="chat-window">
      <div className="message-list-container">
        <MessageList />
      </div>
      <div className="message-input-container">
        <MessageInput />
      </div>
    </div>
  );
}; 