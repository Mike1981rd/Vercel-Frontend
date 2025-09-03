/**
 * Command System for Automated Page Generation
 * Implements two main commands for creating UI pages with all required patterns
 */

import { buildFromDesign, BuildFromDesignOptions } from './build-from-design';
import { createUI, CreateUIOptions } from './create-ui';

export type CommandType = 'build-from-design' | 'create-ui';

export interface CommandResult {
  success: boolean;
  command: CommandType;
  files: any[];
  validation: any;
  summary: string;
  nextSteps?: string[];
  instructions?: string[];
}

/**
 * Main command executor
 */
export class CommandExecutor {
  /**
   * Executes a command based on the type
   */
  async execute(command: CommandType, options: any): Promise<CommandResult> {
    console.clear();
    console.log('╔══════════════════════════════════════════════════════════╗');
    console.log('║     CLAUDE CODE - AUTOMATED PAGE GENERATION SYSTEM      ║');
    console.log('╚══════════════════════════════════════════════════════════╝\n');

    switch (command) {
      case 'build-from-design':
        return this.executeBuildFromDesign(options);
      
      case 'create-ui':
        return this.executeCreateUI(options);
      
      default:
        throw new Error(`Unknown command: ${command}`);
    }
  }

  /**
   * Execute /build-from-design command
   * Used when you have a design reference (image or description)
   */
  private async executeBuildFromDesign(options: BuildFromDesignOptions): Promise<CommandResult> {
    const result = await buildFromDesign.execute(options);
    
    return {
      success: result.success,
      command: 'build-from-design',
      files: result.files,
      validation: result.validation,
      summary: result.summary,
      nextSteps: result.nextSteps
    };
  }

  /**
   * Execute /create-ui command
   * Used when creating a new page from scratch
   */
  private async executeCreateUI(options: CreateUIOptions): Promise<CommandResult> {
    const result = await createUI.execute(options);
    
    return {
      success: result.success,
      command: 'create-ui',
      files: result.files,
      validation: result.validation,
      summary: result.summary,
      instructions: result.instructions
    };
  }

  /**
   * Shows available commands and their usage
   */
  showHelp(): void {
    console.log(`
╔══════════════════════════════════════════════════════════╗
║                   AVAILABLE COMMANDS                     ║
╚══════════════════════════════════════════════════════════╝

📐 /build-from-design
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Purpose: Generate a page from a design image or description
When to use: When you have a design reference to follow

Usage:
  /build-from-design --name "products" --design "path/to/design.png"
  /build-from-design --name "users" --description "user management page with table and filters"

Options:
  --name         Page name (required)
  --design       Path to design image (optional)
  --description  Text description of the page (optional)
  --features     List of features: table, tabs, form, metrics, search
  --validate     Only validate, don't generate files

Example:
  /build-from-design \\
    --name "customers" \\
    --description "customer management page" \\
    --features "table,search,filters,tabs"


🎨 /create-ui
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Purpose: Create a complete UI page from scratch
When to use: When creating a new page without a specific design

Usage:
  /create-ui --name "products" --type "list"
  /create-ui --name "dashboard" --type "dashboard" --features "metrics,charts"

Options:
  --name         Page name (required)
  --type         Page type: list, detail, dashboard, form (required)
  --features     Additional features to include
  --description  Description of the page purpose
  --auto-fix     Automatically fix validation issues
  --dry-run      Preview without creating files

Example:
  /create-ui \\
    --name "orders" \\
    --type "list" \\
    --features "table,search,export,filters" \\
    --auto-fix


📋 FEATURES AVAILABLE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• table    - Data table with ResponsiveTable component
• tabs     - Tab navigation with ResponsiveTabs
• form     - Form inputs with proper mobile patterns
• metrics  - Dashboard metrics cards (2x2 mobile grid)
• search   - Search bar with filters
• actions  - Action buttons with MobileActionBar
• export   - Export functionality
• filters  - Advanced filtering options


✅ WHAT THESE COMMANDS DO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Analyze requirements and detect needed components
2. Generate page structure with TypeScript
3. Apply responsive patterns (mobile-first)
4. Add dark mode support automatically
5. Implement i18n translations (en/es)
6. Use dynamic primary color from settings
7. Create proper breadcrumbs and navigation
8. Generate API service layer
9. Create type definitions
10. Validate against UI checklist
11. Auto-fix common issues
12. Provide clear next steps


🎯 PATTERNS AUTOMATICALLY APPLIED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Mobile-First Design
  - w-11/12 inputs on mobile
  - 2x2 grid for metrics
  - Vertical tabs on mobile
  - Cards instead of tables

✓ Responsive Components
  - ResponsiveTabs
  - ResponsiveTable
  - MobileActionBar

✓ UI Standards
  - Dark mode classes
  - Dynamic primary color
  - i18n translations
  - Breadcrumbs/Mobile title
  - Focus states with primary color

✓ Code Quality
  - TypeScript types
  - API service layer
  - Proper file structure
  - Validation checks


💡 TIPS FOR BEST RESULTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Be specific with descriptions
2. List all features you need upfront
3. Use --dry-run to preview first
4. Enable --auto-fix for faster development
5. Always test on mobile viewports
6. Update translations after generation
7. Connect to your API endpoints
    `);
  }

  /**
   * Validates command options
   */
  validateOptions(command: CommandType, options: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    switch (command) {
      case 'build-from-design':
        if (!options.pageName) {
          errors.push('--name is required');
        }
        if (!options.designPath && !options.description) {
          errors.push('Either --design or --description is required');
        }
        break;

      case 'create-ui':
        if (!options.name) {
          errors.push('--name is required');
        }
        if (!options.type) {
          errors.push('--type is required (list, detail, dashboard, or form)');
        }
        if (options.type && !['list', 'detail', 'dashboard', 'form'].includes(options.type)) {
          errors.push('--type must be one of: list, detail, dashboard, form');
        }
        break;
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

// Export singleton instance
export const commandExecutor = new CommandExecutor();

// Export command functions for direct use
export { buildFromDesign, createUI };
export type { BuildFromDesignOptions, CreateUIOptions };