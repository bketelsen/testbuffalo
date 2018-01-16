package wraprender

import (
	"io"

	"github.com/gobuffalo/buffalo/render"
	"github.com/isomorphicgo/isokit"
)

type isokitRender struct {
	ts          *isokit.TemplateSet
	contentType string
	template    string
	params      *isokit.RenderParams
}

func (i *isokitRender) ContentType() string {
	return i.contentType
}
func (i *isokitRender) Render(w io.Writer, d render.Data) error {
	i.params.Data = d
	i.params.Writer = w
	i.ts.Render(i.template, i.params)
	return nil
}

func HTML(ts *isokit.TemplateSet, template string, params *isokit.RenderParams) render.Renderer {
	i := &isokitRender{
		ts:          ts,
		contentType: "text/html",
		params:      params,
		template:    template,
	}
	return i
}
