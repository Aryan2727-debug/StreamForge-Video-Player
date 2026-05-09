import { trackServerEvent } from "./analyticsService.js";

const AD_INTERVAL = 20;

export function injectAdsIntoManifest({
    manifestContent,
    videoId
}) {
    const lines = manifestContent.split("\n");

    const modifiedLines = [];

    let accumulatedDuration = 0;
    let independentSegmentsAdded = false;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        /*
            Add independent segments tag
        */
        if (
            line.startsWith("#EXT-X-VERSION") &&
            !independentSegmentsAdded
        ) {
            modifiedLines.push(line);
            modifiedLines.push("#EXT-X-INDEPENDENT-SEGMENTS");

            independentSegmentsAdded = true;

            continue;
        }

        /*
            Handle EXTINF blocks
        */
        if (line.startsWith("#EXTINF")) {
            const duration = parseFloat(
                line.replace("#EXTINF:", "").replace(",", "")
            );

            const segmentLine = lines[i + 1];

            /*
                Push EXTINF
            */
            modifiedLines.push(line);

            /*
                Rewrite content TS paths
            */
            modifiedLines.push(
                `/hls/${videoId}/${segmentLine}`
            );

            accumulatedDuration += duration;

            /*
                Skip next line since already handled
            */
            i++;

            /*
                Inject ads every 20 sec
            */
            if (accumulatedDuration >= AD_INTERVAL) {
                accumulatedDuration = 0;

                trackServerEvent("ad_break_inserted", {
                    videoId
                });

                /*
                    Ad break start
                */
                modifiedLines.push(
                    "#EXT-X-CUE-OUT:DURATION=12"
                );

                modifiedLines.push(
                    "#EXT-X-DISCONTINUITY"
                );

                /*
                    Ad segment 1
                */
                modifiedLines.push("#EXTINF:6.0,");
                modifiedLines.push(
                    "/ads/ad_1/ad_000.ts"
                );

                /*
                    Ad segment 2
                */
                modifiedLines.push("#EXTINF:6.0,");
                modifiedLines.push(
                    "/ads/ad_1/ad_001.ts"
                );

                /*
                    Ad break end
                */
                modifiedLines.push(
                    "#EXT-X-DISCONTINUITY"
                );

                modifiedLines.push("#EXT-X-CUE-IN");
            }

            continue;
        }

        /*
            Copy all other lines
        */
        modifiedLines.push(line);
    }

    return modifiedLines.join("\n");
}