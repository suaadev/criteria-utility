export interface CursorSerializer<K = unknown, T = unknown> {
  encode(cursorPayload: K): T;

  decode(cursor: T): K;
}
