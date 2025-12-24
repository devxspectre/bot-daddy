import express from "express";
import { PORT } from "./config";
import routes from "./routes";
import { initDatabase } from "./services";

import cors from "cors";
const app = express();

app.use(cors());
app.use(express.json());

app.get('/',(req,res)=>{
  return res.json({
    message:'Server running healthy'
  })
})

app.use('/api/v1/',routes)

initDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Bot api started on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to initialize database:", err);
    process.exit(1);
  });


export default app