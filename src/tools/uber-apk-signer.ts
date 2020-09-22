import Tool from "./tool";
import path from "path";
import {Observable} from "rxjs";

/**
 * A tool that helps signing and zip aligning single or multiple Android application packages (APKs) with either
 * debug or provided release certificates. It supports v1, v2 and v3 Android signing scheme has an embedded debug
 * keystore and auto verifies after signing.
 *
 * @see https://github.com/patrickfav/uber-apk-signer
 */
export default class UberApkSigner extends Tool {
    readonly name: string = 'uber-apk-signer';
    readonly toolPath: string = path.join(__dirname, '../../libs/uber-apk-signer-1.1.0.jar');

    /**
     * Sign and zipalign the provided APK with a debug keystore.
     *
     * @param pathToApk the APK to sign
     */
    signDebug(pathToApk: string): Observable<string> {
        return this.runWithArgs(
            '--apks', pathToApk,
            '--allowResign',
            '--overwrite'
        );
    }
}
