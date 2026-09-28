import React from 'react';
import { ShieldCheck, Users } from 'lucide-react';
import { VaiTro } from '../../types';

interface RolesViewProps {
  roles: VaiTro[];
}

export const RolesView: React.FC<RolesViewProps> = ({ roles }) => {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-purple-500" /> Quản Lý Vai Trò Hệ Thống
        </h2>
        <p className="text-xs text-slate-500 mt-1">Bảng CSDL: VaiTro (Admin, ThanhVien,...)</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {roles.map((r) => (
          <div
            key={r.MaVaiTro}
            className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 hover:shadow-md transition"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">{r.TenVaiTro}</h3>
                  <p className="text-xs font-mono text-slate-400">Mã vai trò: #{r.MaVaiTro}</p>
                </div>
              </div>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {r.MoTa || 'Vai trò người dùng trong hệ thống What To Cook'}
            </p>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Users className="w-4 h-4" /> Số người dùng thuộc vai trò:
              </span>
              <span className="font-bold text-purple-600 dark:text-purple-400">
                {r.SoLuongNguoiDung !== undefined ? `${r.SoLuongNguoiDung} tài khoản` : 'Đang hoạt động'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
