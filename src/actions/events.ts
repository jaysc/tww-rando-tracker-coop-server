import { Table, Tables } from 'tinybase/store'
import { Mode, Settings, uuid } from '../room'

export enum Events {
  DataSaved = 'dataSaved',
  GetData = 'getData',
  ItemMessage = 'itemMessage',
  JoinedRoom = 'joinedRoom',
  Message = 'message',
  LeaveRoom = 'leaveRoom',
  RoomUpdate = 'roomUpdate',
  Set = 'set',
  OnConnect = 'onConnect',
  Response = 'response',
}

export interface Result {
  event: Events
  messageId?: string
  message?: string
  error?: Error
  data?: object
}

export interface RoomUpdateEvent extends Result {
  event: Events.RoomUpdate
  data: {
    connectedUsers: number
  }
}

export interface DataSavedEvent extends Result {
  event: Events.DataSaved
}

export interface GetDataEvent extends Result {
  event: Events.GetData
  data?: Table | Tables
}

export interface ItemMessageEvent extends Result {
  event: Events.ItemMessage
  data: {
    itemId: string
    playerName: string
    checkName: string
  }
}

export interface JoinedRoomEvent extends Result {
  event: Events.JoinedRoom
  data?: {
    id: uuid
    connectedUsers: number
    entrances: Tables
    mode: Mode
    islandsForCharts: Tables
    items: Tables
    itemsForLocation: Tables
    locationsChecked: Tables
    rsSettings: Settings
  }
}

export interface MessageEvent extends Result {
  event: Events.Message
}

export interface LeaveRoomEvent extends Result {
  event: Events.LeaveRoom
}

export interface OnConnectEvent extends Result {
  event: Events.OnConnect
  data: {
    userId: string
  }
}

export interface SetEvent extends Result {
  event: Events.Set
}

export interface ResponseEvent extends Result {
  event: Events.Response
}
