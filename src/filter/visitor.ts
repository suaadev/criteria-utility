import {
  ArrayNode,
  ComparisonNode,
  FieldNode,
  InNode,
  LiteralNode,
  LogicalNode,
  NotNode,
} from './ast.js';

export interface Visitor<T = void> {
  visitLiteralNode(literalNode: LiteralNode): T;
  visitNotNode(notNode: NotNode): T;
  visitComparisonNode(comparisonNode: ComparisonNode): T;
  visitLogicalNode(logicalNode: LogicalNode): T;
  visitArrayNode(arrayNode: ArrayNode): T;
  visitInNode(inNode: InNode): T;
  visitFieldNode(fieldNode: FieldNode): T;
}
