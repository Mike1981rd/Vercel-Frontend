'use client';

import React, { useEffect, useRef, useState } from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify,
  List,
  ListOrdered,
  Link,
  Image,
  Undo,
  Redo
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  primaryColor?: string;
  minHeight?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = 'Escribe el contenido de tu página aquí...',
  disabled = false,
  primaryColor = '#22c55e',
  minHeight = '400px'
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [selectedFont, setSelectedFont] = useState('Párrafo');
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    handleContentChange();
  };

  const handleContentChange = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const insertLink = () => {
    if (linkUrl && linkText) {
      execCommand('insertHTML', `<a href="${linkUrl}" target="_blank">${linkText}</a>`);
      setIsLinkModalOpen(false);
      setLinkUrl('');
      setLinkText('');
    }
  };

  const insertImage = () => {
    const url = prompt('Ingrese la URL de la imagen:');
    if (url) {
      execCommand('insertHTML', `<img src="${url}" alt="" style="max-width: 100%;" />`);
    }
  };

  const handleFontChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedFont(value);
    
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      let tag = 'p';
      
      switch(value) {
        case 'Título 1': tag = 'h1'; break;
        case 'Título 2': tag = 'h2'; break;
        case 'Título 3': tag = 'h3'; break;
        case 'Cita': tag = 'blockquote'; break;
        default: tag = 'p';
      }
      
      execCommand('formatBlock', tag);
    }
  };

  return (
    <div className="rich-text-editor border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="toolbar bg-gray-50 dark:bg-gray-700 border-b border-gray-300 dark:border-gray-600 p-2">
        <div className="flex flex-wrap items-center gap-1">
          {/* Font selector */}
          <select
            value={selectedFont}
            onChange={handleFontChange}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 dark:text-white"
            disabled={disabled}
          >
            <option>Párrafo</option>
            <option>Título 1</option>
            <option>Título 2</option>
            <option>Título 3</option>
            <option>Cita</option>
          </select>

          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

          {/* Text formatting */}
          <button
            onClick={() => execCommand('bold')}
            disabled={disabled}
            className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
            title="Negrita"
          >
            <Bold className="w-4 h-4 dark:text-white" />
          </button>
          <button
            onClick={() => execCommand('italic')}
            disabled={disabled}
            className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
            title="Cursiva"
          >
            <Italic className="w-4 h-4 dark:text-white" />
          </button>
          <button
            onClick={() => execCommand('underline')}
            disabled={disabled}
            className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
            title="Subrayado"
          >
            <Underline className="w-4 h-4 dark:text-white" />
          </button>

          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

          {/* Alignment */}
          <button
            onClick={() => execCommand('justifyLeft')}
            disabled={disabled}
            className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
            title="Alinear izquierda"
          >
            <AlignLeft className="w-4 h-4 dark:text-white" />
          </button>
          <button
            onClick={() => execCommand('justifyCenter')}
            disabled={disabled}
            className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
            title="Centrar"
          >
            <AlignCenter className="w-4 h-4 dark:text-white" />
          </button>
          <button
            onClick={() => execCommand('justifyRight')}
            disabled={disabled}
            className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
            title="Alinear derecha"
          >
            <AlignRight className="w-4 h-4 dark:text-white" />
          </button>
          <button
            onClick={() => execCommand('justifyFull')}
            disabled={disabled}
            className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
            title="Justificar"
          >
            <AlignJustify className="w-4 h-4 dark:text-white" />
          </button>

          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

          {/* Lists */}
          <button
            onClick={() => execCommand('insertUnorderedList')}
            disabled={disabled}
            className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
            title="Lista con viñetas"
          >
            <List className="w-4 h-4 dark:text-white" />
          </button>
          <button
            onClick={() => execCommand('insertOrderedList')}
            disabled={disabled}
            className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
            title="Lista numerada"
          >
            <ListOrdered className="w-4 h-4 dark:text-white" />
          </button>

          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

          {/* Links and images */}
          <button
            onClick={() => setIsLinkModalOpen(true)}
            disabled={disabled}
            className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
            title="Insertar enlace"
          >
            <Link className="w-4 h-4 dark:text-white" />
          </button>
          <button
            onClick={insertImage}
            disabled={disabled}
            className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
            title="Insertar imagen"
          >
            <Image className="w-4 h-4 dark:text-white" />
          </button>

          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

          {/* Undo/Redo */}
          <button
            onClick={() => execCommand('undo')}
            disabled={disabled}
            className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
            title="Deshacer"
          >
            <Undo className="w-4 h-4 dark:text-white" />
          </button>
          <button
            onClick={() => execCommand('redo')}
            disabled={disabled}
            className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
            title="Rehacer"
          >
            <Redo className="w-4 h-4 dark:text-white" />
          </button>
        </div>
      </div>

      {/* Editor content */}
      <div
        ref={editorRef}
        contentEditable={!disabled}
        onInput={handleContentChange}
        className="p-4 bg-white dark:bg-gray-800 focus:outline-none prose prose-sm max-w-none dark:prose-invert"
        style={{ minHeight }}
        data-placeholder={placeholder}
        suppressContentEditableWarning={true}
      />

      {/* Link Modal */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4 dark:text-white">Insertar enlace</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                  Texto del enlace
                </label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  placeholder="Texto a mostrar"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                  URL
                </label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  placeholder="https://ejemplo.com"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setIsLinkModalOpen(false);
                    setLinkUrl('');
                    setLinkText('');
                  }}
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  onClick={insertLink}
                  className="px-4 py-2 text-white rounded-lg"
                  style={{ backgroundColor: primaryColor }}
                >
                  Insertar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .rich-text-editor [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
        }
        .rich-text-editor [contenteditable]:focus {
          min-height: ${minHeight};
        }
      `}</style>
    </div>
  );
}