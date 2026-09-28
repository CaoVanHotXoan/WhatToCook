import React, { useState, useEffect } from 'react';
import { X, ShieldCheck } from 'lucide-react';
import { NguoiDung, VaiTro } from '../../types';

interface UserRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (userId: number, maVaiTro: number) => Promise<void>;
  user: NguoiDung | null;
  roles: VaiTro[];
}

export const UserRoleModal: React.FC<UserRoleModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  user,
  roles
}) => {
  const [selectedRole, setSelectedRole] = useState<number>(2);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setSelectedRole(user.MaVaiTro || 2);
    }
    setError('');
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      await onSubmit(user.MaNguoiDung, selectedRole);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Lỗi khi cập nhật vai trò');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-md overflow-hidden animate-scaleIn">
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">Phân Quyền Người Dùng</h3>
              <p className="text-[11px] text-slate-400">Tài khoản: @{user.TenDangNhap}</p>
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

          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 text-xs space-y-1">
            <p className="font-bold text-slate-900 dark:text-slate-100">{user.HoTen || user.TenDangNhap}</p>
            <p className="text-slate-500">{user.Email}</p>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Chọn vai trò hệ thống *
            </label>
            <div className="space-y-2">
              {roles.map((r) => (
                <label
                  key={r.MaVaiTro}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                    selectedRole === r.MaVaiTro
                      ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-bold'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="role"
                      value={r.MaVaiTro}
                      checked={selectedRole === r.MaVaiTro}
                      onChange={() => setSelectedRole(r.MaVaiTro)}
                      className="hidden"
                    />
                    <span>{r.TenVaiTro}</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-normal">{r.MoTa}</span>
                </label>
              ))}
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
              className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-500/20 disabled:opacity-50"
            >
              {loading ? 'Đang lưu...' : 'Lưu phân quyền'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
