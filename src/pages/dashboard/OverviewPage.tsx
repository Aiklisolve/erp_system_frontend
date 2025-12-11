import { useState, useEffect } from 'react';
import { StatCard } from '../../components/ui/StatCard';
import { Card } from '../../components/ui/Card';
import { ModuleGrid } from '../../features/erp/components/ModuleGrid';
import { Pagination } from '../../components/ui/Pagination';
import { apiRequest } from '../../config/api';
import { useSupabaseHealthCheck } from '../../hooks/useSupabaseHealthCheck';

const MINI_BARS = [60, 90, 40, 75, 55]; // Fallback default values

interface Transaction {
  date: string;
  account: string;
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER';
  amount: number;
  currency?: string;
}

interface DashboardSummary {
  revenue_mtd?: number | string;
  total_revenue?: number | string;
  orders_in_pipeline?: number | string; // API returns this field name
  orders_pipeline?: number | string;
  orders_count?: number | string;
  orders?: number | string;
  pipeline_orders?: number | string;
  inventory_health?: number | string;
  workforce_availability?: number | string;
  [key: string]: any; // Allow other fields
}

interface ProductionStatusItem {
  status: string;
  count: number | string;
  percentage?: number | string;
}

interface ProductionStatus {
  [key: string]: number | string | ProductionStatusItem[] | undefined;
  data?: ProductionStatusItem[];
  statuses?: ProductionStatusItem[];
  items?: ProductionStatusItem[];
}

interface MonthlyTransactionItem {
  month?: string;
  income?: number | string;
  expense?: number | string;
  profit?: number | string;
}

export function OverviewPage() {
  const { status: systemStatus } = useSupabaseHealthCheck();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]); // Store all fetched transactions
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'INCOME' | 'EXPENSE' | 'TRANSFER'>('ALL');
  const [dashboardSummary, setDashboardSummary] = useState<DashboardSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [weeklyOrders, setWeeklyOrders] = useState<number[]>(MINI_BARS);
  const [weeklyOrdersLoading, setWeeklyOrdersLoading] = useState(true);
  const [slaHitRate, setSlaHitRate] = useState<number>(96);
  const [slaLoading, setSlaLoading] = useState(true);
  const [productionStatus, setProductionStatus] = useState<ProductionStatusItem[]>([]);
  const [productionStatusLoading, setProductionStatusLoading] = useState(true);
  const [productionStatusTotal, setProductionStatusTotal] = useState<number>(0);
  const [monthlyTransactions, setMonthlyTransactions] = useState<MonthlyTransactionItem[]>([]);
  const [monthlyTransactionsLoading, setMonthlyTransactionsLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, [currentPage, itemsPerPage]);

  useEffect(() => {
    fetchDashboardSummary();
    fetchWeeklyOrders();
    fetchSlaHitRate();
    fetchProductionStatus();
    fetchMonthlyTransactions();
  }, []);

  const fetchDashboardSummary = async () => {
    try {
      setSummaryLoading(true);
      console.log('🔄 Fetching dashboard summary from API...');
      
      const response = await apiRequest<{ success: boolean; data: DashboardSummary } | DashboardSummary>(
        '/dashboard/summary'
      );

      console.log('📊 Dashboard summary response:', response);
      console.log('📊 Full response keys:', response && typeof response === 'object' ? Object.keys(response) : 'N/A');

      // Handle different response formats
      let summaryData: DashboardSummary | null = null;
      
      if (response && typeof response === 'object') {
        // If wrapped in success/data
        if ('success' in response && response.success && 'data' in response) {
          summaryData = response.data;
          console.log('📊 Extracted data from success wrapper:', summaryData);
        } 
        // If direct summary object
        else {
          summaryData = response as DashboardSummary;
          console.log('📊 Using direct response as summary data');
        }
      }

      if (summaryData) {
        console.log('✅ Dashboard summary loaded successfully:', {
          revenue_mtd: summaryData.revenue_mtd,
          total_revenue: summaryData.total_revenue,
          orders_in_pipeline: summaryData.orders_in_pipeline,
          orders_pipeline: summaryData.orders_pipeline,
          orders_count: summaryData.orders_count,
          inventory_health: summaryData.inventory_health,
          workforce_availability: summaryData.workforce_availability,
          allKeys: Object.keys(summaryData)
        });
        setDashboardSummary(summaryData);
      } else {
        console.log('⚠️ No dashboard summary in response');
      }
    } catch (err: any) {
      console.error('❌ Error fetching dashboard summary:', err);
      // Don't set error state, just use default values
    } finally {
      setSummaryLoading(false);
    }
  };

  const fetchWeeklyOrders = async () => {
    try {
      setWeeklyOrdersLoading(true);
      console.log('🔄 Fetching weekly orders from API...');
      
      const response = await apiRequest<{ 
        success: boolean; 
        data: Array<{ day: string; total_orders: string | number }> | number[] | { [key: string]: number }
      } | Array<{ day: string; total_orders: string | number }> | number[] | { [key: string]: number }>(
        '/dashboard/weekly-orders'
      );

      console.log('📊 Weekly orders response:', response);

      // Day name to index mapping (Mon-Fri)
      const dayMap: { [key: string]: number } = {
        'Mon': 0,
        'Monday': 0,
        'Tue': 1,
        'Tuesday': 1,
        'Wed': 2,
        'Wednesday': 2,
        'Thu': 3,
        'Thursday': 3,
        'Fri': 4,
        'Friday': 4
      };

      // Initialize array with 5 zeros (Mon-Fri)
      const ordersData: number[] = [0, 0, 0, 0, 0];
      
      if (Array.isArray(response)) {
        // Check if it's array of objects with day/total_orders
        if (response.length > 0 && typeof response[0] === 'object' && 'day' in response[0]) {
          // Format: [{ day: "Wed", total_orders: "99" }, ...]
          response.forEach((item: any) => {
            const dayIndex = dayMap[item.day];
            if (dayIndex !== undefined) {
              const orders = typeof item.total_orders === 'string' 
                ? parseInt(item.total_orders, 10) 
                : item.total_orders;
              ordersData[dayIndex] = isNaN(orders) ? 0 : orders;
            }
          });
        } else {
          // Direct array of numbers
          response.forEach((value, index) => {
            if (index < 5) {
              ordersData[index] = typeof value === 'number' ? value : parseInt(String(value), 10) || 0;
            }
          });
        }
      } else if (response && typeof response === 'object') {
        // If wrapped in success/data
        if ('success' in response && response.success && 'data' in response) {
          const data = response.data;
          
          if (Array.isArray(data)) {
            // Check if it's array of objects with day/total_orders
            if (data.length > 0 && typeof data[0] === 'object' && 'day' in data[0]) {
              // Format: [{ day: "Wed", total_orders: "99" }, ...]
              data.forEach((item: any) => {
                const dayIndex = dayMap[item.day];
                if (dayIndex !== undefined) {
                  const orders = typeof item.total_orders === 'string' 
                    ? parseInt(item.total_orders, 10) 
                    : item.total_orders;
                  ordersData[dayIndex] = isNaN(orders) ? 0 : orders;
                }
              });
            } else {
              // Array of numbers
              data.forEach((value, index) => {
                if (index < 5) {
                  ordersData[index] = typeof value === 'number' ? value : parseInt(String(value), 10) || 0;
                }
              });
            }
          } else if (typeof data === 'object') {
            // Convert object to array (e.g., { monday: 60, tuesday: 90, ... })
            Object.entries(data).forEach(([key, value]) => {
              const dayIndex = dayMap[key];
              if (dayIndex !== undefined) {
                ordersData[dayIndex] = typeof value === 'number' ? value : parseInt(String(value), 10) || 0;
              }
            });
          }
        } 
        // If direct object with day names
        else if (!('success' in response)) {
          // Convert object to array
          Object.entries(response).forEach(([key, value]) => {
            const dayIndex = dayMap[key];
            if (dayIndex !== undefined) {
              ordersData[dayIndex] = typeof value === 'number' ? value : parseInt(String(value), 10) || 0;
            } else {
              // Try numeric index
              const numIndex = parseInt(key, 10);
              if (!isNaN(numIndex) && numIndex >= 0 && numIndex < 5) {
                ordersData[numIndex] = typeof value === 'number' ? value : parseInt(String(value), 10) || 0;
              }
            }
          });
        }
      }

      console.log('✅ Weekly orders parsed:', ordersData);
      console.log('📊 Day mapping: Mon=' + ordersData[0] + ', Tue=' + ordersData[1] + ', Wed=' + ordersData[2] + ', Thu=' + ordersData[3] + ', Fri=' + ordersData[4]);
      
      setWeeklyOrders(ordersData);
    } catch (err: any) {
      console.error('❌ Error fetching weekly orders:', err);
      // Use default values on error
      setWeeklyOrders(MINI_BARS);
    } finally {
      setWeeklyOrdersLoading(false);
    }
  };

  const fetchSlaHitRate = async () => {
    try {
      setSlaLoading(true);
      console.log('🔄 Fetching SLA hit rate from API...');
      
      const response = await apiRequest<{ 
        success: boolean; 
        current_month_sla?: string | number;
        data?: number | string | { current_month_sla?: string | number; sla_hit_rate?: number | string; hit_rate?: number | string; percentage?: number | string }
      } | number | string | { current_month_sla?: string | number; sla_hit_rate?: number | string; hit_rate?: number | string; percentage?: number | string }>(
        '/dashboard/sla-hit-rate'
      );

      console.log('📊 SLA hit rate response:', response);
      console.log('📊 Response keys:', response && typeof response === 'object' ? Object.keys(response) : 'N/A');

      let slaValue: number = 96; // Default fallback
      
      if (typeof response === 'number') {
        slaValue = response;
      } else if (typeof response === 'string') {
        // Remove % if present and parse
        const cleaned = response.replace('%', '');
        slaValue = parseFloat(cleaned) || 96;
      } else if (response && typeof response === 'object') {
        // Check for current_month_sla first (API field name)
        if ('current_month_sla' in response) {
          const rate = (response as any).current_month_sla;
          if (typeof rate === 'number') {
            slaValue = rate;
          } else if (typeof rate === 'string') {
            const cleaned = rate.replace('%', '');
            slaValue = parseFloat(cleaned) || 96;
          }
        }
        // If wrapped in success/data
        else if ('success' in response && response.success && 'data' in response) {
          const data = response.data;
          if (typeof data === 'number') {
            slaValue = data;
          } else if (typeof data === 'string') {
            const cleaned = data.replace('%', '');
            slaValue = parseFloat(cleaned) || 96;
          } else if (typeof data === 'object' && data !== null) {
            // Try different field names
            const rate = (data as any).current_month_sla || 
                        (data as any).sla_hit_rate || 
                        (data as any).hit_rate || 
                        (data as any).percentage || 
                        (data as any).rate;
            if (typeof rate === 'number') {
              slaValue = rate;
            } else if (typeof rate === 'string') {
              const cleaned = rate.replace('%', '');
              slaValue = parseFloat(cleaned) || 96;
            }
          }
        } 
        // If direct object (check for other field names)
        else {
          const rate = (response as any).current_month_sla || 
                      (response as any).sla_hit_rate || 
                      (response as any).hit_rate || 
                      (response as any).percentage || 
                      (response as any).rate;
          if (typeof rate === 'number') {
            slaValue = rate;
          } else if (typeof rate === 'string') {
            const cleaned = rate.replace('%', '');
            slaValue = parseFloat(cleaned) || 96;
          }
        }
      }

      // Ensure value is between 0 and 100
      slaValue = Math.max(0, Math.min(100, slaValue));
      
      console.log('✅ SLA hit rate loaded successfully:', slaValue + '%');
      setSlaHitRate(slaValue);
    } catch (err: any) {
      console.error('❌ Error fetching SLA hit rate:', err);
      // Use default value on error
      setSlaHitRate(96);
    } finally {
      setSlaLoading(false);
    }
  };

  const fetchMonthlyTransactions = async () => {
    try {
      setMonthlyTransactionsLoading(true);
      console.log('🔄 Fetching monthly transactions from API...');
      
      const response = await apiRequest<{ 
        success: boolean;
        highestProfitMonth?: string;
        highestProfitValue?: number;
        data?: MonthlyTransactionItem[];
      } | MonthlyTransactionItem[]>(
        '/dashboard/monthly-transactions'
      );

      console.log('📊 Monthly transactions response:', response);

      let transactionsData: MonthlyTransactionItem[] = [];
      
      // Helper function to parse numeric value
      const parseValue = (val: any): number => {
        if (val === null || val === undefined) return 0;
        if (typeof val === 'number') return val;
        if (typeof val === 'string') {
          const cleaned = val.replace(/[₹,\s]/g, '');
          const parsed = parseFloat(cleaned);
          return isNaN(parsed) ? 0 : parsed;
        }
        return 0;
      };

      if (Array.isArray(response)) {
        // Direct array response
        transactionsData = response.map((item: any) => ({
          month: item.month || item.label || '',
          income: parseValue(item.income),
          expense: parseValue(item.expense),
          profit: parseValue(item.profit),
        }));
      } else if (response && typeof response === 'object') {
        // If wrapped in success/data
        if ('success' in response && response.success && 'data' in response) {
          const data = response.data;
          if (Array.isArray(data)) {
            transactionsData = data.map((item: any) => ({
              month: item.month || item.label || '',
              income: parseValue(item.income),
              expense: parseValue(item.expense),
              profit: parseValue(item.profit),
            }));
          }
        } else if ('data' in response) {
          const data = (response as any).data;
          if (Array.isArray(data)) {
            transactionsData = data.map((item: any) => ({
              month: item.month || item.label || '',
              income: parseValue(item.income),
              expense: parseValue(item.expense),
              profit: parseValue(item.profit),
            }));
          }
        }
      }

      // Sort by month (ascending) and take only the last 5 months
      if (transactionsData.length > 0) {
        // Sort by month string (YYYY-MM format sorts correctly as strings)
        transactionsData.sort((a, b) => {
          const monthA = a.month || '';
          const monthB = b.month || '';
          return monthA.localeCompare(monthB);
        });
        
        // Take only the last 5 months (most recent)
        transactionsData = transactionsData.slice(-5);
      }

      console.log('✅ Monthly transactions loaded successfully:', transactionsData);
      console.log('📊 Showing last 5 months:', transactionsData.map(t => t.month));
      setMonthlyTransactions(transactionsData);
    } catch (err: any) {
      console.error('❌ Error fetching monthly transactions:', err);
      setMonthlyTransactions([]);
    } finally {
      setMonthlyTransactionsLoading(false);
    }
  };

  const fetchProductionStatus = async () => {
    try {
      setProductionStatusLoading(true);
      console.log('🔄 Fetching production status from API...');
      
      const response = await apiRequest<{ 
        success: boolean; 
        data?: ProductionStatusItem[] | ProductionStatus;
      } | ProductionStatusItem[] | ProductionStatus>(
        '/dashboard/production-status'
      );

      console.log('📊 Production status response:', response);
      console.log('📊 Production status response type:', typeof response);
      console.log('📊 Production status response keys:', response && typeof response === 'object' ? Object.keys(response) : 'N/A');

      let statusData: ProductionStatusItem[] = [];
      
      // Helper function to parse percentage from various formats
      const parsePercentage = (item: any): number | undefined => {
        // Try different field names for percentage (check all possible variations)
        let pctValue = item.percentage || 
                        item.percent || 
                        item.pct || 
                        item.percentage_value ||
                        item.percent_value ||
                        item.share ||
                        item.distribution ||
                        item.ratio ||
                        item.proportion ||
                        item.weight;
        
        // If not found, check nested objects
        if (pctValue === undefined && item.data && typeof item.data === 'object') {
          pctValue = item.data.percentage || item.data.percent || item.data.pct;
        }
        
        // If still not found, check if item itself is a number (might be percentage)
        if (pctValue === undefined && typeof item === 'number') {
          pctValue = item;
        }
        
        if (pctValue === undefined || pctValue === null) return undefined;
        
        // Parse as number or string
        if (typeof pctValue === 'number') {
          return pctValue;
        }
        if (typeof pctValue === 'string') {
          // Remove % sign if present and trim whitespace
          const cleaned = pctValue.replace('%', '').replace(/\s/g, '').trim();
          const parsed = parseFloat(cleaned);
          return isNaN(parsed) ? undefined : parsed;
        }
        return undefined;
      };

      if (Array.isArray(response)) {
        // Direct array response
        statusData = response.map((item: any) => {
          const parsed = {
            status: item.status || item.name || item.label || 'Unknown',
            count: typeof item.value === 'number' ? item.value : (typeof item.value === 'string' ? parseInt(item.value, 10) : (typeof item.count === 'string' ? parseInt(item.count, 10) : (item.count || 0))),
            percentage: parsePercentage(item)
          };
          console.log('📊 Parsed item:', parsed, 'Raw item:', item);
          return parsed;
        });
      } else if (response && typeof response === 'object') {
        // If wrapped in success/data (your API format)
        if ('success' in response && response.success && 'data' in response) {
          const data = response.data;
          console.log('📊 Extracted data from success wrapper:', data);
          if (Array.isArray(data)) {
            statusData = data.map((item: any) => {
              // Handle your API format: label, value, percentage
              const parsed = {
                status: item.label || item.status || item.name || 'Unknown',
                count: typeof item.value === 'number' ? item.value : (typeof item.value === 'string' ? parseInt(item.value, 10) : (typeof item.count === 'string' ? parseInt(item.count, 10) : (item.count || 0))),
                percentage: parsePercentage(item)
              };
              console.log('📊 Parsed item from data array:', parsed, 'Raw item:', item);
              return parsed;
            });
          } else if (typeof data === 'object') {
            // Convert object to array format
            statusData = Object.entries(data).map(([key, value]) => ({
              status: key,
              count: typeof value === 'string' ? parseInt(value, 10) : (typeof value === 'number' ? value : 0),
              percentage: typeof value === 'object' && value !== null ? parsePercentage(value) : undefined
            }));
          }
        } else if ('data' in response) {
          const data = (response as any).data;
          if (Array.isArray(data)) {
            statusData = data.map((item: any) => ({
              status: item.label || item.status || item.name || 'Unknown',
              count: typeof item.value === 'number' ? item.value : (typeof item.value === 'string' ? parseInt(item.value, 10) : (typeof item.count === 'string' ? parseInt(item.count, 10) : (item.count || 0))),
              percentage: parsePercentage(item)
            }));
          }
        } else if ('statuses' in response || 'items' in response) {
          const items = (response as any).statuses || (response as any).items || [];
          statusData = items.map((item: any) => ({
            status: item.label || item.status || item.name || 'Unknown',
            count: typeof item.value === 'number' ? item.value : (typeof item.value === 'string' ? parseInt(item.value, 10) : (typeof item.count === 'string' ? parseInt(item.count, 10) : (item.count || 0))),
            percentage: parsePercentage(item)
          }));
        } else {
          // Direct object with status keys
          statusData = Object.entries(response).map(([key, value]) => ({
            status: key,
            count: typeof value === 'string' ? parseInt(value, 10) : (typeof value === 'number' ? value : 0),
            percentage: typeof value === 'object' && value !== null ? parsePercentage(value) : undefined
          }));
        }
      }

      // Use total from API response if available, otherwise calculate from counts
      let total = 0;
      if (response && typeof response === 'object' && 'total' in response) {
        total = typeof response.total === 'number' ? response.total : parseInt(String(response.total), 10);
        setProductionStatusTotal(total);
      } else {
        total = statusData.reduce((sum, item) => sum + (typeof item.count === 'number' ? item.count : parseInt(String(item.count), 10)), 0);
        setProductionStatusTotal(total);
      }
      
      // Use API-provided percentages (they're already correct), only calculate if missing
      statusData = statusData.map(item => {
        // If percentage is already provided from API, use it
        if (item.percentage !== undefined && item.percentage !== null) {
          return item;
        }
        // Otherwise calculate from counts
        const count = typeof item.count === 'number' ? item.count : parseInt(String(item.count), 10);
        return {
          ...item,
          percentage: total > 0 ? (count / total) * 100 : 0
        };
      });

      console.log('✅ Production status loaded successfully:', statusData);
      console.log('📊 Final statusData with percentages:', statusData.map(item => ({
        status: item.status,
        count: item.count,
        percentage: item.percentage
      })));
      setProductionStatus(statusData);
    } catch (err: any) {
      console.error('❌ Error fetching production status:', err);
      // Use empty array on error
      setProductionStatus([]);
    } finally {
      setProductionStatusLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Fetching transactions from API...', { page: currentPage, limit: itemsPerPage });
      
      const response = await apiRequest<{ success: boolean; data: { transactions: any[]; total?: number; count?: number } } | { success: boolean; data: any[] } | any[]>(
        `/finance/transactions?page=${currentPage}&limit=${itemsPerPage}`
      );

      console.log('📦 API Response:', response);

      // Handle different response formats
      let transactionsData: any[] = [];
      let total = 0;
      
      if (Array.isArray(response)) {
        // Direct array response
        transactionsData = response;
        total = response.length;
      } else if (response && typeof response === 'object') {
        if ('success' in response && response.success) {
          // Format: { success: true, data: { transactions: [...], total: X } }
          if ('data' in response && response.data) {
            if (Array.isArray(response.data)) {
              transactionsData = response.data;
              total = response.data.length;
            } else if (typeof response.data === 'object' && 'transactions' in response.data) {
              const dataObj = response.data as { transactions: any[]; total?: number; count?: number };
              transactionsData = dataObj.transactions || [];
              total = dataObj.total || dataObj.count || transactionsData.length;
            }
          }
        } else if ('data' in response) {
          // Format: { data: [...] } or { data: { transactions: [...] } }
          if (Array.isArray(response.data)) {
            transactionsData = response.data;
            total = response.data.length;
          } else if (typeof response.data === 'object' && 'transactions' in response.data) {
            const dataObj = response.data as { transactions: any[]; total?: number; count?: number };
            transactionsData = dataObj.transactions || [];
            total = dataObj.total || dataObj.count || transactionsData.length;
          }
        }
      }
      
      setTotalTransactions(total);

      console.log('📊 Extracted transactions:', transactionsData.length);

      if (transactionsData.length === 0) {
        console.log('⚠️ No transactions in response');
        setTransactions([]);
        setLoading(false);
        return;
      }

      // Map backend transactions to our format
      const mappedTransactions: Transaction[] = transactionsData
        .filter((tx: any) => tx != null) // Filter out null/undefined
        .map((tx: any): Transaction | null => {
          try {
            const date = tx.transaction_date 
              ? new Date(tx.transaction_date).toISOString().split('T')[0]
              : tx.date || new Date().toISOString().split('T')[0];
            
            const accountName = tx.account_name || tx.category || tx.description || tx.account || 'General Account';
            const account = accountName;
            
            const type = (tx.transaction_type?.toUpperCase() || tx.type?.toUpperCase() || 'EXPENSE') as 'INCOME' | 'EXPENSE' | 'TRANSFER';
            const amount = parseFloat(tx.amount) || 0;
            const currency = tx.currency || 'INR';

            return {
              date,
              account,
              type,
              amount,
              currency
            };
          } catch (mapError) {
            console.error('Error mapping transaction:', mapError, tx);
            return null;
          }
        })
        .filter((tx): tx is Transaction => tx !== null) // Remove any null entries
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Sort by date descending

      console.log('✅ Mapped transactions:', mappedTransactions.length);
      console.log('📊 Total transactions:', total);
      
      setAllTransactions(mappedTransactions);
      setTransactions(mappedTransactions);
      
      // If total wasn't provided by API, estimate from current page data
      if (total === 0 && mappedTransactions.length > 0) {
        if (mappedTransactions.length === itemsPerPage) {
          // Got a full page - estimate there might be more
          const estimatedTotal = Math.max(
            (currentPage + 1) * itemsPerPage,
            currentPage * itemsPerPage + 1
          );
          setTotalTransactions(estimatedTotal);
        } else {
          // Got less than a full page - this is likely the last page
          const estimatedTotal = (currentPage - 1) * itemsPerPage + mappedTransactions.length;
          setTotalTransactions(estimatedTotal);
        }
      }
    } catch (err: any) {
      console.error('❌ Error fetching transactions:', err);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to load transactions';
      if (err?.message) {
        if (err.message.includes('401') || err.message.includes('Unauthorized')) {
          errorMessage = 'Authentication required. Please log in again.';
        } else if (err.message.includes('404')) {
          errorMessage = 'Transactions endpoint not found.';
        } else if (err.message.includes('500')) {
          errorMessage = 'Server error. Please try again later.';
        } else if (err.message.includes('Network') || err.message.includes('fetch')) {
          errorMessage = 'Network error. Please check your connection.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
      setTransactions([]);
      setTotalTransactions(0);
    } finally {
      setLoading(false);
    }
  };

  // Filter transactions based on search and type
  const filteredTransactions = allTransactions.filter((tx) => {
    // Search filter
    const matchesSearch = searchTerm === '' || 
      tx.account.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.date.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.amount.toString().includes(searchTerm);
    
    // Type filter
    const matchesType = typeFilter === 'ALL' || tx.type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  // Calculate pagination values for filtered transactions
  const filteredTotal = filteredTransactions.length;
  const totalPages = Math.max(1, Math.ceil(filteredTotal / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + itemsPerPage);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, typeFilter]);

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="flex flex-col gap-4 sm:gap-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-3 sm:space-y-4 flex-1 min-w-0">
          <div className="inline-flex items-center gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-primary-light/10 border border-primary/20">
            <span className="text-[10px] sm:text-xs font-semibold text-primary uppercase tracking-wide">
              Unified Control Center
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 leading-tight">
            ERP System Dashboard
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-slate-600 max-w-2xl leading-relaxed">
            Monitor finance, operations, people, and growth metrics in one unified dashboard. 
            Real-time insights to drive your business forward.
          </p>
        </div>
        <Card className={`flex w-full sm:max-w-sm flex-col gap-3 sm:gap-4 p-4 sm:p-5 border-2 shadow-md ${
          systemStatus === 'connected' 
            ? 'border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50' 
            : 'border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50'
        }`}>
          <div className="flex items-center justify-between">
            <p className={`text-sm font-semibold ${
              systemStatus === 'connected' ? 'text-emerald-800' : 'text-amber-800'
            }`}>
              System Status
            </p>
            <span className={`flex h-2 w-2 rounded-full animate-pulse ${
              systemStatus === 'connected' ? 'bg-emerald-500' : 'bg-amber-500'
            }`} />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-700">
              <span>Data Source</span>
              <span className={`font-semibold px-2 py-1 rounded ${
                systemStatus === 'connected'
                  ? 'text-emerald-700 bg-emerald-100'
                  : 'text-amber-700 bg-amber-100'
              }`}>
                {systemStatus === 'connected' ? 'Live Mode' : 'Demo Mode'}
              </span>
            </div>
            <div className={`relative h-2 w-full overflow-hidden rounded-full ${
              systemStatus === 'connected' ? 'bg-emerald-100' : 'bg-amber-100'
            }`}>
              <div className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${
                systemStatus === 'connected'
                  ? 'w-full from-emerald-400 to-emerald-600'
                  : 'w-3/4 from-amber-400 to-amber-600'
              }`} />
            </div>
            <p className="text-[11px] text-slate-600">
              {systemStatus === 'connected' 
                ? 'Connected to backend API. All data is synced in real-time.'
                : 'Using demo data. Backend API connection required for live data.'}
            </p>
          </div>
        </Card>
      </section>

      {/* KPI row */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Revenue (MTD)"
          value={
            summaryLoading
              ? 'Loading...'
              : dashboardSummary
              ? (() => {
                  const revenueRaw = dashboardSummary.revenue_mtd || dashboardSummary.total_revenue || 0;
                  // Convert to number if string
                  const revenue = typeof revenueRaw === 'string' ? parseFloat(revenueRaw) : revenueRaw;
                  if (isNaN(revenue)) return '₹0';
                  
                  if (revenue >= 1000000) {
                    return `₹${(revenue / 1000000).toFixed(1)}M`;
                  } else if (revenue >= 1000) {
                    return `₹${(revenue / 1000).toFixed(1)}K`;
                  } else {
                    return `₹${revenue.toLocaleString()}`;
                  }
                })()
              : '₹248.4K'
          }
          trend="up"
          variant="teal"
        />
        <StatCard
          label="Orders in pipeline"
          value={
            summaryLoading
              ? 'Loading...'
              : dashboardSummary
              ? (() => {
                  // Try multiple field names - prioritize orders_in_pipeline (API field name)
                  const orders = dashboardSummary.orders_in_pipeline || 
                                dashboardSummary.orders_pipeline || 
                                dashboardSummary.orders_count || 
                                dashboardSummary.orders ||
                                dashboardSummary.pipeline_orders ||
                                342;
                  // Convert to number if string, then back to string
                  const numOrders = typeof orders === 'string' ? parseInt(orders, 10) : (typeof orders === 'number' ? orders : parseInt(String(orders), 10));
                  return isNaN(numOrders) ? '342' : numOrders.toString();
                })()
              : '342'
          }
          trend="up"
          variant="blue"
        />
        <StatCard
          label="Inventory health"
          value={
            summaryLoading
              ? 'Loading...'
              : dashboardSummary
              ? (() => {
                  const health: any = dashboardSummary.inventory_health;
                  if (health === undefined || health === null) return '89%';
                  
                  // Handle if it's already a string with %
                  if (typeof health === 'string') {
                    return health.includes('%') ? health : `${health}%`;
                  }
                  // Handle if it's a number
                  return `${health}%`;
                })()
              : '89%'
          }
          trend="flat"
          variant="yellow"
        />
        <StatCard
          label="Workforce availability"
          value={
            summaryLoading
              ? 'Loading...'
              : dashboardSummary
              ? (() => {
                  const availability: any = dashboardSummary.workforce_availability;
                  if (availability === undefined || availability === null) return '94%';
                  
                  // Handle if it's already a string with %
                  if (typeof availability === 'string') {
                    return availability.includes('%') ? availability : `${availability}%`;
                  }
                  // Handle if it's a number
                  return `${availability}%`;
                })()
              : '94%'
          }
          trend="up"
          variant="purple"
        />
      </section>

      {/* Monthly Transactions Bar Chart */}
      <section>
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">
              Monthly Transactions
            </h2>
            <p className="text-[11px] text-slate-500">Income, Expense & Profit by month</p>
          </div>

          {monthlyTransactionsLoading ? (
            <div className="h-64 flex items-center justify-center text-xs text-slate-500">
              Loading monthly transactions...
            </div>
          ) : monthlyTransactions.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-xs text-slate-500">
              No monthly transaction data available
            </div>
          ) : (
            <div className="space-y-4">
              {/* Stacked Bar Chart */}
              <div className="h-64 flex items-end gap-2 sm:gap-3 pb-8">
                {monthlyTransactions.map((item, index) => {
                  // Parse values
                  const income = typeof item.income === 'number' ? item.income : parseFloat(String(item.income || 0)) || 0;
                  const expense = typeof item.expense === 'number' ? item.expense : parseFloat(String(item.expense || 0)) || 0;
                  const profit = typeof item.profit === 'number' ? item.profit : parseFloat(String(item.profit || 0)) || 0;
                  
                  // Calculate max value for normalization (use income + expense for bar height)
                  const allTotals = monthlyTransactions.map(i => {
                    const inc = typeof i.income === 'number' ? i.income : parseFloat(String(i.income || 0)) || 0;
                    const exp = typeof i.expense === 'number' ? i.expense : parseFloat(String(i.expense || 0)) || 0;
                    return inc + exp;
                  });
                  const maxValue = Math.max(...allTotals, 1);
                  
                  // Calculate heights as percentages
                  const total = income + expense;
                  const totalHeightPercent = maxValue > 0 ? (total / maxValue) * 100 : 0;
                  
                  // Calculate individual segment heights within the bar
                  const incomeHeightPercent = total > 0 ? (income / total) * totalHeightPercent : 0;
                  const expenseHeightPercent = total > 0 ? (expense / total) * totalHeightPercent : 0;
                  
                  // Ensure minimum height for visibility (at least 5% if has data)
                  const minBarHeight = total > 0 ? Math.max(totalHeightPercent, 5) : 0;
                  
                  // Format month label (e.g., "2025-08" -> "Aug 2025")
                  const monthLabel = item.month 
                    ? (() => {
                        const [year, month] = item.month.split('-');
                        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                        const monthIndex = parseInt(month, 10) - 1;
                        return monthIndex >= 0 && monthIndex < 12 
                          ? `${monthNames[monthIndex]} ${year}`
                          : item.month;
                      })()
                    : `Month ${index + 1}`;
                  
                  return (
                    <div
                      key={`${item.month || index}-${index}`}
                      className="flex-1 flex flex-col items-center group relative min-w-0"
                    >
                      {/* Tooltip on hover */}
                      <div className="absolute bottom-full mb-2 hidden group-hover:block z-10">
                        <div className="bg-slate-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap shadow-lg">
                          <div className="font-semibold">{monthLabel}</div>
                          <div className="border-t border-slate-700 mt-1 pt-1">
                            <div className="text-emerald-300">Income: ₹{income.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                            <div className="text-amber-300">Expense: ₹{expense.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                            <div className={profit >= 0 ? "text-emerald-300" : "text-red-300"}>
                              Profit: ₹{profit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                          </div>
                          <div className="border-t border-slate-700 mt-1 pt-1 font-semibold">
                            Total: ₹{total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                        </div>
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
                      </div>
                      
                      {/* Stacked Bar Container */}
                      <div
                        className="w-full rounded-t-lg relative transition-all duration-300 cursor-pointer"
                        style={{ 
                          height: `${minBarHeight}%`,
                          minHeight: total > 0 ? '8px' : '2px'
                        }}
                      >
                        {/* Income segment (bottom, green) */}
                        {income > 0 && (
                          <div
                            className="absolute bottom-0 left-0 right-0 rounded-t-lg bg-gradient-to-t from-emerald-600 to-emerald-400 hover:from-emerald-700 hover:to-emerald-500 transition-all border border-emerald-700/20"
                            style={{ 
                              height: `${incomeHeightPercent}%`,
                              minHeight: incomeHeightPercent > 0 ? '4px' : '0px'
                            }}
                            title={`Income: ₹${income.toLocaleString()}`}
                          />
                        )}
                        
                        {/* Expense segment (top, orange/amber) */}
                        {expense > 0 && (
                          <div
                            className="absolute left-0 right-0 rounded-t-lg bg-gradient-to-t from-amber-600 to-amber-400 hover:from-amber-700 hover:to-amber-500 transition-all border border-amber-700/20"
                            style={{ 
                              bottom: `${incomeHeightPercent}%`,
                              height: `${expenseHeightPercent}%`,
                              minHeight: expenseHeightPercent > 0 ? '4px' : '0px'
                            }}
                            title={`Expense: ₹${expense.toLocaleString()}`}
                          />
                        )}
                        
                        {/* Profit indicator line (if positive, show as green line at top) */}
                        {profit !== 0 && (
                          <div
                            className={`absolute left-0 right-0 rounded-t-lg transition-all ${
                              profit > 0 
                                ? 'bg-gradient-to-t from-emerald-500 to-emerald-300 border border-emerald-600/30' 
                                : 'bg-gradient-to-t from-red-500 to-red-300 border border-red-600/30'
                            }`}
                            style={{ 
                              top: '-2px',
                              height: '3px',
                            }}
                            title={`Profit: ₹${profit.toLocaleString()}`}
                          />
                        )}
                        
                        {/* Value label on bar */}
                        {minBarHeight > 8 && total > 0 && (
                          <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 text-[10px] font-medium text-slate-600 whitespace-nowrap">
                            {total >= 1000000
                              ? `₹${(total / 1000000).toFixed(1)}M`
                              : total >= 1000 
                              ? `₹${(total / 1000).toFixed(1)}K`
                              : `₹${total.toFixed(0)}`
                            }
                          </div>
                        )}
                      </div>
                      
                      {/* Month label */}
                      <div className="mt-2 text-[10px] text-slate-600 font-medium text-center w-full truncate">
                        {monthLabel}
                      </div>
                      
                      {/* Profit indicator below bar */}
                      {profit !== 0 && (
                        <div className={`mt-1 text-[9px] font-semibold ${profit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                          {profit >= 0 ? '↑' : '↓'} {profit >= 0 ? '₹' : '-₹'}{Math.abs(profit).toLocaleString()}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center gap-4 text-xs pt-2 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-gradient-to-br from-emerald-600 to-emerald-400" />
                  <span className="text-slate-600 font-medium">Income</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-gradient-to-br from-amber-600 to-amber-400" />
                  <span className="text-slate-600 font-medium">Expense</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded border-2 border-emerald-500 bg-emerald-50" />
                  <span className="text-slate-600 font-medium">Profit</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded border-2 border-red-500 bg-red-50" />
                  <span className="text-slate-600 font-medium">Loss</span>
                </div>
              </div>
            </div>
          )}
        </Card>
      </section>

      {/* Charts & activity */}
      <section className="grid gap-4 lg:grid-cols-[1.4fr,1fr]">
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">
              Orders & utilization
            </h2>
            <p className="text-[11px] text-slate-500">Demo HTML/CSS charts</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Mini bar graph */}
            <div className="space-y-3">
              <p className="text-xs font-medium text-slate-700">
                Weekly order volume
              </p>
              {weeklyOrdersLoading ? (
                <div className="h-24 flex items-center justify-center text-xs text-slate-500">
                  Loading...
                </div>
              ) : (
                <>
                  <div className="flex items-end gap-2 h-24">
                    {weeklyOrders.map((height, idx) => {
                      // Calculate percentage height (assuming max value is 100 or normalize to max)
                      const maxValue = Math.max(...weeklyOrders, 100);
                      const percentageHeight = maxValue > 0 ? (height / maxValue) * 100 : 0;
                      
                      return (
                        <div
                          key={idx}
                          className="flex-1 rounded-t-full bg-gradient-to-t from-sky-200 to-sky-500 transition-transform duration-150 hover:scale-105"
                          style={{ height: `${Math.max(percentageHeight, 5)}%` }}
                        />
                      );
                    })}
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>Mon</span>
                    <span>Tue</span>
                    <span>Wed</span>
                    <span>Thu</span>
                    <span>Fri</span>
                  </div>
                </>
              )}
            </div>

            {/* Progress ring */}
            <div className="space-y-3 flex flex-col items-center justify-center">
              <p className="w-full text-left text-xs font-medium text-slate-700">
                Fulfilment SLA hit rate
              </p>
              {slaLoading ? (
                <div className="h-24 w-24 flex items-center justify-center text-xs text-slate-500">
                  Loading...
                </div>
              ) : (
                <div className="relative h-24 w-24">
                  {/* Background circle */}
                  <div className="absolute inset-0 rounded-full border-4 border-slate-100" />
                  {/* Progress circle - SVG approach for accurate circular progress */}
                  <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="8"
                      strokeDasharray={`${2 * Math.PI * 45}`}
                      strokeDashoffset={`${2 * Math.PI * 45 * (1 - slaHitRate / 100)}`}
                      className="transition-all duration-500"
                    />
                  </svg>
                  {/* Center circle with percentage */}
                  <div className="absolute inset-2 rounded-full bg-white flex items-center justify-center">
                    <span className="text-sm font-semibold text-emerald-700">
                      {Math.round(slaHitRate)}%
                    </span>
                  </div>
                </div>
              )}
              <p className="text-[11px] text-slate-500 text-center">
                Orders shipped within agreed SLA windows across all channels.
              </p>
            </div>
          </div>
        </Card>

        {/* Production Status Pie Chart */}
        <Card className="space-y-4">
          <h2 className="text-sm font-semibold text-slate-900">
            Production Status
          </h2>
          {productionStatusLoading ? (
            <div className="h-64 flex items-center justify-center text-xs text-slate-500">
              Loading...
            </div>
          ) : productionStatus.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-xs text-slate-500">
              No production status data available
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              {/* Pie Chart */}
              <div className="relative w-64 h-64 flex items-center justify-center">
                <svg 
                  className="w-full h-full transform -rotate-90" 
                  viewBox="0 0 100 100"
                  style={{ overflow: 'visible' }}
                >
                  {/* Background circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="#f1f5f9"
                    stroke="#e2e8f0"
                    strokeWidth="1"
                  />
                  {(() => {
                    const colors = [
                      '#10b981', // emerald
                      '#3b82f6', // blue
                      '#f59e0b', // amber
                      '#8b5cf6', // purple
                      '#ef4444', // red
                      '#06b6d4', // cyan
                      '#ec4899', // pink
                      '#84cc16', // lime
                    ];
                    const radius = 45;
                    const centerX = 50;
                    const centerY = 50;
                    let currentAngle = 0;
                    
                    // Calculate total from counts
                    const total = productionStatus.reduce((sum, item) => 
                      sum + (typeof item.count === 'number' ? item.count : parseInt(String(item.count), 10)), 0
                    );
                    
                    // Check if we have percentages from API (even if counts are 0)
                    const hasPercentages = productionStatus.some(item => {
                      const pct = item.percentage;
                      if (pct === undefined || pct === null) return false;
                      const numPct = typeof pct === 'number' ? pct : parseFloat(String(pct));
                      return !isNaN(numPct) && numPct > 0;
                    });

                    // If no data at all, show empty state
                    if (total === 0 && !hasPercentages) {
                      return (
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          fill="#f1f5f9"
                          stroke="#cbd5e1"
                          strokeWidth="2"
                          strokeDasharray="4 4"
                        />
                      );
                    }

                    return productionStatus.map((item, index) => {
                      const count = typeof item.count === 'number' ? item.count : parseInt(String(item.count), 10);
                      
                      // Use percentage from API if available, otherwise calculate from counts
                      let percentage = 0;
                      if (item.percentage !== undefined && item.percentage !== null) {
                        const pct = typeof item.percentage === 'number' 
                          ? item.percentage 
                          : parseFloat(String(item.percentage));
                        if (!isNaN(pct)) {
                          percentage = pct;
                        }
                      } else if (total > 0) {
                        percentage = (count / total) * 100;
                      }
                      
                      // Skip slices with 0 or very small percentages
                      if (percentage <= 0 || isNaN(percentage)) {
                        return null;
                      }
                      
                      const angle = (percentage / 100) * 360;
                      const startAngle = currentAngle;
                      const endAngle = currentAngle + angle;
                      
                      // Calculate path for pie slice
                      const startAngleRad = (startAngle * Math.PI) / 180;
                      const endAngleRad = (endAngle * Math.PI) / 180;
                      const x1 = centerX + radius * Math.cos(startAngleRad);
                      const y1 = centerY + radius * Math.sin(startAngleRad);
                      const x2 = centerX + radius * Math.cos(endAngleRad);
                      const y2 = centerY + radius * Math.sin(endAngleRad);
                      const largeArcFlag = angle > 180 ? 1 : 0;
                      
                      const pathData = [
                        `M ${centerX} ${centerY}`,
                        `L ${x1} ${y1}`,
                        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                        'Z'
                      ].join(' ');

                      currentAngle = endAngle;
                      
                      return (
                        <path
                          key={item.status}
                          d={pathData}
                          fill={colors[index % colors.length]}
                          stroke="#ffffff"
                          strokeWidth="1.5"
                          className="transition-all duration-300 hover:opacity-80 cursor-pointer"
                        />
                      );
                    }).filter(Boolean);
                  })()}
                </svg>
                {/* Center text */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                    <div className="text-xl font-bold text-slate-900">
                      {productionStatusTotal > 0 
                        ? productionStatusTotal 
                        : productionStatus.reduce((sum, item) => 
                            sum + (typeof item.count === 'number' ? item.count : parseInt(String(item.count), 10)), 0
                          )}
                    </div>
                    <div className="text-xs text-slate-500">Total</div>
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="w-full space-y-2">
                {productionStatus.map((item, index) => {
                  const colors = [
                    '#10b981', // emerald
                    '#3b82f6', // blue
                    '#f59e0b', // amber
                    '#8b5cf6', // purple
                    '#ef4444', // red
                    '#06b6d4', // cyan
                    '#ec4899', // pink
                    '#84cc16', // lime
                  ];
                  const count = typeof item.count === 'number' ? item.count : parseInt(String(item.count), 10);
                  
                  // Prioritize percentage from API, fallback to calculation only if not available
                  let percentage: number = 0;
                  if (item.percentage !== undefined && item.percentage !== null) {
                    // Use percentage directly from API
                    percentage = typeof item.percentage === 'number' 
                      ? item.percentage 
                      : parseFloat(String(item.percentage));
                    if (isNaN(percentage)) {
                      percentage = 0;
                    }
                  } else {
                    // Calculate from counts only if percentage not provided
                    const total = productionStatus.reduce((sum, i) => 
                      sum + (typeof i.count === 'number' ? i.count : parseInt(String(i.count), 10)), 0
                    );
                    percentage = total > 0 ? (count / total) * 100 : 0;
                  }

                  return (
                    <div key={item.status} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: colors[index % colors.length] }}
                        />
                        <span className="font-medium text-slate-700 capitalize">
                          {item.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-600">{count}</span>
                        <span className="text-slate-400">
                          ({typeof percentage === 'number' ? percentage.toFixed(1) : typeof percentage === 'string' ? parseFloat(percentage).toFixed(1) : '0.0'}%)
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </Card>
      </section>

      {/* Quick Module Shortcuts - Full Width */}
      <section className="space-y-3 sm:space-y-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            Quick Module Shortcuts
          </h2>
          <p className="text-xs text-slate-500">
            Access all your ERP modules from one place
          </p>
        </div>
        <Card className="p-4 sm:p-5 lg:p-6 border border-slate-200 shadow-sm w-full">
          <ModuleGrid />
        </Card>
      </section>

      {/* Recent Transactions - Below Module Shortcuts */}
      <section className="space-y-3 sm:space-y-4">
        <Card className="space-y-3 sm:space-y-4 w-full">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <h2 className="text-sm sm:text-base font-semibold text-slate-900">
              Recent transactions
            </h2>
          </div>
          
          {/* Search and Filter Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {/* Search Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700">Search</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by transaction #, party, account..."
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              />
            </div>

            {/* Type Filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700">Type</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as 'ALL' | 'INCOME' | 'EXPENSE' | 'TRANSFER')}
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary cursor-pointer"
              >
                <option value="ALL">All Types</option>
                <option value="INCOME">Income</option>
                <option value="EXPENSE">Expense</option>
                <option value="TRANSFER">Transfer</option>
              </select>
            </div>
          </div>
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            {loading ? (
              <div className="px-3 py-8 text-center text-xs text-slate-500">
                Loading transactions...
              </div>
            ) : error ? (
              <div className="px-3 py-8 text-center text-xs text-red-500">
                {error}
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="px-3 py-8 text-center text-xs text-slate-500">
                No transactions found
              </div>
            ) : (
              <table className="min-w-full text-[10px] sm:text-[11px]">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold">Date</th>
                    <th className="px-3 py-2 text-left font-semibold">Account</th>
                    <th className="px-3 py-2 text-left font-semibold">Type</th>
                    <th className="px-3 py-2 text-left font-semibold">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedTransactions.map((tx, index) => {
                    const isIncome = tx.type === 'INCOME';
                    const isExpense = tx.type === 'EXPENSE';
                    const currencySymbol = tx.currency === 'INR' ? '₹' : tx.currency === 'USD' ? '$' : '';
                    
                    return (
                      <tr key={index} className="hover:bg-slate-50">
                        <td className="px-3 py-2 text-slate-700">{tx.date}</td>
                        <td className="px-3 py-2 text-slate-700">{tx.account}</td>
                        <td className="px-3 py-2">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                              isIncome
                                ? 'bg-emerald-50 text-emerald-700'
                                : isExpense
                                ? 'bg-amber-50 text-amber-700'
                                : 'bg-slate-50 text-slate-700'
                            }`}
                          >
                            {tx.type}
                          </span>
                        </td>
                        <td
                          className={`px-3 py-2 font-semibold ${
                            isIncome ? 'text-emerald-700' : isExpense ? 'text-amber-700' : 'text-slate-700'
                          }`}
                        >
                          {currencySymbol}
                          {tx.amount.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
          
          {/* Pagination */}
          {!loading && !error && filteredTransactions.length > 0 && (
            <div className="px-4 py-3 border-t border-slate-200">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                {/* Left: Page size selector */}
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <span>Show</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="border border-slate-200 rounded px-2 py-1.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                  <span>per page</span>
                </div>

                {/* Center: Page numbers */}
                <div className="flex-1 flex justify-center">
                  {totalPages > 1 && (
                    <Pagination
                      page={currentPage}
                      totalPages={totalPages}
                      onChange={(newPage) => {
                        if (newPage >= 1 && newPage <= totalPages) {
                          setCurrentPage(newPage);
                        }
                      }}
                    />
                  )}
                </div>

                {/* Right: Showing info */}
                <div className="text-xs text-slate-600 whitespace-nowrap">
                  Showing <span className="font-medium text-slate-900">{startIndex + 1}</span> to <span className="font-medium text-slate-900">{Math.min(startIndex + itemsPerPage, filteredTotal)}</span> of <span className="font-medium text-slate-900">{filteredTotal}</span>
                </div>
              </div>
            </div>
          )}
        </Card>
      </section>
    </div>
  );
}


