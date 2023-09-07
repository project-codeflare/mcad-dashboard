import React from 'react';
import { Select, SelectOption, SelectList } from '@patternfly/react-core/next';
import { MenuToggle, MenuToggleElement, Modal, Button, ModalVariant, NumberInput } from '@patternfly/react-core';

type TimeRangeDropDownProps = {
  onSelected: (itemId: string) => void;
  dateFormatter: (str: string) => string;
};

const TimeRangeDropDown: React.FunctionComponent<TimeRangeDropDownProps> = ({
  onSelected,
  dateFormatter,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<string>('Last 30 minutes');
  const menuRef = React.useRef<HTMLDivElement>(null);
  const [isModalOpen, setModalOpen] = React.useState(false);
  const [value, setValue] = React.useState<number | ''>(90);
  const [isOpenCustomTime, setIsOpenCustomTime] = React.useState(false);
  const [selectedCustomTime, setSelectedCustomTime] = React.useState<string>('minutes');

  const onToggleClick = () => {
    setIsOpen(!isOpen);
  };

  const onToggleClickCustomTime = () => {
    setIsOpenCustomTime(!isOpenCustomTime);
  };

  const onMinus = () => {
    const newValue = (value || 0) - 1;
    setValue(newValue);
  };

  const onChangeNumberInputModal = (event: React.FormEvent<HTMLInputElement>) => {
    const value = (event.target as HTMLInputElement).value;
    setValue(value === '' ? value : +value);
  };

  const onPlus = () => {
    const newValue = (value || 0) + 1;
    setValue(newValue);
  };

  const onSelect = (
    _event: React.MouseEvent<Element, MouseEvent> | undefined,
    itemId: string | number | undefined,
  ) => {
    if (itemId as string === 'Custom Time Range') {
      // Open the custom time modal
    } else {
      // Handle other selections as needed
      setSelected(itemId as string);
      onSelected(dateFormatter(itemId as string));
      setIsOpen(!isOpen);
    }
  };

  const onSelectCustomTime = (
    _event: React.MouseEvent<Element, MouseEvent> | undefined,
    itemId: string | number | undefined,
  ) => {
    console.log("itemId", itemId as string)
    setSelectedCustomTime(itemId as string)
    setIsOpenCustomTime(!isOpenCustomTime);
  }

  const handleModalToggle = (_event: KeyboardEvent | React.MouseEvent) => {
    setModalOpen(!isModalOpen);
  };

  const handleModalSetToggle = (_event: KeyboardEvent | React.MouseEvent) => {
    setModalOpen(!isModalOpen); // To close custom timerange modal after setting
    setIsOpen(!isOpen); // To close Time Range dropdown after custom time set in modal
    onSelected(dateFormatter(value + " " + selectedCustomTime)); // to set the selected custom time 
    setSelected("Last " + value + " " + selectedCustomTime); // to display the selected custom time on timerange drop down 
  };

  const toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={toggleRef}
      onClick={onToggleClick}
      isExpanded={isOpen}
      style={
        {
          width: '200px',
        } as React.CSSProperties
      }
    >
      {selected}
    </MenuToggle>
  );

  const toggleCustomTime = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={toggleRef}
      onClick={onToggleClickCustomTime}
      isExpanded={isOpenCustomTime}
      style={
        {
          width: '200px',
          display: 'flex'
        } as React.CSSProperties
      }
    >
      {selectedCustomTime}
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
        // onOpenChange={(isOpen) => setIsOpen(isOpen)}
        toggle={toggle}
      >
        <SelectList>
          <SelectOption itemId="Custom Time Range">
            <div>
              <Button variant="primary" onClick={handleModalToggle}>
                Custom Time Range
              </Button>
              <Modal
                variant={ModalVariant.small}
                title="Custom Time Range"
                description="Enter custom time in the format specified"
                isOpen={isModalOpen}
                // onClose={handleModalToggle}
                actions={[
                  <Button key="set" variant="primary" form="modal-with-form-form" onClick={handleModalSetToggle}>
                    Set
                  </Button>,
                  <Button key="cancel" variant="link" onClick={handleModalToggle}>
                    Cancel
                  </Button>
                ]}
              >
                <NumberInput
                  value={value}
                  onMinus={onMinus}
                  onChange={onChangeNumberInputModal}
                  onPlus={onPlus}
                  inputName="input"
                  inputAriaLabel="number input"
                  minusBtnAriaLabel="minus"
                  plusBtnAriaLabel="plus"
                  style={
                    {
                      display: 'flex',
                      justifyContent: 'left',
                      width: '200px'
                    } as React.CSSProperties
                  }
                />
                <Select
                  id="single-select"
                  isOpen={isOpenCustomTime}
                  selected={selectedCustomTime}
                  onSelect={onSelectCustomTime}
                  onOpenChange={(isOpenCustomTime) => setIsOpenCustomTime(isOpenCustomTime)}
                  toggle={toggleCustomTime}
                  style={
                    {
                      display: 'flex',
                      justifyContent: 'left',
                    } as React.CSSProperties
                  }
                >
                  <SelectList>
                    <SelectOption itemId="minutes">minutes</SelectOption>
                    <SelectOption itemId="hours">hours</SelectOption>
                    <SelectOption itemId="days">days</SelectOption>
                    <SelectOption itemId="weeks">weeks</SelectOption>
                    <SelectOption itemId="months">months</SelectOption>
                    {/* <SelectOption itemId="years">years</SelectOption> */}
                  </SelectList>
                </Select>
              </Modal>
            </div>
          </SelectOption>
          <SelectOption itemId="Last 5 minutes">Last 5 minutes</SelectOption>
          <SelectOption itemId="Last 10 minutes">Last 10 minutes</SelectOption>
          <SelectOption itemId="Last 30 minutes">Last 30 minutes</SelectOption>
          <SelectOption itemId="Last 1 hour">Last 1 hour</SelectOption>
          <SelectOption itemId="Last 2 hours">Last 2 hours</SelectOption>
          <SelectOption itemId="Last 1 day">Last 1 day</SelectOption>
          <SelectOption itemId="Last 2 days">Last 2 days</SelectOption>
          <SelectOption itemId="Last 1 week">Last 1 week</SelectOption>
          <SelectOption itemId="Last 2 weeks">Last 2 weeks</SelectOption>
        </SelectList>
      </Select>
      {/* {showCustomTimeModal && (
        <YourCustomTimeRangeModal onClose={() => setShowCustomTimeModal(false)} />
      )} */}
    </div>
  );
};

export default TimeRangeDropDown;
