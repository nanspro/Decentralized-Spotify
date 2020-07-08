import datetime
import sys
import json
import os
import shutil

import maya

from nucypher.characters.lawful import Bob, Ursula
from nucypher.config.characters import AliceConfiguration
from nucypher.config.constants import TEMPORARY_DOMAIN
from nucypher.utilities.logging import GlobalLoggerSettings

# from listener_keys import get_listener_pubkeys

# Twisted Logger
# GlobalLoggerSettings.start_console_logging()

SEEDNODE_URI = "localhost:11500"
TEMP_ALICE_DIR = os.path.join('/', 'tmp', 'alice-tracks')

POLICY_FILENAME = "policy-metadata.json"
passphrase = "TEST_ALICIA_INSECURE_DEVELOPMENT_PASSWORD"

def get_alice():
    ursula = Ursula.from_seed_and_stake_info(seed_uri=SEEDNODE_URI,
                                         federated_only=True,
                                         minimum_stake=0)
    # A new Alice is restored from the configuration file
    new_alice_config = AliceConfiguration.from_configuration_file(
        filepath=os.path.join(TEMP_ALICE_DIR, 'alice.config.json'),
        domains={TEMPORARY_DOMAIN},
        known_nodes={ursula},
        start_learning_now=False,
        federated_only=True,
        learn_on_same_thread=True,
    )

    # Alice unlocks her restored keyring from disk
    new_alice_config.attach_keyring()
    new_alice_config.keyring.unlock(password=passphrase)
    new_alice = new_alice_config()
    new_alice.start_learning_loop(now=True)

    return new_alice


def initialize_alice():
    ursula = Ursula.from_seed_and_stake_info(seed_uri=SEEDNODE_URI,
                                         federated_only=True,
                                         minimum_stake=0)

    # If anything fails, let's create Alicia from scratch
    # Remove previous demo files and create new ones
    shutil.rmtree(TEMP_ALICE_DIR, ignore_errors=True)
    
    alice_config = AliceConfiguration(
        config_root=os.path.join(TEMP_ALICE_DIR),
        domains={TEMPORARY_DOMAIN},
        known_nodes={ursula},
        start_learning_now=False,
        federated_only=True,
        learn_on_same_thread=True,
    )

    alice_config.initialize(password=passphrase)
    alice_config.keyring.unlock(password=passphrase)
    
    # We will save Alicia's config to a file for later use
    alice_config_file = alice_config.to_configuration_file()
    
    with open(os.path.join(TEMP_ALICE_DIR, 'alice.config.json'), 'w') as f:
        f.write(open(alice_config_file).read())
    
    alicia = alice_config.produce()
    
    # Let's get to learn about the NuCypher network
    alicia.start_learning_loop(now=True)
    return alicia, alice_config_file


def get_policy_pubkey(label):
    '''
    Alicia can create the public key associated to the policy label,
    even before creating any associated policy
    '''
    alicia = get_alice()
    label = label.encode()
    policy_pubkey = alicia.get_policy_encrypting_key_from_label(label)
    # print("The policy public key for "
        #   "label '{}' is {}".format(label.decode("utf-8"), policy_pubkey.to_bytes().hex()))
    return policy_pubkey


def grant_access_policy(label, bob_pubkeys):
    '''
    Alicia creates a policy granting access to Bob.
    The policy is sent to the NuCypher network.
    '''
    alicia = get_alice()
    label = label.encode()
    # We create a view of the Bob who's going to be granted access.
    active_listener = Bob.from_public_keys(verifying_key=bob_pubkeys['sig'],
                                        encrypting_key=bob_pubkeys['enc'],
                                        federated_only=True)
    print("Creating access policy for the Listener...")
    # Policy expiration date
    policy_end_datetime = maya.now() + datetime.timedelta(days=5)
    # m-out-of-n: This means Alicia splits the re-encryption key in 2 pieces and
    #              she requires Bob to seek collaboration of at least 1 Ursulas
    m, n = 1, 2

    policy = alicia.grant(bob=active_listener,
                        label=label,
                        m=m,
                        n=n,
                        expiration=policy_end_datetime)
    print(json.dumps({
        "policy_pubkey": policy.public_key.to_bytes().hex(),
        "alice_sig_pubkey": bytes(alicia.stamp).hex(),
        "label": label.decode(),
    }))
