'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/contexts/I18nContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/Avatar';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft,
  Search,
  Plus,
  Minus,
  Trash2,
  User,
  Package,
  MapPin,
  CreditCard,
  ShoppingCart,
  Calculator,
  X,
  ChevronDown
} from 'lucide-react';

interface Customer {
  id: number;
  fullName: string;
  email: string;
  phone?: string;
  avatar?: string;
  customerId: string;
  country?: string;
  defaultShippingAddress?: Address;
  defaultBillingAddress?: Address;
}

interface Product {
  id: number;
  name: string;
  sku?: string;
  basePrice: number;
  images?: string[];
  stock: number;
  description?: string;
  productType?: string;
}

interface OrderItem {
  productId: number;
  productName: string;
  productImage?: string;
  productSku: string;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
  taxAmount: number;
  totalPrice: number;
  notes?: string;
}

interface Address {
  street: string;
  apartment?: string;
  city: string;
  state?: string;
  postalCode?: string;
  country: string;
  phone?: string;
}

export default function NewOrderPage() {
  const { t, locale } = useI18n();
  const router = useRouter();
  
  // Refs for click outside
  const customerDropdownRef = useRef<HTMLDivElement>(null);
  const productDropdownRef = useRef<HTMLDivElement>(null);
  
  // State
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  
  // Customer State
  const [customerSearch, setCustomerSearch] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  
  // Products State
  const [productSearch, setProductSearch] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  
  // Address State
  const [shippingAddress, setShippingAddress] = useState<Address>({
    street: '',
    apartment: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    phone: ''
  });
  
  const [billingAddress, setBillingAddress] = useState<Address>({
    street: '',
    apartment: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    phone: ''
  });
  
  const [sameAsShipping, setSameAsShipping] = useState(true);
  
  // Payment State
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [paymentNotes, setPaymentNotes] = useState('');
  
  // Order State
  const [orderNotes, setOrderNotes] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [taxPercent, setTaxPercent] = useState(10);
  const [shippingAmount, setShippingAmount] = useState(0);
  
  // Calculations
  const subTotal = orderItems.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  const discountAmount = (subTotal * discountPercent) / 100;
  const taxableAmount = subTotal - discountAmount;
  const taxAmount = (taxableAmount * taxPercent) / 100;
  const totalAmount = taxableAmount + taxAmount + shippingAmount;

  // Mark step as completed when moving forward
  const goToStep = (stepNumber: number) => {
    if (stepNumber > currentStep && !completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep]);
    }
    setCurrentStep(stepNumber);
  };

  // Check if user can navigate to a step
  const canNavigateToStep = (stepNumber: number) => {
    // Can always go back
    if (stepNumber <= currentStep) return true;
    // Can go forward one step
    if (stepNumber === currentStep + 1) return true;
    // Can go to any completed step
    if (completedSteps.includes(stepNumber)) return true;
    return false;
  };

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (customerDropdownRef.current && !customerDropdownRef.current.contains(event.target as Node)) {
        setShowCustomerDropdown(false);
      }
      if (productDropdownRef.current && !productDropdownRef.current.contains(event.target as Node)) {
        setShowProductDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search customers with debounce
  useEffect(() => {
    // Don't search if a customer is already selected and the search matches their name
    if (selectedCustomer && customerSearch === selectedCustomer.fullName) {
      return;
    }
    
    const timer = setTimeout(() => {
      searchCustomers();
      if (customerSearch.length > 0 && !selectedCustomer) {
        setShowCustomerDropdown(true);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [customerSearch, selectedCustomer]);

  // Load initial customers when dropdown opens
  useEffect(() => {
    if (showCustomerDropdown && customers.length === 0 && customerSearch.length === 0) {
      searchCustomers();
    }
  }, [showCustomerDropdown]);

  const searchCustomers = async () => {
    try {
      setLoadingCustomers(true);
      const searchParam = customerSearch ? `search=${customerSearch}&` : '';
      const response = await fetch(`http://localhost:5266/api/customers?${searchParam}size=10`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setCustomers(data.items || data || []);
      }
    } catch (error) {
      console.error('Error searching customers:', error);
    } finally {
      setLoadingCustomers(false);
    }
  };

  // Search products with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      searchProducts();
      if (productSearch.length > 0) {
        setShowProductDropdown(true);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [productSearch]);

  // Load initial products when dropdown opens
  useEffect(() => {
    if (showProductDropdown && products.length === 0 && productSearch.length === 0) {
      searchProducts();
    }
  }, [showProductDropdown]);

  const searchProducts = async () => {
    try {
      setLoadingProducts(true);
      const searchParam = productSearch ? `search=${productSearch}&` : '';
      const response = await fetch(`http://localhost:5266/api/products?${searchParam}pageSize=10`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setProducts(data.items || data || []);
      }
    } catch (error) {
      console.error('Error searching products:', error);
    } finally {
      setLoadingProducts(false);
    }
  };

  const selectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setCustomerSearch(''); // Clear search instead of setting to customer name
    setShowCustomerDropdown(false);
    setCustomers([]); // Clear the customer list
    
    // Auto-fill addresses if available
    if (customer.defaultShippingAddress) {
      setShippingAddress(customer.defaultShippingAddress);
    }
    if (customer.defaultBillingAddress) {
      setBillingAddress(customer.defaultBillingAddress);
    }
  };

  const addProduct = (product: Product) => {
    const existingItem = orderItems.find(item => item.productId === product.id);
    
    // Close dropdown and clear search
    setProductSearch('');
    setShowProductDropdown(false);
    setProducts([]);
    
    if (existingItem) {
      updateQuantity(product.id, existingItem.quantity + 1);
    } else {
      const newItem: OrderItem = {
        productId: product.id,
        productName: product.name,
        productImage: product.images?.[0],
        productSku: product.sku || '',
        quantity: 1,
        unitPrice: product.basePrice,
        discountAmount: 0,
        taxAmount: 0,
        totalPrice: product.basePrice,
        notes: ''
      };
      setOrderItems([...orderItems, newItem]);
    }
    setShowProductDropdown(false);
    setProductSearch('');
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeProduct(productId);
      return;
    }
    
    setOrderItems(items => items.map(item => {
      if (item.productId === productId) {
        const totalPrice = item.unitPrice * quantity;
        return { ...item, quantity, totalPrice };
      }
      return item;
    }));
  };

  const removeProduct = (productId: number) => {
    setOrderItems(items => items.filter(item => item.productId !== productId));
  };

  const handleSubmit = async () => {
    if (!selectedCustomer) {
      alert(t('selectCustomerFirst'));
      return;
    }
    
    if (orderItems.length === 0) {
      alert(t('addProductsFirst'));
      return;
    }

    try {
      setIsLoading(true);
      
      const orderData = {
        customerId: selectedCustomer.id,
        orderStatus: 'Pending',
        paymentStatus: 'Pending',
        deliveryStatus: 'Pending',
        paymentMethod: paymentMethod,
        subTotal: subTotal,
        discountAmount: discountAmount,
        taxAmount: taxAmount,
        shippingAmount: shippingAmount,
        totalAmount: totalAmount,
        currency: 'USD',
        notes: orderNotes,
        items: orderItems.map(item => ({
          productId: item.productId,
          productName: item.productName,
          productImage: item.productImage,
          productSku: item.productSku,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discountAmount: item.discountAmount,
          taxAmount: item.taxAmount,
          totalPrice: item.totalPrice,
          notes: item.notes
        })),
        shippingAddress: shippingAddress,
        billingAddress: sameAsShipping ? shippingAddress : billingAddress
      };

      const response = await fetch('http://localhost:5266/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) throw new Error('Failed to create order');

      const result = await response.json();
      alert(t('createSuccess'));
      router.push(`/dashboard/orders/${result.id}`);
    } catch (error) {
      console.error('Error creating order:', error);
      alert(t('createError'));
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(locale === 'es' ? 'es-ES' : 'en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                {t('createOrder')}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                {t('createOrderSubtitle')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps - Mobile Responsive */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            {[1, 2, 3, 4, 5].map((stepNum) => {
              const isCompleted = completedSteps.includes(stepNum);
              const isCurrent = currentStep === stepNum;
              const canNavigate = canNavigateToStep(stepNum);
              
              return (
                <div key={stepNum} className="flex items-center flex-1">
                  <button
                    onClick={() => canNavigate && goToStep(stepNum)}
                    disabled={!canNavigate}
                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                      isCurrent
                        ? 'bg-primary text-white shadow-lg ring-2 ring-primary ring-offset-2 scale-110' 
                        : isCompleted
                          ? 'bg-green-500 text-white hover:bg-green-600 cursor-pointer'
                          : canNavigate
                            ? 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-400 dark:hover:bg-gray-500 cursor-pointer'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-50'
                    }`}
                  >
                    {isCompleted ? '✓' : stepNum}
                  </button>
                  {stepNum < 5 && (
                    <div className={`flex-1 h-0.5 mx-1 sm:mx-2 transition-colors ${
                      completedSteps.includes(stepNum) ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex justify-center mt-2 text-sm text-gray-600 dark:text-gray-400">
            <span>
              {currentStep === 1 && t('selectCustomer')}
              {currentStep === 2 && t('addProducts')}
              {currentStep === 3 && t('shippingAddress')}
              {currentStep === 4 && t('billingPayment')}
              {currentStep === 5 && t('reviewOrder')}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Form Steps */}
          <div className="lg:col-span-2">
            {/* Step 1: Select Customer */}
            {currentStep === 1 && (
              <Card className="shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <User className="h-5 w-5 text-gray-500" />
                    {t('selectCustomer')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Customer Search Dropdown */}
                  <div className="relative" ref={customerDropdownRef}>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <input
                        type="text"
                        placeholder={t('searchCustomer')}
                        value={customerSearch}
                        onChange={(e) => setCustomerSearch(e.target.value)}
                        onFocus={() => setShowCustomerDropdown(true)}
                        onClick={() => setShowCustomerDropdown(true)}
                        className="w-full pl-10 pr-10 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                      />
                      <ChevronDown 
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 cursor-pointer hover:text-gray-600 dark:hover:text-gray-300"
                        onClick={() => setShowCustomerDropdown(!showCustomerDropdown)}
                      />
                    </div>

                    {/* Dropdown Results */}
                    {showCustomerDropdown && (
                      <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl max-h-64 overflow-y-auto">
                        {loadingCustomers ? (
                          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                            {t('common.loading')}...
                          </div>
                        ) : customers.length > 0 ? (
                          customers.map(customer => (
                            <button
                              key={customer.id}
                              onClick={() => selectCustomer(customer)}
                              className="w-full p-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left border-b border-gray-100 dark:border-gray-700 last:border-0"
                            >
                              <Avatar 
                                src={customer.avatar} 
                                name={customer.fullName}
                                size="md"
                                className="h-10 w-10 flex-shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 dark:text-white truncate">
                                  {customer.fullName}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                  {customer.email}
                                </p>
                              </div>
                              {customer.country && (
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {customer.country}
                                </span>
                              )}
                            </button>
                          ))
                        ) : customerSearch.length > 0 ? (
                          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                            {t('common.noResults')}
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>

                  {/* Selected Customer Display */}
                  {selectedCustomer && (
                    <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar 
                            src={selectedCustomer.avatar} 
                            name={selectedCustomer.fullName}
                            size="lg"
                            className="h-12 w-12"
                          />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {selectedCustomer.fullName}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {selectedCustomer.email}
                            </p>
                            {selectedCustomer.phone && (
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {selectedCustomer.phone}
                              </p>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedCustomer(null);
                            setCustomerSearch('');
                          }}
                          className="hover:bg-gray-200 dark:hover:bg-gray-600"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end pt-4">
                    <Button
                      onClick={() => goToStep(2)}
                      disabled={!selectedCustomer}
                      className="bg-orange-500 hover:bg-orange-600 text-white"
                    >
                      {t('common.next')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Add Products */}
            {currentStep === 2 && (
              <Card className="shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Package className="h-5 w-5 text-gray-500" />
                    {t('addProducts')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Product Search */}
                  <div className="relative" ref={productDropdownRef}>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <input
                        type="text"
                        placeholder={t('searchProducts')}
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        onFocus={() => setShowProductDropdown(true)}
                        onClick={() => setShowProductDropdown(true)}
                        className="w-full pl-10 pr-10 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                      />
                      <ChevronDown 
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 cursor-pointer hover:text-gray-600 dark:hover:text-gray-300"
                        onClick={() => setShowProductDropdown(!showProductDropdown)}
                      />
                    </div>

                    {/* Product Dropdown */}
                    {showProductDropdown && (
                      <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl max-h-64 overflow-y-auto">
                        {loadingProducts ? (
                          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                            {t('common.loading')}...
                          </div>
                        ) : products.length > 0 ? (
                          products.map(product => (
                            <button
                              key={product.id}
                              onClick={() => addProduct(product)}
                              className="w-full p-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left border-b border-gray-100 dark:border-gray-700 last:border-0"
                            >
                              {product.images?.[0] ? (
                                <img 
                                  src={product.images[0]} 
                                  alt={product.name}
                                  className="w-12 h-12 object-cover rounded"
                                />
                              ) : (
                                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center">
                                  <Package className="h-6 w-6 text-gray-400" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 dark:text-white truncate">
                                  {product.name}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {product.sku ? `SKU: ${product.sku} • ` : ''}{t('inStock')}: {product.stock}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-medium text-gray-900 dark:text-white">
                                  {formatCurrency(product.basePrice)}
                                </p>
                              </div>
                            </button>
                          ))
                        ) : productSearch.length > 0 ? (
                          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                            {t('common.noResults')}
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>

                  {/* Order Items List */}
                  {orderItems.length > 0 ? (
                    <div className="space-y-3">
                      {orderItems.map(item => (
                        <div key={item.productId} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          {item.productImage ? (
                            <img 
                              src={item.productImage} 
                              alt={item.productName}
                              className="w-16 h-16 object-cover rounded"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center">
                              <Package className="h-8 w-8 text-gray-400" />
                            </div>
                          )}
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 dark:text-white">
                              {item.productName}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              SKU: {item.productSku} • {formatCurrency(item.unitPrice)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                              className="h-8 w-8"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-12 text-center font-medium">{item.quantity}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                              className="h-8 w-8"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900 dark:text-white">
                              {formatCurrency(item.totalPrice)}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeProduct(item.productId)}
                            className="h-8 w-8 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <Package className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                      {t('noProductsAdded')}
                    </div>
                  )}

                  <div className="flex justify-between pt-4">
                    <Button variant="ghost" onClick={() => goToStep(1)}>
                      {t('common.back')}
                    </Button>
                    <Button
                      onClick={() => goToStep(3)}
                      disabled={orderItems.length === 0}
                      className="bg-orange-500 hover:bg-orange-600 text-white"
                    >
                      {t('common.next')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Shipping Address */}
            {currentStep === 3 && (
              <Card className="shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <MapPin className="h-5 w-5 text-gray-500" />
                    {t('shippingAddress')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('street')} *
                      </label>
                      <input
                        type="text"
                        value={shippingAddress.street}
                        onChange={(e) => setShippingAddress({...shippingAddress, street: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('apartment')}
                      </label>
                      <input
                        type="text"
                        value={shippingAddress.apartment}
                        onChange={(e) => setShippingAddress({...shippingAddress, apartment: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('city')} *
                      </label>
                      <input
                        type="text"
                        value={shippingAddress.city}
                        onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('state')}
                      </label>
                      <input
                        type="text"
                        value={shippingAddress.state}
                        onChange={(e) => setShippingAddress({...shippingAddress, state: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('postalCode')}
                      </label>
                      <input
                        type="text"
                        value={shippingAddress.postalCode}
                        onChange={(e) => setShippingAddress({...shippingAddress, postalCode: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('country')} *
                      </label>
                      <input
                        type="text"
                        value={shippingAddress.country}
                        onChange={(e) => setShippingAddress({...shippingAddress, country: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('phone')}
                      </label>
                      <input
                        type="tel"
                        value={shippingAddress.phone}
                        onChange={(e) => setShippingAddress({...shippingAddress, phone: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button variant="ghost" onClick={() => goToStep(2)}>
                      {t('common.back')}
                    </Button>
                    <Button 
                      onClick={() => goToStep(4)}
                      className="bg-orange-500 hover:bg-orange-600 text-white"
                    >
                      {t('common.next')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 4: Billing & Payment */}
            {currentStep === 4 && (
              <Card className="shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <CreditCard className="h-5 w-5 text-gray-500" />
                    {t('billingPayment')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Billing Address */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <input
                        type="checkbox"
                        id="sameAsShipping"
                        checked={sameAsShipping}
                        onChange={(e) => setSameAsShipping(e.target.checked)}
                        className="rounded border-gray-300 dark:border-gray-600 text-primary focus:ring-primary"
                      />
                      <label htmlFor="sameAsShipping" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t('sameAsShipping')}
                      </label>
                    </div>

                    {!sameAsShipping && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {t('street')} *
                          </label>
                          <input
                            type="text"
                            value={billingAddress.street}
                            onChange={(e) => setBillingAddress({...billingAddress, street: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {t('city')} *
                          </label>
                          <input
                            type="text"
                            value={billingAddress.city}
                            onChange={(e) => setBillingAddress({...billingAddress, city: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {t('postalCode')}
                          </label>
                          <input
                            type="text"
                            value={billingAddress.postalCode}
                            onChange={(e) => setBillingAddress({...billingAddress, postalCode: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Payment Method */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      {t('paymentMethod')}
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {['card', 'cash', 'transfer', 'paypal'].map(method => (
                        <button
                          key={method}
                          type="button"
                          onClick={() => {
                            console.log('Payment method selected:', method);
                            setPaymentMethod(method);
                          }}
                          className={`p-3 rounded-lg border-2 transition-all cursor-pointer ${
                            paymentMethod === method 
                              ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 ring-2 ring-orange-500/50' 
                              : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 bg-white dark:bg-gray-800'
                          }`}
                        >
                          <div className="text-2xl mb-1">
                            {method === 'card' && '💳'}
                            {method === 'cash' && '💵'}
                            {method === 'transfer' && '🏦'}
                            {method === 'paypal' && '🅿️'}
                          </div>
                          <p className={`text-xs capitalize ${
                            paymentMethod === method
                              ? 'text-orange-600 dark:text-orange-400 font-semibold'
                              : 'text-gray-700 dark:text-gray-300'
                          }`}>
                            {t(`payment.${method}`) || method}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('paymentNotes')}
                    </label>
                    <textarea
                      value={paymentNotes}
                      onChange={(e) => setPaymentNotes(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                    />
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button variant="ghost" onClick={() => goToStep(3)}>
                      {t('common.back')}
                    </Button>
                    <Button 
                      onClick={() => goToStep(5)}
                      className="bg-orange-500 hover:bg-orange-600 text-white"
                    >
                      {t('common.next')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 5: Review & Confirm */}
            {currentStep === 5 && (
              <Card className="shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <ShoppingCart className="h-5 w-5 text-gray-500" />
                    {t('reviewOrder')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Order Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('notes')}
                    </label>
                    <textarea
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                      placeholder={t('notesPlaceholder')}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                    />
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button variant="ghost" onClick={() => goToStep(4)}>
                      {t('common.back')}
                    </Button>
                    <Button 
                      onClick={handleSubmit} 
                      disabled={isLoading}
                      className="bg-orange-500 hover:bg-orange-600 text-white"
                    >
                      {isLoading ? (
                        <span className="flex items-center gap-2">
                          <span className="animate-spin">⏳</span>
                          {t('common.processing')}
                        </span>
                      ) : (
                        t('createOrder')
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <Card className="shadow-sm sticky top-6">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calculator className="h-5 w-5 text-gray-500" />
                  {t('orderSummary')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Adjustments */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('discount')} (%)
                    </label>
                    <input
                      type="number"
                      value={discountPercent}
                      onChange={(e) => setDiscountPercent(parseFloat(e.target.value) || 0)}
                      min="0"
                      max="100"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('tax')} (%)
                    </label>
                    <input
                      type="number"
                      value={taxPercent}
                      onChange={(e) => setTaxPercent(parseFloat(e.target.value) || 0)}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('shippingCost')}
                    </label>
                    <input
                      type="number"
                      value={shippingAmount}
                      onChange={(e) => setShippingAmount(parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                    />
                  </div>
                </div>

                <Separator />

                {/* Summary Calculations */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">{t('subtotal')}</span>
                    <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(subTotal)}</span>
                  </div>
                  
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600 dark:text-green-400">
                        {t('orders.discount')} ({discountPercent}%)
                      </span>
                      <span className="font-medium text-green-600 dark:text-green-400">
                        -{formatCurrency(discountAmount)}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      {t('orders.tax')} ({taxPercent}%)
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(taxAmount)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">{t('orders.shipping.cost')}</span>
                    <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(shippingAmount)}</span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between pt-2">
                    <span className="font-semibold text-gray-900 dark:text-white">{t('total')}</span>
                    <span className="font-semibold text-xl text-gray-900 dark:text-white">
                      {formatCurrency(totalAmount)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}