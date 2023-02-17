mongo <<EOF
use admin;
db.auth('root', 'nftbridge_backend');
use nftbridge-backend;
db.createUser({user: 'nftbridge_admin', pwd: 'nftbridge_pwd', roles: [{role: 'readWrite', db: 'nftbridge-backend'}]});
EOF
