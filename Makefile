.PHONY: help test

help:	## Show this help.
	@fgrep -h "##" $(MAKEFILE_LIST) | fgrep -v fgrep | sed -e 's/\\$$//' | sed -e 's/##//'

test: 	## Run unit tests.
	docker run -t --rm -v `pwd`:/workspace rophy/helmtest
