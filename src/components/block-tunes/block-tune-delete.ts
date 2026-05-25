/**
 * @class DeleteTune
 * @classdesc Editor's default tune that moves up selected block
 * @copyright <CodeX Team> 2018
 */
import type { API, BlockTune } from '../../../types';
import { IconCross } from '@codexteam/icons';
import type { MenuConfig } from '../../../types/tools/menu-config';

/**
 *
 */
export default class DeleteTune implements BlockTune {
  /**
   * Set Tool is Tune
   */
  public static readonly isTune = true;

  /**
   * Property that contains Editor.js API methods
   *
   * @see {@link docs/api.md}
   */
  private readonly api: API;

  /**
   * DeleteTune constructor
   *
   * @param {API} api - Editor's API
   */
  private readonly block: any;  // добавить поле

  constructor({ api, block }) {
    this.api = api;
    this.block = block;  // добавить
  }

  /**
   * Tune's appearance in block settings menu
   */
  public render(): MenuConfig {
    if (this.block?.config?.deleteable === true) {
      return [];
    }
    return {
      icon: IconCross,
      title: this.api.i18n.t('Delete'),
      name: 'delete',
      confirmation: {
        title: this.api.i18n.t('Click to delete'),
        onActivate: (): void => this.handleClick(),
      },
    };
  }

  /**
   * Delete block conditions passed
   */
  public handleClick(): void {
    if (this.block?.config?.deleteable === true) {
      return;
    }
    this.api.blocks.delete();
  }
}
