import React, {FC} from 'react';
import {View} from 'react-native';
import globalStyles from '../../utils/global_styles';
import SolaceIcon from './solaceui/SolaceIcon/SolaceIcon';
import SolaceText from './solaceui/SolaceText/SolaceText';

type Props = {
  startIcon?: string;
  startIconType?: 'antdesign' | 'mci';
  text?: string;
  endIcon?: string;
  endIconType?: 'antdesign' | 'mci';
  startClick: () => void;
  endClick?: () => void;
};

const TopNavbar: FC<Props> = ({
  startIcon,
  startIconType,
  startClick,
  text,
  endIcon,
  endIconType,
  endClick,
}) => {
  return (
    <View style={globalStyles.rowSpaceBetween}>
      <View style={globalStyles.rowCenter}>
        <SolaceIcon
          name={startIcon || 'questioncircleo'}
          type="dark"
          variant={startIconType || 'antdesign'}
          onPress={startClick}
        />
        <SolaceText size="xl" weight="semibold" style={{marginLeft: 8}}>
          {text}
        </SolaceText>
      </View>
      {endIcon && (
        <SolaceIcon
          name={endIcon ?? 'questioncircleo'}
          type="dark"
          onPress={endClick}
          variant={endIconType || 'antdesign'}
        />
      )}
    </View>
  );
};

export default TopNavbar;