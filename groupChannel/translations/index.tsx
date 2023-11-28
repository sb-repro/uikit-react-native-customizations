import React from 'react';

import { useGroupChannel } from '@sendbird/uikit-chat-hooks';
import { createGroupChannelFragment, useSendbirdChat } from '@sendbird/uikit-react-native';
import { useAppNavigation } from '../../../hooks/useAppNavigation';
import { Routes } from '../../../libs/navigation';

// Here: import custom message renderer
import { MyCustomMessageRenderer } from './custom-renderer.tsx';

const GroupChannelFragment = createGroupChannelFragment();

const GroupChannelScreen = () => {
  const { navigation, params } = useAppNavigation<Routes.GroupChannel>();

  const { sdk } = useSendbirdChat();
  const { channel } = useGroupChannel(sdk, params.channelUrl);

  if (!channel) return null;

  return (
    <GroupChannelFragment
      channel={channel}
      searchItem={params.searchItem}
      // Here: render custom message renderer
      renderMessage={(props) => <MyCustomMessageRenderer {...props} />}
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
    />
  );
};

export default GroupChannelScreen;
