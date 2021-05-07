import {
    GraphQLObjectType,
    GraphQLInterfaceType,
    GraphQLNonNull,
    GraphQLString
} from "graphql"

import * as GQLLong from "graphql-type-long"
export const GraphQLLong = GQLLong

export const Type_CreateMutationResultConfig = {
    name: 'CreateMutationResult',
    description: "The ID of the record created",
    fields: {
        id: { type: GraphQLNonNull(GraphQLString), description: "System-wide unique identifier for this record" }
    }
}
export const Type_CreateMutationResult = new GraphQLObjectType(Type_CreateMutationResultConfig)

export const Type_UpdateMutationResultConfig = {
    name: 'UpdateMutationResult',
    description: "The ID of the record updated",
    fields: {
        id: { type: GraphQLNonNull(GraphQLString), description: "System-wide unique identifier for this record" }
    }
}
export const Type_UpdateMutationResult = new GraphQLObjectType(Type_UpdateMutationResultConfig)

export const Type_DeleteMutationResultConfig = {
    name: 'DeleteMutationResult',
    description: "The ID of the record deleted",
    fields: {
        id: { type: GraphQLNonNull(GraphQLString), description: "System-wide unique identifier for this record" }
    }
}
export const Type_DeleteMutationResult = new GraphQLObjectType(Type_DeleteMutationResultConfig)

export const Interface_IDatabaseRecord_DatabaseFields = {
    id: { type: GraphQLNonNull(GraphQLString), description: "System-wide unique identifier for this record" },
    createdAt: { type: GraphQLNonNull(GraphQLLong), description: "Unix timestamp recording the moment this record was created" },
    updatedAt: { type: GraphQLNonNull(GraphQLLong), description: "Unix timestamp recording the moment this record was last updated" },
    deletedAt: { type: GraphQLLong, description: "Null when the record is not deleted. Unix timestamp recording the moment this record was moved to the trash" },
    // rVer: { type: GraphQLNonNull(GraphQLInt), description: "An internal utility property" }
}

export const Interface_IDatabaseRecord_ApiFields = {
    id: { type: GraphQLNonNull(GraphQLString), description: "System-wide unique identifier for this record" },
    createdAt: { type: GraphQLNonNull(GraphQLLong), description: "Unix timestamp recording the moment this record was created" },
    updatedAt: { type: GraphQLNonNull(GraphQLLong), description: "Unix timestamp recording the moment this record was last updated" },
    deletedAt: { type: GraphQLLong, description: "Null when the record is not deleted. Unix timestamp recording the moment this record was moved to the trash" },
    // Purposefully not revealed on the API
    //rVer: { type: GraphQLNonNull(GraphQLInt), description: "An internal utility property" }
}

export const Interface_IDatabaseRecord = new GraphQLInterfaceType({
    name: 'IDatabaseRecord',
    // Purposefully not revealed on the API
    // description: "This record is stored in a database on our systems",
    fields: Interface_IDatabaseRecord_DatabaseFields
})

export const Interface_IDatabaseApiRecord = new GraphQLInterfaceType({
    name: 'IDatabaseApiRecord',
    // Purposefully revealed on the API
    // description: "This record is what can be shown to the api",
    fields: Interface_IDatabaseRecord_ApiFields
})
