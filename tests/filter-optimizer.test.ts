import { describe, expect, it } from "@jest/globals";
import { ExpressionRaw } from "../src/filter/basic-grammar";
import { FilterParser } from "../src/filter/filter-parser";
import { FilterOptimizer } from "../src/filter/filter-optimizer";

describe("Test filter-optimizer", () => {
  it("Optimize an expression 1", () => {
    const exp4: ExpressionRaw = {
      and: [
        { equals: ["$username", "pepito"] },
        { equals: ["$email", "pepito"] },
        { in: [1, [3, 4, 5, 6, 6]] },
      ],
    };

    const expression = FilterParser.parse(exp4);
    const expressionOptimized = FilterOptimizer.optimize(expression);

    expect(expressionOptimized).toMatchObject({
      kind: "LiteralExpression",
      value: false,
    });
  });

  it("Optimize an expression 2", () => {
    const exp4: ExpressionRaw = {
      and: [{ gt: [2, 1] }, { equals: [2, 2] }, { lt: [1, 10] }],
    };

    const expression = FilterParser.parse(exp4);
    const expressionOptimized = FilterOptimizer.optimize(expression);

    expect(expressionOptimized).toMatchObject({
      kind: "LiteralExpression",
      value: true,
    });
  });

  it("Optimize an expression 3", () => {
    const exp4: ExpressionRaw = {
      and: [
        true,
        true,
        true,
        { gte: ["$age", 18] },
        { lte: ["$age", 60] },
        true,
        true,
        true,
        true,
        { gte: [1, 1] },
      ],
    };

    const expression = FilterParser.parse(exp4);
    const expressionOptimized = FilterOptimizer.optimize(expression);

    expect(expressionOptimized).toMatchObject({
      kind: "LogicExpression",
      left: {
        kind: "ComparisonExpression",
        left: {
          kind: "IdExpression",
          value: "$age",
        },
        operator: ">=",
        right: {
          kind: "LiteralExpression",
          value: 18,
        },
      },
      operator: "&&",
      right: {
        kind: "ComparisonExpression",
        left: {
          kind: "IdExpression",
          value: "$age",
        },
        operator: "<=",
        right: {
          kind: "LiteralExpression",
          value: 60,
        },
      },
    });
  });

  it("Optimize an expression 4", () => {
    const exp4: ExpressionRaw = {
      or: [
        false,
        { diff: ["cat", "dog"] },
        { equals: ["hello world!", "hello  world!!!"] },
        { in: [1, [3, 4, 5, 6, 6, 1]] },
        false,
      ],
    };

    const expression = FilterParser.parse(exp4);
    const expressionOptimized = FilterOptimizer.optimize(expression);

    expect(expressionOptimized).toMatchObject({
      kind: "LiteralExpression",
      value: true,
    });
  });

  it("Optimize an expression 5", () => {
    const exp4: ExpressionRaw = {
      or: [
        false,
        { gte: [1, 2] },
        { equals: [1, 1] },
        { diff: ["$animalType", "dog"] },
        { in: [2, [3, 4, 5, 6]] },
        false,
      ],
    };

    const expression = FilterParser.parse(exp4);
    const expressionOptimized = FilterOptimizer.optimize(expression);

    expect(expressionOptimized).toMatchObject({
      kind: "LiteralExpression",
      value: true,
    });
  });

  it("Optimize an expression 6", () => {
    const exp4: ExpressionRaw = {
      not: { or: [false, { in: [2, [3, 4, 5, 6, 6, 1]] }, false] },
    };

    const expression = FilterParser.parse(exp4);
    const expressionOptimized = FilterOptimizer.optimize(expression);

    expect(expressionOptimized).toMatchObject({
      kind: "LiteralExpression",
      value: true,
    });
  });

  it("Optimize an expression 7", () => {
    const exp4: ExpressionRaw = {
      not: { not: { or: [false, false] } },
    };

    const expression = FilterParser.parse(exp4);
    const expressionOptimized = FilterOptimizer.optimize(expression);

    expect(expressionOptimized).toMatchObject({
      kind: "LiteralExpression",
      value: false,
    });
  });

  it("Optimize an expression 8", () => {
    const exp4: ExpressionRaw = {
      not: { not: { equals: ["$id", "aaabbb"] } },
    };

    const expression = FilterParser.parse(exp4);
    const expressionOptimized = FilterOptimizer.optimize(expression);

    expect(expressionOptimized).toMatchObject({
      kind: "ComparisonExpression",
    });
  });

  it("Optimize an expression 9", () => {
    const exp4: ExpressionRaw = {
      not: { not: { not: { equals: ["$id", "aaabbb"] } } },
    };

    const expression = FilterParser.parse(exp4);
    const expressionOptimized = FilterOptimizer.optimize(expression);

    expect(expressionOptimized).toMatchObject({
      kind: "NotExpression",
    });
  });

  it("Optimize an expression 10", () => {
    const exp4: ExpressionRaw = {
      not: { not: { not: { equals: [1, 1] } } },
    };

    const expression = FilterParser.parse(exp4);
    const expressionOptimized = FilterOptimizer.optimize(expression);

    expect(expressionOptimized).toMatchObject({
      kind: "LiteralExpression",
      value: false,
    });
  });

  it("Optimize an expression 11", () => {
    const exp4: ExpressionRaw = {
      not: { not: { not: { not: { equals: ["$id", 1] } } } },
    };

    const expression = FilterParser.parse(exp4);
    const expressionOptimized = FilterOptimizer.optimize(expression);

    expect(expressionOptimized).toMatchObject({
      kind: "ComparisonExpression",
    });
  });

  it("Optimize an expression 12", () => {
    const exp4: ExpressionRaw = {
      and: [true, true, { equals: [11, 11] }],
    };

    const expression = FilterParser.parse(exp4);
    const expressionOptimized = FilterOptimizer.optimize(expression);

    expect(expressionOptimized).toMatchObject({
      kind: "LiteralExpression",
      value: true,
    });
  });

  it("Optimize an expression 13", () => {
    const exp4: ExpressionRaw = {
      and: [true, true, { equals: [11, 11] }, false],
    };

    const expression = FilterParser.parse(exp4);
    const expressionOptimized = FilterOptimizer.optimize(expression);

    expect(expressionOptimized).toMatchObject({
      kind: "LiteralExpression",
      value: false,
    });
  });

  it("Optimize an expression 14", () => {
    const exp4: ExpressionRaw = {
      and: [
        true,
        { lte: [1, 11] },
        { lte: [11, 11] },
        { gte: [11, 11] },
        { gte: [20, 11] },
      ],
    };

    const expression = FilterParser.parse(exp4);
    const expressionOptimized = FilterOptimizer.optimize(expression);

    expect(expressionOptimized).toMatchObject({
      kind: "LiteralExpression",
      value: true,
    });
  });

  it("Optimize an expression 15", () => {
    const exp4: ExpressionRaw = {
      and: [{ equals: [1, 2] }, { lte: ["$id", 11] }],
    };

    const expression = FilterParser.parse(exp4);
    const expressionOptimized = FilterOptimizer.optimize(expression);

    expect(expressionOptimized).toMatchObject({
      kind: "LiteralExpression",
      value: false,
    });
  });

  it("Optimize an expression 16", () => {
    const exp4: ExpressionRaw = {
      or: [{ equals: [1, 2] }, { lte: ["$id", 11] }],
    };

    const expression = FilterParser.parse(exp4);
    const expressionOptimized = FilterOptimizer.optimize(expression);

    expect(expressionOptimized).toMatchObject({
      kind: "ComparisonExpression",
      left: {
        kind: "IdExpression",
        value: "$id",
      },
      operator: "<=",
      right: {
        kind: "LiteralExpression",
        value: 11,
      },
    });
  });

  it("Optimize an expression 17", () => {
    const exp4: ExpressionRaw = {
      or: [{ lte: ["$id", 11] }, true, { diff: [1, 2] }],
    };

    const expression = FilterParser.parse(exp4);
    const expressionOptimized = FilterOptimizer.optimize(expression);

    expect(expressionOptimized).toMatchObject({
      kind: "LiteralExpression",
      value: true,
    });
  });
});
