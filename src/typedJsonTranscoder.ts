import {TUnsafe, Type} from '@sinclair/typebox';
import {TypeCompiler} from '@sinclair/typebox/compiler';
import {JsonObject, JsonPrimitive, JsonValue} from './mutable';

type Converter<A, B> = (value: A) => B;

export type CustomTypeEncoding<T extends object, J extends JsonValue> = {
    reference: {prototype: T},
    encode: Converter<T, J>,
    decode: Converter<J, T>,
};

export type CustomTypeEncodingMap = Record<string, CustomTypeEncoding<any, any>>;

type CustomTyping<T, J extends JsonValue> = {
    custom: T,
    json: J,
};

type CustomTypingMap = Record<string, CustomTyping<any, any>>;

type EncodingFromTyping<T extends CustomTyping<any, any>> = CustomTypeEncoding<T['custom'], T['json']>;

type EncodingFromTypingMap<M extends CustomTypingMap> = {
    [K in keyof M]: EncodingFromTyping<M[K]>
};

type CustomTypesOf<M extends CustomTypingMap> = {
    [K in keyof M]: M[K]['custom']
}[keyof M];

type BaseValues<T> = JsonPrimitive | T;

type CustomArray<T> = Array<CustomValue<T>>;

type CustomObject<T> = {
    [key: string]: CustomValue<T> | undefined,
} & {
    // Values must either be a typed custom objects, literals or null constructed objects.
    // prototype: ObjectConstructor | null,
};

type CustomStructure<T> = CustomArray<T> | CustomObject<T>;

type CustomValue<T> = BaseValues<T> | CustomStructure<T>;

type MappedCustomValue<M extends CustomTypingMap> = CustomValue<CustomTypesOf<M>>;

namespace CustomTypeEncodingMap {
    type NamedEncoder= {
        name: string,
        encode: Converter<unknown, JsonValue>,
    };

    export type Encoders = Map<object, NamedEncoder>;
    export type Decoders = Map<string, Converter<JsonValue, any>>;

    export function getEncoders(encodings: CustomTypeEncodingMap): Encoders {
        const map: Encoders = new Map();

        for (const [name, {reference, encode}] of Object.entries(encodings)) {
            map.set(reference.prototype, {
                name: name,
                encode: encode,
            });
        }

        return map;
    }

    export function getDecoders(encodings: CustomTypeEncodingMap): Decoders {
        const map: Decoders = new Map();

        for (const [name, {decode}] of Object.entries(encodings)) {
            map.set(name, decode);
        }

        return map;
    }
}

export class TypedJsonTranscoder<M extends CustomTypingMap> {
    private readonly encoders: CustomTypeEncodingMap.Encoders;

    private readonly decoders: CustomTypeEncodingMap.Decoders;

    private static ENCODED_OBJECT_VALIDATOR = TypeCompiler.Compile(Type.Object({
        type: Type.String(),
        value: Type.Unknown() as TUnsafe<JsonValue>,
    }));

    public constructor(encoding: EncodingFromTypingMap<M>) {
        this.encoders = CustomTypeEncodingMap.getEncoders(encoding);
        this.decoders = CustomTypeEncodingMap.getDecoders(encoding);
    }

    public encode(value: MappedCustomValue<M>): JsonValue {
        if (typeof value !== 'object') {
            return value;
        }

        if (value === null) {
            return null;
        }

        if (Array.isArray(value)) {
            return value.map(item => this.encode(item));
        }

        const prototype = Object.getPrototypeOf(value);

        if (Object.is(prototype, Object.prototype) || prototype === null) {
            // Raw literal or null created object
            const newObject: JsonObject = {};

            for (const [key, propValue] of Object.entries(value)) {
                if (propValue === undefined) {
                    continue;
                }

                newObject[key] = this.encode(propValue);
            }

            return {
                type: '__rawObject__',
                value: newObject,
            };
        }

        const customEncoder = this.encoders.get(prototype);

        if (customEncoder === undefined) {
            // This can happen due to structural typing, a value of class A can be passed as a value of class B
            // if class A defines compatible public methods to class B and class B has no non-public properties
            // or methods.
            throw new Error('Unsupported custom type.');
        }

        return {
            type: customEncoder.name,
            value: customEncoder.encode(value),
        };
    }

    public decode(value: JsonValue): MappedCustomValue<M> {
        if (typeof value !== 'object') {
            return value;
        }

        if (value === null) {
            return null;
        }

        if (Array.isArray(value)) {
            return value.map(item => this.decode(item));
        }

        if (!TypedJsonTranscoder.ENCODED_OBJECT_VALIDATOR.Check(value)) {
            throw new Error('Incorrectly encoded value.');
        }

        const {type, value: encodedValue} = value;

        if (type === '__rawObject__') {
            // Raw literal or null created object
            const newObject = {} as CustomObject<CustomTypesOf<M>>;

            for (const [key, propValue] of Object.entries(encodedValue as JsonObject)) {
                if (propValue === undefined) {
                    continue;
                }

                newObject[key] = this.decode(propValue);
            }

            return newObject;
        }

        const customDecoder = this.decoders.get(type);

        if (customDecoder === undefined) {
            // This can happen due to structural typing, a value of class A can be passed as a value of class B
            // if class A defines compatible public methods to class B and class B has no non-public properties
            // or methods.
            throw new Error('Unsupported custom type.');
        }

        return customDecoder(encodedValue);
    }
}
