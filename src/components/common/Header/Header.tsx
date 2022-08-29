import React, {FC} from 'react';
import SolaceText from '../SolaceUI/SolaceText/SolaceText';

type Props = {
  heading: string;
  subHeading: string;
};

const Header: FC<Props> = ({heading, subHeading}) => {
  return (
    <>
      <SolaceText weight="semibold" variant="white" size="xl" align="left">
        {heading}
      </SolaceText>
      <SolaceText type="secondary" weight="bold" align="left" variant="light">
        {subHeading}
      </SolaceText>
    </>
  );
};

export default Header;
