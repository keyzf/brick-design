import React, { memo, useCallback, useRef, useState } from 'react';
import { map } from 'lodash';
import Collapse, { Panel } from 'rc-collapse';
import styles from './index.less';
import SearchBar from '../Components/SearchBar';
import { arrowIcon } from '../../../assets';
import SearchResult, {
  CategoryInfoType,
  CategoryType,
  renderDragItem,
  SearchRefType,
} from './SearchResult';

/**
 * 渲染折叠Header
 */
function renderHeader(categoryName: string, isFold: boolean) {
  return (
    <div className={styles['fold-header']}>
      <img
        src={arrowIcon}
        className={isFold ? styles.rotate90 : ''}
        style={{
          marginLeft: '5px',
          marginRight: '5px',
          transition: 'all 0.2s',
        }}
      />
      <span>{categoryName}</span>
    </div>
  );
}

export interface BrickPreviewPropsType {
  componentsCategory: CategoryType;
}

function BrickPreview(props: BrickPreviewPropsType) {
  const { componentsCategory } = props;
  const [openKeys = [], setOpenKeys] = useState<string[]>([]);
  const searchRef = useRef<SearchRefType>();
  const [isShowSearch, setIsShowSearch] = useState(false);
  /**
   * 搜搜指定组件
   */
  const onChange = useCallback(
    (value: any) => {
      if (value) {
        if (!isShowSearch) {
          setIsShowSearch(true);
        }
        searchRef.current.changeSearch(value);
      } else if (isShowSearch) {
        setIsShowSearch(false);
      }
    },
    [setIsShowSearch, isShowSearch],
  );

  return (
    <div className={styles['container']}>
      <SearchBar onChange={onChange}>
        <div
          style={{ display: !isShowSearch ? 'flex' : 'none' }}
          className={styles['fold-container']}
        >
          <Collapse
            activeKey={openKeys}
            style={{ backgroundColor: '#fff', border: 0 }}
            onChange={(newOpenKeys: any) => setOpenKeys(newOpenKeys)}
          >
            {map(
              componentsCategory,
              (categoryInfo: CategoryInfoType, categoryName) => {
                const isFold = openKeys.includes(categoryName);
                return (
                  <Panel
                    headerClass={styles['fold-panel-header']}
                    style={{ border: 0, padding: 0 }}
                    header={renderHeader(categoryName, isFold)}
                    key={categoryName}
                    showArrow={false}
                  >
                    <div className={styles['fold-content']}>
                      {map(categoryInfo, renderDragItem)}
                    </div>
                  </Panel>
                );
              },
            )}
          </Collapse>
        </div>
        <SearchResult
          componentsCategory={componentsCategory}
          ref={searchRef}
          style={{ display: isShowSearch ? 'block' : 'none' }}
        />
      </SearchBar>
    </div>
  );
}

export default memo<BrickPreviewPropsType>(BrickPreview);
