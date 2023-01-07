import * as _ from 'lodash-es';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../user/index.js';
import { createStore, Store, Tables } from 'tinybase';
import { differenceInMinutes } from 'date-fns';
import { Events, Result, RoomUpdateEvent } from '../actions/events.js';

export type uuid = string & { readonly _: unique symbol };
export { Rooms } from './rooms.js';

export interface RoomOptions {
  name: string
  username: string
  password?: string
  perma: string
  mode?: Mode
  initialData?: InitialData
}

export interface InitialData {
  trackerState: {
    entrances: object
    items: object
    itemsForLocations: object
    locationsChecked: object
  }
}

const EXPORT_ROOM_ID = '#ROOM_ID';
const EXPORT_USER_ID = '#USER_ID';

export enum SaveDataType {
  ENTRANCE = 'ENTRANCE',
  ISLANDS_FOR_CHARTS = 'ISLANDS_FOR_CHARTS',
  ITEMS_FOR_LOCATIONS = 'ITEMS_FOR_LOCATIONS',
  ITEM = 'ITEM',
  LOCATION = 'LOCATION',
  RS_SETTINGS = 'RS_SETTINGS'
}

export interface SaveDataPayload {
  type: SaveDataType
  useRoomId?: boolean
}

export interface EntrancePayload extends SaveDataPayload {
  entranceName: string
  exitName: string
  type: SaveDataType.ENTRANCE
}

export interface IslandsForChartPayload extends SaveDataPayload {
  chart: string
  island: string
  type: SaveDataType.ISLANDS_FOR_CHARTS
}

export interface ItemsForLocationsPayload extends SaveDataPayload {
  itemName: string
  generalLocation: string
  detailedLocation: string
  type: (SaveDataType.ITEMS_FOR_LOCATIONS)
}

export interface ItemPayload extends SaveDataPayload {
  count?: number
  detailedLocation?: string
  generalLocation?: string
  itemName: string
  sphere?: number
  type: SaveDataType.ITEM
}

export interface LocationPayload extends SaveDataPayload {
  detailedLocation: string
  generalLocation: string
  isChecked?: boolean
  itemName?: string
  sphere?: number
  type: SaveDataType.LOCATION
}

export interface RsSettingsPayload extends SaveDataPayload {
  settings: Settings
  type: SaveDataType.RS_SETTINGS
}

export interface Settings {
  options: object
  certainSettings: object
}

export enum Mode {
  ITEMSYNC = 'ITEMSYNC', // Single world synced
  COOP = 'COOP', // Single world unsynced
  MULTIWORLD = 'MULTIWORLD', // Multiple worlds. No need to save item or location info.
}

export class Room {
  #password?: string;
  #entrances: Store = createStore();
  #islandsForCharts: Store = createStore();
  #itemsStore: Store = createStore();
  #locationsCheckedStored: Store = createStore();
  #itemsForLocations: Store = createStore();
  #rsSettings: Settings = { options: {}, certainSettings: {} };
  #rsSettingsInProgressUserId: string = '';
  #userIds: string[] = [];
  mode: Mode;
  #userIdHistory: string[] = [];

  public perma: string;
  public id: uuid;
  public name: string;
  public createdDate: Date = new Date();
  public lastAction: Date = new Date();
  public creatorId;

  constructor (
    { name, password, perma, mode, initialData }: RoomOptions,
    user?: User
  ) {
    this.id = uuidv4() as uuid;
    this.#password = password;
    this.mode = mode ?? Mode.COOP;

    this.name = name;
    this.perma = perma;
    this.creatorId = user?.id;

    this.#itemsStore.setTables({
      items: {},
      locations: {}
    });

    if (initialData) {
      this.LoadInitialData(initialData, user);
    }
  }

  get EntranceStore () {
    return this.#entrances.getTables();
  }

  get IslandsForChartsStore () {
    return this.#islandsForCharts.getTables();
  }

  get ItemsStore () {
    return this.#itemsStore.getTables();
  }

  get LocationsCheckedStore () {
    return this.#locationsCheckedStored.getTables();
  }

  get ItemsForLocationStore () {
    return this.#itemsForLocations.getTables();
  }

  get RsSettingsStore () {
    return this.#rsSettings;
  }

  get globalUseRoomId () {
    return this.mode === Mode.ITEMSYNC;
  }

  get RsSettingsInProgressUserId () {
    return this.#rsSettingsInProgressUserId;
  }

  get Users (): Record<string, string> {
    return _.reduce(this.#userIds, (acc, userId) => {
      _.set(acc, userId, global.connections.get(userId)?.user?.name)
      return acc;
    }, {})
  }

  get connectedUsers () {
    return this.#userIds.length;
  }

  public GetExportData () {
    const exportItems = this.handleExportData(this.ItemsStore);
    const exportEntrances = this.handleExportData(this.EntranceStore);
    const exportIslandsForChart = this.handleExportData(this.IslandsForChartsStore);
    const exportItemsForLocation = this.handleExportData(this.ItemsForLocationStore);
    const exportLocations = this.handleExportData(this.LocationsCheckedStore);

    return {
      prema: this.perma,
      mode: this.mode,
      entrances: exportEntrances,
      islandsForChart: exportIslandsForChart,
      items: exportItems,
      itemsForLocation: exportItemsForLocation,
      locations: exportLocations,
      rsSettings: this.RsSettingsStore
    }
  }

  private handleExportData (table: Tables) {
    return _.cloneWith(table, (store) => {
      return this.replaceStringInJson(store)
    });
  }

  private replaceStringInJson (object: object): object {
    let objectString = JSON.stringify(object);

    objectString = objectString.replaceAll(this.id, EXPORT_ROOM_ID);

    _.forEach(this.#userIdHistory, (userId, index) => {
      const exportUserId = `${userId}_${index}`;

      objectString = objectString.replaceAll(userId, exportUserId);
    })

    return JSON.parse(objectString);
  }

  // Needs to be updated
  public LoadInitialData (initialData: InitialData, user?: User) {
    const roomUser = user ?? new User(this.id);

    _.forEach(
      initialData.trackerState.itemsForLocations,
      (detailedLocations, generalLocation) => {
        _.forEach(detailedLocations, (item: string, detailedLocation: string) => {
          this.SaveItemsForLocations(roomUser, {
            detailedLocation,
            generalLocation,
            itemName: item,
            type: SaveDataType.ITEMS_FOR_LOCATIONS
          })
        });
      }
    );

    _.forEach(
      initialData.trackerState.locationsChecked,
      (detailedLocations: object, generalLocation) => {
        _.forEach(detailedLocations, (value, detailedLocation) => {
          console.log(value);
          if (value) {
            this.SaveLocation(roomUser, {
              type: SaveDataType.LOCATION,
              detailedLocation,
              generalLocation,
              isChecked: true,
              itemName: _.get(initialData.trackerState.itemsForLocations, [
                generalLocation,
                detailedLocation
              ])
            });
          }
        });
      }
    );

    _.forEach(initialData.trackerState.items, (value, item) => {
      if (value) {
        this.SaveItem(roomUser, {
          type: SaveDataType.ITEM,
          itemName: item,
          count: value
        });
      }
    });
  }

  public HasPassword = () => !_.isEmpty(this.#password);

  public GetStatus () {
    return {
      name: this.name,
      perma: this.perma,
      mode: this.mode,
      createdDate: this.createdDate,
      lastAction: this.lastAction,
      users: this.Users,
      userIdHistory: this.#userIdHistory,
      entrances: this.EntranceStore,
      islandsForChart: this.IslandsForChartsStore,
      items: this.ItemsStore,
      itemsForLocation: this.ItemsForLocationStore,
      locations: this.LocationsCheckedStore,
      rsSettings: this.RsSettingsStore,
      rsSettingsInProgress: this.#rsSettingsInProgressUserId
    };
  }

  public PasswordAccept (password?: string) {
    if (this.HasPassword()) {
      return password === this.#password;
    }
    return false;
  }

  public AddUser (user: User) {
    this.#userIds = _.union(this.#userIds, [user.id]);
    user.roomId = this.id;
    this.lastAction = new Date();

    this.SendRoomUpdate(user);
  }

  public SendRoomUpdate (user?: User) {
    const message: RoomUpdateEvent = {
      event: Events.RoomUpdate,
      data: {
        users: this.Users,
        rsSettingsInProgressUserId: this.#rsSettingsInProgressUserId
      }
    };

    this.SendMessage(message, user)
  }

  public RemoveUser (user: User): boolean {
    let userRemoved = false;
    _.remove(this.#userIds, (x) => {
      const temp = x === user.id;
      if (!userRemoved) {
        userRemoved = temp;
      }
      return temp;
    });

    if (userRemoved) {
      this.lastAction = new Date();

      if (this.#rsSettingsInProgressUserId === user.id || _.isNil(this.Users.length)) {
        this.#rsSettingsInProgressUserId = '';
      }

      this.SendRoomUpdate(user);
    }

    return userRemoved;
  }

  public HasUser (user: User) {
    return this.#userIds.includes(user.id);
  }

  public SendMessage (response: Result, user?: User) {
    _.forEach(this.#userIds, (userId) => {
      if (user && user.id === userId) {
        return;
      }

      global.connections.get(userId)?.socket.send(JSON.stringify(response));
    });

    this.lastAction = new Date();
  }

  public SettingsUpdateInProgress (value: string) {
    this.#rsSettingsInProgressUserId = value;
  }

  public SaveData (user: User, saveOptions: SaveDataPayload) {
    if (!this.#userIdHistory.includes(user.id)) {
      this.#userIdHistory.push(user.id);
    }

    if (saveOptions.type === SaveDataType.ENTRANCE) {
      this.SaveEntrance(user, saveOptions as EntrancePayload);
    }
    if (saveOptions.type === SaveDataType.ISLANDS_FOR_CHARTS) {
      this.SaveIslandsForChart(user, saveOptions as IslandsForChartPayload);
    }
    if (saveOptions.type === SaveDataType.ITEMS_FOR_LOCATIONS) {
      this.SaveItemsForLocations(user, saveOptions as ItemsForLocationsPayload);
    }
    if (saveOptions.type === SaveDataType.ITEM) {
      this.SaveItem(user, saveOptions as ItemPayload);
    }
    if (saveOptions.type === SaveDataType.LOCATION) {
      this.SaveLocation(user, saveOptions as LocationPayload);
    }
    if (saveOptions.type === SaveDataType.RS_SETTINGS) {
      this.SaveRsSettings(user, saveOptions as RsSettingsPayload);
    }

    const message: Result = {
      event: Events.DataSaved,
      data: { ...saveOptions, userId: saveOptions.useRoomId ? this.id : user.id }
    };

    this.SendMessage(message, user);
  }

  public GetData (getOptions: SaveDataPayload) {
    let result;

    if (getOptions.type === SaveDataType.ITEM) {
      result = this.GetItem(getOptions as ItemPayload);
    }
    if (getOptions.type === SaveDataType.LOCATION) {
      result = this.GetLocation(getOptions as LocationPayload);
    }

    this.lastAction = new Date();
    return result;
  }

  private GetItem ({ itemName }: ItemPayload) {
    if (itemName) {
      return this.#itemsStore.getTable(itemName);
    } else {
      return this.#itemsStore.getTables();
    }
  }

  private GetLocation ({ generalLocation, detailedLocation }: LocationPayload) {
    if (generalLocation || detailedLocation) {
      return this.#locationsCheckedStored.getTable(
        `${generalLocation}-${detailedLocation}`
      );
    } else {
      return this.#locationsCheckedStored.getTables();
    }
  }

  private SaveEntrance (user: User, { entranceName, exitName, useRoomId }: EntrancePayload) {
    if (entranceName) {
      const dataToSave = _.omitBy(
        {
          entranceName
        },
        _.isNil
      );

      this.#entrances.setPartialRow(
        exitName,
        useRoomId ?? this.globalUseRoomId ? this.id : user.id,
        dataToSave as {}
      );
    } else {
      this.#entrances.delRow(
        exitName,
        useRoomId ?? this.globalUseRoomId ? this.id : user.id
      )
    }
  }

  private SaveIslandsForChart (user: User, { chart, island, useRoomId }: IslandsForChartPayload) {
    if (island) {
      const dataToSave = _.omitBy(
        {
          island
        },
        _.isNil
      );

      this.#islandsForCharts.setPartialRow(
        chart,
        useRoomId ?? this.globalUseRoomId ? this.id : user.id,
        dataToSave as {}
      );
    } else {
      this.#islandsForCharts.delRow(
        chart,
        useRoomId ?? this.globalUseRoomId ? this.id : user.id
      )
    }
  }

  private SaveItemsForLocations (user: User,
    { itemName, generalLocation, detailedLocation, useRoomId }: ItemsForLocationsPayload) {
    if (itemName) {
      const dataToSave = _.omitBy(
        {
          itemName
        },
        _.isNil
      );
      this.#itemsForLocations.setPartialRow(
        `${generalLocation}#${detailedLocation}`,
        useRoomId ?? this.globalUseRoomId ? this.id : user.id,
        dataToSave as {}
      );
    } else {
      this.#itemsForLocations.delRow(
        `${generalLocation}#${detailedLocation}`,
        useRoomId ?? this.globalUseRoomId ? this.id : user.id
      )
    }
  }

  private SaveItem (
    user: User,
    { count, detailedLocation, generalLocation, itemName, sphere, type, useRoomId }: ItemPayload
  ) {
    const dataToSave = _.omitBy(
      {
        count: count ?? 0,
        sphere
      },
      _.isNil
    );

    this.#itemsStore.setPartialRow(
      itemName,
      useRoomId ?? this.globalUseRoomId ? this.id : user.id,
      dataToSave as {}
    );

    if (generalLocation && detailedLocation) {
      this.SaveItemsForLocations(user, { detailedLocation, generalLocation, itemName, type: SaveDataType.ITEMS_FOR_LOCATIONS });
    }
  }

  private SaveLocation (
    user: User,
    {
      generalLocation,
      detailedLocation,
      isChecked,
      itemName,
      sphere,
      type,
      useRoomId
    }: LocationPayload
  ) {
    const dataToSave = _.omitBy(
      {
        isChecked,
        itemName,
        sphere
      },
      _.isNil
    );
    this.#locationsCheckedStored.setPartialRow(
      `${generalLocation}#${detailedLocation}`,
      useRoomId ?? this.globalUseRoomId ? this.id : user.id,
      dataToSave as {}
    );

    if (!isChecked) {
      this.SaveItemsForLocations(user, { detailedLocation, generalLocation, itemName: '', type: SaveDataType.ITEMS_FOR_LOCATIONS })
    }
  }

  private SaveRsSettings (
    user: User,
    {
      settings
    }: RsSettingsPayload
  ) {
    const newSettings = _.merge(this.#rsSettings, settings);
    this.#rsSettings = newSettings;
  }

  public FlagDelete () {
    // Delete room if empty AND
    // Delete room if last action is older than 30 minutes
    return (
      this.#userIds.length === 0 &&
      differenceInMinutes(new Date(), this.lastAction) >
      (parseInt(process.env.ROOM_LIFETIME_MINUTES) ?? 30)
    );
  }
}
