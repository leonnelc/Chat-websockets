const express = require("express");
const app = express();



const viewsRouter = require("./routes/views.router");

const PORT = 8080;

const exphbs = require("express-handlebars");


app.use(express.static("./src/public"));

app.engine("handlebars", exphbs.engine());
app.set("view engine", "handlebars");
app.set("views", "./src/views");

app.use("/", viewsRouter);



const httpServer = app.listen(PORT, () => {
    console.log(`Listening at: 192.168.0.58:${PORT}`);
})

const socketIO = require("./socket-io")(httpServer);