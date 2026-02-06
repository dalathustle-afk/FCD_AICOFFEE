
import { UserProfile } from "../types";

// LƯU Ý: Bạn cần thay thế URL này bằng URL của Google Apps Script Web App của bạn
// Hướng dẫn nhanh:
// 1. Tạo Google Sheet -> Extensions -> Apps Script
// 2. Paste code xử lý doPost(e)
// 3. Deploy -> New Deployment -> Select type: Web App -> Execute as: Me -> Who has access: Anyone -> Deploy
// 4. Copy URL và dán vào bên dưới.
const GOOGLE_SCRIPT_URL = "YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE"; 

export async function submitUserProfile(profile: UserProfile): Promise<boolean> {
  try {
    // Nếu chưa có URL thực, ta giả lập thành công để app chạy được
    if (GOOGLE_SCRIPT_URL === "YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE") {
      console.log("Mock submission to Google Sheet:", profile);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Fake delay
      return true;
    }

    // Gửi dữ liệu thật bằng no-cors (để tránh lỗi CORS từ Google Script)
    await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors", 
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(profile),
    });
    
    return true;
  } catch (error) {
    console.error("Lỗi khi gửi về Google Sheet:", error);
    return false;
  }
}
