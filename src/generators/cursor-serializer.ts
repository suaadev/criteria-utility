type OperatorCondition = '<' | '>';

type CursorSort = 'ASC' | 'DESC';

type CursorCriterion = [string, OperatorCondition, unknown];

type CursorPayload = CursorCriterion[];

export default class CursorSerializer {
  private constructor() {}

  private static resolveOperator(sort: CursorSort): OperatorCondition {
    return sort === 'ASC' ? '>' : '<';
  }

  static encode(fieldsToPivot: [string, unknown, CursorSort][]): string {
    const cursorPayload: Map<string, CursorCriterion> = new Map<
      string,
      CursorCriterion
    >();

    for (const [field, value, sort] of fieldsToPivot) {
      cursorPayload.set(field.toString(), [
        field.toString(),
        this.resolveOperator(sort),
        value,
      ]);
    }

    const cursorPayloadInJSONFormat: string = JSON.stringify(
      Array.from(cursorPayload.values()),
    );

    const cursorInBase64: string = Buffer.from(
      cursorPayloadInJSONFormat,
    ).toString('base64');

    return cursorInBase64;
  }

  static decode(cursor: string): CursorPayload {
    const cursorInUtf8 = Buffer.from(cursor, 'base64').toString('utf-8');
    const cursorPayload = JSON.parse(cursorInUtf8) as CursorPayload;
    return cursorPayload;
  }
}
