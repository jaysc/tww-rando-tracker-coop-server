import { Events, ItemMessageEvent } from '../actions/events.js';

export interface ItemMessagePayload {
  itemId: string
  checkName: string
  playerName: string
  gameRoom: string
}

const ItemMessage = ({
  itemId,
  checkName,
  playerName,
  gameRoom
}: ItemMessagePayload): { message?: string, error?: string } => {
  if (!itemId) {
    return {
      error: 'Missing itemId'
    };
  }
  if (!playerName) {
    return {
      error: 'Missing playerName'
    };
  }
  if (!gameRoom) {
    return {
      error: 'Missing gameRoom'
    };
  }

  const room = global.rooms.FindRoomByName(gameRoom);
  if (!room) {
    return {
      error: 'Room not found'
    };
  }

  const message: ItemMessageEvent = {
    event: Events.ItemMessage,
    data: { itemId, playerName, checkName }
  }

  room.SendMessage(message);

  return { message: 'success' };
};

export { ItemMessage };
