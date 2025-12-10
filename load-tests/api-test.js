import http from "k6/http";
import { sleep } from "k6";

export let options = {
  vus: 50,
  duration: "1m",
};

export default function () {
  http.get("http://localhost:3000/api/tickets/verify/CHESS-2025-MIQ6AVGR975");
  sleep(1);
}
