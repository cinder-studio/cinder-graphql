"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Query_MockListWithOverrides = exports.Query_MockReadWithOverrides = exports.Mutate_MockUpdateWithOverrides = exports.Mutate_MockCreateOverrides = exports.Mutate_MockCreateWithRequiredInternalOnlyData = exports.Mutate_MockDeleteDefault = exports.Mutate_MockUpdateDefault = exports.Mutate_MockCreateDefault = exports.Query_MockListDefault = exports.Query_MockReadDefault = void 0;
const graphql_1 = require("graphql");
const commonSchema_1 = require("../../../commonSchema");
const FirebaseGraphqlCodec_1 = require("../../../dbCodecs/FirebaseGraphqlCodec");
const fbGqlCodec = new FirebaseGraphqlCodec_1.default({
    displayShortname: 'MockGqlCodec',
    collectionName: 'MockGqlCodec',
    description: 'A Mock Description',
    rVer: 1,
    fields: {
        normalStringField: { type: graphql_1.GraphQLString, isRequired: true, defaultValue: null, description: "normalStringField" },
        normalNumberField: { type: commonSchema_1.GraphQLLong, isRequired: true, defaultValue: null, description: "normalNumberField" },
        //normalArrayField: { type: GraphQLString, isRequired:true, defaultValue: null, description: "normalArrayField"},
        //normalMapField: { type: GraphQLString, isRequired:true, defaultValue: null, description: "normalMapField"},
        secretStringField: { type: graphql_1.GraphQLString, isRequired: false, isInternalOnly: true, defaultValue: null, description: "secretStringField" },
        secretAndRequiredStringField: { type: graphql_1.GraphQLString, isRequired: true, isInternalOnly: true, defaultValue: null, description: "secretStringField" },
        //createViewableButUnstoreableStringField: {...} // DO NOT STORE THIS
        //calculatedButUnstoreableStringField: {...} // DO NOT STORE THIS
    }
});
// Let's verify all the default behaviors
exports.Query_MockReadDefault = fbGqlCodec.readOneCodec({
    description: "read a record in the mock database",
});
exports.Query_MockListDefault = fbGqlCodec.listPaginatedCodec({
    description: "list records in the mock database",
    defaultListLimit: 20,
    orderListBy: [{ name: "createdAt", dir: "DESCENDING", type: "string" }, { name: "id", dir: "ASCENDING", type: "string" }]
});
exports.Mutate_MockCreateDefault = fbGqlCodec.createOneCodec({
    description: "create a record in the mock database"
});
exports.Mutate_MockUpdateDefault = fbGqlCodec.updateOneCodec({
    description: "update a record in the mock database",
});
exports.Mutate_MockDeleteDefault = fbGqlCodec.deleteOneCodec({
    description: "delete a record in the mock database",
});
// Let's make some basic overrides for required and internal fields
exports.Mutate_MockCreateWithRequiredInternalOnlyData = fbGqlCodec.createOneCodec({
    description: "create a record in the mock database",
    overrideResolve: (defaultResolve) => ((source, args, context, info) => __awaiter(void 0, void 0, void 0, function* () {
        return (yield defaultResolve(source, Object.assign(Object.assign({}, args), { secretAndRequiredStringField: 'mock-secretAndRequiredData' }), context, info));
    }))
});
// Let's make some complex override behaviors
exports.Mutate_MockCreateOverrides = fbGqlCodec.createOneCodec({
    description: "create a record in the mock database using an override configuration",
    overrideType: (defaultReturnTypeConfig) => {
        return {
            name: 'MockGqlCodecCreateResult',
            fields: Object.assign(Object.assign({}, defaultReturnTypeConfig.fields), { 
                // adding one field here to the normal outputs of create
                createViewableButUnstoreableStringField: { type: graphql_1.GraphQLNonNull(graphql_1.GraphQLString), description: "createViewableButUnstoreableStringField" } })
        };
    },
    overrideArgs: (defaultArgsList) => {
        // secret field should never be an Arg for create (it's calculated)
        delete (defaultArgsList.secretStringField);
        return defaultArgsList;
    },
    overrideResolve: (defaultResolve) => ((source, args, context, info) => __awaiter(void 0, void 0, void 0, function* () {
        const calculatedArgs = Object.assign(Object.assign({}, args), { 
            //calculated
            secretStringField: 'mock-secretStringField', secretAndRequiredStringField: 'mock-secretAndRequiredData' });
        return Object.assign(Object.assign({}, yield defaultResolve(source, calculatedArgs, context, info)), { 
            // only revealed at create time
            createViewableButUnstoreableStringField: 'mock-createViewableButUnstoreableStringField' });
    }))
});
exports.Mutate_MockUpdateWithOverrides = fbGqlCodec.updateOneCodec({
    description: "update a record in the mock database using an override configuration",
    overrideType: (defaultReturnTypeConfig) => {
        return {
            name: 'MockGqlCodecUpdateResult',
            fields: Object.assign(Object.assign({}, defaultReturnTypeConfig.fields), { 
                // adding one field here to the normal outputs of update
                calculatedButUnstoreableStringField: { type: graphql_1.GraphQLNonNull(graphql_1.GraphQLString), description: "calculatedButUnstoreableStringField" } })
        };
    },
    overrideArgs: (defaultArgsList) => {
        // secret field should never be an Arg for create (it's calculated)
        delete (defaultArgsList.secretStringField);
        return Object.assign(Object.assign({}, defaultArgsList), { normalStringField: { type: graphql_1.GraphQLNonNull(graphql_1.GraphQLString), description: "normalStringField is required in this format of update" } });
    },
    overrideResolve: (defaultResolve) => ((source, args, context, info) => __awaiter(void 0, void 0, void 0, function* () {
        return Object.assign(Object.assign({}, yield defaultResolve(source, args, context, info)), { 
            // only revealed at update time
            calculatedButUnstoreableStringField: 'mock-calculatedButUnstoreableStringField' });
    }))
});
//TODO is there anything to do for DELETE?
exports.Query_MockReadWithOverrides = fbGqlCodec.readOneCodec({
    description: "read a record in the mock database using an override configuration",
    overrideType: (defaultReturnTypeConfig) => {
        // secret field should never be an item retrievable from a read
        delete (defaultReturnTypeConfig.fields.secretStringField);
        return {
            name: 'MockGqlCodecOverride',
            fields: Object.assign(Object.assign({}, defaultReturnTypeConfig.fields), { 
                // adding one field here to the normal outputs of read
                calculatedButUnstoreableStringField: { type: graphql_1.GraphQLNonNull(graphql_1.GraphQLString), description: "calculatedButUnstoreableStringField" } })
        };
    },
    // TODO maybe I'm wrong?
    // READ mode will only ever need args in the form of "ID"
    // overrideArgs: (defaultArgsList) => ({}),
    overrideResolve: (defaultResolve) => ((source, args, context, info) => __awaiter(void 0, void 0, void 0, function* () {
        return Object.assign(Object.assign({}, yield defaultResolve(source, args, context, info)), { 
            // never stored but revealed at read time
            calculatedButUnstoreableStringField: 'mock-calculatedButUnstoreableStringField' });
    }))
});
//TODO incomplete
exports.Query_MockListWithOverrides = fbGqlCodec.listPaginatedCodec({
    description: "list records in the mock database using an override configuration",
    defaultListLimit: 20,
    orderListBy: [{ name: "createdAt", dir: "desc", type: "string" }, { name: "id", dir: "asc", type: "string" }],
    overrideType: (defaultReturnTypeConfig) => {
        // secret field should never be an item retrievable from a read
        delete (defaultReturnTypeConfig.fields.secretStringField);
        return {
            //TODO can this have the same name as read?
            name: 'MockGqlCodecListItemOverride',
            fields: Object.assign(Object.assign({}, defaultReturnTypeConfig.fields), { 
                // adding one field here to the normal outputs of read
                calculatedButUnstoreableStringField: { type: graphql_1.GraphQLNonNull(graphql_1.GraphQLString), description: "calculatedButUnstoreableStringField" } })
        };
    },
    overrideArgs: (defaultArgsList) => {
        return Object.assign(Object.assign({}, defaultArgsList), { query: { type: graphql_1.GraphQLNonNull(graphql_1.GraphQLString), description: "your query string" } });
    },
    overrideResolve: (defaultResolve) => ((source, args, context, info) => __awaiter(void 0, void 0, void 0, function* () {
        if (!args.query) {
            throw new Error("there should have been a query in these args");
        }
        return (yield defaultResolve(source, args, context, info)).map(result => (Object.assign(Object.assign({}, result), { 
            // never stored but revealed at read time
            calculatedButUnstoreableStringField: 'mock-calculatedButUnstoreableStringField' })));
    }))
});
//# sourceMappingURL=index.js.map