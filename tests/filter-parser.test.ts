import { describe, expect, it } from "@jest/globals";
import { FilterParser } from "../src/filter/filter-parser";
import { ExpressionRaw } from "../src/filter/basic-grammar";

describe("Test FilterParser to parser syntax to expression", () => {
  describe("Verify a expression", () => {
    it("Good expression", () => {
      const goodExpression: ExpressionRaw = {
        equals: [{ or: [1, 2] }, { not: { not: true } }],
      };

      const parserResult = FilterParser.parse(goodExpression);

      expect(parserResult).toMatchObject({
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
          kind: "NotExpression",
          expression: {
            kind: "NotExpression",
            expression: { kind: "LiteralExpression", value: true },
          },
        },
      });
    });

    it("With not valid key", () => {
      const badExpression = {
        wrongKey: [1, 2],
      };
      expect(() => FilterParser.parse(badExpression as ExpressionRaw)).toThrow(
        SyntaxError,
      );
    });

    it("with null", () => {
      const badExpression = null as unknown as ExpressionRaw;
      expect(() => FilterParser.parse(badExpression)).toThrow(SyntaxError);
    });
  });

  describe("Verify a LOGIC expressions", () => {
    it("Empty arguments", () => {
      const badExpression = {
        and: [],
      };
      expect(() => FilterParser.parse(badExpression)).toThrow(SyntaxError);
    });

    it("With only 1 arguments", () => {
      const badExpression: ExpressionRaw = {
        not: {
          or: [true],
        },
      };
      expect(() => FilterParser.parse(badExpression)).toThrow(SyntaxError);
    });

    it("Verify a bad expression with not keys 2", () => {
      const badExpression: ExpressionRaw = {
        and: [{}, 1],
      };
      expect(() => FilterParser.parse(badExpression)).toThrow(SyntaxError);
    });

    it("Verify a bad expression with not keys 3", () => {
      const badExpression = {
        and: {},
      };
      expect(() => FilterParser.parse(badExpression as ExpressionRaw)).toThrow(
        SyntaxError,
      );
    });

    it("with null", () => {
      const badExpression = {
        and: null,
      };
      expect(() =>
        FilterParser.parse(badExpression as unknown as ExpressionRaw),
      ).toThrow(SyntaxError);
    });
  });

  describe("Verify a COMPARISON expressions", () => {
    it("With empty arguments", () => {
      const badExpression: ExpressionRaw = {
        equals: [],
      };
      expect(() => FilterParser.parse(badExpression)).toThrow(SyntaxError);
    });

    it("With only 1 argument", () => {
      const badExpression: ExpressionRaw = {
        equals: [1],
      };
      expect(() => FilterParser.parse(badExpression)).toThrow(SyntaxError);
    });

    it("With more two argument", () => {
      const badExpression: ExpressionRaw = {
        equals: [1, 2, 3, 4, 5, 6],
      };
      expect(() => FilterParser.parse(badExpression)).toThrow(SyntaxError);
    });

    it("With not keys", () => {
      const badExpression = {
        lt: {},
      };
      expect(() => FilterParser.parse(badExpression as ExpressionRaw)).toThrow(
        SyntaxError,
      );
    });

    it("With not keys 2", () => {
      const badExpression = {
        gt: {},
      };
      expect(() => FilterParser.parse(badExpression as ExpressionRaw)).toThrow(
        SyntaxError,
      );
    });

    it("With not object valids", () => {
      const badExpression = {
        diff: [() => {}, undefined],
      };

      expect(() => FilterParser.parse(badExpression as ExpressionRaw)).toThrow(
        SyntaxError,
      );
    });
  });

  describe("Verify a NOT expression ", () => {
    it("With not keys 1", () => {
      const badExpression: ExpressionRaw = {
        not: {},
      };
      expect(() => FilterParser.parse(badExpression)).toThrow(SyntaxError);
    });

    it("With not valid object", () => {
      const badExpression = {
        not: () => {},
      };
      expect(() => FilterParser.parse(badExpression as ExpressionRaw)).toThrow(
        SyntaxError,
      );
    });

    it("With not valid object 2", () => {
      const badExpression = {
        not: null,
      };
      expect(() => FilterParser.parse(badExpression as ExpressionRaw)).toThrow(
        SyntaxError,
      );
    });
  });

  describe("Verify a IN expression", () => {
    it("With 1 argument", () => {
      const badExpression = {
        in: [1],
      };
      expect(() => FilterParser.parse(badExpression as ExpressionRaw)).toThrow(
        SyntaxError,
      );
    });

    it("With invalid argument", () => {
      const badExpression = {
        in: [() => {}, null],
      };
      expect(() => FilterParser.parse(badExpression as ExpressionRaw)).toThrow(
        SyntaxError,
      );
    });

    it("With invalid item", () => {
      const badExpression = {
        in: [true, [1, 2, 3, () => {}]],
      };
      expect(() => FilterParser.parse(badExpression as ExpressionRaw)).toThrow(
        SyntaxError,
      );
    });

    it("With invalid value to find", () => {
      const badExpression = {
        in: [{ and: [true, true] }, [1, 2]],
      };

      expect(() => FilterParser.parse(badExpression as ExpressionRaw)).toThrow(
        SyntaxError,
      );
    });

    it("With invalid elements", () => {
      const badExpression = {
        in: [1, [1, 2, { and: [true, true] }]],
      };

      expect(() => FilterParser.parse(badExpression as ExpressionRaw)).toThrow(
        SyntaxError,
      );
    });

    it("Good Expression", () => {
      const expression: ExpressionRaw = {
        in: ["cat", ["dog", "cat"]],
      };

      const resultParse = FilterParser.parse(expression);
      expect(resultParse).toMatchObject({
        kind: "InExpression",
        value: {
          kind: "LiteralExpression",
          value: "cat",
        },
      });
    });
  });

  describe("Verify ID expression", () => {
    it("With valid syntaxis 1", () => {
      const expression: ExpressionRaw = {
        in: ["$cat", ["dog", "cat"]],
      };

      const resultParse = FilterParser.parse(expression);
      expect(resultParse).toMatchObject({
        kind: "InExpression",
        value: {
          kind: "IdExpression",
          value: "$cat",
        },
      });
    });

    it("With valid syntaxis 2", () => {
      const expression: ExpressionRaw = {
        equals: ["$_sd_a_3_4", 1],
      };
      const resultParse = FilterParser.parse(expression);

      expect(resultParse).toMatchObject({
        kind: "ComparisonExpression",
      });
    });

    it("With invalid syntaxis 1", () => {
      const expression: ExpressionRaw = {
        equals: ["$", 1],
      };

      expect(() => FilterParser.parse(expression)).toThrow(SyntaxError);
    });

    it("With invalid syntaxis 2", () => {
      const expression: ExpressionRaw = {
        equals: ["$123sda", 1],
      };

      expect(() => FilterParser.parse(expression)).toThrow(SyntaxError);
    });

    it("With invalid syntaxis 3", () => {
      const expression: ExpressionRaw = {
        equals: ["$s&?da34", 1],
      };

      expect(() => FilterParser.parse(expression)).toThrow(SyntaxError);
    });
  });
});
