import { chromium } from "playwright";
import path from "path";
import fs from "fs";

export async function processFiling(docId: string, payload: any) {
    console.log(`Starting silent filing compliance job for ${docId}`);

    // Ensure artifacts directory exists
    const artifactsDir = path.resolve(process.cwd(), "public/artifacts");
    if (!fs.existsSync(artifactsDir)) {
        fs.mkdirSync(artifactsDir, { recursive: true });
    }

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        viewport: { width: 1280, height: 800 }
    });
    const page = await context.newPage();

    try {
        // 1. Navigate to Sunbiz Annual Report Start
        console.log("Navigating to FilingStart...");
        await page.goto("https://services.sunbiz.org/Filings/AnnualReport/FilingStart", { waitUntil: 'domcontentloaded' });

        // Debug: Screenshot landing page
        await page.screenshot({ path: path.join(artifactsDir, "debug_landing.png") });

        // 2. Input Document Number
        console.log(`Inputting DocID: ${docId}`);
        await page.waitForSelector("#DocumentId", { timeout: 10000 });
        await page.fill("#DocumentId", docId);
        await page.click("input[value='Submit']");

        // 3. Verify Access & Handle Possible "Email" step or "Already Filed"
        // Sometimes Sunbiz asks for confirmation or shows error
        try {
            await page.waitForNavigation({ timeout: 10000 });
        } catch (e) {
            console.log("Navigation timeout or already on page.");
        }

        // Check for error messages
        const errorText = await page.locator(".validation-summary-errors").textContent().catch(() => null);
        if (errorText && errorText.includes("Invalid")) {
            throw new Error(`Sunbiz Error: ${errorText.trim()}`);
        }

        console.log("On Entity Verification Page...");

        // Sometimes valid entities jump to a "Confirm" page where you just click "Continue"
        // or they might ask for Email Address first if it's the first time?
        // Let's check for "Click Here to Pay" (Final) vs "Continue" vs Form Fields

        // Scenario A: "Filing for VAN STEPHEN SALIBA..." -> Click Continue 
        const continueBtn = page.locator("input[value='Continue'], input[value='Submit']");
        if (await continueBtn.isVisible()) {
            console.log("Clicking Continue to proceed to form...");
            await continueBtn.click();
            await page.waitForLoadState("networkidle");
        }

        // 4. Form Page (Addresses, Officers)
        // Check for specific "Edit" buttons
        // Helper to parse address string
        function parseAddress(fullAddress: string) {
            // Strategy: 
            // 1. Identify State/Zip part (must have comma before state?)
            //    "Miami, FL 33308"
            // 2. Split left part. "123 Test St Miami"
            // 3. If no comma in left part, look for suffixes.

            // Normalize spaces
            fullAddress = fullAddress.replace(/\s+/g, ' ').trim();

            // Split State/Zip
            // Regex matches ", FL 33308" or " FL 33308" at end?
            // User format: "Miami, FL 33308" (Comma is key)
            const stateZipRegex = /,\s*([A-Z]{2})\s*(\d{5}(?:-\d{4})?)$/i;
            const szMatch = fullAddress.match(stateZipRegex);

            if (!szMatch) {
                // Fallback or error
                return { street: fullAddress, city: "", state: "", zip: "" };
            }

            const state = szMatch[1].toUpperCase();
            const zip = szMatch[2];
            const leftRaw = fullAddress.substring(0, szMatch.index).trim(); // "123 Test St Miami"

            // Try to split LeftRaw into Street/City
            // 1. If comma exists in left part?
            const lastComma = leftRaw.lastIndexOf(',');
            if (lastComma !== -1) {
                return {
                    street: leftRaw.substring(0, lastComma).trim(),
                    city: leftRaw.substring(lastComma + 1).trim(),
                    state,
                    zip
                };
            }

            // 2. No comma. Use Suffix Heuristic.
            // Common suffixes (Abbreviations and Full Words for robust matching)
            const suffixes = [
                "St", "Ave", "Dr", "Rd", "Blvd", "Ln", "Ct", "Cir", "Way", "Pkwy", "Pl", "Ter", "Hwy", "Sq", "Apt", "Unit", "Ste",
                "Street", "Avenue", "Drive", "Road", "Boulevard", "Lane", "Court", "Circle", "Parkway", "Place", "Terrace", "Highway", "Square", "Suite", "Apartment"
            ];

            // Regex to find all suffixes
            // We want the last one that makes sense. 
            // "123 St Marks Pl" -> Last is "Pl".
            const suffixRegex = new RegExp(`\\b(${suffixes.join('|')})\\b\\.?(?=\\s|$)`, 'gi');

            const allMatches = [...leftRaw.matchAll(suffixRegex)];

            if (allMatches.length > 0) {
                // Take the last match as the split point?
                // "123 Test St Miami" -> Match "St".
                // "123 St Marks Pl New York" -> Match "St", "Pl". Last is "Pl".
                const lastMatch = allMatches[allMatches.length - 1];
                const splitIndex = lastMatch.index! + lastMatch[0].length;

                return {
                    street: leftRaw.substring(0, splitIndex).trim(),
                    city: leftRaw.substring(splitIndex).trim(),
                    state,
                    zip
                };
            }

            // Fallback: If no suffix found, assume whole thing is street or city?
            // Let's assume street.
            return { street: leftRaw, city: "", state, zip };
        }

        // Helper to clean Sunbiz raw address for parsing
        function cleanSunbizAddress(raw: string) {
            // Remove " US" or " USA" at end
            let cleaned = raw.replace(/\s+US(A)?$/i, '');
            // Replace newlines with comma just in case to help the parser
            cleaned = cleaned.replace(/\n/g, ', ').replace(/\s+/g, ' ').trim();
            return cleaned;
        }

        function normalize(str: string) {
            return (str || "").toLowerCase().replace(/[.,]/g, '').trim();
        }

        function addressesMatch(addr1Str: string, addr2Str: string) {
            const s1 = cleanSunbizAddress(addr1Str);
            const s2 = cleanSunbizAddress(addr2Str);
            const a1 = parseAddress(s1);
            const a2 = parseAddress(s2);

            console.log(`Comparing Addresses:\n Sunbiz (Clean): "${s1}" -> ${JSON.stringify(a1)}\n Payload (Clean): "${s2}" -> ${JSON.stringify(a2)}`);

            return normalize(a1.street) === normalize(a2.street) &&
                normalize(a1.city) === normalize(a2.city) &&
                normalize(a1.zip) === normalize(a2.zip);
        }

        if (payload.mailingAddress) {
            console.log(`Checking Mailing Address Sync...`);

            // 1. Scrape Current Address
            // Selector found: .mailing-address .section-box-content
            // We need to wait for it to be visible? It's on the summary page.
            let currentSunbizAddr = "";
            try {
                const addrEl = page.locator(".mailing-address .section-box-content");
                if (await addrEl.isVisible()) {
                    currentSunbizAddr = await addrEl.innerText();
                    console.log(`Current Sunbiz Address: ${currentSunbizAddr.replace(/\n/g, ', ')}`);
                }
            } catch (e) {
                console.warn("Could not scrape current address, defaulting to update.");
            }

            // 2. Compare
            const isDifferent = !currentSunbizAddr || !addressesMatch(currentSunbizAddr, payload.mailingAddress);

            if (!isDifferent) {
                console.log("Mailing Address matches payload. Skipping update.");
            } else {
                console.log(`Address mismatch. Proceeding to update to: ${payload.mailingAddress}`);

                const editMailingBtn = page.locator("input[value='Edit Mailing Address']");

                if (await editMailingBtn.isVisible()) {
                    console.log("Found 'Edit Mailing Address' button. Clicking...");
                    await editMailingBtn.click();

                    // Wait for Address Form
                    await page.waitForSelector("#Address_Address1", { timeout: 10000 });

                    const addr = parseAddress(payload.mailingAddress);
                    console.log("Parsed Payload Address:", addr);

                    // Fill Fields
                    await page.fill("#Address_Address1", addr.street);

                    if (addr.city) await page.fill("#Address_City", addr.city);
                    if (addr.zip) await page.fill("#Address_Zip", addr.zip);

                    if (addr.state) {
                        try {
                            await page.fill("#Address_State", addr.state);
                        } catch (e) {
                            await page.selectOption("#Address_State", addr.state).catch(() => { });
                        }
                    }

                    console.log("Filled Address Fields.");

                    const updateBtn = page.locator("input[value='Update']");
                    const continueAddrBtn = page.locator("input[value='Continue']");

                    if (await updateBtn.isVisible()) {
                        await updateBtn.click();
                    } else if (await continueAddrBtn.isVisible()) {
                        await continueAddrBtn.click();
                    }

                    await page.waitForLoadState("networkidle");
                    console.log("Saved Address Update.");
                } else {
                    console.log("Edit Mailing Address button not found.");
                }
            }
        }

        // 5. Navigate to Review / Payment
        console.log("Navigating to Review/Payment...");

        // Usually there's a "Continue" button at the bottom of the form
        const nextBtn = page.locator("input[value='Continue']");
        if (await nextBtn.isVisible()) {
            await nextBtn.click();
            await page.waitForLoadState("networkidle");
        }

        // 6. Review Page -> Click Continue to Pay
        // Sometimes there is a generic "Review" page before payment
        const finalReviewBtn = page.locator("input[value='Continue to Payment'], input[value='Continue']");
        if (await finalReviewBtn.isVisible()) {
            // If we are on review page
            console.log("On Review Page, proceeding to Payment...");
            await finalReviewBtn.click();
            await page.waitForLoadState("networkidle");
        }

        // 7. Payment Page (Goal)
        console.log("Reached Final Page. capturing screenshot...");

        // Wait a moment for rendering
        await page.waitForTimeout(2000);

        const screenshotFilename = `${docId}_payment_${Date.now()}.png`;
        const screenshotPath = path.join(artifactsDir, screenshotFilename);
        const publicPath = `/artifacts/${screenshotFilename}`;

        await page.screenshot({ path: screenshotPath, fullPage: true });
        console.log(`Screenshot saved to ${screenshotPath}`);

        return { success: true, screenshotPath: publicPath };

    } catch (error: any) {
        console.error("Automation Error:", error);

        // Capture error state
        const errorFilename = `${docId}_crash_${Date.now()}.png`;
        const errorPath = path.join(artifactsDir, errorFilename);
        await page.screenshot({ path: errorPath, fullPage: true });

        return { success: false, error: error.message, screenshotPath: `/artifacts/${errorFilename}` };
    } finally {
        await browser.close();
    }
}
