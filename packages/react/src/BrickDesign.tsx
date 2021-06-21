import React, {
  IframeHTMLAttributes,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import {
  clearHovered,
  PageConfigType,
  STATE_PROPS,
  getStore,
  ROOT,
} from '@brickd/core';
import ReactDOM from 'react-dom';
import { BrickStore, StaticContextProvider } from '@brickd/hooks';
import { BrickContext } from 'components/BrickProvider';
import { getDragSourceFromKey, iframeSrcDoc, getIframe, getDragKey } from './utils'
import Distances from './components/Distances';
import GuidePlaceholder from './components/GuidePlaceholder';
import { useSelector } from './hooks/useSelector';
import StateDomainWrapper from './wrappers/StateDomainWrapper';
import {
  OperateProvider,
  OperateStateType,
} from './components/OperateProvider';
import OperationPanel from './components/OperationPanel';
import BoxModel from './components/BoxModel';
/**
 * 鼠标离开设计区域清除hover状态
 */
export interface BrickDesignProps extends IframeHTMLAttributes<any> {
  onLoadEnd?: () => void;
  operateStore?: BrickStore<OperateStateType>;
  [propName: string]: any;
}

const stateSelector: STATE_PROPS[] = ['pageConfig'];

type BrickdHookState = {
  pageConfig: PageConfigType;
};

const controlUpdate = (
  prevState: BrickdHookState,
  nextState: BrickdHookState,
) => {
  const { pageConfig: prevPageConfig } = prevState;
  const { pageConfig } = nextState;
  const nextRootComponent = pageConfig[ROOT];
  const prevRootComponent = prevPageConfig[ROOT];
  return nextRootComponent !== prevRootComponent;
};

function BrickDesign(brickdProps: BrickDesignProps) {
  const { onLoadEnd, pageName, options, operateStore, ...props } = brickdProps;
  const { pageConfig = {} } = useSelector<BrickdHookState, STATE_PROPS>(
    stateSelector,
    controlUpdate,
  );
  const rootComponent = pageConfig[ROOT];

  const staticState = useMemo(() => ({ options, pageName }), [
    pageName,
    options,
  ]);

  const onMouseLeave = useCallback((event: Event) => {
    event.stopPropagation();
    if(getDragKey()) return;
    clearHovered();
    operateStore.setPageState({
      hoverNode: null,
      operateHoverKey: null,
    });
  }, []);

  const renderComponent = useCallback((pageConfig: PageConfigType) => {
    const rootComponent = pageConfig[ROOT];
    if (!rootComponent) return null;
    const specialProps = { domTreeKeys: [ROOT], key: ROOT, parentKey: '' };
    return (
      <StateDomainWrapper
        {...props}
        onMouseLeave={onMouseLeave}
        specialProps={specialProps}
      />
    );
  }, []);

  const designPage = useMemo(() => renderComponent(pageConfig), [pageConfig]);
  const divContainer = useRef(null);

  const componentMount = useCallback(
    (divContainer, designPage) => {
      ReactDOM.render(
        <StaticContextProvider value={staticState}>
          <OperateProvider value={operateStore}>
            <BrickContext.Provider value={getStore()}>
              {designPage}
              <Distances />
              <OperationPanel />
              <BoxModel />
              <GuidePlaceholder />
            </BrickContext.Provider>
          </OperateProvider>
        </StaticContextProvider>,
        divContainer.current,
      );
    },
    [staticState],
  );

  const onDragEnter = useCallback(() => {
    if (rootComponent) return;
    componentMount(
      divContainer,
      renderComponent(getDragSourceFromKey('vDOMCollection', {})),
    );
  }, [componentMount, divContainer, rootComponent]);

  const onDragLeave = useCallback(() => {
    if (!rootComponent) {
      ReactDOM.unmountComponentAtNode(divContainer.current);
    }
  }, [divContainer.current, rootComponent]);

  const onIframeLoad = useCallback(() => {
    const head = document.head.cloneNode(true);
    const { contentDocument } = getIframe();
    contentDocument.head.remove();
    contentDocument.documentElement.insertBefore(head, contentDocument.body);
    divContainer.current = contentDocument.getElementById('dnd-container');
    componentMount(divContainer, designPage);
    onLoadEnd && onLoadEnd();
  }, [designPage, onLoadEnd, componentMount]);

  useEffect(() => {
    const { contentWindow } = getIframe();
    contentWindow.addEventListener('dragenter', onDragEnter);
    contentWindow.addEventListener('dragleave', onDragLeave);
    return () => {
      contentWindow.removeEventListener('dragenter', onDragEnter);
      contentWindow.removeEventListener('dragleave', onDragLeave);
    };
  }, [onDragEnter, onDragLeave]);

  useEffect(() => {
    if (divContainer.current) {
      componentMount(divContainer, designPage);
    }
  }, [componentMount, designPage]);

  return (
    <iframe
      id="dnd-iframe"
      style={{ border: 0, width: '100%', height: '100%' }}
      srcDoc={iframeSrcDoc}
      onLoad={onIframeLoad}
      {...props}
    />
  );
}

export default memo(BrickDesign);
