import React, { useEffect, useRef, useState } from "react";

function App() {
  const ws = useRef(null);
  const recognitionRef = useRef(null);
  const [listening, setListening] = useState(false);
  const speechBuffer = useRef("");
  const silenceTimer = useRef(null);

  useEffect(() => {
    ws.current = new WebSocket("ws://localhost:8000/ws");
    ws.current.onopen = () => console.log("✅ Connected to backend");
    ws.current.onclose = () => console.log("❌ Disconnected from backend");

    return () => {
      ws.current.close();
    };
  }, []);

  const startListening = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Speech Recognition not supported in this browser.");
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      console.log("🎤 Voice recognition started");
      setListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript.trim();
      console.log("🗣 Heard:", transcript);

      if (transcript) {
        speechBuffer.current += (speechBuffer.current ? " " : "") + transcript;

        // Reset silence timer
        if (silenceTimer.current) clearTimeout(silenceTimer.current);

        // Start 5-second silence timer
        silenceTimer.current = setTimeout(() => {
          if (speechBuffer.current) {
            console.log("⏳ Pause detected — sending:", speechBuffer.current);
            if (ws.current && ws.current.readyState === WebSocket.OPEN) {
              ws.current.send(speechBuffer.current);
            }
            speechBuffer.current = ""; // Clear buffer
          }
        }, 5000);
      }
    };

    recognition.onerror = (event) => {
      console.error("⚠️ Recognition error:", event.error);
    };

    recognition.onend = () => {
      console.log("🔄 Restarting recognition...");
      if (listening) recognition.start();
    };

    recognition.start();
    recognitionRef.current = recognition;
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setListening(false);
      console.log("🛑 Voice recognition stopped");
    }
    if (silenceTimer.current) clearTimeout(silenceTimer.current);
  };

  return (
    <div style={{ textAlign: "center", padding: "50px" }}>
      <h2>🎤 Speech to WebSocket (5s Pause Detection)</h2>
      {!listening ? (
        <button onClick={startListening}>Start Listening</button>
      ) : (
        <button onClick={stopListening}>Stop Listening</button>
      )}
    </div>
  );
}

export default App;
