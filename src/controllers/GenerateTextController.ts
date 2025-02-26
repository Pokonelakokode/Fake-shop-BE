import { Router, Request, Response } from "express";
import { GenerativeAIService } from "../services/generativeAI";
import { DataSource } from "typeorm";

export function createGenerateTextRouter(dataSource: DataSource): Router {
    const router = Router();
    const genAiService = new GenerativeAIService(dataSource);
    
    router.post("/", async (req: Request, res: Response): Promise<void> => {
        try {
            const { prompt } = req.body;
            if (!prompt) {
                res.status(400).json({ error: "Prompt is required" });
                return;
            }
            const text = await genAiService.generateText(prompt);
            res.json({ text });
        } catch (error) {
            console.error('Error generating text:', error);
            res.status(500).json({ error: 'Failed to generate text' });
        }
    });
    
    
    return router;
}