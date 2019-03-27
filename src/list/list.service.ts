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
        if (password.length >= 6) {
            if (repeatPassword != null) {
                if (password === repeatPassword) {
                    return true;
                } else {
                    return null;
                }
            } else {
                return true;
            }
        } else {
            return false
        }

    }

    login(email: String, password: String): Promise<Answer> {
        return new Promise((res, rej) => {
                let answer: Answer = new Answer();

                answer.validation.email = this.validateEmail(email);
                answer.validation.password = this.validatePassword(password);

                console.log('[Validation] Email:', answer.validation.email, "Password:", answer.validation.password);

                if (!answer.validation.email || !answer.validation.password) {
                    res(answer);
                } else {

                    this.connection
                        .getRepository(User)
                        .createQueryBuilder("mail")
                        .where("mail.email = :email", {email: email})
                        .getOne()
                        .then((usr: User) => {
                            if (password === usr.password) {
                                console.log('[Login]', email, 'Logged in successfully', usr);
                                answer.token = this.tokenGenerator();

                                this.connection
                                    .getRepository(User)
                                    .createQueryBuilder()
                                    .update(User)
                                    .set({current_token: answer.token})
                                    .where("email = :email", {email: email})
                                    .execute()
                                    .then(() => {
                                        console.log('[Login] Token inserted into DB for \"', email + '\"');
                                    }).catch(() => {
                                    console.error('Error inserting Token into Database for \"' + email + '\"');
                                });

                            } else {
                                console.log('[Login] Wrong password for user', email);
                                answer.code = 101;

                            }
                            console.log('[HTTP] Returning:', answer);
                            res(answer);
                        }).catch((err) => {
                        console.error('[Login] Email not registered: \"' + email + '\"');
                        answer.code = 102;
                        res(answer);
                    });
                }
            }
        );
    }

    register(email: string, username: string, password: string, repeatPassword: string): Promise<Answer> {
        return new Promise((res, rej) => {
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

            if (answer.validation.password === null) {
                answer.code = 202;
                answer.validation.password = true;
                res(answer);
            }

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
                    console.log("[Register] Email not yet registered:", email);
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
                        res(answer);
                    } catch {
                        console.error('[Register] Error while inserting data to database');
                        answer.code = 1;
                        rej(answer);
                    }
                });
            } else {
                res(answer);
            }
        });
    }
}
