import {JsonValue} from './mutable';
import {ReadonlyJsonValue} from './readonly';

export const typeSafeJsonParse: (jsonString: string) => JsonValue = JSON.parse;

export const typedSafeStringify: (jsonValue: ReadonlyJsonValue) => string = JSON.stringify;
