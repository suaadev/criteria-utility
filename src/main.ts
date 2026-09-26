import { Criteria } from "./criteria";
import { ExpressionRaw } from "./filter/basic-grammar";
import { CursorSerializer } from "./generators/cursor-serializer";
import { PostgresSqlGenerator } from "./generators/postgres-sql.generator";
import { Pagination } from "./pagination/pagination";

const exp: ExpressionRaw = {
  and: [
    {
      or: [
        { equals: ["$username", "pepito"] },
        { not: { equals: ["$email", "pepito@example.com"] } },
        false,
        { in: ["$id", [23, 3, 3, 3]] },
      ],
    },
    { gt: ["$age", 18] },
  ],
};

// The cursor is something like this, the cursor is builder in infrastructure layers like repositories implementations

const cursor: string = CursorSerializer.encode(
  {
    id: 10,
    name: "ddavivss",
    createdAt: "2026-09-24 11:56:26.472 -0500",
  },
  ["createdAt", "id"],
  "ASC",
);

const criteria = Criteria.build(
  exp,
  Pagination.byCursor(cursor),
  [
    ["id", "ASC"],
    ["name", "DESC"],
  ],
  15,
);

const sql = PostgresSqlGenerator.fromCriteria(criteria, "us");

console.log(sql);
