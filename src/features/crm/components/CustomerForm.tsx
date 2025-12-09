import { FormEvent, useState } from 'react';
import type { Customer } from '../types';
import { Input } from '../../../components/ui/Input';
import { Textarea } from '../../../components/ui/Textarea';
import { Button } from '../../../components/ui/Button';

type Props = {
  initial?: Partial<Customer>;
  onSubmit: (values: Omit<Customer, 'id' | 'created_at' | 'updated_at'>) => void;
  onCancel?: () => void;
};

export function CustomerForm({ initial, onSubmit, onCancel }: Props) {
  // Basic Information
  const [name, setName] = useState(initial?.name ?? '');
  const [email, setEmail] = useState(initial?.email ?? '');
  const [phone, setPhone] = useState(initial?.phone ?? '');
  const [segment, setSegment] = useState(initial?.segment ?? '');

  // Company Information
  const [companyName, setCompanyName] = useState(initial?.company_name ?? '');
  const [industry, setIndustry] = useState(initial?.industry ?? '');
  const [annualRevenue, setAnnualRevenue] = useState(initial?.annual_revenue?.toString() ?? '');
  const [employeeCount, setEmployeeCount] = useState(initial?.employee_count?.toString() ?? '');
  const [website, setWebsite] = useState(initial?.website ?? '');

  // Address Information
  const [address, setAddress] = useState(initial?.address ?? '');
  const [city, setCity] = useState(initial?.city ?? '');
  const [state, setState] = useState(initial?.state ?? '');
  const [country, setCountry] = useState(initial?.country ?? '');
  const [pincode, setPincode] = useState(initial?.pincode ?? '');

  // Tax & Legal Information
  const [gstin, setGstin] = useState(initial?.gstin ?? '');
  const [panNumber, setPanNumber] = useState(initial?.pan_number ?? '');

  // Contact Information
  const [contactPerson, setContactPerson] = useState(initial?.contact_person ?? '');
  const [contactDesignation, setContactDesignation] = useState(initial?.contact_designation ?? '');

  // Financial Information
  const [creditLimit, setCreditLimit] = useState(initial?.credit_limit?.toString() ?? '');
  const [paymentTerms, setPaymentTerms] = useState(initial?.payment_terms ?? '');

  // Additional
  const [notes, setNotes] = useState(initial?.notes ?? '');

  // Validation
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = 'Customer name is required';
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Invalid email format';
    }
    if (website && !/^https?:\/\/.+/.test(website) && website.trim() !== '') {
      newErrors.website = 'Invalid website URL format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }
    
    onSubmit({
      name,
      email: email || undefined,
      phone: phone || undefined,
      segment: segment || undefined,
      company_name: companyName || undefined,
      industry: industry || undefined,
      annual_revenue: annualRevenue ? parseFloat(annualRevenue) : undefined,
      employee_count: employeeCount ? parseInt(employeeCount, 10) : undefined,
      website: website || undefined,
      address: address || undefined,
      city: city || undefined,
      state: state || undefined,
      country: country || undefined,
      pincode: pincode || undefined,
      gstin: gstin || undefined,
      pan_number: panNumber || undefined,
      contact_person: contactPerson || undefined,
      contact_designation: contactDesignation || undefined,
      credit_limit: creditLimit ? parseFloat(creditLimit) : undefined,
      payment_terms: paymentTerms || undefined,
      notes: notes || undefined
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
      {/* Basic Information */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">
          Basic Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Customer Name <span className="text-red-500">*</span>
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Acme Corporation"
              required
            />
            {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Email
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contact@acme.com"
            />
            {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Phone
            </label>
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1-555-0101"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Segment
            </label>
            <Input
              value={segment}
              onChange={(e) => setSegment(e.target.value)}
              placeholder="Enterprise, Small Business, etc."
            />
          </div>
        </div>
      </div>

      {/* Company Information */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">
          Company Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Company Name
            </label>
            <Input
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Acme Corporation Ltd."
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Industry
            </label>
            <Input
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              placeholder="Technology, Manufacturing, etc."
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Annual Revenue
            </label>
            <Input
              type="number"
              step="0.01"
              value={annualRevenue}
              onChange={(e) => setAnnualRevenue(e.target.value)}
              placeholder="1000000.00"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Employee Count
            </label>
            <Input
              type="number"
              value={employeeCount}
              onChange={(e) => setEmployeeCount(e.target.value)}
              placeholder="100"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Website
            </label>
            <Input
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://www.example.com"
            />
            {errors.website && <p className="text-xs text-red-600 mt-1">{errors.website}</p>}
          </div>
        </div>
      </div>

      {/* Address Information */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">
          Address Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Address
            </label>
            <Textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Street address"
              rows={2}
              className=""
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              City
            </label>
            <Input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="New York"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              State
            </label>
            <Input
              value={state}
              onChange={(e) => setState(e.target.value)}
              placeholder="NY"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Country
            </label>
            <Input
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="United States"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Pincode/ZIP Code
            </label>
            <Input
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              placeholder="10001"
            />
          </div>
        </div>
      </div>

      {/* Tax & Legal Information */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">
          Tax & Legal Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              GSTIN
            </label>
            <Input
              value={gstin}
              onChange={(e) => setGstin(e.target.value)}
              placeholder="29ABCDE1234F1Z5"
              maxLength={15}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              PAN Number
            </label>
            <Input
              value={panNumber}
              onChange={(e) => setPanNumber(e.target.value)}
              placeholder="ABCDE1234F"
              maxLength={10}
            />
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">
          Contact Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Contact Person
            </label>
            <Input
              value={contactPerson}
              onChange={(e) => setContactPerson(e.target.value)}
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Contact Designation
            </label>
            <Input
              value={contactDesignation}
              onChange={(e) => setContactDesignation(e.target.value)}
              placeholder="Manager, Director, etc."
            />
          </div>
        </div>
      </div>

      {/* Financial Information */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">
          Financial Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Credit Limit
            </label>
            <Input
              type="number"
              step="0.01"
              value={creditLimit}
              onChange={(e) => setCreditLimit(e.target.value)}
              placeholder="100000.00"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Payment Terms
            </label>
            <Input
              value={paymentTerms}
              onChange={(e) => setPaymentTerms(e.target.value)}
              placeholder="Net 30, Net 60, etc."
            />
          </div>
        </div>
      </div>

      {/* Additional Notes */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">
          Additional Information
        </h3>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5">
            Notes
          </label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any additional notes or comments..."
            rows={4}
            className=""
          />
        </div>
      </div>

      {/* Form Actions */}
      <div className="sticky bottom-0 bg-white border-t border-slate-200 pt-4 flex flex-col sm:flex-row gap-3 justify-end">
        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={onCancel}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
        )}
        <Button type="submit" variant="primary" size="md" className="w-full sm:w-auto">
          {initial ? 'Update Customer' : 'Create Customer'}
        </Button>
      </div>
    </form>
  );
}
