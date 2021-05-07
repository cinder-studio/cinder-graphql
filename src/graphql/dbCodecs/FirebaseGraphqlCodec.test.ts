import axios from "axios"
jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

import compileGqlSchema from "../compileGqlSchema"
import executeGqlQuery from "../executeGqlQuery"
import * as mockHanders from "../_testTools/handlers/firestoreCodec"
import { QuickFirestore } from "@cinder-studio/quick-firestore"

const { schema } = compileGqlSchema({
    queryDescription: `Mock Description`,
    query: {
        mockGqlRecord: mockHanders.Query_MockReadDefault,
        mockGqlRecords: mockHanders.Query_MockListDefault,

        mockGqlRecordOverride: mockHanders.Query_MockReadWithOverrides,
        mockGqlRecordOverrides: mockHanders.Query_MockListWithOverrides
    },
    mutation: {
        mockGqlCreate: mockHanders.Mutate_MockCreateDefault,
        mockGqlUpdate: mockHanders.Mutate_MockUpdateDefault,
        mockGqlDelete: mockHanders.Mutate_MockDeleteDefault,

        mockGqlCreateWithInternalRequiredItem: mockHanders.Mutate_MockCreateWithRequiredInternalOnlyData,

        mockGqlCreateOverride: mockHanders.Mutate_MockCreateOverrides,
        mockGqlUpdateOverride: mockHanders.Mutate_MockUpdateWithOverrides,
        // Can't think of a case
        // mockGqlDeleteOverride: mockHanders.Mutate_MockDeleteWithOverrides
    }
})

const mockContext = {
    requestData: {
        // query:'mutation {\n  accountApiKeyCreate {\n    id\n    apiKeyToken\n    apiKey\n  }\n}',
        requestedAccountId: 'mock-account-id'
    },
    quickFirestore: new QuickFirestore({
        firestore: {
            projectName:'mockProjectZy',
            jwt: {
                clientEmail:'',
                privateKeyId:'',
                privateKey:'',
            },
            isUnitTesting:true,
        }
    })
}

const mockReturnData = [
    {
        document: {
            name:"projects/mock-db/databases/(default)/documents/MockGqlCodec/mock-id",
            fields: {
                id: {
                    stringValue: "mock-record-id"
                },
                createdAt: {
                    integerValue: 1603805540980
                },
                updatedAt: {
                    integerValue: 1603805540980
                },
                deletedAt: {
                    nullValue: null
                },
                normalStringField: {
                    stringValue :"mock-normal-string-field-value"
                },
                normalNumberField: {
                    integerValue: 23423
                },
                secretStringField: {
                    stringValue: "mock-secret-string-field-value"
                },
                secretAndRequiredStringField: {
                    stringValue: "mock-secret-and-required-string-field-value"
                }
            },
            createTime: "2020-10-27T13:32:21.246888Z",
            updateTime: "2020-10-27T13:32:21.246888Z"
        },
        readTime: "2020-10-27T18:34:47.292498Z"
    }
]

// make sure all test counters reset after each test
////////////////////////////////////////////////////
afterEach(jest.clearAllMocks)
////////////////////////////////////////////////////

test("CREATE: default behaves as expected", async () => {

    mockedAxios.post.mockImplementation( async (url, data) => {
        // create API responses are not read anyway
        return { status: 200, data: {} }
    })

    const resultErrors = await executeGqlQuery(`
        mutation {
            mockGqlCreate {
                id
            }
        }
    `, schema, null, mockContext)

    // only 2 because id, createdAt, updatedAt, and deletedAt are not usable ARGS anyway on a create.
    // so you should only be "lacking" normalStringField, normalNumberField
    // secretStringField is automatically excluded because it's isInternalOnly true
    expect(resultErrors.errors.length).toBe(2)

    const resultErrorFromInternalAndRequiredItem = await executeGqlQuery(`
        mutation {
            mockGqlCreate(normalStringField:"normal-string-field", normalNumberField:4940202) {
                id
            }
        }
    `, schema, null, mockContext)

    // we have a secret and internal item that fails because it requires an override of the resolve function
    expect(resultErrorFromInternalAndRequiredItem.errors.length).toBe(1)

    const resultSuccess = await executeGqlQuery(`
        mutation {
            mockGqlCreateWithInternalRequiredItem(normalStringField:"normal-string-field", normalNumberField:4940202) {
                id
            }
        }
    `, schema, null, mockContext)

    // create mutations only return the id by default
    expect(resultSuccess.data.mockGqlCreateWithInternalRequiredItem.id).toBeTruthy()
    expect(resultSuccess.data.mockGqlCreateWithInternalRequiredItem.createdAt).toBe(undefined)

    expect(mockedAxios.post).toHaveBeenCalledTimes(1)
})

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
