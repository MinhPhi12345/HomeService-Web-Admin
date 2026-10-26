import { SERVICE_CATEGORY_LABELS, SERVICE_UNITS } from '../../utils/constants';

export interface ServiceFormErrors {
  name?: string;
  price?: string;
  unit?: string;
}

export function validateServiceForm(
  name: string,
  basePrice: string,
  unit: string,
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

  return errors;
}
