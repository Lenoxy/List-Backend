import {TokenGenerator} from "ts-token-generator";
import {Connection, createConnection} from "typeorm";
import {Answer} from "./answer";

export class ListService {
    private connection: Connection = null;

    async connectDatabase(): Promise<void> {
        this.connection = await createConnection({
            type: "mysql",
            host: "localhost",
            port: 3306,
            username: "root",
            password: "",
            database: "list",
            entities: ["./entity/*.ts"]
        });
        if (this.connection.isConnected) {
            console.log('Database connected');
        } else {
            console.error('Database connection error');
        }
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
            //TODO Database comparison
        }


        return answer;
    }
}