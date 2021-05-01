import fs from "fs";
import webscrape from "./webscrape.js";
import notifyTelegram from "./notifyTelegram.js";
const jsonPath = "./logs/savedData.json";

export default async function monitorWebsite(URL_TO_SCRAPE, FILTER_PARAMS) {
  const savedData = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
  const filterData = (row) => {
    return (
      !FILTER_PARAMS.notCity.includes(row.city.toUpperCase()) &&
      FILTER_PARAMS.type.includes(row.type.toUpperCase()) &&
      eval(`${row.date} ${FILTER_PARAMS.date}`)
    );
  };
  const isDataNew = (newRow) =>
    savedData.filter(
      (oldRow) =>
        oldRow.city === newRow.city &&
        oldRow.prettyDate === newRow.prettyDate &&
        oldRow.type === newRow.type
    ).length === 0;

  const dataUpdateTimes = { lastTime: null, nextTime: null };

  const data = await webscrape(URL_TO_SCRAPE, dataUpdateTimes);
  const filteredData = data
    .filter(filterData)
    .sort((elA, elB) => elA.date - elB.date);
  const newData = filteredData.filter(isDataNew);

  const msg =
    `Dostępne nowe terminy:
    ******************************` +
    newData
      .map(
        (row) =>
          `
        [${row.prettyDate}] [${row.type}]
        Miejsce: ${row.city}, ${row.address}
        Kontakt: ${row.appointment}
      `
      )
      .join("") +
    `
    ******************************
      Aktualizacja danych: ${dataUpdateTimes.lastTimePretty}.
      Następna aktualizacja danych  ${dataUpdateTimes.nextTimePretty}.`;

  if (newData && Object.values(newData).length) {
    console.log(msg);
    console.log("");
    notifyTelegram(encodeURI(msg));
  } else {
    console.log(
      `[${Date.now()}] No new data was obtained after applying filters criteria.`
    );
  }
  const dataToSave = filteredData.map((el) => ({
    city: el.city,
    type: el.type,
    prettyDate: el.prettyDate,
  }));
  fs.writeFileSync(jsonPath, JSON.stringify(dataToSave));

  // setTimeout for next data fetching
  executeAtSpecificTime(
    async () => monitorWebsite(URL_TO_SCRAPE, FILTER_PARAMS),
    // data update times at website seem to be quite wrong.
    // checking for new data every 1 minute instead
    // dataUpdateTimes.nextTime.getTime() + 1000
    Date.now() + 60000
  );
}

function executeAtSpecificTime(callback, specificTime) {
  console.log(`Setting next function execute at ${new Date(specificTime)}`);
  const timeTillEvent = specificTime - Date.now();
  setTimeout(callback, timeTillEvent);
}
