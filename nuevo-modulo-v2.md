# COMANDO /nuevo-modulo-v2 - VERSIÓN MEJORADA Y ESTRICTA

## 🔴 VALIDACIÓN PRE-EJECUCIÓN OBLIGATORIA

Antes de ejecutar CUALQUIER código, DEBES:

1. **CONFIRMAR con el usuario**:
   ```
   ¿Cuál es el nombre del módulo? (ej: FAQ, Testimonials, Newsletter)
   ¿El módulo tiene items hijos? (Sí/No)
   ¿Necesita drag & drop para reordenar? (Sí/No)
   ```

2. **EJECUTAR CHECKLIST AUTOMÁTICO**:
   ```bash
   # OBLIGATORIO - Verificar estructura
   ls -la src/components/editor/modules/
   ls -la src/components/preview/
   grep -r "SectionType\." src/types/editor.types.ts
   ```

## 📋 ESTRUCTURA OBLIGATORIA DEL MÓDULO

### ARCHIVOS REQUERIDOS (NO OPCIONALES)
```
src/components/
├── editor/
│   └── modules/
│       └── [ModuleName]/
│           ├── types.ts                    ✅ OBLIGATORIO
│           ├── [ModuleName]Editor.tsx      ✅ OBLIGATORIO
│           ├── [ModuleName]Children.tsx    ✅ SI tiene hijos
│           └── [ModuleName]ItemEditor.tsx  ✅ SI tiene hijos
└── preview/
    └── Preview[ModuleName].tsx             ✅ OBLIGATORIO
```

## 🎯 PLANTILLA BASE - types.ts

```typescript
/**
 * @file types.ts
 * @max-lines 150
 * @module [ModuleName]
 * @description Tipos y configuraciones para [ModuleName]
 */

export interface [ModuleName]Config {
  // OBLIGATORIOS SIEMPRE
  enabled: boolean;
  colorScheme: string; // '1' - '5'
  
  // Layout
  width: 'extra_small' | 'screen' | 'page' | 'large' | 'medium' | 'small';
  layout?: string;
  
  // Content
  heading?: string;
  headingSize: string; // 'heading_1' - 'heading_6'
  body?: string;
  bodySize: string; // 'body_1' - 'body_5'
  
  // Button (opcional)
  button?: {
    label?: string;
    link?: string;
    style: 'solid' | 'outline' | 'text';
  };
  
  // Paddings
  addSidePaddings: boolean;
  topPadding: number;
  bottomPadding: number;
  
  // Custom CSS
  customCss?: string;
  
  // Items (si tiene hijos)
  items: [ModuleName]ItemConfig[];
}

export interface [ModuleName]ItemConfig {
  id: string;
  visible: boolean;
  sortOrder: number;
  // Campos específicos del item
}

export function getDefault[ModuleName]Config(): [ModuleName]Config {
  return {
    enabled: true,
    colorScheme: '1',
    width: 'page',
    headingSize: 'heading_3',
    bodySize: 'body_3',
    addSidePaddings: true,
    topPadding: 40,
    bottomPadding: 40,
    items: []
  };
}

export function getDefault[ModuleName]ItemConfig(): [ModuleName]ItemConfig {
  return {
    id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    visible: true,
    sortOrder: 0
  };
}
```

## 🎯 PLANTILLA BASE - Preview[ModuleName].tsx

```typescript
/**
 * @file Preview[ModuleName].tsx
 * @max-lines 400
 * @module [ModuleName]
 * @description Componente Preview UNIFICADO para editor y preview real
 * @unified-architecture true
 */

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import useThemeConfigStore from '@/stores/useThemeConfigStore';
import { [ModuleName]Config } from '@/components/editor/modules/[ModuleName]/types';

interface Preview[ModuleName]Props {
  config: [ModuleName]Config;
  theme?: any;
  deviceView?: 'desktop' | 'mobile';
  isEditor?: boolean;
}

export default function Preview[ModuleName]({ 
  config, 
  theme,
  deviceView,
  isEditor = false
}: Preview[ModuleName]Props) {
  
  // 🎯 PATRÓN DUAL: Theme desde prop o store
  const storeThemeConfig = useThemeConfigStore(state => state.config);
  const themeConfig = theme || storeThemeConfig;
  
  // 🔴 PATRÓN CANÓNICO DE DETECCIÓN MÓVIL
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (deviceView !== undefined) return deviceView === 'mobile';
    if (typeof window !== 'undefined') return window.innerWidth < 768;
    return false;
  });
  
  useEffect(() => {
    if (deviceView !== undefined) {
      setIsMobile(deviceView === 'mobile');
      return;
    }
    const onResize = () => setIsMobile(window.innerWidth < 768);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [deviceView]);
  
  // Color scheme - ESTRUCTURA PLANA
  const colorScheme = useMemo(() => {
    if (!themeConfig?.colorSchemes?.schemes) {
      return {
        text: '#000000',
        background: '#FFFFFF',
        solidButton: '#000000',
        solidButtonText: '#FFFFFF',
        outlineButton: '#000000',
        outlineButtonText: '#000000',
      };
    }
    
    const schemeIndex = parseInt(config.colorScheme || '1') - 1;
    const selectedScheme = themeConfig.colorSchemes.schemes[schemeIndex];
    return selectedScheme || themeConfig.colorSchemes.schemes[0];
  }, [themeConfig, config.colorScheme]);
  
  // Typography para headings
  const headingTypographyStyles = useMemo(() => {
    if (!themeConfig?.typography?.headings) return {};
    
    const typography = themeConfig.typography.headings;
    return {
      fontFamily: `'${typography.fontFamily}', sans-serif`,
      fontWeight: typography.fontWeight || '700',
      textTransform: typography.useUppercase ? 'uppercase' as const : 'none' as const,
      fontSize: typography.fontSize ? 
        (typography.fontSize <= 100 ? 
          `${typography.fontSize}%` : 
          `${typography.fontSize}px`) : '100%',
      letterSpacing: `${typography.letterSpacing || 0}px`
    };
  }, [themeConfig?.typography?.headings]);
  
  // Typography para body
  const bodyTypographyStyles = useMemo(() => {
    if (!themeConfig?.typography?.body) return {};
    
    const typography = themeConfig.typography.body;
    return {
      fontFamily: `'${typography.fontFamily}', sans-serif`,
      fontWeight: typography.fontWeight || '400',
      textTransform: typography.useUppercase ? 'uppercase' as const : 'none' as const,
      fontSize: typography.fontSize ? 
        (typography.fontSize <= 100 ? 
          `${typography.fontSize}%` : 
          `${typography.fontSize}px`) : '100%',
      letterSpacing: `${typography.letterSpacing || 0}px`
    };
  }, [themeConfig?.typography?.body]);
  
  // TODOS LOS HOOKS ANTES DE RETURNS CONDICIONALES
  
  // ⚠️ CRÍTICO: Solo ocultar si está EXPLÍCITAMENTE deshabilitado (false)
  // NO ocultar si enabled es undefined (caso común en preview real)
  if (config?.enabled === false && !isEditor) {
    return null;
  }
  
  const visibleItems = config.items?.filter(item => item.visible) || [];
  
  return (
    <section
      style={{
        paddingTop: `${config.topPadding}px`,
        paddingBottom: `${config.bottomPadding}px`,
        backgroundColor: config.colorBackground ? colorScheme.background : 'transparent',
      }}
    >
      {/* Contenido del módulo */}
    </section>
  );
}
```

## 📝 CHECKLIST DE INTEGRACIÓN OBLIGATORIO

### 1. TIPOS (editor.types.ts)
```typescript
// ✅ AGREGAR en enum SectionType
export enum SectionType {
  // ... otros tipos
  [MODULE_NAME] = '[module_name]', // ✅ OBLIGATORIO
}

// ✅ AGREGAR en SECTION_CONFIGS
export const SECTION_CONFIGS = {
  // ... otras configs
  [SectionType.[MODULE_NAME]]: {
    ...getDefault[ModuleName]Config(),
  },
};
```

### 2. EDITOR PREVIEW (EditorPreview.tsx)
```typescript
// ✅ IMPORTAR
import Preview[ModuleName] from '@/components/preview/Preview[ModuleName]';

// ✅ AGREGAR CASO en renderSection()
case SectionType.[MODULE_NAME]:
  return (
    <Preview[ModuleName]
      config={section.settings}
      theme={themeConfig}
      deviceView={deviceView}
      isEditor={true}
    />
  );
```

### 3. CONFIG PANEL (ConfigPanel.tsx)
```typescript
// ✅ IMPORTAR
import [ModuleName]Editor from './modules/[ModuleName]/[ModuleName]Editor';
import [ModuleName]ItemEditor from './modules/[ModuleName]/[ModuleName]ItemEditor'; // SI tiene hijos

// ✅ AGREGAR detección de hijos (SI APLICA)
const is[ModuleName]Item = selectedSectionId?.includes(':child:') && 
  Object.values(sections).flat().find(s => s.id === selectedSectionId?.split(':child:')[0])?.type === SectionType.[MODULE_NAME];

// ✅ AGREGAR return para hijos (SI APLICA)
if (is[ModuleName]Item) {
  const sectionId = selectedSectionId.split(':child:')[0];
  const itemId = selectedSectionId.split(':child:')[1];
  return <[ModuleName]ItemEditor sectionId={sectionId} itemId={itemId} />;
}

// ✅ AGREGAR caso en renderConfigFields()
case SectionType.[MODULE_NAME]:
  return <[ModuleName]Editor sectionId={section.id} />;
```

### 4. SIDEBAR CON DND (EditorSidebarWithDnD.tsx)
```typescript
// ✅ IMPORTAR (SI tiene hijos)
import [ModuleName]Children from './modules/[ModuleName]/[ModuleName]Children';

// ✅ AGREGAR virtual section (SI tiene hijos)
} else if (parentSection?.type === SectionType.[MODULE_NAME]) {
  selectedSection = {
    id: selectedSectionId,
    type: '[MODULE_NAME]_ITEM' as any,
    name: '[ModuleName] Item',
    visible: true,
    settings: parentSection?.settings || {},
    sortOrder: 0
  } as any;
}

// ✅ AGREGAR children render (SI tiene hijos)
{section.type === SectionType.[MODULE_NAME] && section.visible && (
  <[ModuleName]Children 
    section={section}
    groupId={group.id}
  />
)}
```

### 5. PREVIEW CONTENT (PreviewContent.tsx)
```typescript
// ✅ IMPORTAR
import Preview[ModuleName] from './Preview[ModuleName]';

// ✅ AGREGAR caso en getSectionType()
if (t === '[ModuleName]' || t === '[module_name]') return '[module_name]';

// ✅ AGREGAR render
{getSectionType(section) === '[module_name]' && (
  <Preview[ModuleName] 
    config={getSectionConfig(section)} 
    theme={theme}
    deviceView={deviceView}
    isEditor={false}
  />
)}
```

### 6. ADD SECTION MODAL (AddSectionModal.tsx)
```typescript
// ✅ AGREGAR en AVAILABLE_SECTIONS
{
  type: SectionType.[MODULE_NAME],
  name: '[Module Name]',
  description: '[Descripción del módulo]',
  icon: [IconName],
  category: 'content', // o 'media' o 'commerce'
},
```

## 🔴 VALIDACIÓN POST-IMPLEMENTACIÓN

### EJECUTAR OBLIGATORIAMENTE:
```bash
# 1. Verificar archivos creados
ls -la src/components/editor/modules/[ModuleName]/
ls -la src/components/preview/Preview[ModuleName].tsx

# 2. Verificar integraciones
grep -r "[ModuleName]" src/components/editor/EditorPreview.tsx
grep -r "[ModuleName]" src/components/editor/ConfigPanel.tsx
grep -r "[ModuleName]" src/components/preview/PreviewContent.tsx
grep -r "[MODULE_NAME]" src/types/editor.types.ts

# 3. Verificar que no hay errores TypeScript
npm run type-check

# 4. Test en editor
echo "
PRUEBAS MANUALES OBLIGATORIAS:
[ ] Agregar módulo desde AddSectionModal
[ ] Configuración padre abre correctamente
[ ] Configuración guarda y persiste
[ ] Preview en editor se actualiza
[ ] Si tiene hijos:
    [ ] Agregar item hijo
    [ ] Editar item hijo
    [ ] Reordenar items con drag & drop
    [ ] Eliminar item
[ ] Preview real funciona (/preview/home)
[ ] Responsive móvil funciona
[ ] Color schemes se aplican
[ ] Typography se aplica
"
```

## ❌ ERRORES COMUNES Y SOLUCIONES

### Error: "No se ve en preview real"
✅ Verificar PreviewContent.tsx tiene el caso agregado
✅ Verificar que el tipo se normaliza correctamente
✅ Verificar que se está guardando en BD con el mapeo correcto
✅ **CRÍTICO**: Verificar que `enabled` check es correcto:
   - ✅ CORRECTO: `if (config?.enabled === false && !isEditor)`
   - ❌ INCORRECTO: `if (!config?.enabled && !isEditor)`
   - Razón: En preview real, `config.enabled` puede ser `undefined`
   - Solo ocultar si está EXPLÍCITAMENTE deshabilitado (`false`)

### CRÍTICO: Mapeo de tipos para Backend
El backend espera PascalCase, agregar en `useEditorStore.ts`:
```typescript
const typeMapping: { [key: string]: string } = {
  'announcement_bar': 'AnnouncementBar',
  'header': 'Header',
  'image_banner': 'ImageBanner',
  'slideshow': 'Slideshow',
  'multicolumns': 'Multicolumns',
  'image_with_text': 'ImageWithText',
  'gallery': 'Gallery',
  'featured_collection': 'FeaturedCollection',
  'faq': 'FAQ',
  '[module_name]': '[ModuleName]', // AGREGAR TU MÓDULO
  'footer': 'Footer'
};

// Enviar ambos campos para compatibilidad
return {
  type: s.type,
  sectionType: typeMapping[s.type] || s.type,
  settings: s.settings,
  config: s.settings // Backend puede usar 'config' en vez de 'settings'
};
```

### Error: "No abre configuración de hijos"
✅ Usar formato `:child:` no `:item:`
✅ Crear virtual section en EditorSidebarWithDnD
✅ Detectar correctamente en ConfigPanel

### Error: "Abre en página completa"
✅ Usar `w-80` en el contenedor principal
✅ Incluir `border-r border-gray-200`

### Error: "Color scheme no funciona"
✅ Usar estructura PLANA: `colorScheme.text` no `colorScheme.text.default`
✅ Aplicar con style inline, no clases Tailwind dinámicas

### Error: "Typography no se aplica"
✅ Importar useThemeConfigStore correctamente (default import)
✅ Usar useMemo para los estilos
✅ Aplicar con spread operator: `...headingTypographyStyles`

## 📊 MÉTRICAS DE ÉXITO

✅ 0 errores TypeScript
✅ 0 errores en consola
✅ 100% de funcionalidades trabajando
✅ Color schemes aplicándose
✅ Typography aplicándose
✅ Responsive funcionando
✅ Preview real funcionando

## 🚀 COMANDO DE EJECUCIÓN

Para usar este comando:
```
/nuevo-modulo-v2 [NombreDelMódulo]
```

IMPORTANTE: Este comando DEBE seguirse AL PIE DE LA LETRA sin excepciones.