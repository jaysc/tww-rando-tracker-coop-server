import * as _ from 'lodash-es';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../user/index.js';
import { Events, Result } from '../actions/index.js';
import { createStore, Store } from 'tinybase';
import { differenceInMinutes } from 'date-fns';

export type uuid = string & { readonly _: unique symbol };
export { Rooms } from './rooms.js';

export interface RoomOptions {
  name: string
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

export enum SaveDataType {
  ENTRANCE = 'ENTRANCE',
  ISLANDS_FOR_CHARTS = 'ISLANDS_FOR_CHARTS',
  ITEM = 'ITEM',
  LOCATION = 'LOCATION',
}

export interface EntrancePayload {
  entranceName: string
  exitName: string
  type: SaveDataType
  useRoomId?: boolean
}

export interface IslandsForChartPayload {
  chart: string
  island: string
  type: SaveDataType
  useRoomId?: boolean
}

export interface ItemsForLocationsPayload {
  itemName: string
  generalLocation: string
  detailedLocation: string
  useRoomId?: boolean
}

export interface ItemPayload {
  count?: number
  detailedLocation?: string
  generalLocation?: string
  itemName: string
  sphere?: number
  type: SaveDataType
  useRoomId?: boolean
}

export interface LocationPayload {
  detailedLocation: string
  generalLocation: string
  isChecked?: boolean
  itemName?: string
  sphere?: number
  type: SaveDataType
  useRoomId?: boolean
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
  #userIds: string[] = [];
  mode: Mode;

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

  get globalUseRoomId () {
    return this.mode === Mode.ITEMSYNC;
  }

  public LoadInitialData (initialData: InitialData, user?: User) {
    const roomUser = user ?? new User(this.id);

    _.forEach(
      initialData.trackerState.itemsForLocations,
      (detailedLocations, generalLocation) => {
        _.forEach(detailedLocations, (item: string, detailedLocation: string) => {
          this.SaveItemsForLocations(roomUser, {
            itemName: item,
            generalLocation,
            detailedLocation
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
      createdDate: this.createdDate,
      lastAction: this.lastAction,
      users: this.#userIds,
      entrances: this.EntranceStore,
      islandsForChart: this.IslandsForChartsStore,
      items: this.ItemsStore,
      itemsForLocation: this.ItemsForLocationStore,
      locations: this.LocationsCheckedStore
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

  public SaveData (user: User, saveOptions: EntrancePayload | IslandsForChartPayload | ItemPayload | LocationPayload) {
    if (saveOptions.type === SaveDataType.ENTRANCE) {
      this.SaveEntrance(user, saveOptions as EntrancePayload);
    }
    if (saveOptions.type === SaveDataType.ISLANDS_FOR_CHARTS) {
      this.SaveIslandsForChart(user, saveOptions as IslandsForChartPayload);
    }
    if (saveOptions.type === SaveDataType.ITEM) {
      this.SaveItem(user, saveOptions as ItemPayload);
    }
    if (saveOptions.type === SaveDataType.LOCATION) {
      this.SaveLocation(user, saveOptions as LocationPayload);
    }

    const message: Result = {
      event: Events.DataSaved,
      data: { ...saveOptions, userId: saveOptions.useRoomId ? this.id : user.id }
    };

    this.SendMessage(message, user);
  }

  public GetData (getOptions: ItemPayload | LocationPayload) {
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
    { itemName, count, generalLocation, detailedLocation, sphere, useRoomId }: ItemPayload
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
      this.SaveItemsForLocations(user, { itemName, generalLocation, detailedLocation });
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
      this.SaveItemsForLocations(user, { itemName: '', generalLocation, detailedLocation })
    }
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
