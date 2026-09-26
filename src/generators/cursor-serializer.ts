export type CursorSort = "ASC" | "DESC";

export interface CursorPayload {
  fields: [string, unknown][];
  sort: CursorSort;
}

export class CursorSerializer {
  static encode<T>(
    object: T,
    fieldsToPivot: (keyof T)[],
    sort: CursorSort,
  ): string {
    const cursorPayload: CursorPayload = {
      fields: [],
      sort,
    };

    for (const field of fieldsToPivot) {
      const value = object[field];
      if (value === null || value === undefined) {
        throw new Error(
          `The value for field ${field.toString()} is invalid, received:${value}`,
        );
      }
      cursorPayload.fields.push([field.toString(), value]);
    }

    const cursorPayloadInJSONFormat: string = JSON.stringify(cursorPayload);

    const cursorInBase64: string = Buffer.from(
      cursorPayloadInJSONFormat,
    ).toString("base64");

    return cursorInBase64;
  }

  static decode(cursor: string): CursorPayload {
    const cursorInUtf8 = Buffer.from(cursor, "base64").toString("utf-8");
    const cursorPayload = JSON.parse(cursorInUtf8) as CursorPayload;
    return cursorPayload;
  }
}
