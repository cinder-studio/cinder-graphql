"use strict";
//TODO WHAT HAPPENED TO RVER?
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
const graphql_1 = require("graphql");
const quick_firestore_1 = require("@cinder-studio/quick-firestore");
const commonSchema_1 = require("../commonSchema");
const enrichForInput = (inFields, opName, recursionDepth) => {
    const enrichedFields = {};
    for (const fieldKey of Object.keys(inFields)) {
        const currentField = inFields[fieldKey];
        if (currentField.typeObjectConfig) {
            ///-- recursive --///
            const resolvedConfig = Object.assign(Object.assign({}, currentField.typeObjectConfig), { fields: enrichForInput(currentField.typeObjectConfig.fields, opName, recursionDepth + 1) });
            ///-- end-recursive --///
            let enrichedFieldType = new graphql_1.GraphQLInputObjectType(Object.assign(Object.assign({}, resolvedConfig), { name: `${resolvedConfig.name}${opName}Input` }));
            // isRequired
            if (currentField.isRequired && recursionDepth > 0) {
                enrichedFieldType = new graphql_1.GraphQLNonNull(enrichedFieldType);
            }
            enrichedFields[fieldKey] = Object.assign(Object.assign({}, currentField), { type: enrichedFieldType });
        }
        else {
            enrichedFields[fieldKey] = currentField;
        }
    }
    return enrichedFields;
};
const enrichForOutput = (inFields, recursionDepth) => {
    const enrichedFields = {};
    for (const fieldKey of Object.keys(inFields)) {
        const currentField = inFields[fieldKey];
        if (currentField.typeObjectConfig) {
            ///-- recursive --///
            const resolvedConfig = Object.assign(Object.assign({}, currentField.typeObjectConfig), { fields: enrichForOutput(currentField.typeObjectConfig.fields, recursionDepth + 1) });
            ///-- end-recursive --///
            let enrichedFieldType = new graphql_1.GraphQLObjectType(resolvedConfig);
            // isRequired
            if (currentField.isRequired && recursionDepth > 0) {
                enrichedFieldType = new graphql_1.GraphQLNonNull(enrichedFieldType);
            }
            enrichedFields[fieldKey] = Object.assign(Object.assign({}, currentField), { type: enrichedFieldType });
        }
        else {
            enrichedFields[fieldKey] = currentField;
        }
    }
    return enrichedFields;
};
const applyGqlNullability = (inFields, exposeInternalOnlyFields = false, stripFieldsBlockedForUpdate = false) => {
    const fieldsWithNullability = {};
    for (const fieldKey of Object.keys(inFields)) {
        if (exposeInternalOnlyFields || inFields[fieldKey].isInternalOnly === undefined || !inFields[fieldKey].isInternalOnly) {
            if (!stripFieldsBlockedForUpdate || !inFields[fieldKey].preventUpdate) {
                fieldsWithNullability[fieldKey] = {
                    type: !inFields[fieldKey].isRequired ? inFields[fieldKey].type : graphql_1.GraphQLNonNull(inFields[fieldKey].type),
                    description: inFields[fieldKey].description
                };
            }
        }
    }
    return fieldsWithNullability;
};
const stripGqlNullability = (inFields, exposeInternalOnlyFields = false, stripFieldsBlockedForUpdate = false) => {
    const fieldsWithNullability = {};
    for (const fieldKey of Object.keys(inFields)) {
        if (exposeInternalOnlyFields || inFields[fieldKey].isInternalOnly === undefined || !inFields[fieldKey].isInternalOnly) {
            if (!stripFieldsBlockedForUpdate || !inFields[fieldKey].preventUpdate) {
                fieldsWithNullability[fieldKey] = {
                    type: inFields[fieldKey].type,
                    description: inFields[fieldKey].description
                };
            }
        }
    }
    return fieldsWithNullability;
};
const verifyGqlRequired = (inArgs, inFields) => {
    for (const fieldKey of Object.keys(inFields)) {
        if (inArgs[fieldKey] === undefined || inArgs[fieldKey] === null) {
            if (inFields[fieldKey].isRequired) {
                return false;
            }
            else {
                inArgs[fieldKey] = null;
            }
        }
    }
    return true;
};
class FirebaseGraphqlCodec {
    constructor(options) {
        this.filterSelect = (fields) => {
            const filter = [];
            // filter inbound data to only approved keys
            for (const field of fields) {
                if (this.fieldNames.includes(field.fieldPath)) {
                    filter.push(Object.assign({}, field));
                }
            }
            return filter;
        };
        this.createOneCodec = (options) => {
            // override with options.overrideType
            const defaultReturnType = commonSchema_1.Type_CreateMutationResult;
            // override with options.overrideArgs
            const defaultArgs = Object.assign({}, applyGqlNullability(enrichForInput(this.fields, 'Create', 0)));
            // override with options.overrideResolve
            const defaultResolve = (source, args, context, info) => __awaiter(this, void 0, void 0, function* () {
                const newOverrideId = context.overrideId || null;
                // this ensures default-create for isInternalOnly fields (and non-null fields) honors the isRequired setting
                // isInternalOnly + isRequired === you must override the defaultResolve
                if (!verifyGqlRequired(args, this.fields)) {
                    throw new Error('a required field is missing');
                }
                return yield context.quickFirestore.create(this.collectionName, Object.assign(Object.assign({}, args), { rVer: this.rVer }), newOverrideId);
                //Note: Create errors will throw an exception from the QuickFirestore API Layer
                //TODO: Evaluate Better Error Handling
            });
            return {
                description: options.description,
                type: (!options.overrideType ? defaultReturnType : new graphql_1.GraphQLObjectType(options.overrideType(Object.assign(Object.assign({}, commonSchema_1.Type_CreateMutationResultConfig), { fields: Object.assign({}, commonSchema_1.Type_CreateMutationResultConfig.fields) })))),
                args: (!options.overrideArgs ? defaultArgs : options.overrideArgs(Object.assign({}, defaultArgs))),
                resolve: (!options.overrideResolve ? defaultResolve : options.overrideResolve(defaultResolve))
            };
        };
        this.updateOneCodec = (options) => {
            // override with options.overrideType
            const defaultReturnType = commonSchema_1.Type_UpdateMutationResult;
            // override with options.overrideArgs
            const defaultArgs = Object.assign({ id: { type: graphql_1.GraphQLNonNull(graphql_1.GraphQLString), description: "System-wide unique identifier for this record" } }, stripGqlNullability(enrichForInput(this.fields, 'Update', 0), false, true));
            // override with options.overrideResolve
            const defaultResolve = (source, args, context, info) => __awaiter(this, void 0, void 0, function* () {
                yield context.quickFirestore.update(this.collectionName, args.id, Object.assign(Object.assign({}, args), { updatedAt: Date.now(), rVer: this.rVer }));
                return {
                    id: args.id
                };
            });
            return {
                description: options.description,
                type: (!options.overrideType ? defaultReturnType : new graphql_1.GraphQLObjectType(options.overrideType(Object.assign(Object.assign({}, commonSchema_1.Type_UpdateMutationResultConfig), { fields: Object.assign({}, commonSchema_1.Type_UpdateMutationResultConfig.fields) })))),
                args: (!options.overrideArgs ? defaultArgs : options.overrideArgs(Object.assign({}, defaultArgs))),
                resolve: (!options.overrideResolve ? defaultResolve : options.overrideResolve(defaultResolve))
            };
        };
        this.deleteOneCodec = (options) => {
            // override with options.overrideType
            const defaultReturnType = commonSchema_1.Type_DeleteMutationResult;
            // override with options.overrideArgs
            const defaultArgs = {
                id: { type: graphql_1.GraphQLNonNull(graphql_1.GraphQLString), description: "System-wide unique identifier for this record" }
            };
            // override with options.overrideResolve
            const defaultResolve = (source, args, context, info) => __awaiter(this, void 0, void 0, function* () {
                const result = yield context.quickFirestore.update(this.collectionName, args.id, {
                    deletedAt: Date.now()
                });
                return {
                    id: result
                };
            });
            return {
                description: options.description,
                type: (!options.overrideType ? defaultReturnType : new graphql_1.GraphQLObjectType(options.overrideType(Object.assign(Object.assign({}, commonSchema_1.Type_DeleteMutationResultConfig), { fields: Object.assign({}, commonSchema_1.Type_DeleteMutationResultConfig.fields) })))),
                args: (!options.overrideArgs ? defaultArgs : options.overrideArgs(Object.assign({}, defaultArgs))),
                resolve: (!options.overrideResolve ? defaultResolve : options.overrideResolve(defaultResolve))
            };
        };
        this.readOneCodec = (options) => {
            // override with options.overrideType
            const defaultReturnType = this.defaultReadReturnType;
            // override with options.overrideArgs
            const defaultArgs = {
                id: { type: graphql_1.GraphQLNonNull(graphql_1.GraphQLString), description: "System-wide unique identifier for this record" }
            };
            // override with options.overrideResolve
            const defaultResolve = (source, args, context, info) => __awaiter(this, void 0, void 0, function* () {
                const result = yield context.quickFirestore.queryOne(this.collection()
                    .selectWithCommonFields(...this.fieldNames)
                    .whereComposite('id', 'EQUAL', 'string', args.id)
                    .whereComposite('deletedAt', 'IS_NULL')
                    .prepare());
                return Object.assign(Object.assign({}, result), { cursor: null });
            });
            return {
                description: options.description,
                type: (!options.overrideType ? defaultReturnType : new graphql_1.GraphQLObjectType(options.overrideType(Object.assign(Object.assign({}, this.defaultReadReturnTypeConfig), { fields: Object.assign({}, this.defaultReadReturnTypeConfig.fields) })))),
                args: (!options.overrideArgs ? defaultArgs : options.overrideArgs(Object.assign({}, defaultArgs))),
                resolve: (!options.overrideResolve ? defaultResolve : options.overrideResolve(defaultResolve))
            };
        };
        this.listPaginatedCodec = (options) => {
            // override with options.overrideType
            const defaultReturnType = this.defaultReadReturnType;
            // override with options.overrideArgs
            const defaultArgs = {
                cursor: { type: graphql_1.GraphQLString, description: "A way to track where the record is on the list in the database for pagination" }
            };
            // override with options.overrideResolve
            const defaultResolve = (source, args, context, info) => __awaiter(this, void 0, void 0, function* () {
                const query = this.collection().select(...this.fieldNames).whereComposite('deletedAt', 'IS_NULL').limit(options.defaultListLimit);
                for (const order of options.orderListBy) {
                    query.orderBy(`${order.name}`, `${order.dir}`);
                }
                if (args.cursor) {
                    const cursorArray = args.cursor.split('|');
                    const cursor = [];
                    let i = 0;
                    for (const orderByField of options.orderListBy) {
                        if (orderByField.type === 'string') {
                            cursor.push({ stringValue: `${cursorArray[i]}` });
                        }
                        else {
                            cursor.push({ integerValue: Number(cursorArray[i]) });
                        }
                        i += 1;
                    }
                    query.paginatedAfter([...cursor], options.defaultListLimit);
                }
                const results = yield this.get(query, context.quickFirestore);
                const mappedResults = results.map(result => {
                    let cursor = '';
                    for (const orderByField of options.orderListBy) {
                        cursor += `${result[orderByField.name]}|`;
                    }
                    cursor = cursor.substring(0, cursor.length - 1);
                    return Object.assign(Object.assign({}, result), { cursor: cursor });
                });
                return mappedResults;
            });
            return {
                description: options.description,
                type: new graphql_1.GraphQLList(!options.overrideType ? (new graphql_1.GraphQLNonNull(defaultReturnType)) : (new graphql_1.GraphQLNonNull(new graphql_1.GraphQLObjectType(options.overrideType(Object.assign(Object.assign({}, this.defaultReadReturnTypeConfig), { fields: Object.assign({}, this.defaultReadReturnTypeConfig.fields) })))))),
                args: (!options.overrideArgs ? defaultArgs : options.overrideArgs(Object.assign({}, defaultArgs))),
                resolve: (!options.overrideResolve ? defaultResolve : options.overrideResolve(defaultResolve))
            };
        };
        this.customQueryCodec = (options) => {
            // you must ALWAYS PROVIDE A CUSTOM RESOLVE FUNCTION
            if (!options.customResolve) {
                throw new Error('you must always supply a "customResolve" function to a "customQueryCodec"');
            }
            // override with options.overrideType
            const defaultReturnType = this.defaultReadReturnType;
            // override with options.overrideArgs
            const defaultArgs = {};
            // the resolve
            const trueResolve = (source, args, context, info) => __awaiter(this, void 0, void 0, function* () {
                const resolveResults = yield options.customResolve(context.quickFirestore, this.collection(), source, args, context, info);
                return resolveResults;
            });
            return {
                description: options.description,
                type: new graphql_1.GraphQLNonNull(new graphql_1.GraphQLList(!options.overrideType ? (new graphql_1.GraphQLNonNull(defaultReturnType)) : (new graphql_1.GraphQLNonNull(new graphql_1.GraphQLObjectType(options.overrideType(Object.assign(Object.assign({}, this.defaultReadReturnTypeConfig), { fields: Object.assign({}, this.defaultReadReturnTypeConfig.fields) }))))))),
                args: (!options.overrideArgs ? defaultArgs : options.overrideArgs(Object.assign({}, defaultArgs))),
                resolve: trueResolve
            };
        };
        this.displayShortname = options.displayShortname;
        this.collectionName = options.collectionName;
        this.description = options.description;
        this.rVer = options.rVer;
        const sortedFields = this.sortFields(options.fields);
        this.fields = sortedFields.sorted;
        this.fieldNames = sortedFields.fieldNames;
        this.defaultReadReturnTypeConfig = {
            name: this.displayShortname,
            description: this.description,
            fields: Object.assign(Object.assign(Object.assign({}, commonSchema_1.Interface_IDatabaseRecord_ApiFields), applyGqlNullability(enrichForOutput(this.fields, 0))), { cursor: { type: graphql_1.GraphQLString, description: "This field will be returned when the object is obtained using a cursor-based list query" } })
        };
        this.defaultReadReturnType = new graphql_1.GraphQLObjectType(this.defaultReadReturnTypeConfig);
    }
    sortFields(fields) {
        const setFields = {};
        const defaultValues = {};
        const fieldNames = ['createdAt', 'updatedAt', 'deletedAt', 'id'];
        for (const key of Object.keys(fields)) {
            setFields[key] = fields[key];
            defaultValues[key] = (fields[key].defaultValue ? fields[key].defaultValue : null);
            delete (fields[key].defaultValue);
            fieldNames.push(key);
        }
        return {
            fieldNames: fieldNames,
            defaultValues: defaultValues,
            sorted: setFields
        };
    }
    collection() {
        return quick_firestore_1.QuickQuery.collection(this.collectionName);
    }
    get(inQuery, quickFs) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = inQuery;
            if (query.query.select && query.query.select.fields) {
                const filteredSelect = this.filterSelect(query.query.select.fields);
                query.query.select.fields = filteredSelect;
            }
            return yield quickFs.query(inQuery.prepare());
        });
    }
}
exports.default = FirebaseGraphqlCodec;
//# sourceMappingURL=FirebaseGraphqlCodec.js.map