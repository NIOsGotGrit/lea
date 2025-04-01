import React, { useState } from 'react';

interface MessageInputProps {
  onSendMessage?: (message: string) => void; // Placeholder for sending message
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
}) => {
  const [inputValue, setInputValue] = useState('');

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleSendClick = () => {
    if (inputValue.trim() && onSendMessage) {
      onSendMessage(inputValue);
      setInputValue(''); // Clear input after sending
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      // Send on Enter, allow Shift+Enter for newline
      event.preventDefault(); // Prevent default newline insertion
      handleSendClick();
    }
  };

  return (
    <div className="message-input">
      <input
        type="text"
        placeholder="Type your message..."
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        className="message-input-field"
      />
      <button onClick={handleSendClick} className="message-send-button">
        Send
      </button>
    </div>
  );
};
