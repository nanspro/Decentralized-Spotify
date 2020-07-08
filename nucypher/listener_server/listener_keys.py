import json
import os
from umbral.keys import UmbralPrivateKey, UmbralPublicKey

LISTENER_PUBLIC_JSON = 'listener.public.json'
LISTENER_PRIVATE_JSON = 'listener.private.json'


def generate_listener_keys():
    enc_privkey = UmbralPrivateKey.gen_key()
    sig_privkey = UmbralPrivateKey.gen_key()

    listener_privkeys = {
        'enc': enc_privkey.to_bytes().hex(),
        'sig': sig_privkey.to_bytes().hex(),
    }

    with open(LISTENER_PRIVATE_JSON, 'w') as f:
        json.dump(listener_privkeys, f)

    enc_pubkey = enc_privkey.get_pubkey()
    sig_pubkey = sig_privkey.get_pubkey()
    listener_pubkeys = {
        'enc': enc_pubkey.to_bytes().hex(),
        'sig': sig_pubkey.to_bytes().hex()
    }
    with open(LISTENER_PUBLIC_JSON, 'w') as f:
        json.dump(listener_pubkeys, f)


def _get_keys(file, key_class):
    if not os.path.isfile(file):
        generate_listener_keys()

    with open(file) as f:
        stored_keys = json.load(f)
    keys = dict()
    for key_type, key_str in stored_keys.items():
        keys[key_type] = key_class.from_bytes(bytes.fromhex(key_str))
    return keys


def get_listener_pubkeys():
    return _get_keys(LISTENER_PUBLIC_JSON, UmbralPublicKey)


def get_listener_privkeys():
    return _get_keys(LISTENER_PRIVATE_JSON, UmbralPrivateKey)
