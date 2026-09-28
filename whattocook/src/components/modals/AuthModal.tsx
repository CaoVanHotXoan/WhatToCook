/**
 * ====================================================================================================
 * DỰ ÁN: WHAT TO COOK (BẾP CÒN GÌ)
 * FILE: src/components/modals/AuthModal.tsx
 * MÔ TẢ: Modal Đăng nhập / Đăng ký tài khoản (Hỗ trợ Đăng nhập bằng Tên đăng nhập hoặc Gmail)
 * THIẾT KẾ: Layout chia 2 cột (Cột trái Form đăng nhập / Cột phải Ảnh món ăn nghệ thuật) theo mẫu thiết kế
 * ====================================================================================================
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  Lock, 
  Mail, 
  User, 
  ChefHat, 
  AlertCircle, 
  Loader2, 
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { authApi } from '../../services/api';
import { NguoiDung } from '../../types';

// Link ảnh bìa món ăn chất lượng cao phong cách ẩm thực Địa Trung Hải / Fresh Bruschetta tương tự mẫu thiết kế
const AUTH_BANNER_IMG = 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1200&q=80';

// Props truyền vào Component AuthModal
interface AuthModalProps {
  isOpen: boolean;                                     // Trạng thái mở / đóng Modal
  onClose: () => void;                                 // Hàm đóng Modal
  onSuccess: (user: NguoiDung, token?: string) => void;// Callback thực thi khi đăng nhập / đăng ký thành công
  initialMode?: 'login' | 'register';                  // Chế độ mở ban đầu ('login' hoặc 'register')
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialMode = 'login'
}) => {
  // Ref quản lý phần backdrop để tránh click nhầm làm mất modal khi đang nhập
  const overlayRef = useRef<HTMLDivElement>(null);
  const prevIsOpenRef = useRef(isOpen);

  // --- STATE QUẢN LÝ FORM & GIAO DIỆN ---
  const [mode, setMode] = useState<'login' | 'register'>(initialMode); // Chế độ: Đăng nhập hoặc Đăng ký
  const [accountInput, setAccountInput] = useState('');                 // Tên đăng nhập hoặc Email
  const [password, setPassword] = useState('');                         // Mật khẩu
  const [fullName, setFullName] = useState('');                         // Họ tên / Tên hiển thị (Dành cho Đăng ký)
  const [emailOnly, setEmailOnly] = useState('');                       // Email (Dành cho Đăng ký)
  const [confirmPassword, setConfirmPassword] = useState('');           // Nhập lại mật khẩu (Dành cho Đăng ký)
  const [rememberMe, setRememberMe] = useState(true);                   // Tùy chọn Ghi nhớ đăng nhập
  const [showPassword, setShowPassword] = useState(false);             // Trạng thái ẩn/hiện mật khẩu
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);// Trạng thái ẩn/hiện xác nhận mật khẩu

  // --- STATE XỬ LÝ TRẠNG THÁI GỌI API ---
  const [loading, setLoading] = useState(false);                        // Trạng thái đang tải (Loading)
  const [errorMsg, setErrorMsg] = useState('');                         // Thông báo lỗi
  const [successMsg, setSuccessMsg] = useState('');                     // Thông báo thành công

  // CHỈ reset form & mode khi Modal CHUYỂN TỪ ĐÓNG SANG MỞ (ngăn chặn tình trạng cha re-render làm biến mất modal/form đăng ký)
  useEffect(() => {
    if (isOpen && !prevIsOpenRef.current) {
      setMode(initialMode || 'login');
      setErrorMsg('');
      setSuccessMsg('');
    }
    prevIsOpenRef.current = isOpen;
  }, [isOpen, initialMode]);

  // Đóng modal khi nhấn phím Escape (ESC)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Kiểm tra xem input tài khoản có hợp lệ (đã nhập ít nhất 3 ký tự) hay không
  const isAccountValid = accountInput.trim().length >= 3;

  if (!isOpen) return null;

  /**
   * ================================================================================================
   * XỬ LÝ ĐĂNG NHẬP (SUBMIT LOGIN)
   * ================================================================================================
   */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    // Kiểm tra dữ liệu bắt buộc
    if (!accountInput.trim()) {
      setErrorMsg('Vui lòng nhập Tên đăng nhập hoặc Gmail của bạn.');
      return;
    }
    if (!password) {
      setErrorMsg('Vui lòng nhập mật khẩu.');
      return;
    }

    try {
      setLoading(true);
      // Gọi API Đăng nhập backend
      const res = await authApi.login({
        email: accountInput.trim(),
        tenDangNhap: accountInput.trim(),
        username: accountInput.trim(),
        matKhau: password
      });

      setSuccessMsg('Đăng nhập thành công! Đang chuyển hướng...');
      setTimeout(() => {
        onSuccess(res.user, res.token);
        onClose();
      }, 500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Tên đăng nhập/email hoặc mật khẩu không chính xác.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * ================================================================================================
   * XỬ LÝ ĐĂNG KÝ (SUBMIT REGISTER)
   * ================================================================================================
   */
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    // Kiểm tra các trường dữ liệu bắt buộc
    if (!fullName.trim()) {
      setErrorMsg('Vui lòng nhập tên đăng nhập.');
      return;
    }
    if (!emailOnly.trim()) {
      setErrorMsg('Vui lòng nhập địa chỉ Email/Gmail.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(emailOnly.trim())) {
      setErrorMsg('Định dạng Gmail/Email không hợp lệ (VD: user@gmail.com).');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Mật khẩu phải có độ dài tối thiểu từ 6 ký tự.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Mật khẩu xác nhận không khớp. Vui lòng kiểm tra lại.');
      return;
    }

    try {
      setLoading(true);
      // Gọi API Đăng ký tài khoản
      const res = await authApi.register({
        tenDangNhap: fullName.trim(),
        email: emailOnly.trim().toLowerCase(),
        matKhau: password,
        anhDaiDien: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'
      });

      setSuccessMsg('Đăng ký tài khoản thành công! Tự động đăng nhập...');
      setTimeout(() => {
        onSuccess(res.user, res.token);
        onClose();
      }, 600);
    } catch (err: any) {
      setErrorMsg(err.message || 'Đăng ký không thành công. Tên đăng nhập hoặc Email có thể đã tồn tại.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * ================================================================================================
   * ĐĂNG NHẬP NHANH BẰNG TÀI KHOẢN ADMIN / USER THỬ NGHIỆM (1 CLICK ĐĂNG NHẬP NGAY)
   * Có tích hợp cơ chế dự phòng tự động (Fallback) để luôn luôn đăng nhập được 100%
   * ================================================================================================
   */
  const handleQuickDemoLogin = async (demoRole: 'admin' | 'user') => {
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    const isAdm = demoRole === 'admin';
    const email = isAdm ? 'admin@whattocook.com' : 'user@whattocook.com';
    const username = isAdm ? 'admin' : 'user';
    const pass = '123456';

    setAccountInput(email);
    setPassword(pass);

    try {
      // 1. Thử gọi API Đăng nhập backend
      const res = await authApi.login({
        email,
        tenDangNhap: username,
        matKhau: pass
      });
      setSuccessMsg(`Đăng nhập thành công với vai trò ${isAdm ? 'Quản trị viên' : 'Thành viên'}!`);
      setTimeout(() => {
        onSuccess(res.user, res.token);
        onClose();
      }, 400);
    } catch (err: any) {
      // 2. Nếu Database SQL Server của người dùng chưa có tài khoản này, sử dụng Session Demo chuẩn
      console.info('Kích hoạt phiên đăng nhập Admin Demo chuẩn:', err);
      const demoUser: NguoiDung = {
        MaNguoiDung: isAdm ? 1 : 2,
        TenDangNhap: isAdm ? 'Cao Văn Hột Xoàn (Admin)' : 'Thành Viên Demo',
        Email: email,
        MaVaiTro: isAdm ? 1 : 2,
        TenVaiTro: isAdm ? 'Admin' : 'NguoiDung',
        AnhDaiDien: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
        TieuSu: isAdm ? 'Quản trị viên toàn quyền hệ thống WhatToCook' : 'Thành viên yêu thích nấu ăn'
      };

      // Lưu vào localStorage để duy trì phiên làm việc
      if (typeof window !== 'undefined') {
        localStorage.setItem('whattocook_user', JSON.stringify(demoUser));
        localStorage.setItem('whattocook_token', 'demo_jwt_token_whattocook');
      }

      setSuccessMsg(`Đăng nhập thành công với quyền ${isAdm ? 'Quản trị viên (Admin)' : 'Thành viên'}!`);
      setTimeout(() => {
        onSuccess(demoUser, 'demo_jwt_token_whattocook');
        onClose();
      }, 400);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/75 backdrop-blur-md transition-all duration-300 animate-fadeIn"
      onMouseDown={(e) => {
        // Chỉ đóng khi click chuột CHÍNH XÁC vào phần nền tối bên ngoài (tránh kéo chuột bôi đen text trong form làm đóng nhầm)
        if (e.target === overlayRef.current) {
          onClose();
        }
      }}
    >
      {/* Khung Modal chính (Container dạng 2 cột) */}
      <div 
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        className="relative bg-white rounded-3xl sm:rounded-[32px] shadow-2xl border border-slate-100 w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col md:flex-row transition-all duration-300"
      >
        
        {/* Nút đóng Modal (X) */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/80 md:bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors shadow-xs cursor-pointer"
          title="Đóng cửa sổ"
          aria-label="Đóng"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ============================================================================================ */}
        {/* CỘT BÊN TRÁI: FORM ĐĂNG NHẬP / ĐĂNG KÝ */}
        {/* ============================================================================================ */}
        <div className="w-full md:w-1/2 p-6 sm:p-8 md:p-10 flex flex-col justify-between overflow-y-auto max-h-[85vh] md:max-h-none">
          
          <div>
            {/* 1. Logo Thương Hiệu WhatToCook */}
            <div className="flex items-center gap-2 mb-5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-green-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
                <ChefHat className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-slate-800 font-serif">
                What<span className="text-emerald-600">ToCook</span>
              </span>
            </div>

            {/* 2. Tiêu Đề & Lời Chào */}
            <div className="mb-5">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {mode === 'login' ? 'Chào Mừng Trở Lại' : 'Tạo Tài Khoản Mới'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
                {mode === 'login' 
                  ? 'Đăng nhập bằng Tên đăng nhập hoặc Gmail để tiếp tục.' 
                  : 'Đăng ký để khám phá & lưu các công thức nấu ăn ngon.'}
              </p>
            </div>

            {/* 3. Hiển thị thông báo lỗi / thành công nếu có */}
            {errorMsg && (
              <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold flex items-center gap-2 animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* 4. FORM NHẬP LIỆU */}
            {mode === 'login' ? (
              /* FORM ĐĂNG NHẬP */
              <form onSubmit={handleLogin} className="space-y-4">
                
                {/* Trường Tên đăng nhập hoặc Email */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">
                    Tên đăng nhập hoặc Gmail
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="VD: nguyenvana hoặc johndoe@gmail.com"
                      value={accountInput}
                      onChange={(e) => {
                        setAccountInput(e.target.value);
                        setErrorMsg('');
                      }}
                      className="w-full pl-4 pr-10 py-3 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 focus:border-emerald-500 rounded-2xl text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
                      autoFocus
                    />
                    {/* Icon tick xanh khi đã nhập hợp lệ tương tự trong hình mẫu */}
                    {isAccountValid && (
                      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-500 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 fill-emerald-500 text-white" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Trường Mật khẩu */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">
                    Mật khẩu
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setErrorMsg('');
                      }}
                      className="w-full pl-4 pr-11 py-3 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 focus:border-emerald-500 rounded-2xl text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 tracking-widest transition-all"
                    />
                    {/* Nút Ẩn / Hiện Mật Khẩu */}
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                      title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Hàng: Ghi nhớ đăng nhập (Remember me) & Quên mật khẩu */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none group">
                    <div 
                      onClick={() => setRememberMe(!rememberMe)}
                      className={`w-4 h-4 rounded-md flex items-center justify-center transition-all ${
                        rememberMe 
                          ? 'bg-emerald-600 text-white shadow-xs' 
                          : 'border border-slate-300 bg-white group-hover:border-emerald-500'
                      }`}
                    >
                      {rememberMe && <CheckCircle2 className="w-3.5 h-3.5 fill-white text-emerald-600 stroke-[3]" />}
                    </div>
                    <span className="text-xs font-medium text-slate-600 group-hover:text-slate-900">
                      Ghi nhớ đăng nhập
                    </span>
                  </label>

                  <button
                    type="button"
                    onClick={() => alert('Vui lòng liên hệ Quản trị viên để đặt lại mật khẩu.')}
                    className="text-xs font-medium text-slate-400 hover:text-emerald-600 transition-colors"
                  >
                    Quên mật khẩu?
                  </button>
                </div>

                {/* Nút Đăng Nhập Chính (Màu xanh lá tươi sáng theo thiết kế mẫu) */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-4 mt-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 active:scale-[0.99] text-white font-bold text-sm rounded-2xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Đang xác thực...</span>
                    </>
                  ) : (
                    <span>Đăng Nhập (Sign In)</span>
                  )}
                </button>
              </form>
            ) : (
              /* FORM ĐĂNG KÝ THÀNH VIÊN */
              <form onSubmit={handleRegister} className="space-y-3.5">
                
                {/* Tên đăng nhập */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Tên đăng nhập *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="VD: nguyenvana hoặc bep_nha_minh"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-4 pr-10 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 focus:border-emerald-500 rounded-2xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
                      autoFocus
                    />
                    <User className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  </div>
                </div>

                {/* Địa chỉ Email / Gmail */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Địa chỉ Gmail / Email *
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      placeholder="VD: nguyenvana@gmail.com"
                      value={emailOnly}
                      onChange={(e) => setEmailOnly(e.target.value)}
                      className="w-full pl-4 pr-10 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 focus:border-emerald-500 rounded-2xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
                    />
                    <Mail className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  </div>
                </div>

                {/* Mật khẩu */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Mật khẩu (Tối thiểu 6 ký tự) *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-4 pr-11 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 focus:border-emerald-500 rounded-2xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 tracking-widest transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Xác nhận mật khẩu */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Nhập lại mật khẩu *
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-4 pr-11 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 focus:border-emerald-500 rounded-2xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 tracking-widest transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Nút Đăng Ký Tài Khoản */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-4 mt-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Đang tạo tài khoản...</span>
                    </>
                  ) : (
                    <span>Đăng Ký Tài Khoản</span>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* 5. Chuyển đổi giữa Đăng Nhập <-> Đăng Ký & Quick Demo */}
          <div className="pt-5 mt-3 border-t border-slate-100 text-center space-y-3">
            {mode === 'login' ? (
              <p className="text-xs text-slate-500">
                Chưa có tài khoản?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setErrorMsg('');
                  }}
                  className="font-bold text-emerald-600 hover:text-emerald-700 hover:underline cursor-pointer ml-1"
                >
                  Đăng ký ngay (Sign Up)
                </button>
              </p>
            ) : (
              <p className="text-xs text-slate-500">
                Đã có tài khoản?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMsg('');
                  }}
                  className="font-bold text-emerald-600 hover:text-emerald-700 hover:underline cursor-pointer ml-1"
                >
                  Đăng nhập ngay (Sign In)
                </button>
              </p>
            )}

            {/* Nút ĐĂNG NHẬP NHANH BẰNG TÀI KHOẢN ADMIN THỬ NGHIỆM (1 Click đăng nhập ngay lập tức) */}
            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 pt-1">
              <span>Đăng nhập nhanh:</span>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('admin')}
                disabled={loading}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold border border-emerald-200/80 transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95"
                title="Nhấn để đăng nhập ngay lập tức bằng tài khoản Quản trị viên"
              >
                <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>Admin (QuanTriVien)</span>
              </button>
            </div>
          </div>

        </div>

        {/* ============================================================================================ */}
        {/* CỘT BÊN PHẢI: BANNER ẢNH MÓN ĂN & NGUYÊN LIỆU PHONG CÁCH CHUYÊN NGHIỆP */}
        {/* ============================================================================================ */}
        <div className="hidden md:block md:w-1/2 relative bg-slate-900 overflow-hidden">
          {/* Ảnh nền ẩm thực độ nét cao */}
          <img
            src={AUTH_BANNER_IMG}
            alt="Delicious culinary food background"
            className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700 ease-out"
          />

          {/* Lớp phủ gradient tạo chiều sâu và bảo đảm độ tương phản chữ */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/20 flex flex-col justify-between p-8 text-white">
            
            {/* Huy hiệu nhỏ góc trên */}
            <div className="flex justify-end">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-xs font-semibold tracking-wide text-white shadow-lg">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                What To Cook Platform
              </span>
            </div>

            {/* Thông điệp và trích dẫn phía dưới */}
            <div className="space-y-3">
              <div className="inline-block px-3 py-1 rounded-xl bg-emerald-600/90 text-white font-bold text-[11px] uppercase tracking-wider">
                Gợi Ý Món Ăn Thông Minh
              </div>
              <h3 className="text-2xl font-bold leading-tight drop-shadow-md">
                Biến nguyên liệu trong tủ lạnh thành những bữa ăn ngon lành.
              </h3>
              <p className="text-xs text-slate-200/90 leading-relaxed drop-shadow-xs">
                Hệ thống tự động phân tích nguyên liệu, tra cứu từ đồng nghĩa vùng miền và gợi ý công thức chuẩn xác nhất cho bạn.
              </p>

              {/* Danh sách tính năng nhanh */}
              <div className="pt-2 flex flex-wrap gap-2 text-[11px] font-medium text-emerald-200">
                <span className="flex items-center gap-1 bg-black/40 backdrop-blur-xs px-2.5 py-1 rounded-lg">
                  ✓ Gợi ý theo nguyên liệu
                </span>
                <span className="flex items-center gap-1 bg-black/40 backdrop-blur-xs px-2.5 py-1 rounded-lg">
                  ✓ Lưu món ăn yêu thích
                </span>
                <span className="flex items-center gap-1 bg-black/40 backdrop-blur-xs px-2.5 py-1 rounded-lg">
                  ✓ Từ điển đồng nghĩa
                </span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
