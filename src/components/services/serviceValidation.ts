import { SERVICE_CATEGORY_LABELS, SERVICE_UNITS } from '../../utils/constants';

export interface ServiceFormErrors {
  name?: string;
  price?: string;
  unit?: string;
  quantity?: string;
  minutes?: string;
}

export function validateServiceForm(
  name: string,
  basePrice: string,
  unit: string,
  minQuantity = '1',
  maxQuantity = '1',
  minutesPerUnit = '60',
): ServiceFormErrors {
  const errors: ServiceFormErrors = {};
  const cleanName = name.trim();

  if (!cleanName || cleanName.length < 2 || cleanName.length > 100) {
    errors.name = SERVICE_CATEGORY_LABELS.VALIDATION_NAME_REQUIRED;
  }

  const priceNum = Number(basePrice);
  if (
    !basePrice ||
    Number.isNaN(priceNum) ||
    priceNum <= 0 ||
    !Number.isInteger(priceNum) ||
    priceNum > 100000000
  ) {
    errors.price = SERVICE_CATEGORY_LABELS.VALIDATION_PRICE_INVALID;
  }

  if (!unit || !SERVICE_UNITS.includes(unit as (typeof SERVICE_UNITS)[number])) {
    errors.unit = SERVICE_CATEGORY_LABELS.VALIDATION_UNIT_REQUIRED;
  }

  // SRS v1.8 – số lượng mỗi đơn (BR-B01) & thời lượng ước tính (BR-B02)
  const min = Number(minQuantity);
  const max = Number(maxQuantity);
  const isQty = (n: number) => Number.isInteger(n) && n >= 1 && n <= 50;
  if (!isQty(min) || !isQty(max)) {
    errors.quantity = 'Số lượng tối thiểu / tối đa là số nguyên từ 1 đến 50.';
  } else if (min > max) {
    errors.quantity = 'Số lượng tối thiểu không được lớn hơn số lượng tối đa.';
  }

  const minutes = Number(minutesPerUnit);
  if (!Number.isInteger(minutes) || minutes < 10 || minutes > 720) {
    errors.minutes = 'Thời lượng mỗi đơn vị từ 10 đến 720 phút.';
  }

  return errors;
}
