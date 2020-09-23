import chalk from "chalk";
import execa, {ExecaChildProcess} from "execa";
import fs, {PathLike} from "fs";
import path from "path";
import {Observable} from "rxjs";

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

/**
 * Read the provided directory and retrieve the absolute paths to the enclosing files and folders.
 * @param dirPath the target directory to read
 */
const readDirectory = (dirPath: string): Promise<string[]> => {
    return new Promise<string[]>((resolve, reject) => {
        fs.readdir(dirPath, (err, files) => {
            if (err) {
                reject(err)
            } else {
                resolve(files.map(file => path.join(dirPath, file)))
            }
        });
    });
}

/**
 * Observe an {@link ExecaChildProcess} for messages outputted to the console.
 * @param process the child process to observe
 * @return messages outputted by the process
 */
const observeProcess = (process: ExecaChildProcess): Observable<string> => {
    return new Observable(subscriber => {
        process
            .then(() => subscriber.complete())
            .catch(error => subscriber.error(error));

        process.stdout.on('data', (data: Buffer) => {
            subscriber.next(data.toString().trim());
        });
    });
}

/**
 * Execute a Java Archive file (JAR) using the system-wide installation of Java.
 * @param jarPath the path to the JAR file
 * @param args optional additional commands or arguments to the JAR file
 */
const executeJar = (jarPath: string, args: string[]): ExecaChildProcess => {
    return execa('java', ['-jar', jarPath, ...args], {
        all: true,
    });
}

/**
 * Execute a Java program with its required classpath.
 * @param classPath the claspath required by the program
 * @param mainClass the main class to run
 * @param args optional additional commands or arguments
 */
const executeJarWithClassPath = (classPath: string, mainClass: string, args: string[]): ExecaChildProcess => {
    return execa('java', ['-classpath', `temp.jar:${classPath}/*`, mainClass, ...args], {
        all: true,
    });
}

export {
    formatAsSuccessMessage,
    formatAsErrorMessage,
    checkFileExists,
    readDirectory,
    observeProcess,
    executeJar,
    executeJarWithClassPath,
};
