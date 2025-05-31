import express from "express";
import "dotenv/config";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Hello World");
});

app.listen(process.env.PORT, () => {
    console.log(`Server is Running On The PORT ${process.env.PORT}`);
})