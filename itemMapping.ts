const items = {
    "Heart (Pickup)": 0x00,           # Not going to Support
    "Green Rupee": 0x01,              # Supported
    "Blue Rupee": 0x02,               # Supported
    "Yellow Rupee": 0x03,             # Supported
    "Red Rupee": 0x04,                # Supported
    "Purple Rupee": 0x05,             # Supported
    "Orange Rupee": 0x06,             # Supported
    "Piece of Heart": 0x07,           # Supported
    "Heart Container": 0x08,          # Supported
    "Small Magic Jar (Pickup)": 0x09, # Not Supported
    "Large Magic Jar (Pickup)": 0x0A, # Not Supported
    "5 Bombs (Pickup)": 0x0B,         # Mirrors Small Key Behavior?
    "10 Bombs (Pickup)": 0x0C,        # ^
    "20 Bombs (Pickup)": 0x0D,        # ^
    "30 Bombs (Pickup)": 0x0E,        # ^
    "Silver Rupee": 0x0F,             # Supported
    "10 Arrows (Pickup)": 0x10,       # Mirrors Small Key Behavior?
    "20 Arrows (Pickup)": 0x11,       # ^
    "30 Arrows (Pickup)": 0x12,       # ^
    "DRC Small Key": 0x13,            # Supported
    "DRC Big Key": 0x14,              # Supported
    "Small Key": 0x15,                # Not used
    "Fairy (Pickup)": 0x16,           # Not going to Support
    "Yellow Rupee (Joke Message)": 0x1A, # Not Randomized?
    "DRC Dungeon Map": 0x1B,          # Supported
    "DRC Dungeon Compass": 0x1C,      # Supported
    "FW Small Key": 0x1D,             # Supported
    "Three Hearts (Pickup)": 0x1E,    # Not going to Support, only Zelda Hearts
    "Joy Pendant": 0x1F,              # Not Supported
    "Telescope": 0x20,                # Supported
    "Tingle Tuner": 0x21,             # Supported
    "Wind Waker": 0x22,               # Supported (Not Randomized)
    "Picto Box": 0x23,                # Supported
    "Spoils Bag": 0x24,               # Supported
    "Grappling Hook": 0x25,           # Supported
    "Deluxe Picto Box": 0x26,         # Supported
    "Hero's Bow": 0x27,               # Supported
    "Power Bracelets": 0x28,          # Supported
    "Iron Boots": 0x29,               # Supported
    "Magic Armor": 0x2A,              # Supported
    "Bait Bag": 0x2C,                 # Supported
    "Boomerang": 0x2D,                # Supported
    "Hookshot": 0x2F,                 # Supported
    "Delivery Bag": 0x30,             # Supported
    "Bombs": 0x31,                    # Supported
    "Hero's Clothes": 0x32,           # Not going to Support
    "Skull Hammer": 0x33,             # Supported
    "Deku Leaf": 0x34,                # Supported
    "Fire and Ice Arrows": 0x35,      # Supported
    "Light Arrow": 0x36,              # Supported
    "Hero's New Clothes": 0x37,       # Not going to Support
    "Hero's Sword": 0x38,             # Supported
    "Master Sword (Powerless)": 0x39, # Supported
    "Master Sword (Half Power)": 0x3A,# Supported
    "Hero's Shield": 0x3B,            # Supported
    "Mirror Shield": 0x3C,            # Supported
    "Recovered Hero's Sword": 0x3D,   # Supported
    "Master Sword (Full Power)": 0x3E,# Supported
    "Piece of Heart (Alternate Message)": 0x3F,   # Not used in the Randomizer?
    "FW Big Key": 0x40,               # Supported
    "FW Dungeon Map": 0x41,           # Supported
    "Pirate's Charm": 0x42,           # Not Randomized
    "Hero's Charm": 0x43,             # Supported
    "Skull Necklace": 0x45,           # Mirrors Delivery Bag Behavior
    "Boko Baba Seed": 0x46,           # ^
    "Golden Feather": 0x47,           # ^
    "Knight's Crest": 0x48,           # ^
    "Red Chu Jelly": 0x49,            # ^
    "Green Chu Jelly": 0x4A,          # ^
    "Blue Chu Jelly": 0x4B,           # Edge Case due to Blue Chus and Event flags. 0.0.5?
    "Dungeon Map": 0x4C,              # Not used in the Randomizer
    "Compass": 0x4D,                  # Not used in the Randomizer
    "Big Key": 0x4E,                  # Not used in the Randomizer
    "Empty Bottle": 0x50,             # Supported
    "Red Potion": 0x51,               # Not going to Support
    "Green Potion": 0x52,             # Not going to Support
    "Blue Potion": 0x53,              # Not going to Support
    "Elixir Soup (1/2)": 0x54,        # Not going to Support
    "Elixir Soup": 0x55,              # Not going to Support
    "Bottled Water": 0x56,            # Not going to Support
    "Fairy in Bottle": 0x57,          # Not going to Support
    "Forest Firefly": 0x58,           # Not going to Support
    "Forest Water": 0x59,             # Not going to Support
    "FW Dungeon Compass": 0x5A,       # Supported
    "TotG Small Key": 0x5B,           # Supported
    "TotG Big Key": 0x5C,             # Supported
    "TotG Dungeon Map": 0x5D,         # Supported
    "TotG Dungeon Compass": 0x5E,     # Supported
    "FF Dungeon Map": 0x5F,           # Supported
    "FF Dungeon Compass": 0x60,       # Supported
    "Triforce Shard 1": 0x61,         # Supported
    "Triforce Shard 2": 0x62,         # Supported
    "Triforce Shard 3": 0x63,         # Supported
    "Triforce Shard 4": 0x64,         # Supported
    "Triforce Shard 5": 0x65,         # Supported
    "Triforce Shard 6": 0x66,         # Supported
    "Triforce Shard 7": 0x67,         # Supported
    "Triforce Shard 8": 0x68,         # Supported
    "Nayru's Pearl": 0x69,            # Supported
    "Din's Pearl": 0x6A,              # Supported
    "Farore's Pearl": 0x6B,           # Supported
    "Wind's Requiem": 0x6D,           # Supported
    "Ballad of Gales": 0x6E,          # Supported
    "Command Melody": 0x6F,           # Supported
    "Earth God's Lyric": 0x70,        # Supported
    "Wind God's Aria": 0x71,          # Supported
    "Song of Passing": 0x72,          # Supported
    "ET Small Key": 0x73,             # Supported
    "ET Big Key": 0x74,               # Supported
    "ET Dungeon Map": 0x75,           # Supported
    "ET Dungeon Compass": 0x76,       # Supported
    "WT Small Key": 0x77,             # Supported
    "Boat's Sail": 0x78,              # Not Randomized
    "Triforce Chart 1 got deciphered": 0x79,     # Memory Scan, or Translation Patch?
    "Triforce Chart 2 got deciphered": 0x7A,     # Memory Scan, or Translation Patch?
    "Triforce Chart 3 got deciphered": 0x7B,     # Memory Scan, or Translation Patch?
    "Triforce Chart 4 got deciphered": 0x7C,     # Memory Scan, or Translation Patch?
    "Triforce Chart 5 got deciphered": 0x7D,     # Memory Scan, or Translation Patch?
    "Triforce Chart 6 got deciphered": 0x7E,     # Memory Scan, or Translation Patch?
    "Triforce Chart 7 got deciphered": 0x7F,     # Memory Scan, or Translation Patch?
    "Triforce Chart 8 got deciphered": 0x80,     # Memory Scan, or Translation Patch?
    "WT Big Key": 0x81,               # Supported
    "All-Purpose Bait": 0x82,         # Mirror Delivery Bag Handling?
    "Hyoi Pear": 0x83,                # Mirror Delivery Bag Handling?
    "WT Dungeon Map": 0x84,           # Supported
    "WT Dungeon Compass": 0x85,       # Supported
    "Town Flower": 0x8C,              # Not going to Support
    "Sea Flower": 0x8D,               # Not going to Support
    "Exotic Flower": 0x8E,            # Not going to Support
    "Hero's Flag": 0x8F,              # Not going to Support
    "Big Catch Flag": 0x90,           # Not going to Support
    "Big Sale Flag": 0x91,            # Not going to Support
    "Pinwheel": 0x92,                 # Not going to Support
    "Sickle Moon Flag": 0x93,         # Not going to Support
    "Skull Tower Idol": 0x94,         # Not going to Support
    "Fountain Idol": 0x95,            # Not going to Support
    "Postman Statue": 0x96,           # Not going to Support
    "Shop Guru Statue": 0x97,         # Not going to Support
    "Father's Letter": 0x98,          # Not Randomized
    "Note to Mom": 0x99,              # Supported
    "Maggie's Letter": 0x9A,          # Supported
    "Moblin's Letter": 0x9B,          # Supported
    "Cabana Deed": 0x9C,              # Supported
    "Complimentary ID": 0x9D,         # Not Researched
    "Fill-Up Coupon": 0x9E,           # Usable using current Mailing system?
    "Legendary Pictograph": 0x9F,     # Not Randomized
    "Dragon Tingle Statue": 0xA3,     # 0.0.3
    "Forbidden Tingle Statue": 0XA4,  # 0.0.3
    "Goddess Tingle Statue": 0XA5,    # 0.0.3
    "Earth Tingle Statue": 0XA6,      # 0.0.3
    "Wind Tingle Statue": 0XA7,       # 0.0.3
    "Hurricane Spin": 0XAA,           # Not Researched
    "1000 Rupee Wallet": 0XAB,        # Supported
    "5000 Rupee Wallet": 0XAC,        # Supported
    "60 Bomb Bomb Bag": 0XAD,         # Supported
    "99 Bomb Bomb Bag": 0XAE,         # Supported
    "60 Arrow Quiver": 0XAF,          # Supported
    "99 Arrow Quiver": 0XB0,          # Supported
    "Magic Meter Upgrade": 0XB2,      # Need additional Handling
    "50 Rupees, reward for finding 1 Tingle Statue": 0XB3,       # Not going to Support
    "100 Rupees, reward for finding 2 Tingle Statues": 0XB4,     # Not going to Support
    "150 Rupees, reward for finding 3 Tingle Statues": 0XB5,     # Not going to Support
    "200 Rupees, reward for finding 4 Tingle Statues": 0XB6,     # Not going to Support
    "250 Rupees, reward for finding 5 Tingle Statues": 0XB7,     # Not going to Support
    "500 Rupees, reward for finding all Tingle Statues": 0XB8,   # Not Researched
    "Submarine Chart": 0XC2,         # Supported
    "Beedle's Chart": 0XC3,          # Supported
    "Platform Chart": 0XC4,          # Supported
    "Light Ring Chart": 0XC5,        # Supported
    "Secret Cave Chart": 0XC6,       # Supported
    "Sea Hearts Chart": 0XC7,        # Supported
    "Island Hearts Chart": 0XC8,     # Supported
    "Great Fairy Chart": 0XC9,       # Supported
    "Octo Chart": 0XCA,              # Supported
    "IN-credible Chart": 0XCB,       # Supported
    "Treasure Chart 7": 0XCC,        # Supported
    "Treasure Chart 27": 0XCD,       # Supported
    "Treasure Chart 21": 0XCE,       # Supported
    "Treasure Chart 13": 0XCF,       # Supported
    "Treasure Chart 32": 0XD0,       # Supported
    "Treasure Chart 19": 0XD1,       # Supported
    "Treasure Chart 41": 0XD2,       # Supported
    "Treasure Chart 26": 0XD3,       # Supported
    "Treasure Chart 8": 0XD4,        # Supported
    "Treasure Chart 37": 0XD5,       # Supported
    "Treasure Chart 25": 0XD6,       # Supported
    "Treasure Chart 17": 0XD7,       # Supported
    "Treasure Chart 36": 0XD8,       # Supported
    "Treasure Chart 22": 0XD9,       # Supported
    "Treasure Chart 9": 0XDA,        # Supported
    "Ghost Ship Chart": 0XDB,        # Supported
    "Tingle's Chart": 0XDC,          # Supported
    "Treasure Chart 14": 0XDD,       # Supported
    "Treasure Chart 10": 0XDE,       # Supported
    "Treasure Chart 40": 0XDF,       # Supported
    "Treasure Chart 3": 0XE0,        # Supported
    "Treasure Chart 4": 0XE1,        # Supported
    "Treasure Chart 28": 0XE2,       # Supported
    "Treasure Chart 16": 0XE3,       # Supported
    "Treasure Chart 18": 0XE4,       # Supported
    "Treasure Chart 34": 0XE5,       # Supported
    "Treasure Chart 29": 0XE6,       # Supported
    "Treasure Chart 1": 0XE7,        # Supported
    "Treasure Chart 35": 0XE8,       # Supported
    "Treasure Chart 12": 0XE9,       # Supported
    "Treasure Chart 6": 0XEA,        # Supported
    "Treasure Chart 24": 0XEB,       # Supported
    "Treasure Chart 39": 0XEC,       # Supported
    "Treasure Chart 38": 0XED,       # Supported
    "Treasure Chart 2": 0XEE,        # Supported
    "Treasure Chart 33": 0XEF,       # Supported
    "Treasure Chart 31": 0XF0,       # Supported
    "Treasure Chart 23": 0XF1,       # Supported
    "Treasure Chart 5": 0XF2,        # Supported
    "Treasure Chart 20": 0XF3,       # Supported
    "Treasure Chart 30": 0XF4,       # Supported
    "Treasure Chart 15": 0XF5,       # Supported
    "Treasure Chart 11": 0XF6,       # Supported
    "Triforce Chart 8": 0XF7,        # Supported
    "Triforce Chart 7": 0XF8,        # Supported
    "Triforce Chart 6": 0XF9,        # Supported
    "Triforce Chart 5": 0XFA,        # Supported
    "Triforce Chart 4": 0XFB,        # Supported
    "Triforce Chart 3": 0XFC,        # Supported
    "Triforce Chart 2": 0XFD,        # Supported
    "Triforce Chart 1": 0XFE,        # Supported
    "INVALID ID": 0xFF               # Just in Case.
}