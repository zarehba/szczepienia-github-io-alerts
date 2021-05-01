import webscrape from "./webscrape.js";
import notifyTelegram from "./notifyTelegram.js";

export default async function monitorWebsite(URL_TO_SCRAPE, FILTER_PARAMS) {
  const filterData = (row) => {
    return (
      !FILTER_PARAMS.notCity.includes(row.city.toUpperCase()) &&
      FILTER_PARAMS.type.includes(row.type.toUpperCase()) &&
      eval(`${row.date} ${FILTER_PARAMS.date}`)
    );
  };

  const dataUpdateTimes = { lastTime: null, nextTime: null };

  const data = await webscrape(URL_TO_SCRAPE, dataUpdateTimes);
  const filteredData = data
    .filter(filterData)
    .sort((elA, elB) => elA.date - elB.date);

  const msg =
    `Dostępne nowe terminy:
    ******************************` +
    filteredData
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

  if (filteredData && Object.values(filteredData).length) {
    // notifyTelegram(encodeURI(msg));
    console.log(msg);
  } else {
    console.log(
      `[${Date.now()}] No data was obtained after applying filters criteria.`
    );
  }

  // setTimeout for next data fetching
  executeAtSpecificTime(
    async () => monitorWebsite(URL_TO_SCRAPE, FILTER_PARAMS),
    dataUpdateTimes.nextTime.getTime() + 1000
  );
}

function executeAtSpecificTime(callback, specificTime) {
  console.log(`Setting next function execute at ${new Date(specificTime)}`);
  const timeTillEvent = specificTime - Date.now();
  setTimeout(callback, timeTillEvent);
}
