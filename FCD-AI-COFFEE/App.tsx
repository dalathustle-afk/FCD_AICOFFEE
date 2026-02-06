
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Camera, History, AlertTriangle, CheckCircle, BarChart, 
  BookOpen, Award, Home, Store, ArrowRight, Loader2, Disc, 
  Droplets, Sprout, CircleDot, Bug, Puzzle, Leaf, ScanLine, 
  LogOut, Sparkles, TrendingUp, Activity, Target, X, Calendar, 
  Clock, ChevronRight, Search, Zap, ShieldAlert, Trash2, Globe, Layers
} from 'lucide-react';
import { analyzeCoffeeImage } from './services/geminiService';
import { submitUserProfile } from './services/submissionService';
import { AnalysisResult, CoffeeImage, DefectType, UserProfile } from './types';
import { ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area } from 'recharts';

// --- HẰNG SỐ HỆ THỐNG ---
const BACKGROUND_URL = "https://images.unsplash.com/photo-1447933601403-0c6688de566e?q=80&w=2561";
const DASHBOARD_BG_URL = "https://images.unsplash.com/photo-1511537632536-b7a460c833a5?q=80&w=2676";
const SCA_LOGO_URL = "https://images.squarespace-cdn.com/content/v1/584680e329687f0dcd2f3333/1481577717462-I8Y7Z2Z2X8O3R7R5B8Z5/SCA_Logo_Icon_Gold.png";

const THU_VIEN_LOI = [
  // Nhóm 1: Primary Defects
  { 
    type: DefectType.FULL_BLACK, cat: 1, danger: 10, icon: Disc, 
    cause: "Trái chín nẫu, lên men quá mức hoặc cây thiếu nước.",
    harm: "Vị đắng khét, mùi mốc, phenol, làm hỏng hoàn toàn hương vị cốc.",
    image: "https://i.postimg.cc/XpRkTVH9/defect-full-black.jpg",
    desc: "Hạt đen toàn phần, bề mặt thường nhăn nheo."
  },
  { 
    type: DefectType.FULL_SOUR, cat: 1, danger: 9, icon: Droplets, 
    cause: "Nhiễm khuẩn trong quá trình chế biến hoặc nước bẩn.",
    harm: "Vị chua gắt như giấm, mùi nẫu, làm mất tính ổn định của hương vị.",
    image: "https://i.postimg.cc/rD5NTv3d/defect-sour.jpg",
    desc: "Hạt có màu nâu đỏ hoặc đỏ gạch."
  },
  { 
    type: DefectType.FUNGUS, cat: 1, danger: 10, icon: Sprout, 
    cause: "Bảo quản ẩm ướt, nấm phát triển sau khi thu hoạch.",
    harm: "Mùi mốc nồng, chứa độc tố mycotoxins gây hại sức khỏe.",
    image: "https://i.postimg.cc/2Vs7PzcQ/defect-fungus.jpg",
    desc: "Có bào tử nấm màu trắng, vàng hoặc xám."
  },
  { 
    type: DefectType.DRIED_CHERRY, cat: 1, danger: 7, icon: CircleDot, 
    cause: "Xát vỏ kém hiệu quả, quả khô sót lại trong mẫu.",
    harm: "Vị trái cây thối, đất, hương vị không sạch.",
    image: "https://i.postimg.cc/tYKNLXSn/defect-dried-pod.jpg",
    desc: "Toàn bộ quả khô còn nguyên lớp vỏ."
  },
  { 
    type: DefectType.SEVERE_INSECT, cat: 1, danger: 8, icon: Bug, 
    cause: "Mọt đục quả (CBB) tấn công nghiêm trọng (>=3 lỗ).",
    harm: "Hương vị đất, bẩn, mất độ dày của body (thể chất).",
    image: "https://i.postimg.cc/56hSZx75/defect-severe-insect.jpg",
    desc: "Hạt có từ 3 lỗ đục trở lên."
  },
  { 
    type: DefectType.FOREIGN_MATTER, cat: 1, danger: 10, icon: Trash2, 
    cause: "Lẫn tạp chất từ quá trình phơi hoặc thu hoạch.",
    harm: "Hỏng máy rang, máy xay và gây nguy hiểm cho người dùng.",
    image: "https://plus.unsplash.com/premium_photo-1661628108529-57778b0f92b7?q=80&w=1800",
    desc: "Sỏi, đá, cành cây, kim loại hoặc nhựa lẫn trong cà phê."
  },
  
  // Nhóm 2: Secondary Defects
  { 
    type: DefectType.IMMATURE, cat: 2, danger: 5, icon: Leaf, 
    cause: "Thu hoạch quả chưa chín.",
    harm: "Vị chát (astringency), thiếu độ ngọt, mùi cỏ sống.",
    image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=1800",
    desc: "Hạt nhỏ, vỏ lụa bám chặt, màu xanh nhạt."
  },
  { 
    type: DefectType.BROKEN, cat: 2, danger: 3, icon: Puzzle, 
    cause: "Máy xát vỏ chỉnh sai hoặc va đập mạnh.",
    harm: "Rang không đều (hạt nhỏ cháy trước), vị khét.",
    image: "https://plus.unsplash.com/premium_photo-1675716443562-b771d72a3da7?q=80&w=1800",
    desc: "Hạt bị vỡ, sứt mẻ hoặc có vết cắt."
  },
  { 
    type: DefectType.FLOATER, cat: 2, danger: 4, icon: Globe, 
    cause: "Hạt bị khô héo trên cây hoặc chế biến không kỹ.",
    harm: "Vị nhạt nhẽo, mất hương thơm, body mỏng.",
    image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=1800",
    desc: "Hạt có mật độ thấp, nhẹ, màu trắng nhạt."
  },
  { 
    type: DefectType.SHELL, cat: 2, danger: 2, icon: Zap, 
    cause: "Di truyền của cây cà phê.",
    harm: "Hạt rang không đều, ảnh hưởng nhẹ đến ngoại quan.",
    image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=1800",
    desc: "Hạt có dạng hình vỏ ốc, rỗng ruột."
  },
  { 
    type: DefectType.PARCHMENT, cat: 2, danger: 3, icon: Layers, 
    cause: "Máy xát khô không loại bỏ hết vỏ thóc.",
    harm: "Làm cháy trong trống rang, mùi khét của giấy cháy.",
    image: "https://i.postimg.cc/tYKNLXSn/defect-dried-pod.jpg",
    desc: "Hạt nhân vẫn còn nằm trong lớp vỏ thóc."
  },
  { 
    type: DefectType.WITHERED, cat: 2, danger: 4, icon: ShieldAlert, 
    cause: "Cây thiếu dinh dưỡng hoặc khô hạn.",
    harm: "Vị đắng xanh, mùi thảo mộc không mong muốn.",
    image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=1800",
    desc: "Hạt nhăn nheo, nhỏ bé như nho khô."
  }
];

const MENU_CHINH = [
  { id: 'scan', label: 'PHÂN TÍCH', icon: Camera },
  { id: 'library', label: 'THƯ VIỆN LỖI', icon: BookOpen },
  { id: 'history', label: 'LỊCH SỬ', icon: History },
  { id: 'report', label: 'BÁO CÁO', icon: BarChart }
];

const LogoSCA = () => (
  <div className="flex items-center gap-3 select-none">
    <div className="h-9 w-9 bg-[#D4AF37]"
      style={{ maskImage: `url(${SCA_LOGO_URL})`, WebkitMaskImage: `url(${SCA_LOGO_URL})`, maskSize: 'contain', WebkitMaskSize: 'contain' }}
    />
    <div className="flex flex-col border-l border-[#D4AF37]/30 pl-3">
      <span className="text-[9px] uppercase font-black tracking-[0.2em] leading-none text-[#D4AF37]">Hiệp hội</span>
      <span className="text-[10px] uppercase font-bold tracking-[0.1em] leading-none my-0.5 text-slate-100 whitespace-nowrap">Cà phê Đặc sản</span>
      <span className="text-[8px] uppercase font-medium tracking-[0.1em] leading-none text-slate-500">SCA International</span>
    </div>
  </div>
);

const App: React.FC = () => {
  const [images, setImages] = useState<CoffeeImage[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<'scan' | 'library' | 'history' | 'report'>('scan');
  const [selectedImage, setSelectedImage] = useState<CoffeeImage | null>(null);
  const [selectedDefect, setSelectedDefect] = useState<typeof THU_VIEN_LOI[0] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [usagePurpose, setUsagePurpose] = useState<'family' | 'shop' | ''>('');

  useEffect(() => {
    const saved = localStorage.getItem('coffee_user_profile');
    if (saved) setUserProfile(JSON.parse(saved));
    const savedHistory = localStorage.getItem('coffee_scan_history');
    if (savedHistory) setImages(JSON.parse(savedHistory));
  }, []);

  useEffect(() => {
    if (images.length > 0) localStorage.setItem('coffee_scan_history', JSON.stringify(images));
  }, [images]);

  const stats = useMemo(() => {
    const analyzed = images.filter(img => img.result);
    const total = images.length;
    const avgScore = analyzed.length > 0 
      ? Math.round(analyzed.reduce((acc, img) => acc + (img.result?.scaScore || 0), 0) / analyzed.length) 
      : 0;
    
    const defectCounts: Record<string, number> = {};
    analyzed.forEach(img => {
      img.result?.defects.forEach(d => {
        defectCounts[d.type] = (defectCounts[d.type] || 0) + 1;
      });
    });
    const commonDefect = Object.entries(defectCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "Đang cập nhật";

    return { total, avgScore, commonDefect };
  }, [images]);

  const handleRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber || !usagePurpose) return;
    const newProfile: UserProfile = { phoneNumber, usagePurpose: usagePurpose as any, registeredAt: Date.now() };
    localStorage.setItem('coffee_user_profile', JSON.stringify(newProfile));
    setUserProfile(newProfile);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = (e.target?.result as string).split(',')[1];
      const newImage: CoffeeImage = { id: Date.now().toString(), url: e.target?.result as string, timestamp: Date.now() };
      setImages(prev => [newImage, ...prev]);
      setSelectedImage(newImage);
      setIsAnalyzing(true);
      try {
        const result = await analyzeCoffeeImage(base64);
        const updated = { ...newImage, result };
        setImages(prev => prev.map(img => img.id === newImage.id ? updated : img));
        setSelectedImage(updated);
      } catch (err: any) {
        alert(err.message);
      } finally { setIsAnalyzing(false); }
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const registrationUI = (
    <div className="flex items-center justify-center p-4 min-h-screen">
      <div className="relative z-10 w-full max-w-md bg-black/80 backdrop-blur-xl p-10 rounded-[2.5rem] border border-[#D4AF37] shadow-[0_0_40px_rgba(212,175,55,0.3)] animate-in fade-in zoom-in-95 duration-700">
         <div className="flex justify-center mb-10"><LogoSCA /></div>
         <div className="text-center mb-8">
           <h2 className="text-2xl font-black text-white tracking-widest uppercase mb-2">Hệ Thống Kiểm Định AI</h2>
           <p className="text-slate-400 text-sm font-medium">Giám định chuẩn Specialty Coffee Association</p>
         </div>
         <form onSubmit={handleRegistration} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.2em] ml-1 block">Số điện thoại liên hệ</label>
              <input 
                type="tel" 
                value={phoneNumber} 
                onChange={e => setPhoneNumber(e.target.value)} 
                className="w-full bg-stone-900 border border-white/10 rounded-2xl p-4 text-white focus:border-[#D4AF37] outline-none transition-all placeholder:text-stone-700 font-medium" 
                placeholder="Ví dụ: 0912xxxxxx" required 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.2em] ml-1 block">MỤC ĐÍCH SỬ DỤNG</label>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { id: 'family', label: 'CÁ NHÂN', icon: Home },
                  { id: 'shop', label: 'KINH DOANH', icon: Store }
                ].map(type => (
                  <button 
                    key={type.id} type="button" 
                    onClick={() => setUsagePurpose(type.id as any)} 
                    className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all duration-300 ${usagePurpose === type.id ? 'bg-[#D4AF37] border-[#D4AF37] text-black shadow-lg' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'}`}
                  >
                    <type.icon size={20} />
                    <span className="text-[10px] font-black tracking-widest">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <button className="w-full bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-black font-black uppercase py-5 rounded-2xl hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] active:scale-95 transition-all tracking-widest text-xs">TIẾN HÀNH GIÁM ĐỊNH</button>
         </form>
      </div>
    </div>
  );

  return (
    <div 
      style={{ 
        backgroundImage: `linear-gradient(rgba(0,0,0,0.85), rgba(0,0,0,0.85)), url(${BACKGROUND_URL}) !important`, 
        backgroundSize: 'cover', 
        backgroundPosition: 'center',
        minHeight: '100vh', 
        width: '100%',
        backgroundAttachment: 'fixed' 
      }}
      className="text-slate-200 selection:bg-[#D4AF37] selection:text-black font-sans"
    >
      <div className="flex flex-col min-h-screen">
        {!userProfile ? registrationUI : (
          <>
            <header className="sticky top-0 z-50 bg-black/40 backdrop-blur-xl border-b border-[#D4AF37]/20 h-20 px-6 flex items-center justify-between">
              <div className="cursor-pointer" onClick={() => setActiveTab('scan')}>
                <LogoSCA />
              </div>
              <nav className="flex gap-2 md:gap-4 overflow-x-auto no-scrollbar">
                {MENU_CHINH.map(item => (
                  <button 
                    key={item.id} 
                    onClick={() => { setActiveTab(item.id as any); setSelectedImage(null); }} 
                    className={`px-4 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all whitespace-nowrap ${activeTab === item.id ? 'bg-[#D4AF37] text-black shadow-md' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                  >
                    <span className="flex items-center gap-2">
                      <item.icon size={14} />
                      <span className="hidden sm:inline">{item.label}</span>
                    </span>
                  </button>
                ))}
              </nav>
              <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="text-slate-500 hover:text-red-500 transition-colors">
                <LogOut size={18} />
              </button>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-8 space-y-8 flex-grow">
              {activeTab === 'scan' && (
                <div className="space-y-8 animate-in fade-in duration-700">
                  <div 
                    className="min-h-[42vh] flex flex-col items-center justify-center relative overflow-hidden shadow-2xl transition-all duration-1000"
                    style={{ 
                      backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.85), rgba(0,0,0,0.7)), url(${DASHBOARD_BG_URL})`, 
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundAttachment: 'fixed',
                      borderRadius: '24px',
                      border: '1px solid rgba(212, 175, 55, 0.2)'
                    }}
                  >
                    <div className="relative z-10 text-center space-y-6 px-4">
                      <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-full mb-2">
                        <Sparkles size={12} className="text-[#D4AF37]" />
                        <span className="text-[#D4AF37] text-[9px] font-black uppercase tracking-[0.2em]">SCA Core AI v3.0 Active</span>
                      </div>
                      <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter leading-none">
                        Kiểm định <span className="text-[#D4AF37]">Chất lượng</span>
                      </h1>
                      <div className="max-w-md mx-auto">
                        <p className="text-slate-400 text-[10px] uppercase font-bold tracking-[0.2em] mb-6">Phân tích vật lý đa tầng hạt nhân xanh theo tiêu chuẩn GCM-2024</p>
                      </div>
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="group relative bg-[#D4AF37] text-black px-12 py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] transition-all overflow-hidden"
                      >
                        <span className="relative z-10 flex items-center gap-3">
                          <ScanLine size={18} />
                          Tải ảnh mẫu hạt
                        </span>
                        <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                      </button>
                    </div>
                    {isAnalyzing && (
                      <div className="absolute inset-0 bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center z-20">
                        <div className="relative mb-8">
                          <Loader2 className="animate-spin text-[#D4AF37]" size={64} />
                          <div className="absolute inset-0 animate-pulse bg-[#D4AF37]/20 blur-2xl rounded-full"></div>
                        </div>
                        <p className="text-[#D4AF37] font-black uppercase tracking-[0.4em] animate-pulse">ĐANG PHÂN TÍCH QUY CHUẨN SCA...</p>
                      </div>
                    )}
                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
                  </div>

                  {/* Stats Row */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      { label: 'SỐ MẪU ĐÃ QUÉT', value: stats.total, icon: Activity, detail: 'Phân tích' },
                      { label: 'ĐIỂM TRUNG BÌNH', value: `${stats.avgScore}/100`, icon: Target, detail: 'SCA Points' },
                      { label: 'LỖI PHỔ BIẾN', value: stats.commonDefect, icon: AlertTriangle, detail: 'Cần chú ý' }
                    ].map((s, i) => (
                      <div key={i} className="bg-black/40 backdrop-blur-md border border-[#D4AF37]/20 p-6 rounded-[2rem] flex items-center gap-6 hover:translate-y-[-4px] transition-all">
                        <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37]">
                          <s.icon size={22} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest mb-1">{s.label}</p>
                          <p className="text-xl font-black text-white truncate">{s.value}</p>
                          <p className="text-slate-600 text-[9px] font-medium uppercase mt-0.5">{s.detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {selectedImage?.result && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in slide-in-from-right-4 duration-700">
                      <div className="lg:col-span-5">
                         <div className="bg-black/40 backdrop-blur-md border border-[#D4AF37]/30 rounded-[2.5rem] p-4 h-full flex flex-col items-center">
                            <img src={selectedImage.url} className="w-full rounded-2xl shadow-2xl object-contain aspect-square" alt="Result" />
                            <div className="mt-6 text-center">
                               <p className="text-[10px] text-[#D4AF37] font-black uppercase tracking-widest mb-1">MẪU GIÁM ĐỊNH: #{selectedImage.id.slice(-4)}</p>
                               <h3 className="text-white font-black uppercase tracking-tighter text-2xl">{selectedImage.result.scaGrade.split('(')[0]}</h3>
                            </div>
                         </div>
                      </div>
                      <div className="lg:col-span-7 space-y-6">
                        <div className="bg-black/60 backdrop-blur-md p-8 rounded-[2.5rem] border-l-4 border-[#D4AF37] relative overflow-hidden">
                           <div className="absolute top-0 right-0 p-8 opacity-10">
                              <Award className="text-[#D4AF37] w-24 h-24" />
                           </div>
                           <p className="text-[#D4AF37] text-[10px] font-black uppercase mb-4 tracking-[0.3em]">Kết quả đánh giá chuyên gia</p>
                           <div className="flex items-baseline gap-6 mb-8">
                             <div>
                                <p className="text-slate-500 text-[9px] uppercase font-black mb-1">SCA Score</p>
                                <p className="text-7xl font-digital text-[#D4AF37] drop-shadow-[0_0_15px_rgba(212,175,55,0.4)]">{selectedImage.result.scaScore}</p>
                             </div>
                             <div className="border-l border-white/10 pl-6">
                                <p className="text-slate-500 text-[9px] uppercase font-black mb-1">Độ đồng nhất</p>
                                <p className="text-4xl font-digital text-white">{selectedImage.result.uniformityScore}%</p>
                             </div>
                           </div>
                           <p className="text-slate-200 text-lg font-medium leading-relaxed italic border-l-2 border-[#D4AF37] pl-6 py-2 bg-[#D4AF37]/5 rounded-r-xl">
                              "{selectedImage.result.summary}"
                           </p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           {selectedImage.result.defects.length > 0 ? selectedImage.result.defects.map((d, i) => (
                             <div key={i} className="bg-stone-900/60 border border-white/5 p-5 rounded-2xl flex justify-between items-center group hover:bg-white/5 transition-all">
                                <div className="flex items-center gap-4">
                                   <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${d.category === 1 ? 'bg-red-500/10 text-red-500' : 'bg-[#D4AF37]/10 text-[#D4AF37]'}`}>
                                      <AlertTriangle size={18} />
                                   </div>
                                   <div>
                                      <p className="text-white font-black text-xs uppercase truncate max-w-[120px]">{d.type}</p>
                                      <p className="text-slate-500 text-[9px] font-bold">Hạt thực tế: {d.count}</p>
                                   </div>
                                </div>
                                <div className="text-right">
                                   <p className="text-[#D4AF37] font-digital text-2xl leading-none">{d.equivalentDefectCount}</p>
                                   <p className="text-[8px] text-slate-600 uppercase font-black tracking-widest mt-1">Lỗi quy đổi</p>
                                </div>
                             </div>
                           )) : (
                             <div className="col-span-2 bg-emerald-500/5 border border-emerald-500/20 p-8 rounded-[2rem] text-center">
                                <CheckCircle className="mx-auto text-emerald-500 mb-4" size={40} />
                                <h4 className="text-white font-black uppercase tracking-[0.2em]">Zero Physical Defects</h4>
                                <p className="text-slate-500 text-[10px] uppercase font-bold mt-1">Mẫu hạt đạt tiêu chuẩn Specialty tuyệt đối</p>
                             </div>
                           )}
                        </div>
                        <button 
                           onClick={() => setSelectedImage(null)} 
                           className="w-full py-4 bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 border border-[#D4AF37]/30 text-[#D4AF37] font-black text-xs uppercase tracking-[0.3em] rounded-2xl transition-all"
                        >
                           GIÁM ĐỊNH MẪU MỚI
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'library' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                      <h2 className="text-3xl font-black text-white uppercase tracking-widest leading-none mb-2">Thư viện lỗi SCA</h2>
                      <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.1em]">Danh mục lỗi hạt nhân xanh tiêu chuẩn quốc tế</p>
                    </div>
                    <p className="text-slate-600 text-[10px] max-w-sm italic md:text-right">Dữ liệu được trích xuất từ SCA Green Coffee Defect Manual 2024.</p>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6">
                    {THU_VIEN_LOI.map((defect) => (
                      <div 
                        key={defect.type} 
                        onClick={() => setSelectedDefect(defect)}
                        className="bg-black/40 backdrop-blur-md border border-[#D4AF37]/10 p-6 rounded-[2.5rem] cursor-pointer hover:border-[#D4AF37] hover:shadow-[0_0_25px_rgba(212,175,55,0.2)] transition-all group flex flex-col items-center text-center"
                      >
                        <div className="w-14 h-14 rounded-2xl bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] mb-6 group-hover:scale-110 group-hover:bg-[#D4AF37]/20 transition-all">
                          <defect.icon size={28} />
                        </div>
                        <div className="space-y-2">
                           <span className={`inline-block text-[8px] font-black uppercase px-2 py-0.5 rounded-full tracking-widest ${defect.cat === 1 ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>NHÓM {defect.cat}</span>
                           <h4 className="text-white font-black text-xs uppercase leading-tight min-h-[2.5rem] flex items-center justify-center">{defect.type}</h4>
                        </div>
                        <div className="w-full mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                           <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Nguy hại:</span>
                           <span className="text-[#D4AF37] font-digital text-xl">{defect.danger}/10</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'report' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-12">
                  <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-black text-white uppercase tracking-widest">Báo cáo tổng hợp</h2>
                    <div className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black text-[#D4AF37] uppercase tracking-widest">Analytics Dashboard</div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                      { label: 'TỔNG SỐ MẪU', value: stats.total, unit: 'Mẫu phân tích', color: '#D4AF37' },
                      { label: 'ĐIỂM TRUNG BÌNH', value: stats.avgScore, unit: 'SCA Points', color: '#B45309' },
                      { label: 'LỖI PHỔ BIẾN', value: stats.commonDefect, unit: 'Critical Type', color: '#EF4444' }
                    ].map((s, idx) => (
                      <div key={idx} className="bg-black/60 backdrop-blur-xl border-2 border-[#D4AF37]/20 p-10 rounded-[3rem] text-center relative overflow-hidden group hover:border-[#D4AF37] hover:shadow-[0_0_40px_rgba(212,175,55,0.1)] transition-all">
                         <p className="text-[#D4AF37] text-[10px] font-black uppercase tracking-[0.3em] mb-4">{s.label}</p>
                         <p className="text-5xl font-digital font-black text-white mb-2">{s.value}</p>
                         <p className="text-slate-600 text-[10px] font-bold uppercase tracking-widest">{s.unit}</p>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    <div className="lg:col-span-12 bg-black/40 backdrop-blur-md border border-white/5 p-10 rounded-[3rem]">
                      <div className="flex items-center justify-between mb-10">
                         <h3 className="text-[#D4AF37] text-xs font-black uppercase tracking-[0.4em]">Biểu đồ chất lượng theo thời gian</h3>
                         <TrendingUp className="text-slate-700" size={20} />
                      </div>
                      <div className="h-80 w-full">
                         <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={images.filter(img => img.result).slice(-20).map((img, idx) => ({ name: `#${img.id.slice(-3)}`, score: img.result?.scaScore }))}>
                               <defs>
                                  <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                                     <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.4}/>
                                     <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                                  </linearGradient>
                               </defs>
                               <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#fff" strokeOpacity={0.03} />
                               <XAxis dataKey="name" tick={{fill: '#444', fontSize: 10}} axisLine={false} tickLine={false} />
                               <YAxis domain={[0, 100]} tick={{fill: '#444', fontSize: 10}} axisLine={false} tickLine={false} />
                               <Tooltip contentStyle={{backgroundColor: '#000', border: '1px solid #D4AF37', borderRadius: '12px', color: '#fff'}} />
                               <Area type="monotone" dataKey="score" stroke="#D4AF37" fillOpacity={1} fill="url(#goldGradient)" strokeWidth={3} />
                            </AreaChart>
                         </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'history' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8">
                   <div className="flex items-center justify-between">
                      <h2 className="text-3xl font-black text-white uppercase tracking-widest leading-none">Lịch sử giám định</h2>
                      <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{images.length} BẢN GHI ĐÃ LƯU</p>
                   </div>
                   
                   <div className="grid grid-cols-1 gap-4">
                      {images.length > 0 ? images.map(img => (
                        <div 
                          key={img.id} 
                          onClick={() => { setSelectedImage(img); setActiveTab('scan'); }} 
                          className="group bg-black/40 backdrop-blur-md border border-white/5 p-5 flex flex-col md:flex-row items-center justify-between hover:bg-white/5 hover:border-[#D4AF37]/30 transition-all cursor-pointer rounded-2xl"
                        >
                           <div className="flex items-center gap-6 w-full md:w-auto">
                              <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 border border-white/5 group-hover:border-[#D4AF37]/40 transition-colors">
                                 <img src={img.url} className="w-full h-full object-cover" alt="History" />
                              </div>
                              <div className="min-w-0">
                                 <div className="flex items-center gap-3 text-slate-600 text-[9px] font-black uppercase tracking-widest mb-1">
                                    <span className="flex items-center gap-1.5"><Calendar size={12}/> {new Date(img.timestamp).toLocaleDateString()}</span>
                                    <span className="flex items-center gap-1.5"><Clock size={12}/> {new Date(img.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                 </div>
                                 <h4 className="text-white font-black text-xl uppercase tracking-tight truncate max-w-[280px]">Mẫu giám định #{img.id.slice(-4)}</h4>
                              </div>
                           </div>
                           
                           <div className="flex items-center gap-10 mt-6 md:mt-0 w-full md:w-auto justify-between md:justify-end">
                              <div className="text-right">
                                 <p className="text-slate-600 text-[9px] font-black uppercase mb-1 tracking-widest">KẾT QUẢ</p>
                                 <p className="text-[#D4AF37] font-black text-xs uppercase tracking-tight">{img.result?.scaGrade.split(' (')[0] || 'ĐANG CHỜ'}</p>
                              </div>
                              <div className="text-right">
                                 <p className="text-slate-600 text-[9px] font-black uppercase mb-1 tracking-widest">SCA SCORE</p>
                                 <p className="text-white font-digital text-4xl leading-none">{img.result?.scaScore || '--'}</p>
                              </div>
                              <div className="p-3 rounded-full bg-white/5 group-hover:bg-[#D4AF37] group-hover:text-black transition-all">
                                 <ChevronRight size={20} />
                              </div>
                           </div>
                        </div>
                      )) : (
                        <div className="flex flex-col items-center justify-center py-40 bg-black/20 rounded-[3rem] border border-dashed border-white/10">
                           <History className="text-slate-800 mb-6" size={64} />
                           <p className="text-slate-600 font-black uppercase tracking-[0.3em] text-sm">Chưa có dữ liệu giám định</p>
                        </div>
                      )}
                   </div>
                </div>
              )}
            </main>

            {/* Modal Chi Tiết Lỗi */}
            {selectedDefect && (
              <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-in fade-in duration-300" onClick={() => setSelectedDefect(null)}>
                <div className="w-full max-w-4xl bg-stone-950 rounded-[3rem] border-2 border-[#D4AF37] shadow-[0_0_100px_rgba(212,175,55,0.2)] overflow-hidden flex flex-col md:flex-row" onClick={e => e.stopPropagation()}>
                  <div className="md:w-1/2 h-64 md:h-auto bg-black flex items-center justify-center">
                    <img src={selectedDefect.image} className="object-cover w-full h-full opacity-60 group-hover:opacity-100 transition-opacity" alt={selectedDefect.type} />
                  </div>
                  <div className="md:w-1/2 p-12 space-y-8 relative">
                    <button onClick={() => setSelectedDefect(null)} className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors">
                       <X size={32} />
                    </button>
                    <div>
                      <h3 className="text-3xl font-black text-[#D4AF37] uppercase leading-tight mb-2">{selectedDefect.type}</h3>
                      <div className="flex gap-4">
                        <span className="px-4 py-1.5 bg-red-500/10 text-red-400 text-[10px] font-black rounded-full border border-red-500/20 uppercase tracking-widest">Nguy hại: {selectedDefect.danger}/10</span>
                        <span className="px-4 py-1.5 bg-[#D4AF37]/10 text-[#D4AF37] text-[10px] font-black rounded-full border border-[#D4AF37]/20 uppercase tracking-widest">SCA Group {selectedDefect.cat}</span>
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div>
                        <p className="text-[#D4AF37] text-[10px] font-black uppercase tracking-[0.4em] mb-2">Nguyên nhân hình thành:</p>
                        <p className="text-sm text-slate-300 leading-relaxed font-medium">{selectedDefect.cause}</p>
                      </div>
                      <div className="p-6 bg-red-500/5 rounded-[2rem] border border-red-500/10">
                        <p className="text-red-400 text-[10px] font-black uppercase tracking-[0.4em] mb-2 flex items-center gap-2">
                           <ShieldAlert size={14}/> Tác hại cảm quan (Flavor Impact):
                        </p>
                        <p className="text-base text-slate-200 font-bold leading-relaxed">{selectedDefect.harm}</p>
                      </div>
                    </div>
                    <div className="pt-6 border-t border-white/5">
                      <p className="text-[9px] text-slate-500 uppercase font-black italic">Hệ thống phân tích SCA Grader v3.0 - Specialty Coffee Association Standard</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <style>{`
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: rgba(0,0,0,0.3); }
        ::-webkit-scrollbar-thumb { background: #D4AF37; border-radius: 10px; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .font-digital { font-family: 'Share Tech Mono', monospace; }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default App;
