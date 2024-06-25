// Create PostgreSQL Connection Pool here !
import * as pg from "pg";
import "dotenv/config";
const { Pool } = pg.default;

// https://gist.github.com/napatwongchr/fc766feb7ad8cd0c9896974fc8cd6571

const connectionPool = new Pool({
  user: `${process.env.DB_USERNAME}`,
  host: "localhost",
  database: "techup_Build-Creating-Data-API-Assignment",
  password: `${process.env.DB_PASSWORD}`,
  port: 5432,
});

export default connectionPool;
