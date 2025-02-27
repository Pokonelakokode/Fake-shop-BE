import { FunctionDeclaration, GenerativeModel, GoogleGenerativeAI, SchemaType, Tool } from '@google/generative-ai';
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
    this.model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash", 
      tools: [{functionDeclarations: this.getProductFunctionDeclarations()}] });
  }

  public async generateText(prompt: string): Promise<string> {
    try {
      const result = await this.model.generateContent([prompt]);
      const calls = result.response.functionCalls();
      console.log('Function calls:', calls);
      if (calls) {
        const callResults = [];
        for (const call of calls) {
          switch (call.name) {
            case 'getProducts':
              const { page, limit } = call.args as { page: number, limit: number };
              const products = await this.productService.getProducts(page, limit);
              callResults.push(products);
              break;
          }
        }
      } 
      return result.response.text();
    } catch (error) {
      console.error('Error generating text:', error);
      throw error;
    }
  }

  // New method: returns Gemini API function call declarations for ProductService functions
  public getProductFunctionDeclarations(): FunctionDeclaration[] {
    return [
      {
        name: 'getProducts',
        description: 'Retrieve a paginated list of products.',
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            page: { type: SchemaType.INTEGER, description: 'Page number.' },
            limit: { type: SchemaType.INTEGER, description: 'Number of products per page.' }
          },
          required: ['page', 'limit']
        }
      },
      {
        name: 'getProductById',
        description: 'Get a product by its ID.',
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            id: { type: SchemaType.INTEGER, description: 'Product id.' }
          },
          required: ['id']
        }
      },
      {
        name: 'createProduct',
        description: 'Create a new product.',
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            productData: { 
              type: SchemaType.OBJECT, 
              description: 'Partial product object.',
              properties: {
                name: { type: SchemaType.STRING, description: 'Product name' },
                description: { type: SchemaType.STRING, description: 'Product description' },
                price: { type: SchemaType.NUMBER, description: 'Product price' }
              }
             }
          },
          required: ['productData']
        }
      },
      {
        name: 'updateProduct',
        description: 'Update an existing product.',
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            id: { type: SchemaType.INTEGER, description: 'Product id.' },
            productData: { 
              type: SchemaType.OBJECT, 
              description: 'Partial product object containing update data.',
              properties: {
                // Define the properties of productData here
                // Example:
                name: { type: SchemaType.STRING, description: 'Product name' },
                description: { type: SchemaType.STRING, description: 'Product description' },
                price: { type: SchemaType.NUMBER, description: 'Product price' }
              }
            }
          },
          required: ['id', 'productData']
        }
      },
      {
        name: 'deleteProduct',
        description: 'Delete a product by its ID.',
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            id: { type: SchemaType.INTEGER, description: 'Product id.' }
          },
          required: ['id']
        }
      },
      {
        name: 'searchProducts',
        description: 'Search products by a query with pagination.',
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            query: { type: SchemaType.STRING, description: 'Search query.' },
            page: { type: SchemaType.INTEGER, description: 'Page number.' },
            limit: { type: SchemaType.INTEGER, description: 'Number of products per page.' }
          },
          required: ['query', 'page', 'limit']
        }
      }
    ];
  }
}
