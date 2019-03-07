import {TokenGenerator} from "ts-token-generator";
import {Connection, createConnection} from "typeorm";
import {Answer} from "./answer";
import {User} from "../entity/user";
import loginData from "./connection.json";
import {getConnection} from "typeorm/browser";

export class ListService {
    private connection: Connection = null;

    async connectDatabase(): Promise<void> {
        this.connection = await createConnection(
            {
                "type": "mysql",
                "host": "localhost",
                "port": 3306,
                "username": "root",
                "password": "",
                "database": "list",
                "entities": [User]
            }
        );
        if (this.connection.isConnected) {
            console.log('[Database] connected on ' + loginData.host + ':' + loginData.port + ' on ' + loginData.database);
        } else {
            console.error('[Database] connection error on ' + loginData.host + ':' + loginData.port + ' on ' + loginData.database);
        }
    }

    tokenGenerator(): String {
        const tokgen = new TokenGenerator();
        return tokgen.generate();
    }

    login(givenEmail: String, password: String): Answer {
        let answer: Answer = new Answer();

        //TODO: Validate user input

        const dbUser: Promise<User> = this.connection.getRepository(User).createQueryBuilder("mail")
            .where("mail.email = :email", {email: givenEmail}).getOne();

        dbUser.then((usr) => {
            console.log("[Login] User: ", usr.email);

            if (usr.password === password) {
                answer.setSuccess(true);
                answer.setToken(this.tokenGenerator());
            } else {
                answer.setSuccess(false);
                answer.setReason('Password does not match for given User.');
            }

        }).catch((usr) => {
            console.error("[Login] Could not fetch data from database.");
            answer.setSuccess(false);
            answer.setReason('Could not fetch Data from Database.')
        });

        return answer;
    }

    register(email: string, username: string, password: string, repeatPassword: string) {

        //TODO: Validate user input

        getConnection()
            .createQueryBuilder()
            .insert()
            .into(User)
            .values([
                {email: email, username: username, password: password, current_token: this.tokenGenerator()}
            ])
            .execute();
        //TODO: Promise return .execute()?


    }


}