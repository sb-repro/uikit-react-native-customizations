import React from 'react';

import { useGroupChannel } from '@sendbird/uikit-chat-hooks';
import {
  MessageRenderer,
  createGroupChannelFragment,
  useLocalization,
  useSendbirdChat,
} from '@sendbird/uikit-react-native';
import { useAlert, useBottomSheet } from '@sendbird/uikit-react-native-foundation';

import { useAppNavigation } from '../../hooks/useAppNavigation';
import { Routes } from '../../libs/navigation';

const GroupChannelFragment = createGroupChannelFragment();

const GroupChannelScreen = () => {
  const { navigation, params } = useAppNavigation<Routes.GroupChannel>();

  const { sdk, currentUser } = useSendbirdChat();
  const { channel } = useGroupChannel(sdk, params.channelUrl);

  const { openSheet } = useBottomSheet();
  const { alert } = useAlert();
  const { STRINGS } = useLocalization();

  if (!channel) return null;

  return (
    <GroupChannelFragment
      channel={channel}
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
      renderMessage={(props) => {
        return (
          <MessageRenderer
            {...props}
            onLongPress={() => {
              if (
                (props.message.isUserMessage() || props.message.isFileMessage()) &&
                props.message.sendingStatus === 'succeeded'
              ) {
                if (channel?.myRole === 'operator' || props.message.sender.userId === currentUser?.userId) {
                  const sendableMessage = props.message;
                  // Add the menu items that match your desired conditions to open the bottom sheet.
                  //  The default bottom sheet items are available in `props.bottomSheetItem`
                  openSheet({
                    ...props.bottomSheetItem,
                    sheetItems: [
                      ...props.bottomSheetItem.sheetItems,
                      {
                        icon: 'delete',
                        title: STRINGS.GROUP_CHANNEL.DIALOG_MESSAGE_DELETE,
                        onPress: () => {
                          alert({
                            title: STRINGS.GROUP_CHANNEL.DIALOG_MESSAGE_DELETE_CONFIRM_TITLE,
                            buttons: [
                              {
                                text: STRINGS.GROUP_CHANNEL.DIALOG_MESSAGE_DELETE_CONFIRM_CANCEL,
                              },
                              {
                                text: STRINGS.GROUP_CHANNEL.DIALOG_MESSAGE_DELETE_CONFIRM_OK,
                                style: 'destructive',
                                onPress: () => {
                                  channel?.deleteMessage(sendableMessage);
                                },
                              },
                            ],
                          });
                        },
                      },
                    ],
                  });
                }
              } else {
                props.onLongPress?.();
              }
            }}
          />
        );
      }}
    />
  );
};

export default GroupChannelScreen;
