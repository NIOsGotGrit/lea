import classnames from 'classnames';
import { Component, type TextareaHTMLAttributes, createRef } from 'react';
import injectSheet, { type WithStylesProps } from 'react-jss';

import { noop } from 'lodash';
import type { IFormField } from '../typings/generic';

// biome-ignore lint/suspicious/noShadowRestrictedNames: <explanation>
import Error from '../error';
import Label from '../label';
import Wrapper from '../wrapper';

import styles from './styles';

interface IData {
  [index: string]: string;
}

interface IProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement>,
    IFormField,
    WithStylesProps<typeof styles> {
  data: IData;
  textareaClassName?: string;
}

class TextareaComponent extends Component<IProps> {
  private textareaRef = createRef<HTMLTextAreaElement>();

  componentDidMount() {
    const { data } = this.props;

    if (this.textareaRef?.current && data) {
      Object.keys(data).forEach(key => {
        this.textareaRef.current!.dataset[key] = data[key];
      });
    }
  }

  onChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const { onChange = noop } = this.props;

    if (onChange) {
      onChange(e);
    }
  }

  render() {
    const {
      classes,
      className,
      disabled = false,
      error,
      id,
      textareaClassName,
      label,
      showLabel = true,
      value,
      name,
      placeholder,
      spellCheck,
      onBlur = noop,
      onFocus = noop,
      minLength,
      maxLength,
      required,
      rows = 5,
      noMargin,
    } = this.props;

    return (
      <Wrapper
        className={className}
        identifier="franz-textarea"
        noMargin={noMargin}
      >
        <Label
          title={label}
          showLabel={showLabel}
          htmlFor={id}
          className={classes.label}
          isRequired={required}
        >
          <div
            className={classnames({
              [`${textareaClassName}`]: textareaClassName,
              [`${classes.wrapper}`]: true,
              [`${classes.disabled}`]: disabled,
              [`${classes.hasError}`]: error,
            })}
          >
            <textarea
              id={id}
              name={name}
              placeholder={placeholder}
              spellCheck={spellCheck}
              className={classes.textarea}
              ref={this.textareaRef}
              onChange={this.onChange.bind(this)}
              onFocus={onFocus}
              onBlur={onBlur}
              disabled={disabled}
              minLength={minLength}
              maxLength={maxLength}
              rows={rows}
            >
              {value}
            </textarea>
          </div>
        </Label>
        {error && <Error message={error} />}
      </Wrapper>
    );
  }
}

export default injectSheet(styles, { injectTheme: true })(TextareaComponent);
