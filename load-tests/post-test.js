import http from "k6/http";
import { sleep } from "k6";

export let options = {
  vus: 50,
  duration: "45s",
};

export default function () {
  const url = "http://localhost:3000/api/login";
  const payload = JSON.stringify({
    email: "test@example.com",
    password: "123456"
  });

  const params = {
    headers: { "Content-Type": "application/json" },
  };

  http.post(url, payload, params);
  sleep(1);
}
