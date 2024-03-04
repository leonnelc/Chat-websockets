const crypto = require("crypto");
const fs = require("fs");
class LoginManager{
    #filepath
    #hashes
    constructor(filepath){
        this.#filepath = filepath;
        this.#hashes = {test:{hash:"",level:"admin"}};
        this.#initialize();
    }
    #hasBlacklistedChars(username){
        const blacklisted = ['<','\\'];
        return blacklisted.some(char => username.includes(char));
    }
    login(username, password){
        if (!this.#hashes.hasOwnProperty(username)){
            console.log(`Username ${username} not found`);
            return {success:false, level: null, errmsg:"Usuario no registrado"};
        }
        const user = this.#hashes[username];
        const storedHash = user.hash;
        if (!this.#verifyPassword(password, storedHash)){
            return {success:false, level:null, errmsg:"Contraseña incorrecta"};
        }
        return {success:true, level:user.level, errmsg:""};
    }
    register(username, password, privilege){
        if (this.#hashes.hasOwnProperty(username)){
            return {success:false, errmsg:`${username} ya esta registrado`};
        }
        if (username.length < 4){
            return {success:false, errmsg:"El nombre de usuario es muy corto"};
        }
        if (this.#hasBlacklistedChars(username)){
            return {success:false, errmsg:"El nombre de usuario contiene caracteres no permitidos"};
        }
        this.#hashes[username] = {hash:this.#hash(password), level:privilege}
        this.#writeFile();
        return {success: true, errmsg:''};
    }
    #writeFile(){
        try {
            fs.writeFileSync(this.#filepath, JSON.stringify(this.#hashes))
        } catch (error) {
            console.log(`Error writing file ${error.message}`);
        }
    }
    #initialize(){
        if (!fs.existsSync(this.#filepath)){
            console.log(`Password db file ${this.#filepath} doesn't exist. It will be created.`);
            try {
                fs.writeFileSync(this.#filepath, JSON.stringify(this.#hashes));
            } catch (error) {
                console.log(`Error creating password db file ${error.message}`);
            } finally{
                return;
            }
        }
        try {
            const data = fs.readFileSync(this.#filepath, {encoding:"utf-8"});
            this.#hashes = JSON.parse(data);
        } catch (error) {
            console.log(`Error reading password db file, ${error.name}:${error.message}`);
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
}

module.exports = LoginManager;