import {TokenGenerator} from "ts-token-generator";
import {Connection, createConnection, getConnection} from "typeorm";
import {Answer} from "../interface/answer";
import {User} from "../entity/user";
import * as connData from '../../ormconfig.json';
import {Lists} from "../entity/lists";

export class ListService {
    private connection: Connection = null;


    async connectDatabase(): Promise<void> {
        try {
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
        } catch {
            console.error('[Database] Database connection failed (Check if the Database is on)')
        }
    }

    tokenGenerator(): string {
        const tokgen = new TokenGenerator();
        return tokgen.generate();
    }

    validateEmail(email: string): boolean {
        try {
            email.trim().toLowerCase();
            //splittedat takes a Email adress and splits for example user@provider.org into "user" and "provider.org".
            let splittedat: string[] = email.split('@');
            //splitteddot takes the output of the first splitter "provider.org" and splits it into "provider" and "org".
            let splitteddot: string[] = splittedat[1].split('.');
            //Checking if these texts aren't too long

            return splittedat[0].length >= 2 && splitteddot[0].length >= 2 && splitteddot[1].length >= 2;

        } catch {
            return false;
        }
    }

    validateUsername(username: string): boolean {
        return username.length >= 3;
    }

    validatePassword(password: string): boolean {
        if (!password) {
            return false;
        } else return password.length >= 6;
    }

    validateRepeatPassword(password: string, repeatPassword: string): boolean {
        if (password && repeatPassword) {
            return password === repeatPassword;
        } else {
            return false;
        }
    }

    getIdForToken(token: string): number {
        if (!token) {
            return null;
        } else {
            this.connection
                .getRepository(User)
                .createQueryBuilder()
                .where("current_token = :placeholder", {placeholder: token})
                .getOne()
                .then(
                    (usr: User) => {
                        console.log("[ID-Getter] Resolved ID", usr.user_id, "for token", token);
                        return usr.user_id;
                    })
                .catch(
                    () => {
                        console.log("[ID-Getter] Could not find ID for given token");
                        return null;
                    });
        }
    }


    getLists(token: string): Lists[] {
        console.log('[Lists] Recieved:', token);
        let id: number = this.getIdForToken(token);
        if (id) {
            this.connection
                .getRepository(Lists)
                .createQueryBuilder()
                .where("fk_user = :givenId", {givenId: id})
                .getMany()
                .then((lists: Lists[]) => {
                    return lists;
                }, () => {
                    return null;
                })
        } else {
            return null;
        }

    }


    login(email: string, password: string): Promise<Answer> {
        console.log('[Login] Recieved request: \"' + email + '\" and \"' + password + '\"');
        return new Promise((res) => {
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
                                    console.log('[Login] Token inserted into DB for \"' + email + '\"');
                                }).catch(() => {
                                console.error('Error inserting Token into Database for \"' + email + '\"');
                            });

                        } else {
                            console.log('[Login] Wrong password for user', email);
                            answer.code = 101;
                        }
                        console.log('[HTTP] Returning:', answer);
                        res(answer);
                    }).catch(() => {
                    console.error('[Login] Email not registered: \"' + email + '\"');
                    answer.code = 102;
                    res(answer);
                });
            }
        });
    }

    register(email: string, username: string, password: string, repeatPassword: string): Promise<Answer> {
        return new Promise((res, rej) => {
            let answer: Answer = new Answer();
            console.log('[Register] Registration recieved:', email, username, password, repeatPassword);

            answer.validation = {
                email: this.validateEmail(email),
                username: this.validateUsername(username),
                password: this.validatePassword(password),
                repeatPassword: this.validateRepeatPassword(password, repeatPassword),
            };
            console.log(
                '[Validation] Result:',
                'Email:', answer.validation.email,
                'Username:', answer.validation.username,
                'Password:', answer.validation.password,
                'RepeatPassword:', answer.validation.repeatPassword,
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
                        answer.code = 201;
                        res(answer);
                    }
                }).catch(() => {
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
