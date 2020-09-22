import Tool from "./tool";
import path from "path";
import {Observable} from "rxjs";
import {map} from "rxjs/internal/operators";

/**
 * A disassembler for the dex format used by dalvik, Android's Java VM implementation.
 *
 * @see https://github.com/JesusFreke/smali
 */
export default class Baksmali extends Tool {
    readonly name: string = 'baksmali';
    readonly toolPath: string = path.join(__dirname, '../../libs/baksmali-2.0.6.jar');

    /**
     * Disassemble the provided dex file into Smali code, to the provided directory path.
     *
     * @param pathToDex the target `classes.dex`
     * @param outputPath the target output directory path
     * @param apiLevel optionally indicate the Android API level the target dex was built against
     */
    disassemble(pathToDex: string, outputPath: string, apiLevel?: number): Observable<string> {
        return this.runWithArgs(
            pathToDex,
            '--output', outputPath,
            apiLevel ? `--api ${apiLevel}` : ''
        ).pipe(map(message => {
            if (message.includes(`Can't find the file`)) {
                throw new Error(message);
            }
            return message;
        }));
    }
}
