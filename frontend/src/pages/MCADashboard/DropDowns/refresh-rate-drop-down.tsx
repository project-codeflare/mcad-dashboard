import React from 'react';
import { Select, SelectOption, SelectList } from '@patternfly/react-core/next';
import { MenuToggle, MenuToggleElement } from '@patternfly/react-core';

type RefreshRateDropDownProps = {
    onSelected: (itemId: number) => void;
}

const RefreshRateDropDown: React.FunctionComponent<RefreshRateDropDownProps> = ({ onSelected }) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [selected, setSelected] = React.useState<string>('30 seconds');
    const menuRef = React.useRef<HTMLDivElement>(null);

    const onToggleClick = () => {
        setIsOpen(!isOpen);
    };

    function convertDurationToMilliseconds(durationString: string) {
        const parts = durationString.split(' ');
        const numericValue = parseInt(parts[0], 10);
        let conversionFactor;

        switch (parts[1]) {
            case 'seconds':
                conversionFactor = 1000;
                break;
            case 'minutes':
                conversionFactor = 1000 * 60;
                break;
            case 'hours':
            case 'hour':
                conversionFactor = 1000 * 60 * 60;
                break;
            case 'days':
            case 'day':
                conversionFactor = 24 * 1000 * 60 * 60;
                break;
            default:
                conversionFactor = 1;
        }

        return numericValue * conversionFactor;
    }

    const onSelect = (_event: React.MouseEvent<Element, MouseEvent> | undefined, itemId: string | number | undefined) => {
        // eslint-disable-next-line no-console
        console.log('selected', itemId);
        if (itemId === 'string')
            onSelected(convertDurationToMilliseconds(itemId));
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
            <h3>Refresh Rate</h3>
            <Select
                id="refresh-rate-drop-down"
                ref={menuRef}
                isOpen={isOpen}
                selected={selected}
                onSelect={onSelect}
                onOpenChange={isOpen => setIsOpen(isOpen)}
                toggle={toggle}
            >
                <SelectList>
                    <SelectOption itemId="15 seconds">15 seconds</SelectOption>
                    <SelectOption itemId="30 seconds">30 seconds</SelectOption>
                    <SelectOption itemId="5 minutes">5 minutes</SelectOption>
                    <SelectOption itemId="30 minutes">30 minutes</SelectOption>
                    <SelectOption itemId="1 hour">1 hour</SelectOption>
                    <SelectOption itemId="1 day">1 day</SelectOption>
                </SelectList>
            </Select>
        </div>
    );
};

export default RefreshRateDropDown;