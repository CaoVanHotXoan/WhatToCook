/**
 * ====================================================================================================
 * DỰ ÁN: WHAT TO COOK (BẾP CÒN GÌ) - HỆ THỐNG GỢI Ý MÓN ĂN THÔNG MINH
 * FILE: src/pages/index.tsx - TRANG CHỦ KẾT NỐI HỆ THỐNG GỢI Ý NGUYÊN LIỆU & TỪ ĐỒNG NGHĨA
 * CÔNG NGHỆ: Next.js (React), Tailwind CSS, Lucide Icons, Node.js Express RESTful API
 * ====================================================================================================
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import {
  Search,
  Heart,
  User,
  ChefHat,
  Clock,
  Users,
  Carrot,
  Sparkles,
  Flame,
  X,
  Plus,
  ChevronRight,
  TrendingUp,
  Bookmark,
  Check,
  Utensils,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  LogIn,
  Layers,
  RotateCcw,
  Home,
  Menu,
  Database,
  RefreshCw,
  Loader2,
  CheckCircle2,
  Info
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Ảnh mặc định thay thế nếu link ảnh món ăn bị lỗi
const FALLBACK_FOOD_IMG = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80';

// Từ điển ánh xạ từ đồng nghĩa địa phương phổ biến trong ẩm thực Việt
const SYNONYM_DICTIONARY: Record<string, string[]> = {
  'thịt ba chỉ': ['thịt ba rọi', 'ba rọi', 'ba chỉ', 'thịt lợn ba chỉ', 'thịt heo ba rọi', 'thịt lợn'],
  'thịt heo': ['thịt lợn', 'thịt lợn nạc', 'thịt heo nạc', 'thịt lợn ba chỉ'],
  'thịt bò': ['bò', 'thịt bò phi lê', 'bắp bò'],
  'cá lóc': ['cá quả', 'cá chuối', 'cá tràu', 'cá lóc đồng'],
  'dưa leo': ['dưa chuột', 'dưa gang'],
  'đậu hũ': ['đậu phụ', 'tàu hũ', 'tàu hủ', 'đậu hủ', 'tofu'],
  'ngô ngọt': ['bắp', 'ngô', 'bắp ngọt', 'bắp mỹ', 'ngô nếp'],
  'trứng gà': ['trứng', 'hột gà', 'trứng gà ta', 'trứng vịt', 'hột vịt'],
  'trứng cút': ['hột cút', 'trứng cút lộn'],
  'khoai mì': ['củ sắn', 'sắn'],
  'bột ngọt': ['mì chính', 'bột nêm'],
  'hành lá': ['hành hoa', 'hành xanh'],
  'ngò rí': ['rau mùi', 'rau ngò', 'mùi ta'],
  'rau muống': ['rau muống đồng', 'rau muống nước'],
  'cà chua': ['cà chua bi', 'cà chua chín'],
  'khoai tây': ['khoai tây bi', 'khoai tây củ']
};

interface CategoryItem {
  MaDanhMuc: number;
  TenDanhMuc: string;
  SoLuongMonAn?: number;
}

interface IngredientItem {
  MaNguyenLieu: number;
  TenNguyenLieu: string;
  LoaiNguyenLieu: string;
  TuDongNghia?: string;
}

interface StepItem {
  MaBuoc?: number;
  SoThuTuBuoc: number;
  NoiDungHuongDan: string;
  DuongDanAnhBuoc?: string | null;
}

interface RecipeIngredient {
  MaNguyenLieu?: number;
  TenNguyenLieu: string;
  DinhLuong?: string;
  LaNguyenLieuChinh?: boolean;
}

interface RecipeItem {
  MaMonAn: number;
  TenMonAn: string;
  CauChuyen?: string;
  KhauPhan?: number;
  ThoiGianNau?: number;
  DuongDanAnhChinh?: string;
  MaDanhMuc?: number;
  TenDanhMuc?: string;
  MaNguoiDung?: number;
  TenTacGia?: string;
  AnhTacGia?: string;
  SoLuotLuu?: number;
  DaLuu?: number | boolean;
  // Dữ liệu so khớp:
  TongSoNguyenLieu?: number;
  SoNLTrungKhop?: number;
  SoNLConThieu?: number;
  PhanTramKhop?: number;
  matchedIngredientsDetails?: Array<{
    recipeIngredient: string;
    matchedUserTag: string;
    isSynonym: boolean;
  }>;
  // Dữ liệu chi tiết:
  cacBuoc?: StepItem[];
  nguyenLieu?: RecipeIngredient[];
}

export default function HomePage() {
  // --- STATE DỮ LIỆU TỪ HỆ THỐNG ---
  const [recipes, setRecipes] = useState<RecipeItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [allIngredients, setAllIngredients] = useState<IngredientItem[]>([]);
  const [loadingRecipes, setLoadingRecipes] = useState<boolean>(true);
  const [isSystemReady, setIsSystemReady] = useState<boolean>(false);

  // --- STATE TÌM KIẾM HEADER (Theo tên món) ---
  const [headerSearchKeyword, setHeaderSearchKeyword] = useState<string>('');

  // --- STATE NHẬP NGUYÊN LIỆU TỦ LẠNH (Dạng Tag Input) ---
  const [ingredientInput, setIngredientInput] = useState<string>('');
  const [fridgeTags, setFridgeTags] = useState<string[]>(['thịt ba rọi', 'cá quả', 'rau muống']);
  const [synonymMatchReport, setSynonymMatchReport] = useState<string | null>(null);

  // --- STATE DANH MỤC & CHẾ ĐỘ GỢI Ý ---
  const [selectedCategoryId, setSelectedCategoryId] = useState<number>(0);
  const [isSuggestMode, setIsSuggestMode] = useState<boolean>(false);

  // --- STATE MODAL & DRAWERS ---
  const [selectedRecipeDetail, setSelectedRecipeDetail] = useState<RecipeItem | null>(null);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);
  const [isSavedDrawerOpen, setIsSavedDrawerOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [savedRecipeIds, setSavedRecipeIds] = useState<number[]>([]);

  // Mock User Session
  const [currentUser, setCurrentUser] = useState<{ id: number; name: string; email: string; avatar: string; role: string } | null>({
    id: 2,
    name: 'Cao Văn Hột Xoàn (Admin)',
    email: 'xoan@whattocook.com',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
    role: 'QuanTriVien'
  });

  // Tự động tắt Toast thông báo sau 4 giây
  useEffect(() => {
    if (synonymMatchReport) {
      const timer = setTimeout(() => setSynonymMatchReport(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [synonymMatchReport]);

  /**
   * ==================================================================================================
   * GỌI DỮ LIỆU TỪ HỆ THỐNG BACKEND
   * ==================================================================================================
   */

  // 1. Tải danh mục
  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/categories`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setCategories(data.data);
      }
    } catch (err) {
      console.warn('Không thể tải danh mục:', err);
    }
  }, []);

  // 2. Tải danh sách nguyên liệu
  const fetchIngredients = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/ingredients`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setAllIngredients(data.data);
      }
    } catch (err) {
      console.warn('Không thể tải nguyên liệu:', err);
    }
  }, []);

  // 3. Tải danh sách món ăn thông thường
  const fetchRecipes = useCallback(async (searchQuery = '', categoryId = 0) => {
    setLoadingRecipes(true);
    try {
      let url = `${API_BASE}/recipes?page=1&pageSize=30`;
      if (searchQuery.trim()) {
        url += `&search=${encodeURIComponent(searchQuery.trim())}`;
      }
      if (categoryId > 0) {
        url += `&categoryId=${categoryId}`;
      }

      const res = await fetch(url);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setRecipes(data.data);
        setIsSystemReady(true);
      } else {
        setRecipes([]);
      }
    } catch (err) {
      console.error('Lỗi khi tải món ăn:', err);
      setIsSystemReady(false);
    } finally {
      setLoadingRecipes(false);
    }
  }, []);

  // Khởi chạy khi load trang
  useEffect(() => {
    fetchCategories();
    fetchIngredients();
    fetchRecipes();
  }, [fetchCategories, fetchIngredients, fetchRecipes]);

  // Tìm kiếm theo từ khóa Header hoặc đổi Category
  useEffect(() => {
    if (!isSuggestMode) {
      const timer = setTimeout(() => {
        fetchRecipes(headerSearchKeyword, selectedCategoryId);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [headerSearchKeyword, selectedCategoryId, isSuggestMode, fetchRecipes]);

  /**
   * ==================================================================================================
   * CÁCH THỨC NHẬP NGUYÊN LIỆU:
   * 1. Người dùng gõ text bất kỳ (vd: "thịt ba rọi", "cá quả", "dưa chuột", "trứng"...)
   * 2. Nhấn Enter -> Thẻ Tag rơi xuống ngay lập tức (giữ nguyên chữ người dùng gõ).
   * 3. Khi bấm [🍳 GỢI Ý MÓN NGAY]: Hệ thống mới tiến hành so sánh toàn bộ từ đồng nghĩa và hiển thị món ăn.
   * ==================================================================================================
   */

  // Thêm thẻ tag khi nhấn Enter hoặc bấm nút Thêm
  const handleAddTagOnEnter = (rawText: string) => {
    const trimmed = rawText.trim();
    if (!trimmed) return;

    // Kiểm tra xem đã có trong thẻ chưa (so sánh không phân biệt hoa thường)
    if (fridgeTags.some(t => t.toLowerCase() === trimmed.toLowerCase())) {
      setIngredientInput('');
      return;
    }

    setFridgeTags(prev => [...prev, trimmed]);
    setIngredientInput('');
  };

  // Xóa 1 thẻ tag
  const handleRemoveTag = (tagToRemove: string) => {
    const nextTags = fridgeTags.filter(t => t !== tagToRemove);
    setFridgeTags(nextTags);
    if (isSuggestMode) {
      if (nextTags.length > 0) {
        handleTriggerSuggestWithTags(nextTags);
      } else {
        setIsSuggestMode(false);
        fetchRecipes(headerSearchKeyword, selectedCategoryId);
      }
    }
  };

  // Xóa toàn bộ thẻ
  const handleClearAllTags = () => {
    setFridgeTags([]);
    setIsSuggestMode(false);
    fetchRecipes(headerSearchKeyword, selectedCategoryId);
  };

  /**
   * ==================================================================================================
   * SO SÁNH TỪ ĐỒNG NGHĨA & QUÉT GỢI Ý MÓN ĂN KHI BẤM NÚT [🍳 GỢI Ý MÓN NGAY]
   * ==================================================================================================
   */
  const handleTriggerSuggestWithTags = async (tags: string[]) => {
    if (tags.length === 0) {
      setSynonymMatchReport('⚠️ Bạn chưa nhập nguyên liệu nào. Hãy nhập vào ô trên và nhấn Enter!');
      return;
    }

    setLoadingRecipes(true);
    setIsSuggestMode(true);

    try {
      // 1. Gọi API Backend (Stored Procedure sẽ tự động tách chuỗi & so sánh từ đồng nghĩa)
      const paramStr = tags.join(',');
      const res = await fetch(`${API_BASE}/recipes/suggest?ingredients=${encodeURIComponent(paramStr)}&pageSize=30`);
      const resData = await res.json();

      let matchedList: RecipeItem[] = [];
      if (resData.success && Array.isArray(resData.data) && resData.data.length > 0) {
        matchedList = resData.data;
      } else {
        // Fallback lấy toàn bộ món để tiến hành so khớp từ đồng nghĩa ở frontend
        const allRes = await fetch(`${API_BASE}/recipes?page=1&pageSize=50`);
        const allData = await allRes.json();
        matchedList = allData.success && Array.isArray(allData.data) ? allData.data : [];
      }

      // 2. Phân tích chi tiết các từ đồng nghĩa đã được so khớp
      let detectedSynonymsList: string[] = [];

      const processed = matchedList.map(recipe => {
        const recipeTitleLower = recipe.TenMonAn.toLowerCase();
        const details: Array<{ recipeIngredient: string; matchedUserTag: string; isSynonym: boolean }> = [];

        tags.forEach(userTag => {
          const userTagLower = userTag.toLowerCase().trim();

          // Kiểm tra xem userTag có khớp trực tiếp hoặc qua từ điển từ đồng nghĩa không
          Object.entries(SYNONYM_DICTIONARY).forEach(([standardName, synList]) => {
            const isUserTagSynonym = userTagLower === standardName || synList.some(s => s.toLowerCase() === userTagLower || userTagLower.includes(s.toLowerCase()));

            if (isUserTagSynonym) {
              // Nếu tên món hoặc nguyên liệu món ăn chứa tên chuẩn hoặc từ đồng nghĩa
              if (recipeTitleLower.includes(standardName) || synList.some(s => recipeTitleLower.includes(s.toLowerCase()))) {
                const isSyn = userTagLower !== standardName;
                details.push({
                  recipeIngredient: standardName.charAt(0).toUpperCase() + standardName.slice(1),
                  matchedUserTag: userTag,
                  isSynonym: isSyn
                });
                if (isSyn) {
                  detectedSynonymsList.push(`"${userTag}" ➔ ${standardName.charAt(0).toUpperCase() + standardName.slice(1)}`);
                }
              }
            }
          });
        });

        // Tính % khớp nếu chưa có từ backend
        const matchedCount = recipe.SoNLTrungKhop || (details.length > 0 ? details.length : 1);
        const totalCount = recipe.TongSoNguyenLieu || 2;
        const percentage = recipe.PhanTramKhop !== undefined ? recipe.PhanTramKhop : Math.min(100, Math.round((matchedCount / totalCount) * 100));

        return {
          ...recipe,
          PhanTramKhop: percentage,
          SoNLTrungKhop: matchedCount,
          TongSoNguyenLieu: totalCount,
          matchedIngredientsDetails: details
        };
      });

      // Sắp xếp món có % khớp cao nhất lên đầu
      processed.sort((a, b) => (b.PhanTramKhop || 0) - (a.PhanTramKhop || 0));
      setRecipes(processed);

      // Phát thông báo Toast nếu có nhận diện từ đồng nghĩa
      if (detectedSynonymsList.length > 0) {
        const uniqueSynonyms = Array.from(new Set(detectedSynonymsList));
        setSynonymMatchReport(`✨ Đã so khớp từ đồng nghĩa của nguyên liệu: ${uniqueSynonyms.join(' | ')}`);
      } else {
        setSynonymMatchReport(`🍳 Đã tìm thấy ${processed.length} món ăn phù hợp với nguyên liệu của bạn!`);
      }

      // Cuộn mượt xuống khu vực hiển thị danh sách món ăn
      const resultsArea = document.getElementById('recipe-results-area');
      if (resultsArea) {
        resultsArea.scrollIntoView({ behavior: 'smooth' });
      }

    } catch (err) {
      console.error('Lỗi gợi ý món ăn:', err);
    } finally {
      setLoadingRecipes(false);
    }
  };

  /**
   * ==================================================================================================
   * XEM CHI TIẾT MÓN ĂN (Xem công thức)
   * ==================================================================================================
   */
  const handleOpenDetailModal = async (recipe: RecipeItem) => {
    setSelectedRecipeDetail(recipe);
    setLoadingDetail(true);
    try {
      const res = await fetch(`${API_BASE}/recipes/${recipe.MaMonAn}`);
      const data = await res.json();
      if (data.success && data.data) {
        setSelectedRecipeDetail(data.data);
      }
    } catch (err) {
      console.warn('Lỗi tải chi tiết món ăn:', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  /**
   * ==================================================================================================
   * LƯU / THẢ TIM MÓN ĂN
   * ==================================================================================================
   */
  const handleToggleFavorite = (recipeId: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSavedRecipeIds(prev => {
      const isSaved = prev.includes(recipeId);
      return isSaved ? prev.filter(id => id !== recipeId) : [...prev, recipeId];
    });

    setRecipes(prev =>
      prev.map(r => {
        if (r.MaMonAn === recipeId) {
          const isCurrentlySaved = savedRecipeIds.includes(recipeId);
          const currentCount = r.SoLuotLuu || 0;
          return {
            ...r,
            SoLuotLuu: isCurrentlySaved ? Math.max(0, currentCount - 1) : currentCount + 1,
            DaLuu: !isCurrentlySaved
          };
        }
        return r;
      })
    );
  };

  // Top 5 Món Hot nhất
  const topHotRecipes = useMemo(() => {
    return [...recipes].sort((a, b) => (b.SoLuotLuu || 0) - (a.SoLuotLuu || 0)).slice(0, 5);
  }, [recipes]);

  // Danh sách món đã lưu
  const savedRecipesList = useMemo(() => {
    return recipes.filter(r => savedRecipeIds.includes(r.MaMonAn) || r.DaLuu === 1 || r.DaLuu === true);
  }, [recipes, savedRecipeIds]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col selection:bg-orange-500 selection:text-white">
      <Head>
        <title>WhatToCook - Gợi Ý Món Ăn Từ Tủ Lạnh Nhà Bạn</title>
        <meta name="description" content="Hệ thống gợi ý món ăn thông minh dựa trên nguyên liệu sẵn có trong tủ lạnh." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* ============================================================================================== */}
      {/* 1. THANH TRÊN CÙNG (HEADER / NAVBAR) - THOÁNG ĐÃNG, RỘNG RÃI */}
      {/* ============================================================================================== */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs h-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between gap-4">
          
          {/* Logo WhatToCook */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform duration-200">
              <ChefHat className="w-6 h-6 group-hover:rotate-12 transition-transform duration-200" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black tracking-tight text-slate-900">
                What<span className="text-orange-500">To</span><span className="text-emerald-600">Cook</span>
              </span>
            </div>
          </Link>

          {/* Ô Tìm Kiếm Tên Món Ăn Nằm Ở Giữa Header */}
          <div className="flex-1 max-w-2xl px-2 sm:px-6">
            <div className="relative group">
              <input
                type="text"
                value={headerSearchKeyword}
                onChange={e => {
                  setHeaderSearchKeyword(e.target.value);
                  if (isSuggestMode) setIsSuggestMode(false);
                }}
                placeholder="🔍 Tìm kiếm món ăn ngon... (Vd: Thịt kho tàu, Canh chua, Rau muống xào...)"
                className="w-full pl-12 pr-10 py-3 bg-slate-100/90 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-orange-500 rounded-full text-sm text-slate-800 placeholder-slate-400 outline-none transition-all duration-200 shadow-inner group-focus-within:ring-4 group-focus-within:ring-orange-500/15"
              />
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-orange-500 transition-colors" />
              {headerSearchKeyword && (
                <button
                  onClick={() => setHeaderSearchKeyword('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full cursor-pointer"
                  title="Xóa tìm kiếm"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Icon Yêu Thích ❤️ & Đăng Nhập / Profile */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setIsSavedDrawerOpen(true)}
              className="relative p-2.5 rounded-full hover:bg-orange-50 text-slate-600 hover:text-rose-600 transition-colors group cursor-pointer"
              title="Danh sách món ăn đã lưu"
            >
              <Heart className={`w-6 h-6 transition-transform group-hover:scale-110 ${savedRecipesList.length > 0 ? 'text-rose-500 fill-rose-500' : ''}`} />
              {savedRecipesList.length > 0 && (
                <span className="absolute top-1 right-1 w-5 h-5 bg-rose-500 text-white text-[11px] font-bold rounded-full flex items-center justify-center shadow-xs">
                  {savedRecipesList.length}
                </span>
              )}
            </button>

            {currentUser ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-orange-500/30"
                />
                <div className="hidden md:flex flex-col text-left">
                  <span className="text-xs font-bold text-slate-800 line-clamp-1">{currentUser.name}</span>
                  <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Đã đăng nhập
                  </span>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-sm font-semibold rounded-full shadow-md shadow-orange-500/25 transition-all cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Đăng nhập</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ============================================================================================== */}
      {/* 2. THANH ĐIỀU HƯỚNG BÊN TRÁI (LEFT SIDEBAR) - HIỆN ICON, HOVER VÀO MỞ RỘNG */}
      {/* ============================================================================================== */}
      <aside className="fixed left-0 top-20 bottom-0 z-30 w-16 hover:w-60 bg-white/95 backdrop-blur-md border-r border-slate-200 shadow-lg hover:shadow-2xl transition-all duration-300 group overflow-hidden flex flex-col justify-between py-6">
        
        <div className="flex flex-col gap-2 px-2.5">
          <Link
            href="/"
            className="flex items-center gap-4 px-3 py-3 rounded-2xl text-orange-600 bg-orange-50 hover:bg-orange-100 transition-colors font-bold text-sm"
            title="Trang Chủ"
          >
            <Home className="w-5 h-5 shrink-0 text-orange-600" />
            <span className="opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity duration-300 font-semibold">
              Trang Chủ
            </span>
          </Link>

          <a
            href="#categories-section"
            className="flex items-center gap-4 px-3 py-3 rounded-2xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors font-medium text-sm"
            title="Danh Mục Món Ăn"
          >
            <Layers className="w-5 h-5 shrink-0 text-slate-500 group-hover:text-orange-500" />
            <span className="opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity duration-300">
              Danh Mục Món
            </span>
          </a>

          <a
            href="#hot-ranking-section"
            className="flex items-center gap-4 px-3 py-3 rounded-2xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors font-medium text-sm"
            title="Món Hot Tuần"
          >
            <Flame className="w-5 h-5 shrink-0 text-orange-500" />
            <span className="opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity duration-300">
              Món Hot Tuần
            </span>
          </a>

          <button
            onClick={() => setIsSavedDrawerOpen(true)}
            className="flex items-center gap-4 px-3 py-3 rounded-2xl text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors font-medium text-sm text-left cursor-pointer"
            title="Món Đã Lưu"
          >
            <Heart className="w-5 h-5 shrink-0 text-rose-500" />
            <span className="opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity duration-300">
              Món Đã Lưu ({savedRecipesList.length})
            </span>
          </button>
        </div>

        <div className="flex flex-col gap-2 px-2.5 border-t border-slate-100 pt-4">
          <Link
            href="/Dashboard"
            className="flex items-center gap-4 px-3 py-3 rounded-2xl text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors font-bold text-sm"
            title="Quản Trị Hệ Thống"
          >
            <ShieldCheck className="w-5 h-5 shrink-0 text-emerald-600" />
            <span className="opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity duration-300">
              Quản Trị (Admin)
            </span>
          </Link>
        </div>
      </aside>

      {/* TOAST THÔNG BÁO SO SÁNH TỪ ĐỒNG NGHĨA */}
      {synonymMatchReport && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md bg-slate-900 text-white px-4 py-3.5 rounded-2xl shadow-2xl border border-amber-500/40 flex items-start gap-3 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs leading-relaxed font-medium">{synonymMatchReport}</div>
          <button onClick={() => setSynonymMatchReport(null)} className="text-slate-400 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ============================================================================================== */}
      {/* KHU VỰC NỘI DUNG CHÍNH (ĐẨY LÙI 64PX NHƯỜNG CHỖ CHO LEFT SIDEBAR) */}
      {/* ============================================================================================== */}
      <div className="pl-16 flex-1 flex flex-col">
        
        {/* ============================================================================================ */}
        {/* HERO SECTION: KHUNG NHẬP NGUYÊN LIỆU TỦ LẠNH & GỢI Ý MÓN ĂN */}
        {/* ============================================================================================ */}
        <section className="relative overflow-hidden bg-gradient-to-b from-orange-50/70 via-amber-50/30 to-slate-50 pt-10 pb-14 border-b border-orange-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              
              {/* CỘT TRÁI: Ô NHẬP NGUYÊN LIỆU (TAG INPUT KHI NHẤN ENTER) */}
              <div className="lg:col-span-7 flex flex-col gap-6">
                
                {/* Headline */}
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 leading-tight">
                  Hôm nay tủ lạnh nhà bạn <br />
                  <span className="bg-gradient-to-r from-orange-600 via-amber-600 to-emerald-600 bg-clip-text text-transparent">
                    có những nguyên liệu gì?
                  </span>
                </h1>

                {/* HỘP NHẬP NGUYÊN LIỆU (TAG INPUT CHUYÊN NGHIỆP) */}
                <div className="bg-white p-5 sm:p-6 rounded-3xl shadow-xl shadow-orange-950/5 border border-orange-200/60 relative">
                  
                  {/* Tiêu đề hộp */}
                  <div className="flex items-center justify-between mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <span className="flex items-center gap-1.5 text-orange-600">
                      <Carrot className="w-4 h-4 text-orange-500" />
                      <span>Nguyên Liệu Trong Tủ Lạnh ({fridgeTags.length} mục)</span>
                    </span>
                    {fridgeTags.length > 0 && (
                      <button
                        onClick={handleClearAllTags}
                        className="text-slate-400 hover:text-rose-500 text-xs font-semibold lowercase flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                        Làm mới
                      </button>
                    )}
                  </div>

                  {/* KHUNG NHẬP LIỆU: GÕ TEXT & NHẤN ENTER THÌ HIỂN THỊ THẺ TAG XUỐNG DƯỚI */}
                  <div className="min-h-[58px] p-2.5 bg-slate-50 rounded-2xl border border-slate-200/80 mb-4 flex flex-wrap items-center gap-2 focus-within:border-orange-500 focus-within:bg-white transition-all shadow-inner">
                    
                    {/* Thẻ tag xuất hiện sau khi người dùng nhấn Enter */}
                    {fridgeTags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold rounded-full shadow-xs shadow-orange-500/20 animate-in fade-in zoom-in-95 duration-150"
                      >
                        <span>{tag}</span>
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="w-4 h-4 rounded-full bg-white/20 hover:bg-white text-white hover:text-orange-600 flex items-center justify-center transition-colors cursor-pointer"
                          title={`Bỏ ${tag}`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}

                    {/* Ô Input gõ nguyên liệu */}
                    <div className="flex-1 min-w-[220px] flex items-center gap-1">
                      <input
                        type="text"
                        value={ingredientInput}
                        onChange={e => setIngredientInput(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddTagOnEnter(ingredientInput);
                          }
                        }}
                        placeholder={fridgeTags.length === 0 ? "Nhập nguyên liệu rồi nhấn Enter (Vd: thịt ba rọi, cá quả, dưa chuột...)" : "Nhập tiếp nguyên liệu khác rồi nhấn Enter..."}
                        className="w-full bg-transparent px-2 py-1 text-sm text-slate-800 placeholder-slate-400 outline-none font-medium"
                      />
                      {ingredientInput.trim() && (
                        <button
                          onClick={() => handleAddTagOnEnter(ingredientInput)}
                          className="px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shrink-0"
                        >
                          Thêm
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Gợi ý chọn nhanh nguyên liệu */}
                  <div className="space-y-2 mb-6">
                    <div className="text-xs font-semibold text-slate-500">✨ Gợi ý nguyên liệu phổ biến:</div>
                    <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto pr-1">
                      {['Thịt ba chỉ', 'Thịt bò', 'Cá lóc', 'Trứng gà', 'Cà chua', 'Đậu hũ', 'Rau muống', 'Dưa leo', 'Hành lá', 'Khoai tây'].map((item, index) => {
                        const isSelected = fridgeTags.some(t => t.toLowerCase() === item.toLowerCase());
                        return (
                          <button
                            key={index}
                            onClick={() => {
                              if (isSelected) {
                                handleRemoveTag(item);
                              } else {
                                handleAddTagOnEnter(item);
                              }
                            }}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-orange-500 text-white shadow-xs'
                                : 'bg-slate-100 hover:bg-orange-100/60 text-slate-700 hover:text-orange-700 border border-slate-200/80'
                            }`}
                          >
                            {isSelected ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                            <span>{item}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* NÚT BẤM CHÍNH: [🍳 GỢI Ý MÓN NGAY] (So sánh từ đồng nghĩa & quét món ăn) */}
                  <button
                    onClick={() => handleTriggerSuggestWithTags(fridgeTags)}
                    className="w-full py-4 bg-gradient-to-r from-orange-500 via-amber-500 to-emerald-600 hover:from-orange-600 hover:via-amber-600 hover:to-emerald-700 text-white text-base sm:text-lg font-black rounded-2xl shadow-xl shadow-orange-500/30 flex items-center justify-center gap-3 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                  >
                    <ChefHat className="w-6 h-6 animate-pulse" />
                    <span>🍳 GỢI Ý MÓN NGAY (SO KHỚP TỪ ĐỒNG NGHĨA & NGUYÊN LIỆU)</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* CỘT PHẢI: BANNER HÌNH ẢNH MINH HỌA */}
              <div className="lg:col-span-5 relative">
                <div className="relative mx-auto max-w-md lg:max-w-none">
                  
                  <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-slate-900 aspect-4/3 sm:aspect-square">
                    <img
                      src="https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1000&q=80"
                      alt="Tủ lạnh thông minh WhatToCook"
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent"></div>

                    <div className="absolute bottom-5 left-5 right-5 text-white">
                      <span className="inline-block px-2.5 py-1 bg-emerald-500/90 backdrop-blur-md rounded-lg text-[11px] font-bold uppercase tracking-wider mb-1.5">
                        Smart Kitchen Suggestion
                      </span>
                      <h3 className="text-xl font-bold leading-snug">
                        Đừng vội đi chợ khi tủ lạnh nhà bạn vẫn còn nguyên liệu!
                      </h3>
                    </div>
                  </div>

                  {/* Floating Card: Công thức sẵn có */}
                  <div className="absolute -top-4 -right-4 sm:-top-5 sm:-right-5 bg-white/95 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl shadow-xl border border-orange-100 flex items-center gap-3 animate-bounce duration-1000">
                    <div className="w-11 h-11 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-lg font-black text-slate-900 leading-none">
                        1,000+ Món
                      </div>
                      <div className="text-xs font-semibold text-slate-500 mt-1">Công thức chuẩn vị</div>
                    </div>
                  </div>

                  {/* Floating Card: Trạng thái hệ thống */}
                  <div className="absolute -bottom-5 -left-4 sm:-bottom-6 sm:-left-6 bg-white/95 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl shadow-xl border border-emerald-100 flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-emerald-700 uppercase tracking-wide">
                        Gợi Ý Thông Minh
                      </div>
                      <div className="text-sm font-black text-slate-900">Tự động nhận diện từ đồng nghĩa</div>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ============================================================================================ */}
        {/* DANH MỤC MÓN ĂN */}
        {/* ============================================================================================ */}
        <section id="categories-section" className="py-5 bg-white border-b border-slate-200/80 sticky top-20 z-20 shadow-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none scroll-smooth">
              
              <button
                onClick={() => {
                  setSelectedCategoryId(0);
                  setIsSuggestMode(false);
                }}
                className={`shrink-0 px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all duration-200 cursor-pointer ${
                  selectedCategoryId === 0 && !isSuggestMode
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/25 scale-105'
                    : 'bg-slate-100 hover:bg-orange-50 text-slate-700 hover:text-orange-600 border border-slate-200/70'
                }`}
              >
                <span>🍽️ Tất cả món</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-600">
                  {recipes.length}
                </span>
              </button>

              {categories.map(cat => {
                const isActive = selectedCategoryId === cat.MaDanhMuc && !isSuggestMode;
                return (
                  <button
                    key={cat.MaDanhMuc}
                    onClick={() => {
                      setSelectedCategoryId(cat.MaDanhMuc);
                      setIsSuggestMode(false);
                    }}
                    className={`shrink-0 px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all duration-200 cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/25 scale-105'
                        : 'bg-slate-100 hover:bg-orange-50 text-slate-700 hover:text-orange-600 border border-slate-200/70'
                    }`}
                  >
                    <span>🍲 {cat.TenDanhMuc}</span>
                    {cat.SoLuongMonAn !== undefined && (
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-white/30 text-white' : 'bg-slate-200 text-slate-600'}`}>
                        {cat.SoLuongMonAn}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* ============================================================================================ */}
        {/* DANH SÁCH MÓN ĂN & TOP HOT (BỐ CỤC 80 / 20) */}
        {/* ============================================================================================ */}
        <section id="recipe-results-area" className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-1 w-full">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  {isSuggestMode ? (
                    <span className="flex items-center gap-2 text-orange-600">
                      <Sparkles className="w-6 h-6 text-orange-500 animate-spin" />
                      Kết Quả Gợi Ý Phù Hợp Tủ Lạnh Nhà Bạn
                    </span>
                  ) : headerSearchKeyword ? (
                    <span>Kết quả tìm kiếm cho: "{headerSearchKeyword}"</span>
                  ) : (
                    <span>Danh Sách Món Ăn Phổ Biến</span>
                  )}
                </h2>
                <span className="px-2.5 py-0.5 text-xs font-bold bg-orange-100 text-orange-700 rounded-full">
                  {recipes.length} món
                </span>
              </div>

              {isSuggestMode && (
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Đã so khớp theo {fridgeTags.length} nguyên liệu: <strong>{fridgeTags.join(', ')}</strong>. Các món ăn có độ tương thích cao nhất được đưa lên đầu!
                </p>
              )}
            </div>

            {(headerSearchKeyword || selectedCategoryId > 0 || isSuggestMode) && (
              <button
                onClick={() => {
                  setHeaderSearchKeyword('');
                  setSelectedCategoryId(0);
                  setIsSuggestMode(false);
                  fetchRecipes('', 0);
                }}
                className="text-xs font-semibold text-slate-500 hover:text-orange-600 flex items-center gap-1.5 self-start sm:self-auto px-3 py-1.5 rounded-lg border border-slate-200 hover:border-orange-300 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Xem tất cả món
              </button>
            )}
          </div>

          {/* LƯỚI BỐ CỤC 80 / 20 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* CỘT LỚN 80%: LƯỚI CARD MÓN ĂN */}
            <div className="lg:col-span-8 xl:col-span-9 space-y-6">
              
              {loadingRecipes ? (
                <div className="py-20 text-center text-slate-400 space-y-3 bg-white rounded-3xl border border-slate-200">
                  <Loader2 className="w-10 h-10 animate-spin text-orange-500 mx-auto" />
                  <p className="text-sm font-semibold">Đang so khớp dữ liệu món ăn...</p>
                </div>
              ) : recipes.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-300">
                  <ChefHat className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-slate-700 mb-2">Không tìm thấy món ăn phù hợp</h3>
                  <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
                    Hãy thử nhập thêm nguyên liệu khác hoặc quay về danh mục tất cả món.
                  </p>
                  <button
                    onClick={() => {
                      setHeaderSearchKeyword('');
                      setSelectedCategoryId(0);
                      setIsSuggestMode(false);
                      fetchRecipes('', 0);
                    }}
                    className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-xl shadow-md transition-colors cursor-pointer"
                  >
                    Xem toàn bộ món ăn
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {recipes.map(recipe => (
                    <div
                      key={recipe.MaMonAn}
                      className="bg-white rounded-3xl overflow-hidden border border-slate-200 hover:border-orange-300 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col group"
                    >
                      {/* Ảnh món ăn + Nút Thả Tim ❤️ */}
                      <div className="relative aspect-16/10 overflow-hidden bg-slate-100">
                        <img
                          src={recipe.DuongDanAnhChinh || FALLBACK_FOOD_IMG}
                          alt={recipe.TenMonAn}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = FALLBACK_FOOD_IMG;
                          }}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent"></div>

                        {/* Nút Thả Tim ❤️ */}
                        <button
                          onClick={(e) => handleToggleFavorite(recipe.MaMonAn, e)}
                          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-slate-600 hover:text-rose-500 hover:scale-110 active:scale-95 transition-all shadow-md cursor-pointer"
                          title="Lưu món ăn yêu thích"
                        >
                          <Heart
                            className={`w-5 h-5 transition-colors ${
                              savedRecipeIds.includes(recipe.MaMonAn) || recipe.DaLuu
                                ? 'text-rose-500 fill-rose-500'
                                : ''
                            }`}
                          />
                        </button>

                        {/* Badge Danh mục */}
                        {recipe.TenDanhMuc && (
                          <span className="absolute top-3 left-3 px-2.5 py-1 bg-white/90 backdrop-blur-md rounded-lg text-[11px] font-bold text-slate-800 shadow-xs">
                            {recipe.TenDanhMuc}
                          </span>
                        )}

                        {/* Badge % Khớp khi gợi ý */}
                        {recipe.PhanTramKhop !== undefined && (
                          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs font-bold">
                            <span className={`px-2.5 py-1 rounded-lg backdrop-blur-md shadow-xs flex items-center gap-1 ${
                              recipe.PhanTramKhop >= 70
                                ? 'bg-emerald-600/95 text-white'
                                : recipe.PhanTramKhop >= 40
                                ? 'bg-amber-600/95 text-white'
                                : 'bg-slate-700/90 text-slate-200'
                            }`}>
                              <Flame className="w-3.5 h-3.5" />
                              Khớp {recipe.PhanTramKhop}% nguyên liệu
                            </span>
                            <span className="text-[11px] font-medium text-slate-200">
                              {recipe.SoNLTrungKhop}/{recipe.TongSoNguyenLieu} có sẵn
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Thông tin Card */}
                      <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                        <div className="space-y-2">
                          <h3 className="text-base sm:text-lg font-black text-slate-900 group-hover:text-orange-600 transition-colors line-clamp-1">
                            {recipe.TenMonAn}
                          </h3>
                          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                            {recipe.CauChuyen || 'Món ăn gia đình thơm ngon, đậm đà hương vị truyền thống.'}
                          </p>

                          {/* Hiển thị chi tiết từ đồng nghĩa đã khớp nếu có */}
                          {recipe.matchedIngredientsDetails && recipe.matchedIngredientsDetails.length > 0 && (
                            <div className="pt-1">
                              {recipe.matchedIngredientsDetails.map((det, i) => (
                                <div key={i} className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                                  <span>
                                    Khớp: <strong>{det.recipeIngredient}</strong> {det.isSynonym ? `(từ '${det.matchedUserTag}')` : ''}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Thông số: ⏱️ Thời gian, 👥 Khẩu phần, ❤️ Lượt lưu */}
                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-semibold">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4 text-orange-500" />
                            <span>{recipe.ThoiGianNau || 30}p</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4 text-emerald-600" />
                            <span>{recipe.KhauPhan || 4} người</span>
                          </div>
                          <div className="flex items-center gap-1 text-rose-500">
                            <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                            <span>{recipe.SoLuotLuu || 0}</span>
                          </div>
                        </div>

                        {/* Nút Xem Công Thức Chi Tiết */}
                        <button
                          onClick={() => handleOpenDetailModal(recipe)}
                          className="w-full py-2.5 bg-orange-50 hover:bg-orange-500 text-orange-700 hover:text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer"
                        >
                          <BookOpen className="w-4 h-4" />
                          <span>Xem công thức chi tiết</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* CỘT NHỎ 20%: TOP MÓN HOT */}
            <div id="hot-ranking-section" className="lg:col-span-4 xl:col-span-3 space-y-6">
              
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-orange-200/80 shadow-lg shadow-orange-950/5 relative overflow-hidden">
                
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-xs">
                      <Flame className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-tight text-slate-900">Top Món Hot</h3>
                      <p className="text-[11px] font-medium text-slate-400">Được yêu thích nhất</p>
                    </div>
                  </div>
                  <TrendingUp className="w-4 h-4 text-orange-500" />
                </div>

                <div className="space-y-3.5">
                  {topHotRecipes.length > 0 ? (
                    topHotRecipes.map((item, idx) => {
                      const rank = idx + 1;
                      return (
                        <div
                          key={item.MaMonAn}
                          onClick={() => handleOpenDetailModal(item)}
                          className="flex items-center gap-3 p-2 rounded-2xl hover:bg-orange-50/70 transition-colors cursor-pointer group"
                        >
                          <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                            rank === 1
                              ? 'bg-amber-400 text-slate-900 shadow-sm'
                              : rank === 2
                              ? 'bg-slate-300 text-slate-800'
                              : rank === 3
                              ? 'bg-amber-700/20 text-amber-900'
                              : 'bg-slate-100 text-slate-500'
                          }`}>
                            {rank}
                          </div>

                          <img
                            src={item.DuongDanAnhChinh || FALLBACK_FOOD_IMG}
                            alt={item.TenMonAn}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = FALLBACK_FOOD_IMG;
                            }}
                            className="w-12 h-12 rounded-xl object-cover shrink-0 ring-1 ring-slate-200 group-hover:scale-105 transition-transform"
                          />

                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-bold text-slate-800 group-hover:text-orange-600 truncate">
                              {item.TenMonAn}
                            </h4>
                            <div className="flex items-center justify-between text-[11px] text-slate-400 mt-0.5">
                              <span>{item.TenDanhMuc || 'Món ngon'}</span>
                              <span className="flex items-center gap-1 font-semibold text-rose-500">
                                <Heart className="w-3 h-3 fill-rose-500" />
                                {item.SoLuotLuu || 0}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-xs text-slate-400 italic text-center py-4">Chưa có dữ liệu món hot</div>
                  )}
                </div>

                <div className="mt-5 p-3.5 bg-orange-50/70 rounded-2xl border border-orange-100 text-[11px] text-orange-950 leading-relaxed">
                  <div className="font-bold flex items-center gap-1.5 text-orange-800 mb-1">
                    <Info className="w-3.5 h-3.5 text-orange-600" />
                    Thống kê thực tế:
                  </div>
                  Danh sách được sắp xếp tự động dựa trên số lượt lưu yêu thích từ cộng đồng nấu ăn.
                </div>

              </div>

              {/* Banner Admin Dashboard */}
              <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
                <ShieldCheck className="w-16 h-16 text-white/10 absolute -right-2 -bottom-2" />
                <div className="relative z-10 space-y-3">
                  <span className="px-2 py-0.5 bg-white/20 backdrop-blur-md rounded-md text-[10px] font-bold uppercase tracking-wider">
                    Quản Trị Hệ Thống
                  </span>
                  <h4 className="text-base font-bold leading-snug">
                    Admin Dashboard & Quản Lý Món Ăn
                  </h4>
                  <p className="text-xs text-emerald-100 leading-relaxed">
                    Trang quản trị: thêm sửa xóa công thức, danh mục, từ điển nguyên liệu và crawler Cookpad.
                  </p>
                  <Link
                    href="/Dashboard"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white text-emerald-800 hover:bg-emerald-50 text-xs font-bold rounded-xl transition-all shadow-md"
                  >
                    <span>Mở Admin Dashboard</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* ============================================================================================ */}
        {/* FOOTER (CHÂN TRANG) */}
        {/* ============================================================================================ */}
        <footer className="bg-slate-900 text-slate-400 text-xs pt-12 pb-8 border-t border-slate-800 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-800">
              
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white">
                    <ChefHat className="w-4 h-4" />
                  </div>
                  <span className="text-lg font-black text-white">What<span className="text-orange-500">To</span><span className="text-emerald-400">Cook</span></span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Hệ thống thông minh gợi ý món ăn gia đình dựa trên nguyên liệu sẵn có trong tủ lạnh.
                </p>
                <span className="inline-block px-2 py-1 bg-slate-800 text-emerald-400 rounded text-[10px] font-mono">
                  Nền tảng công thức ẩm thực thông minh
                </span>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">Đề Tài Tốt Nghiệp</h4>
                <ul className="space-y-1.5">
                  <li><span className="text-slate-300 font-semibold">Trường:</span> Đại học Lạc Hồng (LHU)</li>
                  <li><span className="text-slate-300 font-semibold">Khoa:</span> Công Nghệ Thông Tin</li>
                  <li><span className="text-slate-300 font-semibold">Đề tài:</span> Web Gợi Ý Món Ăn (WhatToCook)</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">Công Nghệ Xây Dựng</h4>
                <ul className="space-y-1.5">
                  <li>• Next.js / React.js / Tailwind CSS</li>
                  <li>• Node.js & Express.js RESTful API</li>
                  <li>• Thuật Toán So Khớp & Từ Đồng Nghĩa</li>
                  <li>• JSON Web Token (JWT) Security</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">Liên Kết Nhanh</h4>
                <ul className="space-y-1.5">
                  <li>
                    <Link href="/Dashboard" className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Trang Quản Trị Hệ Thống (Dashboard)
                    </Link>
                  </li>
                  <li><a href="#categories-section" className="hover:text-white transition-colors">Danh mục món ăn</a></li>
                  <li><a href="#hot-ranking-section" className="hover:text-white transition-colors">Bảng xếp hạng món hot</a></li>
                </ul>
              </div>

            </div>

            <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500 text-[11px]">
              <div>© 2026 WhatToCook. Đồ án tốt nghiệp Đại học Lạc Hồng. All rights reserved.</div>
              <div className="flex items-center gap-4">
                <span>Thuật Toán So Khớp Thông Minh</span>
                <span>•</span>
                <span>Cloudinary CDN</span>
                <span>•</span>
                <span>JWT Authentication</span>
              </div>
            </div>
          </div>
        </footer>

      </div>

      {/* ============================================================================================== */}
      {/* MODAL CHI TIẾT CÔNG THỨC MÓN ĂN */}
      {/* ============================================================================================== */}
      {selectedRecipeDetail && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-200">
            
            <div className="relative h-64 sm:h-72 w-full bg-slate-900">
              <img
                src={selectedRecipeDetail.DuongDanAnhChinh || FALLBACK_FOOD_IMG}
                alt={selectedRecipeDetail.TenMonAn}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = FALLBACK_FOOD_IMG;
                }}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent"></div>

              <button
                onClick={() => setSelectedRecipeDetail(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="absolute bottom-5 left-6 right-6 text-white space-y-2">
                {selectedRecipeDetail.TenDanhMuc && (
                  <span className="px-2.5 py-1 bg-orange-500 rounded-lg text-xs font-bold">
                    {selectedRecipeDetail.TenDanhMuc}
                  </span>
                )}
                <h2 className="text-xl sm:text-2xl font-black">{selectedRecipeDetail.TenMonAn}</h2>
                <div className="flex items-center gap-4 text-xs text-slate-300 font-semibold">
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-orange-400" /> {selectedRecipeDetail.ThoiGianNau || 30} phút</span>
                  <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5 text-emerald-400" /> {selectedRecipeDetail.KhauPhan || 4} người</span>
                  <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" /> {selectedRecipeDetail.SoLuotLuu || 0} lượt lưu</span>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              <div className="p-4 bg-orange-50/60 rounded-2xl border border-orange-100 text-xs sm:text-sm text-slate-700 leading-relaxed italic">
                "{selectedRecipeDetail.CauChuyen || 'Món ăn gia đình bổ dưỡng, dễ nấu tại nhà.'}"
              </div>

              <div>
                <h4 className="text-sm font-black uppercase tracking-wider text-slate-800 mb-3 flex items-center gap-2">
                  <Carrot className="w-4 h-4 text-orange-500" />
                  Nguyên Liệu Cần Chuẩn Bị
                </h4>
                {selectedRecipeDetail.nguyenLieu && selectedRecipeDetail.nguyenLieu.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {selectedRecipeDetail.nguyenLieu.map((ing, i) => (
                      <div key={i} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl text-xs border border-slate-200/80">
                        <span className="font-semibold text-slate-800 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                          {ing.TenNguyenLieu}
                        </span>
                        <span className="text-slate-500 font-medium">{ing.DinhLuong || 'Tùy khẩu vị'}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-500">
                    Nguyên liệu cơ bản theo công thức chuẩn.
                  </div>
                )}
              </div>

              <div>
                <h4 className="text-sm font-black uppercase tracking-wider text-slate-800 mb-3 flex items-center gap-2">
                  <Utensils className="w-4 h-4 text-emerald-600" />
                  Các Bước Thực Hiện Nấu
                </h4>
                {selectedRecipeDetail.cacBuoc && selectedRecipeDetail.cacBuoc.length > 0 ? (
                  <div className="space-y-3.5">
                    {selectedRecipeDetail.cacBuoc.map((step) => (
                      <div key={step.SoThuTuBuoc} className="flex items-start gap-3.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
                        <div className="w-7 h-7 rounded-xl bg-orange-500 text-white font-black text-xs flex items-center justify-center shrink-0">
                          {step.SoThuTuBuoc}
                        </div>
                        <div className="flex-1 text-xs sm:text-sm text-slate-700 leading-relaxed">
                          {step.NoiDungHuongDan}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-500">
                    Sơ chế sạch nguyên liệu, xào nấu chín tới trên lửa vừa và nêm nếm gia vị vừa ăn.
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                <button
                  onClick={() => handleToggleFavorite(selectedRecipeDetail.MaMonAn)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 transition-all cursor-pointer"
                >
                  <Heart className="w-4 h-4 text-rose-500" />
                  <span>Lưu vào món yêu thích</span>
                </button>

                <button
                  onClick={() => setSelectedRecipeDetail(null)}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  Đóng
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* ============================================================================================== */}
      {/* DRAWER DANH SÁCH MÓN ĂN ĐÃ LƯU */}
      {/* ============================================================================================== */}
      {isSavedDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex justify-end">
          <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-orange-50/50">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
                <h3 className="text-base font-black text-slate-900">Món Ăn Đã Lưu ({savedRecipesList.length})</h3>
              </div>
              <button
                onClick={() => setIsSavedDrawerOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {savedRecipesList.length === 0 ? (
                <div className="text-center py-16 text-slate-400 space-y-3">
                  <Bookmark className="w-12 h-12 mx-auto text-slate-300" />
                  <p className="text-sm">Bạn chưa lưu món ăn nào.</p>
                  <p className="text-xs text-slate-400">Bấm vào biểu tượng ❤️ trên card món ăn để thêm vào danh sách yêu thích.</p>
                </div>
              ) : (
                savedRecipesList.map(recipe => (
                  <div
                    key={recipe.MaMonAn}
                    onClick={() => {
                      setIsSavedDrawerOpen(false);
                      handleOpenDetailModal(recipe);
                    }}
                    className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-orange-50/60 rounded-2xl border border-slate-200/80 cursor-pointer transition-colors"
                  >
                    <img
                      src={recipe.DuongDanAnhChinh || FALLBACK_FOOD_IMG}
                      alt={recipe.TenMonAn}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = FALLBACK_FOOD_IMG;
                      }}
                      className="w-16 h-16 rounded-xl object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 truncate">{recipe.TenMonAn}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">{recipe.TenDanhMuc || 'Món ngon'} • {recipe.ThoiGianNau || 30} phút</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleFavorite(recipe.MaMonAn);
                      }}
                      className="p-2 text-rose-500 hover:bg-rose-100 rounded-full transition-colors cursor-pointer"
                      title="Bỏ lưu"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 text-center">
              <span className="text-[11px] text-slate-500">
                Danh sách món yêu thích cá nhân của bạn
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================================================== */}
      {/* MODAL ĐĂNG NHẬP / XÁC THỰC */}
      {/* ============================================================================================== */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 mx-auto flex items-center justify-center font-bold">
              <User className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900">Tài Khoản Người Dùng</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Đăng nhập để lưu các công thức món ăn yêu thích và xem thực đơn gợi ý cá nhân hóa.
            </p>
            <div className="space-y-2 pt-2">
              <button
                onClick={() => {
                  setCurrentUser({
                    id: 2,
                    name: 'Cao Văn Hột Xoàn (Admin)',
                    email: 'xoan@whattocook.com',
                    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
                    role: 'QuanTriVien'
                  });
                  setIsAuthModalOpen(false);
                }}
                className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl shadow-md transition-colors cursor-pointer"
              >
                Đăng nhập tài khoản Admin
              </button>
              <button
                onClick={() => {
                  setCurrentUser(null);
                  setIsAuthModalOpen(false);
                }}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
