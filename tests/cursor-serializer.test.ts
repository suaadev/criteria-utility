import { describe, expect, it } from '@jest/globals';
import * as CursorSerializer from '../src/generators/cursor-serializer';

describe('Cursor serializer', () => {
  it('should serialize and decode a valid cursor payload', () => {
    const cursorData: CursorSerializer.CursorPayload = [
      ['createdAt', '2026-09-24 11:56:26.472 -0500', 'DESC'],
      ['username', 'ddavivss', 'ASC'],
      ['id', 10, 'DESC'],
    ];

    const cursor: string = CursorSerializer.encode(cursorData);

    expect(cursor).toBe(
      'W1siY3JlYXRlZEF0IiwiMjAyNi0wOS0yNCAxMTo1NjoyNi40NzIgLTA1MDAiLCJERVNDIl0sWyJ1c2VybmFtZSIsImRkYXZpdnNzIiwiQVNDIl0sWyJpZCIsMTAsIkRFU0MiXV0=',
    );

    const cursorDecoded = CursorSerializer.decode(cursor);

    expect(cursorDecoded).toStrictEqual(cursorData);
  });

  it('should throw an error when cursor payload is null', () => {
    const cursorData = null as unknown as CursorSerializer.CursorPayload;
    expect(() => CursorSerializer.encode(cursorData)).toThrow(Error);
  });

  it('should throw an error when a criterion element is null', () => {
    const cursorData = [null] as unknown as CursorSerializer.CursorPayload;
    expect(() => CursorSerializer.encode(cursorData)).toThrow(Error);
  });

  it('should throw an error when an invalid structure or sort direction is provided', () => {
    const cursorData = [
      ['createdAt', null, 'DESC'],
      ['username', undefined, 'SC'],
      ['id', 'DE'],
    ] as unknown as CursorSerializer.CursorPayload;

    expect(() => CursorSerializer.encode(cursorData)).toThrow(Error);
  });

  it('should throw an error when sort direction is null', () => {
    const cursorData = [
      ['name', 'test', null],
    ] as unknown as CursorSerializer.CursorPayload;

    expect(() => CursorSerializer.encode(cursorData)).toThrow(Error);
  });

  it('should throw an error when a sort direction is missing', () => {
    const cursorData = [
      ['name', 'test'],
    ] as unknown as CursorSerializer.CursorPayload;

    expect(() => CursorSerializer.encode(cursorData)).toThrow(Error);
  });

  it('should throw an error when a criterion value is missing', () => {
    const cursorData = [
      ['createdAt', '2026-09-24 11:56:26.472 -0500', 'DESC'],
      ['username', 'ddavivss', 'ASC'],
      ['id', 'DESC'],
    ] as unknown as CursorSerializer.CursorPayload;

    expect(() => CursorSerializer.encode(cursorData)).toThrow(Error);
  });

  it('should throw an error when cursor payload is empty', () => {
    const cursorData: CursorSerializer.CursorPayload = [];

    expect(() => CursorSerializer.encode(cursorData)).toThrow(Error);
  });
});
