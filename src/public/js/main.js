const socket = io();

const chatBox = document.getElementById("chatBox"); 
const userBox = document.getElementById("user");
const passwordBox = document.getElementById("password");
const loginButton = document.getElementById("loginButton");
const signupButton = document.getElementById("signupButton");
const sendButton = document.getElementById("send");
const joinPassword = document.getElementById("roomPassword");
const addPassword = document.getElementById("addRoomPassword");
const addRoom = document.getElementById("addRoom");
const roomName = document.getElementById("roomName");
const joinButton = document.getElementById("joinButton");
const selectedRoom = document.getElementById("rooms");
const roomSelector = document.getElementById("roomSelector");
const roomCreate = document.getElementById("roomCreate");
const log = document.getElementById("log");
const rooms = document.getElementById("rooms");
const availableRooms = new Set();
const loginDiv = document.getElementById("login");

function sendMessage(){
    let user = userBox.value.trim()
    if(chatBox.value.trim().length > 0 && user.length > 0){
        socket.emit("message", {user:user, message: chatBox.value});
        chatBox.value = "";
    }
}
function login(){
    let user = userBox.value.trim();
    let password = passwordBox.value;
    console.log(`Intentando iniciar sesion. user:${user}, password:${password}`);
    socket.emit("login", {user:user, password:password});
}
function register(){
    let user = userBox.value.trim();
    let password = passwordBox.value;
    console.log(`Intentando registrarse. user:${user}, password:${password}`)
    socket.emit("register", {user:user, password:password});
}
function blinkTitle(){
    let oldTitle = document.title;
    let msg = "Mensajes nuevos!";
    let timeoutId;
    const blink = () => { document.title = document.title == msg ? '!' : msg; };
    const clear = () => {
        clearInterval(timeoutId);
        document.title = oldTitle;
        window.onmouseover = null;
        timeoutId = null;
    };
    if (!timeoutId) {
        timeoutId = setInterval(blink, 1000);
        window.onmouseover = clear;
    }

};
loginDiv.addEventListener("keyup", (event) => {
    if (event.key == "Enter"){
        loginButton.click();
    }
})
roomSelector.addEventListener("keyup", (event) => {
    if (event.key == "Enter"){
        joinButton.click();
    }
})

addRoom.addEventListener("click", () => {
    socket.emit("create", {room:roomName.value, password:addPassword.value})
})
joinButton.addEventListener("click", () => {
    socket.emit("join", {room:selectedRoom.value, password:joinPassword.value});
})
chatBox.addEventListener("keyup", (event) => {
    if(event.key === "Enter") {
        sendMessage();
    }
})
sendButton.addEventListener("click", () => {
    sendMessage();
    chatBox.focus();
})
loginButton.addEventListener("click", login);
signupButton.addEventListener("click", register);

socket.on("sendLog", (data) => {
    console.log(data);
    let msgs = log.innerHTML;
    for (let message of data){
        msgs += `${message} <br>`;
    }
    log.innerHTML = msgs;
})
socket.on("message", (message) => {
    console.log(message);
    log.innerHTML += `${message} <br>`;
})
socket.on("login", () => {
    //document.getElementById("login").style.visibility = "hidden";
    document.getElementById("login").remove();
    roomSelector.style.visibility = "visible";
    roomCreate.style.visibility = "visible";
})
socket.on("join", () => {
    roomSelector.style.visibility = "hidden";
    roomCreate.style.visibility = "hidden";
    roomSelector.remove();
    roomCreate.remove();
    document.getElementById("chat").style.visibility = "visible";
})
socket.on("availableRooms", (data) => {
    for (let room of data){
        if (availableRooms.has(room)){
            continue;
        }
        availableRooms.add(room);
        if (room == "chat"){
            rooms.add(new Option("Chat global", room));
            continue;
        }
        rooms.add(new Option(room, room));
    }
})