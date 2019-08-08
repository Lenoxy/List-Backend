import {TokenGenerator} from "ts-token-generator";
import {Connection, createConnection, getConnection} from "typeorm";
import {Answer} from "../interface/answer";
import {User} from "../entity/user";
import * as connData from '../../ormconfig.json';
import {Lists} from "../entity/lists";
import {Items} from "../entity/items";

export interface IUserWithList {
    user: User,
    list: Lists,
}

export interface IUserWithListWithItem {
    user: User,
    list: Lists,
    item: Items,
}

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
                    "entities": [User, Lists, Items]
                }
            );

            if (this.connection.isConnected) {
                console.log('[Database] connected on', connData.host + ':' + connData.port);
            } else {
                console.error('[Database] connection error on', connData.host + ':' + connData.port);
                process.exit(-1);
            }
        } catch (e) {
            console.error('[Database] Database connection failed' + e);
            process.exit(-1);
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

    getUserForToken(token: string): Promise<User> {
        return getConnection()
            .getRepository(User)
            .createQueryBuilder()
            .where("current_token = :placeholder", {placeholder: token})
            .getOne();

    }

    getListForName(listName: string, usrId: number): Promise<Lists> {
        return getConnection()
            .getRepository(Lists)
            .createQueryBuilder()
            .where("name = :listName && fk_user = :id", {listName: listName, id: usrId})
            .getOne()
    }

    getItemForName(listID: number, userID: number, itemName: string): Promise<Items> {
        return getConnection()
            .getRepository(Lists)
            .createQueryBuilder()
            .where("fk_user = :userID && id = :listID", {userID: userID, listID: listID})
            .getOne()
            .then((Lists) => {
                return getConnection()
                    .getRepository(Items)
                    .createQueryBuilder()
                    .where("name = :itemName", {itemName: itemName})
                    .getOne();
            });
    }

    async getItems(token: string, forList: string): Promise<string[]> {
        if (forList === undefined) {
            console.log('[Items-GET] Please select a List in order to get Items (List undefined)');
        } else {
            try {
                const usr = await this.getUserForToken(token);
                const list = await this.getListForName(forList, usr.user_id);
                if (usr.user_id && list) {
                    return this.connection
                        .getRepository(Items)
                        .createQueryBuilder()
                        .where("fk_list_id = :listId", {listId: list.id})
                        .getMany()
                        .then((itemObj: Items[]) => {
                            const itemList: string[] = [];
                            itemObj.forEach((x) => {
                                itemList.push(x.name);
                            });
                            console.log('[Items-GET] Returned \"' + itemObj.length + '\" items sucessfully');
                            return itemList;
                        });

                } else {
                    return Promise.reject('Could not get List for entry \"' + forList + '\"');
                }
            } catch {
                return Promise.reject('Error while getting Items');
            }
        }
    }

    async addItem(token: string, name: string, forList: string): Promise<void> {
        if (name == '') {
            console.error('[Item-ADD] Error while adding item');
            return Promise.reject();
        } else {
            try {
                const usr = await this.getUserForToken(token);
                const list = await this.getListForName(forList, usr.user_id);
                if (usr && list) {
                    await getConnection()
                        .createQueryBuilder()
                        .insert()
                        .into(Items)
                        .values([
                            {
                                name: name,
                                fk_list_id: list.id.toString(),
                            }
                        ])
                        .execute()
                        .then(() => {
                            console.log('[Item-ADD] Item \"' + name + '\" created successfully');
                            return Promise.resolve();
                        });
                } else {
                    console.error('[Item-ADD] Error while adding item');
                    return Promise.reject();
                }
            } catch {
                console.error('[Item-ADD] Error while adding item');
                return Promise.reject();
            }
        }
    }

    async deleteItem(token: string, itemName: string, forList: string): Promise<void> {

        const usr = await this.getUserForToken(token);
        const list = await this.getListForName(forList, usr.user_id);
        try {
            if (list) {
                await getConnection()
                    .createQueryBuilder()
                    .delete()
                    .from(Items)
                    .where("name = :name && fk_list_id = :list", {name: itemName, list: list.id.toString()})
                    .execute();
                console.log('[Items-DEL] Item \"' + itemName + '\" deleted successfully');
                return Promise.resolve();

            } else {
                console.error('[Item-DEL] Could not delete Item');
                return Promise.reject();
            }
        } catch {
            console.error('[Item-DEL] Could not delete Item');
            return Promise.reject();
        }
    }

    async renameItem(token: string, oldName: string, newName: string, forList: string): Promise<void> {
        if (newName == '' || newName === oldName) {
            return Promise.reject();
        } else {
            const user = await this.getUserForToken(token);
            const list = await this.getListForName(forList, user.user_id);
            const item = await this.getItemForName(list.id, user.user_id, oldName);

            return await getConnection()
                .createQueryBuilder()
                .update(Items)
                .set({name: newName})
                .where("id = :id", {id: item.id})
                .execute()
                .then(() => {
                    console.log('[Item-RENAME] Item \"' + oldName + '\" renamed to \"' + newName + '\"');
                    return Promise.resolve();
                });
        }
    }


    async deleteList(name: string, token: string): Promise<void> {
        const usr = await this.getUserForToken(token);
        const list = await this.getListForName(name, usr.user_id);
        try {
            await getConnection()
                .createQueryBuilder()
                .delete()
                .from(Lists)
                .where("id = :id && fk_user = :user", {id: list.id, user: usr.user_id})
                .execute();
            console.log('[List-DEL] Item \"' + name + '\" deleted successfully');
            return Promise.resolve();
        } catch {
            console.log('[List-DEL] Could not delete List \"' + name + '\"');
            return Promise.reject();
        }
    }

    async renameList(token: string, oldName: string, newName: string): Promise<void> {
        if (newName == '' || newName === oldName) {
            return Promise.reject();
        } else {
            const user = await this.getUserForToken(token);
            const list = await this.getListForName(oldName, user.user_id);

            return getConnection()
                .createQueryBuilder()
                .update(Lists)
                .set({name: newName})
                .where("id = :id && fk_user = :user", {id: list.id, user: user.user_id})
                .execute()
                .then(() => {
                    console.log('[List-RENAME] List \"' + oldName + '\" renamed to \"' + newName + '\"');
                    return Promise.resolve();
                });

        }
    }

    async addList(name: string, token: string): Promise<void> {
        if (name == '') {
            return Promise.reject();
        } else {
            try {
                const usr = await this.getUserForToken(token);
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
                        .execute()
                        .then(() => {
                            console.log('[List-ADD] List \"' + name + '\" created successfully');
                            return Promise.resolve();
                        });
                } else {
                    return Promise.reject();
                }
            } catch {
                console.error('ERROR while adding list');
                return Promise.reject();
            }
        }
    }

    async getLists(token: string): Promise<string[]> {
        try {
            const usr = await this.getUserForToken(token);
            return await this.connection
                .getRepository(Lists)
                .createQueryBuilder()
                .where("fk_user = :givenId", {givenId: usr.user_id})
                .getMany()
                .then((listsObjFromDB) => {
                    const nameList: string[] = [];
                    listsObjFromDB.forEach((x) => {
                        nameList.push(x.name);
                    });
                    console.log('[List-GET] Returned \"' + listsObjFromDB.length + '\" lists sucessfully');
                    return nameList;
                });

        } catch {
            console.log('[List-GET] Error while getting Lists');
            return Promise.reject('Error while getting Lists');
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
        return new Promise((resolve, reject) => {
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
                resolve(answer);
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
                        console.log('[Register] \"' + email + '\" already registered');
                        answer.code = 201;
                        resolve(answer);
                    }
                }).catch(() => {
                    console.log('[Register] Email not yet registered: \"' + email + '\"');
                    try {
                        const token = this.tokenGenerator();
                        getConnection()
                            .createQueryBuilder()
                            .insert()
                            .into(User)
                            .values([
                                {
                                    email: email,
                                    username: username,
                                    password: password,
                                    current_token: token
                                }
                            ])
                            .execute();

                        answer.token = token;

                        console.log('[Register] Register for', email, 'completed successfully');
                        resolve(answer);
                    } catch {
                        console.error('[Register] Error while inserting data to database');
                        answer.code = 2;
                        reject(answer);
                    }
                });
            } else {
                reject(answer);
            }
        });
    }
}
