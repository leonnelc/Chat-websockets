const fs = require("fs");
const crypto = require("crypto");
const sanitizeHtml = require("sanitize-html");

class ChatManager{
    #filepath
    #rooms
    #whitelist
    #maxMsgSize
    constructor(filepath){
        this.#filepath = filepath;
        this.#rooms = {};
        this.#initialize;
        this.#maxMsgSize = 256;
    }
    sanitize(data){
        let message = data.message;
        let username = data.user;
        message = message.slice(0, this.#maxMsgSize);
        message = sanitizeHtml(message, {
            allowedTags: ['b', 'i', 'img', 'span'],
            allowedAttributes: {
              img: ['src'],
              span: ['color']
            }
          });
        message = `<span class="username">${username}</span>: <span class="message">${message}</span>`;
        return message;
    }
    #saveData(){

    }
    #initialize(){
        if (!fs.existsSync(this.#filepath)){
            console.log(`${this.#filepath} doesn't exist, creating it...`);
            fs.writeFileSync(this.#filepath, JSON.stringify(this.#rooms));
            return;
        }
        
    }
    #hash(password){
        const hash = crypto.createHash('sha256').update(password).digest('hex');
        return hash;
    }
    #verifyPassword(password, storedHash){
        const inputHash = this.#hash(password);
        return inputHash === storedHash;
    }
    addRoom(roomName, password){
        roomName = roomName.toLowerCase();
        if (roomName.length < 4){
            return {success:false, errmsg:"El nombre de la sala debe tener almenos 4 caracteres"};
        }
        if (this.#rooms.hasOwnProperty(roomName) || roomName == "lobby"){
            return {success:false, errmsg:"La sala ya existe"};
        }
        this.#rooms[roomName] = {hash: this.#hash(password), description:"", log:[]};
        return {success:true, errmsg:""};
    }
    logMessage(room, message){
        room = room.toLowerCase();
        if (!this.#rooms.hasOwnProperty(room)){
            return {success:false, errmsg:"La sala no existe"};
        }
        let roomObj = this.#rooms[room];
        if (roomObj.log.length > 30){
            roomObj.log.splice(0, roomObj.log.length - 30);
        }
        roomObj.log.push(message);
        return {success:true, errmsg:""};
    }
    getLog(room){
        room = room.toLowerCase();
        if (!this.#rooms.hasOwnProperty(room)){
            return {success:false, errmsg:"La sala no existe", log:null};
        }
        return {success:true, errmsg:"", log:this.#rooms[room].log}
    }
    login(room, password){
        room = room.toLowerCase();
        if (!this.#rooms.hasOwnProperty(room)){
            return {success:false, errmsg:"La sala no existe", room:null};
        }
        if (!this.#verifyPassword(password, this.#rooms[room].hash)){
            return {success:false, errmsg:"Contraseña incorrecta"};
        }
        return {success:true, errmsg:""};
    }
    getRooms(){
        return Object.keys(this.#rooms);
    }


}

module.exports = ChatManager;