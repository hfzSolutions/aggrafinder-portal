# AI Chat Feature for Tool Cards

## Overview

The AI Chat feature allows users to directly interact with an AI assistant from any tool card in the AggraFinder portal. This feature is designed to increase user retention by providing immediate assistance and information about specific AI tools without requiring users to navigate away from the current view.

## Features

- **Contextual AI Assistance**: The AI assistant is provided with context about the specific tool, allowing it to give relevant information.
- **Integrated Chat Interface**: A compact chat interface appears directly on the tool card when activated.
- **Seamless User Experience**: Users can ask questions about a tool and get immediate responses without leaving the page.

## Implementation Details

### Components

1. **ToolCardChat.tsx**: A dedicated chat component specifically designed for tool cards.
2. **AITool Interface**: Updated to include an `aiChatEnabled` flag to control which tools have the chat feature enabled.
3. **Database Migration**: Added `ai_chat_enabled` column to the database schema.

### How It Works

1. Each tool card displays an "Ask AI" button.
2. When clicked, a chat interface appears overlaid on the tool card.
3. The AI assistant is initialized with context about the specific tool.
4. Users can ask questions and receive responses about the tool's features, use cases, pricing, etc.
5. The chat can be closed at any time to return to normal browsing.

### Technical Implementation

- The chat uses the OpenRouter API to connect to AI models.
- Tool-specific context is provided to the AI to ensure relevant responses.
- The interface is designed to be responsive and work across all device sizes.

## Usage Guidelines

### For Users

- Click the "Ask AI" button on any tool card to start a conversation.
- Ask specific questions about the tool's features, pricing, or use cases.
- Close the chat when finished by clicking the X in the top-right corner.

### For Administrators

- The `aiChatEnabled` flag in the database can be used to enable/disable the chat feature for specific tools.
- By default, all tools have the chat feature enabled.

## Future Enhancements

- Conversation history persistence
- More detailed tool context including reviews and user feedback
- Integration with tool comparison features
- Custom AI personalities for different tool categories
