import fetch from "node-fetch";
import jsdom from "jsdom";
const { JSDOM } = jsdom;

export default async function webscrape(url, dataUpdateTimes) {
  const pageHtml = await fetchSzczepieniaDoc(url);
  if (!pageHtml) {
    return;
  }
  const { document } = new JSDOM(pageHtml).window;

  // data update times to set the time for next data fetching
  dataUpdateTimes.lastTime = new Date(
    document.querySelector(".timeago").getAttribute("datetime")
  );
  dataUpdateTimes.lastTimePretty = prettifyDateObj(dataUpdateTimes.lastTime);
  dataUpdateTimes.nextTime = new Date(
    document.querySelector("#nexttime").getAttribute("datetime")
  );
  dataUpdateTimes.nextTimePretty = prettifyDateObj(dataUpdateTimes.nextTime);
  const tableData = [
    ...document.querySelectorAll("#szczepienia > tbody > tr"),
  ].map(parseSzczepieniaRow);
  return tableData;
}

const parseSzczepieniaRow = (tr) => {
  const TDs = [...tr.querySelectorAll("td")];
  return {
    city: TDs[0].textContent,
    date: parseDate(TDs[1].textContent),
    prettyDate: prettifyDate(parseDate(TDs[1].textContent)),
    time: parseTime(TDs[2].textContent),
    type: TDs[3].textContent.trim(),
    address: TDs[4].textContent
      .replace("🐛", "")
      .replace(/\n/g, "")
      .trim()
      .replace(/\s\s+/g, "  "),
    appointment: TDs[5].textContent
      .replace("🐛", "")
      .replace(/\n/g, "")
      .trim()
      .replace(/\s\s+/g, "  "),
  };
};

const parseDate = (str) =>
  new Date(new Date().getFullYear(), getMonth(str), getDay(str)).getTime();
const getDay = (str) => parseInt(str);
const getMonth = (str) => {
  if (str.includes("stycz")) return 0;
  if (str.includes("lut")) return 1;
  if (str.includes("marz")) return 2;
  if (str.includes("kwie")) return 3;
  if (str.includes("maj")) return 4;
  if (str.includes("czerw")) return 5;
  if (str.includes("lipi")) return 6;
  if (str.includes("sierp")) return 7;
  if (str.includes("wrzes")) return 8;
  if (str.includes("paź")) return 9;
  if (str.includes("listop")) return 10;
  if (str.includes("grudzień")) return 11;
};
const prettifyDate = (date) => new Date(date).toLocaleDateString("pl");
const parseTime = (str) => splitStrEveryNChars(str, 5).join(", ");
const splitStrEveryNChars = (str, n) =>
  str.match(new RegExp(".{1," + n + "}", "g"));

const prettifyDateObj = (dateObj) => {
  const newDateObj = new Date(dateObj);
  return new Date(newDateObj.setHours(newDateObj.getHours() + 2))
    .toISOString()
    .replace("T", " ")
    .replace(":00.000Z", "");
};

async function fetchSzczepieniaDoc(url, retryCnt) {
  if (retryCnt > 9) {
    console.error("Error fetching document. Fetching aborted.");
    return;
  }

  return await fetch(url)
    .then((res) => res.text())
    .catch(async (err) => {
      const _retryCnt = retryCnt ? ++retryCnt : 1;
      const nextAttemptTime = 1000 * 2 ** _retryCnt;
      console.error(
        `[${Date.now()}] Error fetching document. Retrying in ${
          nextAttemptTime / 1000
        } seconds...`
      );
      await sleep(nextAttemptTime);
      return await fetchSzczepieniaDoc(url, _retryCnt);
    });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
