/*
 * Types representing valid JSON values.
 */

export type JsonPrimitive = string | number | boolean | null;

export type JsonObject = {[key: string]: JsonValue};

export type JsonArray = JsonValue[];

export type JsonStructure = JsonArray | JsonObject;

export type JsonValue = JsonPrimitive | JsonStructure;

/*
 * Types that can be converted to JSON.
 */

export type JsonCompatibleObject = {[key: string]: JsonCompatible};

export type JsonCompatibleArray = JsonCompatible[];

export type JsonCompatibleStructure = JsonCompatibleArray | JsonCompatibleObject;

/**
 * A class that can be serialized to JSON.
 */
export type JsonConvertible = {
    toJSON(): JsonCompatible,
};

/**
 * Any value that can be safely serialized to JSON using `JSON.stringify()`.
 */
export type JsonCompatible =
    JsonValue
    | JsonConvertible
    | JsonCompatibleStructure;
