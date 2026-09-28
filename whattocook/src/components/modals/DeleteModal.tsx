import React from 'react';
import { X, AlertTriangle, Trash2 } from 'lucide-react';

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title: string;
  itemName?: string;
  loading?: boolean;
}

export const DeleteModal: React.FC<DeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  itemName,
  loading = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-md overflow-hidden animate-scaleIn">
        <div className="p-6 text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <div className="space-y-1.5">
            <h3 className="font-extrabold text-lg text-slate-900 dark:text-slate-100">
              Xác Nhận Xóa {title.toUpperCase()}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Bạn có chắc chắn muốn xóa {title} <span className="font-bold text-slate-800 dark:text-slate-200">"{itemName}"</span>?
            </p>
            <p className="text-[11px] text-rose-500 font-semibold">
              ⚠️ Hành động này sẽ cập nhật CSDL SQL Server và không thể hoàn tác!
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 transition"
            >
              Hủy bỏ
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-500/20 flex items-center gap-1.5 transition disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              {loading ? 'Đang xóa...' : 'Đồng ý xóa'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
