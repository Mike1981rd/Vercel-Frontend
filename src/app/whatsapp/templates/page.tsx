'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/contexts/I18nContext';
import WhatsAppNav from '../components/WhatsAppNav';
import { ArrowLeft, Plus, Search, FileText, Clock, Eye, Edit2, Trash2, Copy, Send, Filter } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { getApiEndpoint } from '@/lib/api-url';

interface Template {
  id: string;
  name: string;
  category: 'greeting' | 'order' | 'support' | 'marketing' | 'custom';
  content: string;
  variables: string[];
  usageCount: number;
  lastUsed: Date | null;
  createdAt: Date;
  isActive: boolean;
  language: 'es' | 'en';
}

const categoryColors = {
  greeting: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  order: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  support: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  marketing: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  custom: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
};

const categoryLabels = {
  greeting: 'Saludo',
  order: 'Pedidos',
  support: 'Soporte',
  marketing: 'Marketing',
  custom: 'Personalizado'
};

export default function WhatsAppTemplatesPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    category: 'greeting' as Template['category'],
    content: '',
    language: 'es' as Template['language']
  });

  useEffect(() => {
    // Load templates from localStorage or API
    const savedTemplates = localStorage.getItem('whatsapp_templates');
    if (savedTemplates) {
      setTemplates(JSON.parse(savedTemplates));
    } else {
      // Default templates
      setTemplates([
        {
          id: '1',
          name: 'Bienvenida nuevo cliente',
          category: 'greeting',
          content: 'Hola {{nombre}}! 👋 Bienvenido a nuestro hotel. Estamos encantados de tenerte con nosotros. ¿En qué puedo ayudarte hoy?',
          variables: ['nombre'],
          usageCount: 245,
          lastUsed: new Date('2024-03-15'),
          createdAt: new Date('2024-01-10'),
          isActive: true,
          language: 'es'
        },
        {
          id: '2',
          name: 'Confirmación de reserva',
          category: 'order',
          content: 'Hola {{nombre}}, tu reserva para el {{fecha}} ha sido confirmada. Número de confirmación: {{numero}}. Te esperamos!',
          variables: ['nombre', 'fecha', 'numero'],
          usageCount: 189,
          lastUsed: new Date('2024-03-14'),
          createdAt: new Date('2024-01-15'),
          isActive: true,
          language: 'es'
        },
        {
          id: '3',
          name: 'Soporte técnico',
          category: 'support',
          content: 'Hola {{nombre}}, hemos recibido tu solicitud de soporte #{{ticket}}. Un agente te atenderá en breve.',
          variables: ['nombre', 'ticket'],
          usageCount: 67,
          lastUsed: new Date('2024-03-13'),
          createdAt: new Date('2024-02-01'),
          isActive: true,
          language: 'es'
        }
      ]);
    }
  }, []);

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const extractVariables = (content: string): string[] => {
    const regex = /\{\{(\w+)\}\}/g;
    const variables: string[] = [];
    let match;
    while ((match = regex.exec(content)) !== null) {
      if (!variables.includes(match[1])) {
        variables.push(match[1]);
      }
    }
    return variables;
  };

  const handleSaveTemplate = () => {
    const variables = extractVariables(formData.content);
    
    if (editingTemplate) {
      // Update existing template
      const updatedTemplates = templates.map(t => 
        t.id === editingTemplate.id 
          ? { ...t, ...formData, variables, lastUsed: t.lastUsed }
          : t
      );
      setTemplates(updatedTemplates);
      localStorage.setItem('whatsapp_templates', JSON.stringify(updatedTemplates));
      toast.success('Plantilla actualizada correctamente');
    } else {
      // Create new template
      const newTemplate: Template = {
        id: Date.now().toString(),
        ...formData,
        variables,
        usageCount: 0,
        lastUsed: null,
        createdAt: new Date(),
        isActive: true
      };
      const updatedTemplates = [...templates, newTemplate];
      setTemplates(updatedTemplates);
      localStorage.setItem('whatsapp_templates', JSON.stringify(updatedTemplates));
      toast.success('Plantilla creada correctamente');
    }
    
    setIsCreateDialogOpen(false);
    setEditingTemplate(null);
    setFormData({ name: '', category: 'greeting', content: '', language: 'es' });
  };

  const handleDeleteTemplate = (id: string) => {
    const updatedTemplates = templates.filter(t => t.id !== id);
    setTemplates(updatedTemplates);
    localStorage.setItem('whatsapp_templates', JSON.stringify(updatedTemplates));
    toast.success('Plantilla eliminada');
  };

  const handleDuplicateTemplate = (template: Template) => {
    const newTemplate: Template = {
      ...template,
      id: Date.now().toString(),
      name: `${template.name} (copia)`,
      usageCount: 0,
      lastUsed: null,
      createdAt: new Date()
    };
    const updatedTemplates = [...templates, newTemplate];
    setTemplates(updatedTemplates);
    localStorage.setItem('whatsapp_templates', JSON.stringify(updatedTemplates));
    toast.success('Plantilla duplicada');
  };

  const handleToggleActive = (id: string) => {
    const updatedTemplates = templates.map(t => 
      t.id === id ? { ...t, isActive: !t.isActive } : t
    );
    setTemplates(updatedTemplates);
    localStorage.setItem('whatsapp_templates', JSON.stringify(updatedTemplates));
  };

  return (
    <div className="w-full h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Elegant minimal header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/whatsapp/chat')}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 group"
              aria-label="Volver al chat"
            >
              <ArrowLeft className="h-6 w-6 text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors" />
            </button>
            
            <div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                Plantillas de Mensajes
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                Gestiona plantillas de mensajes predefinidos para respuestas rápidas
              </p>
            </div>
          </div>

          {/* Status indicator */}
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 rounded-full bg-purple-500 animate-pulse"></div>
            <span className="text-xs text-gray-500 dark:text-gray-400">{templates.length} plantillas activas</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="px-6 pt-4">
        <WhatsAppNav />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden p-6">
        <div className="h-full flex flex-col">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar plantillas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="greeting">Saludo</SelectItem>
                <SelectItem value="order">Pedidos</SelectItem>
                <SelectItem value="support">Soporte</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="custom">Personalizado</SelectItem>
              </SelectContent>
            </Select>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => {
                  setEditingTemplate(null);
                  setFormData({ name: '', category: 'greeting', content: '', language: 'es' });
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Plantilla
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>
                    {editingTemplate ? 'Editar Plantilla' : 'Nueva Plantilla'}
                  </DialogTitle>
                  <DialogDescription>
                    Usa {"{{variable}}"} para crear campos dinámicos
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Nombre</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ej: Bienvenida nuevo cliente"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="category">Categoría</Label>
                    <Select 
                      value={formData.category} 
                      onValueChange={(value) => setFormData({ ...formData, category: value as Template['category'] })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="greeting">Saludo</SelectItem>
                        <SelectItem value="order">Pedidos</SelectItem>
                        <SelectItem value="support">Soporte</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="custom">Personalizado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="language">Idioma</Label>
                    <Select 
                      value={formData.language} 
                      onValueChange={(value) => setFormData({ ...formData, language: value as Template['language'] })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="es">Español</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="content">Contenido</Label>
                    <Textarea
                      id="content"
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      placeholder="Hola {{nombre}}, gracias por contactarnos..."
                      rows={5}
                    />
                  </div>
                  {formData.content && extractVariables(formData.content).length > 0 && (
                    <div className="flex gap-2">
                      <span className="text-sm text-gray-500">Variables detectadas:</span>
                      {extractVariables(formData.content).map(v => (
                        <Badge key={v} variant="secondary">{v}</Badge>
                      ))}
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSaveTemplate}>
                    {editingTemplate ? 'Actualizar' : 'Crear'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Templates Grid */}
          <ScrollArea className="flex-1">
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 pb-4">
              {filteredTemplates.map((template) => (
                <Card key={template.id} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <CardTitle className="text-base">{template.name}</CardTitle>
                        <div className="flex gap-2">
                          <Badge className={categoryColors[template.category]} variant="secondary">
                            {categoryLabels[template.category]}
                          </Badge>
                          <Badge variant="outline">{template.language.toUpperCase()}</Badge>
                          {!template.isActive && (
                            <Badge variant="destructive">Inactiva</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-3">
                      {template.content}
                    </p>
                    
                    {template.variables.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {template.variables.map(v => (
                          <Badge key={v} variant="outline" className="text-xs">
                            {"{{"}{v}{"}}"}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                      <span className="flex items-center gap-1">
                        <Send className="h-3 w-3" />
                        {template.usageCount} usos
                      </span>
                      {template.lastUsed && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(template.lastUsed).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setPreviewTemplate(template)}
                        className="flex-1"
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingTemplate(template);
                          setFormData({
                            name: template.name,
                            category: template.category,
                            content: template.content,
                            language: template.language
                          });
                          setIsCreateDialogOpen(true);
                        }}
                        className="flex-1"
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDuplicateTemplate(template)}
                        className="flex-1"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteTemplate(template.id)}
                        className="flex-1 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Preview Dialog */}
      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Vista previa: {previewTemplate?.name}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
              <div className="bg-white dark:bg-gray-900 rounded-lg p-3 shadow-sm">
                <p className="text-sm whitespace-pre-wrap">{previewTemplate?.content}</p>
              </div>
            </div>
            {previewTemplate?.variables && previewTemplate.variables.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-gray-500 mb-2">Variables disponibles:</p>
                <div className="flex flex-wrap gap-2">
                  {previewTemplate.variables.map(v => (
                    <Badge key={v} variant="secondary">{v}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewTemplate(null)}>
              Cerrar
            </Button>
            <Button onClick={() => {
              toast.success('Plantilla enviada al chat');
              setPreviewTemplate(null);
            }}>
              <Send className="h-4 w-4 mr-2" />
              Usar en chat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}