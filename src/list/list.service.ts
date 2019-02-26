import {TokenGenerator} from "ts-token-generator";
import connectionData from './connection.json';
import {Connection, ConnectionManager} from "typeorm";

// @Injectable()
export class ListService {

    async connectDatabase() {
        if (connectionData != null) {
            const connectionManager = new ConnectionManager();
            const connection: Connection = await connectionManager.create({
                type: "mysql",
                host: "localhost",
                port: 3306,
                username: "root",
                password: "",
                database: "list"
            });
            const connectionResult: Promise<Connection> = connection.connect();

            connectionResult.then(() => {
                if (connection.isConnected) {
                    console.log('Database connected');
                } else {
                    console.error('Database failed to connect');
                }
            }, (err) => {
                console.error('db connection rejected');
            });


        } else {
            console.error('Error while establishing Database connection');
        }
    }

    tokenGenerator(): String {
        const tokgen = new TokenGenerator();
        return tokgen.generate();
    }

    login(user: String, password: String) {
        //TODO Database
        return this.tokenGenerator();
    }
}