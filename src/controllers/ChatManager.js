const fs = require("fs");
const crypto = require("crypto");

class ChatManager{
    #filepath
    #rooms
    constructor(filepath){
        this.#filepath = filepath;
        this.#rooms = {};
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
        if (this.#rooms.hasOwnProperty(roomName)){
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