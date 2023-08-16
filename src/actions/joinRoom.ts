import { Mode, type RoomOptions } from '../room/index.js';
import type { User } from '../user/index.js';
import { Events, type JoinedRoomEvent } from './events.js';
import { type Method } from './index.js';

export const JoinRoom: Method = (
  roomOptions: RoomOptions,
  user: User
): JoinedRoomEvent => {
  const { mode, name, perma } = roomOptions;

  if (!name) {
    return {
      event: Events.JoinedRoom,
      error: Error('No room name specified')
    };
  }

  if (!perma) {
    return {
      event: Events.JoinedRoom,
      error: Error('No perma specified')
    };
  }

  if (!mode) {
    return {
      event: Events.JoinedRoom,
      error: Error('No mode specified')
    };
  }

  if (!Object.values(Mode).includes(mode)) {
    return {
      event: Events.JoinedRoom,
      error: Error('Invalid mode specified')
    };
  }

  user.SetName(roomOptions.username)

  const room = user.JoinRoom(roomOptions);

  if (room) {
    return {
      event: Events.JoinedRoom,
      message: 'Joined room',
      data: {
        id: room.id,
        entrances: room.EntranceStore,
        users: room.Users,
        mode: room.mode,
        islandsForCharts: room.IslandsForChartsStore,
        items: room.ItemsStore,
        itemsForLocation: room.ItemsForLocationStore,
        locationsChecked: room.LocationsCheckedStore,
        rsSettings: room.RsSettingsStore,
        rsSettingsInProgressUserId: room.RsSettingsInProgressUserId
      }
    };
  } else {
    return {
      event: Events.JoinedRoom,
      message: 'Failed to join room'
    };
  }
};
