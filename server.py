import artist
import listener
import listener_keys
import track_encrypt
import ipfsApi

from flask import Flask
app = Flask(__name__)
api = ipfsApi.Client('127.0.0.1', 5001)

@app.route('/decrypt/<bobprivkeys>/<ipfsHash>')
def hello(bobprivkeys, ipfsHash):
    listen_obj = listener.initialize_bob(bobprivkeys)
    enc_data = api.get(ipfsHash)
    data = listener.reencrypt_segment(enc_data, 'policy-metadata.json', listen_obj)
    return data

if __name__ == '__main__':
    app.run()