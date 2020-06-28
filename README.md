# NuCypher's Heartbeat Demo

![Heartbeat Demo](https://user-images.githubusercontent.com/2564234/49080419-dda35680-f243-11e8-90d7-6f649d80e03d.png)

Creator encrypts it's tracks and then upload them in encrypted form. Creator creates a policy before encrypting and uploading data. That policy is track specific. Since creator might want to allow listeners access to her music, she creates this policy without knowing any listener.
Policy Pubkey is used while encrypting and uploading the data.

Now when she wants to share this info with others, she would reuire buyers/listeners public key so that she can grant access to them. Once she gets it she'd create a policy granting access and after that listener can obtain that data in encrypted form from Enrico. Listener would then request nuCypher to re-encrypt the data so he can decrypt it with his private key. (Note that listener can't decrypt the data directly without re-encrypting it first).

This simple use case showcases many interesting and distinctive aspects of NuCypher:
  - Creator can create policy public keys **before knowing** who will be the potential consumers.
  - Creator, or anyone knowing the policy public key (e.g., the Heart Monitor),
  can produce encrypted data that belongs to the policy. Again, this can happen before granting access to any consumer.
  - As a consequence of the previous point, Data Sources, like the Heart Monitor,
  are completely unaware of the recipients. In their mind, they are producing data **for Alicia**.
  - Creator never interacts with the Listeners: she only needs the listener's public key.
  - Creator only interacts with the NuCypher network for granting access to the Listener.
  After this, she can even disappear from the face of the Earth.
  - The Listener never interacts with Creator or the Heart Monitor:
  he only needs the encrypted data and some policy metadata.

## FLow
- Creator signs up on our platform with her email and password, her password becomes her passphrase(plaintext or hash anything).
- She can configures a policy without any receiver and uses it's policy pub key to encrypt her track.
- Creator makes contract call to let smart contract know about policy (pass policypubkey).
- A listener sign up on our platform with email, when he does that we generate a keyPair for him (two pub keys, two priv keys) and create a tuple in which we store those keys with his email or hash of email to identify him later.
- A listener will make a smart contract method call to pay the amount associated with that track. When he does that we emit an event with his address which our platform listens to. Upon succesful payment alice will grant him access through policy to nuCypher network.
- After that policy info will be shown on the dashboard to listener.
- Listener object will be created with both his private keys. Listener then joins policy from the info shown in dashboard. 
- Listener gets encrypted data from Enrico using policy pubkey and policy pubkey stamp.
- Listener retrieves re-encrypted data from nuCypher and then decryptes it using his own private key.

### How to run the demo 
Assuming you already have `nucypher` installed and a local demo fleet of Ursulas deployed (if not checkout this https://docs.nucypher.com/en/latest/demos/local_fleet_demo.html),
running the demo only involves running the `creator.py` and `listener.py` scripts. You should run `creator.py` first:

```sh
(nucypher)$ python3 creator.py
```
This will create a temporal directory called `alice-tracks` that contains the data for making creator persistent
(i.e., her private keys). Apart from that, it will also generate data and keys for the demo.
What's left is running the `listener.py` script:

```sh
(nucypher)$ python3 listener.py
```
This script will read the data generated in the previous step and retrieve re-encrypted ciphertexts via the NuCypher
network. The result is printed in the console:

```
Creating the Listener ...
Listener =  ⇀Maroon Snowman DarkSlateGray Bishop↽ (0xA36bcd5c5Cfa0C1119ea5E53621720a0C1a610F5)
The Listener joins policy for label 'track-datae917d959'
----------------------❤︎ (82 BPM)                    Retrieval time:  3537.06 ms
---------------------❤︎ (81 BPM)                     Retrieval time:  2654.51 ms
-------------------------❤︎ (85 BPM)                 Retrieval time:  1513.32 ms
----------------------------❤︎ (88 BPM)              Retrieval time:  1552.66 ms
-----------------------❤︎ (83 BPM)                   Retrieval time:  1720.66 ms
---------------------❤︎ (81 BPM)                     Retrieval time:  1485.25 ms
---------------------❤︎ (81 BPM)                     Retrieval time:  1459.16 ms
---------------------❤︎ (81 BPM)                     Retrieval time:  1520.30 ms
----------------❤︎ (76 BPM)                          Retrieval time:  1479.54 ms
----------------❤︎ (76 BPM)                          Retrieval time:  1464.17 ms
---------------------❤︎ (81 BPM)                     Retrieval time:  1483.04 ms
----------------❤︎ (76 BPM)                          Retrieval time:  1687.72 ms
---------------❤︎ (75 BPM)                           Retrieval time:  1563.65 ms
```
