"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Interface_IDatabaseApiRecord = exports.Interface_IDatabaseRecord = exports.Interface_IDatabaseRecord_ApiFields = exports.Interface_IDatabaseRecord_DatabaseFields = exports.Type_DeleteMutationResult = exports.Type_DeleteMutationResultConfig = exports.Type_UpdateMutationResult = exports.Type_UpdateMutationResultConfig = exports.Type_CreateMutationResult = exports.Type_CreateMutationResultConfig = exports.GraphQLLong = void 0;
const graphql_1 = require("graphql");
const GQLLong = require("graphql-type-long");
exports.GraphQLLong = GQLLong;
exports.Type_CreateMutationResultConfig = {
    name: 'CreateMutationResult',
    description: "The ID of the record created",
    fields: {
        id: { type: graphql_1.GraphQLNonNull(graphql_1.GraphQLString), description: "System-wide unique identifier for this record" }
    }
};
exports.Type_CreateMutationResult = new graphql_1.GraphQLObjectType(exports.Type_CreateMutationResultConfig);
exports.Type_UpdateMutationResultConfig = {
    name: 'UpdateMutationResult',
    description: "The ID of the record updated",
    fields: {
        id: { type: graphql_1.GraphQLNonNull(graphql_1.GraphQLString), description: "System-wide unique identifier for this record" }
    }
};
exports.Type_UpdateMutationResult = new graphql_1.GraphQLObjectType(exports.Type_UpdateMutationResultConfig);
exports.Type_DeleteMutationResultConfig = {
    name: 'DeleteMutationResult',
    description: "The ID of the record deleted",
    fields: {
        id: { type: graphql_1.GraphQLNonNull(graphql_1.GraphQLString), description: "System-wide unique identifier for this record" }
    }
};
exports.Type_DeleteMutationResult = new graphql_1.GraphQLObjectType(exports.Type_DeleteMutationResultConfig);
exports.Interface_IDatabaseRecord_DatabaseFields = {
    id: { type: graphql_1.GraphQLNonNull(graphql_1.GraphQLString), description: "System-wide unique identifier for this record" },
    createdAt: { type: graphql_1.GraphQLNonNull(exports.GraphQLLong), description: "Unix timestamp recording the moment this record was created" },
    updatedAt: { type: graphql_1.GraphQLNonNull(exports.GraphQLLong), description: "Unix timestamp recording the moment this record was last updated" },
    deletedAt: { type: exports.GraphQLLong, description: "Null when the record is not deleted. Unix timestamp recording the moment this record was moved to the trash" },
    // rVer: { type: GraphQLNonNull(GraphQLInt), description: "An internal utility property" }
};
exports.Interface_IDatabaseRecord_ApiFields = {
    id: { type: graphql_1.GraphQLNonNull(graphql_1.GraphQLString), description: "System-wide unique identifier for this record" },
    createdAt: { type: graphql_1.GraphQLNonNull(exports.GraphQLLong), description: "Unix timestamp recording the moment this record was created" },
    updatedAt: { type: graphql_1.GraphQLNonNull(exports.GraphQLLong), description: "Unix timestamp recording the moment this record was last updated" },
    deletedAt: { type: exports.GraphQLLong, description: "Null when the record is not deleted. Unix timestamp recording the moment this record was moved to the trash" },
    // Purposefully not revealed on the API
    //rVer: { type: GraphQLNonNull(GraphQLInt), description: "An internal utility property" }
};
exports.Interface_IDatabaseRecord = new graphql_1.GraphQLInterfaceType({
    name: 'IDatabaseRecord',
    // Purposefully not revealed on the API
    // description: "This record is stored in a database on our systems",
    fields: exports.Interface_IDatabaseRecord_DatabaseFields
});
exports.Interface_IDatabaseApiRecord = new graphql_1.GraphQLInterfaceType({
    name: 'IDatabaseApiRecord',
    // Purposefully revealed on the API
    // description: "This record is what can be shown to the api",
    fields: exports.Interface_IDatabaseRecord_ApiFields
});
//# sourceMappingURL=commonSchema.js.map