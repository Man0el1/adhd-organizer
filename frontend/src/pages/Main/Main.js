import React, { useEffect, useState, useRef } from "react";
import io from "socket.io-client";

import './Main.css'

export default function Main() {

  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io("http://localhost:8080");
    setSocket(newSocket);

    newSocket.on('message', (text) => {
      setMessages(prev => [...prev, text]);
    });

    return () => newSocket.disconnect(); // cleanup
  }, []);

  const sendMessage = () => {
    if (!socket) return;
    socket.emit('message', inputValue);
    setInputValue("");
  };

  return(
    <div className="homePage">
      <h1 className="title">pagina inicial</h1>
      <input type="text" placeholder="Digite uma mensagem" onChange={(e) => setInputValue(e.target.value)}/>
      <button className="button" onClick={sendMessage}>Enviar mensagem</button>
      <ul className="messages">
        {messages.map((msg, index) => (<li key={index}>{msg}</li>))}
      </ul>
    </div>
  )
}

