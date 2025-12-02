import { FormEvent, useState, useEffect } from 'react';
import type { Project, ProjectStatus, ProjectType, ProjectPriority, BillingType, ProjectPhase } from '../types';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Textarea } from '../../../components/ui/Textarea';
import { Button } from '../../../components/ui/Button';

type Props = {
  initial?: Partial<Project>;
  onSubmit: (values: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => void;
  onCancel?: () => void;
};

// Generate project code
function generateProjectCode(): string {
  const prefix = 'PROJ';
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${year}-${random}`;
}

export function ProjectForm({ initial, onSubmit, onCancel }: Props) {
  const [projectCode, setProjectCode] = useState(initial?.project_code ?? generateProjectCode());
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  
  const [client, setClient] = useState(initial?.client ?? '');
  const [clientId, setClientId] = useState(initial?.client_id ?? '');
  const [clientContactPerson, setClientContactPerson] = useState(initial?.client_contact_person ?? '');
  const [clientEmail, setClientEmail] = useState(initial?.client_email ?? '');
  const [clientPhone, setClientPhone] = useState(initial?.client_phone ?? '');
  
  const [projectType, setProjectType] = useState<ProjectType>(initial?.project_type ?? 'FIXED_PRICE');
  const [status, setStatus] = useState<ProjectStatus>(initial?.status ?? 'PLANNING');
  const [priority, setPriority] = useState<ProjectPriority | ''>(initial?.priority ?? '');
  const [phase, setPhase] = useState<ProjectPhase | ''>(initial?.phase ?? '');
  
  const [startDate, setStartDate] = useState(initial?.start_date ?? new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(initial?.end_date ?? '');
  const [actualStartDate, setActualStartDate] = useState(initial?.actual_start_date ?? '');
  const [actualEndDate, setActualEndDate] = useState(initial?.actual_end_date ?? '');
  const [plannedStartDate, setPlannedStartDate] = useState(initial?.planned_start_date ?? '');
  const [plannedEndDate, setPlannedEndDate] = useState(initial?.planned_end_date ?? '');
  
  const [budget, setBudget] = useState<number | ''>(initial?.budget ?? '');
  const [estimatedBudget, setEstimatedBudget] = useState<number | ''>(initial?.estimated_budget ?? '');
  const [actualCost, setActualCost] = useState<number | ''>(initial?.actual_cost ?? '');
  const [revenue, setRevenue] = useState<number | ''>(initial?.revenue ?? '');
  const [currency, setCurrency] = useState(initial?.currency ?? 'USD');
  
  const [billingType, setBillingType] = useState<BillingType | ''>(initial?.billing_type ?? '');
  const [hourlyRate, setHourlyRate] = useState<number | ''>(initial?.hourly_rate ?? '');
  const [billingRate, setBillingRate] = useState<number | ''>(initial?.billing_rate ?? '');
  const [billableHours, setBillableHours] = useState<number | ''>(initial?.billable_hours ?? '');
  const [invoicedAmount, setInvoicedAmount] = useState<number | ''>(initial?.invoiced_amount ?? '');
  const [paidAmount, setPaidAmount] = useState<number | ''>(initial?.paid_amount ?? '');
  
  const [projectManager, setProjectManager] = useState(initial?.project_manager ?? '');
  const [assignedTeam, setAssignedTeam] = useState(initial?.assigned_team?.join(', ') ?? '');
  const [teamMembers, setTeamMembers] = useState(initial?.team_members?.join(', ') ?? '');
  const [resourceAllocation, setResourceAllocation] = useState<number | ''>(initial?.resource_allocation ?? '');
  
  const [progressPercentage, setProgressPercentage] = useState<number | ''>(initial?.progress_percentage ?? '');
  const [completionPercentage, setCompletionPercentage] = useState<number | ''>(initial?.completion_percentage ?? '');
  const [tasksCompleted, setTasksCompleted] = useState<number | ''>(initial?.tasks_completed ?? '');
  const [tasksTotal, setTasksTotal] = useState<number | ''>(initial?.tasks_total ?? '');
  
  const [estimatedHours, setEstimatedHours] = useState<number | ''>(initial?.estimated_hours ?? '');
  const [loggedHours, setLoggedHours] = useState<number | ''>(initial?.logged_hours ?? '');
  
  const [deliverables, setDeliverables] = useState(initial?.deliverables?.join(', ') ?? '');
  const [deliverablesCompleted, setDeliverablesCompleted] = useState<number | ''>(initial?.deliverables_completed ?? '');
  
  const [riskLevel, setRiskLevel] = useState(initial?.risk_level ?? '');
  const [issuesCount, setIssuesCount] = useState<number | ''>(initial?.issues_count ?? '');
  const [risksCount, setRisksCount] = useState<number | ''>(initial?.risks_count ?? '');
  
  const [qualityScore, setQualityScore] = useState<number | ''>(initial?.quality_score ?? '');
  const [clientSatisfaction, setClientSatisfaction] = useState<number | ''>(initial?.client_satisfaction ?? '');
  const [performanceRating, setPerformanceRating] = useState<number | ''>(initial?.performance_rating ?? '');
  
  const [projectScope, setProjectScope] = useState(initial?.project_scope ?? '');
  const [objectives, setObjectives] = useState(initial?.objectives?.join(', ') ?? '');
  const [successCriteria, setSuccessCriteria] = useState(initial?.success_criteria?.join(', ') ?? '');
  
  const [location, setLocation] = useState(initial?.location ?? '');
  const [workLocation, setWorkLocation] = useState(initial?.work_location ?? '');
  
  const [contractNumber, setContractNumber] = useState(initial?.contract_number ?? '');
  const [contractStartDate, setContractStartDate] = useState(initial?.contract_start_date ?? '');
  const [contractEndDate, setContractEndDate] = useState(initial?.contract_end_date ?? '');
  const [contractValue, setContractValue] = useState<number | ''>(initial?.contract_value ?? '');
  const [paymentTerms, setPaymentTerms] = useState(initial?.payment_terms ?? '');
  
  const [tags, setTags] = useState(initial?.tags?.join(', ') ?? '');
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [internalNotes, setInternalNotes] = useState(initial?.internal_notes ?? '');

  // Auto-calculate remaining budget
  useEffect(() => {
    if (budget !== '' && actualCost !== '') {
      // This will be calculated on submit
    }
  }, [budget, actualCost]);

  // Auto-calculate profit and margin
  useEffect(() => {
    if (revenue !== '' && actualCost !== '') {
      // This will be calculated on submit
    }
  }, [revenue, actualCost]);

  // Auto-calculate outstanding amount
  useEffect(() => {
    if (invoicedAmount !== '' && paidAmount !== '') {
      // This will be calculated on submit
    }
  }, [invoicedAmount, paidAmount]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name || !client || budget === '' || !startDate) return;
    
    // Calculate metrics
    const remainingBudget = budget && actualCost
      ? Number(budget) - Number(actualCost)
      : undefined;
    
    const profit = revenue && actualCost
      ? Number(revenue) - Number(actualCost)
      : undefined;
    
    const profitMargin = revenue && Number(revenue) > 0 && profit
      ? (profit / Number(revenue)) * 100
      : undefined;
    
    const outstandingAmount = invoicedAmount && paidAmount
      ? Number(invoicedAmount) - Number(paidAmount)
      : undefined;
    
    const remainingHours = estimatedHours && loggedHours
      ? Number(estimatedHours) - Number(loggedHours)
      : undefined;
    
    onSubmit({
      project_code: projectCode,
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
      phase: phase || undefined,
      start_date: startDate,
      end_date: endDate || undefined,
      actual_start_date: actualStartDate || undefined,
      actual_end_date: actualEndDate || undefined,
      planned_start_date: plannedStartDate || undefined,
      planned_end_date: plannedEndDate || undefined,
      budget: Number(budget),
      estimated_budget: Number(estimatedBudget) || undefined,
      actual_cost: Number(actualCost) || undefined,
      remaining_budget: remainingBudget,
      revenue: Number(revenue) || undefined,
      profit,
      profit_margin: profitMargin,
      currency: currency || undefined,
      billing_type: billingType || undefined,
      hourly_rate: Number(hourlyRate) || undefined,
      billing_rate: Number(billingRate) || undefined,
      billable_hours: Number(billableHours) || undefined,
      invoiced_amount: Number(invoicedAmount) || undefined,
      paid_amount: Number(paidAmount) || undefined,
      outstanding_amount: outstandingAmount,
      project_manager: projectManager || undefined,
      assigned_team: assignedTeam ? assignedTeam.split(',').map(t => t.trim()).filter(t => t) : undefined,
      team_members: teamMembers ? teamMembers.split(',').map(m => m.trim()).filter(m => m) : undefined,
      resource_allocation: Number(resourceAllocation) || undefined,
      progress_percentage: Number(progressPercentage) || undefined,
      completion_percentage: Number(completionPercentage) || undefined,
      tasks_completed: Number(tasksCompleted) || undefined,
      tasks_total: Number(tasksTotal) || undefined,
      estimated_hours: Number(estimatedHours) || undefined,
      logged_hours: Number(loggedHours) || undefined,
      remaining_hours: remainingHours,
      deliverables: deliverables ? deliverables.split(',').map(d => d.trim()).filter(d => d) : undefined,
      deliverables_completed: Number(deliverablesCompleted) || undefined,
      risk_level: (riskLevel as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL') || undefined,
      issues_count: Number(issuesCount) || undefined,
      risks_count: Number(risksCount) || undefined,
      quality_score: Number(qualityScore) || undefined,
      client_satisfaction: Number(clientSatisfaction) || undefined,
      performance_rating: Number(performanceRating) || undefined,
      project_scope: projectScope || undefined,
      objectives: objectives ? objectives.split(',').map(o => o.trim()).filter(o => o) : undefined,
      success_criteria: successCriteria ? successCriteria.split(',').map(c => c.trim()).filter(c => c) : undefined,
      location: location || undefined,
      work_location: (workLocation as 'ONSITE' | 'REMOTE' | 'HYBRID') || undefined,
      contract_number: contractNumber || undefined,
      contract_start_date: contractStartDate || undefined,
      contract_end_date: contractEndDate || undefined,
      contract_value: Number(contractValue) || undefined,
      payment_terms: paymentTerms || undefined,
      tags: tags ? tags.split(',').map(t => t.trim()).filter(t => t) : undefined,
      notes: notes || undefined,
      internal_notes: internalNotes || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-xs">
      {/* Project Information */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Project Information</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Input
            label="Project Code"
            value={projectCode}
            onChange={(e) => setProjectCode(e.target.value)}
            placeholder="Auto-generated"
          />
          <Input
            label="Project Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Project name"
            required
          />
          <Select
            label="Project Type"
            value={projectType}
            onChange={(e) => setProjectType(e.target.value as ProjectType)}
            required
          >
            <option value="FIXED_PRICE">Fixed Price</option>
            <option value="TIME_MATERIALS">Time & Materials</option>
            <option value="HYBRID">Hybrid</option>
            <option value="SUPPORT">Support</option>
            <option value="CONSULTING">Consulting</option>
            <option value="IMPLEMENTATION">Implementation</option>
            <option value="OTHER">Other</option>
          </Select>
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Input
            label="Client Name"
            value={client}
            onChange={(e) => setClient(e.target.value)}
            placeholder="Client name"
            required
          />
          <Input
            label="Client ID"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            placeholder="CRM client ID"
          />
          <Input
            label="Contact Person"
            value={clientContactPerson}
            onChange={(e) => setClientContactPerson(e.target.value)}
            placeholder="Primary contact"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Client Email"
            type="email"
            value={clientEmail}
            onChange={(e) => setClientEmail(e.target.value)}
            placeholder="client@company.com"
          />
          <Input
            label="Client Phone"
            type="tel"
            value={clientPhone}
            onChange={(e) => setClientPhone(e.target.value)}
            placeholder="+1 (555) 123-4567"
          />
        </div>
      </div>

      {/* Status & Priority */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Status & Priority</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as ProjectStatus)}
            required
          >
            <option value="PLANNING">Planning</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="ON_HOLD">On Hold</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="ARCHIVED">Archived</option>
          </Select>
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
          <Select
            label="Phase"
            value={phase}
            onChange={(e) => setPhase(e.target.value as ProjectPhase)}
          >
            <option value="">Select phase</option>
            <option value="INITIATION">Initiation</option>
            <option value="PLANNING">Planning</option>
            <option value="EXECUTION">Execution</option>
            <option value="MONITORING">Monitoring</option>
            <option value="CLOSURE">Closure</option>
          </Select>
          <Select
            label="Risk Level"
            value={riskLevel}
            onChange={(e) => setRiskLevel(e.target.value)}
          >
            <option value="">Select risk level</option>
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Input
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
          <Input
            label="End Date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            min={startDate}
          />
          <Input
            label="Planned Start Date"
            type="date"
            value={plannedStartDate}
            onChange={(e) => setPlannedStartDate(e.target.value)}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Planned End Date"
            type="date"
            value={plannedEndDate}
            onChange={(e) => setPlannedEndDate(e.target.value)}
            min={plannedStartDate}
          />
          <Input
            label="Actual Start Date"
            type="date"
            value={actualStartDate}
            onChange={(e) => setActualStartDate(e.target.value)}
            max={new Date().toISOString().slice(0, 10)}
          />
        </div>
        {status === 'COMPLETED' && (
          <Input
            label="Actual End Date"
            type="date"
            value={actualEndDate}
            onChange={(e) => setActualEndDate(e.target.value)}
            max={new Date().toISOString().slice(0, 10)}
          />
        )}
      </div>

      {/* Budget & Financial */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Budget & Financial</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Input
            label="Budget"
            type="number"
            value={budget}
            onChange={(e) => setBudget(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="0.00"
            min={0}
            step="0.01"
            required
          />
          <Input
            label="Estimated Budget"
            type="number"
            value={estimatedBudget}
            onChange={(e) => setEstimatedBudget(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="0.00"
            min={0}
            step="0.01"
          />
          <Input
            label="Actual Cost"
            type="number"
            value={actualCost}
            onChange={(e) => setActualCost(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="0.00"
            min={0}
            step="0.01"
          />
          <Select
            label="Currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
          >
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
            <option value="INR">INR (₹)</option>
          </Select>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Revenue"
            type="number"
            value={revenue}
            onChange={(e) => setRevenue(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="0.00"
            min={0}
            step="0.01"
          />
          <Input
            label="Remaining Budget"
            type="number"
            value={budget && actualCost ? Number(budget) - Number(actualCost) : ''}
            placeholder="Auto-calculated"
            readOnly
            className="bg-slate-50"
          />
        </div>
      </div>

      {/* Billing */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Billing</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Select
            label="Billing Type"
            value={billingType}
            onChange={(e) => setBillingType(e.target.value as BillingType)}
          >
            <option value="">Select type</option>
            <option value="FIXED">Fixed</option>
            <option value="HOURLY">Hourly</option>
            <option value="DAILY">Daily</option>
            <option value="WEEKLY">Weekly</option>
            <option value="MONTHLY">Monthly</option>
            <option value="MILESTONE">Milestone</option>
            <option value="PERCENTAGE">Percentage</option>
          </Select>
          <Input
            label="Hourly Rate"
            type="number"
            value={hourlyRate}
            onChange={(e) => setHourlyRate(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="0.00"
            min={0}
            step="0.01"
          />
          <Input
            label="Billing Rate"
            type="number"
            value={billingRate}
            onChange={(e) => setBillingRate(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="0.00"
            min={0}
            step="0.01"
          />
          <Input
            label="Billable Hours"
            type="number"
            value={billableHours}
            onChange={(e) => setBillableHours(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="0"
            min={0}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Input
            label="Invoiced Amount"
            type="number"
            value={invoicedAmount}
            onChange={(e) => setInvoicedAmount(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="0.00"
            min={0}
            step="0.01"
          />
          <Input
            label="Paid Amount"
            type="number"
            value={paidAmount}
            onChange={(e) => setPaidAmount(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="0.00"
            min={0}
            step="0.01"
          />
          <Input
            label="Outstanding Amount"
            type="number"
            value={invoicedAmount && paidAmount ? Number(invoicedAmount) - Number(paidAmount) : ''}
            placeholder="Auto-calculated"
            readOnly
            className="bg-slate-50"
          />
        </div>
        <Input
          label="Payment Terms"
          value={paymentTerms}
          onChange={(e) => setPaymentTerms(e.target.value)}
          placeholder="Net 30, Due on receipt, etc."
        />
      </div>

      {/* Resource Management */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Resource Management</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Input
            label="Project Manager"
            value={projectManager}
            onChange={(e) => setProjectManager(e.target.value)}
            placeholder="Manager name"
          />
          <Input
            label="Assigned Team"
            value={assignedTeam}
            onChange={(e) => setAssignedTeam(e.target.value)}
            placeholder="Team1, Team2 (comma-separated)"
          />
          <Input
            label="Resource Allocation (%)"
            type="number"
            value={resourceAllocation}
            onChange={(e) => setResourceAllocation(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="0"
            min={0}
            max={100}
          />
        </div>
        <Input
          label="Team Members"
          value={teamMembers}
          onChange={(e) => setTeamMembers(e.target.value)}
          placeholder="Member1, Member2 (comma-separated)"
        />
      </div>

      {/* Progress & Tasks */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Progress & Tasks</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Input
            label="Progress (%)"
            type="number"
            value={progressPercentage}
            onChange={(e) => {
              const val = Number(e.target.value);
              if (val >= 0 && val <= 100) setProgressPercentage(val);
            }}
            placeholder="0"
            min={0}
            max={100}
          />
          <Input
            label="Completion (%)"
            type="number"
            value={completionPercentage}
            onChange={(e) => {
              const val = Number(e.target.value);
              if (val >= 0 && val <= 100) setCompletionPercentage(val);
            }}
            placeholder="0"
            min={0}
            max={100}
          />
          <Input
            label="Tasks Completed"
            type="number"
            value={tasksCompleted}
            onChange={(e) => setTasksCompleted(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="0"
            min={0}
          />
          <Input
            label="Total Tasks"
            type="number"
            value={tasksTotal}
            onChange={(e) => setTasksTotal(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="0"
            min={0}
          />
        </div>
      </div>

      {/* Time Tracking */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Time Tracking</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Input
            label="Estimated Hours"
            type="number"
            value={estimatedHours}
            onChange={(e) => setEstimatedHours(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="0"
            min={0}
          />
          <Input
            label="Logged Hours"
            type="number"
            value={loggedHours}
            onChange={(e) => setLoggedHours(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="0"
            min={0}
          />
          <Input
            label="Remaining Hours"
            type="number"
            value={estimatedHours && loggedHours ? Number(estimatedHours) - Number(loggedHours) : ''}
            placeholder="Auto-calculated"
            readOnly
            className="bg-slate-50"
          />
        </div>
      </div>

      {/* Deliverables */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Deliverables</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Deliverables"
            value={deliverables}
            onChange={(e) => setDeliverables(e.target.value)}
            placeholder="Deliverable1, Deliverable2 (comma-separated)"
          />
          <Input
            label="Deliverables Completed"
            type="number"
            value={deliverablesCompleted}
            onChange={(e) => setDeliverablesCompleted(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="0"
            min={0}
          />
        </div>
      </div>

      {/* Quality & Performance */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Quality & Performance</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Input
            label="Quality Score (1-5)"
            type="number"
            value={qualityScore}
            onChange={(e) => {
              const val = Number(e.target.value);
              if (val >= 1 && val <= 5) setQualityScore(val);
            }}
            placeholder="4.5"
            min={1}
            max={5}
            step="0.1"
          />
          <Input
            label="Client Satisfaction (1-5)"
            type="number"
            value={clientSatisfaction}
            onChange={(e) => {
              const val = Number(e.target.value);
              if (val >= 1 && val <= 5) setClientSatisfaction(val);
            }}
            placeholder="4.5"
            min={1}
            max={5}
            step="0.1"
          />
          <Input
            label="Performance Rating (1-5)"
            type="number"
            value={performanceRating}
            onChange={(e) => {
              const val = Number(e.target.value);
              if (val >= 1 && val <= 5) setPerformanceRating(val);
            }}
            placeholder="4.5"
            min={1}
            max={5}
            step="0.1"
          />
          <Input
            label="Issues Count"
            type="number"
            value={issuesCount}
            onChange={(e) => setIssuesCount(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="0"
            min={0}
          />
        </div>
        <Input
          label="Risks Count"
          type="number"
          value={risksCount}
          onChange={(e) => setRisksCount(e.target.value === '' ? '' : Number(e.target.value))}
          placeholder="0"
          min={0}
        />
      </div>

      {/* Project Details */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Project Details</h3>
        <Textarea
          label="Project Scope"
          value={projectScope}
          onChange={(e) => setProjectScope(e.target.value)}
          placeholder="Project scope description"
          rows={3}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Objectives"
            value={objectives}
            onChange={(e) => setObjectives(e.target.value)}
            placeholder="Objective1, Objective2 (comma-separated)"
          />
          <Input
            label="Success Criteria"
            value={successCriteria}
            onChange={(e) => setSuccessCriteria(e.target.value)}
            placeholder="Criterion1, Criterion2 (comma-separated)"
          />
        </div>
      </div>

      {/* Location */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Location</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Project location"
          />
          <Select
            label="Work Location"
            value={workLocation}
            onChange={(e) => setWorkLocation(e.target.value)}
          >
            <option value="">Select location</option>
            <option value="ONSITE">Onsite</option>
            <option value="REMOTE">Remote</option>
            <option value="HYBRID">Hybrid</option>
          </Select>
        </div>
      </div>

      {/* Contracts */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Contracts & Agreements</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Input
            label="Contract Number"
            value={contractNumber}
            onChange={(e) => setContractNumber(e.target.value)}
            placeholder="Contract #"
          />
          <Input
            label="Contract Start Date"
            type="date"
            value={contractStartDate}
            onChange={(e) => setContractStartDate(e.target.value)}
          />
          <Input
            label="Contract End Date"
            type="date"
            value={contractEndDate}
            onChange={(e) => setContractEndDate(e.target.value)}
            min={contractStartDate}
          />
          <Input
            label="Contract Value"
            type="number"
            value={contractValue}
            onChange={(e) => setContractValue(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="0.00"
            min={0}
            step="0.01"
          />
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Notes</h3>
        <Input
          label="Tags"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="tag1, tag2 (comma-separated)"
        />
        <Textarea
          label="Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Project notes"
          rows={3}
        />
        <Textarea
          label="Internal Notes"
          value={internalNotes}
          onChange={(e) => setInternalNotes(e.target.value)}
          placeholder="Internal notes (confidential)"
          rows={3}
        />
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
