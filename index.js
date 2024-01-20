import express from "express";
import cors from "cors";
// db connect
import router from "./routes/insightRouter.js";


const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'html');
//Routes

app.use('/api', router);
const PORT = process.env.PORT || 8000;
app.listen(PORT, console.log("Server has started at port " + PORT))