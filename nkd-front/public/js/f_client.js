function ping_server(success, fail) {
  success();
}

function initClient() {
  //setInterval(ping_server, 1000, successed_ping, failed_ping);
}

function successed_ping() {
  console.log("do it");
}

function failed_ping() {
  console.log("dont do it");
}
