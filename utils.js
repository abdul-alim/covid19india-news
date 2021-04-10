const GoogleNewsRss = require('google-news-rss');
const getMetaData = require('metadata-scraper');
const fs = require('fs');
const outDir = 'docs';
const googleNews = new GoogleNewsRss();
const META_TIMEOUT = 1; // minutes


/**
 *
 * @param place
 * @param params
 * @returns {Promise<{}>}
 */
function getNews(place = 'India', params) {
    return new Promise((resolve) => {
        googleNews
            .search(`Covid-19 ${place}`)
            .then(resp => {

                resp.sort(function(a, b) {
                    var keyB = new Date(a.pubDate).getTime(),
                        keyA = new Date(b.pubDate).getTime();
                    // Compare the 2 dates
                    if (keyA < keyB) return -1;
                    if (keyA > keyB) return 1;
                    return 0;
                });

                // latest 50 articles
                resp.length = Math.min(resp.length, 50);

                console.log('Meta:', place);
                Promise.all(resp.map(article => getMeta(article))).then(articles => {
                    console.log('Meta Received:', place);
                    articles = articles.map(article => {
                        let extra = article.extra || article;
                        return {
                            title: extra.title,
                            description: extra.description,
                            url: article.link,
                            image: extra.image || null,
                            publishedOn: article.pubDate,
                            publisher: {
                                name: article.source._,
                                url: article.source.$.url,
                                icon: extra.icon || null,
                                twitter: extra.twitter || null,
                                facebook: extra.facebook || null
                            }
                        };
                    });

                    const filename = `./${outDir}/${params.code}.json`;
                    cache(articles, filename);
                    resolve(true);
                });

                // TIMEOUT
                setTimeout(() => {
                    resolve(false);
                }, 1000 * 60 * META_TIMEOUT);

            }).catch(e => {
            console.error(e);
            resolve(false);
        });
    });
}

/**
 *
 * @param filename
 * @returns {string}
 */
function getCache(filename) {
    return `${fs.readFileSync(filename)}`;
}

/**
 *
 * @param content
 * @param filename
 * @returns {string}
 */
function cache(content, filename) {
    content = JSON.stringify(content);
    fs.writeFileSync(filename, content);
    return content;
}

/**
 *
 * @param filepath
 * @returns {boolean}
 */
function fileExistsSync(filepath) {
    let flag = true;
    try {
        fs.accessSync(filepath, fs.constants.F_OK);
    } catch (e) {
        flag = false;
    }
    return flag;
}

/**
 *
 * @param article
 * @returns {Promise<unknown>}
 */
function getMeta(article) {
    return new Promise((resolve, reject) => {
        getMetaData(article.link).then(data => {
            article.extra = data;
            resolve(article);

        }).catch(error => {
            resolve(article);
        });
    });
}

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

function chunkArray(array, chunkSize = 10) {
    var i, j, chunks = [];
    for (i = 0, j = array.length; i < j; i += chunkSize) {
        chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
}

module.exports = {
    getNewDate,
    getNews,
    cache,
    getCurrentISTLogTime,
    chunkArray
};
