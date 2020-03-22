jest.setTimeout(35000);

const playwright = require("playwright")

const SOME_NUMBER = "99887776666"
const SOME_TEXT = "asdfasdf@jkljkl.com"

let browser
let page
describe.each([
    ["chromium"],
    ["firefox"],
    ["webkit"],
])("%s type and fill test", (browserType) => {
    describe.each([
        [false],
        [true],
    ])("headless: %s", (headless) => {
        beforeAll(async () => {
            browser = await playwright[browserType].launch({ headless })

            const context = await browser.newContext()
            page = await context.newPage()
        })

        afterAll(async () => {
            await browser.close()
        })

        describe.each([
            ["type"],
            ["fill"],
        ])("method: %s", (method) => {
            it.each([
                ["inside bootstrap modal", "index.html"],
                ["outside modal", "inputs.html"],
                ["inside vuetify modal", "vuetify.html"],
            ])(`should update input values %s`, playwrightTest(browserType, headless, method), 35000)
        })
    })
})

function playwrightTest(browserType, headless, method) {
    return async (_, htmlFile) => {
        // please launch in shell first:
        // `python3 -m http.server -d src`
        await page.goto("http://localhost:8000/" + htmlFile)

        let modal = null
        if (await page.$("button")) {
            await page.click("button")
            modal = await page.waitForSelector(".modal-content", {
                waitFor: "visible"
            })
        }

        const uniqueId = [browserType, headless ? "headless" : "non-headless", method, htmlFile].join("-")
        await page.screenshot({ fullPage: true, path: `ss/${uniqueId}-1before.png` })

        const numbers = await page.$$("input[type=number]")
        for (let i = 0; i < numbers.length; ++i) {
            await numbers[i][method](SOME_NUMBER)
        }
        const texts = await page.$$("input[type=text]")
        for (let i = 0; i < texts.length; ++i) {
            await texts[i][method](SOME_TEXT)
        }
        const emails = await page.$$("input[type=email]")
        for (let i = 0; i < emails.length; ++i) {
            await emails[i][method](SOME_TEXT)
        }

        await page.screenshot({ fullPage: true, path: `ss/${uniqueId}-2after.png` })

        if (modal) {
            await modal.screenshot({ path: `ss/${uniqueId}-3modal.png` })
        }

        const numVals = await page.$$eval("input[type=number]", (inputs) => inputs.map((input) => input.value))
        numVals.forEach((numVal) => {
            expect(numVal).toBe(SOME_NUMBER)
        })

        const textVals = await page.$$eval("input[type=text]", (inputs) => inputs.map((input) => input.value))
        textVals.forEach((textVal) => {
            expect(textVal).toBe(SOME_TEXT)
        })

        const emailVals = await page.$$eval("input[type=email]", (inputs) => inputs.map((input) => input.value))
        emailVals.forEach((emailVal) => {
            expect(emailVal).toBe(SOME_TEXT)
        })
    }
}