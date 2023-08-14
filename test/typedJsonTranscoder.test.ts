import {JsonValue} from '../src';
import {CustomTypeEncodingMap, TypedJsonTranscoder} from '../src/typedJsonTranscoder';

describe('A type-aware schemaless JSON compatible encoder', () => {
    type ValidScenario = {
        encodings: CustomTypeEncodingMap,
        originalValue: any,
        encodedValue: JsonValue,
    };

    it.each(Object.entries<ValidScenario>({
        'string values': {
            encodings: {},
            originalValue: 'some string',
            encodedValue: 'some string',
        },
        'number values': {
            encodings: {},
            originalValue: 123,
            encodedValue: 123,
        },
        'boolean values': {
            encodings: {},
            originalValue: true,
            encodedValue: true,
        },
        'null values': {
            encodings: {},
            originalValue: null,
            encodedValue: null,
        },
        'simple arrays': {
            encodings: {},
            originalValue: ['a', 1, true, null],
            encodedValue: ['a', 1, true, null],
        },
        'plain objects': {
            encodings: {},
            originalValue: {
                a: 'a',
                b: 123,
                c: true,
                d: null,
            },
            encodedValue: {
                type: '__rawObject__',
                value: {
                    a: 'a',
                    b: 123,
                    c: true,
                    d: null,
                },
            },
        },
        'nested arrays': {
            encodings: {},
            originalValue: [[123], 456],
            encodedValue: [[123], 456],
        },
        'nested objects': {
            encodings: {},
            originalValue: {val: {foo: 'bar'}},
            encodedValue: {
                type: '__rawObject__',
                value: {
                    val: {
                        type: '__rawObject__',
                        value: {
                            foo: 'bar',
                        },
                    },
                },
            },
        },
        'custom type': {
            encodings: {
                date: {
                    reference: Date,
                    encode: (date: Date) => date.valueOf(),
                    decode: (millis: number) => new Date(millis),
                },
            },
            originalValue: new Date(123),
            encodedValue: {
                type: 'date',
                value: 123000,
            },
        },
        'nested custom type': {
            encodings: {
                date: {
                    reference: Date,
                    encode: (date: Date) => date.valueOf(),
                    decode: (millis: number) => new Date(millis),
                },
            },
            originalValue: {
                start: new Date(123),
            },
            encodedValue: {
                type: '__rawObject__',
                value: {
                    start: {
                        type: 'instant',
                        value: 123000,
                    },
                },
            },
        },
        'multiple custom types': {
            encodings: {
                date: {
                    reference: Date,
                    encode: (date: Date) => date.valueOf(),
                    decode: (millis: number) => new Date(millis),
                },
                namedSymbol: {
                    reference: Symbol,
                    encode: (id: symbol) => {
                        const value = Symbol.keyFor(id);

                        assert.ok(value);
                    },
                    decode: Symbol.for,
                },
            },
            originalValue: {
                organization: OrganizationId.fromString('cdc4d56b-d0fd-44de-815b-5303683c1b11'),
                workspace: WorkspaceId.fromString('f90c398d-753b-4e19-a9ab-9032bc0f3323'),
            },
            encodedValue: {
                type: '__rawObject__',
                value: {
                    organization: {
                        type: 'organizationId',
                        value: 'cdc4d56b-d0fd-44de-815b-5303683c1b11',
                    },
                    workspace: {
                        type: 'workspaceId',
                        value: 'f90c398d-753b-4e19-a9ab-9032bc0f3323',
                    },
                },
            },
        },
    }))('should encode and decode %s', (_, scenario) => {
        const transcoder = new TypedJsonTranscoder(scenario.encodings);

        const encoded = transcoder.encode(scenario.originalValue);
        const decoded = transcoder.decode(encoded);

        expect(decoded).toStrictEqual(scenario.originalValue);

        expect(encoded).toStrictEqual(scenario.encodedValue);
    });
});
