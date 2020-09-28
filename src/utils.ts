import chalk from "chalk";
import process from "child_process";
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
 * Execute a Java Archive file (JAR) using the system-wide installation of Java.
 * @param jarPath the path to the JAR file
 * @param args optional additional commands or arguments to the JAR file
 */
const executeJar = (jarPath: string, args: string[]): Observable<string> => {
    return new Observable<string>(observable => {
        const java = process.exec(`java -jar ${jarPath} ${args.join(' ')}`, error => {
            if (error) {
                observable.error(error);
            }
            observable.complete();
        });

        java.stdout.on('data', data => observable.next(data.toString().trim()));
        java.stderr.on('data', chunk => observable.next(chunk.toString().trim())); // ignore warnings
    });
}

/**
 * Execute a Java program with its required classpath.
 * @param classPath the claspath required by the program
 * @param mainClass the main class to run
 * @param args optional additional commands or arguments
 */
const executeJarWithClassPath = (classPath: string, mainClass: string, args: string[]): Observable<string> => {
    return new Observable<string>(observable => {
        const java = process.exec(`java -classpath temp.jar:${classPath}/* ${mainClass} ${args.join(' ')}`, error => {
            if (error) {
                observable.error(error);
            }
            observable.complete();
        });

        java.stdout.on('data', data => observable.next(data.toString().trim()));
        java.stderr.on('data', chunk => observable.next(chunk.toString().trim())); // ignore warnings
    });
}

export {
    formatAsSuccessMessage,
    formatAsErrorMessage,
    checkFileExists,
    readDirectory,
    executeJar,
    executeJarWithClassPath,
};
