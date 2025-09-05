# COMANDO /nuevo-modulo - VERSIÓN DEFINITIVA

## ⚠️ ESTE ES EL ÚNICO COMANDO QUE DEBES USAR

### REEMPLAZA A:
- ❌ /nuevo-modulo (obsoleto)
- ❌ /nuevo-modulo-v2 (obsoleto)
- ❌ /nuevo-modulo-v3-strict (obsoleto)

## 🛑 PROCESO OBLIGATORIO - NO SALTARSE PASOS

### PASO 1: PREGUNTAR AL USUARIO
```
1. ¿Nombre del módulo? _____________
2. ¿Tiene items hijos? (Sí/No) _____
3. ¿Necesita drag & drop? (Sí/No) ___
```

### PASO 2: LEER DOCUMENTACIÓN
```bash
# EJECUTAR ESTOS COMANDOS:
cat docs/WEBSITE-BUILDER-MODULE-GUIDE.md | head -50
cat docs/implementations/features/2025-01-live-preview.md | head -50
cat src/components/preview/PreviewGallery.tsx | head -100
```

### PASO 3: CREAR ESTRUCTURA
```
src/components/
├── editor/modules/[ModuleName]/
│   ├── types.ts
│   ├── [ModuleName]Editor.tsx
│   ├── [ModuleName]Children.tsx    (SI tiene hijos)
│   └── [ModuleName]ItemEditor.tsx  (SI tiene hijos)
└── preview/
    └── Preview[ModuleName].tsx
```

## 📝 CÓDIGO BASE - COPIAR EXACTO

### types.ts
```typescript
export interface [ModuleName]Config {
  enabled: boolean;
  colorScheme: string; // '1' - '5'
  colorBackground: boolean;
  width: 'extra_small' | 'screen' | 'page' | 'large' | 'medium' | 'small';
  heading?: string;
  headingSize: string;
  body?: string;
  bodySize: string;
  addSidePaddings: boolean;
  topPadding: number;
  bottomPadding: number;
  customCss?: string;
  items: [ModuleName]ItemConfig[]; // SI tiene hijos
}
```

### Preview[ModuleName].tsx - PLANTILLA CRÍTICA
```typescript
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import useThemeConfigStore from '@/stores/useThemeConfigStore';

export default function Preview[ModuleName]({ config, theme, deviceView, isEditor = false }) {
  
  // 1. THEME (obligatorio)
  const storeThemeConfig = useThemeConfigStore(state => state.config);
  const themeConfig = theme || storeThemeConfig;
  
  // 2. MOBILE DETECTION (copiar exacto)
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
  
  // 3. COLOR SCHEME (estructura PLANA)
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
    return themeConfig.colorSchemes.schemes[schemeIndex] || themeConfig.colorSchemes.schemes[0];
  }, [themeConfig, config.colorScheme]);
  
  // 4. TYPOGRAPHY
  const headingTypographyStyles = useMemo(() => {
    if (!themeConfig?.typography?.headings) return {};
    const typography = themeConfig.typography.headings;
    return {
      fontFamily: `'${typography.fontFamily}', sans-serif`,
      fontWeight: typography.fontWeight || '700',
      textTransform: typography.useUppercase ? 'uppercase' as const : 'none' as const,
      fontSize: typography.fontSize ? 
        (typography.fontSize <= 100 ? `${typography.fontSize}%` : `${typography.fontSize}px`) : '100%',
      letterSpacing: `${typography.letterSpacing || 0}px`
    };
  }, [themeConfig?.typography?.headings]);
  
  // 5. VALIDACIÓN CRÍTICA (DESPUÉS de hooks)
  if (config?.enabled === false && !isEditor) {
    return null; // ⚠️ SOLO si es FALSE, NO si es undefined
  }
  
  const visibleItems = config?.items?.filter(item => item.visible) || [];
  
  return (
    <section style={{
      paddingTop: `${config.topPadding}px`,
      paddingBottom: `${config.bottomPadding}px`,
      backgroundColor: config.colorBackground ? colorScheme.background : 'transparent',
    }}>
      {/* Contenido */}
    </section>
  );
}
```

## 🔧 INTEGRACIONES OBLIGATORIAS

### 1. editor.types.ts
```typescript
// Agregar en enum
[MODULE_NAME] = '[module_name]',

// Agregar en SECTION_CONFIGS
[SectionType.[MODULE_NAME]]: getDefault[ModuleName]Config(),
```

### 2. EditorPreview.tsx
```typescript
// Import
import Preview[ModuleName] from '@/components/preview/Preview[ModuleName]';

// Case
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

### 3. PreviewContent.tsx
```typescript
// En getSectionType()
if (t === '[ModuleName]' || t === '[module_name]') return '[module_name]';

// Render
{getSectionType(section) === '[module_name]' && (
  <Preview[ModuleName] 
    config={getSectionConfig(section)} 
    theme={theme}
    deviceView={deviceView}
    isEditor={false}
  />
)}
```

### 4. useEditorStore.ts - MAPEO CRÍTICO
```typescript
const typeMapping: { [key: string]: string } = {
  '[module_name]': '[ModuleName]', // AGREGAR
};

return {
  type: s.type,
  sectionType: typeMapping[s.type] || s.type,
  settings: s.settings,
  config: s.settings // Backend usa ambos
};
```

### 5. SI TIENE HIJOS - ConfigPanel.tsx
```typescript
// Detección (usar :child: NO :item:)
const is[ModuleName]Item = selectedSectionId?.includes(':child:') && 
  Object.values(sections).flat().find(s => s.id === selectedSectionId?.split(':child:')[0])?.type === SectionType.[MODULE_NAME];

// Return
if (is[ModuleName]Item) {
  const sectionId = selectedSectionId.split(':child:')[0];
  const itemId = selectedSectionId.split(':child:')[1];
  return <[ModuleName]ItemEditor sectionId={sectionId} itemId={itemId} />;
}
```

## ❌ ERRORES CRÍTICOS Y SOLUCIONES

### "No se ve en preview real"
```typescript
// ✅ CORRECTO
if (config?.enabled === false && !isEditor)

// ❌ INCORRECTO (ocultará si undefined)
if (!config?.enabled && !isEditor)
```

### "Hover con color incorrecto"
```typescript
onMouseEnter={(e) => {
  const hoverColor = colorScheme.text || '#000000';
  e.currentTarget.style.backgroundColor = `${hoverColor}10`; // 10 = 6% opacity
}}
```

### "No abre config de hijos"
- SIEMPRE usar `:child:` NO `:item:`

### "Color scheme no funciona"
- Usar estructura PLANA: `colorScheme.text` NO `colorScheme.text.default`

## ✅ CHECKLIST FINAL
```
[ ] Módulo aparece en AddSectionModal
[ ] Config padre abre y guarda
[ ] Preview se actualiza en tiempo real
[ ] Se ve en preview real (/preview/home)
[ ] Color schemes funcionan (1-5)
[ ] Typography se aplica
[ ] Hover usa color del theme
[ ] Si tiene hijos:
    [ ] Agregar item funciona
    [ ] Config hijo abre con :child:
    [ ] Drag & drop funciona
    [ ] Eliminar item funciona
[ ] 0 errores en consola
[ ] Archivos < 300 líneas
```

## 🚀 USO
```
/nuevo-modulo [NombreDelMódulo]
```

**TIEMPO ESTIMADO: 2 HORAS MÁXIMO**
Si toma más tiempo, algo está mal.

---
**VERSIÓN:** 1.0 DEFINITIVA
**FECHA:** 2025-01-18
**REEMPLAZA:** Todas las versiones anteriores