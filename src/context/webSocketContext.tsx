import React, {
  ReactNode,
  createContext,
  useEffect,
  useRef,
  useState,
} from "react";
import io, { Socket } from "socket.io-client";
import { ChatMessage, useConsumer } from "../hooks/useConsumer";
import { WebSocketMessage, usePublisher } from "../hooks/usePublisher";

// Define the context properties with necessary types
interface WebSocketContextProps {
  sessionId: string;
  chatHistory: ChatMessage[];
  publish: (message: WebSocketMessage) => void;
  updatedChatHistory: (newMessage: ChatMessage) => void;
}

// Create context with default values
export const WebSocketContext = createContext<WebSocketContextProps>({
  sessionId: "",
  chatHistory: [],
  publish: (message: WebSocketMessage) => {},
  updatedChatHistory: (newMessage: ChatMessage) => {},
});

// Define the WebSocketProvider component
export const WebSocketProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const isConnected = useRef(false);
  const isInitialized = useRef(false);
  const [socket, setSocket] = useState<Socket | null>(null);

  // Set up socket connection on component mount
  useEffect(() => {
    const newSocket = io("http://0.0.0.0:6789");

    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log(`Sending connectionInit`);
      newSocket.emit("connectionInit");
    });

    newSocket.on("disconnect", () => {
      console.log(`Connection Closed`);
    });

    // Clean up the socket connection on component unmount
    return () => {
      newSocket.close();
    };
  }, []);

  // Use publisher and consumer hooks
  const { publish, resendLastMessage } = usePublisher(
    socket,
    isConnected,
    isInitialized
  );
  const { sessionId, chatHistory, updatedChatHistory } = useConsumer(
    socket,
    publish,
    isConnected,
    isInitialized,
    resendLastMessage
  );

  return (
    <WebSocketContext.Provider
      value={{
        sessionId,
        chatHistory,
        publish,
        updatedChatHistory,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};
