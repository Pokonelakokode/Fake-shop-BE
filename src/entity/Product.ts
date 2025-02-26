import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Cart } from "./Cart";

@Entity()
export class Product {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    product_name!: string;

    @Column()
    description!: string;

    @Column("decimal")
    price!: number;

    @Column()
    brand!: string;

    @Column()
    category!: string;

    @Column()
    quantity_in_stock!: number;

    @Column("date")
    release_date!: Date;

    @Column("float")
    weight!: number;

    @Column()
    color!: string;

    @Column()
    material!: string;

    @OneToMany(() => Cart, cart => cart.product)
    carts!: Cart[];
}