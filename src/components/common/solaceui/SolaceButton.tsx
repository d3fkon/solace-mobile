import React, {FC, ReactNode} from 'react';
import {ActivityIndicator, TouchableOpacity} from 'react-native';
import type {StyleProp, TouchableOpacityProps, ViewStyle} from 'react-native';
import {Colors} from '../../../utils/colors';

type Variant = keyof typeof Colors.background;

interface ButtonProps extends TouchableOpacityProps {
  style?: StyleProp<ViewStyle>;
  background?: Variant;
  fullWidth?: boolean;
  children?: ReactNode;
  loading?: boolean;
  mt?: number;
  mb?: number;
}

const SolaceButton: FC<ButtonProps> = ({
  style,
  children,
  fullWidth = true,
  background = 'light',
  loading = false,
  mt = 0,
  mb = 0,
  ...touchableProps
}) => {
  const variantStyle = (): StyleProp<ViewStyle> => {
    return {backgroundColor: Colors.background[background]};
  };

  const fullWidthStyle = (): StyleProp<ViewStyle> => {
    return fullWidth ? {width: '100%'} : {};
  };

  const disabled = touchableProps.disabled as boolean;
  const disableColor = (disabled && '#8a8a8a') as string;

  const defaultStyle: StyleProp<ViewStyle> = {
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  };

  const marginStyles = {
    marginTop: mt,
    marginBottom: mb,
  };

  return (
    <TouchableOpacity
      style={[
        variantStyle(),
        fullWidthStyle(),
        marginStyles,
        defaultStyle,
        touchableProps.disabled ? {backgroundColor: disableColor} : {},
        style,
      ]}
      {...touchableProps}>
      {loading ? <ActivityIndicator size={24} color="black" /> : children}
    </TouchableOpacity>
  );
};

export default SolaceButton;
