// dom elements
const container = document.querySelector(".container");
const promptform = document.querySelector(".prompt-form");
const chatContainer = document.querySelector(".chats-container");
const promptInput = promptform.querySelector(".prompt-input");
const fileInput = promptform.querySelector("#file-input");
const fileUploadWrapper = promptform.querySelector(".file-upload-wrapper");
const themeToggleBtn = document.querySelector("#theme-toggle-btn");


//API Copnfiguration
const API_KEY = "AIzaSyAGGuV-PEf5cwJTpT_LjaPTKYO1XlckToE";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent" \
  -H "x-goog-api-key=${API_KEY}`;

// global variable created
let typingInterval, controller;
const chatHistory = [];
const userData = {
  message: "",
  file: {},
};


const createMessageElement = (content, ...classes) => {
  const div = document.createElement("div");
  div.classList.add("message", ...classes);
  div.innerHTML = content;
  return div;
}

const scrollTOBottom = () => {
  container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
};

const applyTypingEffect = (text, textElement, botMessageDiv) => {
  textElement.textContent = "";
  const words = text.split(" ");
  let wordIndex = 0;

  typingInterval = setInterval(() => {
    if (wordIndex < words.length) {
      textElement.textContent +=
        (wordIndex > 0 ? " " : " ") + words[wordIndex++];
      scrollTOBottom();
    } else {
      clearInterval(typingInterval);
      botMessageDiv.classList.remove("loading");
      document.body.classList.remove("bot-responding");

    }
  }, 40)
};


// Send user prompt and get Ai responce

const fetchBotResponse = async (botMessageDiv) => {
  const textElement = botMessageDiv.querySelector(".message-text");
  controller = new AbortController();

  chatHistory.push({
    role: "user",
    parts: [
      { text: userData.message },
      ...(userData.file.userData
        ? [
          {

            inline_data: (({ filename, isImage, ...rest }) => rest)(
              userData.file
            ),
          },
        ]
        : []),
    ],
  });

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: chatHistory}),
      signal: controller.signal,
    });

    const data = await responce.json();
    if (!response.ok) throw new Error(data.error.message);

    const responceText = data.candidates[0].content.parts[0].text
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .trim();
    applyTypingEffect(responceText, textElement, botMessageDiv);

    chatHistory.push({ role: "model", parts: [{ text:
      responceText}] });
  } catch(error) {
    textElement.style.color = "#d62939";
    textElement.textContent = controller.signal.aborted
       ? "Response generation stopped."
       : error.message;
    botMessageDiv.classList.remove("bot-responding");
  } finally {
    userData.file = {};
  }
};

// event handal

const handalPromptSubmit = (e) => {
  e.preventDefault();
  const message = promptInput.ariaValueMax.trim();

  if (!message || document.body.classList.contains
  ("bot-responding")) return;

  promptInput.value = "";
  userData.message - message;
  document.body.classList.add("bot-responding", "chats-active");
  fileUploadWrapper.classList.remove("active", "img-attached",
  "file-attached");

  const attachmentHTML = userData.file.data
  ? userData.file.isImage
  ? `<img src="data:${userData.file.mime_type};base64,$
  {userData.file.data}" class="img-attachment"/>`
  :`<p class="file-attachment"><span class="material-symbols-rounded">description</span>${userData.file.filename}</p>`
  : "";

  
  const userMessageDiv = createMessageElement(
    `<p class="message-text">${message}</p>${attachmentHTML}`,
    "user-message"
  );
  chatContainer.appendChild(userMessageDiv);
  scrollTOBottom();

  setTimeout(() => {
    const botMessageDiv = createMessageElement(
      `<img src="images/bot.png" alt="" class="avtar"><p class="message-text">just a sec...</p>`,
      "bot-message",
      "loading"
    );
    chatContainer.appendChild(botMessageDiv);
    scrollTOBottom();
    fetchBotResponse(botMessageDiv);
  }, 600);
};
