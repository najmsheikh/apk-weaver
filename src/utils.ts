import chalk from "chalk";
import fs, {PathLike} from "fs";

/**
 * Formats the string as an identifiable success message on the CLI.
 * @param message the informational string
 */
const formatAsSuccessMessage = (message: string): string => {
    return chalk`{bgGreen.bold.whiteBright  SUCCESS } {green ${message}}`
}

/**
 * Formats the string as an identifiable error message on the CLI.
 * @param message the error string
 */
const formatAsErrorMessage = (message: string): string => {
    return chalk`{bgRed.bold.whiteBright  ERROR } {red ${message}}`
}

/**
 * Check if a valid file exists at the provided path.
 * @param path the path pointing to the file to verify
 */
const checkFileExists = (path: PathLike): boolean => {
    try {
        fs.accessSync(path)
        return true;
    } catch (e) {
        return false;
    }
}

export {
    formatAsSuccessMessage,
    formatAsErrorMessage,
    checkFileExists
};
