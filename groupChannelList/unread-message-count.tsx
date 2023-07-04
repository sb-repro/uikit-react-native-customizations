import React from 'react';

import {
  ChannelCover,
  createGroupChannelListFragment,
  useLocalization,
  useSendbirdChat,
} from '@sendbird/uikit-react-native';
import { GroupChannelPreview } from '@sendbird/uikit-react-native-foundation';

const GroupChannelListFragment = createGroupChannelListFragment();
const GroupChannelListScreen = () => {
  const { currentUser } = useSendbirdChat();
  const { STRINGS } = useLocalization();

  return (
    <GroupChannelListFragment
      onPressCreateChannel={(channelType) => {
        // navigation.navigate(Routes.GroupChannelCreate, { channelType });
      }}
      onPressChannel={(channel) => {
        // navigation.navigate(Routes.GroupChannel, { channelUrl: channel.url });
      }}
      renderGroupChannelPreview={({ channel }) => {
        return (
          <GroupChannelPreview
            badgeCount={channel.unreadMessageCount} // here
            maxBadgeCount={Infinity} // here
            title={STRINGS.GROUP_CHANNEL_LIST.CHANNEL_PREVIEW_TITLE(currentUser?.userId ?? '', channel)}
            titleCaption={STRINGS.GROUP_CHANNEL_LIST.CHANNEL_PREVIEW_TITLE_CAPTION(channel)}
            body={STRINGS.GROUP_CHANNEL_LIST.CHANNEL_PREVIEW_BODY(channel)}
            customCover={<ChannelCover channel={channel} size={48} />}
            coverUrl={channel.coverUrl}
          />
        );
      }}
    />
  );
};

export default GroupChannelListScreen;
