from windWakerResources import item_id_dict
import json

with open("itemMapping.json", "w") as outfile:
    json.dump(item_id_dict, outfile)
