import React, { useEffect, useRef, useState } from 'react';
import './App.css';

function App() {
  const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [trackNames, setTrackNames] = useState<string[]>([]); // <-- Added state for track names
  const [currentTempo, setCurrentTempo] = useState<number>(0); // <-- Added state for tempo
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    setStatus('connecting');
    const ws = new WebSocket('ws://localhost:9000');
    wsRef.current = ws;

    ws.onopen = () => {
      setStatus('connected');
      setMessages(msgs => [...msgs, '[Connected]']);
      ws.send('bang'); // Example: send a message on connect
    };
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'trackNames') {
          setTrackNames(data.data);
          setMessages(msgs => [...msgs, `[In] Track names received (${data.data.length})`]);
          return;
        }
        if (data.type === 'currentTempo') {
          setCurrentTempo(data.data);
          setMessages(msgs => [...msgs, `[In] Tempo updated: ${data.data} BPM`]);
          return;
        }
      } catch (e) {
        // Not JSON, just a regular message
      }
      setMessages(msgs => [...msgs, `[In] ${event.data}`]);
    };
    ws.onclose = () => {
      setStatus('disconnected');
      setMessages(msgs => [...msgs, '[Disconnected]']);
    };
    ws.onerror = (e) => {
      setMessages(msgs => [...msgs, '[Error] Connection error']);
    };
    return () => {
      ws.close();
    };
  }, []);

  const sendMessage = () => {
    if (wsRef.current && status === 'connected' && input.trim()) {
      wsRef.current.send(input);
      setMessages(msgs => [...msgs, `[Out] ${input}`]);
      setInput('');
    }
  };

  const getTrackNames = () => {
    if (wsRef.current && status === 'connected') {
      wsRef.current.send('getTrackNames');
      setMessages(msgs => [...msgs, '[Out] getTrackNames']);
    }
  };

  const recordBassClip = () => {
    if (wsRef.current && status === 'connected') {
      wsRef.current.send('recordBassClip');
      setMessages(msgs => [...msgs, '[Out] recordBassClip']);
    }
  };

  const getTempo = () => {
    if (wsRef.current && status === 'connected') {
      wsRef.current.send('getTempo');
      setMessages(msgs => [...msgs, '[Out] getTempo']);
    }
  };

  return (
    <div className="ws-tester">
      <h1>WebSocket Tester</h1>
      <div>Status: <span className={`status status-${status}`}>{status}</span></div>
      <div>Current Tempo: <span className="tempo">{currentTempo} BPM</span></div>
      <div className="ws-messages">
        <h2>Messages</h2>
        <div className="ws-messages-list">
          {messages.slice().reverse().map((msg, i) => <div key={messages.length - 1 - i}>{msg}</div>)}
        </div>
      </div>
      <button onClick={getTrackNames} disabled={status !== 'connected'}>
        Get Track Names
      </button>
      <button onClick={recordBassClip} disabled={status !== 'connected'}>
        Record Bass Clip
      </button>
      <button onClick={getTempo} disabled={status !== 'connected'}>
        Get Current Tempo
      </button>
      {trackNames.length > 0 && (
        <div>
          <h2>Track Names</h2>
          <ul>
            {trackNames.map((name, i) => <li key={i}>{name}</li>)}
          </ul>
        </div>
      )}
      <div className="ws-input">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type a message..."
          disabled={status !== 'connected'}
          onKeyDown={e => { if (e.key === 'Enter') sendMessage(); }}
        />
        <button onClick={sendMessage} disabled={status !== 'connected' || !input.trim()}>Send</button>
      </div>
    </div>
  );
}

export default App;
