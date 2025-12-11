import { apiRequest } from '../../../config/api';
import type { Invoice, InvoiceStatus, InvoiceType } from '../types';

// Toggle to use backend API
const USE_BACKEND_API = true;

// Map backend invoice response to frontend Invoice type
function mapBackendInvoice(backendInvoice: any): Invoice {
  return {
    id: String(backendInvoice.id || backendInvoice.invoice_id || ''),
    invoice_number: backendInvoice.invoice_number || backendInvoice.invoiceNumber || '',
    invoice_code: backendInvoice.invoice_code || backendInvoice.invoiceCode || undefined,
    invoice_type: backendInvoice.invoice_type || backendInvoice.invoiceType || 'SALES',
    status: backendInvoice.status || 'DRAFT',
    
    // Customer/Vendor Information
    customer_id: backendInvoice.customer_id ? String(backendInvoice.customer_id) : undefined,
    customer_name: backendInvoice.customer_name || backendInvoice.customerName || '',
    customer_email: backendInvoice.customer_email || backendInvoice.customerEmail || undefined,
    customer_phone: backendInvoice.customer_phone || backendInvoice.customerPhone || undefined,
    customer_address: backendInvoice.customer_address || backendInvoice.customerAddress || undefined,
    customer_city: backendInvoice.customer_city || backendInvoice.customerCity || undefined,
    customer_state: backendInvoice.customer_state || backendInvoice.customerState || undefined,
    customer_postal_code: backendInvoice.customer_postal_code || backendInvoice.customerPostalCode || undefined,
    customer_country: backendInvoice.customer_country || backendInvoice.customerCountry || undefined,
    customer_tax_id: backendInvoice.customer_tax_id || backendInvoice.customerTaxId || undefined,
    
    // Invoice Dates
    invoice_date: backendInvoice.invoice_date || backendInvoice.invoiceDate || new Date().toISOString().split('T')[0],
    due_date: backendInvoice.due_date || backendInvoice.dueDate || new Date().toISOString().split('T')[0],
    paid_date: backendInvoice.paid_date || backendInvoice.paidDate || undefined,
    
    // Financial Information
    subtotal: Number(backendInvoice.subtotal || backendInvoice.sub_total || 0),
    tax_amount: Number(backendInvoice.tax_amount || backendInvoice.taxAmount || 0),
    discount_amount: backendInvoice.discount_amount || backendInvoice.discountAmount ? Number(backendInvoice.discount_amount || backendInvoice.discountAmount) : undefined,
    shipping_amount: backendInvoice.shipping_amount || backendInvoice.shippingAmount ? Number(backendInvoice.shipping_amount || backendInvoice.shippingAmount) : undefined,
    total_amount: Number(backendInvoice.total_amount || backendInvoice.totalAmount || 0),
    paid_amount: backendInvoice.paid_amount || backendInvoice.paidAmount ? Number(backendInvoice.paid_amount || backendInvoice.paidAmount) : undefined,
    balance_amount: backendInvoice.balance_amount || backendInvoice.balanceAmount ? Number(backendInvoice.balance_amount || backendInvoice.balanceAmount) : undefined,
    currency: backendInvoice.currency || 'INR',
    
    // Invoice Items
    items: Array.isArray(backendInvoice.items) 
      ? backendInvoice.items.map((item: any) => ({
          id: item.id ? String(item.id) : undefined,
          item_name: item.item_name || item.itemName || '',
          description: item.description || undefined,
          quantity: Number(item.quantity || 0),
          unit_price: Number(item.unit_price || item.unitPrice || 0),
          tax_rate: item.tax_rate || item.taxRate ? Number(item.tax_rate || item.taxRate) : undefined,
          discount: item.discount ? Number(item.discount) : undefined,
          line_total: Number(item.line_total || item.lineTotal || 0),
          tax_amount: item.tax_amount || item.taxAmount ? Number(item.tax_amount || item.taxAmount) : undefined,
          total_amount: Number(item.total_amount || item.totalAmount || 0),
        }))
      : [],
    
    // Payment Information
    payment_method: backendInvoice.payment_method || backendInvoice.paymentMethod || undefined,
    payment_reference: backendInvoice.payment_reference || backendInvoice.paymentReference || undefined,
    payment_notes: backendInvoice.payment_notes || backendInvoice.paymentNotes || undefined,
    
    // Additional Information
    notes: backendInvoice.notes || undefined,
    terms: backendInvoice.terms || undefined,
    po_number: backendInvoice.po_number || backendInvoice.poNumber || undefined,
    reference_number: backendInvoice.reference_number || backendInvoice.referenceNumber || undefined,
    
    // Related Entities
    order_id: backendInvoice.order_id || backendInvoice.orderId ? String(backendInvoice.order_id || backendInvoice.orderId) : undefined,
    project_id: backendInvoice.project_id || backendInvoice.projectId ? String(backendInvoice.project_id || backendInvoice.projectId) : undefined,
    quote_id: backendInvoice.quote_id || backendInvoice.quoteId ? String(backendInvoice.quote_id || backendInvoice.quoteId) : undefined,
    
    // Recurring Invoice
    is_recurring: backendInvoice.is_recurring || backendInvoice.isRecurring || false,
    recurring_frequency: backendInvoice.recurring_frequency || backendInvoice.recurringFrequency || undefined,
    recurring_end_date: backendInvoice.recurring_end_date || backendInvoice.recurringEndDate || undefined,
    
    // Attachments
    attachments: Array.isArray(backendInvoice.attachments) ? backendInvoice.attachments : undefined,
    
    // Approval Workflow
    approved_by: backendInvoice.approved_by || backendInvoice.approvedBy ? String(backendInvoice.approved_by || backendInvoice.approvedBy) : undefined,
    approved_at: backendInvoice.approved_at || backendInvoice.approvedAt || undefined,
    
    // Created/Updated By (optional fields - may not exist in database)
    created_by: backendInvoice.created_by || backendInvoice.createdBy ? String(backendInvoice.created_by || backendInvoice.createdBy) : undefined,
    created_by_name: backendInvoice.created_by_name || backendInvoice.createdByName || undefined,
    updated_by: backendInvoice.updated_by || backendInvoice.updatedBy ? String(backendInvoice.updated_by || backendInvoice.updatedBy) : undefined,
    
    created_at: backendInvoice.created_at || backendInvoice.createdAt || new Date().toISOString(),
    updated_at: backendInvoice.updated_at || backendInvoice.updatedAt || new Date().toISOString(),
  };
}

// List all invoices
export async function listInvoices(params?: {
  status?: InvoiceStatus;
  invoice_type?: InvoiceType;
  customer_id?: string;
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
  search?: string;
}): Promise<Invoice[]> {
  if (USE_BACKEND_API) {
    try {
      console.log('🔄 Fetching invoices from backend API...');
      
      const queryParams = new URLSearchParams();
      if (params?.status) queryParams.append('status', params.status);
      if (params?.invoice_type) queryParams.append('invoice_type', params.invoice_type);
      if (params?.customer_id) queryParams.append('customer_id', params.customer_id);
      if (params?.start_date) queryParams.append('start_date', params.start_date);
      if (params?.end_date) queryParams.append('end_date', params.end_date);
      if (params?.page) queryParams.append('page', String(params.page));
      if (params?.limit) queryParams.append('limit', String(params.limit));
      if (params?.search) queryParams.append('search', params.search);

      const response = await apiRequest<{ success: boolean; data: { invoices: any[] } } | any[]>(
        `/invoices?${queryParams.toString()}`
      );

      let invoices = [];
      if (Array.isArray(response)) {
        invoices = response;
      } else if (response && typeof response === 'object' && 'success' in response && response.success && 'data' in response) {
        invoices = response.data.invoices || [];
      } else if (response && typeof response === 'object' && 'invoices' in response) {
        invoices = (response as any).invoices || [];
      }

      if (invoices.length > 0) {
        const mapped = invoices.map(mapBackendInvoice);
        console.log('✅ Mapped invoices:', mapped.length);
        return mapped;
      }

      console.log('⚠️ No invoices in response, using mock data');
      return [];
    } catch (error) {
      console.error('❌ Backend API error fetching invoices, falling back to mock data:', error);
      return [];
    }
  }
  return [];
}

// Get invoice by ID
export async function getInvoiceById(id: string): Promise<Invoice | null> {
  if (USE_BACKEND_API) {
    try {
      console.log(`🔄 Fetching invoice ${id} from backend API...`);
      const response = await apiRequest<{ success: boolean; data: { invoice: any } } | any>(
        `/invoices/${id}`
      );

      let invoiceData = null;
      if (response && typeof response === 'object') {
        if ('success' in response && response.success && 'data' in response && response.data.invoice) {
          invoiceData = response.data.invoice;
        } else if ('invoice' in response) {
          invoiceData = (response as any).invoice;
        } else {
          invoiceData = response;
        }
      }

      if (invoiceData) {
        const mapped = mapBackendInvoice(invoiceData);
        console.log('✅ Mapped invoice:', mapped.id);
        return mapped;
      }
      return null;
    } catch (error) {
      console.error(`❌ Backend API error fetching invoice ${id}:`, error);
      return null;
    }
  }
  return null;
}

// Create invoice
export async function createInvoice(invoice: Partial<Invoice>): Promise<Invoice> {
  if (USE_BACKEND_API) {
    try {
      console.log('🔄 Creating invoice via backend API...', invoice);
      
      const response = await apiRequest<{ success: boolean; data: { invoice: any } }>(
        '/invoices',
        {
          method: 'POST',
          body: JSON.stringify(invoice),
        }
      );

      let invoiceData = null;
      if (response && typeof response === 'object') {
        if ('success' in response && response.success && 'data' in response && response.data.invoice) {
          invoiceData = response.data.invoice;
        } else if ('invoice' in response) {
          invoiceData = (response as any).invoice;
        } else {
          invoiceData = response;
        }
      }

      if (invoiceData) {
        const mapped = mapBackendInvoice(invoiceData);
        console.log('✅ Invoice created successfully:', mapped.id);
        return mapped;
      }
      throw new Error('Failed to create invoice');
    } catch (error) {
      console.error('❌ Backend API error creating invoice:', error);
      throw error;
    }
  }
  throw new Error('Backend API not enabled');
}

// Update invoice
export async function updateInvoice(id: string, invoice: Partial<Invoice>): Promise<Invoice> {
  if (USE_BACKEND_API) {
    try {
      console.log(`🔄 Updating invoice ${id} via backend API...`, invoice);
      
      const response = await apiRequest<{ success: boolean; data: { invoice: any } }>(
        `/invoices/${id}`,
        {
          method: 'PATCH',
          body: JSON.stringify(invoice),
        }
      );

      let invoiceData = null;
      if (response && typeof response === 'object') {
        if ('success' in response && response.success && 'data' in response && response.data.invoice) {
          invoiceData = response.data.invoice;
        } else if ('invoice' in response) {
          invoiceData = (response as any).invoice;
        } else {
          invoiceData = response;
        }
      }

      if (invoiceData) {
        const mapped = mapBackendInvoice(invoiceData);
        console.log('✅ Invoice updated successfully:', mapped.id);
        return mapped;
      }
      throw new Error('Failed to update invoice');
    } catch (error) {
      console.error(`❌ Backend API error updating invoice ${id}:`, error);
      throw error;
    }
  }
  throw new Error('Backend API not enabled');
}

// Delete invoice
export async function deleteInvoice(id: string): Promise<void> {
  if (USE_BACKEND_API) {
    try {
      console.log(`🔄 Deleting invoice ${id} via backend API...`);
      
      await apiRequest(`/invoices/${id}`, {
        method: 'DELETE'
      });

      console.log('✅ Invoice deleted successfully:', id);
      return;
    } catch (error) {
      console.error(`❌ Backend API error deleting invoice ${id}:`, error);
      throw error;
    }
  }
  throw new Error('Backend API not enabled');
}

// Send invoice (mark as sent)
export async function sendInvoice(id: string): Promise<Invoice> {
  if (USE_BACKEND_API) {
    try {
      console.log(`🔄 Sending invoice ${id} via backend API...`);
      
      const response = await apiRequest<{ success: boolean; data: { invoice: any } }>(
        `/invoices/${id}/send`,
        {
          method: 'POST',
        }
      );

      let invoiceData = null;
      if (response && typeof response === 'object') {
        if ('success' in response && response.success && 'data' in response && response.data.invoice) {
          invoiceData = response.data.invoice;
        } else if ('invoice' in response) {
          invoiceData = (response as any).invoice;
        } else {
          invoiceData = response;
        }
      }

      if (invoiceData) {
        const mapped = mapBackendInvoice(invoiceData);
        console.log('✅ Invoice sent successfully:', mapped.id);
        return mapped;
      }
      throw new Error('Failed to send invoice');
    } catch (error) {
      console.error(`❌ Backend API error sending invoice ${id}:`, error);
      throw error;
    }
  }
  throw new Error('Backend API not enabled');
}

// Mark invoice as paid
export async function markInvoicePaid(id: string, paymentData: {
  payment_amount: number;
  payment_method: string;
  payment_reference?: string;
  payment_date?: string;
  notes?: string;
}): Promise<Invoice> {
  if (USE_BACKEND_API) {
    try {
      console.log(`🔄 Marking invoice ${id} as paid via backend API...`, paymentData);
      
      const response = await apiRequest<{ success: boolean; data: { invoice: any } }>(
        `/invoices/${id}/pay`,
        {
          method: 'POST',
          body: JSON.stringify(paymentData),
        }
      );

      let invoiceData = null;
      if (response && typeof response === 'object') {
        if ('success' in response && response.success && 'data' in response && response.data.invoice) {
          invoiceData = response.data.invoice;
        } else if ('invoice' in response) {
          invoiceData = (response as any).invoice;
        } else {
          invoiceData = response;
        }
      }

      if (invoiceData) {
        const mapped = mapBackendInvoice(invoiceData);
        console.log('✅ Invoice marked as paid successfully:', mapped.id);
        return mapped;
      }
      throw new Error('Failed to mark invoice as paid');
    } catch (error) {
      console.error(`❌ Backend API error marking invoice ${id} as paid:`, error);
      throw error;
    }
  }
  throw new Error('Backend API not enabled');
}

// Download invoice PDF
export async function downloadInvoicePDF(id: string): Promise<{ blob: Blob; filename: string }> {
  if (USE_BACKEND_API) {
    try {
      console.log(`🔄 Downloading invoice PDF ${id}...`);
      
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';
      const token = localStorage.getItem('token') || localStorage.getItem('access_token') || '';
      
      const response = await fetch(`${baseUrl}/invoices/${id}/download`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': '*/*',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Download failed:', response.status, errorText);
        throw new Error(`Failed to download invoice: ${response.status} ${errorText}`);
      }

      // Get Content-Type to validate response
      const contentType = response.headers.get('Content-Type') || '';
      console.log('📄 Content-Type:', contentType);
      
      // Validate Content-Type is PDF
      if (contentType && !contentType.includes('pdf') && !contentType.includes('application/octet-stream')) {
        console.warn('⚠️ Unexpected Content-Type:', contentType, '- Expected application/pdf');
      }

      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `invoice-${id}.pdf`;
      
      if (contentDisposition) {
        // Try UTF-8 filename first
        const utf8Match = contentDisposition.match(/filename\*=UTF-8''(.+)/);
        if (utf8Match) {
          filename = decodeURIComponent(utf8Match[1]);
        } else {
          // Fallback to regular filename
          const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
          if (filenameMatch && filenameMatch[1]) {
            filename = filenameMatch[1].replace(/['"]/g, '');
          }
        }
      }

      // Ensure filename has .pdf extension
      if (!filename.toLowerCase().endsWith('.pdf')) {
        filename = `${filename}.pdf`;
      }

      const blob = await response.blob();
      
      // Validate blob size
      if (blob.size === 0) {
        throw new Error('Downloaded file is empty or corrupted');
      }

      // Check if response is actually a JSON error message (common backend mistake)
      const firstBytes = await blob.slice(0, 500).text();
      const firstBytesTrimmed = firstBytes.trim();
      
      console.log('🔍 First 500 bytes of response:', firstBytesTrimmed.substring(0, 200));
      
      // Check for JSON error responses OR JSON success responses (backend returning JSON instead of file)
      if (firstBytesTrimmed.startsWith('{') || firstBytesTrimmed.startsWith('[')) {
        try {
          const jsonData = JSON.parse(firstBytesTrimmed);
          console.error('❌ Backend returned JSON instead of PDF file:', jsonData);
          
          // Check if it's an error response
          if (jsonData.error || jsonData.message || jsonData.success === false) {
            const errorMsg = jsonData.error || jsonData.message || 'Unknown error';
            throw new Error(`Backend returned JSON error instead of PDF: ${errorMsg}`);
          }
          
          // Check if it's a success response with invoice data (backend mistake - returning invoice metadata instead of file)
          if (jsonData.success === true && jsonData.data && jsonData.data.invoice) {
            throw new Error(`Backend returned invoice metadata JSON instead of the actual PDF file. The download endpoint should return binary PDF content, not JSON.`);
          }
          
          // Generic JSON response
          throw new Error(`Backend returned JSON response instead of PDF file. Expected PDF but got JSON. Check backend download endpoint implementation.`);
        } catch (e) {
          // If it's our custom error, re-throw it
          if (e instanceof Error && e.message.includes('Backend returned')) {
            throw e;
          }
          // Not JSON, continue
        }
      }
      
      // Check for HTML error pages (common backend mistake)
      if (firstBytesTrimmed.toLowerCase().startsWith('<!doctype') || 
          firstBytesTrimmed.toLowerCase().startsWith('<html') ||
          firstBytesTrimmed.includes('<body>') ||
          (firstBytesTrimmed.includes('Error') && firstBytesTrimmed.includes('</html>'))) {
        throw new Error('Backend returned HTML error page instead of PDF file. Check backend logs for errors.');
      }

      // Validate PDF by checking magic bytes
      const arrayBuffer = await blob.slice(0, 8).arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      // PDF magic bytes: %PDF
      const pdfMagic = [0x25, 0x50, 0x44, 0x46]; // %PDF
      const isPDF = uint8Array.length >= 4 && 
        uint8Array[0] === pdfMagic[0] && 
        uint8Array[1] === pdfMagic[1] && 
        uint8Array[2] === pdfMagic[2] && 
        uint8Array[3] === pdfMagic[3];
      
      if (!isPDF) {
        const firstBytesHex = Array.from(uint8Array.slice(0, 8)).map(b => b.toString(16).padStart(2, '0')).join(' ');
        const firstBytesText = String.fromCharCode(...uint8Array.slice(0, Math.min(8, uint8Array.length)))
          .replace(/[^\x20-\x7E]/g, '.'); // Replace non-printable chars with dots
        
        console.error('❌ PDF validation failed:', {
          firstBytesHex,
          firstBytesText,
          expected: '%PDF',
          actual: firstBytesText.substring(0, 4)
        });
        
        throw new Error(`Invalid PDF file: File does not have PDF magic bytes (should start with %PDF). First bytes: ${firstBytesHex}. Please check backend PDF generation.`);
      }

      // Create blob with correct MIME type if not set
      const blobType = contentType && contentType.includes('pdf') 
        ? contentType 
        : 'application/pdf';
      const typedBlob = blob.type ? blob : new Blob([blob], { type: blobType });

      // Log detailed information for debugging
      const firstBytesHex = Array.from(uint8Array.slice(0, 8)).map(b => b.toString(16).padStart(2, '0')).join(' ');
      const firstBytesText = String.fromCharCode(...uint8Array.slice(0, Math.min(8, uint8Array.length)))
        .replace(/[^\x20-\x7E]/g, '.'); // Replace non-printable chars with dots
      
      console.log('✅ Invoice PDF downloaded successfully:', {
        filename,
        size: blob.size,
        type: typedBlob.type,
        contentType,
        firstBytesHex,
        firstBytesText,
      });

      // Additional diagnostic info for backend team
      if (process.env.NODE_ENV === 'development') {
        console.group('🔍 Invoice PDF Download Diagnostics');
        console.log('Invoice ID:', id);
        console.log('Content-Type Header:', contentType);
        console.log('File Size:', blob.size, 'bytes');
        console.log('First 8 bytes (hex):', firstBytesHex);
        console.log('First 8 bytes (text):', firstBytesText);
        console.log('Validation Result:', isPDF ? '✅ Valid PDF' : '❌ Invalid');
        console.groupEnd();
      }

      return { blob: typedBlob, filename };
    } catch (error) {
      console.error(`❌ Error downloading invoice PDF ${id}:`, error);
      throw error;
    }
  }
  throw new Error('Backend API not enabled');
}

// List items/products for invoice items selection
export interface InvoiceItemOption {
  id: string;
  item_name: string;
  product_code?: string;
  description?: string;
  unit_price?: number;
  tax_rate?: number;
  unit_of_measure?: string;
}

export async function listInvoiceItems(params?: {
  search?: string;
  page?: number;
  limit?: number;
}): Promise<InvoiceItemOption[]> {
  if (USE_BACKEND_API) {
    try {
      console.log('🔄 Fetching invoice items from backend API...');
      
      const queryParams = new URLSearchParams();
      if (params?.search) queryParams.append('search', params.search);
      if (params?.page) queryParams.append('page', String(params.page));
      if (params?.limit) queryParams.append('limit', String(params.limit || 1000));
      
      // Try invoices/items endpoint first, fallback to inventory/products
      let response;
      try {
        response = await apiRequest<{ success: boolean; data: { items: any[] } } | { items: any[] } | any[]>(
          `/invoices/items?${queryParams.toString()}`
        );
      } catch (error) {
        // Fallback to inventory products if invoices/items doesn't exist
        console.log('⚠️ invoices/items endpoint not found, using inventory/products');
        // Use dynamic import to avoid circular dependencies
        const { listProducts } = await import('../../inventory/api/inventoryApi');
        const products = await listProducts();
        
        return products.map((p: any) => ({
          id: String(p.id || p.product_id || ''),
          item_name: p.name || p.product_name || '',
          product_code: p.product_code || p.code || '',
          description: p.description || '',
          unit_price: p.unit_price || p.price || undefined,
          tax_rate: p.tax_rate || undefined,
          unit_of_measure: p.unit_of_measure || p.unit || undefined,
        }));
      }
      
      let items = [];
      if (Array.isArray(response)) {
        items = response;
      } else if (response && typeof response === 'object') {
        if ('success' in response && response.success && 'data' in response && response.data.items) {
          items = response.data.items;
        } else if ('items' in response) {
          items = (response as any).items;
        }
      }
      
      if (items.length > 0) {
        const mapped = items.map((item: any) => ({
          id: String(item.id || item.item_id || item.product_id || ''),
          item_name: item.item_name || item.name || item.product_name || '',
          product_code: item.product_code || item.code || '',
          description: item.description || '',
          unit_price: item.unit_price || item.price || undefined,
          tax_rate: item.tax_rate || undefined,
          unit_of_measure: item.unit_of_measure || item.unit || undefined,
        }));
        console.log('✅ Mapped invoice items:', mapped.length);
        return mapped;
      }
      
      // Fallback to inventory products
      console.log('⚠️ No items in response, using inventory/products as fallback');
      const { listProducts: listInventoryProducts } = await import('../../inventory/api/inventoryApi');
      const products = await listInventoryProducts();
      
      return products.map((p) => ({
        id: String(p.id),
        item_name: p.name,
        product_code: p.product_code,
        description: p.description,
        unit_price: undefined,
        tax_rate: undefined,
        unit_of_measure: p.unit_of_measure,
      }));
    } catch (error) {
      console.error('❌ Backend API error fetching invoice items:', error);
      // Fallback to inventory products
      try {
        const { listProducts: listInventoryProducts } = await import('../../inventory/api/inventoryApi');
        const products = await listInventoryProducts();
        return products.map((p) => ({
          id: String(p.id),
          item_name: p.name,
          product_code: p.product_code,
          description: p.description,
          unit_price: undefined,
          tax_rate: undefined,
          unit_of_measure: p.unit_of_measure,
        }));
      } catch (fallbackError) {
        console.error('❌ Fallback to inventory products also failed:', fallbackError);
        return [];
      }
    }
  }
  
  // Fallback to inventory products if backend API is not enabled
  try {
    const { listProducts: listInventoryProducts } = await import('../../inventory/api/inventoryApi');
    const products = await listInventoryProducts();
    return products.map((p) => ({
      id: String(p.id),
      item_name: p.name,
      product_code: p.product_code,
      description: p.description,
      unit_price: undefined,
      tax_rate: undefined,
      unit_of_measure: p.unit_of_measure,
    }));
  } catch (error) {
    console.error('❌ Error fetching products:', error);
    return [];
  }
}

