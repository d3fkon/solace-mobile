/* eslint-disable react-hooks/exhaustive-deps */
import {useNavigation} from '@react-navigation/native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useContext, useEffect} from 'react';
import {showMessage} from 'react-native-flash-message';
import {SolaceSDK, KeyPair} from 'solace-sdk';
import {AuthStackParamList} from '../../../navigation/Auth';
import {setAccountStatus, setSDK, setUser} from '../../../state/actions/global';
import {
  AccountStatus,
  AppState,
  GlobalContext,
  User,
} from '../../../state/contexts/GlobalContext';
import {getFeePayer} from '../../../utils/apis';
import {AwsCognito} from '../../../utils/aws_cognito';
import {
  NETWORK,
  PROGRAM_ADDRESS,
  TEST_PRIVATE_KEY,
} from '../../../utils/constants';
import {
  StorageDeleteItem,
  StorageGetItem,
  StorageSetItem,
} from '../../../utils/storage';
import Loading from '../loading/Loading';

type AuthScreenProps = NativeStackScreenProps<AuthStackParamList, 'Loading'>;

const AuthLoading = () => {
  const {state, dispatch} = useContext(GlobalContext);

  console.log('AUTH LOADING');

  const navigation = useNavigation<AuthScreenProps['navigation']>();

  const createTestWallet = async () => {
    // setIsLoading({message: 'creating...', value: true});
    const user = await StorageGetItem('user');
    const privateK = Uint8Array.from(TEST_PRIVATE_KEY.split(',').map(e => +e));
    const keypair = KeyPair.fromSecretKey(privateK);
    const sdk = await SolaceSDK.retrieveFromName(user.solaceName, {
      network: NETWORK,
      owner: keypair,
      programAddress: PROGRAM_ADDRESS,
    });
    dispatch(
      setUser({
        ...state.user,
        isWalletCreated: true,
        ownerPrivateKey: TEST_PRIVATE_KEY,
      }),
    );
    dispatch(setSDK(sdk));
    await StorageSetItem('user', {
      ...state.user,
      isWalletCreated: true,
      ownerPrivateKey: TEST_PRIVATE_KEY,
    });
    // setLoading({message: '', value: false});
    dispatch(setAccountStatus(AccountStatus.ACTIVE));
  };

  const retrieveAccount = async (user: User) => {
    try {
      const privateKey = user.ownerPrivateKey;
      const tokens = await StorageGetItem('tokens');
      const solaceName = user.solaceName;
      // console.log('from retrieve account', {tokens, solaceName});
      const keypair = KeyPair.fromSecretKey(
        Uint8Array.from(privateKey.split(',').map(e => +e)),
      );
      const sdk = await SolaceSDK.retrieveFromName(solaceName, {
        network: NETWORK,
        owner: keypair,
        programAddress: PROGRAM_ADDRESS,
      });
      console.log('From storage: ', keypair.publicKey.toString());
      console.log('From sdk: ', sdk.owner.publicKey.toString());
      console.log('WALLET ADDRESS', sdk.wallet.toString());
      // console.log(await sdk.fetchOngoingTransfers());
      console.log(await sdk.fetchWalletData());
      dispatch(setSDK(sdk));
      dispatch(setAccountStatus(AccountStatus.ACTIVE));
    } catch (e: any) {
      if (e.message === 'Request failed with status code 401') {
        navigation.navigate('Loading');
        return;
      }
      showMessage({
        message: 'error retrieving accout, contact solace team',
        type: 'default',
      });
      console.log('ERROR RETRIEVING ACCOUNT');
    }
  };

  const getScreen = async () => {
    try {
      const appState = await StorageGetItem('appState');
      if (appState === AppState.TESTING) {
        await createTestWallet();
        return;
      }
      const tokens = await StorageGetItem('tokens');
      if (!tokens) {
        navigation.reset({
          index: 0,
          routes: [{name: 'Login'}],
        });
      }
      await getFeePayer();
      const user = await StorageGetItem('user');
      await retrieveAccount(user);
    } catch (e: any) {
      // await StorageDeleteItem('tokens');
      if (
        e === 'TOKEN_NOT_AVAILABLE' ||
        e.message === 'Request failed with status code 401'
      ) {
        // navigation.reset({
        //   index: 0,
        //   routes: [{name: 'Login'}],
        // });
        const tokens = await StorageGetItem('tokens');
        if (!tokens) {
          navigation.reset({
            index: 0,
            routes: [{name: 'Login'}],
          });
        }
        const username = state.user?.solaceName;
        console.log({tokens, username});
        try {
          const awsCognito = new AwsCognito();
          awsCognito.setCognitoUser(username!);
          const res = await awsCognito.refreshSession(tokens.refreshtoken);

          console.log('refresh response: ', res);
        } catch (err) {
          console.log(err);
        }
        navigation.reset({
          index: 0,
          routes: [{name: 'Login'}],
        });
        return;
      }
      showMessage({
        message: 'service unavailable',
        type: 'danger',
      });
    }
  };

  useEffect(() => {
    getScreen();
  }, []);

  return <Loading />;
};
export default AuthLoading;
