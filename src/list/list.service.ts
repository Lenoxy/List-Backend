import {TokenGenerator} from "ts-token-generator";
import {Connection, createConnection, getConnection} from "typeorm";
import {LoginAnswer} from "../interface/loginAnswer";
import {RegisterAnswer} from "../interface/registerAnswer";
import {User} from "../entity/user";
import {validation} from "../interface/validation"

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
            //TODO: Variabeln nicht hardcodieren.
            console.log('[Database] connected on ...');
        } else {
            console.error('[Database] connection error on ...');
        }
    }

    tokenGenerator(): String {
        const tokgen = new TokenGenerator();
        return tokgen.generate();
    }

    validate(type: validation, string: String, password?: String): String {
        string.trim();

        switch (type) {
            case validation.email:
                //TODO: Code leserlicher machen!
                //
                string.toLowerCase();
                let splittedat: String[] = string.split('@');
                let splitteddot: String[] = splittedat[1].split('.');
                if (splittedat[0].length >= 2) {
                    if (splitteddot[0].length >= 2) {
                        if (splitteddot[1].length >= 2) {

                        } else {
                            string = null
                        }
                    } else {
                        string = null
                    }
                } else {
                    string = null
                }


                break;


            case validation.username:
                string.toLowerCase();

                break;


            case validation.password:


                break;

            case validation.repeatPassword:
                if (password == null) {
                    console.error('[Validaion] To Validate', type, 'please add the parameter password.')
                } else {
                    if (string !== password) {
                        string = null;
                    }
                }
                break;
        }

        return string
    }


    login(givenEmail: String, password: String): LoginAnswer {
        let answer: LoginAnswer = new LoginAnswer();

        //TODO: Validate user input

        const dbUser: Promise<User> = this.connection.getRepository(User).createQueryBuilder("mail")
            .where("mail.email = :email", {email: givenEmail}).getOne();

        dbUser.then((usr) => {
            console.log("[Login] User: ", usr.email);

            if (usr.password === password) {
                answer.success = true;
                answer.token = this.tokenGenerator();
            } else {
                answer.success = false;
                answer.reason = 'Password does not match for given User.';
            }

        }).catch((usr) => {
            console.error("[Login] Could not fetch data from database.");
            answer.success = false;
            answer.reason = 'Could not fetch Data from Database.';
        });

        return answer;
    }

    register(email: string, username: string, password: string, repeatPassword: string) {
        let answer: RegisterAnswer = new RegisterAnswer();

        this.validate(validation.email, email);


        console.log('[Register] Registration recieved:', email, username, password, repeatPassword);

        getConnection()
            .createQueryBuilder()
            .insert()
            .into(User)
            .values([
                {email: email, username: username, password: password, current_token: this.tokenGenerator()}
            ])
            .execute();
        //TODO: Promise return .execute()?


        return answer;
    }


}