import React from 'react';
import { View } from 'react-native';

import { UserMessage } from '@sendbird/chat/message';
import { useGroupChannel } from '@sendbird/uikit-chat-hooks';
import { GroupChannelMessageRenderer, createGroupChannelFragment, useSendbirdChat } from '@sendbird/uikit-react-native';
import { GroupChannelMessage, type GroupChannelMessageProps, Text } from '@sendbird/uikit-react-native-foundation';
import GroupChannelMessageOutgoingStatus from '@sendbird/uikit-react-native/src/components/GroupChannelMessageRenderer/GroupChannelMessageOutgoingStatus';

import { useAppNavigation } from '../../../hooks/useAppNavigation';
import { Routes } from '../../../libs/navigation';

const GroupChannelFragment = createGroupChannelFragment();

const YOUR_SCHEME = 'scheme://';

const SchemeUserMessage = (props: GroupChannelMessageProps<UserMessage>) => {
  const { currentUser } = useSendbirdChat();
  const variant = props.message.sender.userId === currentUser?.userId ? 'outgoing' : 'incoming';

  const onPressScheme = (scheme: string) => {
    alert('clicked: ' + scheme);
    // Linking.openURL(scheme);
  };

  return (
    <View style={{ paddingHorizontal: 16 }}>
      <GroupChannelMessage.User
        {...props}
        sendingStatus={
          variant === 'outgoing' && (
            <GroupChannelMessageOutgoingStatus channel={props.channel} message={props.message} />
          )
        }
        message={props.message}
        variant={variant}
        groupedWithPrev={false}
        groupedWithNext={false}
        regexTextPatterns={[
          {
            regex: new RegExp(`${YOUR_SCHEME}(.+)`, 'g'),
            replacer(params) {
              return (
                <Text {...params.parentProps} onPress={() => onPressScheme(params.match)}>
                  {params.match}
                </Text>
              );
            },
          },
        ]}
      />
    </View>
  );
};

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
          return (
            <SchemeUserMessage {...props} message={props.message} groupedWithNext={false} groupedWithPrev={false} />
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
