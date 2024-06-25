import express from "express";
import assignmentRouter from "./routes/assignments.mjs";

const app = express();
const port = 4001;

app.use(express.json());
app.use("/assignments", assignmentRouter);

app.get("/test", (req, res) => {
  return res.json("Server API is working 🚀");
});

app.get("*", (req, res) => {
  res.status(400).send("Not found");
});

app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});
