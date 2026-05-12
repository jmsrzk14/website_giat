import axiosInstance from '@/lib/axios';
import { API_ENDPOINTS } from '@/lib/constants';
import { Category, CreateCategoryRequest } from '@/types/category.types';
import { PaginationParams } from '@/types/common.types';

export class CategoryRepository {
  endpoint = API_ENDPOINTS.CATEGORY.BASE;

  async create(data: CreateCategoryRequest): Promise<Category> {
    return (await axiosInstance.post(`${this.endpoint}/create`, data)).data.data;
  }

  async getAll(params?: PaginationParams): Promise<{ data: Category[]; pagination: any }> {
    return (await axiosInstance.get(`${this.endpoint}/all`, { params })).data;
  }

  async getById(id: string): Promise<Category> {
    return (await axiosInstance.get(`${this.endpoint}/${id}`)).data.data;
  }

  async update(id: string, data: Partial<CreateCategoryRequest>): Promise<Category> {
    return (await axiosInstance.put(`${this.endpoint}/${id}/edit`, data)).data.data;
  }

  async delete(id: string): Promise<void> {
    return (await axiosInstance.delete(`${this.endpoint}/${id}/delete`)).data;
  }

  async incrementViewCount(id: string): Promise<void> {
    return (await axiosInstance.post(`${this.endpoint}/${id}/view`)).data;
  }
}
