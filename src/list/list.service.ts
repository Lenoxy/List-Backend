import {TokenGenerator} from "ts-token-generator";
import {Connection, createConnection, getConnection} from "typeorm";
import {Answer} from "../interface/answer";
import {User} from "../entity/user";
import * as connData from '../../ormconfig.json';

export class ListService {
    private connection: Connection = null;


    async connectDatabase(): Promise<void> {
        this.connection = await createConnection(
            {
                "type": "mysql",
                "host": connData.host,
                "port": connData.port,
                "username": connData.username,
                "password": connData.password,
                "database": connData.database,
                "entities": [User]
            }
        );
        if (this.connection.isConnected) {
            console.log('[Database] connected on', connData.host + ':' + connData.port);
        } else {
            console.error('[Database] connection error on', connData.host + ':' + connData.port);
        }
    }

    tokenGenerator(): String {
        const tokgen = new TokenGenerator();
        return tokgen.generate();
    }

    validateEmail(email: String): boolean {
        email.trim().toLowerCase();
        try {
            //splittedat takes a Email adress and splits for example user@provider.org into "user" and "provider.org".
            let splittedat: String[] = email.split('@');
            //splitteddot takes the output of the first splitter "provider.org" and splits it into "provider" and "org".
            let splitteddot: String[] = splittedat[1].split('.');
            //Checking if these texts aren't too long

            return splittedat[0].length >= 2 && splitteddot[0].length >= 2 && splitteddot[1].length >= 2;

        } catch {
            return false;
        }
    }

    validateUsername(username: String): boolean {
        return username.length >= 3;
    }

    validatePassword(password: String, repeatPassword?: String): boolean {
        if (repeatPassword == null) {
            return (password.length >= 6);
        } else {
            return password.length >= 6 && password === repeatPassword;
        }
    }

    login(email: String, password: String): Promise<Answer> {
        return new Promise((res, rej) => {
            let answer: Answer = new Answer();

            answer.validation.email = this.validateEmail(email);
            answer.validation.password = this.validatePassword(password);

            if (!answer.validation.email || !answer.validation.password) {
                rej(answer);
            }

            this.connection.getRepository(User)
                .createQueryBuilder("mail")
                .where("mail.email = :email", {email: email})
                .getOne()
                .then((usr: User) => {
                    if (password === usr.password) {
                        console.log('[Login]', email, 'logged in successfully', usr);
                        answer.token = this.tokenGenerator();

                    } else {
                        console.log('[Login] Wrong password for user', email);
                        answer.code = 101;

                    }
                    console.log('ListService:login:answer:', answer);
                    res(answer);
                }).catch((err) => {
                console.error("[Login] Could not find matching data for", email);
                answer.code = 2;
                rej(answer);
            });
        });
    }

    register(email: string, username: string, password: string, repeatPassword: string) {
        let answer: Answer = new Answer();
        console.log('[Register] Registration recieved:', email, username, password, repeatPassword);

        answer.validation = {
            email: this.validateEmail(email),
            username: this.validateUsername(username),
            password: this.validatePassword(password, repeatPassword)
        };
        console.log(
            '[Validation] Result:',
            'Email:', answer.validation.email,
            'Username:', answer.validation.username,
            'Password:', answer.validation.password
        );

        if (answer.validation.email == true && answer.validation.username == true && answer.validation.password == true) {

            const dbUser: Promise<User> =
                this.connection
                    .getRepository(User)
                    .createQueryBuilder("mail")
                    .where("mail.email = :email", {email: email})
                    .getOne();

            dbUser.then((usr) => {
                if (email === usr.email) {
                    console.log('[Register]', email, 'already registered');
                    answer.code = 2;
                }
            }).catch((err) => {
                console.log("[Register] Email not yet registered: ", email);
                try {

                    getConnection()
                        .createQueryBuilder()
                        .insert()
                        .into(User)
                        .values([
                            {
                                email: email,
                                username: username,
                                password: password,
                                current_token: this.tokenGenerator()
                            }
                        ])
                        .execute();
                    //TODO: Promise return .execute()?

                    answer.token = this.tokenGenerator();

                    console.log('[Register] Register for', email, 'completed successfully');
                } catch {
                    console.error('[Register] Error while inserting data to database');
                    answer.code = 1;
                }
            });
        }
        return answer;
    }
}
