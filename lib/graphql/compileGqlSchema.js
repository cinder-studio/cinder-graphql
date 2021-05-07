"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_1 = require("graphql");
const compileGqlSchemaAndRoot = (configuration) => {
    // query definition
    const schemaDef = {
        query: new graphql_1.GraphQLObjectType({
            name: 'Query',
            description: configuration.queryDescription,
            fields: configuration.query
        })
    };
    // mutation definition
    if (configuration.mutation) {
        schemaDef.mutation = new graphql_1.GraphQLObjectType({
            name: 'Mutation',
            description: configuration.mutationDescription,
            fields: configuration.mutation
        });
    }
    // compile
    const schema = new graphql_1.GraphQLSchema(schemaDef);
    return {
        schema: schema
    };
};
exports.default = compileGqlSchemaAndRoot;
//# sourceMappingURL=compileGqlSchema.js.map