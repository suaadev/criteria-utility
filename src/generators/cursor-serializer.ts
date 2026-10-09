type OperatorCondition = '<' | '>';

type CursorSort = 'ASC' | 'DESC';

type CursorCriterion = [string, OperatorCondition, unknown];

type CursorPayload = CursorCriterion[];

function resolveOperator(sort: CursorSort): OperatorCondition {
  return sort === 'ASC' ? '>' : '<';
}

export function encode(fieldsToPivot: [string, unknown, CursorSort][]): string {
  const cursorPayload: Map<string, CursorCriterion> = new Map<
    string,
    CursorCriterion
  >();

  for (const [field, value, sort] of fieldsToPivot) {
    cursorPayload.set(field.toString(), [
      field.toString(),
      resolveOperator(sort),
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

export function decode(cursor: string): CursorPayload {
  const cursorInUtf8 = Buffer.from(cursor, 'base64').toString('utf-8');
  const cursorPayload = JSON.parse(cursorInUtf8) as CursorPayload;
  return cursorPayload;
}
