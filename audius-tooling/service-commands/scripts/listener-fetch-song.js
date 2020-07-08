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

const btoa = function (str) {
  if (Buffer.byteLength(str) !== str.length) throw new Error("bad string!");
  return Buffer(str, "binary").toString("base64");
};

const FORMAT = "#EXTM3U";
const VERSION = "#EXT-X-VERSION:3";
const TARGET_DURATION = "#EXT-X-TARGETDURATION:";
const MEDIA_SEQUENCE = "#EXT-X-MEDIA-SEQUENCE:0";
const SEGMENT_HEADER = "#EXTINF:";
const STREAM_VARIANT_65K =
  '#EXT-X-STREAM-INF:TYPE=AUDIO,BANDWIDTH=65000,CODECS="mp4a.40.2"';
const ENDLIST = "#EXT-X-ENDLIST";

const TARGET_DURATION_VALUE = 6;

const generateM3U8 = (segments, gateway) => {
  let targetDuration = TARGET_DURATION_VALUE;

  // Special case tracks that were segmented incorrectly and only have one segment
  // by setting the HLS target duration to that segment's duration (fixes Safari HLS issues).
  if (segments.length === 1) {
    targetDuration = Math.round(parseFloat(segments[0].duration));
  }

  let lines = [
    FORMAT,
    VERSION,
    `${TARGET_DURATION}${targetDuration}`,
    MEDIA_SEQUENCE,
  ];

  lines = lines.concat(
    segments.map((segment, i) => {
      const link = `${gateway}${segment.multihash}`;
      // Write a CID directly to the manifest file so that the fragment
      // loader can customizably fetch the CID.
      return [`${SEGMENT_HEADER}${segment.duration}`, link].join("\n");
    })
  );

  lines.push(ENDLIST);
  let variant = lines.join("\n");
  fs.writeFileSync("./UnLockedOutOfHeaven.m3u8", variant);

  return encodeURI(
    `data:application/vnd.apple.mpegURL;base64,${btoa(variant)}`
  );
};


(async function () {
    console.log("Fetching Bob's Public Keys")
  let bobPublicKey = {
    enc: "0326b2ad372a27856d568e492eb134b2b5a385b03c61fba78116a4fbc369d93690",
    sig: "0270cf9075c47bf020f3f2b8f06e7b6609bcaac3e3de7a63a5d7767951dd196265",
  };
    console.log("Bob's Keys Fetched ");
  obj = {
    bobPublicKey,
    trackId: 1,
  };
  
  // let url = "https://127.0.0.1:5011/api/v1/payments/0x795C0c7716EEcd8A4D346247C962fC6899Dc2d46/0xAF06950aa322877B640d9533163a19C739DA1a1D";

  // console.log("Fetching payments history to hub from target");
  // const res = await fetch(url, { method: 'GET', headers: { 'Content-Type': 'application/json' } });
  // const data = res.json();
  // console.log("Payment has been verified");
  console.log("Asking Alice to Grant Access to Bob");
  const res = await fetch(creatorNodeURL1 + "/users/grantAccess", {
    method: "POST",
    body: JSON.stringify(obj),
    headers: { "Content-Type": "application/json" },
  });

  let body = await res.json();
  let inter = JSON.parse(JSON.stringify(body, null, "\t"));

  let policy_metadata = JSON.parse(inter.data);
  console.log("Bob now has access to the track");

  let url = "http://127.0.0.1:32770/join";
  console.log("Listener joining policy with label", policy_metadata["label"]);
  const res2 = await fetch(url, {
    method: "POST",
    body: JSON.stringify(policy_metadata),
    headers: { "Content-Type": "application/json" },
  });
  const data = await res2.text();
  console.log("Policy Joined successfully");

  console.log("Creating m3u8 file for playing the track");

  let trackData = await fetch(
    "http://audius-disc-prov_web-server_1:5000/tracks"
  );
  const tracksInfo = await trackData.json();

  generateM3U8(
    tracksInfo["data"][0]["track_segments"],
    `http://127.0.0.1:32770/decrypt/${policy_metadata["label"]}/`
  );
  
})();
