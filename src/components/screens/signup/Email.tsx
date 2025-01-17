/* eslint-disable react-hooks/exhaustive-deps */
import {View, ActivityIndicator} from 'react-native';
import React, {useContext, useEffect, useState} from 'react';
import {
  AccountStatus,
  AppState,
  GlobalContext,
} from '../../../state/contexts/GlobalContext';
import {
  setAccountStatus,
  setAwsCognito,
  setUser,
} from '../../../state/actions/global';
import {AwsCognito} from '../../../utils/aws_cognito';
import {showMessage} from 'react-native-flash-message';
import SolaceButton from '../../common/solaceui/SolaceButton';
import SolaceContainer from '../../common/solaceui/SolaceContainer';
import SolaceInput from '../../common/solaceui/SolaceInput';
import SolacePasswordInput from '../../common/solaceui/SolacePasswordInput';
import SolaceText from '../../common/solaceui/SolaceText';
import Header from '../../common/Header';
import {
  EMAIL_REGEX,
  OTP_REGEX,
  PASSWORD_REGEX,
  TEST_EMAIL,
  TEST_PASSWORD,
} from '../../../utils/constants';
import {StorageSetItem} from '../../../utils/storage';

const EmailScreen = () => {
  const [username, setUsername] = useState({
    value: '',
    isValid: false,
  });
  const [email, setEmail] = useState({
    value: '',
    isValid: false,
  });
  const [password, setPassword] = useState({
    value: '',
    isValid: false,
  });
  const [otp, setOtp] = useState({
    value: '',
    isValid: false,
    isVerified: false,
  });
  const [active, setActive] = useState('email');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const {state, dispatch} = useContext(GlobalContext);

  useEffect(() => {
    validateEmail(email.value);
    validatePassword(password.value);
    validateUsername(username.value);
  }, []);

  const validateEmail = (value: string) => {
    if (isOtpSent) {
      setIsOtpSent(false);
    }
    setEmail({value, isValid: EMAIL_REGEX.test(value)});
  };
  const validatePassword = (value: string) => {
    if (isOtpSent) {
      setIsOtpSent(false);
    }
    setPassword({value, isValid: PASSWORD_REGEX.test(value)});
  };
  const validateUsername = (value: string) => {
    if (isOtpSent) {
      setIsOtpSent(false);
    }
    setUsername({value, isValid: value.trim().length > 0});
  };
  const validateOtp = (value: string) => {
    setOtp({value, isVerified: false, isValid: OTP_REGEX.test(value)});
  };

  const handleMailSubmit = async () => {
    if (email.value === TEST_EMAIL && password.value === TEST_PASSWORD) {
      await StorageSetItem('appstate', AppState.TESTING);
      await StorageSetItem('user', {
        solaceName: username.value,
      });
      dispatch(
        setUser({
          solaceName: username.value,
        }),
      );
      dispatch(setAccountStatus(AccountStatus.SIGNED_UP));
    } else {
      const awsCognito = new AwsCognito();
      awsCognito.setCognitoUser(username.value);
      dispatch(setAwsCognito(awsCognito));
      if (!awsCognito) {
        showMessage({
          message: 'server error! try again later',
          type: 'danger',
        });
        return;
      }
      try {
        setIsLoading(true);
        await awsCognito?.emailSignUp(
          username.value,
          email.value,
          password.value,
        );
        dispatch(
          setUser({
            solaceName: username.value,
          }),
        );
        setIsOtpSent(true);
        showMessage({
          message: 'OTP sent to the provided mail',
          type: 'success',
        });
      } catch (e: any) {
        showMessage({
          message: e.message,
          type: 'danger',
        });
      }
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const awsCognito = state.awsCognito;
    if (!awsCognito) {
      showMessage({
        message: 'server error. try again later',
        type: 'danger',
      });
      return;
    }
    try {
      setIsLoading(true);
      await awsCognito?.confirmRegistration(otp.value);
      setOtp({...otp, isVerified: true});
      await StorageSetItem('user', {
        solaceName: username.value,
      });
      await StorageSetItem('appstate', AppState.SIGNUP);
      setIsLoading(false);
      dispatch(setAccountStatus(AccountStatus.SIGNED_UP));
    } catch (e: any) {
      setIsLoading(false);
      showMessage({
        message: e.message,
        type: 'danger',
      });
    }
  };

  const isDisable = () => {
    if (email.value === TEST_EMAIL && password.value === TEST_PASSWORD) {
      return false;
    }
    return (
      !username.isValid ||
      !email.isValid ||
      !password.isValid ||
      isLoading ||
      otp.isVerified
    );
  };

  return (
    <SolaceContainer>
      <View style={{flex: 1}}>
        <Header
          heading={`enter ${active}`}
          subHeading={
            'we’ll notify you of important or suspicious activity on your wallet'
          }
        />
        <SolaceInput
          placeholder="username"
          onFocus={() => setActive('username')}
          mt={16}
          value={username.value}
          onChangeText={text => validateUsername(text)}
          style={[!username.isValid ? {borderBottomColor: 'red'} : {}]}
        />
        <SolaceInput
          placeholder="email address"
          onFocus={() => setActive('email')}
          mt={16}
          value={email.value}
          onChangeText={text => validateEmail(text)}
          style={[!email.isValid ? {borderBottomColor: 'red'} : {}]}
        />
        <SolacePasswordInput
          placeholder="password"
          value={password.value}
          onFocus={() => setActive('password')}
          onChangeText={text => validatePassword(text)}
          mt={16}
          style={[
            !password.isValid && !(password.value === TEST_PASSWORD)
              ? {borderBottomColor: 'red'}
              : {},
          ]}
        />
        {!password.isValid && !(password.value === TEST_PASSWORD) && (
          <SolaceText
            type="secondary"
            size="xs"
            color="normal"
            align="left"
            mt={8}>
            must be at least 8 characters long, contain at least one lowercase
            letter, one uppercase letter, one number, and one special character
          </SolaceText>
        )}
        {isOtpSent && (
          <SolaceInput
            placeholder="enter 6 digit otp"
            onFocus={() => setActive('otp')}
            keyboardType="number-pad"
            mt={16}
            value={otp.value}
            onChangeText={text => validateOtp(text)}
          />
        )}
      </View>
      {isLoading && (
        <View style={{flex: 1}}>
          <ActivityIndicator size="small" color="#fff" />
        </View>
      )}

      <SolaceButton
        onPress={() => {
          isOtpSent ? handleVerifyOtp() : handleMailSubmit();
        }}
        loading={isLoading}
        background="purple"
        disabled={isDisable()}>
        <SolaceText type="secondary" weight="bold" color="white">
          {isOtpSent ? 'verify otp' : 'send otp'}
        </SolaceText>
      </SolaceButton>
    </SolaceContainer>
  );
};

export default EmailScreen;
