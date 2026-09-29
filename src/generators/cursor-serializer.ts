type OperatorCondition = "<" | ">";

type CursorSort = "ASC" | "DESC";

type CursorPayload = [string, OperatorCondition, unknown][];

export default class CursorSerializer {
  private static resolveOperator(sort: CursorSort): OperatorCondition {
    return sort === "ASC" ? ">" : "<";
  }

  static encode<T>(object: T, fieldsToPivot: [keyof T, CursorSort][]): string {
    const cursorPayload: Map<string, [string, OperatorCondition, unknown]> =
      new Map();

    for (const [field, sort] of fieldsToPivot) {
      const value = object[field];
      if (value === null || value === undefined) {
        throw new Error(
          `The value for field ${field.toString()} is invalid, received:${value}`,
        );
      }

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
    ).toString("base64");

    return cursorInBase64;
  }

  static decode(cursor: string): CursorPayload {
    const cursorInUtf8 = Buffer.from(cursor, "base64").toString("utf-8");
    const cursorPayload = JSON.parse(cursorInUtf8) as CursorPayload;
    return cursorPayload;
  }
}
