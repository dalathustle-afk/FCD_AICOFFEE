
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, DefectType } from "../types";

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function analyzeCoffeeImage(base64Image: string, retryCount = 0): Promise<AnalysisResult> {
  const MAX_RETRIES = 3;
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = "gemini-3-flash-preview"; 

  const prompt = `
  VAI TRÒ: Chuyên gia giám định SCA (Specialty Coffee Association) Green Coffee Grader.
  NHIỆM VỤ: Phân tích mẫu hạt cà phê nhân xanh qua hình ảnh theo quy chuẩn vật lý SCA Green Coffee Defect Manual.

  QUY TẮC ĐẾM LỖI QUY ĐỔI (EQUIVALENT DEFECT COUNTING):
  Nhóm 1 (Primary):
  - 1 Hạt đen toàn phần = 1 lỗi
  - 1 Hạt chua toàn phần = 1 lỗi
  - 1 Quả khô = 1 lỗi
  - 1 Hạt nấm mốc = 1 lỗi
  - 1 Vật ngoại lai = 1 lỗi
  - 1 Hạt sâu nặng (>=3 lỗ) = 1 lỗi

  Nhóm 2 (Secondary):
  - 3 Hạt đen/chua một phần = 1 lỗi
  - 5 Hạt vỏ thóc = 1 lỗi
  - 5 Hạt nổi = 1 lỗi
  - 5 Hạt non = 1 lỗi
  - 5 Hạt héo = 1 lỗi
  - 5 Hạt vỏ sò = 1 lỗi
  - 5 Hạt vỡ/mẻ/cắt = 1 lỗi
  - 5 Hạt sâu nhẹ (<3 lỗ) = 1 lỗi

  PHÂN LOẠI XẾP HẠNG (GRADING CRITERIA):
  1. Specialty Grade (Grade 1): 0 lỗi Nhóm 1 VÀ <= 5 lỗi Nhóm 2 (quy đổi). Phải đồng đều kích thước.
  2. Premium Grade (Grade 2): <= 3 lỗi Nhóm 1 VÀ <= 8 lỗi Nhóm 2 (quy đổi).
  3. Exchange Grade (Grade 3): 9 - 23 lỗi quy đổi tổng cộng.
  4. Below Grade: > 23 lỗi quy đổi.

  YÊU CẦU ĐỊNH DẠNG:
  Trả về JSON chuẩn xác, ngôn ngữ song ngữ Việt-Anh.
  Trường 'equivalentDefectCount' trong mỗi item 'defects' là số lỗi sau khi đã chia theo tỷ lệ quy đổi (ví dụ 3 hạt vỡ quy đổi ra 0.6 lỗi).
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          { text: prompt },
          { inlineData: { mimeType: "image/jpeg", data: base64Image } }
        ]
      },
      config: {
        responseMimeType: "application/json",
        temperature: 0.1,
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            defects: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING, enum: Object.values(DefectType) },
                  count: { type: Type.INTEGER, description: "Số hạt thực tế đếm được" },
                  equivalentDefectCount: { type: Type.NUMBER, description: "Số lỗi sau khi quy đổi theo SCA" },
                  description: { type: Type.STRING },
                  category: { type: Type.INTEGER }
                },
                required: ["type", "count", "equivalentDefectCount", "category"]
              }
            },
            scaScore: { type: Type.NUMBER },
            scaGrade: { type: Type.STRING },
            overallQuality: { type: Type.INTEGER },
            summary: { type: Type.STRING },
            uniformityScore: { type: Type.NUMBER },
            marketSuitability: { type: Type.STRING }
          },
          required: ["defects", "scaScore", "scaGrade", "overallQuality", "summary"]
        }
      }
    });

    if (!response.text) throw new Error("Empty response");
    return JSON.parse(response.text.trim()) as AnalysisResult;

  } catch (error: any) {
    if (retryCount < MAX_RETRIES) {
      await sleep(1000);
      return analyzeCoffeeImage(base64Image, retryCount + 1);
    }
    throw new Error("Lỗi phân tích AI: " + (error.message || "Unknown error"));
  }
}
