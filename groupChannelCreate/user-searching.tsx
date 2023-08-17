import React, { useContext } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import { createGroupChannelCreateFragment, createUserListModule, useSendbirdChat } from '@sendbird/uikit-react-native';
import { Icon } from '@sendbird/uikit-react-native-foundation';
import type { SendbirdUser } from '@sendbird/uikit-utils';

import { useAppNavigation } from '../../../hooks/useAppNavigation';
import { Routes } from '../../../libs/navigation';

const UserSearchContext = React.createContext({
  keyword: '',
  setKeyword: (_: string) => {
    /* noop */
  },
  onPressSearch: () => {
    /* noop */
  },
});

const GroupChannelInviteModule = createUserListModule<SendbirdUser>();
const GroupChannelCreateFragment = createGroupChannelCreateFragment<SendbirdUser>({
  Header: (props) => {
    const { keyword, setKeyword, onPressSearch } = useContext(UserSearchContext);
    return (
      <View>
        <GroupChannelInviteModule.Header {...props} />
        <View style={styles.inputContainer}>
          <TextInput
            placeholder={'Enter the nickname'}
            value={keyword}
            onChangeText={setKeyword}
            style={styles.input}
          />
          <TouchableOpacity onPress={onPressSearch}>
            <Icon icon={'search'} color={'black'} />
          </TouchableOpacity>
        </View>
      </View>
    );
  },
});

const GroupChannelCreateScreen = () => {
  const { navigation, params } = useAppNavigation<Routes.GroupChannelCreate>();
  const { sdk } = useSendbirdChat();

  const [keyword, setKeyword] = React.useState('');
  const [searchIndex, setSearchIndex] = React.useState(0);
  const queryCreator = () => sdk.createApplicationUserListQuery({ nicknameStartsWithFilter: keyword });

  return (
    <UserSearchContext.Provider value={{ keyword, setKeyword, onPressSearch: () => setSearchIndex((p) => p + 1) }}>
      <GroupChannelCreateFragment
        key={searchIndex}
        channelType={params.channelType}
        queryCreator={queryCreator}
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
    </UserSearchContext.Provider>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    marginHorizontal: 12,
    marginVertical: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#ededed',
  },
  input: {
    fontSize: 14,
    flex: 1,
    marginRight: 8,
  },
});

export default GroupChannelCreateScreen;
