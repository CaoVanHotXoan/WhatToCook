import React from 'react';
import { Heart, Utensils, Calendar, Clock } from 'lucide-react';
import { MonAnDaLuuItem, PaginationMeta } from '../../types';

interface FavoritesViewProps {
  favorites: MonAnDaLuuItem[];
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
}

export const FavoritesView: React.FC<FavoritesViewProps> = ({
  favorites,
  pagination,
  onPageChange
}) => {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Heart className="w-6 h-6 text-rose-500" /> Thống Kê Món Ăn Yêu Thích
        </h2>
        <p className="text-xs text-slate-500 mt-1">Bảng CSDL: MonAnDaLuu (Lượt bookmark của người dùng)</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
            <tr>
              <th className="px-5 py-3.5">Món ăn đã lưu</th>
              <th className="px-5 py-3.5">Danh mục</th>
              <th className="px-5 py-3.5">Thời gian nấu</th>
              <th className="px-5 py-3.5">Người đăng món</th>
              <th className="px-5 py-3.5 text-right">Ngày lưu</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {favorites.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-xs text-slate-400">
                  Chưa có dữ liệu món ăn được lưu yêu thích.
                </td>
              </tr>
            ) : (
              favorites.map((fav, idx) => (
                <tr key={fav.MaLuu || idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <img
                        src={fav.DuongDanAnhChinh || 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=120'}
                        alt={fav.TenMonAn}
                        className="w-12 h-12 rounded-xl object-cover"
                      />
                      <div>
                        <p className="font-bold text-slate-900 dark:text-slate-100">{fav.TenMonAn}</p>
                        <p className="text-xs text-slate-400">Khẩu phần: {fav.KhauPhan || 4} người</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300">
                      {fav.TenDanhMuc || 'Món chính'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{fav.ThoiGianNau || 30} phút</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-slate-600 dark:text-slate-300">
                    {fav.TenTacGia || 'Hệ thống'}
                  </td>
                  <td className="px-5 py-3.5 text-right text-xs text-slate-400">
                    <div className="flex items-center justify-end gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{fav.NgayLuu ? new Date(fav.NgayLuu).toLocaleDateString('vi-VN') : 'Gần đây'}</span>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
          <span>
            Hiển thị trang {pagination.page} / {pagination.totalPages} ({pagination.totalCount} lượt lưu)
          </span>
          <div className="flex items-center gap-1.5">
            <button
              disabled={pagination.page <= 1}
              onClick={() => onPageChange(pagination.page - 1)}
              className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg disabled:opacity-40"
            >
              Trang trước
            </button>
            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => onPageChange(pagination.page + 1)}
              className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg disabled:opacity-40"
            >
              Trang sau
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
