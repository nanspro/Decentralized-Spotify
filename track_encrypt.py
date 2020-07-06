import os
import json
import msgpack

from nucypher.characters.lawful import Enrico


# HEART_DATA_FILENAME = 'track_data.msgpack'

# Data Sources can produce encrypted data for access policies
# that **don't exist yet**.
# In this example, we create a local file with encrypted data
def encrypt_track_segments(policy_pubkey, path_file):
    data_source = Enrico(policy_encrypting_key=policy_pubkey)
    data_source_public_key = bytes(data_source.stamp)

    track_files = os.listdir(path_file)
    for track_segment in track_files:
        with open(track_segment, "rb") as f:
            plaintext = f.read()

        ciphertext, signature = data_source.encrypt_message(plaintext)
        
        print("Signature", signature)
        data = {
            'track_segment_data': ciphertext,
            'data_source': data_source_public_key
        }
        with open(track_segment + '_encrypted', "wb") as f:
            msgpack.dump(data, f, use_bin_type=True)
    
    return True
