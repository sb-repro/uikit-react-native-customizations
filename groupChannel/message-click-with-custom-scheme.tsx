import React from 'react';
import { View } from 'react-native';

import { useGroupChannel } from '@sendbird/uikit-chat-hooks';
import { GroupChannelMessageRenderer, createGroupChannelFragment, useSendbirdChat } from '@sendbird/uikit-react-native';
import { GroupChannelMessage, Text } from '@sendbird/uikit-react-native-foundation';

import { useAppNavigation } from '../../../hooks/useAppNavigation';
import { Routes } from '../../../libs/navigation';

const GroupChannelFragment = createGroupChannelFragment();

const YOUR_SCHEME = 'scheme://';

const GroupChannelScreen = () => {
  const { navigation, params } = useAppNavigation<Routes.GroupChannel>();

  const { sdk } = useSendbirdChat();
  const { channel } = useGroupChannel(sdk, params.channelUrl);
  if (!channel) return null;

  return (
    <GroupChannelFragment
      channel={channel}
      searchItem={params.searchItem}
      renderMessage={(props) => {
        if (props.message.isUserMessage() && props.message.message.includes(YOUR_SCHEME)) {
          const variant = props.message.sender.userId === sdk.currentUser?.userId ? 'outgoing' : 'incoming';
          return (
            <View style={{ paddingHorizontal: 16 }}>
              <GroupChannelMessage.User
                {...props}
                message={props.message}
                variant={variant}
                groupedWithPrev={false}
                groupedWithNext={false}
                regexTextPatterns={[
                  {
                    regex: new RegExp(`${YOUR_SCHEME}(.+)`, 'g'),
                    replacer(params) {
                      return (
                        <Text {...params.parentProps} onPress={() => alert('clicked: ' + params.match)}>
                          {params.match}
                        </Text>
                      );
                    },
                  },
                ]}
              />
            </View>
          );
        }
        return <GroupChannelMessageRenderer {...props} />;
      }}
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
      onPressReplyMessageInThread={(message, startingPoint) => {
        // Navigate to thread
        if (message) {
          navigation.push(Routes.GroupChannelThread, {
            channelUrl: params.channelUrl,
            serializedMessage: message.serialize(),
            startingPoint: startingPoint,
          });
        }
      }}
      // messageListQueryParams={{
      //   prevResultLimit: 20,
      //   customTypesFilter: ['filter'],
      // }}
    />
  );
};

export default GroupChannelScreen;
