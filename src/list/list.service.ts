import {TokenGenerator} from "ts-token-generator";
import {Connection, ConnectionManager} from "typeorm";
import {Answer} from "./answer";

// @Injectable()
export class ListService {
    private connection: Connection = null;

    async connectDatabase(): Promise<void> {
        let connection: Connection;
        const connectionManager = new ConnectionManager();
        this.connection = await connectionManager.create({
            type: "mysql",
            host: "localhost",
            port: 3306,
            username: "root",
            password: "",
            database: "list"
        });
        connection.connect().then(() => {
            console.log('Database connected');
        }, () => {
            console.error('Database connection error');
        });
    }


    tokenGenerator(): String {
        const tokgen = new TokenGenerator();
        return tokgen.generate();
    }

    login(user: String, password: String): Answer {
        let answer: Answer;

        //Validation
        if (user.length <= 4) {
            answer.setReason('Please enter a name with at least four characters.');
            answer.setSuccess(false);
        }
        if (password.length <= 6) {
            if (answer.getSuccess() === false) {
                answer.setReason('Please enter a name with at least four characters and a Password with at least six characters.');
            }
            answer.setSuccess(false);
            answer.setReason('Please enter a Password with at least six characters.');
        }

        if (answer.getSuccess() === true) {

        }


        return answer;
    }
}