export interface ServiceCategoryResponse {
  id: number;
  name: string;
  description?: string | null;
  basePrice: number;
  unit: string;
  iconUrl?: string | null;
  isActive: boolean;
}

export type ServiceCategory = ServiceCategoryResponse;

export interface UpsertServiceCategoryRequest {
  name: string;
  description?: string | null;
  basePrice: number;
  unit: string;
  iconUrl?: string | null;
}
