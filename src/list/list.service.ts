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
                    "entities": [User, Lists]
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

    async getUserForToken(token: string): Promise<User> {
        if (token) {
            return getConnection()
                .getRepository(User)
                .createQueryBuilder()
                .where("current_token = :placeholder", {placeholder: token})
                .getOne();
        } else {
            return null;
        }
    }

    async deleteList(name: string, token: string): Promise<boolean> {

        try {
            const usr = await this.getUserForToken(token);
            console.log('[Lists-DEL] Recieved: \"' + token + '\" resolved for ID \"' + usr.user_id + '\"');
            if (usr.user_id) {
                const result = await getConnection()
                    .createQueryBuilder()
                    .delete()
                    .from(Lists)
                    .where("name = :name && fk_user = :user", {name: name, user: usr.user_id})
                    .execute();
                return Promise.resolve(result.affected > 0);

            }
        } catch (e) {
            return Promise.reject();
        }
    }


    async renameList(oldName: string, newName: string, token: string): Promise<string> {
        try {
            const usr = await this.getUserForToken(token);
            console.log('[Lists-RENAME] Recieved: \"' + token + '\" resolved for ID \"' + usr.user_id + '\"');
            if (usr.user_id) {
                await getConnection()
                    .createQueryBuilder()
                    .update(Lists)
                    .set({name: newName})
                    .where("name = :oldName && fk_user = :user", {oldName: oldName, user: usr.user_id})
                    .execute();

                console.log('[List-RENAME] List \"' + newName + '\" created successfully');
                return newName;

            }
        } catch (e) {
            console.log(e);
            Promise.reject();
        }
    }

    async addList(name: string, token: string): Promise<string> {
        try {
            const usr = await this.getUserForToken(token);
            console.log('[Lists-ADD] Recieved: \"' + token + '\" resolved for ID \"' + usr.user_id + '\"');
            if (usr.user_id) {
                await getConnection()
                    .createQueryBuilder()
                    .insert()
                    .into(Lists)
                    .values([
                        {
                            name: name,
                            fk_user: usr.user_id.toString(),
                        }
                    ])
                    .execute();

                console.log('[List-ADD] List \"' + name + '\" created successfully');
                return name;

            } else {
                return Promise.reject();
            }
        } catch (e) {
            console.error('ERROR while adding list', e);
            return Promise.reject();
        }
    }

    async getLists(token: string): Promise<string[]> {

        console.log('[Lists-GET] Recieved:', token);

        try {
            const usr = await this.getUserForToken(token);
            if (usr.user_id) {
                let listNames: string[] = await this.connection
                    .getRepository(Lists)
                    .createQueryBuilder()
                    .where("fk_user = :givenId", {givenId: usr.user_id})
                    .getMany()
                    .then(lists => {
                        const nameList: string[] = [];
                        lists.forEach((x) => {
                            nameList.push(x.name)
                        });
                        return nameList;
                    });
                //TODO: VARIABELNNAMEN ÜBERARBEITEN
                return listNames;
            } else {
                return Promise.reject();
            }
        } catch (e) {
            return Promise.reject('Error while getting Lists: ' + e);
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
