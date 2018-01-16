package handlers

import (
	"context"

	"github.com/bketelsen/testbuffalo/client/common"
	"github.com/bketelsen/testbuffalo/shared/templatedata"
	"github.com/isomorphicgo/isokit"
)

func AboutHandler(env *common.Env) isokit.Handler {
	return isokit.HandlerFunc(func(ctx context.Context) {
		templateData := templatedata.About{PageTitle: "About IsoBuffalo"}
		env.TemplateSet.Render("about_content", &isokit.RenderParams{Data: templateData, Disposition: isokit.PlacementReplaceInnerContents, Element: env.PrimaryContent, PageTitle: templateData.PageTitle})
		InitializeAboutPage(env)
	})
}

func InitializeAboutPage(env *common.Env) {

}
