import {
    graphql,
    printSchema,
    //printIntrospectionSchema
} from "graphql"

// this is an example introspection query to be used by 3rd-party clients to inspect our API definition

export const introspectionQuery = `
    query IntrospectionQuery {
      __schema {
        queryType {
          name
        }
        mutationType {
          name
        }
        subscriptionType {
          name
        }
        types {
          ...FullType
        }
        directives {
          name
          description
          locations
          args {
            ...InputValue
          }
        }
      }
    }

    fragment FullType on __Type {
      kind
      name
      description
      fields(includeDeprecated: true) {
        name
        description
        args {
          ...InputValue
        }
        type {
          ...TypeRef
        }
        isDeprecated
        deprecationReason
      }
      inputFields {
        ...InputValue
      }
      interfaces {
        ...TypeRef
      }
      enumValues(includeDeprecated: true) {
        name
        description
        isDeprecated
        deprecationReason
      }
      possibleTypes {
        ...TypeRef
      }
    }

    fragment InputValue on __InputValue {
      name
      description
      type {
        ...TypeRef
      }
      defaultValue
    }

    fragment TypeRef on __Type {
      kind
      name
      ofType {
        kind
        name
        ofType {
          kind
          name
          ofType {
            kind
            name
            ofType {
              kind
              name
              ofType {
                kind
                name
                ofType {
                  kind
                  name
                  ofType {
                    kind
                    name
                  }
                }
              }
            }
          }
        }
      }
    }
`

// DEFAULT: executeGqlQuery

export default async (requestString:string, schema:any, root?:any|null, contextValue?:any|null, variableValues?:any|null, operationName?:any|null) : Promise<any> => {

    // print schema
    if(requestString === 'printSchema') {
        return { message: printSchema(schema) }
    }

// NOTE: Not sure what this is useful for but its nice to know it's here
//    // print introspection schema
//    else if(requestString === 'printIntrospectionSchema') {
//        return { message: printIntrospectionSchema(schema) }
//    }

    return await graphql(schema, requestString, root, contextValue, variableValues, operationName )

}
