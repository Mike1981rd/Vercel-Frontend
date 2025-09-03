'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import type { SwatchesConfig, SwatchShape } from '@/types/theme/swatches';
import { swatchShapeOptions, defaultPrimarySwatchConfig, defaultSecondarySwatchConfig } from '@/types/theme/swatches';

interface SwatchesSectionProps {
  config?: SwatchesConfig;
  onChange?: (config: SwatchesConfig) => void;
}

export function SwatchesSection({ config, onChange }: SwatchesSectionProps) {
  // Initialize with defaults if not provided
  const primaryConfig = config?.primary || defaultPrimarySwatchConfig;
  const secondaryConfig = config?.secondary || defaultSecondarySwatchConfig;

  const handlePrimaryChange = (updates: Partial<typeof primaryConfig>) => {
    if (onChange) {
      onChange({
        primary: {
          ...primaryConfig,
          ...updates
        },
        secondary: secondaryConfig
      });
    }
  };

  const handleSecondaryChange = (updates: Partial<typeof secondaryConfig>) => {
    if (onChange) {
      onChange({
        primary: primaryConfig,
        secondary: {
          ...secondaryConfig,
          ...updates
        }
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* Primary swatch option */}
      <div className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Primary swatch option</h3>
          
          {/* Toggle for enabling swatches */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5 flex-1">
              <Label htmlFor="primary-enabled">
                Show swatches in product cards, product pages, and filters
              </Label>
            </div>
            <Switch
              id="primary-enabled"
              checked={primaryConfig.enabled}
              onCheckedChange={(checked) => handlePrimaryChange({ enabled: checked })}
            />
          </div>

          {/* Option name */}
          <div className="space-y-2">
            <Label htmlFor="primary-option-name">Option name</Label>
            <Input
              id="primary-option-name"
              type="text"
              value={primaryConfig.optionName || ''}
              onChange={(e) => handlePrimaryChange({ optionName: e.target.value })}
              placeholder="Color"
            />
            <p className="text-sm text-muted-foreground">
              Fill in the relevant option name from your admin to turn on swatches
            </p>
          </div>

          {/* Shape for product cards */}
          <div className="space-y-2">
            <Label htmlFor="primary-shape-cards">Shape for product cards</Label>
            <Select
              value={primaryConfig.shapeForProductCards}
              onValueChange={(value: SwatchShape) => handlePrimaryChange({ shapeForProductCards: value })}
            >
              <SelectTrigger id="primary-shape-cards">
                <SelectValue placeholder="Select shape" />
              </SelectTrigger>
              <SelectContent>
                {swatchShapeOptions.map((shape) => (
                  <SelectItem key={shape} value={shape}>
                    {shape}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Size for product cards */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="primary-size-cards">Size for product cards</Label>
              <span className="text-sm text-muted-foreground">{primaryConfig.sizeForProductCards}</span>
            </div>
            <Slider
              id="primary-size-cards"
              min={1}
              max={5}
              step={1}
              value={[primaryConfig.sizeForProductCards]}
              onValueChange={(value) => handlePrimaryChange({ sizeForProductCards: value[0] })}
              className="w-full"
            />
          </div>

          {/* Shape for product pages */}
          <div className="space-y-2">
            <Label htmlFor="primary-shape-pages">Shape for product pages</Label>
            <Select
              value={primaryConfig.shapeForProductPages}
              onValueChange={(value: SwatchShape) => handlePrimaryChange({ shapeForProductPages: value })}
            >
              <SelectTrigger id="primary-shape-pages">
                <SelectValue placeholder="Select shape" />
              </SelectTrigger>
              <SelectContent>
                {swatchShapeOptions.map((shape) => (
                  <SelectItem key={shape} value={shape}>
                    {shape}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Size for product pages */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="primary-size-pages">Size for product pages</Label>
              <span className="text-sm text-muted-foreground">{primaryConfig.sizeForProductPages}</span>
            </div>
            <Slider
              id="primary-size-pages"
              min={1}
              max={5}
              step={1}
              value={[primaryConfig.sizeForProductPages]}
              onValueChange={(value) => handlePrimaryChange({ sizeForProductPages: value[0] })}
              className="w-full"
            />
          </div>

          {/* Shape for filters */}
          <div className="space-y-2">
            <Label htmlFor="primary-shape-filters">Shape for filters</Label>
            <Select
              value={primaryConfig.shapeForFilters}
              onValueChange={(value: SwatchShape) => handlePrimaryChange({ shapeForFilters: value })}
            >
              <SelectTrigger id="primary-shape-filters">
                <SelectValue placeholder="Select shape" />
              </SelectTrigger>
              <SelectContent>
                {swatchShapeOptions.map((shape) => (
                  <SelectItem key={shape} value={shape}>
                    {shape}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Size for filters */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="primary-size-filters">Size for filters</Label>
              <span className="text-sm text-muted-foreground">{primaryConfig.sizeForFilters}</span>
            </div>
            <Slider
              id="primary-size-filters"
              min={1}
              max={5}
              step={1}
              value={[primaryConfig.sizeForFilters]}
              onValueChange={(value) => handlePrimaryChange({ sizeForFilters: value[0] })}
              className="w-full"
            />
          </div>

          {/* Custom colors and patterns */}
          <div className="space-y-2">
            <Label htmlFor="primary-custom-colors">Custom colors and patterns</Label>
            <Textarea
              id="primary-custom-colors"
              value={primaryConfig.customColorsAndPatterns || ''}
              onChange={(e) => handlePrimaryChange({ customColorsAndPatterns: e.target.value })}
              rows={6}
              placeholder="Ultramarine: #0437F2&#10;Cherry blossom: #FFB7C5&#10;Sunny day: yellow/green/blue"
              className="font-mono text-sm resize-none"
            />
            <p className="text-sm text-muted-foreground">
              Place each rule in a separate line.{' '}
              <a href="#" className="text-primary hover:underline">
                Learn how to add color swatches
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Secondary swatch options */}
      <div className="space-y-6 border-t pt-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Secondary swatch options</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Show swatches for more than one option in product pages and filters
            </p>
          </div>

          {/* Option names */}
          <div className="space-y-2">
            <Label htmlFor="secondary-option-names">Option names</Label>
            <Textarea
              id="secondary-option-names"
              value={secondaryConfig.optionNames || ''}
              onChange={(e) => handleSecondaryChange({ optionNames: e.target.value })}
              rows={3}
              placeholder="Material&#10;Frame"
              className="font-mono text-sm"
            />
            <p className="text-sm text-muted-foreground">
              Fill in relevant option names from your admin, place each in a separate line
            </p>
          </div>

          {/* Shape for product pages */}
          <div className="space-y-2">
            <Label htmlFor="secondary-shape-pages">Shape for product pages</Label>
            <Select
              value={secondaryConfig.shapeForProductPages}
              onValueChange={(value: SwatchShape) => handleSecondaryChange({ shapeForProductPages: value })}
            >
              <SelectTrigger id="secondary-shape-pages">
                <SelectValue placeholder="Select shape" />
              </SelectTrigger>
              <SelectContent>
                {swatchShapeOptions.map((shape) => (
                  <SelectItem key={shape} value={shape}>
                    {shape}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Size for product pages */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="secondary-size-pages">Size for product pages</Label>
              <span className="text-sm text-muted-foreground">{secondaryConfig.sizeForProductPages}</span>
            </div>
            <Slider
              id="secondary-size-pages"
              min={1}
              max={5}
              step={1}
              value={[secondaryConfig.sizeForProductPages]}
              onValueChange={(value) => handleSecondaryChange({ sizeForProductPages: value[0] })}
              className="w-full"
            />
          </div>

          {/* Shape for filters */}
          <div className="space-y-2">
            <Label htmlFor="secondary-shape-filters">Shape for filters</Label>
            <Select
              value={secondaryConfig.shapeForFilters}
              onValueChange={(value: SwatchShape) => handleSecondaryChange({ shapeForFilters: value })}
            >
              <SelectTrigger id="secondary-shape-filters">
                <SelectValue placeholder="Select shape" />
              </SelectTrigger>
              <SelectContent>
                {swatchShapeOptions.map((shape) => (
                  <SelectItem key={shape} value={shape}>
                    {shape}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Size for filters */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="secondary-size-filters">Size for filters</Label>
              <span className="text-sm text-muted-foreground">{secondaryConfig.sizeForFilters}</span>
            </div>
            <Slider
              id="secondary-size-filters"
              min={1}
              max={5}
              step={1}
              value={[secondaryConfig.sizeForFilters]}
              onValueChange={(value) => handleSecondaryChange({ sizeForFilters: value[0] })}
              className="w-full"
            />
          </div>

          {/* Custom colors and patterns */}
          <div className="space-y-2">
            <Label htmlFor="secondary-custom-colors">Custom colors and patterns</Label>
            <Textarea
              id="secondary-custom-colors"
              value={secondaryConfig.customColorsAndPatterns || ''}
              onChange={(e) => handleSecondaryChange({ customColorsAndPatterns: e.target.value })}
              rows={6}
              placeholder="Ultramarine: #0437F2&#10;Cherry blossom: #FFB7C5&#10;Sunny day: yellow/green/blue"
              className="font-mono text-sm resize-none"
            />
            <p className="text-sm text-muted-foreground">
              Place each rule in a separate line.{' '}
              <a href="#" className="text-primary hover:underline">
                Learn how to add color swatches
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}