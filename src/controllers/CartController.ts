import { Router } from "express";
import { DataSource } from "typeorm";
import { Cart } from "../entity/Cart";

export function createCartRouter(dataSource: DataSource): Router {
    const router = Router();
    
    router.get("/", async (req, res) => {
        const cartRepo = dataSource.getRepository(Cart);
        const carts = await cartRepo.find();
        res.json(carts);
    });

    router.get("/:id", async (req, res) => {
        const cartRepo = dataSource.getRepository(Cart);
        const cart = await cartRepo.findOneBy({ id: +req.params.id });
        res.json(cart);
    });

    router.post("/", async (req, res) => {
        const cartRepo = dataSource.getRepository(Cart);
        const cart = cartRepo.create(req.body);
        await cartRepo.save(cart);
        res.json(cart);
    });

    router.put("/:id", async (req, res) => {
        const cartRepo = dataSource.getRepository(Cart);
        await cartRepo.update({ id: +req.params.id }, req.body);
        res.json({ message: "Cart updated" });
    });

    router.delete("/:id", async (req, res) => {
        const cartRepo = dataSource.getRepository(Cart);
        await cartRepo.delete({ id: +req.params.id });
        res.json({ message: "Cart deleted" });
    });

    return router;
}
