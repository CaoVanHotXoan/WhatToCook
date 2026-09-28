/**
 * =========================================================================================
 * DỰ ÁN: WHAT TO COOK - API SERVICE CLIENT
 * FILE: src/services/api.ts
 * MÔ TẢ: Cung cấp toàn bộ các hàm gọi API tương ứng 9 bảng CSDL SQL Server và Crawler
 * =========================================================================================
 */

import {
  DashboardStats,
  MonAn,
  DanhMuc,
  NguyenLieu,
  NguoiDung,
  VaiTro,
  MonAnDaLuuItem,
  PaginationMeta,
  ApiResponse,
  TuDongNghiaItem
} from '../types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * Helper function để thực hiện HTTP request
 */
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<{ data: T; pagination?: PaginationMeta }> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('whattocook_token') : null;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const resJson: ApiResponse<T> = await response.json();

  if (!response.ok || !resJson.success) {
    throw new Error(resJson.message || `Lỗi yêu cầu máy chủ (Mã: ${response.status})`);
  }

  return { data: resJson.data, pagination: resJson.pagination };
}

export const adminApi = {
  // 1. Thống kê KPI
  getStats: async (): Promise<DashboardStats> => {
    try {
      const res = await request<DashboardStats>('/stats/overview');
      return res.data;
    } catch {
      return {
        TongMonAn: 0,
        TongNguyenLieu: 0,
        TongNguoiDung: 0,
        TongLuotLuu: 0,
        TongDanhMuc: 0
      };
    }
  },

  // 2. Danh mục món ăn (DanhMuc)
  getCategories: async (): Promise<DanhMuc[]> => {
    try {
      const res = await request<DanhMuc[]>('/categories');
      return res.data || [];
    } catch {
      return [];
    }
  },

  createCategory: async (tenDanhMuc: string): Promise<DanhMuc> => {
    const res = await request<DanhMuc>('/categories', {
      method: 'POST',
      body: JSON.stringify({ tenDanhMuc })
    });
    return res.data;
  },

  updateCategory: async (id: number, tenDanhMuc: string): Promise<DanhMuc> => {
    const res = await request<DanhMuc>(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ tenDanhMuc })
    });
    return res.data;
  },

  deleteCategory: async (id: number): Promise<void> => {
    await request<void>(`/categories/${id}`, {
      method: 'DELETE'
    });
  },

  // 3. Món ăn & Công thức (MonAn, CacBuocThucHien, NguyenLieuMonAn)
  getRecipes: async (
    page = 1,
    pageSize = 10,
    search?: string,
    categoryId?: number
  ): Promise<{ items: MonAn[]; pagination: PaginationMeta }> => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
      });
      if (search) params.append('search', search);
      if (categoryId) params.append('categoryId', categoryId.toString());

      const res = await request<MonAn[]>(`/recipes?${params.toString()}`);
      return {
        items: res.data || [],
        pagination: res.pagination || { page, pageSize, totalCount: res.data?.length || 0, totalPages: 1 }
      };
    } catch {
      return {
        items: [],
        pagination: { page: 1, pageSize, totalCount: 0, totalPages: 1 }
      };
    }
  },

  getRecipeById: async (id: number): Promise<MonAn> => {
    const res = await request<MonAn>(`/recipes/${id}`);
    return res.data;
  },

  createRecipe: async (recipeData: any): Promise<MonAn> => {
    const res = await request<MonAn>('/recipes', {
      method: 'POST',
      body: JSON.stringify(recipeData)
    });
    return res.data;
  },

  updateRecipe: async (id: number, recipeData: any): Promise<MonAn> => {
    const res = await request<MonAn>(`/recipes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(recipeData)
    });
    return res.data;
  },

  deleteRecipe: async (id: number): Promise<void> => {
    await request<void>(`/recipes/${id}`, {
      method: 'DELETE'
    });
  },

  // 4. Nguyên liệu (NguyenLieu) & Từ đồng nghĩa (TuDongNghiaNguyenLieu)
  getIngredients: async (search?: string, type?: string): Promise<NguyenLieu[]> => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (type) params.append('type', type);

      const query = params.toString() ? `?${params.toString()}` : '';
      const res = await request<NguyenLieu[]>(`/ingredients${query}`);
      return res.data || [];
    } catch {
      return [];
    }
  },

  createIngredient: async (tenNguyenLieu: string, loaiNguyenLieu: string): Promise<NguyenLieu> => {
    const res = await request<NguyenLieu>('/ingredients', {
      method: 'POST',
      body: JSON.stringify({ tenNguyenLieu, loaiNguyenLieu })
    });
    return res.data;
  },

  updateIngredient: async (id: number, tenNguyenLieu: string, loaiNguyenLieu: string): Promise<NguyenLieu> => {
    const res = await request<NguyenLieu>(`/ingredients/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ tenNguyenLieu, loaiNguyenLieu })
    });
    return res.data;
  },

  deleteIngredient: async (id: number): Promise<void> => {
    await request<void>(`/ingredients/${id}`, {
      method: 'DELETE'
    });
  },

  getSynonyms: async (ingredientId: number): Promise<TuDongNghiaItem[]> => {
    try {
      const res = await request<TuDongNghiaItem[]>(`/ingredients/${ingredientId}/synonyms`);
      return res.data || [];
    } catch {
      return [];
    }
  },

  addSynonym: async (ingredientId: number, tenTuDongNghia: string): Promise<TuDongNghiaItem> => {
    const res = await request<TuDongNghiaItem>(`/ingredients/${ingredientId}/synonyms`, {
      method: 'POST',
      body: JSON.stringify({ tenTuDongNghia })
    });
    return res.data;
  },

  deleteSynonym: async (synonymId: number): Promise<void> => {
    await request<void>(`/ingredients/synonyms/${synonymId}`, {
      method: 'DELETE'
    });
  },

  // 5. Người dùng (NguoiDung) & Phân quyền (VaiTro)
  getUsers: async (
    page = 1,
    pageSize = 10,
    search?: string
  ): Promise<{ items: NguoiDung[]; pagination: PaginationMeta }> => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
      });
      if (search) params.append('search', search);

      const res = await request<NguoiDung[]>(`/users?${params.toString()}`);
      return {
        items: res.data || [],
        pagination: res.pagination || { page, pageSize, totalCount: res.data?.length || 0, totalPages: 1 }
      };
    } catch {
      return {
        items: [],
        pagination: { page: 1, pageSize, totalCount: 0, totalPages: 1 }
      };
    }
  },

  getRoles: async (): Promise<VaiTro[]> => {
    try {
      const res = await request<VaiTro[]>('/users/roles');
      return res.data || [];
    } catch {
      return [];
    }
  },

  updateUserRole: async (userId: number, maVaiTro: number): Promise<void> => {
    await request<void>(`/users/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ maVaiTro })
    });
  },

  deleteUser: async (userId: number): Promise<void> => {
    await request<void>(`/users/${userId}`, {
      method: 'DELETE'
    });
  },

  // 6. Món ăn yêu thích (MonAnDaLuu)
  getSavedFavorites: async (
    page = 1,
    pageSize = 10
  ): Promise<{ items: MonAnDaLuuItem[]; pagination: PaginationMeta }> => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
      });
      const res = await request<MonAnDaLuuItem[]>(`/favorites?${params.toString()}`);
      return {
        items: res.data || [],
        pagination: res.pagination || { page, pageSize, totalCount: res.data?.length || 0, totalPages: 1 }
      };
    } catch {
      return {
        items: [],
        pagination: { page: 1, pageSize, totalCount: 0, totalPages: 1 }
      };
    }
  },

  // 7. Crawler Cookpad
  searchCookpad: async (keyword: string): Promise<any> => {
    const res = await request<any>(`/crawler/search?keyword=${encodeURIComponent(keyword)}`);
    return res.data;
  },

  previewCookpad: async (url: string): Promise<any> => {
    const res = await request<any>('/crawler/preview', {
      method: 'POST',
      body: JSON.stringify({ url })
    });
    return res.data;
  },

  importCookpad: async (recipeData: any): Promise<any> => {
    const res = await request<any>('/crawler/import', {
      method: 'POST',
      body: JSON.stringify(recipeData)
    });
    return res.data;
  }
};
