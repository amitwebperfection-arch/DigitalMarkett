import { createContext, useContext, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

const fetchSiteSettings = async () => {
  const { data } = await api.get('/settings');
  return data;
};

const DEFAULTS = {
  siteName: 'Digital Marketplace',
  siteTagline: '',
  siteLogo: '',
  favicon: '',
  maintenanceMode: false,
  maintenanceMessage: 'We are under maintenance. Be back soon!',
  currency: 'USD',
  currencySymbol: '$',
  currencyPosition: 'before',
  commissionRate: 10,
  payoutThreshold: 50,
  taxEnabled: false,
  taxRate: 0,
  allowGuestCheckout: true,
  appearance: {
    primaryColor: '#3B82F6',
    secondaryColor: '#8B5CF6',
    darkModeEnabled: false,
    customCSS: '',
    footerText: '',
    copyrightText: '© 2025 Digital Marketplace. All rights reserved.',
  },
  socialLinks: { facebook: '', twitter: '', instagram: '', linkedin: '', youtube: '', github: '' },
  seo: { metaTitle: '', metaDescription: '', googleAnalyticsId: '', facebookPixelId: '', canonicalUrl: '' },
  paymentMethods: {
    stripe:   { enabled: false },
    razorpay: { enabled: false },
    wallet:   { enabled: true },
    cod:      { enabled: false },
  },
  vendorSettings: {
    autoApproveVendors: false, autoApproveProducts: false,
    vendorCanSetDiscount: true, maxProductsPerVendor: 100,
    allowedFileTypes: ['pdf', 'zip', 'rar', 'exe'], maxFileSizeMB: 500,
  },
  emailNotifications: {
    orderConfirmation: true, vendorNotification: true,
    payoutNotification: true, welcomeEmail: true,
  },
};

const META_KEYS = ['_id', '__v', 'success', 'createdAt', 'updatedAt'];
const cleanMeta = (obj) => { const o = { ...obj }; META_KEYS.forEach(k => delete o[k]); return o; };
const deepMerge = (target, source) => {
  if (!source) return target;
  const result = { ...target };
  for (const key of Object.keys(source)) {
    const s = source[key], t = target[key];
    if (s === null || s === undefined) continue;
    if (typeof s === 'object' && !Array.isArray(s) && typeof t === 'object' && !Array.isArray(t)) {
      result[key] = deepMerge(t, s);
    } else { result[key] = s; }
  }
  return result;
};

const SettingsContext = createContext(DEFAULTS);

export const useFormatPrice = () => {
  const { currencySymbol, currencyPosition } = useSettings();
  return (amount) => {
    const num = Number(amount || 0).toFixed(2);
    return currencyPosition === 'before' ? `${currencySymbol}${num}` : `${num}${currencySymbol}`;
  };
};

export function SettingsProvider({ children }) {
  const { data: raw } = useQuery({
    queryKey: ['site-settings'],
    queryFn: fetchSiteSettings,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const settings = raw ? deepMerge(DEFAULTS, cleanMeta(raw)) : DEFAULTS;


  useEffect(() => {
    const { primaryColor, secondaryColor, customCSS, darkModeEnabled } = settings.appearance || {};
    const root = document.documentElement;
    if (primaryColor)   root.style.setProperty('--color-primary', primaryColor);
    if (secondaryColor) root.style.setProperty('--color-secondary', secondaryColor);
    root.classList.toggle('dark', !!darkModeEnabled);
    let el = document.getElementById('site-custom-css');
    if (!el) { el = document.createElement('style'); el.id = 'site-custom-css'; document.head.appendChild(el); }
    el.textContent = customCSS || '';
  }, [settings.appearance]);

  useEffect(() => {
    if (!settings.favicon) return;
    let link = document.querySelector("link[rel~='icon']");
    if (!link) { link = document.createElement('link'); link.rel = 'icon'; document.head.appendChild(link); }
    link.href = settings.favicon;
  }, [settings.favicon]);

  useEffect(() => {
    const { metaTitle, metaDescription, canonicalUrl } = settings.seo || {};

    
    document.title = metaTitle || settings.siteName || 'Digital Marketplace';

    
    let descEl = document.querySelector('meta[name="description"]');
    if (!descEl) {
      descEl = document.createElement('meta');
      descEl.name = 'description';
      document.head.appendChild(descEl);
    }
    descEl.content = metaDescription || '';

   
    let canonEl = document.querySelector('link[rel="canonical"]');
    if (canonicalUrl) {
      if (!canonEl) {
        canonEl = document.createElement('link');
        canonEl.rel = 'canonical';
        document.head.appendChild(canonEl);
      }
      canonEl.href = canonicalUrl;
    } else if (canonEl) {
      canonEl.remove(); 
    }
  }, [settings.seo, settings.siteName]);

  
  useEffect(() => {
    const gaId = settings.seo?.googleAnalyticsId;
    if (!gaId || document.getElementById('ga-script')) return;
    const s1 = document.createElement('script');
    s1.id = 'ga-script'; s1.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`; s1.async = true;
    document.head.appendChild(s1);
    const s2 = document.createElement('script');
    s2.id = 'ga-init';
    s2.textContent = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}');`;
    document.head.appendChild(s2);
  }, [settings.seo?.googleAnalyticsId]);

  
  useEffect(() => {
    const px = settings.seo?.facebookPixelId;
    if (!px || document.getElementById('fb-pixel')) return;
    const s = document.createElement('script');
    s.id = 'fb-pixel';
    s.textContent = `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${px}');fbq('track','PageView');`;
    document.head.appendChild(s);
  }, [settings.seo?.facebookPixelId]);

  return <SettingsContext.Provider value={settings}>{children}</SettingsContext.Provider>;
}

export const useSettings = () => useContext(SettingsContext);