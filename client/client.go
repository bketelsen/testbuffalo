package main

import (
	"html/template"
	"log"
	"strings"

	"github.com/isomorphicgo/isokit"
	"honnef.co/go/js/dom"

	"github.com/bketelsen/testbuffalo/client/common"
	"github.com/bketelsen/testbuffalo/client/handlers"
	"github.com/bketelsen/testbuffalo/shared/templatefuncs"
)

func initializePage(env *common.Env) {

	l := strings.Split(env.Window.Location().Pathname, "/")
	routeName := l[1]

	if routeName == "" {
		routeName = "index"
	}

	if strings.Contains(routeName, "-demo") == false {
		handlers.InitializePageLayoutControls(env)
	}

	switch routeName {

	case "index":
		handlers.InitializeIndexPage(env)

	case "about":
		handlers.InitializeAboutPage(env)

	default:
		log.Println("Encountered unknown route name: ", routeName)
	}
}

// registerRoutes is used to register the client-side routes
func registerRoutes(env *common.Env) {

	r := isokit.NewRouter()
	r.Handle("/", handlers.IndexHandler(env))
	r.Handle("/about", handlers.AboutHandler(env))

	r.Listen()
	env.Router = r
}

func run() {
	println("IGWEB Client Application brian")

	// Fetch the template set
	templateSetChannel := make(chan *isokit.TemplateSet)
	funcMap := template.FuncMap{"rubyformat": templatefuncs.RubyDate, "unixformat": templatefuncs.UnixTime, "productionmode": templatefuncs.IsProduction}
	go isokit.FetchTemplateBundleWithSuppliedFunctionMap(templateSetChannel, funcMap)
	ts := <-templateSetChannel

	env := common.Env{}
	env.TemplateSet = ts
	env.Window = dom.GetWindow()
	env.Document = dom.GetWindow().Document()
	env.PrimaryContent = env.Document.GetElementByID("primaryContent")
	env.Location = env.Window.Location()

	registerRoutes(&env)
	initializePage(&env)
}

func main() {

	var D = dom.GetWindow().Document().(dom.HTMLDocument)
	switch readyState := D.ReadyState(); readyState {
	case "loading":
		D.AddEventListener("DOMContentLoaded", false, func(dom.Event) {
			go run()
		})
	case "interactive", "complete":
		run()
	default:
		println("Encountered unexpected document ready state value!")
	}

}
