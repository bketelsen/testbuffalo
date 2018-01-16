package handlers

import (
	"context"
	"time"

	"github.com/bketelsen/testbuffalo/client/common"
	"github.com/bketelsen/testbuffalo/shared/cogs/carousel"
	"github.com/bketelsen/testbuffalo/shared/cogs/liveclock"
	"github.com/bketelsen/testbuffalo/shared/templatedata"
	"github.com/isomorphicgo/isokit"
)

func IndexHandler(env *common.Env) isokit.Handler {
	return isokit.HandlerFunc(func(ctx context.Context) {
		templateData := templatedata.Index{PageTitle: "IsoBuffalo"}
		env.TemplateSet.Render("index_content", &isokit.RenderParams{Data: templateData, Disposition: isokit.PlacementReplaceInnerContents, Element: env.PrimaryContent, PageTitle: templateData.PageTitle})
		InitializeIndexPage(env)
	})
}

func InitializeIndexPage(env *common.Env) {

	// Carousel Cog
	c := carousel.NewCarousel()
	c.CogInit(env.TemplateSet)
	c.SetID("carousel")
	contentItems := []string{"/assets/images/products/watch.jpg", "/assets/images/products/shirt.jpg", "/assets/images/products/coffeemug.jpg"}
	c.SetProp("contentItems", contentItems)
	c.SetProp("carouselContentID", "gophersContent")
	err := c.Start()
	if err != nil {
		println("Encountered the following error when attempting to start the carousel cog: ", err)
	}

	// Localtime Live Clock Cog
	localZonename, localOffset := time.Now().In(time.Local).Zone()
	lc := liveclock.NewLiveClock()
	lc.CogInit(env.TemplateSet)
	lc.SetID("myLiveClock")
	lc.SetProp("timeLabel", "Local Time")
	lc.SetProp("timezoneName", localZonename)
	lc.SetProp("timezoneOffset", localOffset)
	err = lc.Start()
	if err != nil {
		println("Encountered the following error when attempting to start the local liveclock cog: ", err)
	}

}
