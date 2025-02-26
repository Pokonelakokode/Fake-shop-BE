import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { User } from "./User";
import { Product } from "./Product";

@Entity()
export class Cart {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    quantity!: number;

    @ManyToOne(() => User, user => user.carts)
    user!: User;

    @ManyToOne(() => Product, product => product.carts)
    product!: Product;
}