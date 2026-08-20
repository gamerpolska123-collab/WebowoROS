"use client";

import { useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://api:4001";

export function useOrdersWebSocket(onNewOrder: () => void) {
  const socketRef = useRef<Socket | null>(null);
  const onNewOrderRef = useRef(onNewOrder);
  onNewOrderRef.current = onNewOrder;

  const connect = useCallback(() => {
    const socket = io(WS_URL, {
      transports: ["websocket"],
      withCredentials: true,
      reconnection: true,
      reconnectionDelay: 5000,
      reconnectionAttempts: 10,
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join_kitchen");
    });

    socket.on("orders:new", () => {
      onNewOrderRef.current();
    });

    socket.on("order:updated", () => {
      onNewOrderRef.current();
    });

    socket.on("kitchen:new", () => {
      onNewOrderRef.current();
    });

    socket.on("connect_error", (err) => {
      console.warn("WebSocket error:", err.message);
    });
  }, []);

  useEffect(() => {
    connect();
    return () => {
      socketRef.current?.disconnect();
    };
  }, [connect]);
}
