const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const email = process.argv[2];

if (!email) {
  console.log('Please provide an email: node promote_admin.js user@example.com');
  process.exit(1);
}

admin.auth().getUserByEmail(email)
  .then((user) => {
    return admin.auth().setCustomUserClaims(user.uid, { admin: true });
  })
  .then(() => {
    console.log(`Successfully promoted ${email} to Admin!`);
    console.log('Please sign out and sign back in to see the changes.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error promoting user:', error);
    process.exit(1);
  });
