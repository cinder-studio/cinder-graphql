import {
    GraphQLNonNull,
    GraphQLString
} from "graphql"

import { GraphQLLong } from "../../../commonSchema"

import FirebaseGraphqlCodec from "../../../dbCodecs/FirebaseGraphqlCodec"

const fbGqlCodec = new FirebaseGraphqlCodec({
    displayShortname: 'MockGqlCodec',
    collectionName: 'MockGqlCodec',
    description: 'A Mock Description',
    rVer: 1,
    fields: {
        normalStringField: { type: GraphQLString, isRequired:true, defaultValue: null, description: "normalStringField"},
        normalNumberField: { type: GraphQLLong, isRequired:true, defaultValue: null, description: "normalNumberField"},
        //normalArrayField: { type: GraphQLString, isRequired:true, defaultValue: null, description: "normalArrayField"},
        //normalMapField: { type: GraphQLString, isRequired:true, defaultValue: null, description: "normalMapField"},
        secretStringField: { type: GraphQLString, isRequired:false, isInternalOnly:true, defaultValue: null, description: "secretStringField"},
        secretAndRequiredStringField: { type: GraphQLString, isRequired:true, isInternalOnly:true, defaultValue: null, description: "secretStringField"},
        //createViewableButUnstoreableStringField: {...} // DO NOT STORE THIS
        //calculatedButUnstoreableStringField: {...} // DO NOT STORE THIS
    }
})

// Let's verify all the default behaviors

export const Query_MockReadDefault = fbGqlCodec.readOneCodec({
    description: "read a record in the mock database",
})

export const Query_MockListDefault = fbGqlCodec.listPaginatedCodec({
    description: "list records in the mock database",
    defaultListLimit: 20,
    orderListBy: [{name:"createdAt", dir:"DESCENDING", type:"string"}, {name:"id", dir:"ASCENDING", type:"string"}]
})

export const Mutate_MockCreateDefault = fbGqlCodec.createOneCodec({
    description: "create a record in the mock database"
})

export const Mutate_MockUpdateDefault = fbGqlCodec.updateOneCodec({
    description: "update a record in the mock database",
})

export const Mutate_MockDeleteDefault = fbGqlCodec.deleteOneCodec({
    description: "delete a record in the mock database",
})

// Let's make some basic overrides for required and internal fields

export const Mutate_MockCreateWithRequiredInternalOnlyData = fbGqlCodec.createOneCodec({
    description: "create a record in the mock database",
    overrideResolve: (defaultResolve) => ( async (source, args, context, info) => (await defaultResolve(
        source,
        {
            ...args,
            secretAndRequiredStringField: 'mock-secretAndRequiredData'
        },
        context,
        info
    )))
})

// Let's make some complex override behaviors

export const Mutate_MockCreateOverrides = fbGqlCodec.createOneCodec({
    description: "create a record in the mock database using an override configuration",
    overrideType: (defaultReturnTypeConfig) => {
        return {
            name: 'MockGqlCodecCreateResult',
            fields: {
                ...defaultReturnTypeConfig.fields,
                // adding one field here to the normal outputs of create
                createViewableButUnstoreableStringField: { type: GraphQLNonNull(GraphQLString), description: "createViewableButUnstoreableStringField" }
            }
        }
    },
    overrideArgs: (defaultArgsList) => {
        // secret field should never be an Arg for create (it's calculated)
        delete(defaultArgsList.secretStringField)
        return defaultArgsList
    },
    overrideResolve: (defaultResolve) => ( async (source, args, context, info) => {
        const calculatedArgs = {
            ...args,
            //calculated
            secretStringField: 'mock-secretStringField',
            secretAndRequiredStringField: 'mock-secretAndRequiredData'
        }
        return {
            ... await defaultResolve(source, calculatedArgs, context, info),
            // only revealed at create time
            createViewableButUnstoreableStringField: 'mock-createViewableButUnstoreableStringField'
        }
    })
})

export const Mutate_MockUpdateWithOverrides = fbGqlCodec.updateOneCodec({
    description: "update a record in the mock database using an override configuration",
    overrideType: (defaultReturnTypeConfig) => {
        return {
            name: 'MockGqlCodecUpdateResult',
            fields: {
                ...defaultReturnTypeConfig.fields,
                // adding one field here to the normal outputs of update
                calculatedButUnstoreableStringField: { type: GraphQLNonNull(GraphQLString), description: "calculatedButUnstoreableStringField" }
            }
        }
    },
    overrideArgs: (defaultArgsList) => {
        // secret field should never be an Arg for create (it's calculated)
        delete(defaultArgsList.secretStringField)
        return {
            ...defaultArgsList,
            normalStringField: { type: GraphQLNonNull(GraphQLString), description: "normalStringField is required in this format of update"},
        }
    },
    overrideResolve: (defaultResolve) => ( async (source, args, context, info) => {
        return {
            ... await defaultResolve(source, args, context, info),
            // only revealed at update time
            calculatedButUnstoreableStringField: 'mock-calculatedButUnstoreableStringField'
        }
    })
})

//TODO is there anything to do for DELETE?

export const Query_MockReadWithOverrides = fbGqlCodec.readOneCodec({
    description: "read a record in the mock database using an override configuration",
    overrideType: (defaultReturnTypeConfig) => {
        // secret field should never be an item retrievable from a read
        delete(defaultReturnTypeConfig.fields.secretStringField)
        return {
            name: 'MockGqlCodecOverride',
            fields: {
                ...defaultReturnTypeConfig.fields,
                // adding one field here to the normal outputs of read
                calculatedButUnstoreableStringField: { type: GraphQLNonNull(GraphQLString), description: "calculatedButUnstoreableStringField" }
            }
        }
    },
// TODO maybe I'm wrong?
    // READ mode will only ever need args in the form of "ID"
    // overrideArgs: (defaultArgsList) => ({}),
    overrideResolve: (defaultResolve) => ( async (source, args, context, info) => {
        return {
            ... await defaultResolve(source, args, context, info),
            // never stored but revealed at read time
            calculatedButUnstoreableStringField: 'mock-calculatedButUnstoreableStringField'
        }
    })
})

//TODO incomplete
export const Query_MockListWithOverrides = fbGqlCodec.listPaginatedCodec({
    description: "list records in the mock database using an override configuration",
    defaultListLimit: 20,
    orderListBy: [{name:"createdAt", dir:"desc", type:"string"}, {name:"id", dir:"asc", type:"string"}],
    overrideType: (defaultReturnTypeConfig) => {
        // secret field should never be an item retrievable from a read
        delete(defaultReturnTypeConfig.fields.secretStringField)
        return {
//TODO can this have the same name as read?
            name: 'MockGqlCodecListItemOverride',
            fields: {
                ...defaultReturnTypeConfig.fields,
                // adding one field here to the normal outputs of read
                calculatedButUnstoreableStringField: { type: GraphQLNonNull(GraphQLString), description: "calculatedButUnstoreableStringField" }
            }
        }
    },
    overrideArgs: (defaultArgsList) => {
        return {
            ...defaultArgsList,
            query: { type: GraphQLNonNull(GraphQLString), description: "your query string"},
        }
    },
    overrideResolve: (defaultResolve) => ( async (source, args, context, info) => {
        if(!args.query) {
            throw new Error("there should have been a query in these args")
        }
        return (await defaultResolve(source, args, context, info)).map(result=>({
            ...result,
            // never stored but revealed at read time
            calculatedButUnstoreableStringField: 'mock-calculatedButUnstoreableStringField'
        }))
    })
})
