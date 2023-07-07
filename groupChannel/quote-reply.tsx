import React, { useContext, useState } from 'react';
import { Text, View } from 'react-native';

import { MessageFilter } from '@sendbird/chat/groupChannel';
import { ReplyType } from '@sendbird/chat/message';
import { useGroupChannel } from '@sendbird/uikit-chat-hooks';
import {
  GroupChannelMessageRenderer,
  createGroupChannelFragment,
  createGroupChannelModule,
  useSendbirdChat,
} from '@sendbird/uikit-react-native';
import { useBottomSheet } from '@sendbird/uikit-react-native-foundation';
import type { SendbirdMessage } from '@sendbird/uikit-utils';

type QuoteReplyValue = {
  parentMessage?: SendbirdMessage;
  setParentMessage: (message: undefined | SendbirdMessage) => void;
};

const QuoteReplyContext = React.createContext<QuoteReplyValue>({
  setParentMessage: () => {
    /* noop */
  },
});

// TO-BE: GroupChannelContexts.Fragment -> messageToReply/setMesageToReply (equal level with `messageToEdit`)
const QuoteReplyProvider = ({ children }: { children: (params: QuoteReplyValue) => JSX.Element }) => {
  const [parentMessage, setParentMessage] = useState<SendbirdMessage | undefined>(undefined);
  const value = { parentMessage, setParentMessage };
  return <QuoteReplyContext.Provider value={value}>{children(value)}</QuoteReplyContext.Provider>;
};

const BaseInput = createGroupChannelModule().Input;
const GroupChannelFragment = createGroupChannelFragment({
  Input(props) {
    const { parentMessage } = useContext(QuoteReplyContext);
    return (
      <View>
        {parentMessage && (
          <Text>{`Reply to: ${parentMessage.isUserMessage() ? parentMessage.message : 'File message'}`}</Text>
        )}
        <BaseInput {...props} />
      </View>
    );
  },
});

const GroupChannelScreen = () => {
  const { openSheet } = useBottomSheet();
  const { sdk } = useSendbirdChat();
  const { channel } = useGroupChannel(sdk, params.channelUrl);
  if (!channel) return null;

  return (
    <QuoteReplyProvider>
      {({ parentMessage, setParentMessage }) => (
        <GroupChannelFragment
          channel={channel}
          searchItem={params.searchItem}
          onPressMediaMessage={(fileMessage, deleteMessage) => {
            // Navigate to media viewer
            // navigation.navigate(Routes.FileViewer, {
            //   serializedFileMessage: fileMessage.serialize(),
            //   deleteMessage,
            // });
          }}
          onChannelDeleted={() => {
            // Should leave channel, navigate to channel list
            // navigation.navigate(Routes.GroupChannelList);
          }}
          onPressHeaderLeft={() => {
            // Navigate back
            // navigation.goBack();
          }}
          onPressHeaderRight={() => {
            // Navigate to group channel settings
            // navigation.push(Routes.GroupChannelSettings, params);
          }}
          collectionCreator={(options) => {
            const filter = new MessageFilter();
            filter.replyType = ReplyType.ONLY_REPLY_TO_CHANNEL;
            return channel.createMessageCollection({ filter, ...options });
          }}
          onBeforeSendUserMessage={(params) => {
            if (parentMessage) {
              params.parentMessageId = parentMessage.messageId;
              params.isReplyToChannel = true;
              setParentMessage(undefined);
            }
            return params;
          }}
          renderMessage={(props) => {
            if (props.message.parentMessage) {
              return <ReplyMessage {...props} parentMessage={props.message.parentMessage} />;
            }

            return (
              <GroupChannelMessageRenderer
                {...props}
                onLongPress={() => {
                  openSheet({
                    sheetItems: [
                      {
                        title: 'Reply',
                        icon: 'reply',
                        onPress() {
                          setParentMessage(props.message);
                        },
                      },
                    ],
                  });
                }}
              />
            );
          }}
        />
      )}
    </QuoteReplyProvider>
  );
};

const ReplyMessage = (props: any) => {
  const { parentMessage } = props;
  return (
    <View>
      <View pointerEvents={'none'} style={{ opacity: 0.4, transform: [{ translateY: 30 }] }}>
        <GroupChannelMessageRenderer {...props} message={parentMessage} />
      </View>
      <GroupChannelMessageRenderer {...props} />
    </View>
  );
};

export default GroupChannelScreen;

