import { GoogleGenAI, Type } from '@google/genai';
import { Box2D, ClothingCategory, FairPriceResult, ClothingItem } from '../types';

const getClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

const cleanBase64 = (b64: string) => {
    if (b64.includes(',')) return b64.split(',')[1];
    return b64;
};

export const detectAndCrop = async (base64Image: string): Promise<{
    box2d: Box2D, 
    name: string, 
    category: ClothingCategory,
    color: string,
    material: string
}[]> => {
  try {
    const ai = getClient();
    // Prompt optimized for extraction
    const prompt = `Analyze this outfit photo. Detect INDIVIDUAL clothing items (Outerwear, Tops, Bottoms, Shoes, Bags, Accessories, Jewelry).
    
    For EACH item:
    1. Return a TIGHT bounding box [ymin, xmin, ymax, xmax] (0-1000). The box must strictly enclose the visible garment.
    2. Name it (e.g., "棕色皮衣", "蓝色牛仔裤").
    3. Categorize it ("上装", "下装", "外套", "鞋履", "连衣裙", "配饰").
    4. Identify color and material.
    
    Ignore skin, background, or body parts where possible. Focus on the garment.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
          parts: [
              { inlineData: { mimeType: 'image/jpeg', data: cleanBase64(base64Image) } },
              { text: prompt }
          ]
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    category: { type: Type.STRING },
                    color: { type: Type.STRING },
                    material: { type: Type.STRING },
                    box_2d: {
                        type: Type.ARRAY,
                        items: { type: Type.INTEGER } // [ymin, xmin, ymax, xmax]
                    }
                }
            }
        }
      }
    });

    const data = JSON.parse(response.text || '[]');
    
    return data.map((item: any) => ({
        name: item.name,
        category: item.category as ClothingCategory,
        color: item.color,
        material: item.material,
        box2d: {
            ymin: item.box_2d[0],
            xmin: item.box_2d[1],
            ymax: item.box_2d[2],
            xmax: item.box_2d[3],
        }
    }));

  } catch (error) {
    console.error("Gemini Detection Error:", error);
    throw error;
  }
};

export const generateProductShot = async (croppedImageBase64: string, itemDescription: string): Promise<string> => {
    try {
        const ai = getClient();
        // Updated Prompt for Nano Banana (gemini-2.5-flash-image)
        // Emphasizing "Pixel-Level Precise Cutout" and "Clean Edges"
        const prompt = `Task: Generate a high-fidelity, stand-alone e-commerce product shot of the ${itemDescription}.
        
        CRITICAL REQUIREMENTS:
        1. **Solid White Background**: The background must be pure hex #FFFFFF.
        2. **Pixel-Perfect Isolation**: The item must be cleanly separated from the original background. No artifacts, no blurry edges.
        3. **Remove Distractions**: Remove all human skin, hands, body parts, and hangers. The item should look like it's floating or on a ghost mannequin.
        4. **High Definition**: Sharp details, texture, and studio lighting.
        5. **Respect Original**: Maintain the original color, texture, and shape of the item exactly.
        
        Output: A single square image of the item.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image', // Nano Banana
            contents: {
                parts: [
                    { inlineData: { mimeType: 'image/png', data: cleanBase64(croppedImageBase64) } },
                    { text: prompt }
                ]
            }
        });

        // Loop to find image part
        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
                return `data:image/png;base64,${part.inlineData.data}`;
            }
        }
        
        // Fallback if no image generated (rare)
        return croppedImageBase64;

    } catch (error) {
        console.warn("Product Shot Generation Failed, using crop:", error);
        return croppedImageBase64;
    }
};

export const analyzeFairPrice = async (
  tagImage: string | null,
  garmentImage: string,
  location: string
): Promise<FairPriceResult> => {
  try {
    const ai = getClient();
    const parts: any[] = [
        { text: `你是一位专业的服装买手。请分析这件衣服在"${location}"的合理入手价格 (CNY)。
        
        严格规则:
        1. 如果提供了水洗标图片，必须严格读取上面的材质成分（如"100% 聚酯纤维"），严禁瞎编。
        2. 如果没有水洗标，根据衣服全貌图预估材质和工艺。
        3. 计算公式参考：基础成本 * 渠道倍率。
        4. 检测是否是高溢价的"智商税"面料（例如聚酯纤维、腈纶、人造棉卖高价）。如果是，设置 is_rip_off 为 true。
        5. 提供一句中文砍价话术 (haggle_tip)。
        
        输出 JSON.` }
    ];

    parts.push({ inlineData: { mimeType: 'image/jpeg', data: cleanBase64(garmentImage) } });
    if (tagImage) {
        parts.push({ inlineData: { mimeType: 'image/jpeg', data: cleanBase64(tagImage) } });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                material: { type: Type.STRING },
                base_cost: { type: Type.NUMBER },
                fair_price_range: { type: Type.STRING, description: "e.g. '150-200'" },
                haggle_tip: { type: Type.STRING },
                is_rip_off: { type: Type.BOOLEAN, description: "True if synthetic fabric is priced too high" }
            }
        }
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Gemini Price Analysis Error:", error);
    throw error;
  }
};

export const getDailyRecommendation = async (
    items: ClothingItem[], 
    weather: string
): Promise<{ suggestion: string }> => {
    try {
        const ai = getClient();
        if (items.length === 0) return { suggestion: "衣橱还是空的，快去录入你的第一件单品吧！" };

        // Filter out deleted items just in case
        const activeItems = items.filter(i => !i.isDeleted);
        if (activeItems.length === 0) return { suggestion: "衣橱里没有可穿的衣服哦。" };

        const itemSummary = activeItems.slice(0, 30).map(i => `${i.category}: ${i.name}`).join(', ');
        
        const prompt = `Role: Personal Stylist Assistant.
        Context: User's Wardrobe: [${itemSummary}].
        Environment: Weather is "${weather}".
        
        Task: Suggest a specific outfit combination from the wardrobe for tomorrow. 
        Tone: Warm, encouraging, concise (max 2 sentences). Chinese language.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { text: prompt },
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        suggestion: { type: Type.STRING }
                    }
                }
            }
        });

        return JSON.parse(response.text || '{"suggestion": "明天天气不错，穿得舒适一点吧！"}');
    } catch (error) {
        console.error("Gemini Recommendation Error:", error);
        return { suggestion: "今天不如试试经典的黑白搭配？" };
    }
}