import * as util from 'util';
import * as fs from 'fs';
import path from 'path';
import {main as apiDocToSwagger} from "apidoc-swagger-3/lib";

import intercept from 'intercept-stdout';

const rimraf = util.promisify(require('rimraf'));
const mkdir = util.promisify(fs.mkdir);
const writeFile = util.promisify(fs.writeFile);
const mv = util.promisify(fs.rename);

const {exec: execCb} = require('child_process');
const exec = util.promisify(execCb)
const mkdirDeleteIfExist = (path) => (rimraf(path).then(() => mkdir(path)));
const tempFolder = path.resolve(__dirname, "../temp");
const swaggerFile = path.resolve(tempFolder, "swagger.json");
const sourceFolder = path.resolve(tempFolder, "docs/docs-web/src/main/java/com/sismics/docs/rest/resource");
const compiledTypescriptOutput = path.resolve(tempFolder, "ts");
const srcResultFolder = path.resolve(__dirname, "../ts/swagger");

const gitClone = (url: string, saveTo: string) => (exec(`git clone ${url}`, {
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
        //    if (m.summary === 'PostUserLogin') {
                m.parameters.forEach(parameter => {
                    if (!parameter.schema) {
                        parameter.schema = {
                            "type": parameter.type,
                        };
                    }
                });
           // }
        }
    }

    await writeFile(swaggerFile, JSON.stringify(swaggerObject));
}
const swaggerTypescriptGenerator = () => mkdirDeleteIfExist(compiledTypescriptOutput)
    .then(() => exec(`npx sc generate -i ${swaggerFile} -l typescript-axios -o ${compiledTypescriptOutput}`))
    .then(() => rimraf(path.resolve(compiledTypescriptOutput, "api_test.spec.ts")));


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

transformTeedyApiToOpenApi();

