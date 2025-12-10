import { apiRequest } from '../../../config/api';
import type { Report, ReportType, ReportFormat } from '../types';

// Toggle to use backend API
const USE_BACKEND_API = true;

// Map backend report response to frontend Report type
function mapBackendReport(backendReport: any): Report {
  return {
    id: String(backendReport.id || backendReport.report_id || ''),
    report_code: backendReport.report_code || backendReport.reportCode || '',
    report_type: backendReport.report_type || backendReport.reportType || 'HR_EMPLOYEE',
    report_name: backendReport.report_name || backendReport.reportName || '',
    description: backendReport.description || '',
    format: backendReport.format || 'PDF',
    status: backendReport.status || 'PENDING',
    start_date: backendReport.start_date || backendReport.startDate || undefined,
    end_date: backendReport.end_date || backendReport.endDate || undefined,
    filters: backendReport.filters || {},
    file_url: backendReport.file_url || backendReport.fileUrl || undefined,
    file_name: backendReport.file_name || backendReport.fileName || undefined,
    file_size: backendReport.file_size || backendReport.fileSize || undefined,
    generated_at: backendReport.generated_at || backendReport.generatedAt || undefined,
    generated_by: backendReport.generated_by || backendReport.generatedBy || undefined,
    generated_by_name: backendReport.generated_by_name || backendReport.generatedByName || 
      (backendReport.generated_by_user?.name || backendReport.generated_by_user?.full_name || 
       backendReport.generated_by_user?.email || undefined),
    error_message: backendReport.error_message || backendReport.errorMessage || undefined,
    parameters: backendReport.parameters || {},
    created_at: backendReport.created_at || backendReport.createdAt || new Date().toISOString(),
    updated_at: backendReport.updated_at || backendReport.updatedAt || new Date().toISOString(),
  };
}

// List all reports
export async function listReports(params?: {
  report_type?: ReportType;
  status?: string;
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
}): Promise<Report[]> {
  if (USE_BACKEND_API) {
    try {
      console.log('🔄 Fetching reports from backend API...');
      
      const queryParams = new URLSearchParams();
      if (params?.report_type) queryParams.append('report_type', params.report_type);
      if (params?.status) queryParams.append('status', params.status);
      if (params?.start_date) queryParams.append('start_date', params.start_date);
      if (params?.end_date) queryParams.append('end_date', params.end_date);
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      
      const queryString = queryParams.toString();
      const url = `/reports${queryString ? `?${queryString}` : ''}`;
      
      const response = await apiRequest<{ success: boolean; data: { reports: any[]; pagination?: any } } | { reports: any[] } | any[]>(url);

      console.log('📋 Backend reports response:', response);

      let reports = [];
      if (response && typeof response === 'object') {
        if ('success' in response && response.success && 'data' in response && response.data.reports) {
          reports = response.data.reports;
        } else if ('reports' in response) {
          reports = response.reports;
        } else if (Array.isArray(response)) {
          reports = response;
        }
      }

      if (reports.length > 0) {
        const mapped = reports.map(mapBackendReport);
        console.log('✅ Mapped reports:', mapped.length);
        return mapped;
      }

      console.log('⚠️ No reports in response');
      return [];
    } catch (error) {
      console.error('❌ Backend API error fetching reports:', error);
      return [];
    }
  }

  return [];
}

// Generate a new report
export async function generateReport(payload: {
  report_type: ReportType;
  report_name: string;
  description?: string;
  format: ReportFormat;
  start_date?: string;
  end_date?: string;
  filters?: Record<string, any>;
  parameters?: Record<string, any>;
}): Promise<Report> {
  if (USE_BACKEND_API) {
    try {
      console.log('🔄 Generating report via backend API...', payload);
      
      const response = await apiRequest<{ success: boolean; data: { report: any } } | { report: any } | any>(
        '/reports/generate',
        {
          method: 'POST',
          body: JSON.stringify(payload),
        }
      );

      console.log('📦 Backend generate report response:', response);

      let reportData = null;
      if (response && typeof response === 'object') {
        if ('success' in response && response.success && 'data' in response && response.data.report) {
          reportData = response.data.report;
        } else if ('report' in response) {
          reportData = response.report;
        } else {
          reportData = response;
        }
      }

      if (reportData) {
        const mapped = mapBackendReport(reportData);
        console.log('✅ Report generated successfully:', mapped.id);
        return mapped;
      }

      throw new Error('Invalid response format');
    } catch (error) {
      console.error('❌ Backend API error generating report:', error);
      throw error;
    }
  }

  throw new Error('Backend API not enabled');
}

// Get report by ID
export async function getReportById(id: string): Promise<Report> {
  if (USE_BACKEND_API) {
    try {
      console.log('🔄 Fetching report by ID from backend API...', id);
      
      const response = await apiRequest<{ success: boolean; data: { report: any } } | { report: any } | any>(
        `/reports/${id}`
      );

      console.log('📦 Backend report response:', response);

      let reportData = null;
      if (response && typeof response === 'object') {
        if ('success' in response && response.success && 'data' in response && response.data.report) {
          reportData = response.data.report;
        } else if ('report' in response) {
          reportData = response.report;
        } else {
          reportData = response;
        }
      }

      if (reportData) {
        const mapped = mapBackendReport(reportData);
        console.log('✅ Report fetched successfully:', mapped.id);
        return mapped;
      }

      throw new Error('Report not found');
    } catch (error) {
      console.error('❌ Backend API error fetching report:', error);
      throw error;
    }
  }

  throw new Error('Backend API not enabled');
}

// Delete report
export async function deleteReport(id: string): Promise<void> {
  if (USE_BACKEND_API) {
    try {
      console.log('🔄 Deleting report via backend API...', id);
      
      await apiRequest(`/reports/${id}`, {
        method: 'DELETE'
      });

      console.log('✅ Report deleted successfully:', id);
      return;
    } catch (error) {
      console.error('❌ Backend API error deleting report:', error);
      throw error;
    }
  }

  throw new Error('Backend API not enabled');
}

// Download report file
export async function downloadReport(id: string, reportFormat?: ReportFormat): Promise<{ blob: Blob; filename: string }> {
  if (USE_BACKEND_API) {
    try {
      console.log('🔄 Downloading report file...', id, 'format:', reportFormat);
      
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';
      const token = localStorage.getItem('token') || localStorage.getItem('access_token') || '';
      
      const response = await fetch(`${baseUrl}/reports/${id}/download`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': '*/*',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Download failed:', response.status, errorText);
        throw new Error(`Failed to download report: ${response.status} ${errorText}`);
      }

      // Get Content-Type to determine file type
      const contentType = response.headers.get('Content-Type') || '';
      console.log('📄 Content-Type:', contentType);

      // Extract filename from Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `report-${id}.pdf`;
      
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

      // If filename doesn't have extension, determine from Content-Type or report format
      if (!filename.includes('.')) {
        const extension = getFileExtension(contentType, reportFormat);
        filename = `${filename}.${extension}`;
      }

      // Get the blob with proper type
      const blob = await response.blob();
      
      // Validate blob size (should be > 0)
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
          console.error('❌ Backend returned JSON instead of binary file:', jsonData);
          
          // Check if it's an error response
          if (jsonData.error || jsonData.message || jsonData.success === false) {
            const errorMsg = jsonData.error || jsonData.message || 'Unknown error';
            throw new Error(`Backend returned JSON error instead of file: ${errorMsg}`);
          }
          
          // Check if it's a success response with report data (backend mistake - returning report metadata instead of file)
          if (jsonData.success === true && jsonData.data && jsonData.data.report) {
            throw new Error(`Backend returned report metadata JSON instead of the actual file. The download endpoint should return binary file content, not JSON.`);
          }
          
          // Generic JSON response
          throw new Error(`Backend returned JSON response instead of binary file. Expected ${reportFormat || 'file'} but got JSON. Check backend download endpoint implementation.`);
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
          firstBytesTrimmed.includes('Error') && firstBytesTrimmed.includes('</html>')) {
        throw new Error('Backend returned HTML error page instead of file. Check backend logs for errors.');
      }

      // Validate file type by checking magic bytes
      const arrayBuffer = await blob.slice(0, 8).arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const validationResult = validateFileType(uint8Array, contentType, reportFormat);
      
      if (!validationResult.isValid) {
        console.error('❌ File validation failed:', validationResult.reason);
        throw new Error(`Invalid file format: ${validationResult.reason}. Expected ${reportFormat || contentType}, but file appears to be ${validationResult.detectedType || 'unknown'}. Please check backend file generation.`);
      }

      // Create blob with correct MIME type if not set
      const blobType = getMimeType(contentType, reportFormat);
      const typedBlob = blob.type ? blob : new Blob([blob], { type: blobType });

      // Log detailed information for debugging
      const firstBytesHex = Array.from(uint8Array.slice(0, 8)).map(b => b.toString(16).padStart(2, '0')).join(' ');
      const firstBytesText = String.fromCharCode(...uint8Array.slice(0, Math.min(8, uint8Array.length)))
        .replace(/[^\x20-\x7E]/g, '.'); // Replace non-printable chars with dots
      
      console.log('✅ Report file downloaded successfully:', {
        filename,
        size: blob.size,
        type: typedBlob.type,
        contentType,
        expectedFormat: reportFormat,
        firstBytesHex,
        firstBytesText,
        isValid: validationResult.isValid,
        detectedType: validationResult.detectedType
      });

      // Additional diagnostic info for backend team
      if (process.env.NODE_ENV === 'development') {
        console.group('🔍 File Download Diagnostics');
        console.log('Report ID:', id);
        console.log('Expected Format:', reportFormat);
        console.log('Content-Type Header:', contentType);
        console.log('File Size:', blob.size, 'bytes');
        console.log('First 8 bytes (hex):', firstBytesHex);
        console.log('First 8 bytes (text):', firstBytesText);
        console.log('Detected File Type:', validationResult.detectedType);
        console.log('Validation Result:', validationResult.isValid ? '✅ Valid' : '❌ Invalid');
        if (!validationResult.isValid) {
          console.error('Validation Error:', validationResult.reason);
        }
        console.groupEnd();
      }

      return { blob: typedBlob, filename };
    } catch (error) {
      console.error('❌ Error downloading report:', error);
      throw error;
    }
  }

  throw new Error('Backend API not enabled');
}

// Helper function to get file extension from Content-Type or format
function getFileExtension(contentType: string, format?: ReportFormat): string {
  // First try Content-Type
  if (contentType.includes('pdf')) return 'pdf';
  if (contentType.includes('excel') || contentType.includes('spreadsheet') || contentType.includes('xlsx')) return 'xlsx';
  if (contentType.includes('csv')) return 'csv';
  if (contentType.includes('json')) return 'json';
  
  // Fallback to format
  if (format) {
    const formatLower = format.toLowerCase();
    if (formatLower === 'excel') return 'xlsx';
    if (formatLower === 'pdf') return 'pdf';
    if (formatLower === 'csv') return 'csv';
    if (formatLower === 'json') return 'json';
  }
  
  // Default to PDF
  return 'pdf';
}

// Helper function to get MIME type
function getMimeType(contentType: string, format?: ReportFormat): string {
  // Use Content-Type if available
  if (contentType && contentType !== 'application/octet-stream') {
    return contentType;
  }
  
  // Fallback to format
  if (format) {
    const formatLower = format.toLowerCase();
    if (formatLower === 'pdf') return 'application/pdf';
    if (formatLower === 'excel') return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    if (formatLower === 'csv') return 'text/csv;charset=utf-8';
    if (formatLower === 'json') return 'application/json;charset=utf-8';
  }
  
  // Default to PDF
  return 'application/pdf';
}

// Validate file type by checking magic bytes
function validateFileType(
  uint8Array: Uint8Array, 
  contentType: string, 
  format?: ReportFormat
): { isValid: boolean; reason?: string; detectedType?: string } {
  if (uint8Array.length === 0) {
    return { isValid: false, reason: 'File is empty' };
  }

  // PDF magic bytes: %PDF
  const pdfMagic = [0x25, 0x50, 0x44, 0x46]; // %PDF
  const isPDF = uint8Array.length >= 4 && 
    uint8Array[0] === pdfMagic[0] && 
    uint8Array[1] === pdfMagic[1] && 
    uint8Array[2] === pdfMagic[2] && 
    uint8Array[3] === pdfMagic[3];

  // Excel/XLSX magic bytes: PK (ZIP file format)
  const zipMagic = [0x50, 0x4B]; // PK
  const isZIP = uint8Array.length >= 2 && 
    uint8Array[0] === zipMagic[0] && 
    uint8Array[1] === zipMagic[1];

  // JSON starts with { or [
  const isJSON = uint8Array[0] === 0x7B || uint8Array[0] === 0x5B; // { or [

  // Detect what type the file actually is
  let detectedType = 'unknown';
  if (isPDF) detectedType = 'PDF';
  else if (isZIP) detectedType = 'ZIP/XLSX';
  else if (isJSON) detectedType = 'JSON';
  else detectedType = 'unknown/binary';

  // Check based on expected format
  const expectedFormat = format?.toLowerCase() || '';
  const expectedContentType = contentType.toLowerCase();

  if (expectedContentType.includes('pdf') || expectedFormat === 'pdf') {
    if (!isPDF) {
      return { 
        isValid: false, 
        reason: `Expected PDF file but file does not have PDF magic bytes (should start with %PDF)`,
        detectedType 
      };
    }
    return { isValid: true, detectedType: 'PDF' };
  }
  
  if (expectedContentType.includes('excel') || expectedContentType.includes('spreadsheet') || expectedContentType.includes('xlsx') || expectedFormat === 'excel') {
    if (!isZIP) {
      return { 
        isValid: false, 
        reason: `Expected Excel/XLSX file but file does not have ZIP magic bytes (should start with PK)`,
        detectedType 
      };
    }
    return { isValid: true, detectedType: 'XLSX' };
  }
  
  if (expectedContentType.includes('json') || expectedFormat === 'json') {
    if (!isJSON) {
      return { 
        isValid: false, 
        reason: `Expected JSON file but file does not start with { or [`,
        detectedType 
      };
    }
    return { isValid: true, detectedType: 'JSON' };
  }
  
  if (expectedContentType.includes('csv') || expectedFormat === 'csv') {
    // CSV is harder to validate, but should not be PDF or ZIP
    if (isPDF || isZIP) {
      return { 
        isValid: false, 
        reason: `Expected CSV file but file appears to be ${detectedType}`,
        detectedType 
      };
    }
    return { isValid: true, detectedType: 'CSV' };
  }

  // If no specific format expected, accept any valid file type
  if (isPDF || isZIP || isJSON) {
    return { isValid: true, detectedType };
  }

  return { 
    isValid: false, 
    reason: 'File does not match any known file format',
    detectedType 
  };
}

