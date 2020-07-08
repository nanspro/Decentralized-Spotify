import argparse
import artist
import track_encrypt

import json

from umbral.keys import UmbralPublicKey

parser = argparse.ArgumentParser()
parser.add_argument("function", help = "Function name to be executed")
parser.add_argument("--label", help = "Policy label")
parser.add_argument("--policypubkeyHex", help = "Policy Pubkey")
parser.add_argument("--dirPath", help = "Path of tracks")
parser.add_argument("--bobpubkeys", help = "Listener Pubkeys")

args = parser.parse_args()
if args.function == 'initialize_alice':
    artist.initialize_alice()

if args.function == 'get_policy_pubkey':
    policy_key = artist.get_policy_pubkey(args.label)
    print(policy_key.to_bytes().hex())

if args.function == 'encrypt_track_segments':
    policy_key = UmbralPublicKey.from_bytes(bytes.fromhex(args.policypubkeyHex))
    track_encrypt.encrypt_track_segments(policy_key, args.dirPath)

if args.function == 'encrypt_file':
    policy_key = UmbralPublicKey.from_bytes(bytes.fromhex(args.policypubkeyHex))
    track_encrypt.encrypt_track(policy_key, args.dirPath)

if args.function == 'grant_access_policy':
    bob_pub_keys = json.loads(args.bobpubkeys)
    bobpubkeys = {}
    bobpubkeys["enc"] = UmbralPublicKey.from_bytes(bytes.fromhex(bob_pub_keys["enc"]))
    bobpubkeys["sig"] = UmbralPublicKey.from_bytes(bytes.fromhex(bob_pub_keys["sig"]))

    artist.grant_access_policy(args.label, bobpubkeys)
