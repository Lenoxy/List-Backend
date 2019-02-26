import {TokenGenerator} from "ts-token-generator";

// @Injectable()
export class ListService {

    tokenGenerator(): String {
        const tokgen = new TokenGenerator();
        return tokgen.generate();
    }


    login(user: String, password: String) {
        //TODO Database
        return this.tokenGenerator();
    }
}