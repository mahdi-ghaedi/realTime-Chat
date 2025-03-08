const socket = io();
let username = "";

// زمانی که صفحه بارگذاری می‌شود
window.onload = function () {
  const savedUsername = localStorage.getItem("username");
  if (savedUsername) {
    // اگر یوزرنیم در LocalStorage موجود باشد، چت را شروع کن
    username = savedUsername;
    document.getElementById("loginContainer").style.display = "none";
    document.getElementById("chatContainer").style.display = "flex";
    document.getElementById("chatHeader").textContent = `Welcome, ${username}`;

    // دریافت پیام‌ها از سرور (محدوده پیام‌های ذخیره شده در MongoDB)
    socket.emit("getMessages");
  } else {
    // اگر یوزرنیم وجود نداشت، فرم ورود نمایش داده می‌شود
    document.getElementById("loginContainer").style.display = "flex";
  }
};

// دریافت پیام‌ها از سرور
socket.on("messages", (messages) => {
  messages.forEach((msgObj) => {
    displayMessage(msgObj.message, msgObj.sender);
  });
});

socket.on("message", (msg, sender) => {
  // نمایش پیام جدید
  displayMessage(msg, sender);
});

socket.on("notification", (notification) => {
  const notificationDiv = document.getElementById("notification");
  notificationDiv.textContent = notification;
  notificationDiv.style.backgroundColor = "#dfdd87";

  notificationDiv.style.display = "block";
  setTimeout(() => {
    notificationDiv.style.display = "none";
  }, 5000); // بعد از 5 ثانیه نوتیفیکیشن پنهان می‌شود
});

// نمایش پیام
function displayMessage(msg, sender) {
  const messagesDiv = document.getElementById("messages");
  const messageElement = document.createElement("div");
  messageElement.classList.add("message");

  if (sender === username) {
    messageElement.classList.add("mine");
  } else {
    messageElement.classList.add("theirs");
  }

  messageElement.innerHTML = `<strong>${sender}:</strong> ${msg}`;
  messagesDiv.appendChild(messageElement);
  messagesDiv.scrollTop = messagesDiv.scrollHeight; // اسکرول خودکار به پایین
}

// شروع چت بعد از وارد کردن یوزرنیم
function startChat() {
  username = document.getElementById("usernameInput").value.trim();
  if (username !== "") {
    // ذخیره یوزرنیم در LocalStorage
    localStorage.setItem("username", username);

    // ارسال نوتیفیکیشن برای کاربران دیگر
    socket.emit("newUser", username);

    // مخفی کردن فرم ورود و نمایش چت
    document.getElementById("loginContainer").style.display = "none";
    document.getElementById("chatContainer").style.display = "flex";
    document.getElementById("chatHeader").textContent = `Welcome, ${username}`;

    // دریافت پیام‌ها از سرور
    socket.emit("getMessages");
  } else {
    alert("Please enter a username");
  }
}

// ارسال پیام
function sendMessage() {
  const input = document.getElementById("messageInput");
  const message = input.value.trim();
  if (message !== "") {
    socket.emit("message", message, username); // ارسال پیام با یوزرنیم
    input.value = ""; // پاک کردن فیلد ورودی
  }
}

// تابع logout
function logout() {
  // ارسال پیغام به سرور که کاربر از چت خارج شده است
  socket.emit("userLeft", username);

  // نمایش نوتیفیکیشن برای سایر کاربران
  const notificationDiv = document.getElementById("notification");
  notificationDiv.textContent = `${username} has left the chat`;
  notificationDiv.style.backgroundColor = "darkred";
  notificationDiv.style.display = "block";
  setTimeout(() => {
    notificationDiv.style.display = "none";
  }, 5000); // نوتیفیکیشن بعد از 5 ثانیه پنهان می‌شود

  // حذف یوزرنیم از LocalStorage
  localStorage.removeItem("username");

  // مخفی کردن صفحه چت و نمایش فرم ورود
  document.getElementById("chatContainer").style.display = "none";
  document.getElementById("loginContainer").style.display = "flex";
}
