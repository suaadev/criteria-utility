import { CursorSerializer } from '../cursor-serializers/cursor-serializer.js';
import { CursorPayload } from '../pagination.js';

export class CursorBase64Serializer implements CursorSerializer<
  CursorPayload,
  string
> {
  encode(cursorPayload: CursorPayload): string {
    const cursorPayloadInJSONFormat: string = JSON.stringify(cursorPayload);

    const cursorInBase64: string = Buffer.from(
      cursorPayloadInJSONFormat,
    ).toString('base64');

    return cursorInBase64;
  }

  decode(cursor: string): CursorPayload {
    if (typeof cursor !== 'string') {
      throw new Error('The cursor format is invalid, must be a string base64');
    }

    const cursorInUtf8 = Buffer.from(cursor, 'base64').toString('utf-8');
    const cursorPayload = JSON.parse(cursorInUtf8) as unknown;
    return cursorPayload as CursorPayload;
  }
}
