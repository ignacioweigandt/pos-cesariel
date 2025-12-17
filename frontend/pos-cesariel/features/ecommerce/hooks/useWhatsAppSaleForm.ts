import { useState } from 'react';
import { ecommerceAdvancedApi } from '@/lib/api';
import toast from 'react-hot-toast';
import type { WhatsAppSale } from './useWhatsAppSales';

export interface WhatsAppFormData {
  sale_id: number;
  customer_whatsapp: string;
  customer_name: string;
  customer_address: string;
  shipping_method: string;
  shipping_cost: number;
  notes: string;
}

const DEFAULT_FORM_DATA: WhatsAppFormData = {
  sale_id: 0,
  customer_whatsapp: '',
  customer_name: '',
  customer_address: '',
  shipping_method: 'delivery',
  shipping_cost: 0,
  notes: '',
};

/**
 * Hook para manejar formulario de venta WhatsApp
 */
export function useWhatsAppSaleForm() {
  const [formData, setFormData] = useState<WhatsAppFormData>(DEFAULT_FORM_DATA);
  const [editingSale, setEditingSale] = useState<WhatsAppSale | null>(null);
  const [showForm, setShowForm] = useState(false);

  const openForm = () => setShowForm(true);

  const closeForm = () => {
    setShowForm(false);
    setEditingSale(null);
    setFormData(DEFAULT_FORM_DATA);
  };

  const editSale = (whatsappSale: WhatsAppSale) => {
    setEditingSale(whatsappSale);
    setFormData({
      sale_id: whatsappSale.sale_id,
      customer_whatsapp: whatsappSale.customer_whatsapp,
      customer_name: whatsappSale.customer_name,
      customer_address: whatsappSale.customer_address || '',
      shipping_method: whatsappSale.shipping_method || 'delivery',
      shipping_cost: whatsappSale.shipping_cost,
      notes: whatsappSale.notes || '',
    });
    setShowForm(true);
  };

  const validateForm = (): boolean => {
    if (!formData.customer_whatsapp.trim()) {
      toast.error('El número de WhatsApp es requerido');
      return false;
    }

    if (!formData.customer_name.trim()) {
      toast.error('El nombre del cliente es requerido');
      return false;
    }

    if (!editingSale && !formData.sale_id) {
      toast.error('Debe seleccionar una venta');
      return false;
    }

    return true;
  };

  const submitForm = async (onSuccess?: () => void): Promise<boolean> => {
    if (!validateForm()) {
      return false;
    }

    try {
      if (editingSale) {
        await ecommerceAdvancedApi.updateWhatsAppSale(editingSale.id, {
          customer_whatsapp: formData.customer_whatsapp,
          customer_name: formData.customer_name,
          customer_address: formData.customer_address || null,
          shipping_method: formData.shipping_method || null,
          shipping_cost: formData.shipping_cost,
          notes: formData.notes || null,
        });
        toast.success('Venta WhatsApp actualizada exitosamente');
      } else {
        await ecommerceAdvancedApi.createWhatsAppSale({
          sale_id: formData.sale_id,
          customer_whatsapp: formData.customer_whatsapp,
          customer_name: formData.customer_name,
          customer_address: formData.customer_address || null,
          shipping_method: formData.shipping_method || null,
          shipping_cost: formData.shipping_cost,
          notes: formData.notes || null,
        });
        toast.success('Venta WhatsApp creada exitosamente');
      }

      if (onSuccess) {
        onSuccess();
      }

      closeForm();
      return true;
    } catch (error: any) {
      console.error('Error saving WhatsApp sale:', error);
      const errorMessage =
        error.response?.data?.detail || 'Error guardando venta WhatsApp';
      toast.error(errorMessage);
      return false;
    }
  };

  return {
    formData,
    setFormData,
    editingSale,
    showForm,
    openForm,
    closeForm,
    editSale,
    submitForm,
  };
}
