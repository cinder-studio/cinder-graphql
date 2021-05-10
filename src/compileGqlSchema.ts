import {
    GraphQLSchema,
    GraphQLObjectType
} from "graphql"

const compileGqlSchemaAndRoot = (configuration:any) => {

    // query definition
    const schemaDef:any = {
        query: new GraphQLObjectType({
            name: 'Query',
            description: configuration.queryDescription,
            fields: configuration.query
        })
    }

    // mutation definition
    if(configuration.mutation) {
        schemaDef.mutation = new GraphQLObjectType({
            name: 'Mutation',
            description: configuration.mutationDescription,
            fields: configuration.mutation
        })
    }

    // compile
    const schema = new GraphQLSchema(schemaDef)

    return {
        schema: schema
    }
}

export default compileGqlSchemaAndRoot
