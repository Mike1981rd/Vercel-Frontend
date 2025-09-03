export const ProductMessages = {
  // Mensajes de éxito
  success: {
    productCreated: 'Producto creado exitosamente',
    productUpdated: 'Producto actualizado correctamente',
    productDeleted: 'Producto eliminado exitosamente',
    productsDeleted: 'Productos eliminados exitosamente',
    productActivated: 'Producto activado correctamente',
    productDeactivated: 'Producto desactivado correctamente',
    imagesUpdated: 'Imágenes del producto actualizadas exitosamente',
    collectionsAssigned: 'Producto asignado a las colecciones seleccionadas',
    variantAdded: 'Variante agregada exitosamente',
    variantUpdated: 'Variante actualizada correctamente',
    variantDeleted: 'Variante eliminada exitosamente',
    inventoryUpdated: 'Inventario actualizado correctamente',
    productDuplicated: 'Producto duplicado exitosamente',
    productsImported: 'Productos importados exitosamente',
    productsExported: 'Productos exportados correctamente',
  },

  // Mensajes de error - Validación
  validation: {
    nameRequired: 'El nombre del producto es obligatorio',
    nameTooLong: 'El nombre del producto no puede exceder 200 caracteres',
    nameAlreadyExists: 'Ya existe un producto con este nombre',
    invalidPrice: 'El precio debe ser mayor o igual a 0',
    invalidComparePrice: 'El precio comparado debe ser mayor que el precio base',
    invalidStock: 'El stock no puede ser negativo',
    invalidWeight: 'El peso debe ser mayor que 0',
    invalidWeightUnit: 'Unidad de peso inválida. Use: kg, g, lb, oz',
    invalidSKU: 'El SKU contiene caracteres no válidos',
    skuAlreadyExists: 'Ya existe un producto con este SKU',
    barcodeAlreadyExists: 'Ya existe un producto con este código de barras',
    invalidBarcode: 'El código de barras no es válido',
    invalidImageUrl: 'Una o más URLs de imagen no son válidas',
    tooManyImages: 'No se pueden agregar más de 10 imágenes por producto',
    invalidProductType: 'Tipo de producto no válido',
    invalidTags: 'Los tags contienen caracteres no permitidos',
    tooManyTags: 'No se pueden agregar más de 20 tags por producto',
  },

  // Mensajes de error - Base de datos
  database: {
    saveFailed: 'Error al guardar el producto en la base de datos',
    updateFailed: 'Error al actualizar el producto',
    deleteFailed: 'Error al eliminar el producto',
    transactionFailed: 'Error en la transacción. Los cambios fueron revertidos',
    connectionFailed: 'No se pudo conectar con la base de datos',
    timeoutError: 'La operación excedió el tiempo límite',
    concurrencyError: 'El producto fue modificado por otro usuario. Por favor, recargue e intente nuevamente',
  },

  // Mensajes de error - Negocio
  business: {
    productNotFound: 'Producto no encontrado',
    productsNotFound: 'Uno o más productos no fueron encontrados',
    unauthorizedAccess: 'No tiene permisos para realizar esta acción',
    productHasOrders: 'No se puede eliminar el producto porque tiene pedidos asociados',
    productInCart: 'No se puede eliminar el producto porque está en carritos activos',
    insufficientStock: 'Stock insuficiente para completar la operación',
    variantRequired: 'Este producto requiere seleccionar una variante',
    noVariantsAvailable: 'No hay variantes disponibles para este producto',
    collectionNotFound: 'Una o más colecciones no existen',
    invalidCompany: 'Empresa no válida o no autorizada',
    productInactive: 'El producto está inactivo y no puede ser modificado',
    cannotDeleteLastVariant: 'No se puede eliminar la última variante del producto',
    cannotDeactivateWithStock: 'No se puede desactivar un producto con stock disponible',
  },

  // Mensajes de error - Archivo/Importación
  fileOperation: {
    invalidFileFormat: 'Formato de archivo no válido. Use CSV o Excel',
    fileTooLarge: 'El archivo excede el tamaño máximo permitido (5MB)',
    emptyFile: 'El archivo está vacío',
    invalidHeaders: 'Los encabezados del archivo no son válidos',
    importPartialSuccess: 'Algunos productos no pudieron ser importados. Revise el log de errores',
    exportFailed: 'Error al exportar los productos',
    imageUploadFailed: 'Error al cargar una o más imágenes',
    imageSizeExceeded: 'La imagen excede el tamaño máximo permitido (2MB)',
    invalidImageFormat: 'Formato de imagen no válido. Use JPG, PNG o WEBP',
  },

  // Mensajes de advertencia
  warning: {
    lowStock: 'Advertencia: Stock bajo para este producto',
    noImage: 'El producto no tiene imagen principal',
    noDescription: 'El producto no tiene descripción',
    priceNotSet: 'El producto no tiene precio establecido',
    duplicateVariant: 'Ya existe una variante con estos atributos',
    collectionLimit: 'El producto ya está en el máximo de colecciones permitidas',
  },

  // Mensajes informativos
  info: {
    processingRequest: 'Procesando solicitud...',
    loadingProducts: 'Cargando productos...',
    generatingSKU: 'Generando SKU automáticamente...',
    calculatingPrices: 'Calculando precios...',
    checkingInventory: 'Verificando inventario...',
    syncingVariants: 'Sincronizando variantes...',
    preparingExport: 'Preparando exportación...',
    validatingData: 'Validando datos...',
  },
};

// Función helper para obtener mensaje por path
export const getMessage = (path: string): string => {
  const keys = path.split('.');
  let result: any = ProductMessages;
  
  for (const key of keys) {
    result = result[key];
    if (!result) return path; // Retornar el path si no se encuentra
  }
  
  return result;
};

// Tipos de notificación
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

// Helper para mostrar notificación con el mensaje correcto
export const showProductNotification = (
  type: NotificationType,
  messageKey: string,
  customMessage?: string
): void => {
  const message = customMessage || getMessage(messageKey);
  
  // Aquí puedes integrar con tu sistema de notificaciones
  // Por ejemplo, toast, snackbar, etc.
  console.log(`[${type.toUpperCase()}] ${message}`);
  
  // Si usas react-toastify:
  // import { toast } from 'react-toastify';
  // toast[type](message);
};