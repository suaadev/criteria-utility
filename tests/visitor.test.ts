import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Ast, Visitor } from '../src';
import {
  buildArrayNode,
  buildComparisonNode,
  buildFieldNode,
  buildInNode,
  buildIsNullNode,
  buildLiteralNode,
  buildLogicalNode,
  buildNotNode,
} from '../src/filter/node-builders';

describe('Visitor suit test', () => {
  const visitLiteralNode = vi.fn(
    (literalNode: Ast.LiteralNode) => literalNode.kind,
  );

  const visitFieldNode = vi.fn((fieldNode: Ast.FieldNode) => fieldNode.kind);

  const visitLogicalNode = vi.fn(
    (logicNode: Ast.LogicalNode) => logicNode.kind,
  );

  const visitComparisonNode = vi.fn(
    (comparisonNode: Ast.ComparisonNode) => comparisonNode.kind,
  );
  const visitArrayNode = vi.fn((arrayNode: Ast.ArrayNode) => arrayNode.kind);

  const visitNotNode = vi.fn((notNode: Ast.NotNode) => notNode.kind);

  const visitInNode = vi.fn((inNode: Ast.InNode) => inNode.kind);

  const visitIsNullNode = vi.fn(
    (isNullNode: Ast.IsNullNode) => isNullNode.kind,
  );

  const visitorTest: Visitor<string> = {
    visitLiteralNode,
    visitFieldNode,
    visitLogicalNode,
    visitComparisonNode,
    visitArrayNode,
    visitNotNode,
    visitInNode,
    visitIsNullNode,
  };

  beforeEach(() => {
    visitLiteralNode.mockClear();
    visitFieldNode.mockClear();
    visitLogicalNode.mockClear();
    visitComparisonNode.mockClear();
    visitArrayNode.mockClear();
    visitNotNode.mockClear();
    visitInNode.mockClear();
    visitIsNullNode.mockClear();
  });

  it('should pass with AndNode', () => {
    const andNode: Ast.ExpressionNode = buildLogicalNode(
      buildFieldNode('isValid'),
      '&&',
      buildFieldNode('status'),
    );
    expect(andNode.accept(visitorTest)).toEqual(andNode.kind);
    expect(() => andNode.accept({} as any)).toThrow(TypeError);
    expect(visitLogicalNode).toHaveBeenCalledOnce();
    expect(visitLogicalNode).toHaveBeenCalledWith(andNode);
  });

  it('should pass with LiteralNode', () => {
    const literalNode: Ast.ExpressionNode = buildLiteralNode(1);
    expect(literalNode.accept(visitorTest)).toEqual(literalNode.kind);
    expect(() => literalNode.accept({} as any)).toThrow(TypeError);
    expect(visitLiteralNode).toHaveBeenCalledOnce();
    expect(visitLiteralNode).toHaveBeenCalledWith(literalNode);
  });

  it('should pass with FieldNode', () => {
    const fieldNode: Ast.ExpressionNode = buildFieldNode('username');
    expect(fieldNode.accept(visitorTest)).toEqual(fieldNode.kind);
    expect(() => fieldNode.accept({} as any)).toThrow(TypeError);
    expect(visitFieldNode).toHaveBeenCalledOnce();
    expect(visitFieldNode).toHaveBeenCalledWith(fieldNode);
  });

  it('should pass with InNode', () => {
    const inNode: Ast.ExpressionNode = buildInNode(
      buildLiteralNode(1),
      buildArrayNode([
        buildLiteralNode(1),
        buildLiteralNode(2),
        buildLiteralNode(3),
        buildLiteralNode(4),
      ]),
    );
    expect(inNode.accept(visitorTest)).toEqual(inNode.kind);
    expect(() => inNode.accept({} as any)).toThrow(TypeError);
    expect(visitInNode).toHaveBeenCalledOnce();
    expect(visitInNode).toHaveBeenCalledWith(inNode);
  });

  it('should pass with ArrayNode', () => {
    const arrayNode: Ast.ExpressionNode = buildArrayNode([
      buildLiteralNode(1),
      buildLiteralNode(2),
      buildLiteralNode(3),
      buildLiteralNode(4),
    ]);
    expect(arrayNode.accept(visitorTest)).toEqual(arrayNode.kind);
    expect(() => arrayNode.accept({} as any)).toThrow(TypeError);
    expect(visitArrayNode).toHaveBeenCalledOnce();
    expect(visitArrayNode).toHaveBeenCalledWith(arrayNode);
  });

  it('should pass with NotNode', () => {
    const notNode: Ast.ExpressionNode = buildNotNode(
      buildComparisonNode(buildLiteralNode(1), '==', buildLiteralNode(2)),
    );
    expect(notNode.accept(visitorTest)).toEqual(notNode.kind);
    expect(() => notNode.accept({} as any)).toThrow(TypeError);
    expect(visitNotNode).toHaveBeenCalledOnce();
    expect(visitNotNode).toHaveBeenCalledWith(notNode);
  });

  it('should pass with ComparisonNode', () => {
    const comparisonNode: Ast.ExpressionNode = buildComparisonNode(
      buildLiteralNode(1),
      '<=',
      buildLiteralNode(2),
    );
    expect(comparisonNode.accept(visitorTest)).toEqual(comparisonNode.kind);
    expect(() => comparisonNode.accept({} as any)).toThrow(TypeError);
    expect(visitComparisonNode).toHaveBeenCalledOnce();
    expect(visitComparisonNode).toHaveBeenCalledWith(comparisonNode);
  });

  it('should pass with IsNullNode', () => {
    const isNullNode: Ast.IsNullNode = buildIsNullNode(
      true,
      buildFieldNode('email'),
    );
    expect(isNullNode.accept(visitorTest)).toEqual(isNullNode.kind);
    expect(() => isNullNode.accept({} as any)).toThrow(TypeError);
    expect(visitIsNullNode).toHaveBeenCalledOnce();
    expect(visitIsNullNode).toHaveBeenCalledWith(isNullNode);
  });
});
