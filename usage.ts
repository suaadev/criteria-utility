import {
  CursorSerializer,
  Criteria,
  Pagination,
  PostgresSqlGenerator,
} from './src/index';

type Book = {
  id: number;
  name: string;
  author: string;
  rate: number;
  publicationDate: Date;
};

const criteria = Criteria.build<Book>(
  {
    and: [{ rate: { gte: 4 } }, { publicationDate: { gte: '1911-01-01' } }],
  },
  Pagination.byPage(22),
  [
    ['publicationDate', 'DESC'],
    ['name', 'ASC'],
  ],
  15,
);

const sql = PostgresSqlGenerator.fromCriteria(criteria, 'bk');

console.log(sql);
