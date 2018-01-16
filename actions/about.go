package actions

import (
	"github.com/bketelsen/testbuffalo/shared/templatedata"
	"github.com/bketelsen/testbuffalo/wraprender"
	"github.com/gobuffalo/buffalo"
	"github.com/isomorphicgo/isokit"
)

func AboutHandler(c buffalo.Context) error {
	templateData := templatedata.About{PageTitle: "GopherSnacks"}
	c.Set("page", templateData)
	p := &isokit.RenderParams{Writer: c.Response()}
	return c.Render(200, wraprender.HTML(ts, "about_page", p))
}
