'use client';

import { useState } from 'react';
import { useI18n } from '@/contexts/I18nContext';
import { Check, X } from 'lucide-react';
import { ShippingRate } from '../ShippingConfiguration';

interface EditRateInlineProps {
  rate: ShippingRate;
  primaryColor: string;
  onSave: (updates: Partial<ShippingRate>) => void;
  onCancel: () => void;
}

export function EditRateInline({ rate, primaryColor, onSave, onCancel }: EditRateInlineProps) {
  const { t } = useI18n();
  const [condition, setCondition] = useState(rate.condition);
  const [price, setPrice] = useState(rate.price.toString());
  const [minWeight, setMinWeight] = useState('');
  const [maxWeight, setMaxWeight] = useState('');
  const [percentage, setPercentage] = useState('');
  const [country, setCountry] = useState('');

  // Parse initial values based on rate type
  useState(() => {
    if (rate.rateType === 'weight' && rate.condition) {
      const match = rate.condition.match(/(\d+)kg-(\d+)kg/);
      if (match) {
        setMinWeight(match[1]);
        setMaxWeight(match[2]);
      }
    } else if (rate.rateType === 'vat' && rate.condition) {
      const match = rate.condition.match(/(\d+)%/);
      if (match) {
        setPercentage(match[1]);
      }
    } else if (rate.rateType === 'duty' && rate.condition) {
      setCountry(rate.condition);
    }
  });

  const handleSave = () => {
    let newCondition = condition;
    
    if (rate.rateType === 'weight') {
      if (minWeight && maxWeight) {
        newCondition = `${minWeight}kg-${maxWeight}kg`;
      }
    } else if (rate.rateType === 'vat') {
      if (percentage) {
        newCondition = `${percentage}%`;
      }
    } else if (rate.rateType === 'duty') {
      newCondition = country;
    }

    onSave({
      condition: newCondition,
      price: parseFloat(price) || 0
    });
  };

  const getRateTypeName = (type: string) => {
    switch (type) {
      case 'weight':
        return t('empresa.shipping.rateType.weight', 'Weight');
      case 'vat':
        return t('empresa.shipping.rateType.vat', 'VAT');
      case 'duty':
        return t('empresa.shipping.rateType.duty', 'Duty');
      default:
        return type;
    }
  };

  return (
    <>
      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
        {getRateTypeName(rate.rateType)}
      </td>
      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
        {rate.rateType === 'weight' ? (
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={minWeight}
              onChange={(e) => setMinWeight(e.target.value)}
              placeholder="Min"
              className="w-16 px-2 py-1 text-sm border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <span className="text-gray-500">-</span>
            <input
              type="number"
              value={maxWeight}
              onChange={(e) => setMaxWeight(e.target.value)}
              placeholder="Max"
              className="w-16 px-2 py-1 text-sm border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <span className="text-sm text-gray-500">kg</span>
          </div>
        ) : rate.rateType === 'vat' ? (
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={percentage}
              onChange={(e) => setPercentage(e.target.value)}
              placeholder="0"
              className="w-20 px-2 py-1 text-sm border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <span className="text-sm text-gray-500">%</span>
          </div>
        ) : rate.rateType === 'duty' ? (
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="px-2 py-1 text-sm border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="">Select country</option>
            <option value="Japan">Japan</option>
            <option value="China">China</option>
            <option value="Canada">Canada</option>
            <option value="Mexico">Mexico</option>
            <option value="UK">United Kingdom</option>
            <option value="Germany">Germany</option>
            <option value="France">France</option>
          </select>
        ) : (
          <input
            type="text"
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            className="w-full px-2 py-1 text-sm border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        )}
      </td>
      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-1">
          <span className="text-sm text-gray-500">$</span>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0.00"
            className="w-20 px-2 py-1 text-sm border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
      </td>
      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right">
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={handleSave}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            style={{ color: primaryColor }}
          >
            <Check className="h-4 w-4" />
          </button>
          <button
            onClick={onCancel}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </td>
    </>
  );
}