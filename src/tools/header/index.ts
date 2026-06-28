/**
 * Build styles
 */
import './index.css';

import { IconH1, IconH2, IconH3, IconH4, IconH5, IconH6, IconHeading } from '@codexteam/icons';
import { API, BlockTool, PasteEvent } from '@editorjs/editorjs';
import type { MenuConfig } from '@editorjs/editorjs/types/tools';
import {ConversionConfig, SanitizerConfig} from "@/types";
import I18n from "../../components/i18n";

/**
 * @description Tool's input and output data format
 */
export interface HeaderData {
  /** Header's content */
  text: string;
  /** Header's level from 1 to 6 */
  level: number;
}

/**
 * @description Tool's config from Editor
 */
export interface HeaderConfig {
  /** Block's placeholder */
  placeholder?: string;
  /** Heading levels */
  levels?: number[];
  /** Default level */
  defaultLevel?: number;
}

/**
 * @description Heading level information
 */
interface Level {
  /** Level number */
  number: number;
  /** HTML tag corresponding with level number */
  tag: string;
  /** Icon */
  svg: string;
}

/**
 * @description Constructor arguments for Header
 */
interface ConstructorArgs {
  /** Previously saved data */
  data: HeaderData | {};
  /** User config for the tool */
  config?: HeaderConfig;
  /** Editor.js API */
  api: API;
  /** Read-only mode flag */
  readOnly: boolean;
  /** Block API */
  block: any;
}

/**
 * Header block for the Editor.js.
 *
 * @author CodeX (team@ifmo.su)
 * @copyright CodeX 2018
 * @license MIT
 * @version 2.0.0
 */
export default class Header implements BlockTool {
  /**
   * Render plugin`s main Element and fill it with saved data
   *
   * @param {{data: HeaderData, config: HeaderConfig, api: object}}
   *   data — previously saved data
   *   config - user config for Tool
   *   api - Editor.js API
   *   readOnly - read only mode flag
   */
  /**
   * Editor.js API
   * @private
   */
  private api: API;
  /**
   * Read-only mode flag
   * @private
   */
  private readOnly: boolean;
  /**
   * Tool's settings passed from Editor
   * @private
   */
  private _config: HeaderConfig | null;
  /**
   * Block's data
   * @private
   */
  private _data: HeaderData;
  /**
   * Main Block wrapper
   * @private
   */
  private _element: HTMLHeadingElement;
  private _block: any;

  constructor({ data, config, api, readOnly, block }: ConstructorArgs) {
    this.api = api;
    this.readOnly = readOnly;

    /**
     * Tool's settings passed from Editor
     *
     * @type {HeaderConfig}
     * @private
     */
    this._block = block;
    this._config = config ?? null;

    /**
     * Block's data
     *
     * @type {HeaderData}
     * @private
     */
    this._data = this.normalizeData(data);

    /**
     * Main Block wrapper
     *
     * @type {HTMLElement}
     * @private
     */
    this._element = this.getTag();
    // const observer = new MutationObserver((mutations) => {
    //   mutations.forEach((mutation) => {
    //     mutation.addedNodes.forEach((node) => {
    //       if (node.nodeName === 'BR') {
    //         console.log('BR добавлен!', node);
    //         console.trace(); // покажет стек вызовов — кто вставил
    //       }
    //     });
    //   });
    // });
    //
    // observer.observe(this._element, { childList: true, subtree: true });
  }

  /**
   * Check if text content is empty and set empty string to inner html.
   * We need this because some browsers (e.g. Safari) insert <br> into empty contenteditanle elements
   *
   * @param {KeyboardEvent} e - key up event
   */
  onKeyUp(e: KeyboardEvent): void {
    // if (e.code !== 'Backspace' && e.code !== 'Delete') {
    //   return;
    // }

    if (!this._element) {
      return;
    }

    const { textContent } = this._element;

    if (textContent.replace(/<br\s*\/?>/gi, '').trim() === '') {
      this._element.innerHTML = '';
    }
  }

  private get _CSS() {
    return {
      block: this.api.styles.block,
      wrapper: 'ce-header',
    };
  }

  /**
   * Check if data is valid
   *
   * @param {any} data - data to check
   * @returns {data is HeaderData}
   * @private
   */
  isHeaderData(data: any): data is HeaderData {
    return (data as HeaderData).text !== undefined;
  }

  /**
   * Normalize input data
   *
   * @param {HeaderData} data - saved data to process
   *
   * @returns {HeaderData}
   * @private
   */
  normalizeData(data: HeaderData | {}): HeaderData {
    const newData: HeaderData = { text: '', level: this.defaultLevel.number };

    if (this.isHeaderData(data)) {
      newData.text = data.text || '';

      if (data.level !== undefined && !isNaN(parseInt(data.level.toString()))) {
        newData.level = parseInt(data.level.toString());
      }
    }

    return newData;
  }

  /**
   * Return Tool's view
   *
   * @returns {HTMLDivElement}
   */
  render(): HTMLHeadingElement {
    return this._element;
  }

  /**
   * Returns header block tunes config.
   *
   * Правило: если текущий блок — H1, скрываем все тюны
   * (нельзя удалить, нельзя переместить, нельзя сменить уровень).
   * Для H2/H3 показываем только переключатель уровней.
   */
  renderSettings(): MenuConfig {
    // H1 — никаких настроек вообще
    if (this._config.holdFirstHeader === true) {
      if (this._data.level === 1) {
        return [];
      }

      // H2/H3 — только переключатель уровней (без delete/move — они встроенные)
      return this.levels
        .filter(level => level.number !== 1) // H1 нельзя выбрать из настроек
        .map(level => ({
          icon: level.svg,
          label: this.api.i18n.t(`Heading ${level.number}`),
          onActivate: () => this.setLevel(level.number),
          closeOnActivate: true,
          isActive: this.currentLevel.number === level.number,
          render: () => document.createElement('div')
        }));
    } else {
      return this.levels
        .map(level => ({
          icon: level.svg,
          label: this.api.i18n.t(`Heading ${level.number}`),
          onActivate: () => this.setLevel(level.number),
          closeOnActivate: true,
          isActive: this.currentLevel.number === level.number,
          render: () => document.createElement('div')
        }));
    }
  }

  /**
   * Enable Conversion Toolbar. Paragraph can be converted to/from other tools
   * @returns {ConversionConfig}
   */
  static get conversionConfig(): ConversionConfig {
    return {
      export: 'text', // to convert Paragraph to other block, use 'text' property of saved data
      import: 'text', // to covert other block's exported string to Paragraph, fill 'text' property of tool data
    };
  }

  /**
   * Callback for Block's settings buttons
   *
   * @param {number} level - level to set
   */
  setLevel(level: number): void {
    // Запрещаем смену уровня на H1 через настройки
    if (this._config.holdFirstHeader === true && level === 1) return;

    this.data = {
      level: level,
      text: this.data.text,
    };
  }

  /**
   * Method that specified how to merge two Text blocks.
   * Called by Editor.js by backspace at the beginning of the Block
   *
   * @param {HeaderData} data - saved data to merger with current block
   * @public
   */
  merge(data: HeaderData): void {
    this._element.insertAdjacentHTML('beforeend', data.text);
  }

  /**
   * Validate Text block data:
   * - check for emptiness
   *
   * @param {HeaderData} blockData — data received after saving
   * @returns {boolean} false if saved data is not correct, otherwise true
   * @public
   */
  validate(blockData: HeaderData): boolean {
    return blockData.text.trim() !== '';
  }

  /**
   * Extract Tool's data from the view
   *
   * @param {HTMLHeadingElement} toolsContent - Text tools rendered view
   * @returns {HeaderData} - saved data
   * @public
   */
  save(toolsContent: HTMLHeadingElement): HeaderData {
    return {
      text: toolsContent.innerHTML,
      level: this.currentLevel.number,
    };
  }

  /**
   * Sanitizer Rules
   */
  static get sanitize(): SanitizerConfig {
    return {
      text: {
        br: false,
      },
    };
  }

  /**
   * Returns true to notify core that read-only is supported
   *
   * @returns {boolean}
   */
  static get isReadOnlySupported() {
    return true;
  }

  /**
   * Get current Tools`s data
   *
   * @returns {HeaderData} Current data
   * @private
   */
  get data(): HeaderData {
    this._data.text = this._element.innerHTML;
    this._data.level = this.currentLevel.number;

    return this._data;
  }

  /**
   * Store data in plugin:
   * - at the this._data property
   * - at the HTML
   *
   * @param {HeaderData} data — data to set
   * @private
   */
  set data(data: HeaderData) {
    this._data = this.normalizeData(data);

    /**
     * If level is set and block in DOM
     * then replace it to a new block
     */
    if (data.level !== undefined && this._element.parentNode) {
      /**
       * Create a new tag
       *
       * @type {HTMLHeadingElement}
       */
      const newHeader = this.getTag();

      /**
       * Save Block's content
       */
      newHeader.innerHTML = this._element.innerHTML;

      /**
       * Replace blocks
       */
      this._element.parentNode.replaceChild(newHeader, this._element);

      /**
       * Save new block to private variable
       *
       * @type {HTMLHeadingElement}
       * @private
       */
      this._element = newHeader;
    }

    /**
     * If data.text was passed then update block's content
     */
    if (data.text !== undefined) {
      this._element.innerHTML = this._data.text || '';
    }
  }

  /**
   * Get tag for target level
   * By default returns second-leveled header
   *
   * @returns {HTMLElement}
   */
  getTag(): HTMLHeadingElement {
    /**
     * Create element for current Block's level
     */
    const currentLevel = this.currentLevel;
    const tag = document.createElement(currentLevel.tag) as HTMLHeadingElement;

    /**
     * Add text to block
     */
    console.log('text', this._data.text);
    tag.innerHTML = this._data.text || '';

    /**
     * Add styles class
     */
    tag.classList.add(this._CSS.wrapper);

    /**
     * Make tag editable
     */
    tag.contentEditable = this.readOnly ? 'false' : 'true';

    if (!this.readOnly) {
      tag.addEventListener('keyup', this.onKeyUp);
    }

    if (currentLevel.number === 1) {
      tag.dataset['placeholder'] = this.api.i18n.t(this._config?.placeholder || '');
    } else {
      tag.dataset['placeholder'] = this.api.i18n.t(this._config?.placeholderLevel || '');
    }
    // Ограничение максимальной длины заголовка
    const maxLength = (currentLevel.number === 1) ? this._config?.maxLength : this._config?.maxLengthLevel;
    if (maxLength) {
      tag.addEventListener('beforeinput', (e: InputEvent) => {
        const currentLength = tag.textContent?.length || 0;

        // Разрешаем удаление и навигацию всегда
        const isDeletion = e.inputType.startsWith('delete');
        if (isDeletion) {
          return;
        }

        // Если уже достигли лимита — блокируем ввод нового текста
        if (currentLength >= maxLength) {
          e.preventDefault();
        }
      });

      // Защита от вставки длинного текста через paste
      tag.addEventListener('paste', (e: ClipboardEvent) => {
        e.preventDefault();

        const pasteText = e.clipboardData?.getData('text/plain') || '';
        const currentLength = tag.textContent?.length || 0;
        const allowedLength = maxLength - currentLength;

        if (allowedLength <= 0) {
          return;
        }

        const textToInsert = pasteText.slice(0, allowedLength);

        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) {
          return;
        }

        const range = selection.getRangeAt(0);
        range.deleteContents();

        const textNode = document.createTextNode(textToInsert);
        range.insertNode(textNode);

        // переносим каретку в конец вставленного текста
        range.setStartAfter(textNode);
        range.setEndAfter(textNode);
        selection.removeAllRanges();
        selection.addRange(range);
      });
    }
    // H1: блокируем Backspace в начале (чтобы не слить с предыдущим блоком)
    // и Enter (чтобы не создавал новую строку внутри H1)
    if (this._config.holdFirstHeader === true && this._data.level === 1) {
      tag.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          e.stopPropagation();
          // Переходим к следующему блоку
          this.api.caret.setToNextBlock('start');
        }

        if (e.key === 'Backspace') {
          const sel = window.getSelection();
          if (sel && sel.rangeCount) {
            const range = sel.getRangeAt(0);
            // Блокируем только если каретка в самом начале и нет выделения
            if (range.startOffset === 0 && range.collapsed) {
              e.preventDefault();
              e.stopPropagation();
            }
          }
        }
      });
    }

    return tag;
  }

  /**
   * Get current level
   *
   * @returns {level}
   */
  get currentLevel(): Level {
    let level = this.levels.find(levelItem => levelItem.number === this._data.level);

    if (!level) {
      level = this.defaultLevel;
    }

    return level;
  }

  /**
   * Return default level
   *
   * @returns {level}
   */
  get defaultLevel(): Level {
    /**
     * User can specify own default level value
     */
    if (this._config?.defaultLevel) {
      const userSpecified = this.levels.find(levelItem => {
        return levelItem.number === this._config?.defaultLevel;
      });

      if (userSpecified) {
        return userSpecified;
      } else {
        console.warn('(ง\'̀-\'́)ง Heading Tool: the default level specified was not found in available levels');
      }
    }

    /**
     * With no additional options, there will be H2 by default
     *
     * @type {level}
     */
    return this.levels[1];
  }

  /**
   * @typedef {object} level
   * @property {number} number - level number
   * @property {string} tag - tag corresponds with level number
   * @property {string} svg - icon
   */

  /**
   * Available header levels
   *
   * @returns {level[]}
   */
  get levels(): Level[] {
    const availableLevels = [
      {
        number: 1,
        tag: 'H1',
        svg: IconH1,
      },
      {
        number: 2,
        tag: 'H2',
        svg: IconH2,
      },
      {
        number: 3,
        tag: 'H3',
        svg: IconH3,
      },
      {
        number: 4,
        tag: 'H4',
        svg: IconH4,
      },
      {
        number: 5,
        tag: 'H5',
        svg: IconH5,
      },
      {
        number: 6,
        tag: 'H6',
        svg: IconH6,
      },
    ];

    return this._config?.levels ? availableLevels.filter(
      l => this._config?.levels!.includes(l.number)
    ) : availableLevels;
  }

  /**
   * Handle H1-H6 tags on paste to substitute it with header Tool
   *
   * @param {PasteEvent} event - event with pasted content
   */
  onPaste(event: PasteEvent): void {
    const detail = event.detail;

    if ('data' in detail) {
      const content = detail.data as HTMLElement;
      /**
       * Define default level value
       *
       * @type {number}
       */
      let level = this.defaultLevel.number;

      switch (content.tagName) {
        case 'H1': level = 1; break;
        case 'H2': level = 2; break;
        case 'H3': level = 3; break;
        case 'H4': level = 4; break;
        case 'H5': level = 5; break;
        case 'H6': level = 6; break;
      }

      if (this._config?.levels) {
        // Fallback to nearest level when specified not available
        level = this._config?.levels.reduce((prevLevel, currLevel) => {
          return Math.abs(currLevel - level) < Math.abs(prevLevel - level) ? currLevel : prevLevel;
        });
      }

      // Запрещаем вставку как H1 (если вставили H1 — делаем H2)
      if (this._config.holdFirstHeader === true && level === 1) {
        level = this._config?.levels?.find(l => l !== 1) ?? 2;
      }

      this.data = { level, text: content.innerHTML };
    }
  }

  static get pasteConfig() {
    return {
      tags: ['H1', 'H2', 'H3', 'H4', 'H5', 'H6'],
    };
  }

  /**
   * H1 скрыт из тулбокса — пользователь не может добавить второй H1.
   * В тулбоксе показываем только H2 (и H3 если разрешён в levels).
   */
  static get toolbox() {
    return [
      // {
      //   icon: IconH1,
      //   title: I18n.t('tools.header', 'Heading 1'),
      //   data: { level: 1 },
      // },
      {
        icon: IconH2,
        title: I18n.t('tools.header', 'Heading 2'),
        data: { level: 2 },
      },
      {
        icon: IconH3,
        title: I18n.t('tools.header', 'Heading 3'),
        data: { level: 3 },
      },
    ];
  }
}
