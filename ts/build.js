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
var path = require("path");
var lib_1 = require("apidoc-swagger-3/lib");
var intercept_stdout_1 = require("intercept-stdout");
var child_process_1 = require("child_process");
var rimraf_1 = require("rimraf");
var teedyRepo = 'https://github.com/vasilevich/docs';
var teedyCommit = 'd98c1bddec454006f185f2e25f94cdd63ae05572';
/**
 * Helper functions
 */
var escapeRegex = function (string) { return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'); };
var rimraf = util.promisify(rimraf_1["default"]);
var mkdir = util.promisify(fs.mkdir);
var readFile = util.promisify(fs.readFile);
var writeFile = util.promisify(fs.writeFile);
var performOnFile = function (path, execute) {
    if (execute === void 0) { execute = function (fileContent) { return fileContent; }; }
    return readFile(path).then(function (fileContent) { return writeFile(path, execute(fileContent)); });
};
var replaceTextInFile = function (path, from, to) { return performOnFile(path, function (fileContents) { return fileContents.toString('utf8').replace(from, to); }); };
var replaceTextInDirectory = function (path, from, to) { return listAllFilesInDirectory(path).then(function (files) { return Promise.all(files.map(function (file) { return replaceTextInFile(file, from, to); })); }); };
var replaceListOfTextsInDirectory = function (path) {
    var fromToList = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        fromToList[_i - 1] = arguments[_i];
    }
    return __awaiter(void 0, void 0, void 0, function () {
        var _a, fromToList_1, _b, from, to;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _a = 0, fromToList_1 = fromToList;
                    _c.label = 1;
                case 1:
                    if (!(_a < fromToList_1.length)) return [3 /*break*/, 4];
                    _b = fromToList_1[_a], from = _b.from, to = _b.to;
                    return [4 /*yield*/, replaceTextInDirectory(path, from, to)];
                case 2:
                    _c.sent();
                    _c.label = 3;
                case 3:
                    _a++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/];
            }
        });
    });
};
var mv = util.promisify(fs.rename);
var readDir = util.promisify(fs.readdir);
var listAllFilesInDirectory = function (inputPath) { return readDir(inputPath).then(function (result) { return result.map(function (r) { return path.resolve(inputPath, r); }); }); };
var exec = util.promisify(child_process_1.exec);
var mkdirDeleteIfExist = function (path) { return (rimraf(path).then(function () { return mkdir(path); })); };
var gitClone = function (url, saveTo, depth) {
    if (depth === void 0) { depth = 100; }
    return (exec("git clone --depth=" + depth + " " + url, {
        stdio: [0, 1, 2],
        cwd: saveTo, // path to where you want to save the file
    }));
};
var resetToCommit = function (path, sha1) { return (exec("git reset --hard " + sha1, {
    stdio: [0, 1, 2],
    cwd: path, // path to where you want to save the file
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
/**
 * File and Folder paths
 */
var tempFolder = path.resolve(__dirname, "../temp");
var tempTeedyRepoFolder = path.resolve(tempFolder, 'docs');
var swaggerFile = path.resolve(tempFolder, "swagger.json");
var sourceFolder = path.resolve(tempFolder, "docs/docs-web/src/main/java/com/sismics/docs/rest/resource");
var compiledTypescriptOutput = path.resolve(tempFolder, "ts");
var srcResultFolder = path.resolve(__dirname, "../ts/swagger");
/**
 * Execution steps
 */
var convertApiDocsToSwagger = function () { return __awaiter(void 0, void 0, void 0, function () {
    var swaggerObject, path_1, p, method, m;
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
                    dest: tempFolder + path.sep,
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
                for (path_1 in swaggerObject.paths) {
                    p = swaggerObject.paths[path_1];
                    for (method in p) {
                        m = p[method];
                        m.parameters.forEach(function (parameter) {
                            if (!parameter.schema) {
                                parameter.schema = {
                                    "type": parameter.type,
                                };
                            }
                        });
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
    .then(function () { return exec("npx swagger-nodegen-cli@3.0.24 generate -i " + swaggerFile + " -l typescript-axios -o " + compiledTypescriptOutput); })
    .then(function () { return replaceListOfTextsInDirectory(path.resolve(compiledTypescriptOutput, "apis"), {
    from: new RegExp(escapeRegex('basePath: string = BASE_PATH'), 'g'),
    to: "basePath: string = configuration.basePath"
}, {
    from: new RegExp(escapeRegex('import globalAxios, { AxiosPromise, AxiosInstance } from \'axios\';'), 'g'),
    to: "import {AxiosPromise, AxiosInstance, AxiosRequestConfig} from 'axios';"
}, {
    from: new RegExp(escapeRegex('import { BASE_PATH, COLLECTION_FORMATS, RequestArgs, BaseAPI, RequiredError } from \'../base\';'), 'g'),
    to: "import { BASE_PATH, COLLECTION_FORMATS, RequestArgs, BaseAPI, RequiredError ,globalAxios} from '../base';"
}, {
    from: new RegExp(escapeRegex('options: any'), 'g'),
    to: "options: AxiosRequestConfig & { query?: any }"
}, {
    from: new RegExp(escapeRegex('options?: any'), 'g'),
    to: "options?: AxiosRequestConfig & { query?: any }"
}, {
    from: new RegExp(escapeRegex('url: localVarUrlObj.pathname + localVarUrlObj.search + localVarUrlObj.hash,'), 'g'),
    to: "url: options.url || (localVarUrlObj.pathname + localVarUrlObj.search + localVarUrlObj.hash),"
}); })
    .then(function () { return replaceTextInFile(path.resolve(compiledTypescriptOutput, "base.ts"), "import globalAxios, { AxiosPromise, AxiosInstance } from 'axios';", "import axios, { AxiosPromise, AxiosInstance } from 'axios';\nexport const globalAxios = axios;"); }); };
var transformTeedyApiToOpenApi = function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log("Creating temp directory at " + tempFolder);
                return [4 /*yield*/, mkdirDeleteIfExist(tempFolder)];
            case 1:
                _a.sent();
                console.log("Cloning Teedy repo sismics/docs to " + tempFolder + " as docs");
                return [4 /*yield*/, gitClone(teedyRepo, tempFolder, 30)];
            case 2:
                _a.sent();
                //  console.log('Resetting Teedy repo sismics/docs to commit: ');
                return [4 /*yield*/, resetToCommit(tempTeedyRepoFolder, teedyCommit)];
            case 3:
                //  console.log('Resetting Teedy repo sismics/docs to commit: ');
                _a.sent();
                console.log("Generating swagger.json file with apidoc source code from " + sourceFolder);
                return [4 /*yield*/, convertApiDocsToSwagger()];
            case 4:
                _a.sent();
                console.log("Generating typescript files from " + swaggerFile);
                return [4 /*yield*/, swaggerTypescriptGenerator()];
            case 5:
                _a.sent();
                console.log("Moving results to source");
                return [4 /*yield*/, rimraf(srcResultFolder)];
            case 6:
                _a.sent();
                return [4 /*yield*/, mv(compiledTypescriptOutput, srcResultFolder)];
            case 7:
                _a.sent();
                console.log("Cleaning...");
                return [4 /*yield*/, rimraf(tempFolder)];
            case 8:
                _a.sent();
                console.log("Done");
                return [2 /*return*/];
        }
    });
}); };
transformTeedyApiToOpenApi()["catch"](function (e) {
    console.log("Something went wrong in the build process, remove and install the module again ,if that doesn't help, open an issue on github or make a pull request with a fix.", e);
});
//# sourceMappingURL=build.js.map