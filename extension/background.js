const API_URL = "http://127.0.0.1:8000";

const JOB_KEY = "pageGenieCraftJob";


/*
|--------------------------------------------------------------------------
| MESSAGE LISTENER
|--------------------------------------------------------------------------
*/

chrome.runtime.onMessage.addListener(
    (message, sender, sendResponse) => {

        if (
            message.action === "startGeneration"
        ) {

            startGeneration(
                message.data
            );

            sendResponse({
                success: true
            });

            return true;
        }


        if (
            message.action === "getJob"
        ) {

            getJob().then(job => {

                sendResponse({
                    success: true,
                    job: job || null
                });

            });

            return true;
        }


        if (
            message.action === "clearJob"
        ) {

            chrome.storage.local.remove(
                JOB_KEY
            );

            sendResponse({
                success: true
            });

            return true;
        }

    }
);


/*
|--------------------------------------------------------------------------
| START GENERATION
|--------------------------------------------------------------------------
*/

async function startGeneration(data) {

    /*
     * Prevent duplicate jobs.
     */

    const existingJob =
        await getJob();


    if (
        existingJob &&
        existingJob.status === "processing"
    ) {

        console.log(
            "A generation job is already running."
        );

        return;
    }


    /*
     * Save processing state immediately.
     */

    const job = {

        status:
            "processing",

        outputType:
            data.outputType,

        userRequest:
            data.userRequest,

        pageTitle:
            data.pageTitle,

        pageUrl:
            data.pageUrl,

        startedAt:
            Date.now(),

        filename:
            null,

        downloadUrl:
            null,

        downloadFilename:
            null,

        error:
            null
    };


    await saveJob(job);


    console.log(
        "PageGenieCraft: generation started"
    );


    try {

        /*
        |--------------------------------------------------------------------------
        | Send request to FastAPI
        |--------------------------------------------------------------------------
        */

        const response =
            await fetch(
                `${API_URL}/generate`,
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        user_request:
                            data.userRequest,

                        output_type:
                            data.outputType,

                        page_title:
                            data.pageTitle,

                        page_url:
                            data.pageUrl,

                        page_text:
                            data.pageText,

                        screenshot:
                            data.screenshot

                    })

                }
            );


        /*
        |--------------------------------------------------------------------------
        | Handle backend error
        |--------------------------------------------------------------------------
        */

        if (!response.ok) {

            const errorText =
                await response.text();

            throw new Error(
                errorText ||
                `Server returned ${response.status}`
            );
        }


        /*
        |--------------------------------------------------------------------------
        | Read backend result
        |--------------------------------------------------------------------------
        */

        const result =
            await response.json();


        console.log(
            "Generation completed:",
            result
        );


        /*
        |--------------------------------------------------------------------------
        | Build download URL
        |--------------------------------------------------------------------------
        */

        const downloadUrl =
            API_URL +
            result.download_url;


        const filename =
            result.filename;


        /*
        |--------------------------------------------------------------------------
        | Save COMPLETED state
        |--------------------------------------------------------------------------
        */

        await saveJob({

            status:
                "completed",

            outputType:
                data.outputType,

            userRequest:
                data.userRequest,

            pageTitle:
                data.pageTitle,

            pageUrl:
                data.pageUrl,

            startedAt:
                job.startedAt,

            completedAt:
                Date.now(),

            filename:
                filename,

            downloadUrl:
                downloadUrl,

            downloadFilename:
                filename,

            error:
                null

        });


        /*
        |--------------------------------------------------------------------------
        | Automatically download
        |--------------------------------------------------------------------------
        */

        try {

            await chrome.downloads.download({

                url:
                    downloadUrl,

                filename:
                    filename,

                saveAs:
                    false

            });


            console.log(
                "File automatically downloaded."
            );

        } catch (downloadError) {

            console.error(
                "Automatic download failed:",
                downloadError
            );

            /*
             * File is still available through
             * the Download button.
             */

        }


    } catch (error) {

        console.error(
            "Generation error:",
            error
        );


        /*
        |--------------------------------------------------------------------------
        | Save ERROR state
        |--------------------------------------------------------------------------
        */

        await saveJob({

            status:
                "error",

            outputType:
                data.outputType,

            userRequest:
                data.userRequest,

            pageTitle:
                data.pageTitle,

            pageUrl:
                data.pageUrl,

            startedAt:
                job.startedAt,

            completedAt:
                Date.now(),

            filename:
                null,

            downloadUrl:
                null,

            downloadFilename:
                null,

            error:
                error.message

        });

    }

}


/*
|--------------------------------------------------------------------------
| GET JOB
|--------------------------------------------------------------------------
*/

async function getJob() {

    const result =
        await chrome.storage.local.get(
            JOB_KEY
        );

    return result[JOB_KEY] || null;
}


/*
|--------------------------------------------------------------------------
| SAVE JOB
|--------------------------------------------------------------------------
*/

async function saveJob(job) {

    await chrome.storage.local.set({

        [JOB_KEY]:
            job

    });

}
