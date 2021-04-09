const path = require('path');
const directoryPath = path.join(__dirname);
const git = require('simple-git/promise')(directoryPath);

const utils = require('./utils');
const STATE_CODES = require('./state-code');
const outDir = 'news';

function getNewDate() {
    let date = new Date();
    var utcTime = date.getTime() + date.getTimezoneOffset() * 60 * 1000;
    let indiaOffset = 19800000;
    return new Date(utcTime + indiaOffset);
}

const getCurrentISTLogTime = () => {
    let dt = getNewDate();
    return `${(dt.getMonth() + 1).toString().padStart(2, '0')}/${dt
        .getDate()
        .toString()
        .padStart(2, '0')}/${dt
        .getFullYear()
        .toString()
        .padStart(4, '0')} ${dt
        .getHours()
        .toString()
        .padStart(2, '0')}:${dt
        .getMinutes()
        .toString()
        .padStart(2, '0')}`;
};


(async function() {

    const fetchNews = async function() {
        try {

            // git pull any remote changes
            let pull = await git.pull();
            console.log(pull);

            console.log('Fetch Initiated at: ', getCurrentISTLogTime());

            // let promises = Object.entries(STATE_CODES).map(([stateCode, stateName]) => {
            //     return utils.getNews(stateName, { code: stateCode, name: stateName });
            // });
            //
            //
            // let articles = await Promise.all(promises);
            //
            // articles.forEach(({ articles, params }) => {
            //     const filename = `./${outDir}/${params.code}.json`;
            //     utils.cache(articles, filename);
            // });

            // check diff and commit
            let { files: diffFiles } = await git.diffSummary();

            const newsDir = `${directoryPath}/${outDir}/*`;

            let gitAdd = await git.add("./news/*");

            if (diffFiles.length) {



                console.log(gitAdd);

                return

                let commit = await git.commit(`aws - data updated: ${getCurrentISTLogTime()}`);
                console.log(commit);
                let push = await git.push('origin', 'master');
                console.log('pushed', push);
            } else {
                console.log('No updates since last run');
            }

            console.log('Finished at: ', getCurrentISTLogTime());
            console.log('\n**************************************\n');
        } catch (e) {
            console.error(e);
        }
    };

    // / minutes
    let every = 20;
    // fetch it every 20 minutes
    setInterval(async function() {
        await fetchNews();
    }, every * 60 * 1000);

    fetchNews();

})();

