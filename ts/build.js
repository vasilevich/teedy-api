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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var util = require("util");
var fs = require("fs");
var path_1 = require("path");
var lib_1 = require("apidoc-swagger-3/lib");
var intercept_stdout_1 = require("intercept-stdout");
var rimraf = util.promisify(require('rimraf'));
var mkdir = util.promisify(fs.mkdir);
var writeFile = util.promisify(fs.writeFile);
var mv = util.promisify(fs.rename);
var execCb = require('child_process').exec;
var exec = util.promisify(execCb);
var mkdirDeleteIfExist = function (path) { return (rimraf(path).then(function () { return mkdir(path); })); };
var tempFolder = path_1["default"].resolve(__dirname, "../temp");
var swaggerFile = path_1["default"].resolve(tempFolder, "swagger.json");
var sourceFolder = path_1["default"].resolve(tempFolder, "docs/docs-web/src/main/java/com/sismics/docs/rest/resource");
var compiledTypescriptOutput = path_1["default"].resolve(tempFolder, "ts");
var srcResultFolder = path_1["default"].resolve(__dirname, "../ts/swagger");
var gitClone = function (url, saveTo) { return (exec("git clone " + url, {
    stdio: [0, 1, 2],
    cwd: saveTo, // path to where you want to save the file
})); };
var options = {
    allowStdout: true,
};
intercept_stdout_1["default"](function (txt) {
    if (options.allowStdout) {
        return txt;
    }
    return '';
});
var stdOutAllowed = function (allowStdout) { return options.allowStdout = allowStdout; };
var convertApiDocsToSwagger = function () { return __awaiter(void 0, void 0, void 0, function () {
    var swaggerObject, path_2, p, method, m;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, rimraf(swaggerFile)];
            case 1:
                _a.sent();
                stdOutAllowed(false);
                lib_1.main({
                    excludeFilters: ['apidoc\\.config\\.js$'],
                    includeFilters: ['.*\\.(clj|cls|coffee|cpp|cs|dart|erl|exs?|go|groovy|ino?|java|js|jsx|kt|litcoffee|lua|mjs|p|php?|pl|pm|py|rb|scala|ts|vue)$'],
                    src: [sourceFolder],
                    dest: tempFolder + path_1["default"].sep,
                    verbose: false,
                    debug: false,
                    parse: false,
                    filters: {},
                    languages: {},
                    parsers: {},
                    workers: {},
                    colorize: true,
                    silent: true,
                    simulate: false,
                    sample: './sample/',
                });
                stdOutAllowed(true);
                swaggerObject = require(swaggerFile);
                swaggerObject.openapi = "3.0.0";
                for (path_2 in swaggerObject.paths) {
                    p = swaggerObject.paths[path_2];
                    for (method in p) {
                        m = p[method];
                        //    if (m.summary === 'PostUserLogin') {
                        m.parameters.forEach(function (parameter) {
                            if (!parameter.schema) {
                                parameter.schema = {
                                    "type": parameter.type,
                                };
                            }
                        });
                        // }
                    }
                }
                return [4 /*yield*/, writeFile(swaggerFile, JSON.stringify(swaggerObject))];
            case 2:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
var swaggerTypescriptGenerator = function () { return mkdirDeleteIfExist(compiledTypescriptOutput)
    .then(function () { return exec("npx sc generate -i " + swaggerFile + " -l typescript-axios -o " + compiledTypescriptOutput); })
    .then(function () { return rimraf(path_1["default"].resolve(compiledTypescriptOutput, "api_test.spec.ts")); }); };
var transformTeedyApiToOpenApi = function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log("Creating temp directory at " + tempFolder);
                return [4 /*yield*/, mkdirDeleteIfExist(tempFolder)];
            case 1:
                _a.sent();
                console.log("Cloning Teedy repo sismics/docs to " + tempFolder + " as docs");
                return [4 /*yield*/, gitClone("https://github.com/sismics/docs", tempFolder)];
            case 2:
                _a.sent();
                console.log("Generating swagger.json file with apidoc source code from " + sourceFolder);
                return [4 /*yield*/, convertApiDocsToSwagger()];
            case 3:
                _a.sent();
                console.log("Generating typescript files from " + swaggerFile);
                return [4 /*yield*/, swaggerTypescriptGenerator()];
            case 4:
                _a.sent();
                console.log("Moving results to source");
                return [4 /*yield*/, rimraf(srcResultFolder)];
            case 5:
                _a.sent();
                return [4 /*yield*/, mv(compiledTypescriptOutput, srcResultFolder)];
            case 6:
                _a.sent();
                console.log("Cleaning...");
                return [4 /*yield*/, rimraf(tempFolder)];
            case 7:
                _a.sent();
                console.log("Done");
                return [2 /*return*/];
        }
    });
}); };
transformTeedyApiToOpenApi();
//# sourceMappingURL=build.js.map