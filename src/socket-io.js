const LoginManager = require("./controllers/LoginManager");
const ChatManager = require("./controllers/ChatManager");
const socket = require("socket.io");

const cm = new ChatManager();
const lm = new LoginManager("src/models/hashes.json");
const loggedUsers = new Set();
const sockets = new Map();
module.exports = (httpServer) => {
    const io = socket(httpServer);
    
    cm.addRoom("chat", "");

    io.on("connection" , (socket) => {
        console.log(`Cliente conectado: ${socket.handshake.address}`);
        let loggedIn = false;
        let room = null;
        let username = null;
        let level = null;
        socket.on("message", (data) => {
            if (!loggedIn){
                socket.emit("message", "Inicia sesion antes de poder hacer eso");
                return;
            }
            if (room == null){
                socket.emit("message", "Entra a una sala antes de poder mandar mensajes");
                return;
            }
            if (!data.hasOwnProperty("message")){
                console.log("Missing field 'message'");
                return;
            }
            let message = data.message.trim();
            if (!message.length > 0){
                console.log(`Empty message from ${username}, not sending.`);
                return;
            }
            message = cm.sanitize({user:username, message:message});
            cm.logMessage(room, message)
            io.to(room).emit("message", message);
        })
        socket.on("login", (data) => {
            if (!data.hasOwnProperty("user") || !data.hasOwnProperty("password")){
                console.log("Missing fields");
                return;
            }
            const user = data.user.trim().toLowerCase();
            if (loggedIn || loggedUsers.has(data.user)){
                socket.emit("message", "El usuario ya tiene una sesion iniciada");
                return;
            }
            const login = lm.login(user, data.password);
            if (login.success){
                loggedIn = true;
                loggedUsers.add(user);
                username = user;
                level = login.level;
                sockets.set(user, socket);
                socket.emit("login");
                socket.emit("message", `<span class="green">Iniciaste sesion</span>`);
                socket.emit("availableRooms", cm.getRooms());
                socket.join("lobby"); // TODO: evitar que se cree una sala llamada lobby
            } else{
                socket.emit("message", `${login.errmsg}`);
            }
        })

        socket.on("register", (data) => {
            let user = data.user.trim().toLowerCase();
            let result = lm.register(user, data.password, "user");
            if (!result.success){
                socket.emit("message", result.errmsg);
                return;
            }
            socket.emit("message", `Registro exitoso`);

        })
        socket.on("join", (data) => {
            if (!loggedIn){
                socket.emit("message", "Inicia sesion antes de poder hacer eso");
                return;
            }
            if (!data.hasOwnProperty("room") || !data.hasOwnProperty("password") ){
                console.log("Invalid join");
                return;
            }
            if (room != null){
                console.log(`${username} tried to join ${data.room} when already in ${room}`);
                return;
            }
            let result = cm.login(data.room, data.password);
            if (!result.success){
                socket.emit("message", result.errmsg);
                return;
            }
            room = data.room;
            io.to(room).emit("message", `<span class="green">${username} se unio</span>`);
            cm.logMessage(data.room, `<span class="green">${username} se unio</span>`);
            socket.join(room);
            socket.emit("join");
            let roomlog = cm.getLog(room);
            if (roomlog.success){
                socket.emit("sendLog", roomlog.log);
            }
            
            
        })

        socket.on("create", (data) => {
            if (!loggedIn){
                socket.emit("message", "Inicia sesion antes de poder hacer eso");
                return;
            }
            if (!data.hasOwnProperty("room") || !data.hasOwnProperty("password") || room != null){
                console.log("Invalid create");
                return;
            }
            let result = cm.addRoom(data.room, data.password);
            if (!result.success){
                socket.emit("message", result.errmsg);
                return;
            }
            socket.emit("message", `${data.room} creado con exito`);
            io.to("lobby").emit("availableRooms", [data.room]);
        })

        socket.on("kick", (data) => {
            if (!data.hasOwnProperty("user")){
                console.log(`${data} has no property 'user'`);
                return;
            }
            let user = data.user.trim().toLowerCase();
            console.log(`${username} trying to kick ${user}`);
            if (!sockets.has(user)){
                console.log(`User ${user} doesn't exist`);
                socket.emit("message", `El usuario ${user} no existe`);
                return;
            }
            console.log(`Kicking user ${user}`);
            let kickedSocket = sockets.get(user);
            kickedSocket.emit("message", `<span class="red">Fuiste kickeado</span>`);
            kickedSocket.disconnect();
        })

        socket.on("disconnect", () => {
            console.log(`disconnected ${socket.handshake.address}`);
            if (!loggedIn){
                return;
            }
            loggedIn = false;
            loggedUsers.delete(username);
            if (room == null){
                return;
            }
            let message = `<span class="green">${username} se desconecto</span>`;
            io.to(room).emit("message", message);
            cm.logMessage(room, message)
            
        })


        
    })



}