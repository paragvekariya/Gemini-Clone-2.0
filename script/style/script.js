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
  