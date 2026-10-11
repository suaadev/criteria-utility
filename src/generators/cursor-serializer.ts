export type CursorSort = 'ASC' | 'DESC';

export type CursorCriterion = [string, unknown, CursorSort];

export type CursorPayload = CursorCriterion[];

function isUndefinedOrNull(value: unknown) {
  return value === undefined || value === null;
}

export function encode(fieldsToPivot: [string, unknown, CursorSort][]): string {
  const cursorPayload: Map<string, CursorCriterion> = new Map<
    string,
    CursorCriterion
  >();

  validateCursorPayload(fieldsToPivot);

  for (const criterion of fieldsToPivot) {
    const [field, value, sort] = criterion;
    cursorPayload.set(field.toString(), [field.toString(), value, sort]);
  }

  const cursorPayloadInJSONFormat: string = JSON.stringify(
    Array.from(cursorPayload.values()),
  );

  const cursorInBase64: string = Buffer.from(
    cursorPayloadInJSONFormat,
  ).toString('base64');

  return cursorInBase64;
}

function validateCursorCriterion(criterion: unknown) {
  if (!Array.isArray(criterion)) {
    throw new Error('Cursor payload is not valid');
  }

  const [field, value, sort] = criterion as unknown[];

  if (
    isUndefinedOrNull(field) ||
    isUndefinedOrNull(value) ||
    (sort !== 'DESC' && sort !== 'ASC')
  ) {
    throw new Error(
      `Cursor criterion is invalid, received: ${criterion.toString()}`,
    );
  }
}

function validateCursorPayload(payload: unknown) {
  if (!Array.isArray(payload) || payload.length === 0) {
    throw new Error('Cursor payload must be a non-empty array');
  }
  for (const element of payload) {
    validateCursorCriterion(element);
  }
}

export function decode(cursor: string): CursorPayload {
  const cursorInUtf8 = Buffer.from(cursor, 'base64').toString('utf-8');
  const cursorPayload = JSON.parse(cursorInUtf8) as unknown;
  validateCursorPayload(cursorPayload);
  return cursorPayload as CursorPayload;
}
