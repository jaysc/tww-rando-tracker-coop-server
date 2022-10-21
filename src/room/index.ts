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
  perma?: string
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
  ITEM = 'ITEM',
  LOCATION = 'LOCATION',
}

export interface ItemPayload {
  type: SaveDataType
  itemName: string
  count?: number
  generalLocation?: string
  detailedLocation?: string
  sphere?: number
}

export interface LocationPayload {
  type: SaveDataType
  generalLocation: string
  detailedLocation: string
  isChecked?: boolean
  itemName?: string
  sphere?: number
}

export enum Mode {
  ITEMSYNC = 'ITEMSYNC', // Single world synced
  COOP = 'COOP', // Single world unsynced
  MULTIWORLD = 'MULTIWORLD', // Multiple worlds. No need to save item or location info.
}

export class Room {
  #password?: string;
  #itemStore: Store = createStore();
  #locationStore: Store = createStore();
  #itemsForLocations: Store = createStore();
  #mode: Mode;
  #userIds: string[] = [];

  public perma?: string;
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
    this.#mode = mode ?? Mode.ITEMSYNC;

    this.name = name;
    this.perma = perma;
    this.creatorId = user?.id;

    this.#itemStore.setTables({
      items: {},
      locations: {}
    });

    if (initialData) {
      this.LoadInitialData(initialData, user);
    }
  }

  get ItemStore () {
    return this.#itemStore.getTables();
  }

  get LocationStore () {
    return this.#locationStore.getTables();
  }

  get ItemsForLocation () {
    return this.#itemsForLocations.getTables();
  }

  public LoadInitialData (initialData: InitialData, user?: User) {
    const roomUser = user ?? new User(this.id);

    const locationForItem = {};
    _.forEach(
      initialData.trackerState.itemsForLocations,
      (detailedLocations, generalLocation) => {
        _.forEach(detailedLocations, (item: string, detailedLocation: string) => {
          this.SaveItemForLocation(roomUser, {
            itemName: item,
            generalLocation,
            detailedLocation
          })
          _.set(locationForItem, [item], { detailedLocation, generalLocation });
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
      mode: this.#mode,
      createdDate: this.createdDate,
      lastAction: this.lastAction,
      users: this.#userIds,
      items: this.ItemStore,
      locations: this.LocationStore
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

  public SaveData (user: User, saveOptions: ItemPayload | LocationPayload) {
    if (saveOptions.type === SaveDataType.ITEM) {
      this.SaveItem(user, saveOptions as ItemPayload);
    }
    if (saveOptions.type === SaveDataType.LOCATION) {
      this.SaveLocation(user, saveOptions as LocationPayload);
    }

    const message: Result = {
      event: Events.DataSaved,
      data: { ...saveOptions, userId: user.id }
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
      return this.#itemStore.getTable(itemName);
    } else {
      return this.#itemStore.getTables();
    }
  }

  private GetLocation ({ generalLocation, detailedLocation }: LocationPayload) {
    if (generalLocation || detailedLocation) {
      return this.#locationStore.getTable(
        `${generalLocation}-${detailedLocation}`
      );
    } else {
      return this.#locationStore.getTables();
    }
  }

  private SaveId (user: User) {
    return this.#mode === Mode.ITEMSYNC ? this.id : user.id;
  }

  private SaveItemForLocation (user: User, { itemName, generalLocation, detailedLocation }:
  {
    itemName: string
    generalLocation: string
    detailedLocation: string
  }) {
    const dataToSave = _.omitBy(
      {
        itemName
      },
      _.isNil
    );

    this.#itemsForLocations.setPartialRow(
      `${generalLocation}#${detailedLocation}`,
      this.SaveId(user),
      dataToSave as {}
    );
  }

  private SaveItem (
    user: User,
    { itemName, count, generalLocation, detailedLocation, sphere }: ItemPayload
  ) {
    const dataToSave = _.omitBy(
      {
        count: count ?? 0,
        sphere
      },
      _.isNil
    );

    this.#itemStore.setPartialRow(
      itemName,
      this.SaveId(user),
      dataToSave as {}
    );
  }

  private SaveLocation (
    user: User,
    {
      generalLocation,
      detailedLocation,
      isChecked,
      itemName,
      sphere
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
    this.#locationStore.setPartialRow(
      `${generalLocation}#${detailedLocation}`,
      this.SaveId(user),
      dataToSave as {}
    );
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
