#!/usr/bin/env node

import yargs from "yargs";
import {checkFileExists, formatAsErrorMessage, formatAsSuccessMessage, readDirectory} from "./utils";
import ApkTool from "./tools/apk-tool";
import Jetifier from "./tools/jetifier";
import Listr from "listr";
import fs from "fs";
import path from "path";
import mergeCode from "./tasks/code-merge-task"

const options = yargs
    .usage('Usage: $0 -t <target> -s <source>')
    .option('t', {alias: 'target', describe: 'The target APK', type: 'string', demandOption: true})
    .option('s', {alias: 'source', describe: 'The source AAR(s)', type: 'array', demandOption: true})
    .check(argv => {
        [argv.t, ...argv.s].forEach(filePath => {
            const exists = checkFileExists(filePath as string)
            if (!exists) {
                throw new Error(formatAsErrorMessage(`File does not exist! Provided path: ${filePath}`));
            }
        })
        return true;
    })
    .argv;

const main = async function () {
    const isDebug = process.env.DEBUG ? JSON.parse(process.env.DEBUG) === true : false;

    const apktool = new ApkTool();
    const jetifier = new Jetifier();

    // TODO: Update to use global temp directory
    const workingDirectory = path.join(__dirname, 'temp/');
    const targetApk = options.t as string;
    const sourceAar = options.s[0] as string;

    const patchingTasks = new Listr([
        {
            title: '[DEBUG] Prepare workspace',
            enabled: () => isDebug,
            task: () => {
                return new Promise((resolve, reject) => {
                    fs.rmdir(workingDirectory, {recursive: true}, err => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve('Directory deleted');
                        }
                    })
                })
            }
        },
        {
            title: 'Decode target APK file',
            task: (ctx) => {
                ctx.apkDecompiledDir = path.join(workingDirectory, 'decompiled-apk');
                return apktool.decode(targetApk, ctx.apkDecompiledDir, true);
            }
        },
        {
            title: 'Ensure Support Library / Jetpack compatibility',
            task: (ctx, task) => {
                task.output = 'Scanning APK package structure'
                return readDirectory(ctx.apkDecompiledDir)
                    .then(paths => paths.filter(path => /\/smali.*/.test(path)))
                    .then(smaliDirectories => Promise.all(smaliDirectories.map(smaliDirectory => readDirectory(smaliDirectory))))
                    .then(promises => ([] as string[]).concat(...promises))
                    .then(packages => packages.some(packageName => packageName.includes('androidx')))
                    .then(hasJetpack => {
                        if (hasJetpack) {
                            task.output = 'Jetifying source AAR';
                            ctx.sourceAar = path.join(workingDirectory, 'jetified.aar');
                            return jetifier.jetify(sourceAar, ctx.sourceAar);
                        } else {
                            ctx.sourceAar = sourceAar;
                            task.skip('Target APK does not use AndroidX -- no need to Jetify the AAR!');
                        }
                    });
            }
        },
        {
            title: 'Merge code',
            task: (ctx, task) => mergeCode(ctx, task, workingDirectory)
        },
        {
            title: 'Merge resources',
            task: (ctx, task) => task.skip('TODO')
        },
        {
            title: 'Merge assets',
            task: (ctx, task) => task.skip('TODO')
        },
        {
            title: 'Build & sign patched APK',
            task: (ctx, task) => task.skip('TODO')
        }
    ]);

    patchingTasks
        .run()
        .then(() => {
            console.log(formatAsSuccessMessage('Successfully patched APK!'));
        })
        .catch(e => {
            if (isDebug) {
                console.error(e);
            }
            console.log(formatAsErrorMessage('Error patching APK. Please check logs!'));
        })
}

main()
    .catch(e => {
        if (process.env.DEBUG) {
            console.error(e)
        } else {
            console.log(formatAsErrorMessage(e.message));
        }
    })
