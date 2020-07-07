import os
import json
import msgpack

from nucypher.characters.lawful import Enrico


# HEART_DATA_FILENAME = 'track_data.msgpack'

# Data Sources can produce encrypted data for access policies
# that **don't exist yet**.
# In this example, we create a local file with encrypted data
def encrypt_track_segments(policy_pubkey, dir_path):
    data_source = Enrico(policy_encrypting_key=policy_pubkey)
    data_source_public_key = bytes(data_source.stamp)
    
    target_path = os.path.join(dir_path.split('/')[:-1])
    target_path = os.path.join(target_path, 'segments_encrypted')

    track_files = os.scandir(dir_path)
    
    for track_segment in track_files:
        # path = os.path.join(path_file, track_segment)
        # print(track_segment)
        with open(track_segment, "rb") as f:
            plaintext = f.read()

        ciphertext, signature = data_source.encrypt_message(plaintext)
        
        print("Signature", signature)
        data = {
            'track_segment_data': ciphertext.to_bytes(),
            'data_source': data_source_public_key
        }
        # print(data)
        with open(target_path + track_segment.name, "wb") as f:
            msgpack.dump(data, f, use_bin_type=True)
    
    return True
