import { useEffect, useRef } from "react";
import socketIOClient from "socket.io-client";

const useSocket = () => {
  const socket = useRef();
  const SOCKETENDPOINT =
    process.env.NODE_ENV === "development" ? "http://localhost:8080" : "/";
  useEffect(() => {
    socket.current = socketIOClient(SOCKETENDPOINT, {
      transports: ["websocket"],
    });
    return () => {
      socket.current.close();
    };
  }, []);

  return { socket };
};

export default useSocket;
