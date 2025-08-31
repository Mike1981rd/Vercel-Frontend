/**
 * UI Validation Checklist
 * Validates that generated pages follow all CLAUDE.md patterns
 */

export interface ChecklistItem {
  id: string;
  label: string;
  required: boolean;
  status: 'pending' | 'checking' | 'passed' | 'failed' | 'warning';
  message?: string;
}

export interface ValidationResult {
  passed: boolean;
  score: number;
  items: ChecklistItem[];
  errors: string[];
  warnings: string[];
}

export class UIChecklist {
  private items: ChecklistItem[] = [
    // Translations
    {
      id: 'translations',
      label: 'useI18n hook implemented',
      required: true,
      status: 'pending'
    },
    {
      id: 'translation_keys',
      label: 'All strings use t() function',
      required: true,
      status: 'pending'
    },
    {
      id: 'translation_files',
      label: 'en.json and es.json updated',
      required: true,
      status: 'pending'
    },
    
    // Responsive Design
    {
      id: 'responsive_tabs',
      label: 'ResponsiveTabs for tab navigation',
      required: false,
      status: 'pending'
    },
    {
      id: 'responsive_table',
      label: 'ResponsiveTable for data lists',
      required: false,
      status: 'pending'
    },
    {
      id: 'mobile_action_bar',
      label: 'MobileActionBar for actions',
      required: false,
      status: 'pending'
    },
    {
      id: 'mobile_padding',
      label: 'pb-24 padding for fixed actions',
      required: false,
      status: 'pending'
    },
    {
      id: 'input_width',
      label: 'Inputs use w-11/12 on mobile',
      required: true,
      status: 'pending'
    },
    
    // Dark Mode
    {
      id: 'dark_mode_bg',
      label: 'Dark mode backgrounds (dark:bg-gray-*)',
      required: true,
      status: 'pending'
    },
    {
      id: 'dark_mode_text',
      label: 'Dark mode text colors (dark:text-*)',
      required: true,
      status: 'pending'
    },
    
    // Primary Color
    {
      id: 'primary_color_hook',
      label: 'Primary color from localStorage',
      required: true,
      status: 'pending'
    },
    {
      id: 'primary_color_usage',
      label: 'Primary color in buttons/actions',
      required: true,
      status: 'pending'
    },
    {
      id: 'primary_color_focus',
      label: 'Primary color in focus states',
      required: true,
      status: 'pending'
    },
    
    // Navigation
    {
      id: 'breadcrumbs_desktop',
      label: 'Breadcrumbs on desktop',
      required: true,
      status: 'pending'
    },
    {
      id: 'mobile_title',
      label: 'Title header on mobile',
      required: true,
      status: 'pending'
    },
    
    // Layout
    {
      id: 'sidebar_present',
      label: 'Sidebar integration maintained',
      required: true,
      status: 'pending'
    },
    {
      id: 'mobile_first',
      label: 'Mobile-first CSS classes',
      required: true,
      status: 'pending'
    },
    {
      id: 'grid_responsive',
      label: 'Grid layouts responsive (grid-cols-2 sm:grid-cols-4)',
      required: false,
      status: 'pending'
    }
  ];

  validate(code: string): ValidationResult {
    const result: ValidationResult = {
      passed: false,
      score: 0,
      items: [...this.items],
      errors: [],
      warnings: []
    };

    // Check translations
    if (code.includes('useI18n()')) {
      this.updateItem(result, 'translations', 'passed');
    } else {
      this.updateItem(result, 'translations', 'failed', 'Missing useI18n hook');
      result.errors.push('useI18n hook not found');
    }

    if (code.includes('t(\'') || code.includes('t("')) {
      this.updateItem(result, 'translation_keys', 'passed');
    } else {
      this.updateItem(result, 'translation_keys', 'warning', 'Some strings may not be translated');
      result.warnings.push('Check if all user-facing strings use t() function');
    }

    // Check responsive components
    if (code.includes('ResponsiveTabs')) {
      this.updateItem(result, 'responsive_tabs', 'passed');
    }

    if (code.includes('ResponsiveTable')) {
      this.updateItem(result, 'responsive_table', 'passed');
    }

    if (code.includes('MobileActionBar')) {
      this.updateItem(result, 'mobile_action_bar', 'passed');
      
      // Check for padding when using fixed position
      if (code.includes('position="fixed"') || code.includes('position: \'fixed\'')) {
        if (code.includes('pb-24')) {
          this.updateItem(result, 'mobile_padding', 'passed');
        } else {
          this.updateItem(result, 'mobile_padding', 'warning', 'Fixed MobileActionBar needs pb-24 padding');
          result.warnings.push('Add pb-24 to container when using fixed MobileActionBar');
        }
      }
    }

    // Check input widths
    if (code.includes('w-11/12') || code.includes('px-4')) {
      this.updateItem(result, 'input_width', 'passed');
    } else if (code.includes('<input') || code.includes('<textarea')) {
      this.updateItem(result, 'input_width', 'warning', 'Check input widths for mobile');
      result.warnings.push('Inputs should use w-11/12 or be in px-4 container');
    }

    // Check dark mode
    if (code.includes('dark:bg-gray-')) {
      this.updateItem(result, 'dark_mode_bg', 'passed');
    } else {
      this.updateItem(result, 'dark_mode_bg', 'failed', 'Missing dark mode backgrounds');
      result.errors.push('Add dark:bg-gray-* classes for dark mode support');
    }

    if (code.includes('dark:text-')) {
      this.updateItem(result, 'dark_mode_text', 'passed');
    } else {
      this.updateItem(result, 'dark_mode_text', 'failed', 'Missing dark mode text colors');
      result.errors.push('Add dark:text-* classes for dark mode support');
    }

    // Check primary color
    if (code.includes('localStorage.getItem(\'ui-settings\')') || code.includes('primaryColor')) {
      this.updateItem(result, 'primary_color_hook', 'passed');
      
      if (code.includes('style={{ backgroundColor: primaryColor') || code.includes('style={{ color: primaryColor')) {
        this.updateItem(result, 'primary_color_usage', 'passed');
      } else {
        this.updateItem(result, 'primary_color_usage', 'warning', 'Use primaryColor in buttons');
        result.warnings.push('Apply primaryColor to main action buttons');
      }
    } else {
      this.updateItem(result, 'primary_color_hook', 'failed', 'Missing primary color setup');
      result.errors.push('Add primaryColor from localStorage');
    }

    // Check navigation
    if (code.includes('Breadcrumb') || code.includes('breadcrumb')) {
      this.updateItem(result, 'breadcrumbs_desktop', 'passed');
    } else {
      this.updateItem(result, 'breadcrumbs_desktop', 'warning', 'Consider adding breadcrumbs');
      result.warnings.push('Add breadcrumbs for desktop navigation');
    }

    if (code.includes('sm:hidden') && code.includes('text-xl')) {
      this.updateItem(result, 'mobile_title', 'passed');
    } else {
      this.updateItem(result, 'mobile_title', 'warning', 'Add mobile title header');
      result.warnings.push('Include mobile-specific title header');
    }

    // Check mobile-first patterns
    if (code.includes('flex-col sm:flex-row') || code.includes('grid-cols-2 sm:grid-cols-4')) {
      this.updateItem(result, 'mobile_first', 'passed');
    } else {
      this.updateItem(result, 'mobile_first', 'warning', 'Check mobile-first patterns');
      result.warnings.push('Use mobile-first responsive classes');
    }

    // Calculate score
    const passedItems = result.items.filter(item => item.status === 'passed').length;
    const totalRequired = result.items.filter(item => item.required).length;
    const requiredPassed = result.items.filter(item => item.required && item.status === 'passed').length;
    
    result.score = Math.round((passedItems / result.items.length) * 100);
    result.passed = requiredPassed === totalRequired && result.errors.length === 0;

    return result;
  }

  private updateItem(result: ValidationResult, id: string, status: ChecklistItem['status'], message?: string) {
    const item = result.items.find(i => i.id === id);
    if (item) {
      item.status = status;
      item.message = message;
    }
  }

  generateReport(result: ValidationResult): string {
    let report = '📋 UI VALIDATION CHECKLIST\n';
    report += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';
    
    report += `Score: ${result.score}% | Status: ${result.passed ? '✅ PASSED' : '❌ FAILED'}\n\n`;
    
    if (result.errors.length > 0) {
      report += '🔴 ERRORS (Must Fix):\n';
      result.errors.forEach(error => {
        report += `   ❌ ${error}\n`;
      });
      report += '\n';
    }
    
    if (result.warnings.length > 0) {
      report += '🟡 WARNINGS (Should Fix):\n';
      result.warnings.forEach(warning => {
        report += `   ⚠️ ${warning}\n`;
      });
      report += '\n';
    }
    
    report += '📊 CHECKLIST ITEMS:\n';
    result.items.forEach(item => {
      const icon = item.status === 'passed' ? '✅' : 
                   item.status === 'failed' ? '❌' :
                   item.status === 'warning' ? '⚠️' : '⏳';
      const required = item.required ? ' *' : '';
      report += `   ${icon} ${item.label}${required}\n`;
      if (item.message) {
        report += `      → ${item.message}\n`;
      }
    });
    
    return report;
  }
}

export const uiChecklist = new UIChecklist();