package actions

import (
	"html/template"
	"os"

	"github.com/bketelsen/testbuffalo/shared/cogs/carousel"
	"github.com/bketelsen/testbuffalo/shared/cogs/datepicker"
	"github.com/bketelsen/testbuffalo/shared/cogs/liveclock"
	"github.com/bketelsen/testbuffalo/shared/cogs/notify"
	"github.com/bketelsen/testbuffalo/shared/cogs/timeago"
	"github.com/bketelsen/testbuffalo/shared/templatefuncs"
	"github.com/gobuffalo/packr"
	"github.com/isomorphicgo/isokit"
)

var assetsBox = packr.NewBox("../public/assets")
var ts *isokit.TemplateSet
var WebAppRoot string
var WebAppMode string
var StaticAssetsPath string

func init() {

	WebAppRoot = os.Getenv("IGWEB_APP_ROOT")

	StaticAssetsPath = WebAppRoot + "/public/assets"
	initializeTemplateSet()
	initializeCogs(ts) // Register Handlers for Client-Side JavaScript Application
}

// initializeTemplateSet is responsible for initializing the template set on the server-side
func initializeTemplateSet() {
	isokit.WebAppRoot = WebAppRoot
	isokit.TemplateFilesPath = WebAppRoot + "/shared/templates"
	isokit.StaticAssetsPath = StaticAssetsPath
	isokit.StaticTemplateBundleFilePath = StaticAssetsPath + "/templates/igweb.tmplbundle"

	/*
		if ENV == "production" && oneTimeStaticAssetsGeneration == false {
			isokit.UseStaticTemplateBundleFile = true
			isokit.ShouldBundleStaticAssets = false
		}
	*/

	ts = isokit.NewTemplateSet()
	funcMap := template.FuncMap{"rubyformat": templatefuncs.RubyDate, "unixformat": templatefuncs.UnixTime, "productionmode": templatefuncs.IsProduction}
	ts.Funcs = funcMap
	ts.GatherTemplates()

}
func initializeCogs(ts *isokit.TemplateSet) {
	timeago.NewTimeAgo().CogInit(ts)
	liveclock.NewLiveClock().CogInit(ts)
	datepicker.NewDatePicker().CogInit(ts)
	carousel.NewCarousel().CogInit(ts)
	notify.NewNotify().CogInit(ts)
	isokit.BundleStaticAssets()
}
