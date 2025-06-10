const chats = [];

const chatForm = document.getElementById("chat-form");
const chatBox = document.getElementById("chat-box");
const chatInput = document.getElementById("chat-input");

chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const message = chatInput.value.trim();
  if (!message) return;

  addMessage(message, "user");
  chatInput.value = "";

  const response = await getBotReply(message);
  addMessage(response, "bot");
});

function addMessage(text, sender) {
  const messageDiv = document.createElement("div");
  messageDiv.className = `message ${sender}-message`;
  messageDiv.textContent = text;
  chatBox.appendChild(messageDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}

async function getBotReply(input) {
  chats.push({
    user: input,
  });

  const response = await fetch("http://localhost:3000", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chats,
    }),
  });

  const data = await response.json();

  chats[chats.length - 1].bot = data.message;

  return data.message;
}
