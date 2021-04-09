const GoogleNewsRss = require('google-news-rss');
const getMetaData = require('metadata-scraper');
const fs = require('fs');


const googleNews = new GoogleNewsRss();


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
                console.log("fetched", place);
                Promise.all(resp.map(article => getMeta(article))).then(articles => {
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
                    resolve({
                        articles,
                        params
                    });
                });
            }).catch(e => {
            console.error(e);
            resolve(true);
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

module.exports = {
    getNews,
    cache
};
