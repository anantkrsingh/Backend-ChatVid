const roomId = getParameterByName("room");
const user = getParameterByName("user");
let roomData = null;
let userData = null;
let token = null;
let isExhausted = false;
let isPremium = false;
document.getElementById("default-user").value = localStorage.getItem("name");

try {
  fetch(`http://64.227.148.23:4040/api/user/get?user=${user}`,{
    referrerPolicy:'unsafe-url'
  })
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      console.log(data.user.email);
      userData = data.user;
      updateUser();
    })
    .catch((error) => {
      console.log(error);
    });
} catch (e) {
  alert(e);
}

try {
  fetch(`http://64.227.148.23:4040/api/meeting/get?room=${roomId}`)
    .then((response) => response.json())
    .then((data) => {
      console.log(data.message.host);
      roomData = data;
      updateUI();
    })
    .catch((error) => {
      console.log(error);
    });
} catch (e) {
  alert(e);
}

function updateUI() {
  document.getElementById("roomTitle").innerHTML = roomData.message.roomId;
  token = roomData.message.roomToken;
  console.log(roomData.message.roomToken);
}
function updateUser() {
  document.getElementById("default-user").value = userData.name;
  isPremium = userData.isPremium;
  const now = new Date();
  try {
    fetch(
      `http://64.227.148.23:4040/api/session/getTimestamp?uid=${userData._id}`
    )
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        if (!isPremium) {
          if (data.duration >= 30) {
            if (now.getDate() === data.lastUpdated) {
              isExhausted = true;
            }
          }
        }
      })
      .catch((error) => {
        console.log(error);
      });
  } catch (e) {
    alert(e);
  }
}
const key = localStorage.getItem("user");
console.log("Rrror");
let client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

console.log(token);
let config = {
  appid: "bfc058b9ee5a4a1fbf3e4adaa8727403",
  token: token,
  uid: null,
};

let localTracks = {
  audioTrack: null,
  videoTrack: null,
};

let localTrackState = {
  audioTrackMuted: false,
  videoTrackMuted: false,
};

let remoteTracks = {};

document.getElementById("join-btn").addEventListener("click", async () => {
  // config.uid = userData.email;
  if (isExhausted) {
    alert("Free user Limit Crossed");
  } else {
    await joinStreams();
    document.getElementById("join-wrapper").style.display = "none";
    document.getElementById("footer").style.display = "flex";
  }
});

document.getElementById("mic-btn").addEventListener("click", async () => {
  if (!localTrackState.audioTrackMuted) {
    await localTracks.audioTrack.setMuted(true);
    localTrackState.audioTrackMuted = true;
    document.getElementById("mic-btn").style.backgroundColor =
      "rgb(255, 80, 80, 0.7)";
  } else {
    await localTracks.audioTrack.setMuted(false);
    localTrackState.audioTrackMuted = false;
    document.getElementById("mic-btn").style.backgroundColor = "#ffffff8e";
  }
});

document.getElementById("camera-btn").addEventListener("click", async () => {
  if (!localTrackState.videoTrackMuted) {
    await localTracks.videoTrack.setMuted(true);
    localTrackState.videoTrackMuted = true;
    document.getElementById("camera-btn").style.backgroundColor =
      "rgb(255, 80, 80, 0.7)";
  } else {
    await localTracks.videoTrack.setMuted(false);
    localTrackState.videoTrackMuted = false;
    document.getElementById("camera-btn").style.backgroundColor = "#ffffff8e";
  }
});

document.getElementById("leave-btn").addEventListener("click", async () => {
  for (trackName in localTracks) {
    let track = localTracks[trackName];
    if (track) {
      track.stop();
      track.close();
      localTracks[trackName] = null;
    }
  }

  //Leave the channel
  await client.leave();
  document.getElementById("footer").style.display = "none";
  document.getElementById("user-streams").innerHTML = "";
  document.getElementById("join-wrapper").style.display = "block";
});

let joinStreams = async () => {
  client.on("user-published", handleUserJoined);
  client.on("user-left", handleUserLeft);

  client.enableAudioVolumeIndicator();
  client.on("volume-indicator", function (evt) {
    for (let i = 0; evt.length > i; i++) {
      let speaker = evt[i].uid;
      let volume = evt[i].level;
      if (volume > 0) {
        document.getElementById(`volume-${speaker}`).src = "./assets/sound.png";
      } else {
        document.getElementById(`volume-${speaker}`).src = "./assets/mute.png";
      }
    }
  });
  [config.uid, localTracks.audioTrack, localTracks.videoTrack] =
    await Promise.all([
      client.join(
        config.appid,
        getParameterByName("room"),
        token,
        userData.email || null
      ),
      AgoraRTC.createMicrophoneAudioTrack(),
      AgoraRTC.createCameraVideoTrack(),
    ]);

  let player = `<div class="video-containers" id="video-wrapper-${config.uid}">
                        <p class="user-uid"><img class="volume-icon" id="volume-${config.uid}" src="./assets/volume-on.svg" /> ${config.uid}</p>
                        <div class="video-player player" id="stream-${config.uid}"></div>
                  </div>`;

  document
    .getElementById("user-streams")
    .insertAdjacentHTML("beforeend", player);
  localTracks.videoTrack.play(`stream-${config.uid}`);

  await client.publish([localTracks.audioTrack, localTracks.videoTrack]);
  var i = 0;

  countTimestamp();

  try {
    fetch(
      `http://64.227.148.23:4040/api/session/enroll?room=${roomId}`
    )
      .then((response) => {
        return response.json();
      })
      .then((data) => {})
      .catch((error) => {
        console.log(error);
      });
  } catch (e) {}
  var remoteStats = await client.getRemoteVideoStats();

  var uidSet = new Set();
  for (var i = 0; i < remoteStats.length; i++) {
    uidSet.add(remoteStats[i].uid);
  }
  console.log("Total users in channel: " + uidSet.size);
};

let handleUserJoined = async (user, mediaType) => {
  console.log("Handle user joined");

  //#11 - Add user to list of remote users
  remoteTracks[user.uid] = user;

  //#12 Subscribe ro remote users
  await client.subscribe(user, mediaType);

  if (mediaType === "video") {
    let player = document.getElementById(`video-wrapper-${user.uid}`);
    console.log("player:", player);
    if (player != null) {
      player.remove();
    }

    player = `<div class="video-containers" id="video-wrapper-${user.uid}">
                        <p class="user-uid"><img class="volume-icon" id="volume-${user.uid}" src="./assets/volume-on.svg" /> ${user.uid}</p>
                        <div  class="video-player player" id="stream-${user.uid}"></div>
                      </div>`;
    document
      .getElementById("user-streams")
      .insertAdjacentHTML("beforeend", player);
    user.videoTrack.play(`stream-${user.uid}`);
  }

  if (mediaType === "audio") {
    user.audioTrack.play();
  }
};

let handleUserLeft = (user) => {
  console.log("Handle user left!");
  delete remoteTracks[user.uid];

  document.getElementById(`video-wrapper-${user.uid}`).remove();
};
function getParameterByName(name, url = window.location.href) {
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return "";
  return decodeURIComponent(results[2]);
}

function countTimestamp() {
  setTimeout(() => {
    countTimestamp();
    try {
      fetch("http://64.227.148.23:4040/api/session/addTimeStamp", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ uid: userData._id }),
      })
        .then((response) => response.json())
        .then((response) => console.log("Success" + JSON.stringify(response)));
    } catch (e) {}

    try {
      fetch(
        `http://64.227.148.23:4040/api/session/getTimestamp?uid=${userData._id}`
      )
        .then((response) => response.json())
        .then(async (data) => {
          console.log(data);
          if (data.duration > 30) {
            for (trackName in localTracks) {
              let track = localTracks[trackName];
              if (track) {
                track.stop();
                track.close();
                localTracks[trackName] = null;
              }
            }
            await client.leave();
            document.getElementById("footer").style.display = "none";
            document.getElementById("user-streams").innerHTML = "";
            document.getElementById("join-wrapper").style.display = "block";
            isExhausted = true;
          }
        })
        .catch((error) => {
          console.log(error);
        });
    } catch (e) {
      alert(e);
    }
  }, 60000);
}