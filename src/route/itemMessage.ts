import { Events } from "../actions/index.js";

export interface ItemMessagePayload {
  itemId: string;
  checkName: string;
  playerName: string;
  gameRoom: string;
}

const ItemMessage = ({
  itemId,
  checkName,
  playerName,
  gameRoom,
}: ItemMessagePayload): { message?: string; error?: string } => {
  if (!itemId) {
    return {
      error: "Missing itemId",
    };
  }
  if (!playerName) {
    return {
      error: "Missing playerName",
    };
  }
  if (!gameRoom) {
    return {
      error: "Missing gameRoom",
    };
  }

  const room = global.rooms.FindRoomByName(gameRoom);
  if (!room) {
    return {
      error: "Room not found",
    };
  }

  room.SendMessage({
    event: Events.ItemMessage,
    data: { itemId, playerName, checkName },
  });

  return { message: "success" };
};

export { ItemMessage };
