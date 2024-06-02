import Cookies from "js-cookie";
import { useCallback, useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";
import { WebSocketMessage } from "./usePublisher";

// Define the ChatMessage interface
export interface ChatMessage {
  id: string;
  timestamp: Date;
  message: string;
  isUserMessage: boolean;
  isComplete?: boolean;
}

// Define the ResponseData interface
export interface ResponseData {
  type: string;
  sessionId?: string;
  id?: string;
  textResponse?: string;
  isComplete?: boolean;
  chatHistory?: ChatMessage[];
}

/**
 * Custom hook to handle incoming messages and socket events.
 * @param socket - Socket instance
 * @param publish - Function to publish messages
 * @param isConnectedRef - Reference to connection state
 * @param isInitializedRef - Reference to initialization state
 * @param resendLastMessage - Function to resend the last message
 * @returns Session ID, chat history, and updated chat history function
 */
export const useConsumer = (
  socket: Socket | null,
  publish: (message: WebSocketMessage) => void,
  isConnectedRef: React.MutableRefObject<boolean>,
  isInitializedRef: React.MutableRefObject<boolean>,
  resendLastMessage: () => void
) => {
  const [sessionId, setSessionId] = useState<string>("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const storedSessionId = Cookies.get("sessionId");

  /**
   * Update chat history with a new message.
   * @param newMessage - New chat message to add
   * @returns Updated chat history array
   */
  const updatedChatHistory = (newMessage: ChatMessage) => {
    setChatHistory((prev) => {
      const messageIndex = prev.findIndex((m) => m.id === newMessage.id);
      if (messageIndex !== -1) {
        const updatedMessage = prev[messageIndex];
        updatedMessage.message += newMessage.message;

        const updatedChatHistory = [...prev];
        updatedChatHistory[messageIndex] = updatedMessage;
        return updatedChatHistory;
      }
      return [...prev, newMessage];
    });
  };

  const handleConnectionAck = useCallback(() => {
    const sessionId = storedSessionId || uuidv4();
    if (!storedSessionId) {
      Cookies.set("sessionId", sessionId);
    }
    setSessionId(sessionId);
    isConnectedRef.current = true;
    isInitializedRef.current = false;
    publish({ type: "sessionInit", sessionId });
  }, [isConnectedRef, isInitializedRef, publish, storedSessionId]);

  const handleConnectionInterrupt = useCallback(() => {
    publish({ type: "reconnectRequest", sessionId });
  }, [publish, sessionId]);

  const handleSessionInit = useCallback(
    (data: ResponseData) => {
      const { sessionId, chatHistory } = data;
      const chats =
        chatHistory?.map((chat) => ({
          id: chat.id,
          timestamp: chat.timestamp,
          message: chat.message ? chat.message : chat.textResponse,
          isUserMessage: chat.isUserMessage,
          isComplete: chat.isComplete,
        })) ?? [];
      setChatHistory(chats);
      isConnectedRef.current = true;
      isInitializedRef.current = true;
    },
    [isConnectedRef, isInitializedRef]
  );

  const handleReconnect = useCallback(
    (data: ResponseData) => {
      const { chatHistory } = data;
      const chats =
        chatHistory?.map((chat) => ({
          id: chat.id,
          timestamp: chat.timestamp,
          message: chat.message,
          isUserMessage: chat.isUserMessage,
          isComplete: chat.isComplete,
        })) ?? [];
      setChatHistory(chats);
      resendLastMessage();
    },
    [resendLastMessage]
  );

  const handleTextResponse = useCallback((data: ResponseData) => {
    const { id, textResponse, isComplete } = data;
    const newMessage: ChatMessage = {
      id: id!,
      message: textResponse!,
      isComplete: isComplete!,
      timestamp: new Date(),
      isUserMessage: false,
    };
    updatedChatHistory(newMessage);
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on("connectionAck", handleConnectionAck);
      socket.on("connectionInterrupted", handleConnectionInterrupt);
      socket.on("sessionInit", handleSessionInit);
      socket.on("reconnectResponse", handleReconnect);
      socket.on("textResponse", handleTextResponse);
    }

    return () => {
      if (socket) {
        socket.off("connectionAck", handleConnectionAck);
        socket.off("connectionInterrupted", handleConnectionInterrupt);
        socket.off("sessionInit", handleSessionInit);
        socket.off("reconnectResponse", handleReconnect);
        socket.off("textResponse", handleTextResponse);
      }
    };
  }, [
    socket,
    handleConnectionAck,
    handleConnectionInterrupt,
    handleSessionInit,
    handleReconnect,
    handleTextResponse,
  ]);

  return { sessionId, chatHistory, updatedChatHistory };
};
