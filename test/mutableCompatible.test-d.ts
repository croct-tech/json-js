import {expectAssignable, expectNotAssignable} from 'tsd';
import {JsonCompatible, ReadonlyJsonCompatible} from '.';

declare function type<T>(): T;

const fixedSymbol: unique symbol = Symbol('fixed symbol');

export namespace primitiveValues {
    expectAssignable<JsonCompatible>(null);
    expectAssignable<JsonCompatible>(123);
    expectAssignable<JsonCompatible>('foo');
    expectAssignable<JsonCompatible>(true);
    // Never should always be assignable to anything
    expectAssignable<JsonCompatible>(type<never>());

    expectNotAssignable<JsonCompatible>(undefined);
    expectNotAssignable<JsonCompatible>(type<void>());
    expectNotAssignable<JsonCompatible>(Symbol('foo'));
    expectNotAssignable<JsonCompatible>(fixedSymbol);
}

export namespace structures {
    expectAssignable<JsonCompatible>(type<JsonCompatible[]>());
    expectNotAssignable<JsonCompatible>(type<symbol[]>());

    // Explicit type structure
    expectAssignable<JsonCompatible>(type<{anyProperty: JsonCompatible}>());
    expectNotAssignable<JsonCompatible>(type<{notJson: symbol}>());
    expectNotAssignable<JsonCompatible>(type<{[fixedSymbol]: symbol}>());

    // Open-ended records
    expectAssignable<JsonCompatible>(type<Record<string, JsonCompatible>>());
    expectNotAssignable<JsonCompatible>(type<Record<string, symbol>>());
    expectNotAssignable<JsonCompatible>(type<Record<symbol, JsonCompatible>>());
    expectNotAssignable<JsonCompatible>(type<Record<typeof fixedSymbol, JsonCompatible>>());
}

export namespace complex {
    type Intersection = {foo: string} & {bar: string};

    expectAssignable<JsonCompatible>(type<Intersection>());

    type IntersectionWithNonJsonVariant = {foo: string} & {bar: symbol};

    expectNotAssignable<JsonCompatible>(type<IntersectionWithNonJsonVariant>());

    type DisjointUnion = {foo: string} | {bar: string};

    expectAssignable<JsonCompatible>(type<DisjointUnion>());

    type DisjointUnionWithNonJsonVariant = {foo: string} | {bar: symbol};

    expectNotAssignable<JsonCompatible>(type<DisjointUnionWithNonJsonVariant>());

    type DiscriminatedUnion =
        {type: 'foo', foo: string}
        | {type: 'bar', bar: string};

    expectAssignable<JsonCompatible>(type<DiscriminatedUnion>());

    type DiscriminatedUnionWithAbsentDiscriminant =
        {type: 'foo', foo: string}
        | {type: 'bar', bar: string}
        | {type?: never, other: string};

    expectAssignable<JsonCompatible>(type<DiscriminatedUnionWithAbsentDiscriminant>());

    type DiscriminatedUnionWithNonJsonVariant =
        {type: 'foo', foo: string}
        | {type: 'bar', bar: symbol};

    expectNotAssignable<JsonCompatible>(type<DiscriminatedUnionWithNonJsonVariant>());

    type MappedVariantMap = {
        foo: {foo: string},
        bar: {bar: string},
    };
    type MappedVariant<K extends keyof MappedVariantMap> = {
        [T in keyof MappedVariantMap]: MappedVariantMap[T] & {type: T}
    }[K];

    expectAssignable<JsonCompatible>(type<MappedVariant<'foo'>>());
    expectAssignable<JsonCompatible>(type<MappedVariant<'bar'>>());
    expectAssignable<JsonCompatible>(type<MappedVariant<keyof MappedVariantMap>>());

    type OptionalProperty = {foo?: string};

    expectAssignable<JsonCompatible>(type<OptionalProperty>());

    type MappedVariantWithNonJsonVariantMap = {
        foo: {foo: string},
        bar: {bar: symbol},
    };
    type MappedVariantWithNonJsonVariant<K extends keyof MappedVariantWithNonJsonVariantMap> = {
        [T in keyof MappedVariantWithNonJsonVariantMap]: MappedVariantWithNonJsonVariantMap[T] & {type: T}
    }[K];

    expectAssignable<JsonCompatible>(type<MappedVariantWithNonJsonVariant<'foo'>>());
    expectNotAssignable<JsonCompatible>(type<MappedVariantWithNonJsonVariant<'bar'>>());
    expectNotAssignable<JsonCompatible>(
        type<MappedVariantWithNonJsonVariant<keyof MappedVariantWithNonJsonVariantMap>>(),
    );
}

export namespace readonly {
    // Readonly property is only actually validated for arrays:
    // https://github.com/microsoft/TypeScript/issues/13347

    expectNotAssignable<JsonCompatible>(type<readonly JsonCompatible[]>());
    // expectNotAssignable<JsonCompatible>(type<{readonly property: string}>());
    // expectNotAssignable<JsonCompatible>(type<Readonly<Record<string, JsonCompatible>>>());

    expectNotAssignable<JsonCompatible>(type<ReadonlyJsonCompatible>());
}

export namespace jsonConversion {
    interface IntoJson {
        tag: symbol;
        toJSON(): JsonCompatible;
    }

    expectAssignable<JsonCompatible>(type<IntoJson>());
}
