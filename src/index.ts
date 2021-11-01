import app from "./app";
import { createServer } from "http";
import { Server } from "socket.io";

const httpServer = createServer(app);

import { addUser, removeUser, getUser, getUsersInRoom } from "./user";
import prisma from "../prisma/client";

const io = new Server(httpServer, {
  serveClient: false,
  pingInterval: 10000,
  pingTimeout: 5000,
  cookie: false,
  cors: {
    credentials: true,
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("New client connected");

  socket.on("join", async ({ room, user }, callback) => {
    // const { user, error } = addUser({ id: socket.id, name, room });
    console.log("payload", user);
    // if (error) return callback(error);
    // if (!user) return callback("User not found");
    const newRoom = await prisma.room.create({
      data: {
        name: room,
        user: user.name,
        socketId: socket.id,
      },
    });
    console.log("created", newRoom);
    socket.emit("message", {
      user: "admin",
      text: `${newRoom.user}, welcome to ${newRoom.name}`,
    });

    socket.broadcast
      .to(newRoom.name)
      .emit("message", { user: "admin", text: `${user.name} has joined!` });

    socket.join(newRoom.name);

    callback();
  });

  socket.on("sendMessage", async (message, callback) => {
    const room = await prisma.room.findFirst({
      where: { socketId: socket.id },
    });

    if (!room) return callback("User not found");

    io.to(room.name).emit("message", { user: room.user, text: message });

    callback();
  });

  socket.on("disconnection", async (socket) => {
    console.log("Client disconnected");
    const deleted = await prisma.room.findFirst({
      where: { socketId: socket.id },
      rejectOnNotFound: true,
    });
    const room = await prisma.room.delete({
      where: { id: deleted.id },
    });
    const user = removeUser(socket.id);
    console.log(user);
  });

  socket.on("message", (message) => {
    console.log("Message: ", message);
    io.emit("message", message);
  });
});

httpServer.listen(3000, () => {
  console.log("Server is running on port 3000");
});
