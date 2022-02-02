import { fbGqlCodec } from "../_testTools/handlers/firestoreCodec"

// make sure all test counters reset after each test
////////////////////////////////////////////////////
afterEach(jest.clearAllMocks)
////////////////////////////////////////////////////

test("CREATE: Custom Validator operates at the correct moment", async () => {
    // // //
    const orderOfCalls = []
    const customValidator = jest.fn().mockImplementation((args, context) => {
        orderOfCalls.push('customValidator');
        return true;
    })
    const overrideResolve = jest.fn().mockImplementation((defaultResolve) => {
        orderOfCalls.push('overrideResolve');
        return async (source, args, context, info) => { return {status:'success'} }
    })
    // // //
    const Mutate_MockResolverWithValidator = fbGqlCodec.createOneCodec({
        description: "create a record in the mock database with a validator",
        customValidator: customValidator,
        overrideResolve: overrideResolve
    })

    const output = await Mutate_MockResolverWithValidator.resolve({}, {}, {}, {})
    //console.log(output)
    // // //
    expect(output.status).toBe('success')
    expect(customValidator).toHaveBeenCalledTimes(1)
    expect(overrideResolve).toHaveBeenCalledTimes(1)
    expect(orderOfCalls.length).toBe(2)
    expect(orderOfCalls[0]).toBe('customValidator')
    expect(orderOfCalls[1]).toBe('overrideResolve')
})

test("UPDATE: Custom Validator operates at the correct moment", async () => {
    // // //
    const orderOfCalls = []
    const customValidator = jest.fn().mockImplementation((args, context) => {
        orderOfCalls.push('customValidator');
        return true;
    })
    const overrideResolve = jest.fn().mockImplementation((defaultResolve) => {
        orderOfCalls.push('overrideResolve');
        return async (source, args, context, info) => { return {status:'success'} }
    })
    // // //
    const Mutate_MockResolverWithValidator = fbGqlCodec.updateOneCodec({
        description: "update a record in the mock database with a validator",
        customValidator: customValidator,
        overrideResolve: overrideResolve
    })

    const output = await Mutate_MockResolverWithValidator.resolve({}, {}, {}, {})
    //console.log(output)
    // // //
    expect(output.status).toBe('success')
    expect(customValidator).toHaveBeenCalledTimes(1)
    expect(overrideResolve).toHaveBeenCalledTimes(1)
    expect(orderOfCalls.length).toBe(2)
    expect(orderOfCalls[0]).toBe('customValidator')
    expect(orderOfCalls[1]).toBe('overrideResolve')
})

test("DELETE: Custom Validator operates at the correct moment", async () => {
    // // //
    const orderOfCalls = []
    const customValidator = jest.fn().mockImplementation((args, context) => {
        orderOfCalls.push('customValidator');
        return true;
    })
    const overrideResolve = jest.fn().mockImplementation((defaultResolve) => {
        orderOfCalls.push('overrideResolve');
        return async (source, args, context, info) => { return {status:'success'} }
    })
    // // //
    const Mutate_MockResolverWithValidator = fbGqlCodec.deleteOneCodec({
        description: "update a record in the mock database with a validator",
        customValidator: customValidator,
        overrideResolve: overrideResolve
    })

    const output = await Mutate_MockResolverWithValidator.resolve({}, {}, {}, {})
    //console.log(output)
    // // //
    expect(output.status).toBe('success')
    expect(customValidator).toHaveBeenCalledTimes(1)
    expect(overrideResolve).toHaveBeenCalledTimes(1)
    expect(orderOfCalls.length).toBe(2)
    expect(orderOfCalls[0]).toBe('customValidator')
    expect(orderOfCalls[1]).toBe('overrideResolve')
})

test("READ: Custom Validator operates at the correct moment", async () => {
    // // //
    const orderOfCalls = []
    const customValidator = jest.fn().mockImplementation((args, context) => {
        orderOfCalls.push('customValidator');
        return true;
    })
    const overrideResolve = jest.fn().mockImplementation((defaultResolve) => {
        orderOfCalls.push('overrideResolve');
        return async (source, args, context, info) => { return {status:'success'} }
    })
    // // //
    const Query_MockResolverWithValidator = fbGqlCodec.readOneCodec({
        description: "read a record in the mock database with a validator",
        customValidator: customValidator,
        overrideResolve: overrideResolve
    })

    const output = await Query_MockResolverWithValidator.resolve({}, {}, {}, {})
    //console.log(output)
    // // //
    expect(output.status).toBe('success')
    expect(customValidator).toHaveBeenCalledTimes(1)
    expect(overrideResolve).toHaveBeenCalledTimes(1)
    expect(orderOfCalls.length).toBe(2)
    expect(orderOfCalls[0]).toBe('customValidator')
    expect(orderOfCalls[1]).toBe('overrideResolve')
})

test("LIST: Custom Validator operates at the correct moment", async () => {
    // // //
    const orderOfCalls = []
    const customValidator = jest.fn().mockImplementation((args, context) => {
        orderOfCalls.push('customValidator');
        return true;
    })
    const overrideResolve = jest.fn().mockImplementation((defaultResolve) => {
        orderOfCalls.push('overrideResolve');
        return async (source, args, context, info) => { return {status:'success'} }
    })
    // // //
    const Query_MockResolverWithValidator = fbGqlCodec.listPaginatedCodec({
        description: "list records in the mock database with a validator",
        defaultListLimit: 20,
        orderListBy: [{name:"createdAt", dir:"DESCENDING", type:"string"}, {name:"id", dir:"ASCENDING", type:"string"}],
        customValidator: customValidator,
        overrideResolve: overrideResolve
    })

    const output = await Query_MockResolverWithValidator.resolve({}, {}, {}, {})
    //console.log(output)
    // // //
    expect(output.status).toBe('success')
    expect(customValidator).toHaveBeenCalledTimes(1)
    expect(overrideResolve).toHaveBeenCalledTimes(1)
    expect(orderOfCalls.length).toBe(2)
    expect(orderOfCalls[0]).toBe('customValidator')
    expect(orderOfCalls[1]).toBe('overrideResolve')
})

test("CUSTOM QUERY: Custom Validator operates at the correct moment", async () => {
    // // //
    const orderOfCalls = []
    const customValidator = jest.fn().mockImplementation((args, context) => {
        orderOfCalls.push('customValidator');
        return true;
    })
    const customResolve = jest.fn().mockImplementation(async (QuickFirestore, collection, source, args, context, info) => {
        orderOfCalls.push('customResolve');
        return {status:'success'}
    })
    // // //
    const Query_MockResolverWithValidator = fbGqlCodec.customQueryCodec({
        description: "list records in the mock database with a validator",
        customValidator: customValidator,
        customResolve: customResolve
    })

    const output = await Query_MockResolverWithValidator.resolve({}, {}, {}, {})
    //console.log(output)
    // // //
    expect(output.status).toBe('success')
    expect(customValidator).toHaveBeenCalledTimes(1)
    expect(customResolve).toHaveBeenCalledTimes(1)
    expect(orderOfCalls.length).toBe(2)
    expect(orderOfCalls[0]).toBe('customValidator')
    expect(orderOfCalls[1]).toBe('customResolve')
})

/*
test("UPDATE: default behaves as expected", async () => {

    mockedAxios.patch.mockImplementation( async (url, data) => {
        // create API responses are not read anyway
        return { status: 200, data: {} }
    })

    const resultErrors = await executeGqlQuery(`
        mutation {
            mockGqlUpdate {
                id
            }
        }
    `, schema, null, mockContext)

    // only 1 because [id] is the only required arg
    expect(resultErrors.errors.length).toBe(1)

    const resultSuccess = await executeGqlQuery(`
        mutation {
            mockGqlUpdate(id:"mock-update-id", normalStringField:"normal-string-field") {
                id
            }
        }
    `, schema, null, mockContext)

    // create mutations only return the id by default
    expect(resultSuccess.data.mockGqlUpdate.id).toBe("mock-update-id")
    expect(resultSuccess.data.mockGqlUpdate.createdAt).toBe(undefined)

    expect(mockedAxios.patch).toHaveBeenCalledTimes(1)
})

test("DELETE: default behaves as expected", async () => {

    mockedAxios.patch.mockImplementation( async (url, data) => {
        // create API responses are not read anyway
        return { status: 200, data: {} }
    })

    const resultErrors = await executeGqlQuery(`
        mutation {
            mockGqlDelete {
                id
            }
        }
    `, schema, null, mockContext)

    // only "id" is allowed here
    expect(resultErrors.errors.length).toBe(1)

    const resultSuccess = await executeGqlQuery(`
        mutation {
            mockGqlDelete(id:"mock-id") {
                id
            }
        }
    `, schema, null, mockContext)

    // delete mutations only return the id by default
    expect(resultSuccess.data.mockGqlDelete.id).toBeTruthy()
    expect(resultSuccess.data.mockGqlDelete.createdAt).toBe(undefined)

    expect(mockedAxios.patch).toHaveBeenCalledTimes(1)
})

test("READ: default behaves as expected", async () => {

    mockedAxios.post.mockImplementation( async (url, data) => {
        // create API responses are not read anyway
        return { status: 200, data: mockReturnData }
    })

    const resultErrors = await executeGqlQuery(`
        {
            mockGqlRecord {
                id
                theFieldThatDoesNotExist
            }
        }
    `, schema, null, mockContext)

    // theFieldThatDoesNotExist should not be queryable
    // AND you need to give an ID for a read
    expect(resultErrors.errors.length).toBe(2)

    const resultErrorFromSecretField = await executeGqlQuery(`
        {
            mockGqlRecord (id:"mock-id") {
                id
                createdAt
                updatedAt
                deletedAt
                normalStringField
                normalNumberField
                secretStringField
                secretAndRequiredStringField
                cursor
            }
        }
    `, schema, null, mockContext)

    // secret fields should not be readable by default
    expect(resultErrorFromSecretField.errors.length).toBe(2)

    const resultSuccess = await executeGqlQuery(`
        {
            mockGqlRecord (id:"mock-id") {
                id
                createdAt
                updatedAt
                deletedAt
                normalStringField
                normalNumberField
                cursor
            }
        }
    `, schema, null, mockContext)

    // create mutations only return the id by default
    expect(resultSuccess.data.mockGqlRecord.id).toBeTruthy()
    expect(resultSuccess.data.mockGqlRecord.createdAt).toBeTruthy()
    expect(resultSuccess.data.mockGqlRecord.updatedAt).toBeTruthy()
    expect(resultSuccess.data.mockGqlRecord.deletedAt).toBe(null)
    expect(resultSuccess.data.mockGqlRecord.normalStringField).toBe("mock-normal-string-field-value")
    expect(resultSuccess.data.mockGqlRecord.normalNumberField).toBe(23423)
    expect(resultSuccess.data.mockGqlRecord.cursor).toBe(null)

    expect(mockedAxios.post).toHaveBeenCalledTimes(1)
})

test("LIST: default behaves as expected", async () => {

    mockedAxios.post.mockImplementation( async (url, data) => {
        // create API responses are not read anyway
        return { status: 200, data: mockReturnData }
    })

    const resultErrors = await executeGqlQuery(`
        {
            mockGqlRecords {
                id
                theFieldThatDoesNotExist
            }
        }
    `, schema, null, mockContext)

    // theFieldThatDoesNotExist should not be queryable
    // but everything else about this query looks reasonable
    expect(resultErrors.errors.length).toBe(1)

    const resultErrorFromSecretField = await executeGqlQuery(`
        {
            mockGqlRecords {
                id
                createdAt
                updatedAt
                deletedAt
                normalStringField
                normalNumberField
                secretStringField
                secretAndRequiredStringField
                cursor
            }
        }
    `, schema, null, mockContext)

    // secret fields should not be readable by default
    expect(resultErrorFromSecretField.errors.length).toBe(2)

    const resultSuccess = await executeGqlQuery(`
        {
            mockGqlRecords {
                id
                createdAt
                updatedAt
                deletedAt
                normalStringField
                normalNumberField
                cursor
            }
        }
    `, schema, null, mockContext)

    // create mutations only return the id by default
    expect(resultSuccess.data.mockGqlRecords.length).toBe(1)
    expect(resultSuccess.data.mockGqlRecords[0].id).toBeTruthy()
    expect(resultSuccess.data.mockGqlRecords[0].createdAt).toBeTruthy()
    expect(resultSuccess.data.mockGqlRecords[0].updatedAt).toBeTruthy()
    expect(resultSuccess.data.mockGqlRecords[0].deletedAt).toBe(null)
    expect(resultSuccess.data.mockGqlRecords[0].normalStringField).toBe("mock-normal-string-field-value")
    expect(resultSuccess.data.mockGqlRecords[0].normalNumberField).toBe(23423)
    expect(resultSuccess.data.mockGqlRecords[0].cursor).not.toBe(null)
})

test("CREATE: (WITH OVERRIDES) behaves as expected", async () => {

    mockedAxios.post.mockImplementation( async (url, data) => {
        // create API responses are not read anyway
        return { status: 200, data: {} }
    })

    const resultErrors = await executeGqlQuery(`
        mutation {
            mockGqlCreateOverride(normalStringField:"normal-string-field", normalNumberField:4940202, secretStringField:"secret-string-field") {
                id
                secretStringField
                createViewableButUnstoreableStringField
            }
        }
    `, schema, null, mockContext)

    // BOTH secretStringField on input AND secretStringField on outputs
    // in neither case should that field be available
    expect(resultErrors.errors.length).toBe(2)

    const resultSuccess = await executeGqlQuery(`
        mutation {
            mockGqlCreateOverride(normalStringField:"normal-string-field", normalNumberField:4940202) {
                id
                createViewableButUnstoreableStringField
            }
        }
    `, schema, null, mockContext)

    // even though you only pass 3 fields in, you should get back all of the fields from the DB
    expect(resultSuccess.data.mockGqlCreateOverride.id).toBeTruthy(),
    expect(resultSuccess.data.mockGqlCreateOverride.createdAt).toBe(undefined),
    expect(resultSuccess.data.mockGqlCreateOverride.createViewableButUnstoreableStringField).toBe('mock-createViewableButUnstoreableStringField')

})

test("UPDATE: (WITH OVERRIDES) behaves as expected", async () => {

    mockedAxios.post.mockImplementation( async (url, data) => {
        // create API responses are not read anyway
        return { status: 200, data: {} }
    })

    const resultErrors = await executeGqlQuery(`
        mutation {
            mockGqlUpdateOverride(id:"mock-id", normalStringField:"normal-string-field", normalNumberField:4940202, secretStringField:"secret-string-field") {
                id
                secretStringField
                calculatedButUnstoreableStringField
            }
        }
    `, schema, null, mockContext)

    // BOTH secretStringField on input AND secretStringField on outputs
    // in neither case should that field be available
    expect(resultErrors.errors.length).toBe(2)

    const resultErrorsTwo = await executeGqlQuery(`
        mutation {
            mockGqlUpdateOverride(id:"mock-id") {
                id
                calculatedButUnstoreableStringField
            }
        }
    `, schema, null, mockContext)

    // normalStringField is required in this form of update
    expect(resultErrorsTwo.errors.length).toBe(1)

    const resultSuccess = await executeGqlQuery(`
        mutation {
            mockGqlUpdateOverride(id:"mock-id", normalStringField:"normal-string-field") {
                id
                calculatedButUnstoreableStringField
            }
        }
    `, schema, null, mockContext)

    // even though you only pass 3 fields in, you should get back all of the fields from the DB
    expect(resultSuccess.data.mockGqlUpdateOverride.id).toBeTruthy(),
    expect(resultSuccess.data.mockGqlUpdateOverride.createdAt).toBe(undefined),
    expect(resultSuccess.data.mockGqlUpdateOverride.calculatedButUnstoreableStringField).toBe('mock-calculatedButUnstoreableStringField')

})

test("READ: (WITH OVERRIDES) behaves as expected", async () => {

    mockedAxios.post.mockImplementation( async (url, data) => {
        // create API responses are not read anyway
        return { status: 200, data: mockReturnData }
    })

    const resultErrors = await executeGqlQuery(`
        {
            mockGqlRecordOverride {
                id
                calculatedButUnstoreableStringField
                theFieldThatDoesNotExist
                secretStringField
            }
        }
    `, schema, null, mockContext)

    // theFieldThatDoesNotExist should not be queryable
    // secretStringField should not be queryable
    // AND you need to give an ID for a read
    expect(resultErrors.errors.length).toBe(3)

    const resultSuccess = await executeGqlQuery(`
        {
            mockGqlRecordOverride (id:"mock-id") {
                id
                createdAt
                updatedAt
                deletedAt
                normalStringField
                normalNumberField
                calculatedButUnstoreableStringField
                cursor
            }
        }
    `, schema, null, mockContext)

    // create mutations only return the id by default
    expect(resultSuccess.data.mockGqlRecordOverride.id).toBeTruthy()
    expect(resultSuccess.data.mockGqlRecordOverride.createdAt).toBeTruthy()
    expect(resultSuccess.data.mockGqlRecordOverride.updatedAt).toBeTruthy()
    expect(resultSuccess.data.mockGqlRecordOverride.deletedAt).toBe(null)
    expect(resultSuccess.data.mockGqlRecordOverride.normalStringField).toBe("mock-normal-string-field-value")
    expect(resultSuccess.data.mockGqlRecordOverride.normalNumberField).toBe(23423)
    expect(resultSuccess.data.mockGqlRecordOverride.calculatedButUnstoreableStringField).toBe("mock-calculatedButUnstoreableStringField")
    expect(resultSuccess.data.mockGqlRecordOverride.cursor).toBe(null)
})

test("LIST: (WITH OVERRIDES) behaves as expected", async () => {

    mockedAxios.post.mockImplementation( async (url, data) => {
        // create API responses are not read anyway
        return { status: 200, data: mockReturnData }
    })

    const resultErrors = await executeGqlQuery(`
        {
            mockGqlRecordOverrides {
                id
                calculatedButUnstoreableStringField
                theFieldThatDoesNotExist
                secretStringField
            }
        }
    `, schema, null, mockContext)

    // theFieldThatDoesNotExist should not be queryable
    // secretStringField should not be queryable
    // "query" is an expected arg for this function
    expect(resultErrors.errors.length).toBe(3)

    const resultSuccess = await executeGqlQuery(`
        {
            mockGqlRecordOverrides(query:"query content here") {
                id
                createdAt
                updatedAt
                deletedAt
                normalStringField
                normalNumberField
                calculatedButUnstoreableStringField
                cursor
            }
        }
    `, schema, null, mockContext)

    // create mutations only return the id by default
    expect(resultSuccess.data.mockGqlRecordOverrides.length).toBe(1)
    expect(resultSuccess.data.mockGqlRecordOverrides[0].id).toBeTruthy()
    expect(resultSuccess.data.mockGqlRecordOverrides[0].createdAt).toBeTruthy()
    expect(resultSuccess.data.mockGqlRecordOverrides[0].updatedAt).toBeTruthy()
    expect(resultSuccess.data.mockGqlRecordOverrides[0].deletedAt).toBe(null)
    expect(resultSuccess.data.mockGqlRecordOverrides[0].normalStringField).toBe("mock-normal-string-field-value")
    expect(resultSuccess.data.mockGqlRecordOverrides[0].normalNumberField).toBe(23423)
    expect(resultSuccess.data.mockGqlRecordOverrides[0].calculatedButUnstoreableStringField).toBe("mock-calculatedButUnstoreableStringField")
    expect(resultSuccess.data.mockGqlRecordOverrides[0].cursor).not.toBe(null)
})

/*


export const Mutate_MockCreateValidator = fbGqlCodec.createOneCodec({
    description: "create a record in the mock database with a validator",
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

export const Mutate_MockUpdateWithValidator = fbGqlCodec.deleteOneCodec({
    description: "delete a record in the mock database with a validator",
    overrideResolve: (defaultResolve) => ( async (source, args, context, info) => {
        return {
            ... await defaultResolve(source, args, context, info),
            // only revealed at update time
            calculatedButUnstoreableStringField: 'mock-calculatedButUnstoreableStringField'
        }
    })
})

export const Query_MockReadWithValidator = fbGqlCodec.readOneCodec({
    description: "read a record in the mock database with a validator",
    overrideResolve: (defaultResolve) => ( async (source, args, context, info) => {
        return {
            ... await defaultResolve(source, args, context, info),
            // never stored but revealed at read time
            calculatedButUnstoreableStringField: 'mock-calculatedButUnstoreableStringField'
        }
    })
})

export const Query_MockListWithValidator = fbGqlCodec.listPaginatedCodec({
    description: "list records in the mock database with a validator",
    defaultListLimit: 20,
    orderListBy: [{name:"createdAt", dir:"desc", type:"string"}, {name:"id", dir:"asc", type:"string"}],
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

export const Query_MockCustomQueryWithValidator = fbGqlCodec.listPaginatedCodec({
    description: "custom query a mock database with a validator",
    customResolve: (QuickFirestore, collection, source, args, context, info) => {


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

*/
