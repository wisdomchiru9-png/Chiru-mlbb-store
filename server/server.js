const express = require("express");
const cors = require("cors");

const orderRoutes = require("./routes/order");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req,res)=>{
    res.send("Chiru MLBB Store API running");
});

app.get("/health",(req,res)=>{
    res.json({status:"ok"});
});

app.use("/api",orderRoutes);

const PORT = process.env.PORT || 10000;

app.listen(PORT, ()=>{
    console.log(`Server running on port ${PORT}`);
});