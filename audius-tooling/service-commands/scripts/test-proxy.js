const ServiceCommands = require("../src/index");
const fetch = require("node-fetch");

const {
  performHealthCheck,
  LibsWrapper,
  addUser,
  upgradeToCreator,
  uploadTrack,
  getTrackMetadata,
  getUser,
} = ServiceCommands;
var fs = require("fs");


let constants = {
  trackMetadataCID: "QmSH5gJPHg9xLzV823ty8BSGyHNP6ty22bgLsv5MLY3kBq",
  trackMetadataCID2: "QmSH5gJPHg9xLzV823ty8BSGyHNP6ty22bgLaaaaaaaaaa",
  creatorMetadataCID: "QmTDhoEDLE3k3CE5bu4mF1ogsEVkPwEAM41KsN7hZX1eWY",
  "0x0": "0x0000000000000000000000000000000000000000000000000000000000000000",
  creatorNodeURL1: "http://cn1_creator-node_1:4000",
  signatureData: "Click sign to authenticate with creator node:1543885912",
  signatureAddress: "0x7d267e2f8dc64c53267c56dab55bf7050566baec",
  signature:
    "0xbb3ffe5f32950ace5c0a8ecb9c43ab836b7b7146a56e2519ac1c662e9b00bdcd7de9a3f3265206c54f0b8094f8ac8832d32d5852492c1aa3e9493e28ae3a31b91b",
  wallet: "0xdfdbe819b5710b750b3a00eb2fae8a59b85c66af",
  // ethContractsConfig: ethContractsConfig,
};

let metadata = {
  email: "nemaniarjun3@gmail.com",
  password: "nemaniarjun3@gmail.com",
  name: "NewCreator",
  handle: "newhandl",
  profile_picture: null,
  profile_picture_sizes: null,
  cover_photo_sizes: null,
  cover_photo: null,
  is_creator: true,
  bio: null,
  location: null,
  creator_node_endpoint: constants.creatorNodeURL1,
  is_verified: true,
};

let trackMetadata = {  
  title: 'ExampleFile',
  length: null,
  cover_art_sizes: null,
  tags: null,
  genre: null,
  mood: null,
  credits_splits: null,
  release_date: null,
  file_type: null,
};

(async function () {
  const myLibs = new LibsWrapper(0);
  await myLibs.initLibs();

  // // await addUser(myLibs, metadata);
  // // console.log("Init Done")
  // await upgradeToCreator(myLibs, constants.creatorNodeURL1);
  // console.log("upgraded to creator")
  // await fetch(constants.creatorNodeURL1 + "/users/initAlice");
  // // trackMetadata.owner_id = user.user_id
  // let trackPath = '../../../src/test_tracks/001 - Bruno Mars - Locked Out Heaven.mp3';
  // let trackUploaded = await uploadTrack(myLibs, trackMetadata, trackPath);
  // console.log("Track Uploaded");
  bobPublicKey = { "enc": "02ffb9da42dde6d8bcecadb96514d91cb8434d2fff7ac201b49f0770c5cda1f733", "sig": "024ce23b871a21b69b04fee3b9ba108a631a5a6657eb51791d55e260ce689850ee" }
  obj = {
    bobPublicKey,
    trackId: 1
  }

  const res = await fetch(constants.creatorNodeURL1 + "/users/grantAccess", 
    { method: 'POST', body: JSON.stringify(obj), headers: { 'Content-Type': 'application/json' } });
  body = await res.json()
  console.log(body);
})();

// Init Bob will happen automatically when the standalone server is up

// Check payment???
(async function () {
  let url = "https://127.0.0.1:5011/api/v1/payments/0x795C0c7716EEcd8A4D346247C962fC6899Dc2d46/0xAF06950aa322877B640d9533163a19C739DA1a1D";

  console.log("Fetching payments history to hub from target");
  const res = await fetch(url, { method: 'GET', headers: {'Content-Type': 'application/json'}});
  const data = res.json();
  console.log("Payment has been verified");

})();

// Grant access policy
  

// // // Bob Join Policy
// (async function () {
//   let url = "https://127.0.0.1:20000/join";
//   let policy_metadata = {}
//   policy_metadata["policy_pubkey"] = '';
//   policy_metadata["alice_sig_pubkey"] = '';
//   policy_metadata["label"] = trackMetadata["title"];

//   console.log("Listener joining policy for track {}", policy_metadata["label"]);
//   const res = await fetch(url, { method: 'POST', body: JSON.stringify(policy_metadata), headers: {'Content-Type': 'application/json'}});
//   const data = res.json();
//   console.log("Policy {} Joined successfully", data);

// })();

// // // Bob decrypt track segment
// // (async function () {
// //   let url = "https://127.0.0.1:20000/decrypt";
// //   let req = {}
// //   req["label"] = trackMetadata["title"];
// //   req["ipfsHash"] = ''

// //   console.log("Listener fetching track {}", req["ipfsHash"]);
// //   const res = await fetch(url, { method: 'POST', body: JSON.stringify(req), headers: {'Content-Type': 'application/json'}});
// //   const data = res.json();
// //   console.log("Track fetched successfully", data);

// // })();