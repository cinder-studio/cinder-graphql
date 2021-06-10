import { GraphQLError } from "graphql"

/**
    FriendlyGqlError

    These errors are processed and delivered to GQL clients in predictable ways.

    It is expected that the client receiving these errors have an accurate
    understanding of the machine key behind each error message and that the
    client provide an appropriate error message or user experience when
    these errors are thrown.

    It is preferrable to have as few places in the code as possible where an
    error like this is needed.

    ---

    Usage:

    throw new FriendlyGqlError("example-machine-code","This is an example error message readable by engineers only.")

*/
class FriendlyGqlError extends GraphQLError{
    constructor(machineKey:string, engineerMessage:string, metadata?:any, originalError?:Error) {
        const addlMetadata = metadata ? metadata : {}
        super(
            engineerMessage,
            undefined,
            undefined,
            undefined,
            undefined,
            originalError,
            {
                machineKey: machineKey,
                ...addlMetadata
            }
        )
    }
}

export default FriendlyGqlError

// Here is the definition of GraphQLError
// https://github.com/graphql/graphql-js/blob/main/src/error/GraphQLError.d.ts

// /**
//  * A GraphQLError describes an Error found during the parse, validate, or
//  * execute phases of performing a GraphQL operation. In addition to a message
//  * and stack trace, it also includes information about the locations in a
//  * GraphQL document and/or execution result that correspond to the Error.
//  */
// export class GraphQLError extends Error {
//   constructor(
//     message: string,
//     nodes?: Maybe<ReadonlyArray<ASTNode> | ASTNode>,
//     source?: Maybe<Source>,
//     positions?: Maybe<ReadonlyArray<number>>,
//     path?: Maybe<ReadonlyArray<string | number>>,
//     originalError?: Maybe<Error>,
//     extensions?: Maybe<{ [key: string]: unknown }>,
//   );
//   /**
//    * A message describing the Error for debugging purposes.
//    *
//    * Enumerable, and appears in the result of JSON.stringify().
//    *
//    * Note: should be treated as readonly, despite invariant usage.
//    */
//   message: string;
//   /**
//    * An array of { line, column } locations within the source GraphQL document
//    * which correspond to this error.
//    *
//    * Errors during validation often contain multiple locations, for example to
//    * point out two things with the same name. Errors during execution include a
//    * single location, the field which produced the error.
//    *
//    * Enumerable, and appears in the result of JSON.stringify().
//    */
//   readonly locations: ReadonlyArray<SourceLocation> | undefined;
//   /**
//    * An array describing the JSON-path into the execution response which
//    * corresponds to this error. Only included for errors during execution.
//    *
//    * Enumerable, and appears in the result of JSON.stringify().
//    */
//   readonly path: ReadonlyArray<string | number> | undefined;
//   /**
//    * An array of GraphQL AST Nodes corresponding to this error.
//    */
//   readonly nodes: ReadonlyArray<ASTNode> | undefined;
//   /**
//    * The source GraphQL document corresponding to this error.
//    *
//    * Note that if this Error represents more than one node, the source may not
//    * represent nodes after the first node.
//    */
//   readonly source: Source | undefined;
//   /**
//    * An array of character offsets within the source GraphQL document
//    * which correspond to this error.
//    */
//   readonly positions: ReadonlyArray<number> | undefined;
//   /**
//    * The original error thrown from a field resolver during execution.
//    */
//   readonly originalError: Maybe<Error>;
//   /**
//    * Extension fields to add to the formatted error.
//    */
//   readonly extensions: { [key: string]: unknown } | undefined;
// }
