import http from "k6/http";
import { sleep } from "k6";

export let options = {
  vus: 2000,          // 2000 virtual users
  duration: "30s",  // for 30 seconds
};

export default function () {
  http.get("https://www.shreeparashurama.com/about");  // your next.js local dev server
  sleep(1);
}
