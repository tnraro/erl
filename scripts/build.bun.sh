rm -rf dist
mkdir -p dist/public
cp apps/api/dist/server.js dist/
cp -r apps/web/dist/* dist/public/