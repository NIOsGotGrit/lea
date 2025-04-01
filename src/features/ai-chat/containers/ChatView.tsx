import React, { useState } from 'react';
import { inject, observer } from 'mobx-react'; // Import inject and observer
import { ChatWindow } from '../components/ChatWindow';
// Fix the import path for StoresProps
import type { StoresProps } from '../../../@types/ferdium-components.types'; 
import type { RealStores } from '../../../stores'; // Import RealStores for type safety
import type { Actions } from '../../../actions/lib/actions'; // Import Actions for type safety
// MessageList and MessageInput are now rendered within ChatWindow
// import { MessageInput } from '../components/MessageInput';
// import { MessageList } from '../components/MessageList';

// Define a basic Message type (can be moved to a shared types file later)
interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
}

// Update props to include StoresProps for injection
// Make stores and actions optional as they are injected
interface ChatViewProps /* extends StoresProps - remove this */ {
  stores?: RealStores; // Make optional
  actions?: Actions;   // Make optional
}

@inject('stores', 'actions') // Inject stores and actions
@observer // Make component reactive
class ChatView extends React.Component<ChatViewProps> { // Change to class component for inject/observer
  // Basic state management for messages (will be replaced by IPC later)
  state = {
    messages: [
      { id: '1', text: 'Hello from AI!', sender: 'ai' },
      { id: '2', text: 'Hi AI!', sender: 'user' },
    ],
  };

  handleSendMessage = (text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(), // Simple unique ID for now
      text,
      sender: 'user',
    };
    this.setState((prevState: { messages: Message[] }) => ({ // Use React component state
      messages: [...prevState.messages, newMessage],
    }));
    // TODO: In Phase 2, this will call the IPC method
    console.log('Send message:', text);
  };

  render() {
    const { actions } = this.props; // Get actions from props (now correctly typed as optional)

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          padding: '10px',
          boxSizing: 'border-box',
          backgroundColor: '#f9f9f9',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <h1 style={{ margin: 0, fontSize: '1.2em' }}>AI Chat Assistant</h1>
          <button
            onClick={() => actions?.ui.toggleAiChat()} // Use optional chaining
            style={{ background: 'none', border: 'none', fontSize: '1.2em', cursor: 'pointer' }}
          >
            &times;
          </button>
        </div>
        {/* ChatWindow needs adapting if it needs messages/handlers, or keep state internal for now */}
        <ChatWindow /> 
      </div>
    );
  }
}

export default ChatView; // Export the wrapped component 