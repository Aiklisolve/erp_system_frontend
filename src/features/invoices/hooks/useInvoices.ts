import { useEffect, useState } from 'react';
import type { Invoice, InvoiceStatus, InvoiceType } from '../types';
import * as api from '../api/invoicesApi';
import { useToast } from '../../../hooks/useToast';

export function useInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void refresh();
  }, []);

  const refresh = async (params?: {
    status?: InvoiceStatus;
    invoice_type?: InvoiceType;
    customer_id?: string;
    start_date?: string;
    end_date?: string;
    search?: string;
  }) => {
    setLoading(true);
    try {
      const data = await api.listInvoices(params);
      setInvoices(data);
    } catch (error) {
      console.error('Error refreshing invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const create = async (invoice: Partial<Invoice>) => {
    const created = await api.createInvoice(invoice);
    setInvoices((prev) => [created, ...prev]);
    return created;
  };

  const update = async (id: string, invoice: Partial<Invoice>) => {
    const updated = await api.updateInvoice(id, invoice);
    setInvoices((prev) => prev.map((inv) => (inv.id === id ? updated : inv)));
    return updated;
  };

  const remove = async (id: string) => {
    await api.deleteInvoice(id);
    setInvoices((prev) => prev.filter((inv) => inv.id !== id));
  };

  const send = async (id: string) => {
    const sent = await api.sendInvoice(id);
    setInvoices((prev) => prev.map((inv) => (inv.id === id ? sent : inv)));
    return sent;
  };

  const markPaid = async (id: string, paymentData: {
    payment_amount: number;
    payment_method: string;
    payment_reference?: string;
    payment_date?: string;
    notes?: string;
  }) => {
    const paid = await api.markInvoicePaid(id, paymentData);
    setInvoices((prev) => prev.map((inv) => (inv.id === id ? paid : inv)));
    return paid;
  };

  const downloadPDF = async (id: string) => {
    return await api.downloadInvoicePDF(id);
  };

  return {
    invoices,
    loading,
    create,
    update,
    remove,
    send,
    markPaid,
    downloadPDF,
    refresh
  };
}

