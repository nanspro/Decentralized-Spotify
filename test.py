import artist
import listener
import listener_keys
import track_encrypt


label = 'Test_Label'

alicia, alicia_config = artist.initialize_alice()
policy_public = artist.get_policy_pubkey(alicia, label)

track_encrypt.encrypt_track_segments(policy_public, "./test_tracks")
bob_pubkey = listener_keys.get_listener_pubkeys()

policy = artist.grant_access_policy(alicia, label, bob_pubkey)
artist.save_policy_metadata(alicia, policy, label)

bob_private_keys = listener_keys.get_listener_privkeys()

listen_obj = listener.initialize_bob(bob_private_keys)
listener.join_policy(listen_obj, 'policy-metadata.json')

listener.reencrypt_data('./test_tracks', 'policy-metadata.json', listen_obj)

