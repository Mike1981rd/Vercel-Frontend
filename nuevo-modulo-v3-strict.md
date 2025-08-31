# COMANDO /nuevo-modulo-v3 - VERSIÓN ULTRA ESTRICTA

## 🛑 STOP - PROCESO DE PRE-VALIDACIÓN OBLIGATORIO

### PASO 0: NO ESCRIBAS CÓDIGO AÚN

```
RESPONDE ESTAS PREGUNTAS PRIMERO:
1. ¿Nombre del módulo? _____________
2. ¿Tiene items hijos? (Sí/No) _____
3. ¿Necesita drag & drop? (Sí/No) ___

AHORA LEE ESTOS DOCUMENTOS:
□ docs/WEBSITE-BUILDER-MODULE-GUIDE.md
□ docs/implementations/features/2025-01-live-preview.md
□ docs/implementations/features/2025-01-typography-header.md

VERIFICA PATRONES EXISTENTES:
□ src/components/preview/PreviewGallery.tsx (referencia)
□ src/components/editor/modules/Gallery/types.ts (estructura)

¿COMPLETASTE TODO? → CONTINÚA
¿FALTA ALGO? → DETENTE Y COMPLETA
```

## 📋 FASE 1: ESTRUCTURA BASE (30 min)

### 1.1 CREAR ARCHIVOS - COPIAR Y PEGAR EXACTO

#### A. types.ts - COPIAR ESTE TEMPLATE EXACTO
```typescript
/**
 * @file types.ts
 * @max-lines 150
 * @module [ModuleName]
 */

export interface [ModuleName]Config {
  // SIEMPRE INCLUIR ESTOS 15 CAMPOS BASE
  enabled: boolean;
  colorScheme: string; // '1' - '5'
  colorBackground: boolean;
  width: 'extra_small' | 'screen' | 'page' | 'large' | 'medium' | 'small';
  heading?: string;
  headingSize: string; // 'heading_1' - 'heading_6'
  body?: string;
  bodySize: string; // 'body_1' - 'body_5'
  addSidePaddings: boolean;
  topPadding: number;
  bottomPadding: number;
  customCss?: string;
  
  // SI TIENE BOTÓN
  button?: {
    label?: string;
    link?: string;
    style: 'solid' | 'outline' | 'text';
  };
  
  // SI TIENE HIJOS
  items: [ModuleName]ItemConfig[];
  
  // CAMPOS ESPECÍFICOS DEL MÓDULO (agregar aquí)
}

export interface [ModuleName]ItemConfig {
  id: string;
  visible: boolean;
  sortOrder: number;
  heading?: string;
  source?: string;
  // CAMPOS ESPECÍFICOS DEL ITEM
}

export function getDefault[ModuleName]Config(): [ModuleName]Config {
  return {
    enabled: true,
    colorScheme: '1',
    colorBackground: false,
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

### 📍 CHECKPOINT 1.1
```bash
# EJECUTAR AHORA:
cat src/components/editor/modules/[ModuleName]/types.ts | wc -l
# DEBE ser < 150 líneas
# SI NO → Dividir en múltiples archivos
```

#### B. Preview[ModuleName].tsx - COPIAR EXACTO
```typescript
/**
 * @file Preview[ModuleName].tsx
 * @max-lines 400
 * @module [ModuleName]
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
  
  // 🔴 COPIAR EXACTO - NO MODIFICAR
  const storeThemeConfig = useThemeConfigStore(state => state.config);
  const themeConfig = theme || storeThemeConfig;
  
  // 🔴 COPIAR EXACTO - PATRÓN CANÓNICO MÓVIL
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
  
  // 🔴 COPIAR EXACTO - COLOR SCHEME
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
  
  // 🔴 COPIAR EXACTO - TYPOGRAPHY HEADINGS
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
  
  // 🔴 COPIAR EXACTO - TYPOGRAPHY BODY
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
  
  // 🔴 REGLA CRÍTICA - VALIDACIÓN DESPUÉS DE HOOKS
  if (config?.enabled === false && !isEditor) {
    return null;
  }
  
  const visibleItems = config?.items?.filter(item => item.visible) || [];
  
  return (
    <section
      style={{
        paddingTop: `${config.topPadding}px`,
        paddingBottom: `${config.bottomPadding}px`,
        backgroundColor: config.colorBackground ? colorScheme.background : 'transparent',
      }}
    >
      {/* IMPLEMENTAR AQUÍ */}
    </section>
  );
}
```

### 📍 CHECKPOINT 1.2
```bash
# VERIFICAR:
grep -c "COPIAR EXACTO" src/components/preview/Preview[ModuleName].tsx
# DEBE ser >= 5
# SI NO → No modificaste el código base
```

## 📋 FASE 2: INTEGRACIONES (45 min)

### 2.1 INTEGRACIÓN EN editor.types.ts

#### BUSCAR la línea exacta:
```bash
grep -n "export enum SectionType" src/types/editor.types.ts
```

#### AGREGAR en la posición correcta:
```typescript
[MODULE_NAME] = '[module_name]',
```

#### BUSCAR SECTION_CONFIGS:
```bash
grep -n "SECTION_CONFIGS" src/types/editor.types.ts
```

#### AGREGAR:
```typescript
[SectionType.[MODULE_NAME]]: getDefault[ModuleName]Config(),
```

### 📍 CHECKPOINT 2.1
```bash
# VERIFICAR:
grep -c "[MODULE_NAME]" src/types/editor.types.ts
# DEBE ser >= 2
```

### 2.2 INTEGRACIÓN EN EditorPreview.tsx

#### BUSCAR línea de imports de Preview:
```bash
grep -n "import Preview" src/components/editor/EditorPreview.tsx | head -5
```

#### AGREGAR import:
```typescript
import Preview[ModuleName] from '@/components/preview/Preview[ModuleName]';
```

#### BUSCAR switch de renderSection:
```bash
grep -n "case SectionType" src/components/editor/EditorPreview.tsx | tail -5
```

#### AGREGAR caso ANTES del default:
```typescript
case SectionType.[MODULE_NAME]:
  const [moduleName]Config = section.settings || {};
  if (![moduleName]Config.items) {
    [moduleName]Config.items = [];
  }
  return (
    <Preview[ModuleName]
      config={[moduleName]Config}
      theme={themeConfig}
      deviceView={deviceView}
      isEditor={true}
    />
  );
```

### 📍 CHECKPOINT 2.2
```bash
# PROBAR EN EDITOR:
echo "1. Agregar módulo desde AddSectionModal"
echo "2. ¿Se ve en el preview? (Sí/No)"
# SI NO → Revisar el caso en EditorPreview
```

### 2.3 INTEGRACIÓN EN PreviewContent.tsx

#### AGREGAR en getSectionType (línea ~98):
```typescript
if (t === '[ModuleName]' || t === '[module_name]') return '[module_name]';
```

#### AGREGAR render (línea ~220):
```typescript
{getSectionType(section) === '[module_name]' && (
  <Preview[ModuleName] 
    config={getSectionConfig(section)} 
    theme={theme}
    deviceView={deviceView}
    isEditor={false}
  />
)}
```

### 📍 CHECKPOINT 2.3
```bash
# GUARDAR y PROBAR:
echo "1. Guardar página en editor"
echo "2. Abrir /preview/home"
echo "3. ¿Se ve el módulo? (Sí/No)"
# SI NO → Verificar logs en consola
```

### 2.4 MAPEO DE TIPOS EN useEditorStore.ts

#### BUSCAR typeMapping:
```bash
grep -n "typeMapping.*{" src/stores/useEditorStore.ts
```

#### AGREGAR en el objeto:
```typescript
'[module_name]': '[ModuleName]',
```

### 📍 CHECKPOINT 2.4
```bash
# VERIFICAR EN CONSOLA:
echo "Al guardar, buscar en console:"
echo "[DEBUG] Attempting to save to backend"
echo "Debe mostrar sectionType: '[ModuleName]'"
```

## 📋 FASE 3: EDITOR Y CHILDREN (SI APLICA) (30 min)

### 3.1 CREAR [ModuleName]Editor.tsx
```typescript
// USAR TEMPLATE DE FAQEditor.tsx COMO BASE
// CAMBIAR TODOS LOS "FAQ" por "[ModuleName]"
```

### 3.2 SI TIENE HIJOS - CREAR [ModuleName]Children.tsx
```typescript
// COPIAR EXACTO DE FAQChildren.tsx
// CAMBIAR:
// - FAQ → [ModuleName]
// - ':child:' → MANTENER ':child:' (NO CAMBIAR)
```

### 3.3 INTEGRAR EN ConfigPanel.tsx

#### BUSCAR detección de items (línea ~99):
```bash
grep -n "isFAQItem" src/components/editor/ConfigPanel.tsx
```

#### AGREGAR DESPUÉS:
```typescript
const is[ModuleName]Item = selectedSectionId?.includes(':child:') && 
  Object.values(sections).flat().find(s => s.id === selectedSectionId?.split(':child:')[0])?.type === SectionType.[MODULE_NAME];
```

#### AGREGAR return (línea ~230):
```typescript
if (is[ModuleName]Item) {
  const sectionId = getFAQSectionId();
  const itemId = getFAQItemId();
  if (sectionId && itemId) {
    return <[ModuleName]ItemEditor sectionId={sectionId} itemId={itemId} />;
  }
}
```

### 📍 CHECKPOINT 3
```bash
# PROBAR HIJOS:
echo "1. ¿Puedes agregar items?"
echo "2. ¿Abre la configuración del item?"
echo "3. ¿Puedes reordenar con drag & drop?"
# TODOS SÍ → Continuar
```

## 📋 FASE 4: VALIDACIÓN FINAL (15 min)

### CHECKLIST OBLIGATORIO - MARCAR CADA UNO:
```
EDITOR:
□ Módulo aparece en AddSectionModal
□ Configuración padre abre y guarda
□ Preview se actualiza en tiempo real
□ Color schemes funcionan (1-5)
□ Typography se aplica
□ Paddings funcionan
□ Width funciona

HIJOS (si aplica):
□ Agregar item funciona
□ Configuración hijo abre
□ Drag & drop funciona
□ Eliminar item funciona
□ Visibilidad toggle funciona

PREVIEW REAL:
□ Se ve en /preview/home
□ Responsive móvil funciona
□ Hover usa color del theme
□ Todos los estilos se aplican

CÓDIGO:
□ 0 errores en consola
□ 0 warnings TypeScript
□ Archivos < 300 líneas
```

## 🚨 ERRORES CRÍTICOS Y SOLUCIONES

### ERROR: "No se ve en preview real"
```typescript
// VERIFICAR enabled check:
if (config?.enabled === false && !isEditor) // ✅ CORRECTO
if (!config?.enabled && !isEditor) // ❌ INCORRECTO - esto ocultará si enabled es undefined

// EXPLICACIÓN: En preview real, config.enabled puede ser undefined
// Solo ocultar si está EXPLÍCITAMENTE deshabilitado (false)
// Si enabled es undefined, el módulo DEBE mostrarse
```

### ERROR: "Hover con color incorrecto"
```typescript
// USAR:
onMouseEnter={(e) => {
  const hoverColor = colorScheme.text || '#000000';
  e.currentTarget.style.backgroundColor = `${hoverColor}10`;
}}
```

### ERROR: "No abre config de hijos"
```
SIEMPRE usar ':child:' no ':item:'
```

## 🎯 TIEMPO ESTIMADO: 2 HORAS MÁXIMO

- Fase 1: 30 min
- Fase 2: 45 min  
- Fase 3: 30 min
- Fase 4: 15 min

**SI TOMA MÁS DE 2 HORAS → ALGO ESTÁ MAL**

## 🔴 REGLA FINAL

**NO IMPROVISES. NO ASUMAS. SIGUE EL COMANDO EXACTO.**

Si algo no está claro, PREGUNTA antes de continuar.