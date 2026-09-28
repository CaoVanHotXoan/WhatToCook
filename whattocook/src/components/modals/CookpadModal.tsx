import React, { useState } from 'react';
import { X, Globe, Search, Download, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { DanhMuc } from '../../types';
import { adminApi } from '../../services/api';

interface CookpadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  categories: DanhMuc[];
}

export const CookpadModal: React.FC<CookpadModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  categories
}) => {
  const [keyword, setKeyword] = useState('');
  const [recipeUrl, setRecipeUrl] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'url' | 'search'>('url');

  if (!isOpen) return null;

  const handleSearchCookpad = async () => {
    if (!keyword.trim()) return;
    try {
      setLoading(true);
      setError('');
      const data = await adminApi.searchCookpad(keyword.trim());
      setSearchResults(data || []);
    } catch (err: any) {
      setError(err.message || 'Lỗi khi tìm kiếm trên Cookpad');
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = async (urlToPreview?: string) => {
    const targetUrl = urlToPreview || recipeUrl;
    if (!targetUrl.trim()) {
      setError('Vui lòng nhập link công thức Cookpad');
      return;
    }
    try {
      setLoading(true);
      setError('');
      const data = await adminApi.previewCookpad(targetUrl.trim());
      setPreviewData(data);
      if (urlToPreview) setRecipeUrl(urlToPreview);
    } catch (err: any) {
      setError(err.message || 'Lỗi khi cào dữ liệu từ đường link này');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!previewData && !recipeUrl) {
      setError('Chưa có dữ liệu để import');
      return;
    }
    try {
      setLoading(true);
      setError('');
      await adminApi.importCookpad({
        url: recipeUrl,
        maDanhMuc: selectedCategory || (categories.length > 0 ? categories[0].MaDanhMuc : null),
        ...previewData
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Lỗi khi lưu công thức vào CSDL');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-scaleIn">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                Cào Dữ Liệu Tự Động Từ Cookpad
              </h3>
              <p className="text-[11px] text-slate-400">Trích xuất tự động: Tên món, Nguyên liệu, Các bước và Ảnh</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab selector */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 px-6 pt-3 gap-4">
          <button
            onClick={() => setActiveTab('url')}
            className={`pb-3 text-xs font-bold transition border-b-2 ${
              activeTab === 'url'
                ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Nhập URL Trực Tiếp
          </button>
          <button
            onClick={() => setActiveTab('search')}
            className={`pb-3 text-xs font-bold transition border-b-2 ${
              activeTab === 'search'
                ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Tìm Kiếm Trên Cookpad
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 scrollbar-thin">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {activeTab === 'url' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Đường dẫn công thức Cookpad (URL) *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="VD: https://cookpad.com/vn/cong-thuc/1234567-thit-kho-tau"
                    value={recipeUrl}
                    onChange={(e) => setRecipeUrl(e.target.value)}
                    className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <button
                    type="button"
                    onClick={() => handlePreview()}
                    disabled={loading}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white dark:bg-slate-700 dark:hover:bg-slate-600 rounded-xl text-xs font-bold disabled:opacity-50"
                  >
                    {loading ? 'Đang đọc...' : 'Xem trước'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Nhập tên món cần tìm trên Cookpad (VD: sườn xào chua ngọt)..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                />
                <button
                  type="button"
                  onClick={handleSearchCookpad}
                  disabled={loading}
                  className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Search className="w-4 h-4" /> Tìm kiếm
                </button>
              </div>

              {searchResults.length > 0 && (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {searchResults.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        {item.image && (
                          <img src={item.image} alt={item.title} className="w-10 h-10 rounded-lg object-cover" />
                        )}
                        <div>
                          <p className="font-bold text-xs text-slate-900 dark:text-slate-100">{item.title}</p>
                          <p className="text-[11px] text-slate-400">{item.author || 'Tác giả Cookpad'}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handlePreview(item.url)}
                        className="px-3 py-1.5 text-xs bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300 rounded-lg font-semibold hover:bg-orange-200"
                      >
                        Chọn cào
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Xem trước dữ liệu sau khi cào */}
          {previewData && (
            <div className="p-4 bg-orange-50/50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/50 rounded-2xl space-y-3 animate-fadeIn">
              <div className="flex items-center gap-2 text-xs font-bold text-orange-600 dark:text-orange-400">
                <Sparkles className="w-4 h-4" /> Dữ liệu trích xuất thành công:
              </div>

              <div className="flex gap-3">
                {previewData.duongDanAnhChinh && (
                  <img
                    src={previewData.duongDanAnhChinh}
                    alt={previewData.tenMonAn}
                    className="w-16 h-16 rounded-xl object-cover"
                  />
                )}
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">{previewData.tenMonAn}</h4>
                  <p className="text-xs text-slate-500">Tác giả: {previewData.tenTacGia || 'Cookpad'}</p>
                  <p className="text-xs text-slate-500">
                    {previewData.nguyenLieu?.length || 0} nguyên liệu • {previewData.cacBuoc?.length || 0} bước nấu
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Chọn danh mục lưu vào CSDL:
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                >
                  <option value="">-- Mặc định --</option>
                  {categories.map((c) => (
                    <option key={c.MaDanhMuc} value={c.MaDanhMuc}>
                      {c.TenDanhMuc}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2.5 p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300"
          >
            Đóng
          </button>
          <button
            type="button"
            onClick={handleImport}
            disabled={loading || !recipeUrl}
            className="px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl text-xs font-bold shadow-md shadow-orange-500/20 flex items-center gap-1.5 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {loading ? 'Đang Import...' : 'Cào & Lưu Vào CSDL'}
          </button>
        </div>
      </div>
    </div>
  );
};
