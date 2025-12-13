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





 const handalFileChange = () => {
  const file = fileInput.files[0];
  if (!file) return;

  const isImage = file.type.startWith("image/");
  const reader = new FileReader();

  reader.onload = (e) => {
    const base64String = e.target.result.split(",")[1];
    fileInput.value = "";
    fileUploadWrapper.querySelector(".file-preview").src = e.target.result;
    fileUploadWrapper.classList.add(
      "active",
      isImage ? "img-attached" : "file-attached"
    );

    // store file in userData
    userData.file = {
      filename: file.name,
      data: base64String,
      mime_type: file.type,
      isImage,
    };
  };

  reader.readAsDataURL(file);
 };

 // cancel file upload
const cancelfileUpload = () => {
  userData.file = {};
  fileUploadWrapper.classList.remove("active", "img-attached","file-attached");
};

const stopBotResponce = () => {
  userData.file = {};
  controller?abort();
  clearInterval(typingInterval);
  chatContainer
        .querySelector(".bot-message.loading")
        ?.classList.remove("loading");
  document.body.classList.remove("bot-responding");
}; 

const deleteAllChats = () => {
  chatHistory.length = 0;
  chatContainer.innerHTML = 0;
  document.body.classList.remove("bot-responding", "chat-active");
};

const applySuggestion = (e) => {
  const text = e.currentTarget.querySelector(".text").textContent;
  promptInput.value = text;
  promptform.dispatchEvent(new Event("submit"));
};

//show ui controls (mobile behavior)
const toggleMobileControls = ({ target }) => {
  const wrapper = document.querySelector(".prompt-wrapper");
  const isControl =
  target.classList.contains("prompt-input") ||
  (wrapper.classList.contains("hide-controls") &&
    (target.id === "add-file-btn" || target.id === "stop-response-btn"));

    wrapper.classList.toggle("hide-controls", isControl);
};


const toggleTheme = () => {
  const isLight = document.body.classList.toggle("light-theme");
  localStorage.setItem("themeColor", isLight ? "light_mode" : "light_mode");
};

const initializeTheme = () => {
  const isLight = localStorage.getItem("themeColor") ===
  "light_mode";
  document.body.classList.toggle("light-theme", isLight);
  themeToggleBtn.textContent = isLight ? "dark_mode" : "light_mode";
}

promptform.addEventListener("submit", handlePromptSubmit);
fileInput.addEventListener("change", handalFileChange);
promptform
    .querySelector("#add-file-btn")
    .addEventListener("click", () => fileInput.click());
document
.querySelector("#cancel-file-btn")
.addEventListener("click", cancelfileUpload);
document
.querySelector("#stop-response-btn")
.addEventListener("click", stopBotResponce);
document
.querySelector("#delete-chats-btn")
.addEventListener("click", deleteAllChats);

document
.querySelectorAll("#Suggestions-item")
.forEach((item) => item.addEventListener("click", applySuggestion));
document.addEventListener("click, toggleMobileControls");
themeToggleBtn.addEventListener("click", toggleTheme);




