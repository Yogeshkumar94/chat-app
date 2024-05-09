"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const fastify_socket_io_1 = __importDefault(require("fastify-socket.io"));
const app = (0, fastify_1.default)();
app.register(fastify_socket_io_1.default, {
    cors: {
        origin: "*",
    },
});
app.get("/", (req, res) => {
    res.send("Heyo");
});
const users = {};
app.ready((err) => {
    if (err)
        throw err;
    app.io.on("connection", (socket) => {
        console.log("socket connected", socket.id);
        socket.on("new-user", (nam) => {
            console.log(`New user: ${nam}`);
            users[socket.id] = nam;
            socket.broadcast.emit("user-joined", nam, users);
            // console.log("before disconnect");
            // setTimeout(() => {
            //   socket.disconnect();
            //   console.log("in disconnect");
            // }, 15000);
            // console.log("after disconnect function");
        });
        socket.on("privateChat", (anotherId) => {
            console.log("another id: ", anotherId);
            console.log("clickers id: ", socket.id);
            socket.join(anotherId);
            setTimeout(() => {
                socket
                    .to(anotherId)
                    .emit("privateMessage", users[socket.id], users[anotherId]);
            }, 3000);
            // socket
            //   .to(anotherId)
            //   .emit("privateMessage", users[socket.id], users[anotherId]);
            const rooms = app.io.of("/").adapter.rooms;
            console.log(rooms);
        });
        socket.on("send", (message) => {
            socket.broadcast.emit("receive", {
                message: message,
                nam: users[socket.id],
            });
        });
        socket.on("reload", () => {
            // socket.broadcast.emit('refresh',users)
            console.log(users);
            app.io.to(socket.id).emit("refresh", users);
        });
        socket.on("disconnect", () => {
            socket.broadcast.emit("left", users[socket.id]);
            delete users[socket.id];
            console.log(users);
        });
    });
});
app.listen(8000);
