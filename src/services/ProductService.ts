import { DataSource, Repository } from "typeorm";
import { Product } from "../entity/Product";

export class ProductService {
    private productRepo: Repository<Product>;

    constructor(private dataSource: DataSource) {
        this.productRepo = dataSource.getRepository(Product);
    }

    async getProducts(page: number, limit: number) {
        return this.productRepo.findAndCount({
            skip: (page - 1) * limit,
            take: limit
        });
    }

    async getProductById(id: number) {
        return this.productRepo.findOneBy({ id });
    }

    async createProduct(productData: Partial<Product>) {
        const product = this.productRepo.create(productData);
        await this.productRepo.save(product);
        return product;
    }

    async updateProduct(id: number, productData: Partial<Product>) {
        await this.productRepo.update({ id }, productData);
        return { message: "Product updated" };
    }

    async deleteProduct(id: number) {
        await this.productRepo.delete({ id });
        return { message: "Product deleted" };
    }

    async searchProducts(query: string, page: number, limit: number) {
        const [products, count] = await this.productRepo.createQueryBuilder("product")
            .where("product.product_name LIKE :query", { query: `%${query}%` })
            .orWhere("product.description LIKE :query", { query: `%${query}%` })
            .orWhere("product.brand LIKE :query", { query: `%${query}%` })
            .orWhere("product.category LIKE :query", { query: `%${query}%` })
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();

        return [products, count];
    }
}
