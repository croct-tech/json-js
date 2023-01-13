import {expectAssignable, expectNotAssignable} from 'tsd';
import {JsonValue, ReadonlyJsonValue} from '.';

declare function type<T>(): T;

const fixedSymbol: unique symbol = Symbol('fixed symbol');

export namespace primitiveValues {
    expectAssignable<JsonValue>(null);
    expectAssignable<JsonValue>(123);
    expectAssignable<JsonValue>('foo');
    expectAssignable<JsonValue>(true);
    // Never should always be assignable to anything
    expectAssignable<JsonValue>(type<never>());

    expectNotAssignable<JsonValue>(undefined);
    expectNotAssignable<JsonValue>(type<void>());
    expectNotAssignable<JsonValue>(Symbol('foo'));
    expectNotAssignable<JsonValue>(fixedSymbol);
}

export namespace structures {
    expectAssignable<JsonValue>(type<JsonValue[]>());
    expectNotAssignable<JsonValue>(type<symbol[]>());

    // Explicit type structure
    expectAssignable<JsonValue>(type<{anyProperty: JsonValue}>());
    expectNotAssignable<JsonValue>(type<{notJson: symbol}>());

    // Open-ended records
    expectAssignable<JsonValue>(type<Record<string, JsonValue>>());
    expectNotAssignable<JsonValue>(type<Record<string, symbol>>());
}

export namespace complex {
    type Intersection = {foo: string} & {bar: string};

    expectAssignable<JsonValue>(type<Intersection>());

    type IntersectionWithNonJsonVariant = {foo: string} & {bar: symbol};

    expectNotAssignable<JsonValue>(type<IntersectionWithNonJsonVariant>());

    type DisjointUnion = {foo: string} | {bar: string};

    expectAssignable<JsonValue>(type<DisjointUnion>());

    type DisjointUnionWithNonJsonVariant = {foo: string} | {bar: symbol};

    expectNotAssignable<JsonValue>(type<DisjointUnionWithNonJsonVariant>());

    type DiscriminatedUnion =
        {type: 'foo', foo: string}
        | {type: 'bar', bar: string};

    expectAssignable<JsonValue>(type<DiscriminatedUnion>());

    type DiscriminatedUnionWithNonJsonVariant =
        {type: 'foo', foo: string}
        | {type: 'bar', bar: symbol};

    expectNotAssignable<JsonValue>(type<DiscriminatedUnionWithNonJsonVariant>());

    type MappedVariantMap = {
        foo: {foo: string},
        bar: {bar: string},
    };
    type MappedVariant<K extends keyof MappedVariantMap> = {
        [T in keyof MappedVariantMap]: MappedVariantMap[T] & {type: T}
    }[K];

    expectAssignable<JsonValue>(type<MappedVariant<'foo'>>());
    expectAssignable<JsonValue>(type<MappedVariant<'bar'>>());
    expectAssignable<JsonValue>(type<MappedVariant<keyof MappedVariantMap>>());

    type MappedVariantWithNonJsonVariantMap = {
        foo: {foo: string},
        bar: {bar: symbol},
    };
    type MappedVariantWithNonJsonVariant<K extends keyof MappedVariantWithNonJsonVariantMap> = {
        [T in keyof MappedVariantWithNonJsonVariantMap]: MappedVariantWithNonJsonVariantMap[T] & {type: T}
    }[K];

    expectAssignable<JsonValue>(type<MappedVariantWithNonJsonVariant<'foo'>>());
    expectNotAssignable<JsonValue>(type<MappedVariantWithNonJsonVariant<'bar'>>());
    expectNotAssignable<JsonValue>(
        type<MappedVariantWithNonJsonVariant<keyof MappedVariantWithNonJsonVariantMap>>(),
    );
}

export namespace readonly {
    // Readonly property is only actually validated for arrays:
    // https://github.com/microsoft/TypeScript/issues/13347

    expectNotAssignable<JsonValue>(type<readonly JsonValue[]>());
    // expectNotAssignable<JsonValue>(type<{readonly property: string}>());
    // expectNotAssignable<JsonValue>(type<Readonly<Record<string, JsonValue>>>());

    expectNotAssignable<JsonValue>(type<ReadonlyJsonValue>());
}
