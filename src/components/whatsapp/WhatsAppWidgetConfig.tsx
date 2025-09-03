'use client';

import React from 'react';
import { Palette, MessageCircle, Globe } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { WidgetConfig, predefinedColors } from './WhatsAppWidgetHelpers';

interface WhatsAppWidgetConfigProps {
  config: WidgetConfig;
  onConfigChange: (config: WidgetConfig) => void;
  showTitle?: boolean;
}

export default function WhatsAppWidgetConfig({ 
  config, 
  onConfigChange,
  showTitle = true
}: WhatsAppWidgetConfigProps) {
  
  // Ensure all values have defaults to avoid uncontrolled input errors
  const safeConfig: WidgetConfig = {
    primaryColor: config.primaryColor || '#22c55e',
    position: config.position || 'bottom-right',
    welcomeMessage: config.welcomeMessage || '¡Hola! 👋 ¿En qué puedo ayudarte hoy?',
    placeholderText: config.placeholderText || 'Escribe un mensaje...',
    buttonSize: config.buttonSize || 'medium',
    borderRadius: config.borderRadius ?? 50,
    showOnMobile: config.showOnMobile ?? true,
    showOnDesktop: config.showOnDesktop ?? true,
    delaySeconds: config.delaySeconds ?? 3,
    autoOpenSeconds: config.autoOpenSeconds ?? 0,
    isEnabled: config.isEnabled ?? true,
    requirementType: config.requirementType || 'none',
    requirementTitle: config.requirementTitle || 'Para continuar, por favor ingresa tu información:',
    requirementButtonText: config.requirementButtonText || 'Iniciar Chat'
  };
  
  const handleChange = (field: keyof WidgetConfig, value: any) => {
    onConfigChange({ ...safeConfig, [field]: value });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      {showTitle && (
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          <Palette className="inline h-5 w-5 mr-2" />
          Apariencia del Widget
        </h2>
      )}

      {/* Color Primario */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Color Primario
        </label>
        <div className="grid grid-cols-4 gap-2 mb-3">
          {predefinedColors.map((color) => (
            <button
              key={color.value}
              onClick={() => handleChange('primaryColor', color.value)}
              className={`h-10 rounded-lg border-2 transition-all ${
                safeConfig.primaryColor === color.value
                  ? 'border-gray-900 dark:border-white scale-110'
                  : 'border-gray-300 dark:border-gray-600 hover:scale-105'
              }`}
              style={{ backgroundColor: color.value }}
              title={color.name}
            />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={safeConfig.primaryColor}
            onChange={(e) => handleChange('primaryColor', e.target.value)}
            className="h-10 w-20"
          />
          <input
            type="text"
            value={safeConfig.primaryColor}
            onChange={(e) => handleChange('primaryColor', e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            placeholder="#22c55e"
          />
        </div>
      </div>

      {/* Posición */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Posición del Widget
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleChange('position', 'bottom-right')}
            className={`p-3 rounded-lg border-2 transition-all ${
              safeConfig.position === 'bottom-right'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <span className="text-sm">Abajo Derecha</span>
          </button>
          <button
            onClick={() => handleChange('position', 'bottom-left')}
            className={`p-3 rounded-lg border-2 transition-all ${
              safeConfig.position === 'bottom-left'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <span className="text-sm">Abajo Izquierda</span>
          </button>
        </div>
      </div>

      {/* Tamaño del Botón */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Tamaño del Botón
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(['small', 'medium', 'large'] as const).map((size) => (
            <button
              key={size}
              onClick={() => handleChange('buttonSize', size)}
              className={`p-3 rounded-lg border-2 transition-all capitalize ${
                safeConfig.buttonSize === size
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <span className="text-sm">
                {size === 'small' ? 'Pequeño' : size === 'medium' ? 'Mediano' : 'Grande'}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Border Radius */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Redondez del Botón: {safeConfig.borderRadius}%
        </label>
        <input
          type="range"
          min="0"
          max="50"
          value={safeConfig.borderRadius}
          onChange={(e) => handleChange('borderRadius', parseInt(e.target.value))}
          className="w-full"
        />
      </div>

      {/* Mensajes */}
      <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-4 mt-8">
        <MessageCircle className="inline h-4 w-4 mr-2" />
        Mensajes
      </h3>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Mensaje de Bienvenida
        </label>
        <textarea
          value={safeConfig.welcomeMessage}
          onChange={(e) => handleChange('welcomeMessage', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
          placeholder="¡Hola! ¿En qué puedo ayudarte?"
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Texto del Placeholder
        </label>
        <input
          type="text"
          value={safeConfig.placeholderText}
          onChange={(e) => handleChange('placeholderText', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
          placeholder="Escribe un mensaje..."
        />
      </div>

      {/* Comportamiento */}
      <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-4">
        Comportamiento
      </h3>

      {/* Requisitos para abrir chat */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Requisitos para abrir conversación
        </label>
        <select
          value={safeConfig.requirementType}
          onChange={(e) => handleChange('requirementType', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
        >
          <option value="none">No requerir información</option>
          <option value="name">Requerir nombre</option>
          <option value="email">Requerir correo electrónico</option>
          <option value="both">Requerir nombre y correo</option>
        </select>
      </div>

      {safeConfig.requirementType !== 'none' && (
        <>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Título del formulario
            </label>
            <input
              type="text"
              value={safeConfig.requirementTitle}
              onChange={(e) => handleChange('requirementTitle', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              placeholder="Para continuar, por favor ingresa tu información:"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Texto del botón
            </label>
            <input
              type="text"
              value={safeConfig.requirementButtonText}
              onChange={(e) => handleChange('requirementButtonText', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              placeholder="Iniciar Chat"
            />
          </div>
        </>
      )}

      {/* Toggle para mostrar/ocultar en página web */}
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Globe className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <div>
              <label htmlFor="widget-enabled" className="text-sm font-medium text-gray-900 dark:text-white cursor-pointer">
                Mostrar en página web
              </label>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Activa o desactiva el widget de WhatsApp en tu sitio web
              </p>
            </div>
          </div>
          <Switch
            id="widget-enabled"
            checked={safeConfig.isEnabled}
            onCheckedChange={(checked) => handleChange('isEnabled', checked)}
            className="data-[state=checked]:bg-blue-600"
          />
        </div>
      </div>

      <div className="space-y-3 mb-6">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={safeConfig.showOnMobile}
            onChange={(e) => handleChange('showOnMobile', e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">Mostrar en móviles</span>
        </label>

        <label className="flex items-center">
          <input
            type="checkbox"
            checked={safeConfig.showOnDesktop}
            onChange={(e) => handleChange('showOnDesktop', e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">Mostrar en escritorio</span>
        </label>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Retraso antes de mostrar (segundos)
        </label>
        <input
          type="number"
          min="0"
          max="60"
          value={safeConfig.delaySeconds}
          onChange={(e) => handleChange('delaySeconds', parseInt(e.target.value) || 0)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Auto-abrir chat después de (segundos, 0 = desactivado)
        </label>
        <input
          type="number"
          min="0"
          max="120"
          value={safeConfig.autoOpenSeconds}
          onChange={(e) => handleChange('autoOpenSeconds', parseInt(e.target.value) || 0)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
        />
      </div>
    </div>
  );
}