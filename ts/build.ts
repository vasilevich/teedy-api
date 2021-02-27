import * as util from 'util';
import * as fs from 'fs';
import * as path from 'path';
import {main as apiDocToSwagger} from "apidoc-swagger-3/lib";

import intercept from 'intercept-stdout';

import {exec as execCb} from 'child_process';

import rimrafCb from 'rimraf';

/**
 * Helper functions
 */
const escapeRegex = (string) => string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
const rimraf = util.promisify(rimrafCb);
const mkdir = util.promisify(fs.mkdir);
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const performOnFile = (path: string, execute = (fileContent) => fileContent) => readFile(path).then(fileContent => writeFile(path, execute(fileContent)))
const replaceTextInFile = (path, from: string | RegExp, to: string) => performOnFile(path, (fileContents) => fileContents.toString('utf8').replace(from, to));
const replaceTextInDirectory = (path, from, to) => listAllFilesInDirectory(path).then(files => Promise.all(files.map(file => replaceTextInFile(file, from, to))));
const replaceListOfTextsInDirectory = async (path, ...fromToList: { from: string | RegExp, to: string }[]) => {
    for (const {from, to} of fromToList) {
        await replaceTextInDirectory(path, from, to);
    }
};
const mv = util.promisify(fs.rename);
const readDir = util.promisify(fs.readdir);
const listAllFilesInDirectory = (inputPath) => readDir(inputPath).then(result => result.map(r => path.resolve(inputPath, r)));
const exec = util.promisify(execCb as any)
const mkdirDeleteIfExist = (path) => (rimraf(path).then(() => mkdir(path)));
const gitClone = (url: string, saveTo: string) => (exec(`git clone --depth=1 ${url}`, {
    stdio: [0, 1, 2], // we need this so node will print the command output
    cwd: saveTo, // path to where you want to save the file
}));
const options = {
    allowStdout: true,
};
intercept(function (txt) {
    if (options.allowStdout) {
        return txt;
    }
    return '';
});
const stdOutAllowed = (allowStdout) => options.allowStdout = allowStdout;


/**
 * File and Folder paths
 */
const tempFolder = path.resolve(__dirname, "../temp");
const swaggerFile = path.resolve(tempFolder, "swagger.json");
const sourceFolder = path.resolve(tempFolder, "docs/docs-web/src/main/java/com/sismics/docs/rest/resource");
const compiledTypescriptOutput = path.resolve(tempFolder, "ts");
const srcResultFolder = path.resolve(__dirname, "../ts/swagger");

/**
 * Execution steps
 */
const convertApiDocsToSwagger = async () => {
    await rimraf(swaggerFile);
    stdOutAllowed(false);
    apiDocToSwagger({
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
    const swaggerObject = require(swaggerFile);
    swaggerObject.openapi = "3.0.0";
    for (const path in swaggerObject.paths) {
        const p = swaggerObject.paths[path];
        for (const method in p) {
            const m = p[method];
            m.parameters.forEach(parameter => {
                if (!parameter.schema) {
                    parameter.schema = {
                        "type": parameter.type,
                    };
                }
            });

        }
    }
    await writeFile(swaggerFile, JSON.stringify(swaggerObject));
}
const swaggerTypescriptGenerator = () => mkdirDeleteIfExist(compiledTypescriptOutput)
    .then(() => exec(`npx sc generate -i ${swaggerFile} -l typescript-axios -o ${compiledTypescriptOutput}`))
    .then(() => replaceListOfTextsInDirectory(path.resolve(compiledTypescriptOutput, "apis"),
        {
            from: new RegExp(escapeRegex('basePath: string = BASE_PATH'), 'g'),
            to: "basePath: string = configuration.basePath"
        },
        {
            from: new RegExp(escapeRegex('import globalAxios, { AxiosPromise, AxiosInstance } from \'axios\';'), 'g'),
            to: "import {AxiosPromise, AxiosInstance, AxiosRequestConfig} from 'axios';"
        },
        {
            from: new RegExp(escapeRegex('import { BASE_PATH, COLLECTION_FORMATS, RequestArgs, BaseAPI, RequiredError } from \'../base\';'), 'g'),
            to: "import { BASE_PATH, COLLECTION_FORMATS, RequestArgs, BaseAPI, RequiredError ,globalAxios} from '../base';"
        },
        {
            from: new RegExp(escapeRegex('options: any'), 'g'),
            to: "options: AxiosRequestConfig & { query?: any }"
        },
        {
            from: new RegExp(escapeRegex('options?: any'), 'g'),
            to: "options?: AxiosRequestConfig & { query?: any }"
        },
        {
            from: new RegExp(escapeRegex('url: localVarUrlObj.pathname + localVarUrlObj.search + localVarUrlObj.hash,'), 'g'),
            to: "url: options.url || (localVarUrlObj.pathname + localVarUrlObj.search + localVarUrlObj.hash),"
        },
    ))
    .then(() => replaceTextInFile(path.resolve(compiledTypescriptOutput, "base.ts"), "import globalAxios, { AxiosPromise, AxiosInstance } from 'axios';", "import axios, { AxiosPromise, AxiosInstance } from 'axios';\nexport const globalAxios = axios;"));


const transformTeedyApiToOpenApi = async () => {
    console.log(`Creating temp directory at ${tempFolder}`);
    await mkdirDeleteIfExist(tempFolder);
    console.log(`Cloning Teedy repo sismics/docs to ${tempFolder} as docs`);
    await gitClone("https://github.com/sismics/docs", tempFolder);
    console.log(`Generating swagger.json file with apidoc source code from ${sourceFolder}`);
    await convertApiDocsToSwagger();
    console.log(`Generating typescript files from ${swaggerFile}`);
    await swaggerTypescriptGenerator();
    console.log(`Moving results to source`);
    await rimraf(srcResultFolder);
    await mv(compiledTypescriptOutput, srcResultFolder);
    console.log(`Cleaning...`);
    await rimraf(tempFolder);
    console.log("Done");
}

transformTeedyApiToOpenApi()
    .catch(e => {
        console.log("Something went wrong in the build process, remove and install the module again ,if that doesn't help, open an issue on github or make a pull request with a fix.", e)
    });

