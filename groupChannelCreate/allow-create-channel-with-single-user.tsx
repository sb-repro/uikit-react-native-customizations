import React from 'react';

import { createGroupChannelCreateFragment, createUserListModule, useSendbirdChat } from '@sendbird/uikit-react-native';
import { Icon } from '@sendbird/uikit-react-native-foundation';
import type { SendbirdUser } from '@sendbird/uikit-utils';

import { useAppNavigation } from '../../../hooks/useAppNavigation';
import { Routes } from '../../../libs/navigation';

const Header = createUserListModule<SendbirdUser>().Header;
const GroupChannelCreateFragment = createGroupChannelCreateFragment<SendbirdUser>({
  Header(props) {
    return <Header {...props} shouldActivateHeaderRight={() => true} />;
  },
});

const GroupChannelCreateScreen = () => {
  const { navigation, params } = useAppNavigation<Routes.GroupChannelCreate>();

  return (
    <GroupChannelCreateFragment
      channelType={params.channelType}
      onBeforeCreateChannel={(channelParams) => {
        // Customize channel params before create
        return channelParams;
      }}
      onCreateChannel={async (channel) => {
        // Navigate to created group channel
        navigation.replace(Routes.GroupChannel, { channelUrl: channel.url });
      }}
      onPressHeaderLeft={() => {
        // Navigate back
        navigation.goBack();
      }}
    />
  );
};

export default GroupChannelCreateScreen
