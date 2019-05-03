import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity()
export class Items {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: "varchar", length: 30, nullable: false})
    name: string;

    @Column({type: "int"})
    fk_list_id: string;
}
