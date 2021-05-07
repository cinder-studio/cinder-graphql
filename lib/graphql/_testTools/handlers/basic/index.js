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
exports.Mutation_CreateBasicObject = exports.Query_Context = exports.Query_BasicObject = exports.Query_BasicObjects = exports.Type_BasicObject = void 0;
const graphql_1 = require("graphql");
const graphqlFields = require("graphql-fields");
const commonSchema_1 = require("../../../commonSchema");
exports.Type_BasicObject = new graphql_1.GraphQLObjectType({
    name: 'BasicObject',
    fields: {
        id: { type: graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
        name: { type: graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
    }
});
exports.Query_BasicObjects = {
    type: graphql_1.GraphQLNonNull(graphql_1.GraphQLList(exports.Type_BasicObject)),
    args: {
        id: { type: graphql_1.GraphQLNonNull(graphql_1.GraphQLString) }
    },
    resolve: (source, { id }, context, info) => __awaiter(void 0, void 0, void 0, function* () {
        switch (id) {
            case 'basicObj1':
                return [{
                        id: 'basicObj1ResultArray',
                        name: 'basicObjName1ResultArray'
                    }];
                break;
            default:
                return [];
        }
    })
};
exports.Query_BasicObject = {
    type: graphql_1.GraphQLNonNull(exports.Type_BasicObject),
    args: {
        id: { type: graphql_1.GraphQLNonNull(graphql_1.GraphQLString) }
    },
    resolve: (source, { id }, context, info) => __awaiter(void 0, void 0, void 0, function* () {
        ////////////////////
        // RYAN!!! YOU STOPPED HERE! INTENTION WAS TO FIGURE OUT HOW TO USE MIDDLEWARE TO AUTOMATE graphqlFields
        // Then making database queries
        // And making a "callable" version of the api
        // with authentication capabilities
        ////////////////////
        ////////////////////
        ////////////////////
        console.log('info', graphqlFields(info));
        ////////////////////
        ////////////////////
        ////////////////////
        switch (id) {
            case 'basicObj1':
                return {
                    id: 'basicObj1ResultSingle',
                    name: 'basicObjName1ResultSingle'
                };
                break;
            default:
                return null;
        }
    })
};
exports.Query_Context = {
    type: graphql_1.GraphQLNonNull(graphql_1.GraphQLString),
    args: {},
    resolve: (source, { id }, context, info) => __awaiter(void 0, void 0, void 0, function* () {
        return JSON.stringify(context);
    })
};
exports.Mutation_CreateBasicObject = {
    type: graphql_1.GraphQLNonNull(commonSchema_1.Type_CreateMutationResult),
    args: {
        input: {
            type: graphql_1.GraphQLNonNull(new graphql_1.GraphQLInputObjectType({
                name: 'CreateBasicInput',
                fields: {
                    name: { type: graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
                    anotherField: { type: graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
                }
            }))
        }
    },
    resolve: (source, { id }, context, info) => __awaiter(void 0, void 0, void 0, function* () {
        return {
            id: 'basicObj1ResultIdFromCreateMutation'
        };
    })
};
//# sourceMappingURL=index.js.map