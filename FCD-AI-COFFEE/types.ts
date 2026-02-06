
export enum DefectType {
  // Nhóm 1: Lỗi sơ cấp (Primary Defects) - 1 hạt lỗi = 1 lỗi toàn phần
  FULL_BLACK = "Hạt đen toàn phần (Full Black)",
  FULL_SOUR = "Hạt chua toàn phần (Full Sour)",
  DRIED_CHERRY = "Quả khô (Dried Cherry/Pod)",
  FUNGUS = "Hạt nấm mốc (Fungus Damaged)",
  FOREIGN_MATTER = "Vật ngoại lai (Foreign Matter)",
  SEVERE_INSECT = "Sâu nặng (Severe Insect Damage)",
  
  // Nhóm 2: Lỗi thứ cấp (Secondary Defects) - Cần nhiều hạt mới tính 1 lỗi toàn phần
  PARTIAL_BLACK = "Hạt đen một phần (Partial Black)",
  PARTIAL_SOUR = "Hạt chua một phần (Partial Sour)",
  PARCHMENT = "Hạt vỏ thóc (Parchment)",
  FLOATER = "Hạt nổi (Floater)",
  IMMATURE = "Hạt non (Immature/Quakers)",
  WITHERED = "Hạt héo (Withered)",
  SHELL = "Hạt vỏ sò (Shell)",
  BROKEN = "Hạt vỡ/mẻ/cắt (Broken/Chipped/Cut)",
  HULL_HUSK = "Vỏ quả/Vỏ trấu (Hull/Husk)",
  SLIGHT_INSECT = "Sâu nhẹ (Slight Insect Damage)",
  
  HEALTHY = "Hạt đạt chuẩn (Healthy/Specialty)"
}

export type SCAGrade = 
  | 'Xếp hạng Đặc sản (Specialty Grade - Grade 1)' 
  | 'Xếp hạng Cao cấp (Premium Grade - Grade 2)' 
  | 'Xếp hạng Thương mại (Exchange Grade - Grade 3)' 
  | 'Dưới chuẩn (Below Grade)';

export interface DefectItem {
  type: DefectType;
  count: number;
  description: string;
  severity: 'low' | 'medium' | 'high';
  category: 1 | 2;
  equivalentDefectCount: number; // Số lỗi quy đổi theo SCA
}

export interface AnalysisResult {
  defects: DefectItem[];
  scaScore: number;
  scaGrade: SCAGrade;
  overallQuality: number; 
  summary: string;
  technicalDetails: string;
  uniformityScore: number; 
  marketSuitability: string; 
}

export interface CoffeeImage {
  id: string;
  url: string;
  timestamp: number;
  result?: AnalysisResult;
}

export interface UserProfile {
  phoneNumber: string;
  usagePurpose: 'family' | 'shop';
  registeredAt: number;
}
