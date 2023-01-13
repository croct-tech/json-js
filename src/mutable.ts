/*
 * Types representing valid JSON values.
 */

export type JsonPrimitive = string | number | boolean | null;

export type JsonObject = Partial<{
    [key: string]: JsonValue,
    [key: symbol]: never,
}>;

export type JsonArray = JsonValue[];

export type JsonStructure = JsonArray | JsonObject;

export type JsonValue = JsonPrimitive | JsonStructure;

/*
 * Types that can be converted to JSON.
 */

export type JsonCompatibleObject = Partial<{
    [key: string]: JsonCompatible,
    [key: symbol]: never,
}>;

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
    JsonPrimitive
    | JsonConvertible
    | JsonCompatibleStructure;
