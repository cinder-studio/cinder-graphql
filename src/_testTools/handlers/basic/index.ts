import {
    GraphQLObjectType,
    GraphQLInputObjectType,
    GraphQLNonNull,
    GraphQLList,
    GraphQLString
} from "graphql"

import * as graphqlFields from "graphql-fields"

import { Type_CreateMutationResult } from "../../../commonSchema"

export const Type_BasicObject = new GraphQLObjectType({
    name: 'BasicObject',
    fields: {
        id: { type: GraphQLNonNull(GraphQLString) },
        name: { type: GraphQLNonNull(GraphQLString) },
    }
})

export const Query_BasicObjects = {
    type: GraphQLNonNull(GraphQLList(Type_BasicObject)),

    args: {
        id: { type: GraphQLNonNull(GraphQLString) }
    },

    resolve: async (source, { id }, context, info) => {
        switch(id) {
            case 'basicObj1':
                return [{
                    id: 'basicObj1ResultArray',
                    name: 'basicObjName1ResultArray'
                }]
                break
            default:
                return []
        }
    }
}

export const Query_BasicObject = {
    type: GraphQLNonNull(Type_BasicObject),

    args: {
        id: { type: GraphQLNonNull(GraphQLString) }
    },

    resolve: async (source, { id }, context, info) => {

        ////////////////////
// RYAN!!! YOU STOPPED HERE! INTENTION WAS TO FIGURE OUT HOW TO USE MIDDLEWARE TO AUTOMATE graphqlFields
// Then making database queries
// And making a "callable" version of the api
// with authentication capabilities
        ////////////////////
        ////////////////////
////////////////////
        console.log('info', graphqlFields(info))
////////////////////
        ////////////////////
        ////////////////////



        switch(id) {
            case 'basicObj1':
                return {
                    id: 'basicObj1ResultSingle',
                    name: 'basicObjName1ResultSingle'
                }
                break
            default:
                return null
        }
    }
}

export const Query_Context = {
    type: GraphQLNonNull(GraphQLString),

    args: {},

    resolve: async (source, { id }, context, info) => {
        return JSON.stringify(context)
    }
}

export const Mutation_CreateBasicObject = {
    type: GraphQLNonNull(Type_CreateMutationResult),

    args: {
        input: {
            type: GraphQLNonNull(new GraphQLInputObjectType({
                name: 'CreateBasicInput',
                fields: {
                    name: { type: GraphQLNonNull(GraphQLString) },
                    anotherField: { type: GraphQLNonNull(GraphQLString) },
                }
            }))
        }
    },

    resolve: async (source, { id }, context, info) => {
        return {
            id: 'basicObj1ResultIdFromCreateMutation'
        }
    }
}
