# sdkwork-whatseek-h5-chat

AI 对话主入口 (chat-first entry) capability: the chat home ("你想做什么？告诉我就可以。"), multi-turn thread, rule-based intent recognition over the PRD §10.1 intent set, the AI Router (app results / app creation plan / send-message confirmation / commerce previews / general chat), and AI task state display (PRD §41).

Implements the core `ChatPort` + `TasksPort` as the standalone mock client (`createMockChatClient`, `createMockTasksClient`); Phase 2 swaps the intent rules for the LLM gateway behind the same port.

Design note: replies carry i18n **keys** (`whatseek.chat.reply.*`) + params; the UI translates them, so service tests assert keys instead of locale strings.
