const { DateTime } = require("luxon");
const readingTime = require("eleventy-plugin-reading-time");
const pluginRss = require("@11ty/eleventy-plugin-rss");
const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const fs = require("fs");
const path = require("path");

//const isDev = process.env.ELEVENTY_ENV === "development";
//const isProd = process.env.ELEVENTY_ENV === "production";

module.exports = function (eleventyConfig) {
    eleventyConfig.addPlugin(readingTime);
    eleventyConfig.addPlugin(pluginRss);
    eleventyConfig.addPlugin(syntaxHighlight);
    eleventyConfig.addPassthroughCopy({ "src/images": "images" });
    eleventyConfig.addPassthroughCopy({ "src/css": "css" });
    eleventyConfig.setServerOptions({
        watch: ["**/*.css"],
    });

    /*
      FILTERS
    */

    eleventyConfig.addFilter("excerpt", (post) => {
        const content = post.replace(/(<([^>]+)>)/gi, "");
        return content.substr(0, content.lastIndexOf(" ", 200)) + "...";
    });

    eleventyConfig.addFilter("readableDate", (dateObj) => {
        return DateTime.fromJSDate(dateObj, { zone: "utc" }).toFormat(
            "dd LLL yyyy",
        );
    });

    eleventyConfig.addFilter("htmlDateString", (dateObj) => {
        return DateTime.fromJSDate(dateObj, { zone: "utc" }).toFormat(
            "yyyy-LL-dd",
        );
    });

    eleventyConfig.addFilter("dateToIso", (dateString) => {
        return new Date(dateString).toISOString();
    });

    eleventyConfig.addFilter("head", (array, n) => {
        if (n < 0) {
            return array.slice(n);
        }

        return array.slice(0, n);
    });

    /*
      TAGS
    */

    eleventyConfig.addCollection("tagList", function (collection) {
        let tagSet = new Set();
        collection.getAll().forEach(function (item) {
            if ("tags" in item.data) {
                let tags = item.data.tags;

                tags = tags.filter(function (item) {
                    switch (item) {
                        case "all":
                        case "nav":
                        case "post":
                        case "posts":
                            return false;
                    }

                    return true;
                });

                for (const tag of tags) {
                    tagSet.add(tag);
                }
            }
        });

        return [...tagSet];
    });

    eleventyConfig.addFilter("pageTags", (tags) => {
        const generalTags = ["all", "nav", "post", "posts"];

        return tags
            .toString()
            .split(",")
            .filter((tag) => {
                return !generalTags.includes(tag);
            });
    });

    return {
        dir: {
            input: "src",
            output: "public",
            includes: "includes",
            data: "data",
            layouts: "layouts",
        },
        passthroughFileCopy: true,
        templateFormats: ["html", "njk", "md"],
        htmlTemplateEngine: "njk",
        markdownTemplateEngine: "njk",
    };
};
