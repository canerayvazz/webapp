import { useState, useEffect, useRef } from "react";

const App = () => {
  const [value, setValue] = useState("");
  const [message, setMessage] = useState(null);
  const [previousChats, setPreviousChats] = useState([]);
  const [currentTitle, setCurrentTitle] = useState(null);

  const feedRef = useRef(null);

  const createNewChat = () => {
    setMessage(null);
    setValue("");
    setCurrentTitle(null);
    setPreviousChats([]);
  };

  const handleClick = (uniqueTitle) => {
    setCurrentTitle(uniqueTitle);
    setMessage(null);
    setValue("");
  };

  const getMessages = async () => {
    if (value.trim() === "") return;

    const userMessage = { role: "user", content: value };

    setPreviousChats((prevChats) => [
      ...prevChats,
      { title: currentTitle || value, ...userMessage },
    ]);

    setValue("");

    const options = {
      method: "POST",
      body: JSON.stringify({
        messages: previousChats.concat(userMessage),
      }),
      headers: {
        "Content-Type": "application/json",
      },
    };

    try {
      const response = await fetch("https://webapp-h3j4.onrender.com/completions", options);
      const data = await response.json();
      console.log("Response data:", data);
      setMessage(data.choices[0].message.content); // Adjusted for correct access
    } catch (error) {
      console.log("Error:", error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      getMessages();
    }
  };

  useEffect(() => {
    if (!currentTitle && message) {
      setCurrentTitle(previousChats[0].content);
    }
    if (currentTitle && message) {
      setPreviousChats((prevChats) => [
        ...prevChats,
        {
          title: currentTitle,
          role: message.role,
          content: message.content,
        },
      ]);
    }
  }, [message, currentTitle]);

  useEffect(() => {
    if (message) {
      let currentIndex = 0;
      let typedMessage = "";
      const interval = setInterval(() => {
        if (currentIndex < message.length) {
          typedMessage += message[currentIndex];
          currentIndex++;
          setPreviousChats((prevChats) =>
              prevChats.map((chat, idx) =>
                  idx === prevChats.length - 1
                      ? { ...chat, content: typedMessage }
                      : chat
              )
          );
        } else {
          clearInterval(interval);
        }
      }, 15);

      return () => clearInterval(interval);
    }
  }, [message]);

  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [previousChats]);

  const currentChat = previousChats.filter(
      (previousChat) => previousChat.title === currentTitle
  );
  const uniqueTitles = Array.from(
      new Set(previousChats.map((previousChat) => previousChat.title))
  );

  return (
      <div className="app">
        <section className="side-bar">
          <button onClick={createNewChat}>+ New Chat</button>
          <ul className="history">
            {uniqueTitles?.map((uniqueTitle, index) => (
                <li key={index} onClick={() => handleClick(uniqueTitle)}>
                  {uniqueTitle}
                </li>
            ))}
          </ul>
          <nav>
            <p style={{ fontSize: "16px" }}>Made by Caner</p>
          </nav>
        </section>
        <section className="main">
          <h1>CanerGPT</h1>
          <ul className="feed" ref={feedRef}>
            {currentChat?.map((chatMessage, index) => (
                <li key={index}>
                  <p className="role">{chatMessage.role}</p>
                  <p>{chatMessage.content}</p>
                </li>
            ))}
          </ul>
          <div className="bottom-section">
            <div className="input-box">
              <input
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter Message"
              />
              <div id="submit" onClick={getMessages}>
                ➢
              </div>
            </div>
            <p className="info">Your feedback will help us improve.</p>
          </div>
        </section>
      </div>
  );
};

export default App;
