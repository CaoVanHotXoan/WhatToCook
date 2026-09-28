import React, { useState, useEffect } from 'react';
import { Languages, Plus, Trash2, Search, ArrowRight } from 'lucide-react';
import { NguyenLieu, TuDongNghiaItem } from '../../types';
import { adminApi } from '../../services/api';

interface SynonymsViewProps {
  ingredients: NguyenLieu[];
  onAdd: () => void;
  onDelete: (item: { MaTuDongNghia: number; TenTuDongNghia: string }) => void;
}

export const SynonymsView: React.FC<SynonymsViewProps> = ({
  ingredients,
  onAdd,
  onDelete
}) => {
  const [selectedIngredientId, setSelectedIngredientId] = useState<number | ''>('');
  const [synonyms, setSynonyms] = useState<TuDongNghiaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const loadSynonyms = async (id: number) => {
    try {
      setLoading(true);
      const data = await adminApi.getSynonyms(id);
      setSynonyms(data);
    } catch {
      setSynonyms([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (ingredients.length > 0 && selectedIngredientId === '') {
      setSelectedIngredientId(ingredients[0].MaNguyenLieu);
      loadSynonyms(ingredients[0].MaNguyenLieu);
    }
  }, [ingredients]);

  const handleSelectIngredient = (id: number) => {
    setSelectedIngredientId(id);
    loadSynonyms(id);
  };

  const filteredIngredients = ingredients.filter(i =>
    i.TenNguyenLieu.toLowerCase().includes(search.toLowerCase())
  );

  const currentIngredient = ingredients.find(i => i.MaNguyenLieu === selectedIngredientId);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Languages className="w-6 h-6 text-indigo-500" /> Quản Lý Từ Đồng Nghĩa Miền
          </h2>
          <p className="text-xs text-slate-500 mt-1">Bảng CSDL: TuDongNghiaNguyenLieu (Bắc - Trung - Nam)</p>
        </div>
        <button
          onClick={onAdd}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold flex items-center gap-2 shadow-md transition"
        >
          <Plus className="w-4 h-4" /> + Thêm từ đồng nghĩa
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Cột trái: Chọn Nguyên Liệu */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm nguyên liệu gốc..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
            />
          </div>

          <div className="max-h-[500px] overflow-y-auto space-y-1.5 scrollbar-thin">
            {filteredIngredients.map((item) => {
              const isSelected = selectedIngredientId === item.MaNguyenLieu;
              return (
                <button
                  key={item.MaNguyenLieu}
                  onClick={() => handleSelectIngredient(item.MaNguyenLieu)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition ${
                    isSelected
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span>{item.TenNguyenLieu}</span>
                  <ArrowRight className="w-3.5 h-3.5 opacity-50" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Cột phải: Danh sách từ đồng nghĩa của nguyên liệu được chọn */}
        <div className="md:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                Từ đồng nghĩa cho: <span className="text-indigo-600 dark:text-indigo-400">{currentIngredient?.TenNguyenLieu || 'Chưa chọn'}</span>
              </h3>
              <p className="text-xs text-slate-400">Giúp hệ thống nhận diện nguyên liệu người dùng nhập theo tiếng địa phương</p>
            </div>
            <button
              onClick={onAdd}
              className="px-3 py-1.5 text-xs bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 rounded-lg font-semibold hover:bg-indigo-100"
            >
              + Thêm mới
            </button>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400">Đang tải từ đồng nghĩa...</div>
          ) : synonyms.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              Chưa có từ đồng nghĩa nào cho nguyên liệu này. Hãy bấm <b>"+ Thêm từ đồng nghĩa"</b> để thêm.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {synonyms.map((syn) => (
                <div
                  key={syn.MaTuDongNghia}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                    <span className="font-bold text-sm text-slate-800 dark:text-slate-200">{syn.TenTuDongNghia}</span>
                  </div>
                  <button
                    onClick={() => onDelete(syn)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    title="Xóa từ đồng nghĩa"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
