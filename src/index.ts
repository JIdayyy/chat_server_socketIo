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
    console.log("payload", user, room);
    // if (error) return callback(error);
    // if (!user) return callback("User not found");
    try {
      const foundedRoom = await prisma.room.findFirst({
        where: {
          name: room,
        },
        rejectOnNotFound: true,
      });
      if (!foundedRoom) {
        const newRoom = await prisma.room.create({
          data: {
            name: room,
            users: {
              connect: {
                id: user.id,
              },
            },
            socketId: socket.id,
          },
        });
        socket.emit("message", {
          user: "admin",
          text: `${user.name}, welcome to ${newRoom.name}`,
        });

        socket.broadcast
          .to(newRoom.name)
          .emit("message", { user: "admin", text: `${user.name} has joined!` });

        socket.join(newRoom.name);
      } else {
        const foundedRoom = await prisma.room.update({
          where: {
            name: room,
          },
          data: {
            users: {
              connect: {
                id: user.id,
              },
            },
            socketId: socket.id,
          },
        });

        socket.broadcast
          .to(foundedRoom.name)
          .emit("message", { user: "admin", text: `${user.name} has joined!` });

        socket.join(foundedRoom.name);
      }
    } catch (error) {
      console.log("error", error);
    }
  });

  socket.on("sendMessage", async ({ message, user, room }, callback) => {
    console.log(room);
    const Room = await prisma.room.findFirst({
      where: { name: room },
      rejectOnNotFound: true,
    });

    const Message = await prisma.message.create({
      data: {
        content: message,
        createdAt: new Date().toISOString(),
        user: {
          connect: {
            id: user.id,
          },
        },
        room: {
          connect: {
            id: Room.id,
          },
        },
      },
    });

    // if (!room) return callback("User not found");

    io.to(Room.name).emit("message", { user: user, content: message });
    callback();
  });

  socket.on("disconnection", async () => {
    // console.log("Client disconnected");
    // const deleted = await prisma.room.delete({
    //   where: { name: room },
    // });
  });

  socket.on("message", (message) => {
    console.log("Message: ", message);
    io.emit("message", message);
  });
});

httpServer.listen(3000, () => {
  console.log("Server is running on port 3000");
});
