export function $(selector) {
  return document.querySelector(selector);
}

export function mask(el) {
  //   $("#teamsForm").classList.add("loading-mask");
  el.classList.add("loading-mask");
}

export function unmask(el) {
  //   $("#teamsForm").classList.remove("loading-mask");
  el.classList.remove("loading-mask");
}

export function sleep(ms) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
}

(async () => {
  console.info("start sleeping ...");
  await sleep(1000);
  console.warn("ready to do %o", "next job");
  console.warn("executed before sleep.then");
})();
