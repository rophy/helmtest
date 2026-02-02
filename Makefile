.PHONY: help test test-unit test-docker build dev

help:	## Show this help.
	@fgrep -h "##" $(MAKEFILE_LIST) | fgrep -v fgrep | sed -e 's/\\$$//' | sed -e 's/##//'

test: test-unit test-docker	## Run all tests (unit + docker).

test-unit: 	## Run helmtest library unit tests.
	docker run -t --rm -v `pwd`:/workspace helmtest

test-docker: 	## Run docker usage example tests against exampleChart.
	docker run -t --rm -v `pwd`/exampleChart:/workspace helmtest

build:  ## Build docker image.
	docker build -t helmtest .

dev:	## Create a dev container shell
	docker run -it --rm -e DEBUG=helmtest -v `pwd`:/workspace helmtest bash
