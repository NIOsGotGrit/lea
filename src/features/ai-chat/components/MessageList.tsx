import React from 'react';

// Define a basic Message type (we'll expand this later)
interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
}

interface MessageListProps {
  messages?: Message[]; // Optional for now
}

export const MessageList: React.FC<MessageListProps> = ({ messages = [] }) => {
  return (
    <div className="message-list">
      {messages.length === 0 ? (
        <p className="no-messages-placeholder"><i>(Messages will appear here)</i></p>
      ) : (
        messages.map(msg => (
          <div
            key={msg.id}
            className={`message-item message-${msg.sender}`}
          >
            <strong>{msg.sender === 'user' ? 'You' : 'AI'}:</strong> {msg.text}
          </div>
        ))
      )}
    </div>
  );
}; 