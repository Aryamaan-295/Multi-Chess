import { useEffect, useState } from "react";

export function useSocket(): WebSocket | null {
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    let ws: WebSocket;
    let shouldReconnect = true;

    const connect = () => {
      ws = new WebSocket("ws://localhost:8080");

      ws.onopen = () => {
        console.log("WebSocket connected");
        setSocket(ws);
      };

      ws.onclose = () => {
        console.log("WebSocket closed");
        // If the component is still mounted, attempt reconnect
        if (shouldReconnect) {
          console.log("Attempting to reconnect in 1 second...");
          setTimeout(connect, 1000);
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
      };
    };

    connect();

    return () => {
      shouldReconnect = false;
      ws.close();
    };
  }, []);

  return socket;
}
