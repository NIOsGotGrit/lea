import React from 'react';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';

export const ChatWindow: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', flexGrow: 1 }}> {/* Ensure it fills chatPanelArea */}
      <div style={{ flexGrow: 1, overflowY: 'auto', border: '1px solid #ddd', marginBottom: '10px', padding: '5px' }}>
        <MessageList />
      </div>
      <div>
        <MessageInput />
      </div>
    </div>
  );
}; 