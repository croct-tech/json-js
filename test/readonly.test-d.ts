import {expectAssignable, expectNotAssignable} from 'tsd';
import {JsonValue, ReadonlyJsonValue} from '.';

declare function type<T>(): T;

const fixedSymbol: unique symbol = Symbol('fixed symbol');

export namespace primitiveValues {
    expectAssignable<ReadonlyJsonValue>(null);
    expectAssignable<ReadonlyJsonValue>(123);
    expectAssignable<ReadonlyJsonValue>('foo');
    expectAssignable<ReadonlyJsonValue>(true);
    // Never should always be assignable to anything
    expectAssignable<ReadonlyJsonValue>(type<never>());

    expectNotAssignable<ReadonlyJsonValue>(undefined);
    expectNotAssignable<ReadonlyJsonValue>(type<void>());
    expectNotAssignable<ReadonlyJsonValue>(Symbol('foo'));
    expectNotAssignable<ReadonlyJsonValue>(fixedSymbol);
}

export namespace structures {
    expectAssignable<ReadonlyJsonValue>(type<ReadonlyJsonValue[]>());
    expectNotAssignable<ReadonlyJsonValue>(type<symbol[]>());

    // Explicit type structure
    expectAssignable<ReadonlyJsonValue>(type<{anyProperty: ReadonlyJsonValue}>());
    expectNotAssignable<ReadonlyJsonValue>(type<{notJson: symbol}>());
    expectNotAssignable<ReadonlyJsonValue>(type<{[fixedSymbol]: symbol}>());

    // Open-ended records
    expectAssignable<ReadonlyJsonValue>(type<Record<string, ReadonlyJsonValue>>());
    expectNotAssignable<ReadonlyJsonValue>(type<Record<string, symbol>>());
    expectNotAssignable<ReadonlyJsonValue>(type<Record<symbol, ReadonlyJsonValue>>());
    expectNotAssignable<ReadonlyJsonValue>(type<Record<typeof fixedSymbol, ReadonlyJsonValue>>());
}

export namespace complex {
    type Intersection = {foo: string} & {bar: string};

    expectAssignable<ReadonlyJsonValue>(type<Intersection>());

    type IntersectionWithNonJsonVariant = {foo: string} & {bar: symbol};

    expectNotAssignable<ReadonlyJsonValue>(type<IntersectionWithNonJsonVariant>());

    type DisjointUnion = {foo: string} | {bar: string};

    expectAssignable<ReadonlyJsonValue>(type<DisjointUnion>());

    type DiscriminatedUnionWithAbsentDiscriminant =
        {type: 'foo', foo: string}
        | {type: 'bar', bar: string}
        | {type?: never, other: string};

    expectAssignable<ReadonlyJsonValue>(type<DiscriminatedUnionWithAbsentDiscriminant>());

    type DisjointUnionWithNonJsonVariant = {foo: string} | {bar: symbol};

    expectNotAssignable<ReadonlyJsonValue>(type<DisjointUnionWithNonJsonVariant>());

    type DiscriminatedUnion =
        {type: 'foo', foo: string}
        | {type: 'bar', bar: string};

    expectAssignable<ReadonlyJsonValue>(type<DiscriminatedUnion>());

    type DiscriminatedUnionWithNonJsonVariant =
        {type: 'foo', foo: string}
        | {type: 'bar', bar: symbol};

    expectNotAssignable<ReadonlyJsonValue>(type<DiscriminatedUnionWithNonJsonVariant>());

    type MappedVariantMap = {
        foo: {foo: string},
        bar: {bar: string},
    };
    type MappedVariant<K extends keyof MappedVariantMap> = {
        [T in keyof MappedVariantMap]: MappedVariantMap[T] & {type: T}
    }[K];

    expectAssignable<ReadonlyJsonValue>(type<MappedVariant<'foo'>>());
    expectAssignable<ReadonlyJsonValue>(type<MappedVariant<'bar'>>());
    expectAssignable<ReadonlyJsonValue>(type<MappedVariant<keyof MappedVariantMap>>());

    type OptionalProperty = {foo?: string};

    expectAssignable<ReadonlyJsonValue>(type<OptionalProperty>());

    type MappedVariantWithNonJsonVariantMap = {
        foo: {foo: string},
        bar: {bar: symbol},
    };
    type MappedVariantWithNonJsonVariant<K extends keyof MappedVariantWithNonJsonVariantMap> = {
        [T in keyof MappedVariantWithNonJsonVariantMap]: MappedVariantWithNonJsonVariantMap[T] & {type: T}
    }[K];

    expectAssignable<ReadonlyJsonValue>(type<MappedVariantWithNonJsonVariant<'foo'>>());
    expectNotAssignable<ReadonlyJsonValue>(type<MappedVariantWithNonJsonVariant<'bar'>>());
    expectNotAssignable<ReadonlyJsonValue>(
        type<MappedVariantWithNonJsonVariant<keyof MappedVariantWithNonJsonVariantMap>>(),
    );
}

export namespace readonly {
    expectAssignable<ReadonlyJsonValue>(type<readonly ReadonlyJsonValue[]>());
    expectAssignable<ReadonlyJsonValue>(type<{readonly property: string}>());
    expectAssignable<ReadonlyJsonValue>(type<Readonly<Record<string, ReadonlyJsonValue>>>());

    expectAssignable<ReadonlyJsonValue>(type<JsonValue>());
}

export namespace jsonConversion {
    interface IntoJson {
        tag: symbol;
        toJSON(): ReadonlyJsonValue;
    }

    expectNotAssignable<ReadonlyJsonValue>(type<IntoJson>());
}
