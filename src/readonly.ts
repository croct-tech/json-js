/*
 * Types representing valid JSON values.
 */

import {JsonPrimitive} from './mutable';

export type ReadonlyJsonObject = {readonly [key: string]: ReadonlyJsonValue};

export type ReadonlyJsonArray = readonly ReadonlyJsonValue[];

export type ReadonlyJsonStructure = ReadonlyJsonArray | ReadonlyJsonObject;

export type ReadonlyJsonValue = JsonPrimitive | ReadonlyJsonStructure;

/*
 * Types that can be converted to JSON.
 */

export type ReadonlyJsonCompatibleObject = {readonly [key: string]: ReadonlyJsonCompatible};

export type ReadonlyJsonCompatibleArray = readonly ReadonlyJsonCompatible[];

export type ReadonlyJsonCompatibleStructure =
    ReadonlyJsonCompatibleArray
    | ReadonlyJsonCompatibleObject;

/**
 * A class that can be serialized to JSON.
 */
export type ReadonlyJsonConvertible = {
    toJSON(): ReadonlyJsonCompatible,
};

/**
 * Any value that can be safely serialized to JSON using `JSON.stringify()`.
 */
export type ReadonlyJsonCompatible =
    ReadonlyJsonValue
    | ReadonlyJsonConvertible
    | ReadonlyJsonCompatibleStructure;
