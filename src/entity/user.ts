import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    user_id: Number;

    @Column({type: "varchar", length: 22, nullable: true})
    current_token: String;

    @Column({type: "varchar", length: 20})
    username: String;

    @Column({type: "varchar", length: 40})
    email: String;

    @Column({type: "varchar", length: 20})
    password: String;
}