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

  await handleBotReplyStream(message);
});

function addMessage(text, sender, isStripped) {
  const messageDiv = document.createElement("div");
  messageDiv.className = `message ${sender}-message`;

  if (sender === "user" || isStripped) {
    messageDiv.textContent = text;
  } else {
    messageDiv.innerHTML = parseMarkdown(text);
  }

  chatBox.appendChild(messageDiv);
  scrollToBottom();
  return messageDiv;
}

function addLoadingMessage() {
  const messageDiv = document.createElement("div");
  messageDiv.className = "message loading";
  messageDiv.innerHTML = `
  <span class="dot-1">.</span>
  <span class="dot-2">.</span>
  <span class="dot-3">.</span>
  `;

  chatBox.appendChild(messageDiv);
  scrollToBottom();
  return messageDiv;
}

async function handleBotReplyStream(input) {
  chats.push({
    user: input,
  });

  const loaderElement = addLoadingMessage();

  try {
    const response = await fetch("http://localhost:3000", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chats,
      }),
    });

    if (!response.ok || !response.body) {
      loaderElement.remove();
      return addMessage("오류가 발생했습니다. 다시 시도해주세요.", "bot", true);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");

    let accumulatedText = "";
    const botMessageDiv = addMessage("", "bot");

    loaderElement.remove();

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      if (value) {
        const text = decoder.decode(value, { stream: true });
        accumulatedText += text;

        botMessageDiv.innerHTML = parseMarkdown(accumulatedText);
        scrollToBottom();
      }
    }

    chats[chats.length - 1].bot = accumulatedText;
    return accumulatedText;
  } catch (error) {
    loaderElement.remove();
    addMessage("오류가 발생했습니다. 다시 시도해주세요.", "bot", true);
  }
}
function parseMarkdown(text) {
  return marked.parse(text);
}

function scrollToBottom() {
  chatBox.scrollTop = chatBox.scrollHeight;
}
