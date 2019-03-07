import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    user_id: number;

    @Column({type: "varchar", length: 22, nullable: true})
    current_token: string;

    @Column({type: "varchar", length: 20})
    username: string;

    @Column({type: "varchar", length: 40})
    email: string;

    @Column({type: "varchar", length: 20})
    password: string;
}