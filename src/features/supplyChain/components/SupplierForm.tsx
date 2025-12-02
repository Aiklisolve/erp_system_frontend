import { FormEvent, useState } from 'react';
import type { Supplier, SupplierStatus, SupplierCategory, PaymentTerms, RiskLevel, ComplianceStatus } from '../types';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Textarea } from '../../../components/ui/Textarea';
import { Button } from '../../../components/ui/Button';

type Props = {
  initial?: Partial<Supplier>;
  onSubmit: (values: Omit<Supplier, 'id' | 'created_at' | 'updated_at'>) => void;
  onCancel?: () => void;
};

// Generate supplier code
function generateSupplierCode(): string {
  const prefix = 'SUP';
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${year}-${random}`;
}

export function SupplierForm({ initial, onSubmit, onCancel }: Props) {
  const [supplierCode, setSupplierCode] = useState(initial?.supplier_code ?? generateSupplierCode());
  const [name, setName] = useState(initial?.name ?? '');
  const [legalName, setLegalName] = useState(initial?.legal_name ?? '');
  const [taxId, setTaxId] = useState(initial?.tax_id ?? '');
  const [registrationNumber, setRegistrationNumber] = useState(initial?.registration_number ?? '');
  
  const [contactPerson, setContactPerson] = useState(initial?.contact_person ?? '');
  const [phone, setPhone] = useState(initial?.phone ?? '');
  const [email, setEmail] = useState(initial?.email ?? '');
  const [alternatePhone, setAlternatePhone] = useState(initial?.alternate_phone ?? '');
  const [alternateEmail, setAlternateEmail] = useState(initial?.alternate_email ?? '');
  const [website, setWebsite] = useState(initial?.website ?? '');
  
  const [address, setAddress] = useState(initial?.address ?? '');
  const [city, setCity] = useState(initial?.city ?? '');
  const [state, setState] = useState(initial?.state ?? '');
  const [postalCode, setPostalCode] = useState(initial?.postal_code ?? '');
  const [country, setCountry] = useState(initial?.country ?? '');
  
  const [category, setCategory] = useState<SupplierCategory | ''>(initial?.category ?? '');
  const [status, setStatus] = useState<SupplierStatus>(initial?.status ?? 'ACTIVE');
  const [rating, setRating] = useState<number | ''>(initial?.rating ?? '');
  
  const [paymentTerms, setPaymentTerms] = useState<PaymentTerms>(initial?.payment_terms ?? 'NET_30');
  const [creditLimit, setCreditLimit] = useState<number | ''>(initial?.credit_limit ?? '');
  const [currency, setCurrency] = useState(initial?.currency ?? 'USD');
  const [taxRate, setTaxRate] = useState<number | ''>(initial?.tax_rate ?? '');
  
  const [onTimeDeliveryRate, setOnTimeDeliveryRate] = useState<number | ''>(initial?.on_time_delivery_rate ?? '');
  const [qualityScore, setQualityScore] = useState<number | ''>(initial?.quality_score ?? '');
  const [leadTimeDays, setLeadTimeDays] = useState<number | ''>(initial?.lead_time_days ?? '');
  const [totalOrders, setTotalOrders] = useState<number | ''>(initial?.total_orders ?? '');
  const [totalSpend, setTotalSpend] = useState<number | ''>(initial?.total_spend ?? '');
  const [lastOrderDate, setLastOrderDate] = useState(initial?.last_order_date ?? '');
  
  const [riskLevel, setRiskLevel] = useState<RiskLevel | ''>(initial?.risk_level ?? '');
  const [complianceStatus, setComplianceStatus] = useState<ComplianceStatus | ''>(initial?.compliance_status ?? '');
  const [certifications, setCertifications] = useState(initial?.certifications?.join(', ') ?? '');
  const [insuranceExpiry, setInsuranceExpiry] = useState(initial?.insurance_expiry ?? '');
  
  const [contractStartDate, setContractStartDate] = useState(initial?.contract_start_date ?? '');
  const [contractEndDate, setContractEndDate] = useState(initial?.contract_end_date ?? '');
  const [contractValue, setContractValue] = useState<number | ''>(initial?.contract_value ?? '');
  const [contractType, setContractType] = useState(initial?.contract_type ?? '');
  
  const [accountManager, setAccountManager] = useState(initial?.account_manager ?? '');
  const [procurementOfficer, setProcurementOfficer] = useState(initial?.procurement_officer ?? '');
  
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [internalNotes, setInternalNotes] = useState(initial?.internal_notes ?? '');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name || !contactPerson || !phone) return;
    
    onSubmit({
      supplier_code: supplierCode,
      name,
      legal_name: legalName || undefined,
      tax_id: taxId || undefined,
      registration_number: registrationNumber || undefined,
      contact_person: contactPerson,
      phone,
      email: email || undefined,
      alternate_phone: alternatePhone || undefined,
      alternate_email: alternateEmail || undefined,
      website: website || undefined,
      address: address || undefined,
      city: city || undefined,
      state: state || undefined,
      postal_code: postalCode || undefined,
      country: country || undefined,
      category: category || undefined,
      status,
      rating: Number(rating) || 0,
      payment_terms: paymentTerms,
      credit_limit: Number(creditLimit) || undefined,
      currency: currency || undefined,
      tax_rate: Number(taxRate) || undefined,
      on_time_delivery_rate: Number(onTimeDeliveryRate) || undefined,
      quality_score: Number(qualityScore) || undefined,
      lead_time_days: Number(leadTimeDays) || undefined,
      total_orders: Number(totalOrders) || undefined,
      total_spend: Number(totalSpend) || undefined,
      last_order_date: lastOrderDate || undefined,
      risk_level: riskLevel || undefined,
      compliance_status: complianceStatus || undefined,
      certifications: certifications ? certifications.split(',').map(c => c.trim()).filter(c => c) : undefined,
      insurance_expiry: insuranceExpiry || undefined,
      contract_start_date: contractStartDate || undefined,
      contract_end_date: contractEndDate || undefined,
      contract_value: Number(contractValue) || undefined,
      contract_type: contractType || undefined,
      account_manager: accountManager || undefined,
      procurement_officer: procurementOfficer || undefined,
      notes: notes || undefined,
      internal_notes: internalNotes || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-xs">
      {/* Supplier Information */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Supplier Information</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Input
            label="Supplier Code"
            value={supplierCode}
            onChange={(e) => setSupplierCode(e.target.value)}
            placeholder="Auto-generated"
          />
          <Input
            label="Supplier Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Trading name"
            required
          />
          <Input
            label="Legal Name"
            value={legalName}
            onChange={(e) => setLegalName(e.target.value)}
            placeholder="Legal entity name"
          />
          <Input
            label="Tax ID"
            value={taxId}
            onChange={(e) => setTaxId(e.target.value)}
            placeholder="Tax identification number"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Registration Number"
            value={registrationNumber}
            onChange={(e) => setRegistrationNumber(e.target.value)}
            placeholder="Business registration #"
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value as SupplierCategory)}
            >
              <option value="">Select category</option>
              <option value="MANUFACTURER">Manufacturer</option>
              <option value="DISTRIBUTOR">Distributor</option>
              <option value="WHOLESALER">Wholesaler</option>
              <option value="RETAILER">Retailer</option>
              <option value="SERVICE_PROVIDER">Service Provider</option>
              <option value="OTHER">Other</option>
            </Select>
            <Select
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value as SupplierStatus)}
              required
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="BLACKLISTED">Blacklisted</option>
            </Select>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Contact Information</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Input
            label="Contact Person"
            value={contactPerson}
            onChange={(e) => setContactPerson(e.target.value)}
            placeholder="Primary contact name"
            required
          />
          <Input
            label="Phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+1 (555) 123-4567"
            required
          />
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="contact@supplier.com"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Input
            label="Alternate Phone"
            type="tel"
            value={alternatePhone}
            onChange={(e) => setAlternatePhone(e.target.value)}
            placeholder="Alternate contact"
          />
          <Input
            label="Alternate Email"
            type="email"
            value={alternateEmail}
            onChange={(e) => setAlternateEmail(e.target.value)}
            placeholder="Alternate email"
          />
          <Input
            label="Website"
            type="url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://supplier.com"
          />
        </div>
      </div>

      {/* Address */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Address</h3>
        <Textarea
          label="Street Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Street address"
          rows={2}
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Input
            label="City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="City"
          />
          <Input
            label="State/Province"
            value={state}
            onChange={(e) => setState(e.target.value)}
            placeholder="State"
          />
          <Input
            label="Postal Code"
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
            placeholder="ZIP/Postal"
          />
          <Input
            label="Country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            placeholder="Country"
          />
        </div>
      </div>

      {/* Financial Information */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Financial Information</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Select
            label="Payment Terms"
            value={paymentTerms}
            onChange={(e) => setPaymentTerms(e.target.value as PaymentTerms)}
          >
            <option value="DUE_ON_RECEIPT">Due on Receipt</option>
            <option value="NET_15">Net 15</option>
            <option value="NET_30">Net 30</option>
            <option value="NET_60">Net 60</option>
            <option value="NET_90">Net 90</option>
            <option value="CUSTOM">Custom</option>
          </Select>
          <Input
            label="Credit Limit"
            type="number"
            value={creditLimit}
            onChange={(e) => setCreditLimit(e.target.value === '' ? '' : Number(e.target.value))}
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
            <option value="JPY">JPY (¥)</option>
          </Select>
          <Input
            label="Tax Rate (%)"
            type="number"
            value={taxRate}
            onChange={(e) => setTaxRate(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="0.00"
            min={0}
            max={100}
            step="0.01"
          />
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Performance Metrics</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Input
            label="Rating (1-5)"
            type="number"
            value={rating}
            onChange={(e) => {
              const val = Number(e.target.value);
              if (val >= 1 && val <= 5) setRating(val);
            }}
            placeholder="4.5"
            min={1}
            max={5}
            step="0.1"
            required
          />
          <Input
            label="On-Time Delivery Rate (%)"
            type="number"
            value={onTimeDeliveryRate}
            onChange={(e) => setOnTimeDeliveryRate(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="95.0"
            min={0}
            max={100}
            step="0.1"
          />
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
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Input
            label="Lead Time (Days)"
            type="number"
            value={leadTimeDays}
            onChange={(e) => setLeadTimeDays(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="7"
            min={0}
          />
          <Input
            label="Total Orders"
            type="number"
            value={totalOrders}
            onChange={(e) => setTotalOrders(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="0"
            min={0}
          />
          <Input
            label="Total Spend"
            type="number"
            value={totalSpend}
            onChange={(e) => setTotalSpend(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="0.00"
            min={0}
            step="0.01"
          />
          <Input
            label="Last Order Date"
            type="date"
            value={lastOrderDate}
            onChange={(e) => setLastOrderDate(e.target.value)}
            max={new Date().toISOString().slice(0, 10)}
          />
        </div>
      </div>

      {/* Risk & Compliance */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Risk & Compliance</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Select
            label="Risk Level"
            value={riskLevel}
            onChange={(e) => setRiskLevel(e.target.value as RiskLevel)}
          >
            <option value="">Select risk level</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </Select>
          <Select
            label="Compliance Status"
            value={complianceStatus}
            onChange={(e) => setComplianceStatus(e.target.value as ComplianceStatus)}
          >
            <option value="">Select status</option>
            <option value="COMPLIANT">Compliant</option>
            <option value="NON_COMPLIANT">Non-Compliant</option>
            <option value="PENDING_REVIEW">Pending Review</option>
            <option value="NOT_APPLICABLE">Not Applicable</option>
          </Select>
          <Input
            label="Certifications"
            value={certifications}
            onChange={(e) => setCertifications(e.target.value)}
            placeholder="ISO 9001, FDA, etc. (comma-separated)"
          />
          <Input
            label="Insurance Expiry"
            type="date"
            value={insuranceExpiry}
            onChange={(e) => setInsuranceExpiry(e.target.value)}
          />
        </div>
      </div>

      {/* Contracts & Agreements */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Contracts & Agreements</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
          <Select
            label="Contract Type"
            value={contractType}
            onChange={(e) => setContractType(e.target.value)}
          >
            <option value="">Select type</option>
            <option value="ANNUAL">Annual</option>
            <option value="QUARTERLY">Quarterly</option>
            <option value="MONTHLY">Monthly</option>
            <option value="ONE_TIME">One Time</option>
            <option value="OTHER">Other</option>
          </Select>
        </div>
      </div>

      {/* Assignment */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Assignment</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Account Manager"
            value={accountManager}
            onChange={(e) => setAccountManager(e.target.value)}
            placeholder="Account manager name"
          />
          <Input
            label="Procurement Officer"
            value={procurementOfficer}
            onChange={(e) => setProcurementOfficer(e.target.value)}
            placeholder="Procurement officer name"
          />
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Notes</h3>
        <Textarea
          label="Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Public notes"
          rows={3}
        />
        <Textarea
          label="Internal Notes"
          value={internalNotes}
          onChange={(e) => setInternalNotes(e.target.value)}
          placeholder="Internal notes (not visible externally)"
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
          {initial ? 'Update Supplier' : 'Create Supplier'}
        </Button>
      </div>
    </form>
  );
}
