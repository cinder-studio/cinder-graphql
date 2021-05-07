"use strict";
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
exports.introspectionQuery = void 0;
const graphql_1 = require("graphql");
// this is an example introspection query to be used by 3rd-party clients to inspect our API definition
exports.introspectionQuery = `
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
`;
// DEFAULT: executeGqlQuery
exports.default = (requestString, schema, root, contextValue, variableValues, operationName) => __awaiter(void 0, void 0, void 0, function* () {
    // print schema
    if (requestString === 'printSchema') {
        return { message: graphql_1.printSchema(schema) };
    }
    // NOTE: Not sure what this is useful for but its nice to know it's here
    //    // print introspection schema
    //    else if(requestString === 'printIntrospectionSchema') {
    //        return { message: printIntrospectionSchema(schema) }
    //    }
    return yield graphql_1.graphql(schema, requestString, root, contextValue, variableValues, operationName);
});
//# sourceMappingURL=executeGqlQuery.js.map