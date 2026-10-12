import { CursorSerializer } from './src/cursor-serializers/cursor-serializer';
import {
  Criteria,
  CursorBase64Serializer,
  Pagination,
  PostgresSqlGenerator,
} from './src/index';
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

const criteria = Criteria.build<Book>(
  {
    and: [{ rate: { gte: 4 } }, { publicationDate: { gte: '1911-01-01' } }],
  },
  Pagination.byCursor(cursorInBase64),
  [
    ['publicationDate', 'DESC'],
    ['name', 'ASC'],
    ['id', 'DESC'],
  ],
  15,
);

const sql = PostgresSqlGenerator.fromCriteria(criteria, 'bk');

console.log(sql);
