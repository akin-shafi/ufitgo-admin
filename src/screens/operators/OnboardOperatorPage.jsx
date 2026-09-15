import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  Bus,
  CircleDollarSign,
  Loader2,
  MapPinned,
  Radio,
} from 'lucide-react';
import api from '@/api/client';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

const PARTNER_TYPES = [
  { id: 'tour-operator', label: 'Tour Operator', detail: 'Hajj and Umrah packages', icon: Building2 },
  { id: 'transport', label: 'Transport Provider', detail: 'Vehicle and fleet services', icon: Bus },
  { id: 'sim-seller', label: 'SIM Seller', detail: 'Connectivity services', icon: Radio },
  { id: 'tour-guide', label: 'Tour Guide', detail: 'Individual guiding services', icon: MapPinned },
  { id: 'exchange-agent', label: 'Exchange Agent', detail: 'Foreign exchange services', icon: CircleDollarSign },
];

const INITIAL_FORM = {
  partnerType: 'tour-operator',
  country: 'Nigeria',
  companyName: '',
  tradingName: '',
  cacNumber: '',
  foundedAt: '',
  yearsOfExperience: '',
  officeAddress: '',
  nahconLicense: '',
  capacity: '',
  transportReg: '',
  fleetSize: '',
  telecomPermit: '',
  supportedNetworks: '',
  bdcLicense: '',
  dailyVolume: '',
  guideLanguages: '',
  guideExperience: '',
  guideExpertise: '',
  directorTitle: 'Mr',
  directorName: '',
  directorPhone: '',
  directorWhatsApp: '',
  directorNin: '',
  email: '',
  phone: '',
  description: '',
};

const Field = ({ label, required, hint, children }) => (
  <div>
    <label className="block text-xs font-semibold text-fg/60 uppercase tracking-wider mb-1.5">
      {label}{required && <span className="text-red-500 ml-1">*</span>}
    </label>
    {children}
    {hint && <p className="mt-1.5 text-xs text-fg/45">{hint}</p>}
  </div>
);

const Section = ({ title, description, children }) => (
  <section className="py-7 first:pt-0 border-b border-border last:border-b-0 last:pb-0">
    <div className="mb-5">
      <h2 className="text-base font-bold text-fg">{title}</h2>
      {description && <p className="mt-1 text-sm text-fg/55">{description}</p>}
    </div>
    {children}
  </section>
);

const OnboardOperatorPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form, setForm] = useState(INITIAL_FORM);
  const [error, setError] = useState('');

  const setField = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const isGuide = form.partnerType === 'tour-guide';
  const isNigeria = form.country === 'Nigeria';

  const mutation = useMutation({
    mutationFn: (payload) => api.post('/admin/operator-auth/onboard', payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['operators'] });
      navigate('/operators', { replace: true });
    },
    onError: (requestError) => {
      const message = requestError?.response?.data?.message;
      setError(Array.isArray(message) ? message.join(', ') : message || 'Unable to onboard this partner.');
    },
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    setError('');

    if (!isGuide && !form.cacNumber.trim()) {
      setError('CAC or commercial registration number is required for company partners.');
      return;
    }
    if (form.partnerType === 'tour-operator' && isNigeria && !form.nahconLicense.trim()) {
      setError('NAHCON license number is required for Nigerian tour operators.');
      return;
    }
    if (form.partnerType === 'exchange-agent' && !form.bdcLicense.trim()) {
      setError('BDC license number is required for exchange agents.');
      return;
    }

    mutation.mutate({
      ...form,
      foundedAt: form.foundedAt ? Number(form.foundedAt) : undefined,
      yearsOfExperience: form.yearsOfExperience ? Number(form.yearsOfExperience) : undefined,
      guideExpertise: form.guideExpertise
        ? form.guideExpertise.split(',').map((item) => item.trim()).filter(Boolean)
        : [],
    });
  };

  return (
    <DashboardLayout title="Onboard Partner">
      <div className="max-w-5xl mx-auto">
        <button
          type="button"
          onClick={() => navigate('/operators')}
          className="inline-flex items-center gap-2 text-sm text-fg/60 hover:text-fg mb-5"
        >
          <ArrowLeft className="w-4 h-4" /> Back to partners
        </button>

        <div className="mb-7">
          <h1 className="text-2xl font-bold text-fg tracking-tight">Onboard a Partner</h1>
          <p className="mt-1.5 text-sm text-fg/55">
            Create a pending partner profile. A welcome email with a secure password setup link will be sent to the primary address.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-border rounded-lg px-6 md:px-8 py-7">
          <Section title="Partner category" description="Choose the service this partner will provide on UfitGo.">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {PARTNER_TYPES.map(({ id, label, detail, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setField('partnerType', id)}
                  className={`min-h-[132px] p-4 border rounded-lg text-left transition-colors ${
                    form.partnerType === id
                      ? 'border-primary bg-primary/5 ring-1 ring-primary'
                      : 'border-border hover:border-primary/40'
                  }`}
                >
                  {React.createElement(Icon, { className: 'w-5 h-5 text-primary mb-4' })}
                  <span className="block text-sm font-semibold text-fg">{label}</span>
                  <span className="block mt-1 text-xs leading-5 text-fg/50">{detail}</span>
                </button>
              ))}
            </div>
          </Section>

          <Section
            title={isGuide ? 'Guide profile' : 'Organization details'}
            description={isGuide ? 'Capture the guide’s legal identity and operating base.' : 'Use the organization’s registered business information.'}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="Country of operation" required>
                <select required className="input" value={form.country} onChange={(e) => setField('country', e.target.value)}>
                  <option value="Nigeria">Nigeria</option>
                  <option value="Saudi Arabia">Saudi Arabia</option>
                  <option value="Other">Other</option>
                </select>
              </Field>
              <Field label={isGuide ? 'Full legal name' : 'Registered company name'} required>
                <input required className="input" value={form.companyName} onChange={(e) => setField('companyName', e.target.value)} />
              </Field>

              {!isGuide && (
                <>
                  <Field label="Trading name">
                    <input className="input" value={form.tradingName} onChange={(e) => setField('tradingName', e.target.value)} />
                  </Field>
                  <Field label={form.country === 'Saudi Arabia' ? 'Commercial registration number' : 'CAC / RC number'} required>
                    <input required className="input" value={form.cacNumber} onChange={(e) => setField('cacNumber', e.target.value)} />
                  </Field>
                  <Field label="Year established">
                    <input type="number" min="1900" max={new Date().getFullYear()} className="input" value={form.foundedAt} onChange={(e) => setField('foundedAt', e.target.value)} />
                  </Field>
                  <Field label="Years of experience">
                    <input type="number" min="0" className="input" value={form.yearsOfExperience} onChange={(e) => setField('yearsOfExperience', e.target.value)} />
                  </Field>
                </>
              )}

              <div className="md:col-span-2">
                <Field label={isGuide ? 'Base city / state' : 'Office address'} required>
                  <textarea required rows={3} className="input min-h-[88px]" value={form.officeAddress} onChange={(e) => setField('officeAddress', e.target.value)} />
                </Field>
              </div>
            </div>
          </Section>

          <Section title="Service credentials" description="These fields change with the selected partner category.">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {form.partnerType === 'tour-operator' && (
                <>
                  {isNigeria && (
                    <Field label="NAHCON license number" required>
                      <input required className="input" value={form.nahconLicense} onChange={(e) => setField('nahconLicense', e.target.value)} />
                    </Field>
                  )}
                  <Field label="Annual pilgrim capacity">
                    <select className="input" value={form.capacity} onChange={(e) => setField('capacity', e.target.value)}>
                      <option value="">Select range</option>
                      <option value="1-50">1 - 50</option>
                      <option value="50-200">50 - 200</option>
                      <option value="200+">200+</option>
                    </select>
                  </Field>
                </>
              )}
              {form.partnerType === 'transport' && (
                <>
                  <Field label="Transport registration number">
                    <input className="input" value={form.transportReg} onChange={(e) => setField('transportReg', e.target.value)} />
                  </Field>
                  <Field label="Fleet size">
                    <select className="input" value={form.fleetSize} onChange={(e) => setField('fleetSize', e.target.value)}>
                      <option value="">Select size</option>
                      <option value="1-5">1 - 5 vehicles</option>
                      <option value="6-20">6 - 20 vehicles</option>
                      <option value="20+">20+ vehicles</option>
                    </select>
                  </Field>
                </>
              )}
              {form.partnerType === 'sim-seller' && (
                <>
                  <Field label="Telecom agency permit">
                    <input className="input" value={form.telecomPermit} onChange={(e) => setField('telecomPermit', e.target.value)} />
                  </Field>
                  <Field label="Supported networks">
                    <input className="input" placeholder="STC, Mobily, Zain" value={form.supportedNetworks} onChange={(e) => setField('supportedNetworks', e.target.value)} />
                  </Field>
                </>
              )}
              {form.partnerType === 'exchange-agent' && (
                <>
                  <Field label="BDC license number" required>
                    <input required className="input" value={form.bdcLicense} onChange={(e) => setField('bdcLicense', e.target.value)} />
                  </Field>
                  <Field label="Estimated daily volume">
                    <input className="input" placeholder="e.g. NGN 5,000,000" value={form.dailyVolume} onChange={(e) => setField('dailyVolume', e.target.value)} />
                  </Field>
                </>
              )}
              {isGuide && (
                <>
                  <Field label="Languages spoken">
                    <input className="input" placeholder="English, Arabic, Hausa" value={form.guideLanguages} onChange={(e) => setField('guideLanguages', e.target.value)} />
                  </Field>
                  <Field label="Experience range">
                    <select className="input" value={form.guideExperience} onChange={(e) => setField('guideExperience', e.target.value)}>
                      <option value="">Select range</option>
                      <option value="0-2">0 - 2 years</option>
                      <option value="3-5">3 - 5 years</option>
                      <option value="5+">5+ years</option>
                    </select>
                  </Field>
                  <div className="md:col-span-2">
                    <Field label="Areas of expertise" hint="Separate multiple specialties with commas.">
                      <input className="input" placeholder="Mutawwif, Makkah Ziyarah, logistics" value={form.guideExpertise} onChange={(e) => setField('guideExpertise', e.target.value)} />
                    </Field>
                  </div>
                </>
              )}
            </div>
          </Section>

          <Section title={isGuide ? 'Contact and access' : 'Director and contact'} description="The one-time password setup link will be delivered to the email address below.">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {!isGuide && (
                <>
                  <Field label="Director title">
                    <select className="input" value={form.directorTitle} onChange={(e) => setField('directorTitle', e.target.value)}>
                      {['Alhaji', 'Hajia', 'Mr', 'Mrs', 'Dr'].map((title) => <option key={title}>{title}</option>)}
                    </select>
                  </Field>
                  <Field label="Director full name" required>
                    <input required className="input" value={form.directorName} onChange={(e) => setField('directorName', e.target.value)} />
                  </Field>
                </>
              )}
              <Field label="Primary email" required>
                <input required type="email" className="input" value={form.email} onChange={(e) => setField('email', e.target.value)} />
              </Field>
              <Field label="Company / login phone" required>
                <input required type="tel" className="input" value={form.phone} onChange={(e) => setField('phone', e.target.value)} />
              </Field>
              <Field label={isGuide ? 'Contact phone' : 'Director phone'} required>
                <input required type="tel" className="input" value={form.directorPhone} onChange={(e) => setField('directorPhone', e.target.value)} />
              </Field>
              <Field label="WhatsApp number">
                <input type="tel" className="input" value={form.directorWhatsApp} onChange={(e) => setField('directorWhatsApp', e.target.value)} />
              </Field>
              <Field label="National ID / Iqama number">
                <input className="input" value={form.directorNin} onChange={(e) => setField('directorNin', e.target.value)} />
              </Field>
              <div className="md:col-span-2">
                <Field label="Service description">
                  <textarea rows={4} className="input min-h-[104px]" value={form.description} onChange={(e) => setField('description', e.target.value)} />
                </Field>
              </div>
            </div>
          </Section>

          {error && <p className="mt-6 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</p>}

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-7">
            <button type="button" onClick={() => navigate('/operators')} className="btn-outline sm:min-w-[130px]">Cancel</button>
            <button type="submit" disabled={mutation.isPending} className="btn-primary sm:min-w-[190px] inline-flex items-center justify-center gap-2">
              {mutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              {mutation.isPending ? 'Creating partner...' : 'Create partner profile'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default OnboardOperatorPage;
