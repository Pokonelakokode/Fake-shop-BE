import { Router } from "express";
import { DataSource } from "typeorm";
import { ProductService } from "../services/ProductService";

export function createProductRouter(dataSource: DataSource): Router {
    const router = Router();
    const productService = new ProductService(dataSource);

    router.get("/", async (req, res) => {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const [products, total] = await productService.getProducts(page, limit);
        res.json({ data: products, total, page, limit });
    });

    router.get("/:id", async (req, res) => {
        const product = await productService.getProductById(+req.params.id);
        res.json(product);
    });

    router.post("/", async (req, res) => {
        const product = await productService.createProduct(req.body);
        res.json(product);
    });

    router.put("/:id", async (req, res) => {
        const result = await productService.updateProduct(+req.params.id, req.body);
        res.json(result);
    });

    router.delete("/:id", async (req, res) => {
        const result = await productService.deleteProduct(+req.params.id);
        res.json(result);
    });

    return router;
}
