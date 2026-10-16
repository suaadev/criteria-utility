import { describe, expect, it } from '@jest/globals';
import { CursorPayload } from '../src/pagination';
import { CursorBase64Serializer } from '../src/cursor-serializers/cursor-base64-serializer';
import { Buffer } from 'node:buffer';

describe('Cursor base64 serializer', () => {
  const cursorBase64Serializer = new CursorBase64Serializer();

  it('should serialize and decode a valid cursor payload', () => {
    const cursorData: CursorPayload = [
      ['createdAt', '2026-09-24 11:56:26.472 -0500', 'DESC'],
      ['username', 'ddavivss', 'ASC'],
      ['id', 10, 'DESC'],
    ];

    const cursor: string = cursorBase64Serializer.encode(cursorData);

    expect(cursor).toBe(
      'W1siY3JlYXRlZEF0IiwiMjAyNi0wOS0yNCAxMTo1NjoyNi40NzIgLTA1MDAiLCJERVNDIl0sWyJ1c2VybmFtZSIsImRkYXZpdnNzIiwiQVNDIl0sWyJpZCIsMTAsIkRFU0MiXV0=',
    );

    const cursorDecoded = cursorBase64Serializer.decode(cursor);

    expect(cursorDecoded).toStrictEqual(cursorData);
  });

  it('should throw an error when encoding an invalid payload', () => {
    const cursorData = () => {};

    expect(() => {
      cursorBase64Serializer.encode(cursorData as any);
    }).toThrow();
  });

  it('should throw an error when decoding an invalid base64 string', () => {
    expect(() => {
      cursorBase64Serializer.decode('invalid base64 format...');
    }).toThrow(Error);
  });

  it('should throw an error when cursor is not a string', () => {
    expect(() => {
      const cursor = null as any;
      cursorBase64Serializer.decode(cursor);
    }).toThrow(Error);
  });

  it('should throw SyntaxError when decoded base64 string is not valid JSON', () => {
    expect(() => {
      const cursor = Buffer.from('{test:1}').toString('base64');
      cursorBase64Serializer.decode(cursor);
    }).toThrow(SyntaxError);
  });
});
