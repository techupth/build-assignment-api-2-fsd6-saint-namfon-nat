import express from "express";
import connectionPool from "./utils/db.mjs";

const app = express();
const port = 4001;

app.use(express.json());

app.get("/assignments", (req, res) => {
  return res.json("Server API is working 🚀");
});

app.post("/assignments", async (req, res) => {
  const newAssignment = {
    ...req.body,
    create_at: new Date(),
    updated_at: new Date(),
    published_at: new Date(),
    status: "publish",
    length: "short",
  };

  if (
    !newAssignment.title ||
    !newAssignment.content ||
    !newAssignment.category
  ) {
    return res.status(400).json({
      message:
        "Server could not create assignment because there are missing data from client",
    });
  }
  try {
    await connectionPool.query(
      `
      INSERT INTO assignments (user_id, title, content, category, length, status, created_at, updated_at, published_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `,
      [
        1,
        newAssignment.title,
        newAssignment.content,
        newAssignment.category,
        newAssignment.length,
        newAssignment.status,
        newAssignment.create_at,
        newAssignment.updated_at,
        newAssignment.published_at,
      ]
    );

    return res.status(201).json({
      message: "Created assignment sucessfully",
    });
  } catch {
    return res.status(500).json({
      message: "Server could not create assignment because database connection",
    });
  }
});

app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});

// const required = ["title", "content", "category"];
//   for (const field of required) {
//     if (!newAssignment[field]) {
//       return res.status(400).json({
//         message: `Server could not create assignment because there are missing data from client: ${field} is required`,
//       });
//     }
//   }
