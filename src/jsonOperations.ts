import type {JsonValue} from './mutable';
import type {ReadonlyJsonCompatible} from './readonly';

export const parseJson: (jsonString: string) => JsonValue = JSON.parse;

export const serializeJson: (jsonValue: ReadonlyJsonCompatible) => string = JSON.stringify;
