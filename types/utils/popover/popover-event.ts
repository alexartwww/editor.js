
/**
 * Event that can be triggered by the Popover
 */
export enum PopoverEvent {
  /**
   * When popover closes
   */
  Closed = 'closed',

  /**
   * When it closes because item with 'closeOnActivate' property set was clicked
   */
  ClosedOnActivate = 'closed-on-activate',

  /**
   * When a nested (children) popover is opened for some item (e.g. "Convert to")
   */
  ChildrenOpened = 'children-opened',

  /**
   * When a nested (children) popover is closed
   */
  ChildrenClosed = 'children-closed',
}
