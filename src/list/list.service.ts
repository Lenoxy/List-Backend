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

    validatePassword(password: String, repeatPassword?: String) {
        if (repeatPassword == null) {
            //TODO: Mindestens ein Grossbuchstabe
            return (password.length >= 6);
        } else {
            return password.length >= 6 && password === repeatPassword;
        }
    }


    login(email: String, password: String): Answer {
        let answer: Answer = new Answer();


        if (this.validateEmail(email)) {
            answer.validation[0] = true;
            if (this.validatePassword(password)) {
                answer.validation[1] = true;

                const dbUser: Promise<User> = this.connection.getRepository(User).createQueryBuilder("mail")
                    .where("mail.email = :email", {email: email}).getOne();

                dbUser.then((usr) => {

                    if (password === usr.password) {
                        console.log('[Login]', email, 'logged in successfully');
                        answer.isPasswordCorrect = true;
                        answer.token = this.tokenGenerator();

                    } else {
                        console.log('[Login] Wrong password for user', email);
                        answer.isPasswordCorrect = false;

                    }

                }).catch((err) => {
                    console.error("[Login] Could not find matching data for", email);
                    answer.internalError = 1;
                });


            } else {
                answer.validation[1] = false;
                console.log('[Login] Password', password, 'is not valid');
            }
        } else {
            answer.validation[0] = false;
            console.log('[Login] Email', email, 'is not valid');
        }

        return answer;
    }

    register(email: string, username: string, password: string, repeatPassword: string) {
        let answer: Answer = new Answer();
        console.log('[Register] Registration recieved:', email, username, password, repeatPassword);

        answer.validation = [this.validateEmail(email), this.validateUsername(username), this.validatePassword(password, repeatPassword)];
        console.log(
            '[Validation] Success: (' +
            'Email:', answer.validation[0],
            'Username:', answer.validation[1],
            'Password:', answer.validation[2] +
            ')'
        );

        if (answer.validation[0] == true && answer.validation[1] == true && answer.validation[2] == true) {
            try {


                getConnection()
                    .createQueryBuilder()
                    .insert()
                    .into(User)
                    .values([
                        {email: email, username: username, password: password, current_token: this.tokenGenerator()}
                    ])
                    .execute();
                //TODO: Promise return .execute()?

                answer.token = this.tokenGenerator();

                console.log('[Register] Register for', email, 'completed successfully');
            } catch {
                console.error('[Register] Error while inserting data to database');
                answer.internalError = 1;
            }

        }


        return answer;
    }
}