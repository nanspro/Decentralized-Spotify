const ServiceCommands = require("../src/index");
const fetch = require("node-fetch");
const m3u8 = require('m3u8');

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


const creatorNodeURL1 = "http://cn1_creator-node_1:4000",

let metadata = {
  email: "nemaniarjun@gmail.com",
  password: "nemaniarjun@gmail.com",
  name: "NewCreator1",
  handle: "newhandle",
  profile_picture: null,
  profile_picture_sizes: null,
  cover_photo_sizes: null,
  cover_photo: null,
  is_creator: true,
  bio: null,
  location: null,
  creator_node_endpoint: creatorNodeURL1,
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

  await addUser(myLibs, metadata);
  console.log("Init Done");

  await upgradeToCreator(myLibs, constants.creatorNodeURL1);
  console.log("upgraded to creator");

  await fetch(constants.creatorNodeURL1 + "/users/initAlice");

  let trackPath = '../../../src/test_tracks/001 - Bruno Mars - Locked Out Heaven.mp3';
  let trackUploaded = await uploadTrack(myLibs, trackMetadata, trackPath);
  console.log("Track Uploaded");
  console.log(trackUploaded);
  
  // bobPublicKey = 
  
  obj = {
    bobPublicKey,
    trackId: trackUploaded
  }


  // let url = "https://127.0.0.1:5011/api/v1/payments/0x795C0c7716EEcd8A4D346247C962fC6899Dc2d46/0xAF06950aa322877B640d9533163a19C739DA1a1D";

  // console.log("Fetching payments history to hub from target");
  // const res = await fetch(url, { method: 'GET', headers: { 'Content-Type': 'application/json' } });
  // const data = res.json();
  // console.log("Payment has been verified");

  const res = await fetch(constants.creatorNodeURL1 + "/users/grantAccess", 
    { method: 'POST', body: JSON.stringify(obj), headers: { 'Content-Type': 'application/json' } });
  body = await res.json();
  let data = JSON.parse(body.data);
  console.log(data);



  // let url = "https://127.0.0.1:20000/join";
  // let policy_metadata = {}
  // policy_metadata["policy_pubkey"] = '';
  // policy_metadata["alice_sig_pubkey"] = '';
  // policy_metadata["label"] = trackMetadata["title"];

  // console.log("Listener joining policy for track {}", policy_metadata["label"]);
  // const res = await fetch(url, { method: 'POST', body: JSON.stringify(policy_metadata), headers: {'Content-Type': 'application/json'}});
  // const data = res.json();
  // console.log("Policy {} Joined successfully", data);


  // var m3u = m3u8.M3U.create();
  // m3u.addPlaylistItem({
  //   duration: 10,
  //   uri: `https://127.0.0.1:20000/decrypt/${label}/${ipfsHash}`
  // });

})();
