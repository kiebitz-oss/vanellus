prettier:
	npx prettier --write .

build:
	npx tsc --build

watch:
	npx tsc -w

clean:
	rm -rf dist/*
