import { Router } from "express";
import connectionPool from "../utils/db.mjs";

const assignmentRouter = Router();

// CREATE
assignmentRouter.post("/", async (req, res) => {
  try {
    const { title, content, category } = req.body;

    if (!title || !content || !category) {
      return res.status(400).json({
        message:
          "Server could not create assignment because there are missing data from client",
      });
    }

    const newAssignemnt = { title, content, category };

    await connectionPool.query(
      `
        INSERT INTO assignments (title, content, category)
        VALUES ($1, $2, $3)
        `,
      [newAssignemnt.title, newAssignemnt.content, newAssignemnt.category]
    );

    return res.status(201).json({
      message: "created assignemnt successfully",
    });
  } catch (error) {
    console.error("error:", error);
    return res.status(500).json({
      message:
        "Server could not create assignment because database connection.",
    });
  }
});

// READ
assignmentRouter.get("/", async (req, res) => {
  const title = req.query.title ? `%${req.query.title}%` : null;
  const content = req.query.content ? `%${req.query.content}%` : null;
  const category = req.query.category ? `%${req.query.category}%` : null;

  try {
    const result = await connectionPool.query(
      `
            SELECT *
            FROM assignments
            WHERE   (title ILIKE $1 OR $1 IS NULL) AND
                    (content ILIKE $2 OR $2 IS NULL) AND
                    (category ILIKE $3 OR $3 IS NULL)
            `,
      [title, content, category]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: `no posts found`,
      });
    }

    return res.json({
      data: result.rows,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server could not fetch the assignment due to a database issue",
    });
  }
});

assignmentRouter.get("/:assignmentId", async (req, res) => {
  const assignmentIdFromClient = req.params.assignmentId;

  try {
    const result = await connectionPool.query(
      `
            SELECT *
            FROM assignments
            WHERE assignment_id=$1
            `,
      [assignmentIdFromClient]
    );

    if (!result.rows[0]) {
      return res.status(404).json({
        message: `Server could not find a requested assignment ${assignmentIdFromClient}`,
      });
    }
    return res.status(200).json({
      data: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server could not create assignemnt because database connection",
    });
  }
});

// UPDATE
assignmentRouter.put("/:assignmentId", async (req, res) => {
  try {
    const assignmentIdFromClient = req.params.assignmentId;
    const { title, content, category } = req.body;

    if (!title || !content || !category) {
      return res.status(400).json({
        message:
          "server could not update assignment because there are missing data from client",
      });
    }

    const updatedAssignement = {
      title,
      content,
      category,
    };

    await connectionPool.query(
      `
    UPDATE assignments
    SET title = $2,
        content = $3,
        category = $4
    WHERE assignment_id = $1
    `,
      [
        assignmentIdFromClient,
        updatedAssignement.title,
        updatedAssignement.content,
        updatedAssignement.category,
      ]
    );

    return res.status(200).json({
      message: "updated assignment successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "server could not not update assignment because database issue",
    });
  }
});

assignmentRouter.patch("/:assignmentId", async (req, res) => {
  try {
    const assignmentIdFromClient = req.params.assignmentId;
    const { title, content, category } = req.body;

    const fieldsToUpdate = [];
    const valuesToUpdate = [];

    if (title !== undefined) {
      fieldsToUpdate.push("title");
      valuesToUpdate.push(title);
    }

    if (content !== undefined) {
      fieldsToUpdate.push("content");
      valuesToUpdate.push(content);
    }

    if (category !== undefined) {
      fieldsToUpdate.push("category");
      valuesToUpdate.push(category);
    }

    if (fieldsToUpdate.length === 0) {
      return res.status(400).json({
        message: "No fields to update",
      });
    }

    const setClause = fieldsToUpdate
      .map(
        (field, index) =>
          `
    ${field} = $${index + 2}
    `
      )
      .join(", ");

    const query = `
    UPDATE assignments
    SET ${setClause}
    WHERE assignment_id = $1
    `;

    const result = await connectionPool.query(query, [
      assignmentIdFromClient,
      ...valuesToUpdate,
    ]);

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "assignment not found",
      });
    }

    return res.status(200).json({
      message: "Assignment updated successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "server could not patch assignment because database issue",
    });
  }
});

// DELETE
assignmentRouter.delete("/:assignmentId", async (req, res) => {
  try {
    const assignmentIdFromClient = req.params.assignmentId;

    const result = await connectionPool.query(
      `
        DELETE FROM assignments
        WHERE assignment_id=$1
        `,
      [assignmentIdFromClient]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({
        messagae: `server could not find a requested assignment ${assignmentIdFromClient}`,
      });
    }
    return res.status(200).json({
      message: "Delete assignment successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "server could not delete assignment because database issue",
    });
  }
});

export default assignmentRouter;
