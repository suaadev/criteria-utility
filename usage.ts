import {
  CursorSerializer,
  Criteria,
  Pagination,
  PostgresSqlGenerator,
} from './src/index';

type User = {
  username: string;
  email: string;
  password: string;
  age: number;
  createdAt: string;
};

// The cursor is something like this, the cursor is builder in infrastructure layers like repositories implementations

const cursor: string = CursorSerializer.encode([
  ['createdAt', '2026-09-24 11:56:26.472 -0500', 'DESC'],
  ['username', 'ddavivss', 'ASC'],
  ['id', 10, 'DESC'],
]);

const criteria = Criteria.build<User>(
  {
    and: [
      { not: { age: { in: [1, 2, 3, 4] } } },
      { username: { equals: 'jazzz' } },
    ],
  },
  Pagination.byCursor(cursor),
  [
    ['id', 'ASC'],
    ['username', 'DESC'],
  ],
  15,
);

const sql = PostgresSqlGenerator.fromCriteria(criteria, 'us');

console.log(sql);
