import {Observable} from "rxjs";
import Tool from "./tool";
import {executeJarWithClassPath, observeProcess} from "../utils";
import path from "path";

/**
 * The standalone Jetifier tool migrates support-library-dependent libraries to rely on the equivalent AndroidX
 * packages instead. The tool lets you migrate an individual library directly, instead of using the Android gradle
 * plugin bundled with Android Studio.
 *
 * @see https://developer.android.com/studio/command-line/jetifier
 */
export default class Jetifier extends Tool {
    readonly name: string = 'jetifier';
    readonly toolPath: string = path.join(__dirname, '../../libs/jetifier');

    /**
     * Migrate references that point to the Android Support Library to instead point to AndroidX dependencies.
     *
     * @param pathToInputAar the path to the AAR to process
     * @param pathToOutputAar the path where to save the processed AAR
     * @param pathToMappingConfig optional custom config file for mapping references
     */
    jetify(pathToInputAar: string, pathToOutputAar: string, pathToMappingConfig?: string): Observable<string> {
        return this.runWithArgs(
            '--input', pathToInputAar,
            '--output', pathToOutputAar,
            pathToMappingConfig ? `--config ${pathToMappingConfig}` : ''
        );
    }

    /**
     * Migrate references that point to AndroidX to instead point to the Android Support Library.
     *
     * @param pathToInputAar the path to the AAR to process
     * @param pathToOutputAar the path where to save the processed AAR
     */
    dejetify(pathToInputAar: string, pathToOutputAar: string): Observable<string> {
        return this.runWithArgs(
            '--reverse',
            '--input', pathToInputAar,
            '--output', pathToOutputAar,
        );
    }

    protected runWithArgs(...args: string[]): Observable<string> {
        return observeProcess(
            executeJarWithClassPath(
                this.toolPath,
                'com.android.tools.build.jetifier.standalone.Main',
                args
            )
        )
    }
}
