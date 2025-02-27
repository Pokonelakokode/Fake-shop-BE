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
      const chat = this.model.startChat();
      const result = await chat.sendMessage(prompt);
      const calls = result.response.functionCalls();
      console.log('Function calls:', calls);
      if (calls) {
        // Define types for function call results
        type FunctionCallResponse = {
          name: string;
          response: any;
        };

        type FunctionCallError = {
          name: string;
          error: string;
        };

        type FunctionCallResult = FunctionCallResponse | FunctionCallError;

        // Create an array of promises, each returning an object with name and result
        const callPromises = calls.map(call => {
          return (async () => {
            try {
              switch (call.name) {
                case 'getProducts':
                  const { page, limit } = call.args as { page: number, limit: number };
                  const products = await this.productService.getProducts(page, limit);
                  return { name: call.name, response: products };
                  
                case 'getProductById':
                  const { id: productId } = call.args as { id: number };
                  const product = await this.productService.getProductById(productId);
                  return { name: call.name, response: product };
                  
                case 'createProduct':
                  const { productData: newProductData } = call.args as { productData: Partial<Product> };
                  const newProduct = await this.productService.createProduct(newProductData);
                  return { name: call.name, response: newProduct };
                  
                case 'updateProduct':
                  const { id: updateId, productData: updateData } = call.args as { id: number, productData: Partial<Product> };
                  const updatedProduct = await this.productService.updateProduct(updateId, updateData);
                  return { name: call.name, response: updatedProduct };
                  
                case 'deleteProduct':
                  const { id: deleteId } = call.args as { id: number };
                  const deleteResult = await this.productService.deleteProduct(deleteId);
                  return { name: call.name, response: deleteResult };
                  
                case 'searchProducts':
                  const { query, page: searchPage, limit: searchLimit } = call.args as { query: string, page: number, limit: number };
                  const searchResults = await this.productService.searchProducts(query, searchPage, searchLimit);
                  return { name: call.name, response: searchResults };

                default:
                  return { name: call.name, error: 'Unknown function call' };
              }
            } catch (error) {
              return { name: call.name, error: String(error) };
            }
          })();
        });

        // Wait for all promises to resolve
        const allResults = await Promise.all<FunctionCallResult>(callPromises);

        // Filter out results with errors
        const validCallResults = allResults.filter(
          (result): result is FunctionCallResponse => !('error' in result)
        );

        // Only send response if we have valid results
        if (validCallResults.length > 0) {
            await chat.sendMessage(validCallResults.map(result => ({functionResponse: {name: result.name, response: result.response}})));
        }

        // Return only the valid results
        return JSON.stringify(validCallResults);
      } else {
        return result.response.text();
      }
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
