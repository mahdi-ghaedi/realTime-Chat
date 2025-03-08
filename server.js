// server.js

const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const mongoose = require("mongoose");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// MongoDB connection
mongoose
  .connect("mongodb://localhost:27017/chatdb", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log(err));

// Create message schema
const messageSchema = new mongoose.Schema({
  message: String,
  sender: String,
  timestamp: { type: Date, default: Date.now },
});

// Create message model
const Message = mongoose.model("Message", messageSchema);

// Serve static files (optional, for your front-end)
app.use(express.static("public"));

// Get messages from MongoDB
app.get("/messages", async (req, res) => {
  try {
    const messages = await Message.find().sort({ timestamp: 1 }); // Sort by timestamp
    res.json(messages);
  } catch (err) {
    res.status(500).send("Error retrieving messages from MongoDB");
  }
});

// server.js

io.on("connection", (socket) => {
  console.log("A user connected");

  // ارسال نوتیفیکیشن برای ورود کاربر جدید
  socket.on("newUser", (username) => {
    socket.broadcast.emit("notification", `${username} به چت وارد شد`);
  });

  // ارسال نوتیفیکیشن برای خروج کاربر
  socket.on("userLeft", (username) => {
    socket.broadcast.emit("notification", `${username}    از چت خارج شد`);
  });

  // دریافت و ذخیره پیام‌ها
  socket.on("message", async (msg, sender) => {
    const message = new Message({ message: msg, sender: sender });
    await message.save();
    io.emit("message", msg, sender); // ارسال پیام به همه کاربران
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

// Start server
server.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
