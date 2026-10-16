import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Criteria } from '../src/criteria';
import Pagination from '../src/pagination';
import { CursorSerializer } from '../src/cursor-serializers/cursor-serializer.ts';

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
        kind: 'LogicExpression',
        left: {
          kind: 'ComparisonExpression',
          left: {
            kind: 'FieldExpression',
            value: 'username',
          },
          operator: '==',
          right: {
            kind: 'LiteralExpression',
            value: 'suanfansoon',
          },
        },
        operator: '&&',
        right: {
          kind: 'ComparisonExpression',
          left: {
            kind: 'FieldExpression',
            value: 'age',
          },
          operator: '>',
          right: {
            kind: 'LiteralExpression',
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
        kind: 'ComparisonExpression',
        left: {
          kind: 'FieldExpression',
          value: 'mood',
        },
        operator: '==',
        right: {
          kind: 'LiteralExpression',
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

    const criteriPlainObject = criteria.toObjectPlain();

    expect(criteria).toBeInstanceOf(Criteria);
    expect(criteriPlainObject).toStrictEqual({
      filterExpression: null,
      pagination: null,
      orderBy: [],
      limit: null,
    });
  });

  describe('Limit criteria', () => {
    it('should throw an error when limit is negative', () => {
      expect(() => Criteria.build({ limit: -1 })).toThrow(Error);
      expect(() => Criteria.build({ limit: -431 })).toThrow(Error);
      expect(() => Criteria.build({ limit: -3000000 })).toThrow(Error);
    });

    it('should throw an error when limit is Infinity', () => {
      expect(() => Criteria.build({ limit: Infinity })).toThrow(Error);
      expect(() => Criteria.build({ limit: -Infinity })).toThrow(Error);
    });

    it('should throw an error when limit is decimal', () => {
      expect(() => Criteria.build({ limit: 1003.32 })).toThrow(Error);
      expect(() => Criteria.build({ limit: 467.32 })).toThrow(Error);
      expect(() => Criteria.build({ limit: -1.32 })).toThrow(Error);
    });

    it('should throw an error when limit is zero', () => {
      expect(() => Criteria.build({ limit: 0 })).toThrow(Error);
    });

    it('should throw an error when limit is not a number', () => {
      expect(() => Criteria.build({ limit: 'hello!!' as any })).toThrow(Error);

      expect(() => Criteria.build({ limit: {} as any })).toThrow(Error);

      expect(() => Criteria.build({ limit: true as any })).toThrow(Error);
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

    it('should pass when limit is not provided but is set later', () => {
      const criteria = Criteria.build();

      criteria.limit = 23;

      expect(criteria.limit).toBe(23);

      criteria.limit = 100;

      expect(criteria.limit).toBe(100);

      criteria.limit = 1;

      expect(criteria.limit).toBe(1);
    });

    it('should throw an error when limit is set later with invalid values', () => {
      const criteria = Criteria.build();
      expect(() => {
        criteria.limit = 0;
      }).toThrow(Error);

      expect(() => {
        criteria.limit = 23.43;
      }).toThrow(Error);

      expect(() => {
        criteria.limit = -23;
      }).toThrow(Error);

      expect(() => {
        criteria.limit = Infinity;
      }).toThrow(Error);

      expect(() => {
        criteria.limit = -Infinity;
      }).toThrow(Error);

      expect(() => {
        criteria.limit = -34.5;
      }).toThrow(Error);
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
      expect(() => Criteria.build({ orderBy: '[[]]' as any })).toThrow(Error);
      expect(() => Criteria.build({ orderBy: 344 as any })).toThrow(Error);
      expect(() => Criteria.build({ orderBy: true as any })).toThrow(Error);
      expect(() => Criteria.build({ orderBy: false as any })).toThrow(Error);
      expect(() => Criteria.build({ orderBy: (() => {}) as any })).toThrow(
        Error,
      );
    });

    it('should throw an error when orderBy criterion is not an array', () => {
      expect(() => Criteria.build({ orderBy: ['[[]]'] as any })).toThrow(Error);
      expect(() => Criteria.build({ orderBy: [344, null] as any })).toThrow(
        Error,
      );
      expect(() => Criteria.build({ orderBy: [true] as any })).toThrow(Error);
      expect(() => Criteria.build({ orderBy: [false] as any })).toThrow(Error);
      expect(() => Criteria.build({ orderBy: [() => {}] as any })).toThrow(
        Error,
      );
    });

    it('should throw an error when criterion is an invalid tuple', () => {
      expect(() =>
        Criteria.build({ orderBy: [[null, 'DSec']] as any }),
      ).toThrow(Error);

      expect(() =>
        Criteria.build({ orderBy: [['null', null]] as any }),
      ).toThrow(Error);

      expect(() => Criteria.build({ orderBy: [[]] as any })).toThrow(Error);

      expect(() =>
        Criteria.build({
          orderBy: [
            ['field', 'DESC'],
            ['field', 'ASC'],
            ['field', 34],
          ] as any,
        }),
      ).toThrow(Error);

      expect(() =>
        Criteria.build({
          orderBy: [
            ['field', 'DESC'],
            ['field', 'ASC'],
            ['field', 'ASI'],
          ] as any,
        }),
      ).toThrow(Error);

      expect(() =>
        Criteria.build({
          orderBy: [['field', 'DESC'], ['field', 'ASC'], ['ASI']] as any,
        }),
      ).toThrow(Error);

      expect(() =>
        Criteria.build({
          orderBy: [['field', null, 'DESC', '2', true]] as any,
        }),
      ).toThrow(Error);

      expect(() =>
        Criteria.build({
          orderBy: [['field', 'ASC', 'DESC', '2', true]] as any,
        }),
      ).toThrow(Error);
    });

    it('should throw an error when field is not a valid string', () => {
      expect(() => Criteria.build({ orderBy: [[2, 'ASC']] as any })).toThrow(
        Error,
      );
      expect(() => Criteria.build({ orderBy: [[true, 'ASC']] as any })).toThrow(
        Error,
      );
      expect(() =>
        Criteria.build({ orderBy: [[false, 'ASC']] as any }),
      ).toThrow(Error);
      expect(() => Criteria.build({ orderBy: [[null, 'ASC']] as any })).toThrow(
        Error,
      );
      expect(() =>
        Criteria.build({ orderBy: [[() => {}, 'ASC']] as any }),
      ).toThrow(Error);
    });

    it('should pass when orderBy is set after instantiating criteria', () => {
      const criteria = Criteria.build();
      criteria.orderBy = [['field', 'ASC']];
      expect(criteria.orderBy).toStrictEqual([['field', 'ASC']]);
      criteria.orderBy = [['field2', 'DESC']];
      expect(criteria.orderBy).toStrictEqual([['field2', 'DESC']]);
      criteria.orderBy = [['field3', 'ASC']];
      expect(criteria.orderBy).toStrictEqual([['field3', 'ASC']]);

      expect(() => {
        criteria.orderBy = [null, ''] as any;
      }).toThrow(Error);

      expect(() => {
        criteria.orderBy = [1, 'deSc'] as any;
      }).toThrow(Error);
      expect(() => {
        criteria.orderBy = ['field', ''] as any;
      }).toThrow(Error);
      expect(() => {
        criteria.orderBy = ['field'] as any;
      }).toThrow(Error);
    });
  });

  describe('Pagination criteria', () => {
    const encode = jest.fn().mockReturnValue('.....');
    const decode = jest.fn();

    const mockCursorParser: CursorSerializer<any> = { encode, decode };

    beforeEach(() => {
      jest.clearAllMocks();
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

    it('should throw an error when limit is set to null while pagination is active', () => {
      const criteria = Criteria.build({
        pagination: Pagination.byPage(14),
        limit: 10,
      });
      expect(criteria.limit).toBe(10);
      expect(criteria.pagination).toBeInstanceOf(Pagination);
      expect(() => {
        criteria.limit = null;
      }).toThrow(Error);
    });

    it('should throw an error when reassigning pagination while limit is null', () => {
      const criteria = Criteria.build({
        pagination: Pagination.byPage(14),
        limit: 10,
      });
      expect(criteria.limit).toBe(10);
      expect(criteria.pagination).toBeInstanceOf(Pagination);
      criteria.pagination = null;
      criteria.limit = null;
      expect(() => {
        criteria.pagination = Pagination.byPage(23);
      }).toThrow(Error);
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
      ).toThrow(Error);
      expect(() =>
        Criteria.build({ pagination: Pagination.byPage(45) }),
      ).toThrow(Error);
    });

    it('should throw an error when invalid pagination is provided', () => {
      expect(() => Criteria.build({ pagination: 1 as any })).toThrow(Error);
      expect(() => Criteria.build({ pagination: 'pagination' as any })).toThrow(
        Error,
      );
      expect(() => Criteria.build({ pagination: true as any })).toThrow(Error);
      expect(() => Criteria.build({ pagination: false as any })).toThrow(Error);
    });
  });
});
