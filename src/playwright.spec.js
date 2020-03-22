jest.setTimeout(35000);

const playwright = require("playwright")

const SOME_NUMBER = "99887776666"
const SOME_TEXT = "asdfasdf@jkljkl.com"

let browser
let page
describe.each([
    ["chromium", true],
    ["firefox", true],
    ["webkit", true],
    ["chromium", false],
    ["firefox", false],
    ["webkit", false],
])("type test", (browserType, headless) => {
    beforeAll(async () => {
        browser = await playwright[browserType].launch({ headless })

        const context = await browser.newContext()
        page = await context.newPage()
    })

    afterAll(async () => {
        await browser.close()
    })

    it(`${browserType}${headless ? "(headless)" : "(non-headless)"}: should type out all inputs`, async () => {
        // please launch in shell first:
        // `python3 -m http.server -d src`
        await page.goto("http://localhost:8000")

        await page.click("button")

        const modal = await page.waitForSelector("#myModal .modal-content", {
            waitFor: "visible"
        })

        await page.fill("input[type=number]", SOME_NUMBER)
        const texts = await page.$$("input[type=text]")
        for (let i = 0; i < texts.length; ++i) {
            await texts[i].fill(SOME_TEXT)
        }
        await page.fill("input[type=email]", SOME_TEXT)

        await modal.screenshot({ path: `ss/${browserType + headless}3modal.png` })
        await modal.screenshot({ fullPage: true, path: `ss/${browserType + headless}4modalfull.png` })

        const numVal = await page.$eval("input[type=number]", (input) => input.value)
        expect(numVal).toBe(SOME_NUMBER)

        const textVals = await page.$$eval("input[type=text]", (inputs) => inputs.map((input) => input.value))
        textVals.forEach((textVal) => {
            expect(textVal).toBe(SOME_TEXT)
        })

        const emailVal = await page.$eval("input[type=email]", (input) => input.value)
        expect(emailVal).toBe(SOME_TEXT)

        expect(await page.$("text=I AM TOP OF PAGE")).not.toBeNull()
        expect(await page.$("text=I AM BOTTOM OF PAGE")).not.toBeNull()
    }, 35000)
})

