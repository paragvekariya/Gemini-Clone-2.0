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
}
