# Audius-NuCypher

![Heartbeat Demo](https://user-images.githubusercontent.com/2564234/49080419-dda35680-f243-11e8-90d7-6f649d80e03d.png)

Audius gives everyone the freedom to share, monetize, and listen to any audio content. It is a fully decentralized community of artists, developers, and listeners collaborating to share and defend the world’s music.

We integrated nuCypher with audius protocol and added raiden network on top of them as payment layer. Integrating nuCypher with audius helps in uploading encrypted songs to ipfs and then decrypting them only once the users have paid for it. Payments are gonna be off chain and will be handled by raiden network.

## User Flow

### Artists
- Artists keys are generated when they sign up to audius and then they can use those keys to upload songs by providing some metadata like genre, track name, price etc.
- A track will be broken into segments and then each segment will be encrypted and then uploaded to ipfs. In audius we are using Postgres as persistent storage which will store track_segments hash into database.
- Artists will create grant access policies to nuCypher, allowing them to access and decrypt the track
- Artists will verify from raiden whether an successful payment has been made from listener to him for the given track.

### Listeners
- A listener bob when interacting with audius will run a standalone server just like a creator runs a creator_node by himself. He'll also be running a raiden node locally to initiate payments and join channels.
- Listener will have it's own private keys and pubkeys stored locally in his device. He will interact with his standalone server which talks to nuCypher and his raiden node.
- Listener will see the tracks available and could pay for whatever he is interested in through raiden's webui. Once the payment is successful, he would be able to see the policy details on ui which was granted by the creator.
- Listener will then join that policy and he'd get the decrypted data of the track from nuCypher.
- Listener will be able to play the track on browser using HLS stream

## Using nuCypher
Nucypher is being used here to encrypt the songs before storing them anywhere so that data can only be decrypted by the people who pay for it and no one other than buyers would be able to acces it. nuCypher's proxy re-encryption also helps in encrypting the data only once and then creating different grant policies for those who pay for that data. No need to encrypt the data again and again for every user.

The key management for now is done in a way that creators and listeners both run their own nodes to talk to nuCypher and audius and raiden and so their keys could be stored in their local machine itself.

## Using Raiden
Raiden Network is used here as a payment solution. Creators and Listeners run their own raiden nodes. Also one raiden node will be running as hub from audius team itself. Listeners and Artits both can then connect to central hub. Listeners can pay to artists directly through audius hub without creating any channel between them directly.

Upon successful payment for a track to an artist, our creator node will query raiden events to verify whether payment was successful or not. If successful, it'll automatically create a grant access policy to the buyer.

## How to run locally

## Challenges we faced
- Integrating anything with such a large existing app like audius could prove very difficult as we learned along the way. Integrating nuCYpher into the core of audius's cretor node turned to be very cumbersome but we did manage to write new routes and integrate it successfully however that didn't leave much time for us to setup a good ui for the project.