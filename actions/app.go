package actions

import (
	"bytes"
	"encoding/gob"
	"log"
	"net/http"

	"github.com/gobuffalo/buffalo"
	"github.com/gobuffalo/buffalo/middleware"
	"github.com/gobuffalo/buffalo/middleware/ssl"
	"github.com/gobuffalo/envy"
	"github.com/isomorphicgo/isokit"
	"github.com/unrolled/secure"

	"github.com/bketelsen/testbuffalo/models"
	"github.com/gobuffalo/buffalo/middleware/i18n"
	"github.com/gobuffalo/packr"
)

// ENV is used to help switch settings based on where the
// application is being run. Default is "development".
var ENV = envy.Get("GO_ENV", "development")
var app *buffalo.App
var T *i18n.Translator

// App is where all routes and middleware for buffalo
// should be defined. This is the nerve center of your
// application.
func App() *buffalo.App {
	if app == nil {
		app = buffalo.New(buffalo.Options{
			Env:         ENV,
			SessionName: "_testbuffalo_session",
		})
		// Automatically redirect to SSL
		app.Use(ssl.ForceSSL(secure.Options{
			SSLRedirect:     ENV == "production",
			SSLProxyHeaders: map[string]string{"X-Forwarded-Proto": "https"},
		}))

		if ENV == "development" {
			app.Use(middleware.ParameterLogger)
		}

		// Protect against CSRF attacks. https://www.owasp.org/index.php/Cross-Site_Request_Forgery_(CSRF)
		// Remove to disable this.
		//app.Use(csrf.New)

		// Wraps each request in a transaction.
		//  c.Value("tx").(*pop.PopTransaction)
		// Remove to disable this.
		app.Use(middleware.PopTransaction(models.DB))

		// Setup and use translations:
		var err error
		if T, err = i18n.New(packr.NewBox("../locales"), "en-US"); err != nil {
			app.Stop(err)
		}
		app.Use(T.Middleware())
		app.ANY("/template-bundle", buffalo.WrapHandlerFunc(TemplateBundleHandler()))
		app.GET("/js/client.js", buffalo.WrapHandler(isokit.GopherjsScriptHandler(WebAppRoot)))
		app.GET("/js/client.js.map", buffalo.WrapHandler(isokit.GopherjsScriptMapHandler(WebAppRoot)))
		app.GET("/", HomeHandler)

		app.GET("/index", HomeHandler)
		app.GET("/about", AboutHandler)
		app.ServeFiles("/assets", assetsBox)
	}

	return app
}

func TemplateBundleHandler() http.HandlerFunc {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		var templateContentItemsBuffer bytes.Buffer
		enc := gob.NewEncoder(&templateContentItemsBuffer)
		m := ts.Bundle().Items()
		err := enc.Encode(&m)
		if err != nil {
			log.Print("encoding err: ", err)
		}
		w.Header().Set("Content-Type", "application/octet-stream")
		w.WriteHeader(http.StatusOK)
		w.Write(templateContentItemsBuffer.Bytes())
	})

}
