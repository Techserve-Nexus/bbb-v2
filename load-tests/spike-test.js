export let options = {
  stages: [
    { duration: "10s", target: 20 },    // normal traffic
    { duration: "5s",  target: 500 },   // sudden spike
    { duration: "10s", target: 20 },    // recover
  ],
};

import http from "k6/http";

export default function () {
  http.get("http://localhost:3000");
}
