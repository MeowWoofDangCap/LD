const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const { getUserLanguages, headers, removeQuotes } = require('./helper.js');

const init = async () => {
    const lessonsToComplete = Number(process.env.lessonsToComplete) || 5;
    const batchSize = Number(process.env.batchSize) || 2;
    const token = removeQuotes(process.env.token);
    const userId = removeQuotes(process.env.userId);

    if (!token || !userId) {
        throw new Error('User ID and token must be specified.');
    }

    try {
        const userLanguages = await getUserLanguages();
        console.log('Fetched User Languages:', userLanguages);

        const sessionBody = {
            id: "k4WCfdQMpkrVNJr2",
            learningLanguage: "en",
            fromLanguage: "vi",
            type: "UNIT_TEST",
            metadata: {
                id: "k4WCfdQMpkrVNJr2",
                type: "unit_test",
                language: "en",
                from_language: "vi",
                experiments_with_treatment_contexts: {},
                session_experiment_record: [],
                show_best_translation_in_grading_ribbon: true,
                skill_tree_id: "72f8003cc36227580a7b75ea1d3f4f4a"
            },
            sessionStartExperiments: [],
            challengeTimeTakenCutoff: 60000,
            explanations: {},
            progressUpdates: [],
            isV2: false,
            showBestTranslationInGradingRibbon: true,
            sessionExperimentRecord: [],
            experiments_with_treatment_contexts: {},
            startTime: Math.floor(Date.now() / 1000), // Thay đổi thời gian bắt đầu
            endTime: Math.floor(Date.now() / 1000) + 60, // Thay đổi thời gian kết thúc
            enableBonusPoints: false,
            hasBoost: true,
            challengeTypes: [
                "assist", "characterIntro", "characterMatch", "characterPuzzle",
                "characterSelect", "characterTrace", "characterWrite", "completeReverseTranslation",
                "definition", "dialogue", "extendedMatch", "extendedListenMatch", "form",
                "freeResponse", "gapFill", "judge", "listen", "listenComplete",
                "listenMatch", "match", "name", "listenComprehension", "listenIsolation",
                "listenSpeak", "listenTap", "orderTapComplete", "partialListen",
                "partialReverseTranslate", "patternTapComplete", "radioBinary",
                "radioImageSelect", "radioListenMatch", "radioListenRecognize", "radioSelect",
                "readComprehension", "reverseAssist", "sameDifferent", "select",
                "selectPronunciation", "selectTranscription", "svgPuzzle", "syllableTap",
                "syllableListenTap", "speak", "tapCloze", "tapClozeTable",
                "tapComplete", "tapCompleteTable", "tapDescribe", "translate",
                "transliterate", "transliterationAssist", "typeCloze", "typeClozeTable",
                "typeComplete", "typeCompleteTable", "writeComprehension"
            ],
            isFinalLevel: false,
            skillIds: [
                "63f90eb7cf915bcc78bef8efe4c2a6ca"
            ]
        };

        const processBatch = async (batch) => {
            const sessionPromises = batch.map(async (lessonIndex) => {
                const formattedFraction = `${lessonIndex + 1}/${lessonsToComplete}`;
                console.log(`Running: ${formattedFraction}`);

                try {
                    const createdSession = await fetch("https://www.duolingo.com/2017-06-30/sessions", {
                        headers,
                        method: 'POST',
                        body: JSON.stringify(sessionBody),
                    }).then(res => {
                        if (!res.ok) throw new Error('Failed to create session. Check your credentials.');
                        return res.json();
                    });

                    console.log(`Created Fake Duolingo Practice Session: ${createdSession.id}`);

                    const rewards = await fetch(`https://www.duolingo.com/2017-06-30/sessions/${createdSession.id}`, {
                        headers,
                        method: 'PUT',
                        body: JSON.stringify({
                            ...createdSession,
                            heartsLeft: 0,
                            failed: false,
                        }),
                    }).then(res => {
                        if (!res.ok) {
                            return res.text().then(text => {
                                console.error(`Error receiving rewards: ${text}`);
                            });
                        }
                        return res.json();
                    });

                    console.log(`Submitted Spoof Practice Session Data - Received`);
                    console.log(`💪🏆🎉 Earned ${rewards.xpGain} XP!`);
                } catch (err) {
                    console.error(`Error in lesson ${formattedFraction}: ${err}`);
                }
            });

            await Promise.all(sessionPromises);
        };

        for (let i = 0; i < lessonsToComplete; i += batchSize) {
            const batch = Array.from({ length: Math.min(batchSize, lessonsToComplete - i) }, (_, index) => i + index);
            await processBatch(batch);
        }

    } catch (err) {
        console.error(`Initialization failed: ${err}`);
    }
};

init();
