/*
 * Resume Builder
 * Static, local-first resume editor powered by CV_DATA.
 */

(function() {
    'use strict';

    const STORAGE_KEY = 'ayk.resumeBuilder.v2';
    const RESUME_JSON_STORAGE_KEY = 'ayk.resumeBuilder.resumeJson.v1';
    const RESUME_SYNTAX_FORMAT = 'ayk.resume.syntax';
    const RESUME_SYNTAX_VERSION = 1;
    const MODE_KEY = 'ayk.resumeBuilder.mode';
    const WORKFLOW_KEY = 'ayk.resumeBuilder.workflow';
    const GUEST_WORKSPACE_KEY = 'ayk.resumeBuilder.guestWorkspaceStarted.v1';
    const PROFILE_GUIDE_KEY = 'ayk.resumeBuilder.profileGuideComplete.v1';
    const WORKFLOW_STEPS = new Set(['data', 'entries', 'templates']);
    const WORKFLOW_TITLES = {
        data: 'Data (JSON)',
        entries: 'Non-JSON',
        templates: 'Templates'
    };
    const MODE_OVERRIDE = new URLSearchParams(window.location.search).get('mode');
    if (MODE_OVERRIDE === 'ahmad' || MODE_OVERRIDE === 'guest') {
        localStorage.setItem(MODE_KEY, MODE_OVERRIDE);
    }
    const SECTION_ADD_OPTIONS = [
        ['summary', 'Summary', 'text'],
        ['experience', 'Experience', 'briefcase'],
        ['projects', 'Projects', 'folder-kanban'],
        ['skills', 'Skills', 'wrench'],
        ['education', 'Education', 'graduation-cap'],
        ['research', 'Research', 'scroll-text'],
        ['certifications', 'Certs', 'badge-check']
    ];
    const SIDE_SECTIONS = new Set(['skills', 'education', 'certifications']);
    const DEFAULT_RESUME_FONT = '"IBM Plex Sans", "Segoe UI", Arial, sans-serif';
    const SECTION_PLACEMENTS = new Set(['auto', 'main', 'side', 'left', 'right', 'full']);
    const DEFAULT_LAYOUT = {
        mode: 'single',
        columns: 1,
        columnRatio: '2fr 1fr',
        gap: 24,
        side: 'right',
        sidebarSections: Array.from(SIDE_SECTIONS),
        sectionFlow: 'document'
    };
    const DEFAULT_STYLE_CLASSES = {
        section: {
            clean: {
                padding: 0,
                marginTop: 16
            },
            panel: {
                backgroundColor: '#f8fafc',
                borderColor: '#e2e8f0',
                borderWidth: 1,
                borderRadius: 6,
                padding: 10,
                marginTop: 16
            }
        },
        sectionHeader: {
            accent: {
                color: '#1f4f93',
                borderColor: '#cfd6df',
                borderWidth: 1,
                borderBottomWidth: 1,
                borderBottomStyle: 'solid',
                padding: 0
            },
            band: {
                backgroundColor: '#eef6ff',
                color: '#1f4f93',
                borderRadius: 4,
                padding: 4
            }
        },
        item: {
            clean: {
                padding: 0
            },
            highlighted: {
                backgroundColor: '#f8fafc',
                borderColor: '#e2e8f0',
                borderWidth: 1,
                borderRadius: 5,
                padding: 8
            }
        },
        text: {
            body: {
                fontFamily: DEFAULT_RESUME_FONT,
                color: '#1f2937',
                fontSize: 10.25,
                lineHeight: 1.35
            },
            muted: {
                color: '#64748b',
                fontSize: 9.6,
                lineHeight: 1.4
            }
        }
    };
    const ATS_BASE_SETTINGS = {
        accent: '#1f4f93',
        fontFamily: DEFAULT_RESUME_FONT,
        fontName: DEFAULT_RESUME_FONT,
        fontTitle: DEFAULT_RESUME_FONT,
        fontHeading: DEFAULT_RESUME_FONT,
        fontSectionHeading: DEFAULT_RESUME_FONT,
        fontItemHeading: DEFAULT_RESUME_FONT,
        fontBody: DEFAULT_RESUME_FONT,
        fontContact: DEFAULT_RESUME_FONT,
        fontMeta: DEFAULT_RESUME_FONT,
        fontSize: 10.25,
        lineHeight: 1.34,
        pagePaddingX: 54,
        pagePaddingY: 44,
        headerAlign: 'left',
        headerDesign: 'minimal',
        headerPattern: 'none',
        headerPatternImage: '',
        headerBackground: '#ffffff',
        headerTextColor: '#111827',
        headerSeparatorWeight: 1,
        contactLayout: 'horizontal',
        headerContactGap: 10,
        bulletStyle: 'hyphen',
        skillsColumns: 1,
        sectionHeadingAccent: 'none',
        sectionSeparatorWeight: 1,
        showHeaderIcons: false,
        showProfilePhoto: false,
        profilePhotoShape: 'rounded-square',
        profilePhotoPlacement: 'left',
        titleSize: 11,
        nameSize: 23,
        sectionHeadingSize: 11.05,
        itemHeadingSize: 9.75,
        dateSize: 9,
        metaSize: 9,
        contactSize: 9,
        skillHeadingSize: 9.3,
        skillBodySize: 9.1
    };
    const TEMPLATE_PRESETS = [
        {
            id: 'experienced',
            name: 'Default',
            template: 'ats',
            suppressProfilePhoto: true,
            description: 'Default ATS-friendly resume layout. Prioritizes Experience before Projects and Skills.',
            sectionOrder: ['summary', 'experience', 'projects', 'skills', 'education', 'research', 'certifications'],
            titles: { summary: 'Summary', experience: 'Experience', projects: 'Projects', skills: 'Skills', education: 'Education', research: 'Research', certifications: 'Certifications' },
            design: {
                sectionColumns: {
                    mode: 'auto-by-content',
                    max: 2,
                    threshold: 2
                }
            }
        }
    ];
    const FONT_OPTIONS = [
        ['Geist', '"Geist", "Inter", Arial, sans-serif'],
        ['Inter', '"Inter", Arial, sans-serif'],
        ['Aptos', 'Aptos, "Segoe UI", Arial, sans-serif'],
        ['Arial', 'Arial, Helvetica, sans-serif'],
        ['Helvetica', 'Helvetica, Arial, sans-serif'],
        ['Segoe UI', '"Segoe UI", Arial, sans-serif'],
        ['Calibri', 'Calibri, Arial, sans-serif'],
        ['Verdana', 'Verdana, Geneva, sans-serif'],
        ['Tahoma', 'Tahoma, Geneva, sans-serif'],
        ['Trebuchet MS', '"Trebuchet MS", Arial, sans-serif'],
        ['Source Sans 3', '"Source Sans 3", Arial, sans-serif'],
        ['IBM Plex Sans', '"IBM Plex Sans", Arial, sans-serif'],
        ['Noto Sans', '"Noto Sans", Arial, sans-serif'],
        ['Atkinson Hyperlegible', '"Atkinson Hyperlegible", Arial, sans-serif'],
        ['Work Sans', '"Work Sans", Arial, sans-serif'],
        ['Georgia', 'Georgia, "Times New Roman", serif'],
        ['Times New Roman', '"Times New Roman", Times, serif']
    ];
    const BULLET_STYLE_OPTIONS = [
        ['hyphen', 'Hyphen'],
        ['disc', 'Disc'],
        ['square', 'Square'],
        ['none', 'None']
    ];
    const COLOR_PRESETS = [
        ['Ink', '#111827'],
        ['Slate', '#475569'],
        ['Blue', '#1f6feb'],
        ['Indigo', '#4f46e5'],
        ['Emerald', '#047857'],
        ['Teal', '#0f766e'],
        ['Amber', '#b45309'],
        ['Rose', '#be123c'],
        ['Violet', '#7c3aed'],
        ['Paper', '#f8fafc'],
        ['White', '#ffffff']
    ];
    const DEFAULT_PREVIEW_ZOOM = 1;
    const TEXT_SIZE_OPTIONS = [7, 8, 9, 9.5, 10, 10.25, 10.5, 10.8, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30];
    const TITLE_SIZE_OPTIONS = [8, 9, 10, 11, 12, 14, 16, 18, 20, 22];
    const TITLE_LINE_HEIGHT_OPTIONS = [0.9, 1, 1.05, 1.15, 1.25, 1.4, 1.6, 1.8, 2];
    const TEXT_STYLE_ROLES = {
        name: { font: 'fontName', color: 'colorName', size: 'nameSize' },
        title: { font: 'fontTitle', color: 'colorTitle', size: 'titleSize' },
        contact: { font: 'fontContact', color: 'colorContact', size: 'contactSize' },
        sectionHeading: { font: 'fontSectionHeading', color: 'colorSectionHeading', size: 'sectionHeadingSize' },
        itemHeading: { font: 'fontItemHeading', color: 'colorItemHeading', size: 'itemHeadingSize' },
        date: { font: 'fontMeta', color: 'colorDate', size: 'dateSize' },
        meta: { font: 'fontMeta', color: 'colorMeta', size: 'metaSize' },
        body: { font: 'fontBody', color: 'colorBody', size: 'fontSize' },
        academicBody: { font: 'fontBody', color: 'colorBody', size: 'fontSize' },
        itemBody: { font: 'fontBody', color: 'colorBody', size: 'fontSize' },
        skillHeading: { font: 'fontItemHeading', color: 'colorSkillHeading', size: 'skillHeadingSize' },
        skillBody: { font: 'fontBody', color: 'colorSkillBody', size: 'skillBodySize' }
    };
    const TEXT_SCALE_PRESETS = {
        9: {
            fontSize: 9,
            nameSize: 22,
            titleSize: 9.8,
            sectionHeadingSize: 9.8,
            itemHeadingSize: 9.2,
            dateSize: 8,
            metaSize: 8.2,
            contactSize: 8.2,
            skillHeadingSize: 8.5,
            skillBodySize: 8.3
        },
        10.25: {
            fontSize: 10.25,
            nameSize: 25,
            titleSize: 11,
            sectionHeadingSize: 10.8,
            itemHeadingSize: 10.25,
            dateSize: 9,
            metaSize: 9.3,
            contactSize: 9,
            skillHeadingSize: 9.4,
            skillBodySize: 9.2
        },
        12: {
            fontSize: 12,
            nameSize: 29,
            titleSize: 12.8,
            sectionHeadingSize: 12.3,
            itemHeadingSize: 12,
            dateSize: 10.6,
            metaSize: 10.8,
            contactSize: 10.6,
            skillHeadingSize: 11,
            skillBodySize: 10.8
        }
    };
    const PROFILE_SHAPE_OPTIONS = [
        ['circle', 'Round'],
        ['rounded-square', 'Soft square'],
        ['soft', 'Rounded'],
        ['square', 'Square']
    ];
    const PROFILE_PLACEMENT_OPTIONS = [
        ['left', 'Left'],
        ['right', 'Right'],
        ['top', 'Top']
    ];
    const PROFILE_GUIDE_FIELDS = [
        ['name', 'Name', 'What should appear at the top of the resume?'],
        ['title', 'Role', 'What role is this resume aiming for?'],
        ['email', 'Email', 'Where should recruiters contact you?'],
        ['location', 'Location', 'What location should appear on the resume?'],
        ['linkedin', 'LinkedIn', 'Add a LinkedIn URL if you want it shown.'],
        ['github', 'GitHub', 'Add a GitHub URL if it helps your role.'],
        ['website', 'Website', 'Add a portfolio or personal site if you have one.']
    ];
    const NON_JSON_WIZARD_STEPS = [
        { id: 'identity', type: 'identity', label: 'Name and occupation', prompt: 'Set the name and role that appear in the resume header.' },
        { id: 'contact', type: 'contact', label: 'Contact info', prompt: 'Add the header details recruiters should see first.' },
        { id: 'photo', type: 'photo', label: 'Profile picture', prompt: 'Upload a headshot if this resume should include one.' },
        { id: 'summary', type: 'summary', label: 'Summary', prompt: 'Add a short profile paragraph. Skip it if you want to write it directly on the resume.' },
        { id: 'experience', type: 'entry', section: 'experience', label: 'Experience', prompt: 'Add the roles that matter for this resume.' },
        { id: 'projects', type: 'entry', section: 'projects', label: 'Projects', prompt: 'Add relevant projects if they help the application.' },
        { id: 'skills', type: 'skills', section: 'skills', label: 'Skills', prompt: 'Add skills one by one, or paste a short list.' },
        { id: 'education', type: 'entry', section: 'education', label: 'Education', prompt: 'Add education if it helps this resume.' },
        { id: 'certifications', type: 'entry', section: 'certifications', label: 'Certifications', prompt: 'Add certifications, credential IDs, and verification links.' }
    ];

    const elements = {};
    let previewZoom = DEFAULT_PREVIEW_ZOOM;
    let builderMode = loadBuilderMode();
    let state = loadState(builderMode) || createStateForMode(builderMode);
    let workflowStep = loadWorkflowStep();
    let profileGuideCursor = 0;
    let wizardAddChoiceSection = '';
    let activeSkillGroupId = '';
    let pageAddMenuOpen = false;
    let activeAddAnchor = 'start';
    let undoStack = [];
    let redoStack = [];
    let lastStateSnapshot = '';
    let toastTimer = null;
    let syntaxAutoApplyTimer = null;
    let previewControlInteraction = false;
    let previewEditablePointerTransition = false;
    let activeTextStyleTarget = null;
    let activeColorTarget = null;

    function init() {
        cacheElements();
        populateFontSelects();
        enhanceColorControls();
        resetHistory();
        bindEvents();
        renderAll();
    }

    function cacheElements() {
        elements.templateList = document.getElementById('templateList');
        elements.constantsPanel = document.getElementById('constantsPanel');
        elements.workflowStepper = document.querySelector('.workflow-stepper');
        elements.activeToolTitle = document.getElementById('activeToolTitle');
        elements.editorSections = document.getElementById('editorSections');
        elements.resumePreview = document.getElementById('resumePreview');
        elements.paperStage = document.getElementById('paperStage');
        elements.identityGate = document.getElementById('identityGate');
        elements.viewOptionsMenu = document.getElementById('viewOptionsMenu');
        elements.viewOptionsToggle = document.getElementById('viewOptionsToggle');
        elements.viewOptionsPanel = document.getElementById('viewOptionsPanel');
        elements.pageCount = document.getElementById('pageCount');
        elements.selectedTextControls = document.getElementById('selectedTextControls');
        elements.colorModal = document.getElementById('colorModal');
        elements.colorModalTitle = document.getElementById('colorModalTitle');
        elements.colorModalSwatches = document.getElementById('colorModalSwatches');
        elements.colorModalPicker = document.getElementById('colorModalPicker');
        elements.colorModalHex = document.getElementById('colorModalHex');
        elements.undoResume = document.getElementById('undoResume');
        elements.redoResume = document.getElementById('redoResume');
        elements.exportPdfButtons = Array.from(document.querySelectorAll('[data-export-pdf]'));
        elements.resetResume = document.getElementById('resetResume');
        elements.resumeSyntaxText = document.getElementById('resumeSyntaxText');
        elements.jsonResumePromptText = document.getElementById('jsonResumePromptText');
        elements.copyJsonResumePrompt = document.getElementById('copyJsonResumePrompt');
        elements.copyCurrentResumeJson = document.getElementById('copyCurrentResumeJson');
        elements.promptModal = document.getElementById('promptModal');
        elements.resumeSyntaxStatus = document.getElementById('resumeSyntaxStatus');
        elements.toast = document.getElementById('resumeToast');
    }

    function bindEvents() {
        elements.constantsPanel.addEventListener('input', event => {
            handleEditorInput(event.target);
        });

        elements.constantsPanel.addEventListener('change', event => {
            if (event.target.matches('[data-profile-upload]')) {
                handleProfileUpload(event.target);
                return;
            }

            handleEditorInput(event.target);
        });

        elements.constantsPanel.addEventListener('click', event => {
            const richButton = event.target.closest('[data-wizard-rich-command]');
            if (richButton) {
                handleWizardRichTextCommand(richButton);
                return;
            }

            const button = event.target.closest('[data-profile-guide-action]');
            if (!button) return;
            handleProfileGuideAction(button.dataset.profileGuideAction, button);
        });

        elements.constantsPanel.addEventListener('keydown', event => {
            if (!event.target.matches('[data-skill-draft]') || event.key !== 'Enter') return;
            event.preventDefault();
            addSkillsFromDraft(event.target);
        });

        if (elements.templateList) {
            elements.templateList.addEventListener('click', event => {
                const button = event.target.closest('[data-template-preset]');
                if (!button) return;
                applyTemplatePreset(button.dataset.templatePreset);
            });

            elements.templateList.addEventListener('mouseover', event => {
                const button = event.target.closest('[data-template-preset]');
                if (!button) return;
                spotlightResumeForTemplate(button.dataset.templatePreset);
            });

            elements.templateList.addEventListener('mouseout', event => {
                if (event.relatedTarget && elements.templateList.contains(event.relatedTarget)) return;
                clearTemplateSpotlight();
            });
        }

        if (elements.workflowStepper) {
            elements.workflowStepper.addEventListener('click', event => {
                const button = event.target.closest('.workflow-step[data-workflow-step]');
                if (!button) return;
                if (!syncResumeSyntaxBeforeStepChange(button.dataset.workflowStep)) return;
                setWorkflowStep(button.dataset.workflowStep);
            });
        }

        document.querySelectorAll('[data-start-action]').forEach(button => {
            button.addEventListener('click', event => {
                event.stopPropagation();
                handleStartAction(button.dataset.startAction);
            });
        });

        if (elements.viewOptionsToggle && elements.viewOptionsPanel) {
            elements.viewOptionsToggle.addEventListener('click', event => {
                event.stopPropagation();
                setViewOptionsOpen(!isViewOptionsOpen());
            });

            elements.viewOptionsPanel.addEventListener('click', event => {
                event.stopPropagation();
                if (event.target.closest('[data-view-options-close]')) {
                    setViewOptionsOpen(false, { restoreFocus: true });
                }
            });

            document.addEventListener('click', event => {
                if (!isViewOptionsOpen()) return;
                if (elements.viewOptionsMenu && elements.viewOptionsMenu.contains(event.target)) return;
                setViewOptionsOpen(false);
            });
        }

        document.querySelectorAll('[data-setting]').forEach(input => {
            input.addEventListener('input', event => {
                handleSettingControl(event.target);
            });
        });

        document.addEventListener('input', event => {
            if (event.target.matches('[data-color-hex]')) {
                handleColorHexInput(event.target);
            }
        });

        if (elements.selectedTextControls) {
            elements.selectedTextControls.addEventListener('input', event => {
                const control = event.target.closest('[data-text-style-setting]');
                if (control) handleTextStyleControl(control);
            });

            elements.selectedTextControls.addEventListener('change', event => {
                const control = event.target.closest('[data-text-style-setting]');
                if (control) handleTextStyleControl(control);
            });

            elements.selectedTextControls.addEventListener('click', event => {
                const resetButton = event.target.closest('[data-text-style-reset]');
                if (resetButton) {
                    resetTextStyleOverride(resetButton.dataset.styleKey);
                    return;
                }

                const colorButton = event.target.closest('[data-text-color-open]');
                if (colorButton) {
                    openColorModal({
                        type: 'text',
                        label: colorButton.dataset.colorLabel || 'Text',
                        styleKey: colorButton.dataset.styleKey,
                        role: colorButton.dataset.styleRole || 'body',
                        value: colorButton.dataset.colorValue
                    });
                }
            });
        }

        document.addEventListener('change', event => {
            if (event.target.matches('[data-header-pattern-upload]')) {
                handleHeaderPatternUpload(event.target);
                return;
            }

            if (event.target.matches('[data-color-hex]')) {
                handleColorHexInput(event.target, { commitPartial: true });
                return;
            }

            if (event.target.matches('[data-setting]')) {
                handleSettingControl(event.target);
            }
        });

        document.addEventListener('click', event => {
            const colorButton = event.target.closest('[data-color-modal-open]');
            if (colorButton) {
                openColorModal({
                    type: 'setting',
                    label: colorButton.dataset.colorLabel || 'Color',
                    setting: colorButton.dataset.setting,
                    value: state.settings[colorButton.dataset.setting]
                });
                return;
            }

            const bulletButton = event.target.closest('[data-bullet-style-option]');
            if (!bulletButton) return;
            state.settings.bulletStyle = bulletButton.dataset.bulletStyleOption;
            saveState();
            syncControls();
            renderPreview();
            showToast('Bullet style updated');
        });

        if (elements.colorModal) {
            elements.colorModal.addEventListener('click', event => {
                if (event.target === elements.colorModal || event.target.closest('[data-color-modal-close]')) {
                    closeColorModal();
                    return;
                }

                const swatch = event.target.closest('[data-modal-color]');
                if (swatch) {
                    setColorModalDraft(swatch.dataset.modalColor);
                    return;
                }

                if (event.target.closest('[data-color-modal-apply]')) {
                    applyColorModal();
                }
            });

            elements.colorModalPicker.addEventListener('input', event => {
                setColorModalDraft(event.target.value);
            });

            elements.colorModalHex.addEventListener('input', event => {
                const color = normalizeHexColor(event.target.value);
                if (color) setColorModalDraft(color);
            });
        }

        document.addEventListener('keydown', event => {
            if (event.key === 'Escape' && isViewOptionsOpen()) {
                setViewOptionsOpen(false, { restoreFocus: true });
                return;
            }

            if (event.key === 'Escape' && elements.colorModal && !elements.colorModal.hidden) {
                closeColorModal();
            }
        });

        elements.editorSections.addEventListener('input', event => {
            handleEditorInput(event.target);
        });

        elements.editorSections.addEventListener('change', event => {
            handleEditorInput(event.target);
        });

        elements.editorSections.addEventListener('click', event => {
            const button = event.target.closest('[data-action]');
            if (!button) return;
            handleEditorAction(button);
        });

        elements.resumePreview.addEventListener('pointerdown', event => {
            previewEditablePointerTransition = Boolean(event.target.closest('[data-edit-kind]'));
            if (previewEditablePointerTransition) {
                window.setTimeout(() => {
                    previewEditablePointerTransition = false;
                }, 250);
            }

            if (event.target.closest('[data-rich-command]')) {
                event.preventDefault();
            }

            if (!event.target.closest('.inline-format-control, .bullet-style-inline, .resume-header-style-dock, .rich-text-toolbar, .resume-section-tools')) return;
            previewControlInteraction = true;
            window.setTimeout(() => {
                previewControlInteraction = false;
            }, 350);
        }, true);

        elements.resumePreview.addEventListener('blur', event => {
            const editable = event.target.closest('[data-edit-kind]');
            if (!editable) return;
            handlePreviewEdit(editable, { render: !isPreviewControlTarget(event.relatedTarget) && !previewEditablePointerTransition });
        }, true);

        elements.resumePreview.addEventListener('input', event => {
            const editable = event.target.closest('[data-edit-kind]');
            if (!editable) return;
            updateStateFromPreviewElement(editable);
            localStorage.setItem(getStorageKey(builderMode), serializeState());
            updateSyntaxTextarea();
            updateJsonResumePrompt();
        });

        elements.resumePreview.addEventListener('keydown', event => {
            const editable = event.target.closest('[data-edit-kind]');
            if (!editable) return;
            handlePreviewEditorKeydown(event, editable);
        });

        elements.resumePreview.addEventListener('paste', event => {
            const editable = event.target.closest('[data-edit-kind]');
            if (!editable) return;
            handlePreviewPaste(event, editable);
        });

        elements.resumePreview.addEventListener('focusin', event => {
            const target = event.target.closest('.text-style-target');
            if (target) setActiveTextStyleTarget(target);
        });

        elements.resumePreview.addEventListener('click', event => {
            const target = event.target.closest('.text-style-target');
            if (target) {
                if (target.isContentEditable && document.activeElement !== target) {
                    target.focus({ preventScroll: true });
                }
                setActiveTextStyleTarget(target);
            }
        });

        elements.resumePreview.addEventListener('change', event => {
            const styleControl = event.target.closest('[data-text-style-setting]');
            if (styleControl) {
                handleTextStyleControl(styleControl);
                return;
            }

            const control = event.target.closest('[data-inline-setting]');
            if (!control) return;
            state.settings[control.dataset.inlineSetting] = control.value;
            saveState();
            syncControls();
            renderPreview();
        });

        elements.resumePreview.addEventListener('click', event => {
            const richCommand = event.target.closest('[data-rich-command]');
            if (richCommand) {
                event.preventDefault();
                handleRichTextCommand(richCommand);
                return;
            }

            const bulletStyleSelect = event.target.closest('[data-bullet-style-select]');
            if (bulletStyleSelect) {
                event.stopPropagation();
                return;
            }

            const styleResetButton = event.target.closest('[data-text-style-reset]');
            if (styleResetButton) {
                event.preventDefault();
                resetTextStyleOverride(styleResetButton.dataset.styleKey);
                return;
            }

            const insertToggle = event.target.closest('[data-page-add-toggle]');
            if (insertToggle) {
                event.stopPropagation();
                const anchor = insertToggle.dataset.insertAfter || 'start';
                pageAddMenuOpen = activeAddAnchor === anchor ? !pageAddMenuOpen : true;
                activeAddAnchor = anchor;
                renderPreview();
                return;
            }

            if (event.target.closest('.page-add-menu')) {
                handlePageAddMenuClick(event);
                return;
            }

            const previewAction = event.target.closest('[data-preview-action]');
            if (previewAction) {
                event.preventDefault();
                handlePreviewAction(previewAction);
            }
        });

        elements.resumePreview.addEventListener('dragstart', event => {
            const entryHandle = event.target.closest('[data-entry-drag]');
            if (entryHandle && event.dataTransfer) {
                event.dataTransfer.setData('text/resume-entry', `${entryHandle.dataset.section}:${entryHandle.dataset.item}`);
                event.dataTransfer.effectAllowed = 'move';
                const entry = entryHandle.closest('[data-resume-entry]');
                if (entry) entry.classList.add('is-entry-dragging');
                return;
            }

            const handle = event.target.closest('[data-section-drag]');
            if (!handle || !event.dataTransfer) return;
            event.dataTransfer.setData('text/resume-section', handle.dataset.sectionId);
            event.dataTransfer.effectAllowed = 'move';
            const sectionEl = handle.closest('[data-resume-section]');
            if (sectionEl) sectionEl.classList.add('is-section-dragging');
        });

        elements.resumePreview.addEventListener('dragend', event => {
            const entry = event.target.closest('[data-resume-entry]');
            if (entry) entry.classList.remove('is-entry-dragging');
            elements.resumePreview.querySelectorAll('.is-entry-drop-target').forEach(element => {
                element.classList.remove('is-entry-drop-target');
            });

            const sectionEl = event.target.closest('[data-resume-section]');
            if (sectionEl) sectionEl.classList.remove('is-section-dragging');
            elements.resumePreview.querySelectorAll('.is-section-drop-target').forEach(element => {
                element.classList.remove('is-section-drop-target');
            });
        });

        elements.resumePreview.addEventListener('dragover', event => {
            if (hasResumeEntry(event.dataTransfer)) {
                const entryEl = event.target.closest('[data-resume-entry]');
                if (!entryEl) return;
                event.preventDefault();
                entryEl.classList.add('is-entry-drop-target');
                return;
            }

            if (hasResumeSection(event.dataTransfer)) {
                const sectionEl = event.target.closest('[data-resume-section]');
                if (!sectionEl) return;
                event.preventDefault();
                sectionEl.classList.add('is-section-drop-target');
                return;
            }

        });

        elements.resumePreview.addEventListener('dragleave', event => {
            const entryEl = event.target.closest('[data-resume-entry]');
            if (entryEl && !entryEl.contains(event.relatedTarget)) {
                entryEl.classList.remove('is-entry-drop-target');
            }

            const sectionEl = event.target.closest('[data-resume-section]');
            if (sectionEl && !sectionEl.contains(event.relatedTarget)) {
                sectionEl.classList.remove('is-drop-target');
                sectionEl.classList.remove('is-section-drop-target');
            }
        });

        elements.resumePreview.addEventListener('drop', event => {
            if (hasResumeEntry(event.dataTransfer)) {
                const entryEl = event.target.closest('[data-resume-entry]');
                const payload = event.dataTransfer.getData('text/resume-entry');
                if (!entryEl || !payload) return;
                event.preventDefault();
                entryEl.classList.remove('is-entry-drop-target');
                reorderEntryBefore(payload, entryEl.dataset.entrySection, entryEl.dataset.resumeEntry);
                saveState();
                showToast('Entry moved');
                renderAll();
                return;
            }

            if (hasResumeSection(event.dataTransfer)) {
                const sectionEl = event.target.closest('[data-resume-section]');
                const draggedSectionId = event.dataTransfer.getData('text/resume-section');
                if (!sectionEl || !draggedSectionId) return;
                event.preventDefault();
                reorderSectionBefore(draggedSectionId, sectionEl.dataset.resumeSection);
                saveState();
                showToast('Section moved');
                renderAll();
                return;
            }

        });

        document.querySelectorAll('[data-setting-preset]').forEach(button => {
            button.addEventListener('click', () => applySettingPreset(button.dataset.settingPreset, Number(button.dataset.value)));
        });

        document.querySelectorAll('[data-line-height-custom-toggle]').forEach(button => {
            button.addEventListener('click', () => setCustomLineHeightActive(true));
        });

        document.querySelectorAll('[data-line-height-custom]').forEach(input => {
            input.addEventListener('input', () => applyCustomLineHeight(Number(input.value)));
            input.addEventListener('change', () => applyCustomLineHeight(Number(input.value)));
        });

        document.querySelectorAll('[data-margin-preset]').forEach(button => {
            button.addEventListener('click', () => applyMarginPreset(button.dataset.marginPreset));
        });

        document.querySelectorAll('[data-zoom-preset]').forEach(button => {
            button.addEventListener('click', () => {
                previewZoom = Number(button.dataset.zoomPreset) || DEFAULT_PREVIEW_ZOOM;
                applyPreviewZoom();
                syncControls();
            });
        });

        window.addEventListener('resize', () => {
            window.requestAnimationFrame(applyPreviewZoom);
        });

        document.addEventListener('click', event => {
            if (!pageAddMenuOpen || event.target.closest('.resume-insert-control')) return;
            pageAddMenuOpen = false;
            renderPreview();
        });

        document.addEventListener('keydown', event => {
            if (event.key !== 'Escape' || !pageAddMenuOpen) return;
            pageAddMenuOpen = false;
            renderPreview();
        });

        elements.identityGate.addEventListener('click', event => {
            const choice = event.target.closest('[data-identity-choice]');
            if (!choice) return;

            if (choice.dataset.identityChoice === 'guest') {
                selectBuilderMode('guest');
                return;
            }

            selectBuilderMode('ahmad');
        });

        elements.exportPdfButtons.forEach(button => {
            button.addEventListener('click', async event => {
                event.stopPropagation();
                await exportCleanPdf();
            });
        });

        elements.undoResume.addEventListener('click', undoResume);

        elements.redoResume.addEventListener('click', redoResume);

        document.addEventListener('keydown', event => {
            const active = document.activeElement;
            const editingText = active && (active.matches('input, textarea, [contenteditable="true"]') || active.isContentEditable);
            if (editingText || !event.ctrlKey || event.altKey || event.metaKey) return;
            const key = event.key.toLowerCase();
            if (key === 'z') {
                event.preventDefault();
                undoResume();
            } else if (key === 'y') {
                event.preventDefault();
                redoResume();
            }
        });

        elements.resetResume.addEventListener('click', () => {
            state = createStateForMode(builderMode);
            saveState();
            showToast('Resume reset');
            renderAll();
        });

        if (elements.copyJsonResumePrompt) {
            elements.copyJsonResumePrompt.addEventListener('click', openPromptModal);
        }

        if (elements.copyCurrentResumeJson) {
            elements.copyCurrentResumeJson.addEventListener('click', copyCurrentResumeJson);
        }

        if (elements.promptModal) {
            elements.promptModal.addEventListener('click', event => {
                if (event.target === elements.promptModal || event.target.closest('[data-prompt-modal-close]')) {
                    closePromptModal();
                    return;
                }

                if (event.target.closest('[data-prompt-modal-copy]')) {
                    copyJsonResumePrompt();
                }
            });
        }

        if (elements.resumeSyntaxText) {
            elements.resumeSyntaxText.addEventListener('input', () => {
                elements.resumeSyntaxText.dataset.dirty = 'true';
                scheduleAutoApplyResumeSyntax();
            });

            elements.resumeSyntaxText.addEventListener('blur', () => {
                if (elements.resumeSyntaxText.dataset.dirty === 'true') {
                    autoApplyResumeSyntax();
                } else {
                    updateSyntaxTextarea();
                }
            });
        }

        openIdentityGate();
    }

    function isViewOptionsOpen() {
        return Boolean(elements.viewOptionsPanel && !elements.viewOptionsPanel.hidden);
    }

    function setViewOptionsOpen(open, options = {}) {
        if (!elements.viewOptionsToggle || !elements.viewOptionsPanel) return;
        elements.viewOptionsPanel.hidden = !open;
        elements.viewOptionsToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        if (!open && options.restoreFocus) {
            elements.viewOptionsToggle.focus({ preventScroll: true });
        }
    }

    function createInitialState() {
        const data = getResumeData();
        const personal = data.personal || {};
        const sections = {
            summary: {
                id: 'summary',
                type: 'summary',
                title: 'Summary',
                enabled: true,
                columns: 1,
                items: (data.summary || [])
                    .slice(0, 2)
                    .map((text, index) => ({
                        id: uniqueId('summary'),
                        sourceId: `summary-${index}`,
                        text
                    }))
            },
            experience: {
                id: 'experience',
                type: 'experience',
                title: 'Experience',
                enabled: true,
                columns: 1,
                items: (data.experience || []).map((item, index) => mapExperience(item, `experience-${index}`))
            },
            projects: {
                id: 'projects',
                type: 'projects',
                title: 'Projects',
                enabled: true,
                columns: 1,
                items: (data.allProjects || []).slice(0, 4).map((item, index) => mapProject(item, `projects-${index}`))
            },
            skills: {
                id: 'skills',
                type: 'skills',
                title: 'Skills',
                enabled: true,
                columns: 1,
                groups: Object.entries(data.skills || {}).map(([name, skills], index) => mapSkillGroup(name, skills, `skills-${index}`))
            },
            education: {
                id: 'education',
                type: 'education',
                title: 'Education',
                enabled: true,
                columns: 1,
                items: (data.education || []).map((item, index) => mapEducation(item, `education-${index}`))
            },
            research: {
                id: 'research',
                type: 'research',
                title: 'Research',
                enabled: true,
                columns: 1,
                items: (data.research || []).map((item, index) => mapResearch(item, `research-${index}`))
            },
            certifications: {
                id: 'certifications',
                type: 'certifications',
                title: 'Certifications',
                enabled: true,
                columns: 1,
                items: (data.certifications || []).map((item, index) => mapCertification(item, `certifications-${index}`))
            }
        };

        return {
            template: 'ats',
            templatePreset: 'experienced',
            layout: { ...DEFAULT_LAYOUT },
            styleClasses: deepClone(DEFAULT_STYLE_CLASSES),
            settings: {
                accent: '#1f6feb',
                fontFamily: DEFAULT_RESUME_FONT,
                fontSize: 10.25,
                lineHeight: 1.35,
                pagePaddingX: 56,
                pagePaddingY: 48,
                headerAlign: 'left',
                bulletStyle: 'hyphen',
                skillsColumns: 1,
                fontName: DEFAULT_RESUME_FONT,
                fontTitle: DEFAULT_RESUME_FONT,
                fontHeading: DEFAULT_RESUME_FONT,
                fontSectionHeading: DEFAULT_RESUME_FONT,
                fontItemHeading: DEFAULT_RESUME_FONT,
                fontBody: DEFAULT_RESUME_FONT,
                fontContact: DEFAULT_RESUME_FONT,
                fontMeta: DEFAULT_RESUME_FONT,
                colorName: '#111827',
                colorTitle: '#315f9b',
                colorContact: '#374151',
                colorSectionHeading: '#1f4f93',
                colorItemHeading: '#111827',
                colorDate: '#64748b',
                colorMeta: '#6b7280',
                colorBody: '#1f2937',
                colorSkillHeading: '#111827',
                colorSkillBody: '#374151',
                nameSize: 25,
                sectionHeadingSize: 11.05,
                itemHeadingSize: 9.75,
                dateSize: 9,
                metaSize: 9.3,
                contactSize: 9,
                skillHeadingSize: 9.4,
                skillBodySize: 9.2,
                headerDesign: 'minimal',
                headerPattern: 'none',
                headerPatternImage: '',
                headerBackground: '#f8fafc',
                headerTextColor: '#111827',
                headerLineHeight: 1.05,
                headerPadding: 0,
                headerSeparatorColor: '#cfd6df',
                headerSeparatorWeight: 1,
                contactLayout: 'horizontal',
                headerContactGap: 10,
                sectionHeadingAccent: 'none',
                sectionHeadingLineHeight: 1.15,
                sectionSeparatorColor: '#d8dee6',
                sectionSeparatorWeight: 1,
                showHeaderIcons: false,
                showProfilePhoto: false,
                profilePhotoShape: 'rounded-square',
                profilePhotoPlacement: 'left',
                titleSize: 11,
                titleLineHeight: 1.05
            },
            personal: {
                name: personal.name || '',
                title: personal.title || '',
                email: personal.email || '',
                location: personal.location || '',
                profileImage: personal.profileImage || 'public/profile.png',
                linkedin: cleanUrl(personal.linkedin || ''),
                github: cleanUrl(personal.github || ''),
                website: cleanUrl(personal.website || (data.meta && data.meta.siteUrl) || '')
            },
            sectionOrder: ['summary', 'experience', 'projects', 'skills', 'education', 'research', 'certifications'],
            sections,
            textStyles: {}
        };
    }

    function createBlankState() {
        const blank = createInitialState();
        blank.personal = {
            name: '',
            title: '',
            email: '',
            location: '',
            profileImage: '',
            linkedin: '',
            github: '',
            website: ''
        };

        Object.values(blank.sections).forEach(section => {
            section.enabled = false;
            if (section.items) section.items = [];
            if (section.groups) section.groups = [];
        });

        return blank;
    }

    function createStateForMode(mode) {
        return mode === 'guest' ? createBlankState() : createInitialState();
    }

    function loadBuilderMode() {
        const saved = localStorage.getItem(MODE_KEY);
        return saved === 'guest' ? 'guest' : 'ahmad';
    }

    function selectBuilderMode(mode) {
        builderMode = mode === 'guest' ? 'guest' : 'ahmad';
        localStorage.setItem(MODE_KEY, builderMode);
        if (builderMode === 'guest') {
            localStorage.removeItem(GUEST_WORKSPACE_KEY);
            localStorage.removeItem(PROFILE_GUIDE_KEY);
        } else {
            localStorage.setItem(GUEST_WORKSPACE_KEY, 'true');
            localStorage.setItem(PROFILE_GUIDE_KEY, 'true');
        }

        state = builderMode === 'guest'
            ? createBlankState()
            : (loadState('ahmad') || createInitialState());
        workflowStep = builderMode === 'guest' ? 'data' : 'entries';
        localStorage.setItem(WORKFLOW_KEY, workflowStep);
        pageAddMenuOpen = false;
        activeAddAnchor = 'start';
        if (elements.identityGate) elements.identityGate.hidden = true;
        document.body.classList.remove('identity-gate-open');

        resetHistory();
        saveState({ history: false });
        renderAll();
        showToast(builderMode === 'guest' ? 'Paste JSON or start without it' : 'Loaded Ahmad resume');
    }

    function openIdentityGate() {
        if (!elements.identityGate) return;
        if (localStorage.getItem(MODE_KEY)) return;
        elements.identityGate.hidden = false;
        document.body.classList.add('identity-gate-open');
        refreshLucideIcons();
    }

    function handleStartAction(action) {
        if (action === 'profile') {
            setWorkflowStep('entries');
            focusFirstProfileField();
            return;
        }

        if (action === 'add') {
            setWorkflowStep('entries');
            activeAddAnchor = 'start';
            pageAddMenuOpen = true;
            renderPreview();
            scrollPreviewIntoView();
            showToast('Choose a section to add');
            return;
        }

        if (action === 'design') {
            setWorkflowStep('templates');
            return;
        }

    }

    function focusFirstProfileField() {
        window.setTimeout(() => {
            const field = elements.constantsPanel && elements.constantsPanel.querySelector('input, textarea');
            if (field) {
                field.focus();
                if (field.type !== 'file' && typeof field.select === 'function') field.select();
            }
        }, 0);
    }

    function scrollPreviewIntoView() {
        const stage = elements.paperStage || elements.resumePreview;
        if (stage && typeof stage.scrollIntoView === 'function') {
            stage.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    function renderAll() {
        syncWorkflow();
        syncControls();
        renderConstantsPanel();
        renderTemplatePresets();
        renderEditor();
        renderPreview();
        updateSyntaxTextarea();
        updateJsonResumePrompt();
        refreshLucideIcons();
    }

    function loadWorkflowStep() {
        const saved = localStorage.getItem(WORKFLOW_KEY);
        const legacyMap = {
            build: 'data',
            profile: 'entries',
            design: 'templates'
        };
        const normalized = legacyMap[saved] || saved;
        return WORKFLOW_STEPS.has(normalized) ? normalized : 'data';
    }

    function setWorkflowStep(step) {
        const nextStep = WORKFLOW_STEPS.has(step) ? step : 'data';
        if (nextStep !== workflowStep) {
            pageAddMenuOpen = false;
            activeAddAnchor = 'start';
        }
        workflowStep = nextStep;
        localStorage.setItem(WORKFLOW_KEY, workflowStep);
        renderAll();
    }

    function syncResumeSyntaxBeforeStepChange(nextStep) {
        if (nextStep === 'data') return true;
        if (!elements.resumeSyntaxText || elements.resumeSyntaxText.dataset.dirty !== 'true') return true;

        clearTimeout(syntaxAutoApplyTimer);
        try {
            applyResumeSyntaxFromText(elements.resumeSyntaxText.value, { render: false });
            elements.resumeSyntaxText.dataset.dirty = 'false';
            persistResumeJsonDraft();
            updateSyntaxTextarea({ force: true });
            setSyntaxStatus('JSON applied to wizard');
            return true;
        } catch (error) {
            console.warn('Resume JSON tab sync failed:', error);
            setSyntaxStatus('Fix JSON before opening the wizard.', true);
            showToast('Fix JSON first');
            return false;
        }
    }

    function syncWorkflow() {
        document.body.dataset.workflowStep = workflowStep;
        document.body.dataset.guestWorkspace = isGuestJsonIntro() ? 'json' : 'started';
        if (elements.activeToolTitle) {
            elements.activeToolTitle.textContent = WORKFLOW_TITLES[workflowStep] || 'Resume';
        }
        document.body.dataset.builderMode = builderMode;
        if (!elements.workflowStepper) return;
        document.querySelectorAll('.workflow-step[data-workflow-step]').forEach(button => {
            const active = button.dataset.workflowStep === workflowStep;
            button.classList.toggle('active', active);
            button.setAttribute('aria-current', active ? 'step' : 'false');
            button.setAttribute('aria-selected', active ? 'true' : 'false');
        });
    }

    function isGuestJsonIntro() {
        return builderMode === 'guest' && localStorage.getItem(GUEST_WORKSPACE_KEY) !== 'true';
    }

    function enterGuestWorkspace(step = 'entries') {
        localStorage.setItem(GUEST_WORKSPACE_KEY, 'true');
        workflowStep = WORKFLOW_STEPS.has(step) ? step : 'entries';
        localStorage.setItem(WORKFLOW_KEY, workflowStep);
        document.body.dataset.guestWorkspace = 'started';
    }

    function populateFontSelects() {
        document.querySelectorAll('.font-select').forEach(select => {
            select.innerHTML = FONT_OPTIONS.map(([label, value]) => `
                <option value="${escapeAttr(value)}">${escapeHtml(label)}</option>
            `).join('');
        });
    }

    function enhanceColorControls() {
        document.querySelectorAll('input[type="color"][data-setting]').forEach(input => {
            if (input.closest('.color-control')) return;
            const setting = input.dataset.setting;
            const label = getColorControlLabel(input, setting);
            const wrapper = document.createElement('div');
            wrapper.className = 'color-control';
            wrapper.dataset.colorSetting = setting;
            input.parentNode.insertBefore(wrapper, input);
            wrapper.appendChild(input);
            input.classList.add('color-picker-input');

            const hexInput = document.createElement('input');
            hexInput.type = 'text';
            hexInput.className = 'color-hex-input';
            hexInput.dataset.colorHex = '';
            hexInput.dataset.colorSetting = setting;
            hexInput.inputMode = 'text';
            hexInput.maxLength = 7;
            hexInput.autocomplete = 'off';
            hexInput.setAttribute('aria-label', 'Hex color');
            wrapper.appendChild(hexInput);

            const paletteButton = document.createElement('button');
            paletteButton.type = 'button';
            paletteButton.className = 'color-palette-button';
            paletteButton.dataset.colorModalOpen = '';
            paletteButton.dataset.setting = setting;
            paletteButton.dataset.colorLabel = label;
            paletteButton.innerHTML = '<span aria-hidden="true"></span><i data-lucide="palette" aria-hidden="true"></i>';
            paletteButton.setAttribute('aria-label', `${label} palette`);
            paletteButton.setAttribute('title', `${label} palette`);
            wrapper.appendChild(paletteButton);
        });
    }

    function syncControls() {
        document.querySelectorAll('[data-template]').forEach(button => {
            button.classList.toggle('active', button.dataset.template === state.template);
        });

        document.querySelectorAll('[data-template-preset]').forEach(button => {
            const active = button.dataset.templatePreset === (state.templatePreset || 'experienced');
            button.classList.toggle('active', active);
            button.setAttribute('aria-pressed', active ? 'true' : 'false');
        });

        document.querySelectorAll('[data-setting]').forEach(input => {
            const key = input.dataset.setting;
            if (input.type === 'checkbox') {
                input.checked = Boolean(state.settings[key]);
            } else if (input.value !== String(state.settings[key])) {
                input.value = state.settings[key];
            }
        });

        document.querySelectorAll('[data-inline-setting]').forEach(input => {
            const key = input.dataset.inlineSetting;
            if (input.value !== String(state.settings[key])) {
                input.value = state.settings[key];
            }
        });

        document.querySelectorAll('[data-bullet-style-option]').forEach(button => {
            const active = button.dataset.bulletStyleOption === state.settings.bulletStyle;
            button.classList.toggle('active', active);
            button.setAttribute('aria-checked', active ? 'true' : 'false');
        });

        document.querySelectorAll('[data-setting-preset]').forEach(button => {
            const key = button.dataset.settingPreset;
            const active = Number(state.settings[key]) === Number(button.dataset.value);
            button.classList.toggle('active', active);
            button.setAttribute('aria-pressed', active ? 'true' : 'false');
        });

        syncCustomLineHeightControls();

        document.querySelectorAll('[data-margin-preset]').forEach(button => {
            const active = getActiveMarginPreset() === button.dataset.marginPreset;
            button.classList.toggle('active', active);
            button.setAttribute('aria-pressed', active ? 'true' : 'false');
        });

        document.querySelectorAll('[data-zoom-preset]').forEach(button => {
            const active = Number(button.dataset.zoomPreset) === Number(previewZoom);
            button.classList.toggle('active', active);
            button.setAttribute('aria-pressed', active ? 'true' : 'false');
        });

        document.querySelectorAll('[data-color-hex]').forEach(input => {
            const key = input.dataset.colorSetting || input.dataset.setting;
            const value = normalizeHexColor(state.settings[key] || input.value);
            if (input.value !== value) input.value = value;
        });

        document.querySelectorAll('[data-color-setting]').forEach(control => {
            const key = control.dataset.colorSetting;
            const value = normalizeHexColor(state.settings[key] || '#111827') || '#111827';
            control.style.setProperty('--active-color', value);
            const button = control.querySelector('[data-color-modal-open]');
            if (button) button.dataset.colorValue = value;
        });

        document.querySelectorAll('[data-output-for="fontSize"]').forEach(output => {
            output.textContent = `${state.settings.fontSize}pt`;
        });
        document.querySelectorAll('[data-output-for="lineHeight"]').forEach(output => {
            output.textContent = state.settings.lineHeight.toFixed(2);
        });
        document.querySelectorAll('[data-output-for="headerLineHeight"]').forEach(output => {
            output.textContent = state.settings.headerLineHeight.toFixed(2);
        });
        document.querySelectorAll('[data-output-for="headerPadding"]').forEach(output => {
            output.textContent = `${state.settings.headerPadding}px`;
        });
        document.querySelectorAll('[data-output-for="headerSeparatorWeight"]').forEach(output => {
            output.textContent = `${state.settings.headerSeparatorWeight}px`;
        });
        document.querySelectorAll('[data-output-for="headerContactGap"]').forEach(output => {
            output.textContent = `${state.settings.headerContactGap}px`;
        });
        document.querySelectorAll('[data-output-for="sectionHeadingLineHeight"]').forEach(output => {
            output.textContent = state.settings.sectionHeadingLineHeight.toFixed(2);
        });
        document.querySelectorAll('[data-output-for="sectionSeparatorWeight"]').forEach(output => {
            output.textContent = `${state.settings.sectionSeparatorWeight}px`;
        });
        syncUndoRedo();
        renderSelectedTextControls();
    }

    function applySettingPreset(key, value) {
        if (!key || !Number.isFinite(value)) return;
        if (key === 'fontSize' && TEXT_SCALE_PRESETS[value]) {
            applyTextScalePreset(value);
            return;
        }
        if (state.settings[key] === value) return;
        state.settings[key] = value;
        saveState();
        syncControls();
        renderPreview();
        showToast(`Line spacing set to ${value}`);
    }

    function applyCustomLineHeight(value) {
        const nextValue = Math.max(1, Math.min(1.8, Number(value) || state.settings.lineHeight || 1.35));
        if (state.settings.lineHeight === nextValue) return;
        state.settings.lineHeight = nextValue;
        saveState();
        syncControls();
        renderPreview();
    }

    function setCustomLineHeightActive(showToastMessage = false) {
        syncCustomLineHeightControls({ forceOpen: true });
        const input = document.querySelector('[data-line-height-custom]');
        if (input) input.focus();
        if (showToastMessage) showToast('Custom line spacing enabled');
    }

    function syncCustomLineHeightControls(options = {}) {
        const presetValues = Array.from(document.querySelectorAll('[data-setting-preset="lineHeight"]'))
            .map(button => Number(button.dataset.value));
        const isPreset = presetValues.some(value => Number(state.settings.lineHeight) === value);
        const isCustom = options.forceOpen || !isPreset;
        document.querySelectorAll('[data-line-height-custom-toggle]').forEach(button => {
            button.classList.toggle('active', isCustom);
            button.setAttribute('aria-pressed', isCustom ? 'true' : 'false');
        });
        document.querySelectorAll('[data-line-height-custom]').forEach(input => {
            input.hidden = !isCustom;
            if (input.value !== String(state.settings.lineHeight)) input.value = String(state.settings.lineHeight);
        });
    }

    function applyTextScalePreset(value) {
        const preset = TEXT_SCALE_PRESETS[value];
        if (!preset) return;
        const hadTextSizeOverrides = hasTextSizeOverrides();
        const changed = hadTextSizeOverrides || Object.entries(preset).some(([key, nextValue]) => Number(state.settings[key]) !== nextValue);
        if (!changed) return;
        Object.assign(state.settings, preset);
        clearTextSizeOverrides();
        saveState();
        syncControls();
        renderPreview();
        const label = value === 9 ? 'Small' : value === 12 ? 'Large' : 'Medium';
        showToast(`${label} resume text scale applied`);
    }

    function hasTextSizeOverrides() {
        return Object.values(state.textStyles || {}).some(override => Object.prototype.hasOwnProperty.call(override || {}, 'fontSize'));
    }

    function clearTextSizeOverrides() {
        Object.entries(state.textStyles || {}).forEach(([key, override]) => {
            if (!override || typeof override !== 'object') return;
            delete override.fontSize;
            if (!Object.keys(override).length) delete state.textStyles[key];
        });
    }

    function applyMarginPreset(preset) {
        const presets = {
            compact: { pagePaddingX: 40, pagePaddingY: 32 },
            normal: { pagePaddingX: 56, pagePaddingY: 48 },
            wide: { pagePaddingX: 72, pagePaddingY: 64 }
        };
        const next = presets[preset] || presets.normal;
        const changed = state.settings.pagePaddingX !== next.pagePaddingX || state.settings.pagePaddingY !== next.pagePaddingY;
        if (!changed) return;
        state.settings.pagePaddingX = next.pagePaddingX;
        state.settings.pagePaddingY = next.pagePaddingY;
        saveState();
        syncControls();
        renderPreview();
        showToast(`${titleCase(preset)} margins applied`);
    }

    function getActiveMarginPreset() {
        const x = Number(state.settings.pagePaddingX);
        const y = Number(state.settings.pagePaddingY);
        if (x === 40 && y === 32) return 'compact';
        if (x === 72 && y === 64) return 'wide';
        return 'normal';
    }

    function handleSettingControl(input) {
        const key = input.dataset.setting;
        const value = readInputValue(input);
        if (state.settings[key] === value) return;
        state.settings[key] = value;

        saveState();
        syncControls();
        renderPreview();
    }

    function handleTextStyleControl(control) {
        const styleKey = control.dataset.styleKey;
        const setting = control.dataset.textStyleSetting;
        if (!styleKey || !setting) return;

        if (!state.textStyles) state.textStyles = {};
        const override = { ...(state.textStyles[styleKey] || {}) };

        if (setting === 'fontFamily') {
            if (control.value) override.fontFamily = control.value;
            else delete override.fontFamily;
        } else if (setting === 'fontSize') {
            if (control.value) override.fontSize = Number(control.value);
            else delete override.fontSize;
        } else if (setting === 'color') {
            const color = normalizeHexColor(control.value);
            if (!color) return;
            override.color = color;
        }

        if (Object.keys(override).length) {
            state.textStyles[styleKey] = override;
        } else {
            delete state.textStyles[styleKey];
        }

        saveState();
        applyRenderedTextStyle(styleKey);
        renderSelectedTextControls();
    }

    function resetTextStyleOverride(styleKey) {
        if (!styleKey || !state.textStyles || !state.textStyles[styleKey]) return;
        delete state.textStyles[styleKey];
        saveState();
        renderPreview();
        renderSelectedTextControls();
        showToast('Class style restored');
    }

    function applyRenderedTextStyle(styleKey) {
        if (!styleKey) return;
        elements.resumePreview.querySelectorAll('[data-style-key]').forEach(element => {
            if (element.dataset.styleKey !== styleKey || element.matches('[data-style-menu], [data-text-style-setting], [data-text-style-reset]')) return;
            const style = resolveTextStyle(element.dataset.styleRole || 'body', styleKey);
            element.style.setProperty('--text-font', style.fontFamily);
            element.style.setProperty('--text-color', style.color);
            element.style.setProperty('--text-size', `${style.fontSize}pt`);
        });
    }

    function isPreviewControlTarget(target) {
        return previewControlInteraction || Boolean(target && target.closest && target.closest('.inline-format-control, .bullet-style-inline, .resume-header-style-dock, .resume-section-tools'));
    }

    function setActiveTextStyleTarget(target) {
        if (!target || !target.dataset.styleKey) return;
        activeTextStyleTarget = {
            key: target.dataset.styleKey,
            role: target.dataset.styleRole || 'body',
            label: getTextStyleLabel(target.dataset.styleRole || 'body')
        };
        elements.resumePreview.querySelectorAll('.is-text-style-selected').forEach(element => {
            element.classList.remove('is-text-style-selected');
        });
        target.classList.add('is-text-style-selected');
        renderSelectedTextControls();
    }

    function renderSelectedTextControls() {
        if (!elements.selectedTextControls) return;
        if (!activeTextStyleTarget || !activeTextStyleTarget.key) {
            elements.selectedTextControls.hidden = true;
            elements.selectedTextControls.innerHTML = '';
            return;
        }

        const { key, role, label } = activeTextStyleTarget;
        const style = resolveTextStyle(role, key);
        const override = getTextStyleOverride(key);
        elements.selectedTextControls.hidden = false;
        elements.selectedTextControls.innerHTML = `
            <span class="selected-text-label">${escapeHtml(label)}</span>
            <select data-text-style-setting="fontFamily" data-style-role="${escapeAttr(role)}" data-style-key="${escapeAttr(key)}" aria-label="${escapeAttr(label)} font">
                <option value="">Class font</option>
                ${renderFontOptions(override.fontFamily || '')}
            </select>
            <select data-text-style-setting="fontSize" data-style-role="${escapeAttr(role)}" data-style-key="${escapeAttr(key)}" aria-label="${escapeAttr(label)} size">
                <option value="">Class size</option>
                ${TEXT_SIZE_OPTIONS.map(value => `<option value="${value}" ${Number(override.fontSize) === value ? 'selected' : ''}>${value} pt</option>`).join('')}
            </select>
            <button type="button" class="selected-color-button" data-text-color-open data-style-role="${escapeAttr(role)}" data-style-key="${escapeAttr(key)}" data-color-label="${escapeAttr(label)}" data-color-value="${escapeAttr(style.color)}" aria-label="${escapeAttr(label)} color" title="${escapeAttr(label)} color" style="--active-color:${escapeAttr(style.color)}">
                <span aria-hidden="true"></span>
                Color
            </button>
            <button type="button" class="inline-reset-button" data-text-style-reset data-style-key="${escapeAttr(key)}" aria-label="Use class style" title="Use class style">
                <i data-lucide="rotate-ccw" aria-hidden="true"></i>
            </button>
        `;
        refreshLucideIcons();
    }

    function handleColorHexInput(input) {
        const setting = input.dataset.colorSetting || input.dataset.setting;
        const color = normalizeHexColor(input.value);
        if (!setting || !color) return;
        state.settings[setting] = color;
        saveState();
        syncControls();
        renderPreview();
    }

    function openColorModal(target) {
        const color = normalizeHexColor(target.value) || '#111827';
        activeColorTarget = { ...target, value: color };
        elements.colorModalTitle.textContent = `${target.label || 'Color'} color`;
        elements.colorModalSwatches.innerHTML = COLOR_PRESETS.map(([label, value]) => `
            <button type="button" class="color-modal-swatch" data-modal-color="${escapeAttr(value)}" aria-label="${escapeAttr(label)}" title="${escapeAttr(label)}" style="--preset-color:${escapeAttr(value)}">
                <span>${escapeHtml(label)}</span>
                <code>${escapeHtml(value)}</code>
            </button>
        `).join('');
        setColorModalDraft(color);
        elements.colorModal.hidden = false;
        document.body.classList.add('color-modal-open');
        refreshLucideIcons();
    }

    function closeColorModal() {
        if (!elements.colorModal) return;
        elements.colorModal.hidden = true;
        document.body.classList.remove('color-modal-open');
        activeColorTarget = null;
    }

    function setColorModalDraft(value) {
        const color = normalizeHexColor(value);
        if (!color) return;
        elements.colorModalPicker.value = color;
        elements.colorModalHex.value = color;
        elements.colorModal.style.setProperty('--active-color', color);
        elements.colorModalSwatches.querySelectorAll('[data-modal-color]').forEach(button => {
            button.classList.toggle('active', normalizeHexColor(button.dataset.modalColor) === color);
        });
    }

    function applyColorModal() {
        if (!activeColorTarget) return;
        const color = normalizeHexColor(elements.colorModalHex.value || elements.colorModalPicker.value);
        if (!color) return;

        if (activeColorTarget.type === 'text') {
            handleTextStyleControl({
                dataset: {
                    styleKey: activeColorTarget.styleKey,
                    textStyleSetting: 'color'
                },
                value: color
            });
        } else if (activeColorTarget.setting) {
            state.settings[activeColorTarget.setting] = color;
            saveState();
            syncControls();
            renderPreview();
        }

        closeColorModal();
    }

    function getColorControlLabel(input, setting) {
        const ariaLabel = input.getAttribute('aria-label');
        if (ariaLabel) return ariaLabel.replace(/\s*color\s*$/i, '') || 'Color';
        const label = input.closest('label');
        const text = label && label.querySelector('.field-label');
        if (text && text.textContent.trim()) return text.textContent.trim();
        return titleCase(setting.replace(/^color/, ''));
    }

    function normalizeHexColor(value) {
        const raw = String(value || '').trim();
        if (/^#[0-9a-fA-F]{6}$/.test(raw)) return raw.toLowerCase();
        const short = raw.match(/^#?([0-9a-fA-F]{3})$/);
        if (short) {
            return `#${short[1].split('').map(char => char + char).join('')}`.toLowerCase();
        }
        const full = raw.match(/^#?([0-9a-fA-F]{6})$/);
        return full ? `#${full[1].toLowerCase()}` : '';
    }

    function getTextStyleLabel(role) {
        const labels = {
            name: 'Name',
            title: 'Title',
            contact: 'Contact',
            sectionHeading: 'Section header',
            itemHeading: 'Entry header',
            date: 'Date',
            meta: 'Details',
            body: 'Text',
            academicBody: 'Text',
            itemBody: 'Entry text',
            skillHeading: 'Skill label',
            skillBody: 'Skill text'
        };
        return labels[role] || 'Text';
    }

    function renderTemplatePresets() {
        if (!elements.templateList) return;
        const activePreset = state.templatePreset || 'experienced';

        elements.templateList.innerHTML = TEMPLATE_PRESETS.map(preset => {
            const active = preset.id === activePreset;
            return `
                <button type="button" class="template-card ${active ? 'active' : ''}" data-template-preset="${escapeAttr(preset.id)}" aria-pressed="${active ? 'true' : 'false'}">
                    <span class="template-placeholder" aria-hidden="true">
                        <img src="public/resume/default-cv-thumbnail.png" alt="">
                    </span>
                    <strong>${escapeHtml(preset.name)}</strong>
                </button>
            `;
        }).join('');
    }

    function applyTemplatePreset(presetId) {
        const preset = TEMPLATE_PRESETS.find(item => item.id === presetId);
        if (!preset) return;

        state.template = preset.template || 'ats';
        state.templatePreset = preset.id;
        state.layout = normalizeLayout(preset.layout || DEFAULT_LAYOUT);
        state.styleClasses = normalizeStyleClasses(preset.styleClasses || DEFAULT_STYLE_CLASSES);
        state.settings = {
            ...state.settings,
            ...ATS_BASE_SETTINGS,
            ...(preset.settings || {})
        };
        if (preset.suppressProfilePhoto) {
            state.settings.showProfilePhoto = false;
        }
        state.textStyles = {};

        const knownSections = new Set(Object.keys(state.sections || {}));
        const nextOrder = preset.sectionOrder.filter(sectionId => knownSections.has(sectionId));
        Object.keys(state.sections || {}).forEach(sectionId => {
            if (!nextOrder.includes(sectionId)) nextOrder.push(sectionId);
        });
        state.sectionOrder = nextOrder;

        Object.entries(state.sections || {}).forEach(([sectionId, section]) => {
            section.columns = 1;
            section.placement = 'auto';
            section.className = '';
            section.headerClassName = '';
            section.style = {};
            section.headerStyle = {};
            if (Object.prototype.hasOwnProperty.call(preset.titles || {}, sectionId)) {
                section.title = preset.titles[sectionId];
            }
            if (preset.sectionUpdates && preset.sectionUpdates[sectionId]) {
                Object.assign(section, deepClone(preset.sectionUpdates[sectionId]));
            }
            section.enabled = section.enabled !== false;
        });

        if (state.sections.skills) {
            state.sections.skills.columns = preset.sectionUpdates && preset.sectionUpdates.skills && preset.sectionUpdates.skills.columns
                ? preset.sectionUpdates.skills.columns
                : state.settings.skillsColumns;
        }

        state = normalizeState(state, builderMode);
        saveState();
        renderAll();
        showToast(`${preset.name} template applied`);
    }

    function spotlightResumeForTemplate(presetId) {
        const preset = TEMPLATE_PRESETS.find(item => item.id === presetId);
        if (!preset || !elements.resumePreview) return;
        clearTemplateSpotlight();
        const paper = elements.resumePreview.querySelector('.resume-paper');
        if (paper) paper.classList.add('has-template-spotlight');

        const targets = getTemplateSpotlightTargets(preset);
        targets.forEach(selector => {
            elements.resumePreview.querySelectorAll(selector).forEach(element => {
                element.classList.add('is-template-spotlit');
            });
        });
    }

    function clearTemplateSpotlight() {
        if (!elements.resumePreview) return;
        elements.resumePreview.querySelectorAll('.has-template-spotlight, .is-template-spotlit').forEach(element => {
            element.classList.remove('has-template-spotlight', 'is-template-spotlit');
        });
    }

    function getTemplateSpotlightTargets(preset) {
        const targets = ['.resume-header'];
        if (preset.layout && preset.layout.mode !== 'single') {
            targets.push('.resume-body-grid', '.resume-side-column', '.resume-main-column');
        }
        if (Array.isArray(preset.sectionOrder)) {
            preset.sectionOrder.slice(0, 3).forEach(sectionId => {
                targets.push(`[data-resume-section="${escapeCssIdentifier(sectionId)}"]`);
            });
        }
        if (Array.isArray(preset.spotlightTargets)) targets.push(...preset.spotlightTargets);
        return targets;
    }

    function escapeCssIdentifier(value) {
        if (window.CSS && typeof window.CSS.escape === 'function') return window.CSS.escape(String(value));
        return String(value).replace(/"/g, '\\"');
    }

    function getSectionItemCount(section) {
        if (section.type === 'summary') return richHtmlToPlainText(getSummaryBody(section)) ? 1 : 0;
        if (section.type === 'skills') return (section.groups || []).length;
        return (section.items || []).length;
    }

    function renderColumnStepper(section, scope = 'editor') {
        if (templateControlsSectionColumns()) return '';
        const columns = getSectionColumns(section);
        const disabledUp = columns >= 4 ? 'disabled' : '';
        const actionAttribute = scope === 'preview' ? 'data-preview-action' : 'data-action';
        const sectionAttribute = 'data-section';
        const choices = [1, 2, 3, 4].map(count => `
            <button type="button" class="column-choice ${count === columns ? 'is-active' : ''}" ${actionAttribute}="columns-set" ${sectionAttribute}="${escapeAttr(section.id)}" data-columns="${count}" aria-pressed="${count === columns ? 'true' : 'false'}" aria-label="Use ${count} ${count === 1 ? 'column' : 'columns'}" title="${count} ${count === 1 ? 'column' : 'columns'}">
                ${count}
            </button>
        `).join('');

        return `
            <div class="column-control" data-column-control="${escapeAttr(scope)}" aria-label="${escapeAttr(section.title)} columns">
                <span class="column-control-label">
                    <i data-lucide="columns-2" aria-hidden="true"></i>
                    Columns
                </span>
                <div class="column-choice-group" role="group" aria-label="Column count">
                    ${choices}
                </div>
                <button type="button" class="column-add-button" ${actionAttribute}="columns-up" ${sectionAttribute}="${escapeAttr(section.id)}" ${disabledUp} aria-label="Add column" title="Add column">
                    <i data-lucide="plus" aria-hidden="true"></i>
                    <span>Add column</span>
                </button>
            </div>
        `;
    }

    function renderPageAddMenu(anchor) {
        if (!pageAddMenuOpen || activeAddAnchor !== anchor) return '';

        return `
            <div class="page-add-menu-header">
                <div class="page-add-title">
                    <i data-lucide="plus" aria-hidden="true"></i>
                    <span>Add section</span>
                </div>
                <button type="button" class="page-add-close" data-page-add-close aria-label="Close add menu" title="Close">
                    <i data-lucide="x" aria-hidden="true"></i>
                </button>
            </div>
            ${renderPageAddManualOptions()}
        `;
    }

    function renderPageAddManualOptions() {
        const options = SECTION_ADD_OPTIONS
            .filter(([key]) => state.sections[key])
            .map(([sectionId, label, icon]) => {
                const section = state.sections[sectionId];
                const actionLabel = section.type === 'skills' ? 'Skill group' : label;
                const meta = section.enabled ? 'Add entry' : 'Show section';
                return `
                    <button type="button" class="page-add-option" data-page-add-manual="${escapeAttr(sectionId)}">
                        <span class="page-add-option-icon" aria-hidden="true">${fallbackIcon(icon)}</span>
                        <span>
                            <strong>${escapeHtml(actionLabel)}</strong>
                            <small>${escapeHtml(meta)}</small>
                        </span>
                    </button>
                `;
            })
            .join('');

        return `<div class="page-add-options">${options}</div>`;
    }

    function handlePageAddMenuClick(event) {
        event.stopPropagation();

        const closeButton = event.target.closest('[data-page-add-close]');
        if (closeButton) {
            pageAddMenuOpen = false;
            renderPreview();
            return;
        }

        const manualButton = event.target.closest('[data-page-add-manual]');
        if (manualButton) {
            const section = state.sections[manualButton.dataset.pageAddManual];
            if (!section) return;
            addManualItem(section);
            placeSectionAfterAnchor(section.id, activeAddAnchor);
            pageAddMenuOpen = false;
            saveState();
            showToast(`Added ${section.title}`);
            renderAll();
        }
    }

    function renderConstantsPanel() {
        elements.constantsPanel.innerHTML = renderNonJsonWizard();
    }

    function renderNonJsonWizard() {
        const step = getCurrentWizardStep();
        const currentIndex = Math.max(0, Math.min(profileGuideCursor, NON_JSON_WIZARD_STEPS.length - 1));
        const filledCount = NON_JSON_WIZARD_STEPS.filter(item => isWizardStepFilled(item)).length;
        const isLast = currentIndex === NON_JSON_WIZARD_STEPS.length - 1;

        return `
            <div class="resume-wizard">
                <div class="resume-wizard-topline">
                    <span class="panel-kicker">Step ${currentIndex + 1} of ${NON_JSON_WIZARD_STEPS.length}</span>
                    <span>${filledCount} filled</span>
                </div>
                <div class="resume-wizard-meter" aria-hidden="true">
                    <span style="width:${((currentIndex + 1) / NON_JSON_WIZARD_STEPS.length) * 100}%"></span>
                </div>
                <section class="resume-wizard-card">
                    <div class="resume-wizard-heading">
                        <h2>${escapeHtml(step.label)}</h2>
                        <p>${escapeHtml(step.prompt)}</p>
                    </div>
                    ${renderWizardStepFields(step)}
                    <div class="resume-wizard-actions">
                        <button type="button" class="tool-button tool-button-secondary compact-action" data-profile-guide-action="back" ${currentIndex === 0 ? 'disabled' : ''}>Back</button>
                        <button type="button" class="tool-button tool-button-secondary compact-action" data-profile-guide-action="skip">Skip</button>
                        <button type="button" class="tool-button tool-button-primary compact-action" data-profile-guide-action="next">${isLast ? 'Done' : 'Next'}</button>
                    </div>
                </section>
                <div class="resume-wizard-dots" aria-label="Wizard progress">
                    ${NON_JSON_WIZARD_STEPS.map((item, index) => `
                        <span class="${index === currentIndex ? 'is-current' : ''} ${isWizardStepFilled(item) ? 'is-filled' : ''}" title="${escapeAttr(item.label)}"></span>
                    `).join('')}
                </div>
            </div>
        `;
    }

    function getCurrentWizardStep() {
        const maxIndex = NON_JSON_WIZARD_STEPS.length - 1;
        profileGuideCursor = Math.max(0, Math.min(profileGuideCursor, maxIndex));
        return NON_JSON_WIZARD_STEPS[profileGuideCursor];
    }

    function renderWizardStepFields(step) {
        if (step.type === 'identity') {
            return `
                <div class="resume-wizard-field-grid">
                    ${renderWizardField('Name', state.personal.name, 'data-personal-field="name"')}
                    ${renderWizardField('Role / tagline', state.personal.title, 'data-personal-field="title"')}
                </div>
            `;
        }

        if (step.type === 'contact') {
            return `
                <div class="resume-wizard-field-grid">
                    ${renderWizardField('Email', state.personal.email, 'data-personal-field="email"')}
                    ${renderWizardField('Location', state.personal.location, 'data-personal-field="location"')}
                    ${renderWizardField('LinkedIn', state.personal.linkedin, 'data-personal-field="linkedin"')}
                    ${renderWizardField('GitHub', state.personal.github, 'data-personal-field="github"')}
                    ${renderWizardField('Website', state.personal.website, 'data-personal-field="website"')}
                </div>
            `;
        }

        if (step.type === 'photo') {
            return `
                <div class="resume-wizard-stack">
                    <div class="wizard-photo-field">
                        <div class="wizard-photo-preview ${state.personal.profileImage ? 'has-photo' : ''}" data-preview-shape="${escapeAttr(state.settings.profilePhotoShape)}">
                            ${state.personal.profileImage ? `
                                <img src="${escapeAttr(state.personal.profileImage)}" alt="${escapeAttr(state.personal.name || 'Profile')} preview">
                            ` : `
                                <i data-lucide="user-round" aria-hidden="true"></i>
                            `}
                        </div>
                        <div class="wizard-photo-controls">
                            <label class="wizard-photo-upload">
                                <span class="field-label">Photo</span>
                                <input class="file-input" type="file" accept="image/*" data-profile-upload>
                            </label>
                            ${state.personal.profileImage ? `
                                <button type="button" class="wizard-photo-remove" data-profile-guide-action="remove-photo">
                                    <i data-lucide="x" aria-hidden="true"></i>
                                    Remove photo
                                </button>
                            ` : ''}
                        </div>
                    </div>
                    ${renderWizardPhotoChoices()}
                </div>
            `;
        }

        if (step.type === 'personal') {
            return renderWizardField(step.label, state.personal[step.field], `data-personal-field="${escapeAttr(step.field)}"`);
        }

        if (step.type === 'links') {
            return `
                <div class="resume-wizard-stack">
                    ${renderWizardField('LinkedIn', state.personal.linkedin, 'data-personal-field="linkedin"')}
                    ${renderWizardField('GitHub', state.personal.github, 'data-personal-field="github"')}
                    ${renderWizardField('Website', state.personal.website, 'data-personal-field="website"')}
                </div>
            `;
        }

        if (step.type === 'summary') {
            const section = state.sections.summary;
            return renderWizardRichText('Summary paragraph', getSummaryBody(section), 'data-section-body="summary"');
        }

        if (step.type === 'skills') {
            const section = state.sections.skills;
            const columns = getSectionColumns(section);
            const groups = ensureWizardSkillGroups(columns).slice(0, columns);
            return renderWizardSkillsBuilder(groups, columns);
        }

        if (step.type === 'entry') {
            const section = state.sections[step.section];
            const columns = getSectionColumns(section);
            const items = ensureWizardItems(step.section, columns);
            const addChoiceOpen = wizardAddChoiceSection === step.section;
            const templateColumnsLocked = templateControlsSectionColumns();
            return `
                <div class="resume-wizard-stack">
                    <div class="resume-wizard-entry-grid" style="--wizard-columns:${columns}">
                        ${items.map((item, index) => `
                            <section class="resume-wizard-entry-card">
                                <div class="resume-wizard-entry-topline">
                                    <div class="resume-wizard-entry-count">Entry ${index + 1}</div>
                                    ${items.length > 1 ? `
                                        <button type="button" class="wizard-entry-remove" data-profile-guide-action="remove-entry" data-wizard-section="${escapeAttr(step.section)}" data-wizard-item="${escapeAttr(item.id)}" aria-label="Remove entry ${index + 1}" title="Remove entry">
                                            <i data-lucide="x" aria-hidden="true"></i>
                                        </button>
                                    ` : ''}
                                </div>
                                ${renderWizardEntryFields(step.section, item)}
                            </section>
                        `).join('')}
                    </div>
                    <div class="wizard-add-entry-block">
                        <button type="button" class="wizard-add-button" data-profile-guide-action="add-entry-options" data-wizard-section="${escapeAttr(step.section)}" aria-expanded="${addChoiceOpen ? 'true' : 'false'}">
                            <i data-lucide="plus" aria-hidden="true"></i>
                            Add ${escapeHtml(step.label.toLowerCase().replace(/s$/, ''))}
                        </button>
                        ${addChoiceOpen ? `
                            <div class="wizard-add-entry-options" aria-label="Add entry placement">
                                <button type="button" data-profile-guide-action="add-entry-below" data-wizard-section="${escapeAttr(step.section)}">
                                    <i data-lucide="rows-2" aria-hidden="true"></i>
                                    Below
                                </button>
                                ${templateColumnsLocked ? '' : `<button type="button" data-profile-guide-action="add-entry-column" data-wizard-section="${escapeAttr(step.section)}" ${columns >= 3 ? 'disabled' : ''}>
                                    <i data-lucide="columns-2" aria-hidden="true"></i>
                                    As column
                                </button>`}
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        }

        return '';
    }

    function renderWizardField(label, value, dataAttributes) {
        return `
            <label class="resume-wizard-field">
                <span class="field-label">${escapeHtml(label)}</span>
                <input class="field-input" value="${escapeAttr(value || '')}" ${dataAttributes} autocomplete="off">
            </label>
        `;
    }

    function renderWizardTextarea(label, value, dataAttributes) {
        return `
            <label class="resume-wizard-field">
                <span class="field-label">${escapeHtml(label)}</span>
                <textarea class="field-textarea rich-textarea" ${dataAttributes}>${escapeHtml(value || '')}</textarea>
            </label>
        `;
    }

    function renderWizardRichText(label, value, dataAttributes) {
        return `
            <div class="resume-wizard-field wizard-rich-field">
                <span class="field-label">${escapeHtml(label)}</span>
                <div class="wizard-rich-shell">
                    <div class="wizard-rich-toolbar" aria-label="${escapeAttr(label)} formatting">
                        <button type="button" class="rich-tool-button" data-wizard-rich-command="bold" aria-label="Bold" title="Bold">
                            <i data-lucide="bold" aria-hidden="true"></i>
                        </button>
                        <button type="button" class="rich-tool-button" data-wizard-rich-command="italic" aria-label="Italic" title="Italic">
                            <i data-lucide="italic" aria-hidden="true"></i>
                        </button>
                        <button type="button" class="rich-tool-button" data-wizard-rich-command="insertUnorderedList" aria-label="Bullets" title="Bullets">
                            <i data-lucide="list" aria-hidden="true"></i>
                        </button>
                    </div>
                    <div class="wizard-rich-editor" contenteditable="true" data-wizard-rich ${dataAttributes}>${sanitizeRichHtml(value || '')}</div>
                </div>
            </div>
        `;
    }

    function renderWizardSkillsBuilder(groups, columns) {
        const activeGroup = getActiveWizardSkillGroup(groups);
        const skills = (Array.isArray(activeGroup.skills) ? activeGroup.skills : [])
            .map(skill => String(skill || '').trim())
            .filter(Boolean);

        return `
            <div class="wizard-skills-builder">
                <div class="wizard-skills-toolbar">
                    ${groups.length > 1 ? `
                        <div class="wizard-skill-tabs" aria-label="Skill columns">
                            ${groups.map((group, index) => `
                                <button type="button" class="${group.id === activeGroup.id ? 'active' : ''}" data-profile-guide-action="select-skill-group" data-skill-group="${escapeAttr(group.id)}" aria-pressed="${group.id === activeGroup.id ? 'true' : 'false'}">
                                    ${escapeHtml(group.name || `Column ${index + 1}`)}
                                </button>
                            `).join('')}
                        </div>
                    ` : ''}
                    ${renderWizardColumnPicker('skills', columns)}
                </div>

                <section class="wizard-skill-card">
                    <div class="wizard-skill-heading">
                        ${renderWizardField('Category', activeGroup.name || '', `data-skill-group="${escapeAttr(activeGroup.id)}" data-skill-field="name"`)}
                    </div>
                    <label class="resume-wizard-field wizard-skill-add-field">
                        <span class="field-label">Add skill</span>
                        <div class="wizard-skill-add-row">
                            <input class="field-input" value="" data-skill-draft data-skill-group="${escapeAttr(activeGroup.id)}" placeholder="Type a skill, or paste a short list" autocomplete="off">
                            <button type="button" class="wizard-skill-add-button" data-profile-guide-action="add-skill" data-skill-group="${escapeAttr(activeGroup.id)}" aria-label="Add skill" title="Add skill">
                                <i data-lucide="plus" aria-hidden="true"></i>
                            </button>
                        </div>
                    </label>
                    <div class="wizard-skill-chip-list" aria-label="Added skills">
                        ${skills.length ? skills.map((skill, index) => `
                            <span class="wizard-skill-chip">
                                ${escapeHtml(skill)}
                                <button type="button" data-profile-guide-action="remove-skill" data-skill-group="${escapeAttr(activeGroup.id)}" data-skill-index="${index}" aria-label="Remove ${escapeAttr(skill)}" title="Remove skill">
                                    <i data-lucide="x" aria-hidden="true"></i>
                                </button>
                            </span>
                        `).join('') : '<span class="wizard-skill-empty">No skills added yet.</span>'}
                    </div>
                </section>
            </div>
        `;
    }

    function getActiveWizardSkillGroup(groups) {
        const safeGroups = Array.isArray(groups) && groups.length ? groups : ensureWizardSkillGroups(1);
        let active = safeGroups.find(group => group.id === activeSkillGroupId);
        if (!active) {
            active = safeGroups[0];
            activeSkillGroupId = active.id;
        }
        return active;
    }

    function renderWizardEntryFields(sectionId, item) {
        const titleField = getItemTitleField(sectionId);
        const metaField = getWizardMetaField(sectionId, item);
        const metaValue = item[metaField] || (sectionId === 'certifications' ? item.organization : '') || '';
        const fields = [
            renderWizardField(getEntryTitleLabel(sectionId), getItemTitle(sectionId, item), `data-item-field="${escapeAttr(titleField)}" data-section="${escapeAttr(sectionId)}" data-item="${escapeAttr(item.id)}"`),
            renderWizardField(getEntryMetaLabel(sectionId), metaValue, `data-item-field="${escapeAttr(metaField)}" data-section="${escapeAttr(sectionId)}" data-item="${escapeAttr(item.id)}"`),
            renderWizardDateField('Date', item.date || '', sectionId, item.id)
        ];

        if (sectionId === 'certifications') {
            fields.push(renderWizardField('Credential ID', item.credentialId || '', `data-item-field="credentialId" data-section="${escapeAttr(sectionId)}" data-item="${escapeAttr(item.id)}"`));
            fields.push(renderWizardField('Credential URL', item.url || '', `data-item-field="url" data-section="${escapeAttr(sectionId)}" data-item="${escapeAttr(item.id)}"`));
            return `<div class="resume-wizard-entry-fields cert-fields">${fields.join('')}</div>`;
        }

        if (sectionId === 'projects' || sectionId === 'research') {
            fields.push(renderWizardField('URL', item.url || '', `data-item-field="url" data-section="${escapeAttr(sectionId)}" data-item="${escapeAttr(item.id)}"`));
        }

        return `
            <div class="resume-wizard-entry-fields">
                ${fields.join('')}
            </div>
            ${renderWizardRichText('Details', getItemBodyHtml(sectionId, item), `data-item-field="body" data-section="${escapeAttr(sectionId)}" data-item="${escapeAttr(item.id)}"`)}
        `;
    }

    function renderWizardDateField(label, value, sectionId, itemId) {
        return `
            <label class="resume-wizard-field wizard-date-field">
                <span class="field-label">${escapeHtml(label)}</span>
                <input class="field-input" value="${escapeAttr(value || '')}" data-item-field="date" data-section="${escapeAttr(sectionId)}" data-item="${escapeAttr(itemId)}" autocomplete="off">
            </label>
        `;
    }

    function renderWizardPhotoChoices() {
        const shapes = [
            ['circle', 'Circle'],
            ['rounded-square', 'Rounded'],
            ['square', 'Square']
        ];
        const placements = [
            ['left', 'Left'],
            ['right', 'Right'],
            ['top', 'Top']
        ];

        return `
            <div class="wizard-photo-options">
                <div class="wizard-choice-group">
                    <span class="field-label">Image shape</span>
                    <div class="wizard-visual-options">
                        ${shapes.map(([value, label]) => `
                            <button type="button" class="${state.settings.profilePhotoShape === value ? 'active' : ''}" data-profile-guide-action="set-photo-setting" data-photo-setting="profilePhotoShape" data-photo-value="${escapeAttr(value)}" aria-pressed="${state.settings.profilePhotoShape === value ? 'true' : 'false'}">
                                <span class="photo-shape-swatch" data-shape="${escapeAttr(value)}"></span>
                                ${escapeHtml(label)}
                            </button>
                        `).join('')}
                    </div>
                </div>
                <div class="wizard-choice-group">
                    <span class="field-label">Image placement</span>
                    <div class="wizard-visual-options">
                        ${placements.map(([value, label]) => `
                            <button type="button" class="${state.settings.profilePhotoPlacement === value ? 'active' : ''}" data-profile-guide-action="set-photo-setting" data-photo-setting="profilePhotoPlacement" data-photo-value="${escapeAttr(value)}" aria-pressed="${state.settings.profilePhotoPlacement === value ? 'true' : 'false'}">
                                <span class="photo-placement-swatch" data-placement="${escapeAttr(value)}"><span></span></span>
                                ${escapeHtml(label)}
                            </button>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    function renderWizardColumnPicker(sectionId, currentColumns) {
        if (templateControlsSectionColumns()) return '';
        return `
            <div class="wizard-column-picker" aria-label="Column layout">
                <span class="field-label">Columns</span>
                <div>
                    ${[1, 2, 3].map(columns => `
                        <button type="button" class="${Number(currentColumns) === columns ? 'active' : ''}" data-profile-guide-action="set-columns" data-wizard-section="${escapeAttr(sectionId)}" data-columns="${columns}" aria-pressed="${Number(currentColumns) === columns ? 'true' : 'false'}">
                            ${columns}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
    }

    function getEntryTitleLabel(sectionId) {
        const labels = {
            experience: 'Role',
            projects: 'Project name',
            education: 'Degree',
            research: 'Title',
            certifications: 'Certification'
        };
        return labels[sectionId] || 'Entry title';
    }

    function getEntryMetaLabel(sectionId) {
        const labels = {
            experience: 'Organization',
            projects: 'Organization',
            education: 'School',
            research: 'Publication',
            certifications: 'Issuer'
        };
        return labels[sectionId] || 'Organization';
    }

    function getWizardMetaField(sectionId, item) {
        if (sectionId === 'certifications') return 'issuer';
        if (sectionId === 'research') return 'organization';
        return getItemMetaField(sectionId, item) || 'organization';
    }

    function ensureWizardItem(sectionId) {
        return ensureWizardItems(sectionId, 1)[0] || { id: '', body: '' };
    }

    function ensureWizardItems(sectionId, minimumCount = 1) {
        const section = state.sections[sectionId];
        if (!section) return [];
        section.items = section.items || [];
        while (section.items.length < minimumCount) {
            section.items.push(createBlankItemForSection(sectionId));
        }
        return section.items;
    }

    function createBlankItemForSection(sectionId) {
        const base = {
            id: uniqueId(sectionId),
            sourceId: '',
            organization: '',
            date: '',
            status: '',
            url: '',
            order: 1,
            placement: 'auto',
            body: ''
        };
        if (sectionId === 'experience') return { ...base, role: '' };
        if (sectionId === 'projects') return { ...base, name: '' };
        if (sectionId === 'education') return { ...base, degree: '' };
        if (sectionId === 'research') return { ...base, title: '' };
        if (sectionId === 'certifications') return { ...base, name: '', issuer: '', credentialId: '' };
        return { ...base, name: '' };
    }

    function ensureWizardSkillGroup() {
        return ensureWizardSkillGroups(1)[0];
    }

    function ensureWizardSkillGroups(minimumCount = 1) {
        const section = state.sections.skills;
        section.groups = section.groups || [];
        while (section.groups.length < minimumCount) {
            section.groups.push({
                id: uniqueId('skills'),
                sourceId: '',
                name: '',
                skills: []
            });
        }
        return section.groups;
    }

    function isWizardStepFilled(step) {
        if (step.type === 'identity') return ['name', 'title'].some(field => normalizeInlineText(state.personal[field]));
        if (step.type === 'contact') return ['email', 'location', 'linkedin', 'github', 'website'].some(field => normalizeInlineText(state.personal[field]));
        if (step.type === 'photo') return Boolean(state.personal.profileImage);
        if (step.type === 'personal') return Boolean(normalizeInlineText(state.personal[step.field]));
        if (step.type === 'links') return ['linkedin', 'github', 'website'].some(field => normalizeInlineText(state.personal[field]));
        if (step.type === 'summary') return Boolean(richHtmlToPlainText(getSummaryBody(state.sections.summary)).trim());
        if (step.type === 'skills') return (state.sections.skills.groups || []).some(group => group.name || (group.skills || []).some(skill => normalizeInlineText(skill)));
        if (step.type === 'entry') return (state.sections[step.section].items || []).some(item => {
            const title = getItemTitle(step.section, item);
            const body = richHtmlToPlainText(getItemBodyHtml(step.section, item));
            return normalizeInlineText(title) || normalizeInlineText(getItemMetaValue(step.section, item)) || normalizeInlineText(item.date) || normalizeInlineText(body);
        });
        return false;
    }

    function shouldShowProfileGuide() {
        return builderMode === 'guest'
            && workflowStep === 'entries'
            && localStorage.getItem(PROFILE_GUIDE_KEY) !== 'true'
            && isBlankGuestResume();
    }

    function isBlankGuestResume() {
        const hasPersonal = PROFILE_GUIDE_FIELDS.some(([field]) => normalizeInlineText(state.personal[field]));
        const hasSections = Object.values(state.sections || {}).some(section => {
            if (!section || section.enabled === false) return false;
            if (section.type === 'summary') return Boolean(richHtmlToPlainText(getSummaryBody(section)).trim());
            if (section.type === 'skills') return (section.groups || []).some(group => group.name || (group.skills || []).some(skill => normalizeInlineText(skill)));
            return (section.items || []).length > 0;
        });
        return !hasSections || !hasPersonal;
    }

    function renderProfileGuide() {
        const clampedIndex = Math.max(0, Math.min(profileGuideCursor, PROFILE_GUIDE_FIELDS.length - 1));
        profileGuideCursor = clampedIndex;
        const [field, label, prompt] = PROFILE_GUIDE_FIELDS[clampedIndex];
        const completedCount = PROFILE_GUIDE_FIELDS.filter(([key]) => normalizeInlineText(state.personal[key])).length;
        const value = state.personal[field] || '';
        return `
            <div class="profile-guide">
                <div class="profile-guide-progress">
                    <strong>${clampedIndex + 1} of ${PROFILE_GUIDE_FIELDS.length}</strong>
                </div>
                <h2>${escapeHtml(label)}</h2>
                <p>${escapeHtml(prompt)}</p>
                <label class="profile-guide-field">
                    <span class="field-label">${escapeHtml(label)}</span>
                    <input class="field-input" value="${escapeAttr(value)}" data-personal-field="${escapeAttr(field)}" autocomplete="off">
                </label>
                <div class="profile-guide-actions">
                    <button type="button" class="tool-button tool-button-secondary compact-action" data-profile-guide-action="skip">Skip</button>
                    <button type="button" class="tool-button tool-button-primary compact-action" data-profile-guide-action="next">Next</button>
                </div>
                <div class="profile-guide-summary" aria-label="Completed profile fields">
                    ${PROFILE_GUIDE_FIELDS.map(([key, fieldLabel], index) => `
                        <span class="${normalizeInlineText(state.personal[key]) ? 'is-filled' : (index === clampedIndex ? 'is-current' : '')}">${escapeHtml(fieldLabel)}</span>
                    `).join('')}
                </div>
                <button type="button" class="text-link-button" data-profile-guide-action="finish">Show full editor</button>
                <small>${completedCount} filled</small>
            </div>
        `;
    }

    function handleProfileGuideAction(action, button = null) {
        if (action === 'back') {
            profileGuideCursor = Math.max(0, profileGuideCursor - 1);
            renderConstantsPanel();
            focusFirstProfileField();
            return;
        }

        if (action === 'add-entry-options') {
            const sectionId = button ? button.dataset.wizardSection : '';
            wizardAddChoiceSection = wizardAddChoiceSection === sectionId ? '' : sectionId;
            renderConstantsPanel();
            refreshLucideIcons();
            return;
        }

        if (action === 'add-entry-below' || action === 'add-entry-column' || action === 'add-entry') {
            const sectionId = button ? button.dataset.wizardSection : '';
            const section = state.sections[sectionId];
            if (!section) return;
            section.items = section.items || [];
            section.items.push(createBlankItemForSection(sectionId));
            if (action === 'add-entry-column' && !templateControlsSectionColumns()) {
                setSectionColumns(sectionId, Math.min(3, getSectionColumns(section) + 1));
            }
            wizardAddChoiceSection = '';
            saveState();
            renderAll();
            focusFirstProfileField();
            return;
        }

        if (action === 'remove-entry') {
            const sectionId = button ? button.dataset.wizardSection : '';
            const itemId = button ? button.dataset.wizardItem : '';
            const section = state.sections[sectionId];
            if (!section || !itemId) return;
            section.items = (section.items || []).filter(item => item.id !== itemId);
            section.columns = Math.max(1, Math.min(getSectionColumns(section), section.items.length || 1));
            saveState();
            renderAll();
            focusFirstProfileField();
            return;
        }

        if (action === 'add-skill') {
            const group = button ? findSkillGroup(button.dataset.skillGroup) : ensureWizardSkillGroup();
            if (!group) return;
            const draft = elements.constantsPanel.querySelector(`[data-skill-draft][data-skill-group="${cssEscape(group.id)}"]`);
            addSkillsFromDraft(draft, group);
            return;
        }

        if (action === 'remove-skill') {
            const group = button ? findSkillGroup(button.dataset.skillGroup) : null;
            if (!group) return;
            const index = Math.max(0, Number(button.dataset.skillIndex) || 0);
            group.skills = (Array.isArray(group.skills) ? group.skills : [])
                .map(skill => String(skill || '').trim())
                .filter(Boolean)
                .filter((_, skillIndex) => skillIndex !== index);
            saveState();
            renderAll();
            return;
        }

        if (action === 'select-skill-group') {
            const group = button ? findSkillGroup(button.dataset.skillGroup) : null;
            if (!group) return;
            activeSkillGroupId = group.id;
            renderConstantsPanel();
            refreshLucideIcons();
            return;
        }

        if (action === 'remove-photo') {
            state.personal.profileImage = '';
            state.settings.showProfilePhoto = false;
            saveState();
            renderAll();
            return;
        }

        if (action === 'set-photo-setting') {
            const setting = button ? button.dataset.photoSetting : '';
            const value = button ? button.dataset.photoValue : '';
            const allowed = {
                profilePhotoShape: new Set(['circle', 'rounded-square', 'square']),
                profilePhotoPlacement: new Set(['left', 'right', 'top'])
            };
            if (!allowed[setting] || !allowed[setting].has(value)) return;
            state.settings[setting] = value;
            saveState();
            renderAll();
            return;
        }

        if (action === 'set-columns') {
            const sectionId = button ? button.dataset.wizardSection : '';
            const columns = Math.max(1, Math.min(3, Number(button ? button.dataset.columns : 1) || 1));
            const section = state.sections[sectionId];
            setSectionColumns(sectionId, columns);
            if (section && section.type === 'skills') {
                ensureWizardSkillGroups(columns);
                activeSkillGroupId = getActiveWizardSkillGroup(section.groups).id;
            } else if (section && section.type !== 'summary') {
                ensureWizardItems(sectionId, columns);
            }
            saveState();
            renderAll();
            return;
        }

        if (action === 'next' || action === 'skip') {
            if (profileGuideCursor >= NON_JSON_WIZARD_STEPS.length - 1) {
                showToast('Wizard complete');
                return;
            }
            profileGuideCursor += 1;
            renderConstantsPanel();
            focusFirstProfileField();
        }
    }

    function handleWizardRichTextCommand(button) {
        const shell = button.closest('.wizard-rich-shell');
        const editable = shell ? shell.querySelector('[data-wizard-rich]') : null;
        if (!editable) return;

        editable.focus({ preventScroll: true });
        document.execCommand(button.dataset.wizardRichCommand, false, null);
        handleEditorInput(editable);
    }

    function addSkillsFromDraft(input, explicitGroup = null) {
        const group = explicitGroup || (input ? findSkillGroup(input.dataset.skillGroup) : ensureWizardSkillGroup());
        if (!group) return;

        const nextSkills = String(input ? input.value : '')
            .split(/[,\n]/)
            .map(skill => skill.trim())
            .filter(Boolean);

        if (!nextSkills.length) {
            if (input) input.focus({ preventScroll: true });
            return;
        }

        const existing = (Array.isArray(group.skills) ? group.skills : [])
            .map(skill => String(skill || '').trim())
            .filter(Boolean);
        const known = new Set(existing.map(skill => skill.toLowerCase()));

        nextSkills.forEach(skill => {
            const key = skill.toLowerCase();
            if (known.has(key)) return;
            existing.push(skill);
            known.add(key);
        });

        group.skills = existing;
        activeSkillGroupId = group.id;
        if (state.sections.skills) state.sections.skills.enabled = true;
        saveState();
        renderAll();

        window.setTimeout(() => {
            const nextInput = elements.constantsPanel.querySelector(`[data-skill-draft][data-skill-group="${cssEscape(group.id)}"]`);
            if (nextInput) nextInput.focus({ preventScroll: true });
        }, 0);
    }

    function handleProfileUpload(input) {
        const file = input.files && input.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            showToast('Choose an image file');
            input.value = '';
            return;
        }

        if (file.size > 1600000) {
            showToast('Use an image under 1.6 MB for reliable saving');
            input.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            state.personal.profileImage = String(reader.result || '');
            state.settings.showProfilePhoto = true;
            saveState();
            showToast('Profile photo added');
            renderAll();
        };
        reader.onerror = () => showToast('Could not read that image');
        reader.readAsDataURL(file);
    }

    function handleHeaderPatternUpload(input) {
        const file = input.files && input.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            showToast('Choose an image file');
            input.value = '';
            return;
        }

        if (file.size > 900000) {
            showToast('Use a pattern under 900 KB');
            input.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            state.settings.headerPatternImage = String(reader.result || '');
            state.settings.headerPattern = 'custom';
            saveState();
            showToast('Header pattern added');
            renderAll();
        };
        reader.onerror = () => showToast('Could not read that pattern');
        reader.readAsDataURL(file);
    }

    function createResumeSyntaxDocument(targetState = state) {
        return {
            format: RESUME_SYNTAX_FORMAT,
            version: RESUME_SYNTAX_VERSION,
            resume: extractResumeSyntaxState(targetState)
        };
    }

    function extractResumeSyntaxState(targetState) {
        const normalized = normalizeState(deepClone(targetState), builderMode);
        return {
            personal: normalized.personal,
            sectionOrder: normalized.sectionOrder,
            sections: extractResumeContentSections(normalized.sections, normalized.sectionOrder)
        };
    }

    function extractResumeContentSections(sections = {}, sectionOrder = []) {
        const orderedIds = [
            ...sectionOrder,
            ...Object.keys(sections).filter(sectionId => !sectionOrder.includes(sectionId))
        ];

        return orderedIds.reduce((result, sectionId) => {
            const section = sections[sectionId];
            if (!section) return result;
            result[sectionId] = extractResumeContentSection(section);
            return result;
        }, {});
    }

    function extractResumeContentSection(section) {
        const contentSection = {
            id: section.id,
            type: section.type,
            title: section.title,
            enabled: section.enabled !== false
        };

        if (section.type === 'summary') {
            contentSection.body = getSummaryBody(section);
            return contentSection;
        }

        if (section.type === 'skills') {
            contentSection.groups = (section.groups || []).map(group => ({
                id: group.id,
                name: group.name || '',
                skills: Array.isArray(group.skills) ? group.skills.slice() : linesToArray(group.skills || '')
            }));
            return contentSection;
        }

        contentSection.items = (section.items || []).map(extractResumeContentItem);
        return contentSection;
    }

    function extractResumeContentItem(item) {
        const hiddenKeys = new Set(['sourceId', 'className', 'style', 'placement']);
        return Object.fromEntries(
            Object.entries(item || {})
                .filter(([key, value]) => !hiddenKeys.has(key) && value !== undefined)
                .map(([key, value]) => [key, Array.isArray(value) ? value.slice() : value])
        );
    }

    function formatResumeSyntax(targetState = state) {
        return JSON.stringify(createResumeSyntaxDocument(targetState), null, 2);
    }

    function updateSyntaxTextarea(options = {}) {
        if (!elements.resumeSyntaxText) return;
        const isEditing = document.activeElement === elements.resumeSyntaxText;
        const isDirty = elements.resumeSyntaxText.dataset.dirty === 'true';
        if (!options.force && (isEditing || isDirty)) return;
        elements.resumeSyntaxText.value = formatResumeSyntax();
        elements.resumeSyntaxText.dataset.dirty = 'false';
    }

    function scheduleAutoApplyResumeSyntax() {
        clearTimeout(syntaxAutoApplyTimer);
        setSyntaxStatus('Auto-applying when JSON is valid...');
        syntaxAutoApplyTimer = setTimeout(autoApplyResumeSyntax, 700);
    }

    function renderResumeJsonFromTextarea() {
        if (!elements.resumeSyntaxText) return;

        try {
            applyResumeSyntaxFromText(elements.resumeSyntaxText.value, { render: false });
            elements.resumeSyntaxText.dataset.dirty = 'false';
            persistResumeJsonDraft();
            enterGuestWorkspace('data');
            localStorage.setItem(PROFILE_GUIDE_KEY, 'true');
            renderAll();
            setSyntaxStatus('JSON rendered');
            showToast('Resume rendered');
        } catch (error) {
            console.warn('Resume JSON render failed:', error);
            setSyntaxStatus(error.message || 'Fix JSON before rendering.', true);
            showToast('Fix JSON before rendering');
        }
    }

    function startGuestWorkspaceWithoutJson() {
        if (builderMode === 'guest') {
            state = createBlankState();
            enterGuestWorkspace('entries');
            localStorage.removeItem(PROFILE_GUIDE_KEY);
            profileGuideCursor = 0;
            saveState({ history: false });
            renderAll();
            focusFirstProfileField();
            showToast('Started without JSON');
            return;
        }

        setWorkflowStep('entries');
    }

    function autoApplyResumeSyntax() {
        clearTimeout(syntaxAutoApplyTimer);
        if (!elements.resumeSyntaxText || elements.resumeSyntaxText.dataset.dirty !== 'true') return false;

        try {
            applyResumeSyntaxFromText(elements.resumeSyntaxText.value, { render: true });
            elements.resumeSyntaxText.dataset.dirty = 'false';
            if (builderMode === 'guest') {
                enterGuestWorkspace('data');
                localStorage.setItem(PROFILE_GUIDE_KEY, 'true');
            }
            updateSyntaxTextarea({ force: true });
            persistResumeJsonDraft();
            setSyntaxStatus('JSON rendered');
            return true;
        } catch (error) {
            console.warn('Resume JSON auto-apply failed:', error);
            setSyntaxStatus('Waiting for valid JSON before applying.', true);
            return false;
        }
    }

    function openPromptModal() {
        updateJsonResumePrompt({ force: true });
        if (!elements.promptModal) {
            copyJsonResumePrompt();
            return;
        }
        elements.promptModal.hidden = false;
        document.body.classList.add('prompt-modal-open');
        refreshLucideIcons();
        const copyButton = elements.promptModal.querySelector('[data-prompt-modal-copy]');
        if (copyButton) copyButton.focus({ preventScroll: true });
    }

    function closePromptModal() {
        if (!elements.promptModal) return;
        elements.promptModal.hidden = true;
        document.body.classList.remove('prompt-modal-open');
        if (elements.copyJsonResumePrompt) elements.copyJsonResumePrompt.focus({ preventScroll: true });
    }

    async function copyJsonResumePrompt() {
        const prompt = buildJsonResumePrompt();
        updateJsonResumePrompt({ force: true });

        try {
            await copyTextToClipboard(prompt);
            setSyntaxStatus('LLM prompt copied');
            showToast('Prompt copied');
            closePromptModal();
        } catch (error) {
            console.warn('JSON resume prompt copy failed:', error);
            setSyntaxStatus('Copy failed. Select the prompt text manually.', true);
            showToast('Could not copy prompt');
        }
    }

    async function copyCurrentResumeJson() {
        if (!elements.resumeSyntaxText) return;
        const currentJson = elements.resumeSyntaxText.value || formatResumeSyntax();

        try {
            await copyTextToClipboard(currentJson);
            setSyntaxStatus('Current JSON copied');
            showToast('JSON copied');
        } catch (error) {
            console.warn('Current JSON copy failed:', error);
            setSyntaxStatus('Copy failed. Select the JSON manually.', true);
            showToast('Could not copy JSON');
        }
    }

    async function copyTextToClipboard(text) {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            return;
        }

        copyTextFallback(text);
    }

    function copyTextFallback(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        const copied = document.execCommand('copy');
        textarea.remove();
        if (!copied) throw new Error('Copy command failed');
    }

    function updateJsonResumePrompt(options = {}) {
        if (!elements.jsonResumePromptText) return;
        const isEditing = document.activeElement === elements.jsonResumePromptText;
        if (!options.force && isEditing) return;
        elements.jsonResumePromptText.value = buildJsonResumePrompt();
    }

    function buildJsonResumePrompt() {
        const genericResumeSyntax = {
            format: RESUME_SYNTAX_FORMAT,
            version: RESUME_SYNTAX_VERSION,
            resume: {
                personal: {
                    name: '[Candidate Name]',
                    title: '[Target Job Title]',
                    email: '[email@example.com]',
                    location: '[City, Country]',
                    profileImage: '',
                    linkedin: '[LinkedIn URL]',
                    github: '[GitHub URL]',
                    website: '[Portfolio URL]'
                },
                sectionOrder: ['summary', 'experience', 'projects', 'skills', 'education', 'certifications'],
                sections: {
                    summary: {
                        id: 'summary',
                        type: 'summary',
                        title: 'Summary',
                        enabled: true,
                        body: '<p>[2-4 sentence summary tailored to the job post, using only truthful candidate facts.]</p>'
                    },
                    experience: {
                        id: 'experience',
                        type: 'experience',
                        title: 'Experience',
                        enabled: true,
                        items: [
                            {
                                id: 'experience-1',
                                role: '[Role Title]',
                                organization: '[Company / Organization]',
                                date: '[Start - End]',
                                status: '',
                                url: '',
                                order: 1,
                                body: '<ul><li>[Action verb + relevant task/project + result, metric, or concrete scope.]</li><li>[Action verb + job-relevant keyword + truthful impact.]</li></ul>'
                            }
                        ]
                    },
                    projects: {
                        id: 'projects',
                        type: 'projects',
                        title: 'Projects',
                        enabled: true,
                        items: [
                            {
                                id: 'project-1',
                                name: '[Project Name]',
                                organization: '[Role / Ownership]',
                                date: '[Year or Date Range]',
                                status: '',
                                url: '[Project URL]',
                                order: 1,
                                body: '<p>[Short project context tied to the target role.]</p><ul><li>[Built/led/improved + technology/skill + outcome.]</li></ul>'
                            }
                        ]
                    },
                    skills: {
                        id: 'skills',
                        type: 'skills',
                        title: 'Skills',
                        enabled: true,
                        groups: [
                            {
                                id: 'skills-technical',
                                name: 'Technical',
                                skills: ['[Skill from job post]', '[Relevant candidate skill]']
                            },
                            {
                                id: 'skills-tools',
                                name: 'Tools',
                                skills: ['[Tool]', '[Platform]']
                            }
                        ]
                    },
                    education: {
                        id: 'education',
                        type: 'education',
                        title: 'Education',
                        enabled: true,
                        items: [
                            {
                                id: 'education-1',
                                degree: '[Degree / Program]',
                                organization: '[Institution]',
                                date: '[Dates]',
                                status: '',
                                url: '',
                                order: 1,
                                body: '<p>[Relevant coursework, honors, or short education detail.]</p>'
                            }
                        ]
                    },
                    certifications: {
                        id: 'certifications',
                        type: 'certifications',
                        title: 'Certifications',
                        enabled: false,
                        items: [
                            {
                                id: 'certification-1',
                                name: '[Certification]',
                                issuer: '[Issuer]',
                                date: '[Date]',
                                status: '',
                                url: '[Credential URL]',
                                credentialId: '[Credential ID]',
                                order: 1,
                                body: ''
                            }
                        ]
                    }
                }
            }
        };

        return [
            'You are creating a complete resume as content and structure JSON for a resume builder.',
            'Return only valid JSON. Do not include Markdown, comments, or explanation.',
            '',
            'User-provided context to use:',
            '- Job post / target role: [Paste the job post or role description here]',
            '- Candidate background: [Paste the candidate work history, projects, education, skills, links, and any constraints here]',
            '- Resume goal: [For example: internship, entry-level role, senior role, career change, project-heavy application, academic CV, or portfolio-forward resume]',
            '',
            'Goal:',
            '- Write the whole resume for the job post or target role the user provides.',
            '- Use only facts supplied by the user. Do not invent employers, degrees, dates, metrics, links, credentials, or technologies.',
            '- If a useful fact is missing, leave a clear placeholder in brackets instead of fabricating it.',
            '- If the user has not provided enough required context to write the resume, ask a few focused questions first. Keep that question step short and do not turn it into a lengthy process.',
            '- Keep the JSON format, version, and top-level shape intact.',
            '- Prefer concise, high-impact bullets with action verbs and measurable scope.',
            '- You may reorder sections, hide sections with enabled:false, add custom sections, and change rich text bodies.',
            '- Do not use JSON to decide template design. Columns, column ratios, spacing, colors, heading separators, bullet styling, classes, and header styling are controlled by the active template.',
            '- For each job, align personal.title, summary, skills, and bullets to the exact job title and repeated hard-skill keywords from the job description.',
            '',
            'Useful syntax:',
            '- format: "ayk.resume.syntax"',
            '- version: 1',
            '- resume.personal: name, title, email, location, profileImage, linkedin, github, website',
            '- resume.layout may be present for compatibility, but the active template decides document layout, columns, column ratios, spacing, colors, heading separators, and bullet styling.',
            '- resume.sectionOrder is the render order. Add a section id here to render a custom section.',
            '- resume.sections[id] needs id, type, title, enabled, and either body, items, or groups.',
            '- Section structure fields such as columns, placement, and layout are tolerated for compatibility, but the active template design decides how many columns render.',
            '- summary sections use body with simple HTML: <p>, <ul>, <li>, <strong>, <em>, <a href="">.',
            '- skills sections use groups: [{ id, name, skills: [] }].',
            '- entry sections use items: [{ id, name/role/degree/title, organization/issuer, date, status, url, credentialId, body, bullets, order, placement }].',
            '- Certifications can use name, issuer, date, credentialId, and url.',
            '- Entry structure fields: order controls order within a section; placement can move an entry to main/side/full in multi-column templates.',
            '',
            'ATS wording rules:',
            '- Every bullet should follow this pattern when truthful: Action Verb + Task or Project + Metric or Result.',
            '- Use strong action verbs like Built, Led, Deployed, Provisioned, Operated, Improved, Reduced, Increased, Automated, Launched, Integrated, Migrated, Optimized, or Maintained.',
            '- Prefer numbers and scope: users, revenue, cost, time saved, uptime, latency, number of systems, number of projects, team size, or frequency.',
            '- If no exact metric exists, use concrete scope instead of vague claims: production users, paid users, hosted workloads, customer environments, cloud deployment, runtime operations, or security/access work.',
            '- Keep most recent experience most detailed; avoid more than six bullets under one role unless splitting into multiple roles/projects makes the scan clearer.',
            '- Projects should include project name, role or ownership, relevant keywords/technologies, hard numbers or concrete results, and only projects relevant to the target job.',
            '- Education should be short after experience is established: degree, institution, dates, and only relevant coursework/achievements.',
            '- Put target job title and repeated hard-skill keywords from the job description in the title, summary, skills, experience, and projects where accurate.',
            '- If there is no profile image, leave personal.profileImage empty.',
            '',
            'Generic JSON shape to fill:',
            JSON.stringify(genericResumeSyntax, null, 2)
        ].join('\n');
    }

    function applyResumeSyntaxFromText(value, options = {}) {
        const parsed = parseResumeSyntax(value);
        state = mergeResumeSyntaxIntoState(state, parsed);
        pageAddMenuOpen = false;
        activeAddAnchor = 'start';
        saveState();
        if (options.render !== false) renderAll();
    }

    function parseResumeSyntax(value) {
        const jsonText = extractJsonText(value);
        if (!jsonText) throw new Error('Paste resume content JSON first.');

        let parsed;
        let parseError;
        const attempts = [jsonText, repairJsonText(jsonText)].filter((candidate, index, list) => candidate && list.indexOf(candidate) === index);
        for (const candidate of attempts) {
            try {
                parsed = JSON.parse(candidate);
                parseError = null;
                break;
            } catch (error) {
                parseError = error;
            }
        }
        if (!parsed) throw new Error(`JSON syntax error: ${parseError ? parseError.message : 'Invalid JSON'}`);

        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
            throw new Error('Resume content JSON must be a JSON object.');
        }

        const payload = parsed.resume && typeof parsed.resume === 'object'
            ? parsed.resume
            : (parsed.state && typeof parsed.state === 'object' ? parsed.state : parsed);

        if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
            throw new Error('Resume content JSON is missing the resume object.');
        }

        if (!payload.personal && !payload.layout && !payload.sections && !payload.sectionOrder) {
            throw new Error('JSON resume needs personal, layout, sectionOrder, or sections data.');
        }

        return sanitizeChatGptResumeSyntax(payload);
    }

    function mergeResumeSyntaxIntoState(currentState, syntaxState) {
        const current = normalizeState(deepClone(currentState), builderMode);
        const incoming = syntaxState && typeof syntaxState === 'object' && !Array.isArray(syntaxState)
            ? deepClone(syntaxState)
            : {};
        const next = deepClone(current);

        if (incoming.personal && typeof incoming.personal === 'object' && !Array.isArray(incoming.personal)) {
            next.personal = { ...current.personal, ...incoming.personal };
        }

        if (incoming.layout && typeof incoming.layout === 'object' && !Array.isArray(incoming.layout)) {
            next.layout = normalizeResumeStructureLayout(incoming.layout, current.layout);
        }

        if (incoming.sections && typeof incoming.sections === 'object' && !Array.isArray(incoming.sections)) {
            next.sections = mergeContentSectionsWithBuilderDesign(current.sections, incoming.sections);
        }

        if (Array.isArray(incoming.sectionOrder)) {
            next.sectionOrder = incoming.sectionOrder.map(String);
        } else if (incoming.sections && typeof incoming.sections === 'object' && !Array.isArray(incoming.sections)) {
            next.sectionOrder = Object.keys(incoming.sections);
        }

        return normalizeState(next, builderMode);
    }

    function normalizeResumeStructureLayout(incomingLayout, currentLayout = DEFAULT_LAYOUT) {
        const raw = incomingLayout && typeof incomingLayout === 'object' && !Array.isArray(incomingLayout) ? incomingLayout : {};
        const merged = { ...currentLayout };
        ['mode', 'columns', 'columnRatio', 'side', 'sidebarSections', 'sectionFlow'].forEach(key => {
            if (Object.prototype.hasOwnProperty.call(raw, key)) merged[key] = raw[key];
        });
        return normalizeLayout({ ...merged, gap: currentLayout.gap });
    }

    function mergeContentSectionsWithBuilderDesign(currentSections = {}, incomingSections = {}) {
        return Object.fromEntries(
            Object.entries(incomingSections).map(([sectionId, incomingSection]) => {
                const currentSection = currentSections[sectionId] || {};
                const contentSection = incomingSection && typeof incomingSection === 'object' && !Array.isArray(incomingSection)
                    ? deepClone(incomingSection)
                    : { id: sectionId, type: sectionId, title: titleCase(sectionId), enabled: false };
                const mergedSection = {
                    ...contentSection,
                    columns: normalizeSectionColumns(contentSection.columns, currentSection.columns),
                    placement: normalizePlacement(contentSection.placement || currentSection.placement || 'auto'),
                    layout: normalizeResumeSectionStructure(contentSection.layout, currentSection.layout),
                    className: currentSection.className,
                    headerClassName: currentSection.headerClassName,
                    style: deepClone(currentSection.style),
                    headerStyle: deepClone(currentSection.headerStyle)
                };

                if (Array.isArray(contentSection.items)) {
                    mergedSection.items = contentSection.items.map(item => mergeContentItemWithBuilderDesign(currentSection, item));
                }

                if (Array.isArray(contentSection.groups)) {
                    mergedSection.groups = contentSection.groups.map(group => ({ ...group }));
                }

                return [sectionId, mergedSection];
            })
        );
    }

    function normalizeSectionColumns(value, fallback = 1) {
        const number = Number(value);
        if (!Number.isFinite(number)) return Math.max(1, Math.min(4, Number(fallback) || 1));
        return Math.max(1, Math.min(4, number));
    }

    function normalizeResumeSectionStructure(incomingLayout, currentLayout = {}) {
        const raw = incomingLayout && typeof incomingLayout === 'object' && !Array.isArray(incomingLayout) ? incomingLayout : {};
        const merged = { ...currentLayout };
        ['columns', 'breakBefore', 'keepTogether'].forEach(key => {
            if (Object.prototype.hasOwnProperty.call(raw, key)) merged[key] = raw[key];
        });
        return normalizeSectionLayout({ ...merged, gap: currentLayout && currentLayout.gap });
    }

    function mergeContentItemWithBuilderDesign(currentSection = {}, incomingItem = {}) {
        const contentItem = incomingItem && typeof incomingItem === 'object' && !Array.isArray(incomingItem)
            ? { ...incomingItem }
            : { name: String(incomingItem || '') };
        const currentItem = (currentSection.items || []).find(item => item.id && item.id === contentItem.id) || {};
        return {
            ...contentItem,
            placement: normalizePlacement(contentItem.placement || currentItem.placement || 'auto'),
            className: currentItem.className,
            style: deepClone(currentItem.style)
        };
    }

    function extractJsonText(value) {
        const text = String(value || '').trim();
        if (!text) return '';

        const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
        if (fenced && fenced[1]) return fenced[1].trim();

        const firstBrace = text.indexOf('{');
        const lastBrace = text.lastIndexOf('}');
        if (firstBrace >= 0 && lastBrace > firstBrace) {
            return text.slice(firstBrace, lastBrace + 1).trim();
        }

        return text;
    }

    function repairJsonText(value) {
        return String(value || '')
            .replace(/[“”]/g, '"')
            .replace(/[‘’]/g, "'")
            .replace(/<[^<>]+>/g, tag => tag.replace(/="([^"]*)"/g, "='$1'"))
            .replace(/\[([^\]\n]+)\]\(mailto:([^)]+)\)/gi, '$1')
            .replace(/\[([^\]\n]+)\]\((https?:\/\/[^)\s]+)\)/gi, '$2');
    }

    function sanitizeChatGptResumeSyntax(value, key = '') {
        if (Array.isArray(value)) return value.map(item => sanitizeChatGptResumeSyntax(item, key));
        if (value && typeof value === 'object') {
            return Object.fromEntries(
                Object.entries(value).map(([entryKey, entryValue]) => [entryKey, sanitizeChatGptResumeSyntax(entryValue, entryKey)])
            );
        }
        if (typeof value !== 'string') return value;

        let next = value
            .replace(/[“”]/g, '"')
            .replace(/[‘’]/g, "'")
            .replace(/\[([^\]\n]+)\]\(mailto:([^)]+)\)/gi, (match, label, email) => key === 'email' ? email.replace(/^mailto:/i, '') : label)
            .replace(/\[([^\]\n]+)\]\((https?:\/\/[^)\s]+)\)/gi, (match, label, url) => url)
            .replace(/href='\s*([^']+)\s*'/gi, (match, href) => `href='${sanitizeUrlString(href)}'`)
            .replace(/href="\s*([^"]+)\s*"/gi, (match, href) => `href="${sanitizeUrlString(href)}"`);

        if (key === 'email') next = next.replace(/^mailto:/i, '');
        if (['url', 'linkedin', 'github', 'website', 'companyUrl', 'institutionUrl'].includes(key)) {
            next = sanitizeUrlString(next);
        }

        return next;
    }

    function sanitizeUrlString(value) {
        const text = String(value || '').trim();
        const mailto = text.match(/^\[([^\]]+)\]\(mailto:([^)]+)\)$/i);
        if (mailto) return mailto[2].replace(/^mailto:/i, '');
        const markdown = text.match(/^\[([^\]]+)\]\((https?:\/\/[^)]+)\)$/i);
        if (markdown) return markdown[2];
        return text;
    }

    function setSyntaxStatus(message, isError = false) {
        if (!elements.resumeSyntaxStatus) return;
        elements.resumeSyntaxStatus.textContent = message;
        elements.resumeSyntaxStatus.classList.toggle('has-error', Boolean(isError));
    }

    function deepClone(value) {
        return JSON.parse(JSON.stringify(value || {}));
    }

    async function exportCleanPdf() {
        if (pageAddMenuOpen) {
            pageAddMenuOpen = false;
            renderPreview();
            await nextFrame();
        }

        const paper = elements.resumePreview.querySelector('.resume-paper');
        if (!paper) {
            showToast('Nothing to export yet');
            return;
        }

        const exportButtonStates = elements.exportPdfButtons.map(button => ({
            button,
            html: button.innerHTML,
            disabled: button.disabled,
            ariaBusy: button.getAttribute('aria-busy')
        }));
        const previewStyle = {
            transform: elements.resumePreview.style.transform,
            width: elements.resumePreview.style.width,
            height: elements.resumePreview.style.height
        };

        try {
            await ensureSelectablePdfTool();
            if (document.fonts && document.fonts.ready) {
                await document.fonts.ready;
            }

            setExportButtonsBusy(true);
            document.body.classList.add('resume-export-mode');
            elements.resumePreview.style.transform = 'none';
            elements.resumePreview.style.width = `${paper.offsetWidth}px`;
            elements.resumePreview.style.height = 'auto';
            await nextFrame();

            const pdf = await renderSelectablePdf(paper);
            pdf.save(`${slugify(state.personal.name || 'resume')}-resume.pdf`);
            showToast('PDF exported');
        } catch (error) {
            console.warn('Selectable PDF export failed, opening print dialog:', error);
            try {
                applyPrintPageStyle();
                showToast('Choose Save as PDF in the print dialog');
                await openPrintDialog();
            } catch (printError) {
                console.warn('Resume print export failed:', printError);
                showToast('Could not open PDF export');
            }
        } finally {
            document.body.classList.remove('resume-export-mode');
            removePrintPageStyle();
            elements.resumePreview.style.transform = previewStyle.transform;
            elements.resumePreview.style.width = previewStyle.width;
            elements.resumePreview.style.height = previewStyle.height;
            restoreExportButtons(exportButtonStates);
            refreshLucideIcons();
        }
    }

    function setExportButtonsBusy(isBusy) {
        elements.exportPdfButtons.forEach(button => {
            button.disabled = isBusy;
            if (isBusy) {
                button.setAttribute('aria-busy', 'true');
                button.textContent = 'Exporting...';
            } else {
                button.removeAttribute('aria-busy');
            }
        });
    }

    function restoreExportButtons(states) {
        states.forEach(stateSnapshot => {
            stateSnapshot.button.innerHTML = stateSnapshot.html;
            stateSnapshot.button.disabled = stateSnapshot.disabled;
            if (stateSnapshot.ariaBusy == null) {
                stateSnapshot.button.removeAttribute('aria-busy');
            } else {
                stateSnapshot.button.setAttribute('aria-busy', stateSnapshot.ariaBusy);
            }
        });
    }

    async function ensureSelectablePdfTool() {
        if (!window.jspdf || typeof window.jspdf.jsPDF !== 'function') {
            await loadExternalScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
        }

        if (!window.jspdf || typeof window.jspdf.jsPDF !== 'function') {
            throw new Error('PDF export tools are unavailable');
        }
    }

    function loadExternalScript(src) {
        return new Promise((resolve, reject) => {
            const existing = Array.from(document.scripts).find(script => script.src === src);
            if (existing) {
                existing.addEventListener('load', resolve, { once: true });
                existing.addEventListener('error', () => reject(new Error(`Could not load ${src}`)), { once: true });
                return;
            }

            const script = document.createElement('script');
            script.addEventListener('load', resolve, { once: true });
            script.addEventListener('error', () => reject(new Error(`Could not load ${src}`)), { once: true });
            script.src = src;
            script.async = true;
            document.head.appendChild(script);
        });
    }

    async function renderSelectablePdf(paper) {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
        const paperRect = paper.getBoundingClientRect();
        const pageWidth = 210;
        const pageHeight = 297;
        const scale = pageWidth / Math.max(1, paper.offsetWidth);
        const totalHeight = Math.max(paper.scrollHeight, paper.offsetHeight);
        const pageBreaks = buildPreviewPageBreaks(paper);
        const pageStarts = [0, ...pageBreaks];
        const pageEnds = [...pageBreaks, totalHeight];
        const continuationTop = getContinuationPageTopPaddingPx(paper) * scale;
        const context = { pdf, paper, paperRect, pageWidth, pageHeight, scale, pageStarts, pageEnds, continuationTop };

        pageStarts.forEach((_, pageIndex) => {
            if (pageIndex > 0) pdf.addPage();
            pdf.setPage(pageIndex + 1);
            pdf.setFillColor(255, 255, 255);
            pdf.rect(0, 0, pageWidth, pageHeight, 'F');
        });

        drawPdfBackgrounds(context);
        drawPdfBorders(context);
        await drawPdfImages(context);
        drawPdfText(context);
        drawPdfWrappedUrls(context);
        drawPdfListMarkersForAllLists(context);
        pdf.setProperties({
            title: state.personal.name ? `${state.personal.name} Resume` : 'Resume',
            subject: 'Resume',
            creator: 'Resume Builder'
        });

        return pdf;
    }

    function drawPdfBackgrounds(context) {
        context.paper.querySelectorAll('.resume-header, .resume-section-title').forEach(element => {
            if (shouldSkipPdfElement(element)) return;
            const color = parseCssColor(getComputedStyle(element).backgroundColor);
            if (!color || isWhiteColor(color)) return;
            drawPdfSourceRect(context, element.getBoundingClientRect(), color);
        });
    }

    function drawPdfBorders(context) {
        context.paper.querySelectorAll('.resume-header, .resume-section-title').forEach(element => {
            if (shouldSkipPdfElement(element)) return;
            const styles = getComputedStyle(element);
            drawPdfBorderLine(context, element.getBoundingClientRect(), styles, 'bottom');
            drawPdfBorderLine(context, element.getBoundingClientRect(), styles, 'left');
        });
    }

    function drawPdfListMarkers(context) {
        context.paper.querySelectorAll('.resume-bullets li').forEach(item => {
            if (shouldSkipPdfElement(item)) return;
            const list = item.closest('.resume-bullets');
            const style = list?.dataset.bulletStyle || state.settings.bulletStyle;
            if (style === 'none') return;

            const marker = style === 'hyphen' ? '-' : (style === 'square' ? '▪' : '•');
            const itemRect = item.getBoundingClientRect();
            const styles = getComputedStyle(item);
            const fontSizePx = Number.parseFloat(styles.fontSize) || Number(state.settings.fontSize) * 1.333;
            const sourceX = Math.max(0, itemRect.left - context.paperRect.left - (style === 'hyphen' ? 0 : 8));
            const sourceY = itemRect.top - context.paperRect.top + (fontSizePx * 0.78);
            const point = mapPdfPoint(context, sourceX, sourceY);
            if (!point) return;

            context.pdf.setPage(point.pageIndex + 1);
            setPdfTextStyle(context.pdf, styles);
            context.pdf.text(marker, point.x, point.y);
        });
    }

    function drawPdfListMarkersForAllLists(context) {
        context.paper.querySelectorAll('.resume-bullets li, .resume-rich-text li').forEach(item => {
            if (shouldSkipPdfElement(item)) return;
            const explicitList = item.closest('.resume-bullets');
            const nativeList = item.closest('ul, ol');
            const nativeStyle = nativeList ? getComputedStyle(nativeList).listStyleType : '';
            const style = explicitList?.dataset.bulletStyle || state.settings.bulletStyle || nativeStyle;
            if (style === 'none') return;

            const orderedIndex = nativeList && nativeList.tagName === 'OL'
                ? Array.from(nativeList.children).filter(child => child.tagName === 'LI').indexOf(item) + 1
                : 0;
            const marker = orderedIndex > 0 ? `${orderedIndex}.` : '-';
            const itemRect = item.getBoundingClientRect();
            const styles = getComputedStyle(item);
            const fontSizePx = Number.parseFloat(styles.fontSize) || Number(state.settings.fontSize) * 1.333;
            const sourceX = Math.max(0, itemRect.left - context.paperRect.left - 9);
            const sourceY = itemRect.top - context.paperRect.top + (fontSizePx * 0.78);
            const point = mapPdfPoint(context, sourceX, sourceY);
            if (!point) return;

            context.pdf.setPage(point.pageIndex + 1);
            setPdfTextStyle(context.pdf, styles);
            context.pdf.text(marker, point.x, point.y);
        });
    }

    async function drawPdfImages(context) {
        context.paper.querySelectorAll('img').forEach(image => {
            if (shouldSkipPdfElement(image) || !image.complete || !image.naturalWidth) return;
            const rect = image.getBoundingClientRect();
            const mapped = mapPdfRect(context, rect);
            if (!mapped || mapped.width <= 0 || mapped.height <= 0) return;

            try {
                context.pdf.setPage(mapped.pageIndex + 1);
                context.pdf.addImage(image, 'JPEG', mapped.x, mapped.y, mapped.width, mapped.height);
            } catch (error) {
                console.warn('Skipped PDF image export:', error);
            }
        });

        for (const svg of context.paper.querySelectorAll('svg')) {
            if (shouldSkipPdfElement(svg)) continue;
            const rect = svg.getBoundingClientRect();
            const mapped = mapPdfRect(context, rect);
            if (!mapped || mapped.width <= 0 || mapped.height <= 0) continue;

            try {
                const dataUrl = await svgElementToPngDataUrl(svg);
                if (!dataUrl) continue;
                context.pdf.setPage(mapped.pageIndex + 1);
                context.pdf.addImage(dataUrl, 'PNG', mapped.x, mapped.y, mapped.width, mapped.height);
            } catch (error) {
                console.warn('Skipped PDF SVG export:', error);
            }
        }
    }

    async function svgElementToPngDataUrl(svg) {
        const rect = svg.getBoundingClientRect();
        const width = Math.max(1, Math.ceil(rect.width));
        const height = Math.max(1, Math.ceil(rect.height));
        const clone = svg.cloneNode(true);

        clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        clone.setAttribute('width', String(width));
        clone.setAttribute('height', String(height));
        if (!clone.getAttribute('viewBox')) {
            clone.setAttribute('viewBox', `0 0 ${width} ${height}`);
        }

        inlineSvgComputedPaint(svg, clone);

        const markup = new XMLSerializer().serializeToString(clone);
        const url = URL.createObjectURL(new Blob([markup], { type: 'image/svg+xml;charset=utf-8' }));
        try {
            const image = await loadRasterImage(url);
            const pixelRatio = Math.max(2, Math.min(3, window.devicePixelRatio || 2));
            const canvas = document.createElement('canvas');
            canvas.width = Math.ceil(width * pixelRatio);
            canvas.height = Math.ceil(height * pixelRatio);
            const canvasContext = canvas.getContext('2d');
            if (!canvasContext) return '';
            canvasContext.scale(pixelRatio, pixelRatio);
            canvasContext.clearRect(0, 0, width, height);
            canvasContext.drawImage(image, 0, 0, width, height);
            return canvas.toDataURL('image/png');
        } finally {
            URL.revokeObjectURL(url);
        }
    }

    function inlineSvgComputedPaint(sourceSvg, cloneSvg) {
        const sourceNodes = [sourceSvg, ...sourceSvg.querySelectorAll('*')];
        const cloneNodes = [cloneSvg, ...cloneSvg.querySelectorAll('*')];
        const styleProperties = [
            'color',
            'fill',
            'stroke',
            'strokeWidth',
            'strokeLinecap',
            'strokeLinejoin',
            'opacity',
            'fillOpacity',
            'strokeOpacity'
        ];

        cloneNodes.forEach((cloneNode, index) => {
            const sourceNode = sourceNodes[index];
            if (!(sourceNode instanceof Element) || !(cloneNode instanceof Element)) return;
            const styles = getComputedStyle(sourceNode);
            styleProperties.forEach(property => {
                cloneNode.style[property] = styles[property];
            });
        });
    }

    function loadRasterImage(src) {
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.onload = () => resolve(image);
            image.onerror = () => reject(new Error('Could not render SVG icon'));
            image.src = src;
        });
    }

    function drawPdfText(context) {
        const walker = document.createTreeWalker(context.paper, NodeFilter.SHOW_TEXT, {
            acceptNode(node) {
                if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
                if (!node.parentElement || shouldSkipPdfElement(node.parentElement)) return NodeFilter.FILTER_REJECT;
                if (node.parentElement.closest('.resume-item-url')) return NodeFilter.FILTER_REJECT;
                return NodeFilter.FILTER_ACCEPT;
            }
        });

        while (walker.nextNode()) {
            drawPdfTextNode(context, walker.currentNode);
        }
    }

    function drawPdfTextNode(context, node) {
        const parent = node.parentElement;
        const styles = getComputedStyle(parent);
        if (styles.visibility === 'hidden' || styles.display === 'none' || Number(styles.opacity) === 0) return;

        const text = node.nodeValue || '';
        const lines = [];
        Array.from(text.matchAll(/\S+\s*/g)).forEach(match => {
            const rawText = match[0].trim();
            if (!rawText) return;

            const range = document.createRange();
            range.setStart(node, match.index);
            range.setEnd(node, Math.min(text.length, match.index + match[0].length));
            const rect = Array.from(range.getClientRects()).find(candidate => candidate.width > 0 && candidate.height > 0);
            range.detach();
            if (!rect) return;

            const line = lines.find(candidate => Math.abs(candidate.top - rect.top) < 2);
            if (line) {
                line.segments.push({ text: rawText, rect });
                line.top = Math.min(line.top, rect.top);
                return;
            }

            lines.push({ top: rect.top, segments: [{ text: rawText, rect }] });
        });

        lines.forEach(line => {
            line.segments.sort((a, b) => a.rect.left - b.rect.left);
            const firstRect = line.segments[0]?.rect;
            if (!firstRect) return;

            const fontSizePx = Number.parseFloat(styles.fontSize) || 13;
            const sourceX = firstRect.left - context.paperRect.left;
            const sourceY = firstRect.top - context.paperRect.top + (fontSizePx * 0.78);
            const point = mapPdfPoint(context, sourceX, sourceY);
            if (!point) return;

            context.pdf.setPage(point.pageIndex + 1);
            setPdfTextStyle(context.pdf, styles);
            const lineText = line.segments.map(segment => segment.text).join(' ');
            context.pdf.text(applyPdfTextTransform(lineText, styles.textTransform), point.x, point.y);
        });
    }

    function drawPdfWrappedUrls(context) {
        context.paper.querySelectorAll('.resume-item-url').forEach(element => {
            if (shouldSkipPdfElement(element)) return;
            const text = normalizeInlineText(element.textContent || '');
            if (!text) return;

            const styles = getComputedStyle(element);
            if (styles.visibility === 'hidden' || styles.display === 'none' || Number(styles.opacity) === 0) return;

            const rowRect = (element.closest('.resume-item-url-row') || element).getBoundingClientRect();
            const fontSizePx = Number.parseFloat(styles.fontSize) || 12;
            const sourceX = rowRect.left - context.paperRect.left;
            const sourceY = rowRect.top - context.paperRect.top + (fontSizePx * 0.78);
            const firstPoint = mapPdfPoint(context, sourceX, sourceY);
            if (!firstPoint) return;

            context.pdf.setPage(firstPoint.pageIndex + 1);
            setPdfTextStyle(context.pdf, styles);

            const maxWidth = Math.max(18, rowRect.width * context.scale);
            const lines = splitPdfTextToWidth(context.pdf, text, maxWidth);
            const lineHeight = getPdfLineHeightMm(styles, context.scale);
            lines.forEach((line, index) => {
                const point = mapPdfPoint(context, sourceX, sourceY + ((lineHeight / context.scale) * index));
                if (!point) return;
                context.pdf.setPage(point.pageIndex + 1);
                setPdfTextStyle(context.pdf, styles);
                context.pdf.text(line, point.x, point.y);
            });
        });
    }

    function splitPdfTextToWidth(pdf, text, maxWidth) {
        const lines = [];
        let current = '';

        Array.from(String(text || '')).forEach(character => {
            const next = `${current}${character}`;
            if (current && pdf.getTextWidth(next) > maxWidth) {
                lines.push(current);
                current = character.trimStart();
                return;
            }
            current = next;
        });

        if (current) lines.push(current);
        return lines.length ? lines : [''];
    }

    function getPdfLineHeightMm(styles, scale) {
        const fontSizePx = Number.parseFloat(styles.fontSize) || 12;
        const lineHeightPx = Number.parseFloat(styles.lineHeight);
        return (Number.isFinite(lineHeightPx) ? lineHeightPx : fontSizePx * 1.25) * scale;
    }

    function drawPdfSourceRect(context, rect, color) {
        const sourceLeft = rect.left - context.paperRect.left;
        const sourceTop = rect.top - context.paperRect.top;
        const sourceBottom = rect.bottom - context.paperRect.top;
        const width = rect.width * context.scale;

        context.pageStarts.forEach((pageStart, pageIndex) => {
            const pageEnd = context.pageEnds[pageIndex];
            const top = Math.max(sourceTop, pageStart);
            const bottom = Math.min(sourceBottom, pageEnd);
            if (bottom <= top) return;

            const yOffset = pageIndex === 0 ? 0 : context.continuationTop;
            context.pdf.setPage(pageIndex + 1);
            context.pdf.setFillColor(color.r, color.g, color.b);
            context.pdf.rect(
                sourceLeft * context.scale,
                ((top - pageStart) * context.scale) + yOffset,
                width,
                (bottom - top) * context.scale,
                'F'
            );
        });
    }

    function drawPdfBorderLine(context, rect, styles, side) {
        const width = Number.parseFloat(styles[`border${titleCase(side)}Width`]);
        const color = parseCssColor(styles[`border${titleCase(side)}Color`]);
        if (!Number.isFinite(width) || width <= 0 || !color) return;

        const sourceLeft = rect.left - context.paperRect.left;
        const sourceTop = rect.top - context.paperRect.top;
        const sourceBottom = rect.bottom - context.paperRect.top;
        const sourceRight = rect.right - context.paperRect.left;
        const sourceY = side === 'bottom' ? sourceBottom : sourceTop;
        const point = mapPdfPoint(context, sourceLeft, sourceY);
        if (!point) return;

        context.pdf.setPage(point.pageIndex + 1);
        context.pdf.setDrawColor(color.r, color.g, color.b);
        context.pdf.setLineWidth(Math.max(0.1, width * context.scale));
        if (side === 'bottom') {
            context.pdf.line(point.x, point.y, sourceRight * context.scale, point.y);
        } else if (side === 'left') {
            const bottom = mapPdfPoint(context, sourceLeft, sourceBottom);
            if (bottom && bottom.pageIndex === point.pageIndex) {
                context.pdf.line(point.x, point.y, bottom.x, bottom.y);
            }
        }
    }

    function mapPdfRect(context, rect) {
        const sourceX = rect.left - context.paperRect.left;
        const sourceY = rect.top - context.paperRect.top;
        const point = mapPdfPoint(context, sourceX, sourceY);
        if (!point) return null;

        return {
            pageIndex: point.pageIndex,
            x: point.x,
            y: point.y,
            width: rect.width * context.scale,
            height: rect.height * context.scale
        };
    }

    function mapPdfPoint(context, sourceX, sourceY) {
        const pageIndex = findPdfPageIndex(context, sourceY);
        if (pageIndex < 0) return null;

        const yOffset = pageIndex === 0 ? 0 : context.continuationTop;
        return {
            pageIndex,
            x: sourceX * context.scale,
            y: ((sourceY - context.pageStarts[pageIndex]) * context.scale) + yOffset
        };
    }

    function findPdfPageIndex(context, sourceY) {
        for (let index = 0; index < context.pageStarts.length; index += 1) {
            if (sourceY >= context.pageStarts[index] && sourceY < context.pageEnds[index]) {
                return index;
            }
        }

        return sourceY >= context.pageEnds[context.pageEnds.length - 1] ? context.pageEnds.length - 1 : 0;
    }

    function setPdfTextStyle(pdf, styles) {
        const color = parseCssColor(styles.color) || { r: 17, g: 24, b: 39 };
        const fontSizePx = Number.parseFloat(styles.fontSize) || 13;
        const weight = Number.parseInt(styles.fontWeight, 10);
        const isBold = Number.isFinite(weight) ? weight >= 600 : ['bold', 'bolder'].includes(styles.fontWeight);
        const isItalic = styles.fontStyle === 'italic' || styles.fontStyle === 'oblique';
        const fontStyle = isBold && isItalic ? 'bolditalic' : (isBold ? 'bold' : (isItalic ? 'italic' : 'normal'));

        pdf.setFont('helvetica', fontStyle);
        pdf.setFontSize(fontSizePx * 0.75);
        pdf.setTextColor(color.r, color.g, color.b);
    }

    function applyPdfTextTransform(text, transform) {
        if (transform === 'uppercase') return text.toUpperCase();
        if (transform === 'lowercase') return text.toLowerCase();
        if (transform === 'capitalize') {
            return text.replace(/\b\w/g, character => character.toUpperCase());
        }
        return text;
    }

    function parseCssColor(value) {
        if (!value || value === 'transparent') return null;
        const match = value.match(/rgba?\(([^)]+)\)/i);
        if (!match) return null;
        const parts = match[1].split(',').map(part => Number.parseFloat(part.trim()));
        if (parts.length < 3 || parts.some((part, index) => index < 3 && !Number.isFinite(part))) return null;
        const alpha = parts.length > 3 && Number.isFinite(parts[3]) ? parts[3] : 1;
        if (alpha <= 0.05) return null;
        return {
            r: Math.round(parts[0]),
            g: Math.round(parts[1]),
            b: Math.round(parts[2]),
            a: alpha
        };
    }

    function isWhiteColor(color) {
        return color.r >= 250 && color.g >= 250 && color.b >= 250;
    }

    function shouldSkipPdfElement(element) {
        return Boolean(element.closest([
            '.resume-insert-control',
            '.resume-section-tools',
            '.inline-format-control',
            '.resume-header-style-dock',
            '.bullet-style-inline',
            '.page-break-guide',
            '.toast'
        ].join(',')));
    }

    function openPrintDialog() {
        return new Promise(resolve => {
            let resolved = false;
            const finish = () => {
                if (resolved) return;
                resolved = true;
                window.removeEventListener('afterprint', finish);
                resolve();
            };

            window.addEventListener('afterprint', finish, { once: true });
            window.setTimeout(finish, 1500);
            window.print();
        });
    }

    function applyPrintPageStyle() {
        removePrintPageStyle();

        const style = document.createElement('style');
        style.id = 'resumePrintPageStyle';
        style.textContent = '@media print { @page { size: A4; margin: 0; } }';
        document.head.appendChild(style);
    }

    function removePrintPageStyle() {
        document.getElementById('resumePrintPageStyle')?.remove();
    }

    function renderConstantInput(label, field, value) {
        return `
            <label class="constant-field ${field === 'profileImage' || field === 'website' ? 'field-wide' : ''}">
                <span class="field-label">${escapeHtml(label)}</span>
                <input class="field-input" value="${escapeAttr(value || '')}" data-personal-field="${escapeAttr(field)}">
            </label>
        `;
    }

    function renderEditor() {
        elements.editorSections.hidden = true;
        elements.editorSections.innerHTML = '';
    }

    function renderPersonalEditor() {
        return `
            <div class="editor-item">
                <div class="field-grid">
                    ${renderInput('Name', 'personal', 'name', state.personal.name)}
                    ${renderInput('Title', 'personal', 'title', state.personal.title)}
                    ${renderInput('Email', 'personal', 'email', state.personal.email)}
                    ${renderInput('Location', 'personal', 'location', state.personal.location)}
                    ${renderInput('LinkedIn', 'personal', 'linkedin', state.personal.linkedin)}
                    ${renderInput('GitHub', 'personal', 'github', state.personal.github)}
                    ${renderInput('Website', 'personal', 'website', state.personal.website, true)}
                </div>
            </div>
        `;
    }

    function renderSectionEditor(section) {
        if (section.type === 'skills') {
            const groups = section.groups || [];
            return `
                <div class="column-actions skill-layout-actions">
                    ${renderColumnStepper(section, 'editor')}
                    <button type="button" class="section-action" data-action="add-skill-group" data-section="skills" aria-label="Add skill group" title="Add skill group">
                        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14" /><path d="M5 12h14" /></svg>
                        Skill group
                    </button>
                </div>
                ${groups.length ? groups.map(group => renderSkillGroupEditor(group)).join('') : '<div class="editor-empty">No skill groups in this section.</div>'}
            `;
        }

        if (section.type === 'summary') {
            return `
                ${renderColumnStepper(section, 'editor')}
                <label class="field-wide">
                    <span class="field-label">Text object</span>
                    <textarea class="field-textarea rich-textarea" data-section-body="${escapeAttr(section.id)}">${escapeHtml(richHtmlToPlainText(getSummaryBody(section)))}</textarea>
                </label>
            `;
        }

        const items = section.items || [];
        const layoutControl = renderColumnStepper(section, 'editor');
        if (!items.length) {
            return `${layoutControl}<div class="editor-empty">No entries in this section.</div>`;
        }

        return `${layoutControl}${items.map(item => renderItemEditor(section.type, item)).join('')}`;
    }

    function renderItemEditor(type, item) {
        if (type === 'summary') return '';
        const titleField = getItemTitleField(type);
        return `
            <article class="editor-item">
                ${renderItemHeader(getItemTitle(type, item) || 'Entry', type, item.id)}
                <div class="field-grid">
                    ${renderInput('Entry header', type, titleField, getItemTitle(type, item), false, item.id)}
                    ${renderInput('Date / year', type, 'date', item.date, false, item.id)}
                    ${renderInput('Status', type, 'status', item.status || '', false, item.id)}
                    ${renderInput('URL', type, 'url', item.url || '', false, item.id)}
                    <label class="field-wide">
                        <span class="field-label">Text object</span>
                        <textarea class="field-textarea rich-textarea" data-item-field="body" data-section="${escapeAttr(type)}" data-item="${escapeAttr(item.id)}">${escapeHtml(richHtmlToPlainText(getItemBodyHtml(type, item)))}</textarea>
                    </label>
                </div>
            </article>
        `;
    }

    function renderSkillGroupEditor(group) {
        return `
            <article class="skill-column-editor">
                <div class="editor-item-header">
                    <span class="editor-item-title">${escapeHtml(group.name || 'Skill group')}</span>
                    <button type="button" class="remove-button" data-action="remove-skill-group" data-group="${escapeAttr(group.id)}">Remove</button>
                </div>
                <div class="field-grid">
                    <label>
                        <span class="field-label">Column name</span>
                        <input class="field-input" value="${escapeAttr(group.name)}" data-skill-group="${escapeAttr(group.id)}" data-skill-field="name">
                    </label>
                    <label class="field-wide">
                        <span class="field-label">Skills</span>
                        <textarea class="field-textarea" data-skill-group="${escapeAttr(group.id)}" data-skill-field="skills">${escapeHtml((group.skills || []).join('\n'))}</textarea>
                    </label>
                </div>
            </article>
        `;
    }

    function renderItemHeader(title, section, itemId) {
        return `
            <div class="editor-item-header">
                <span class="editor-item-title">${escapeHtml(title)}</span>
                <button type="button" class="remove-button" data-action="remove-item" data-section="${escapeAttr(section)}" data-item="${escapeAttr(itemId)}">Remove</button>
            </div>
        `;
    }

    function renderInput(label, section, field, value, wide = false, itemId = '') {
        const data = section === 'personal'
            ? `data-personal-field="${escapeAttr(field)}"`
            : `data-item-field="${escapeAttr(field)}" data-section="${escapeAttr(section)}" data-item="${escapeAttr(itemId)}"`;
        return `
            <label class="${wide ? 'field-wide' : ''}">
                <span class="field-label">${escapeHtml(label)}</span>
                <input class="field-input" value="${escapeAttr(value || '')}" ${data}>
            </label>
        `;
    }

    function renderTextarea(label, section, itemId, field, value) {
        return `
            <label class="field-wide">
                <span class="field-label">${escapeHtml(label)}</span>
                <textarea class="field-textarea" data-item-field="${escapeAttr(field)}" data-section="${escapeAttr(section)}" data-item="${escapeAttr(itemId)}">${escapeHtml(value || '')}</textarea>
            </label>
        `;
    }

    function renderResumePaperStyle() {
        const settings = state.settings;
        const headerPattern = settings.headerPatternImage ? `url('${escapeAttr(settings.headerPatternImage)}')` : 'none';
        const variables = {
            '--resume-accent': settings.accent,
            '--resume-font': settings.fontFamily,
            '--resume-name-font': settings.fontName,
            '--resume-title-font': settings.fontTitle,
            '--resume-section-heading-font': settings.fontSectionHeading,
            '--resume-item-heading-font': settings.fontItemHeading,
            '--resume-body-font': settings.fontBody,
            '--resume-contact-font': settings.fontContact,
            '--resume-meta-font': settings.fontMeta,
            '--resume-size': `${settings.fontSize}pt`,
            '--resume-line-height': settings.lineHeight,
            '--resume-name-color': settings.colorName,
            '--resume-title-color': settings.colorTitle,
            '--resume-contact-color': settings.colorContact,
            '--resume-section-heading-color': settings.colorSectionHeading,
            '--resume-item-heading-color': settings.colorItemHeading,
            '--resume-date-color': settings.colorDate,
            '--resume-meta-color': settings.colorMeta,
            '--resume-body-color': settings.colorBody,
            '--resume-skill-heading-color': settings.colorSkillHeading,
            '--resume-skill-body-color': settings.colorSkillBody,
            '--resume-name-size': `${settings.nameSize}pt`,
            '--resume-title-size': `${settings.titleSize}pt`,
            '--resume-section-heading-size': `${settings.sectionHeadingSize}pt`,
            '--resume-item-heading-size': `${settings.itemHeadingSize}pt`,
            '--resume-date-size': `${settings.dateSize}pt`,
            '--resume-meta-size': `${settings.metaSize}pt`,
            '--resume-contact-size': `${settings.contactSize}pt`,
            '--resume-skill-heading-size': `${settings.skillHeadingSize}pt`,
            '--resume-skill-body-size': `${settings.skillBodySize}pt`,
            '--resume-title-line-height': settings.titleLineHeight,
            '--resume-page-padding-x': `${settings.pagePaddingX}px`,
            '--resume-page-padding-y': `${settings.pagePaddingY}px`,
            '--skills-columns': settings.skillsColumns,
            '--resume-header-bg': settings.headerBackground,
            '--resume-header-text': settings.headerTextColor,
            '--resume-header-line-height': settings.headerLineHeight,
            '--resume-header-padding': `${settings.headerPadding}px`,
            '--resume-header-separator': settings.headerSeparatorColor,
            '--resume-header-separator-weight': `${settings.headerSeparatorWeight}px`,
            '--resume-header-contact-gap': `${settings.headerContactGap}px`,
            '--resume-section-heading-line-height': settings.sectionHeadingLineHeight,
            '--resume-section-separator': settings.sectionSeparatorColor,
            '--resume-section-separator-weight': `${settings.sectionSeparatorWeight}px`,
            '--resume-header-pattern-image': headerPattern
        };

        return Object.entries(variables)
            .map(([key, value]) => `${key}:${escapeAttr(value)};`)
            .join(' ');
    }

    function getTextStyleRole(role) {
        return TEXT_STYLE_ROLES[role] || TEXT_STYLE_ROLES.body;
    }

    function getTextStyleOverride(styleKey) {
        if (!styleKey || !state.textStyles) return {};
        const override = state.textStyles[styleKey] || {};
        return resolveClassStyle('text', override.className, override);
    }

    function resolveTextStyle(role, styleKey) {
        const config = getTextStyleRole(role);
        const override = getTextStyleOverride(styleKey);
        if (role === 'academicBody' && (state.templatePreset || 'experienced') === 'experienced') {
            return resolveTextStyle('body', 'section.summary.body');
        }
        if (role === 'itemBody' && (state.templatePreset || 'experienced') === 'experienced') {
            return {
                fontFamily: state.settings.fontBody || state.settings.fontFamily || DEFAULT_RESUME_FONT,
                color: '#1f2937',
                fontSize: 9.25,
                lineHeight: 1.34
            };
        }
        return {
            fontFamily: override.fontFamily || state.settings[config.font] || state.settings.fontBody,
            color: override.color || state.settings[config.color] || '#111827',
            fontSize: Number(override.fontSize || state.settings[config.size] || state.settings.fontSize),
            lineHeight: override.lineHeight || ''
        };
    }

    function renderTextStyleAttributes(role, styleKey) {
        const style = resolveTextStyle(role, styleKey);
        const lineHeight = style.lineHeight ? ` --text-line-height:${escapeAttr(style.lineHeight)};` : '';
        const directLineHeight = style.lineHeight ? ` line-height:${escapeAttr(style.lineHeight)};` : '';
        return `data-style-role="${escapeAttr(role)}" data-style-key="${escapeAttr(styleKey)}" style="--text-font:${escapeAttr(style.fontFamily)}; --text-color:${escapeAttr(style.color)}; --text-size:${escapeAttr(style.fontSize)}pt;${lineHeight} font-family:${escapeAttr(style.fontFamily)}; color:${escapeAttr(style.color)}; font-size:${escapeAttr(style.fontSize)}pt;${directLineHeight}"`;
    }

    function renderJsonStyleAttributes(styleObject = {}, extraVariables = {}) {
        const declarations = [
            ...Object.entries(extraVariables),
            ...Object.entries(styleObject || {}).map(([key, value]) => [camelToKebab(key), value])
        ]
            .filter(([, value]) => value !== '' && value != null)
            .map(([key, value]) => `${key}:${escapeAttr(formatCssValue(key, value))};`);

        return declarations.length ? `style="${declarations.join(' ')}"` : '';
    }

    function renderSectionStyle(section, options = {}) {
        const variables = {
            '--section-columns': getSectionColumns(section, options),
            '--section-content-gap': section.layout && section.layout.gap != null ? `${section.layout.gap}px` : ''
        };
        return renderJsonStyleAttributes(resolveClassStyle('section', section.className, section.style), variables);
    }

    function renderHeaderJsonStyle(section) {
        return renderJsonStyleAttributes(resolveClassStyle('sectionHeader', section.headerClassName, section.headerStyle));
    }

    function renderItemJsonStyle(item) {
        return renderJsonStyleAttributes(resolveClassStyle('item', item.className, item.style));
    }

    function resolveClassStyle(group, className, inlineStyle = {}) {
        const classes = String(className || '')
            .split(/\s+/)
            .map(name => name.trim())
            .filter(Boolean);
        const classStyles = classes.reduce((style, name) => ({
            ...style,
            ...((state.styleClasses && state.styleClasses[group] && state.styleClasses[group][name]) || {})
        }), {});
        return { ...classStyles, ...(inlineStyle || {}) };
    }

    function formatCssValue(key, value) {
        if (typeof value === 'number' && /(?:width|radius|padding|margin|gap|size)$/i.test(key)) return `${value}px`;
        return String(value);
    }

    function camelToKebab(value) {
        return String(value).replace(/[A-Z]/g, match => `-${match.toLowerCase()}`);
    }

    function renderTextStyleControl(role, styleKey, label, icon) {
        return '';
    }

    function usesTwoColumnLayout() {
        return state.template === 'modern' || (state.layout && ['two-column', 'modern'].includes(state.layout.mode));
    }

    function getSectionColumnPlacement(section) {
        const placement = normalizePlacement(section && section.placement);
        if (placement === 'main' || placement === 'left') return 'main';
        if (placement === 'side' || placement === 'right') return 'side';
        if (placement === 'full') return 'full';
        if (!usesTwoColumnLayout()) return 'main';
        const sidebarSections = new Set((state.layout && state.layout.sidebarSections) || []);
        return sidebarSections.has(section.id) || SIDE_SECTIONS.has(section.id) ? 'side' : 'main';
    }

    function renderPreview() {
        const enabledSections = state.sectionOrder
            .map(sectionId => state.sections[sectionId])
            .filter(section => section && section.enabled);

        let bodyHtml = renderResumeSectionsWithInserts(enabledSections);
        if (usesTwoColumnLayout()) {
            const fullSections = state.sectionOrder
                .map(sectionId => state.sections[sectionId])
                .filter(section => section && section.enabled && getSectionColumnPlacement(section) === 'full');
            const mainSections = state.sectionOrder
                .map(sectionId => state.sections[sectionId])
                .filter(section => section && section.enabled && getSectionColumnPlacement(section) === 'main');
            const sideSections = state.sectionOrder
                .map(sectionId => state.sections[sectionId])
                .filter(section => section && section.enabled && getSectionColumnPlacement(section) === 'side');
            const mainHtml = renderResumeSectionsWithInserts(mainSections, 'start');
            const sideHtml = renderResumeSectionsWithInserts(sideSections, 'start-side');
            const fullHtml = fullSections.length ? renderResumeSectionsWithInserts(fullSections, 'start-full') : '';
            bodyHtml = `
                ${fullHtml}
                <div class="resume-body-grid" data-side="${escapeAttr(state.layout.side)}" style="--resume-layout-columns:${escapeAttr(state.layout.columnRatio)}; --resume-layout-gap:${escapeAttr(state.layout.gap)}px;">
                    <div class="resume-main-column">${mainHtml}</div>
                    <aside class="resume-side-column">${sideHtml}</aside>
                </div>
            `;
        }

        elements.resumePreview.innerHTML = `
            <article class="resume-paper template-${escapeAttr(state.template)}"
                data-resume-preset="${escapeAttr(state.templatePreset || '')}"
                data-section-heading-accent="${escapeAttr(state.settings.sectionHeadingAccent)}"
                style="${renderResumePaperStyle()}">
                ${renderResumeHeader()}
                ${bodyHtml}
            </article>
        `;
        updatePreviewPageGuides();
        applyPreviewZoom();
        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(() => {
                updatePreviewPageGuides();
                applyPreviewZoom();
            }).catch(() => {});
        }
        refreshLucideIcons();
    }

    function updatePreviewPageGuides() {
        const paper = elements.resumePreview.querySelector('.resume-paper');
        if (!paper) return;

        paper.querySelectorAll('.page-break-guide').forEach(guide => guide.remove());
        const pageBreaks = buildPreviewPageBreaks(paper);
        const totalPages = pageBreaks.length + 1;
        const pageHeight = getA4PagePixelHeight(paper);

        paper.style.setProperty('--pdf-page-height', `${pageHeight}px`);
        paper.dataset.pageCount = String(totalPages);

        pageBreaks.forEach((breakPosition, index) => {
            const guide = document.createElement('div');
            guide.className = 'page-break-guide';
            guide.style.top = `${breakPosition}px`;
            guide.dataset.pageLabel = `Page ${index + 2}`;
            paper.appendChild(guide);
        });

        if (elements.pageCount) {
            elements.pageCount.textContent = `${totalPages} ${totalPages === 1 ? 'page' : 'pages'}`;
        }
    }

    function buildPreviewPageBreaks(paper) {
        const pageHeight = getA4PagePixelHeight(paper);
        const continuationTopPadding = getContinuationPageTopPaddingPx(paper);
        const bottomPadding = getPageBottomPaddingPx(paper);
        const firstPageContentHeight = Math.max(120, pageHeight - bottomPadding);
        const continuationPageHeight = Math.max(120, pageHeight - continuationTopPadding - bottomPadding);
        const totalHeight = Math.max(paper.scrollHeight, paper.offsetHeight);
        const minProgress = 120;
        const guard = 12;
        const textLineRanges = getTextLinePageBreakRanges(paper, 1, totalHeight, guard);
        const headingKeepRanges = getHeadingKeepWithNextRanges(paper, 1, totalHeight, 18);
        const breaks = [];
        let start = 0;

        while (start < totalHeight) {
            const maxPageContentHeight = breaks.length === 0 ? firstPageContentHeight : continuationPageHeight;
            if (start + maxPageContentHeight >= totalHeight) break;

            let end = Math.min(start + maxPageContentHeight, totalHeight);
            const smarterEnd = findTextSafePageBreak(start, end, textLineRanges, minProgress);
            if (smarterEnd > start + minProgress) {
                end = smarterEnd;
            }

            end = keepHeadingWithNextContent(start, end, headingKeepRanges, minProgress);

            if (end <= start + minProgress) {
                end = Math.min(start + maxPageContentHeight, totalHeight);
            }

            if (end >= totalHeight) break;
            breaks.push(end);
            start = end;
        }

        return breaks;
    }

    function getHeadingKeepWithNextRanges(paper, scale, totalHeight, guard) {
        const paperRect = paper.getBoundingClientRect();

        return Array.from(paper.querySelectorAll('.resume-section'))
            .map(section => {
                const heading = section.querySelector('.resume-section-title-row');
                const firstContent = section.querySelector([
                    '.resume-section-content .resume-item-heading',
                    '.skills-grid .skill-group-title',
                    '.resume-section-content > .resume-rich-block',
                    '.resume-section-content > *'
                ].join(','));
                if (!heading || !firstContent) return null;

                const headingRect = heading.getBoundingClientRect();
                const firstContentRect = firstContent.getBoundingClientRect();
                const firstContentStart = Math.max(0, Math.floor((firstContentRect.top - paperRect.top) * scale) - guard);
                return {
                    start: Math.max(0, Math.floor((headingRect.top - paperRect.top) * scale) - guard),
                    headingEnd: Math.min(totalHeight, Math.ceil((headingRect.bottom - paperRect.top) * scale) + guard),
                    end: Math.min(totalHeight, firstContentStart + guard)
                };
            })
            .filter(Boolean)
            .filter(range => range.end > range.start)
            .sort((a, b) => a.start - b.start);
    }

    function keepHeadingWithNextContent(start, desiredEnd, headingKeepRanges, minProgress) {
        const orphanedHeading = headingKeepRanges.find(range => (
            range.start > start + minProgress
            && desiredEnd > range.headingEnd
            && desiredEnd < range.end
        ));

        return orphanedHeading ? orphanedHeading.start : desiredEnd;
    }

    function getTextLinePageBreakRanges(paper, scale, totalHeight, guard) {
        const paperRect = paper.getBoundingClientRect();
        const ranges = [];
        const walker = document.createTreeWalker(paper, NodeFilter.SHOW_TEXT, {
            acceptNode(node) {
                if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
                if (!node.parentElement || shouldSkipPdfElement(node.parentElement)) return NodeFilter.FILTER_REJECT;
                const styles = getComputedStyle(node.parentElement);
                if (styles.visibility === 'hidden' || styles.display === 'none' || Number(styles.opacity) === 0) {
                    return NodeFilter.FILTER_REJECT;
                }
                return NodeFilter.FILTER_ACCEPT;
            }
        });

        while (walker.nextNode()) {
            const node = walker.currentNode;
            const styles = getComputedStyle(node.parentElement);
            const fontSizePx = Number.parseFloat(styles.fontSize) || 12;
            const lineHeightPx = Number.parseFloat(styles.lineHeight);
            const safeLineHeight = Math.max(8, Number.isFinite(lineHeightPx) ? lineHeightPx : fontSizePx * 1.35);
            const range = document.createRange();
            range.selectNodeContents(node);
            Array.from(range.getClientRects()).forEach(rect => {
                if (rect.width <= 0 || rect.height <= 0) return;
                const rectTop = rect.top - paperRect.top;
                const rectBottom = rect.bottom - paperRect.top;
                if (rect.height > safeLineHeight * 1.7) {
                    const lineCount = Math.max(1, Math.ceil(rect.height / safeLineHeight));
                    Array.from({ length: lineCount }).forEach((_, index) => {
                        const lineTop = rectTop + (index * safeLineHeight);
                        const lineBottom = Math.min(rectBottom, lineTop + safeLineHeight);
                        ranges.push({
                            start: Math.max(0, Math.floor(lineTop * scale) - guard),
                            end: Math.min(totalHeight, Math.ceil(lineBottom * scale) + guard)
                        });
                    });
                    return;
                }

                ranges.push({
                    start: Math.max(0, Math.floor(rectTop * scale) - guard),
                    end: Math.min(totalHeight, Math.ceil(rectBottom * scale) + guard)
                });
            });
            range.detach();
        }

        return ranges
            .filter(range => range.end > range.start)
            .sort((a, b) => a.start - b.start);
    }

    function findTextSafePageBreak(start, desiredEnd, textLineRanges, minProgress) {
        const lowerBound = start + minProgress;
        const cutLine = textLineRanges.find(range => desiredEnd > range.start && desiredEnd < range.end);
        if (!cutLine) return desiredEnd;

        if (cutLine.start > lowerBound) return cutLine.start;
        if (cutLine.end <= desiredEnd) return cutLine.end;
        return desiredEnd;
    }

    function getA4PagePixelHeight(paper) {
        return Math.max(1, paper.offsetWidth * (297 / 210));
    }

    function getContinuationPageTopPaddingPx(paper) {
        const cssValue = Number.parseFloat(getComputedStyle(paper).getPropertyValue('--resume-page-padding-y'));
        const stateValue = Number(state.settings.pagePaddingY);
        const padding = Number.isFinite(cssValue) ? cssValue : stateValue;
        return Math.max(24, Math.min(96, Number.isFinite(padding) ? padding : 48));
    }

    function getPageBottomPaddingPx(paper) {
        const styles = getComputedStyle(paper);
        const cssValue = Number.parseFloat(styles.getPropertyValue('--resume-page-padding-y'));
        const actualPadding = Number.parseFloat(styles.paddingBottom);
        const stateValue = Number(state.settings.pagePaddingY);
        const padding = Number.isFinite(cssValue)
            ? cssValue
            : (Number.isFinite(actualPadding) ? actualPadding : stateValue);
        return Math.max(24, Math.min(96, Number.isFinite(padding) ? padding : 48));
    }

    function renderResumeSectionsWithInserts(sections, startAnchor = 'start') {
        if (!sections.length) {
            return renderResumeInsertControl(startAnchor, true);
        }

        return sections.reduce((html, section, index) => {
            const before = index === 0 ? renderResumeInsertControl(startAnchor) : '';
            return `${html}${before}${renderResumeSection(section)}${renderResumeInsertControl(section.id)}`;
        }, '');
    }

    function renderResumeInsertControl(anchor, isEmpty = false) {
        return '';
    }

    function renderResumeHeader() {
        const contact = [
            { key: 'email', icon: 'mail', value: state.personal.email },
            { key: 'location', icon: 'map-pin', value: state.personal.location },
            { key: 'linkedin', icon: 'linkedin', value: formatVisibleUrl(state.personal.linkedin) },
            { key: 'github', icon: 'github', value: formatVisibleUrl(state.personal.github) },
            { key: 'website', icon: 'globe', value: formatVisibleUrl(state.personal.website) }
        ].filter(item => item.value);
        const contactLabels = {
            email: 'Email',
            location: 'Location',
            linkedin: 'LinkedIn',
            github: 'GitHub',
            website: 'Website'
        };

        return `
            <div class="resume-header-block inline-format-target">
                <header class="resume-header" data-align="${escapeAttr(state.settings.headerAlign)}" data-design="${escapeAttr(state.settings.headerDesign)}" data-pattern="${escapeAttr(state.settings.headerPattern)}" data-contact-layout="${escapeAttr(state.settings.contactLayout || 'stacked')}" data-profile-placement="${escapeAttr(state.settings.profilePhotoPlacement)}" data-profile-shape="${escapeAttr(state.settings.profilePhotoShape)}">
                    ${state.settings.showProfilePhoto && state.personal.profileImage ? `
                        <img class="resume-profile-photo" src="${escapeAttr(state.personal.profileImage)}" alt="${escapeAttr(state.personal.name)} profile photo">
                    ` : ''}
                    <div class="resume-identity">
                        <div class="inline-format-target">
                            <h1 class="resume-name text-style-target" contenteditable="true" data-placeholder="Name" data-edit-kind="personal" data-field="name" ${renderTextStyleAttributes('name', 'personal.name')}>${escapeHtml(state.personal.name)}</h1>
                            ${renderTextStyleControl('name', 'personal.name', 'Name', 'type')}
                        </div>
                        <div class="inline-format-target">
                            <div class="resume-title text-style-target" contenteditable="true" data-placeholder="Target title" data-edit-kind="personal" data-field="title" ${renderTextStyleAttributes('title', 'personal.title')}>${escapeHtml(state.personal.title)}</div>
                            ${renderTextStyleControl('title', 'personal.title', 'Title', 'text-cursor-input')}
                        </div>
                    </div>
                    <div class="resume-contact">
                        ${contact.map(item => `
                            <span class="resume-contact-item inline-format-target" data-contact-key="${escapeAttr(item.key)}">
                                ${state.settings.showHeaderIcons ? renderHeaderIcon(item.icon) : ''}
                                <span class="resume-contact-label">${escapeHtml(contactLabels[item.key] || titleCase(item.key))}: </span>
                                <span class="text-style-target" contenteditable="true" data-placeholder="Contact" data-edit-kind="contact" data-contact-key="${escapeAttr(item.key)}" ${renderTextStyleAttributes('contact', `contact.${item.key}`)}>${escapeHtml(item.value)}</span>
                                ${renderTextStyleControl('contact', `contact.${item.key}`, 'Contact', 'at-sign')}
                            </span>
                        `).join('')}
                    </div>
                </header>
                ${renderHeaderStyleDock()}
            </div>
        `;
    }

    function renderHeaderStyleDock() {
        return '';
    }

    function renderHeaderIcon(icon) {
        const brandPaths = {
            linkedin: '<path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.55V9h3.57v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z"></path>',
            github: '<path d="M12 .3a12 12 0 0 0-3.79 23.39c.6.11.82-.26.82-.58v-2.04c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.33-1.76-1.33-1.76-1.09-.74.08-.73.08-.73 1.21.08 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.5 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.14-.3-.54-1.52.1-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.28-1.55 3.29-1.23 3.29-1.23.64 1.66.24 2.88.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.61-2.8 5.63-5.47 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.21.69.83.57A12 12 0 0 0 12 .3Z"></path>'
        };

        if (brandPaths[icon]) {
            return `<svg class="brand-icon brand-icon-${escapeAttr(icon)}" viewBox="0 0 24 24" aria-hidden="true">${brandPaths[icon]}</svg>`;
        }

        return `<i data-lucide="${escapeAttr(icon)}" aria-hidden="true"></i>`;
    }

    function hasMeaningfulItemContent(sectionId, item) {
        if (!item) return false;
        return [
            getItemTitle(sectionId, item),
            getItemMetaValue(sectionId, item),
            item.date,
            item.status,
            item.url,
            richHtmlToPlainText(getItemBodyHtml(sectionId, item))
        ].some(value => normalizeInlineText(value));
    }

    function renderResumeSection(section) {
        if (section.type === 'summary') {
            const body = getSummaryBody(section);
            if (!richHtmlToPlainText(body)) return '';
            const columns = getSectionColumns(section, { contentCount: 1 });
            return `
                <section class="resume-section resume-summary" data-resume-section="${escapeAttr(section.id)}" data-placement="${escapeAttr(getSectionColumnPlacement(section))}" ${renderSectionStyle(section, { contentCount: 1 })}>
                    ${renderResumeSectionTools(section)}
                    ${renderResumeSectionTitle(section)}
                    <div class="resume-section-content" data-section-columns="${columns}">
                        <div class="resume-rich-block inline-format-target">
                            <div class="resume-rich-text text-style-target" contenteditable="true" data-placeholder="Type summary" data-edit-kind="section-body" data-section="${escapeAttr(section.id)}" ${renderTextStyleAttributes('body', `section.${section.id}.body`)}>${sanitizeRichHtml(body)}</div>
                            ${renderRichTextToolbar(`section.${section.id}.body`)}
                            ${renderTextStyleControl('body', `section.${section.id}.body`, 'Text object', 'pilcrow')}
                        </div>
                    </div>
                </section>
            `;
        }

        if (section.type === 'skills') {
            const groups = (section.groups || [])
                .map(group => ({
                    ...group,
                    skills: (group.skills || []).map(skill => normalizeInlineText(skill)).filter(Boolean)
                }))
                .filter(group => group.name || group.skills.length);
            if (!groups.length) return '';
            const columns = getSectionColumns(section, { contentCount: groups.length });
            return `
                <section class="resume-section" data-resume-section="${escapeAttr(section.id)}" data-placement="${escapeAttr(getSectionColumnPlacement(section))}" ${renderSectionStyle(section, { contentCount: groups.length })}>
                    ${renderResumeSectionTools(section)}
                    ${renderResumeSectionTitle(section)}
                    <div class="skills-grid" data-section-columns="${columns}" style="--skills-columns:${columns};">
                        ${groups.map(group => `
                            <div class="skill-group">
                                <div class="inline-format-target">
                                    <strong class="skill-group-title text-style-target" contenteditable="true" data-placeholder="Skill group" data-edit-kind="skill" data-group="${escapeAttr(group.id)}" data-field="name" ${renderTextStyleAttributes('skillHeading', `skill.${group.id}.name`)}>${escapeHtml(group.name)}</strong>
                                    ${renderTextStyleControl('skillHeading', `skill.${group.id}.name`, 'Skill group', 'badge')}
                                </div>
                                <div class="inline-format-target">
                                    <div class="skill-group-list text-style-target" contenteditable="true" data-placeholder="Comma separated skills" data-edit-kind="skill" data-group="${escapeAttr(group.id)}" data-field="skills" ${renderTextStyleAttributes('skillBody', `skill.${group.id}.skills`)}>${escapeHtml((group.skills || []).join(', '))}</div>
                                    ${renderTextStyleControl('skillBody', `skill.${group.id}.skills`, 'Skills', 'wrench')}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </section>
            `;
        }

        const items = (section.items || []).filter(item => hasMeaningfulItemContent(section.type, item));
        if (!items.length) return '';
        const columns = getSectionColumns(section, { contentCount: items.length });
        const itemHtml = templateControlsSectionColumns() && columns > 1
            ? renderBalancedTemplateColumns(section.type, sortSectionItems(items), columns)
            : sortSectionItems(items).map(item => renderResumeItem(section.type, item)).join('');
        return `
            <section class="resume-section" data-resume-section="${escapeAttr(section.id)}" data-placement="${escapeAttr(getSectionColumnPlacement(section))}" ${renderSectionStyle(section, { contentCount: items.length })}>
                ${renderResumeSectionTools(section)}
                ${renderResumeSectionTitle(section)}
                <div class="resume-section-content" data-section-columns="${columns}">
                    ${itemHtml}
                </div>
            </section>
        `;
    }

    function renderBalancedTemplateColumns(sectionType, items, columns) {
        const buckets = Array.from({ length: columns }, () => ({ weight: 0, items: [] }));
        items.forEach(item => {
            const target = buckets.reduce((best, bucket) => bucket.weight < best.weight ? bucket : best, buckets[0]);
            target.items.push(item);
            target.weight += estimateResumeItemWeight(sectionType, item);
        });

        return buckets.map((bucket, index) => `
            <div class="resume-section-column" data-template-column="${index + 1}">
                ${bucket.items.map(item => renderResumeItem(sectionType, item)).join('')}
            </div>
        `).join('');
    }

    function estimateResumeItemWeight(sectionType, item) {
        const title = getItemTitle(sectionType, item);
        const meta = getItemMetaValue(sectionType, item);
        const body = richHtmlToPlainText(getItemBodyHtml(sectionType, item));
        const bullets = Array.isArray(item.bullets) ? item.bullets.join(' ') : '';
        return normalizeInlineText([title, meta, item.date, item.url, body, bullets].join(' ')).length || 1;
    }

    function renderResumeSectionTools(section) {
        return `
            <div class="resume-section-tools" aria-label="${escapeAttr(section.title)} controls">
                <button type="button" class="resume-section-tool resume-section-remove" data-preview-action="remove-section" data-section="${escapeAttr(section.id)}" aria-label="Remove ${escapeAttr(section.title)} section" title="Remove section">
                    <i data-lucide="x" aria-hidden="true"></i>
                </button>
                <button type="button" class="resume-section-tool drag-tool" draggable="true" data-section-drag data-section-id="${escapeAttr(section.id)}" aria-label="Drag ${escapeAttr(section.title)}" title="Drag">
                    <i data-lucide="grip-vertical" aria-hidden="true"></i>
                </button>
            </div>
        `;
    }

    function sortSectionItems(items) {
        return [...items].sort((a, b) => {
            const aOrder = Number.isFinite(Number(a.order)) ? Number(a.order) : 0;
            const bOrder = Number.isFinite(Number(b.order)) ? Number(b.order) : 0;
            return aOrder - bOrder;
        });
    }

    function renderResumeSectionTitle(section) {
        return `
            <div class="resume-section-title-row inline-format-target" ${renderHeaderJsonStyle(section)}>
                <h2 class="resume-section-title text-style-target" contenteditable="true" data-placeholder="Section title" data-edit-kind="section-title" data-section="${escapeAttr(section.id)}" ${renderTextStyleAttributes('sectionHeading', `section.${section.id}.title`)}>${escapeHtml(section.title)}</h2>
                ${renderTextStyleControl('sectionHeading', `section.${section.id}.title`, 'Section header', 'heading')}
            </div>
        `;
    }

    function renderFontOptions(selected) {
        return FONT_OPTIONS.map(([optionLabel, value]) => `
            <option value="${escapeAttr(value)}" ${value === selected ? 'selected' : ''}>${escapeHtml(optionLabel)}</option>
        `).join('');
    }

    function renderBulletStyleOptions(selected = state.settings.bulletStyle) {
        return BULLET_STYLE_OPTIONS.map(([value, label]) => `
            <option value="${escapeAttr(value)}" ${value === selected ? 'selected' : ''}>${escapeHtml(label)}</option>
        `).join('');
    }

    function renderRichTextToolbar(styleKey) {
        return `
            <div class="rich-text-toolbar" contenteditable="false" aria-label="Text object tools">
                <button type="button" class="rich-tool-button" data-rich-command="bold" title="Bold" aria-label="Bold"><strong>B</strong></button>
                <button type="button" class="rich-tool-button" data-rich-command="italic" title="Italic" aria-label="Italic"><em>I</em></button>
                <button type="button" class="rich-tool-button" data-rich-command="insertUnorderedList" title="Bullets" aria-label="Bullets"><i data-lucide="list" aria-hidden="true"></i></button>
                <button type="button" class="rich-tool-button" data-rich-command="createLink" title="Link" aria-label="Link"><i data-lucide="link" aria-hidden="true"></i></button>
                <button type="button" class="rich-tool-button" data-rich-command="unlink" title="Remove link" aria-label="Remove link"><i data-lucide="unlink" aria-hidden="true"></i></button>
            </div>
        `;
    }

    function getSummaryBody(section) {
        if (!section) return '';
        if (section.body) return sanitizeRichHtml(section.body);
        const textItems = (section.items || []).map(item => item.text).filter(Boolean);
        return textItems.length
            ? textItems.map(text => `<p>${escapeHtml(text)}</p>`).join('')
            : '';
    }

    function getItemTitleField(type) {
        const fields = {
            experience: 'role',
            projects: 'name',
            education: 'degree',
            research: 'title',
            certifications: 'name'
        };
        return fields[type] || 'name';
    }

    function getItemTitle(type, item) {
        return item ? (item[getItemTitleField(type)] || item.title || item.name || '') : '';
    }

    function getItemBodyHtml(type, item) {
        if (!item) return '';
        if (item.body) return sanitizeRichHtml(item.body);
        item.body = itemToBodyHtml(item, type);
        return item.body;
    }

    function getItemBodyHtmlForPreview(type, item) {
        const body = getItemBodyHtml(type, item);
        return removeGeneratedMetaParagraphs(removeGeneratedUrlParagraph(body, item && item.url), item);
    }

    function getItemMetaField(type, item) {
        if (!item) return '';
        if (type === 'certifications' && item.issuer) return 'issuer';
        if (item.organization) return 'organization';
        if (item.issuer) return 'issuer';
        if (item.publication) return 'publication';
        return '';
    }

    function getItemMetaValue(type, item) {
        const field = getItemMetaField(type, item);
        return field ? item[field] : '';
    }

    function removeGeneratedMetaParagraphs(body, item) {
        const sanitized = sanitizeRichHtml(body);
        const metaValue = normalizeInlineText(getItemMetaValue('', item));
        if (!metaValue) return sanitized;

        const template = document.createElement('template');
        template.innerHTML = sanitized;
        const firstParagraph = template.content.querySelector('p');
        if (firstParagraph && normalizeInlineText(firstParagraph.textContent) === metaValue) {
            firstParagraph.remove();
        }
        return template.innerHTML;
    }

    function removeGeneratedUrlParagraph(body, url) {
        const sanitized = sanitizeRichHtml(body);
        const safeUrl = cleanUrl(url);
        if (!safeUrl) return sanitized;

        const template = document.createElement('template');
        template.innerHTML = sanitized;
        const compact = compactUrl(safeUrl);
        Array.from(template.content.querySelectorAll('p')).forEach(paragraph => {
            const children = Array.from(paragraph.children);
            const text = paragraph.textContent.trim();
            const onlyLink = children.length === 1 && children[0].tagName === 'A';
            if (onlyLink && text === compact) paragraph.remove();
        });
        return template.innerHTML;
    }

    function itemToBodyHtml(item, type) {
        const lines = [];
        const org = item.organization || item.issuer || '';
        const url = item.url || '';
        const details = item.details || '';
        const credentialId = item.credentialId || '';

        if (org) lines.push(`<p>${escapeHtml(org)}</p>`);
        if (type === 'certifications' && credentialId) lines.push(`<p>Credential ID: ${escapeHtml(credentialId)}</p>`);
        if (details) lines.push(`<p>${escapeHtml(details)}</p>`);

        const bullets = Array.isArray(item.bullets) ? item.bullets.filter(Boolean) : [];
        if (bullets.length) {
            lines.push(`<ul>${bullets.map(bullet => `<li>${escapeHtml(bullet)}</li>`).join('')}</ul>`);
        }

        if (url) {
            const safeUrl = cleanUrl(url);
            lines.push(`<p><a href="${escapeAttr(safeUrl)}">${escapeHtml(compactUrl(safeUrl))}</a></p>`);
        }

        return sanitizeRichHtml(lines.join('') || '<p></p>');
    }

    function plainTextToRichHtml(value) {
        const lines = String(value || '').split(/\r?\n/);
        const blocks = [];
        let bullets = [];

        const flushBullets = () => {
            if (!bullets.length) return;
            blocks.push(`<ul>${bullets.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`);
            bullets = [];
        };

        lines.forEach(line => {
            const trimmed = line.trim();
            if (!trimmed) {
                flushBullets();
                return;
            }

            const bullet = trimmed.match(/^[-*\u2022]\s+(.+)$/);
            if (bullet) {
                bullets.push(bullet[1].trim());
                return;
            }

            flushBullets();
            blocks.push(`<p>${escapeHtml(trimmed)}</p>`);
        });

        flushBullets();
        return sanitizeRichHtml(blocks.join('') || '<p></p>');
    }

    function appendRichParagraph(html, text) {
        const current = sanitizeRichHtml(html);
        const paragraph = `<p>${escapeHtml(text)}</p>`;
        return sanitizeRichHtml(`${current}${paragraph}`);
    }

    function richHtmlToPlainText(value) {
        const container = document.createElement('div');
        container.innerHTML = sanitizeRichHtml(value);
        container.querySelectorAll('li').forEach(item => {
            item.prepend(document.createTextNode('- '));
            item.append(document.createTextNode('\n'));
        });
        container.querySelectorAll('p, div').forEach(block => block.append(document.createTextNode('\n')));
        return container.textContent.replace(/\n{3,}/g, '\n\n').trim();
    }

    function richTextBulletLines(value) {
        const container = document.createElement('div');
        container.innerHTML = sanitizeRichHtml(value);
        return Array.from(container.querySelectorAll('li'))
            .map(item => normalizeBulletText(item.textContent))
            .filter(Boolean);
    }

    function sanitizeRichHtml(value) {
        const template = document.createElement('template');
        template.innerHTML = String(value || '');
        const allowed = new Set(['A', 'B', 'BR', 'DIV', 'EM', 'I', 'LI', 'OL', 'P', 'STRONG', 'U', 'UL']);

        template.content.querySelectorAll('script, style, iframe, object, embed').forEach(node => node.remove());
        Array.from(template.content.querySelectorAll('*')).forEach(node => {
            if (!allowed.has(node.tagName)) {
                node.replaceWith(...Array.from(node.childNodes));
                return;
            }

            const hrefValue = node.tagName === 'A' ? (node.getAttribute('href') || node.textContent || '') : '';
            Array.from(node.attributes).forEach(attribute => node.removeAttribute(attribute.name));
            if (node.tagName === 'A') {
                const href = cleanUrl(hrefValue);
                if (/^(https?:|mailto:)/i.test(href)) {
                    node.setAttribute('href', href);
                    node.setAttribute('target', '_blank');
                    node.setAttribute('rel', 'noopener noreferrer');
                }
            }
        });

        return template.innerHTML;
    }

    function renderResumeItem(type, item) {
        if (type === 'summary') return '';
        const titleField = getItemTitleField(type);
        const title = getItemTitle(type, item);
        const body = getItemBodyHtmlForPreview(type, item);
        const hasBody = Boolean(richHtmlToPlainText(body));
        const bodyStyleRole = getItemBodyStyleRole(type);
        const bodyStyleLabel = bodyStyleRole === 'body' ? 'Text' : 'Entry text';
        const url = cleanUrl(item.url || '');
        const metaField = getItemMetaField(type, item);
        const metaValue = getItemMetaValue(type, item);
        const credentialId = type === 'certifications' ? normalizeInlineText(item.credentialId || '') : '';
        return `
            <article class="resume-item ${item.status ? 'has-status' : ''}" data-resume-entry="${escapeAttr(item.id)}" data-entry-section="${escapeAttr(type)}" data-placement="${escapeAttr(normalizePlacement(item.placement || 'auto'))}" ${renderItemJsonStyle(item)}>
                <button type="button" class="resume-entry-drag drag-tool" draggable="true" data-entry-drag data-section="${escapeAttr(type)}" data-item="${escapeAttr(item.id)}" aria-label="Drag entry" title="Drag entry">
                    <i data-lucide="grip-vertical" aria-hidden="true"></i>
                </button>
                <div class="resume-item-heading">
                    <span class="inline-format-target">
                        <strong class="resume-item-title text-style-target" contenteditable="true" data-placeholder="Entry header" data-edit-kind="item" data-section="${escapeAttr(type)}" data-item="${escapeAttr(item.id)}" data-field="${escapeAttr(titleField)}" ${renderTextStyleAttributes('itemHeading', `item.${type}.${item.id}.${titleField}`)}>${escapeHtml(title)}</strong>
                        ${renderTextStyleControl('itemHeading', `item.${type}.${item.id}.${titleField}`, 'Entry header', 'type')}
                    </span>
                    <span class="resume-item-date-group">
                        <span class="inline-format-target">
                            <span class="resume-item-date text-style-target ${item.date ? '' : 'is-empty-meta'}" contenteditable="true" data-placeholder="Date / year" data-edit-kind="item" data-section="${escapeAttr(type)}" data-item="${escapeAttr(item.id)}" data-field="date" ${renderTextStyleAttributes('date', `item.${type}.${item.id}.date`)}>${escapeHtml(item.date || '')}</span>
                            ${renderTextStyleControl('date', `item.${type}.${item.id}.date`, 'Date', 'calendar-days')}
                        </span>
                        <span class="inline-format-target">
                            <span class="resume-item-status text-style-target ${item.status ? '' : 'is-empty-meta'}" contenteditable="true" data-placeholder="Status" data-edit-kind="item" data-section="${escapeAttr(type)}" data-item="${escapeAttr(item.id)}" data-field="status" ${renderTextStyleAttributes('meta', `item.${type}.${item.id}.status`)}>${escapeHtml(item.status || '')}</span>
                            ${renderTextStyleControl('meta', `item.${type}.${item.id}.status`, 'Status', 'badge-check')}
                        </span>
                    </span>
                </div>
                ${metaValue ? `
                    <div class="resume-item-meta inline-format-target">
                        <span class="text-style-target" contenteditable="true" data-placeholder="Details" data-edit-kind="item" data-section="${escapeAttr(type)}" data-item="${escapeAttr(item.id)}" data-field="${escapeAttr(metaField)}" ${renderTextStyleAttributes('meta', `item.${type}.${item.id}.${metaField}`)}>${escapeHtml(metaValue)}</span>
                        ${renderTextStyleControl('meta', `item.${type}.${item.id}.${metaField}`, 'Details', 'text')}
                    </div>
                ` : ''}
                ${credentialId ? `
                    <div class="resume-item-meta inline-format-target">
                        <span>Credential ID: </span><span class="text-style-target" contenteditable="true" data-placeholder="Credential ID" data-edit-kind="item" data-section="${escapeAttr(type)}" data-item="${escapeAttr(item.id)}" data-field="credentialId" ${renderTextStyleAttributes('meta', `item.${type}.${item.id}.credentialId`)}>${escapeHtml(credentialId)}</span>
                        ${renderTextStyleControl('meta', `item.${type}.${item.id}.credentialId`, 'Credential ID', 'badge-check')}
                    </div>
                ` : ''}
                ${url ? `
                    <div class="resume-item-url-row inline-format-target" contenteditable="false">
                        <span class="resume-item-url text-style-target" contenteditable="true" data-placeholder="URL" data-edit-kind="item" data-section="${escapeAttr(type)}" data-item="${escapeAttr(item.id)}" data-field="url" ${renderTextStyleAttributes('meta', `item.${type}.${item.id}.url`)}>${escapeHtml(formatVisibleUrl(url, { section: type }))}</span>
                        ${renderTextStyleControl('meta', `item.${type}.${item.id}.url`, 'URL', 'link')}
                    </div>
                ` : ''}
                ${hasBody ? `<div class="resume-rich-block inline-format-target">
                    <div class="resume-rich-text text-style-target" contenteditable="true" data-placeholder="Text object" data-edit-kind="rich" data-section="${escapeAttr(type)}" data-item="${escapeAttr(item.id)}" data-field="body" ${renderTextStyleAttributes(bodyStyleRole, `item.${type}.${item.id}.body`)}>${sanitizeRichHtml(body)}</div>
                    ${renderRichTextToolbar(`item.${type}.${item.id}.body`)}
                    ${renderTextStyleControl(bodyStyleRole, `item.${type}.${item.id}.body`, bodyStyleLabel, 'pilcrow')}
                </div>` : ''}
            </article>
        `;
    }

    function getItemBodyStyleRole(type) {
        return ['education', 'research'].includes(type) ? 'academicBody' : 'itemBody';
    }

    function renderResumeBulletItem(options) {
        const { section, item, title, date, meta, url, titleField, metaField } = options;
        const bullets = item.bullets || [];
        return `
            <article class="resume-item" data-placement="${escapeAttr(normalizePlacement(item.placement || 'auto'))}" ${renderItemJsonStyle(item)}>
                <div class="resume-item-heading">
                    <span class="inline-format-target">
                        <strong class="resume-item-title text-style-target" contenteditable="true" data-placeholder="Entry title" data-edit-kind="item" data-section="${escapeAttr(section)}" data-item="${escapeAttr(item.id)}" data-field="${escapeAttr(titleField)}" ${renderTextStyleAttributes('itemHeading', `item.${section}.${item.id}.${titleField}`)}>${escapeHtml(title)}</strong>
                        ${renderTextStyleControl('itemHeading', `item.${section}.${item.id}.${titleField}`, 'Entry header', 'type')}
                    </span>
                    ${date ? `<span class="inline-format-target">
                        <span class="resume-item-date text-style-target" contenteditable="true" data-placeholder="Date" data-edit-kind="item" data-section="${escapeAttr(section)}" data-item="${escapeAttr(item.id)}" data-field="date" ${renderTextStyleAttributes('date', `item.${section}.${item.id}.date`)}>${escapeHtml(date)}</span>
                        ${renderTextStyleControl('date', `item.${section}.${item.id}.date`, 'Date', 'calendar-days')}
                    </span>` : ''}
                </div>
                ${meta ? `
                    <div class="resume-item-meta inline-format-target">
                        ${metaField ? `<span class="text-style-target" contenteditable="true" data-placeholder="Details" data-edit-kind="item" data-section="${escapeAttr(section)}" data-item="${escapeAttr(item.id)}" data-field="${escapeAttr(metaField)}" ${renderTextStyleAttributes('meta', `item.${section}.${item.id}.${metaField}`)}>${escapeHtml(meta)}</span>` : ''}
                        ${renderTextStyleControl('meta', `item.${section}.${item.id}.${metaField || 'url'}`, 'Details', 'text')}
                    </div>
                ` : ''}
                ${url ? `
                    <div class="resume-item-url-row inline-format-target" contenteditable="false">
                        <span class="resume-item-url text-style-target" contenteditable="true" data-placeholder="URL" data-edit-kind="item" data-section="${escapeAttr(section)}" data-item="${escapeAttr(item.id)}" data-field="url" ${renderTextStyleAttributes('meta', `item.${section}.${item.id}.url`)}>${escapeHtml(formatVisibleUrl(url, { section }))}</span>
                        ${renderTextStyleControl('meta', `item.${section}.${item.id}.url`, 'URL', 'link')}
                    </div>
                ` : ''}
                ${bullets.length ? `
                    <div class="resume-bullet-block inline-format-target">
                        <ul class="resume-bullets" data-bullet-style="${escapeAttr(state.settings.bulletStyle)}">
                            ${bullets.map((bullet, index) => `<li><span class="text-style-target" contenteditable="true" data-placeholder="Type bullet" data-edit-kind="bullet" data-section="${escapeAttr(section)}" data-item="${escapeAttr(item.id)}" data-index="${index}" ${renderTextStyleAttributes('body', `bullet.${section}.${item.id}.all`)}>${escapeHtml(bullet)}</span></li>`).join('')}
                        </ul>
                        ${renderTextStyleControl('body', `bullet.${section}.${item.id}.all`, 'Bullets', 'pilcrow')}
                    </div>
                ` : ''}
            </article>
        `;
    }

    function handleEditorInput(target) {
        if (target.matches('[data-setting]')) {
            state.settings[target.dataset.setting] = readInputValue(target);
            saveState();
            syncControls();
            renderPreview();
            return;
        }

        if (target.matches('[data-personal-field]')) {
            state.personal[target.dataset.personalField] = target.value;
        } else if (target.matches('[data-section-title]')) {
            state.sections[target.dataset.sectionTitle].title = target.value;
        } else if (target.matches('[data-section-enabled]')) {
            state.sections[target.dataset.sectionEnabled].enabled = target.checked;
        } else if (target.matches('[data-section-body]')) {
            const section = state.sections[target.dataset.sectionBody];
            if (section) {
                const value = target.matches('[data-wizard-rich]') ? sanitizeRichHtml(target.innerHTML) : plainTextToRichHtml(target.value);
                section.body = value;
                if (normalizeInlineText(richHtmlToPlainText(value))) section.enabled = true;
            }
        } else if (target.matches('[data-item-field]')) {
            const item = findItem(target.dataset.section, target.dataset.item);
            if (item) {
                const section = state.sections[target.dataset.section];
                if (target.dataset.itemField === 'bullets') {
                    item.bullets = linesToArray(target.value);
                    item.body = itemToBodyHtml(item, target.dataset.section);
                } else if (target.dataset.itemField === 'body') {
                    item.body = target.matches('[data-wizard-rich]') ? sanitizeRichHtml(target.innerHTML) : plainTextToRichHtml(target.value);
                } else {
                    item[target.dataset.itemField] = target.value;
                }
                const changedValue = target.matches('[data-wizard-rich]') ? richHtmlToPlainText(target.innerHTML) : target.value;
                if (section && normalizeInlineText(changedValue)) section.enabled = true;
            }
        } else if (target.matches('[data-skill-item]')) {
            const group = findSkillGroup(target.dataset.skillGroup);
            if (group) {
                const index = Math.max(0, Number(target.dataset.skillIndex) || 0);
                group.skills = Array.isArray(group.skills) ? group.skills : [];
                while (group.skills.length <= index) group.skills.push('');
                group.skills[index] = target.value;
                if (state.sections.skills && normalizeInlineText(target.value)) state.sections.skills.enabled = true;
            }
        } else if (target.matches('[data-skill-draft]')) {
            return;
        } else if (target.matches('[data-skill-group]')) {
            const group = findSkillGroup(target.dataset.skillGroup);
            if (group) {
                if (target.dataset.skillField === 'skills') {
                    group.skills = String(target.value || '')
                        .split(/[,\n]/)
                        .map(part => part.trim())
                        .filter(Boolean);
                } else {
                    group[target.dataset.skillField] = target.value;
                }
                if (state.sections.skills && normalizeInlineText(target.value)) state.sections.skills.enabled = true;
            }
        } else {
            return;
        }

        saveState();
        renderPreview();
    }

    function readInputValue(input) {
        if (input.type === 'checkbox') {
            return input.checked;
        }

        const numericSettings = new Set([
            'fontSize',
            'lineHeight',
            'pagePaddingX',
            'pagePaddingY',
            'headerLineHeight',
            'headerPadding',
            'headerSeparatorWeight',
            'headerContactGap',
            'sectionHeadingLineHeight',
            'sectionSeparatorWeight',
            'skillsColumns',
            'nameSize',
            'titleSize',
            'titleLineHeight',
            'sectionHeadingSize',
            'itemHeadingSize',
            'dateSize',
            'metaSize',
            'contactSize',
            'skillHeadingSize',
            'skillBodySize'
        ]);

        if (input.type === 'range' || input.type === 'number' || numericSettings.has(input.dataset.setting)) {
            return Number(input.value);
        }

        return input.value;
    }

    function handleEditorAction(button) {
        const action = button.dataset.action;
        const sectionId = button.dataset.section;
        const section = state.sections[sectionId];

        if (action === 'move-section-up' || action === 'move-section-down') {
            const index = state.sectionOrder.indexOf(sectionId);
            const offset = action === 'move-section-up' ? -1 : 1;
            const nextIndex = index + offset;
            if (index >= 0 && nextIndex >= 0 && nextIndex < state.sectionOrder.length) {
                const [moved] = state.sectionOrder.splice(index, 1);
                state.sectionOrder.splice(nextIndex, 0, moved);
            }
        }

        if (action === 'add-item' && section) {
            addManualItem(section);
        }

        if (action === 'columns-set' && section) {
            setSectionColumns(sectionId, button.dataset.columns);
        }

        if ((action === 'columns-up' || action === 'columns-down') && section) {
            changeSectionColumns(sectionId, action === 'columns-up' ? 1 : -1);
        }

        if (action === 'remove-item') {
            removeItem(button.dataset.section, button.dataset.item);
        }

        if (action === 'add-skill-column' || action === 'add-skill-group') {
            state.sections.skills.enabled = true;
            state.sections.skills.groups.push({
                id: uniqueId('skills'),
                sourceId: '',
                name: 'New Skills',
                skills: ['Skill one', 'Skill two']
            });
        }

        if (action === 'remove-skill-group') {
            const groups = state.sections.skills.groups || [];
            state.sections.skills.groups = groups.filter(group => group.id !== button.dataset.group);
        }

        if (action === 'reduce-skill-columns') {
            state.settings.skillsColumns = Math.max(1, state.settings.skillsColumns - 1);
            state.sections.skills.columns = state.settings.skillsColumns;
        }

        if (action === 'increase-skill-columns') {
            state.settings.skillsColumns = Math.min(4, state.settings.skillsColumns + 1);
            state.sections.skills.columns = state.settings.skillsColumns;
        }

        saveState();
        renderAll();
    }

    function handlePreviewAction(button) {
        const action = button.dataset.previewAction;
        const sectionId = button.dataset.section;
        const section = state.sections[sectionId];
        if (!section) return;

        if (action === 'add-after-section') {
            activeAddAnchor = sectionId;
            pageAddMenuOpen = true;
            renderPreview();
            return;
        }

        if (action === 'remove-section') {
            section.enabled = false;
            pageAddMenuOpen = false;
            showToast(`Removed ${section.title}`);
        }

        if (action === 'columns-set') {
            setSectionColumns(sectionId, button.dataset.columns);
        }

        if (action === 'columns-up' || action === 'columns-down') {
            changeSectionColumns(sectionId, action === 'columns-up' ? 1 : -1);
        }

        saveState();
        renderAll();
    }

    function handleRichTextCommand(button) {
        const block = button.closest('.resume-rich-block');
        const editable = block ? block.querySelector('[data-edit-kind][contenteditable="true"]') : null;
        if (!editable) return;

        editable.focus({ preventScroll: true });
        const command = button.dataset.richCommand;
        if (command === 'createLink') {
            const currentText = normalizeInlineText(window.getSelection() ? window.getSelection().toString() : '');
            const url = window.prompt('Link URL', /^https?:\/\//i.test(currentText) ? currentText : 'https://');
            if (!url) return;
            document.execCommand('createLink', false, url);
        } else {
            document.execCommand(command, false, null);
        }

        updateStateFromPreviewElement(editable);
        saveState();
    }

    function moveSection(sectionId, offset) {
        const index = state.sectionOrder.indexOf(sectionId);
        const nextIndex = index + offset;
        if (index < 0 || nextIndex < 0 || nextIndex >= state.sectionOrder.length) return;
        const [moved] = state.sectionOrder.splice(index, 1);
        state.sectionOrder.splice(nextIndex, 0, moved);
    }

    function changeSectionColumns(sectionId, offset) {
        if (templateControlsSectionColumns()) {
            showToast('Columns are controlled by the template');
            return;
        }
        const section = state.sections[sectionId];
        if (!section) return;
        setSectionColumns(sectionId, getSectionColumns(section) + offset);
    }

    function setSectionColumns(sectionId, value) {
        if (templateControlsSectionColumns()) {
            showToast('Columns are controlled by the template');
            return;
        }
        const section = state.sections[sectionId];
        if (!section) return;
        const nextColumns = Math.max(1, Math.min(4, Number(value) || 1));
        section.columns = nextColumns;
        if (section.type === 'skills') {
            state.settings.skillsColumns = nextColumns;
            ensureSectionHasEditableSlots(section, nextColumns);
        }
        showToast(`${section.title} uses ${nextColumns} ${nextColumns === 1 ? 'column' : 'columns'}`);
    }

    function getSectionColumns(section, options = {}) {
        if (!section) return 1;
        const templateColumns = getTemplateSectionColumns(section, options);
        if (templateColumns) return templateColumns;
        const fallback = section.type === 'skills' ? state.settings.skillsColumns : 1;
        return Math.max(1, Math.min(4, Number(section.columns || fallback || 1)));
    }

    function getTemplateSectionColumns(section, options = {}) {
        const preset = getActiveTemplatePreset();
        const rule = preset && preset.design && preset.design.sectionColumns;
        if (!rule || !section) return 0;
        if (section.type === 'summary') return 1;

        const threshold = Math.max(1, Number(rule.threshold || 2));
        const maxColumns = Math.max(1, Math.min(4, Number(rule.max || 1)));
        const contentCount = Number.isFinite(Number(options.contentCount))
            ? Number(options.contentCount)
            : getSectionColumnContentCount(section);

        if (rule.mode === 'auto-by-content') {
            return contentCount >= threshold ? Math.min(maxColumns, contentCount) : 1;
        }

        if (rule.mode === 'fixed') return maxColumns;
        return 0;
    }

    function getSectionColumnContentCount(section) {
        if (!section) return 0;
        if (section.type === 'summary') return richHtmlToPlainText(getSummaryBody(section)).trim() ? 1 : 0;
        if (section.type === 'skills') {
            return (section.groups || [])
                .filter(group => group && (normalizeInlineText(group.name) || (group.skills || []).some(skill => normalizeInlineText(skill))))
                .length;
        }
        return (section.items || []).filter(item => hasMeaningfulItemContent(section.type, item)).length;
    }

    function getActiveTemplatePreset(targetState = state) {
        const presetId = targetState && targetState.templatePreset;
        return TEMPLATE_PRESETS.find(preset => preset.id === presetId) || TEMPLATE_PRESETS[0] || null;
    }

    function templateControlsSectionColumns(targetState = state) {
        const preset = getActiveTemplatePreset(targetState);
        return Boolean(preset && preset.design && preset.design.sectionColumns);
    }

    function ensureSectionHasEditableSlots(section, targetColumns) {
        if (!section) return;
        section.enabled = true;

        if (section.type === 'skills') {
            section.groups = section.groups || [];
            while (section.groups.length < targetColumns) {
                section.groups.push({
                    id: uniqueId('skills'),
                    sourceId: '',
                    name: `Column ${section.groups.length + 1}`,
                    skills: []
                });
            }
            return;
        }

        section.items = section.items || [];
    }

    function reorderSectionBefore(sectionId, targetSectionId) {
        if (!sectionId || !targetSectionId || sectionId === targetSectionId) return;
        const currentIndex = state.sectionOrder.indexOf(sectionId);
        const targetIndex = state.sectionOrder.indexOf(targetSectionId);
        if (currentIndex < 0 || targetIndex < 0) return;
        const [moved] = state.sectionOrder.splice(currentIndex, 1);
        const adjustedTargetIndex = state.sectionOrder.indexOf(targetSectionId);
        state.sectionOrder.splice(adjustedTargetIndex, 0, moved);
    }

    function reorderEntryBefore(payload, targetSectionId, targetItemId) {
        const [sourceSectionId, sourceItemId] = String(payload || '').split(':');
        if (!sourceSectionId || !sourceItemId || !targetSectionId || !targetItemId) return;
        if (sourceSectionId !== targetSectionId) return;

        const sourceSection = state.sections[sourceSectionId];
        const targetSection = state.sections[targetSectionId];
        if (!sourceSection || !targetSection || !Array.isArray(sourceSection.items) || !Array.isArray(targetSection.items)) return;

        const sourceIndex = sourceSection.items.findIndex(item => item.id === sourceItemId);
        const targetIndex = targetSection.items.findIndex(item => item.id === targetItemId);
        if (sourceIndex < 0 || targetIndex < 0) return;

        const [moved] = sourceSection.items.splice(sourceIndex, 1);
        const adjustedTargetIndex = sourceSectionId === targetSectionId
            ? targetSection.items.findIndex(item => item.id === targetItemId)
            : targetIndex;
        targetSection.items.splice(Math.max(0, adjustedTargetIndex), 0, moved);
        targetSection.enabled = true;
    }

    function placeSectionAfterAnchor(sectionId, anchor) {
        if (!sectionId || !state.sectionOrder.includes(sectionId) || anchor === sectionId) return;
        const [moved] = state.sectionOrder.splice(state.sectionOrder.indexOf(sectionId), 1);
        let insertIndex = 0;
        if (anchor && anchor !== 'start' && anchor !== 'start-side') {
            const anchorIndex = state.sectionOrder.indexOf(anchor);
            insertIndex = anchorIndex >= 0 ? anchorIndex + 1 : state.sectionOrder.length;
        }
        state.sectionOrder.splice(insertIndex, 0, moved);
    }

    function handlePreviewEdit(element, options = {}) {
        const shouldRender = options.render !== false;
        updateStateFromPreviewElement(element);
        saveState();

        if (shouldRender) {
            renderAll();
        } else {
            renderPreview();
        }
    }

    function updateStateFromPreviewElement(element) {
        const kind = element.dataset.editKind;
        if (kind === 'rich') {
            const item = findItem(element.dataset.section, element.dataset.item);
            if (item) item.body = sanitizeRichHtml(element.innerHTML);
            return;
        }

        if (kind === 'section-body') {
            const section = state.sections[element.dataset.section];
            if (section) section.body = sanitizeRichHtml(element.innerHTML);
            return;
        }

        const text = kind === 'bullet'
            ? normalizeBulletText(element.textContent)
            : normalizeInlineText(element.textContent);

        if (kind === 'personal') {
            state.personal[element.dataset.field] = text;
        } else if (kind === 'contact') {
            const targetKey = element.dataset.contactKey;
            if (targetKey) state.personal[targetKey] = text;
        } else if (kind === 'section-title') {
            state.sections[element.dataset.section].title = text;
        } else if (kind === 'item') {
            const item = findItem(element.dataset.section, element.dataset.item);
            if (item) item[element.dataset.field] = text;
        } else if (kind === 'bullet') {
            const item = findItem(element.dataset.section, element.dataset.item);
            if (item && item.bullets) item.bullets[Number(element.dataset.index)] = text;
        } else if (kind === 'skill') {
            const group = findSkillGroup(element.dataset.group);
            if (group) {
                if (element.dataset.field === 'skills') {
                    group.skills = text.split(',').map(part => part.trim()).filter(Boolean);
                } else {
                    group[element.dataset.field] = text;
                }
            }
        }
    }

    function handlePreviewEditorKeydown(event, element) {
        if (event.key === 'Escape') {
            event.preventDefault();
            element.blur();
            return;
        }

        if (isRichTextEditable(element)) {
            return;
        }

        if (event.key === 'Enter') {
            if (event.shiftKey && isLongFormEditable(element)) {
                return;
            }

            event.preventDefault();

            if (element.dataset.editKind === 'bullet') {
                insertBulletAfter(element);
                return;
            }

            if (isSummaryParagraph(element)) {
                insertSummaryParagraphAfter(element);
                return;
            }

            updateStateFromPreviewElement(element);
            saveState();
            focusAdjacentEditable(element, event.shiftKey ? -1 : 1);
            return;
        }

        if (event.key === 'Backspace' && isEditableEmpty(element)) {
            if (element.dataset.editKind === 'bullet' && removeBulletFromPreview(element)) {
                event.preventDefault();
                return;
            }

            if (isSummaryParagraph(element) && removeSummaryParagraphFromPreview(element)) {
                event.preventDefault();
            }
        }
    }

    function handlePreviewPaste(event, element) {
        const clipboardText = event.clipboardData ? event.clipboardData.getData('text/plain') : '';
        if (!clipboardText) return;

        if (isRichTextEditable(element)) {
            event.preventDefault();
            insertTextAtSelection(clipboardText);
            updateStateFromPreviewElement(element);
            localStorage.setItem(getStorageKey(builderMode), serializeState());
            updateSyntaxTextarea();
            updateJsonResumePrompt();
            return;
        }

        const normalizedLines = clipboardText
            .split(/\r?\n/)
            .map(line => line.trim())
            .filter(Boolean);

        if (normalizedLines.length > 1 && element.dataset.editKind === 'bullet') {
            event.preventDefault();
            replaceBulletWithLines(element, normalizedLines);
            return;
        }

        if (normalizedLines.length > 1 && isSummaryParagraph(element)) {
            event.preventDefault();
            replaceSummaryWithParagraphs(element, normalizedLines);
            return;
        }

        event.preventDefault();
        insertPlainTextAtSelection(clipboardText);
        updateStateFromPreviewElement(element);
        localStorage.setItem(getStorageKey(builderMode), serializeState());
        updateSyntaxTextarea();
        updateJsonResumePrompt();
    }

    function insertBulletAfter(element) {
        updateStateFromPreviewElement(element);
        const item = findItem(element.dataset.section, element.dataset.item);
        if (!item || !Array.isArray(item.bullets)) return;
        const index = Number(element.dataset.index);
        const nextIndex = Number.isFinite(index) ? index + 1 : item.bullets.length;
        item.bullets.splice(nextIndex, 0, '');
        saveState();
        renderPreview();
        focusPreviewEditable(`[data-edit-kind="bullet"][data-section="${cssEscape(element.dataset.section)}"][data-item="${cssEscape(element.dataset.item)}"][data-index="${nextIndex}"]`);
    }

    function removeBulletFromPreview(element) {
        const item = findItem(element.dataset.section, element.dataset.item);
        if (!item || !Array.isArray(item.bullets) || item.bullets.length <= 1) return false;
        const index = Number(element.dataset.index);
        if (!Number.isFinite(index)) return false;
        item.bullets.splice(index, 1);
        saveState();
        renderPreview();
        const nextIndex = Math.max(0, index - 1);
        focusPreviewEditable(`[data-edit-kind="bullet"][data-section="${cssEscape(element.dataset.section)}"][data-item="${cssEscape(element.dataset.item)}"][data-index="${nextIndex}"]`, { atEnd: true });
        return true;
    }

    function replaceBulletWithLines(element, lines) {
        const item = findItem(element.dataset.section, element.dataset.item);
        if (!item || !Array.isArray(item.bullets)) return;
        const index = Number(element.dataset.index);
        if (!Number.isFinite(index)) return;
        const bullets = lines.map(normalizeBulletText).filter(Boolean);
        if (!bullets.length) return;
        item.bullets.splice(index, 1, ...bullets);
        saveState();
        renderPreview();
        focusPreviewEditable(`[data-edit-kind="bullet"][data-section="${cssEscape(element.dataset.section)}"][data-item="${cssEscape(element.dataset.item)}"][data-index="${index + bullets.length - 1}"]`, { atEnd: true });
    }

    function insertSummaryParagraphAfter(element) {
        updateStateFromPreviewElement(element);
        const section = state.sections.summary;
        if (!section || !Array.isArray(section.items)) return;
        const index = section.items.findIndex(item => item.id === element.dataset.item);
        const nextIndex = index >= 0 ? index + 1 : section.items.length;
        const paragraph = { id: uniqueId('summary'), sourceId: '', text: '' };
        section.items.splice(nextIndex, 0, paragraph);
        saveState();
        renderPreview();
        focusPreviewEditable(`[data-edit-kind="item"][data-section="summary"][data-item="${cssEscape(paragraph.id)}"][data-field="text"]`);
    }

    function removeSummaryParagraphFromPreview(element) {
        const section = state.sections.summary;
        if (!section || !Array.isArray(section.items) || section.items.length <= 1) return false;
        const index = section.items.findIndex(item => item.id === element.dataset.item);
        if (index < 0) return false;
        section.items.splice(index, 1);
        saveState();
        renderPreview();
        const previous = section.items[Math.max(0, index - 1)];
        if (previous) {
            focusPreviewEditable(`[data-edit-kind="item"][data-section="summary"][data-item="${cssEscape(previous.id)}"][data-field="text"]`, { atEnd: true });
        }
        return true;
    }

    function replaceSummaryWithParagraphs(element, lines) {
        const section = state.sections.summary;
        if (!section || !Array.isArray(section.items)) return;
        const index = section.items.findIndex(item => item.id === element.dataset.item);
        if (index < 0) return;
        const paragraphs = lines.map(line => normalizeInlineText(line)).filter(Boolean);
        if (!paragraphs.length) return;
        const nextItems = paragraphs.map((text, offset) => ({
            id: offset === 0 ? element.dataset.item : uniqueId('summary'),
            sourceId: '',
            text
        }));
        section.items.splice(index, 1, ...nextItems);
        saveState();
        renderPreview();
        const target = nextItems[nextItems.length - 1];
        focusPreviewEditable(`[data-edit-kind="item"][data-section="summary"][data-item="${cssEscape(target.id)}"][data-field="text"]`, { atEnd: true });
    }

    function focusAdjacentEditable(element, direction) {
        const editables = Array.from(elements.resumePreview.querySelectorAll('[data-edit-kind][contenteditable="true"]'));
        const index = editables.indexOf(element);
        const next = editables[index + direction];
        if (!next) {
            element.blur();
            return;
        }
        next.focus();
        placeCaretAtEnd(next);
    }

    function focusPreviewEditable(selector, options = {}) {
        const target = elements.resumePreview.querySelector(selector);
        if (!target) return;
        target.focus();
        if (options.atEnd !== false) {
            placeCaretAtEnd(target);
        }
        setActiveTextStyleTarget(target);
    }

    function placeCaretAtEnd(element) {
        const range = document.createRange();
        const selection = window.getSelection();
        range.selectNodeContents(element);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
    }

    function insertPlainTextAtSelection(text) {
        const selection = window.getSelection();
        if (!selection || !selection.rangeCount) return;
        const range = selection.getRangeAt(0);
        range.deleteContents();
        const textNode = document.createTextNode(text.replace(/\s+/g, ' '));
        range.insertNode(textNode);
        range.setStartAfter(textNode);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
    }

    function insertTextAtSelection(text) {
        if (document.queryCommandSupported && document.queryCommandSupported('insertText')) {
            document.execCommand('insertText', false, text);
            return;
        }

        const selection = window.getSelection();
        if (!selection || !selection.rangeCount) return;
        const range = selection.getRangeAt(0);
        range.deleteContents();
        const textNode = document.createTextNode(text);
        range.insertNode(textNode);
        range.setStartAfter(textNode);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
    }

    function isSummaryParagraph(element) {
        return element.dataset.editKind === 'item' && element.dataset.section === 'summary' && element.dataset.field === 'text';
    }

    function isRichTextEditable(element) {
        return ['rich', 'section-body'].includes(element.dataset.editKind || '');
    }

    function isLongFormEditable(element) {
        return isSummaryParagraph(element) || ['details'].includes(element.dataset.field || '');
    }

    function isEditableEmpty(element) {
        return normalizeInlineText(element.textContent).length === 0;
    }

    function cssEscape(value) {
        if (window.CSS && typeof window.CSS.escape === 'function') {
            return window.CSS.escape(String(value || ''));
        }

        return String(value || '').replace(/["\\]/g, '\\$&');
    }

    function addManualItem(section) {
        section.enabled = true;

        if (section.type === 'summary') {
            section.body = appendRichParagraph(getSummaryBody(section), 'Add a focused professional summary paragraph.');
        } else if (section.type === 'experience') {
            const item = {
                id: uniqueId('experience'),
                sourceId: '',
                role: 'Role title',
                organization: 'Company',
                date: '2026',
                status: '',
                url: '',
                bullets: ['Built and shipped a measurable product outcome.']
            };
            item.body = itemToBodyHtml(item, section.type);
            section.items.push(item);
        } else if (section.type === 'projects') {
            const item = {
                id: uniqueId('projects'),
                sourceId: '',
                name: 'Project name',
                date: '',
                status: '',
                url: '',
                bullets: ['Built a relevant project with clear scope and tools.']
            };
            item.body = itemToBodyHtml(item, section.type);
            section.items.push(item);
        } else if (section.type === 'education') {
            const item = {
                id: uniqueId('education'),
                sourceId: '',
                degree: 'Degree',
                organization: 'Institution',
                date: 'Year',
                status: '',
                url: '',
                details: 'Relevant coursework or focus.'
            };
            item.body = itemToBodyHtml(item, section.type);
            section.items.push(item);
        } else if (section.type === 'research') {
            const item = {
                id: uniqueId('research'),
                sourceId: '',
                title: 'Research title',
                organization: 'Publication',
                date: 'Year',
                status: '',
                url: '',
                details: 'Short research summary.'
            };
            item.body = itemToBodyHtml(item, section.type);
            section.items.push(item);
        } else if (section.type === 'certifications') {
            const item = {
                id: uniqueId('certifications'),
                sourceId: '',
                name: 'Certification',
                issuer: 'Issuer',
                date: 'Year',
                status: '',
                url: '',
                credentialId: ''
            };
            item.body = itemToBodyHtml(item, section.type);
            section.items.push(item);
        } else if (section.type === 'skills') {
            section.groups.push({ id: uniqueId('skills'), sourceId: '', name: 'New Skills', skills: ['Skill one'] });
        } else {
            const item = {
                id: uniqueId(section.type || section.id || 'section'),
                sourceId: '',
                name: 'Entry title',
                date: '',
                status: '',
                url: '',
                body: '<p>Add details here.</p>'
            };
            section.items = section.items || [];
            section.items.push(item);
        }
    }

    function removeItem(sectionId, itemId) {
        const section = state.sections[sectionId];
        if (!section || !section.items) return;
        section.items = section.items.filter(item => item.id !== itemId);
    }

    function findItem(sectionId, itemId) {
        const section = state.sections[sectionId];
        return section && section.items ? section.items.find(item => item.id === itemId) : null;
    }

    function findSkillGroup(groupId) {
        return (state.sections.skills.groups || []).find(group => group.id === groupId);
    }

    function mapExperience(item, sourceId) {
        const mapped = {
            id: uniqueId('experience'),
            sourceId,
            role: item.role || '',
            organization: item.company || '',
            date: item.date || item.year || '',
            status: item.status || '',
            url: item.companyUrl || '',
            bullets: Array.isArray(item.bullets) && item.bullets.length
                ? item.bullets.slice()
                : descriptionToBullets(item.description || '')
        };
        mapped.body = itemToBodyHtml(mapped, 'experience');
        return mapped;
    }

    function mapProject(item, sourceId) {
        const bullets = Array.isArray(item.bullets) && item.bullets.length
            ? item.bullets.slice()
            : [item.description];
        if (item.tags && item.tags.length) {
            bullets.push(`Tools: ${item.tags.join(', ')}`);
        }
        const mapped = {
            id: uniqueId('projects'),
            sourceId,
            name: item.name || '',
            date: item.date || item.year || '',
            status: item.status || '',
            url: item.url || '',
            bullets: bullets.filter(Boolean)
        };
        mapped.body = itemToBodyHtml(mapped, 'projects');
        return mapped;
    }

    function mapSkillGroup(name, skills, sourceId) {
        return {
            id: uniqueId('skills'),
            sourceId,
            name: titleCase(name),
            skills: Array.isArray(skills) ? skills.slice() : []
        };
    }

    function mapEducation(item, sourceId) {
        const mapped = {
            id: uniqueId('education'),
            sourceId,
            degree: item.degree || '',
            organization: item.institution || '',
            date: item.date || item.year || '',
            status: item.status || '',
            url: item.institutionUrl || '',
            details: item.description || ''
        };
        mapped.body = itemToBodyHtml(mapped, 'education');
        return mapped;
    }

    function mapResearch(item, sourceId) {
        const mapped = {
            id: uniqueId('research'),
            sourceId,
            title: item.title || '',
            organization: item.publication || item.institution || '',
            date: item.year || '',
            status: item.status || item.role || '',
            url: item.url || '',
            details: item.description || ''
        };
        mapped.body = itemToBodyHtml(mapped, 'research');
        return mapped;
    }

    function mapCertification(item, sourceId) {
        const mapped = {
            id: uniqueId('certifications'),
            sourceId,
            name: item.name || '',
            issuer: item.issuer || item.organization || '',
            date: item.date || '',
            status: item.status || '',
            url: item.url || '',
            credentialId: item.credentialId || item.credentialID || item.idNumber || ''
        };
        mapped.body = itemToBodyHtml(mapped, 'certifications');
        return mapped;
    }

    function descriptionToBullets(text) {
        return String(text || '')
            .split(/(?<=\.)\s+/)
            .map(sentence => sentence.trim())
            .filter(Boolean)
            .map(sentence => sentence.endsWith('.') ? sentence : `${sentence}.`);
    }

    function linesToArray(value) {
        return String(value || '')
            .split(/\n|;/)
            .map(item => item.trim().replace(/^[-*\u2022\u25aa\u25e6\u2023]\s*/, ''))
            .filter(Boolean);
    }

    function hasResumeSection(dataTransfer) {
        return Boolean(dataTransfer && Array.from(dataTransfer.types || []).includes('text/resume-section'));
    }

    function hasResumeEntry(dataTransfer) {
        return Boolean(dataTransfer && Array.from(dataTransfer.types || []).includes('text/resume-entry'));
    }

    function applyPreviewZoom() {
        const paper = elements.resumePreview.querySelector('.resume-paper');
        const effectiveZoom = getEffectivePreviewZoom(paper);
        elements.resumePreview.style.transform = `scale(${effectiveZoom})`;
        if (paper) {
            updatePreviewPageGuides();
            elements.resumePreview.style.width = `${paper.offsetWidth * effectiveZoom}px`;
            elements.resumePreview.style.height = `${paper.offsetHeight * effectiveZoom}px`;
        }
    }

    function getEffectivePreviewZoom(paper = null) {
        if (!window.matchMedia('(max-width: 720px)').matches) return previewZoom;

        const stageWidth = elements.paperStage?.clientWidth || window.innerWidth;
        const paperWidth = paper?.offsetWidth || 794;
        const fitZoom = Math.max(0.36, Math.min(1, (stageWidth - 16) / paperWidth));
        return Math.min(previewZoom, fitZoom);
    }

    function nextFrame() {
        return new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    }

    function loadState(mode = builderMode) {
        try {
            const raw = localStorage.getItem(getStorageKey(mode)) || (mode === 'ahmad' ? localStorage.getItem(STORAGE_KEY) : '');
            if (!raw) return loadStateFromResumeJsonDraft(mode);
            const parsed = JSON.parse(raw);
            return normalizeState(parsed, mode);
        } catch (error) {
            console.warn('Resume state load failed:', error);
            return loadStateFromResumeJsonDraft(mode);
        }
    }

    function loadStateFromResumeJsonDraft(mode = builderMode) {
        try {
            const savedJson = localStorage.getItem(getResumeJsonStorageKey(mode));
            if (!savedJson) return null;
            return mergeResumeSyntaxIntoState(createStateForMode(mode), parseResumeSyntax(savedJson));
        } catch (error) {
            console.warn('Resume JSON draft load failed:', error);
            return null;
        }
    }

    function normalizeState(value, mode = builderMode) {
        const fresh = createStateForMode(mode);
        const safeValue = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
        const savedSections = safeValue.sections && typeof safeValue.sections === 'object' && !Array.isArray(safeValue.sections)
            ? safeValue.sections
            : {};
        const savedSettings = {
            ...(safeValue.theme && typeof safeValue.theme === 'object' && !Array.isArray(safeValue.theme) ? safeValue.theme : {}),
            ...(safeValue.design && typeof safeValue.design === 'object' && !Array.isArray(safeValue.design) ? safeValue.design : {}),
            ...(safeValue.settings && typeof safeValue.settings === 'object' && !Array.isArray(safeValue.settings) ? safeValue.settings : {})
        };
        const settings = { ...fresh.settings, ...savedSettings };
        settings.fontName = savedSettings.fontName || savedSettings.fontTitle || fresh.settings.fontName;
        settings.fontSectionHeading = savedSettings.fontSectionHeading || savedSettings.fontHeading || fresh.settings.fontSectionHeading;
        settings.fontItemHeading = savedSettings.fontItemHeading || savedSettings.fontHeading || fresh.settings.fontItemHeading;
        settings.fontContact = savedSettings.fontContact || savedSettings.fontBody || fresh.settings.fontContact;
        settings.fontMeta = savedSettings.fontMeta || savedSettings.fontHeading || fresh.settings.fontMeta;
        const unifiedResumeFont = normalizeDefaultResumeFont(settings.fontFamily || settings.fontBody || fresh.settings.fontBody);
        settings.fontFamily = unifiedResumeFont;
        settings.fontName = unifiedResumeFont;
        settings.fontTitle = unifiedResumeFont;
        settings.fontHeading = unifiedResumeFont;
        settings.fontSectionHeading = unifiedResumeFont;
        settings.fontItemHeading = unifiedResumeFont;
        settings.fontBody = unifiedResumeFont;
        settings.fontContact = unifiedResumeFont;
        settings.fontMeta = unifiedResumeFont;
        settings.contactLayout = ['stacked', 'horizontal'].includes(settings.contactLayout) ? settings.contactLayout : fresh.settings.contactLayout;
        settings.profilePhotoShape = ['circle', 'rounded-square', 'square'].includes(settings.profilePhotoShape) ? settings.profilePhotoShape : fresh.settings.profilePhotoShape;
        settings.profilePhotoPlacement = ['left', 'right', 'top'].includes(settings.profilePhotoPlacement) ? settings.profilePhotoPlacement : fresh.settings.profilePhotoPlacement;
        settings.fontSize = clampNumber(settings.fontSize, 9.5, 12.5, fresh.settings.fontSize);
        settings.lineHeight = clampNumber(settings.lineHeight, 1.28, 1.6, fresh.settings.lineHeight);
        settings.metaSize = clampNumber(settings.metaSize, 8.8, 11, fresh.settings.metaSize);
        settings.skillBodySize = clampNumber(settings.skillBodySize, 8.8, 11, fresh.settings.skillBodySize);
        settings.sectionHeadingLineHeight = clampNumber(settings.sectionHeadingLineHeight, 1.05, 1.5, fresh.settings.sectionHeadingLineHeight);
        const knownSectionIds = new Set([...Object.keys(fresh.sections), ...Object.keys(savedSections)]);
        const sectionOrder = Array.isArray(safeValue.sectionOrder)
            ? safeValue.sectionOrder.map(String).filter(id => knownSectionIds.has(id))
            : fresh.sectionOrder.slice();
        Object.keys(savedSections).forEach(sectionId => {
            if (!sectionOrder.includes(sectionId)) sectionOrder.push(sectionId);
        });
        const normalized = {
            ...fresh,
            ...safeValue,
            settings,
            layout: normalizeLayout(safeValue.layout || fresh.layout),
            styleClasses: normalizeStyleClasses(safeValue.styleClasses || fresh.styleClasses),
            personal: { ...fresh.personal, ...(safeValue.personal || {}) },
            sections: { ...fresh.sections, ...savedSections },
            sectionOrder: sectionOrder.length ? sectionOrder : fresh.sectionOrder,
            textStyles: normalizeTextStyleOverrides(safeValue.textStyles)
        };
        normalized.templatePreset = TEMPLATE_PRESETS.some(preset => preset.id === normalized.templatePreset)
            ? normalized.templatePreset
            : fresh.templatePreset;
        const activePreset = TEMPLATE_PRESETS.find(preset => preset.id === normalized.templatePreset) || TEMPLATE_PRESETS[0];
        if (activePreset) {
            normalized.template = activePreset.template || fresh.template;
            if (safeValue.templatePreset !== activePreset.id) {
                normalized.layout = normalizeLayout(activePreset.layout || DEFAULT_LAYOUT);
                normalized.styleClasses = normalizeStyleClasses(activePreset.styleClasses || DEFAULT_STYLE_CLASSES);
                normalized.settings = {
                    ...normalized.settings,
                    ...ATS_BASE_SETTINGS,
                    ...(activePreset.settings || {})
                };
            }
            if (activePreset.suppressProfilePhoto) {
                normalized.settings.showProfilePhoto = false;
            }
        }
        normalized.personal.profileImage = String(normalized.personal.profileImage || '').trim();
        normalized.settings.showProfilePhoto = Boolean(normalized.settings.showProfilePhoto && normalized.personal.profileImage);
        normalizeResumeContentShape(normalized);
        return normalized;
    }

    function normalizeDefaultResumeFont(value) {
        const font = String(value || '').trim();
        const normalized = font.replace(/["']/g, '').replace(/\s+/g, ' ').toLowerCase();
        const legacyBasicFonts = new Set([
            'arial, helvetica, sans-serif',
            'helvetica, arial, sans-serif',
            'arial'
        ]);
        return legacyBasicFonts.has(normalized) ? DEFAULT_RESUME_FONT : (font || DEFAULT_RESUME_FONT);
    }

    function normalizeResumeContentShape(targetState) {
        if (!targetState.sections || typeof targetState.sections !== 'object') {
            targetState.sections = {};
        }

        Object.entries(targetState.sections).forEach(([sectionId, section]) => {
            if (!section || typeof section !== 'object' || Array.isArray(section)) {
                targetState.sections[sectionId] = {
                    id: sectionId,
                    type: sectionId,
                    title: titleCase(sectionId),
                    enabled: false,
                    columns: 1,
                    items: []
                };
                section = targetState.sections[sectionId];
            }

            section.id = section.id || sectionId;
            section.type = section.type || sectionId;
            section.title = section.title || titleCase(section.id);
            section.enabled = section.enabled !== false;
            section.placement = normalizePlacement(section.placement || 'auto');
            section.layout = normalizeSectionLayout(section.layout);
            section.columns = getNormalizedColumns(section, targetState.settings);
            section.className = normalizeClassName(section.className || '');
            section.headerClassName = normalizeClassName(section.headerClassName || '');
            section.style = normalizeStyleObject(section.style);
            section.headerStyle = normalizeStyleObject(section.headerStyle);

            if (section.type === 'summary') {
                section.body = getSummaryBody(section);
                section.items = Array.isArray(section.items) ? section.items : [];
                return;
            }

            if (section.type === 'skills') {
                section.groups = Array.isArray(section.groups) ? section.groups : [];
                section.groups = section.groups.map((group, index) => {
                    const normalizedGroup = group && typeof group === 'object' && !Array.isArray(group)
                        ? group
                        : { name: `Group ${index + 1}`, skills: linesToArray(group || '') };
                    normalizedGroup.id = normalizedGroup.id || uniqueId(`skills-${index}`);
                    normalizedGroup.sourceId = normalizedGroup.sourceId || '';
                    normalizedGroup.name = normalizedGroup.name || '';
                    normalizedGroup.skills = Array.isArray(normalizedGroup.skills)
                        ? normalizedGroup.skills.map(String).filter(Boolean)
                        : linesToArray(normalizedGroup.skills || '');
                    return normalizedGroup;
                });
                return;
            }

            section.items = Array.isArray(section.items) ? section.items : [];
            section.items = section.items.map((item, index) => {
                const normalizedItem = item && typeof item === 'object' && !Array.isArray(item)
                    ? item
                    : { name: `Entry ${index + 1}`, body: plainTextToRichHtml(item || '') };
                normalizedItem.id = normalizedItem.id || uniqueId(`${section.type}-${index}`);
                normalizedItem.sourceId = normalizedItem.sourceId || '';
                if (!Object.prototype.hasOwnProperty.call(normalizedItem, 'status')) normalizedItem.status = '';
                if (!Object.prototype.hasOwnProperty.call(normalizedItem, 'date')) normalizedItem.date = '';
                normalizedItem.placement = normalizePlacement(normalizedItem.placement || section.placement || 'auto');
                normalizedItem.className = normalizeClassName(normalizedItem.className || '');
                normalizedItem.style = normalizeStyleObject(normalizedItem.style);
                normalizedItem.body = getItemBodyHtml(section.type, normalizedItem);
                return normalizedItem;
            });
        });
    }

    function normalizeLayout(value) {
        const raw = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
        const mode = ['single', 'two-column', 'modern'].includes(String(raw.mode || '').toLowerCase())
            ? String(raw.mode).toLowerCase()
            : DEFAULT_LAYOUT.mode;
        const side = ['left', 'right'].includes(raw.side) ? raw.side : DEFAULT_LAYOUT.side;
        const sidebarSections = Array.isArray(raw.sidebarSections)
            ? raw.sidebarSections.map(String).filter(Boolean)
            : DEFAULT_LAYOUT.sidebarSections.slice();
        return {
            mode,
            columns: Math.max(1, Math.min(2, Number(raw.columns || (mode === 'single' ? 1 : 2)))),
            columnRatio: String(raw.columnRatio || DEFAULT_LAYOUT.columnRatio),
            gap: Math.max(8, Math.min(64, Number(raw.gap || DEFAULT_LAYOUT.gap))),
            side,
            sidebarSections,
            sectionFlow: ['document', 'balanced'].includes(raw.sectionFlow) ? raw.sectionFlow : DEFAULT_LAYOUT.sectionFlow
        };
    }

    function normalizePlacement(value) {
        const placement = String(value || 'auto').toLowerCase();
        return SECTION_PLACEMENTS.has(placement) ? placement : 'auto';
    }

    function normalizeSectionLayout(value) {
        const raw = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
        return {
            columns: raw.columns == null ? null : Math.max(1, Math.min(4, Number(raw.columns) || 1)),
            gap: raw.gap == null ? null : Math.max(0, Math.min(48, Number(raw.gap) || 0)),
            breakBefore: Boolean(raw.breakBefore),
            keepTogether: Boolean(raw.keepTogether)
        };
    }

    function normalizeStyleObject(value) {
        const raw = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
        const allowed = ['background', 'backgroundColor', 'color', 'borderColor', 'borderWidth', 'borderStyle', 'borderBottomColor', 'borderBottomWidth', 'borderBottomStyle', 'borderRadius', 'padding', 'marginTop', 'marginBottom', 'fontFamily', 'fontSize', 'lineHeight'];
        return Object.fromEntries(
            allowed
                .filter(key => Object.prototype.hasOwnProperty.call(raw, key) && raw[key] !== '' && raw[key] != null)
                .map(key => [key, normalizeStyleValue(key, raw[key])])
        );
    }

    function normalizeStyleValue(key, value) {
        if (key === 'fontSize') return clampNumber(value, 8.8, 13, 10);
        if (key === 'lineHeight') return clampNumber(value, 1.25, 1.75, 1.35);
        return value;
    }

    function clampNumber(value, min, max, fallback) {
        const number = Number(value);
        if (!Number.isFinite(number)) return fallback;
        return Math.max(min, Math.min(max, number));
    }

    function normalizeStyleClasses(value) {
        const raw = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
        const merged = deepClone(DEFAULT_STYLE_CLASSES);
        ['section', 'sectionHeader', 'item', 'text'].forEach(group => {
            if (!raw[group] || typeof raw[group] !== 'object' || Array.isArray(raw[group])) return;
            Object.entries(raw[group]).forEach(([className, style]) => {
                const safeClassName = normalizeClassName(className);
                if (!safeClassName) return;
                merged[group][safeClassName] = normalizeStyleObject(style);
            });
        });
        return merged;
    }

    function normalizeClassName(value) {
        return String(value || '')
            .split(/\s+/)
            .map(name => name.replace(/[^a-zA-Z0-9_-]/g, '').trim())
            .filter(Boolean)
            .join(' ');
    }

    function normalizeTextStyleOverrides(value) {
        if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
        return Object.fromEntries(
            Object.entries(value)
                .filter(([, override]) => override && typeof override === 'object' && !Array.isArray(override))
                .map(([key, override]) => {
                    const normalized = { ...override };
                    return [key, normalized];
                })
                .filter(([, override]) => Object.keys(override).length)
        );
    }

    function getNormalizedColumns(section, settings = {}) {
        const fallback = section.type === 'skills' ? settings.skillsColumns : 1;
        if (section.layout && section.layout.columns) {
            return Math.max(1, Math.min(4, Number(section.layout.columns || fallback || 1)));
        }
        return Math.max(1, Math.min(4, Number(section.columns || fallback || 1)));
    }

    function serializeState() {
        return JSON.stringify(state);
    }

    function resetHistory() {
        undoStack = [];
        redoStack = [];
        lastStateSnapshot = serializeState();
        syncUndoRedo();
    }

    function saveState(options = {}) {
        const snapshot = serializeState();
        if (options.history !== false && lastStateSnapshot && snapshot !== lastStateSnapshot) {
            undoStack.push(lastStateSnapshot);
            if (undoStack.length > 80) undoStack.shift();
            redoStack = [];
        }

        localStorage.setItem(getStorageKey(builderMode), snapshot);
        persistResumeJsonDraft();
        lastStateSnapshot = snapshot;
        syncUndoRedo();
        updateSyntaxTextarea();
        updateJsonResumePrompt();
    }

    function restoreStateSnapshot(snapshot) {
        state = normalizeState(JSON.parse(snapshot), builderMode);
        localStorage.setItem(getStorageKey(builderMode), serializeState());
        lastStateSnapshot = serializeState();
        renderAll();
        syncUndoRedo();
    }

    function undoResume() {
        if (!undoStack.length) return;
        redoStack.push(serializeState());
        const snapshot = undoStack.pop();
        restoreStateSnapshot(snapshot);
        showToast('Undid change');
    }

    function redoResume() {
        if (!redoStack.length) return;
        undoStack.push(serializeState());
        const snapshot = redoStack.pop();
        restoreStateSnapshot(snapshot);
        showToast('Redid change');
    }

    function syncUndoRedo() {
        if (elements.undoResume) elements.undoResume.disabled = !undoStack.length;
        if (elements.redoResume) elements.redoResume.disabled = !redoStack.length;
    }

    function getStorageKey(mode) {
        return `${STORAGE_KEY}.${mode === 'guest' ? 'guest' : 'ahmad'}`;
    }

    function getResumeJsonStorageKey(mode = builderMode) {
        return `${RESUME_JSON_STORAGE_KEY}.${mode === 'guest' ? 'guest' : 'ahmad'}`;
    }

    function persistResumeJsonDraft() {
        try {
            localStorage.setItem(getResumeJsonStorageKey(builderMode), formatResumeSyntax());
        } catch (error) {
            console.warn('Resume JSON draft save failed:', error);
        }
    }

    function showToast(message) {
        elements.toast.textContent = message;
        elements.toast.classList.add('visible');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => elements.toast.classList.remove('visible'), 1800);
    }

    function refreshLucideIcons() {
        if (window.lucide && typeof window.lucide.createIcons === 'function') {
            window.lucide.createIcons();
            return;
        }

        document.querySelectorAll('i[data-lucide]').forEach(icon => {
            icon.outerHTML = fallbackIcon(icon.dataset.lucide);
        });
    }

    function fallbackIcon(name) {
        const paths = {
            blocks: '<rect width="7" height="7" x="3" y="3" rx="1"></rect><rect width="7" height="7" x="14" y="3" rx="1"></rect><rect width="7" height="7" x="14" y="14" rx="1"></rect><rect width="7" height="7" x="3" y="14" rx="1"></rect>',
            text: '<path d="M17 6.1H3"></path><path d="M21 12.1H3"></path><path d="M15.1 18H3"></path>',
            briefcase: '<rect width="20" height="14" x="2" y="7" rx="2"></rect><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"></path>',
            'folder-kanban': '<path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.2a2 2 0 0 1-1.4-.6L9.6 3.6A2 2 0 0 0 8.2 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"></path><path d="M8 10v4"></path><path d="M12 10v2"></path><path d="M16 10v6"></path>',
            wrench: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.8-3.8a6 6 0 0 1-7.9 7.9l-6.1 6.1a2.1 2.1 0 0 1-3-3l6.1-6.1a6 6 0 0 1 7.9-7.9l-3.8 3.8Z"></path>',
            'graduation-cap': '<path d="M21.4 10.9 12 6 2.6 10.9 12 16l9.4-5.1Z"></path><path d="M6 12.5V17c2 1.3 4 2 6 2s4-.7 6-2v-4.5"></path>',
            'scroll-text': '<path d="M15 12H5"></path><path d="M15 8H5"></path><path d="M19 17V5a2 2 0 0 0-2-2H4"></path><path d="M8 21h12a2 2 0 0 0 2-2v-1a3 3 0 0 0-3-3H8v6Z"></path><path d="M4 3a2 2 0 0 1 2 2v16"></path>',
            'badge-check': '<path d="M3.9 8.7a3 3 0 0 1 4.8-4.8 3 3 0 0 1 6.6 0 3 3 0 0 1 4.8 4.8 3 3 0 0 1 0 6.6 3 3 0 0 1-4.8 4.8 3 3 0 0 1-6.6 0 3 3 0 0 1-4.8-4.8 3 3 0 0 1 0-6.6Z"></path><path d="m9 12 2 2 4-4"></path>',
            plus: '<path d="M12 5v14"></path><path d="M5 12h14"></path>',
            check: '<path d="m20 6-11 11-5-5"></path>',
            x: '<path d="M18 6 6 18"></path><path d="m6 6 12 12"></path>',
            minus: '<path d="M5 12h14"></path>',
            link: '<path d="M10 13a5 5 0 0 0 7.1 0l2.8-2.8a5 5 0 0 0-7.1-7.1L11 4.9"></path><path d="M14 11a5 5 0 0 0-7.1 0l-2.8 2.8a5 5 0 0 0 7.1 7.1L13 19.1"></path>',
            unlink: '<path d="m18.8 12.2 1.1-1.1a5 5 0 0 0-7.1-7.1l-1 1"></path><path d="M8.2 18.9a5 5 0 0 0 7 0l1.1-1.1"></path><path d="M8 12a5 5 0 0 0-1.1 1l-2.8 2.8a5 5 0 0 0 7.1 7.1l1-1"></path><path d="m2 2 20 20"></path>',
            'pencil-line': '<path d="M12 20h9"></path><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"></path>',
            sparkles: '<path d="m12 3-1.9 5.8L4 11l6.1 2.2L12 19l1.9-5.8L20 11l-6.1-2.2Z"></path><path d="M5 3v4"></path><path d="M3 5h4"></path><path d="M19 17v4"></path><path d="M17 19h4"></path>',
            'layout-list': '<rect width="7" height="7" x="3" y="3" rx="1"></rect><path d="M14 5h7"></path><path d="M14 10h7"></path><rect width="7" height="7" x="3" y="14" rx="1"></rect><path d="M14 16h7"></path><path d="M14 21h7"></path>',
            'user-round': '<circle cx="12" cy="8" r="5"></circle><path d="M20 21a8 8 0 0 0-16 0"></path>',
            'user-round-check': '<path d="M2 21a8 8 0 0 1 13.3-6"></path><circle cx="10" cy="8" r="5"></circle><path d="m16 19 2 2 4-4"></path>',
            'user-round-plus': '<path d="M2 21a8 8 0 0 1 13.3-6"></path><circle cx="10" cy="8" r="5"></circle><path d="M19 16v6"></path><path d="M22 19h-6"></path>',
            palette: '<circle cx="13.5" cy="6.5" r=".5"></circle><circle cx="17.5" cy="10.5" r=".5"></circle><circle cx="8.5" cy="7.5" r=".5"></circle><circle cx="6.5" cy="12.5" r=".5"></circle><path d="M12 22a10 10 0 1 1 10-10 4 4 0 0 1-4 4h-1.5a2 2 0 0 0-1.6 3.2l.3.4A1.5 1.5 0 0 1 14 22Z"></path>',
            'columns-3': '<rect width="18" height="18" x="3" y="3" rx="2"></rect><path d="M9 3v18"></path><path d="M15 3v18"></path>',
            'columns-2': '<rect width="18" height="18" x="3" y="3" rx="2"></rect><path d="M12 3v18"></path>',
            'rows-2': '<rect width="18" height="18" x="3" y="3" rx="2"></rect><path d="M3 12h18"></path>',
            'panel-left-close': '<rect width="18" height="18" x="3" y="3" rx="2"></rect><path d="M9 3v18"></path><path d="m16 15-3-3 3-3"></path>',
            'undo-2': '<path d="M9 14 4 9l5-5"></path><path d="M4 9h10a6 6 0 0 1 0 12h-1"></path>',
            'redo-2': '<path d="m15 14 5-5-5-5"></path><path d="M20 9H10a6 6 0 0 0 0 12h1"></path>',
            download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><path d="M7 10l5 5 5-5"></path><path d="M12 15V3"></path>',
            upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><path d="m17 8-5-5-5 5"></path><path d="M12 3v12"></path>',
            copy: '<rect width="14" height="14" x="8" y="8" rx="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>',
            'clipboard-list': '<rect width="8" height="4" x="8" y="2" rx="1"></rect><path d="M8 4H6a2 2 0 0 0-2 2v16h16V6a2 2 0 0 0-2-2h-2"></path><path d="M8 11h8"></path><path d="M8 16h8"></path><path d="M8 21h5"></path>',
            'refresh-cw': '<path d="M3 12a9 9 0 0 1 15.5-6.2L21 8"></path><path d="M21 3v5h-5"></path><path d="M21 12a9 9 0 0 1-15.5 6.2L3 16"></path><path d="M3 21v-5h5"></path>',
            type: '<path d="M4 7V4h16v3"></path><path d="M9 20h6"></path><path d="M12 4v16"></path>',
            heading: '<path d="M6 12h12"></path><path d="M6 20V4"></path><path d="M18 20V4"></path>',
            pilcrow: '<path d="M13 4v16"></path><path d="M17 4v16"></path><path d="M19 4H9.5a4.5 4.5 0 0 0 0 9H13"></path>',
            'align-justify': '<path d="M3 6h18"></path><path d="M3 12h18"></path><path d="M3 18h18"></path>',
            'text-cursor-input': '<path d="M5 4h4"></path><path d="M7 4v16"></path><path d="M5 20h4"></path><rect width="12" height="16" x="9" y="4" rx="2"></rect>',
            'square-round-corner': '<path d="M21 11V8a5 5 0 0 0-5-5h-3"></path><path d="M3 13v3a5 5 0 0 0 5 5h3"></path><path d="M21 16v5h-5"></path><path d="M8 3H3v5"></path>',
            image: '<rect width="18" height="18" x="3" y="3" rx="2"></rect><circle cx="9" cy="9" r="2"></circle><path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21"></path>',
            list: '<path d="M8 6h13"></path><path d="M8 12h13"></path><path d="M8 18h13"></path><path d="M3 6h.01"></path><path d="M3 12h.01"></path><path d="M3 18h.01"></path>',
            bold: '<path d="M6 4h8a4 4 0 0 1 0 8H6z"></path><path d="M6 12h9a4 4 0 0 1 0 8H6z"></path>',
            italic: '<path d="M19 4h-9"></path><path d="M14 20H5"></path><path d="M15 4 9 20"></path>',
            'grip-vertical': '<circle cx="9" cy="5" r="1"></circle><circle cx="9" cy="12" r="1"></circle><circle cx="9" cy="19" r="1"></circle><circle cx="15" cy="5" r="1"></circle><circle cx="15" cy="12" r="1"></circle><circle cx="15" cy="19" r="1"></circle>',
            'zoom-in': '<circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path><path d="M11 8v6"></path><path d="M8 11h6"></path>',
            'file-text': '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"></path><path d="M14 2v6h6"></path><path d="M16 13H8"></path><path d="M16 17H8"></path><path d="M10 9H8"></path>',
            'chevron-down': '<path d="m6 9 6 6 6-6"></path>',
            'list-plus': '<path d="M11 12H3"></path><path d="M16 6H3"></path><path d="M16 18H3"></path><path d="M18 9v6"></path><path d="M21 12h-6"></path>',
            mail: '<rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-10 6L2 7"></path>',
            'map-pin': '<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle>',
            linkedin: '<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6Z"></path><rect width="4" height="12" x="2" y="9"></rect><circle cx="4" cy="4" r="2"></circle>',
            github: '<path d="M15 22v-3.9a3.4 3.4 0 0 0-.9-2.6c3 0 6.1-1.5 6.1-6.6A5.1 5.1 0 0 0 18.8 5 4.7 4.7 0 0 0 18.7 1S17.6.7 15 2.5a12.8 12.8 0 0 0-6 0C6.4.7 5.3 1 5.3 1a4.7 4.7 0 0 0-.1 4A5.1 5.1 0 0 0 3.8 9c0 5.1 3.1 6.6 6.1 6.6a3.4 3.4 0 0 0-.9 2.6V22"></path>',
            globe: '<circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path><path d="M2 12h20"></path>',
            'globe-2': '<circle cx="12" cy="12" r="10"></circle><path d="M2 12h20"></path><path d="M12 2a15.3 15.3 0 0 1 0 20"></path><path d="M12 2a15.3 15.3 0 0 0 0 20"></path>'
            ,
            braces: '<path d="M8 3H7a2 2 0 0 0-2 2v3a2 2 0 0 1-2 2 2 2 0 0 1 2 2v3a2 2 0 0 0 2 2h1"></path><path d="M16 3h1a2 2 0 0 1 2 2v3a2 2 0 0 0 2 2 2 2 0 0 0-2 2v3a2 2 0 0 1-2 2h-1"></path>',
            'file-check-2': '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"></path><path d="M14 2v6h6"></path><path d="m9 15 2 2 4-4"></path>',
            'file-plus-2': '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"></path><path d="M14 2v6h6"></path><path d="M12 18v-6"></path><path d="M9 15h6"></path>',
            'rotate-ccw': '<path d="M3 12a9 9 0 1 0 3-6.7"></path><path d="M3 4v6h6"></path>',
            'sliders-horizontal': '<path d="M21 4h-7"></path><path d="M10 4H3"></path><path d="M21 12h-9"></path><path d="M8 12H3"></path><path d="M21 20h-5"></path><path d="M12 20H3"></path><circle cx="12" cy="4" r="2"></circle><circle cx="10" cy="12" r="2"></circle><circle cx="14" cy="20" r="2"></circle>'
        };
        return `<svg class="lucide-fallback" viewBox="0 0 24 24" aria-hidden="true">${paths[name] || paths.mail}</svg>`;
    }

    function cleanUrl(url) {
        return String(url || '').trim();
    }

    function formatVisibleUrl(url, options = {}) {
        const value = cleanUrl(url);
        if (!value) return '';
        if (/^mailto:/i.test(value)) return value.replace(/^mailto:/i, '');

        const normalizedUrl = /^(https?:)/i.test(value)
            ? value
            : `https://${value.replace(/^\/+/, '')}`;
        return compactDisplayUrl(normalizedUrl, options);
    }

    function getResumeData() {
        if (typeof CV_DATA !== 'undefined') return CV_DATA;
        return typeof JOURNEY_DATA !== 'undefined' ? JOURNEY_DATA : {};
    }

    function compactUrl(url) {
        return String(url || '')
            .replace(/^https?:\/\//, '')
            .replace(/^www\./, '')
            .replace(/\/$/, '');
    }

    function compactDisplayUrl(url, options = {}) {
        const compact = compactUrl(url);
        return options.maxLength && compact.length > options.maxLength
            ? `${compact.slice(0, Math.max(8, options.maxLength - 3))}...`
            : compact;
    }

    function normalizeInlineText(value) {
        return String(value || '').replace(/\s+/g, ' ').trim();
    }

    function normalizeBulletText(value) {
        return normalizeInlineText(value).replace(/^[-*\u2022\u25aa\u25e6\u2023]\s*/, '');
    }

    function titleCase(value) {
        return String(value || '')
            .replace(/[-_]/g, ' ')
            .replace(/\b\w/g, character => character.toUpperCase());
    }

    function uniqueId(prefix) {
        return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    }

    function slugify(value) {
        return String(value || 'resume')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '') || 'resume';
    }

    function escapeHtml(value) {
        return String(value == null ? '' : value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function escapeAttr(value) {
        return escapeHtml(value).replace(/`/g, '&#96;');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
