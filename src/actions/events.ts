import { type Table, type Tables } from 'tinybase/store'
import { type Mode, type Settings, type uuid } from '../room'

export enum Events {
  DataSaved = 'dataSaved',
  GetData = 'getData',
  ItemMessage = 'itemMessage',
  JoinedRoom = 'joinedRoom',
  LeaveRoom = 'leaveRoom',
  Message = 'message',
  OnConnect = 'onConnect',
  Response = 'response',
  RoomUpdate = 'roomUpdate',
  Set = 'set',
  SetName = 'setName',
  SettingsUpdate = 'settingsUpdate'
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
    users: Record<string, string>
    rsSettingsInProgressUserId: string
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
    // Sending raw userId. Could truncate for security in future
    users: Record<string, string>
    entrances: Tables
    mode: Mode
    islandsForCharts: Tables
    items: Tables
    itemsForLocation: Tables
    locationsChecked: Tables
    rsSettings: Settings
    rsSettingsInProgressUserId: string
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

export interface SetNameEvent extends Result {
  event: Events.SetName
  data: {
    name: string
  }
}

export interface SettingsUpdateEvent extends Result {
  event: Events.SettingsUpdate
  data: {
    inProgress: boolean
  }
}
