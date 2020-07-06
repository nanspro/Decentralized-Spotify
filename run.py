import argparse
import artist
import listener
import listener_keys
import track_encrypt

parser = argparse.ArgumentParser()
parser.add_argument("function", help = "Function name to be executed")
parser.add_argument("--alice", help = "Creator Object")
parser.add_argument("--bob", help = "Listener Object")
parser.add_argument("--label", help = "Policy label")
parser.add_argument("--policy", help = "Policy Object")
parser.add_argument("--policypubkey", help = "Policy Pubkey")
parser.add_argument("--datapath", help = "Path of tracks")
parser.add_argument("--bobpubkeys", help = "Listener Pubkeys")
parser.add_argument("--bobprivkeys", help = "Listener Privkeys")
parser.add_argument("--policydata", help = "Policy Metatada Path")

args = parser.parse_args()
print(args.function)
if args.function == 'initialize_alice':
    alice, alice_config = artist.initialize_alice()

if args.function == 'get_policy_pubkey':
    policy_public = artist.get_policy_pubkey(args.alice, args.label)

if args.function == 'encrypt_track_segments':
    track_encrypt.encrypt_track_segments(args.policypubkey, args.datapath)

# if args.function == 'get_listener_pubkeys':
#     bob_pubkey = listener_keys.get_listener_pubkeys()

if args.function == 'grant_access_policy':
    policy = artist.grant_access_policy(args.alice, args.label, args.bobpubkeys)

if args.function == 'save_policy_metadata':
    artist.save_policy_metadata(args.alice, args.policy, args.label)

# if args.function == 'get_listener_privkeys':
#     bob_private_keys = listener_keys.get_listener_privkeys()

# if args.function == 'initialize_bob':
#     listen_obj = listener.initialize_bob(args.bobprivkeys)

# if args.function == 'join_policy':
#     listener.join_policy(args.bob, args.policydata)

if args.function == 'reencrypt_data':
    listener.reencrypt_data(args.datapath, args.policydata, args.bob)

