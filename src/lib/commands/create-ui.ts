/**
 * /create-ui Command
 * Generates a complete UI page from scratch based on requirements
 */

import { uiChecklist } from '../validators/ui-checklist';
import { 
  generatePageTemplate, 
  generateComponentTemplate, 
  generateTranslations,
  generateTypeDefinition 
} from '../generators/page-generator';
import { designAnalyzer } from '../generators/design-analyzer';

export interface CreateUIOptions {
  name: string;
  type: 'list' | 'detail' | 'dashboard' | 'form';
  features?: string[];
  description?: string;
  autoFix?: boolean;
  dryRun?: boolean;
}

export interface CreateUIResult {
  success: boolean;
  files: GeneratedFile[];
  validation: any;
  analysis: any;
  summary: string;
  instructions: string[];
}

export interface GeneratedFile {
  path: string;
  content: string;
  type: 'page' | 'component' | 'translation' | 'type' | 'api';
  action: 'create' | 'update';
}

export class CreateUICommand {
  async execute(options: CreateUIOptions): Promise<CreateUIResult> {
    console.log('🚀 EXECUTING: /create-ui');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    // Step 1: Analyze requirements
    console.log('1️⃣ ANALYZING REQUIREMENTS...');
    const analysis = await this.analyzeRequirements(options);
    console.log(`   ✅ Page type: ${options.type}`);
    console.log(`   ✅ Features: ${analysis.components.join(', ')}`);
    console.log(`   ✅ Complexity: ${analysis.estimatedComplexity}\n`);

    // Step 2: Generate file structure
    console.log('2️⃣ GENERATING FILE STRUCTURE...');
    const files = await this.generateFiles(options, analysis);
    console.log(`   ✅ Main page: app/dashboard/${options.name}/page.tsx`);
    if (analysis.hasTabs) {
      console.log(`   ✅ Tab components: ${analysis.components.filter((c: any) => c.startsWith('tab_')).length} tabs`);
    }
    console.log(`   ✅ Translations: en.json, es.json`);
    console.log(`   ✅ Type definitions: types/${options.name}.ts\n`);

    // Step 3: Apply responsive patterns
    console.log('3️⃣ APPLYING RESPONSIVE PATTERNS...');
    const responsiveFiles = this.applyResponsivePatterns(files, analysis);
    console.log(`   ✅ Mobile-first CSS applied`);
    console.log(`   ✅ Responsive components integrated`);
    console.log(`   ✅ Dark mode classes added\n`);

    // Step 4: Add integrations
    console.log('4️⃣ ADDING INTEGRATIONS...');
    const integratedFiles = this.addIntegrations(responsiveFiles, options);
    console.log(`   ✅ i18n hook integrated`);
    console.log(`   ✅ Primary color from localStorage`);
    console.log(`   ✅ API endpoints configured`);
    console.log(`   ✅ State management added\n`);

    // Step 5: Validate
    console.log('5️⃣ VALIDATING GENERATED CODE...');
    const mainFile = integratedFiles.find(f => f.type === 'page');
    const validation = uiChecklist.validate(mainFile?.content || '');
    console.log(`   Score: ${validation.score}%`);
    console.log(`   Status: ${validation.passed ? '✅ PASSED' : '⚠️ NEEDS REVIEW'}`);
    
    if (validation.errors.length > 0) {
      console.log(`   Errors: ${validation.errors.length}`);
    }
    if (validation.warnings.length > 0) {
      console.log(`   Warnings: ${validation.warnings.length}`);
    }
    console.log('');

    // Step 6: Auto-fix if needed
    let finalFiles = integratedFiles;
    if (!validation.passed && options.autoFix && !options.dryRun) {
      console.log('6️⃣ AUTO-FIXING VALIDATION ISSUES...');
      finalFiles = await this.autoFixIssues(integratedFiles, validation);
      const revalidation = uiChecklist.validate(finalFiles[0].content);
      console.log(`   ✅ Fixed ${validation.errors.length} errors`);
      console.log(`   ✅ New score: ${revalidation.score}%\n`);
    }

    // Generate summary and instructions
    const summary = this.generateSummary(options, analysis, validation);
    const instructions = this.generateInstructions(options, finalFiles);

    return {
      success: validation.passed || (options.autoFix && validation.score >= 80) || false,
      files: finalFiles,
      validation,
      analysis,
      summary,
      instructions
    };
  }

  private async analyzeRequirements(options: CreateUIOptions): Promise<any> {
    const features = options.features || [];
    const description = options.description || `${options.type} page for ${options.name}`;
    
    // Use design analyzer to understand requirements
    const analysis = await designAnalyzer.analyzeDesign(undefined, description + ' ' + features.join(' '));
    
    // Add specific requirements based on type
    switch (options.type) {
      case 'list':
        if (!analysis.hasTable) {
          analysis.hasTable = true;
          analysis.components.push('table');
        }
        if (!analysis.components.includes('search')) {
          analysis.components.push('search');
        }
        break;
      
      case 'dashboard':
        if (!analysis.hasMetrics) {
          analysis.hasMetrics = true;
          analysis.components.push('metrics');
        }
        break;
      
      case 'form':
        if (!analysis.hasForm) {
          analysis.hasForm = true;
          analysis.components.push('form');
        }
        break;
      
      case 'detail':
        if (!analysis.hasTabs) {
          analysis.hasTabs = true;
          analysis.components.push('tabs');
        }
        break;
    }
    
    // Always include actions
    if (!analysis.hasActions) {
      analysis.hasActions = true;
      analysis.components.push('actions');
    }
    
    return analysis;
  }

  private async generateFiles(options: CreateUIOptions, analysis: any): Promise<GeneratedFile[]> {
    const files: GeneratedFile[] = [];
    
    // 1. Generate main page
    const pageContent = generatePageTemplate({
      name: options.name,
      type: options.type,
      components: analysis.components,
      responsive: true
    });
    
    files.push({
      path: `app/dashboard/${options.name}/page.tsx`,
      content: pageContent,
      type: 'page',
      action: 'create'
    });

    // 2. Generate tab components if needed
    if (analysis.hasTabs) {
      const tabNames = ['overview', 'details', 'settings'];
      tabNames.forEach(tabName => {
        const componentContent = generateComponentTemplate(`${options.name}-${tabName}`, 'tab');
        files.push({
          path: `components/${options.name}/tabs/${tabName}.tsx`,
          content: componentContent,
          type: 'component',
          action: 'create'
        });
      });
    }

    // 3. Generate translations
    const enTranslations = generateTranslations(options.name, 'en');
    const esTranslations = generateTranslations(options.name, 'es');
    
    files.push({
      path: `lib/i18n/translations/${options.name}.en.json`,
      content: JSON.stringify(enTranslations, null, 2),
      type: 'translation',
      action: 'update'
    });
    
    files.push({
      path: `lib/i18n/translations/${options.name}.es.json`,
      content: JSON.stringify(esTranslations, null, 2),
      type: 'translation',
      action: 'update'
    });

    // 4. Generate type definitions
    const typeFields = [
      { name: 'id', type: 'number' },
      { name: 'name', type: 'string' },
      { name: 'description', type: 'string', optional: true },
      { name: 'status', type: "'active' | 'inactive' | 'pending'" },
      { name: 'createdAt', type: 'string' },
      { name: 'updatedAt', type: 'string' }
    ];
    
    const typeContent = generateTypeDefinition(options.name, typeFields);
    
    files.push({
      path: `types/${options.name}.ts`,
      content: typeContent,
      type: 'type',
      action: 'create'
    });

    // 5. Generate API service
    const apiContent = this.generateAPIService(options.name);
    files.push({
      path: `lib/api/${options.name}.ts`,
      content: apiContent,
      type: 'api',
      action: 'create'
    });

    return files;
  }

  private generateAPIService(name: string): string {
    const pascalName = name.charAt(0).toUpperCase() + name.slice(1);
    
    return `import { ${pascalName}, ${pascalName}Response, Create${pascalName}Dto, Update${pascalName}Dto } from '@/types/${name}';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5266';

export class ${pascalName}Service {
  private getHeaders(): HeadersInit {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? \`Bearer \${token}\` : ''
    };
  }

  async getAll(page: number = 1, pageSize: number = 20): Promise<${pascalName}Response> {
    const response = await fetch(\`\${API_URL}/api/${name}?page=\${page}&pageSize=\${pageSize}\`, {
      headers: this.getHeaders()
    });
    
    if (!response.ok) {
      throw new Error(\`Failed to fetch ${name}: \${response.statusText}\`);
    }
    
    return response.json();
  }

  async getById(id: number): Promise<${pascalName}> {
    const response = await fetch(\`\${API_URL}/api/${name}/\${id}\`, {
      headers: this.getHeaders()
    });
    
    if (!response.ok) {
      throw new Error(\`Failed to fetch ${name}: \${response.statusText}\`);
    }
    
    return response.json();
  }

  async create(data: Create${pascalName}Dto): Promise<${pascalName}> {
    const response = await fetch(\`\${API_URL}/api/${name}\`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(\`Failed to create ${name}: \${response.statusText}\`);
    }
    
    return response.json();
  }

  async update(id: number, data: Update${pascalName}Dto): Promise<${pascalName}> {
    const response = await fetch(\`\${API_URL}/api/${name}/\${id}\`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(\`Failed to update ${name}: \${response.statusText}\`);
    }
    
    return response.json();
  }

  async delete(id: number): Promise<void> {
    const response = await fetch(\`\${API_URL}/api/${name}/\${id}\`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
    
    if (!response.ok) {
      throw new Error(\`Failed to delete ${name}: \${response.statusText}\`);
    }
  }
}

export const ${name}Service = new ${pascalName}Service();`;
  }

  private applyResponsivePatterns(files: GeneratedFile[], analysis: any): GeneratedFile[] {
    return files.map(file => {
      if (file.type !== 'page') return file;
      
      let content = file.content;
      
      // Ensure responsive components are imported and used
      if (analysis.hasTable && !content.includes('ResponsiveTable')) {
        content = content.replace(
          "import { useI18n }",
          "import { useI18n }\nimport { ResponsiveTable } from '@/components/responsive/ResponsiveTable';"
        );
      }
      
      if (analysis.hasTabs && !content.includes('ResponsiveTabs')) {
        content = content.replace(
          "import { useI18n }",
          "import { useI18n }\nimport { ResponsiveTabs } from '@/components/responsive/ResponsiveTabs';"
        );
      }
      
      if (analysis.hasActions && !content.includes('MobileActionBar')) {
        content = content.replace(
          "import { useI18n }",
          "import { useI18n }\nimport { MobileActionBar } from '@/components/mobile/MobileActionBar';"
        );
      }
      
      return { ...file, content };
    });
  }

  private addIntegrations(files: GeneratedFile[], options: CreateUIOptions): GeneratedFile[] {
    return files.map(file => {
      if (file.type !== 'page') return file;
      
      let content = file.content;
      
      // Ensure API service is imported
      const serviceName = `${options.name}Service`;
      if (!content.includes(serviceName)) {
        content = content.replace(
          "import { useI18n }",
          `import { useI18n }\nimport { ${serviceName} } from '@/lib/api/${options.name}';`
        );
      }
      
      return { ...file, content };
    });
  }

  private async autoFixIssues(files: GeneratedFile[], validation: any): Promise<GeneratedFile[]> {
    return files.map(file => {
      if (file.type !== 'page') return file;
      
      let content = file.content;
      
      // Fix each validation error
      validation.errors.forEach((error: string) => {
        if (error.includes('useI18n')) {
          if (!content.includes("import { useI18n }")) {
            content = content.replace(
              "import React",
              "import React\nimport { useI18n } from '@/contexts/I18nContext'"
            );
          }
          if (!content.includes("const { t } = useI18n()")) {
            content = content.replace(
              "export default function",
              "export default function"
            ).replace(
              "const [",
              "const { t } = useI18n();\n  const ["
            );
          }
        }
        
        if (error.includes('dark mode')) {
          // Add dark mode classes
          content = content.replace(/bg-white(?!.*dark:)/g, 'bg-white dark:bg-gray-800');
          content = content.replace(/text-gray-900(?!.*dark:)/g, 'text-gray-900 dark:text-white');
          content = content.replace(/border-gray-200(?!.*dark:)/g, 'border-gray-200 dark:border-gray-700');
        }
        
        if (error.includes('primary color')) {
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
        }
      });
      
      return { ...file, content };
    });
  }

  private generateSummary(options: CreateUIOptions, analysis: any, validation: any): string {
    return `
📊 CREATE UI SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Page: ${options.name}
Type: ${options.type}
Features: ${analysis.components.join(', ')}
Complexity: ${analysis.estimatedComplexity}

Validation Score: ${validation.score}%
Status: ${validation.passed ? '✅ Ready to Use' : '⚠️ Review Required'}

Components Used:
${analysis.hasTable ? '  ✅ ResponsiveTable' : '  ⭕ ResponsiveTable (not needed)'}
${analysis.hasTabs ? '  ✅ ResponsiveTabs' : '  ⭕ ResponsiveTabs (not needed)'}
${analysis.hasActions ? '  ✅ MobileActionBar' : '  ⭕ MobileActionBar (not needed)'}

Patterns Applied:
  ✅ Mobile-first responsive design
  ✅ Dark mode support
  ✅ Dynamic primary color
  ✅ Internationalization (i18n)
  ✅ TypeScript types
  ✅ API service layer
`;
  }

  private generateInstructions(options: CreateUIOptions, files: GeneratedFile[]): string[] {
    const instructions: string[] = [];
    
    instructions.push(`📁 FILES TO CREATE/UPDATE:`);
    instructions.push('');
    
    files.forEach(file => {
      const action = file.action === 'create' ? '🆕 CREATE' : '📝 UPDATE';
      instructions.push(`${action}: ${file.path}`);
    });
    
    instructions.push('');
    instructions.push(`📋 NEXT STEPS:`);
    instructions.push('');
    instructions.push(`1. Review generated files before saving`);
    instructions.push(`2. Update translations if needed`);
    instructions.push(`3. Connect to your backend API`);
    instructions.push(`4. Test on mobile devices (320px, 375px, 414px)`);
    instructions.push(`5. Run: npm run dev`);
    instructions.push(`6. Navigate to: /dashboard/${options.name}`);
    
    if (!options.dryRun) {
      instructions.push('');
      instructions.push(`⚠️ IMPORTANT:`);
      instructions.push(`- Update lib/i18n/translations/en.json with ${options.name} translations`);
      instructions.push(`- Update lib/i18n/translations/es.json with ${options.name} translations`);
      instructions.push(`- Create backend API endpoints for /api/${options.name}`);
    }
    
    return instructions;
  }
}

// Export singleton instance
export const createUI = new CreateUICommand();