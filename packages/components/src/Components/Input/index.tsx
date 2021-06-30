import React, { useState, memo, useImperativeHandle, forwardRef } from 'react';
import styles from './index.less';
import deleteIcon from '../../assets/delete-icon.svg';

export interface InputProps extends React.InputHTMLAttributes<any> {
  type?:'number'
    | 'button'
    | 'checkbox'
    | 'file'
    | 'hidden'
    | 'image'
    | 'password'
    | 'radio'
    | 'reset'
    | 'submit'
    | 'text'
  ;
  onChange?: (v?: any) => void;
  closeStyle?: React.CSSProperties;
  closeAble?: boolean;
}
function Input(props: InputProps, ref: any) {
  const {
    type,
    onChange,
    closeStyle,
    closeAble = true,
    className,
    ...rest
  } = props;
  const [value, setValue] = useState('');
  useImperativeHandle(
    ref,
    () => ({
      setValue,
    }),
    [setValue],
  );

  const change = (event: any) => {
    setValue(event.target.value);
    onChange && onChange(event.target.value);
  };

  const clean = () => {
    setValue('');
    onChange && onChange(undefined);
  };
  return (
    <div className={`${styles['container']} ${className}`}>
      <input
        type={type || 'text'}
        className={styles['common-input']}
        {...rest}
        onChange={change}
        value={value}
      />
      {value !== '' && closeAble && (
        <img
          src={deleteIcon}
          style={closeStyle}
          onClick={clean}
          className={styles['close-icon']}
        />
      )}
    </div>
  );
}

export default memo(forwardRef(Input));
