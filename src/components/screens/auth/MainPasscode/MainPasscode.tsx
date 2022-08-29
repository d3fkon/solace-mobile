/* eslint-disable react-hooks/exhaustive-deps */
import {View, Image, ActivityIndicator, StyleSheet} from 'react-native';
import React, {useContext, useEffect, useState} from 'react';
import {
  AccountStatus,
  GlobalContext,
  User,
} from '../../../../state/contexts/GlobalContext';
import {setAccountStatus, setSDK} from '../../../../state/actions/global';
import {KeyPair, SolaceSDK} from 'solace-sdk';
import {showMessage} from 'react-native-flash-message';
import {StorageGetItem} from '../../../../utils/storage';
import {NETWORK, PROGRAM_ADDRESS} from '../../../../utils/constants';
import SolaceContainer from '../../../common/SolaceUI/SolaceContainer/SolaceContainer';
import SolaceText from '../../../common/SolaceUI/SolaceText/SolaceText';
import PasscodeContainer, {
  PASSCODE_LENGTH,
} from '../../../common/PasscodeContainer/PasscodeContainer';
import SolaceLoader from '../../../common/SolaceUI/SolaceLoader/SolaceLoader';

const MainPasscodeScreen = () => {
  const [code, setCode] = useState('');
  const {state, dispatch} = useContext(GlobalContext);
  const [loading, setLoading] = useState({
    value: false,
    message: '',
  });

  const retrieveAccount = async (user: User) => {
    try {
      console.log('RETRIEVE ACCOUNT', user);
      setLoading({
        value: true,
        message: 'logging you in',
      });
      const privateKey = state.user?.ownerPrivateKey!;
      const solaceName = state.user?.solaceName!;
      console.log({privateKey});
      const keypair = KeyPair.fromSecretKey(
        Uint8Array.from(privateKey.split(',').map(e => +e)),
      );
      const sdk = await SolaceSDK.retrieveFromName(solaceName, {
        network: NETWORK,
        owner: keypair,
        programAddress: PROGRAM_ADDRESS,
      });
      console.log({sdk});
      dispatch(setSDK(sdk));
      setLoading({
        value: false,
        message: '',
      });
      dispatch(setAccountStatus(AccountStatus.ACTIVE));
    } catch (e) {
      setLoading({
        value: false,
        message: '',
      });
      setCode('');
      showMessage({
        message: 'error retrieving accout, contact solace team',
        type: 'default',
      });
      console.log('ERROR RETRIEVING ACCOUNT');
    }
  };

  const filled = code.length === PASSCODE_LENGTH;

  const checkPinReady = async () => {
    const user: User = await StorageGetItem('user');
    if (!user) {
      dispatch(setAccountStatus(AccountStatus.NEW));
      showMessage({
        message: 'user not found',
        type: 'danger',
      });
      return;
    }
    if (user && code === user.pin) {
      await retrieveAccount(user);
    } else {
      showMessage({
        message: 'incorrect passcode',
        type: 'danger',
      });
      setCode('');
    }
  };

  useEffect(() => {
    if (filled) {
      checkPinReady();
    }
  }, [code]);

  return (
    <SolaceContainer>
      <View style={styles.container}>
        <Image
          source={require('../../../../../assets/images/solace/solace-icon.png')}
        />
        <SolaceText mt={16} variant="white" size="xl" weight="semibold">
          solace
        </SolaceText>
      </View>
      <View style={{flex: 1}}>
        <SolaceText variant="white" size="lg" weight="semibold">
          enter passcode
        </SolaceText>
        <PasscodeContainer code={code} setCode={setCode} />
        {loading.value && (
          <SolaceLoader
            style={{justifyContent: 'flex-start'}}
            text={loading.message}>
            <ActivityIndicator style={{paddingLeft: 8}} size="small" />
          </SolaceLoader>
        )}
      </View>
    </SolaceContainer>
  );
};

export default MainPasscodeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
