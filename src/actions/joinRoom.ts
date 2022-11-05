import { Mode, RoomOptions } from '../room/index.js';
import type { User } from '../user/index.js';
import { Events, Method, Result } from './index.js';

export const JoinRoom: Method = (
  roomOptions: RoomOptions,
  user: User
): Result => {
  const { mode, name, perma } = roomOptions;

  if (!name) {
    return { err: Error('No room name specified') };
  }

  if (!perma) {
    return { err: Error('No perma specified') };
  }

  if (!mode) {
    return { err: Error('No mode specified') };
  }

  if (!Object.values(Mode).includes(mode)) {
    return { err: Error('Invalid mode specified') };
  }

  const room = user.JoinRoom(roomOptions);

  if (room) {
    return {
      event: Events.JoinedRoom,
      message: 'Joined room',
      data: {
        id: room.id,
        entrances: room.EntranceStore,
        mode: room.mode,
        islandsForCharts: room.IslandsForChartsStore,
        items: room.ItemsStore,
        itemsForLocation: room.ItemsForLocationStore,
        locationsChecked: room.LocationsCheckedStore
      }
    };
  } else {
    return { message: 'Failed to join room' };
  }
};
