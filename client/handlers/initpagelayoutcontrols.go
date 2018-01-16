package handlers

import (
	"github.com/bketelsen/testbuffalo/client/common"
	"github.com/bketelsen/testbuffalo/shared/cogs/notify"
)

func InitializePageLayoutControls(env *common.Env) {

	n := notify.NewNotify()
	err := n.Start()
	if err != nil {
		println("Error encountered when attempting to start the notify cog: ", err)
	}

}
