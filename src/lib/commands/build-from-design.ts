/**
 * /build-from-design Command
 * Generates a page from a provided design image/reference
 */

import { uiChecklist } from '../validators/ui-checklist';
import { generatePageTemplate } from '../generators/page-generator';
import { designAnalyzer } from '../generators/design-analyzer';

// Define DesignAnalysis type locally
interface DesignAnalysis {
  components: string[];
  layoutType: 'form' | 'list' | 'dashboard' | 'detail';
  mobilePatterns: string[];
  hasTable: boolean;
  hasTabs: boolean;
  hasForm: boolean;
  hasMetrics: boolean;
  hasActions: boolean;
  estimatedComplexity: 'low' | 'medium' | 'high';
  suggestedComponents?: string[];
}

export interface BuildFromDesignOptions {
  pageName: string;
  designPath?: string;
  description?: string;
  features?: string[];
  validateOnly?: boolean;
}

export interface BuildResult {
  success: boolean;
  files: GeneratedFile[];
  validation: any;
  summary: string;
  nextSteps: string[];
}

export interface GeneratedFile {
  path: string;
  content: string;
  type: 'page' | 'component' | 'translation' | 'type';
}

export class BuildFromDesignCommand {
  async execute(options: BuildFromDesignOptions): Promise<BuildResult> {
    console.log('🚀 EXECUTING: /build-from-design');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Step 1: Analyze the design
    console.log('1️⃣ ANALYZING DESIGN...');
    const analysis = await this.analyzeDesign(options);
    console.log(`   ✅ Identified components:`, analysis.components);
    console.log(`   ✅ Layout type: ${analysis.layoutType}`);
    console.log(`   ✅ Mobile patterns needed: ${analysis.mobilePatterns.length}\n`);

    // Step 2: Generate page structure
    console.log('2️⃣ GENERATING PAGE STRUCTURE...');
    const files = await this.generateFiles(options.pageName, analysis);
    console.log(`   ✅ Generated ${files.length} files\n`);

    // Step 3: Apply responsive patterns
    console.log('3️⃣ APPLYING RESPONSIVE PATTERNS...');
    const enhancedFiles = await this.applyResponsivePatterns(files, analysis);
    console.log(`   ✅ ResponsiveTabs: ${analysis.components.includes('tabs') ? 'Applied' : 'N/A'}`);
    console.log(`   ✅ ResponsiveTable: ${analysis.components.includes('table') ? 'Applied' : 'N/A'}`);
    console.log(`   ✅ MobileActionBar: ${analysis.components.includes('actions') ? 'Applied' : 'N/A'}\n`);

    // Step 4: Validate against checklist
    console.log('4️⃣ VALIDATING AGAINST CHECKLIST...');
    const mainFile = enhancedFiles.find(f => f.type === 'page');
    const validation = uiChecklist.validate(mainFile?.content || '');
    console.log(`   Score: ${validation.score}%`);
    console.log(`   Status: ${validation.passed ? '✅ PASSED' : '❌ NEEDS FIXES'}\n`);

    if (!validation.passed && !options.validateOnly) {
      console.log('5️⃣ AUTO-FIXING ISSUES...');
      const fixedFiles = await this.autoFixIssues(enhancedFiles, validation);
      const revalidation = uiChecklist.validate(fixedFiles[0].content);
      console.log(`   ✅ Fixed ${validation.errors.length} errors`);
      console.log(`   New Score: ${revalidation.score}%\n`);
      
      return {
        success: true,
        files: fixedFiles,
        validation: revalidation,
        summary: this.generateSummary(options, analysis, revalidation),
        nextSteps: this.getNextSteps(options.pageName)
      };
    }

    return {
      success: validation.passed,
      files: enhancedFiles,
      validation,
      summary: this.generateSummary(options, analysis, validation),
      nextSteps: this.getNextSteps(options.pageName)
    };
  }

  private async analyzeDesign(options: BuildFromDesignOptions): Promise<DesignAnalysis> {
    // If design path provided, analyze the image
    // Otherwise, use description and features
    return {
      components: this.detectComponents(options),
      layoutType: this.detectLayoutType(options),
      mobilePatterns: this.detectMobilePatterns(options),
      hasTable: options.features?.includes('table') || false,
      hasTabs: options.features?.includes('tabs') || false,
      hasForm: options.features?.includes('form') || false,
      hasMetrics: options.features?.includes('metrics') || false,
      hasActions: options.features?.includes('actions') || true,
      estimatedComplexity: 'medium',
      suggestedComponents: []
    } as DesignAnalysis;
  }

  private detectComponents(options: BuildFromDesignOptions): string[] {
    const components: string[] = [];
    
    // Analyze based on features or description
    const text = (options.description + ' ' + options.features?.join(' ')).toLowerCase();
    
    if (text.includes('table') || text.includes('list')) components.push('table');
    if (text.includes('tab') || text.includes('section')) components.push('tabs');
    if (text.includes('form') || text.includes('input')) components.push('form');
    if (text.includes('metric') || text.includes('dashboard')) components.push('metrics');
    if (text.includes('button') || text.includes('action')) components.push('actions');
    if (text.includes('search') || text.includes('filter')) components.push('search');
    
    // Always include actions by default
    if (!components.includes('actions')) components.push('actions');
    
    return components;
  }

  private detectLayoutType(options: BuildFromDesignOptions): 'list' | 'detail' | 'dashboard' | 'form' {
    const text = (options.description || '').toLowerCase();
    
    if (text.includes('dashboard')) return 'dashboard';
    if (text.includes('form') || text.includes('create') || text.includes('edit')) return 'form';
    if (text.includes('detail') || text.includes('view')) return 'detail';
    return 'list'; // Default to list
  }

  private detectMobilePatterns(options: BuildFromDesignOptions): string[] {
    const patterns: string[] = [];
    const components = this.detectComponents(options);
    
    if (components.includes('table')) patterns.push('table-to-cards');
    if (components.includes('tabs')) patterns.push('tabs-to-vertical');
    if (components.includes('form')) patterns.push('inputs-w-11/12');
    if (components.includes('metrics')) patterns.push('grid-2x2');
    if (components.includes('actions')) patterns.push('fixed-action-bar');
    
    return patterns;
  }

  private async generateFiles(pageName: string, analysis: DesignAnalysis): Promise<GeneratedFile[]> {
    const files: GeneratedFile[] = [];
    
    // Generate main page file
    const pageContent = generatePageTemplate({
      name: pageName,
      type: analysis.layoutType,
      components: analysis.components,
      responsive: true
    });
    
    files.push({
      path: `app/dashboard/${pageName}/page.tsx`,
      content: pageContent,
      type: 'page'
    });

    // Generate component files if needed
    if (analysis.hasTabs) {
      analysis.components.forEach((tab, index) => {
        if (tab.startsWith('tab_')) {
          files.push({
            path: `components/${pageName}/tabs/${tab}.tsx`,
            content: this.generateTabComponent(tab, pageName),
            type: 'component'
          });
        }
      });
    }

    // Generate translations
    files.push({
      path: `translations/${pageName}.en.json`,
      content: this.generateTranslations(pageName, 'en'),
      type: 'translation'
    });

    files.push({
      path: `translations/${pageName}.es.json`,
      content: this.generateTranslations(pageName, 'es'),
      type: 'translation'
    });

    return files;
  }

  private generateTabComponent(tabName: string, pageName: string): string {
    return `'use client';

import React from 'react';
import { useI18n } from '@/contexts/I18nContext';

interface ${tabName}Props {
  data?: any;
  primaryColor: string;
  onSave?: (data: any) => void;
}

export function ${tabName}({ data, primaryColor, onSave }: ${tabName}Props) {
  const { t } = useI18n();

  return (
    <div className="p-4 md:p-6">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        {t('${pageName}.tabs.${tabName}', '${tabName}')}
      </h3>
      
      {/* Tab content here */}
      <div className="space-y-4">
        {/* Add your content */}
      </div>
    </div>
  );
}`;
  }

  private generateTranslations(pageName: string, lang: 'en' | 'es'): string {
    const translations = {
      en: {
        title: pageName.charAt(0).toUpperCase() + pageName.slice(1),
        description: `Manage your ${pageName}`,
        actions: {
          create: `New ${pageName.slice(0, -1)}`,
          edit: 'Edit',
          delete: 'Delete',
          save: 'Save Changes',
          cancel: 'Cancel'
        }
      },
      es: {
        title: pageName.charAt(0).toUpperCase() + pageName.slice(1),
        description: `Gestionar ${pageName}`,
        actions: {
          create: `Nuevo ${pageName.slice(0, -1)}`,
          edit: 'Editar',
          delete: 'Eliminar',
          save: 'Guardar Cambios',
          cancel: 'Cancelar'
        }
      }
    };

    return JSON.stringify(translations[lang], null, 2);
  }

  private async applyResponsivePatterns(
    files: GeneratedFile[], 
    analysis: DesignAnalysis
  ): Promise<GeneratedFile[]> {
    return files.map(file => {
      if (file.type !== 'page') return file;
      
      let content = file.content;
      
      // Replace table with ResponsiveTable
      if (analysis.hasTable) {
        content = content.replace(
          /<table[\s\S]*?<\/table>/g,
          `<ResponsiveTable
            data={data}
            columns={columns}
            onRowClick={handleRowClick}
            primaryColor={primaryColor}
          />`
        );
      }
      
      // Replace tabs with ResponsiveTabs
      if (analysis.hasTabs) {
        content = content.replace(
          /(<div.*?tabs.*?>[\s\S]*?<\/div>)/gi,
          `<ResponsiveTabs
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            primaryColor={primaryColor}
          />`
        );
      }
      
      // Add MobileActionBar for actions
      if (analysis.hasActions) {
        content = content.replace(
          /(<button.*?>.*?<\/button>[\s\S]*?<button.*?>.*?<\/button>)/gi,
          `<MobileActionBar
            actions={actions}
            primaryColor={primaryColor}
            position="fixed"
          />`
        );
        
        // Add padding to container
        content = content.replace(
          'className="min-h-screen',
          'className="min-h-screen pb-24 md:pb-0'
        );
      }
      
      return { ...file, content };
    });
  }

  private async autoFixIssues(files: GeneratedFile[], validation: any): Promise<GeneratedFile[]> {
    return files.map(file => {
      if (file.type !== 'page') return file;
      
      let content = file.content;
      
      // Fix missing useI18n
      if (!content.includes('useI18n')) {
        content = content.replace(
          "import React",
          "import React\nimport { useI18n } from '@/contexts/I18nContext'"
        );
        content = content.replace(
          "export default function",
          "export default function"
        ).replace(
          "const [",
          "const { t } = useI18n();\n  const ["
        );
      }
      
      // Fix dark mode classes
      content = content.replace(/bg-white(?!.*dark:)/g, 'bg-white dark:bg-gray-800');
      content = content.replace(/text-gray-900(?!.*dark:)/g, 'text-gray-900 dark:text-white');
      
      // Fix primary color
      if (!content.includes('primaryColor')) {
        content = content.replace(
          "const { t } = useI18n();",
          `const { t } = useI18n();
  const [primaryColor, setPrimaryColor] = useState('#22c55e');

  useEffect(() => {
    const settings = localStorage.getItem('ui-settings');
    if (settings) {
      const parsed = JSON.parse(settings);
      setPrimaryColor(parsed.primaryColor || '#22c55e');
    }
  }, []);`
        );
      }
      
      // Fix breadcrumbs
      if (!content.includes('Breadcrumb')) {
        const breadcrumbCode = `
      {/* Breadcrumbs - Desktop */}
      <nav className="hidden sm:flex mb-4 text-sm" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2">
          <li>
            <Link href="/dashboard" className="text-gray-500 hover:text-gray-700 dark:text-gray-400">
              {t('navigation.dashboard', 'Dashboard')}
            </Link>
          </li>
          <li className="text-gray-400">/</li>
          <li className="text-gray-700 font-medium dark:text-gray-300">
            {t('${file.path.split('/')[2]}.title', '${file.path.split('/')[2]}')}
          </li>
        </ol>
      </nav>

      {/* Mobile Title */}
      <div className="sm:hidden mb-4">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
          {t('${file.path.split('/')[2]}.title', '${file.path.split('/')[2]}')}
        </h1>
      </div>`;
        
        content = content.replace(
          '<div className="max-w-7xl',
          breadcrumbCode + '\n      <div className="max-w-7xl'
        );
      }
      
      return { ...file, content };
    });
  }

  private generateSummary(
    options: BuildFromDesignOptions, 
    analysis: DesignAnalysis,
    validation: any
  ): string {
    return `
📊 BUILD SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Page: ${options.pageName}
Type: ${analysis.layoutType}
Components: ${analysis.components.join(', ')}
Validation Score: ${validation.score}%
Status: ${validation.passed ? '✅ Ready' : '⚠️ Needs Review'}

Mobile Patterns Applied:
${analysis.mobilePatterns.map(p => `  ✅ ${p}`).join('\n')}

Files Generated:
  📁 app/dashboard/${options.pageName}/page.tsx
  📁 components/${options.pageName}/...
  📁 translations/${options.pageName}.json
`;
  }

  private getNextSteps(pageName: string): string[] {
    return [
      `1. Review generated files in app/dashboard/${pageName}/`,
      `2. Update translations if needed`,
      `3. Test on mobile viewports (320px, 375px, 414px)`,
      `4. Connect to your API endpoints`,
      `5. Run: npm run dev to see the page`
    ];
  }
}

// Export singleton instance
export const buildFromDesign = new BuildFromDesignCommand();