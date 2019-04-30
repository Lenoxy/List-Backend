import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity()
export class Lists {
    @PrimaryGeneratedColumn()
    id: Number;

    @Column({type: "varchar", length: 30, nullable: false})
    name: string;

    @Column({type: "int"})
    fk_user: string;
}
