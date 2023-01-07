import { uuid } from '../room/index.js';

export interface SaveResponse {
  data?: object
  error?: string
}

const ExportData = (roomId: uuid): SaveResponse => {
  const room = global.rooms.FindRoomById(roomId)

  if (!room) {
    return {
      error: 'Room not found'
    }
  }

  return {
    data: room.GetExportData()
  };
};

export { ExportData };
