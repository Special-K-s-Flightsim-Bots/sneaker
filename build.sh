#!/usr/bin/env bash

export PATH=$PATH:/usr/local/go/bin:$HOME/go/bin
mkdir -p build

rm cmd/sneaker-server/resource.syso 
rm dist/*.mp3
rm dist/*.LICENSE.txt
rm dist/*.js
rm dist/*.html
rm dist/*.css

go install github.com/josephspurrier/goversioninfo/cmd/goversioninfo@latest
yarn
yarn build

cd cmd/sneaker-server
go generate

platforms=("windows/386" "windows/amd64" "linux/386")

for platform in "${platforms[@]}"
do
	platform_split=(${platform//\// })
	GOOS=${platform_split[0]}
	GOARCH=${platform_split[1]}
	output_name='sneaker-'$GOOS'-'$GOARCH
	if [ $GOOS = "windows" ]; then
		output_name+='.exe'
	fi	

	env GOOS=$GOOS GOARCH=$GOARCH go build -o ../../build/$output_name
done