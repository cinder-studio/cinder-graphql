/**
    How to use:

    // Create the middleware

    const exampleMiddleware = buildGqlMiddleware((source, args, context, info, next) => {

        // execute your middleware

        // if desired, the middleware can return itself
        if(false) {
            return ...
        }

        // otherwise it can pass down further to the deeper resolve function
        return next(source, args, context, info)
    })

    // now attach the middleware

    query: {
        account: exampleMiddleware(require('./handlers/accounts').Query_Account)
    }

*/

export default (resolveWrapper:any) => {
    return (gqlResolvableObject:any) => {
        return {
            ...gqlResolvableObject,
            resolve: async (source, args, context, info) => {
                return await resolveWrapper(source, args, context, info, gqlResolvableObject.resolve, gqlResolvableObject)
            }
        }
    }
}
