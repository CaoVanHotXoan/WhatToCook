/**
 * =========================================================================================
 * DỰ ÁN: WHAT TO COOK - GIAO DIỆN ADMIN DASHBOARD
 * FILE: src/pages/Dashboard.tsx
 * MÔ TẢ: Trang quản trị trung tâm quản lý toàn diện 9 bảng Cơ sở dữ liệu SQL Server
 * CÔNG NGHỆ: React.js, Tailwind CSS, Lucide Icons, kết nối Backend RESTful API
 * =========================================================================================
 * 
 * PHÂN CHIA 5 NHÓM CHỨC NĂNG TRÊN SIDEBAR:
 * - Group 1: 📊 Tổng Quan (KPI Cards: Món ăn, Nguyên liệu, Người dùng, Lượt lưu)
 * - Group 2: 🍲 Quản Lý Món Ăn (MonAn, CacBuocThucHien, DanhMuc)
 * - Group 3: 🥕 Từ Điển Nguyên Liệu (NguyenLieu, NguyenLieuMonAn, TuDongNghiaNguyenLieu)
 * - Group 4: 👥 Tài Khoản & Phân Quyền (NguoiDung, VaiTro)
 * - Group 5: ❤️ Thống Kê Yêu Thích (MonAnDaLuu)
 * 
 * QUY CHUẨN CRUD:
 * - Bảng đơn (DanhMuc, NguyenLieu, TuDongNghia, VaiTro): Modal Popup gọn gàng.
 * - Bảng MÓN ĂN: Modal 3 Thẻ/Tab (Thông tin chính - Nguyên liệu định lượng - Các bước nấu).
 * =========================================================================================
 */

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import {
  LayoutDashboard,
  Utensils,
  Layers,
  Carrot,
  Languages,
  Users,
  ShieldCheck,
  Heart,
  Moon,
  Sun,
  Bell,
  Search,
  ChevronRight,
  Menu,
  X,
  ChefHat,
  Sparkles,
  Plus,
  Edit2,
  Trash2,
  Clock,
  Globe,
  Filter,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  FolderPlus,
  BookOpen,
  ListPlus,
  Flame,
  Download,
  Mail,
  Calendar
} from 'lucide-react';
import {
  DashboardStats,
  MonAn,
  DanhMuc,
  NguyenLieu,
  NguoiDung,
  VaiTro,
  MonAnDaLuuItem,
  PaginationMeta
} from '../types';
import { adminApi } from '../services/api';

// Subviews
import { SynonymsView } from '../components/views/SynonymsView';
import { UsersView } from '../components/views/UsersView';
import { RolesView } from '../components/views/RolesView';
import { FavoritesView } from '../components/views/FavoritesView';

// Modals
import { RecipeModal } from '../components/modals/RecipeModal';
import { CategoryModal } from '../components/modals/CategoryModal';
import { IngredientModal } from '../components/modals/IngredientModal';
import { SynonymModal } from '../components/modals/SynonymModal';
import { UserRoleModal } from '../components/modals/UserRoleModal';
import { CookpadModal } from '../components/modals/CookpadModal';
import { DeleteModal } from '../components/modals/DeleteModal';

export default function Dashboard() {
  // =========================================================================
  // 1. STATE QUẢN LÝ GIAO DIỆN & MENU ĐIỀU HƯỚNG
  // =========================================================================
  const [currentTab, setCurrentTab] = useState<string>('overview'); // Tab đang kích hoạt
  const [isDark, setIsDark] = useState<boolean>(false);              // Chế độ sáng / tối
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false); // Sidebar di động
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);     // Thông báo nổi

  // Hiển thị Toast feedback
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Khởi tạo theme Dark/Light mode
  useEffect(() => {
    const savedTheme = localStorage.getItem('whattocook_theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('whattocook_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('whattocook_theme', 'light');
    }
  };

  // =========================================================================
  // 2. STATE DỮ LIỆU TỪ BACKEND SQL SERVER (9 BẢNG CSDL)
  // =========================================================================
  
  // Group 1: KPI Stats
  const [stats, setStats] = useState<DashboardStats>({
    TongNguoiDung: 0,
    TongMonAn: 0,
    TongDanhMuc: 0,
    TongNguyenLieu: 0,
    TongLuotLuu: 0
  });

  // Group 2: Món ăn & Danh mục (MonAn, CacBuocThucHien, DanhMuc)
  const [recipes, setRecipes] = useState<MonAn[]>([]);
  const [recipePagination, setRecipePagination] = useState<PaginationMeta>({ page: 1, pageSize: 10, totalCount: 0, totalPages: 1 });
  const [recipeSearch, setRecipeSearch] = useState('');
  const [recipeCategory, setRecipeCategory] = useState<number | undefined>(undefined);
  const [categories, setCategories] = useState<DanhMuc[]>([]);

  // Group 3: Nguyên liệu & Từ đồng nghĩa (NguyenLieu, TuDongNghiaNguyenLieu)
  const [ingredients, setIngredients] = useState<NguyenLieu[]>([]);
  const [ingredientSearch, setIngredientSearch] = useState('');
  const [ingredientType, setIngredientType] = useState('');

  // Group 4: Người dùng & Vai trò (NguoiDung, VaiTro)
  const [users, setUsers] = useState<NguoiDung[]>([]);
  const [userPagination, setUserPagination] = useState<PaginationMeta>({ page: 1, pageSize: 10, totalCount: 0, totalPages: 1 });
  const [userSearch, setUserSearch] = useState('');
  const [roles, setRoles] = useState<VaiTro[]>([]);

  // Group 5: Thống kê yêu thích (MonAnDaLuu)
  const [favorites, setFavorites] = useState<MonAnDaLuuItem[]>([]);
  const [favPagination, setFavPagination] = useState<PaginationMeta>({ page: 1, pageSize: 10, totalCount: 0, totalPages: 1 });

  // =========================================================================
  // 3. STATE QUẢN LÝ MODALS CRUD (Thêm mới, Chỉnh sửa, Xóa, Cào Cookpad)
  // =========================================================================
  
  // Modal Master Món Ăn (3 Thẻ)
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<MonAn | null>(null);

  // Modal Danh Mục
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<DanhMuc | null>(null);

  // Modal Nguyên Liệu
  const [isIngredientModalOpen, setIsIngredientModalOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<NguyenLieu | null>(null);

  // Modal Từ Đồng Nghĩa
  const [isSynonymModalOpen, setIsSynonymModalOpen] = useState(false);
  const [selectedIngredientForSynonym, setSelectedIngredientForSynonym] = useState<number | undefined>(undefined);

  // Modal Phân Quyền Người Dùng
  const [isUserRoleModalOpen, setIsUserRoleModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<NguoiDung | null>(null);

  // Modal Cào Cookpad
  const [isCookpadModalOpen, setIsCookpadModalOpen] = useState(false);

  // Modal Xác Nhận Xóa
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: string; id: number; name: string } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // =========================================================================
  // 4. HÀM GỌI API TẢI DỮ LIỆU TỪ WHATTOCOOK_BACKEND
  // =========================================================================
  
  const loadStats = async () => {
    const data = await adminApi.getStats();
    setStats(data);
  };

  const loadCategories = async () => {
    const data = await adminApi.getCategories();
    setCategories(data);
  };

  const loadRecipes = async (page = recipePagination.page, search = recipeSearch, catId = recipeCategory) => {
    const res = await adminApi.getRecipes(page, 10, search, catId);
    setRecipes(res.items);
    setRecipePagination(res.pagination);
  };

  const loadIngredients = async (search = ingredientSearch, type = ingredientType) => {
    const data = await adminApi.getIngredients(search, type);
    setIngredients(data);
  };

  const loadUsers = async (page = userPagination.page, search = userSearch) => {
    const res = await adminApi.getUsers(page, 10, search);
    setUsers(res.items);
    setUserPagination(res.pagination);
  };

  const loadRoles = async () => {
    const data = await adminApi.getRoles();
    setRoles(data);
  };

  const loadFavorites = async (page = favPagination.page) => {
    const res = await adminApi.getSavedFavorites(page, 10);
    setFavorites(res.items);
    setFavPagination(res.pagination);
  };

  // Tải dữ liệu ban đầu khi component mount
  useEffect(() => {
    loadStats();
    loadCategories();
    loadRecipes();
    loadIngredients();
    loadUsers();
    loadRoles();
    loadFavorites();
  }, []);

  // =========================================================================
  // 5. CÁC HÀM XỬ LÝ CRUD (SUBMIT VÀO BACKEND QUA STORED PROCEDURES)
  // =========================================================================

  // Lưu Món ăn (Master Recipe gồm 3 Thẻ)
  const handleSaveRecipe = async (recipeData: any) => {
    if (editingRecipe) {
      await adminApi.updateRecipe(editingRecipe.MaMonAn, recipeData);
      showToast('Cập nhật món ăn thành công!');
    } else {
      await adminApi.createRecipe(recipeData);
      showToast('Tạo mới món ăn thành công!');
    }
    loadRecipes();
    loadStats();
  };

  // Lưu Danh mục món ăn
  const handleSaveCategory = async (tenDanhMuc: string) => {
    if (editingCategory) {
      await adminApi.updateCategory(editingCategory.MaDanhMuc, tenDanhMuc);
      showToast('Cập nhật danh mục thành công!');
    } else {
      await adminApi.createCategory(tenDanhMuc);
      showToast('Thêm danh mục mới thành công!');
    }
    loadCategories();
    loadStats();
  };

  // Lưu Nguyên liệu
  const handleSaveIngredient = async (ten: string, loai: 'Chinh' | 'GiaVi') => {
    if (editingIngredient) {
      await adminApi.updateIngredient(editingIngredient.MaNguyenLieu, ten, loai);
      showToast('Cập nhật nguyên liệu thành công!');
    } else {
      await adminApi.createIngredient(ten, loai);
      showToast('Thêm nguyên liệu mới thành công!');
    }
    loadIngredients();
    loadStats();
  };

  // Thêm Từ đồng nghĩa vùng miền
  const handleSaveSynonym = async (maNL: number, tuDongNghia: string) => {
    await adminApi.addSynonym(maNL, tuDongNghia);
    showToast('Thêm từ đồng nghĩa thành công!');
    loadIngredients();
  };

  // Phân quyền vai trò người dùng
  const handleSaveUserRole = async (userId: number, maVaiTro: number) => {
    await adminApi.updateUserRole(userId, maVaiTro);
    showToast('Cập nhật quyền tài khoản thành công!');
    loadUsers();
  };

  // Thực hiện Xóa dữ liệu an toàn
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleteLoading(true);
      if (deleteTarget.type === 'recipe') {
        await adminApi.deleteRecipe(deleteTarget.id);
        showToast('Đã xóa món ăn!');
        loadRecipes();
      } else if (deleteTarget.type === 'category') {
        await adminApi.deleteCategory(deleteTarget.id);
        showToast('Đã xóa danh mục!');
        loadCategories();
      } else if (deleteTarget.type === 'ingredient') {
        await adminApi.deleteIngredient(deleteTarget.id);
        showToast('Đã xóa nguyên liệu!');
        loadIngredients();
      } else if (deleteTarget.type === 'user') {
        await adminApi.deleteUser(deleteTarget.id);
        showToast('Đã xóa tài khoản!');
        loadUsers();
      }
      loadStats();
      setIsDeleteModalOpen(false);
    } catch (err: any) {
      alert(err.message || 'Lỗi khi xóa dữ liệu');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Cấu hình 5 Nhóm Chức năng Sidebar
  const navigationGroups = [
    {
      groupTitle: 'Group 1: 📊 Tổng Quan',
      items: [
        { id: 'overview', label: 'Bảng Thống Kê KPI', icon: LayoutDashboard }
      ]
    },
    {
      groupTitle: 'Group 2: 🍲 Quản Lý Món Ăn',
      items: [
        { id: 'recipes', label: 'Món Ăn & Công Thức', icon: Utensils, badge: 'MonAn' },
        { id: 'categories', label: 'Danh Mục Món Ăn', icon: Layers, badge: 'DanhMuc' }
      ]
    },
    {
      groupTitle: 'Group 3: 🥕 Từ Điển Nguyên Liệu',
      items: [
        { id: 'ingredients', label: 'Danh Sách Nguyên Liệu', icon: Carrot, badge: 'NguyenLieu' },
        { id: 'synonyms', label: 'Từ Đồng Nghĩa Miền', icon: Languages, badge: 'TuDongNghia' }
      ]
    },
    {
      groupTitle: 'Group 4: 👥 Tài Khoản & Phân Quyền',
      items: [
        { id: 'users', label: 'Tài Khoản Người Dùng', icon: Users, badge: 'NguoiDung' },
        { id: 'roles', label: 'Vai Trò Hệ Thống', icon: ShieldCheck, badge: 'VaiTro' }
      ]
    },
    {
      groupTitle: 'Group 5: ❤️ Thống Kê Yêu Thích',
      items: [
        { id: 'favorites', label: 'Món Ăn Yêu Thích', icon: Heart, badge: 'MonAnDaLuu' }
      ]
    }
  ];

  return (
    <>
      <Head>
        <title>What To Cook - Admin Dashboard | Quản Trị Hệ Thống 9 Bảng CSDL</title>
        <meta name="description" content="Admin Dashboard chuyên nghiệp cho hệ thống What To Cook kết nối CSDL SQL Server qua Stored Procedures" />
      </Head>

      {/* ================= THÔNG BÁO TOAST ================= */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 text-sm font-semibold flex items-center gap-2 animate-bounce">
          <span>✨</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ================= BỐ CỤC CHÍNH DASHBOARD ================= */}
      <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
        
        {/* ================= 1. SIDEBAR CỐ ĐỊNH BÊN TRÁI ================= */}
        <aside
          className={`fixed top-0 bottom-0 left-0 z-40 w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-300 ease-in-out ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          {/* Logo Brand "What To Cook - Admin" */}
          <div className="h-18 px-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-amber-500/10 to-orange-500/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/25">
                <ChefHat className="w-6 h-6" />
              </div>
              <div>
                <h1 className="font-extrabold text-base tracking-tight text-slate-900 dark:text-slate-100 leading-tight">
                  What To Cook
                </h1>
                <span className="text-[11px] font-bold text-orange-600 dark:text-orange-400 uppercase tracking-widest">
                  Admin Dashboard
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Menu Điều Hướng 5 Nhóm Chức Năng */}
          <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6 scrollbar-thin">
            {navigationGroups.map((group, gIdx) => (
              <div key={gIdx} className="space-y-1.5">
                <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {group.groupTitle}
                </p>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setCurrentTab(item.id);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all group ${
                          isActive
                            ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-orange-500/25'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={`w-4 h-4 transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                          <span>{item.label}</span>
                        </div>
                        {'badge' in item && item.badge && (
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-md font-mono font-medium ${
                              isActive
                                ? 'bg-white/25 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* User Status Footer */}
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex items-center gap-3 p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 shadow-2xs">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                SA
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">sa (Administrator)</p>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> SQL Server: Connected
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* Backdrop for mobile */}
        {isMobileMenuOpen && (
          <div
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 z-30 bg-black/50 backdrop-blur-xs lg:hidden"
          />
        )}

        {/* ================= 2. TOP NAVBAR ================= */}
        <div className="lg:pl-72 flex-1 flex flex-col min-w-0">
          <header className="sticky top-0 z-20 h-18 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-4 sm:px-8 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Breadcrumb */}
              <div className="hidden sm:flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-slate-800 dark:text-slate-200">What To Cook</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
                <span className="text-orange-600 dark:text-orange-400 font-medium capitalize">
                  {currentTab}
                </span>
              </div>
            </div>

            {/* Right Tools: Dark Mode, Notifications, Admin Profile */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={toggleDarkMode}
                className="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-95"
                title={isDark ? 'Giao diện Sáng' : 'Giao diện Tối'}
              >
                {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition relative active:scale-95"
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-orange-500"></span>
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl z-50 animate-fadeIn">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 mb-2">
                      <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100">Thông báo hệ thống</h4>
                      <span className="text-[10px] text-orange-600">Đang trực tuyến</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-orange-50 dark:bg-orange-950/40 border border-orange-100 dark:border-orange-900 text-xs">
                      <p className="font-semibold text-orange-700 dark:text-orange-300">Kết nối SQL Server</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">Toàn bộ 100% nghiệp vụ đang chạy qua Stored Procedures.</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 pl-2 sm:border-l border-slate-200 dark:border-slate-800">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-orange-500/20">
                  AD
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100">Quản Trị Viên</p>
                  <p className="text-[10px] text-slate-400 font-semibold text-emerald-600">Admin</p>
                </div>
              </div>
            </div>
          </header>

          {/* ================= 3. MAIN WORKSPACE (NỘI DUNG THEO TAB) ================= */}
          <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
            
            {/* GROUP 1: TỔNG QUAN (KPI CARDS) */}
            {currentTab === 'overview' && (
              <div className="space-y-6 animate-fadeIn">
                {/* Banner Welcome */}
                <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white shadow-xl shadow-orange-500/15">
                  <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="max-w-xl space-y-2">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-md">
                        <Sparkles className="w-3.5 h-3.5" /> What To Cook - Backend SQL Server
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                        Hệ Thống Quản Trị Gợi Ý Món Ăn
                      </h2>
                      <p className="text-sm text-white/90 leading-relaxed">
                        Quản lý đầy đủ 9 bảng CSDL: Món ăn, Danh mục, Từ điển nguyên liệu, Phân quyền người dùng và Thống kê món đã lưu.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        onClick={() => {
                          setEditingRecipe(null);
                          setIsRecipeModalOpen(true);
                        }}
                        className="px-4 py-2.5 bg-white text-orange-600 hover:bg-orange-50 active:scale-98 rounded-2xl font-bold text-sm shadow-md transition flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" /> + Thêm món ăn mới
                      </button>
                      <button
                        onClick={() => setIsCookpadModalOpen(true)}
                        className="px-4 py-2.5 bg-black/20 hover:bg-black/30 backdrop-blur-md active:scale-98 rounded-2xl font-semibold text-sm border border-white/20 transition flex items-center gap-2"
                      >
                        <Globe className="w-4 h-4" /> Cào dữ liệu Cookpad
                      </button>
                    </div>
                  </div>
                </div>

                {/* 5 KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  {[
                    { title: 'Tổng số món ăn', value: stats.TongMonAn, icon: Utensils, bg: 'bg-orange-500/10 text-orange-600', tab: 'recipes', sub: 'Bảng MonAn' },
                    { title: 'Từ điển nguyên liệu', value: stats.TongNguyenLieu, icon: Carrot, bg: 'bg-emerald-500/10 text-emerald-600', tab: 'ingredients', sub: 'Bảng NguyenLieu' },
                    { title: 'Tài khoản người dùng', value: stats.TongNguoiDung, icon: Users, bg: 'bg-blue-500/10 text-blue-600', tab: 'users', sub: 'Bảng NguoiDung' },
                    { title: 'Lượt lưu yêu thích', value: stats.TongLuotLuu, icon: Heart, bg: 'bg-rose-500/10 text-rose-600', tab: 'favorites', sub: 'Bảng MonAnDaLuu' },
                    { title: 'Danh mục món ăn', value: stats.TongDanhMuc, icon: Layers, bg: 'bg-purple-500/10 text-purple-600', tab: 'categories', sub: 'Bảng DanhMuc' },
                  ].map((kpi, idx) => {
                    const Icon = kpi.icon;
                    return (
                      <div
                        key={idx}
                        onClick={() => setCurrentTab(kpi.tab)}
                        className="group cursor-pointer p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-md transition-all transform hover:-translate-y-1"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className={`p-2.5 rounded-xl ${kpi.bg}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                        </div>
                        <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">{kpi.value || 0}</p>
                        <h3 className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-1">{kpi.title}</h3>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 font-mono">{kpi.sub}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Danh sách món mới & Danh sách 9 bảng */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                      <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
                        <Utensils className="w-5 h-5 text-orange-500" /> Món ăn gần đây trên hệ thống
                      </h3>
                      <button onClick={() => setCurrentTab('recipes')} className="text-xs font-semibold text-orange-600 hover:underline">
                        Xem tất cả ➔
                      </button>
                    </div>

                    <div className="space-y-3">
                      {recipes.slice(0, 4).map((r) => (
                        <div key={r.MaMonAn} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                          <div className="flex items-center gap-3">
                            <img src={r.DuongDanAnhChinh || 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=120'} alt={r.TenMonAn} className="w-12 h-12 rounded-xl object-cover" />
                            <div>
                              <p className="font-bold text-sm text-slate-900 dark:text-slate-100">{r.TenMonAn}</p>
                              <p className="text-xs text-slate-400">{r.TenDanhMuc} • {r.ThoiGianNau || 30} phút • ❤️ {r.SoLuotLuu || 0} lưu</p>
                            </div>
                          </div>
                          <button onClick={() => setCurrentTab('recipes')} className="px-3 py-1.5 text-xs bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg">
                            Chi tiết
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-3">
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base pb-3 border-b border-slate-100 dark:border-slate-800">
                      📋 9 Bảng CSDL Quản Lý
                    </h3>
                    <div className="space-y-2 text-xs">
                      <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 flex justify-between font-semibold"><span>1. VaiTro</span><span className="text-slate-400">Phân quyền</span></div>
                      <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 flex justify-between font-semibold"><span>2. NguoiDung</span><span className="text-slate-400">Tài khoản</span></div>
                      <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 flex justify-between font-semibold"><span>3. DanhMuc</span><span className="text-slate-400">Phân loại món</span></div>
                      <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 flex justify-between font-semibold"><span>4. MonAn</span><span className="text-slate-400">Công thức chính</span></div>
                      <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 flex justify-between font-semibold"><span>5. CacBuocThucHien</span><span className="text-slate-400">Các bước nấu</span></div>
                      <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 flex justify-between font-semibold"><span>6. NguyenLieu</span><span className="text-slate-400">Từ điển nguyên liệu</span></div>
                      <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 flex justify-between font-semibold"><span>7. NguyenLieuMonAn</span><span className="text-slate-400">Định lượng món</span></div>
                      <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 flex justify-between font-semibold"><span>8. TuDongNghiaNguyenLieu</span><span className="text-slate-400">Từ đồng nghĩa</span></div>
                      <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 flex justify-between font-semibold"><span>9. MonAnDaLuu</span><span className="text-slate-400">Yêu thích</span></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* GROUP 2: QUẢN LÝ MÓN ĂN & CÔNG THỨC */}
            {currentTab === 'recipes' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
                      <Utensils className="w-6 h-6 text-orange-500" /> Quản Lý Món Ăn & Công Thức
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">Gộp 3 bảng CSDL: MonAn • CacBuocThucHien • NguyenLieuMonAn</p>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => setIsCookpadModalOpen(true)}
                      className="px-4 py-2.5 bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 hover:bg-orange-100 rounded-xl text-sm font-semibold border border-orange-200 dark:border-orange-900 flex items-center gap-2 transition"
                    >
                      <Globe className="w-4 h-4" /> Cào từ Cookpad
                    </button>
                    <button
                      onClick={() => {
                        setEditingRecipe(null);
                        setIsRecipeModalOpen(true);
                      }}
                      className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl text-sm font-semibold shadow-md flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" /> + Thêm món mới
                    </button>
                  </div>
                </div>

                {/* Search & Category Filter */}
                <div className="flex flex-col sm:flex-row items-center gap-3 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                  <div className="relative flex-1 w-full">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Tìm kiếm theo tên món ăn..."
                      value={recipeSearch}
                      onChange={(e) => {
                        setRecipeSearch(e.target.value);
                        loadRecipes(1, e.target.value, recipeCategory);
                      }}
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                    />
                  </div>
                  <select
                    value={recipeCategory || ''}
                    onChange={(e) => {
                      const catId = e.target.value ? Number(e.target.value) : undefined;
                      setRecipeCategory(catId);
                      loadRecipes(1, recipeSearch, catId);
                    }}
                    className="w-full sm:w-48 px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                  >
                    <option value="">Tất cả danh mục</option>
                    {categories.map((c) => (
                      <option key={c.MaDanhMuc} value={c.MaDanhMuc}>{c.TenDanhMuc}</option>
                    ))}
                  </select>
                </div>

                {/* Table MonAn */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                      <tr>
                        <th className="px-5 py-3.5">Món ăn</th>
                        <th className="px-5 py-3.5">Danh mục</th>
                        <th className="px-5 py-3.5">Thời gian & Khẩu phần</th>
                        <th className="px-5 py-3.5">Tác giả</th>
                        <th className="px-5 py-3.5 text-center">Yêu thích</th>
                        <th className="px-5 py-3.5 text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {recipes.map((item) => (
                        <tr key={item.MaMonAn} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition">
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <img src={item.DuongDanAnhChinh || 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=120'} alt={item.TenMonAn} className="w-12 h-12 rounded-xl object-cover shrink-0" />
                              <div>
                                <p className="font-bold text-slate-900 dark:text-slate-100 line-clamp-1">{item.TenMonAn}</p>
                                <p className="text-xs text-slate-400 line-clamp-1">{item.CauChuyen || 'Không có mô tả'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300">
                              {item.TenDanhMuc || 'Chưa phân loại'}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-xs text-slate-600 dark:text-slate-300">
                            {item.ThoiGianNau || 30} phút • {item.KhauPhan || 4} người
                          </td>
                          <td className="px-5 py-3.5 text-xs text-slate-600 dark:text-slate-300">{item.TenTacGia || 'Hệ thống'}</td>
                          <td className="px-5 py-3.5 text-center text-xs font-bold text-rose-500">❤️ {item.SoLuotLuu || 0}</td>
                          <td className="px-5 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={async () => {
                                  try {
                                    const full = await adminApi.getRecipeById(item.MaMonAn);
                                    setEditingRecipe(full);
                                  } catch {
                                    setEditingRecipe(item);
                                  }
                                  setIsRecipeModalOpen(true);
                                }}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50"
                                title="Sửa công thức (3 Thẻ)"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setDeleteTarget({ type: 'recipe', id: item.MaMonAn, name: item.TenMonAn });
                                  setIsDeleteModalOpen(true);
                                }}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50"
                                title="Xóa món ăn"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* GROUP 2: DANH MỤC MÓN ĂN (DanhMuc) */}
            {currentTab === 'categories' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <Layers className="w-6 h-6 text-purple-500" /> Quản Lý Danh Mục Món Ăn
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">Bảng CSDL: DanhMuc</p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingCategory(null);
                      setIsCategoryModalOpen(true);
                    }}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> + Thêm danh mục
                  </button>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                      <tr>
                        <th className="px-5 py-3.5 w-24">Mã DM</th>
                        <th className="px-5 py-3.5">Tên danh mục</th>
                        <th className="px-5 py-3.5 text-center">Số lượng món</th>
                        <th className="px-5 py-3.5 text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {categories.map((c) => (
                        <tr key={c.MaDanhMuc} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                          <td className="px-5 py-3.5 font-mono text-xs text-slate-400">#{c.MaDanhMuc}</td>
                          <td className="px-5 py-3.5 font-bold">{c.TenDanhMuc}</td>
                          <td className="px-5 py-3.5 text-center">
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
                              🍲 {c.SoLuongMonAn || 0} món
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => {
                                  setEditingCategory(c);
                                  setIsCategoryModalOpen(true);
                                }}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setDeleteTarget({ type: 'category', id: c.MaDanhMuc, name: c.TenDanhMuc });
                                  setIsDeleteModalOpen(true);
                                }}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* GROUP 3: NGUYÊN LIỆU (NguyenLieu) */}
            {currentTab === 'ingredients' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <Carrot className="w-6 h-6 text-emerald-500" /> Từ Điển Nguyên Liệu Chuẩn
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">Bảng CSDL: NguyenLieu</p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingIngredient(null);
                      setIsIngredientModalOpen(true);
                    }}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> + Thêm nguyên liệu
                  </button>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                      <tr>
                        <th className="px-5 py-3.5 w-24">Mã NL</th>
                        <th className="px-5 py-3.5">Tên nguyên liệu</th>
                        <th className="px-5 py-3.5">Phân loại</th>
                        <th className="px-5 py-3.5">Từ đồng nghĩa miền</th>
                        <th className="px-5 py-3.5 text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {ingredients.map((ing) => (
                        <tr key={ing.MaNguyenLieu} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                          <td className="px-5 py-3.5 font-mono text-xs text-slate-400">#{ing.MaNguyenLieu}</td>
                          <td className="px-5 py-3.5 font-bold">{ing.TenNguyenLieu}</td>
                          <td className="px-5 py-3.5">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${ing.LoaiNguyenLieu === 'Chinh' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                              {ing.LoaiNguyenLieu === 'Chinh' ? '🥩 Chính' : '🧂 Gia vị'}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                            {ing.TuDongNghia || <span className="text-slate-400 italic">Chưa có</span>}
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => {
                                  setSelectedIngredientForSynonym(ing.MaNguyenLieu);
                                  setIsSynonymModalOpen(true);
                                }}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600"
                                title="Thêm từ đồng nghĩa"
                              >
                                <Languages className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setEditingIngredient(ing);
                                  setIsIngredientModalOpen(true);
                                }}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setDeleteTarget({ type: 'ingredient', id: ing.MaNguyenLieu, name: ing.TenNguyenLieu });
                                  setIsDeleteModalOpen(true);
                                }}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* GROUP 3: TỪ ĐỒNG NGHĨA (TuDongNghiaNguyenLieu) */}
            {currentTab === 'synonyms' && (
              <SynonymsView
                ingredients={ingredients}
                onAdd={() => {
                  setSelectedIngredientForSynonym(undefined);
                  setIsSynonymModalOpen(true);
                }}
                onDelete={(item) => {
                  setDeleteTarget({ type: 'synonym', id: item.MaTuDongNghia, name: item.TenTuDongNghia });
                  setIsDeleteModalOpen(true);
                }}
              />
            )}

            {/* GROUP 4: TÀI KHOẢN (NguoiDung) */}
            {currentTab === 'users' && (
              <UsersView
                users={users}
                pagination={userPagination}
                search={userSearch}
                onSearchChange={(val) => {
                  setUserSearch(val);
                  loadUsers(1, val);
                }}
                onPageChange={(p) => loadUsers(p, userSearch)}
                onChangeRole={(u) => {
                  setEditingUser(u);
                  setIsUserRoleModalOpen(true);
                }}
                onDelete={(u) => {
                  setDeleteTarget({ type: 'user', id: u.MaNguoiDung, name: u.TenDangNhap });
                  setIsDeleteModalOpen(true);
                }}
              />
            )}

            {/* GROUP 4: VAI TRÒ (VaiTro) */}
            {currentTab === 'roles' && <RolesView roles={roles} />}

            {/* GROUP 5: THỐNG KÊ YÊU THÍCH (MonAnDaLuu) */}
            {currentTab === 'favorites' && (
              <FavoritesView
                favorites={favorites}
                pagination={favPagination}
                onPageChange={loadFavorites}
              />
            )}
          </main>
        </div>
      </div>

      {/* ================= MODALS CRUD TOÀN CỤC ================= */}

      {/* Modal Món Ăn 3 Thẻ */}
      <RecipeModal
        isOpen={isRecipeModalOpen}
        onClose={() => setIsRecipeModalOpen(false)}
        onSubmit={handleSaveRecipe}
        recipe={editingRecipe}
        categories={categories}
        allIngredients={ingredients}
      />

      {/* Modal Danh Mục */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onSubmit={handleSaveCategory}
        category={editingCategory}
      />

      {/* Modal Nguyên Liệu */}
      <IngredientModal
        isOpen={isIngredientModalOpen}
        onClose={() => setIsIngredientModalOpen(false)}
        onSubmit={handleSaveIngredient}
        ingredient={editingIngredient}
      />

      {/* Modal Từ Đồng Nghĩa */}
      <SynonymModal
        isOpen={isSynonymModalOpen}
        onClose={() => setIsSynonymModalOpen(false)}
        onSubmit={handleSaveSynonym}
        ingredients={ingredients}
        selectedIngredientId={selectedIngredientForSynonym}
      />

      {/* Modal Phân Quyền */}
      <UserRoleModal
        isOpen={isUserRoleModalOpen}
        onClose={() => setIsUserRoleModalOpen(false)}
        onSubmit={handleSaveUserRole}
        user={editingUser}
        roles={roles}
      />

      {/* Modal Cào Cookpad */}
      <CookpadModal
        isOpen={isCookpadModalOpen}
        onClose={() => setIsCookpadModalOpen(false)}
        onSuccess={() => {
          loadRecipes();
          loadStats();
          showToast('Import công thức Cookpad thành công!');
        }}
        categories={categories}
      />

      {/* Modal Xác Nhận Xóa */}
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title={deleteTarget?.type === 'recipe' ? 'món ăn' : deleteTarget?.type === 'category' ? 'danh mục' : deleteTarget?.type === 'ingredient' ? 'nguyên liệu' : 'tài khoản'}
        itemName={deleteTarget?.name}
        loading={deleteLoading}
      />
    </>
  );
}
