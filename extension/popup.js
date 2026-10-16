const generateButton =
    document.getElementById("generate");

const status =
    document.getElementById("status");

const download =
    document.getElementById("download");


let downloadUrl = null;
let downloadFilename = null;


/*
|--------------------------------------------------------------------------
| STORAGE KEYS
|--------------------------------------------------------------------------
*/

const STORAGE_KEY = "pageGenieCraftJob";


/*
|--------------------------------------------------------------------------
| INITIALIZE POPUP
|--------------------------------------------------------------------------
*/

document.addEventListener(
    "DOMContentLoaded",
    restoreSession
);


/*
|--------------------------------------------------------------------------
| BUTTON EVENTS
|--------------------------------------------------------------------------
*/

generateButton.addEventListener(
    "click",
    generateFile
);

download.addEventListener(
    "click",
    downloadFile
);


/*
|--------------------------------------------------------------------------
| RESTORE SESSION
|--------------------------------------------------------------------------
*/

async function restoreSession() {

    try {

        const result =
            await chrome.storage.local.get(
                STORAGE_KEY
            );

        const job =
            result[STORAGE_KEY];


        /*
        |--------------------------------------------------------------------------
        | No previous job
        |--------------------------------------------------------------------------
        */

        if (!job) {

            status.textContent = "";

            download.style.display =
                "none";

            return;
        }


        /*
        |--------------------------------------------------------------------------
        | Restore variables
        |--------------------------------------------------------------------------
        */

        downloadUrl =
            job.downloadUrl || null;

        downloadFilename =
            job.downloadFilename || null;


        /*
        |--------------------------------------------------------------------------
        | PROCESSING
        |--------------------------------------------------------------------------
        */

        if (
            job.status === "processing"
        ) {

            status.textContent =
                "⏳ Your file is still being generated...";

            download.style.display =
                "none";


            /*
             * The popup was closed.
             *
             * We cannot keep the JavaScript request
             * running after the popup is destroyed.
             *
             * But the backend request may still be
             * processing.
             *
             * When popup opens again, check the backend
             * for the generated file.
             */

            if (job.filename) {

                await checkFileStatus(
                    job.filename
                );

            }

            return;
        }


        /*
        |--------------------------------------------------------------------------
        | COMPLETED
        |--------------------------------------------------------------------------
        */

        if (
            job.status === "completed"
            &&
            job.downloadUrl
        ) {

            status.textContent =
                "✅ File is ready.";

            download.textContent =
                "⬇ Download "
                + job.downloadFilename;

            download.style.display =
                "block";

            return;
        }


        /*
        |--------------------------------------------------------------------------
        | ERROR
        |--------------------------------------------------------------------------
        */

        if (
            job.status === "error"
        ) {

            status.textContent =
                "❌ "
                + (
                    job.error ||
                    "Generation failed."
                );

            download.style.display =
                "none";
        }


    } catch (error) {

        console.error(
            "Session restore error:",
            error
        );

        status.textContent =
            "Could not restore previous session.";
    }
}


/*
|--------------------------------------------------------------------------
| GENERATE FILE
|--------------------------------------------------------------------------
*/

async function generateFile() {

    status.textContent =
        "Reading current page...";

    download.style.display =
        "none";

    downloadUrl = null;
    downloadFilename = null;


    /*
    |--------------------------------------------------------------------------
    | Clear previous job
    |--------------------------------------------------------------------------
    */

    await chrome.storage.local.remove(
        STORAGE_KEY
    );


    try {

        /*
        |--------------------------------------------------------------------------
        | Get active tab
        |--------------------------------------------------------------------------
        */

        const tabs =
            await chrome.tabs.query({
                active: true,
                currentWindow: true
            });


        const tab =
            tabs[0];


        if (!tab) {

            throw new Error(
                "No active tab found."
            );
        }


        /*
        |--------------------------------------------------------------------------
        | Capture screenshot
        |--------------------------------------------------------------------------
        */

        status.textContent =
            "Capturing page...";


        const screenshot =
            await chrome.tabs.captureVisibleTab(
                tab.windowId,
                {
                    format: "png"
                }
            );


        /*
        |--------------------------------------------------------------------------
        | Read page
        |--------------------------------------------------------------------------
        */

        status.textContent =
            "Reading page content...";


        const pageData =
            await chrome.scripting.executeScript({

                target: {
                    tabId: tab.id
                },

                func: () => {

                    return {

                        title:
                            document.title,

                        url:
                            window.location.href,

                        text:
                            document.body.innerText

                    };

                }

            });


        const page =
            pageData[0].result;


        /*
        |--------------------------------------------------------------------------
        | Get user settings
        |--------------------------------------------------------------------------
        */

        const outputType =
            document.getElementById(
                "outputType"
            ).value;


        const userRequest =
            document.getElementById(
                "request"
            ).value;


        /*
        |--------------------------------------------------------------------------
        | IMPORTANT:
        | Save processing state BEFORE calling backend
        |--------------------------------------------------------------------------
        */

        await chrome.storage.local.set({

            [STORAGE_KEY]: {

                status:
                    "processing",

                outputType:
                    outputType,

                userRequest:
                    userRequest,

                pageTitle:
                    page.title,

                pageUrl:
                    page.url,

                startedAt:
                    Date.now(),

                filename:
                    null,

                downloadUrl:
                    null,

                downloadFilename:
                    null
            }

        });


        status.textContent =
            "🤖 Asking PageGenieCraft AI...";


        /*
        |--------------------------------------------------------------------------
        | Send request to backend
        |--------------------------------------------------------------------------
        */

        const response =
            await fetch(
                "http://127.0.0.1:8000/generate",
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        user_request:
                            userRequest,

                        output_type:
                            outputType,

                        page_title:
                            page.title,

                        page_url:
                            page.url,

                        page_text:
                            page.text,

                        screenshot:
                            screenshot

                    })

                }
            );


        /*
        |--------------------------------------------------------------------------
        | Backend error
        |--------------------------------------------------------------------------
        */

        if (!response.ok) {

            const error =
                await response.text();

            throw new Error(error);
        }


        /*
        |--------------------------------------------------------------------------
        | Read result
        |--------------------------------------------------------------------------
        */

        const result =
            await response.json();


        downloadUrl =
            "http://127.0.0.1:8000"
            + result.download_url;

        downloadFilename =
            result.filename;


        /*
        |--------------------------------------------------------------------------
        | VERY IMPORTANT:
        | Save completed result immediately
        |--------------------------------------------------------------------------
        */

        await chrome.storage.local.set({

            [STORAGE_KEY]: {

                status:
                    "completed",

                outputType:
                    outputType,

                userRequest:
                    userRequest,

                pageTitle:
                    page.title,

                pageUrl:
                    page.url,

                startedAt:
                    Date.now(),

                completedAt:
                    Date.now(),

                filename:
                    result.filename,

                downloadUrl:
                    downloadUrl,

                downloadFilename:
                    downloadFilename
            }

        });


        /*
        |--------------------------------------------------------------------------
        | Show download button
        |--------------------------------------------------------------------------
        */

        download.textContent =
            "⬇ Download "
            + downloadFilename;

        download.style.display =
            "block";


        status.textContent =
            "✅ Generated successfully.";


        /*
        |--------------------------------------------------------------------------
        | AUTO DOWNLOAD
        |--------------------------------------------------------------------------
        */

        try {

            await chrome.downloads.download({

                url:
                    downloadUrl,

                filename:
                    downloadFilename,

                saveAs:
                    false

            });

            status.textContent =
                "✅ Done! File downloaded.";

        } catch (downloadError) {

            console.error(
                "Auto download error:",
                downloadError
            );

            status.textContent =
                "✅ File generated. Click Download.";

        }


    } catch (error) {

        console.error(
            error
        );


        /*
        |--------------------------------------------------------------------------
        | Save ERROR state
        |--------------------------------------------------------------------------
        */

        await chrome.storage.local.set({

            [STORAGE_KEY]: {

                status:
                    "error",

                error:
                    error.message,

                completedAt:
                    Date.now(),

                downloadUrl:
                    null,

                downloadFilename:
                    null
            }

        });


        status.textContent =
            "❌ Error: "
            + error.message;
    }

}


/*
|--------------------------------------------------------------------------
| CHECK FILE STATUS
|--------------------------------------------------------------------------
|
| When popup was closed while backend was processing,
| opening the popup calls this function.
|
*/

async function checkFileStatus(
    filename
) {

    status.textContent =
        "⏳ Checking generated file...";


    try {

        const response =
            await fetch(
                "http://127.0.0.1:8000/download/"
                + encodeURIComponent(filename),
                {
                    method: "HEAD"
                }
            );


        /*
        |--------------------------------------------------------------------------
        | FILE EXISTS
        |--------------------------------------------------------------------------
        */

        if (response.ok) {

            downloadUrl =
                "http://127.0.0.1:8000/download/"
                + encodeURIComponent(filename);


            downloadFilename =
                filename;


            await chrome.storage.local.set({

                [STORAGE_KEY]: {

                    status:
                        "completed",

                    filename:
                        filename,

                    downloadUrl:
                        downloadUrl,

                    downloadFilename:
                        filename,

                    completedAt:
                        Date.now()
                }

            });


            download.textContent =
                "⬇ Download "
                + filename;

            download.style.display =
                "block";


            status.textContent =
                "✅ File is ready.";

            return;
        }


        /*
        |--------------------------------------------------------------------------
        | FILE NOT READY
        |--------------------------------------------------------------------------
        */

        status.textContent =
            "⏳ Still processing...";

    } catch (error) {

        console.error(
            "File status check error:",
            error
        );


        status.textContent =
            "⏳ Generation may still be processing.";
    }
}


/*
|--------------------------------------------------------------------------
| MANUAL DOWNLOAD
|--------------------------------------------------------------------------
*/

async function downloadFile() {

    if (!downloadUrl) {

        status.textContent =
            "No file available.";

        return;
    }


    try {

        status.textContent =
            "Downloading...";


        await chrome.downloads.download({

            url:
                downloadUrl,

            filename:
                downloadFilename,

            saveAs:
                false

        });


        status.textContent =
            "✅ Download complete!";


    } catch (error) {

        console.error(
            error
        );


        status.textContent =
            "❌ Download error: "
            + error.message;
    }

}
