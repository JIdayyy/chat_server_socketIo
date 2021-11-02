import Express from "express";
import cors from "cors";
import prisma from "../prisma/client";

const app = Express();

app.use(
  cors({
    origin: "*",
  })
);
app.use(Express.json());

app.get("/api/messages/:room", async (req, res) => {
  const room = req.params.room;
  const messages = await prisma.message.findMany({
    where: {
      room: {
        name: room,
      },
    },
    include: {
      user: true,
    },
  });

  res.json(messages);
});

app.post("/api/login", async (req, res) => {
  console.log(req.body);
  const user = await prisma.user.findFirst({
    where: {
      name: req.body.name,
    },
    rejectOnNotFound: true,
  });
  if (user.password === req.body.password) {
    res.status(200).send(user);
  } else {
    res.status(401).json({
      message: "Invalid credentials",
    });
  }
});

app.get("/server", (req, res) => {
  res.status(200).send("hello world");
});

export default app;
