'use client';

import { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import PreviewHeader from './PreviewHeader';
import PreviewFooter from './PreviewFooter';
import useThemeConfigStore from '@/stores/useThemeConfigStore';

interface CustomPage {
  id: number;
  title: string;
  slug: string;
  content?: string;
  template?: string;
  metaTitle?: string;
  metaDescription?: string;
  isVisible?: boolean;
  publishStatus?: string;
}

interface Policy {
  id: number;
  type: string;
  title: string;
  content?: string;
  isActive?: boolean;
}

interface CustomPageViewProps {
  slug: string;
}

export default function CustomPageView({ slug }: CustomPageViewProps) {
  const [pageData, setPageData] = useState<CustomPage | Policy | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState<number>(1);
  const [structuralConfig, setStructuralConfig] = useState<any>(null);
  const [globalTheme, setGlobalTheme] = useState<any>(null);
  const { config: themeConfig } = useThemeConfigStore();

  useEffect(() => {
    // Get company ID from localStorage
    const storedCompanyId = localStorage.getItem('selectedCompanyId') || localStorage.getItem('companyId');
    if (storedCompanyId) {
      setCompanyId(parseInt(storedCompanyId));
    } else {
      // Check URL params as fallback
      const urlParams = new URLSearchParams(window.location.search);
      const companyParam = urlParams.get('companyId');
      if (companyParam) {
        setCompanyId(parseInt(companyParam));
      }
    }
  }, []);

  // Fetch structural components
  const fetchStructuralComponents = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://172.25.64.1:5266/api';
      const response = await fetch(`${apiUrl}/structural-components/company/${companyId}/published`);
      
      if (response.ok) {
        const data = await response.json();
        
        // Parse the JSON strings from the API response
        const parsedComponents = {
          header: data.headerConfig ? JSON.parse(data.headerConfig) : null,
          footer: data.footerConfig ? JSON.parse(data.footerConfig) : null,
          announcementBar: data.announcementBarConfig ? JSON.parse(data.announcementBarConfig) : null,
          imageBanner: data.imageBannerConfig ? JSON.parse(data.imageBannerConfig) : null,
          cartDrawer: data.cartDrawerConfig ? JSON.parse(data.cartDrawerConfig) : null,
        };
        
        setStructuralConfig(parsedComponents);
      }
    } catch (error) {
      console.error('Error fetching structural components:', error);
    }
  };

  // Fetch global theme
  const fetchGlobalTheme = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://172.25.64.1:5266/api';
      const response = await fetch(`${apiUrl}/global-theme-config/company/${companyId}/published`);
      
      if (response.ok) {
        const data = await response.json();
        setGlobalTheme(data);
      }
    } catch (error) {
      console.error('Error fetching global theme:', error);
    }
  };

  // Fetch structural components and theme when companyId is available
  useEffect(() => {
    if (companyId) {
      fetchStructuralComponents();
      fetchGlobalTheme();
    }
  }, [companyId]);

  useEffect(() => {
    const fetchPageData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // First, try to fetch as a custom page (Paginas)
        try {
          const pageResponse = await fetch(
            `http://172.25.64.1:5266/api/paginas/slug/${slug}?companyId=${companyId}`,
            {
              headers: {
                'Content-Type': 'application/json',
              },
            }
          );

          if (pageResponse.ok) {
            const data = await pageResponse.json();
            const page = data.data || data;
            
            // Check if page is visible and published
            if (page && page.isVisible && 
                (page.publishStatus === 'published' || !page.publishStatus)) {
              setPageData(page);
              return;
            }
          }
        } catch (err) {
          console.log('Not found as page, trying as policy...');
        }

        // If not found as page, try as policy
        const policyTypes = ['privacy', 'terms', 'returns', 'shipping', 'contact'];
        const policyTypeMap: Record<string, string> = {
          'politica-privacidad': 'privacy',
          'privacy-policy': 'privacy',
          'terminos-servicio': 'terms',
          'terms-of-service': 'terms',
          'politica-devoluciones': 'returns',
          'return-policy': 'returns',
          'politica-envio': 'shipping',
          'shipping-policy': 'shipping',
          'contacto': 'contact',
          'contact': 'contact'
        };

        const policyType = policyTypeMap[slug] || slug;
        
        if (policyTypes.includes(policyType)) {
          try {
            const policyResponse = await fetch(
              `http://172.25.64.1:5266/api/policies/type/${policyType}?companyId=${companyId}`,
              {
                headers: {
                  'Content-Type': 'application/json',
                },
              }
            );

            if (policyResponse.ok) {
              const policy = await policyResponse.json();
              if (policy && policy.isActive !== false) {
                setPageData(policy);
                return;
              }
            }
          } catch (err) {
            console.log('Not found as policy either');
          }
        }

        // If nothing found, set error
        setError('Page not found');
      } catch (err) {
        console.error('Error fetching page data:', err);
        setError('Error loading page');
      } finally {
        setLoading(false);
      }
    };

    if (slug && companyId) {
      fetchPageData();
    }
  }, [slug, companyId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !pageData) {
    // Get color scheme even for 404 page
    const colorScheme = globalTheme?.colorSchemes?.schemes?.find((s: any) => s.id === 'scheme-1');
    const backgroundColor = colorScheme?.background || '#FFFFFF';
    
    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor }}>
        {/* Global Header */}
        {structuralConfig?.header && (
          <PreviewHeader 
            config={structuralConfig.header}
            theme={globalTheme}
            isEditor={false}
          />
        )}
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center py-20">
            <h1 className="text-4xl font-bold mb-4" style={{ color: colorScheme?.text || '#000000' }}>404</h1>
            <p className="text-xl mb-6" style={{ color: colorScheme?.text || '#666666' }}>Page not found</p>
            <a href="/" className="inline-block px-6 py-3 rounded-lg text-white hover:opacity-90 transition-opacity"
               style={{ backgroundColor: colorScheme?.solidButton || '#3B82F6' }}>
              Go to homepage
            </a>
          </div>
        </main>
        {/* Global Footer */}
        {structuralConfig?.footer && (
          <PreviewFooter 
            config={structuralConfig.footer}
            theme={globalTheme}
            isEditor={false}
          />
        )}
      </div>
    );
  }

  // Get color scheme for background
  const colorScheme = globalTheme?.colorSchemes?.schemes?.find((s: any) => s.id === 'scheme-1');
  const backgroundColor = colorScheme?.background || '#FFFFFF';

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor }}>
      {/* Global Header */}
      {structuralConfig?.header && (
        <PreviewHeader 
          config={structuralConfig.header}
          theme={globalTheme}
          isEditor={false}
        />
      )}

      {/* Page Content */}
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            {/* Page Title */}
            <h1 className="text-3xl sm:text-4xl font-bold text-center mb-8" 
                style={{ color: colorScheme?.text || '#000000' }}>
              {pageData.title}
            </h1>

            {/* Page Content */}
            {pageData.content ? (
              <div 
                className="prose prose-lg max-w-none mx-auto
                  prose-headings:font-bold
                  prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4
                  prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3
                  prose-p:my-4 prose-p:leading-relaxed prose-p:text-base
                  prose-ul:my-4 prose-ul:pl-6
                  prose-ol:my-4 prose-ol:pl-6
                  prose-li:my-2
                  prose-strong:font-semibold
                  prose-a:text-blue-600 prose-a:hover:text-blue-700 prose-a:underline"
                style={{ color: colorScheme?.text || '#000000' }}
                dangerouslySetInnerHTML={{ __html: pageData.content }}
              />
            ) : (
              <div className="text-center" style={{ color: colorScheme?.text || '#666666' }}>
                <p>No content available for this page.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Global Footer */}
      {structuralConfig?.footer && (
        <PreviewFooter 
          config={structuralConfig.footer}
          theme={globalTheme}
          isEditor={false}
        />
      )}
    </div>
  );
}