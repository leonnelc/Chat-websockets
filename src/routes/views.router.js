const express = require("express");
const router = express.Router();


router.get("/", (req, res) => {
    res.render("index", {title:"Chat en tiempo real"});
})

module.exports = router;