# helmtest example

This is a demo project for how to write unit tests using helmtest.

Project structure is organized as:

```
# chart contents created by `helm create exampleChart`
templates/*
Chart.yaml
values.yaml
.helmignore

# tests
tests/*.test.js

# Makefile to invkoe commands for convenience
Makefile
```

To run tests with docker:

```bash
docker run -t --rm -v `pwd`:/workspace rophy/helmtest
```

or for convenience:

```bash
make test
```

