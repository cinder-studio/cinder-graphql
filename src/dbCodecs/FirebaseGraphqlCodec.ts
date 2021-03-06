//TODO WHAT HAPPENED TO RVER?

import {
    GraphQLObjectType,
    GraphQLInputObjectType,
    GraphQLNonNull,
    GraphQLString,
    GraphQLList
} from "graphql"

import { QuickFirestore, QuickQuery } from "@cinder-studio/quick-firestore"

import {
    Interface_IDatabaseRecord_ApiFields,
    Type_CreateMutationResultConfig,
    Type_CreateMutationResult,
    Type_UpdateMutationResultConfig,
    Type_UpdateMutationResult,
    Type_DeleteMutationResultConfig,
    Type_DeleteMutationResult
} from "../commonSchema"

interface IField {
    type?: any,
    typeObjectConfig?: any,
    typeListOfObjectConfigs?: any,
    description: string,
    isRequired: boolean,
    isInternalOnly?: boolean,
    isReadOnly?: boolean,
    preventUpdate?: boolean,
    defaultValue: any,
}

interface IFieldsDictionary {
    [id:string]: IField
}

interface IOptions {
    displayShortname: string,
    collectionName: string,
    description: string,
    rVer: number,
    fields: IFieldsDictionary
}

interface ITypeDef {
    name: string,
    description?: string,
    fields: any // i'd prefer IFieldsDictionary but getting fancy with inputs is not working
}

interface ICodecOptions {
    description: string
    customValidator?: (args:any, context:any) => boolean
    overrideType?: (defaultReturnTypeConfig:ITypeDef) => ITypeDef
    overrideArgs?: (defaultArgsList:any) => any // id prefer the input be IField[] but it does not like me getting fancy with inputs
    overrideResolve?: (defaultFn:any) => any
}

interface IListCodecOptions extends ICodecOptions {
    defaultListLimit: number
    orderListBy: IOrderBy[]
}

interface ICustomQueryCodecOptions extends ICodecOptions {
    customResolve: (quickFs:QuickFirestore, collection:any, source:any, args:any, context:any, info:any) => Promise<any>
}

interface IOrderBy {
    name: string,
    dir: string,
    type: string
}

/*
    This is a recursive function that loops down an object tree and converts each
    object configuration into an actual GraphQLInputObjectType. Given that every
    object it creates is an Input , it names every field with a postfix of "Input".

    It also applies nullability at the deeper levels of the object tree while
    ignoring nullability at the top level. Reserving that configuration for
    another function.

    This function also preserves other internal configuration fields for further
    configuration changes at the next step.
*/
const enrichForInput = (inFields:any, opName:string, recursionDepth:number) => {
    const enrichedFields = {}
    for(const fieldKey of Object.keys(inFields)) {
        const currentField = inFields[fieldKey]
        if(currentField.typeObjectConfig) {

            ///-- recursive --///
            const resolvedConfig = {
                ...currentField.typeObjectConfig,
                fields: enrichForInput(currentField.typeObjectConfig.fields, opName, recursionDepth + 1)
            }
            ///-- end-recursive --///

            let enrichedFieldType:any = new GraphQLInputObjectType({
                ...resolvedConfig,
                name: `${resolvedConfig.name}${opName}Input`
            })

            // isRequired
            if(currentField.isRequired && recursionDepth > 0) {
                enrichedFieldType = new GraphQLNonNull(enrichedFieldType)
            }

            enrichedFields[fieldKey] = {
                ...currentField,
                type: enrichedFieldType
            }

        }
        else if(currentField.typeListOfObjectConfigs) {

            ///-- recursive --///
            const resolvedConfig = {
                ...currentField.typeListOfObjectConfigs,
                fields: enrichForInput(currentField.typeListOfObjectConfigs.fields, opName, recursionDepth + 1)
            }
            ///-- end-recursive --///

            let enrichedFieldType:any = new GraphQLInputObjectType({
                ...resolvedConfig,
                name: `${resolvedConfig.name}${opName}Input`
            })

            // isRequired
            if(currentField.isRequired && recursionDepth > 0) {
                enrichedFieldType = new GraphQLNonNull(enrichedFieldType)
            }

            enrichedFields[fieldKey] = {
                ...currentField,
                type: GraphQLList(enrichedFieldType)
            }

        }
        else {
            enrichedFields[fieldKey] = currentField
        }
    }
    return enrichedFields
}

/*
    This is a recursive function that loops down an object tree and converts each
    object configuration into an actual GraphQLObjectType. It has no impact on the
    name of the objects. It honors the name provided.

    It also applies nullability at the deeper levels of the object tree while
    ignoring nullability at the top level. Reserving that configuration for
    another function.

    This function also preserves other internal configuration fields for further
    configuration changes at the next step.
*/
const enrichForOutput = (inFields:any, recursionDepth:number) => {
    const enrichedFields = {}
    for(const fieldKey of Object.keys(inFields)) {
        const currentField = inFields[fieldKey]
        if(currentField.typeObjectConfig) {

            ///-- recursive --///
            const resolvedConfig = {
                ...currentField.typeObjectConfig,
                fields: enrichForOutput(currentField.typeObjectConfig.fields, recursionDepth + 1)
            }
            ///-- end-recursive --///

            let enrichedFieldType:any = new GraphQLObjectType(resolvedConfig)

            // isRequired
            if(currentField.isRequired && recursionDepth > 0) {
                enrichedFieldType = new GraphQLNonNull(enrichedFieldType)
            }

            enrichedFields[fieldKey] = {
                ...currentField,
                type: enrichedFieldType
            }

        }
        else if(currentField.typeListOfObjectConfigs) {

            ///-- recursive --///
            const resolvedConfig = {
                ...currentField.typeListOfObjectConfigs,
                fields: enrichForOutput(currentField.typeListOfObjectConfigs.fields, recursionDepth + 1)
            }
            ///-- end-recursive --///

            let enrichedFieldType:any = new GraphQLObjectType(resolvedConfig)

            // isRequired
            if(currentField.isRequired && recursionDepth > 0) {
                enrichedFieldType = new GraphQLNonNull(enrichedFieldType)
            }

            enrichedFields[fieldKey] = {
                ...currentField,
                type: GraphQLList(enrichedFieldType)
            }

        }
        else {
            enrichedFields[fieldKey] = currentField
        }
    }
    return enrichedFields
}

/**
    Apply restrictions on each field depending on the read or write model of the
    api the object is intended for.
*/
interface IFieldAlterationOptions {
    enforceRequired:boolean
    hideInternalOnly:boolean
    hideReadOnly:boolean
    hidePreventUpdate:boolean
}
const applyFieldAlterations = ( inFieldsMap:any, options:IFieldAlterationOptions ) => {
    const fieldsToReturn = {}
    for(const fieldKey of Object.keys(inFieldsMap)) {
        try {
            let currentField = inFieldsMap[fieldKey]
            // filters
            if(options.hideInternalOnly && currentField.isInternalOnly) {
                continue
            }
            if(options.hideReadOnly && currentField.isReadOnly) {
                continue
            }
            if(options.hidePreventUpdate && currentField.preventUpdate) {
                continue
            }
            //and write
            fieldsToReturn[fieldKey] = {
                type: (options.enforceRequired && currentField.isRequired) ? GraphQLNonNull(currentField.type) : currentField.type,
                description: currentField.description
            }
        }
        catch (e) {
            console.error(e)
            throw new Error(`FirebaseGraphqlCodec had an error applying GQL field alterations: field:${fieldKey}`)
        }
    }
    return fieldsToReturn
}

const verifyGqlRequired = (inArgs:any, inFields:any, defaultValues:any) => {
    for(const fieldKey of Object.keys(inFields)) {
        if(inArgs[fieldKey] === undefined || inArgs[fieldKey] === null) {
            if(inFields[fieldKey].isRequired) {
                if(defaultValues[fieldKey]) {
                    inArgs[fieldKey] = defaultValues[fieldKey]
                }
                else {
                    return false
                }
            }
        }
    }
    return true
}

export default class FirebaseGraphqlCodec {
    public displayShortname:string
    public collectionName:string
    public description:string
    private rVer: number
    private fields: IFieldsDictionary
    private fieldNames: string[]
    private defaultValues: any
    public defaultReadReturnTypeConfig: any
    public defaultReadReturnType: any

    constructor(options:IOptions) {
        this.displayShortname = options.displayShortname
        this.collectionName = options.collectionName
        this.description = options.description
        this.rVer = options.rVer

        const sortedFields = this.sortFields(options.fields)

        this.fields = sortedFields.sorted
        this.fieldNames = sortedFields.fieldNames
        this.defaultValues = sortedFields.defaultValues

        this.defaultReadReturnTypeConfig = {
            name: this.displayShortname,
            description: this.description,
            fields: {
                ...Interface_IDatabaseRecord_ApiFields,
                // when a read or list function views this record,
                // gql will need to be able to indicate if a field is nullable
                // so we are recording that value now for read and list outputs.
                ...applyFieldAlterations(enrichForOutput(this.fields, 0), {
                    enforceRequired:true,
                    hideInternalOnly:true,
                    hideReadOnly:false,
                    hidePreventUpdate:false,
                }),
                cursor: { type: GraphQLString, description: "This field will be returned when the object is obtained using a cursor-based list query" }
            }
        }
        this.defaultReadReturnType = new GraphQLObjectType(this.defaultReadReturnTypeConfig)
    }

    public filterSelect = (fields:any) => {
        // filter inbound data to only approved keys
        const filter = []
        for(const field of fields) {
            if(this.fieldNames.includes(field.fieldPath)) {
                filter.push({...field})
            }
        }
        return filter
    }

    private sortFields(fields) {
        const setFields = {}
        const defaultValues = {}
        const fieldNames = ['createdAt', 'updatedAt', 'deletedAt', 'id']
        for(const key of Object.keys(fields)) {
            setFields[key] = fields[key]
            defaultValues[key] = (fields[key].defaultValue ? fields[key].defaultValue : null)
            delete(fields[key].defaultValue)
            fieldNames.push(key)
        }

        return {
            fieldNames: fieldNames,
            defaultValues: defaultValues,
            sorted: setFields
        }
    }

//TODO expirimental
//TODO test and convert 'createOneCodec' to use this function
    public prepareCreateObject = (objToCreate:any, quickFirestore:any, overrideId?:string) => {
        const objPrepared = {...objToCreate} // TODO deep copy?
        if(!verifyGqlRequired(objPrepared, this.fields, this.defaultValues)) {
            throw new Error('a required field is missing')
        }
        const documentId = overrideId ? overrideId : quickFirestore.config.overrideIdCreator()
        // transform /enforce create data format
        return quickFirestore.config.overrideCreateTransform(objPrepared, documentId)
    }

    public createOneCodec = (options:ICodecOptions) => {

        // override with options.overrideType
        const defaultReturnType = Type_CreateMutationResult

        // override with options.overrideArgs
        const defaultArgs = {
            // DO NOT INCLUDE THESE AS DEFAULT ARGS -- THE USER SHOULD NEVER BE ABLE TO MODIFY THESE FIELDS
            //    ...Interface_IDatabaseRecord_ApiFields,
            // graphql has it's own method of describing nullability, we need it
            // to know that data and honor it during a standard CREATE operation.
            ...applyFieldAlterations(enrichForInput(this.fields,'Create', 0), {
                enforceRequired:true,
                hideInternalOnly:true,
                hideReadOnly:true,
                hidePreventUpdate:false,
            }),
        }

        // override with options.overrideResolve
        const defaultResolve = async (source, args, context, info) => {

            const newOverrideId = context.overrideId || null

            // this ensures default-create for isInternalOnly fields (and non-null fields) honors the isRequired setting
            // isInternalOnly + isRequired === you must override the defaultResolve
// TODO better error handling
            // this function also fills in default values when needed

            if(!verifyGqlRequired(args, this.fields, this.defaultValues)) {
                throw new Error('a required field is missing')
            }

            return await context.quickFirestore.create(
                this.collectionName,
                {
                    ...args,
                    rVer: this.rVer
                },
                newOverrideId
            )
            //Note: Create errors will throw an exception from the QuickFirestore API Layer
            //TODO: Evaluate Better Error Handling
        }

        // REVIEWED: review concludes that the customValidator will always run at the correct time. This implementation is valid.
        const trueResolve = async (source, args, context, info) => {
            // custom validator
            if(options.customValidator && !options.customValidator(args, context)) {
                throw new Error('unexpected error validating this call') // will only be called if the validator function does not return true or an error
            }
            // resolve
            const targetResolver = (!options.overrideResolve ? defaultResolve : options.overrideResolve(defaultResolve))
            return targetResolver(source, args, context, info)
        }

        return {
            description: options.description,
            type: (!options.overrideType ? defaultReturnType : new GraphQLObjectType( options.overrideType({...Type_CreateMutationResultConfig, fields:{...Type_CreateMutationResultConfig.fields}}))),
            args: (!options.overrideArgs ? defaultArgs : options.overrideArgs({...defaultArgs})),
            resolve: trueResolve
        }
    }

    public updateOneCodec = (options:ICodecOptions) => {

        // override with options.overrideType
        const defaultReturnType = Type_UpdateMutationResult

        // override with options.overrideArgs

        const defaultArgs = {
            id: { type: GraphQLNonNull(GraphQLString), description: "System-wide unique identifier for this record" },
            // graphql has it's own method of describing nullability.
            // in the case of a standard update scenario, you should
            // be able to choose to update any field you want,
            // BUT NOT REQUIRED TO UPDATE IT
            ...applyFieldAlterations(enrichForInput(this.fields,'Update', 0), {
                enforceRequired:false,
                hideInternalOnly:true,
                hideReadOnly:true,
                hidePreventUpdate:true,
            }),
        }

        // override with options.overrideResolve
        const defaultResolve = async (source, args, context, info) => {
            // don't update the actual id of the record. it's just an excessive dangerous write
            const targetId = `${args.id}`
            delete(args.id)
            // now run the update
            await context.quickFirestore.update(
                this.collectionName,
                targetId,
                {
                    ...args,
                    updatedAt: Date.now(),
                    rVer: this.rVer
                }
            )
            // return a standard representation from a normal update
            return {
                id: targetId
            }
        }

        // REVIEWED: review concludes that the customValidator will always run at the correct time. This implementation is valid.
        const trueResolve = async (source, args, context, info) => {
            // custom validator
            if(options.customValidator && !options.customValidator(args, context)) {
                throw new Error('unexpected error validating this call') // will only be called if the validator function does not return true or an error
            }
            // resolve
            const targetResolver = (!options.overrideResolve ? defaultResolve : options.overrideResolve(defaultResolve))
            return targetResolver(source, args, context, info)
        }

        return {
            description: options.description,
            type: (!options.overrideType ? defaultReturnType : new GraphQLObjectType( options.overrideType({...Type_UpdateMutationResultConfig, fields:{...Type_UpdateMutationResultConfig.fields}}))),
            args: (!options.overrideArgs ? defaultArgs : options.overrideArgs({...defaultArgs})),
            resolve: trueResolve
        }
    }

    public deleteOneCodec = (options:ICodecOptions) => {

        // override with options.overrideType
        const defaultReturnType = Type_DeleteMutationResult

        // override with options.overrideArgs
        const defaultArgs = {
            id: { type: GraphQLNonNull(GraphQLString), description: "System-wide unique identifier for this record" }
        }

        // override with options.overrideResolve
        const defaultResolve = async (source, args, context, info) => {
            // run the delete query
            const result =  await context.quickFirestore.update(
                this.collectionName,
                args.id,
                {
                    deletedAt: Date.now()
                }
            )

            return {
                id: result
            }
        }

        // REVIEWED: review concludes that the customValidator will always run at the correct time. This implementation is valid.
        const trueResolve = async (source, args, context, info) => {
            // custom validator
            if(options.customValidator && !options.customValidator(args, context)) {
                throw new Error('unexpected error validating this call') // will only be called if the validator function does not return true or an error
            }
            // resolve
            const targetResolver = (!options.overrideResolve ? defaultResolve : options.overrideResolve(defaultResolve))
            return targetResolver(source, args, context, info)
        }

        return {
            description: options.description,
            type: (!options.overrideType ? defaultReturnType : new GraphQLObjectType( options.overrideType({...Type_DeleteMutationResultConfig, fields:{...Type_DeleteMutationResultConfig.fields}}))),
            args: (!options.overrideArgs ? defaultArgs : options.overrideArgs({...defaultArgs})),
            resolve: trueResolve
        }
    }

    public readOneCodec = (options:ICodecOptions) => {

// TODO
// TODO read one codec should use the firebase read capability, not the query capability
// TODO

        // override with options.overrideType
        const defaultReturnType = this.defaultReadReturnType

        // override with options.overrideArgs
        const defaultArgs = {
            id: { type: GraphQLNonNull(GraphQLString), description: "System-wide unique identifier for this record" }
        }

        // override with options.overrideResolve
        const defaultResolve = async (source, args, context, info) => {
            // run the query
            const result = await context.quickFirestore.queryOne(
                this.collection()
                .selectWithCommonFields(...this.fieldNames)
                .whereComposite('id', 'EQUAL', 'string', args.id)
                .whereComposite('deletedAt', 'IS_NULL')
                .prepare()
            )
            if(!result) {
                return result
            }
            return {
                ...result,
// TODO support cursors
                cursor: null
            }
        }

        // REVIEWED: review concludes that the customValidator will always run at the correct time. This implementation is valid.
        const trueResolve = async (source, args, context, info) => {
            // custom validator
            if(options.customValidator && !options.customValidator(args, context)) {
                throw new Error('unexpected error validating this call') // will only be called if the validator function does not return true or an error
            }
            // resolve
            const targetResolver = (!options.overrideResolve ? defaultResolve : options.overrideResolve(defaultResolve))
            return targetResolver(source, args, context, info)
        }

        return {
            description: options.description,
            type: (!options.overrideType ? defaultReturnType : new GraphQLObjectType( options.overrideType({...this.defaultReadReturnTypeConfig, fields:{...this.defaultReadReturnTypeConfig.fields}}))),
            args: (!options.overrideArgs ? defaultArgs : options.overrideArgs({...defaultArgs})),
            resolve: trueResolve
        }
    }

    public listPaginatedCodec = (options:IListCodecOptions) => {

        // override with options.overrideType
        const defaultReturnType = this.defaultReadReturnType

        // override with options.overrideArgs
        const defaultArgs = {
            cursor: { type: GraphQLString, description: "A way to track where the record is on the list in the database for pagination" }
        }

        // override with options.overrideResolve
        const defaultResolve = async (source, args, context, info) => {
            const query = this.collection().select(...this.fieldNames).whereComposite('deletedAt', 'IS_NULL').limit(options.defaultListLimit)

            for(const order of options.orderListBy) {
                query.orderBy(`${order.name}`, `${order.dir}`)
            }

            if(args.cursor) {
                const cursorArray = args.cursor.split('|')
                const cursor = []
                let i = 0
                for(const orderByField of options.orderListBy) {
                    if(orderByField.type === 'string'){
                        cursor.push({stringValue: `${cursorArray[i]}`})
                    }else{
                        cursor.push({integerValue: Number(cursorArray[i])})
                    }
                    i += 1
                }

                query.paginatedAfter([...cursor], options.defaultListLimit)
            }

            const results = await this.get(query, context.quickFirestore)

            const mappedResults = results.map( result => {

                let cursor = ''
                for(const orderByField of options.orderListBy) {
                    cursor += `${result[orderByField.name]}|`
                }
                cursor = cursor.substring(0,cursor.length - 1)

                return {
                    ...result,
                    cursor: cursor
                }
            })

            return mappedResults
        }

        // REVIEWED: review concludes that the customValidator will always run at the correct time. This implementation is valid.
        const trueResolve = async (source, args, context, info) => {
            // custom validator
            if(options.customValidator && !options.customValidator(args, context)) {
                throw new Error('unexpected error validating this call') // will only be called if the validator function does not return true or an error
            }
            // resolve
            const targetResolver = (!options.overrideResolve ? defaultResolve : options.overrideResolve(defaultResolve))
            return targetResolver(source, args, context, info)
        }

        return {
            description: options.description,
            type: new GraphQLList(
                !options.overrideType ? (
                    new GraphQLNonNull(defaultReturnType)
                ) : (
                    new GraphQLNonNull(
                        new GraphQLObjectType( options.overrideType({...this.defaultReadReturnTypeConfig, fields:{...this.defaultReadReturnTypeConfig.fields}}))
                    )
                )
            ),
            args: (!options.overrideArgs ? defaultArgs : options.overrideArgs({...defaultArgs})),
            resolve: trueResolve
        }
    }

    public customQueryCodec = (options:ICustomQueryCodecOptions) => {

        // you must ALWAYS PROVIDE A CUSTOM RESOLVE FUNCTION
        if(!options.customResolve) {
            throw new Error('you must always supply a "customResolve" function to a "customQueryCodec"')
        }

        // override with options.overrideType
        const defaultReturnType = this.defaultReadReturnType

        // override with options.overrideArgs
        const defaultArgs = {}

        // the resolve
        // REVIEWED: review concludes that the customValidator will always run at the correct time. This implementation is valid.
        const trueResolve = async (source, args, context, info) => {
            // custom validator
            if(options.customValidator && !options.customValidator(args, context)) {
                throw new Error('unexpected error validating this call') // will only be called if the validator function does not return true or an error
            }
            // call the custom resolve
            const resolveResults = await options.customResolve(context.quickFirestore, this.collection(), source, args, context, info)
            return resolveResults
        }

        return {
            description: options.description,
            type: new GraphQLNonNull(
                new GraphQLList(
                    !options.overrideType ? (
                        new GraphQLNonNull(defaultReturnType)
                    ) : (
                        new GraphQLNonNull(
                            new GraphQLObjectType( options.overrideType({...this.defaultReadReturnTypeConfig, fields:{...this.defaultReadReturnTypeConfig.fields}}))
                        )
                    )
                )
            ),
            args: (!options.overrideArgs ? defaultArgs : options.overrideArgs({...defaultArgs})),
            resolve: trueResolve
        }

    }

    public collection() {
        return QuickQuery.collection(this.collectionName)
    }

    public async get(inQuery:any, quickFs:QuickFirestore) {
        const query = inQuery
        if(query.query.select && query.query.select.fields) {
            const filteredSelect = this.filterSelect(query.query.select.fields)
            query.query.select.fields = filteredSelect
        }

        return await quickFs.query(inQuery.prepare())
    }

}
