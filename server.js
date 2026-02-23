const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["https://aftermezzanotte.live", "https://*.github.io"], // frontend
    methods: ["GET", "POST"]
  }
});

// Serve un endpoint di test
app.get("/", (req, res) => {
  res.json({ status: "aftermezzanotte.live server OK", online: true });
});

// Chat globale: stanza "global"
io.on("connection", (socket) => {
  console.log("Utente connesso:", socket.id);

  // Unisciti automaticamente alla stanza "global"
  socket.join("global");

  // Ricevi messaggi e rebroadcasta a tutti nella global
  socket.on("chat-message", (data) => {
    console.log("Messaggio da", data.nick, ":", data.text);
    io.to("global").emit("chat-message", {
      nick: data.nick,
      text: data.text,
      timestamp: Date.now(),
      id: socket.id.slice(0, 8)
    });
  });

  // Gestisci disconnessione
  socket.on("disconnect", () => {
    console.log("Utente disconnesso:", socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server Socket.IO su porta ${PORT}`);
});
