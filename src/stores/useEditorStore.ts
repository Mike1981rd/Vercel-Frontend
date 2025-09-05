import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { 
  EditorState, 
  Section, 
  SectionType, 
  PageType,
  Page,
  SECTION_CONFIGS 
} from '@/types/editor.types';

interface EditorStore extends EditorState {
  // Actions
  setSelectedPage: (pageId: string, pageType: PageType) => void;
  addSection: (groupId: 'headerGroup' | 'asideGroup' | 'template' | 'footerGroup', sectionType: SectionType) => void;
  removeSection: (groupId: string, sectionId: string) => void;
  toggleSectionVisibility: (groupId: string, sectionId: string) => void;
  updateSectionSettings: (groupId: string, sectionId: string, settings: Record<string, any>) => void;
  reorderSections: (groupId: string, fromIndex: number, toIndex: number) => void;
  selectSection: (sectionId: string | null) => void;
  toggleConfigPanel: (open?: boolean) => void;
  setHoveredSection: (sectionId: string | null) => void;
  loadPageSections: (sections: Section[]) => void;
  initializeStructuralComponents: () => void;
  savePage: () => Promise<void>;
  resetChanges: () => void;
  setIsDirty: (dirty: boolean) => void;
  toggleGlobalSettings: () => void;
  isGlobalSettingsOpen: boolean;
  toggleWhatsAppWidget: () => void;
  isWhatsAppWidgetOpen: boolean;
  // Undo/Redo
  history: any[];
  historyIndex: number;
  saveHistory: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
}

const initialState: EditorState & { isGlobalSettingsOpen: boolean; isWhatsAppWidgetOpen: boolean; history: any[]; historyIndex: number } = {
  selectedPageId: null,
  selectedPageType: null,
  sections: {
    headerGroup: [],
    asideGroup: [],
    template: [],
    footerGroup: []
  },
  selectedSectionId: null,
  isConfigPanelOpen: false,
  hoveredSectionId: null,
  isDirty: false,
  isSaving: false,
  isGlobalSettingsOpen: false,
  isWhatsAppWidgetOpen: false,
  history: [],
  historyIndex: -1
};

export const useEditorStore = create<EditorStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        setSelectedPage: (pageId, pageType) => {
          set({
            selectedPageId: pageId,
            selectedPageType: pageType,
            selectedSectionId: null,
            isConfigPanelOpen: false
          });
        },

        addSection: (groupId, sectionType) => {
          const config = SECTION_CONFIGS[sectionType];
          let defaultSettings = { ...config.defaultSettings };
          
          // Special handling for Rich Text - create default blocks
          if (sectionType === SectionType.RICH_TEXT) {
            const timestamp = Date.now();
            defaultSettings = {
              colorScheme: '1',
              colorBackground: false,
              width: 'page',
              contentAlignment: 'center',
              paddingTop: 64,
              paddingBottom: 64,
              customCSS: '',
              blocks: [
                {
                  id: `icon-${timestamp}`,
                  type: 'icon',
                  icon: 'settings',
                  size: 48
                },
                {
                  id: `subheading-${timestamp + 1}`,
                  type: 'subheading',
                  text: 'RICH TEXT'
                },
                {
                  id: `heading-${timestamp + 2}`,
                  type: 'heading',
                  text: 'Tell about your brand',
                  size: 'h5'
                },
                {
                  id: `text-${timestamp + 3}`,
                  type: 'text',
                  columns: 1,
                  columnContent: [
                    'Share information about your brand with your customers. Describe a product, make announcements or welcome customers to your store.'
                  ],
                  bodySize: 'body3'
                },
                {
                  id: `buttons-${timestamp + 4}`,
                  type: 'buttons',
                  buttons: [
                    {
                      label: 'Button label',
                      link: '/pages/about',
                      style: 'solid'
                    }
                  ]
                }
              ]
            };
          }
          
          // Special handling for Newsletter - create default blocks
          if (sectionType === SectionType.NEWSLETTER) {
            const timestamp = Date.now();
            defaultSettings = {
              colorScheme: '3',
              colorBackground: false,
              width: 'screen',
              desktopRatio: 0.2,
              mobileRatio: 1.6,
              desktopImage: '',
              mobileImage: '',
              video: '',
              desktopOverlayOpacity: 0,
              mobileOverlayOpacity: 0,
              desktopPosition: 'left',
              desktopAlignment: 'left',
              desktopWidth: 704,
              desktopSpacing: 16,
              mobilePosition: 'top',
              mobileAlignment: 'left',
              desktopContentBackground: 'none',
              mobileContentBackground: 'none',
              addSidePaddings: true,
              paddingTop: 10,
              paddingBottom: 85,
              customCSS: '',
              blocks: [
                {
                  id: `subheading-${timestamp}`,
                  type: 'subheading',
                  text: 'NEWSLETTER',
                  visible: true
                },
                {
                  id: `heading-${timestamp + 1}`,
                  type: 'heading',
                  text: 'Subscribe',
                  size: 'h4',
                  visible: true
                },
                {
                  id: `text-${timestamp + 2}`,
                  type: 'text',
                  content: 'Subscribe for early sale access, new in, promotions, and more.',
                  bodySize: 'body3',
                  visible: true
                },
                {
                  id: `subscribe-${timestamp + 3}`,
                  type: 'subscribe',
                  inputStyle: 'solid',
                  placeholder: 'Correo electrónico',
                  buttonText: 'Suscribirse',
                  visible: true
                }
              ]
            };
          }
          
          const newSection: Section = {
            id: `${sectionType}_${Date.now()}`,
            type: sectionType,
            name: config.name,
            visible: true,
            settings: defaultSettings,
            sortOrder: get().sections[groupId].length
          };

          console.log('[DEBUG] Adding section:', {
            groupId,
            sectionType,
            newSection,
            config
          });

          set((state) => {
            const newSections = {
              ...state.sections,
              [groupId]: [...state.sections[groupId], newSection]
            };
            
            // Log the updated state
            console.log('[DEBUG] Sections after adding:', {
              groupId,
              sectionsInGroup: newSections[groupId],
              totalInGroup: newSections[groupId].length
            });
            
            return {
              sections: newSections,
              isDirty: true
            };
          });
        },

        removeSection: (groupId, sectionId) => {
          set((state) => ({
            sections: {
              ...state.sections,
              [groupId as keyof typeof state.sections]: state.sections[groupId as keyof typeof state.sections].filter(
                (s) => s.id !== sectionId
              )
            },
            selectedSectionId: state.selectedSectionId === sectionId ? null : state.selectedSectionId,
            isConfigPanelOpen: state.selectedSectionId === sectionId ? false : state.isConfigPanelOpen,
            isDirty: true
          }));
        },

        toggleSectionVisibility: (groupId, sectionId) => {
          set((state) => ({
            sections: {
              ...state.sections,
              [groupId as keyof typeof state.sections]: state.sections[groupId as keyof typeof state.sections].map(
                (s) => s.id === sectionId ? { ...s, visible: !s.visible } : s
              )
            },
            isDirty: true
          }));
        },

        updateSectionSettings: (groupId, sectionId, settings) => {
          set((state) => ({
            sections: {
              ...state.sections,
              [groupId as keyof typeof state.sections]: state.sections[groupId as keyof typeof state.sections].map(
                (s) => s.id === sectionId ? { ...s, settings: { ...s.settings, ...settings } } : s
              )
            },
            isDirty: true
          }));
        },

        reorderSections: (groupId, fromIndex, toIndex) => {
          set((state) => {
            const group = [...state.sections[groupId as keyof typeof state.sections]];
            const [movedItem] = group.splice(fromIndex, 1);
            group.splice(toIndex, 0, movedItem);
            
            // Update sort orders
            const updatedGroup = group.map((item, index) => ({
              ...item,
              sortOrder: index
            }));

            return {
              sections: {
                ...state.sections,
                [groupId]: updatedGroup
              },
              isDirty: true
            };
          });
        },

        selectSection: (sectionId) => {
          set({
            selectedSectionId: sectionId,
            isConfigPanelOpen: sectionId !== null
          });
        },

        toggleConfigPanel: (open) => {
          set((state) => ({
            isConfigPanelOpen: open !== undefined ? open : !state.isConfigPanelOpen
          }));
        },

        setHoveredSection: (sectionId) => {
          set({ hoveredSectionId: sectionId });
        },

        loadPageSections: (sections) => {
          console.log('[DEBUG] Loading page sections:', {
            inputSections: sections,
            count: sections.length
          });

          // Only load template sections from the page
          // Structural components (header, footer, etc) are maintained globally
          const state = get();
          const newSections = {
            headerGroup: state.sections.headerGroup, // Keep existing header group
            asideGroup: state.sections.asideGroup,   // Keep existing aside group
            template: [] as Section[],                // Load new template sections
            footerGroup: state.sections.footerGroup  // Keep existing footer group
          };

          // Only process template sections from the page
          const currentPageType = state.selectedPageType;
          sections.forEach((section) => {
            const config = SECTION_CONFIGS[section.type];
            console.log('[DEBUG] Processing section:', {
              type: section.type,
              hasConfig: !!config,
              category: config?.category
            });
            // Filter: prevent room_* sections on non-CUSTOM pages
            if (
              config &&
              config.category === 'template' &&
              !(String(section.type).startsWith('room_') && currentPageType !== PageType.CUSTOM)
            ) {
              newSections.template.push(section);
            }
          });

          // Sort template sections by sortOrder
          newSections.template.sort((a, b) => a.sortOrder - b.sortOrder);

          console.log('[DEBUG] Final template sections:', {
            templateSections: newSections.template,
            count: newSections.template.length
          });

          set({
            sections: newSections,
            isDirty: false
          });
        },

        initializeStructuralComponents: () => {
          // Initialize structural components if they don't exist
          const state = get();
          const hasHeader = state.sections.headerGroup.some(s => s.type === SectionType.HEADER);
          const hasAnnouncementBar = state.sections.headerGroup.some(s => s.type === SectionType.ANNOUNCEMENT_BAR);
          const hasFooter = state.sections.footerGroup.some(s => s.type === SectionType.FOOTER);
          const hasCartDrawer = state.sections.asideGroup.some(s => s.type === SectionType.CART_DRAWER);

          const updatedSections = { ...state.sections };

          if (!hasHeader) {
            updatedSections.headerGroup.push({
              id: 'header_structural',
              type: SectionType.HEADER,
              name: 'Header',
              visible: true,
              settings: {},
              sortOrder: 1
            });
          }

          if (!hasAnnouncementBar) {
            updatedSections.headerGroup.unshift({  // Use unshift to add at beginning
              id: 'announcement_structural',
              type: SectionType.ANNOUNCEMENT_BAR,
              name: 'Announcement Bar',
              visible: false, // Hidden by default
              settings: {},
              sortOrder: 0
            });
          }

          if (!hasFooter) {
            updatedSections.footerGroup.push({
              id: 'footer_structural',
              type: SectionType.FOOTER,
              name: 'Footer',
              visible: true,
              settings: {},
              sortOrder: 0
            });
          }

          if (!hasCartDrawer) {
            updatedSections.asideGroup.push({
              id: 'cart_drawer_structural',
              type: SectionType.CART_DRAWER,
              name: 'Cart Drawer',
              visible: false, // Hidden by default
              settings: {},
              sortOrder: 0
            });
          }
          
          // Sort headerGroup by sortOrder to ensure correct initial order
          updatedSections.headerGroup.sort((a, b) => a.sortOrder - b.sortOrder);

          set({ sections: updatedSections });
        },

        savePage: async () => {
          const state = get();
          console.log('[DEBUG] savePage called:', {
            selectedPageId: state.selectedPageId,
            isDirty: state.isDirty,
            headerGroupCount: state.sections.headerGroup.length,
            templateCount: state.sections.template.length
          });
          
          if (!state.selectedPageId || !state.isDirty) {
            console.log('[DEBUG] Skipping save - no page selected or not dirty');
            return;
          }

          set({ isSaving: true });

          try {
            // Save to localStorage for persistence (temporary solution)
            // Store by page type to avoid collisions with DB page IDs
            const keyType = (state.selectedPageType ?? PageType.HOME) as unknown as string;
            const pageKey = `page_sections_${keyType.toLowerCase()}`;
            // Include headerGroup ImageBanner sections before template sections for live preview
            const headerImageBanners = state.sections.headerGroup.filter(s => s.type === SectionType.IMAGE_BANNER && s.visible);
            const combinedForPreview = [...headerImageBanners, ...state.sections.template]
              .map((s, idx) => ({ ...s, sortOrder: idx })); // Reindex to preserve intended order
            localStorage.setItem(pageKey, JSON.stringify(combinedForPreview));
            console.log('[DEBUG] ✅ Saved sections to localStorage (combined header image banners + template):', {
              pageId: state.selectedPageId,
              key: pageKey,
              headerImageBannersCount: headerImageBanners.length,
              templateCount: state.sections.template.length,
              totalSaved: combinedForPreview.length
            });

            // Also try to save to backend (this might fail with mock page IDs)
            // Backend payload: also include header ImageBanner(s) before template sections
            const sectionsForBackend = [...headerImageBanners, ...state.sections.template]
              .map((s, idx) => ({ ...s, sortOrder: idx }))
              .map(s => {
                // Debug FAQ sections
                if (s.type === SectionType.FAQ) {
                  console.log('[DEBUG] Saving FAQ section:', {
                    type: s.type,
                    name: s.name,
                    settings: s.settings
                  });
                }
                // Map snake_case to PascalCase for backend
                const typeMapping: { [key: string]: string } = {
                  'announcement_bar': 'AnnouncementBar',
                  'header': 'Header',
                  'image_banner': 'ImageBanner',
                  'slideshow': 'Slideshow',
                  'multicolumns': 'Multicolumns',
                  'image_with_text': 'ImageWithText',
                  'gallery': 'Gallery',
                  'featured_collection': 'FeaturedCollection',
                  'faq': 'FAQ',
                  'footer': 'Footer'
                };
                
                return {
                  type: s.type,
                  sectionType: typeMapping[s.type] || s.type, // Use PascalCase for backend
                  sortOrder: s.sortOrder,
                  visible: s.visible,
                  name: s.name,
                  settings: s.settings,
                  config: s.settings // Backend might use 'config' instead of 'settings'
                };
              });

            console.log('[DEBUG] Attempting to save to backend:', {
              pageId: state.selectedPageId,
              sectionsForBackend,
              totalSections: sectionsForBackend.length
            });

            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5266/api';
            const response = await fetch(`${apiUrl}/websitepages/${state.selectedPageId}/sections`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              },
              body: JSON.stringify({ sections: sectionsForBackend })
            });

            console.log('[DEBUG] Backend save response:', {
              ok: response.ok,
              status: response.status
            });

            set({ isDirty: false });
          } catch (error) {
            console.error('Error saving page:', error);
            // Even if backend fails, localStorage save succeeded
            set({ isDirty: false });
          } finally {
            set({ isSaving: false });
          }
        },

        resetChanges: () => {
          set(initialState);
        },

        setIsDirty: (dirty) => {
          set({ isDirty: dirty });
        },

        toggleGlobalSettings: () => {
          set((state) => ({ 
            isGlobalSettingsOpen: !state.isGlobalSettingsOpen,
            isConfigPanelOpen: false,
            selectedSectionId: null,
            isWhatsAppWidgetOpen: false
          }));
        },

        toggleWhatsAppWidget: () => {
          set((state) => ({ 
            isWhatsAppWidgetOpen: !state.isWhatsAppWidgetOpen,
            isGlobalSettingsOpen: false,
            isConfigPanelOpen: false,
            selectedSectionId: null
          }));
        },

        // Undo/Redo functionality
        saveHistory: () => {
          const state = get();
          const snapshot = {
            sections: JSON.parse(JSON.stringify(state.sections)),
            timestamp: Date.now()
          };
          
          // Remove any history after current index
          const newHistory = state.history.slice(0, state.historyIndex + 1);
          
          // Add new state
          newHistory.push(snapshot);
          
          // Keep max 50 states
          if (newHistory.length > 50) {
            newHistory.shift();
          }
          
          set({
            history: newHistory,
            historyIndex: newHistory.length - 1
          });
        },

        undo: () => {
          const state = get();
          if (state.historyIndex > 0) {
            const newIndex = state.historyIndex - 1;
            const previousState = state.history[newIndex];
            
            set({
              sections: JSON.parse(JSON.stringify(previousState.sections)),
              historyIndex: newIndex,
              isDirty: false // Set to false since we're going back to a previous state
            });
          }
        },

        redo: () => {
          const state = get();
          if (state.historyIndex < state.history.length - 1) {
            const newIndex = state.historyIndex + 1;
            const nextState = state.history[newIndex];
            
            set({
              sections: JSON.parse(JSON.stringify(nextState.sections)),
              historyIndex: newIndex,
              isDirty: true
            });
          }
        },

        canUndo: () => {
          const state = get();
          return state.historyIndex > 0;
        },

        canRedo: () => {
          const state = get();
          return state.historyIndex < state.history.length - 1;
        }
      }),
      {
        name: 'editor-store',
        partialize: (state) => ({
          selectedPageId: state.selectedPageId,
          selectedPageType: state.selectedPageType,
          sections: state.sections // Also persist sections
        })
      }
    )
  )
);
