"use strict";
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
exports.default = (resolveWrapper) => {
    return (gqlResolvableObject) => {
        return Object.assign(Object.assign({}, gqlResolvableObject), { resolve: (source, args, context, info) => __awaiter(void 0, void 0, void 0, function* () {
                return yield resolveWrapper(source, args, context, info, gqlResolvableObject.resolve, gqlResolvableObject);
            }) });
    };
};
//# sourceMappingURL=buildGqlMiddleware.js.map