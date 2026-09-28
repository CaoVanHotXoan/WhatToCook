import React, { useState, useEffect } from 'react';
import {
  X,
  Utensils,
  Carrot,
  BookOpen,
  Plus,
  Trash2,
  Clock,
  Users,
  Image,
  Sparkles,
  Layers
} from 'lucide-react';
import { MonAn, DanhMuc, NguyenLieu, BuocThucHien, NguyenLieuMonAn } from '../../types';

interface RecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (recipeData: any) => Promise<void>;
  recipe: MonAn | null;
  categories: DanhMuc[];
  allIngredients: NguyenLieu[];
}

export const RecipeModal: React.FC<RecipeModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  recipe,
  categories,
  allIngredients
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'ingredients' | 'steps'>('info');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [tenMonAn, setTenMonAn] = useState('');
  const [maDanhMuc, setMaDanhMuc] = useState<number | ''>('');
  const [cauChuyen, setCauChuyen] = useState('');
  const [khauPhan, setKhauPhan] = useState(4);
  const [thoiGianNau, setThoiGianNau] = useState(30);
  const [duongDanAnhChinh, setDuongDanAnhChinh] = useState('');

  // Tab 2 State: Danh sách nguyên liệu
  const [ingredientsList, setIngredientsList] = useState<NguyenLieuMonAn[]>([]);

  // Tab 3 State: Danh sách các bước nấu
  const [stepsList, setStepsList] = useState<BuocThucHien[]>([]);

  useEffect(() => {
    if (recipe) {
      setTenMonAn(recipe.TenMonAn || '');
      setMaDanhMuc(recipe.MaDanhMuc || (categories.length > 0 ? categories[0].MaDanhMuc : ''));
      setCauChuyen(recipe.CauChuyen || '');
      setKhauPhan(recipe.KhauPhan || 4);
      setThoiGianNau(recipe.ThoiGianNau || 30);
      setDuongDanAnhChinh(recipe.DuongDanAnhChinh || '');
      setIngredientsList(
        recipe.nguyenLieu && recipe.nguyenLieu.length > 0
          ? recipe.nguyenLieu
          : [{ TenNguyenLieu: '', DinhLuong: '', LaNguyenLieuChinh: true, LoaiNguyenLieu: 'Chinh' }]
      );
      setStepsList(
        recipe.cacBuoc && recipe.cacBuoc.length > 0
          ? recipe.cacBuoc
          : [{ SoThuTuBuoc: 1, NoiDungHuongDan: '', DuongDanAnhBuoc: '' }]
      );
    } else {
      setTenMonAn('');
      setMaDanhMuc(categories.length > 0 ? categories[0].MaDanhMuc : '');
      setCauChuyen('');
      setKhauPhan(4);
      setThoiGianNau(30);
      setDuongDanAnhChinh('');
      setIngredientsList([
        { TenNguyenLieu: '', DinhLuong: '', LaNguyenLieuChinh: true, LoaiNguyenLieu: 'Chinh' }
      ]);
      setStepsList([
        { SoThuTuBuoc: 1, NoiDungHuongDan: '', DuongDanAnhBuoc: '' }
      ]);
    }
    setActiveTab('info');
    setError('');
  }, [recipe, categories, isOpen]);

  if (!isOpen) return null;

  // Xử lý Thêm / Xóa Nguyên liệu
  const handleAddIngredient = () => {
    setIngredientsList([
      ...ingredientsList,
      { TenNguyenLieu: '', DinhLuong: '', LaNguyenLieuChinh: true, LoaiNguyenLieu: 'Chinh' }
    ]);
  };

  const handleRemoveIngredient = (index: number) => {
    setIngredientsList(ingredientsList.filter((_, i) => i !== index));
  };

  const handleUpdateIngredient = (index: number, field: keyof NguyenLieuMonAn, value: any) => {
    const updated = [...ingredientsList];
    updated[index] = { ...updated[index], [field]: value };
    setIngredientsList(updated);
  };

  // Xử lý Thêm / Xóa Bước Nấu
  const handleAddStep = () => {
    setStepsList([
      ...stepsList,
      { SoThuTuBuoc: stepsList.length + 1, NoiDungHuongDan: '', DuongDanAnhBuoc: '' }
    ]);
  };

  const handleRemoveStep = (index: number) => {
    const updated = stepsList.filter((_, i) => i !== index).map((s, idx) => ({ ...s, SoThuTuBuoc: idx + 1 }));
    setStepsList(updated);
  };

  const handleUpdateStep = (index: number, field: keyof BuocThucHien, value: any) => {
    const updated = [...stepsList];
    updated[index] = { ...updated[index], [field]: value };
    setStepsList(updated);
  };

  // Submit toàn bộ món ăn 3 thẻ
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenMonAn.trim()) {
      setActiveTab('info');
      setError('Vui lòng nhập tên món ăn');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const cleanIngredients = ingredientsList
        .filter(i => i.TenNguyenLieu && i.TenNguyenLieu.trim())
        .map(i => ({
          tenNguyenLieu: i.TenNguyenLieu.trim(),
          dinhLuong: i.DinhLuong?.trim() || '',
          laNguyenLieuChinh: i.LaNguyenLieuChinh ?? true,
          loaiNguyenLieu: i.LoaiNguyenLieu || 'Chinh'
        }));

      const cleanSteps = stepsList
        .filter(s => s.NoiDungHuongDan && s.NoiDungHuongDan.trim())
        .map((s, idx) => ({
          soThuTuBuoc: idx + 1,
          noiDungHuongDan: s.NoiDungHuongDan.trim(),
          duongDanAnhBuoc: s.DuongDanAnhBuoc?.trim() || null
        }));

      const payload = {
        tenMonAn: tenMonAn.trim(),
        maDanhMuc: maDanhMuc ? Number(maDanhMuc) : null,
        cauChuyen: cauChuyen.trim() || null,
        khauPhan: Number(khauPhan) || 4,
        thoiGianNau: Number(thoiGianNau) || 30,
        duongDanAnhChinh: duongDanAnhChinh.trim() || null,
        nguyenLieu: cleanIngredients,
        cacBuoc: cleanSteps
      };

      await onSubmit(payload);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Lỗi khi lưu món ăn');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden animate-scaleIn">
        {/* Header Modal */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                {recipe ? 'Chỉnh Sửa Công Thức Món Ăn' : 'Thêm Công Thức Món Ăn Mới'}
              </h3>
              <p className="text-[11px] text-slate-400">Quản lý đồng thời 3 bảng CSDL: MonAn • NguyenLieuMonAn • CacBuocThucHien</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3 Thẻ / Tab Điều Hướng */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 px-6 pt-3 gap-6 bg-slate-50/50 dark:bg-slate-900/50">
          <button
            type="button"
            onClick={() => setActiveTab('info')}
            className={`pb-3 text-xs font-bold transition border-b-2 flex items-center gap-1.5 ${
              activeTab === 'info'
                ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <Utensils className="w-4 h-4" /> 1. Thông Tin Chung
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ingredients')}
            className={`pb-3 text-xs font-bold transition border-b-2 flex items-center gap-1.5 ${
              activeTab === 'ingredients'
                ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <Carrot className="w-4 h-4" /> 2. Nguyên Liệu ({ingredientsList.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('steps')}
            className={`pb-3 text-xs font-bold transition border-b-2 flex items-center gap-1.5 ${
              activeTab === 'steps'
                ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <BookOpen className="w-4 h-4" /> 3. Các Bước Nấu ({stepsList.length})
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
          <div className="p-6 overflow-y-auto space-y-4 flex-1 scrollbar-thin">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs font-semibold">
                {error}
              </div>
            )}

            {/* TAB 1: THÔNG TIN CHUNG */}
            {activeTab === 'info' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Tên món ăn *
                    </label>
                    <input
                      type="text"
                      placeholder="VD: Thịt kho hột vịt nước dừa, Canh chua cá lóc..."
                      value={tenMonAn}
                      onChange={(e) => setTenMonAn(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Danh mục món ăn *
                    </label>
                    <select
                      value={maDanhMuc}
                      onChange={(e) => setMaDanhMuc(e.target.value ? Number(e.target.value) : '')}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                    >
                      <option value="">-- Chọn danh mục --</option>
                      {categories.map((c) => (
                        <option key={c.MaDanhMuc} value={c.MaDanhMuc}>
                          {c.TenDanhMuc}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Đường dẫn ảnh chính (URL)
                    </label>
                    <input
                      type="text"
                      placeholder="https://..."
                      value={duongDanAnhChinh}
                      onChange={(e) => setDuongDanAnhChinh(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Khẩu phần (người)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={khauPhan}
                      onChange={(e) => setKhauPhan(Number(e.target.value))}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Thời gian nấu (phút)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={thoiGianNau}
                      onChange={(e) => setThoiGianNau(Number(e.target.value))}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Mô tả / Câu chuyện món ăn
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Mô tả hương vị, mẹo nấu hoặc nguồn gốc món ăn..."
                      value={cauChuyen}
                      onChange={(e) => setCauChuyen(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: NGUYÊN LIỆU & ĐỊNH LƯỢNG */}
            {activeTab === 'ingredients' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-500">Thêm các nguyên liệu kèm định lượng cho món ăn:</p>
                  <button
                    type="button"
                    onClick={handleAddIngredient}
                    className="px-3 py-1.5 bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-bold flex items-center gap-1 hover:bg-emerald-100"
                  >
                    <Plus className="w-3.5 h-3.5" /> + Thêm dòng
                  </button>
                </div>

                <div className="space-y-3">
                  {ingredientsList.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col sm:flex-row items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700"
                    >
                      <div className="w-full sm:flex-1">
                        <input
                          type="text"
                          placeholder="Tên nguyên liệu (VD: Thịt ba chỉ)..."
                          value={item.TenNguyenLieu}
                          onChange={(e) => handleUpdateIngredient(idx, 'TenNguyenLieu', e.target.value)}
                          className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                        />
                      </div>

                      <div className="w-full sm:w-36">
                        <input
                          type="text"
                          placeholder="Định lượng (VD: 500g)..."
                          value={item.DinhLuong || ''}
                          onChange={(e) => handleUpdateIngredient(idx, 'DinhLuong', e.target.value)}
                          className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                        />
                      </div>

                      <div className="w-full sm:w-32">
                        <select
                          value={item.LoaiNguyenLieu || 'Chinh'}
                          onChange={(e) => handleUpdateIngredient(idx, 'LoaiNguyenLieu', e.target.value)}
                          className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                        >
                          <option value="Chinh">🥩 Chính</option>
                          <option value="GiaVi">🧂 Gia vị</option>
                        </select>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveIngredient(idx)}
                        disabled={ingredientsList.length <= 1}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg disabled:opacity-30"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: CÁC BƯỚC NẤU */}
            {activeTab === 'steps' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-500">Các bước thực hiện công thức nấu ăn:</p>
                  <button
                    type="button"
                    onClick={handleAddStep}
                    className="px-3 py-1.5 bg-orange-50 text-orange-600 dark:bg-orange-950 dark:text-orange-400 border border-orange-200 dark:border-orange-800 rounded-xl text-xs font-bold flex items-center gap-1 hover:bg-orange-100"
                  >
                    <Plus className="w-3.5 h-3.5" /> + Thêm bước
                  </button>
                </div>

                <div className="space-y-3">
                  {stepsList.map((step, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-orange-600 dark:text-orange-400">
                          Bước {idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveStep(idx)}
                          disabled={stepsList.length <= 1}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded-lg disabled:opacity-30"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <textarea
                        rows={2}
                        placeholder="Nội dung hướng dẫn thực hiện bước này..."
                        value={step.NoiDungHuongDan}
                        onChange={(e) => handleUpdateStep(idx, 'NoiDungHuongDan', e.target.value)}
                        className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                      />

                      <input
                        type="text"
                        placeholder="Link ảnh minh họa bước này (tùy chọn)..."
                        value={step.DuongDanAnhBuoc || ''}
                        onChange={(e) => handleUpdateStep(idx, 'DuongDanAnhBuoc', e.target.value)}
                        className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer Modal */}
          <div className="flex items-center justify-between p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
            <div className="flex items-center gap-2">
              {activeTab !== 'info' && (
                <button
                  type="button"
                  onClick={() => setActiveTab(activeTab === 'steps' ? 'ingredients' : 'info')}
                  className="px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200"
                >
                  ← Quay lại
                </button>
              )}
              {activeTab !== 'steps' && (
                <button
                  type="button"
                  onClick={() => setActiveTab(activeTab === 'info' ? 'ingredients' : 'steps')}
                  className="px-3.5 py-2 bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 rounded-xl text-xs font-bold"
                >
                  Tiếp theo →
                </button>
              )}
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl text-xs font-bold shadow-md shadow-orange-500/20 disabled:opacity-50"
              >
                {loading ? 'Đang lưu CSDL...' : recipe ? 'Lưu cập nhật' : 'Tạo món ăn mới'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
