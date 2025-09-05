/**
 * Design Analyzer
 * Analyzes design references to extract components and patterns
 */

export interface DesignAnalysis {
  components: string[];
  layoutType: 'list' | 'detail' | 'dashboard' | 'form';
  mobilePatterns: string[];
  hasTable: boolean;
  hasTabs: boolean;
  hasForm: boolean;
  hasMetrics: boolean;
  hasActions: boolean;
  estimatedComplexity: 'simple' | 'medium' | 'complex';
  suggestedComponents: ComponentSuggestion[];
}

export interface ComponentSuggestion {
  type: string;
  component: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
}

export class DesignAnalyzer {
  /**
   * Analyzes a design image path (if provided) or description
   */
  async analyzeDesign(imagePath?: string, description?: string): Promise<DesignAnalysis> {
    // If image path is provided, we would analyze the image
    // For now, we'll use text analysis
    const text = (description || '').toLowerCase();
    
    const analysis: DesignAnalysis = {
      components: [],
      layoutType: this.detectLayoutType(text),
      mobilePatterns: [],
      hasTable: false,
      hasTabs: false,
      hasForm: false,
      hasMetrics: false,
      hasActions: true, // Default to true
      estimatedComplexity: 'simple',
      suggestedComponents: []
    };

    // Detect components based on keywords
    if (text.includes('table') || text.includes('list') || text.includes('grid')) {
      analysis.hasTable = true;
      analysis.components.push('table');
      analysis.suggestedComponents.push({
        type: 'table',
        component: 'ResponsiveTable',
        reason: 'Data list detected - converts to cards on mobile',
        priority: 'high'
      });
    }

    if (text.includes('tab') || text.includes('section') || text.includes('pestana')) {
      analysis.hasTabs = true;
      analysis.components.push('tabs');
      analysis.suggestedComponents.push({
        type: 'tabs',
        component: 'ResponsiveTabs',
        reason: 'Tab navigation detected - vertical on mobile',
        priority: 'high'
      });
    }

    if (text.includes('form') || text.includes('input') || text.includes('field') || text.includes('edit')) {
      analysis.hasForm = true;
      analysis.components.push('form');
      analysis.mobilePatterns.push('inputs-w-11/12');
    }

    if (text.includes('metric') || text.includes('dashboard') || text.includes('stat') || text.includes('kpi')) {
      analysis.hasMetrics = true;
      analysis.components.push('metrics');
      analysis.mobilePatterns.push('grid-2x2');
    }

    if (text.includes('search') || text.includes('filter') || text.includes('buscar')) {
      analysis.components.push('search');
    }

    if (text.includes('button') || text.includes('action') || text.includes('save') || text.includes('submit')) {
      analysis.hasActions = true;
      analysis.components.push('actions');
      analysis.suggestedComponents.push({
        type: 'actions',
        component: 'MobileActionBar',
        reason: 'Action buttons detected - fixed bar on mobile',
        priority: 'high'
      });
    }

    // Detect mobile patterns needed
    if (analysis.hasTable) {
      analysis.mobilePatterns.push('table-to-cards');
    }
    if (analysis.hasTabs) {
      analysis.mobilePatterns.push('tabs-to-vertical');
    }
    if (analysis.hasActions) {
      analysis.mobilePatterns.push('fixed-action-bar');
    }

    // Calculate complexity
    const componentCount = analysis.components.length;
    if (componentCount <= 2) {
      analysis.estimatedComplexity = 'simple';
    } else if (componentCount <= 4) {
      analysis.estimatedComplexity = 'medium';
    } else {
      analysis.estimatedComplexity = 'complex';
    }

    return analysis;
  }

  /**
   * Detects the primary layout type from description
   */
  private detectLayoutType(text: string): DesignAnalysis['layoutType'] {
    if (text.includes('dashboard') || text.includes('overview') || text.includes('metric')) {
      return 'dashboard';
    }
    if (text.includes('form') || text.includes('create') || text.includes('edit') || text.includes('new')) {
      return 'form';
    }
    if (text.includes('detail') || text.includes('view') || text.includes('profile')) {
      return 'detail';
    }
    return 'list'; // Default to list view
  }

  /**
   * Analyzes existing code to find missing patterns
   */
  analyzeExistingCode(code: string): {
    missingPatterns: string[];
    suggestions: string[];
  } {
    const missingPatterns: string[] = [];
    const suggestions: string[] = [];

    // Check for responsive components
    if (code.includes('<table') && !code.includes('ResponsiveTable')) {
      missingPatterns.push('ResponsiveTable');
      suggestions.push('Replace <table> with <ResponsiveTable> for mobile support');
    }

    if (code.includes('tab') && !code.includes('ResponsiveTabs')) {
      missingPatterns.push('ResponsiveTabs');
      suggestions.push('Use ResponsiveTabs for better mobile experience');
    }

    // Check for mobile patterns
    if (code.includes('button') && !code.includes('MobileActionBar')) {
      missingPatterns.push('MobileActionBar');
      suggestions.push('Consider using MobileActionBar for action buttons');
    }

    if (code.includes('fixed') && !code.includes('pb-24')) {
      suggestions.push('Add pb-24 padding to container when using fixed elements');
    }

    // Check for dark mode
    if (!code.includes('dark:')) {
      missingPatterns.push('dark-mode');
      suggestions.push('Add dark mode classes (dark:bg-gray-*, dark:text-*)');
    }

    // Check for translations
    if (!code.includes('useI18n')) {
      missingPatterns.push('i18n');
      suggestions.push('Implement useI18n hook for translations');
    }

    return { missingPatterns, suggestions };
  }

  /**
   * Generates component recommendations based on analysis
   */
  generateRecommendations(analysis: DesignAnalysis): string[] {
    const recommendations: string[] = [];

    if (analysis.hasTable) {
      recommendations.push(
        '📊 Use ResponsiveTable component - Automatically converts to cards on mobile'
      );
    }

    if (analysis.hasTabs) {
      recommendations.push(
        '📑 Use ResponsiveTabs component - Vertical stack on mobile, horizontal on desktop'
      );
    }

    if (analysis.hasForm) {
      recommendations.push(
        '📝 Apply w-11/12 width to inputs on mobile for better spacing'
      );
      recommendations.push(
        '🎯 Use primary color for input focus states'
      );
    }

    if (analysis.hasMetrics) {
      recommendations.push(
        '📈 Use 2x2 grid on mobile, 4 columns on desktop for metrics'
      );
    }

    if (analysis.hasActions) {
      recommendations.push(
        '🎬 Use MobileActionBar for bottom-fixed actions on mobile'
      );
      recommendations.push(
        '📱 Add pb-24 padding to container when using fixed action bar'
      );
    }

    recommendations.push(
      '🌐 Implement useI18n hook for all user-facing text',
      '🌙 Add dark mode classes to all elements',
      '🎨 Use dynamic primary color from localStorage',
      '🧭 Include breadcrumbs on desktop, title on mobile'
    );

    return recommendations;
  }
}

// Export singleton instance
export const designAnalyzer = new DesignAnalyzer();