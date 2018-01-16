package actions

import (
	"github.com/bketelsen/testbuffalo/shared/templatedata"
	"github.com/bketelsen/testbuffalo/wraprender"
	"github.com/gobuffalo/buffalo"
	"github.com/isomorphicgo/isokit"
)

// HomeHandler is a default handler to serve up
// a home page.
func HomeHandler(c buffalo.Context) error {
	templateData := templatedata.Index{PageTitle: "IsoBuffalo"}
	c.Set("page", templateData)
	p := &isokit.RenderParams{Writer: c.Response()}
	return c.Render(200, wraprender.HTML(ts, "index_page", p))
}
