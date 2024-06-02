import { useCallback, useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";

// Define the WebSocketMessage type
export type WebSocketMessage =
  | { type: "connectionInit" }
  | { type: "sessionInit"; sessionId: string }
  | { type: "reconnectRequest"; sessionId: string }
  | { type: "connectionClosed"; sessionId: string }
  | {
      type: "textMessage";
      sessionId: string;
      id: string;
      message: string;
    };

/**
 * Custom hook to handle publishing messages via WebSocket.
 * @param socket - Socket instance
 * @param isConnectedRef - Reference to connection state
 * @param isInitializedRef - Reference to initialization state
 * @returns Functions to publish messages and resend the last message
 */
export const usePublisher = (
  socket: Socket | null,
  isConnectedRef: React.MutableRefObject<boolean>,
  isInitializedRef: React.MutableRefObject<boolean>
) => {
  const messageQueue = useRef<WebSocketMessage[]>([]);
  const [lastSentMessage, setLastSentMessage] =
    useState<WebSocketMessage | null>(null);

  /**
   * Publish a message via WebSocket.
   * @param message - Message to publish
   */
  const publish = useCallback(
    (message: WebSocketMessage) => {
      console.log(`Socket.IO sending message: ${JSON.stringify(message)}`);
      console.log(
        `Socket.IO isConnected: ${isConnectedRef.current}, isInitialized: ${isInitializedRef.current}`
      );

      if (socket) {
        if (message.type === "connectionInit" && !isConnectedRef.current) {
          socket.emit(message.type, message);
        } else if (
          (message.type === "sessionInit" ||
            message.type === "reconnectRequest") &&
          isConnectedRef.current &&
          !isInitializedRef.current
        ) {
          socket.emit(message.type, message);
        } else if (isInitializedRef.current) {
          socket.emit(message.type, message);
          setLastSentMessage(message);
        } else {
          if (
            message.type !== "connectionInit" &&
            message.type !== "sessionInit" &&
            message.type !== "reconnectRequest"
          ) {
            messageQueue.current.push(message);
          }
        }
      } else {
        if (
          message.type !== "sessionInit" &&
          message.type !== "reconnectRequest"
        ) {
          messageQueue.current.push(message);
        }
      }
    },
    [socket, isConnectedRef, isInitializedRef]
  );

  /**
   * Process the message queue and send messages.
   */
  const processQueue = useCallback(() => {
    while (messageQueue.current.length > 0 && socket) {
      const message = messageQueue.current.shift();
      if (message) {
        publish(message);
      }
    }
  }, [socket, publish]);

  /**
   * Resend the last sent message.
   */
  const resendLastMessage = useCallback(() => {
    if (lastSentMessage && socket) {
      publish(lastSentMessage);
    }
  }, [lastSentMessage, publish, socket]);

  useEffect(() => {
    if (isInitializedRef.current) {
      processQueue();
    }
  }, [isInitializedRef, processQueue]);

  return { publish, resendLastMessage };
};
