/*
 * Types representing valid JSON values.
 */

import {JsonPrimitive} from './values';

export type JsonReadonlyObject = {readonly [key: string]: JsonReadonlyValue};

export type JsonReadonlyArray = readonly JsonReadonlyValue[];

export type JsonReadonlyStructure = JsonReadonlyArray | JsonReadonlyObject;

export type JsonReadonlyValue = JsonPrimitive | JsonReadonlyStructure;

/*
 * Types that can be converted to JSON.
 */

export type JsonReadonlyCompatibleObject = {readonly [key: string]: JsonReadonlyCompatible};

export type JsonReadonlyCompatibleArray = readonly JsonReadonlyCompatible[];

export type JsonReadonlyCompatibleStructure =
    JsonReadonlyCompatibleArray
    | JsonReadonlyCompatibleObject;

/**
 * A class that can be serialized to JSON.
 */
export type JsonReadonlyConvertible = {
    toJSON(): JsonReadonlyCompatible,
};

/**
 * Any value that can be safely serialized to JSON using `JSON.stringify()`.
 */
export type JsonReadonlyCompatible =
    JsonReadonlyValue
    | JsonReadonlyConvertible
    | JsonReadonlyCompatibleStructure;
