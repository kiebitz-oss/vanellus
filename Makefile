copyright:
	python .scripts/make_copyright_headers.py

prettier:
	npx prettier --write .

test:
	npx mocha

build:
	npx tsc --build

watch:
	npx tsc -w

clean:
	rm -rf dist/*
