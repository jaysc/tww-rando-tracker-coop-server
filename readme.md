# tww-rando-tracker-coop-server

## Introduction

This websocket server was created specifically to handle concurrent clients of tww-rando-tracker in order to enable co-op tracking.

Take a look at the Wind Waker Randomizer repo here: <https://github.com/LagoLunatic/wwrando/releases>

## Modes

### Itemsync

Used when multiple clients of wind waker are synced together and playing the same seed. All players share location checks and found items.

### Coop

Used when players are playing individually with the same seed. Items are not synced and each player requires checking locations individually.
