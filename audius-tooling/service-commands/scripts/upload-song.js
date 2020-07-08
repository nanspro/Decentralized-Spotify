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

const creatorNodeURL1 = "http://cn1_creator-node_1:4000";

const metadata = {
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

const trackMetadata = {  
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
  console.log("User Signup Done");

  await upgradeToCreator(myLibs, creatorNodeURL1);
  console.log("User Upgraded to creator");

  await fetch(creatorNodeURL1 + "/users/initAlice");
  console.log("Alice is init on creator node done")

  console.log("Starting Track upload and Encryption to Audius")
  let trackPath = '../../../nucypher/test_tracks/001 - Bruno Mars - Locked Out Heaven.mp3';
  let trackUploaded = await uploadTrack(myLibs, trackMetadata, trackPath);
  console.log("Track Uploaded with id", trackUploaded);

})();
