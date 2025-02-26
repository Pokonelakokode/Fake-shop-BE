import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Cart } from "./Cart";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @Column()
    email!: string;

    @OneToMany(() => Cart, cart => cart.user)
    carts!: Cart[];
}