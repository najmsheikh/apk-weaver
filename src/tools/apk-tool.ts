import path from "path";
import Tool from "./tool";
import {Observable} from "rxjs";
import {map} from "rxjs/internal/operators";

/**
 * A tool for reverse engineering Android APK files.
 *
 * @see https://github.com/iBotPeaches/Apktool
 */
export default class ApkTool extends Tool {
    readonly name: string = 'apktool';
    readonly toolPath: string = path.join(__dirname, '../../libs/apktool_2.4.1.jar');

    /**
     * Decode and extract the provided APK to the provided directory path.
     *
     * @param inputApkPath the APK to decode
     * @param outputPath the target directory path
     * @param force force delete destination directory if it already exists
     */
    decode(inputApkPath: string, outputPath: string, force: boolean = false): Observable<string> {
        return this.runWithArgs(
            'decode', inputApkPath,
            '--output', outputPath,
            force ? '--force' : ''
        ).pipe(map(message => message.replace(/I: /g, '')));
    }

    /**
     * Build an APK from the provided directory of decoded code and resources.
     *
     * @param inputPath the source directory path
     * @param outputApkPath the path where to build the APK
     * @param useAapt2 optional flag to indicate if AAPT2 should be used instead of AAPT
     */
    build(inputPath: string, outputApkPath: string, useAapt2: boolean = false): Observable<string> {
        return this.runWithArgs(
            'build', inputPath,
            '--output', outputApkPath,
            useAapt2 ? '--use-aapt2' : ''
        ).pipe(map(message => message.replace(/I: /g, '')));
    }
}
