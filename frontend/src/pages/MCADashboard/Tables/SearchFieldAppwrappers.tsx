import * as React from 'react';
import { InputGroup, SearchInput, Select, SelectOption } from '@patternfly/react-core';

export enum SearchType {
  NAME = 'Name',
  NAMESPACE = 'Namespace',
  CREATEDON = 'Created On',
}

type SearchFieldProps = {
  types: string[];
  searchType: SearchType;
  onSearchTypeChange: (searchType: SearchType) => void;
  searchValue: string;
  onSearchValueChange: (searchValue: string) => void;
};

const SearchFieldAppwrappers: React.FC<SearchFieldProps> = ({
  types,
  searchValue,
  searchType,
  onSearchValueChange,
  onSearchTypeChange,
}) => {
  const [typeOpen, setTypeOpen] = React.useState(false);

  return (
    <InputGroup>
      <Select
        removeFindDomNode
        isOpen={typeOpen}
        onToggle={() => setTypeOpen(!typeOpen)}
        selections={searchType}
        onSelect={(e, key) => {
          if (typeof key === 'string') {
            onSearchTypeChange(SearchType[key as keyof typeof SearchType]);
            setTypeOpen(false);
          }
        }}
      >
        {types.map((key) => (
          <SelectOption key={key} value={key}>
            {SearchType[key as keyof typeof SearchType]}
          </SelectOption>
        ))}
      </Select>
      <SearchInput
        placeholder={`Find by ${searchType.toLowerCase()}`}
        value={searchValue}
        onChange={(_, newSearch) => {
          onSearchValueChange(newSearch);
        }}
        onClear={() => onSearchValueChange('')}
        style={{ minWidth: '200px' }}
      />
    </InputGroup>
  );
};

export default SearchFieldAppwrappers;
