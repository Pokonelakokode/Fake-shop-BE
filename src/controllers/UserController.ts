import { Router } from "express";
import { DataSource } from "typeorm";
import { User } from "../entity/User";

export function createUserRouter(dataSource: DataSource): Router {
    const router = Router();
    
    router.get("/", async (req, res) => {
        const userRepo = dataSource.getRepository(User);
        const users = await userRepo.find();
        res.json(users);
    });

    router.get("/:id", async (req, res) => {
        const userRepo = dataSource.getRepository(User);
        const user = await userRepo.findOneBy({ id: +req.params.id });
        res.json(user);
    });

    router.post("/", async (req, res) => {
        const userRepo = dataSource.getRepository(User);
        const user = userRepo.create(req.body);
        await userRepo.save(user);
        res.json(user);
    });

    router.put("/:id", async (req, res) => {
        const userRepo = dataSource.getRepository(User);
        await userRepo.update({ id: +req.params.id }, req.body);
        res.json({ message: "User updated" });
    });

    router.delete("/:id", async (req, res) => {
        const userRepo = dataSource.getRepository(User);
        await userRepo.delete({ id: +req.params.id });
        res.json({ message: "User deleted" });
    });

    return router;
}
