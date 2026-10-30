import Pagination from '../src/pagination';
import { CursorSerializer } from '../src/cursor-serializers/cursor-serializer';
import InvalidPage from '../src/exceptions/invalid-page';
import InvalidCursorPayload from '../src/exceptions/invalid-cursor-payload';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('Pagination', () => {
  describe('Pagination by page', () => {
    it('should throw an error when page is null', () => {
      expect(() => Pagination.byPage(null as any)).toThrow(InvalidPage);
    });

    it('should throw an error when page is an object', () => {
      expect(() => Pagination.byPage({ test: 'test' } as any)).toThrow(
        InvalidPage,
      );
    });

    it('should throw an error when page is zero', () => {
      expect(() => Pagination.byPage(0)).toThrow(InvalidPage);
    });

    it('should throw an error when page is negative', () => {
      expect(() => Pagination.byPage(-234)).toThrow(InvalidPage);
    });

    it('should throw an error when page is a decimal', () => {
      expect(() => Pagination.byPage(23.12)).toThrow(InvalidPage);
    });

    it('should throw an error when page is Infinity', () => {
      expect(() => Pagination.byPage(Infinity)).toThrow(InvalidPage);
    });

    it('should throw an error when page is -Infinity', () => {
      expect(() => Pagination.byPage(-Infinity)).toThrow(InvalidPage);
    });

    it('should create pagination with integer greater than 1', () => {
      const pagination = Pagination.byPage(46);
      expect(pagination).toBeInstanceOf(Pagination);
      expect(pagination.toObjectPlain()).toStrictEqual({
        page: 46,
        cursor: null,
      });
    });

    it('should create pagination object without page value', () => {
      const pagination = Pagination.byPage();
      expect(pagination).toBeInstanceOf(Pagination);
      expect(pagination.toObjectPlain()).toStrictEqual({
        page: 1,
        cursor: null,
      });
    });
  });

  describe('Pagination by cursor', () => {
    const encode = vi.fn().mockReturnValue('.....');
    const decode = vi.fn();

    const mockCursorParser: CursorSerializer<any> = { encode, decode };

    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should throw an error when cursor criterion has invalid elements', () => {
      decode.mockImplementation((cursor: unknown) => [[null, null, 'a']]);
      const cursorTest = 'cursor 1';
      expect(() => {
        Pagination.byCursor(cursorTest, mockCursorParser);
      }).toThrow(InvalidCursorPayload);
      expect(decode).toHaveBeenCalledWith(cursorTest);
      expect(decode).toHaveReturnedWith([[null, null, 'a']]);
      expect(decode).toHaveBeenCalledTimes(1);
    });

    it('should throw an error when cursor criterion is not a valid tuple', () => {
      decode.mockImplementation((cursor: unknown) => [null, {}]);
      const cursorTest = 'cursor 2';
      expect(() => {
        Pagination.byCursor(cursorTest, mockCursorParser);
      }).toThrow(InvalidCursorPayload);
      expect(decode).toHaveBeenCalledWith(cursorTest);
      expect(decode).toHaveReturnedWith([null, {}]);
      expect(decode).toHaveBeenCalledTimes(1);
    });

    it('should throw an error when cursor payload is an empty array', () => {
      decode.mockImplementation((cursor: unknown) => []);
      const cursorTest = 'cursor 3';
      expect(() => {
        Pagination.byCursor(cursorTest, mockCursorParser);
      }).toThrow(InvalidCursorPayload);
      expect(decode).toHaveBeenCalledWith(cursorTest);
      expect(decode).toHaveReturnedWith([]);
      expect(decode).toHaveBeenCalledTimes(1);
    });

    it('should throw an error when cursor payload is null', () => {
      decode.mockImplementation((cursor: unknown) => null);
      const cursorTest = 'cursor 4';
      expect(() => {
        Pagination.byCursor(cursorTest, mockCursorParser);
      }).toThrow(InvalidCursorPayload);
      expect(decode).toHaveBeenCalledWith(cursorTest);
      expect(decode).toHaveReturnedWith(null);
      expect(decode).toHaveBeenCalledTimes(1);
    });

    it('should create a valid pagination instance with DESC sort', () => {
      decode.mockImplementation((cursor: unknown) => [
        ['field', 'value', 'DESC'],
      ]);
      const cursorTest = 'cursor 5';
      const result = Pagination.byCursor(cursorTest, mockCursorParser);

      expect(result).toBeInstanceOf(Pagination);
      expect(result.toObjectPlain()).toStrictEqual({
        page: null,
        cursor: [['field', 'value', 'DESC']],
      });
      expect(result.page).toBeNull();
      expect(result.cursor).toStrictEqual([['field', 'value', 'DESC']]);
      expect(decode).toHaveBeenCalledWith(cursorTest);
      expect(decode).toHaveReturnedWith([['field', 'value', 'DESC']]);
      expect(decode).toHaveBeenCalledTimes(1);
    });

    it('should create a valid pagination instance with ASC sort', () => {
      decode.mockImplementation((cursor: unknown) => [['field', 567, 'ASC']]);
      const cursorTest = 'cursor 5';

      const result = Pagination.byCursor(cursorTest, mockCursorParser);

      expect(result).toBeInstanceOf(Pagination);
      expect(result.toObjectPlain()).toStrictEqual({
        page: null,
        cursor: [['field', 567, 'ASC']],
      });
      expect(result.page).toBeNull();
      expect(result.cursor).toStrictEqual([['field', 567, 'ASC']]);
      expect(decode).toHaveBeenCalledWith(cursorTest);
      expect(decode).toHaveReturnedWith([['field', 567, 'ASC']]);
      expect(decode).toHaveBeenCalledTimes(1);
    });
  });
});
