import { useCallback, useContext } from "react";
import { WebSocketContext } from "../context/webSocketContext";
import { ChatMessage } from "./useConsumer";
import { WebSocketMessage } from "./usePublisher";

/**
 * Custom hook to manage WebSocket interactions.
 * @returns WebSocket context values and functions to send messages.
 */
const useWebSocket = () => {
  const { sessionId, chatHistory, publish, updatedChatHistory } =
    useContext(WebSocketContext);

  const publishMessage = useCallback(
    (message: WebSocketMessage) => publish(message),
    [publish]
  );
  /**
   * Send a text message via WebSocket.
   * @param id - Message ID
   * @param message - Message content
   */
  const sendTextMessage = useCallback(
    (id: string, message: string) => {
      const chatMessage: ChatMessage = {
        id,
        timestamp: new Date(),
        message: message,
        isUserMessage: true,
      };
      updatedChatHistory(chatMessage);

      publishMessage({
        type: "textMessage",
        sessionId: sessionId,
        id,
        message,
      });
    },
    [publishMessage, updatedChatHistory, sessionId]
  );

  return {
    sessionId,
    chatHistory,
    sendTextMessage,
  };
};

export default useWebSocket;
