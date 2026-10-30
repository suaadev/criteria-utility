import * as FilterParser from '../src/filter/filter-parser';
import { Expression } from '../src/filter/grammar';
import InvalidExpression from '../src/exceptions/invalid-expression';
import { describe, expect, it } from 'vitest';

describe('FilterParser', () => {
  describe('general expressions', () => {
    it('should parse valid logical and comparison expressions', () => {
      const parserResult = FilterParser.parse({
        and: [{ username: { diff: 'jazzz' } }, { age: { lte: '$parentAage' } }],
      });

      expect(parserResult).toMatchObject({
        kind: 'LogicalNode',
        left: {
          kind: 'ComparisonNode',
          left: { kind: 'FieldNode', value: 'username' },
          operator: '!=',
          right: { kind: 'LiteralNode', value: 'jazzz' },
        },
        operator: '&&',
        right: {
          kind: 'ComparisonNode',
          left: { kind: 'FieldNode', value: 'age' },
          operator: '<=',
          right: { kind: 'FieldNode', value: 'parentAage' },
        },
      });
    });

    it('should throw InvalidExpression when input object contains an invalid key', () => {
      const badExpression = {
        wrongKey: [1, 2],
      };
      expect(() => FilterParser.parse(badExpression as any)).toThrow(
        InvalidExpression,
      );
    });
  });

  describe('Literal expressions', () => {
    it('should parse a valid LiteralExpression', () => {
      expect(FilterParser.parse(null)).toMatchObject({
        kind: 'LiteralNode',
        value: null,
      });
      expect(FilterParser.parse(123)).toMatchObject({
        kind: 'LiteralNode',
        value: 123,
      });

      expect(FilterParser.parse(true)).toMatchObject({
        kind: 'LiteralNode',
        value: true,
      });
      expect(FilterParser.parse(false)).toMatchObject({
        kind: 'LiteralNode',
        value: false,
      });
      expect(FilterParser.parse("somebody's watching me")).toMatchObject({
        kind: 'LiteralNode',
        value: "somebody's watching me",
      });
    });
  });

  describe('Array expressions', () => {
    it('should parse a valid ArrayExpression', () => {
      expect(
        FilterParser.parse([1, 2, 3, 4, '5', '$nextNumber']),
      ).toMatchObject({
        kind: 'ArrayNode',
        items: [
          { kind: 'LiteralNode', value: 1 },
          { kind: 'LiteralNode', value: 2 },
          { kind: 'LiteralNode', value: 3 },
          { kind: 'LiteralNode', value: 4 },
          { kind: 'LiteralNode', value: '5' },
          { kind: 'FieldNode', value: 'nextNumber' },
        ],
      });
      expect(FilterParser.parse([-1, true])).toMatchObject({
        kind: 'ArrayNode',
        items: [
          { kind: 'LiteralNode', value: -1 },
          { kind: 'LiteralNode', value: true },
        ],
      });
    });

    it('should throw InvalidExpression', () => {
      expect(() => FilterParser.parse([() => {}, () => {}] as any)).toThrow(
        InvalidExpression,
      );

      expect(() => FilterParser.parse([{}] as any)).toThrow(InvalidExpression);

      expect(() => FilterParser.parse([undefined, undefined] as any)).toThrow(
        InvalidExpression,
      );

      expect(() => FilterParser.parse([new Date()] as any)).toThrow(
        InvalidExpression,
      );

      expect(() =>
        FilterParser.parse([{ name: { equals: 'David' } }] as any),
      ).toThrow(InvalidExpression);
      expect(() =>
        FilterParser.parse([{ not: { x: { equals: 2 } } }] as any),
      ).toThrow(InvalidExpression);

      expect(() =>
        FilterParser.parse([
          { not: { y: { gt: 2 } } },
          { a: { in: [1, 3, 4, 5] } },
        ] as any),
      ).toThrow(InvalidExpression);
    });
  });

  describe('logical expressions (and / or)', () => {
    it('should throw InvalidExpression when logical array is empty', () => {
      const badExpression = {
        and: [],
      };
      expect(() => FilterParser.parse(badExpression)).toThrow(
        InvalidExpression,
      );
    });

    it('should throw InvalidExpression when logical array has fewer than two elements', () => {
      const badExpression = {
        not: {
          or: [true],
        },
      };
      expect(() => FilterParser.parse(badExpression as any)).toThrow(
        InvalidExpression,
      );
    });

    it('should throw InvalidExpression when logical array contains an empty object', () => {
      const badExpression = {
        and: [{}, 1],
      };
      expect(() => FilterParser.parse(badExpression as any)).toThrow(
        InvalidExpression,
      );
    });

    it('should throw InvalidExpression when logical operand is an object instead of array', () => {
      const badExpression = {
        and: {},
      };
      expect(() => FilterParser.parse(badExpression as any)).toThrow(
        InvalidExpression,
      );
    });

    it('should throw InvalidExpression when logical operand is null', () => {
      const badExpression = {
        and: null,
      };
      expect(() => FilterParser.parse(badExpression as any)).toThrow(
        InvalidExpression,
      );
    });

    it('should parse an or expression with multiple conditions', () => {
      const expression: Expression = {
        or: [
          { role: { equals: 'admin' } },
          { role: { equals: 'editor' } },
          { role: { equals: 'viewer' } },
        ],
      };

      const result = FilterParser.parse(expression);

      expect(result).toMatchObject({
        kind: 'LogicalNode',
        operator: '||',
        left: {
          kind: 'LogicalNode',
          operator: '||',
          left: {
            kind: 'ComparisonNode',
            left: { kind: 'FieldNode', value: 'role' },
            operator: '==',
            right: { kind: 'LiteralNode', value: 'admin' },
          },
          right: {
            kind: 'ComparisonNode',
            left: { kind: 'FieldNode', value: 'role' },
            operator: '==',
            right: { kind: 'LiteralNode', value: 'editor' },
          },
        },
        right: {
          kind: 'ComparisonNode',
          left: { kind: 'FieldNode', value: 'role' },
          operator: '==',
          right: { kind: 'LiteralNode', value: 'viewer' },
        },
      });
    });
  });

  describe('comparison expressions', () => {
    it('should throw InvalidExpression when comparison operand is an empty object', () => {
      const badExpression = {
        dog: { equals: {} },
      };
      expect(() => FilterParser.parse(badExpression as any)).toThrow(
        InvalidExpression,
      );
    });

    it('should parse an equals expression with an array operand', () => {
      expect(
        FilterParser.parse({
          phoneNumbers: { equals: ['+56 30000000', '+51 70000000'] },
        }),
      ).toMatchObject({
        kind: 'ComparisonNode',
        left: {
          kind: 'FieldNode',
          value: 'phoneNumbers',
        },
        right: {
          kind: 'ArrayNode',
        },
      });
    });

    it('should parse an equals expression with a literal operand', () => {
      const badExpression = {
        genere: { equals: 'techno' },
      };
      expect(FilterParser.parse(badExpression)).toMatchObject({
        kind: 'ComparisonNode',
        left: {
          kind: 'FieldNode',
        },
        right: {
          kind: 'LiteralNode',
        },
      });
    });

    it('should throw InvalidExpression when a field contains more than one operator', () => {
      const badExpression = {
        age: { gt: 10, lt: 20 },
      };
      expect(() => FilterParser.parse(badExpression as any)).toThrow(
        InvalidExpression,
      );
    });

    it('should throw InvalidExpression when greater or less operator is boolean', () => {
      const badExpression = {
        score: { gt: true },
      };
      expect(() => FilterParser.parse(badExpression as any)).toThrow(
        InvalidExpression,
      );
    });

    it('should throw InvalidExpression when lt operator is an empty object', () => {
      const badExpression = {
        some: { lt: {} },
      };
      expect(() => FilterParser.parse(badExpression as any)).toThrow(
        InvalidExpression,
      );
    });

    it('should throw InvalidExpression when gt operator is a function', () => {
      const badExpression = {
        1: { gt: () => {} },
      };
      expect(() => FilterParser.parse(badExpression as any)).toThrow(
        InvalidExpression,
      );
    });

    it('should throw InvalidExpression when gt operator is an empty object', () => {
      const badExpression = {
        username: {
          gt: {},
        },
      };
      expect(() => FilterParser.parse(badExpression as any)).toThrow(
        InvalidExpression,
      );
    });

    it('should throw InvalidExpression when comparison operands contain invalid types', () => {
      const badExpression = {
        cat: { diff: [() => {}, undefined] },
      };

      expect(() => FilterParser.parse(badExpression as any)).toThrow(
        InvalidExpression,
      );
    });

    it('should parse a comparison between two fields', () => {
      const result = FilterParser.parse({
        startDate: { lte: '$endDate' },
      });

      expect(result).toMatchObject({
        kind: 'ComparisonNode',
        left: { kind: 'FieldNode', value: 'startDate' },
        operator: '<=',
        right: { kind: 'FieldNode', value: 'endDate' },
      });
    });

    it('should parse a comparison with greater than or equal operator', () => {
      const result = FilterParser.parse({
        rate: { gte: 23 },
      });

      expect(result).toMatchObject({
        kind: 'ComparisonNode',
        left: { kind: 'FieldNode', value: 'rate' },
        operator: '>=',
        right: { kind: 'LiteralNode', value: 23 },
      });
    });

    it('should parse a comparison with less than or equal operator', () => {
      const result = FilterParser.parse({
        name: { lte: 'another day in paradise' },
      });

      expect(result).toMatchObject({
        kind: 'ComparisonNode',
        left: { kind: 'FieldNode', value: 'name' },
        operator: '<=',
        right: { kind: 'LiteralNode', value: 'another day in paradise' },
      });
    });

    it('should throw InvalidExpression when an invalid operator is provided', () => {
      const badExpression = {
        age: { badOperator: {} },
      };
      expect(() => FilterParser.parse(badExpression as any)).toThrow(
        InvalidExpression,
      );
    });
  });

  describe('not expressions', () => {
    it('should throw InvalidExpression when not expression is an empty object', () => {
      const badExpression = {
        not: {},
      };
      expect(() => FilterParser.parse(badExpression)).toThrow(
        InvalidExpression,
      );
    });

    it('should throw InvalidExpression when not expression is a function', () => {
      const badExpression = {
        not: () => {},
      };
      expect(() => FilterParser.parse(badExpression as any)).toThrow(
        InvalidExpression,
      );
    });

    it('should throw InvalidExpression when not expression is true', () => {
      const badExpression = {
        not: true,
      };
      expect(() => FilterParser.parse(badExpression as any)).toThrow(
        InvalidExpression,
      );
    });

    it('should throw InvalidExpression when not expression is 1', () => {
      const badExpression = {
        not: 1,
      };
      expect(() => FilterParser.parse(badExpression as any)).toThrow(
        InvalidExpression,
      );
    });

    it('should throw InvalidExpression when not expression is array', () => {
      const badExpression = {
        not: [1, 2, '3', '5', true, 'turing'],
      };
      expect(() => FilterParser.parse(badExpression as any)).toThrow(
        InvalidExpression,
      );
    });

    it('should throw InvalidExpression when not expression is undefined', () => {
      const badExpression = {
        not: undefined,
      };
      expect(() => FilterParser.parse(badExpression as any)).toThrow(
        InvalidExpression,
      );
    });

    it('should throw InvalidExpression when not expression is null', () => {
      const badExpression = {
        not: null,
      };
      expect(() => FilterParser.parse(badExpression as any)).toThrow(
        InvalidExpression,
      );
    });

    it('should parse a valid not expression wrapping a comparison', () => {
      const expression: Expression = {
        not: { status: { equals: 'inactive' } },
      };

      const result = FilterParser.parse(expression);

      expect(result).toMatchObject({
        kind: 'NotNode',
        expression: {
          kind: 'ComparisonNode',
          left: { kind: 'FieldNode', value: 'status' },
          operator: '==',
          right: { kind: 'LiteralNode', value: 'inactive' },
        },
      });
    });

    it('should parse a valid not expression wrapping a between expression', () => {
      const expression: Expression = {
        not: { limit: { between: [0, 100] } },
      };

      const result = FilterParser.parse(expression);

      expect(result).toMatchObject({
        kind: 'NotNode',
        expression: {
          kind: 'BetweenNode',
          value: { kind: 'FieldNode', value: 'limit' },
          start: { kind: 'LiteralNode', value: 0 },
          end: { kind: 'LiteralNode', value: 100 },
        },
      });
    });
  });

  describe('in expressions', () => {
    it('should throw InvalidExpression when in array is empty', () => {
      const badExpression = {
        role: { in: [] },
      };
      expect(() => FilterParser.parse(badExpression as any)).toThrow(
        InvalidExpression,
      );
    });

    it('should throw InvalidExpression when in operand contains invalid values', () => {
      const badExpression = {
        in: [() => {}, null],
      };
      expect(() => FilterParser.parse(badExpression as any)).toThrow(
        InvalidExpression,
      );
    });

    it('should throw InvalidExpression when in array contains complex expressions', () => {
      const badExpression = {
        role: { in: [{ and: [true, true] }] },
      };
      expect(() => FilterParser.parse(badExpression as any)).toThrow(
        InvalidExpression,
      );
    });

    it('should throw InvalidExpression when in target is an invalid expression', () => {
      const badExpression = {
        in: [{ and: [true, true] }, [1, 2]],
      };

      expect(() => FilterParser.parse(badExpression as any)).toThrow(
        InvalidExpression,
      );
    });

    it('should throw InvalidExpression when in array contains an invalid nested element', () => {
      const badExpression = {
        some: { in: [1, [1, 2, 1, 1, {}]] },
      };

      expect(() => FilterParser.parse(badExpression as any)).toThrow(
        InvalidExpression,
      );
    });

    it('should throw InvalidExpression when in array contains invalid expressions', () => {
      const badExpression = {
        some: { in: [() => {}, { user: 'daaa' }] },
      };

      expect(() => FilterParser.parse(badExpression as any)).toThrow(
        InvalidExpression,
      );
    });

    it('should parse a valid in expression with a field and literal list', () => {
      const expression: Expression = {
        cat: { in: ['dog', 'cat'] },
      };

      const resultParse = FilterParser.parse(expression);
      expect(resultParse).toMatchObject({
        kind: 'InNode',
        value: {
          kind: 'FieldNode',
          value: 'cat',
        },
      });
    });

    it('should parse a valid in expression containing nested array and field expressions', () => {
      const expression: Expression = {
        cat: { in: ['dog', '$animal', ['$dog', ['duck']]] },
      };

      const resultParse = FilterParser.parse(expression);
      expect(resultParse).toMatchObject({
        kind: 'InNode',
        value: {
          kind: 'FieldNode',
          value: 'cat',
        },
        arrayExpression: {
          kind: 'ArrayNode',
          items: [
            { kind: 'LiteralNode', value: 'dog' },
            { kind: 'FieldNode', value: 'animal' },
            {
              kind: 'ArrayNode',
              items: [
                { kind: 'FieldNode', value: 'dog' },
                {
                  kind: 'ArrayNode',
                  items: [
                    {
                      kind: 'LiteralNode',
                      value: 'duck',
                    },
                  ],
                },
              ],
            },
          ],
        },
      });
    });
  });

  describe('field identifier expressions', () => {
    it('should parse a field identifier as the target of an in operator', () => {
      const expression: Expression = {
        cat: { in: ['dog', 'cat'] },
      };

      const resultParse = FilterParser.parse(expression);
      expect(resultParse).toMatchObject({
        kind: 'InNode',
        value: {
          kind: 'FieldNode',
          value: 'cat',
        },
      });
    });

    it('should parse a valid field reference matching identifier regex', () => {
      const expression: Expression = {
        t3s_t: { equals: '$_sd_a_3_4' },
      };
      const resultParse = FilterParser.parse(expression);

      expect(resultParse).toMatchObject({
        kind: 'ComparisonNode',
      });
    });

    it('should parse a direct value', () => {
      const resultParse = FilterParser.parse('$username');
      expect(resultParse).toMatchObject({
        kind: 'FieldNode',
        value: 'username',
      });
    });

    it('should parse a valid field name matching identifier regex', () => {
      const expression: Expression = {
        _3st: { equals: 'clean_code' },
      };
      const resultParse = FilterParser.parse(expression);

      expect(resultParse).toMatchObject({
        kind: 'ComparisonNode',
      });
    });

    it('should throw InvalidExpression when field reference is only a dollar sign', () => {
      const expression: Expression = {
        indira_: { equals: '$' },
      };

      expect(() => FilterParser.parse(expression)).toThrow(InvalidExpression);
    });

    it('should throw InvalidExpression when field starts with dollar sign', () => {
      const expression: Expression = {
        '$%4f_': { equals: 'wtf' },
      };

      expect(() => FilterParser.parse(expression)).toThrow(InvalidExpression);
    });

    it('should throw InvalidExpression when field starts with percentage sign', () => {
      const expression: Expression = {
        '%4f_e_t': { gt: 3.14159 },
      };

      expect(() => FilterParser.parse(expression)).toThrow(InvalidExpression);
    });

    it('should throw InvalidExpression when field starts with a number', () => {
      const expression: Expression = {
        '34_test': { gt: 0.57721 },
      };

      expect(() => FilterParser.parse(expression)).toThrow(InvalidExpression);
    });

    it('should throw InvalidExpression when field starts with @', () => {
      const expression: Expression = {
        '@_l': { in: [0.57721, 3.14159] },
      };

      expect(() => FilterParser.parse(expression)).toThrow(InvalidExpression);
    });

    it('should throw InvalidExpression when field contains "" or spaces', () => {
      const expression: Expression = {
        '"="" OR "': { equals: 'SQLi' },
      };

      expect(() => FilterParser.parse(expression)).toThrow(InvalidExpression);
    });

    it('should throw InvalidExpression when field reference contains invalid characters', () => {
      const expression: Expression = {
        paganotto: { equals: '$s&?da34' },
      };

      expect(() => FilterParser.parse(expression)).toThrow(InvalidExpression);
    });
  });

  describe('IsNull expression', () => {
    it('should pass with valid isNull expression', () => {
      expect(FilterParser.parse({ infinite: { isNull: true } })).toMatchObject({
        kind: 'IsNullNode',
        isNull: true,
        value: {
          kind: 'FieldNode',
          value: 'infinite',
        },
      });
      expect(FilterParser.parse({ fear: { isNull: false } })).toMatchObject({
        kind: 'IsNullNode',
        isNull: false,
        value: {
          kind: 'FieldNode',
          value: 'fear',
        },
      });
    });
    it('should parse a not expression wrapping an isNull expression', () => {
      expect(
        FilterParser.parse({ not: { email: { isNull: true } } }),
      ).toMatchObject({
        kind: 'NotNode',
        expression: {
          kind: 'IsNullNode',
          isNull: true,
          value: { kind: 'FieldNode', value: 'email' },
        },
      });
    });
    it('should throw InvalidExpression with non-boolean value', () => {
      expect(() => FilterParser.parse({ love: { isNull: 1 } } as any)).toThrow(
        InvalidExpression,
      );
      expect(() =>
        FilterParser.parse({ feelings: { isNull: 'true' } as any }),
      ).toThrow(InvalidExpression);
      expect(() =>
        FilterParser.parse({ hate: { isNull: () => {} } } as any),
      ).toThrow(InvalidExpression);
      expect(() =>
        FilterParser.parse({ blame: { isNull: null } as any }),
      ).toThrow(InvalidExpression);
      expect(() =>
        FilterParser.parse({ money: { isNull: undefined } as any }),
      ).toThrow(InvalidExpression);
    });
  });

  describe('Between expression', () => {
    it('should pass with between expression valid', () => {
      expect(
        FilterParser.parse({
          score: { between: [100, '$max_score'] },
        }),
      ).toMatchObject({
        kind: 'BetweenNode',
        value: {
          kind: 'FieldNode',
          value: 'score',
        },
        start: {
          kind: 'LiteralNode',
          value: 100,
        },
        end: {
          kind: 'FieldNode',
          value: 'max_score',
        },
      });

      expect(FilterParser.parse({ age: { between: [18, 30] } })).toMatchObject({
        kind: 'BetweenNode',
        value: {
          kind: 'FieldNode',
          value: 'age',
        },
        start: {
          kind: 'LiteralNode',
          value: 18,
        },
        end: {
          kind: 'LiteralNode',
          value: 30,
        },
      });

      expect(
        FilterParser.parse({
          score: { between: ['$min_score', '$max_score'] },
        }),
      ).toMatchObject({
        kind: 'BetweenNode',
        value: {
          kind: 'FieldNode',
          value: 'score',
        },
        start: {
          kind: 'FieldNode',
          value: 'min_score',
        },
        end: {
          kind: 'FieldNode',
          value: 'max_score',
        },
      });
    });

    it('should throw InvalidExpression', () => {
      expect(() =>
        FilterParser.parse({ age: { between: null } } as any),
      ).toThrow(InvalidExpression);

      expect(() =>
        FilterParser.parse({ age: { between: [{}, () => {}] } } as any),
      ).toThrow(InvalidExpression);

      expect(() =>
        FilterParser.parse({ age: { between: [true, () => {}] } } as any),
      ).toThrow(InvalidExpression);

      expect(() =>
        FilterParser.parse({ age: { between: [undefined, undefined] } } as any),
      ).toThrow(InvalidExpression);

      expect(() => FilterParser.parse({ age: { between: [] } } as any)).toThrow(
        InvalidExpression,
      );

      expect(() =>
        FilterParser.parse({ age: { between: [1] } } as any),
      ).toThrow(InvalidExpression);

      expect(() =>
        FilterParser.parse({
          date: { between: [new Date('1999-01-01'), new Date('2020-01-01')] },
        } as any),
      ).toThrow(InvalidExpression);

      expect(() =>
        FilterParser.parse({
          date: {
            between: [{ not: { result: { equals: 'fail' } } }, 1],
          },
        } as any),
      ).toThrow(InvalidExpression);

      expect(() =>
        FilterParser.parse({
          date: { between: [3, [1, 2, 3, 4]] },
        } as any),
      ).toThrow(InvalidExpression);
    });
  });
});
