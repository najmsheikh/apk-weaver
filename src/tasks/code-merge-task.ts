import {Observable} from "rxjs";
import Listr, {ListrContext, ListrTaskWrapper} from "listr";
import AdmZip from "adm-zip";
import path from "path";
import D8 from "../tools/d8";
import Baksmali from "../tools/baksmali";
import {ncp} from "ncp";
import {readDirectory} from "../utils";

export default function (ctx: ListrContext, task: ListrTaskWrapper, workingDirectory: string): Listr {
    if (!ctx.sourceAar || !ctx.apkDecompiledDir) throw new Error('Context missing required references!')
    const dexer = new D8();
    const baksmali = new Baksmali();

    return new Listr([
        {
            title: 'Decompressing AAR',
            task: () => {
                return new Observable<string>(observer => {
                    const zip = new AdmZip(ctx.sourceAar);
                    zip.extractEntryTo('classes.jar', workingDirectory, false, true);
                    observer.complete();
                });
            }
        },
        {
            title: 'Converting classes.jar to classes.dex',
            task: () => dexer.compile(path.join(workingDirectory, 'classes.jar'), workingDirectory)
        },
        {
            title: 'Disassembling classes.dex to retrieve Smali code files',
            task: () => {
                ctx.aarDecompileDir = path.join(workingDirectory, 'decompiled-aar');
                return baksmali.disassemble(path.join(workingDirectory, 'classes.dex'), ctx.aarDecompileDir)
            }
        },
        {
            title: 'Merge packages',
            task: () => {
                return getSharedRoot(ctx.aarDecompileDir, ctx.apkDecompiledDir, true)
                    .then(sharedRoot => {
                        const packageName = sharedRoot.match(/[^\/]+?(?=$)/)[0];
                        return new Promise<string>((resolve, reject) => {
                            ncp(`${ctx.aarDecompileDir}/${packageName}`, sharedRoot, err => {
                                if (err) {
                                    reject(err);
                                }
                                resolve('Merged!');
                            });
                        })
                    });
            }
        }
    ]);
}

const getFirstApkDirectories = (startDir: string): Promise<string[]> => {
    return readDirectory(startDir)
        .then(paths => paths.filter(path => /\/smali.*/.test(path)))
        .then(smaliDirectories => Promise.all(smaliDirectories.map(smaliDirectory => readDirectory(smaliDirectory))))
        .then(promises => ([] as string[]).concat(...promises))
}

const getSharedRoot = async (aarStartPath: string, apkStartPath: string, isApkRootPath: boolean = false): Promise<string> => {
    const aarPackages = await readDirectory(aarStartPath);
    const apkPackages = isApkRootPath ? await getFirstApkDirectories(apkStartPath) : await readDirectory(apkStartPath);

    for (const aarPackage of aarPackages) {
        const aarPackageName = aarPackage.match(/[^\/]+?(?=$)/)[0];
        const matchedApkPackages = apkPackages.filter(path => path.match(/[^\/]+?(?=$)/)[0] === aarPackageName);

        if (matchedApkPackages.length === 1) {
            return apkStartPath;
        }
        for (const apkPackage of matchedApkPackages) {
            const root = await getSharedRoot(aarPackage, apkPackage);
            if (root) {
                return root;
            }
        }
    }
}
