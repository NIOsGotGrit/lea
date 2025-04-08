# Fredy - AI Copilot Browser Project Plan

## Overview
Fredy is an AI copilot natively integrated into a Chromium-based browser (forked from Ferdium). It enables users to control web app UIs through natural language commands within a controlled browser workspace environment.

## Project Phases

### Phase 1: Foundation & Basic Chat UI ✅

**Goal:** Set up the core browser environment and implement the initial user-facing chat interface where users will interact with Fredy.

- [x] **Fork and set up Ferdium base**
  - **Why:** Leverage Ferdium's existing Electron/Chromium browser structure, workspace management, and service integration capabilities as a starting point.
  - **How:** Create a fork of the Ferdium repository, clone it locally, install dependencies (`npm install`), and ensure the basic application runs (`npm start`).
- [x] **Implement basic chat interface**
  - **Why:** Create the visual components for the chat conversation.
  - **Where:** `src/features/ai-chat/components/` (e.g., `ChatWindow.tsx`, `MessageList.tsx`, `MessageInput.tsx`).
  - **How:** Build React components for displaying messages and providing a text input field. Use basic state management for now.
- [x] **Set up chat panel layout**
  - **Why:** Integrate the chat UI into the main application layout, making it appear as a sidebar panel.
  - **Where:** `src/components/layout/AppLayout.tsx`, `src/containers/layout/AppLayoutContainer.tsx`, related CSS/SCSS files (e.g., `src/styles/ChatStyles.scss`, `src/features/ai-chat/styles/ChatStyles.scss`).
  - **How:** Modify the main layout component (using CSS Grid or Flexbox) to include a new panel area. Define CSS variables for dynamic width adjustment.
- [x] **Add chat toggle functionality**
  - **Why:** Allow the user to show and hide the chat panel.
  - **Where:** Sidebar component (`src/components/layout/Sidebar.tsx`), UI state store (`src/stores/UIStore.ts`), App layout (`src/components/layout/AppLayout.tsx`).
  - **How:** Add a button to the sidebar. Connect its `onClick` handler to an action/store method that toggles a boolean state variable (e.g., `isAiChatVisible`). Use this state variable in `AppLayout.tsx` to conditionally render the chat view or adjust its CSS (e.g., width).
- [ ] **Implement basic message display**
  - **Why:** Show initial or hardcoded messages in the chat list for UI testing.
  - **Where:** `src/features/ai-chat/containers/ChatView.tsx`, `src/features/ai-chat/components/MessageList.tsx`.
  - **How:** Pass an array of message objects (with sender and text) from the container to the `MessageList` component. Style messages differently based on the sender ('user' vs 'ai').

### Phase 2: IPC & Initial LLM Integration

**Goal:** Establish the communication backbone between the chat UI and the main Electron process, integrate a direct call to an LLM for basic conversational AI, and set up streaming responses back to the UI. This phase focuses on getting basic AI responses flowing before introducing the complexity of an agent framework and tool calling.

- [ ] **Set up IPC (Inter-Process Communication) between Renderer (Chat UI) and Main processes**
  - **Why:** The chat UI (React component) runs in a separate process (Renderer) from the main Electron application logic (Main). IPC is Electron's way to let these processes talk securely.
  - **Tasks:**
    - [ ] Define IPC channels (e.g., `chat:sendMessage`, `llm:streamChunk`, `llm:error`).
      - **Where:** Shared constants file or directly in relevant modules.
    - [ ] **Implement message sending from Chat UI (Renderer) to Main:**
        - **Where:** `src/features/ai-chat/containers/ChatView.tsx` (or a dedicated IPC service module called from the view).
        - **How:** Use `window.electron.ipcRenderer.send('chat:sendMessage', messageText)` when the user submits a message. Requires setting up a preload script to expose `ipcRenderer` securely.
    - [ ] **Set up message receiving in Main process:**
        - **Where:** A dedicated IPC handler module, likely in `src/main/` (e.g., `src/main/ipcHandlers.ts` or `src/main/features/ai/llmManager.ts`).
        - **How:** Use `ipcMain.handle('chat:sendMessage', async (event, messageText) => { /* trigger LLM call */ })` to listen for messages.
    - [ ] **Set up response streaming from Main process to Chat UI (Renderer):**
        - **Where:** `llmManager.ts` in `src/main/`, message handling logic in `src/features/ai-chat/containers/ChatView.tsx`.
        - **How:** Use `mainWindow.webContents.send('llm:streamChunk', chunk)` from Main to send LLM response pieces back to the UI. The UI will listen with `window.electron.ipcRenderer.on('llm:streamChunk', (event, chunk) => { /* append text */ })`. Requires preload setup.
    - [ ] **Add basic error handling:** Implement `try...catch` blocks around IPC calls and LLM API calls. Send error messages back to the UI via `llm:error` channel.

- [ ] **Integrate Direct LLM Call**
  - **Why:** To get initial AI-powered responses into the chat quickly, without the immediate overhead of a full agent framework.
  - **Tasks:**
    - [ ] **Choose and configure LLM Provider SDK:**
        - **Where:** `llmManager.ts` in `src/main/`.
        - **How:** Install the necessary SDK (e.g., `openai`). Set up API key handling securely (e.g., environment variables, settings store).
    - [ ] **Implement LLM API call logic:**
        - **Where:** `llmManager.ts` in `src/main/`.
        - **How:** When the `chat:sendMessage` handler receives a message, call the chosen LLM's chat completion API (e.g., `openai.chat.completions.create`) with the user message (and potentially minimal history).
    - [ ] **Handle LLM response streaming:**
        - **Where:** `llmManager.ts` in `src/main/`.
        - **How:** Use the streaming capabilities of the LLM SDK. As chunks are received from the API, forward them to the Chat UI via the `llm:streamChunk` Electron IPC channel.
    - [ ] **Update Chat UI for streaming:**
        - **Where:** `src/features/ai-chat/containers/ChatView.tsx`.
        - **How:** Modify the state management to append incoming `llm:streamChunk` data to the current AI response message.

- [ ] **Transition to Agent Subprocess Architecture (LATER IN PHASE 2 / START OF PHASE 3)**
  - **Why:** To enable more complex interactions, state management, and tool usage by isolating the agent logic in a dedicated process.
  - **Tasks:** (These tasks will likely move or be refined once the direct LLM call is working)
    - [ ] **Design subprocess spawning/management:**
        - **Where:** `agentManager.ts` in `src/main/`.
        - **How:** Use Node.js `child_process.fork()` for `src/agent/agentRuntime.js`.
    - [ ] **Implement communication channel (Main <-> Subprocess):**
        - **How:** Use `subprocess.send()`/`on('message')` and `process.send()`/`on('message')`.
    - [ ] **Refactor LLM call:** Move the direct LLM call logic into the agent subprocess (`src/agent/agentRuntime.js`) potentially wrapped by LangGraph or a similar framework.
    - [ ] **Implement agent message processing:** Handle prompts, manage agent state.
    - [ ] **Adapt Main process:** Modify the IPC handler in `llmManager.ts` (or rename to `agentManager.ts`) to communicate with the subprocess instead of calling the LLM directly.

- [ ] **Implement Basic Tool Calling Framework (DEFERRED to Agent Integration)**
  - **Why:** Tool calling is intrinsically linked to the agent's ability to request actions. It will be implemented once the agent subprocess architecture is in place.
  - **Tasks:** (Details remain similar but depend on the agent framework)
    - [ ] Define tool call/result schema.
    - [ ] Set up tool execution pipeline in Main process (triggered by messages from agent subprocess).
    - [ ] Add tool response handling in Agent Subprocess.

### Phase 3: WebView Control & Stagehand Integration

**Goal:** Enable the Main process to interact with the content of webviews (tabs) using the Stagehand library, allowing Fredy to perform actions like clicks and data extraction based on agent tool calls.

- [ ] **Integrate Stagehand for webview control**
  - **Why:** Stagehand provides the necessary API to programmatically interact with the DOM of Electron webviews, similar to how Playwright or Puppeteer work for browsers.
  - **Tasks:**
    - [ ] **Set up Stagehand initialization:**
        - **Where:** Likely in the Main process, perhaps in a dedicated `stagehandManager.ts` or integrated into the service/webview management logic.
        - **How:** Install Stagehand (`npm install stagehand`). When a service's webview is created or navigated, attach Stagehand to it. This might involve getting the `webContents` of the webview and using Stagehand's API. Consult Stagehand documentation for the specific initialization methods.
    - [ ] **Implement basic DOM manipulation:**
        - **Why:** Test the Stagehand connection and perform fundamental actions.
        - **Where:** `stagehandManager.ts` or tool execution logic in the main process.
        - **How:** Create functions like `clickElement(webContentsId, selector)`, `fillInput(webContentsId, selector, value)`, `extractText(webContentsId, selector)` that use the attached Stagehand instance for the target `webContentsId` to execute the corresponding Stagehand/Playwright commands (`page.click()`, `page.fill()`, `page.textContent()`).
    - [ ] **Add webview state management:**
        - **Why:** Need to ensure Stagehand commands are sent to the *correct* and *ready* webview.
        - **Where:** Integrate with Ferdium's existing service/webview management (likely involving `stores/ServicesStore.ts` or related main process logic).
        - **How:** Track which webview corresponds to which service, its current lifecycle state (loading, ready), and its `webContentsId`. Ensure Stagehand commands are only sent when the webview is ready.

- [ ] **Create core tool implementations**
  - **Why:** Connect the tool call requests received from the agent (Phase 2) to actual Stagehand actions.
  - **Where:** Tool execution pipeline in the Main process (e.g., `src/main/features/ai/toolExecutor.ts`).
  - **How:** Extend the tool call handler from Phase 2. Based on the `tool_name` (`clickElement`, `extractText`, `fillInput`, `navigate`), call the corresponding Stagehand wrapper functions created above, passing the `webContentsId` of the target service and the arguments from the tool call.
    - [ ] Implement `clickElement` tool.
    - [ ] Implement `extractText` tool.
    - [ ] Implement `fillInput` tool.
    - [ ] Implement `navigate` tool (using `webContents.loadURL()`).
  - **Response:** Send the actual result (e.g., extracted text, 'Success', or error message) back to the agent subprocess.

- [ ] **Add webview context awareness**
  - **Why:** The agent needs to know which service/tab is currently active or relevant to the user's request so the Main process can target the correct webview for tool execution.
  - **Tasks:**
    - [ ] **Track active webview:**
        - **Where:** Main process, likely leveraging existing Ferdium state (`stores/ServicesStore.ts` or `stores/UIStore.ts`).
        - **How:** Maintain a variable holding the `serviceId` or `webContentsId` of the currently focused/active service webview.
    - [ ] **Pass context to agent (Optional/Advanced):**
        - **How:** When sending the user prompt to the agent, potentially include metadata about the active service (e.g., URL, service type). This might help the agent make better decisions.
    - [ ] **Determine target webview for tool calls:**
        - **Where:** Tool execution pipeline in Main process.
        - **How:** When a tool call arrives, use the tracked active service's `webContentsId` as the target for Stagehand, unless the tool call explicitly specifies a different target (more advanced).

### Phase 4: First Complete Task Flow

**Goal:** Implement the end-to-end logic for a specific, concrete task (Stripe revenue extraction -> Notion update) to validate the entire architecture from chat input to webview action and back.

- [ ] **Implement Stripe revenue extraction**
  - **Why:** Create the agent logic and tools needed to interact with Stripe.
  - **Tasks:**
    - [ ] **Analyze Stripe UI:** Manually identify the selectors and steps required to log in (if needed) and navigate to the revenue/reporting page.
    - [ ] **Create Stripe-specific tools (if necessary):** While core tools (`click`, `extract`) might suffice, potentially create higher-level tools like `getStripeRevenue(period)` if the logic is complex. This would involve sequences of core tool calls within the Main process tool executor.
    - [ ] **Agent logic for Stripe:** Design the prompts or agent configuration (e.g., LangGraph flow) needed to guide the agent through the Stripe interaction steps using the available tools.
    - [ ] **Add authentication handling:** Determine how login will be handled (e.g., assume user is logged in, or implement tools for filling login forms). Handle potential login failures.
    - [ ] **Implement data extraction logic:** Use the `extractText` tool with appropriate selectors to get the revenue figure. Add parsing/validation if needed.

- [ ] **Add Notion integration**
  - **Why:** Create the agent logic and tools needed to interact with Notion.
  - **Tasks:**
    - [ ] **Analyze Notion UI:** Identify selectors and steps for navigating to the target page/database and updating the relevant field.
    - [ ] **Create Notion-specific tools (if necessary):** Similar to Stripe, consider higher-level tools like `updateNotionKPI(kpiName, value)` that encapsulate multiple clicks/fills.
    - [ ] **Agent logic for Notion:** Design the agent flow to take the extracted Stripe data and use tools to update the Notion document.
    - [ ] **Implement document updating:** Use `fillInput` or potentially `click` tools to insert the data into the correct Notion block/field.
    - [ ] **Add error handling:** Handle cases where the Notion page/block isn't found or the update fails.

- [ ] **Build end-to-end task flow**
  - **Why:** Connect the Stripe and Notion parts into a single, triggerable task initiated by a user chat message.
  - **Tasks:**
    - [ ] **Agent planning:** Ensure the agent (or the LangGraph definition) correctly plans the sequence: interact with Stripe first, then use the result to interact with Notion.
    - [ ] **Connect Stripe and Notion tools:** Ensure the output (revenue) from the Stripe part of the agent flow is correctly passed as input to the Notion part.
    - [ ] **Add task state management (in Agent/Main):** Track the progress of the multi-step task. Provide feedback to the user via chat messages (e.g., "Extracting from Stripe...", "Updating Notion...", "Task complete!").
    - [ ] **Implement progress tracking/feedback to UI:** Send status update messages from the Main process (triggered by agent progress or tool execution steps) to the chat UI using a dedicated IPC channel (e.g., `agent:statusUpdate`).

### Phase 5: Enhanced Features & Polish

**Goal:** Improve the usability, robustness, and feature set of the chat interaction and agent capabilities beyond the core task execution.

- [ ] **Add advanced chat features**
  - **Why:** Enhance the user experience in the chat interface.
  - **Tasks:**
    - [ ] **Message history:**
        - **Where:** Chat UI state management (`stores/AiChatStore.ts`?) and potentially persistent storage (e.g., Electron Store).
        - **How:** Store sent/received messages. Load history when the app starts. Allow scrolling through past messages.
    - [ ] **Context awareness:**
        - **How:** Pass relevant conversation history along with the new user message to the agent subprocess. This allows the agent to understand follow-up questions. Manage context window limits.
    - [ ] **Command suggestions / Auto-completion (Optional):**
        - **Where:** Chat Input component.
        - **How:** Implement simple suggestions based on previous commands or pre-defined capabilities.

- [ ] **Implement error recovery and robustness**
  - **Why:** Handle situations where tools fail or the agent gets stuck, providing a better user experience.
  - **Tasks:**
    - [ ] **Tool execution retries:**
        - **Where:** Tool execution logic in Main process.
        - **How:** Implement automatic retries (with delays) for common transient errors (e.g., element not ready yet).
    - [ ] **Improved error messages:**
        - **Where:** Main process (tool executor) and Agent subprocess.
        - **How:** Send clearer error messages back to the agent and potentially display user-friendly error summaries in the chat UI when tasks fail.
    - [ ] **Agent-level error handling:**
        - **Where:** Agent script / LangGraph flow.
        - **How:** Design the agent flow to handle `tool_error` responses gracefully (e.g., try an alternative approach, ask the user for clarification).
    - [ ] **Fallback options:** If a tool fails consistently, have the agent report the failure clearly to the user.

- [ ] **Add user preferences**
  - **Why:** Allow users to customize Fredy's behavior and appearance.
  - **Where:** Settings section of Ferdium, leverage `stores/SettingsStore.ts`.
  - **Tasks:**
    - [ ] **Chat appearance settings:** (e.g., font size - might already exist).
    - [ ] **Tool behavior customization:** (e.g., default timeouts for tools).
    - [ ] **Keyboard shortcuts:** Integrate with Electron's global shortcuts or menu system to trigger chat visibility or common actions.

### Phase 6: Testing & Documentation

**Goal:** Ensure the application is reliable, performant, and well-documented for both users and future developers.

- [ ] **Comprehensive testing**
  - **Why:** Catch bugs, regressions, and ensure core functionality works as expected.
  - **Tasks:**
    - [ ] **Unit tests:**
        - **Where:** Alongside relevant modules (`*.test.ts`). Use frameworks like Jest or Vitest.
        - **How:** Test individual functions, components (React Testing Library), IPC handlers, and utility functions in isolation. Mock dependencies.
    - [ ] **Integration tests:**
        - **How:** Test the interaction between components (e.g., sending a message via IPC and verifying the agent subprocess receives it). Test tool call sequences. May require more complex setup.
    - [ ] **End-to-end task testing:**
        - **How:** Use an automated testing framework (potentially leveraging Stagehand itself or Spectron/Playwright for Electron) to simulate a user typing a command (e.g., the Stripe/Notion task) and verify the expected actions occur in the webviews and the correct response appears in chat.

- [ ] **Documentation**
  - **Why:** Explain how to use Fredy, how it works internally, and how to contribute.
  - **Tasks:**
    - [ ] **User documentation:** Create a `README.md` or separate guide explaining Fredy's features, how to use the chat, limitations, and example commands.
    - [ ] **Developer documentation:** Add comments to code, explain complex parts, document the architecture (especially IPC, agent flow, tool execution), and provide setup instructions in the main `README.md`.
    - [ ] **API documentation (Internal):** Document the IPC channel names and message formats. Document the tool call schema.

- [ ] **Performance optimization**
  - **Why:** Ensure the application remains responsive and doesn't consume excessive resources.
  - **Tasks:**
    - [ ] **Profile IPC:** Measure latency of IPC messages, especially during streaming. Optimize message formats if needed.
    - [ ] **Agent response time:** Analyze time taken for agent processing. Optimize prompts or agent logic if possible. Consider caching or other strategies.
    - [ ] **Optimize webview interactions:** Ensure Stagehand commands are efficient. Avoid unnecessary DOM queries. Profile rendering performance in the chat UI.

## Technical Stack
- Browser base: Electron (Ferdium fork)
- Webview control: Stagehand + Playwright
- Agent runtime: LangGraph/OpenAI
- IPC: Electron's `ipcMain`/`ipcRenderer` (via preload script) & Node.js `child_process` IPC
- Chat UI: React
- Communication: Streaming LLM responses via IPC
- Task Model: Natural language → structured toolcalls

## Success Criteria
1. Functional chat interface with streaming responses and message history.
2. Working webview control with Stagehand executing core tools (click, fill, extract, navigate) based on agent requests.
3. Complete, robust end-to-end task flow (Stripe → Notion) demonstrating agent planning and tool use.
4. Stable and performant IPC communication between UI, Main, and Agent Subprocess.
5. Graceful error handling and recovery mechanisms for tool failures.
6. Clear user and developer documentation.

## Timeline
- Phase 1: ✅ Completed
- Phase 2: 2 weeks
- Phase 3: 2 weeks
- Phase 4: 2 weeks
- Phase 5: 2 weeks
- Phase 6: 1 week

Total estimated time: 9 weeks (Review and adjust estimates as phases complete)

## Notes
- Each phase should conclude with testing of the implemented features.
- Maintain code quality through linting, formatting, and potential code reviews.
- Update this plan document as requirements evolve or technical decisions change.
- Focus on stability, user experience, and clear feedback mechanisms throughout development. 