import {Observable} from "rxjs";
import {executeJar} from "../utils";

export default abstract class Tool {
    abstract readonly name: string;
    abstract readonly toolPath: string;

    /**
     * Run the tool with the provided arguments.
     *
     * @param args optional array of arguments for the tool
     * @return messages from the tool during runtime
     */
    protected runWithArgs(...args: string[]): Observable<string> {
        return executeJar(this.toolPath, args)
    }
}
