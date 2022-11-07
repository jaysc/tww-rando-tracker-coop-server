import { Mode, RoomOptions } from '../room/index.js';
import type { User } from '../user/index.js';
import { Events, JoinedRoomEvent } from './events.js';
import { Method } from './index.js';

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

  const room = user.JoinRoom(roomOptions);

  if (room) {
    return {
      event: Events.JoinedRoom,
      message: 'Joined room',
      data: {
        id: room.id,
        entrances: room.EntranceStore,
        connectedUsers: room.connectedUsers,
        mode: room.mode,
        islandsForCharts: room.IslandsForChartsStore,
        items: room.ItemsStore,
        itemsForLocation: room.ItemsForLocationStore,
        locationsChecked: room.LocationsCheckedStore,
        rsSettings: room.RsSettingsStore
      }
    };
  } else {
    return {
      event: Events.JoinedRoom,
      message: 'Failed to join room'
    };
  }
};
