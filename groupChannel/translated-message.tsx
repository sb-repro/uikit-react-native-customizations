import React from 'react';
import { Text, TouchableOpacity } from 'react-native';

import { useGroupChannel } from '@sendbird/uikit-chat-hooks';
import { GroupChannelMessageRenderer, createGroupChannelFragment, useSendbirdChat } from '@sendbird/uikit-react-native';

import { useAppNavigation } from '../../../hooks/useAppNavigation';
import { Routes } from '../../../libs/navigation';

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

      // Add `translationTargetLanguages` before sending user message
      onBeforeSendUserMessage={(params) => {
        params.translationTargetLanguages = ['es', 'ko'];
        return params;
      }}

      // Render message with translations + locale
      renderMessage={(props) => {
        if (props.message.isUserMessage()) {
          const locale = 'ko'; // hard-coded for example
          const translatedMessage = props.message.translations as Record<'es' | 'ko', string>;
          return (
            <TouchableOpacity onPress={props.onPress} onLongPress={props.onLongPress}>
              <Text>{translatedMessage[locale] ?? props.message.message}</Text>
            </TouchableOpacity>
          );
        }
        return <GroupChannelMessageRenderer {...props} />;
      }}
    />
  );
};

export default GroupChannelScreen;
