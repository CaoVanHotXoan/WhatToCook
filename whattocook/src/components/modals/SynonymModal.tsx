import React, { useState, useEffect } from 'react';
import { X, Languages } from 'lucide-react';
import { NguyenLieu } from '../../types';

interface SynonymModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (maNL: number, tuDongNghia: string) => Promise<void>;
  ingredients: NguyenLieu[];
  selectedIngredientId?: number;
}

export const SynonymModal: React.FC<SynonymModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  ingredients,
  selectedIngredientId
}) => {
  const [maNL, setMaNL] = useState<number | ''>('');
  const [tuDongNghia, setTuDongNghia] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (selectedIngredientId) {
      setMaNL(selectedIngredientId);
    } else if (ingredients.length > 0) {
      setMaNL(ingredients[0].MaNguyenLieu);
    }
    setTuDongNghia('');
    setError('');
  }, [selectedIngredientId, ingredients, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!maNL) {
      setError('Vui lòng chọn nguyên liệu gốc');
      return;
    }
    if (!tuDongNghia.trim()) {
      setError('Vui lòng nhập từ đồng nghĩa');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await onSubmit(Number(maNL), tuDongNghia.trim());
      onClose();
    } catch (err: any) {
      setError(err.message || 'Lỗi khi thêm từ đồng nghĩa');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-md overflow-hidden animate-scaleIn">
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Languages className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">Thêm Từ Đồng Nghĩa Vùng Miền</h3>
              <p className="text-[11px] text-slate-400">Bảng CSDL: TuDongNghiaNguyenLieu</p>
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
              Nguyên liệu chuẩn (gốc) *
            </label>
            <select
              value={maNL}
              onChange={(e) => setMaNL(Number(e.target.value))}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {ingredients.map((ing) => (
                <option key={ing.MaNguyenLieu} value={ing.MaNguyenLieu}>
                  {ing.TenNguyenLieu} ({ing.LoaiNguyenLieu === 'Chinh' ? 'Chính' : 'Gia vị'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Từ đồng nghĩa / tên gọi địa phương *
            </label>
            <input
              type="text"
              placeholder="VD: Quả rọi, Dọi heo, Ngò gai, Mùi tàu, Mướp đắng..."
              value={tuDongNghia}
              onChange={(e) => setTuDongNghia(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              autoFocus
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Ví dụ: Người miền Nam gọi "thịt ba chỉ" là "thịt ba rọi".
            </p>
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
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/20 disabled:opacity-50"
            >
              {loading ? 'Đang thêm...' : 'Lưu từ đồng nghĩa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
