import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../../services/admin.service';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  Settings, Globe, ShoppingCart, CreditCard, Mail,
  Users, Search, Share2, Shield, Palette, ChevronRight,
  Eye, EyeOff, Save, AlertTriangle, CheckCircle, Plus, X
} from 'lucide-react';

// ─── Tab Config ───────────────────────────────────────────────
const TABS = [
  { id: 'general',    label: 'General',    icon: Globe },
  { id: 'commerce',   label: 'Commerce',   icon: ShoppingCart },
  { id: 'payment',    label: 'Payment',    icon: CreditCard },
  { id: 'email',      label: 'Email/SMTP', icon: Mail },
  { id: 'vendor',     label: 'Vendor',     icon: Users },
  { id: 'seo',        label: 'SEO',        icon: Search },
  { id: 'social',     label: 'Social',     icon: Share2 },
  { id: 'security',   label: 'Security',   icon: Shield },
  { id: 'appearance', label: 'Appearance', icon: Palette },
];

// ─── Default State ────────────────────────────────────────────
const DEFAULT = {
  siteName: '', siteTagline: '', siteDescription: '',
  siteEmail: '', supportEmail: '', siteLogo: '', favicon: '',
  timezone: 'UTC', dateFormat: 'MM/DD/YYYY',
  maintenanceMode: false, maintenanceMessage: 'We are under maintenance. Be back soon!',

  commissionRate: 10, currency: 'USD', currencySymbol: '$',
  currencyPosition: 'before', payoutThreshold: 50,
  autoPayoutEnabled: false, taxEnabled: false, taxRate: 0,
  allowGuestCheckout: true, maxCartItems: 20,

  paymentMethods: {
    stripe:   { enabled: false, publicKey: '', secretKey: '' },
    razorpay: { enabled: false, keyId: '',    keySecret: '' },
    wallet:   { enabled: true },
    cod:      { enabled: false },
  },

  smtp: {
    host: '', port: 587, user: '', pass: '',
    fromName: '', fromEmail: '', emailFooterText: '',
  },
  emailNotifications: {
    orderConfirmation: true, vendorNotification: true,
    payoutNotification: true, welcomeEmail: true,
  },

  vendorSettings: {
    autoApproveVendors: false, autoApproveProducts: false,
    vendorCanSetDiscount: true, maxProductsPerVendor: 100,
    allowedFileTypes: ['pdf', 'zip', 'rar', 'exe'],
    maxFileSizeMB: 500,
  },

  seo: {
    metaTitle: '', metaDescription: '', googleAnalyticsId: '',
    facebookPixelId: '', robotsTxt: 'User-agent: *\nAllow: /', canonicalUrl: '',
  },

  socialLinks: {
    facebook: '', twitter: '', instagram: '',
    linkedin: '', youtube: '', github: '',
  },

  security: {
    maxLoginAttempts: 5, sessionTimeoutMinutes: 60,
    twoFactorAuthEnabled: false, allowedAdminIPs: [],
  },

  appearance: {
    primaryColor: '#3B82F6', secondaryColor: '#8B5CF6',
    darkModeEnabled: false, customCSS: '',
    footerText: '', copyrightText: '© 2025 Digital Marketplace. All rights reserved.',
  },
};

// ─── Helpers ──────────────────────────────────────────────────

// Deep-merge: DB values override defaults, arrays replaced, nulls skipped
const deepMerge = (target, source) => {
  if (!source) return target;
  const result = { ...target };
  for (const key of Object.keys(source)) {
    const s = source[key];
    const t = target[key];
    if (s === null || s === undefined) continue;
    if (
      typeof s === 'object' && !Array.isArray(s) &&
      typeof t === 'object' && !Array.isArray(t)
    ) {
      result[key] = deepMerge(t, s);
    } else {
      result[key] = s;
    }
  }
  return result;
};

// Strip backend-only keys before storing in form state
const BACKEND_KEYS = ['_id', '__v', 'success', 'createdAt', 'updatedAt'];
const clean = (obj) => {
  const o = { ...obj };
  BACKEND_KEYS.forEach(k => delete o[k]);
  return o;
};

// ══════════════════════════════════════════════════════════════
// UI Primitives
// ══════════════════════════════════════════════════════════════
const Field = ({ label, hint, full, children }) => (
  <div className={full ? 'col-span-2' : ''}>
    <label className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>
    {hint && <p className="text-xs text-gray-400 mb-1.5">{hint}</p>}
    {children}
  </div>
);

const inputCls = `w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm
  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
  transition-all bg-white`;

const Input = (props) => <input {...props} className={inputCls} />;

const Textarea = ({ className = '', ...props }) => (
  <textarea {...props} className={`${inputCls} resize-none ${className}`} />
);

const Select = ({ children, ...props }) => (
  <select {...props} className={inputCls}>{children}</select>
);

// Toggle fires a synthetic checkbox event — works with handleNested & handleChange
const Toggle = ({ label, hint, checked, onChange, name }) => (
  <div className="flex items-start justify-between p-3 sm:p-4 rounded-xl border border-gray-100
    bg-gray-50/50 hover:bg-gray-50 transition-colors gap-3">
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-gray-700">{label}</p>
      {hint && <p className="text-xs text-gray-400 mt-0.5">{hint}</p>}
    </div>
    <button
      type="button"
      onClick={() => onChange({ target: { name, type: 'checkbox', checked: !checked } })}
      className={`relative flex-shrink-0 w-11 h-6 rounded-full transition-colors
        duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        ${checked ? 'bg-blue-600' : 'bg-gray-300'}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow
        transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  </div>
);

const SectionCard = ({ title, children }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
    <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-50 bg-gradient-to-r from-gray-50 to-white">
      <h3 className="text-xs sm:text-sm font-bold text-gray-800 uppercase tracking-wider">{title}</h3>
    </div>
    <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">{children}</div>
  </div>
);

const FullWidthCard = ({ title, children }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
    {title && (
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-50 bg-gradient-to-r from-gray-50 to-white">
        <h3 className="text-xs sm:text-sm font-bold text-gray-800 uppercase tracking-wider">{title}</h3>
      </div>
    )}
    <div className="p-4 sm:p-6 space-y-4">{children}</div>
  </div>
);

const PasswordInput = ({ value = '', onChange, placeholder, name }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input type={show ? 'text' : 'password'} name={name} value={value}
        onChange={onChange} placeholder={placeholder}
        className={`${inputCls} pr-10`} />
      <button type="button" onClick={() => setShow(s => !s)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
        {show ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
    </div>
  );
};

const IPTagInput = ({ value = [], onChange }) => {
  const [input, setInput] = useState('');
  const add = () => {
    const ip = input.trim();
    if (ip && !value.includes(ip)) { onChange([...value, ip]); setInput(''); }
  };
  return (
    <div>
      <div className="flex gap-2 mb-2">
        <Input value={input} onChange={e => setInput(e.target.value)}
          placeholder="e.g. 192.168.1.1"
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(); } }} />
        <button type="button" onClick={add}
          className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700
            transition-colors flex items-center gap-1 text-sm font-medium whitespace-nowrap">
          <Plus size={14} /> <span className="hidden sm:inline">Add</span>
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {value.map(ip => (
          <span key={ip} className="flex items-center gap-1 px-2.5 py-1 bg-blue-50
            text-blue-700 rounded-lg text-xs font-medium border border-blue-100">
            {ip}
            <button type="button" onClick={() => onChange(value.filter(i => i !== ip))}
              className="hover:text-blue-900 ml-0.5"><X size={11} /></button>
          </span>
        ))}
      </div>
    </div>
  );
};

const TagInput = ({ value = [], onChange, placeholder }) => {
  const [input, setInput] = useState('');
  const add = () => {
    const tag = input.trim().replace(/^\./, '').toLowerCase();
    if (tag && !value.includes(tag)) { onChange([...value, tag]); setInput(''); }
  };
  return (
    <div>
      <div className="flex gap-2 mb-2">
        <Input value={input} onChange={e => setInput(e.target.value)}
          placeholder={placeholder || 'Add item…'}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(); } }} />
        <button type="button" onClick={add}
          className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700
            transition-colors text-sm font-medium whitespace-nowrap">
          <Plus size={14} />
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {value.map(tag => (
          <span key={tag} className="flex items-center gap-1 px-2.5 py-1 bg-gray-100
            text-gray-700 rounded-lg text-xs font-medium">
            .{tag}
            <button type="button" onClick={() => onChange(value.filter(t => t !== tag))}
              className="hover:text-gray-900 ml-0.5"><X size={11} /></button>
          </span>
        ))}
      </div>
    </div>
  );
};

const PaymentCard = ({ title, icon, enabled, onToggle, children }) => (
  <div className={`rounded-xl border-2 transition-all duration-200
    ${enabled ? 'border-blue-200 bg-blue-50/30' : 'border-gray-100 bg-gray-50/30'}`}>
    <div className="flex items-center justify-between p-3 sm:p-4">
      <div className="flex items-center gap-2 sm:gap-3">
        <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-sm sm:text-base
          font-bold ${enabled ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'}`}>
          {icon}
        </div>
        <span className="text-sm sm:text-base font-semibold text-gray-800">{title}</span>
      </div>
      <button type="button" onClick={onToggle}
        className={`relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0
          ${enabled ? 'bg-blue-600' : 'bg-gray-300'}`}>
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full
          shadow transition-transform duration-200
          ${enabled ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </div>
    {enabled && children && (
      <div className="px-3 sm:px-4 pb-3 sm:pb-4 grid grid-cols-1 gap-3 border-t border-blue-100 pt-3 sm:pt-4">
        {children}
      </div>
    )}
  </div>
);

export default function AdminSettings() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('general');
  const [form, setForm]           = useState(DEFAULT);
  const [saved, setSaved]         = useState(false);

  // ── Fetch ────────────────────────────────────────────────────
  const { data: raw, isLoading, isError } = useQuery({
    queryKey: ['admin-settings'],
    queryFn:  adminService.getSettings,
    staleTime: 60_000,
  });

  // ── Populate form on load (deep-merge DB → DEFAULT) ──────────
  useEffect(() => {
    if (!raw) return;
    setForm(deepMerge(DEFAULT, clean(raw)));
  }, [raw]);

  // ── Save ─────────────────────────────────────────────────────
  const mutation = useMutation({
    mutationFn: adminService.updateSettings,
    onSuccess: (res) => {
      queryClient.setQueryData(['admin-settings'], res);
      setForm(deepMerge(DEFAULT, clean(res)));
      toast.success('Settings saved!');
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Failed to save settings');
    },
  });

  // ── Change handlers ──────────────────────────────────────────

  // Top-level flat fields  (siteName, commissionRate, maintenanceMode …)
  const handleChange = ({ target: { name, value, type, checked } }) =>
    setForm(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }));

  // One-level nested  (smtp.host, seo.metaTitle, emailNotifications.welcomeEmail …)
  // Works for both <Input name="host"> and <Toggle name="welcomeEmail">
  const handleNested = (section) => ({ target: { name, value, type, checked } }) =>
    setForm(p => ({
      ...p,
      [section]: { ...p[section], [name]: type === 'checkbox' ? checked : value },
    }));

  // Two-level nested  (paymentMethods.stripe.publicKey …)
  const setDeep = (section, sub, key, val) =>
    setForm(p => ({
      ...p,
      [section]: { ...p[section], [sub]: { ...p[section][sub], [key]: val } },
    }));

  // Array inside nested section  (vendorSettings.allowedFileTypes, security.allowedAdminIPs)
  const setNestedArr = (section, key, arr) =>
    setForm(p => ({ ...p, [section]: { ...p[section], [key]: arr } }));

  // Appearance colour helper (avoids repeating setForm boilerplate)
  const setAppearance = (key, val) =>
    setForm(p => ({ ...p, appearance: { ...p.appearance, [key]: val } }));

  const handleSubmit = (e) => { e.preventDefault(); mutation.mutate(form); };

  // ── Loading / error ──────────────────────────────────────────
  if (isLoading) return (
    <div className="flex justify-center items-center h-96"><LoadingSpinner size="lg" /></div>
  );
  if (isError) return (
    <div className="flex flex-col justify-center items-center h-96 gap-3 text-red-500 px-4">
      <AlertTriangle size={32} />
      <p className="font-semibold text-center">Failed to load settings — please refresh.</p>
    </div>
  );

  // ── Tab panels ───────────────────────────────────────────────
  const renderTab = () => {
    switch (activeTab) {

      /* ────── GENERAL ────── */
      case 'general': return (
        <div className="space-y-4 sm:space-y-5">
          <SectionCard title="Site Identity">
            <Field label="Site Name" hint="Shown in browser tab & emails">
              <Input name="siteName" value={form.siteName} onChange={handleChange} placeholder="My Marketplace" />
            </Field>
            <Field label="Site Tagline">
              <Input name="siteTagline" value={form.siteTagline} onChange={handleChange} placeholder="Buy & sell digital products" />
            </Field>
            <Field label="Admin Email" hint="Receives system alerts">
              <Input type="email" name="siteEmail" value={form.siteEmail} onChange={handleChange} placeholder="admin@site.com" />
            </Field>
            <Field label="Support Email" hint="Shown to customers">
              <Input type="email" name="supportEmail" value={form.supportEmail} onChange={handleChange} placeholder="support@site.com" />
            </Field>
            <Field label="Site Logo URL">
              <Input name="siteLogo" value={form.siteLogo} onChange={handleChange} placeholder="https://cdn.example.com/logo.png" />
            </Field>
            <Field label="Favicon URL">
              <Input name="favicon" value={form.favicon} onChange={handleChange} placeholder="https://cdn.example.com/favicon.ico" />
            </Field>
          </SectionCard>

          <SectionCard title="Regional">
            <Field label="Timezone">
              <Select name="timezone" value={form.timezone} onChange={handleChange}>
                {[['UTC','UTC'],['Asia/Kolkata','Asia/Kolkata (IST)'],
                  ['America/New_York','America/New_York (EST)'],
                  ['America/Los_Angeles','America/Los_Angeles (PST)'],
                  ['Europe/London','Europe/London (GMT)'],
                  ['Europe/Berlin','Europe/Berlin (CET)'],
                ].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
              </Select>
            </Field>
            <Field label="Date Format">
              <Select name="dateFormat" value={form.dateFormat} onChange={handleChange}>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD (ISO)</option>
              </Select>
            </Field>
          </SectionCard>

          <FullWidthCard title="Site Description">
            <Field label="Full Description" hint="Used in meta & about sections">
              <Textarea name="siteDescription" value={form.siteDescription}
                onChange={handleChange} rows={3} placeholder="Describe your marketplace…" />
            </Field>
          </FullWidthCard>

          <FullWidthCard title="Maintenance Mode">
            <Toggle label="Enable Maintenance Mode"
              hint="Non-admin users will see a maintenance page"
              name="maintenanceMode" checked={form.maintenanceMode} onChange={handleChange} />
            {form.maintenanceMode && (
              <Field label="Maintenance Message">
                <Textarea name="maintenanceMessage" value={form.maintenanceMessage}
                  onChange={handleChange} rows={2} />
              </Field>
            )}
          </FullWidthCard>
        </div>
      );

      /* ────── COMMERCE ────── */
      case 'commerce': return (
        <div className="space-y-4 sm:space-y-5">
          <SectionCard title="Revenue & Commission">
            <Field label="Commission Rate (%)" hint="Platform cut per sale">
              <Input type="number" name="commissionRate" value={form.commissionRate}
                onChange={handleChange} min="0" max="100" step="0.1" />
            </Field>
            <Field label="Min Payout Threshold" hint="Vendor must reach this before requesting payout">
              <Input type="number" name="payoutThreshold" value={form.payoutThreshold}
                onChange={handleChange} min="0" step="1" />
            </Field>
          </SectionCard>

          <SectionCard title="Currency">
            <Field label="Currency Code">
              <Select name="currency" value={form.currency} onChange={handleChange}>
                {[['USD','USD — US Dollar'],['EUR','EUR — Euro'],['GBP','GBP — British Pound'],
                  ['INR','INR — Indian Rupee'],['AUD','AUD — Australian Dollar'],
                  ['CAD','CAD — Canadian Dollar'],
                ].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
              </Select>
            </Field>
            <Field label="Currency Symbol">
              <Input name="currencySymbol" value={form.currencySymbol}
                onChange={handleChange} placeholder="$" />
            </Field>
            <Field label="Symbol Position">
              <Select name="currencyPosition" value={form.currencyPosition} onChange={handleChange}>
                <option value="before">Before — $99</option>
                <option value="after">After  — 99$</option>
              </Select>
            </Field>
            <Field label="Max Cart Items">
              <Input type="number" name="maxCartItems" value={form.maxCartItems}
                onChange={handleChange} min="1" />
            </Field>
          </SectionCard>

          <FullWidthCard title="Tax">
            <Toggle label="Enable Tax" hint="Apply tax on all purchases"
              name="taxEnabled" checked={form.taxEnabled} onChange={handleChange} />
            {form.taxEnabled && (
              <Field label="Tax Rate (%)">
                <Input type="number" name="taxRate" value={form.taxRate}
                  onChange={handleChange} min="0" max="100" step="0.1" />
              </Field>
            )}
          </FullWidthCard>

          <FullWidthCard title="Checkout">
            <div className="space-y-3">
              <Toggle label="Allow Guest Checkout" hint="Users can buy without an account"
                name="allowGuestCheckout" checked={form.allowGuestCheckout} onChange={handleChange} />
              <Toggle label="Auto Payout" hint="Automatically process vendor payouts"
                name="autoPayoutEnabled" checked={form.autoPayoutEnabled} onChange={handleChange} />
            </div>
          </FullWidthCard>
        </div>
      );

      /* ────── PAYMENT ────── */
      case 'payment': return (
        <div className="space-y-4">
          <div className="p-3 sm:p-4 bg-amber-50 border border-amber-100 rounded-xl flex gap-2 sm:gap-3 items-start">
            <AlertTriangle size={16} className="text-amber-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs sm:text-sm text-amber-700">Secret keys are stored encrypted. Never expose them client-side.</p>
          </div>

          <PaymentCard title="Stripe" icon="S"
            enabled={form.paymentMethods.stripe.enabled}
            onToggle={() => setDeep('paymentMethods','stripe','enabled', !form.paymentMethods.stripe.enabled)}>
            <Field label="Publishable Key">
              <Input value={form.paymentMethods.stripe.publicKey} placeholder="pk_live_…"
                onChange={e => setDeep('paymentMethods','stripe','publicKey', e.target.value)} />
            </Field>
            <Field label="Secret Key">
              <PasswordInput value={form.paymentMethods.stripe.secretKey} placeholder="sk_live_…"
                onChange={e => setDeep('paymentMethods','stripe','secretKey', e.target.value)} />
            </Field>
          </PaymentCard>

          <PaymentCard title="Razorpay" icon="R"
            enabled={form.paymentMethods.razorpay.enabled}
            onToggle={() => setDeep('paymentMethods','razorpay','enabled', !form.paymentMethods.razorpay.enabled)}>
            <Field label="Key ID">
              <Input value={form.paymentMethods.razorpay.keyId} placeholder="rzp_live_…"
                onChange={e => setDeep('paymentMethods','razorpay','keyId', e.target.value)} />
            </Field>
            <Field label="Key Secret">
              <PasswordInput value={form.paymentMethods.razorpay.keySecret} placeholder="Secret…"
                onChange={e => setDeep('paymentMethods','razorpay','keySecret', e.target.value)} />
            </Field>
          </PaymentCard>

          <PaymentCard title="Wallet" icon="W"
            enabled={form.paymentMethods.wallet.enabled}
            onToggle={() => setDeep('paymentMethods','wallet','enabled', !form.paymentMethods.wallet.enabled)} />
        </div>
      );

      /* ────── EMAIL ────── */
      case 'email': return (
        <div className="space-y-4 sm:space-y-5">
          <SectionCard title="SMTP Configuration">
            <Field label="SMTP Host">
              <Input name="host" value={form.smtp.host} onChange={handleNested('smtp')} placeholder="smtp.gmail.com" />
            </Field>
            <Field label="SMTP Port">
              <Input type="number" name="port" value={form.smtp.port} onChange={handleNested('smtp')} placeholder="587" />
            </Field>
            <Field label="SMTP Username">
              <Input name="user" value={form.smtp.user} onChange={handleNested('smtp')} placeholder="you@gmail.com" />
            </Field>
            <Field label="SMTP Password">
              <PasswordInput name="pass" value={form.smtp.pass}
                onChange={handleNested('smtp')} placeholder="App password…" />
            </Field>
            <Field label="From Name">
              <Input name="fromName" value={form.smtp.fromName} onChange={handleNested('smtp')} placeholder="My Store" />
            </Field>
            <Field label="From Email">
              <Input type="email" name="fromEmail" value={form.smtp.fromEmail}
                onChange={handleNested('smtp')} placeholder="noreply@store.com" />
            </Field>
          </SectionCard>

          <FullWidthCard title="Email Footer">
            <Field label="Footer Text" hint="Appears at the bottom of all emails">
              <Textarea name="emailFooterText" value={form.smtp.emailFooterText}
                onChange={handleNested('smtp')} rows={2}
                placeholder="© 2026 Digital Marketplace | Unsubscribe | Privacy Policy" />
            </Field>
          </FullWidthCard>

          <FullWidthCard title="Notifications">
            <div className="space-y-3">
              <Toggle label="Order Confirmation" hint="Email customer when order is placed"
                name="orderConfirmation" checked={form.emailNotifications.orderConfirmation}
                onChange={handleNested('emailNotifications')} />
              <Toggle label="Vendor New Sale" hint="Notify vendor when a product is sold"
                name="vendorNotification" checked={form.emailNotifications.vendorNotification}
                onChange={handleNested('emailNotifications')} />
              <Toggle label="Payout Processed" hint="Notify vendor when payout is done"
                name="payoutNotification" checked={form.emailNotifications.payoutNotification}
                onChange={handleNested('emailNotifications')} />
              <Toggle label="Welcome Email" hint="Send welcome email to new registrations"
                name="welcomeEmail" checked={form.emailNotifications.welcomeEmail}
                onChange={handleNested('emailNotifications')} />
            </div>
          </FullWidthCard>
        </div>
      );

      /* ────── VENDOR ────── */
      case 'vendor': return (
        <div className="space-y-4 sm:space-y-5">
          <FullWidthCard title="Approval">
            <div className="space-y-3">
              <Toggle label="Auto-Approve Vendors" hint="Skip manual review for new vendors"
                name="autoApproveVendors" checked={form.vendorSettings.autoApproveVendors}
                onChange={handleNested('vendorSettings')} />
              <Toggle label="Auto-Approve Products" hint="Products go live without admin review"
                name="autoApproveProducts" checked={form.vendorSettings.autoApproveProducts}
                onChange={handleNested('vendorSettings')} />
              <Toggle label="Vendors Can Set Discounts" hint="Allow vendors to add sale prices"
                name="vendorCanSetDiscount" checked={form.vendorSettings.vendorCanSetDiscount}
                onChange={handleNested('vendorSettings')} />
            </div>
          </FullWidthCard>

          <SectionCard title="Limits">
            <Field label="Max Products Per Vendor">
              <Input type="number" name="maxProductsPerVendor"
                value={form.vendorSettings.maxProductsPerVendor}
                onChange={handleNested('vendorSettings')} min="1" />
            </Field>
            <Field label="Max File Size (MB)">
              <Input type="number" name="maxFileSizeMB"
                value={form.vendorSettings.maxFileSizeMB}
                onChange={handleNested('vendorSettings')} min="1" />
            </Field>
          </SectionCard>
        </div>
      );

      /* ────── SEO ────── */
      case 'seo': return (
        <div className="space-y-4 sm:space-y-5">
          <FullWidthCard title="Meta Tags">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
              <Field label="Meta Title" hint="50–60 chars recommended">
                <Input name="metaTitle" value={form.seo.metaTitle}
                  onChange={handleNested('seo')} placeholder="Best Digital Marketplace" />
                <p className={`text-xs mt-1 ${form.seo.metaTitle.length > 60 ? 'text-red-400' : 'text-gray-400'}`}>
                  {form.seo.metaTitle.length}/60
                </p>
              </Field>
              <Field label="Canonical URL">
                <Input name="canonicalUrl" value={form.seo.canonicalUrl}
                  onChange={handleNested('seo')} placeholder="https://yoursite.com" />
              </Field>
              <div className="col-span-full md:col-span-2">
                <Field label="Meta Description" hint="150–160 chars recommended">
                  <Textarea name="metaDescription" value={form.seo.metaDescription}
                    onChange={handleNested('seo')} rows={3}
                    placeholder="Discover thousands of digital products…" />
                  <p className={`text-xs mt-1 ${form.seo.metaDescription.length > 160 ? 'text-red-400' : 'text-gray-400'}`}>
                    {form.seo.metaDescription.length}/160
                  </p>
                </Field>
              </div>
            </div>
          </FullWidthCard>

          <SectionCard title="Analytics & Tracking">
            <Field label="Google Analytics ID" hint="G-XXXXXXXXXX">
              <Input name="googleAnalyticsId" value={form.seo.googleAnalyticsId}
                onChange={handleNested('seo')} placeholder="G-XXXXXXXXXX" />
            </Field>
            <Field label="Facebook Pixel ID">
              <Input name="facebookPixelId" value={form.seo.facebookPixelId}
                onChange={handleNested('seo')} placeholder="1234567890" />
            </Field>
          </SectionCard>

          <FullWidthCard title="Robots.txt">
            <Field label="Content" hint="Controls search-engine crawling">
              <Textarea name="robotsTxt" value={form.seo.robotsTxt}
                onChange={handleNested('seo')} rows={6} className="font-mono text-xs" />
            </Field>
          </FullWidthCard>
        </div>
      );

      /* ────── SOCIAL ────── */
      case 'social': return (
        <div className="space-y-4 sm:space-y-5">
          <SectionCard title="Social Media Links">
            {[
              { name:'facebook',  label:'Facebook',    ph:'https://facebook.com/yourpage' },
              { name:'twitter',   label:'Twitter / X', ph:'https://twitter.com/yourhandle' },
              { name:'instagram', label:'Instagram',   ph:'https://instagram.com/yourhandle' },
              { name:'linkedin',  label:'LinkedIn',    ph:'https://linkedin.com/company/…' },
              { name:'youtube',   label:'YouTube',     ph:'https://youtube.com/channel/…' },
              { name:'github',    label:'GitHub',      ph:'https://github.com/yourorg' },
            ].map(s => (
              <Field key={s.name} label={s.label}>
                <Input name={s.name} value={form.socialLinks[s.name]}
                  onChange={handleNested('socialLinks')} placeholder={s.ph} />
              </Field>
            ))}
          </SectionCard>
        </div>
      );

      /* ────── SECURITY ────── */
      case 'security': return (
        <div className="space-y-4 sm:space-y-5">
          <SectionCard title="Login Security">
            <Field label="Max Login Attempts" hint="Account locked after N failed tries">
              <Input type="number" name="maxLoginAttempts"
                value={form.security.maxLoginAttempts}
                onChange={handleNested('security')} min="1" max="20" />
            </Field>
            <Field label="Session Timeout (minutes)" hint="Auto-logout after inactivity">
              <Input type="number" name="sessionTimeoutMinutes"
                value={form.security.sessionTimeoutMinutes}
                onChange={handleNested('security')} min="5" />
            </Field>
          </SectionCard>

          <FullWidthCard title="Advanced">
            <Toggle label="Two-Factor Authentication"
              hint="Require 2FA for all admin accounts"
              name="twoFactorAuthEnabled" checked={form.security.twoFactorAuthEnabled}
              onChange={handleNested('security')} />
          </FullWidthCard>

          <FullWidthCard title="Admin IP Whitelist">
            <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg mb-1">
              <p className="text-xs text-blue-700">
                ⚠️ Leave empty to allow all IPs. Adding any IP will block all others.
              </p>
            </div>
            <Field label="Allowed IPs" hint="Press Enter or Add after each IP">
              <IPTagInput
                value={form.security.allowedAdminIPs}
                onChange={arr => setNestedArr('security','allowedAdminIPs', arr)}
              />
            </Field>
          </FullWidthCard>
        </div>
      );

      /* ────── APPEARANCE ────── */
      case 'appearance': return (
        <div className="space-y-4 sm:space-y-5">
          {/* <SectionCard title="Brand Colors">
            <Field label="Primary Color">
              <div className="flex gap-2 sm:gap-3 items-center">
                <input type="color" value={form.appearance.primaryColor}
                  onChange={e => setAppearance('primaryColor', e.target.value)}
                  className="h-10 w-12 sm:w-14 rounded-lg border border-gray-200 cursor-pointer p-1" />
                <Input value={form.appearance.primaryColor} placeholder="#3B82F6"
                  onChange={e => setAppearance('primaryColor', e.target.value)} />
              </div>
            </Field>
            <Field label="Secondary Color">
              <div className="flex gap-2 sm:gap-3 items-center">
                <input type="color" value={form.appearance.secondaryColor}
                  onChange={e => setAppearance('secondaryColor', e.target.value)}
                  className="h-10 w-12 sm:w-14 rounded-lg border border-gray-200 cursor-pointer p-1" />
                <Input value={form.appearance.secondaryColor} placeholder="#8B5CF6"
                  onChange={e => setAppearance('secondaryColor', e.target.value)} />
              </div>
            </Field>
          </SectionCard> */}

          {/* <FullWidthCard title="Theme">
            <Toggle label="Dark Mode Default" hint="All users see dark mode by default"
              name="darkModeEnabled" checked={form.appearance.darkModeEnabled}
              onChange={handleNested('appearance')} />
          </FullWidthCard> */}

          <FullWidthCard title="Footer">
            <Field label="Footer Text">
              <Textarea name="footerText" value={form.appearance.footerText}
                onChange={handleNested('appearance')} rows={2}
                placeholder="The best place to buy digital products." />
            </Field>
            <Field label="Copyright Text">
              <Input name="copyrightText" value={form.appearance.copyrightText}
                onChange={handleNested('appearance')}
                placeholder="© 2025 My Store. All rights reserved." />
            </Field>
          </FullWidthCard>

          <FullWidthCard title="Custom CSS">
            <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg">
              <p className="text-xs text-amber-700">⚠️ Injected globally. Use with caution.</p>
            </div>
            <Textarea name="customCSS" value={form.appearance.customCSS}
              onChange={handleNested('appearance')} rows={8} className="font-mono text-xs mt-4"
              placeholder={'/* Your custom CSS */\n.btn { border-radius: 8px; }'} />
          </FullWidthCard>
        </div>
      );

      default: return null;
    }
  };

  // ── Render ────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50/50">
      <form onSubmit={handleSubmit}>

        {/* Sticky header */}
        <div className="bg-white border-b border-gray-100 sticky top-0 z-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-blue-600 to-indigo-600
                  rounded-xl flex items-center justify-center flex-shrink-0">
                  <Settings size={16} className="text-white sm:w-[18px] sm:h-[18px]" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-base sm:text-lg font-bold text-gray-900 truncate">Site Settings</h1>
                  <p className="text-xs text-gray-400 hidden sm:block">Configure your marketplace</p>
                </div>
              </div>

              <button type="submit" disabled={mutation.isPending}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl font-semibold
                  text-xs sm:text-sm transition-all duration-200 disabled:opacity-60 flex-shrink-0
                  ${saved ? 'bg-green-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>
                {saved ? (
                  <><CheckCircle size={14} className="sm:w-4 sm:h-4" /> <span className="hidden sm:inline">Saved!</span><span className="sm:hidden">✓</span></>
                ) : mutation.isPending ? (
                  <><div className="w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 border-white/30 border-t-white
                    rounded-full animate-spin" /> <span className="hidden sm:inline">Saving…</span></>
                ) : (
                  <><Save size={14} className="sm:w-4 sm:h-4" /> <span className="hidden sm:inline">Save Settings</span><span className="sm:hidden">Save</span></>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Tab Selector */}
        <div className="lg:hidden bg-white border-b border-gray-100 sticky top-[57px] sm:top-[65px] z-10">
          <div className="max-w-6xl mx-auto px-4 py-2">
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm font-medium
                bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {TABS.map(({ id, label }) => (
                <option key={id} value={id}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Layout */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6 flex gap-6">

          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-52 flex-shrink-0">
            <nav className="space-y-1 sticky top-24">
              {TABS.map(({ id, label, icon: Icon }) => {
                const active = activeTab === id;
                return (
                  <button key={id} type="button" onClick={() => setActiveTab(id)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl
                      text-sm font-medium transition-all duration-150 text-left
                      ${active
                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-200'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}>
                    <Icon size={16} className={active ? 'text-white' : 'text-gray-400'} />
                    {label}
                    {active && <ChevronRight size={13} className="ml-auto" />}
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Content */}
          <main className="flex-1 min-w-0 pb-6 sm:pb-10">
            {renderTab()}
          </main>
        </div>
      </form>
    </div>
  );
}