const fetch = require('node-fetch')

const verifyCIDExistsOnCreatorNode = async (cid, creatorNodeEndpoint) => {
  console.log('verifying CID exists!')
  const url = `${creatorNodeEndpoint}/ipfs/${cid}`

  // Perform HEAD request, ensuring the route returns 200
  const resp = await fetch(url, { method: 'HEAD' })
  return resp.ok
}

module.exports = { verifyCIDExistsOnCreatorNode }
# import artist
# import listener
# import listener_keys
# import track_encrypt


# label = 'Test_Label'

# # On new Creator
# alicia, alicia_config = artist.initialize_alice()

# # # On post /track_content
# # policy_publickey = artist.get_policy_pubkey(alicia, label)
# # track_encrypt.encrypt_track_segments(policy_publickey, "./test_tracks")

# # # on buy
# # # some function to check payment 
# # policy = artist.grant_access_policy(alicia, label, bob_pubkey)
# # artist.save_policy_metadata(alicia, policy, label)
# # # Upload policy-metadata to ipfs, return url to file 

# # # WebUI -> localhost:90000 -> BuyNowEndpoint -> Buy.from.CreatorNode -> # OnBuy
# # #                                             <-  JSON policy metadata <-
# # # ----------------
# # # Standalone Listener server init
# # bob_pubkey = listener_keys.get_listener_pubkeys()
# # bob_private_keys = listener_keys.get_listener_privkeys()
# # listen_obj = listener.initialize_bob(bob_private_keys)

# # # Standalone server on buy
# # listener.join_policy(listen_obj, 'policy-metadata.json')

# # # Standalone server on play
# # listener.reencrypt_data('./test_tracks', 'policy-metadata.json', listen_obj)
