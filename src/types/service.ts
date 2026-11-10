export interface ServiceCategoryResponse {
  id: number;
  name: string;
  description?: string | null;
  basePrice: number;
  unit: string;
  iconUrl?: string | null;
  isActive: boolean;
  // SRS v1.8 – số lượng theo dịch vụ, thời lượng ước tính, hạng mục (BR-B01, BR-B02, BR-B05)
  minQuantity: number;
  maxQuantity: number;
  quantityLabel?: string | null;
  quantityHint?: string | null;
  minutesPerUnit: number;
  requiresItemList: boolean;
  // SRS v1.8 – chi tiết dịch vụ hiện cho khách (mỗi dòng một ý)
  includes?: string | null;
  excludes?: string | null;
  customerPrepares?: string | null;
  notes?: string | null;
}

export type ServiceCategory = ServiceCategoryResponse;

export interface UpsertServiceCategoryRequest {
  name: string;
  description?: string | null;
  basePrice: number;
  unit: string;
  iconUrl?: string | null;
  minQuantity: number;
  maxQuantity: number;
  quantityLabel: string;
  quantityHint: string;
  minutesPerUnit: number;
  requiresItemList: boolean;
  includes: string;
  excludes: string;
  customerPrepares: string;
  notes: string;
}
