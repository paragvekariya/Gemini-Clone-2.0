require('dotenv').config()

document.addEventListener("DOMContentLoaded", () => {

  /* ================= DOM ELEMENTS ================= */
  const container = document.querySelector(".container");
  const promptForm = document.querySelector(".prompt-form");
  const chatContainer = document.querySelector(".chats-container");
  const promptInput = document.querySelector(".prompt-input");
  const fileInput = document.querySelector("#file-input");
  const fileUploadWrapper = document.querySelector(".file-upload-wrapper");
  const themeToggleBtn = document.querySelector("#theme-toggle-btn");
  const deleteChatsBtn = document.querySelector("#delete-chats-btn");
  const stopResponseBtn = document.querySelector("#stop-response-btn");
  const sendPromptBtn = document.querySelector("#send-prompt-btn");
  const suggestionItems = document.querySelectorAll(".suggestion-item");
  const addFileBtn = document.querySelector("#add-file-btn");
  const cancelFileBtn = document.querySelector("#cancel-file-btn");

  /* ================= THEME LOAD ================= */
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "light") {
    document.body.classList.add("light-theme");
    themeToggleBtn.textContent = "dark_mode";
  }

  /* ================= API CONFIG ================= */
  //const apikey = process.env.API_KEY
  process.env.API_KEY;
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

    

  /* ================= STATE ================= */
  let typingInterval;
  let controller;
  const chatHistory = [];

  /* ================= HELPERS ================= */
  const scrollToBottom = () => {
    container.scrollTop = container.scrollHeight;
  };

  const createMessageElement = (text, className) => {
    const div = document.createElement("div");
    div.className = `message ${className}`;
    div.innerHTML = `<p class="message-text">${text}</p>`;
    return div;
  };

  /* ================= TYPING EFFECT ================= */
  const typeText = (text, element) => {
    let index = 0;
    element.textContent = "";

    typingInterval = setInterval(() => {
      if (index < text.length) {
        element.textContent += text[index++];
        scrollToBottom();
      } else {
        clearInterval(typingInterval);
        document.body.classList.remove("bot-responding");
      }
    }, 25);
  };

  /* ================= GEMINI API ================= */
  const fetchBotResponse = async (userMessage, botTextEl) => {
    controller = new AbortController();

    chatHistory.push({
      role: "user",
      parts: [{ text: userMessage }]
    });

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: chatHistory }),
        signal: controller.signal
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error.message);

      const botReply =
        data.candidates[0].content.parts[0].text;

      chatHistory.push({
        role: "model",
        parts: [{ text: botReply }]
      });

      typeText(botReply, botTextEl);

    } catch (error) {
      botTextEl.style.color = "red";
      botTextEl.textContent = error.message;
      document.body.classList.remove("bot-responding");
    }
  };

  /* ================= FORM SUBMIT ================= */
  const handlePromptSubmit = (e) => {
    e.preventDefault();

    const message = promptInput.value.trim();
    if (!message || document.body.classList.contains("bot-responding")) return;

    promptInput.value = "";
    document.body.classList.add("bot-responding");

    chatContainer.appendChild(
      createMessageElement(message, "user-message")
    );

    const botMsg = document.createElement("div");
    botMsg.className = "message bot-message loading";
    botMsg.innerHTML = `
      <img src="images/bot.png" class="avatar">
      <p class="message-text">Thinking...</p>
    `;
    chatContainer.appendChild(botMsg);

    scrollToBottom();
    fetchBotResponse(message, botMsg.querySelector(".message-text"));
  };

  /* ================= FILE HANDLING ================= */
  addFileBtn.addEventListener("click", () => fileInput.click());

  fileInput.addEventListener("change", () => {
    if (fileInput.files.length > 0) {
      fileUploadWrapper.classList.add("active");
    }
  });

  cancelFileBtn.addEventListener("click", () => {
    fileInput.value = "";
    fileUploadWrapper.classList.remove("active");
  });

  /* ================= BUTTONS ================= */
  sendPromptBtn.addEventListener("click", () => {
    promptForm.dispatchEvent(new Event("submit"));
  });

  stopResponseBtn.addEventListener("click", () => {
    if (controller) controller.abort();
    clearInterval(typingInterval);
    document.body.classList.remove("bot-responding");
  });

  deleteChatsBtn.addEventListener("click", () => {
    chatHistory.length = 0;
    chatContainer.innerHTML = "";
    document.body.classList.remove("chats-active");
  });

  /* ================= THEME ================= */
  themeToggleBtn.addEventListener("click", () => {
    const isLight = document.body.classList.toggle("light-theme");
    themeToggleBtn.textContent = isLight ? "dark_mode" : "light_mode";
    localStorage.setItem("theme", isLight ? "light" : "dark");
  });

  /* ================= SUGGESTIONS ================= */
  suggestionItems.forEach(item => {
    item.addEventListener("click", () => {
      promptInput.value = item.querySelector(".text").textContent;
      promptForm.dispatchEvent(new Event("submit"));
    });
  });

  promptForm.addEventListener("submit", handlePromptSubmit);

  console.log("✅ Gemini Clone JS Loaded Successfully");
});
