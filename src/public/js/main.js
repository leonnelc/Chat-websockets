const socket = io();

document.title = "Chat";
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
const joinRoom = document.getElementById("joinRoom");
const selectedRoom = document.getElementById("rooms");
const roomSelector = document.getElementById("roomSelector");
const roomCreate = document.getElementById("roomCreate");
let log = document.getElementById("log");
let user = userBox.value.trim();

function sendMessage(){
    user = userBox.value.trim()
    if(chatBox.value.trim().length > 0 && user.length > 0){
        socket.emit("message", {user:user, message: chatBox.value});
        chatBox.value = "";
    }
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
addRoom.addEventListener("click", () => {
    socket.emit("create", {room:roomName.value, password:addPassword.value})
})
joinRoom.addEventListener("click", () => {
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
loginButton.addEventListener("click", () => {
    user = userBox.value.trim();
    let password = passwordBox.value;
    console.log(`Intentando iniciar sesion. user:${user}, password:${password}`);
    socket.emit("login", {user:user, password:password});
})
signupButton.addEventListener("click", () => {
    user = userBox.value.trim();
    let password = passwordBox.value;
    console.log(`Intentando registrarse. user:${user}, password:${password}`)
    socket.emit("register", {user:user, password:password});
})

socket.on("sendLog", (data) => {
    log = document.getElementById("log");
    console.log(data);
    let msgs = log.innerHTML;
    for (let message of data){
        msgs += `${message} <br>`;
    }
    log.innerHTML = msgs;
})
socket.on("message", (message) => {
    console.log(message);
    log = document.getElementById("log");
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