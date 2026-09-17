import { describe, expect, it } from "@jest/globals";
import { ExpressionRaw, FilterParser } from "../src/filter-parser";
import { Expression } from "../src/types/expression";
import { ComparisonExpression } from "../src/types/comparision-expression";

describe("Test FilterParser to parser syntax to expression", () => {
  describe("Verify a expression", () => {
    it("Good expression", () => {
      const goodExpression: ExpressionRaw = {
        equals: [{ or: [1, 2] }, { not: { not: true } }],
      };

      const parserResult = FilterParser.parser(goodExpression);

      expect(parserResult).toBeInstanceOf(Expression);
      expect(parserResult).toBeInstanceOf(ComparisonExpression);
      expect(JSON.parse(JSON.stringify(parserResult))).toMatchObject({
        kind: "ComparisonExpression",
        operator: "==",
        left: {
          kind: "LogicExpression",
          operator: "||",
          left: {
            kind: "LiteralExpression",
            value: 1,
          },
          right: {
            kind: "LiteralExpression",
            value: 2,
          },
        },
        right: {
          kind: "LiteralExpression",
          value: true,
        },
      });
    });

    it("With not valid key", () => {
      const badExpression = {
        wrongKey: [1, 2],
      };
      expect(() => FilterParser.parser(badExpression as ExpressionRaw)).toThrow(
        SyntaxError,
      );
    });
  });

  it;

  describe("Verify a LOGIC expressions", () => {
    it("Empty arguments", () => {
      const badExpression = {
        and: [],
      };
      expect(() => FilterParser.parser(badExpression)).toThrow(SyntaxError);
    });

    it("With only 1 arguments", () => {
      const badExpression: ExpressionRaw = {
        not: {
          or: [true],
        },
      };
      expect(() => FilterParser.parser(badExpression)).toThrow(SyntaxError);
    });

    it("Verify a bad expression with not keys 2", () => {
      const badExpression: ExpressionRaw = {
        and: [{}, 1],
      };
      expect(() => FilterParser.parser(badExpression)).toThrow(SyntaxError);
    });

    it("Verify a bad expression with not keys 3", () => {
      const badExpression = {
        and: {},
      };
      expect(() => FilterParser.parser(badExpression as ExpressionRaw)).toThrow(
        SyntaxError,
      );
    });
  });

  describe("Verify a COMPARISON expressions", () => {
    it("With empty arguments", () => {
      const badExpression: ExpressionRaw = {
        equals: [],
      };
      expect(() => FilterParser.parser(badExpression)).toThrow(SyntaxError);
    });

    it("With only 1 argument", () => {
      const badExpression: ExpressionRaw = {
        equals: [1],
      };
      expect(() => FilterParser.parser(badExpression)).toThrow(SyntaxError);
    });

    it("With not keys", () => {
      const badExpression = {
        lt: {},
      };
      expect(() => FilterParser.parser(badExpression as ExpressionRaw)).toThrow(
        SyntaxError,
      );
    });

    it("With not keys 2", () => {
      const badExpression = {
        gt: {},
      };
      expect(() => FilterParser.parser(badExpression as ExpressionRaw)).toThrow(
        SyntaxError,
      );
    });

    it("With not object valids", () => {
      const badExpression = {
        diff: [() => {}, undefined],
      };

      expect(() => FilterParser.parser(badExpression as ExpressionRaw)).toThrow(
        SyntaxError,
      );
    });
  });

  describe("Verify a NOT expression ", () => {
    it("With not keys 1", () => {
      const badExpression: ExpressionRaw = {
        not: {},
      };
      expect(() => FilterParser.parser(badExpression)).toThrow(SyntaxError);
    });

    it("With not valid object", () => {
      const badExpression = {
        not: () => {},
      };
      expect(() => FilterParser.parser(badExpression as ExpressionRaw)).toThrow(
        SyntaxError,
      );
    });

    it("With not valid object 2", () => {
      const badExpression = {
        not: null,
      };
      expect(() => FilterParser.parser(badExpression as ExpressionRaw)).toThrow(
        SyntaxError,
      );
    });
  });
});
