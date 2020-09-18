#!/usr/bin/env node

import yargs from "yargs";
import {checkFileExists, formatAsErrorMessage, formatAsSuccessMessage} from "./utils";

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
    console.log(formatAsSuccessMessage(options.t))
}

main()
    .catch(e => {
        if (process.env.DEBUG) {
            console.error(e)
        } else {
            console.log(formatAsErrorMessage(e.message));
        }
    })
