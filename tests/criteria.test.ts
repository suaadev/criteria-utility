import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Criteria } from '../src/criteria';
import { CursorSerializer } from '../src/cursor-serializers/cursor-serializer';
import InvalidLimit from '../src/exceptions/invalid-limit';
import InvalidOrderBy from '../src/exceptions/invalid-orderby';
import InvalidPagination from '../src/exceptions/invalid-pagination';
import Pagination from '../src/pagination';

describe('Criteria', () => {
  it('should create a Criteria object', () => {
    const criteria: Criteria = Criteria.build({
      filter: {
        and: [{ username: { equals: 'suanfansoon' } }, { age: { gt: 25 } }],
      },
      pagination: Pagination.byPage(23),
      limit: 23,
    });

    const criteriPlainObject = criteria.toObjectPlain();

    expect(criteria).toBeInstanceOf(Criteria);
    expect(criteriPlainObject).toStrictEqual({
      filterExpression: {
        kind: 'LogicalNode',
        left: {
          kind: 'ComparisonNode',
          left: {
            kind: 'FieldNode',
            value: 'username',
          },
          operator: '==',
          right: {
            kind: 'LiteralNode',
            value: 'suanfansoon',
          },
        },
        operator: '&&',
        right: {
          kind: 'ComparisonNode',
          left: {
            kind: 'FieldNode',
            value: 'age',
          },
          operator: '>',
          right: {
            kind: 'LiteralNode',
            value: 25,
          },
        },
      },
      pagination: { page: 23, cursor: null },
      orderBy: [],
      limit: 23,
    });
  });

  it('should create a Criteria object with only expression filters', () => {
    const criteria: Criteria = Criteria.build({
      filter: {
        mood: { equals: 'push it to the limit !!' },
      },
    });

    const criteriPlainObject = criteria.toObjectPlain();

    expect(criteria).toBeInstanceOf(Criteria);
    expect(criteriPlainObject).toStrictEqual({
      filterExpression: {
        kind: 'ComparisonNode',
        left: {
          kind: 'FieldNode',
          value: 'mood',
        },
        operator: '==',
        right: {
          kind: 'LiteralNode',
          value: 'push it to the limit !!',
        },
      },
      pagination: null,
      orderBy: [],
      limit: null,
    });
  });

  it('should create a Criteria object without data', () => {
    const criteria: Criteria = Criteria.build();

    const criteriaPlainObject = criteria.toObjectPlain();

    expect(criteria).toBeInstanceOf(Criteria);
    expect(criteriaPlainObject).toStrictEqual({
      filterExpression: null,
      pagination: null,
      orderBy: [],
      limit: null,
    });
  });

  describe('Limit criteria', () => {
    it('should throw an error when limit is negative', () => {
      expect(() => Criteria.build({ limit: -1 })).toThrow(InvalidLimit);
      expect(() => Criteria.build({ limit: -431 })).toThrow(InvalidLimit);
      expect(() => Criteria.build({ limit: -3000000 })).toThrow(InvalidLimit);
    });

    it('should throw an error when limit is Infinity', () => {
      expect(() => Criteria.build({ limit: Infinity })).toThrow(InvalidLimit);
      expect(() => Criteria.build({ limit: -Infinity })).toThrow(InvalidLimit);
    });

    it('should throw an error when limit is decimal', () => {
      expect(() => Criteria.build({ limit: 1003.32 })).toThrow(InvalidLimit);
      expect(() => Criteria.build({ limit: 467.32 })).toThrow(InvalidLimit);
      expect(() => Criteria.build({ limit: -1.32 })).toThrow(InvalidLimit);
    });

    it('should throw an error when limit is zero', () => {
      expect(() => Criteria.build({ limit: 0 })).toThrow(InvalidLimit);
    });

    it('should throw an error when limit is not a number', () => {
      expect(() => Criteria.build({ limit: 'hello!!' as any })).toThrow(
        InvalidLimit,
      );

      expect(() => Criteria.build({ limit: {} as any })).toThrow(InvalidLimit);

      expect(() => Criteria.build({ limit: true as any })).toThrow(
        InvalidLimit,
      );
    });

    it('should pass when limit is an integer greater than or equal to 1', () => {
      expect(Criteria.build({ limit: 1 }).limit).toBe(1);
      expect(Criteria.build({ limit: 43 }).limit).toBe(43);
      expect(Criteria.build({ limit: 50 }).limit).toBe(50);
      expect(Criteria.build({ limit: 100 }).limit).toBe(100);
      expect(Criteria.build({ limit: 1200 }).limit).toBe(1200);
    });

    it('should pass when limit is null', () => {
      expect(Criteria.build({ limit: null }).limit).toBeNull();
    });
  });

  describe('OrderBy criteria', () => {
    it('should pass when empty array is provided', () => {
      const criteria = Criteria.build({ orderBy: [] });
      expect(criteria.orderBy).toStrictEqual([]);
    });

    it('should pass when array with valid tuples is provided', () => {
      expect(
        Criteria.build({ orderBy: [['name', 'DESC']] }).orderBy,
      ).toStrictEqual([['name', 'DESC']]);

      expect(
        Criteria.build({ orderBy: [['username', 'ASC']] }).orderBy,
      ).toStrictEqual([['username', 'ASC']]);

      expect(
        Criteria.build({
          orderBy: [
            ['age', 'DESC'],
            ['createdAt', 'ASC'],
          ],
        }).orderBy,
      ).toStrictEqual([
        ['age', 'DESC'],
        ['createdAt', 'ASC'],
      ]);
    });

    it('should throw an error when orderBy is not an array', () => {
      expect(() => Criteria.build({ orderBy: '[[]]' as any })).toThrow(
        InvalidOrderBy,
      );
      expect(() => Criteria.build({ orderBy: 344 as any })).toThrow(
        InvalidOrderBy,
      );
      expect(() => Criteria.build({ orderBy: true as any })).toThrow(
        InvalidOrderBy,
      );
      expect(() => Criteria.build({ orderBy: false as any })).toThrow(
        InvalidOrderBy,
      );
      expect(() => Criteria.build({ orderBy: (() => {}) as any })).toThrow(
        InvalidOrderBy,
      );
    });

    it('should throw an error when orderBy criterion is not an array', () => {
      expect(() => Criteria.build({ orderBy: ['[[]]'] as any })).toThrow(
        InvalidOrderBy,
      );
      expect(() => Criteria.build({ orderBy: [344, null] as any })).toThrow(
        InvalidOrderBy,
      );
      expect(() => Criteria.build({ orderBy: [true] as any })).toThrow(
        InvalidOrderBy,
      );
      expect(() => Criteria.build({ orderBy: [false] as any })).toThrow(
        InvalidOrderBy,
      );
      expect(() => Criteria.build({ orderBy: [() => {}] as any })).toThrow(
        InvalidOrderBy,
      );
    });

    it('should throw an error when criterion is an invalid tuple', () => {
      expect(() =>
        Criteria.build({ orderBy: [[null, 'DSec']] as any }),
      ).toThrow(InvalidOrderBy);

      expect(() =>
        Criteria.build({ orderBy: [['null', null]] as any }),
      ).toThrow(InvalidOrderBy);

      expect(() => Criteria.build({ orderBy: [[]] as any })).toThrow(
        InvalidOrderBy,
      );

      expect(() =>
        Criteria.build({
          orderBy: [
            ['field', 'DESC'],
            ['field', 'ASC'],
            ['field', 34],
          ] as any,
        }),
      ).toThrow(InvalidOrderBy);

      expect(() =>
        Criteria.build({
          orderBy: [
            ['field', 'DESC'],
            ['field', 'ASC'],
            ['field', 'ASI'],
          ] as any,
        }),
      ).toThrow(InvalidOrderBy);

      expect(() =>
        Criteria.build({
          orderBy: [['field', 'DESC'], ['field', 'ASC'], ['ASI']] as any,
        }),
      ).toThrow(InvalidOrderBy);

      expect(() =>
        Criteria.build({
          orderBy: [['field', null, 'DESC', '2', true]] as any,
        }),
      ).toThrow(InvalidOrderBy);

      expect(() =>
        Criteria.build({
          orderBy: [['field', 'ASC', 'DESC', '2', true]] as any,
        }),
      ).toThrow(InvalidOrderBy);
    });

    it('should throw an error when field is not a valid string', () => {
      expect(() => Criteria.build({ orderBy: [[2, 'ASC']] as any })).toThrow(
        InvalidOrderBy,
      );
      expect(() => Criteria.build({ orderBy: [[true, 'ASC']] as any })).toThrow(
        InvalidOrderBy,
      );
      expect(() =>
        Criteria.build({ orderBy: [[false, 'ASC']] as any }),
      ).toThrow(InvalidOrderBy);
      expect(() => Criteria.build({ orderBy: [[null, 'ASC']] as any })).toThrow(
        InvalidOrderBy,
      );
      expect(() =>
        Criteria.build({ orderBy: [[() => {}, 'ASC']] as any }),
      ).toThrow(InvalidOrderBy);
    });
  });

  describe('Pagination criteria', () => {
    const encode = vi.fn().mockReturnValue('.....');
    const decode = vi.fn();

    const mockCursorParser: CursorSerializer<any> = { encode, decode };

    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should pass when pagination and limit are provided', () => {
      const criteria = Criteria.build({
        pagination: Pagination.byPage(14),
        limit: 10,
      });

      expect(criteria.pagination).toBeInstanceOf(Pagination);
      expect(criteria.toObjectPlain()).toStrictEqual({
        filterExpression: null,
        pagination: { page: 14, cursor: null },
        orderBy: [],
        limit: 10,
      });
      expect(criteria.limit).toBe(10);
    });

    it('should pass when pagination (cursor) and limit are provided', () => {
      decode.mockImplementation((cursor: unknown) => [['id', 23, 'DESC']]);

      const criteria = Criteria.build({
        pagination: Pagination.byCursor('.....', mockCursorParser),
        limit: 100,
      });

      expect(criteria.pagination).toBeInstanceOf(Pagination);
      expect(criteria.toObjectPlain()).toStrictEqual({
        filterExpression: null,
        pagination: { page: null, cursor: [['id', 23, 'DESC']] },
        orderBy: [],
        limit: 100,
      });
      expect(criteria.limit).toBe(100);
    });

    it('should throw an error when pagination is provided without limit', () => {
      expect(() =>
        Criteria.build({ pagination: Pagination.byPage(34) }),
      ).toThrow(InvalidPagination);
      expect(() =>
        Criteria.build({ pagination: Pagination.byPage(45) }),
      ).toThrow(InvalidPagination);
    });

    it('should throw an error when invalid pagination is provided', () => {
      expect(() => Criteria.build({ pagination: 1 as any })).toThrow(
        InvalidPagination,
      );
      expect(() => Criteria.build({ pagination: 'pagination' as any })).toThrow(
        InvalidPagination,
      );
      expect(() => Criteria.build({ pagination: true as any })).toThrow(
        InvalidPagination,
      );
      expect(() => Criteria.build({ pagination: false as any })).toThrow(
        InvalidPagination,
      );
    });
  });
});
