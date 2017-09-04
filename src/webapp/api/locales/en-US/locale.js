/*==================================================
 *  English localization 
 *  (also base and default localization)
 *==================================================
 */
(function() {
    var javascriptFiles = [
        "timegrid-l10n.js",
        
        "util/date-l10n.js",
        
        "layouts/nday-l10n.js",
        "layouts/nmonth-l10n.js",
        "layouts/monthly-l10n.js",
        "layouts/weekly-l10n.js",
        "layouts/property-l10n.js"
    ];
    var cssFiles = [
    ];

    var urlPrefix = Timegrid.urlPrefix + "locales/en/";
    if (Timegrid.params.bundle) {
        $.includeJavascriptFiles(document, urlPrefix, [ "timegrid-en-bundle.js" ]);
        if (cssFiles.length > 0) {
            $.includeCssFiles(document, urlPrefix, [ "timegrid-en-bundle.css" ]);
        }
    } else {
        $.includeJavascriptFiles(document, urlPrefix + "scripts/", javascriptFiles);
        $.includeCssFiles(document, urlPrefix + "styles/", cssFiles);
    }
})();
