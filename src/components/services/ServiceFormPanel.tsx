import { useState, type FormEvent } from 'react';
import type {
  ServiceCategoryResponse,
  UpsertServiceCategoryRequest,
} from '../../types';
import {
  SERVICE_CATEGORY_LABELS,
  SERVICE_UNITS,
} from '../../utils/constants';
import Button from '../common/Button';
import ServiceFormFields from './ServiceFormFields';
import ServiceDetailFields, { type ServiceDetailState } from './ServiceDetailFields';
import { validateServiceForm, type ServiceFormErrors } from './serviceValidation';

interface ServiceFormPanelProps {
  selectedItem: ServiceCategoryResponse | null;
  isSubmitting: boolean;
  onSave: (data: UpsertServiceCategoryRequest) => Promise<boolean>;
  onCancel: () => void;
}

export default function ServiceFormPanel({
  selectedItem,
  isSubmitting,
  onSave,
  onCancel,
}: ServiceFormPanelProps) {
  const [name, setName] = useState(selectedItem?.name ?? '');
  const [description, setDescription] = useState(selectedItem?.description ?? '');
  const [basePrice, setBasePrice] = useState(selectedItem ? String(selectedItem.basePrice) : '');
  const [unit, setUnit] = useState(selectedItem?.unit ?? SERVICE_UNITS[0]);
  const [iconUrl, setIconUrl] = useState(selectedItem?.iconUrl ?? '');
  const [errors, setErrors] = useState<ServiceFormErrors>({});
  const [detail, setDetail] = useState<ServiceDetailState>({
    minQuantity: String(selectedItem?.minQuantity ?? 1),
    maxQuantity: String(selectedItem?.maxQuantity ?? 4),
    quantityLabel: selectedItem?.quantityLabel ?? '',
    quantityHint: selectedItem?.quantityHint ?? '',
    minutesPerUnit: String(selectedItem?.minutesPerUnit ?? 60),
    requiresItemList: selectedItem?.requiresItemList ?? false,
    includes: selectedItem?.includes ?? '',
    excludes: selectedItem?.excludes ?? '',
    customerPrepares: selectedItem?.customerPrepares ?? '',
    notes: selectedItem?.notes ?? '',
  });

  const isEditing = Boolean(selectedItem);
  const panelTitle = isEditing
    ? SERVICE_CATEGORY_LABELS.FORM_EDIT_TITLE
    : SERVICE_CATEGORY_LABELS.FORM_CREATE_TITLE;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const validationErrors = validateServiceForm(
      name, basePrice, unit, detail.minQuantity, detail.maxQuantity, detail.minutesPerUnit,
    );
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    await onSave({
      name: name.trim(),
      description: description.trim() || null,
      basePrice: Number(basePrice),
      unit,
      iconUrl: iconUrl.trim() || null,
      minQuantity: Number(detail.minQuantity),
      maxQuantity: Number(detail.maxQuantity),
      quantityLabel: detail.quantityLabel.trim(),
      quantityHint: detail.quantityHint.trim(),
      minutesPerUnit: Number(detail.minutesPerUnit),
      requiresItemList: detail.requiresItemList,
      includes: detail.includes,
      excludes: detail.excludes,
      customerPrepares: detail.customerPrepares,
      notes: detail.notes,
    });
  }

  return (
    <div className="card service-form-panel">
      <div className="panel-header">
        <h3 className="panel-title">{panelTitle}</h3>
      </div>

      <form onSubmit={handleSubmit} className="service-form" noValidate>
        <ServiceFormFields
          name={name}
          setName={setName}
          description={description}
          setDescription={setDescription}
          basePrice={basePrice}
          setBasePrice={setBasePrice}
          unit={unit}
          setUnit={setUnit}
          iconUrl={iconUrl}
          setIconUrl={setIconUrl}
          errors={errors}
          setErrors={setErrors}
          isSubmitting={isSubmitting}
        />

        <ServiceDetailFields
          unit={unit}
          value={detail}
          onChange={(patch) => {
            setDetail((prev) => ({ ...prev, ...patch }));
            if (errors.quantity || errors.minutes) setErrors((prev) => ({ ...prev, quantity: undefined, minutes: undefined }));
          }}
          errors={errors}
          isSubmitting={isSubmitting}
        />

        <div className="panel-actions">
          {isEditing && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              {SERVICE_CATEGORY_LABELS.BTN_CANCEL}
            </Button>
          )}
          <Button
            type="submit"
            variant="primary"
            loading={isSubmitting}
          >
            {isEditing
              ? SERVICE_CATEGORY_LABELS.BTN_SAVE
              : SERVICE_CATEGORY_LABELS.BTN_CREATE}
          </Button>
        </div>
      </form>
    </div>
  );
}
