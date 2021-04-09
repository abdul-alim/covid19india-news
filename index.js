const path = require('path');
const directoryPath = path.join(__dirname);
const git = require('simple-git/promise')(directoryPath);

const utils = require('./utils');
const STATE_CODES = require('./state-code');
const LOG = console.log;




(async function() {
    /**
     *
     * @param states
     * @returns {Promise<void>}
     */
    const fetchNews = async function(states) {
        try {

            let promises = states.map(([stateCode, stateName]) => {
                LOG('Fetching:', stateName);
                return utils.getNews(stateName, { code: stateCode, name: stateName });
            });

            await Promise.all(promises).catch(e => LOG(e));

        } catch (e) {
            console.error(e);
        }
    };

    async function fetchNewsInChunk() {

        // git pull any remote changes
        let pull = await git.pull();
        LOG(pull);

        LOG('Fetch Initiated at: ', utils.getCurrentISTLogTime());

        // FETCHING
        let chunks = utils.chunkArray(Object.entries(STATE_CODES), 3);
        for (let stateChunk of chunks) {
            await fetchNews(stateChunk);
        }

        // GIT PUSH OPERATIONS
        let { files: diffFiles } = await git.diffSummary();
        await git.add('./news/*');

        if (diffFiles.length) {
            let commit = await git.commit(`aws - data updated: ${utils.getCurrentISTLogTime()}`);
            LOG(commit);
            let push = await git.push('origin', 'main');
            LOG('pushed', push);
        } else {
            LOG('No updates since last run');
        }

        LOG('Finished at: ', utils.getCurrentISTLogTime());
        LOG('\n**************************************\n');
    }


    // / minutes
    let every = 20;
    // fetch it every 20 minutes
    setInterval(async function() {
        await fetchNewsInChunk();
    }, every * 60 * 1000);

    fetchNewsInChunk();

})();

