import json
import traceback
from timeit import default_timer as timer

import maya
import msgpack
import os
import shutil
import sys
from umbral.keys import UmbralPublicKey

from nucypher.characters.lawful import Bob, Enrico, Ursula
from nucypher.config.constants import TEMPORARY_DOMAIN
from nucypher.crypto.kits import UmbralMessageKit
from nucypher.crypto.powers import DecryptingPower, SigningPower
from nucypher.datastore.keypairs import DecryptingKeypair, SigningKeypair
from nucypher.network.middleware import RestMiddleware
from nucypher.utilities.logging import GlobalLoggerSettings
# from listener_keys import get_listener_privkeys


GlobalLoggerSettings.start_console_logging()

try:
    SEEDNODE_URI = sys.argv[1]
except IndexError:
    SEEDNODE_URI = "localhost:11500"


def initialize_bob(bob_privkeys):
    ursula = Ursula.from_seed_and_stake_info(seed_uri=SEEDNODE_URI,
                                         federated_only=True,
                                         minimum_stake=0)
    TEMP_DOCTOR_DIR = "{}/listener-files".format(os.path.dirname(os.path.abspath(__file__)))

    # Remove previous demo files and create new ones
    shutil.rmtree(TEMP_DOCTOR_DIR, ignore_errors=True)

    bob_enc_keypair = DecryptingKeypair(private_key=bob_privkeys["enc"])
    bob_sig_keypair = SigningKeypair(private_key=bob_privkeys["sig"])
    enc_power = DecryptingPower(keypair=bob_enc_keypair)
    sig_power = SigningPower(keypair=bob_sig_keypair)
    power_ups = [enc_power, sig_power]

    print("Creating the Listener ...")

    listener = Bob(
        domains={TEMPORARY_DOMAIN},
        federated_only=True,
        crypto_power_ups=power_ups,
        start_learning_now=True,
        abort_on_learning_error=True,
        known_nodes=[ursula],
        save_metadata=False,
        network_middleware=RestMiddleware(),
    )

    print("Listener = ", listener)
    return listener


def join_policy(listener, policy_filename): 
    # Let's join the policy generated by Alicia. We just need some info about it.
    with open(policy_filename, 'r') as f:
        policy_data = json.load(f)

    policy_pubkey = UmbralPublicKey.from_bytes(bytes.fromhex(policy_data["policy_pubkey"]))
    alices_sig_pubkey = UmbralPublicKey.from_bytes(bytes.fromhex(policy_data["alice_sig_pubkey"]))
    label = policy_data["label"].encode()

    print("The Listener joins policy for label '{}'".format(label.decode("utf-8")))
    listener.join_policy(label, alices_sig_pubkey)
    return label


def reencrypt_data(data_filepath, policy_filename, listener):
    '''
    Now that the listener joined the policy in the NuCypher network,
    he can retrieve encrypted data which he can decrypt with his private key.
    '''

    with open(policy_filename, 'r') as f:
        policy_data = json.load(f)

    policy_pubkey = UmbralPublicKey.from_bytes(bytes.fromhex(policy_data["policy_pubkey"]))
    alices_sig_pubkey = UmbralPublicKey.from_bytes(bytes.fromhex(policy_data["alice_sig_pubkey"]))
    label = policy_data["label"].encode()
    
    track_encrypted_files = os.scandir(data_filepath)
    for track_segment_encrypted in track_encrypted_files:
        if not track_segment_encrypted.name.endswith('_encrypted'):
            continue
        with open(track_segment_encrypted, 'rb') as f:
            data = msgpack.load(f)

        message_kit = UmbralMessageKit.from_bytes(data[b'track_segment_data'])
        data_source = Enrico.from_public_keys(
            verifying_key=data[b'data_source'],
            policy_encrypting_key=policy_pubkey
        )
        
        try:
            start = timer()
            retrieved_plaintexts = listener.retrieve(
                message_kit,
                label=label,
                enrico=data_source,
                alice_verifying_key=alices_sig_pubkey
            )
            end = timer()

            plaintext = retrieved_plaintexts[0]
            file_name = track_segment_encrypted.path[:-10] + "_decrypted.mp3"

            with open(file_name, 'wb') as f:
                f.write(plaintext)
            
        except Exception as e:
            # We just want to know what went wrong and continue the demo
            traceback.print_exc()
