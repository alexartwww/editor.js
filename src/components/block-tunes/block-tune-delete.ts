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
    const currentBlockIndex = this.api.blocks.getCurrentBlockIndex();
    const currentBlockSettings = this.api.blocks.getBlockSettingsByIndex(currentBlockIndex);
    if (currentBlockIndex === 0 && currentBlockSettings && currentBlockSettings.holdFirstHeader === true) {
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
    const currentBlockIndex = this.api.blocks.getCurrentBlockIndex();
    const currentBlockSettings = this.api.blocks.getBlockSettingsByIndex(currentBlockIndex);
    if (currentBlockIndex === 0 && currentBlockSettings && currentBlockSettings.holdFirstHeader === true) {
      throw new Error('holdFirstHeader === true');
    }

    this.api.blocks.delete();
  }
}
