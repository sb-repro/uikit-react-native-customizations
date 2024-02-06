import React from 'react';

import { useGroupChannel } from '@sendbird/uikit-chat-hooks';
import { createGroupChannelFragment, createGroupChannelModule, useSendbirdChat } from '@sendbird/uikit-react-native';

import { useAppNavigation } from '../../../hooks/useAppNavigation';
import { Routes } from '../../../libs/navigation';

const { Header } = createGroupChannelModule();
const GroupChannelFragment = createGroupChannelFragment({
  Header: (props) => {
    return <Header {...props} shouldHideRight={() => true} />;
  },
});

const GroupChannelScreen = () => {
  const { navigation, params } = useAppNavigation<Routes.GroupChannel>();

  const { sdk } = useSendbirdChat();
  const { channel } = useGroupChannel(sdk, params.channelUrl);
  if (!channel) return null;

  return (
    <GroupChannelFragment
      channel={channel}
      searchItem={params.searchItem}
      onPressMediaMessage={(fileMessage, deleteMessage) => {
        // Navigate to media viewer
        navigation.navigate(Routes.FileViewer, {
          serializedFileMessage: fileMessage.serialize(),
          deleteMessage,
        });
      }}
      onChannelDeleted={() => {
        // Should leave channel, navigate to channel list
        navigation.navigate(Routes.GroupChannelList);
      }}
      onPressHeaderLeft={() => {
        // Navigate back
        navigation.goBack();
      }}
      onPressHeaderRight={() => {
        // Navigate to group channel settings
        navigation.push(Routes.GroupChannelSettings, params);
      }}
      // messageListQueryParams={{
      //   prevResultLimit: 20,
      //   customTypesFilter: ['filter'],
      // }}
    />
  );
};

export default GroupChannelScreen;
