/**
 * @file ControlledCurrencySelect.tsx
 * @max-lines 300
 * @current-lines 0
 * @architecture modular
 * @validates-rules ✅
 */
'use client';

import React from 'react';
import { Controller, Control, FieldValues } from 'react-hook-form';
import * as Select from '@radix-ui/react-select';
import { ChevronDown, Check } from 'lucide-react';
import { currencies } from '@/components/ui/CountryFlag';

export interface ControlledCurrencySelectProps<FormValues extends FieldValues = FieldValues> {
  name: keyof FormValues & string;
  control: Control<FormValues>;
  label?: string;
  placeholder?: string;
  inputClassName?: string;
  inputFocusStyle?: React.CSSProperties;
}

export function ControlledCurrencySelect<FormValues extends FieldValues = FieldValues>({
  name,
  control,
  label,
  placeholder = 'Select currency',
  inputClassName,
  inputFocusStyle,
}: ControlledCurrencySelectProps<FormValues>) {
  return (
    <div className="max-w-sm w-full">
      {label && (
        <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">{label}</label>
      )}
      <Controller<FormValues>
        name={name as any}
        control={control as Control<FormValues>}
        render={({ field }) => {
          const currentValue = (field.value as string) || '';
          const listedCodes = new Set<string>([
            ...['USD', 'CAD', 'MXN'],
            ...['DOP', 'CUP', 'JMD', 'HTG', 'TTD', 'BBD'],
            ...['GTQ', 'HNL', 'NIO', 'CRC', 'PAB', 'BZD'],
            ...['ARS', 'BRL', 'CLP', 'COP', 'PEN', 'UYU', 'PYG', 'BOB', 'VES', 'GYD', 'SRD'],
            ...['EUR', 'GBP'],
          ]);
          const needsCurrentItem = !!currentValue && !listedCodes.has(currentValue);
          const currentName = currencies[currentValue as keyof typeof currencies]?.name || currentValue;

          return (
          <Select.Root value={currentValue} onValueChange={field.onChange}>
            <Select.Trigger className={`${inputClassName} flex items-center justify-between`} style={inputFocusStyle}>
              <Select.Value>
                {field.value && currencies[(field.value as string) as keyof typeof currencies] ? (
                  <span>
                    {field.value} - {currencies[(field.value as string) as keyof typeof currencies].name}
                  </span>
                ) : field.value ? (
                  <span>{field.value}</span>
                ) : (
                  <span className="text-gray-500">{placeholder}</span>
                )}
              </Select.Value>
              <Select.Icon>
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </Select.Icon>
            </Select.Trigger>

            <Select.Portal>
              <Select.Content className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-80 overflow-y-auto">
                <Select.Viewport>
                  {needsCurrentItem && (
                    <Select.Group>
                      <Select.Label className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400">Current</Select.Label>
                      <Select.Item value={currentValue} className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer outline-none">
                        <Select.ItemText>{currentValue} - {currentName}</Select.ItemText>
                        <Select.ItemIndicator className="ml-auto">
                          <Check className="h-4 w-4" />
                        </Select.ItemIndicator>
                      </Select.Item>
                    </Select.Group>
                  )}
                  <Select.Group>
                    <Select.Label className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400">North America</Select.Label>
                    {Object.entries(currencies)
                      .filter(([code]) => ['USD', 'CAD', 'MXN'].includes(code))
                      .map(([code, currency]) => (
                        <Select.Item key={code} value={code} className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer outline-none">
                          <Select.ItemText>{code} - {currency.name}</Select.ItemText>
                          <Select.ItemIndicator className="ml-auto">
                            <Check className="h-4 w-4" />
                          </Select.ItemIndicator>
                        </Select.Item>
                      ))}
                  </Select.Group>

                  <Select.Separator className="h-px bg-gray-200 dark:bg-gray-700 my-1" />

                  <Select.Group>
                    <Select.Label className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400">Caribbean</Select.Label>
                    {Object.entries(currencies)
                      .filter(([code]) => ['DOP', 'CUP', 'JMD', 'HTG', 'TTD', 'BBD'].includes(code))
                      .map(([code, currency]) => (
                        <Select.Item key={code} value={code} className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer outline-none">
                          <Select.ItemText>{code} - {currency.name}</Select.ItemText>
                          <Select.ItemIndicator className="ml-auto">
                            <Check className="h-4 w-4" />
                          </Select.ItemIndicator>
                        </Select.Item>
                      ))}
                  </Select.Group>

                  <Select.Separator className="h-px bg-gray-200 dark:bg-gray-700 my-1" />

                  <Select.Group>
                    <Select.Label className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400">Central America</Select.Label>
                    {Object.entries(currencies)
                      .filter(([code]) => ['GTQ', 'HNL', 'NIO', 'CRC', 'PAB', 'BZD'].includes(code))
                      .map(([code, currency]) => (
                        <Select.Item key={code} value={code} className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer outline-none">
                          <Select.ItemText>{code} - {currency.name}</Select.ItemText>
                          <Select.ItemIndicator className="ml-auto">
                            <Check className="h-4 w-4" />
                          </Select.ItemIndicator>
                        </Select.Item>
                      ))}
                  </Select.Group>

                  <Select.Separator className="h-px bg-gray-200 dark:bg-gray-700 my-1" />

                  <Select.Group>
                    <Select.Label className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400">South America</Select.Label>
                    {Object.entries(currencies)
                      .filter(([code]) => ['ARS', 'BRL', 'CLP', 'COP', 'PEN', 'UYU', 'PYG', 'BOB', 'VES', 'GYD', 'SRD'].includes(code))
                      .map(([code, currency]) => (
                        <Select.Item key={code} value={code} className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer outline-none">
                          <Select.ItemText>{code} - {currency.name}</Select.ItemText>
                          <Select.ItemIndicator className="ml-auto">
                            <Check className="h-4 w-4" />
                          </Select.ItemIndicator>
                        </Select.Item>
                      ))}
                  </Select.Group>

                  <Select.Separator className="h-px bg-gray-200 dark:bg-gray-700 my-1" />

                  <Select.Group>
                    <Select.Label className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400">Europe</Select.Label>
                    {Object.entries(currencies)
                      .filter(([code]) => ['EUR', 'GBP'].includes(code))
                      .map(([code, currency]) => (
                        <Select.Item key={code} value={code} className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer outline-none">
                          <Select.ItemText>{code} - {currency.name}</Select.ItemText>
                          <Select.ItemIndicator className="ml-auto">
                            <Check className="h-4 w-4" />
                          </Select.ItemIndicator>
                        </Select.Item>
                      ))}
                  </Select.Group>
                </Select.Viewport>
              </Select.Content>
            </Select.Portal>
          </Select.Root>
          );
        }}
      />
    </div>
  );
}
