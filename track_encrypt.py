import os
import json

from nucypher.characters.lawful import Enrico


# HEART_DATA_FILENAME = 'track_data.msgpack'

# Data Sources can produce encrypted data for access policies
# that **don't exist yet**.
# In this example, we create a local file with encrypted data
def encrypt_track_samples(policy_pubkey, path_file):
    data_source = Enrico(policy_encrypting_key=policy_pubkey)

    data_source_public_key = bytes(data_source.stamp)

    track_files = os.listdir(path_file)
    track_segments = list()
    for file in track_files:
        with open(file, "rb") as f:
            plaintext = f.read()

        ciphertext, signature = data_source.encrypt_message(plaintext)
        track_segments.append(ciphertext)
        print("Signature", signature)
        with open(file + '_encrypted', "wb") as f:
            f.write(ciphertext)
    
    data = {
        'track_segments': track_segments,
        'data_source': data_source_public_key
    }
    with open('track_segments', "wb") as f:
        f.write(data)

    return data
