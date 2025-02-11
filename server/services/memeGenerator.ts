import { HfInference } from '@huggingface/inference';
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

export async function generateMeme(prompt: string): Promise<string | null> {
  console.log("Starting meme generation for prompt:", prompt);

  // First try with DALL-E
  try {
    console.log("Attempting DALL-E meme generation...");
    const imageResponse = await openai.images.generate({
      model: "dall-e-3",
      prompt: `Create a pixel art style crypto meme: ${prompt}. Style: 16-bit pixel art, retro gaming aesthetic, cyberpunk influence. Make it humorous and relevant to cryptocurrency culture. Use bright neon colors and retro gaming elements.`,
      n: 1,
      size: "1024x1024",
      quality: "standard",
      response_format: "url",  // Explicitly request URL format
    });

    if (imageResponse.data && imageResponse.data[0]?.url) {
      console.log("Successfully generated DALL-E meme with URL:", imageResponse.data[0].url);
      return imageResponse.data[0].url;
    }
  } catch (error) {
    console.error("DALL-E meme generation failed:", error);
  }

  // Fallback to Hugging Face meme generator
  try {
    console.log("Attempting Hugging Face meme generation...");
    const result = await hf.textToImage({
      model: "stabilityai/stable-diffusion-2-1",  // Using a more reliable model
      inputs: `Pixel art crypto meme: ${prompt}. Style: retro gaming, cyberpunk, 16-bit aesthetic`,
      parameters: {
        negative_prompt: "blurry, low quality, text, watermark",
        guidance_scale: 7.5,
        num_inference_steps: 50,
      }
    });

    if (!result) {
      throw new Error("No result from Hugging Face");
    }

    // Convert the blob to base64
    const arrayBuffer = await result.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const dataUrl = `data:image/png;base64,${base64}`;
    console.log("Successfully generated Hugging Face meme with data URL");
    return dataUrl;
  } catch (error) {
    console.error("Hugging Face meme generation failed:", error);
    return null;
  }
}

// For generating meme captions using Meme-Llama
export async function generateMemeCaption(context: string): Promise<string> {
  console.log("Starting meme caption generation for context:", context);
  try {
    const result = await hf.textGeneration({
      model: "Bickett/Meme-Llama",
      inputs: `Generate a funny crypto meme caption about: ${context}`,
      parameters: {
        max_new_tokens: 50,
        temperature: 0.9,
        top_p: 0.95,
      }
    });

    if (!result.generated_text) {
      throw new Error("No caption generated");
    }

    console.log("Successfully generated meme caption");
    return result.generated_text;
  } catch (error) {
    console.error("Meme caption generation failed:", error);
    return `Crypto meme about: ${context}`; // Fallback to simple caption
  }
}