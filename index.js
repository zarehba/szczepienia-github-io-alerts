import dotenv from "dotenv";
import monitorWebsite from "./src/monitorWebsite.js";

dotenv.config();

const URL_TO_SCRAPE = "https://szczepienia.github.io/mazowieckie";
const FILTER_PARAMS = {
  notCity: ["SZCZYTNO", "SIERPC", "PŁOCK", "OSTROŁĘKA"],
  type: ["PFIZER", "MODERNA" /*, "ASTRAZENECA"*/],
  date: " <= new Date('2021-05-31')",
};

monitorWebsite(URL_TO_SCRAPE, FILTER_PARAMS);
