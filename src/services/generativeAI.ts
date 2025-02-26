import { GenerativeModel, GoogleGenerativeAI } from '@google/generative-ai';
import { config } from 'dotenv';
import { DataSource, Repository } from 'typeorm';
import { Product } from '../entity/Product';
import { ProductService } from './ProductService';

config(); // Load environment variables

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error('GEMINI_API_KEY is not defined in the .env file');
}

export class GenerativeAIService {
  private model: GenerativeModel;
  private productService: ProductService;
  constructor(private dataSource: DataSource) {
    const genAI = new GoogleGenerativeAI(apiKey!);
    this.productService = new ProductService(dataSource);
    this.model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  public async generateText(prompt: string): Promise<string> {
    try {
      const result = await this.model.generateContent([prompt]);
      return result.response.text();
    } catch (error) {
      console.error('Error generating text:', error);
      throw error;
    }
  }

  // New method: returns Gemini API function call declarations for ProductService functions
  public getProductFunctionDeclarations() {
    return [
      {
        name: 'getProducts',
        description: 'Retrieve a paginated list of products.',
        parameters: {
          type: 'object',
          properties: {
            page: { type: 'number', description: 'Page number.' },
            limit: { type: 'number', description: 'Number of products per page.' }
          },
          required: ['page', 'limit']
        }
      },
      {
        name: 'getProductById',
        description: 'Get a product by its ID.',
        parameters: {
          type: 'object',
          properties: {
            id: { type: 'number', description: 'Product id.' }
          },
          required: ['id']
        }
      },
      {
        name: 'createProduct',
        description: 'Create a new product.',
        parameters: {
          type: 'object',
          properties: {
            productData: { type: 'object', description: 'Partial product object.' }
          },
          required: ['productData']
        }
      },
      {
        name: 'updateProduct',
        description: 'Update an existing product.',
        parameters: {
          type: 'object',
          properties: {
            id: { type: 'number', description: 'Product id.' },
            productData: { type: 'object', description: 'Partial product object containing update data.' }
          },
          required: ['id', 'productData']
        }
      },
      {
        name: 'deleteProduct',
        description: 'Delete a product by its ID.',
        parameters: {
          type: 'object',
          properties: {
            id: { type: 'number', description: 'Product id.' }
          },
          required: ['id']
        }
      },
      {
        name: 'searchProducts',
        description: 'Search products by a query with pagination.',
        parameters: {
          type: 'object',
          properties: {
            query: { type: 'string', description: 'Search query.' },
            page: { type: 'number', description: 'Page number.' },
            limit: { type: 'number', description: 'Number of products per page.' }
          },
          required: ['query', 'page', 'limit']
        }
      }
    ];
  }
}
