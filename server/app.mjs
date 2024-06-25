import express from "express";
import connectionPool from "./utils/db.mjs";
import "dotenv/config";

const app = express();
const port = 4001;

app.use(express.json());

// POST
app.post("/assignments", async (req, res) => {
  const newAssignment = {
    ...req.body,
    status: "publish",
    length: "long",
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
      INSERT INTO assignments (user_id, title, content, category, length, status)
      VALUES ($1, $2, $3, $4, $5, $6)
    `,
      [
        1,
        newAssignment.title,
        newAssignment.content,
        newAssignment.category,
        newAssignment.length,
        newAssignment.status,
      ]
    );

    return res.status(201).json({
      message: "Created assignment successfully",
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      message:
        "Server could not create assignment because of a database connection error",
    });
  }
});

// GET ALL
// app.get("/assignments", async (req, res) => {
//   try {
//     const results = await connectionPool.query(`SELECT * FROM assignments`);
//     return res.status(200).json({
//       data: results.rows,
//     });
//   } catch (error) {
//     console.error(error.message);
//     return res.status(500).json({
//       message:
//         "Server could not read assignments because of a database connection error",
//     });
//   }
// });

// GET ID
app.get("/assignments/:assignmentId", async (req, res) => {
  const assignmentIdFromClient = req.params.assignmentId;

  try {
    const results = await connectionPool.query(
      `SELECT * FROM assignments WHERE assignment_id = $1`,
      [assignmentIdFromClient]
    );

    if (!results.rows[0]) {
      return res.status(404).json({
        message: `Server could not find the requested assignment (assignment id: ${assignmentIdFromClient})`,
      });
    }

    return res.status(200).json({
      data: results.rows[0],
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      message:
        "Server could not read assignment because of a database connection error",
    });
  }
});

//GET QUERY
app.get("/assignments", async (req, res) => {
  let results;

  const category = req.query.category;
  const length = req.query.length;

  try {
    results = await connectionPool.query(
      `
    select * from assignments
    where
     ( category = $1 or $1 is null or $1 = '')
     and
     ( length = $2 or $2 is null or $2 = '')
    `,
      [category, length]
    );
  } catch {
    return res.status(500).json({
      message: "Server could not read database bacause database issue",
    });
  }

  return res.status(200).json({
    data: results.rows,
  });
});

// DELETE
app.delete("/assignments/:assignmentId", async (req, res) => {
  const assignmentsIdFromClient = req.params.assignmentId;

  try {
    await connectionPool.query(
      `DELETE FROM assignments WHERE assignment_id = $1`,
      [assignmentsIdFromClient]
    );
    return res.status(200).json({
      message: "Deleted assignment successfully",
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      message:
        "Server could not delete assignment because of a database connection error",
    });
  }
});

// UPDATE
app.put("/assignments/:assignmentId", async (req, res) => {
  const assignmentIdFromClients = req.params.assignmentId;
  const updatedAssignment = { ...req.body, updated_at: new Date() };

  try {
    await connectionPool.query(
      `
    UPDATE assignments
    SET title = $2,
        content = $3,
        category = $4,
        updated_at = $5
    WHERE assignment_id = $1
    `,
      [
        assignmentIdFromClients,
        updatedAssignment.title,
        updatedAssignment.content,
        updatedAssignment.category,
        updatedAssignment.updated_at,
      ]
    );

    return res.status(200).json({
      message: "Updated assignment successfully",
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      message:
        "Server could not update assignment because of a database connection error",
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
