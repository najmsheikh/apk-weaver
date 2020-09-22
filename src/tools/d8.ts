import Tool from "./tool";
import path from "path";
import {Observable} from "rxjs";

export enum BuildFlavor {
    DEBUG = '--debug',
    RELEASE = '--release'
}

/**
 * D8 is a dexer that converts Java byte code to dex code.
 *
 * @see https://r8.googlesource.com/r8
 */
export default class D8 extends Tool {
    readonly name: string = 'D8';
    readonly toolPath: string = path.join(__dirname, '../../libs/d8.jar');

    /**
     * Optimize and compile the Java byte code included in the provided JAR file into a dex file.
     *
     * @param pathToJar the target JAR file containing Java byte code
     * @param outputPath the target output directory path
     * @param buildFlavor the build flavor to compile for
     * @param apiLevel the minimum Android API level to compile against
     * @param pathToProguardConfig optional Proguard configuration file
     */
    compile(pathToJar: string, outputPath: string,
            buildFlavor: BuildFlavor = BuildFlavor.RELEASE,
            apiLevel: number = 1,
            pathToProguardConfig?: string): Observable<string> {
        return this.runWithArgs(
            pathToJar,
            buildFlavor,
            '--output', outputPath,
            '--min-api', String(apiLevel),
            pathToProguardConfig ? `--pg-conf ${pathToProguardConfig}` : '',
        );
    }
}
