# 📚 GUÍA COMPLETA DEL SISTEMA DE COMANDOS

## 🎯 Visión General

El sistema de comandos automatiza la generación de páginas UI con todos los patrones requeridos de CLAUDE.md. Garantiza que **TODA nueva página tenga vista móvil perfecta desde el inicio**.

## 🚀 Comandos Disponibles

### 1️⃣ `/build-from-design` - Construir desde Diseño

**Cuándo usarlo**: Cuando tienes una imagen de diseño o referencia visual

```bash
/build-from-design \
  --name "productos" \
  --design "C:\Users\hp\Desktop\diseño-productos.png" \
  --features "table,search,filters"
```

**Proceso**:
1. Analiza la imagen/descripción
2. Detecta componentes necesarios (tabla, tabs, formulario, etc.)
3. Genera estructura de página
4. Aplica patrones responsive automáticamente
5. Valida contra checklist de UI
6. Auto-corrige errores si es necesario

### 2️⃣ `/create-ui` - Crear UI desde Cero

**Cuándo usarlo**: Cuando necesitas crear una página nueva sin diseño específico

```bash
/create-ui \
  --name "pedidos" \
  --type "list" \
  --features "table,search,export" \
  --auto-fix
```

**Tipos disponibles**:
- `list` - Página de listado con tabla
- `detail` - Página de detalle con tabs
- `dashboard` - Dashboard con métricas
- `form` - Formulario de creación/edición

## 📊 Cómo Funcionan los Comandos

### Flujo de Ejecución

```
Usuario ejecuta comando
         ↓
[1] ANÁLISIS DE REQUERIMIENTOS
    - Detecta componentes necesarios
    - Identifica patrones móviles requeridos
    - Estima complejidad
         ↓
[2] GENERACIÓN DE ESTRUCTURA
    - Crea página principal
    - Genera componentes de tabs
    - Crea traducciones (en/es)
    - Define tipos TypeScript
         ↓
[3] APLICACIÓN DE PATRONES RESPONSIVE
    - ResponsiveTabs para navegación
    - ResponsiveTable para listas
    - MobileActionBar para acciones
    - Grid 2x2 para métricas móviles
         ↓
[4] INTEGRACIÓN DE FEATURES
    - Hook useI18n para traducciones
    - Color primario dinámico
    - Clases dark mode
    - Breadcrumbs/título móvil
         ↓
[5] VALIDACIÓN AUTOMÁTICA
    - Ejecuta checklist de 17 puntos
    - Identifica errores y warnings
    - Calcula score de calidad
         ↓
[6] AUTO-CORRECCIÓN (opcional)
    - Corrige errores automáticamente
    - Re-valida código
    - Garantiza score > 80%
         ↓
[7] RESULTADO FINAL
    - Archivos generados
    - Reporte de validación
    - Instrucciones siguientes
```

## 🎨 Ejemplos Prácticos

### Ejemplo 1: Página de Clientes desde Diseño

```bash
# Tienes una imagen del diseño
/build-from-design \
  --name "clientes" \
  --design "C:\Users\hp\Desktop\clientes-design.png"

# Resultado:
✅ Detectó: tabla, tabs, búsqueda, acciones
✅ Generó: 
   - app/dashboard/clientes/page.tsx
   - components/clientes/tabs/*.tsx
   - lib/i18n/translations/clientes.*.json
   - types/clientes.ts
   - lib/api/clientes.ts
✅ Aplicó:
   - ResponsiveTable (tabla → cards en móvil)
   - ResponsiveTabs (tabs verticales en móvil)
   - MobileActionBar (botones fijos abajo)
✅ Score: 95%
```

### Ejemplo 2: Dashboard desde Cero

```bash
/create-ui \
  --name "analytics" \
  --type "dashboard" \
  --features "metrics,charts,filters" \
  --auto-fix

# Resultado:
✅ Tipo: dashboard
✅ Features: métricas, gráficos, filtros
✅ Patrones aplicados:
   - Grid 2x2 en móvil para métricas
   - Filtros colapsables en móvil
   - Gráficos responsive
✅ Auto-corregido: 3 issues
✅ Score final: 100%
```

### Ejemplo 3: Formulario Complejo

```bash
/create-ui \
  --name "configuracion-hotel" \
  --type "form" \
  --features "form,tabs,upload" \
  --description "Formulario de configuración del hotel con múltiples secciones"

# Resultado:
✅ Detectó necesidad de tabs para secciones
✅ Aplicó:
   - w-11/12 en inputs móviles
   - Tabs verticales para secciones
   - Upload area táctil grande
   - Validación en tiempo real
✅ Generó API service con validaciones
```

## 📋 Qué Se Espera al Ejecutar

### Salida en Consola

```
╔══════════════════════════════════════════════════════════╗
║     CLAUDE CODE - AUTOMATED PAGE GENERATION SYSTEM      ║
╚══════════════════════════════════════════════════════════╝

🚀 EXECUTING: /build-from-design
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1️⃣ ANALYZING DESIGN...
   ✅ Identified components: table, tabs, search, actions
   ✅ Layout type: list
   ✅ Mobile patterns needed: 4

2️⃣ GENERATING PAGE STRUCTURE...
   ✅ Generated 7 files

3️⃣ APPLYING RESPONSIVE PATTERNS...
   ✅ ResponsiveTabs: Applied
   ✅ ResponsiveTable: Applied
   ✅ MobileActionBar: Applied

4️⃣ VALIDATING AGAINST CHECKLIST...
   Score: 95%
   Status: ✅ PASSED

📊 BUILD SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Page: productos
Type: list
Components: table, tabs, search, actions
Validation Score: 95%
Status: ✅ Ready

Mobile Patterns Applied:
  ✅ table-to-cards
  ✅ tabs-to-vertical
  ✅ inputs-w-11/12
  ✅ fixed-action-bar

Files Generated:
  📁 app/dashboard/productos/page.tsx
  📁 components/productos/...
  📁 translations/productos.json
```

### Archivos Generados

```
websitebuilder-admin/
├── src/
│   ├── app/dashboard/
│   │   └── [pageName]/
│   │       └── page.tsx          # Página principal
│   ├── components/
│   │   └── [pageName]/
│   │       └── tabs/
│   │           ├── overview.tsx   # Tab overview
│   │           ├── details.tsx    # Tab detalles
│   │           └── settings.tsx   # Tab configuración
│   ├── lib/
│   │   ├── api/
│   │   │   └── [pageName].ts     # Service API
│   │   └── i18n/translations/
│   │       ├── [pageName].en.json # Traducciones inglés
│   │       └── [pageName].es.json # Traducciones español
│   └── types/
│       └── [pageName].ts          # Definiciones TypeScript
```

## ✅ Validaciones Automáticas

El sistema valida **17 puntos críticos**:

### Traducciones (Obligatorio)
- ✅ Hook useI18n implementado
- ✅ Todas las strings usan t()
- ✅ Archivos en.json y es.json actualizados

### Diseño Responsive (Condicional)
- ✅ ResponsiveTabs si hay tabs
- ✅ ResponsiveTable si hay tabla
- ✅ MobileActionBar si hay acciones
- ✅ pb-24 padding con acciones fijas
- ✅ w-11/12 en inputs móviles

### Dark Mode (Obligatorio)
- ✅ Fondos dark:bg-gray-*
- ✅ Textos dark:text-*

### Color Primario (Obligatorio)
- ✅ Color desde localStorage
- ✅ Aplicado en botones/acciones
- ✅ Estados focus con color primario

### Navegación (Obligatorio)
- ✅ Breadcrumbs en desktop
- ✅ Título en móvil

### Layout (Obligatorio)
- ✅ Integración con sidebar
- ✅ Clases mobile-first
- ✅ Grids responsive

## 🔧 Opciones Avanzadas

### Flags Disponibles

```bash
--name         # Nombre de la página (requerido)
--type         # Tipo: list|detail|dashboard|form
--features     # Features separadas por coma
--description  # Descripción textual
--design       # Ruta a imagen de diseño
--auto-fix     # Corregir errores automáticamente
--dry-run      # Preview sin crear archivos
--validate     # Solo validar, no generar
```

### Combinaciones Útiles

```bash
# Preview antes de crear
/create-ui --name "test" --type "list" --dry-run

# Validar diseño existente
/build-from-design --name "existing" --validate

# Máxima automatización
/create-ui --name "orders" --type "list" --auto-fix

# Desde descripción detallada
/build-from-design \
  --name "inventory" \
  --description "Sistema de inventario con tabla de productos, \
                 filtros avanzados, búsqueda, exportación, \
                 y acciones masivas"
```

## 🎯 Mejores Prácticas

### ✅ DO's
1. **Siempre** especifica todas las features necesarias
2. **Usa** --dry-run para preview
3. **Activa** --auto-fix para desarrollo rápido
4. **Proporciona** descripciones detalladas
5. **Revisa** el score de validación
6. **Prueba** en viewports móviles (320px, 375px, 414px)

### ❌ DON'Ts
1. **No** ignores warnings de validación
2. **No** omitas testing móvil
3. **No** modifiques sin entender los patrones
4. **No** elimines componentes responsive
5. **No** hardcodees colores

## 🚨 Troubleshooting

### Problema: Score de validación bajo
**Solución**: Usa `--auto-fix` o revisa errores específicos

### Problema: Componentes no aparecen
**Solución**: Verifica que features estén especificadas

### Problema: Móvil se ve mal
**Solución**: Componentes responsive no aplicados, re-ejecuta con --auto-fix

### Problema: Traducciones faltantes
**Solución**: Actualiza manualmente los archivos .json después de generar

## 📈 Métricas de Éxito

Una página generada exitosamente debe:
- ✅ Score > 80% en validación
- ✅ 0 errores críticos
- ✅ Vista móvil perfecta en 320px
- ✅ Tiempo de generación < 5 segundos
- ✅ Todos los archivos necesarios creados
- ✅ TypeScript sin errores
- ✅ Dark mode funcionando
- ✅ Traducciones completas

## 🔄 Workflow Completo

```bash
# 1. Generar página
/create-ui --name "productos" --type "list" --features "table,search" --auto-fix

# 2. Revisar archivos generados
# Verificar en src/app/dashboard/productos/

# 3. Actualizar traducciones si necesario
# Editar lib/i18n/translations/productos.*.json

# 4. Conectar API backend
# Implementar endpoints en backend

# 5. Probar
npm run dev
# Navegar a /dashboard/productos

# 6. Verificar móvil
# Probar en 320px, 375px, 414px

# 7. Ajustar si necesario
# Los componentes responsive manejan la mayoría de casos
```

## 🎉 Resultado Final

Con estos comandos, **NUNCA MÁS** tendrás problemas de:
- ❌ Vista móvil rota
- ❌ Falta de dark mode
- ❌ Traducciones olvidadas
- ❌ Componentes no responsive
- ❌ Patrones inconsistentes
- ❌ Color primario hardcodeado
- ❌ Navegación faltante
- ❌ TypeScript errors

**TODO se genera correctamente desde el inicio** ✨