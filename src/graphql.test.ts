import compileGqlSchema from "./compileGqlSchema"
import executeGqlQuery from "./executeGqlQuery"

test("execute basic standard gql queries using object based schema", async () => {
    const { schema } = compileGqlSchema({
        query: {
            basicObjects: require('./_testTools/handlers/basic').Query_BasicObjects,
            basicObject: require('./_testTools/handlers/basic').Query_BasicObject,
        }
    })

    const result = await executeGqlQuery(`
        {
            basicObjects(id:"basicObj1") {
                id
                name
            },
            basicObject(id:"basicObj1") {
                id
            }
        }
    `, schema)

    expect(Object.keys(result.data).length).toBe(2)
    expect(result.data.basicObjects.length).toBe(1)
    expect(result.data.basicObjects[0].id).toBe('basicObj1ResultArray')
    expect(result.data.basicObjects[0].name).toBe('basicObjName1ResultArray')
    expect(result.data.basicObject.id).toBe('basicObj1ResultSingle')
    expect(result.data.basicObject.name).toBe(undefined) //even though the API itself did return more data than asked for
})

test("execute basic standard gql mutation using object based schema", async () => {
    const { schema } = compileGqlSchema({
        query: {
            basicObjects: require('./_testTools/handlers/basic').Query_BasicObjects,
            basicObject: require('./_testTools/handlers/basic').Query_BasicObject,
        },
        mutation: {
            createBasicObject: require('./_testTools/handlers/basic').Mutation_CreateBasicObject,
        }
    })

    const result = await executeGqlQuery(`
        mutation {
            createBasicObject(input: {
                name: "Test Name"
                anotherField: "Test Another Field"
            }) {
                id
            }
        }
    `, schema)

    expect(Object.keys(result.data).length).toBe(1)
    expect(result.data.createBasicObject.id).toBe('basicObj1ResultIdFromCreateMutation')
})

test("context passing to schema resolver functions", async () => {
    const { schema } = compileGqlSchema({
        query: {
            context: require('./_testTools/handlers/basic').Query_Context
        }
    })

    const result = await executeGqlQuery(`
        {
            context
        }
    `, schema, null, { contextDataKey:'contextDataValue' })

    expect(result.data.context).toBe('{"contextDataKey":"contextDataValue"}')
})

test("object based schema definition prints correctly", async () => {
    const { schema } = compileGqlSchema({
        query: {
            basicObjects: require('./_testTools/handlers/basic').Query_BasicObjects,
            basicObject: require('./_testTools/handlers/basic').Query_BasicObject,
        },
        mutation: {
            createBasicObject: require('./_testTools/handlers/basic').Mutation_CreateBasicObject,
        }
    })

    const result = await executeGqlQuery(`
        {
            basicObjects(id:"basicObj1") {
                id
                name
            },
            basicObject(id:"basicObj1") {
                id
            }
        }
    `, schema)

    // NOTE: Uncomment this to see the example schema
    // console.log(result.message)

    expect(1).toBe(1)
})

test("error throwing results in a reliable result that communicates to the client correctly", async () => {
    const { schema } = compileGqlSchema({
        query: {
            testError: require('./_testTools/handlers/basic').Mutation_TestErrorHandling
        }
    })

    const result = await executeGqlQuery(`
        {
            testError
        }
    `, schema, null, {})

    expect(result.errors && result.errors.length === 1).toBe(true)
    expect(result.errors[0].extensions.machineKey).toBe('mock-friendly-error')
})
