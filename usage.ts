import {
  Criteria,
  CursorBase64Serializer,
  CursorSerializer,
  Pagination,
  PostgresSqlGenerator,
} from './src/index.js';
import { CursorPayload } from './src/pagination';

type Book = {
  id: number;
  name: string;
  author: string;
  rate: number;
  publicationDate: Date;
};

const cursorBase64Serializer: CursorSerializer<CursorPayload, string> =
  new CursorBase64Serializer();

const cursorInBase64: string = cursorBase64Serializer.encode([
  ['publicationDate', '1911-01-01', 'DESC'],
  ['name', 'test', 'ASC'],
  ['id', 10, 'DESC'],
]);

const criteria = Criteria.build<Book>({
  filter: {
    and: [{ rate: { gte: 4 } }, { publicationDate: { gte: '1911-01-01' } }],
  },
  pagination: Pagination.byCursor(cursorInBase64),
  orderBy: [
    ['publicationDate', 'DESC'],
    ['name', 'ASC'],
    ['id', 'DESC'],
  ],
  limit: 15,
});

const sql = PostgresSqlGenerator.fromCriteria(criteria, 'bk');

console.log(sql);
