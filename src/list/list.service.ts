import {TokenGenerator} from "ts-token-generator";
import {Connection, createConnection, getConnection} from "typeorm";
import {LoginAnswer} from "../interface/loginAnswer";
import {RegisterAnswer} from "../interface/registerAnswer";
import {User} from "../entity/user";

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

    validateEmail(email: String): boolean {
        email.trim().toLowerCase();
        try {
            //Explaining this next piece of code:
            //splittedat takes a Email adress and splits for example user@provider.org into "user" and "provider.org".
            let splittedat: String[] = email.split('@');
            //splitteddot takes the output of the first splitter "provider.org" and splits it into "provider" and "org".
            let splitteddot: String[] = splittedat[1].split('.');
            //Checking if these texts aren't too long

            return (splittedat[0].length >= 2 && splitteddot[0].length >= 2 && splitteddot[1].length >= 2);

        } catch {
            return false;
        }
    }

    validateUsername(username: String): boolean {
        return (username.length >= 3);
    }

    validatePassword(password: String, repeatPassword?: String) {
        if (repeatPassword == null) {
            //TODO: Mindestens ein Grossbuchstabe
            return (password.length >= 6);
        } else {
            return (password.length >= 6 && password === repeatPassword);
        }
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
        console.log('[Register] Registration recieved:', email, username, password, repeatPassword);

        answer.validateReason = [this.validateEmail(email), this.validateUsername(username), this.validatePassword(password, repeatPassword)];
        console.log(
            '[Validation] Success: (' +
            'Email:', answer.validateReason[0],
            'Username:', answer.validateReason[1],
            'Password:', answer.validateReason[2] +
            ')'
        );
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