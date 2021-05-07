"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.axiosCreate = exports.axios = exports.axiosHttpAdapter = void 0;
const axios_1 = require("axios");
exports.axios = axios_1.default;
function addTimerInterceptors(axiosInstance) {
    // Add a request interceptor
    axiosInstance.interceptors.request.use((config) => {
        config._localtimers = {
            start: Date.now(),
        };
        return config;
    }, (error) => {
        error._localtimers = {
            start: (error.config && error.config._localtimers) ? error.config._localtimers.start : Date.now(),
            end: Date.now(),
        };
        error._localtimers.elapsed = error._localtimers.end - error._localtimers.start;
        return Promise.reject(error);
    });
    // Add a response interceptor
    axiosInstance.interceptors.response.use((response) => {
        response._localtimers = {
            start: response.config._localtimers.start,
            end: Date.now(),
        };
        response._localtimers.elapsed = response._localtimers.end - response._localtimers.start;
        return response;
    }, (error) => {
        error._localtimers = {
            start: (error.config && error.config._localtimers) ? error.config._localtimers.start : Date.now(),
            end: Date.now(),
        };
        error._localtimers.elapsed = error._localtimers.end - error._localtimers.start;
        return Promise.reject(error);
    });
}
exports.axiosHttpAdapter = require('axios/lib/adapters/http');
function axiosCreate(config) {
    const instance = axios_1.default.create(config);
    addTimerInterceptors(instance);
    return instance;
}
exports.axiosCreate = axiosCreate;
//# sourceMappingURL=index.js.map