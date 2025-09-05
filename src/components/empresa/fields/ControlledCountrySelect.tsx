/**
 * @file ControlledCountrySelect.tsx
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
import { CountryFlag, countries } from '@/components/ui/CountryFlag';

export interface ControlledCountrySelectProps<FormValues extends FieldValues = FieldValues> {
  name: keyof FormValues & string;
  control: Control<FormValues>;
  label?: string;
  placeholder?: string;
  inputClassName?: string;
  inputFocusStyle?: React.CSSProperties;
}

export function ControlledCountrySelect<FormValues extends FieldValues = FieldValues>({
  name,
  control,
  label,
  placeholder = 'Country/region',
  inputClassName,
  inputFocusStyle,
}: ControlledCountrySelectProps<FormValues>) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">{label}</label>
      )}
      <Controller<FormValues>
        name={name as any}
        control={control as Control<FormValues>}
        render={({ field }) => {
          const currentValue = (field.value as string) || '';
          const listedCodes = new Set<string>([
            ...['US', 'CA', 'MX'],
            ...['DO', 'PR', 'CU', 'JM', 'HT', 'TT', 'BB'],
            ...['GT', 'SV', 'HN', 'NI', 'CR', 'PA', 'BZ'],
            ...['AR', 'BR', 'CL', 'CO', 'EC', 'PY', 'PE', 'UY', 'VE', 'BO', 'GY', 'SR', 'GF'],
            ...['ES', 'FR', 'DE', 'IT', 'PT', 'GB'],
          ]);
          const needsCurrentItem = !!currentValue && !listedCodes.has(currentValue);
          const currentName = countries[currentValue as keyof typeof countries]?.name || currentValue;

          return (
          <Select.Root key={`country-${currentValue || 'empty'}`} value={currentValue} onValueChange={field.onChange}>
            <Select.Trigger className={`${inputClassName} flex items-center justify-between overflow-hidden`} style={inputFocusStyle}>
              <Select.Value>
                {field.value && countries[(field.value as string) as keyof typeof countries] ? (
                  <div className="flex items-center gap-2">
                    <CountryFlag code={countries[(field.value as string) as keyof typeof countries].flag} />
                    <span>{countries[(field.value as string) as keyof typeof countries].name}</span>
                  </div>
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
                      <Select.Item value={currentValue} className="px-3 py-2 flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer outline-none">
                        <CountryFlag code={countries[currentValue as keyof typeof countries]?.flag || currentValue.toLowerCase()} />
                        <Select.ItemText>{currentName}</Select.ItemText>
                        <Select.ItemIndicator className="ml-auto">
                          <Check className="h-4 w-4" />
                        </Select.ItemIndicator>
                      </Select.Item>
                    </Select.Group>
                  )}
                  <Select.Group>
                    <Select.Label className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400">North America</Select.Label>
                    {Object.entries(countries)
                      .filter(([code]) => ['US', 'CA', 'MX'].includes(code))
                      .map(([code, country]) => (
                        <Select.Item key={code} value={code} className="px-3 py-2 flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer outline-none">
                          <CountryFlag code={country.flag} />
                          <Select.ItemText>{country.name}</Select.ItemText>
                          <Select.ItemIndicator className="ml-auto">
                            <Check className="h-4 w-4" />
                          </Select.ItemIndicator>
                        </Select.Item>
                      ))}
                  </Select.Group>

                  <Select.Separator className="h-px bg-gray-200 dark:bg-gray-700 my-1" />

                  <Select.Group>
                    <Select.Label className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400">Caribbean</Select.Label>
                    {Object.entries(countries)
                      .filter(([code]) => ['DO', 'PR', 'CU', 'JM', 'HT', 'TT', 'BB'].includes(code))
                      .map(([code, country]) => (
                        <Select.Item key={code} value={code} className="px-3 py-2 flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer outline-none">
                          <CountryFlag code={country.flag} />
                          <Select.ItemText>{country.name}</Select.ItemText>
                          <Select.ItemIndicator className="ml-auto">
                            <Check className="h-4 w-4" />
                          </Select.ItemIndicator>
                        </Select.Item>
                      ))}
                  </Select.Group>

                  <Select.Separator className="h-px bg-gray-200 dark:bg-gray-700 my-1" />

                  <Select.Group>
                    <Select.Label className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400">Central America</Select.Label>
                    {Object.entries(countries)
                      .filter(([code]) => ['GT', 'SV', 'HN', 'NI', 'CR', 'PA', 'BZ'].includes(code))
                      .map(([code, country]) => (
                        <Select.Item key={code} value={code} className="px-3 py-2 flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer outline-none">
                          <CountryFlag code={country.flag} />
                          <Select.ItemText>{country.name}</Select.ItemText>
                          <Select.ItemIndicator className="ml-auto">
                            <Check className="h-4 w-4" />
                          </Select.ItemIndicator>
                        </Select.Item>
                      ))}
                  </Select.Group>

                  <Select.Separator className="h-px bg-gray-200 dark:bg-gray-700 my-1" />

                  <Select.Group>
                    <Select.Label className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400">South America</Select.Label>
                    {Object.entries(countries)
                      .filter(([code]) => ['AR', 'BR', 'CL', 'CO', 'EC', 'PY', 'PE', 'UY', 'VE', 'BO', 'GY', 'SR', 'GF'].includes(code))
                      .map(([code, country]) => (
                        <Select.Item key={code} value={code} className="px-3 py-2 flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer outline-none">
                          <CountryFlag code={country.flag} />
                          <Select.ItemText>{country.name}</Select.ItemText>
                          <Select.ItemIndicator className="ml-auto">
                            <Check className="h-4 w-4" />
                          </Select.ItemIndicator>
                        </Select.Item>
                      ))}
                  </Select.Group>

                  <Select.Separator className="h-px bg-gray-200 dark:bg-gray-700 my-1" />

                  <Select.Group>
                    <Select.Label className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400">Europe</Select.Label>
                    {Object.entries(countries)
                      .filter(([code]) => ['ES', 'FR', 'DE', 'IT', 'PT', 'GB'].includes(code))
                      .map(([code, country]) => (
                        <Select.Item key={code} value={code} className="px-3 py-2 flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer outline-none">
                          <CountryFlag code={country.flag} />
                          <Select.ItemText>{country.name}</Select.ItemText>
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
