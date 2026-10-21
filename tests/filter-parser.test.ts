import { describe, expect, it } from '@jest/globals';
import * as FilterParser from '../src/filter/filter-parser';
import { ExpressionRaw } from '../src/filter/basic-grammar';

describe('FilterParser', () => {
  describe('general expressions', () => {
    it('should parse valid logical and comparison expressions', () => {
      const goodExpression: ExpressionRaw = {
        and: [{ username: { diff: 'jazzz' } }, { age: { lte: '$parentAage' } }],
      };

      const parserResult = FilterParser.parse(goodExpression);

      expect(parserResult).toMatchObject({
        kind: 'LogicExpression',
        left: {
          kind: 'ComparisonExpression',
          left: { kind: 'FieldExpression', value: 'username' },
          operator: '!=',
          right: { kind: 'LiteralExpression', value: 'jazzz' },
        },
        operator: '&&',
        right: {
          kind: 'ComparisonExpression',
          left: { kind: 'FieldExpression', value: 'age' },
          operator: '<=',
          right: { kind: 'FieldExpression', value: 'parentAage' },
        },
      });
    });

    it('should throw SyntaxError when input object contains an invalid key', () => {
      const badExpression = {
        wrongKey: [1, 2],
      };
      expect(() => FilterParser.parse(badExpression as any)).toThrow(
        SyntaxError,
      );
    });

    it('should parse null as a LiteralExpression', () => {
      const badExpression = null as any;
      expect(FilterParser.parse(badExpression)).toMatchObject({
        kind: 'LiteralExpression',
        value: null,
      });
    });
  });

  describe('logical expressions (and / or)', () => {
    it('should throw SyntaxError when logical array is empty', () => {
      const badExpression = {
        and: [],
      };
      expect(() => FilterParser.parse(badExpression)).toThrow(SyntaxError);
    });

    it('should throw SyntaxError when logical array has fewer than two elements', () => {
      const badExpression: ExpressionRaw = {
        not: {
          or: [true],
        },
      };
      expect(() => FilterParser.parse(badExpression)).toThrow(SyntaxError);
    });

    it('should throw SyntaxError when logical array contains an empty object', () => {
      const badExpression: ExpressionRaw = {
        and: [{}, 1],
      };
      expect(() => FilterParser.parse(badExpression)).toThrow(SyntaxError);
    });

    it('should throw SyntaxError when logical operand is an object instead of array', () => {
      const badExpression = {
        and: {},
      };
      expect(() => FilterParser.parse(badExpression as any)).toThrow(
        SyntaxError,
      );
    });

    it('should throw SyntaxError when logical operand is null', () => {
      const badExpression = {
        and: null,
      };
      expect(() => FilterParser.parse(badExpression as any)).toThrow(
        SyntaxError,
      );
    });

    it('should parse an or expression with multiple conditions', () => {
      const expression: ExpressionRaw = {
        or: [
          { role: { equals: 'admin' } },
          { role: { equals: 'editor' } },
          { role: { equals: 'viewer' } },
        ],
      };

      const result = FilterParser.parse(expression);

      expect(result).toMatchObject({
        kind: 'LogicExpression',
        operator: '||',
        left: {
          kind: 'LogicExpression',
          operator: '||',
          left: {
            kind: 'ComparisonExpression',
            left: { kind: 'FieldExpression', value: 'role' },
            operator: '==',
            right: { kind: 'LiteralExpression', value: 'admin' },
          },
          right: {
            kind: 'ComparisonExpression',
            left: { kind: 'FieldExpression', value: 'role' },
            operator: '==',
            right: { kind: 'LiteralExpression', value: 'editor' },
          },
        },
        right: {
          kind: 'ComparisonExpression',
          left: { kind: 'FieldExpression', value: 'role' },
          operator: '==',
          right: { kind: 'LiteralExpression', value: 'viewer' },
        },
      });
    });
  });

  describe('comparison expressions', () => {
    it('should throw SyntaxError when comparison operand is an empty object', () => {
      const badExpression: ExpressionRaw = {
        dog: { equals: {} },
      };
      expect(() => FilterParser.parse(badExpression)).toThrow(SyntaxError);
    });

    it('should parse an equals expression with an array operand', () => {
      const badExpression = {
        phoneNumbers: { equals: ['+56 30000000', '+51 70000000'] },
      };
      expect(FilterParser.parse(badExpression)).toMatchObject({
        kind: 'ComparisonExpression',
        left: {
          kind: 'FieldExpression',
        },
        right: {
          kind: 'ArrayExpression',
        },
      });
    });

    it('should parse an equals expression with a literal operand', () => {
      const badExpression = {
        genere: { equals: 'techno' },
      };
      expect(FilterParser.parse(badExpression)).toMatchObject({
        kind: 'ComparisonExpression',
        left: {
          kind: 'FieldExpression',
        },
        right: {
          kind: 'LiteralExpression',
        },
      });
    });

    it('should throw SyntaxError when a field contains more than one operator', () => {
      const badExpression = {
        age: { gt: 10, lt: 20 },
      };
      expect(() => FilterParser.parse(badExpression as any)).toThrow(
        SyntaxError,
      );
    });

    it('should throw SyntaxError when lt operator is an empty object', () => {
      const badExpression = {
        some: { lt: {} },
      };
      expect(() => FilterParser.parse(badExpression as any)).toThrow(
        SyntaxError,
      );
    });

    it('should throw SyntaxError when gt operator is a function', () => {
      const badExpression = {
        1: { gt: () => {} },
      };
      expect(() => FilterParser.parse(badExpression as any)).toThrow(
        SyntaxError,
      );
    });

    it('should throw SyntaxError when gt operator is an empty object', () => {
      const badExpression = {
        username: {
          gt: {},
        },
      };
      expect(() => FilterParser.parse(badExpression as any)).toThrow(
        SyntaxError,
      );
    });

    it('should throw SyntaxError when comparison operands contain invalid types', () => {
      const badExpression = {
        cat: { diff: [() => {}, undefined] },
      };

      expect(() => FilterParser.parse(badExpression as any)).toThrow(
        SyntaxError,
      );
    });

    it('should parse a comparison between two fields', () => {
      const expression: ExpressionRaw = {
        startDate: { lte: '$endDate' },
      };

      const result = FilterParser.parse(expression);

      expect(result).toMatchObject({
        kind: 'ComparisonExpression',
        left: { kind: 'FieldExpression', value: 'startDate' },
        operator: '<=',
        right: { kind: 'FieldExpression', value: 'endDate' },
      });
    });

    it('should throw SyntaxError when an invalid operator is provided', () => {
      const badExpression = {
        age: { badOperator: {} },
      };
      expect(() => FilterParser.parse(badExpression as any)).toThrow(
        SyntaxError,
      );
    });
  });

  describe('not expressions', () => {
    it('should throw SyntaxError when not expression is an empty object', () => {
      const badExpression: ExpressionRaw = {
        not: {},
      };
      expect(() => FilterParser.parse(badExpression)).toThrow(SyntaxError);
    });

    it('should throw SyntaxError when not expression is a function', () => {
      const badExpression = {
        not: () => {},
      };
      expect(() => FilterParser.parse(badExpression as any)).toThrow(
        SyntaxError,
      );
    });

    it('should throw SyntaxError when not expression is null', () => {
      const badExpression = {
        not: null,
      };
      expect(() => FilterParser.parse(badExpression as any)).toThrow(
        SyntaxError,
      );
    });

    it('should parse a valid not expression wrapping a comparison', () => {
      const expression: ExpressionRaw = {
        not: { status: { equals: 'inactive' } },
      };

      const result = FilterParser.parse(expression);

      expect(result).toMatchObject({
        kind: 'NotExpression',
        expression: {
          kind: 'ComparisonExpression',
          left: { kind: 'FieldExpression', value: 'status' },
          operator: '==',
          right: { kind: 'LiteralExpression', value: 'inactive' },
        },
      });
    });
  });

  describe('in expressions', () => {
    it('should throw SyntaxError when in array is empty', () => {
      const badExpression = {
        role: { in: [] },
      };
      expect(() => FilterParser.parse(badExpression as any)).toThrow(
        SyntaxError,
      );
    });

    it('should throw SyntaxError when in operand contains invalid values', () => {
      const badExpression = {
        in: [() => {}, null],
      };
      expect(() => FilterParser.parse(badExpression as any)).toThrow(
        SyntaxError,
      );
    });

    it('should throw SyntaxError when in array contains complex expressions', () => {
      const badExpression = {
        role: { in: [{ and: [true, true] }] },
      };
      expect(() => FilterParser.parse(badExpression as any)).toThrow(
        SyntaxError,
      );
    });

    it('should throw SyntaxError when in target is an invalid expression', () => {
      const badExpression = {
        in: [{ and: [true, true] }, [1, 2]],
      };

      expect(() => FilterParser.parse(badExpression as any)).toThrow(
        SyntaxError,
      );
    });

    it('should throw SyntaxError when in array contains an invalid nested element', () => {
      const badExpression = {
        some: { in: [1, [1, 2, 1, 1, {}]] },
      };

      expect(() => FilterParser.parse(badExpression as any)).toThrow(
        SyntaxError,
      );
    });

    it('should throw SyntaxError when in array contains invalid expressions', () => {
      const badExpression = {
        some: { in: [() => {}, { user: 'daaa' }] },
      };

      expect(() => FilterParser.parse(badExpression as any)).toThrow(
        SyntaxError,
      );
    });

    it('should parse a valid in expression with a field and literal list', () => {
      const expression: ExpressionRaw = {
        cat: { in: ['dog', 'cat'] },
      };

      const resultParse = FilterParser.parse(expression);
      expect(resultParse).toMatchObject({
        kind: 'InExpression',
        value: {
          kind: 'FieldExpression',
          value: 'cat',
        },
      });
    });

    it('should parse a valid in expression containing nested array and field expressions', () => {
      const expression: ExpressionRaw<{}> = {
        cat: { in: ['dog', '$animal', ['$dog', ['duck']]] },
      };

      const resultParse = FilterParser.parse(expression);
      expect(resultParse).toMatchObject({
        kind: 'InExpression',
        value: {
          kind: 'FieldExpression',
          value: 'cat',
        },
        arrayExpression: {
          kind: 'ArrayExpression',
          items: [
            { kind: 'LiteralExpression', value: 'dog' },
            { kind: 'FieldExpression', value: 'animal' },
            {
              kind: 'ArrayExpression',
              items: [
                { kind: 'FieldExpression', value: 'dog' },
                {
                  kind: 'ArrayExpression',
                  items: [
                    {
                      kind: 'LiteralExpression',
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
      const expression: ExpressionRaw = {
        cat: { in: ['dog', 'cat'] },
      };

      const resultParse = FilterParser.parse(expression);
      expect(resultParse).toMatchObject({
        kind: 'InExpression',
        value: {
          kind: 'FieldExpression',
          value: 'cat',
        },
      });
    });

    it('should parse a valid field reference matching identifier regex', () => {
      const expression: ExpressionRaw = {
        t3s_t: { equals: '$_sd_a_3_4' },
      };
      const resultParse = FilterParser.parse(expression);

      expect(resultParse).toMatchObject({
        kind: 'ComparisonExpression',
      });
    });

    it('should parse a valid field name matching identifier regex', () => {
      const expression: ExpressionRaw = {
        _3st: { equals: 'clean_code' },
      };
      const resultParse = FilterParser.parse(expression);

      expect(resultParse).toMatchObject({
        kind: 'ComparisonExpression',
      });
    });

    it('should throw SyntaxError when field reference is only a dollar sign', () => {
      const expression: ExpressionRaw = {
        indira_: { equals: '$' },
      };

      expect(() => FilterParser.parse(expression)).toThrow(SyntaxError);
    });

    it('should throw SyntaxError when field starts with dollar sign', () => {
      const expression: ExpressionRaw = {
        '$%4f_': { equals: 'wtf' },
      };

      expect(() => FilterParser.parse(expression)).toThrow(SyntaxError);
    });

    it('should throw SyntaxError when field starts with percentage sign', () => {
      const expression: ExpressionRaw = {
        '%4f_e_t': { gt: 3.14159 },
      };

      expect(() => FilterParser.parse(expression)).toThrow(SyntaxError);
    });

    it('should throw SyntaxError when field starts with a number', () => {
      const expression: ExpressionRaw = {
        '34_test': { gt: 0.57721 },
      };

      expect(() => FilterParser.parse(expression)).toThrow(SyntaxError);
    });

    it('should throw SyntaxError when field starts with @', () => {
      const expression: ExpressionRaw = {
        '@_l': { in: [0.57721, 3.14159] },
      };

      expect(() => FilterParser.parse(expression)).toThrow(SyntaxError);
    });

    it('should throw SyntaxError when field contains "" or spaces', () => {
      const expression: ExpressionRaw = {
        '"="" OR "': { equals: 'SQLi' },
      };

      expect(() => FilterParser.parse(expression)).toThrow(SyntaxError);
    });

    it('should throw SyntaxError when field reference contains invalid characters', () => {
      const expression: ExpressionRaw = {
        paganotto: { equals: '$s&?da34' },
      };

      expect(() => FilterParser.parse(expression)).toThrow(SyntaxError);
    });
  });
});
