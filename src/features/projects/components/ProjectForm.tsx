import { FormEvent, useState, useEffect } from 'react';
import type { Project, ProjectStatus, ProjectType, ProjectPriority } from '../types';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Textarea } from '../../../components/ui/Textarea';
import { Button } from '../../../components/ui/Button';
import { SearchableSelect } from '../../../components/ui/SearchableSelect';
import * as crmApi from '../../crm/api/crmApi';
import type { Customer } from '../../crm/types';
import * as projectsApi from '../api/projectsApi';
import type { ProjectManagerOption } from '../api/projectsApi';

type Props = {
  initial?: Partial<Project>;
  onSubmit: (values: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => void;
  onCancel?: () => void;
};

// Normalize phone to +91XXXXXXXXXX (10-digit mobile with Indian country code)
function normalizeIndianPhone(rawPhone?: string | null): string {
  if (!rawPhone) return '';
  const digits = rawPhone.replace(/\D/g, '');
  if (!digits) return '';

  // Remove leading country code if present
  let local = digits;
  if (local.startsWith('91')) {
    local = local.slice(2);
  }

  // Keep only last 10 digits (in case of longer input)
  if (local.length > 10) {
    local = local.slice(-10);
  }

  if (!local) return '';
  return `+91${local}`;
}

// Generate project code
function generateProjectCode(): string {
  const prefix = 'PROJ';
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${year}-${random}`;
}

export function ProjectForm({ initial, onSubmit, onCancel }: Props) {
  // Only fields that exist in backend API
  const [projectCode, setProjectCode] = useState(initial?.project_code ?? generateProjectCode());
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  
  const [client, setClient] = useState(initial?.client ?? '');
  const [clientId, setClientId] = useState(initial?.client_id ?? '');
  const [clientContactPerson, setClientContactPerson] = useState(initial?.client_contact_person ?? '');
  const [clientEmail, setClientEmail] = useState(initial?.client_email ?? '');
  const [clientPhone, setClientPhone] = useState(normalizeIndianPhone(initial?.client_phone));
  
  // Customer dropdown state
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState(initial?.client_id ?? '');
  
  // Project manager dropdown state
  const [projectManagers, setProjectManagers] = useState<ProjectManagerOption[]>([]);
  const [projectManagersLoading, setProjectManagersLoading] = useState(false);
  const [selectedProjectManagerId, setSelectedProjectManagerId] = useState(initial?.project_manager_id ?? '');
  
  // Validation errors state
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Update selected project manager when project managers list loads or initial data changes (edit mode)
  useEffect(() => {
    if (projectManagers.length > 0 && initial) {
      // First try to match by project_manager_id if available
      if (initial.project_manager_id) {
        const manager = projectManagers.find(m => String(m.id) === String(initial.project_manager_id));
        if (manager) {
          setSelectedProjectManagerId(String(manager.id));
          setProjectManager(manager.full_name || manager.name || '');
          return;
        }
      }
      // Fallback to matching by name if project_manager_id is not available
      if (initial.project_manager) {
        const manager = projectManagers.find(m => 
          m.name === initial.project_manager || 
          m.full_name === initial.project_manager ||
          m.email === initial.project_manager
        );
        if (manager) {
          setSelectedProjectManagerId(String(manager.id));
          setProjectManager(manager.full_name || manager.name || '');
        }
      }
    }
  }, [initial?.project_manager_id, initial?.project_manager, projectManagers]);
  
  const [projectType, setProjectType] = useState<ProjectType>(initial?.project_type ?? 'FIXED_PRICE');
  const [status, setStatus] = useState<ProjectStatus>(initial?.status ?? 'PLANNING');
  const [priority, setPriority] = useState<ProjectPriority | ''>(initial?.priority ?? '');
  
  const [startDate, setStartDate] = useState(initial?.start_date ?? new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(initial?.end_date ?? '');
  
  const [budget, setBudget] = useState<number | ''>(initial?.budget ?? '');
  const [currency, setCurrency] = useState(initial?.currency ?? 'INR');
  
  const [projectManager, setProjectManager] = useState(initial?.project_manager ?? '');
  const [contractNumber, setContractNumber] = useState(initial?.contract_number ?? '');

  // Sync form fields when initial prop changes (for edit mode)
  useEffect(() => {
    if (initial) {
      // Update all form fields when editing
      setProjectCode(initial.project_code ?? generateProjectCode());
      setName(initial.name ?? '');
      setDescription(initial.description ?? '');
      setClient(initial.client ?? '');
      setClientId(initial.client_id ?? '');
      setClientContactPerson(initial.client_contact_person ?? '');
      setClientEmail(initial.client_email ?? '');
      setClientPhone(normalizeIndianPhone(initial.client_phone));
      setSelectedCustomerId(initial.client_id ?? '');
      setProjectType(initial.project_type ?? 'FIXED_PRICE');
      setStatus(initial.status ?? 'PLANNING');
      setPriority(initial.priority ?? '');
      
      // Handle date formatting - ensure YYYY-MM-DD format
      if (initial.start_date) {
        const startDateStr = typeof initial.start_date === 'string' 
          ? initial.start_date.slice(0, 10) 
          : new Date(initial.start_date).toISOString().slice(0, 10);
        setStartDate(startDateStr);
      } else {
        setStartDate(new Date().toISOString().slice(0, 10));
      }
      
      if (initial.end_date) {
        const endDateStr = typeof initial.end_date === 'string' 
          ? initial.end_date.slice(0, 10) 
          : new Date(initial.end_date).toISOString().slice(0, 10);
        setEndDate(endDateStr);
      } else {
        setEndDate('');
      }
      
      setBudget(initial.budget ?? '');
      setCurrency(initial.currency ?? 'INR');
      setProjectManager(initial.project_manager ?? '');
      setSelectedProjectManagerId(initial.project_manager_id ? String(initial.project_manager_id) : '');
      setContractNumber(initial.contract_number ?? '');
      
      console.log('🔄 Syncing form fields:', {
        project_manager: initial.project_manager,
        project_manager_id: initial.project_manager_id,
        contract_number: initial.contract_number,
        manager_mobile: (initial as any).manager_mobile
      });
    } else {
      // Reset form when creating new project
      setProjectCode(generateProjectCode());
      setName('');
      setDescription('');
      setClient('');
      setClientId('');
      setClientContactPerson('');
      setClientEmail('');
      setClientPhone('');
      setSelectedCustomerId('');
      setProjectType('FIXED_PRICE');
      setStatus('PLANNING');
      setPriority('');
      setStartDate(new Date().toISOString().slice(0, 10));
      setEndDate('');
      setBudget('');
      setCurrency('INR');
      setProjectManager('');
      setSelectedProjectManagerId('');
      setContractNumber('');
    }
  }, [initial]);

  // Fetch customers and project managers on mount
  useEffect(() => {
    fetchCustomers();
    fetchProjectManagers();
  }, []);

  // Update selected customer when initial data changes (edit mode)
  useEffect(() => {
    if (initial?.client_id && customers.length > 0) {
      const customer = customers.find(c => String(c.id) === initial.client_id);
      if (customer) {
        setSelectedCustomerId(String(customer.id));
      }
    }
  }, [initial?.client_id, customers]);

  const fetchCustomers = async () => {
    setCustomersLoading(true);
    try {
      const customerList = await crmApi.listCustomers();
      setCustomers(customerList);
      console.log('✅ Fetched customers for project form:', customerList.length);
      
      // If editing and client_id exists, find and set the customer
      if (initial?.client_id) {
        const customer = customerList.find(c => String(c.id) === initial.client_id);
        if (customer) {
          setSelectedCustomerId(String(customer.id));
          // Auto-fill client details if not already set
          if (!client && (customer.company_name || customer.name)) {
            setClient(customer.company_name || customer.name || '');
          }
          if (!clientContactPerson && customer.contact_person) {
            setClientContactPerson(customer.contact_person);
          }
          if (!clientEmail && customer.email) {
            setClientEmail(customer.email);
          }
          if (!clientPhone && customer.phone) {
            setClientPhone(normalizeIndianPhone(customer.phone));
          }
        }
      }
    } catch (error) {
      console.error('❌ Error fetching customers:', error);
    } finally {
      setCustomersLoading(false);
    }
  };

  // Handle customer selection
  const handleCustomerSelect = (customerId: string) => {
    setSelectedCustomerId(customerId);
    const selectedCustomer = customers.find(c => String(c.id) === customerId);
    
    if (selectedCustomer) {
      // Set client name (use company_name if available, otherwise name)
      setClient(selectedCustomer.company_name || selectedCustomer.name || '');
      setClientId(String(selectedCustomer.id));
      
      // Auto-fill contact information if available
      if (selectedCustomer.contact_person) {
        setClientContactPerson(selectedCustomer.contact_person);
      }
      if (selectedCustomer.email) {
        setClientEmail(selectedCustomer.email);
      }
      if (selectedCustomer.phone) {
        setClientPhone(normalizeIndianPhone(selectedCustomer.phone));
      }
    }
  };

  // Fetch project managers
  const fetchProjectManagers = async () => {
    setProjectManagersLoading(true);
    try {
      const managerList = await projectsApi.listProjectManagers();
      setProjectManagers(managerList);
      console.log('✅ Fetched project managers for project form:', managerList.length);
      
      // If editing, find and set the manager after list loads
      if (managerList.length > 0 && initial) {
        // First try to match by project_manager_id if available
        if (initial.project_manager_id) {
          const manager = managerList.find(m => String(m.id) === String(initial.project_manager_id));
          if (manager) {
            setSelectedProjectManagerId(String(manager.id));
            setProjectManager(manager.full_name || manager.name || initial.project_manager || '');
            console.log('✅ Matched project manager by ID:', manager.id, manager.full_name || manager.name);
            return;
          }
        }
        // Fallback to matching by name if project_manager_id is not available
        if (initial.project_manager) {
          const manager = managerList.find(m => 
            m.name === initial.project_manager || 
            m.full_name === initial.project_manager ||
            m.email === initial.project_manager
          );
          if (manager) {
            setSelectedProjectManagerId(String(manager.id));
            setProjectManager(manager.full_name || manager.name || '');
            console.log('✅ Matched project manager by name:', manager.id, manager.full_name || manager.name);
          }
        }
      }
    } catch (error) {
      console.error('❌ Error fetching project managers:', error);
    } finally {
      setProjectManagersLoading(false);
    }
  };

  // Handle project manager selection
  const handleProjectManagerSelect = (managerId: string) => {
    setSelectedProjectManagerId(managerId);
    const selectedManager = projectManagers.find(m => m.id === managerId);
    
    if (selectedManager) {
      // Set project manager name (use full_name if available, otherwise name)
      setProjectManager(selectedManager.full_name || selectedManager.name || '');
    } else {
      // If no manager selected, clear field
      setProjectManager('');
    }
  };

  // Prepare customer options for SearchableSelect
  const customerOptions = customers.map(customer => ({
    value: String(customer.id),
    label: customer.company_name || customer.name || `Customer ${customer.id}`,
    id: customer.id
  }));

  // Prepare project manager options for SearchableSelect
  const projectManagerOptions = projectManagers.map(manager => ({
    value: manager.id,
    label: manager.full_name || manager.name || manager.email || `Manager ${manager.id}`,
    id: manager.id
  }));

  // Calculate progress percentage based on status
  const getProgressPercentageByStatus = (statusValue: ProjectStatus): number | undefined => {
    if (!statusValue) return undefined;
    
    // Map status to initial progress percentage
    const statusProgressMap: Record<ProjectStatus, number> = {
      'PLANNING': 0,
      'IN_PROGRESS': 50,
      'ON_HOLD': 25,
      'COMPLETED': 100,
      'CANCELLED': 0,
      'ARCHIVED': 100,
    };
    
    return statusProgressMap[statusValue];
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Validate mandatory fields
    if (!name || name.trim() === '') {
      newErrors.name = 'Project Name is required';
    }
    
    if (!selectedCustomerId || selectedCustomerId === '') {
      newErrors.client = 'Client Name is required';
    }
    
    if (budget === '' || budget === null || budget === undefined) {
      newErrors.budget = 'Budget is required';
    } else if (Number(budget) <= 0) {
      newErrors.budget = 'Budget must be greater than 0';
    }
    
    if (!startDate || startDate.trim() === '') {
      newErrors.startDate = 'Start Date is required';
    }
    
    if (!projectType || projectType.trim() === '') {
      newErrors.projectType = 'Project Type is required';
    }
    
    if (!status || status.trim() === '') {
      newErrors.status = 'Status is required';
    }
    
    if (!selectedProjectManagerId || selectedProjectManagerId === '') {
      newErrors.projectManager = 'Project Manager is required';
    }
    
    // Validate contract number (10 digit mobile number)
    if (contractNumber && contractNumber.trim() !== '') {
      const cleanedContractNumber = contractNumber.replace(/\D/g, ''); // Remove non-digits
      if (cleanedContractNumber.length !== 10) {
        newErrors.contractNumber = 'Contract Number must be exactly 10 digits';
      } else if (!/^[0-9]{10}$/.test(cleanedContractNumber)) {
        newErrors.contractNumber = 'Contract Number must contain only digits';
      }
    }

    // Validate client phone (Indian mobile: +91 followed by 10 digits)
    if (clientPhone && clientPhone.trim() !== '') {
      const phone = clientPhone.trim();
      if (!/^\+91\d{10}$/.test(phone)) {
        newErrors.clientPhone = 'Client Phone must be +91 followed by 10 digits';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) {
      // Scroll to first error
      const firstErrorField = Object.keys(errors)[0];
      if (firstErrorField) {
        // Try to find the field by name attribute or ID
        const element = document.querySelector(`[name="${firstErrorField}"]`) || 
                       document.querySelector(`#${firstErrorField}`) ||
                       document.querySelector(`[data-field="${firstErrorField}"]`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
          // Fallback: scroll to the error message
          const errorElement = document.querySelector(`[data-error="${firstErrorField}"]`);
          errorElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
      return;
    }
    
    // Calculate progress percentage based on status
    const progressPercentage = getProgressPercentageByStatus(status);
    
    // Only submit fields that exist in backend API
    onSubmit({
      project_code: projectCode || undefined,
      name,
      description: description || undefined,
      client,
      client_id: clientId || undefined,
      client_contact_person: clientContactPerson || undefined,
      client_email: clientEmail || undefined,
      client_phone: clientPhone || undefined,
      project_type: projectType,
      status,
      priority: priority || undefined,
      progress_percentage: progressPercentage,
      start_date: startDate,
      end_date: endDate || undefined,
      budget: Number(budget),
      currency: currency || undefined,
      project_manager: projectManager || undefined,
      project_manager_id: selectedProjectManagerId || undefined,
      contract_number: contractNumber || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-xs">
      {/* Mandatory Fields Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
        <p className="text-xs text-blue-800 font-medium mb-1">Required Fields</p>
        <p className="text-xs text-blue-700">
          Fields marked with <span className="text-red-500 font-bold">*</span> are mandatory and must be filled before submitting.
        </p>
      </div>

      {/* Project Information */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Project Information</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <Input
              label="Project Code"
              value={projectCode}
              onChange={(e) => setProjectCode(e.target.value)}
              placeholder="Auto-generated"
            />
          </div>
          <div>
            <div className="flex items-center gap-1 mb-1.5">
              <label className="text-xs font-medium text-slate-700">Project Name</label>
              <span className="text-red-500 text-xs">*</span>
            </div>
            <Input
              name="name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) {
                  setErrors({ ...errors, name: '' });
                }
              }}
              placeholder="Project name"
              className={errors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
            />
            {errors.name && (
              <p className="text-xs text-red-500 mt-1" data-error="name">{errors.name}</p>
            )}
          </div>
          <div>
            <div className="flex items-center gap-1 mb-1.5">
              <label className="text-xs font-medium text-slate-700">Project Type</label>
              <span className="text-red-500 text-xs">*</span>
            </div>
            <Select
              name="projectType"
              value={projectType}
              onChange={(e) => {
                setProjectType(e.target.value as ProjectType);
                if (errors.projectType) {
                  setErrors({ ...errors, projectType: '' });
                }
              }}
              className={errors.projectType ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
            >
              <option value="FIXED_PRICE">Fixed Price</option>
              <option value="TIME_MATERIALS">Time & Materials</option>
              <option value="HYBRID">Hybrid</option>
              <option value="SUPPORT">Support</option>
              <option value="CONSULTING">Consulting</option>
              <option value="IMPLEMENTATION">Implementation</option>
              <option value="OTHER">Other</option>
            </Select>
            {errors.projectType && (
              <p className="text-xs text-red-500 mt-1" data-error="projectType">{errors.projectType}</p>
            )}
          </div>
        </div>
        <Textarea
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Project description"
          rows={3}
        />
      </div>

      {/* Client Information */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Client Information</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <div className="flex items-center gap-1 mb-1.5">
              <label className="text-xs font-medium text-slate-700">Client Name</label>
              <span className="text-red-500 text-xs">*</span>
            </div>
            <div className={errors.client ? '[&_button]:border-red-500 [&_button]:focus:border-red-500 [&_button]:focus:ring-red-500' : ''}>
              <SearchableSelect
                value={selectedCustomerId}
                onChange={(value) => {
                  handleCustomerSelect(value);
                  if (errors.client) {
                    setErrors({ ...errors, client: '' });
                  }
                }}
                options={customerOptions}
                placeholder={customersLoading ? "Loading customers..." : "Search and select client"}
              />
            </div>
            {errors.client && (
              <p className="text-xs text-red-500 mt-1" data-error="client">{errors.client}</p>
            )}
          </div>
          <Input
            label="Client ID"
            value={clientId}
            placeholder="Auto-filled from selection"
            readOnly
            className="bg-slate-50"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Input
            label="Contact Person"
            value={clientContactPerson}
            onChange={(e) => setClientContactPerson(e.target.value)}
            placeholder="Primary contact"
          />
          <Input
            label="Client Email"
            type="email"
            value={clientEmail}
            onChange={(e) => setClientEmail(e.target.value)}
            placeholder="client@company.com"
          />
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Client Phone <span className="text-[10px] font-normal text-slate-500">(+91 and 10 digit mobile)</span>
            </label>
            <Input
              name="clientPhone"
              type="tel"
              value={clientPhone}
              onChange={(e) => {
                const raw = e.target.value;
                const digits = raw.replace(/\D/g, '');

                // Extract local 10-digit part, ignoring any leading country code
                let local = digits;
                if (local.startsWith('91')) {
                  local = local.slice(2);
                }
                if (local.length > 10) {
                  local = local.slice(0, 10);
                }

                const formatted = local ? `+91${local}` : '';
                setClientPhone(formatted);

                if (errors.clientPhone) {
                  setErrors({ ...errors, clientPhone: '' });
                }
              }}
              placeholder="+91XXXXXXXXXX"
              maxLength={13}
              className={errors.clientPhone ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
            />
            {errors.clientPhone && (
              <p className="text-xs text-red-500 mt-1" data-error="clientPhone">
                {errors.clientPhone}
              </p>
            )}
          </div>
        </div>
        {/* Display selected client name */}
        {client && (
          <div className="text-xs text-slate-600 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
            <span className="font-medium">Selected Client:</span> {client}
          </div>
        )}
      </div>

      {/* Status & Priority */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Status & Priority</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <div className="flex items-center gap-1 mb-1.5">
              <label className="text-xs font-medium text-slate-700">Status</label>
              <span className="text-red-500 text-xs">*</span>
            </div>
            <Select
              name="status"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value as ProjectStatus);
                if (errors.status) {
                  setErrors({ ...errors, status: '' });
                }
              }}
              className={errors.status ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
            >
              <option value="PLANNING">Planning</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="ON_HOLD">On Hold</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="ARCHIVED">Archived</option>
            </Select>
            {errors.status && (
              <p className="text-xs text-red-500 mt-1">{errors.status}</p>
            )}
          </div>
          <Select
            label="Priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as ProjectPriority)}
          >
            <option value="">Select priority</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </Select>
        </div>
      </div>

      {/* Dates */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Dates</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <div className="flex items-center gap-1 mb-1.5">
              <label className="text-xs font-medium text-slate-700">Start Date</label>
              <span className="text-red-500 text-xs">*</span>
            </div>
            <Input
              name="startDate"
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                if (errors.startDate) {
                  setErrors({ ...errors, startDate: '' });
                }
              }}
              className={errors.startDate ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
            />
            {errors.startDate && (
              <p className="text-xs text-red-500 mt-1" data-error="startDate">{errors.startDate}</p>
            )}
          </div>
          <Input
            label="End Date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            min={startDate}
          />
        </div>
      </div>

      {/* Budget & Financial */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Budget & Financial</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <div className="flex items-center gap-1 mb-1.5">
              <label className="text-xs font-medium text-slate-700">Budget</label>
              <span className="text-red-500 text-xs">*</span>
            </div>
            <Input
              name="budget"
              type="number"
              value={budget}
              onChange={(e) => {
                setBudget(e.target.value === '' ? '' : Number(e.target.value));
                if (errors.budget) {
                  setErrors({ ...errors, budget: '' });
                }
              }}
              placeholder="0.00"
              min={0}
              step="0.01"
              className={errors.budget ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
            />
            {errors.budget && (
              <p className="text-xs text-red-500 mt-1" data-error="budget">{errors.budget}</p>
            )}
          </div>
          <Select
            label="Currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
          >
            <option value="INR">INR (₹)</option>
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
          </Select>
        </div>
      </div>

      {/* Project Management */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Project Management</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <div className="flex items-center gap-1 mb-1.5">
              <label className="text-xs font-medium text-slate-700">Project Manager</label>
              <span className="text-red-500 text-xs">*</span>
            </div>
            <div className={errors.projectManager ? '[&_button]:border-red-500 [&_button]:focus:border-red-500 [&_button]:focus:ring-red-500' : ''}>
              <SearchableSelect
                value={selectedProjectManagerId}
                onChange={(value) => {
                  handleProjectManagerSelect(value);
                  if (errors.projectManager) {
                    setErrors({ ...errors, projectManager: '' });
                  }
                }}
                options={projectManagerOptions}
                placeholder={projectManagersLoading ? "Loading project managers..." : "Search and select project manager"}
              />
            </div>
            {errors.projectManager && (
              <p className="text-xs text-red-500 mt-1" data-error="projectManager">{errors.projectManager}</p>
            )}
          </div>
          <div>
            <Input
              name="contractNumber"
              label="Contract Number"
              value={contractNumber}
              onChange={(e) => {
                // Only allow digits and limit to 10 digits
                const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                setContractNumber(value);
                if (errors.contractNumber) {
                  setErrors({ ...errors, contractNumber: '' });
                }
              }}
              placeholder="10 digit mobile number"
              maxLength={10}
              className={errors.contractNumber ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
            />
            {errors.contractNumber && (
              <p className="text-xs text-red-500 mt-1" data-error="contractNumber">{errors.contractNumber}</p>
            )}
            {!errors.contractNumber && contractNumber && (
              <p className="text-xs text-slate-500 mt-1">{contractNumber.length}/10 digits</p>
            )}
          </div>
        </div>
        {/* Display selected project manager name */}
        {projectManager && (
          <div className="text-xs text-slate-600 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
            <span className="font-medium">Selected Project Manager:</span> {projectManager}
          </div>
        )}
      </div>

      <div className="mt-4 border-t border-slate-200 bg-white pt-3 flex flex-col sm:flex-row justify-end gap-2 sticky bottom-0">
        <Button
          type="button"
          variant="ghost"
          size="md"
          onClick={onCancel}
          className="w-full sm:w-auto"
        >
          Cancel
        </Button>
        <Button type="submit" variant="primary" size="md" className="w-full sm:w-auto">
          {initial ? 'Update Project' : 'Create Project'}
        </Button>
      </div>
    </form>
  );
}
