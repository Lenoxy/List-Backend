import {Column, Entity, PrimaryColumn} from "typeorm";

@Entity()
export class User {
    @PrimaryColumn()
    id: string;

    @Column()
    current_token: string;

    @Column()
    username: string;

    @Column()
    email: string;

    @Column() password: string;
}