const puppeteer = require('puppeteer');
var fs = require('fs');
const parse = require('csv-parse/lib/sync')

describe('Tracking script', () => {
  let data = []

  const fileData = fs.readFileSync('__tests__/resources/test_data.csv')
  const rows = parse(fileData, {columns: false, trim: true})
  data = rows

  beforeAll(async () => {
    jest.setTimeout(35000);
    page = await browser.newPage()
  })

  console.log(data)
  test.each(data)(
    'request should be send when I run javascript code',
    async (url, traceName, scriptPath, scriptRunCommand, urlToFInd) => {
      // trace all requests (more https://github.com/GoogleChrome/puppeteer/blob/v1.2.0/docs/api.md#tracingstartoptions)
      await page.tracing.start({path: traceName});
      await page.goto(url)
      // inject local file to webstie (more https://github.com/GoogleChrome/puppeteer/blob/v1.2.0/docs/api.md#pageaddscripttagoptions)
      await page.addScriptTag({path: scriptPath});
      // run script (more https://github.com/GoogleChrome/puppeteer/blob/v1.2.0/docs/api.md#pageevaluatepagefunction-args)
      let result = await page.evaluate(scriptRunCommand);
      const buffer = await page.tracing.stop();
      let json = JSON.parse(buffer);
      // check if request sended
      let sendedRequest = json.traceEvents.some(function(item) {
        if(item && item.args && item.args.data && item.args.data.url) {
          return item.args.data.url.includes(urlToFInd)
        }
        return false
      });
      expect(sendedRequest).toBe(true)
    })
})