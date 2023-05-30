import React from 'react';
import { Select, SelectOption, SelectList } from '@patternfly/react-core/next';
import { MenuToggle, MenuToggleElement } from '@patternfly/react-core';

const TimeRangeDropDown: React.FunctionComponent = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<string>('Last 6 months');
  const menuRef = React.useRef<HTMLDivElement>(null);

  const onToggleClick = () => {
    setIsOpen(!isOpen);
  };

  const onSelect = (_event: React.MouseEvent<Element, MouseEvent> | undefined, itemId: string | number | undefined) => {
    // eslint-disable-next-line no-console
    console.log('selected', itemId);

    setSelected(itemId as string);
    setIsOpen(false);
  };

  const toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={toggleRef}
      onClick={onToggleClick}
      isExpanded={isOpen}
      style={
        {
          width: '200px'
        } as React.CSSProperties
      }
    >
      {selected}
    </MenuToggle>
  );

  return (
    <div>
      <h3>Time Range</h3>
    <Select
      id="single-select"
      ref={menuRef}
      isOpen={isOpen}
      selected={selected}
      onSelect={onSelect}
      onOpenChange={isOpen => setIsOpen(isOpen)}
      toggle={toggle}
    >
      <SelectList>
        <SelectOption itemId="Custom Time Range">Custom Time Range</SelectOption>
        <SelectOption itemId="Last 5 minutes">Last 5 minutes</SelectOption>
        <SelectOption itemId="Last 10 minutes">Last 10 minutes</SelectOption>
        <SelectOption itemId="Last 30 minutes">Last 30 minutes</SelectOption>
        <SelectOption itemId="Last 1 hour">Last 1 hour</SelectOption>
        <SelectOption itemId="Last 2 hours">Last 2 hours</SelectOption>
        <SelectOption itemId="Last 1 day">Last 1 day</SelectOption>
        <SelectOption itemId="Last 1 month">Last 1 month</SelectOption>
        <SelectOption itemId="Last 6 months">Last 6 months</SelectOption>
      </SelectList>
    </Select>
    </div>
  );
};

export default TimeRangeDropDown;