import React from 'react';
import { ScrollView, Text, View } from 'react-native';

import { useGroupChannel } from '@sendbird/uikit-chat-hooks';
import { createGroupChannelFragment, createGroupChannelModule, useSendbirdChat } from '@sendbird/uikit-react-native';
import { useUIKitTheme } from '@sendbird/uikit-react-native-foundation';

import { useAppNavigation } from '../../../hooks/useAppNavigation';
import { Routes } from '../../../libs/navigation';

const { Input } = createGroupChannelModule();
const GroupChannelFragment = createGroupChannelFragment({
  // Add custom quick replies view to Input component
  Input: (props) => {
    const { colors } = useUIKitTheme();
    return (
      <>
        <ScrollView
          horizontal
          style={{ maxHeight: 32 }}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, justifyContent: 'flex-end', minWidth: '100%' }}
        >
          {['I have arrived', "I'm on my way", 'Quick reply 3', 'Quick reply 4', 'Quick reply 5'].map((it) => {
            return (
              <View
                key={it}
                style={{
                  borderColor: colors.primary,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 1,
                  marginRight: 8,
                  paddingHorizontal: 8,
                  borderRadius: 8,
                }}
              >
                <Text onPress={() => props.onPressSendUserMessage({ message: it })} style={{ color: colors.primary }}>
                  {it}
                </Text>
              </View>
            );
          })}
        </ScrollView>
        <Input {...props} />
      </>
    );
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
    />
  );
};

export default GroupChannelScreen;
