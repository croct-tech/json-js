import {expectAssignable, expectNotAssignable} from 'tsd';
import {JsonCompatible, ReadonlyJsonCompatible} from '.';

declare function type<T>(): T;

const fixedSymbol: unique symbol = Symbol('fixed symbol');

export namespace primitiveValues {
    expectAssignable<ReadonlyJsonCompatible>(null);
    expectAssignable<ReadonlyJsonCompatible>(123);
    expectAssignable<ReadonlyJsonCompatible>('foo');
    expectAssignable<ReadonlyJsonCompatible>(true);
    // Never should always be assignable to anything
    expectAssignable<ReadonlyJsonCompatible>(type<never>());

    expectNotAssignable<ReadonlyJsonCompatible>(undefined);
    expectNotAssignable<ReadonlyJsonCompatible>(type<void>());
    expectNotAssignable<ReadonlyJsonCompatible>(Symbol('foo'));
    expectNotAssignable<ReadonlyJsonCompatible>(fixedSymbol);
}

export namespace structures {
    expectAssignable<ReadonlyJsonCompatible>(type<ReadonlyJsonCompatible[]>());
    expectNotAssignable<ReadonlyJsonCompatible>(type<symbol[]>());

    // Explicit type structure
    expectAssignable<ReadonlyJsonCompatible>(type<{anyProperty: ReadonlyJsonCompatible}>());
    expectNotAssignable<ReadonlyJsonCompatible>(type<{notJson: symbol}>());
    expectNotAssignable<ReadonlyJsonCompatible>(type<{[fixedSymbol]: symbol}>());

    // Open-ended records
    expectAssignable<ReadonlyJsonCompatible>(type<Record<string, ReadonlyJsonCompatible>>());
    expectNotAssignable<ReadonlyJsonCompatible>(type<Record<string, symbol>>());
    expectNotAssignable<ReadonlyJsonCompatible>(type<Record<symbol, ReadonlyJsonCompatible>>());
    expectNotAssignable<ReadonlyJsonCompatible>(type<Record<typeof fixedSymbol, ReadonlyJsonCompatible>>());
}

export namespace complex {
    type Intersection = {foo: string} & {bar: string};

    expectAssignable<ReadonlyJsonCompatible>(type<Intersection>());

    type IntersectionWithNonJsonVariant = {foo: string} & {bar: symbol};

    expectNotAssignable<ReadonlyJsonCompatible>(type<IntersectionWithNonJsonVariant>());

    type DisjointUnion = {foo: string} | {bar: string};

    expectAssignable<ReadonlyJsonCompatible>(type<DisjointUnion>());

    type DiscriminatedUnionWithAbsentDiscriminant =
        {type: 'foo', foo: string}
        | {type: 'bar', bar: string}
        | {type?: never, other: string};

    expectAssignable<ReadonlyJsonCompatible>(type<DiscriminatedUnionWithAbsentDiscriminant>());

    type DisjointUnionWithNonJsonVariant = {foo: string} | {bar: symbol};

    expectNotAssignable<ReadonlyJsonCompatible>(type<DisjointUnionWithNonJsonVariant>());

    type DiscriminatedUnion =
        {type: 'foo', foo: string}
        | {type: 'bar', bar: string};

    expectAssignable<ReadonlyJsonCompatible>(type<DiscriminatedUnion>());

    type DiscriminatedUnionWithNonJsonVariant =
        {type: 'foo', foo: string}
        | {type: 'bar', bar: symbol};

    expectNotAssignable<ReadonlyJsonCompatible>(type<DiscriminatedUnionWithNonJsonVariant>());

    type MappedVariantMap = {
        foo: {foo: string},
        bar: {bar: string},
    };
    type MappedVariant<K extends keyof MappedVariantMap> = {
        [T in keyof MappedVariantMap]: MappedVariantMap[T] & {type: T}
    }[K];

    expectAssignable<ReadonlyJsonCompatible>(type<MappedVariant<'foo'>>());
    expectAssignable<ReadonlyJsonCompatible>(type<MappedVariant<'bar'>>());
    expectAssignable<ReadonlyJsonCompatible>(type<MappedVariant<keyof MappedVariantMap>>());

    type MappedVariantWithNonJsonVariantMap = {
        foo: {foo: string},
        bar: {bar: symbol},
    };
    type MappedVariantWithNonJsonVariant<K extends keyof MappedVariantWithNonJsonVariantMap> = {
        [T in keyof MappedVariantWithNonJsonVariantMap]: MappedVariantWithNonJsonVariantMap[T] & {type: T}
    }[K];

    expectAssignable<ReadonlyJsonCompatible>(type<MappedVariantWithNonJsonVariant<'foo'>>());
    expectNotAssignable<ReadonlyJsonCompatible>(type<MappedVariantWithNonJsonVariant<'bar'>>());
    expectNotAssignable<ReadonlyJsonCompatible>(
        type<MappedVariantWithNonJsonVariant<keyof MappedVariantWithNonJsonVariantMap>>(),
    );
}

export namespace readonly {
    expectAssignable<ReadonlyJsonCompatible>(type<readonly ReadonlyJsonCompatible[]>());
    expectAssignable<ReadonlyJsonCompatible>(type<{readonly property: string}>());
    expectAssignable<ReadonlyJsonCompatible>(type<Readonly<Record<string, ReadonlyJsonCompatible>>>());

    expectAssignable<ReadonlyJsonCompatible>(type<JsonCompatible>());
}

export namespace jsonConversion {
    interface IntoJson {
        tag: symbol;
        toJSON(): ReadonlyJsonCompatible;
    }

    expectAssignable<ReadonlyJsonCompatible>(type<IntoJson>());
}
