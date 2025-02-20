import React from 'react';
import {
  Button,
  Bullseye,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  EmptyStateVariant,
  Flex,
  FlexItem,
  Select,
  SelectOption,
  SelectVariant,
  SearchInput,
  Switch,
  Title,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from '@patternfly/react-core';
import {
  ActionsColumn,
  TableComposable,
  Thead,
  Tr,
  Th,
  ThProps,
  Tbody,
  Td,
  ExpandableRowContent,
  IAction,
} from '@patternfly/react-table';
import { CubesIcon, SearchIcon } from '@patternfly/react-icons';
import { BYONImage } from '~/types';
import { relativeTime } from '~/utilities/time';
import { updateBYONImage } from '~/services/imagesService';
import ImageErrorStatus from '~/pages/BYONImages/ImageErrorStatus';
import { ImportImageModal } from './ImportImageModal';
import { DeleteImageModal } from './DeleteBYONImageModal';
import { UpdateImageModal } from './UpdateImageModal';

import './BYONImagesTable.scss';

export type BYONImagesTableProps = {
  images: BYONImage[];
  forceUpdate: () => void;
};

type BYONImageEnabled = {
  id: string;
  visible?: boolean;
};

type BYONImageTableFilterOptions = 'user' | 'name' | 'description' | 'uploaded';
type BYONImageTableFilter = {
  filter: string;
  option: BYONImageTableFilterOptions;
  count: number;
};

export const BYONImagesTable: React.FC<BYONImagesTableProps> = ({ images, forceUpdate }) => {
  const rowActions = (image: BYONImage): IAction[] => [
    {
      title: 'Edit',
      id: `${image.name}-edit-button`,
      onClick: () => {
        setcurrentImage(image);
        setUpdateImageModalVisible(true);
      },
    },
    {
      isSeparator: true,
    },
    {
      title: 'Delete',
      id: `${image.name}-delete-button`,
      onClick: () => {
        setcurrentImage(image);
        setDeleteImageModalVisible(true);
      },
    },
  ];

  React.useEffect(() => {
    setBYONImageVisible(images.map((image) => ({ id: image.id, visible: image.visible })));
  }, [images]);

  const [currentImage, setcurrentImage] = React.useState<BYONImage>(images[0]);
  const [deleteImageModalVisible, setDeleteImageModalVisible] = React.useState(false);
  const [importImageModalVisible, setImportImageModalVisible] = React.useState(false);
  const [updateImageModalVisible, setUpdateImageModalVisible] = React.useState(false);

  const [activeSortIndex, setActiveSortIndex] = React.useState<number | undefined>(0);
  const [activeSortDirection, setActiveSortDirection] = React.useState<'asc' | 'desc' | undefined>(
    'asc',
  );

  const getFilterCount = (value: string, option: BYONImageTableFilterOptions): number => {
    let total = 0;
    images.forEach((image) => {
      (image[option] as string).includes(value) ? total++ : null;
    });
    return total;
  };

  const getSortableRowValues = (nb: BYONImage): string[] => {
    const { name, description = '', visible = false, user = '', uploaded = '' } = nb;
    return [name, description, visible.toString(), user, uploaded.toString()];
  };

  const sortedImages = React.useMemo(() => {
    if (activeSortIndex !== undefined) {
      return [...images].sort((a, b) => {
        const aValue = getSortableRowValues(a)[activeSortIndex];
        const bValue = getSortableRowValues(b)[activeSortIndex];

        if (activeSortDirection === 'asc') {
          return (aValue as string).localeCompare(bValue as string);
        }
        return (bValue as string).localeCompare(aValue as string);
      });
    }
    return [...images];
  }, [activeSortDirection, activeSortIndex, images]);

  const getSortParams = (columnIndex: number): ThProps['sort'] => ({
    sortBy: {
      index: activeSortIndex,
      direction: activeSortDirection,
      defaultDirection: 'asc',
    },
    onSort: (_event, index, direction) => {
      setActiveSortIndex(index);
      setActiveSortDirection(direction);
    },
    columnIndex,
  });

  const columnNames: Record<BYONImageTableFilterOptions, string> = {
    name: 'Name',
    description: 'Description',
    user: 'User',
    uploaded: 'Uploaded',
  };

  const currentTimeStamp: number = Date.now();

  const [expandedBYONImageIDs, setExpandedBYONImageIDs] = React.useState<string[]>([]);
  const setBYONImageExpanded = (image: BYONImage, isExpanding = true) => {
    setExpandedBYONImageIDs((prevExpanded) => {
      const otherExpandedRepoNames = prevExpanded.filter((r) => r !== image.id);
      return isExpanding ? [...otherExpandedRepoNames, image.id] : otherExpandedRepoNames;
    });
  };
  const isBYONImageExpanded = (image: BYONImage) => expandedBYONImageIDs.includes(image.id);
  const [BYONImageVisible, setBYONImageVisible] = React.useState<BYONImageEnabled[]>(
    images.map((image) => ({ id: image.id, visible: image.visible })),
  );

  const selectOptions = [
    <SelectOption data-id="search-filter-name" key={1} value="name">
      Name
    </SelectOption>,
    <SelectOption data-id="search-filter-desc" key={2} value="description">
      Description
    </SelectOption>,
    <SelectOption data-id="search-filter-user" key={4} value="user">
      User
    </SelectOption>,
    <SelectOption data-id="search-filter-uploaded" key={5} value="uploaded">
      Uploaded
    </SelectOption>,
  ];
  const [tableFilter, setTableFilter] = React.useState<BYONImageTableFilter>({
    filter: '',
    option: 'name',
    count: images.length,
  });
  const [selected, setSelected] = React.useState<BYONImageTableFilterOptions>('name');
  const [tableSelectIsOpen, setTableSelectIsOpen] = React.useState(false);

  const items = (
    <React.Fragment>
      <ToolbarItem variant="search-filter" className="filter-select">
        <Select
          removeFindDomNode
          data-id="search-filter-select"
          variant={SelectVariant.single}
          aria-label="Select for image images table"
          onToggle={(isExpanded) => {
            setTableSelectIsOpen(isExpanded);
          }}
          onSelect={(_event, value) => {
            const option = value as BYONImageTableFilterOptions;
            setSelected(option);
            const newCount = getFilterCount(tableFilter.filter, option);
            setTableFilter({
              filter: tableFilter.filter,
              option,
              count: newCount,
            });
          }}
          selections={selected}
          isOpen={tableSelectIsOpen}
        >
          {selectOptions}
        </Select>
      </ToolbarItem>
      <ToolbarItem variant="search-filter">
        <SearchInput
          removeFindDomNode
          data-id="search-filter-input"
          className="filter-search"
          aria-label="search input for image images table"
          value={tableFilter.filter}
          onChange={(_, value) => {
            const newCount = getFilterCount(value, tableFilter.option);
            setTableFilter({
              filter: value,
              option: tableFilter.option,
              count: newCount,
            });
          }}
          onClear={() => {
            setTableFilter({
              filter: '',
              option: tableFilter.option,
              count: images.length,
            });
          }}
        />
      </ToolbarItem>
      <ToolbarItem>
        <Button
          data-id="import-new-image"
          onClick={() => {
            setImportImageModalVisible(true);
          }}
        >
          Import new image
        </Button>
      </ToolbarItem>
    </React.Fragment>
  );

  const applyTableFilter = (image: BYONImage): boolean => {
    if (
      tableFilter.filter !== '' &&
      image[tableFilter.option] &&
      tableFilter.option !== 'uploaded'
    ) {
      const BYONImageValue: string = image[tableFilter.option] as string;
      return !BYONImageValue.includes(tableFilter.filter);
    }
    if (
      tableFilter.filter !== '' &&
      image[tableFilter.option] &&
      tableFilter.option === 'uploaded'
    ) {
      const BYONImageValue: string = relativeTime(
        currentTimeStamp,
        new Date(image.uploaded as Date).getTime(),
      );
      return !BYONImageValue.includes(tableFilter.filter);
    }
    return false;
  };
  return (
    <React.Fragment>
      <DeleteImageModal
        image={currentImage}
        isOpen={deleteImageModalVisible}
        onDeleteHandler={forceUpdate}
        onCloseHandler={() => {
          setDeleteImageModalVisible(false);
        }}
      />
      <ImportImageModal
        isOpen={importImageModalVisible}
        onCloseHandler={() => {
          setImportImageModalVisible(false);
        }}
        onImportHandler={forceUpdate}
      />
      <UpdateImageModal
        image={currentImage}
        isOpen={updateImageModalVisible}
        onUpdateHandler={forceUpdate}
        onCloseHandler={() => {
          setUpdateImageModalVisible(false);
        }}
      />
      <Toolbar data-id="toolbar-items">
        <ToolbarContent>{items}</ToolbarContent>
      </Toolbar>
      <TableComposable
        className={tableFilter.count === 0 ? 'empty-table' : ''}
        aria-label="Notebook images table"
        variant="compact"
      >
        <Thead>
          <Tr>
            <Td />
            <Th sort={getSortParams(0)}>{columnNames.name}</Th>
            <Th sort={getSortParams(1)}>{columnNames.description}</Th>
            <Th>Enable</Th>
            <Th sort={getSortParams(3)}>{columnNames.user}</Th>
            <Th sort={getSortParams(4)}>{columnNames.uploaded}</Th>
            <Td />
          </Tr>
        </Thead>
        {tableFilter.count > 0 ? (
          sortedImages.map((image, rowIndex) => {
            const packages: React.ReactNode[] = [];
            image.packages?.forEach((nbpackage) => {
              packages.push(<p>{`${nbpackage.name} ${nbpackage.version}`}</p>);
            });
            return (
              <Tbody key={image.id} isExpanded={isBYONImageExpanded(image)}>
                <Tr isHidden={applyTableFilter(image)}>
                  <Td
                    expand={{
                      rowIndex,
                      isExpanded: isBYONImageExpanded(image),
                      onToggle: () => setBYONImageExpanded(image, !isBYONImageExpanded(image)),
                    }}
                  />
                  <Td dataLabel={columnNames.name}>
                    <Flex
                      spaceItems={{ default: 'spaceItemsSm' }}
                      alignItems={{ default: 'alignItemsCenter' }}
                    >
                      <FlexItem>{image.name}</FlexItem>
                      <FlexItem>
                        <ImageErrorStatus image={image} />
                      </FlexItem>
                    </Flex>
                  </Td>
                  <Td dataLabel={columnNames.description}>{image.description}</Td>
                  <Td>
                    <Switch
                      className="enable-switch"
                      aria-label={`Enable Switch ${image.name}`}
                      data-id={`enabled-disable-${image.id}`}
                      isChecked={BYONImageVisible.find((value) => image.id === value.id)?.visible}
                      onChange={() => {
                        updateBYONImage({
                          id: image.id,
                          visible: !image.visible,
                          packages: image.packages,
                        });
                        setBYONImageVisible(
                          BYONImageVisible.map((value) =>
                            image.id === value.id
                              ? { id: value.id, visible: !value.visible }
                              : value,
                          ),
                        );
                      }}
                    />
                  </Td>
                  <Td dataLabel={columnNames.user}>{image.user}</Td>
                  <Td dataLabel={columnNames.uploaded}>
                    {relativeTime(currentTimeStamp, new Date(image.uploaded as Date).getTime())}
                  </Td>
                  <Td isActionCell>
                    <ActionsColumn items={rowActions(image)} />
                  </Td>
                </Tr>
                <Tr isHidden={applyTableFilter(image)} isExpanded={isBYONImageExpanded(image)}>
                  <Td dataLabel="Package Details" colSpan={Object.entries(columnNames).length}>
                    {packages.length > 0 ? (
                      <ExpandableRowContent>
                        <Flex className="included-packages">
                          <FlexItem>Packages Include</FlexItem>
                          <FlexItem className="included-packages-font">{packages}</FlexItem>
                        </Flex>
                      </ExpandableRowContent>
                    ) : (
                      <EmptyState variant={EmptyStateVariant.small}>
                        <EmptyStateIcon icon={CubesIcon} />
                        <Title headingLevel="h2" size="lg">
                          No packages detected
                        </Title>
                        <EmptyStateBody>Edit the image to add packages</EmptyStateBody>
                      </EmptyState>
                    )}
                  </Td>
                </Tr>
              </Tbody>
            );
          })
        ) : (
          <Tbody>
            <Tr>
              <Td colSpan={8}>
                <Bullseye>
                  <EmptyState variant={EmptyStateVariant.small}>
                    <EmptyStateIcon icon={SearchIcon} />
                    <Title headingLevel="h2" size="lg">
                      No results found
                    </Title>
                    <EmptyStateBody>Clear all filters and try again.</EmptyStateBody>
                    <Button
                      variant="link"
                      onClick={() => {
                        setTableFilter({
                          filter: '',
                          option: tableFilter.option,
                          count: images.length,
                        });
                      }}
                    >
                      Clear all filters
                    </Button>
                  </EmptyState>
                </Bullseye>
              </Td>
            </Tr>
          </Tbody>
        )}
      </TableComposable>
    </React.Fragment>
  );
};
