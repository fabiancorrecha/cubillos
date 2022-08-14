const fs = require('fs');

const {DEPLOY_TARGET} = process.env;

if (!DEPLOY_TARGET) {
  fs.copyFileSync('.env', '.env.production');
} else {
  fs.copyFileSync('.env.' + DEPLOY_TARGET, '.env.production');
}
