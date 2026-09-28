import React, { useState, useEffect } from 'react';
import { X, Carrot } from 'lucide-react';
import { NguyenLieu } from '../../types';

interface IngredientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (ten: string, loai: 'Chinh' | 'GiaVi') => Promise<void>;
  ingredient: NguyenLieu | null;
}

export const IngredientModal: React.FC<IngredientModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  ingredient
}) => {
  const [ten, setTen] = useState('');
  const [loai, setLoai] = useState<'Chinh' | 'GiaVi'>('Chinh');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (ingredient) {
      setTen(ingredient.TenNguyenLieu);
      setLoai(ingredient.LoaiNguyenLieu === 'GiaVi' ? 'GiaVi' : 'Chinh');
    } else {
      setTen('');
      setLoai('Chinh');
    }
    setError('');
  }, [ingredient, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ten.trim()) {
      setError('Vui lòng nhập tên nguyên liệu');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await onSubmit(ten.trim(), loai);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Lỗi khi lưu nguyên liệu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-md overflow-hidden animate-scaleIn">
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Carrot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                {ingredient ? 'Chỉnh Sửa Nguyên Liệu' : 'Thêm Nguyên Liệu Mới'}
              </h3>
              <p className="text-[11px] text-slate-400">Bảng CSDL: NguyenLieu</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs font-semibold">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Tên nguyên liệu chuẩn *
            </label>
            <input
              type="text"
              placeholder="VD: Thịt ba chỉ, Trứng gà, Cà chua, Nước mắm..."
              value={ten}
              onChange={(e) => setTen(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Phân loại nguyên liệu
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label
                className={`p-3 rounded-xl border flex items-center gap-2 cursor-pointer transition ${
                  loai === 'Chinh'
                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="loai"
                  value="Chinh"
                  checked={loai === 'Chinh'}
                  onChange={() => setLoai('Chinh')}
                  className="hidden"
                />
                <span>🥩 Nguyên liệu chính</span>
              </label>

              <label
                className={`p-3 rounded-xl border flex items-center gap-2 cursor-pointer transition ${
                  loai === 'GiaVi'
                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="loai"
                  value="GiaVi"
                  checked={loai === 'GiaVi'}
                  onChange={() => setLoai('GiaVi')}
                  className="hidden"
                />
                <span>🧂 Gia vị / Phụ liệu</span>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
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
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 disabled:opacity-50"
            >
              {loading ? 'Đang lưu...' : ingredient ? 'Cập nhật' : 'Thêm mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
