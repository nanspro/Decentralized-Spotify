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
    print(dir_path)
    target_path = "/".join(dir_path.split('/')[:-1])
    target_path = os.path.join(target_path, 'segments_encrypted')

    if not os.path.exists(target_path):
        try:
            os.makedirs(target_path)
        except OSError as exc: # Guard against race condition
            if exc.errno != errno.EEXIST:
                raise

    track_files = os.scandir(dir_path)
    
    for track_segment in track_files:
        with open(track_segment, "rb") as f:
            plaintext = f.read()

        ciphertext, signature = data_source.encrypt_message(plaintext)
        
        print("Signature", signature)
        data = {
            'track_segment_data': ciphertext.to_bytes(),
            'data_source': data_source_public_key
        }
        
        with open(os.path.join(target_path, track_segment.name), "wb") as f:
            msgpack.dump(data, f, use_bin_type=True)
    
    return True

def encrypt_track(policy_pubkey, file_path):
    data_source = Enrico(policy_encrypting_key=policy_pubkey)
    data_source_public_key = bytes(data_source.stamp)
    print(file_path)

    with open(file_path, "rb") as f:
        plaintext = f.read()

    ciphertext, signature = data_source.encrypt_message(plaintext)
    
    print("Signature", signature)
    data = {
        'track_segment_data': ciphertext.to_bytes(),
        'data_source': data_source_public_key
    }
    
    with open(file_path + '_encrypted', "wb") as f:
        msgpack.dump(data, f, use_bin_type=True)
    
    return True
