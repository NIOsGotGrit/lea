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
    <div style={{ padding: '10px' }}>
      {messages.length === 0 ? (
        <p><i>(Messages will appear here)</i></p>
      ) : (
        messages.map(msg => (
          <div key={msg.id} style={{ marginBottom: '5px', wordBreak: 'break-word' }}>
            <strong>{msg.sender === 'user' ? 'You' : 'AI'}:</strong> {msg.text}
          </div>
        ))
      )}
    </div>
  );
}; 