import React from 'react';
import {
  Brand,
  Masthead,
  MastheadBrand,
  MastheadContent,
  MastheadMain,
  MastheadToggle,
  PageToggleButton,
} from '@patternfly/react-core';
import { BarsIcon } from '@patternfly/react-icons';
import { Link } from 'react-router-dom';
import { MCAD_LOGO, MCAD_PRODUCT_NAME } from '~/utilities/const';
import { useUser } from '~/redux/selectors';
import HeaderTools from './HeaderTools';

type HeaderProps = {
  onNotificationsClick: () => void;
};

const Header: React.FC<HeaderProps> = ({ onNotificationsClick }) => {
  const { isAllowed } = useUser();
  return (
    <Masthead role="banner" aria-label="page masthead">
      {isAllowed && (
        <MastheadToggle>
          <PageToggleButton id="page-nav-toggle" variant="plain" aria-label="Dashboard navigation">
            <BarsIcon />
          </PageToggleButton>
        </MastheadToggle>
      )}
      <MastheadMain>
        <MastheadBrand component={(props) => <Link {...props} to="/" />}>
          <Brand
            className="odh-dashboard__brand"
            src={`${window.location.origin}/images/${MCAD_LOGO}`}
            alt={`${MCAD_PRODUCT_NAME} Logo`}
            // widths={{ default: '100000px', md: '900px', xl: '900px' }}
            // heights={{ default: '900px', md: '900px', xl: '900px' }}
          />
        </MastheadBrand>
      </MastheadMain>
      <MastheadContent>
        <HeaderTools onNotificationsClick={onNotificationsClick} />
      </MastheadContent>
    </Masthead>
  );
};

export default Header;
