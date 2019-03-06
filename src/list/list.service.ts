import {TokenGenerator} from "ts-token-generator";
import {Connection, createConnection} from "typeorm";
import {Answer} from "./answer";
import {Users} from "../entity/users";

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

    login(givenEmail: String, password: String): Answer {
        let answer: Answer;

        //Validation!!

        const dbUser: Promise<Users> = this.connection.getRepository(Users).createQueryBuilder("mail")
            .where("mail.email = :email", {email: givenEmail}).getOne();
        console.log(dbUser);

        dbUser.then(user => {
            console.log(user);
        }, err => {
            console.log(err);
        });

        return answer;
    }
}