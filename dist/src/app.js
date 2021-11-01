"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const client_1 = __importDefault(require("../prisma/client"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: "*",
}));
app.use(express_1.default.json());
app.post("/api/login", async (req, res) => {
    console.log(req.body);
    const user = await client_1.default.user.findFirst({
        where: {
            name: req.body.name,
        },
        rejectOnNotFound: true,
    });
    if (user.password === req.body.password) {
        res.status(200).send(user);
    }
    else {
        res.status(401).json({
            message: "Invalid credentials",
        });
    }
});
app.get("/server", (req, res) => {
    res.status(200).send("hello world");
});
exports.default = app;
