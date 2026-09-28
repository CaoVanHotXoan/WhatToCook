import React from 'react';
import { Users, Search, ShieldCheck, Trash2, Mail, Calendar } from 'lucide-react';
import { NguoiDung, PaginationMeta } from '../../types';

interface UsersViewProps {
  users: NguoiDung[];
  pagination: PaginationMeta;
  search: string;
  onSearchChange: (val: string) => void;
  onPageChange: (page: number) => void;
  onChangeRole: (user: NguoiDung) => void;
  onDelete: (user: NguoiDung) => void;
}

export const UsersView: React.FC<UsersViewProps> = ({
  users,
  pagination,
  search,
  onSearchChange,
  onPageChange,
  onChangeRole,
  onDelete
}) => {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-500" /> Quản Lý Tài Khoản Người Dùng
          </h2>
          <p className="text-xs text-slate-500 mt-1">Bảng CSDL: NguoiDung • Phân quyền vai trò</p>
        </div>
      </div>

      {/* Thanh tìm kiếm */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên đăng nhập hoặc email..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
          />
        </div>
      </div>

      {/* Bảng danh sách người dùng */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
            <tr>
              <th className="px-5 py-3.5 w-20">Mã</th>
              <th className="px-5 py-3.5">Người dùng</th>
              <th className="px-5 py-3.5">Email</th>
              <th className="px-5 py-3.5">Vai trò</th>
              <th className="px-5 py-3.5">Ngày tham gia</th>
              <th className="px-5 py-3.5 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {users.map((u) => {
              const isAdmin = u.TenVaiTro === 'Admin' || u.MaVaiTro === 1;
              return (
                <tr key={u.MaNguoiDung} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                  <td className="px-5 py-3.5 font-mono text-xs text-slate-400">#{u.MaNguoiDung}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xs uppercase">
                        {u.TenDangNhap ? u.TenDangNhap.substring(0, 2) : 'US'}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-slate-100">{u.HoTen || u.TenDangNhap}</p>
                        <p className="text-xs text-slate-400">@{u.TenDangNhap}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>{u.Email}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        isAdmin
                          ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                          : 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                      }`}
                    >
                      <ShieldCheck className="w-3 h-3" />
                      {u.TenVaiTro || (isAdmin ? 'Admin' : 'Thành viên')}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-slate-400">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {u.NgayTao ? new Date(u.NgayTao).toLocaleDateString('vi-VN') : 'N/A'}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onChangeRole(u)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1 transition"
                        title="Phân quyền vai trò"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" /> Đổi vai trò
                      </button>
                      <button
                        onClick={() => onDelete(u)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Xóa tài khoản"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Phân trang */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
          <span>
            Hiển thị trang {pagination.page} / {pagination.totalPages} ({pagination.totalCount} người dùng)
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
