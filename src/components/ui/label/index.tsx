import classnames from 'classnames';
import { Component, type LabelHTMLAttributes } from 'react';
import injectSheet, { type WithStylesProps } from 'react-jss';

import type { IFormField } from '../typings/generic';

import styles from './styles';

interface ILabel
  extends IFormField,
    LabelHTMLAttributes<HTMLLabelElement>,
    WithStylesProps<typeof styles> {
  isRequired?: boolean;
}

class LabelComponent extends Component<ILabel> {
  render() {
    const {
      title,
      showLabel = true,
      classes,
      className,
      children,
      htmlFor,
      isRequired,
    } = this.props;

    if (!showLabel) return children;

    return (
      <label
        className={classnames({
          [`${className}`]: className,
        })}
        htmlFor={htmlFor}
      >
        {showLabel && (
          <span className={classes.label}>
            {title}
            {isRequired && ' *'}
          </span>
        )}
        <div className={classes.content}>{children}</div>
      </label>
    );
  }
}

export default injectSheet(styles, { injectTheme: true })(LabelComponent);
