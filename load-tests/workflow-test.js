import http from "k6/http";
import { sleep } from "k6";

export let options = {
  vus: 30,
  duration: "1m",
};

export default function () {
  http.get("http://localhost:3000/login");
  sleep(1);

  http.get("http://localhost:3000/dashboard");
  sleep(1);

  http.get("http://localhost:3000/profile");
  sleep(1);
}
