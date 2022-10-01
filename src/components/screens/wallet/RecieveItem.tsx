/* eslint-disable react-hooks/exhaustive-deps */
import {View, ActivityIndicator} from 'react-native';
import React, {useContext, useEffect, useState} from 'react';

import {
  AccountStatus,
  GlobalContext,
} from '../../../state/contexts/GlobalContext';
import SolaceContainer from '../../common/solaceui/SolaceContainer';
import TopNavbar from '../../common/TopNavbar';
import SolaceCustomInput from '../../common/solaceui/SolaceCustomInput';
import SolaceText from '../../common/solaceui/SolaceText';
import globalStyles from '../../../utils/global_styles';
import Clipboard from '@react-native-community/clipboard';
import {showMessage} from 'react-native-flash-message';
import {PublicKey} from 'solace-sdk';
import QRCode from 'react-native-qrcode-svg';
import SolaceButton from '../../common/solaceui/SolaceButton';
import SolaceLoader from '../../common/solaceui/SolaceLoader';
import {setAccountStatus} from '../../../state/actions/global';
import {useQuery, useQueryClient} from '@tanstack/react-query';
import {getTokenAccount} from '../../../apis/sdk';
import {useRefreshOnFocus} from '../../../hooks/useRefreshOnFocus';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {WalletStackParamList} from '../../../navigation/Wallet';
import {useNavigation, useRoute} from '@react-navigation/native';

type WalletScreenProps = NativeStackScreenProps<
  WalletStackParamList,
  'RecieveItem'
>;

export type Account = {
  amount: number;
  tokenAddress: string;
};

const RecieveItem = () => {
  const {state, dispatch} = useContext(GlobalContext);
  const navigation = useNavigation<WalletScreenProps['navigation']>();
  const route = useRoute<WalletScreenProps['route']>();
  const spltoken = route.params.token;

  const {
    data: addressToken,
    isLoading,
    isFetching,
  } = useQuery(['tokenaccount'], () => getTokenAccount(state?.sdk!, spltoken), {
    enabled: !!state?.sdk && !!spltoken,
  });

  const queryClient = useQueryClient();
  const refresh = async () => {
    isLoading && (await queryClient.invalidateQueries(['tokenaccount']));
  };

  useRefreshOnFocus(refresh);

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleCopy = (text: string) => {
    Clipboard.setString(text);
    showMessage({
      message: 'address copied',
    });
  };

  const address = state.sdk?.wallet!?.toString();
  const headerTitle = address
    ? `${address.slice(0, 5)}...${address.slice(-5)}`
    : '-';

  const goToLogin = () => {
    dispatch(setAccountStatus(AccountStatus.EXISITING));
  };

  if (isLoading) {
    return (
      <SolaceContainer>
        <SolaceLoader text="loading">
          <ActivityIndicator size="small" />
        </SolaceLoader>
      </SolaceContainer>
    );
  }

  return (
    <SolaceContainer>
      <TopNavbar
        startIcon="ios-return-up-back"
        startIconType="ionicons"
        text={`recieve ${headerTitle}`}
        startClick={handleGoBack}
      />
      {address ? (
        <View style={globalStyles.fullCenter}>
          <View style={[globalStyles.rowCenter, {flex: 0.5}]}>
            <View
              style={{borderColor: 'white', borderWidth: 20, borderRadius: 20}}>
              <QRCode
                value={addressToken ? addressToken : 'no-address'}
                size={180}
              />
            </View>
          </View>
          <View style={[globalStyles.fullWidth, {flex: 0.5, paddingTop: 12}]}>
            <SolaceText
              mt={10}
              mb={10}
              type="primary"
              weight="semibold"
              align="left">
              associated token address
            </SolaceText>
            <SolaceCustomInput
              editable={false}
              placeholder="username or address"
              iconName="content-copy"
              handleIconPress={() => handleCopy(address)}
              value={addressToken}
              iconType="mci"
            />
            <SolaceText
              mt={20}
              mb={10}
              type="primary"
              weight="semibold"
              align="left">
              vault address
            </SolaceText>
            <SolaceCustomInput
              editable={false}
              placeholder="username or address"
              iconName="content-copy"
              handleIconPress={() => handleCopy(address)}
              value={address}
              iconType="mci"
            />
          </View>
        </View>
      ) : (
        <View style={globalStyles.fullCenter}>
          <View style={globalStyles.fullCenter}>
            <SolaceText>there was an error. please login again</SolaceText>
          </View>
          <SolaceButton onPress={goToLogin}>
            <SolaceText type="secondary" color="black" weight="bold">
              Login
            </SolaceText>
          </SolaceButton>
        </View>
      )}
    </SolaceContainer>
  );
};

export default RecieveItem;
